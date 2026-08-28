import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCoupon } from "@/lib/actions/admin";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Coupon codes</h2>

      <Card>
        <CardHeader>
          <CardTitle>Create coupon</CardTitle>
        </CardHeader>
        <form action={createCoupon} className="grid gap-4 sm:grid-cols-2">
          <Input label="Code" name="code" placeholder="SAVE20" required />
          <Input label="Description" name="description" />
          <Input label="Discount %" name="discountPercent" type="number" />
          <Input label="Flat discount $" name="discountAmount" type="number" />
          <Input label="Min order $" name="minOrderAmount" type="number" defaultValue="0" />
          <Input label="Max uses" name="maxUses" type="number" />
          <Button type="submit">Create</Button>
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left pb-2">Code</th>
                <th className="text-left pb-2">Discount</th>
                <th className="text-left pb-2">Used</th>
                <th className="text-left pb-2">Active</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border/40">
                  <td className="py-2 font-mono">{c.code}</td>
                  <td>
                    {c.discountPercent
                      ? `${c.discountPercent}%`
                      : c.discountAmount
                        ? `$${c.discountAmount}`
                        : "—"}
                  </td>
                  <td>
                    {c.usedCount}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td>{c.isActive ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
