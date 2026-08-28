import { NextResponse, NextRequest } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await destroySession();
  const origin = request.headers.get("origin") || request.nextUrl.origin || "/";
  return NextResponse.redirect(new URL("/", origin));
}

