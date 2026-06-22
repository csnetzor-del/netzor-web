import { prisma } from "./prisma";
import { generateTransactionId } from "./utils";
import { validateCoupon } from "./netzor-pay/coupons";
import { completePayment } from "./netzor-pay/complete-payment";

export type PaymentIntentInput = {
  invoiceId: string;
  installmentId?: string;
  amount: number;
  couponCode?: string;
  cardLast4: string;
  cardBrand?: string;
};

export type PaymentIntentResult = {
  success: boolean;
  transactionId?: string;
  finalAmount?: number;
  discountAmount?: number;
  error?: string;
};

export async function processNetzorPay(
  input: PaymentIntentInput
): Promise<PaymentIntentResult> {
  const merchantId = process.env.NETZOR_PAY_MERCHANT_ID || "NZR-SIM";
  const apiKey = process.env.NETZOR_PAY_API_KEY || "simulated";

  if (!/^\d{4}$/.test(input.cardLast4)) {
    return { success: false, error: "Invalid card details." };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: input.invoiceId },
    include: { installments: true },
  });

  if (!invoice) {
    return { success: false, error: "Invoice not found." };
  }

  const balance = invoice.totalAmount - invoice.paidAmount;
  if (input.amount <= 0 || input.amount > balance + 0.01) {
    return { success: false, error: "Invalid payment amount." };
  }

  let discountAmount = 0;
  let couponId: string | undefined;

  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, input.amount);
    if (!couponResult.valid) {
      return { success: false, error: couponResult.error };
    }
    discountAmount = couponResult.discount ?? 0;
    couponId = couponResult.coupon?.id;
  }

  const finalAmount = Math.max(0, input.amount - discountAmount);
  const transactionId = generateTransactionId();

  const payment = await prisma.payment.create({
    data: {
      invoiceId: input.invoiceId,
      installmentId: input.installmentId,
      amount: input.amount,
      discountAmount,
      finalAmount,
      status: "PROCESSING",
      transactionId,
      couponId,
      gatewayResponse: JSON.stringify({
        merchantId,
        cardBrand: input.cardBrand || "visa",
        cardLast4: input.cardLast4,
        channel: "netzor_pay_secure",
        timestamp: new Date().toISOString(),
      }),
    },
  });

  await new Promise((r) => setTimeout(r, 800));

  const completed = await completePayment(payment.id, {
    channel: "netzor_pay_simulated",
    cardLast4: input.cardLast4,
    timestamp: new Date().toISOString(),
  });

  if (!completed.ok) {
    return { success: false, error: completed.error };
  }

  return {
    success: true,
    transactionId: completed.transactionId,
    finalAmount,
    discountAmount,
  };
}

export async function previewCoupon(code: string, amount: number) {
  return validateCoupon(code, amount);
}
