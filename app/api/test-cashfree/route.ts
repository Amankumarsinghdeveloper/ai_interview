import { NextResponse, NextResponse } from "next/server";

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

    // Use the appropriate endpoint based on environment
    const apiEndpoint = isProduction
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    // Try alternating between Authentication methods

    // Method 1: Try with Basic Auth
    const authString = Buffer.from(`${appId}:${secretKey}`).toString("base64");
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${authString}`,
        "x-api-version": "2022-01-01",
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
    });

    let result = await response.json();
    console.log("Method 1 (Basic Auth) Response:", result);

    // If Method 1 fails, try Method 2: Direct credentials
    if (!response.ok) {
      console.log("First method failed, trying with direct credentials...");

      const testOrderId2 = `test2_${Date.now()}`;
      const response2 = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2022-01-01",
        },
        body: JSON.stringify({
          order_id: testOrderId2,
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
      });

      const result2 = await response2.json();
      console.log("Method 2 (Direct credentials) Response:", result2);

      if (response2.ok) {
        result = result2;
      } else {
        // Return combined error information
        return NextResponse.json({
          success: false,
          message: "Cashfree API test failed with both methods",
          errors: {
            basicAuth: result,
            directCredentials: result2,
          },
          credentials: {
            appIdLength: appId.length,
            secretKeyLength: secretKey.length,
            environment: isProduction ? "production" : "sandbox",
          },
        });
      }
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
