declare module "@cashfreepayments/cashfree-sdk" {
  export enum CFEnvironment {
    PRODUCTION = "PRODUCTION",
    SANDBOX = "SANDBOX",
  }

  export class CFConfig {
    constructor(config: {
      // Support both credential formats
      appId?: string;
      secretKey?: string;
      apiKey?: string;
      clientId?: string;
      environment: CFEnvironment;
    });
  }

  export class CFPaymentGateway {
    constructor();
    initializeApp(config: CFConfig): Promise<void>;
    orders: {
      createOrder(params: {
        orderId: string;
        orderAmount: number;
        orderCurrency: string;
        orderNote?: string;
        customerDetails: {
          customerId: string;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
        };
        orderMeta?: {
          returnUrl?: string;
          notifyUrl?: string;
          [key: string]: unknown;
        };
      }): Promise<{
        data?: {
          orderId: string;
          orderToken: string;
          paymentLink: string;
        };
        error?: unknown;
      }>;
      getOrder(orderId: string): Promise<{
        data?: {
          orderId: string;
          orderAmount: number;
          orderCurrency: string;
          orderStatus: string;
          customerDetails: {
            customerId: string;
            customerName: string;
            customerEmail: string;
            customerPhone: string;
          };
          orderMeta?: Record<string, unknown>;
          payment?: {
            paymentId: string;
            paymentStatus: string;
            paymentMethod: string;
            paymentTime: string;
          };
        };
        error?: unknown;
      }>;
    };
  }

  export class Cashfree {
    constructor(config: {
      appId: string;
      secretKey: string;
      env: "sandbox" | "production";
    });

    payment: {
      createOrder(params: {
        orderId: string;
        orderAmount: number;
        orderCurrency: string;
        orderNote?: string;
        customerDetails: {
          customerId: string;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
        };
        orderMeta?: {
          returnUrl?: string;
          notifyUrl?: string;
          [key: string]: unknown;
        };
      }): Promise<{
        status: string;
        message: string;
        cfOrderId: string;
        paymentLink: string;
        orderToken?: string;
      }>;

      getOrderStatus(params: { orderId: string }): Promise<{
        orderId: string;
        orderAmount: number;
        orderCurrency: string;
        orderStatus: string;
        customerDetails: {
          customerId: string;
          customerName: string;
          customerEmail: string;
          customerPhone: string;
        };
        orderMeta?: Record<string, unknown>;
        payments?: Array<{
          paymentId: string;
          paymentStatus: string;
          paymentMethod: string;
          paymentTime: string;
        }>;
      }>;
    };
  }
}

declare module "@cashfreepayments/cashfree-js" {
  export function initCashfree(config: {
    mode: "sandbox" | "production";
    merchantId: string;
    appId: string;
  }): unknown;

  export function makePayment(options: {
    orderToken: string;
    onSuccess: (data: unknown) => void;
    onFailure: (error: unknown) => void;
  }): void;
}

// Types for webhook payload
export interface CashfreeWebhookPayload {
  data: {
    order: {
      order_id: string;
      order_amount: string;
      order_currency: string;
      order_status: string;
      order_meta?: {
        credit_amount?: string;
        [key: string]: unknown;
      };
      customer_details: {
        customer_id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
      };
      payment?: {
        payment_id: string;
        payment_status: string;
        payment_method: string;
        payment_time: string;
      };
    };
  };
  event_time: string;
  type: string;
}
