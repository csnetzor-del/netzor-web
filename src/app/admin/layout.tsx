import { redirect } from "next/navigation";
import { getSession, canAccessAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Button } from "@/components/ui/Button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !canAccessAdmin(session.role)) {
    redirect("/auth/signin");
  }

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-8 sm:px-6">
        <AdminSidebar />
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Admin console</p>
              <h1 className="text-xl font-semibold">{session.name}</h1>
            </div>
            <form action="/api/auth/signout" method="POST">
              <Button variant="secondary" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
