import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { finalizeRazorpayPayment } from "@/lib/netzor-pay/razorpay";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  paymentId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.clientProfileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = schema.parse(await request.json());

    const payment = await prisma.payment.findFirst({
      where: {
        id: body.paymentId,
        invoice: { clientId: session.clientProfileId },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    const result = await finalizeRazorpayPayment({
      paymentId: body.paymentId,
      razorpayOrderId: body.razorpay_order_id,
      razorpayPaymentId: body.razorpay_payment_id,
      razorpaySignature: body.razorpay_signature,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      transactionId: result.transactionId,
      finalAmount: result.finalAmount,
      discountAmount: result.discountAmount,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
