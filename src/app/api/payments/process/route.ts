import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processNetzorPay } from "@/lib/payment-gateway";
import { z } from "zod";

const schema = z.object({
  invoiceId: z.string(),
  installmentId: z.string().optional(),
  amount: z.number().positive(),
  couponCode: z.string().optional(),
  cardLast4: z.string().length(4),
  cardBrand: z.string().optional(),
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
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const result = await processNetzorPay({
      invoiceId: body.invoiceId,
      installmentId: body.installmentId,
      amount: body.amount,
      couponCode: body.couponCode,
      cardLast4: body.cardLast4,
      cardBrand: body.cardBrand,
    });

    if (!result.success) {
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
