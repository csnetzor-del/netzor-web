import { NextResponse } from "next/server";
import { buildSessionFromUser, createSession, getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const fresh = await buildSessionFromUser(session.id, { allowInactive: true });
  if (!fresh) {
    return NextResponse.json({ error: "Account unavailable" }, { status: 403 });
  }

  await createSession(fresh);
  return NextResponse.json({ ok: true, isActive: fresh.isActive });
}
