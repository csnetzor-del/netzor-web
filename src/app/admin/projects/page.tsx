import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  createProject,
  updateProjectStatus,
  addProjectUpdate,
} from "@/lib/actions/admin";

export default async function AdminProjectsPage() {
  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      include: { client: { include: { user: true } }, updates: { take: 1, orderBy: { createdAt: "desc" } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.clientProfile.findMany({ include: { user: true } }),
  ]);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Project updates</h2>

      <Card>
        <CardHeader>
          <CardTitle>New project</CardTitle>
        </CardHeader>
        <form action={createProject} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-muted">Client</label>
            <select
              name="clientId"
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.user.name} ({c.clientCode})
                </option>
              ))}
            </select>
          </div>
          <Input label="Title" name="title" required />
          <Input label="Description" name="description" className="sm:col-span-2" />
          <Button type="submit">Create project</Button>
        </form>
      </Card>

      <div className="space-y-6">
        {projects.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-wrap justify-between gap-2 mb-4">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-muted">
                  {p.client.user.name} · {p.client.clientCode}
                </p>
              </div>
              <Badge status={p.status}>{p.status.replace("_", " ")}</Badge>
            </div>

            <form action={updateProjectStatus} className="flex flex-wrap gap-3 items-end mb-4">
              <input type="hidden" name="projectId" value={p.id} />
              <div>
                <label className="text-xs text-muted">Status</label>
                <select
                  name="status"
                  defaultValue={p.status}
                  className="mt-1 block rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  {["PLANNING", "IN_PROGRESS", "REVIEW", "COMPLETED", "ON_HOLD"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    )
                  )}
                </select>
              </div>
              <Input
                label="Progress %"
                name="progress"
                type="number"
                min={0}
                max={100}
                defaultValue={p.progress}
                className="w-24"
              />
              <Button type="submit" size="sm">
                Update status
              </Button>
            </form>

            <form action={addProjectUpdate} className="grid gap-2 sm:grid-cols-3 border-t border-border pt-4">
              <input type="hidden" name="projectId" value={p.id} />
              <Input label="Update title" name="title" required />
              <Input label="Message" name="message" className="sm:col-span-2" required />
              <Button type="submit" size="sm">
                Post update
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
