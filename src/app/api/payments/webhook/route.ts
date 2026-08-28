import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { completePayment } from "@/lib/netzor-pay/complete-payment";
import {
  getRazorpayKeys,
  verifyRazorpayWebhookSignature,
} from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const { webhookSecret } = getRazorpayKeys();

    if (webhookSecret && signature) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const paymentId =
      paymentEntity?.notes?.paymentId || orderEntity?.notes?.paymentId;
    const razorpayPaymentId = paymentEntity?.id;
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

    if (event === "payment.captured" || event === "order.paid") {
      let targetPayment = null;

      if (paymentId) {
        targetPayment = await prisma.payment.findUnique({
          where: { id: paymentId },
        });
      }

      if (!targetPayment && razorpayOrderId) {
        targetPayment = await prisma.payment.findFirst({
          where: {
            gatewayResponse: { contains: razorpayOrderId },
          },
        });
      }

      if (targetPayment && targetPayment.status !== "COMPLETED") {
        if (razorpayPaymentId) {
          await prisma.payment.update({
            where: { id: targetPayment.id },
            data: { transactionId: razorpayPaymentId },
          });
        }

        await completePayment(targetPayment.id, {
          webhook_event: event,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_order_id: razorpayOrderId,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Webhook handler error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
