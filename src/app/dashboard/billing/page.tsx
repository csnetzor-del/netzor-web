import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRupee, formatDate } from "@/lib/utils";
import { NetzorPayCheckout } from "@/components/payment/NetzorPayCheckout";

export default async function BillingPage() {
  const session = await getSession();
  if (!session?.clientProfileId) return null;

  const invoices = await prisma.invoice.findMany({
    where: { clientId: session.clientProfileId },
    include: {
      installments: { orderBy: { dueDate: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });

  const firstPending = invoices
    .flatMap((inv) =>
      inv.installments
        .filter((i) => i.status === "PENDING")
        .map((i) => ({ inv, inst: i }))
    )[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Billing & payments</h2>
        <p className="text-muted text-sm mt-1">
          Invoices, installments, and secure Netzor Pay checkout
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {firstPending && (
          <NetzorPayCheckout
            invoiceId={firstPending.inv.id}
            installmentId={firstPending.inst.id}
            maxAmount={firstPending.inv.totalAmount - firstPending.inv.paidAmount}
            defaultAmount={firstPending.inst.amount}
          />
        )}

        <div className="space-y-6">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{inv.title}</CardTitle>
                    <p className="text-xs text-muted">{inv.invoiceNo}</p>
                  </div>
                  <Badge status={inv.status}>{inv.status.toLowerCase()}</Badge>
                </div>
              </CardHeader>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Total</span>
                  <span>{formatRupee(inv.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Paid</span>
                  <span className="text-success">{formatRupee(inv.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance</span>
                  <span>{formatRupee(inv.totalAmount - inv.paidAmount)}</span>
                </div>
              </div>

              <h4 className="text-sm font-medium mt-4 mb-2">Installments</h4>
              <ul className="space-y-2 text-sm">
                {inv.installments.map((i) => (
                  <li key={i.id} className="flex justify-between">
                    <span>{i.label}</span>
                    <span>
                      {formatRupee(i.amount)} ·{" "}
                      <Badge status={i.status}>{i.status.toLowerCase()}</Badge>
                    </span>
                  </li>
                ))}
              </ul>

              {inv.payments.length > 0 && (
                <>
                  <h4 className="text-sm font-medium mt-4 mb-2">Payment history</h4>
                  <ul className="space-y-1 text-xs text-muted">
                    {inv.payments.map((pay) => (
                      <li key={pay.id}>
                        {formatDate(pay.createdAt)} — {formatRupee(pay.finalAmount)}{" "}
                        {pay.transactionId && `(${pay.transactionId})`}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
