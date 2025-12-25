import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes/assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/css") ||
    pathname.startsWith("/js") ||
    pathname.startsWith("/api/unlock")
  ) {
    return NextResponse.next();
  }

  const unlocked = req.cookies.get("sakura_unlocked")?.value === "1";

  // ✅ Protect these routes (countdown + book)
  if ((pathname.startsWith("/countdown") || pathname.startsWith("/book")) && !unlocked) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth";
    req.cookies.clear();
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/countdown/:path*", "/book/:path*"],
};
