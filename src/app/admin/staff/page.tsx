import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createStaffUser, removeStaffAccount } from "@/lib/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { getSession } from "@/lib/auth";

type Props = { searchParams: Promise<{ error?: string; removed?: string }> };

export default async function AdminStaffPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await getSession();
  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    include: { staffProfile: true },
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = session?.role === "ADMIN";

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Staff & role management</h2>

      {params.removed ? (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Staff member removed successfully.
        </p>
      ) : null}
      {params.error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {decodeURIComponent(params.error)}
        </p>
      ) : null}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Add staff member</CardTitle>
          </CardHeader>
          <form action={createStaffUser} className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" name="name" required />
            <Input label="Email" name="email" type="email" required />
            <Input label="Password" name="password" required />
            <Input label="Department" name="department" />
            <div>
              <label className="text-sm text-muted">Role</label>
              <select
                name="role"
                className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <Input
              label="Permissions (JSON array)"
              name="permissions"
              defaultValue='["clients.view","projects.edit","tickets.manage"]'
              className="sm:col-span-2"
            />
            <Button type="submit">Create staff</Button>
          </form>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All staff & admins</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left pb-2 pr-4">Name</th>
                <th className="text-left pb-2 pr-4">Email</th>
                <th className="text-left pb-2 pr-4">Role</th>
                <th className="text-left pb-2 pr-4">Department</th>
                <th className="text-left pb-2 pr-4">Permissions</th>
                {isAdmin ? <th className="text-left pb-2">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b border-border/40">
                  <td className="py-2 pr-4">{u.name}</td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role}</td>
                  <td className="py-2 pr-4">{u.staffProfile?.department ?? "—"}</td>
                  <td className="py-2 pr-4 font-mono text-xs max-w-xs truncate">
                    {u.staffProfile?.permissions}
                  </td>
                  {isAdmin ? (
                    <td className="py-2">
                      {u.id === session?.id ? (
                        <span className="text-muted text-xs">You</span>
                      ) : (
                        <ConfirmDeleteButton
                          action={removeStaffAccount}
                          userId={u.id}
                          confirmMessage={`Remove ${u.name} (${u.role})? This cannot be undone.`}
                        />
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
            <p className="py-6 text-center text-muted">No staff members yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
