import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { AnalyticsChart } from "@/components/admin/AnalyticsChart";

export default async function AdminAnalyticsPage() {
  const events = await prisma.analyticsEvent.findMany({
    where: { type: "page_view" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const byPath: Record<string, number> = {};
  const byDay: Record<string, number> = {};

  for (const e of events) {
    const path = e.path || "/";
    byPath[path] = (byPath[path] || 0) + 1;
    const day = e.createdAt.toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  const chartData = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, views]) => ({ date, views }));

  const logins = await prisma.analyticsEvent.count({
    where: { type: "user_login" },
  });
  const signups = await prisma.analyticsEvent.count({
    where: { type: "user_signup" },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-muted">Page views</p>
          <p className="text-2xl font-bold">{events.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Logins</p>
          <p className="text-2xl font-bold">{logins}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted">Signups</p>
          <p className="text-2xl font-bold">{signups}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Traffic over time</CardTitle>
        </CardHeader>
        <AnalyticsChart data={chartData} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top pages</CardTitle>
        </CardHeader>
        <ul className="space-y-2 text-sm">
          {Object.entries(byPath)
            .sort(([, a], [, b]) => b - a)
            .map(([path, count]) => (
              <li key={path} className="flex justify-between">
                <span className="text-muted">{path}</span>
                <span>{count}</span>
              </li>
            ))}
        </ul>
      </Card>
    </div>
  );
}
