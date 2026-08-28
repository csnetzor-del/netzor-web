import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { assertClientCanPayInvoice } from "@/lib/payment-access";
import { prisma } from "@/lib/prisma";
import { isRegistrationInvoice } from "@/lib/registration";
import { validateCoupon } from "@/lib/netzor-pay/coupons";
import {
  createRazorpayOrder,
  getRazorpayKeys,
  isRazorpayConfigured,
} from "@/lib/razorpay";
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

  try {
    const body = schema.parse(await request.json());
    const invoice = await prisma.invoice.findFirst({
      where: { id: body.invoiceId, clientId: session.clientProfileId },
      include: { installments: true, client: { include: { user: true } } },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const access = await assertClientCanPayInvoice(
      session.id,
      session.clientProfileId,
      invoice
    );
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const balance = invoice.totalAmount - invoice.paidAmount;
    if (body.amount <= 0 || body.amount > balance + 0.01) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    let couponId: string | undefined;

    if (body.couponCode) {
      if (isRegistrationInvoice(invoice)) {
        return NextResponse.json(
          { error: "Coupons cannot be used for registration fee" },
          { status: 400 }
        );
      }

      const couponResult = await validateCoupon(body.couponCode, body.amount);
      if (!couponResult.valid) {
        return NextResponse.json(
          { error: couponResult.error || "Invalid coupon" },
          { status: 400 }
        );
      }
      discountAmount = couponResult.discount ?? 0;
      couponId = couponResult.coupon?.id;
    }

    const finalAmount = Math.max(0, body.amount - discountAmount);

    if (finalAmount <= 0) {
      return NextResponse.json(
        { error: "Payable amount must be greater than 0" },
        { status: 400 }
      );
    }

    const isLive = isRazorpayConfigured();
    const { keyId } = getRazorpayKeys();

    const payment = await prisma.payment.create({
      data: {
        invoiceId: body.invoiceId,
        installmentId: body.installmentId,
        amount: body.amount,
        discountAmount,
        finalAmount,
        status: "PENDING",
        method: isLive ? "razorpay" : "netzor_pay_simulated",
        couponId,
      },
    });

    if (!isLive) {
      return NextResponse.json({
        simulated: true,
        paymentId: payment.id,
        finalAmount,
        discountAmount,
      });
    }

    const amountInPaise = Math.round(finalAmount * 100);
    const receiptId = `nzr_${invoice.invoiceNo.slice(-6)}_${payment.id.slice(-6)}`;

    const razorpayOrder = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        clientCode: invoice.client.clientCode,
        userEmail: invoice.client.user.email,
        userName: invoice.client.user.name,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        gatewayResponse: JSON.stringify({
          razorpay_order_id: razorpayOrder.id,
          order_created_at: razorpayOrder.created_at,
          status: razorpayOrder.status,
        }),
      },
    });

    return NextResponse.json({
      simulated: false,
      keyId,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment.id,
      finalAmount,
      discountAmount,
      customer: {
        name: invoice.client.user.name,
        email: invoice.client.user.email,
        phone: invoice.client.phone || "",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to initiate payment";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
