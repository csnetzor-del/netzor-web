import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppUrl().replace(/\/$/, "");
  const now = new Date();

  const routes: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> =
    [
      { path: "/", priority: 1.0, changeFrequency: "weekly" },
      { path: "/services", priority: 0.9, changeFrequency: "weekly" },
      { path: "/about", priority: 0.6, changeFrequency: "monthly" },
      { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
      { path: "/auth/signin", priority: 0.2, changeFrequency: "yearly" },
      { path: "/auth/signup", priority: 0.2, changeFrequency: "yearly" },
    ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}

