import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { getAppUrl } from "@/lib/app-url";

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: "Netzor — IT Solutions & Client Portal",
  description:
    "Professional software development, cloud services, and secure client portal for projects, billing, and support.",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en">
      <body className="mesh-bg antialiased">
        <div data-session={session ? "1" : "0"}>{children}</div>
      </body>
    </html>
  );
}
