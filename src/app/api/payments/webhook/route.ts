import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/netzor-pay/razorpay";
import { completePayment } from "@/lib/netzor-pay/complete-payment";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody) as {
      event: string;
      payload?: {
        payment?: { entity?: { id: string; order_id: string; status: string } };
      };
    };

    if (event.event === "payment.captured") {
      const entity = event.payload?.payment?.entity;
      if (entity?.order_id) {
        const payments = await prisma.payment.findMany({
          where: { status: { in: ["PENDING", "PROCESSING"] } },
        });

        const match = payments.find((p) => {
          try {
            const g = JSON.parse(p.gatewayResponse || "{}") as {
              razorpay_order_id?: string;
            };
            return g.razorpay_order_id === entity.order_id;
          } catch {
            return false;
          }
        });

        if (match) {
          await completePayment(match.id, {
            provider: "razorpay_webhook",
            razorpay_order_id: entity.order_id,
            razorpay_payment_id: entity.id,
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("webhook", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
