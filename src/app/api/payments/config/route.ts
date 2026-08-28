import { NextResponse } from "next/server";
import { getRazorpayKeys, isRazorpayConfigured } from "@/lib/razorpay";

export async function GET() {
  const { keyId } = getRazorpayKeys();
  const configured = isRazorpayConfigured();

  return NextResponse.json({
    provider: configured ? "razorpay" : "simulated",
    keyId: configured ? keyId : null,
  });
}
