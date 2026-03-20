import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("sb-access-token");

  const path = req.nextUrl.pathname;

  const isProtected =
    path.startsWith("/dashboard") || path.startsWith("/admin");

  const isAuthPage =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/signup");

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/auth/login",
    "/auth/signup",
  ],
};