import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { preparePaymentOrder } from "@/lib/netzor-pay/prepare-order";
import {
  createRazorpayOrder,
  getPublicKeyId,
  isRazorpayEnabled,
} from "@/lib/netzor-pay/razorpay";
import { z } from "zod";

const schema = z.object({
  invoiceId: z.string(),
  installmentId: z.string().optional(),
  amount: z.number().positive(),
  couponCode: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.clientProfileId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isRazorpayEnabled()) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Set NETZOR_PAY_PROVIDER=razorpay and API keys." },
      { status: 503 }
    );
  }

  try {
    const body = schema.parse(await request.json());
    const prepared = await preparePaymentOrder({
      ...body,
      clientProfileId: session.clientProfileId,
    });

    if (!prepared.ok) {
      return NextResponse.json({ error: prepared.error }, { status: 400 });
    }

    const razorpayOrder = await createRazorpayOrder({
      amountPaise: prepared.amountPaise,
      receipt: prepared.transactionId,
      notes: {
        paymentId: prepared.payment.id,
        invoiceId: body.invoiceId,
      },
    });

    const { prisma } = await import("@/lib/prisma");
    await prisma.payment.update({
      where: { id: prepared.payment.id },
      data: {
        status: "PROCESSING",
        gatewayResponse: JSON.stringify({
          razorpay_order_id: razorpayOrder.id,
        }),
      },
    });

    return NextResponse.json({
      keyId: getPublicKeyId(),
      razorpayOrderId: razorpayOrder.id,
      amount: prepared.amountPaise,
      currency: "INR",
      paymentId: prepared.payment.id,
      transactionId: prepared.transactionId,
      finalAmount: prepared.finalAmount,
      discountAmount: prepared.discountAmount,
      prefill: {
        name: session.name,
        email: session.email,
      },
    });
  } catch (err) {
    console.error("create-order", err);
    return NextResponse.json({ error: "Could not create payment order" }, { status: 500 });
  }
}
