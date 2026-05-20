import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  buildSessionFromUser,
  createSession,
  verifyPassword,
} from "@/lib/auth";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const session = await buildSessionFromUser(user.id);
    if (!session) {
      return NextResponse.json({ error: "Account unavailable" }, { status: 403 });
    }

    await createSession(session);
    await trackEvent("user_login", "/auth/signin", user.id);

    const redirect =
      user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/dashboard";

    return NextResponse.json({ ok: true, redirect });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
