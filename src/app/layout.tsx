import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Netzor — IT Solutions & Client Portal",
  description:
    "Professional software development, cloud services, and secure client portal for projects, billing, and support.",
  icons: {
    icon: "/logo-icon.png",
    apple: "/logo-icon.png",
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
