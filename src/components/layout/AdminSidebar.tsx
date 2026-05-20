"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  DollarSign,
  Briefcase,
  BarChart3,
  UserCog,
  Ticket,
  Tag,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/clients", label: "Clients", icon: Users },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
  { href: "/admin/staff", label: "Staff & Roles", icon: UserCog },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass hidden w-64 shrink-0 flex-col rounded-xl p-4 lg:flex">
      <div className="mb-2 px-2">
        <Logo size="md" href="/admin" />
        <span className="mt-1 block text-xs text-muted">Admin Console</span>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent/15 text-accent-glow"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/dashboard"
        className="mt-4 rounded-lg border border-border px-3 py-2 text-center text-xs text-muted hover:text-foreground"
      >
        View as client portal
      </Link>
    </aside>
  );
}
