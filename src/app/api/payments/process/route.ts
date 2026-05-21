import { NextResponse } from "next/server";
import {
  buildSessionFromUser,
  createSession,
  getSession,
} from "@/lib/auth";
import { assertClientCanPayInvoice } from "@/lib/payment-access";
import { prisma } from "@/lib/prisma";
import { processNetzorPay } from "@/lib/payment-gateway";
import { isRegistrationInvoice } from "@/lib/registration";
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

    const access = await assertClientCanPayInvoice(
      session.id,
      session.clientProfileId,
      invoice
    );
    if (!access.ok) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    if (isRegistrationInvoice(invoice) && body.couponCode) {
      return NextResponse.json(
        { error: "Coupons cannot be used for registration" },
        { status: 400 }
      );
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

    if (isRegistrationInvoice(invoice)) {
      const fresh = await buildSessionFromUser(session.id);
      if (fresh?.isActive) await createSession(fresh);
    }

    return NextResponse.json({
      transactionId: result.transactionId,
      finalAmount: result.finalAmount,
      discountAmount: result.discountAmount,
      accountActivated: isRegistrationInvoice(invoice),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
