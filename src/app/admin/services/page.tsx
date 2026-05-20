import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { upsertService } from "@/lib/actions/admin";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Service management</h2>

      <Card>
        <CardHeader>
          <CardTitle>Add service</CardTitle>
        </CardHeader>
        <form action={upsertService} className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" name="title" required />
          <Input label="Slug" name="slug" required />
          <Input label="Short description" name="shortDesc" className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="text-sm text-muted">Description</label>
            <textarea
              name="description"
              rows={3}
              required
              className="mt-1.5 w-full rounded-lg border border-border bg-surface px-3 py-2.5"
            />
          </div>
          <Input label="Icon (code|cloud|palette|headphones)" name="icon" defaultValue="code" />
          <Input label="Price from" name="priceFrom" type="number" />
          <Input label="Sort order" name="sortOrder" type="number" defaultValue="0" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isActive" defaultChecked />
            Active
          </label>
          <Button type="submit">Save service</Button>
        </form>
      </Card>

      <div className="grid gap-4">
        {services.map((s) => (
          <Card key={s.id}>
            <form action={upsertService} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={s.id} />
              <Input label="Title" name="title" defaultValue={s.title} />
              <Input label="Slug" name="slug" defaultValue={s.slug} />
              <Input label="Short" name="shortDesc" defaultValue={s.shortDesc ?? ""} />
              <Input label="Icon" name="icon" defaultValue={s.icon} />
              <Input label="Price" name="priceFrom" type="number" defaultValue={s.priceFrom ?? ""} />
              <Input label="Order" name="sortOrder" type="number" defaultValue={s.sortOrder} />
              <div className="sm:col-span-2">
                <textarea
                  name="description"
                  defaultValue={s.description}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="isActive" defaultChecked={s.isActive} />
                Active
              </label>
              <Button type="submit" size="sm">
                Update
              </Button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
