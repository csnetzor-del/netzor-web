import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, FolderKanban, Ticket } from "lucide-react";

export default async function AdminDashboardPage() {
  const [clients, projects, payments, tickets] = await Promise.all([
    prisma.clientProfile.count(),
    prisma.project.count(),
    prisma.payment.aggregate({
      _sum: { finalAmount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.ticket.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const pendingInvoices = await prisma.invoice.aggregate({
    _sum: { totalAmount: true, paidAmount: true },
  });
  const pending =
    (pendingInvoices._sum.totalAmount ?? 0) -
    (pendingInvoices._sum.paidAmount ?? 0);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Dashboard overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <Users className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{clients}</p>
          <p className="text-sm text-muted">Clients</p>
        </Card>
        <Card>
          <FolderKanban className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{projects}</p>
          <p className="text-sm text-muted">Projects</p>
        </Card>
        <Card>
          <DollarSign className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">
            {formatCurrency(payments._sum.finalAmount ?? 0)}
          </p>
          <p className="text-sm text-muted">Received payments</p>
        </Card>
        <Card>
          <Ticket className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{tickets}</p>
          <p className="text-sm text-muted">Open tickets</p>
        </Card>
      </div>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Pending receivables</CardTitle>
        </CardHeader>
        <p className="text-3xl font-bold text-warning">{formatCurrency(pending)}</p>
      </Card>
    </div>
  );
}
