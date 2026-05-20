import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: Request) {
  const form = await request.formData();
  await trackEvent("contact_form", "/contact", undefined, {
    name: form.get("name"),
    email: form.get("email"),
    phone: form.get("phone"),
    service: form.get("service"),
    message: String(form.get("message") || "").slice(0, 200),
  });
  return NextResponse.redirect(
    new URL("/contact?sent=1", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}
