import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/actions/credit.action";
import { db } from "@/firebase/admin";
import crypto from "crypto";

// Define webhook data types for both old and new formats
interface CashfreeWebhookData {
  data?: {
    order?: {
      order_id?: string;
      order_status?: string;
      order_amount?: number;
      customer_details?: {
        customer_id?: string;
        [key: string]: unknown;
      };
      order_meta?: {
        credit_amount?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    payment?: {
      payment_status?: string;
      cf_payment_id?: string;
      payment_amount?: number;
      [key: string]: unknown;
    };
    customer_details?: {
      customer_id?: string;
      customer_email?: string;
      customer_phone?: string;
      customer_name?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  type?: string;
  event_time?: string;
  [key: string]: unknown;
}

// Initialize Cashfree configuration
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
const isProduction = process.env.NODE_ENV === "production";

export async function POST(req: NextRequest) {
  let rawBody = "";
  let data: CashfreeWebhookData = {};
  let orderId = "unknown";

  try {
    // Get the webhook payload and signature
    rawBody = await req.text();

    try {
      data = JSON.parse(rawBody);

      // Handle both old and new webhook formats
      if (data?.data?.order?.order_id) {
        // Old format
        orderId = data.data.order.order_id;
      } else if (data?.data?.order) {
        // New format (v2)
        orderId = data.data.order.order_id || "unknown";
      } else {
        console.warn("Unknown webhook format, orderId not found");
      }
    } catch (parseError) {
      console.error("Failed to parse webhook payload:", parseError);
      // Log the raw body for debugging (truncate if too large)
      const truncatedBody =
        rawBody.length > 1000 ? rawBody.substring(0, 1000) + "..." : rawBody;
      console.error("Raw webhook payload:", truncatedBody);

      return NextResponse.json(
        { message: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    // Extract payment status based on format
    let paymentStatus: string | undefined;
    if (data?.data?.order?.order_status) {
      // Old format
      paymentStatus = data.data.order.order_status;
    } else if (data?.data?.payment?.payment_status) {
      // New format - directly use payment status from webhook
      paymentStatus = data.data.payment.payment_status;
    }

    console.log("Received webhook data:", {
      orderId,
      status: paymentStatus,
      type: data.type,
      signature: signature ? "present" : "missing",
      timestamp: timestamp,
      payload: JSON.stringify(data).substring(0, 500) + "...", // Log partial payload for debugging
    });

    // Save the webhook data to the database first, before validation
    // This ensures we capture all incoming webhooks even if they fail later
    try {
      await db.collection("webhooks").add({
        orderId,
        payload: data,
        rawBody: rawBody.substring(0, 1000), // Store truncated raw body for debugging
        headers: {
          signature: signature,
          timestamp: timestamp,
        },
        environment: isProduction ? "Production" : "Sandbox",
        receivedAt: new Date(),
      });
      console.log(`Webhook data saved for order ${orderId}`);
    } catch (dbError) {
      console.error("Error saving webhook data:", dbError);
      // Continue processing even if saving to DB fails
    }

    // Verify signature if present (recommended for production)
    if (signature && timestamp && secretKey) {
      try {
        const payload = timestamp + rawBody;
        const expectedSignature = crypto
          .createHmac("sha256", secretKey)
          .update(payload)
          .digest("base64");

        if (signature !== expectedSignature) {
          console.error("Webhook signature verification failed");
          console.log(`Expected: ${expectedSignature}, Received: ${signature}`);

          // Don't reject in development to allow testing
          if (isProduction) {
            return NextResponse.json(
              { message: "Invalid signature" },
              { status: 401 }
            );
          } else {
            console.warn(
              "Continuing despite invalid signature (non-production)"
            );
          }
        }
      } catch (signatureError) {
        console.error("Error verifying signature:", signatureError);
        // Continue in dev, reject in prod
        if (isProduction) {
          return NextResponse.json(
            { message: "Error verifying signature" },
            { status: 401 }
          );
        }
      }
    }

    // Check if it's a valid webhook payload
    if (!data || !data.data) {
      console.error("Invalid webhook payload structure:", JSON.stringify(data));
      return NextResponse.json(
        { message: "Invalid webhook payload structure" },
        { status: 400 }
      );
    }

    // Find the transaction in the database first to get existing data
    let transactionSnapshot;
    try {
      transactionSnapshot = await db
        .collection("transactions")
        .where("orderId", "==", orderId)
        .get();

      console.log(
        `Transaction lookup for ${orderId}: found=${!transactionSnapshot.empty}`
      );
    } catch (dbError) {
      console.error(`Error finding transaction for order ${orderId}:`, dbError);
      return NextResponse.json(
        { message: "Database error when looking up transaction" },
        { status: 500 }
      );
    }

    // Get the transaction record if it exists
    const transactionDoc = transactionSnapshot.empty
      ? null
      : transactionSnapshot.docs[0];
    const transactionData = transactionDoc?.data();

    // Extract necessary data based on payload format and database record
    const order_id: string = orderId; // Already extracted
    let order_status: string | undefined;
    let order_amount: number | undefined;
    let customer_id: string | undefined;
    let credit_amount: string | undefined;

    // Determine the order status based on webhook and transaction data
    if (data?.data?.payment?.payment_status === "SUCCESS") {
      // New format with success payment
      order_status = "PAID";
    } else if (data?.data?.order?.order_status) {
      // Old format
      order_status = data.data.order.order_status;
    } else if (data?.data?.payment?.payment_status) {
      // New format with other payment status
      order_status = data.data.payment.payment_status;
    } else if (transactionData?.status) {
      // Fallback to existing transaction status
      order_status = transactionData.status;
    } else {
      // Default status if nothing found
      order_status = "UNKNOWN";
    }

    // Extract other information from old format
    if (data.data.order) {
      // Get data from order object
      order_amount = data.data.order.order_amount;

      if (data.data.order.customer_details) {
        customer_id = data.data.order.customer_details.customer_id;
      }

      if (data.data.order.order_meta) {
        credit_amount = data.data.order.order_meta.credit_amount;
      }
    }

    // Extract data from new format
    if (data.data.payment) {
      // Get amount from payment
      order_amount = data.data.payment.payment_amount;
    }

    if (data.data.customer_details) {
      // Get customer ID from customer_details
      customer_id = data.data.customer_details.customer_id;
    }

    // Get data from transaction if not available in webhook
    if (!customer_id && transactionData?.userId) {
      customer_id = transactionData.userId;
    }

    if (!credit_amount && transactionData?.creditAmount) {
      credit_amount = String(transactionData.creditAmount);
    }

    // Transaction record handling
    try {
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
        if (transactionDoc) {
          const updateData: Record<string, unknown> = {
            webhookData: data,
            updatedAt: new Date(),
            lastWebhookAt: new Date(),
          };

          // Only include status if it's defined and changed
          if (order_status && order_status !== transactionData?.status) {
            updateData.status = order_status;
            console.log(
              `Updating status from ${transactionData?.status} to ${order_status}`
            );
          }

          await transactionDoc.ref.update(updateData);

          console.log(`Transaction updated from webhook for order ${order_id}`);
        } else {
          console.error(`Transaction document is null for order ${order_id}`);
        }
      }
    } catch (updateError) {
      console.error(
        `Error updating transaction for order ${order_id}:`,
        updateError
      );
      return NextResponse.json(
        { message: "Database error when updating transaction" },
        { status: 500 }
      );
    }

    // If payment is successful, check if credits were added
    if (
      order_status === "PAID" ||
      order_status === "SUCCESS" ||
      data?.data?.payment?.payment_status === "SUCCESS"
    ) {
      // Extract user ID and credit amount
      if (!customer_id) {
        console.error("Missing customer_id in webhook payload and transaction");
        return NextResponse.json(
          { message: "Missing customer_id for credit processing" },
          { status: 400 }
        );
      }

      if (!credit_amount && transactionData) {
        // Try to get credit amount from transaction
        if (transactionData.creditAmount) {
          credit_amount = String(transactionData.creditAmount);
        } else {
          console.error(
            "Credit amount not found in transaction or webhook payload"
          );
          return NextResponse.json(
            { message: "Missing credit_amount for credit processing" },
            { status: 400 }
          );
        }
      }

      if (!credit_amount) {
        console.error("Credit amount not found");
        return NextResponse.json(
          { message: "Missing credit_amount for credit processing" },
          { status: 400 }
        );
      }

      // Ensure credit_amount is a valid number
      let creditAmount: number;
      try {
        creditAmount = parseInt(credit_amount);
        if (isNaN(creditAmount) || creditAmount <= 0) {
          throw new Error("Invalid credit amount");
        }
      } catch {
        console.error(
          `Invalid credit amount for order ${order_id}:`,
          credit_amount
        );
        return NextResponse.json(
          { message: "Invalid credit amount" },
          { status: 400 }
        );
      }

      // Check if credits were already added
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
      console.log(
        `Adding ${creditAmount} credits to user ${customer_id} for order ${order_id}`
      );
      try {
        const addCreditsResult = await addCredits(customer_id, creditAmount);

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
            {
              message: "Failed to add credits",
              error: addCreditsResult.message,
            },
            { status: 500 }
          );
        }
      } catch (creditsError) {
        console.error(
          `Error in addCredits function for order ${order_id}:`,
          creditsError
        );
        return NextResponse.json(
          {
            message: "Error adding credits",
            error:
              creditsError instanceof Error
                ? creditsError.message
                : "Unknown error",
          },
          { status: 500 }
        );
      }

      // Update transaction to completed status
      try {
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
          `Successfully added ${creditAmount} credits to user ${customer_id} for order ${order_id}`
        );
      } catch (updateError) {
        console.error(
          `Error updating transaction to COMPLETED for order ${order_id}:`,
          updateError
        );
        // Still return success since credits were added
      }

      return NextResponse.json(
        { message: "Credits added successfully" },
        { status: 200 }
      );
    }

    // For non-success statuses, just acknowledge receipt
    return NextResponse.json(
      { message: `Webhook received, order status: ${order_status}` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error processing webhook for order ${orderId}:`, error);
    console.error(
      "Error details:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Try to save the error to the database for debugging
    try {
      await db.collection("webhook_errors").add({
        timestamp: new Date(),
        orderId,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : String(error),
        rawBody: rawBody.substring(0, 1000), // Store truncated raw body for debugging
      });
    } catch (logError) {
      console.error("Failed to log webhook error to database:", logError);
    }

    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
