import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createInvoice } from "@/lib/actions/admin";

export default async function AdminPaymentsPage() {
  const [payments, invoices, clients] = await Promise.all([
    prisma.payment.findMany({
      include: { invoice: { include: { client: { include: { user: true } } } }, coupon: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.invoice.findMany({
      include: { client: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientProfile.findMany({ include: { user: true } }),
  ]);

  const received = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + p.finalAmount, 0);
  const pending = invoices.reduce(
    (s, i) => s + (i.totalAmount - i.paidAmount),
    0
  );

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Payment tracking</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">Received</p>
          <p className="text-2xl font-bold text-success">{formatCurrency(received)}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Pending</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(pending)}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create invoice with installments</CardTitle>
        </CardHeader>
        <form action={createInvoice} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted">Client</label>
            <select
              name="clientId"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user.name}
                </option>
              ))}
            </select>
          </div>
          <Input label="Title" name="title" required />
          <Input label="Total amount" name="totalAmount" type="number" required />
          <Button type="submit">Create invoice</Button>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-muted text-left border-b border-border">
                <th className="pb-2">Date</th>
                <th className="pb-2">Client</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Coupon</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border/40">
                  <td className="py-2">{formatDate(p.createdAt)}</td>
                  <td>{p.invoice.client.user.name}</td>
                  <td>{formatCurrency(p.finalAmount)}</td>
                  <td>{p.coupon?.code ?? "—"}</td>
                  <td>
                    <Badge status={p.status}>{p.status.toLowerCase()}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
