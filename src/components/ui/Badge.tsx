import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PLANNING: "bg-slate-500/20 text-slate-300",
  IN_PROGRESS: "bg-blue-500/20 text-blue-300",
  REVIEW: "bg-purple-500/20 text-purple-300",
  COMPLETED: "bg-green-500/20 text-green-300",
  ON_HOLD: "bg-amber-500/20 text-amber-300",
  PENDING: "bg-amber-500/20 text-amber-300",
  PARTIAL: "bg-blue-500/20 text-blue-300",
  PAID: "bg-green-500/20 text-green-300",
  OVERDUE: "bg-red-500/20 text-red-300",
  OPEN: "bg-blue-500/20 text-blue-300",
  IN_PROGRESS_TICKET: "bg-blue-500/20 text-blue-300",
  RESOLVED: "bg-green-500/20 text-green-300",
  CLOSED: "bg-slate-500/20 text-slate-300",
};

export function Badge({
  children,
  status,
  className,
}: {
  children: React.ReactNode;
  status?: string;
  className?: string;
}) {
  const key = status?.replace(" ", "_") || "";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        statusColors[key] || "bg-surface-elevated text-muted",
        className
      )}
    >
      {children}
    </span>
  );
}
