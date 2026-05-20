import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createStaffUser } from "@/lib/actions/admin";
import { getSession } from "@/lib/auth";

export default async function AdminStaffPage() {
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
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead>
              <tr className="text-muted border-b border-border">
                <th className="text-left pb-2">Name</th>
                <th className="text-left pb-2">Email</th>
                <th className="text-left pb-2">Role</th>
                <th className="text-left pb-2">Department</th>
                <th className="text-left pb-2">Permissions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => (
                <tr key={u.id} className="border-b border-border/40">
                  <td className="py-2">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.staffProfile?.department ?? "—"}</td>
                  <td className="font-mono text-xs max-w-xs truncate">
                    {u.staffProfile?.permissions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
