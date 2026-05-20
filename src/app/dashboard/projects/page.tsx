import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Download } from "lucide-react";
import Link from "next/link";

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session?.clientProfileId) return null;

  const projects = await prisma.project.findMany({
    where: { clientId: session.clientProfileId },
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 3 },
      documents: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Projects</h2>
        <p className="text-muted text-sm mt-1">Status, updates, and documents</p>
      </div>

      <div className="space-y-6">
        {projects.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle>{p.title}</CardTitle>
                  <p className="text-sm text-muted mt-1">{p.description}</p>
                </div>
                <Badge status={p.status}>
                  {p.status.replace("_", " ").toLowerCase()}
                </Badge>
              </div>
            </CardHeader>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-muted mb-1">
                <span>Progress</span>
                <span>{p.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-elevated overflow-hidden">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            {(p.startDate || p.dueDate) && (
              <p className="text-xs text-muted mb-4">
                {p.startDate && `Started ${formatDate(p.startDate)}`}
                {p.dueDate && ` · Due ${formatDate(p.dueDate)}`}
              </p>
            )}

            <h4 className="text-sm font-medium mb-2">Recent updates</h4>
            <ul className="space-y-2 mb-6">
              {p.updates.map((u) => (
                <li key={u.id} className="text-sm border-l-2 border-accent/40 pl-3">
                  <span className="font-medium">{u.title}</span>
                  <p className="text-muted">{u.message}</p>
                  <p className="text-xs text-muted/70 mt-0.5">{formatDate(u.createdAt)}</p>
                </li>
              ))}
            </ul>

            {p.documents.length > 0 && (
              <>
                <h4 className="text-sm font-medium mb-2">Documents</h4>
                <ul className="space-y-2">
                  {p.documents.map((d) => (
                    <li key={d.id}>
                      <Link
                        href={d.fileUrl}
                        className="inline-flex items-center gap-2 text-sm text-accent-glow hover:underline"
                        target="_blank"
                      >
                        <Download className="h-4 w-4" />
                        {d.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Card>
        ))}
        {projects.length === 0 && (
          <Card>
            <p className="text-muted text-sm">No projects yet. Your account manager will assign work soon.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
