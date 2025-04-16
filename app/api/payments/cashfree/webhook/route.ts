import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/actions/credit.action";
import { db } from "@/firebase/admin";
import crypto from "crypto";

// Initialize Cashfree configuration
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
const isProduction = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  try {
    // Get the webhook payload and signature
    const rawBody = await req.text();
    const data = JSON.parse(rawBody);
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    console.log("Received webhook data:", {
      orderId: data?.data?.order?.order_id,
      status: data?.data?.order?.order_status,
      signature: signature ? "present" : "missing",
      timestamp: timestamp,
    });

    // Verify signature if present (recommended for production)
    if (signature && timestamp && secretKey) {
      const payload = timestamp + rawBody;
      const expectedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(payload)
        .digest("base64");

      if (signature !== expectedSignature) {
        console.error("Webhook signature verification failed");
        return NextResponse.json(
          { message: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    // Check if it's a valid webhook payload
    if (!data || !data.data || !data.data.order) {
      console.error("Invalid webhook payload");
      return NextResponse.json(
        { message: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const { order } = data.data;
    const {
      order_id,
      order_status,
      order_amount,
      customer_details,
      order_meta,
    } = order;

    // Save the webhook data to the database for audit purposes
    await db.collection("webhooks").add({
      orderId: order_id,
      payload: data,
      headers: {
        signature: signature,
        timestamp: timestamp,
      },
      environment: isProduction ? "Production" : "Sandbox",
      receivedAt: new Date(),
    });

    // Find the transaction in the database
    const transactionSnapshot = await db
      .collection("transactions")
      .where("orderId", "==", order_id)
      .get();

    if (transactionSnapshot.empty) {
      // Create a new transaction record if it doesn't exist
      await db.collection("transactions").add({
        orderId: order_id,
        status: order_status,
        amount: order_amount,
        webhookData: data,
        createdAt: new Date(),
        updatedAt: new Date(),
        source: "webhook",
      });

      console.log(
        `Transaction record created from webhook for order ${order_id}`
      );
    } else {
      // Update existing transaction
      const transactionDoc = transactionSnapshot.docs[0];
      await transactionDoc.ref.update({
        status: order_status,
        webhookData: data,
        updatedAt: new Date(),
        lastWebhookAt: new Date(),
      });

      console.log(`Transaction updated from webhook for order ${order_id}`);
    }

    // If payment is successful, check if credits were added
    if (order_status === "PAID") {
      // Extract user ID and credit amount
      if (
        !customer_details ||
        !customer_details.customer_id ||
        !order_meta ||
        !order_meta.credit_amount
      ) {
        console.error("Missing required data in webhook payload");
        return NextResponse.json(
          { message: "Missing required data" },
          { status: 400 }
        );
      }

      const userId = customer_details.customer_id;
      const creditAmount = parseInt(order_meta.credit_amount);

      // Check if credits were already added
      const transactionData = transactionSnapshot.docs[0]?.data();

      if (
        transactionData &&
        transactionData.status === "COMPLETED" &&
        transactionData.creditsAdded
      ) {
        // Credits were already added, avoid duplicate
        console.log(`Credits already added for order ${order_id}, skipping`);
        return NextResponse.json(
          { message: "Credits already added" },
          { status: 200 }
        );
      }

      // Add credits to the user's account
      const addCreditsResult = await addCredits(userId, creditAmount);

      if (!addCreditsResult.success) {
        console.error(
          `Failed to add credits for order ${order_id}: ${addCreditsResult.message}`
        );

        // Update transaction with credit addition failure
        await db
          .collection("transactions")
          .where("orderId", "==", order_id)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.docs[0].ref.update({
                status: "PAYMENT_COMPLETED_CREDIT_FAILED",
                errorMessage: addCreditsResult.message,
                updatedAt: new Date(),
              });
            }
          });

        return NextResponse.json(
          { message: "Failed to add credits" },
          { status: 500 }
        );
      }

      // Update transaction to completed status
      await db
        .collection("transactions")
        .where("orderId", "==", order_id)
        .get()
        .then((snapshot) => {
          if (!snapshot.empty) {
            snapshot.docs[0].ref.update({
              status: "COMPLETED",
              creditsAdded: creditAmount,
              creditsAddedAt: new Date(),
              updatedAt: new Date(),
            });
          }
        });

      console.log(
        `Successfully added ${creditAmount} credits to user ${userId} for order ${order_id}`
      );
      return NextResponse.json(
        { message: "Credits added successfully" },
        { status: 200 }
      );
    }

    // For non-PAID statuses, just acknowledge receipt
    return NextResponse.json(
      { message: `Webhook received, order status: ${order_status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
