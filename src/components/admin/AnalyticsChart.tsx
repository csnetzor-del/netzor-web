"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function AnalyticsChart({
  data,
}: {
  data: { date: string; views: number }[];
}) {
  if (data.length === 0) {
    return <p className="text-sm text-muted">No analytics data yet.</p>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#8b9cc7" fontSize={11} />
          <YAxis stroke="#8b9cc7" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: "#151d35",
              border: "1px solid #1e2a4a",
              borderRadius: 8,
            }}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#60a5fa"
            fill="url(#colorViews)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
