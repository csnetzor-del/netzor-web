import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildSessionFromUser,
  createSession,
  hashPassword,
} from "@/lib/auth";
import { generateClientCode } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().optional(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const email = body.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
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
        clientProfile: {
          create: {
            companyName: body.companyName,
            phone: body.phone,
            clientCode,
          },
        },
      },
    });

    const session = await buildSessionFromUser(user.id);
    if (session) await createSession(session);
    await trackEvent("user_signup", "/auth/signup", user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
