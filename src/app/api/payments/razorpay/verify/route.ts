import { NextResponse } from "next/server";
import {
  buildSessionFromUser,
  createSession,
  getSession,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completePayment } from "@/lib/netzor-pay/complete-payment";
import { isRegistrationInvoice } from "@/lib/registration";
import {
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "@/lib/razorpay";
import { z } from "zod";

const schema = z.object({
  paymentId: z.string(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  simulated: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.clientProfileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());

    const payment = await prisma.payment.findUnique({
      where: { id: body.paymentId },
      include: { invoice: { include: { client: true } } },
    });

    if (!payment || payment.invoice.clientId !== session.clientProfileId) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    const isLive = isRazorpayConfigured();

    if (isLive && !body.simulated) {
      if (
        !body.razorpay_order_id ||
        !body.razorpay_payment_id ||
        !body.razorpay_signature
      ) {
        return NextResponse.json(
          { error: "Missing Razorpay verification tokens" },
          { status: 400 }
        );
      }

      const isValid = verifyRazorpaySignature({
        orderId: body.razorpay_order_id,
        paymentId: body.razorpay_payment_id,
        signature: body.razorpay_signature,
      });

      if (!isValid) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        });

        return NextResponse.json(
          { error: "Payment signature verification failed" },
          { status: 400 }
        );
      }

      // Update payment with the official transactionId from Razorpay
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          transactionId: body.razorpay_payment_id,
        },
      });

      const completed = await completePayment(payment.id, {
        razorpay_payment_id: body.razorpay_payment_id,
        razorpay_order_id: body.razorpay_order_id,
        razorpay_signature: body.razorpay_signature,
        verified_at: new Date().toISOString(),
      });

      if (!completed.ok) {
        return NextResponse.json({ error: completed.error }, { status: 400 });
      }

      if (isRegistrationInvoice(payment.invoice)) {
        const fresh = await buildSessionFromUser(session.id);
        if (fresh?.isActive) await createSession(fresh);
      }

      return NextResponse.json({
        success: true,
        transactionId: body.razorpay_payment_id,
        finalAmount: completed.finalAmount,
        discountAmount: completed.discountAmount,
        accountActivated: isRegistrationInvoice(payment.invoice),
      });
    }

    // Simulated fallback flow
    const completed = await completePayment(payment.id, {
      channel: "netzor_pay_simulated",
      timestamp: new Date().toISOString(),
    });

    if (!completed.ok) {
      return NextResponse.json({ error: completed.error }, { status: 400 });
    }

    if (isRegistrationInvoice(payment.invoice)) {
      const fresh = await buildSessionFromUser(session.id);
      if (fresh?.isActive) await createSession(fresh);
    }

    return NextResponse.json({
      success: true,
      transactionId: completed.transactionId,
      finalAmount: completed.finalAmount,
      discountAmount: completed.discountAmount,
      accountActivated: isRegistrationInvoice(payment.invoice),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Verification failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
