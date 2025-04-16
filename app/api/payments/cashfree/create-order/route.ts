import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserByEmail } from "@/lib/actions/user.action";
import { auth, db } from "@/firebase/admin";

// Initialize Cashfree configuration
const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
// USD to INR conversion rate
const USD_TO_INR_RATE = parseFloat(process.env.USD_TO_INR_RATE || "85.6");

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
      const { amount, creditAmount } = body;

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

      // Convert USD to INR
      const amountInUSD = parseFloat(amount);
      const amountInINR = (amountInUSD * USD_TO_INR_RATE).toFixed(2);

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
          conversionRate: USD_TO_INR_RATE,
        });

        // Record the order creation in the database
        await db.collection("transactions").add({
          orderId: orderId,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          amountUSD: amountInUSD,
          amountINR: parseFloat(amountInINR),
          creditAmount: parseInt(creditAmount),
          status: "CREATED",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const response = await fetch("https://sandbox.cashfree.com/pg/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2022-01-01",
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: parseFloat(amountInINR),
            order_currency: "INR",
            customer_details: {
              customer_id: user.id,
              customer_name: user.name || "User",
              customer_email: user.email || "",
              customer_phone: user.phone || "9999999999",
            },
            order_meta: {
              return_url: `${baseUrl}/api/payments/cashfree/verify?orderId=${orderId}&creditAmount=${creditAmount}`,
              notify_url: `${baseUrl}/api/payments/cashfree/webhook`,
              credit_amount: creditAmount,
              conversion_rate: USD_TO_INR_RATE,
              amount_usd: amountInUSD,
            },
          }),
        });

        const result = await response.json();
        console.log("Cashfree response:", result);

        if (!response.ok) {
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
