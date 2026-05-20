import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { updateTicketAdmin } from "@/lib/actions/admin";
import { replyToTicket } from "@/lib/actions/support";

export default async function AdminTicketsPage() {
  const [tickets, staff] = await Promise.all([
    prisma.ticket.findMany({
      include: {
        client: { include: { user: true } },
        messages: { orderBy: { createdAt: "asc" }, take: 5 },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({ where: { role: { in: ["ADMIN", "STAFF"] } } }),
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Support tickets</h2>
      <div className="space-y-6">
        {tickets.map((t) => (
          <Card key={t.id}>
            <CardHeader>
              <div className="flex justify-between gap-2">
                <CardTitle>{t.subject}</CardTitle>
                <Badge status={t.status}>{t.status.replace("_", " ")}</Badge>
              </div>
              <p className="text-sm text-muted">{t.client.user.name}</p>
            </CardHeader>

            <form action={updateTicketAdmin} className="flex flex-wrap gap-3 mb-4">
              <input type="hidden" name="ticketId" value={t.id} />
              <select
                name="status"
                defaultValue={t.status}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                {["OPEN", "IN_PROGRESS", "WAITING_CLIENT", "RESOLVED", "CLOSED"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
              <select
                name="assignedToId"
                defaultValue={t.assignedToId ?? ""}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              >
                <option value="">Unassigned</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm">
                Update
              </Button>
            </form>

            <div className="text-sm text-muted mb-3 max-h-32 overflow-y-auto">
              {t.messages.map((m) => (
                <p key={m.id} className="mb-1">
                  {m.isStaff ? "[Staff]" : "[Client]"} {m.message.slice(0, 80)}…
                </p>
              ))}
            </div>

            <form action={replyToTicket} className="flex gap-2">
              <input type="hidden" name="ticketId" value={t.id} />
              <input
                name="message"
                placeholder="Staff reply…"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                required
              />
              <Button type="submit" size="sm">
                Reply
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
