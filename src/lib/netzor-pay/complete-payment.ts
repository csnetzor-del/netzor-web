import { prisma } from "@/lib/prisma";

export async function completePayment(
  paymentId: string,
  gatewayPayload: Record<string, unknown>
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { invoice: true },
  });

  if (!payment) {
    return { ok: false as const, error: "Payment not found" };
  }

  if (payment.status === "COMPLETED") {
    return {
      ok: true as const,
      transactionId: payment.transactionId!,
      alreadyCompleted: true,
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

  return {
    ok: true as const,
    transactionId: payment.transactionId!,
    finalAmount: payment.finalAmount,
    discountAmount: payment.discountAmount,
  };
}
