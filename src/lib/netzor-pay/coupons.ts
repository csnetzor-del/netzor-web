import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export async function validateCoupon(code: string, amount: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive) {
    return { valid: false as const, error: "Invalid or inactive coupon code." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { valid: false as const, error: "This coupon has expired." };
  }

  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false as const, error: "Coupon usage limit reached." };
  }

  if (amount < coupon.minOrderAmount) {
    return {
      valid: false as const,
      error: `Minimum order amount is ${formatCurrency(coupon.minOrderAmount)}.`,
    };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = (amount * coupon.discountPercent) / 100;
  } else if (coupon.discountAmount) {
    discount = coupon.discountAmount;
  }

  discount = Math.min(discount, amount);

  return { valid: true as const, coupon, discount };
}
