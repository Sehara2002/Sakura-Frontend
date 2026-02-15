import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_PREFIXES = [
  "/",
  "/home",
  "/403",
  "/api/stats",
  "/_next",
  "/images",
  "/js",
  "/css",
  "/books",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isAllowedPath(pathname)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/403";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/:path*"],
};
