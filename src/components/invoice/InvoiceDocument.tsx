"use client";

import Link from "next/link";
import { formatRupee, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Printer, ArrowLeft, ShieldCheck, CheckCircle2, Building, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export interface InvoiceData {
  id: string;
  invoiceNo: string;
  title: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  createdAt: string | Date;
  dueDate?: string | Date | null;
  client: {
    clientCode: string;
    companyName?: string | null;
    phone?: string | null;
    address?: string | null;
    user: {
      name: string;
      email: string;
    };
  };
  installments?: Array<{
    id: string;
    label: string;
    amount: number;
    dueDate: string | Date;
    status: string;
    paidAt?: string | Date | null;
  }>;
  payments?: Array<{
    id: string;
    amount: number;
    discountAmount: number;
    finalAmount: number;
    status: string;
    method: string;
    transactionId?: string | null;
    createdAt: string | Date;
  }>;
}

export function InvoiceDocument({ invoice }: { invoice: InvoiceData }) {
  const isPaid = invoice.status === "PAID" || invoice.paidAmount >= invoice.totalAmount - 0.01;
  const balance = Math.max(0, invoice.totalAmount - invoice.paidAmount);
  const latestPayment = invoice.payments?.[0];

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-surface border border-border">
        <Link href="/dashboard/billing">
          <Button variant="secondary" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Billing
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print / Download PDF
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="print-card rounded-2xl bg-surface p-8 sm:p-12 border border-border shadow-xl text-foreground">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-border pb-8">
          <div>
            <div className="mb-2">
              <Logo size="lg" href={null} />
            </div>
            <p className="text-xs text-muted max-w-xs mt-1">
              NETZOR Technologies & Digital Solutions
            </p>
            <p className="text-xs text-muted">support@netzor.in · https://netzor.in</p>
          </div>

          <div className="sm:text-right">
            <div className="inline-block">
              <h1 className="text-2xl font-bold tracking-tight">TAX INVOICE</h1>
              <p className="text-sm font-semibold text-accent mt-0.5">{invoice.invoiceNo}</p>
            </div>
            <div className="mt-3 text-xs space-y-1 text-muted">
              <div>
                <span className="font-medium text-foreground">Invoice Date: </span>
                {formatDate(invoice.createdAt)}
              </div>
              {invoice.dueDate && (
                <div>
                  <span className="font-medium text-foreground">Due Date: </span>
                  {formatDate(invoice.dueDate)}
                </div>
              )}
              <div className="pt-1">
                <Badge status={invoice.status}>{invoice.status.toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Billed To (Client Info) */}
        <div className="grid sm:grid-cols-2 gap-8 py-8 border-b border-border text-sm">
          <div>
            <h3 className="text-xs uppercase font-semibold text-muted tracking-wider mb-3">
              Billed To (Client Details)
            </h3>
            <p className="text-base font-bold text-foreground">
              {invoice.client.user.name}
            </p>
            {invoice.client.companyName && (
              <p className="text-sm text-foreground flex items-center gap-1.5 mt-1 font-medium">
                <Building className="h-3.5 w-3.5 text-muted" />
                {invoice.client.companyName}
              </p>
            )}
            <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5 text-muted" />
              {invoice.client.user.email}
            </p>
            {invoice.client.phone && (
              <p className="text-xs text-muted flex items-center gap-1.5 mt-1">
                <Phone className="h-3.5 w-3.5 text-muted" />
                {invoice.client.phone}
              </p>
            )}
            {invoice.client.address && (
              <p className="text-xs text-muted flex items-start gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 text-muted shrink-0 mt-0.5" />
                <span>{invoice.client.address}</span>
              </p>
            )}
            <p className="text-xs text-muted mt-2">
              <span className="font-semibold text-foreground">Client Code: </span>
              {invoice.client.clientCode}
            </p>
          </div>

          <div className="sm:text-right flex flex-col justify-between">
            <div>
              <h3 className="text-xs uppercase font-semibold text-muted tracking-wider mb-3">
                Payment Verification
              </h3>
              {isPaid ? (
                <div className="inline-flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20 text-success text-xs font-semibold">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <div>Payment Verified & Settled</div>
                    {latestPayment?.transactionId && (
                      <div className="text-[11px] font-mono text-muted font-normal">
                        Txn ID: {latestPayment.transactionId}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-warning font-medium">
                  Payment is currently pending / partial.
                </div>
              )}
            </div>

            {latestPayment?.createdAt && (
              <p className="text-xs text-muted mt-4">
                Last payment received on {formatDate(latestPayment.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-muted font-semibold">
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              <tr>
                <td className="py-4">
                  <div className="font-semibold text-foreground">{invoice.title}</div>
                  <div className="text-xs text-muted mt-0.5">
                    Official Services and Project Billing
                  </div>
                </td>
                <td className="py-4 text-right font-medium">
                  {formatRupee(invoice.totalAmount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Breakdown */}
        <div className="border-t border-border pt-6 flex justify-end">
          <div className="w-full sm:w-72 space-y-2.5 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span>{formatRupee(invoice.totalAmount)}</span>
            </div>

            <div className="flex justify-between text-success">
              <span>Total Paid:</span>
              <span>{formatRupee(invoice.paidAmount)}</span>
            </div>

            <div className="flex justify-between font-bold text-base pt-3 border-t border-border">
              <span>Balance Due:</span>
              <span className={balance > 0 ? "text-danger" : "text-success"}>
                {formatRupee(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History Log */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-xs uppercase font-semibold text-muted tracking-wider mb-3">
              Payment Transactions & Receipts
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="text-muted border-b border-border/80">
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Transaction / Payment ID</th>
                    <th className="pb-2">Method</th>
                    <th className="pb-2 text-right">Amount</th>
                    <th className="pb-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {invoice.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 text-muted">{formatDate(p.createdAt)}</td>
                      <td className="py-2.5 font-mono text-[11px]">
                        {p.transactionId || p.id}
                      </td>
                      <td className="py-2.5 capitalize">{p.method.replace(/_/g, " ")}</td>
                      <td className="py-2.5 text-right font-medium">
                        {formatRupee(p.finalAmount)}
                      </td>
                      <td className="py-2.5 text-right">
                        <Badge status={p.status}>{p.status.toLowerCase()}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Notes */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <span>This is a computer-generated tax invoice verified digitally.</span>
          </div>
          <div>Thank you for choosing NETZOR!</div>
        </div>
      </div>
    </div>
  );
}
