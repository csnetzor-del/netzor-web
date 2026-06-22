import type { NextConfig } from "next";

function serverActionOrigins(): string[] {
  const hosts = new Set([
    "localhost:3000",
    "netzor.in",
    "www.netzor.in",
    "*.netzor.in",
  ]);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      hosts.add(new URL(appUrl).host);
    } catch {
      /* ignore invalid URL */
    }
  }
  if (process.env.VERCEL_URL) {
    hosts.add(process.env.VERCEL_URL);
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: serverActionOrigins(),
    },
  },
};

export default nextConfig;
