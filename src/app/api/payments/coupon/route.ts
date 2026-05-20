import { NextResponse } from "next/server";
import { previewCoupon } from "@/lib/payment-gateway";
import { z } from "zod";

const schema = z.object({
  code: z.string().min(1),
  amount: z.number().positive(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const result = await previewCoupon(body.code, body.amount);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      discount: result.discount,
      message: result.coupon?.description,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
