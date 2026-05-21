import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/signin");
  if (session.role === "ADMIN" || session.role === "STAFF") redirect("/admin");
  if (session.role === "CLIENT" && !session.isActive) {
    redirect("/auth/signup/payment");
  }

  return (
    <div className="mesh-bg min-h-screen">
      <header className="border-b border-border bg-background/80 px-4 py-4 lg:hidden">
        <div className="flex items-center justify-between">
          <span className="font-semibold gradient-text">Netzor Portal</span>
          <form action="/api/auth/signout" method="POST">
            <Button variant="ghost" size="sm" type="submit">
              Sign out
            </Button>
          </form>
        </div>
        <nav className="mt-3 flex gap-2 overflow-x-auto text-xs">
          {[
            ["/dashboard", "Home"],
            ["/dashboard/projects", "Projects"],
            ["/dashboard/billing", "Billing"],
            ["/dashboard/support", "Support"],
            ["/dashboard/profile", "Profile"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="whitespace-nowrap rounded-lg bg-surface px-3 py-1.5 text-muted"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">
          <div className="mb-6 hidden items-center justify-between lg:flex">
            <div>
              <p className="text-sm text-muted">Welcome back</p>
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
