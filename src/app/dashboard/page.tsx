import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRupee, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FolderKanban, CreditCard, MessageSquare } from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session?.clientProfileId) return null;

  const [projects, invoices, tickets] = await Promise.all([
    prisma.project.findMany({
      where: { clientId: session.clientProfileId },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.invoice.findMany({
      where: { clientId: session.clientProfileId },
      include: { installments: true },
    }),
    prisma.ticket.findMany({
      where: { clientId: session.clientProfileId, status: { not: "CLOSED" } },
      take: 5,
    }),
  ]);

  const pendingTotal = invoices.reduce(
    (sum, inv) => sum + (inv.totalAmount - inv.paidAmount),
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Overview</h2>
        <p className="text-muted text-sm mt-1">Your projects, billing, and support at a glance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <FolderKanban className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{projects.length}</p>
          <p className="text-sm text-muted">Active projects</p>
        </Card>
        <Card>
          <CreditCard className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{formatRupee(pendingTotal)}</p>
          <p className="text-sm text-muted">Outstanding balance</p>
        </Card>
        <Card>
          <MessageSquare className="h-8 w-8 text-accent mb-2" />
          <p className="text-2xl font-bold">{tickets.length}</p>
          <p className="text-sm text-muted">Open tickets</p>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent projects</CardTitle>
          <Link href="/dashboard/projects">
            <Button variant="ghost" size="sm">View all</Button>
          </Link>
        </CardHeader>
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="text-xs text-muted">{p.progress}% complete</p>
              </div>
              <Badge status={p.status}>{p.status.replace("_", " ").toLowerCase()}</Badge>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted">No projects assigned yet.</p>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming installments</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {invoices.flatMap((inv) =>
            inv.installments
              .filter((i) => i.status === "PENDING")
              .map((i) => (
                <div key={i.id} className="flex justify-between text-sm">
                  <span>
                    {i.label} · due {formatDate(i.dueDate)}
                  </span>
                  <span className="font-medium">{formatRupee(i.amount)}</span>
                </div>
              ))
          )}
        </div>
        <Link href="/dashboard/billing" className="inline-block mt-4">
          <Button size="sm">Pay now</Button>
        </Link>
      </Card>
    </div>
  );
}
