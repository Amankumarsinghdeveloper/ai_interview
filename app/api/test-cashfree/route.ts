import { NextResponse } from "next/server";

export async function GET() {
  try {
    const appId = process.env.CASHFREE_APP_ID || "";
    const secretKey = process.env.CASHFREE_SECRET_KEY || "";
    const isProduction = process.env.NODE_ENV === "production";
    const USD_TO_INR_RATE = parseFloat(process.env.USD_TO_INR_RATE || "85.6");

    // Generate a test order ID
    const testOrderId = `test_${Date.now()}`;

    // Test USD amount and conversion
    const testAmountUSD = 1.0;
    const testAmountINR = (testAmountUSD * USD_TO_INR_RATE).toFixed(2);

    console.log("Testing Cashfree API with currency conversion:", {
      appId: appId.substring(0, 5) + "..." + appId.substring(appId.length - 4),
      secretKeyLength: secretKey.length,
      environment: isProduction ? "production" : "sandbox",
      amountUSD: testAmountUSD,
      amountINR: testAmountINR,
      conversionRate: USD_TO_INR_RATE,
    });

    // Try to create a test order with Basic Auth
    const authString = Buffer.from(`${appId}:${secretKey}`).toString("base64");
    const response = await fetch(
      `https://${isProduction ? "api" : "sandbox"}.cashfree.com/pg/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${authString}`,
          "x-api-version": "2022-09-01",
        },
        body: JSON.stringify({
          order_id: testOrderId,
          order_amount: parseFloat(testAmountINR),
          order_currency: "INR",
          order_note: `Test order ($${testAmountUSD} USD to ₹${testAmountINR} INR)`,
          customer_details: {
            customer_id: "test_customer",
            customer_name: "Test User",
            customer_email: "test@example.com",
            customer_phone: "9999999999",
          },
        }),
      }
    );

    // Log the raw response for debugging
    console.log("Cashfree response status:", response.status);

    const result = await response.json();
    console.log("Cashfree API response:", result);

    if (!response.ok) {
      // Try a different endpoint as a fallback
      console.log("Trying alternative endpoint...");

      const altResponse = await fetch(
        "https://sandbox.cashfree.com/pg/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": appId,
            "x-client-secret": secretKey,
            "x-api-version": "2022-01-01",
          },
          body: JSON.stringify({
            order_id: `alt_${testOrderId}`,
            order_amount: 1.0,
            order_currency: "INR",
            customer_details: {
              customer_id: "test_customer",
              customer_name: "Test User",
              customer_email: "test@example.com",
              customer_phone: "9999999999",
            },
          }),
        }
      );

      const altResult = await altResponse.json();
      console.log("Alternative endpoint response:", altResult);

      return NextResponse.json({
        success: false,
        message: "Cashfree API test failed with both endpoints",
        primaryError: result,
        alternativeError: altResult,
        credentials: {
          appIdLength: appId.length,
          secretKeyLength: secretKey.length,
          environment: isProduction ? "production" : "sandbox",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Cashfree API credentials are valid",
      result: {
        order_id: result.order_id,
        cf_order_id: result.cf_order_id,
        payment_link: result.payment_link
          ? "Generated successfully"
          : "Not generated",
      },
    });
  } catch (error) {
    console.error("Error testing Cashfree API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error testing Cashfree API",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
