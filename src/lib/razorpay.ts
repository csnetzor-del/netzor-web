import crypto from "crypto";

export type RazorpayOrderOptions = {
  amount: number; // in paise (e.g. 50000 for INR 500.00)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
};

export type RazorpayOrderResponse = {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
};

export function getRazorpayKeys() {
  const keyId =
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  return { keyId, keySecret, webhookSecret };
}

export function isRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getRazorpayKeys();
  const provider = process.env.NETZOR_PAY_PROVIDER;
  if (provider === "simulated") return false;
  return Boolean(keyId && keySecret);
}

/**
 * Creates an order directly using Razorpay Orders API
 */
export async function createRazorpayOrder(
  options: RazorpayOrderOptions
): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret } = getRazorpayKeys();

  if (!keyId || !keySecret) {
    throw new Error("Razorpay API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are missing");
  }

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const payload = {
    amount: Math.round(options.amount),
    currency: options.currency || "INR",
    receipt: options.receipt || `rcpt_${Date.now()}`,
    notes: options.notes || {},
  };

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error?.description || data?.error?.message || "Failed to create Razorpay order";
    throw new Error(message);
  }

  return data as RazorpayOrderResponse;
}

/**
 * Verifies Razorpay Checkout signature using HMAC SHA-256
 */
export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { keySecret } = getRazorpayKeys();
  if (!keySecret) return false;

  try {
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${params.orderId}|${params.paymentId}`)
      .digest("hex");

    return generatedSignature === params.signature;
  } catch {
    return false;
  }
}

/**
 * Verifies Razorpay Webhook signature using HMAC SHA-256
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
  secretOverride?: string
): boolean {
  const secret = secretOverride || getRazorpayKeys().webhookSecret;
  if (!secret) return false;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    return expectedSignature === signature;
  } catch {
    return false;
  }
}

/**
 * Fetches payment details from Razorpay to verify status & amount
 */
export async function fetchRazorpayPayment(paymentId: string) {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) return null;

  const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;

  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: { Authorization: authHeader },
  });

  if (!res.ok) return null;
  return res.json();
}
