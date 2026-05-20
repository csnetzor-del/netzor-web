import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "netzor_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-in-production-min-32-chars"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isAuthPage =
    pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup");

  if (!isProtected && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let session: { role?: string } | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      session = payload as { role?: string };
    } catch {
      session = null;
    }
  }

  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPage && session) {
    const url = request.nextUrl.clone();
    url.pathname =
      session.role === "ADMIN" || session.role === "STAFF"
        ? "/admin"
        : "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/signin", "/auth/signup"],
};
