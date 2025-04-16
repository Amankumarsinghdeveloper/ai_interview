import { NextRequest, NextResponse } from "next/server";
import { addCredits, deductCredits } from "@/lib/actions/credit.action";
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

    // Check for transaction document existence
    if (!transactionDoc || !transactionData) {
      console.log(`No existing transaction found for order ${orderId}`);
      return NextResponse.json(
        { message: "Transaction data not available" },
        { status: 400 }
      );
    }

    // Extract necessary data from webhook and transaction
    const order_id: string = orderId;
    const order_amount = data.data.payment?.payment_amount;
    const customer_id =
      data.data.customer_details?.customer_id || transactionData.userId;
    const credit_amount = transactionData.creditAmount
      ? String(transactionData.creditAmount)
      : undefined;

    // Map payment status to our internal status
    let order_status: string;
    if (data.data.payment?.payment_status === "SUCCESS") {
      order_status = "PAID";
    } else if (data.data.payment?.payment_status === "FAILED") {
      order_status = "FAILED";
    } else if (data.data.payment?.payment_status === "REFUNDED") {
      order_status = "REFUNDED";
    } else if (data.data.payment?.payment_status) {
      order_status = data.data.payment.payment_status;
    } else {
      order_status = "UNKNOWN";
    }

    // Update transaction with webhook data
    try {
      // Only include status if it's changed
      if (
        order_status &&
        order_status !== transactionData.paymentDetails.order_status
      ) {
        console.log(
          `Updating status from ${transactionData.paymentDetails.order_status} to ${order_status}`
        );

        // Update transaction with new webhook data and status
        await transactionDoc.ref.update({
          webhookData: data,
          "paymentDetails.order_status": order_status,
          lastPaymentStatus: data.data.payment?.payment_status,
          updatedAt: new Date(),
          lastWebhookAt: new Date(),
        });
        console.log(`Transaction updated from webhook for order ${order_id}`);
      } else {
        console.log(
          `Transaction status unchanged: ${transactionData.paymentDetails.order_status}`
        );
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

    // Get credit amount
    let creditAmount: number = 0;
    if (credit_amount) {
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
    } else if (order_amount) {
      // Fallback: 1 unit of currency = 1 credit
      creditAmount = Math.round(order_amount);
      console.log(
        `Using payment amount as fallback for credits: ${creditAmount}`
      );
    } else {
      console.error("No credit amount or payment amount available");
      return NextResponse.json(
        { message: "Cannot determine credit amount" },
        { status: 400 }
      );
    }

    // Handle different payment statuses
    if (data.data.payment?.payment_status === "SUCCESS") {
      // Only add credits if transaction is in PENDING_PAYMENT state
      if (transactionData.paymentDetails.order_status !== "PENDING_PAYMENT") {
        console.log(
          `Transaction already processed (status: ${transactionData.paymentDetails.order_status}), not adding credits again`
        );
        return NextResponse.json(
          {
            message: "Webhook received but transaction already processed",
            currentStatus: transactionData.paymentDetails.order_status,
          },
          { status: 200 }
        );
      }

      // Mark this transaction as being processed to prevent concurrent processing
      try {
        await transactionDoc.ref.update({
          processingCredits: true,
          processingStartedAt: new Date(),
          "paymentDetails.order_status": "PROCESSING_PAYMENT", // Transitional status
        });
        console.log(`Marked order ${order_id} as processing`);
      } catch (lockError) {
        console.error(
          `Error setting processing lock for order ${order_id}:`,
          lockError
        );
        // Continue processing but log the error
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
          await transactionDoc.ref.update({
            "paymentDetails.order_status": "PAYMENT_COMPLETED_CREDIT_FAILED",
            errorMessage: addCreditsResult.message,
            processingCredits: false, // Clear processing flag on failure
            processingError: addCreditsResult.message,
            updatedAt: new Date(),
          });

          return NextResponse.json(
            {
              message: "Failed to add credits",
              error: addCreditsResult.message,
            },
            { status: 500 }
          );
        }

        // Update transaction to completed status
        await transactionDoc.ref.update({
          "paymentDetails.order_status": "COMPLETED",
          creditsAdded: creditAmount,
          creditsAddedAt: new Date(),
          updatedAt: new Date(),
          processingCredits: false, // Clear processing flag
          processingCompletedAt: new Date(),
        });

        console.log(
          `Successfully added ${creditAmount} credits to user ${customer_id} for order ${order_id}`
        );

        return NextResponse.json(
          { message: "Credits added successfully" },
          { status: 200 }
        );
      } catch (creditsError) {
        console.error(
          `Error in addCredits function for order ${order_id}:`,
          creditsError
        );

        // Clear processing flag on exception
        try {
          await transactionDoc.ref.update({
            processingCredits: false,
            processingError:
              creditsError instanceof Error
                ? creditsError.message
                : String(creditsError),
            "paymentDetails.order_status": "PAYMENT_COMPLETED_CREDIT_ERROR", // Consistent error status
            updatedAt: new Date(),
          });
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
    } else if (
      ["FAILED", "REFUNDED", "CANCELLED"].includes(
        data.data.payment?.payment_status || ""
      )
    ) {
      // Only deduct credits if they were already added (transaction is COMPLETED)
      if (
        transactionData.paymentDetails.order_status === "COMPLETED" &&
        transactionData.creditsAdded
      ) {
        console.log(
          `Payment status changed to ${data.data.payment?.payment_status} for completed order ${order_id}, reverting credits`
        );

        // Mark transaction as processing refund
        try {
          await transactionDoc.ref.update({
            processingRefund: true,
            processingRefundStartedAt: new Date(),
            "paymentDetails.order_status": "PROCESSING_REFUND", // Transitional status
          });
        } catch (lockError) {
          console.error(
            `Error setting refund processing flag for order ${order_id}:`,
            lockError
          );
        }

        // Get amount of credits to deduct (from transaction record)
        const creditsToDeduct = transactionData.creditsAdded || creditAmount;

        // Deduct credits
        try {
          const deductResult = await deductCredits(
            customer_id,
            creditsToDeduct
          );

          if (!deductResult.success) {
            console.error(
              `Failed to deduct credits for refunded order ${order_id}: ${deductResult.message}`
            );

            // Update transaction with deduction failure
            await transactionDoc.ref.update({
              "paymentDetails.order_status": "REFUND_CREDIT_DEDUCTION_FAILED",
              refundErrorMessage: deductResult.message,
              processingRefund: false,
              updatedAt: new Date(),
            });

            return NextResponse.json(
              {
                message: "Failed to process refund credits",
                error: deductResult.message,
              },
              { status: 500 }
            );
          }

          // Update transaction status
          await transactionDoc.ref.update({
            "paymentDetails.order_status": `${data.data.payment?.payment_status}_PROCESSED`,
            creditsDeducted: creditsToDeduct,
            creditsDeductedAt: new Date(),
            processingRefund: false,
            processingRefundCompletedAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(
            `Successfully deducted ${creditsToDeduct} credits from user ${customer_id} for refunded order ${order_id}`
          );

          return NextResponse.json(
            {
              message: `Credits deducted successfully for ${data.data.payment?.payment_status} payment`,
              deductedAmount: creditsToDeduct,
            },
            { status: 200 }
          );
        } catch (deductError) {
          console.error(
            `Error in deductCredits function for order ${order_id}:`,
            deductError
          );

          // Clear processing flag on exception
          try {
            await transactionDoc.ref.update({
              processingRefund: false,
              processingRefundError:
                deductError instanceof Error
                  ? deductError.message
                  : String(deductError),
              "paymentDetails.order_status": "REFUND_CREDIT_ERROR",
              updatedAt: new Date(),
            });
          } catch (clearError) {
            console.error(
              `Failed to clear refund processing flag for order ${order_id}:`,
              clearError
            );
          }

          return NextResponse.json(
            {
              message: "Error deducting credits for refund/cancellation",
              error:
                deductError instanceof Error
                  ? deductError.message
                  : "Unknown error",
            },
            { status: 500 }
          );
        }
      } else {
        // Transaction wasn't COMPLETED, so no credits were added
        console.log(
          `Order ${order_id} status changed to ${data.data.payment?.payment_status}, but no credits were previously added (status: ${transactionData.paymentDetails.order_status})`
        );

        // Update status to reflect the payment failure
        await transactionDoc.ref.update({
          "paymentDetails.order_status":
            data.data.payment?.payment_status || "FAILED",
          updatedAt: new Date(),
        });

        return NextResponse.json(
          {
            message: `Payment ${data.data.payment?.payment_status}, no credits were previously added`,
            currentStatus: transactionData.paymentDetails.order_status,
          },
          { status: 200 }
        );
      }
    }

    // For other statuses, just acknowledge receipt
    return NextResponse.json(
      {
        message: `Webhook received, order status: ${order_status}`,
        orderId: order_id,
        currentStatus: transactionData.paymentDetails.order_status,
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

    // Try to save the error to the transactions_errors collection for debugging
    try {
      await db.collection("transaction_errors").add({
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
        source: "webhook",
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
