import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: ["Googlebot", "Google-InspectionTool", "GoogleOther"],
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api"],
      },
    ],
    sitemap: "https://www.netzor.in/sitemap.xml",
  };
}
