import { NextResponse, NextRequest } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  await trackEvent("contact_form", "/contact", undefined, {
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    service: form.get("service"),
    message: String(form.get("message") || "").slice(0, 200),
  });
  const origin = request.headers.get("origin") || request.nextUrl.origin || "/";
  return NextResponse.redirect(new URL("/contact?sent=1", origin));
}

