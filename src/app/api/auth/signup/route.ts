import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildSessionFromUser,
  createSession,
  hashPassword,
} from "@/lib/auth";
import { generateClientCode } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { createRegistrationInvoice } from "@/lib/registration";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(3),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      if (!existing.isActive) {
        const profile = await prisma.clientProfile.findUnique({
          where: { userId: existing.id },
        });
        if (profile) {
          const invoice = await createRegistrationInvoice(profile.id, profile.clientCode);
          const session = await buildSessionFromUser(existing.id, {
            allowInactive: true,
          });
          if (session) await createSession(session);
          return NextResponse.json({
            ok: true,
            redirect: "/auth/signup/payment",
            invoiceId: invoice.id,
            resumed: true,
          });
        }
      }
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(body.password);
    let clientCode = generateClientCode();
    while (await prisma.clientProfile.findUnique({ where: { clientCode } })) {
      clientCode = generateClientCode();
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: body.name,
        passwordHash,
        role: "CLIENT",
        isActive: false,
        clientProfile: {
          create: {
            companyName: body.companyName || null,
            phone: body.phone || null,
            address: body.address,
            clientCode,
          },
        },
      },
      include: { clientProfile: true },
    });

    const profile = user.clientProfile!;
    const invoice = await createRegistrationInvoice(profile.id, clientCode);

    const session = await buildSessionFromUser(user.id, { allowInactive: true });
    if (session) await createSession(session);
    await trackEvent("user_signup_pending", "/auth/signup", user.id);

    return NextResponse.json({
      ok: true,
      redirect: "/auth/signup/payment",
      invoiceId: invoice.id,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
