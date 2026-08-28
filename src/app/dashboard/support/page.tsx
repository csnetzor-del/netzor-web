import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createTicket, replyToTicket } from "@/lib/actions/support";

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ ticket?: string }>;
}) {
  const session = await getSession();
  if (!session?.clientProfileId) return null;

  const params = await searchParams;
  const tickets = await prisma.ticket.findMany({
    where: { clientId: session.clientProfileId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, include: { user: true } },
      assignedTo: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const selected = params.ticket
    ? tickets.find((t) => t.id === params.ticket)
    : tickets[0];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Customer support</h2>
        <p className="text-muted text-sm mt-1">Raise issues and track responses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New ticket</CardTitle>
        </CardHeader>
        <form action={createTicket} className="space-y-4">
          <Input label="Subject" name="subject" required />
          <div>
            <label className="block text-sm text-muted mb-1.5">Message</label>
            <textarea
              name="message"
              rows={4}
              required
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">Priority</label>
            <select
              name="priority"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <Button type="submit">Submit ticket</Button>
        </form>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {tickets.map((t) => (
            <a
              key={t.id}
              href={`/dashboard/support?ticket=${t.id}`}
              className={`block rounded-lg border p-4 transition-colors ${
                selected?.id === t.id
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/40"
              }`}
            >
              <p className="font-medium text-sm">{t.subject}</p>
              <div className="mt-2 flex gap-2">
                <Badge status={t.status}>{t.status.replace("_", " ").toLowerCase()}</Badge>
              </div>
            </a>
          ))}
        </div>

        {selected && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{selected.subject}</CardTitle>
              <p className="text-xs text-muted">
                {selected.assignedTo
                  ? `Assigned to ${selected.assignedTo.name}`
                  : "Awaiting assignment"}
              </p>
            </CardHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
              {selected.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-lg p-3 text-sm ${
                    m.isStaff
                      ? "bg-accent/10 ml-4"
                      : "bg-surface-elevated mr-4"
                  }`}
                >
                  <p className="text-xs text-muted mb-1">
                    {m.user.name} · {formatDate(m.createdAt)}
                  </p>
                  <p>{m.message}</p>
                </div>
              ))}
            </div>
            <form action={replyToTicket} className="flex gap-2">
              <input type="hidden" name="ticketId" value={selected.id} />
              <input
                name="message"
                required
                placeholder="Reply…"
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
