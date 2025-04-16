import { NextRequest, NextResponse } from "next/server";
import { addCredits } from "@/lib/actions/credit.action";
import { db } from "@/firebase/admin";
import crypto from "crypto";

// Define webhook data type for Cashfree v2 format
interface CashfreeWebhookData {
  data?: {
    order?: {
      order_id?: string;
      order_amount?: number;
      order_currency?: string;
      order_tags?: null | Record<string, unknown>;
      [key: string]: unknown;
    };
    payment?: {
      cf_payment_id?: string;
      payment_status?: string;
      payment_amount?: number;
      payment_currency?: string;
      payment_message?: string;
      payment_time?: string;
      bank_reference?: string;
      auth_id?: string | null;
      payment_method?: Record<string, unknown>;
      payment_group?: string;
      [key: string]: unknown;
    };
    customer_details?: {
      customer_name?: string;
      customer_id?: string;
      customer_email?: string;
      customer_phone?: string;
      [key: string]: unknown;
    };
    payment_gateway_details?: Record<string, unknown>;
    payment_offers?: null | Record<string, unknown>;
    [key: string]: unknown;
  };
  event_time?: string;
  type?: string;
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

      // Extract orderId from the webhook
      if (data?.data?.order?.order_id) {
        orderId = data.data.order.order_id;
      } else {
        console.warn("Cannot find order_id in webhook payload");
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

    // Extract payment status
    const paymentStatus = data?.data?.payment?.payment_status;

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
    if (!data || !data.data || !data.data.payment) {
      console.error("Invalid webhook payload structure:", JSON.stringify(data));
      return NextResponse.json(
        { message: "Invalid webhook payload structure" },
        { status: 400 }
      );
    }

    // Find the transaction in the database to get credit amount and other details
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

    // Extract necessary data from webhook and transaction
    const order_id: string = orderId;
    const order_amount = data.data.payment?.payment_amount;
    const customer_id =
      data.data.customer_details?.customer_id || transactionData?.userId;
    let credit_amount = transactionData?.creditAmount
      ? String(transactionData.creditAmount)
      : undefined;

    // Map payment status to our internal status
    let order_status: string;
    if (data.data.payment?.payment_status === "SUCCESS") {
      // Only set as PAID initially, will be updated to COMPLETED after adding credits
      order_status = "PAID";
    } else if (data.data.payment?.payment_status) {
      order_status = data.data.payment.payment_status;
    } else {
      order_status = "UNKNOWN";
    }

    // Transaction record handling
    try {
      if (transactionSnapshot.empty) {
        // Don't create new transactions from webhooks, only update existing ones
        console.log(
          `No existing transaction found for order ${order_id}, ignoring webhook`
        );
        return NextResponse.json(
          { message: `No existing transaction found for order ${order_id}` },
          { status: 400 }
        );
      } else {
        // Update existing transaction
        if (transactionDoc) {
          const updateData: Record<string, unknown> = {
            webhookData: data,
            updatedAt: new Date(),
            lastWebhookAt: new Date(),
          };

          // Only include status if it's changed
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

    // If payment is successful, add credits
    if (data.data.payment?.payment_status === "SUCCESS") {
      // Only proceed if the previous status was PENDING_PAYMENT
      if (transactionData?.status !== "PENDING_PAYMENT") {
        console.log(
          `Transaction status is not PENDING_PAYMENT (current: ${transactionData?.status}), not adding credits`
        );
        return NextResponse.json(
          {
            message:
              "Webhook received but no credits added as transaction was not in PENDING_PAYMENT state",
            currentStatus: transactionData?.status,
          },
          { status: 200 }
        );
      }

      // Extract user ID and credit amount
      if (!customer_id) {
        console.error("Missing customer_id in webhook and transaction");
        return NextResponse.json(
          { message: "Missing customer_id for credit processing" },
          { status: 400 }
        );
      }

      // Mark this transaction as being processed to prevent concurrent processing
      try {
        if (transactionDoc) {
          await transactionDoc.ref.update({
            processingCredits: true,
            processingStartedAt: new Date(),
            status: "PROCESSING_PAYMENT", // Transitional status
          });
          console.log(`Marked order ${order_id} as processing`);
        }
      } catch (lockError) {
        console.error(
          `Error setting processing lock for order ${order_id}:`,
          lockError
        );
        // Continue processing but log the error
      }

      // If credit amount is not available, use payment amount as fallback
      if (!credit_amount) {
        if (order_amount) {
          // Basic fallback: 1 unit of currency = 1 credit
          credit_amount = String(Math.round(order_amount));
          console.log(
            `Using payment amount as fallback for credits: ${credit_amount}`
          );
        } else {
          console.error("No credit amount or payment amount available");
          return NextResponse.json(
            { message: "Cannot determine credit amount" },
            { status: 400 }
          );
        }
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
                  processingCredits: false, // Clear processing flag on failure
                  processingError: addCreditsResult.message,
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

        // Clear processing flag on exception
        try {
          if (transactionDoc) {
            await transactionDoc.ref.update({
              processingCredits: false,
              processingError:
                creditsError instanceof Error
                  ? creditsError.message
                  : String(creditsError),
              status: "PAYMENT_COMPLETED_CREDIT_ERROR", // Consistent error status
              updatedAt: new Date(),
            });
          }
        } catch (clearError) {
          console.error(
            `Failed to clear processing flag for order ${order_id}:`,
            clearError
          );
        }

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
                processingCredits: false, // Clear processing flag
                processingCompletedAt: new Date(),
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

        // Try to clear the processing flag even if the update failed
        try {
          if (transactionDoc) {
            await transactionDoc.ref.update({
              processingCredits: false,
              processingError: String(updateError),
              status: "PAYMENT_COMPLETED_CREDIT_FAILED", // Important: Don't leave in PROCESSING_PAYMENT state
            });
          }
        } catch (clearError) {
          console.error(
            `Failed to clear processing flag for order ${order_id}:`,
            clearError
          );
        }

        // Still return success since credits were added
      }

      return NextResponse.json(
        { message: "Credits added successfully" },
        { status: 200 }
      );
    }

    // For non-success statuses, just acknowledge receipt
    return NextResponse.json(
      {
        message: `Webhook received, order status: ${order_status}`,
        orderId: order_id,
        currentStatus: transactionData?.status,
        newStatus: order_status,
      },
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
