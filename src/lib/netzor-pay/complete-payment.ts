import { prisma } from "@/lib/prisma";
import {
  activateClientAfterRegistration,
  isRegistrationInvoice,
} from "@/lib/registration";

export async function completePayment(
  paymentId: string,
  gatewayPayload: Record<string, unknown>
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: { include: { client: true } } },
  });

  if (!payment) {
    return { ok: false as const, error: "Payment not found" };
  }

  if (payment.status === "COMPLETED") {
    let activatedUserId: string | undefined;
    if (isRegistrationInvoice(payment.invoice)) {
      const user = await prisma.user.findUnique({
        where: { id: payment.invoice.client.userId },
      });
      if (user && !user.isActive) {
        activatedUserId =
          (await activateClientAfterRegistration(payment.invoice.clientId)) ??
          undefined;
      }
    }
    return {
      ok: true as const,
      transactionId: payment.transactionId!,
      alreadyCompleted: true,
      activatedUserId,
    };
  }

  const invoice = payment.invoice;

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        gatewayResponse: JSON.stringify(gatewayPayload),
      },
    });

    const newPaid = invoice.paidAmount + payment.finalAmount;
    const newStatus =
      newPaid >= invoice.totalAmount - 0.01
        ? "PAID"
        : newPaid > 0
          ? "PARTIAL"
          : "PENDING";

    await tx.invoice.update({
      where: { id: invoice.id },
      data: { paidAmount: newPaid, status: newStatus },
    });

    if (payment.installmentId) {
      await tx.installment.update({
        where: { id: payment.installmentId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    if (payment.couponId) {
      await tx.coupon.update({
        where: { id: payment.couponId },
        data: { usedCount: { increment: 1 } },
      });
    }
  });

  let activatedUserId: string | undefined;
  if (isRegistrationInvoice(invoice)) {
    activatedUserId =
      (await activateClientAfterRegistration(invoice.clientId)) ?? undefined;
  }

  return {
    ok: true as const,
    transactionId: payment.transactionId!,
    finalAmount: payment.finalAmount,
    discountAmount: payment.discountAmount,
    activatedUserId,
  };
}
