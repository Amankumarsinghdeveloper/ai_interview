# Cashfree Payments Integration Setup Guide

This guide will help you set up the Cashfree Payments gateway in your application.

## Prerequisites

1. A Cashfree Payments account (sign up at [cashfree.com](https://www.cashfree.com/))
2. Your Cashfree App ID and Secret Key

## Configuration Steps

### 1. Update Environment Variables

Add the following variables to your `.env.local` file:

```
# Cashfree Payment Gateway Config
CASHFREE_APP_ID="YOUR-APP-ID-HERE"
CASHFREE_SECRET_KEY="YOUR-SECRET-KEY-HERE"
NEXT_PUBLIC_BASE_URL="YOUR-DOMAIN-URL" # For development, use your ngrok URL (e.g., https://xyz.ngrok.io)
USD_TO_INR_RATE="85.6" # Current USD to INR exchange rate (update as needed)
```

### 2. Understanding the Integration

This implementation uses:

- `@cashfreepayments/cashfree-sdk` - For server-side API calls
- Webhook handler for payment notifications
- Signature verification for security
- USD to INR conversion for international payments

The payment flow is:

1. User selects credits to purchase
2. Backend converts USD amount to INR using the exchange rate
3. Cashfree payment gateway processes the INR payment
4. After payment, user returns to our site
5. Webhooks update our database when payment status changes

### 3. Set Up Webhooks in Cashfree Dashboard

1. Log in to your Cashfree Payments dashboard
2. Navigate to **Developers** > **Webhooks**
3. Click on **Add Webhook Endpoint**
4. Enter your webhook URL: `https://your-domain.com/api/payments/cashfree/webhook` (use your ngrok URL for testing)
5. Select the latest webhook version available (2022-09-01 or newer)
6. Click **Test** to verify your endpoint responds correctly
7. Choose the following events to subscribe to:
   - `success payment` - Triggered when a payment is successful
   - `failed payment` - Triggered when a payment fails
8. Click **Add Webhook** to save your configuration

### 4. Webhook Verification

Our implementation automatically verifies webhooks using your Cashfree Secret Key to ensure security.

The verification process:

1. Extracts the `x-webhook-signature` and `x-webhook-timestamp` from headers
2. Concatenates the timestamp and raw request body
3. Creates an HMAC-SHA256 hash of the concatenated string using your Secret Key
4. Base64 encodes the hash and compares it with the received signature
5. Processes the webhook only if the signatures match

### 5. Local Testing with Ngrok

To test webhooks locally, you'll need a public URL that Cashfree can reach:

1. Install ngrok: `npm install -g ngrok` or download from ngrok.com
2. Start your Next.js app: `npm run dev`
3. In a separate terminal, run ngrok: `ngrok http 3000`
4. Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`)
5. Update your `.env.local` file with this URL as `NEXT_PUBLIC_BASE_URL`
6. Configure this URL in your Cashfree Webhook settings

### 6. Whitelist Cashfree IPs (Optional but Recommended)

If your server has IP restrictions, whitelist these Cashfree IP addresses:

**Production IPs:**

- 52.66.101.190
- 3.109.102.144
- 3.111.60.173

**Test/UAT IPs:**

- 52.66.25.127
- 15.206.45.168

### 7. Test the Integration

1. Make a test purchase on your site
2. Check the Cashfree dashboard to confirm the payment was created
3. Verify the webhook was received by checking your server logs
4. Confirm the user's credits were added in your database

### Troubleshooting

- **Webhook not received**: Check if your URL is publicly accessible and properly configured in Cashfree dashboard
- **Signature verification fails**: Ensure you're using the correct Secret Key in your `.env.local` file
- **Payment not completed**: Check the order status in Cashfree dashboard for any issues
- **Credits not added**: Check server logs for errors in the webhook processing

## Contact Support

If you encounter any issues with the Cashfree integration, please contact:

- Cashfree Support: support@cashfree.com
