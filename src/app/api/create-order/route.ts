import { NextResponse } from "next/server";
import { createRazorpayOrder, getRazorpayKeys } from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let amountInPaise = body.amount;

    if (amountInPaise === undefined || amountInPaise === null) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    // If amount is passed in rupees (e.g. 500) vs paise (e.g. 50000)
    // Razorpay standard: >= 100 paise
    if (amountInPaise < 100 && amountInPaise > 0) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

    if (amountInPaise < 100) {
      return NextResponse.json(
        { error: "Minimum amount must be at least 100 paise (₹1.00)" },
        { status: 400 }
      );
    }

    const { keyId } = getRazorpayKeys();
    const order = await createRazorpayOrder({
      amount: amountInPaise,
      currency: body.currency || "INR",
      receipt: body.receipt || `rcpt_${Date.now()}`,
      notes: body.notes || {},
    });

    return NextResponse.json({
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
