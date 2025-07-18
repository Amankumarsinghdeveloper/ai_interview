import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/actions/user.action";
import { auth, db } from "@/firebase/admin";

// Initialize Cashfree configuration
const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
// Check if we're in production mode
const isProduction = process.env.NODE_ENV === "production";
// USD to INR conversion rate
const USD_TO_INR_RATE = parseFloat(process.env.USD_TO_INR_RATE || "85.6");

// Log environment settings for debugging
console.log("Cashfree Environment Settings:", {
  environment: isProduction ? "Production" : "Sandbox",
  appIdPrefix: appId.substring(0, 4),
  secretKeyPrefix: secretKey.substring(0, 4),
});

export async function POST(req: NextRequest) {
  try {
    // Get auth token from cookie
    const cookiesList = await cookies();
    // Check both possible cookie names
    const sessionCookie =
      cookiesList.get("session")?.value || cookiesList.get("__session")?.value;

    if (!sessionCookie) {
      console.log("Session cookie not found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      // Verify session
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

      if (!decodedClaims || !decodedClaims.email) {
        console.log("Invalid session or missing email");
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      // Get request body
      const body = await req.json();
      const { amount, creditAmount, usePaypal, phoneNumber } = body;

      if (
        !amount ||
        !creditAmount ||
        isNaN(Number(amount)) ||
        isNaN(Number(creditAmount))
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid amount" },
          { status: 400 }
        );
      }

      if (!phoneNumber) {
        return NextResponse.json(
          { success: false, message: "Phone number is required" },
          { status: 400 }
        );
      }

      // Set currency based on payment method
      const orderCurrency = usePaypal ? "USD" : "INR";

      // Convert USD to INR only for non-PayPal transactions
      const amountInUSD = parseFloat(amount);
      const amountInINR = !usePaypal
        ? (amountInUSD * USD_TO_INR_RATE).toFixed(2)
        : amount; // For PayPal, use the amount directly (already in USD)

      // Amount to charge in Cashfree - use USD amount for PayPal, INR amount otherwise
      // Ensure minimum order amount: 1 USD for USD payments, 1 INR for INR payments
      const orderAmount = usePaypal
        ? Math.max(amountInUSD, 1) // Minimum 1 USD for PayPal
        : parseFloat(amountInINR);

      // Get user data
      const userEmail = decodedClaims.email;
      const user = await getUserByEmail(userEmail);

      if (!user) {
        console.log(`User not found for email: ${userEmail}`);
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      // Create a unique order ID
      const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

      try {
        // Create order following the Medium article implementation
        console.log("Creating Cashfree order:", {
          orderId,
          amountInUSD,
          amountInINR,
          orderAmount,
          orderCurrency,
          usePaypal,
          conversionRate: USD_TO_INR_RATE,
          environment: isProduction ? "Production" : "Sandbox",
        });

        // Record the order creation in the database
        await db.collection("transactions").add({
          orderId: orderId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPhone: phoneNumber,
          amountUSD: amountInUSD,
          amountINR: !usePaypal
            ? parseFloat(amountInINR)
            : amountInUSD * USD_TO_INR_RATE,
          creditAmount: parseInt(creditAmount),
          status: "CREATED",
          environment: isProduction ? "Production" : "Sandbox",
          paymentMethod: usePaypal ? "PAYPAL" : "CASHFREE",
          currency: orderCurrency,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Use the appropriate endpoint based on environment
        const apiEndpoint = isProduction
          ? "https://api.cashfree.com/pg/orders"
          : "https://sandbox.cashfree.com/pg/orders";

        const requestBody = {
          order_id: orderId,
          order_amount: orderAmount,
          order_currency: orderCurrency,
          customer_details: {
            customer_id: user.id,
            customer_name: user.name || "User",
            customer_email: user.email || "",
            customer_phone: phoneNumber,
          },
          order_meta: {
            return_url: `${baseUrl}/api/payments/cashfree/verify?orderId=${orderId}&creditAmount=${creditAmount}`,
            notify_url: `${baseUrl}/api/payments/cashfree/webhook`,
            credit_amount: creditAmount,
            conversion_rate: USD_TO_INR_RATE,
            amount_usd: amountInUSD,
            usePaypal: usePaypal || false,
          },
        };

        console.log("Cashfree request payload:", JSON.stringify(requestBody));

        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2022-01-01",
          },
          body: JSON.stringify(requestBody),
        });

        const result = await response.json();
        console.log("Cashfree response:", result);

        if (!response.ok) {
          // Check if this is a currency not enabled error
          if (
            usePaypal &&
            result.message &&
            result.message.includes("Currency not enabled")
          ) {
            console.error("USD currency not enabled for this account:", result);
            return NextResponse.json(
              {
                success: false,
                message: "PayPal/USD payments are not currently supported",
                error: "USD Currency not enabled for this merchant account",
              },
              { status: 400 }
            );
          }

          // Update transaction status in the database
          await db
            .collection("transactions")
            .where("orderId", "==", orderId)
            .get()
            .then((snapshot) => {
              if (!snapshot.empty) {
                snapshot.docs[0].ref.update({
                  status: "FAILED",
                  errorMessage: result.message || "API Error",
                  updatedAt: new Date(),
                });
              }
            });

          console.error("Cashfree API error:", result);
          return NextResponse.json(
            {
              success: false,
              message: "Failed to create payment order",
              error: result.message || "Unknown error",
            },
            { status: 500 }
          );
        }

        // Update transaction with Cashfree order details
        await db
          .collection("transactions")
          .where("orderId", "==", orderId)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.docs[0].ref.update({
                status: "PENDING_PAYMENT",
                cfOrderId: result.cf_order_id,
                paymentLink: result.payment_link,
                updatedAt: new Date(),
              });
            }
          });

        return NextResponse.json({
          success: true,
          data: {
            orderId: orderId,
            paymentLink: result.payment_link,
            cfOrderId: result.cf_order_id,
          },
        });
      } catch (sdkError) {
        console.error("Cashfree payment error:", sdkError);
        return NextResponse.json(
          {
            success: false,
            message: "Payment gateway error",
            error: (sdkError as Error)?.message || "Unknown error",
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
