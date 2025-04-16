import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth, db } from "@/firebase/admin";

// Initialize Cashfree configuration
const appId = process.env.CASHFREE_APP_ID || "";
const secretKey = process.env.CASHFREE_SECRET_KEY || "";
// Check if we're in production mode
const isProduction = process.env.NODE_ENV === "production";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const orderId = searchParams.get("orderId");
  const creditAmount = searchParams.get("creditAmount");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Redirect to profile page if parameters are missing
  if (!orderId || !creditAmount) {
    return NextResponse.redirect(
      `${baseUrl}/profile?paymentStatus=failed&error=invalid_parameters`
    );
  }

  try {
    // Get auth token from cookie
    const cookiesList = await cookies();
    // Check both possible cookie names
    const sessionCookie =
      cookiesList.get("session")?.value || cookiesList.get("__session")?.value;

    if (!sessionCookie) {
      console.log("Session cookie not found");
      return NextResponse.redirect(
        `${baseUrl}/profile?paymentStatus=failed&error=unauthorized`
      );
    }

    try {
      // Verify session
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

      if (!decodedClaims || !decodedClaims.uid) {
        console.log("Invalid session or missing user ID");
        return NextResponse.redirect(
          `${baseUrl}/profile?paymentStatus=failed&error=unauthorized`
        );
      }

      try {
        // Update transaction status to 'PROCESSING'
        await db
          .collection("transactions")
          .where("orderId", "==", orderId)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.docs[0].ref.update({
                status: "PROCESSING_VERIFICATION",
                updatedAt: new Date(),
              });
            }
          });

        // Use the appropriate endpoint based on environment
        const apiEndpoint = isProduction
          ? `https://api.cashfree.com/pg/orders/${orderId}`
          : `https://sandbox.cashfree.com/pg/orders/${orderId}`;

        // Get order details from Cashfree
        const response = await fetch(apiEndpoint, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2022-01-01",
          },
        });

        const result = await response.json();
        console.log("Cashfree order status:", result);

        if (!response.ok) {
          // Update transaction status to 'VERIFICATION_FAILED'
          await db
            .collection("transactions")
            .where("orderId", "==", orderId)
            .get()
            .then((snapshot) => {
              if (!snapshot.empty) {
                snapshot.docs[0].ref.update({
                  status: "VERIFICATION_FAILED",
                  errorMessage: "Failed to verify order with Cashfree",
                  updatedAt: new Date(),
                });
              }
            });

          console.error("Cashfree API error:", result);
          return NextResponse.redirect(
            `${baseUrl}/profile?paymentStatus=failed&error=order_not_found`
          );
        }

        // Update transaction with payment details
        await db
          .collection("transactions")
          .where("orderId", "==", orderId)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.docs[0].ref.update({
                status: result.order_status,
                paymentDetails: result,
                updatedAt: new Date(),
              });
            }
          });

        // Check payment status
        if (result.order_status !== "PAID") {
          return NextResponse.redirect(
            `${baseUrl}/profile?paymentStatus=failed&error=payment_not_completed`
          );
        }

        // Instead, update transaction to pending webhook status
        await db
          .collection("transactions")
          .where("orderId", "==", orderId)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              snapshot.docs[0].ref.update({
                updatedAt: new Date(),
              });
            }
          });

        // Redirect to success page with pending status
        return NextResponse.redirect(
          `${baseUrl}/profile?paymentStatus=pending&orderId=${orderId}`
        );
      } catch (error) {
        console.error("Cashfree API error:", error);
        return NextResponse.redirect(
          `${baseUrl}/profile?paymentStatus=failed&error=payment_gateway_error`
        );
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      return NextResponse.redirect(
        `${baseUrl}/profile?paymentStatus=failed&error=session_verification_failed`
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.redirect(
      `${baseUrl}/profile?paymentStatus=failed&error=server_error`
    );
  }
}
