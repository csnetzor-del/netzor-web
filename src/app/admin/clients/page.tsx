import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClientAccount } from "@/lib/actions/admin";

function randomPassword() {
  return `Nz${Math.random().toString(36).slice(2, 10)}!9`;
}

export default async function AdminClientsPage() {
  const clients = await prisma.clientProfile.findMany({
    include: { user: true, _count: { select: { projects: true, invoices: true } } },
    orderBy: { createdAt: "desc" },
  });

  const suggestedPassword = randomPassword();

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Client management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Register client & generate credentials</CardTitle>
        </CardHeader>
        <form action={createClientAccount} className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" required />
          <Input label="Email (user ID)" name="email" type="email" required />
          <Input label="Company" name="companyName" />
          <Input
            label="Generated password"
            name="password"
            defaultValue={suggestedPassword}
            required
          />
          <div className="sm:col-span-2">
            <Button type="submit">Create client account</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All clients</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted border-b border-border">
                <th className="pb-3 pr-4">Code</th>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Projects</th>
                <th className="pb-3">Invoices</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="py-3 pr-4 font-mono text-accent-glow">{c.clientCode}</td>
                  <td className="py-3 pr-4">{c.user.name}</td>
                  <td className="py-3 pr-4">{c.user.email}</td>
                  <td className="py-3 pr-4">{c._count.projects}</td>
                  <td className="py-3">{c._count.invoices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
