import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRupee, formatDate } from "@/lib/utils";
import { NetzorPayCheckout } from "@/components/payment/NetzorPayCheckout";
import { FileText, ExternalLink } from "lucide-react";

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

  const firstPendingInvoice = invoices.find(
    (inv) => inv.status !== "PAID" && inv.totalAmount - inv.paidAmount > 0
  );
  const pendingInstallment = firstPendingInvoice?.installments.find(
    (i) => i.status === "PENDING"
  );
  const remainingBalance = firstPendingInvoice
    ? firstPendingInvoice.totalAmount - firstPendingInvoice.paidAmount
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Billing & payments</h2>
        <p className="text-muted text-sm mt-1">
          Invoices and secure Razorpay checkout
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {firstPendingInvoice && (
          <NetzorPayCheckout
            invoiceId={firstPendingInvoice.id}
            installmentId={pendingInstallment?.id}
            maxAmount={remainingBalance}
            defaultAmount={remainingBalance}
          />
        )}

        <div className="space-y-6">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">{inv.title}</CardTitle>
                    <p className="text-xs text-muted font-mono">{inv.invoiceNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge status={inv.status}>{inv.status.toLowerCase()}</Badge>
                    <Link href={`/dashboard/billing/invoice/${inv.id}`}>
                      <Button variant="secondary" size="sm" className="h-7 text-xs px-2.5 flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Total</span>
                  <span>{formatRupee(inv.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Paid</span>
                  <span className="text-success font-medium">{formatRupee(inv.paidAmount)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Balance</span>
                  <span>{formatRupee(inv.totalAmount - inv.paidAmount)}</span>
                </div>
              </div>

              {inv.installments.length > 1 && (
                <>
                  <h4 className="text-xs font-semibold uppercase text-muted tracking-wider mt-4 mb-2">Installments</h4>
                  <ul className="space-y-2 text-sm">
                    {inv.installments.map((i) => (
                      <li key={i.id} className="flex justify-between items-center text-xs">
                        <span>{i.label}</span>
                        <span>
                          {formatRupee(i.amount)} ·{" "}
                          <Badge status={i.status}>{i.status.toLowerCase()}</Badge>
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {inv.payments.length > 0 && (
                <>
                  <h4 className="text-xs font-semibold uppercase text-muted tracking-wider mt-4 mb-2">Payment history</h4>
                  <ul className="space-y-1.5 text-xs text-muted">
                    {inv.payments.map((pay) => (
                      <li key={pay.id} className="flex justify-between items-center bg-surface p-1.5 rounded-lg border border-border/50">
                        <span>
                          {formatDate(pay.createdAt)} — {formatRupee(pay.finalAmount)}{" "}
                          {pay.transactionId && (
                            <span className="font-mono text-[10px] text-muted">({pay.transactionId})</span>
                          )}
                        </span>
                        <Link href={`/dashboard/billing/invoice/${inv.id}`} className="text-accent hover:underline flex items-center gap-0.5 text-[11px]">
                          Receipt <ExternalLink className="h-3 w-3" />
                        </Link>
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
