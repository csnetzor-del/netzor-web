import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Netzor — IT Solutions & Client Portal",
  description:
    "Professional software development, cloud services, and secure client portal for projects, billing, and support.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
