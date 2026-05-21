import { prisma } from "@/lib/prisma";
import { generateTransactionId } from "@/lib/utils";
import { isRegistrationInvoice } from "@/lib/registration";
import { validateCoupon } from "./coupons";

export type PrepareOrderInput = {
  invoiceId: string;
  installmentId?: string;
  amount: number;
  couponCode?: string;
  clientProfileId: string;
};

export async function preparePaymentOrder(input: PrepareOrderInput) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: input.invoiceId, clientId: input.clientProfileId },
    include: { installments: true },
  });

  if (!invoice) {
    return { ok: false as const, error: "Invoice not found" };
  }

  const balance = invoice.totalAmount - invoice.paidAmount;
  const registration = isRegistrationInvoice(invoice);

  if (registration) {
    if (input.couponCode) {
      return { ok: false as const, error: "Coupons cannot be used for registration" };
    }
    if (Math.abs(input.amount - balance) > 0.01) {
      return {
        ok: false as const,
        error: "Registration fee must be paid in full",
      };
    }
  }

  if (input.amount <= 0 || input.amount > balance + 0.01) {
    return { ok: false as const, error: "Invalid payment amount" };
  }

  let discountAmount = 0;
  let couponId: string | undefined;

  if (input.couponCode) {
    const couponResult = await validateCoupon(input.couponCode, input.amount);
    if (!couponResult.valid) {
      return { ok: false as const, error: couponResult.error };
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
      status: "PENDING",
      method: "netzor_pay",
      transactionId,
      couponId,
    },
  });

  return {
    ok: true as const,
    payment,
    invoice,
    finalAmount,
    discountAmount,
    amountPaise: Math.round(finalAmount * 100),
    transactionId,
  };
}
