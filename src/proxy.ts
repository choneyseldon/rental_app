import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic guard only: it redirects obvious anonymous traffic away from
 * /admin without reading the database. The real check lives in the admin
 * layout and in every server action, because proxy runs on prefetches too
 * and must stay cheap.
 */
export default function proxy(request: NextRequest) {
  const hasCookie = request.cookies.has("admin_session");
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    if (hasCookie) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }
    return NextResponse.next();
  }

  if (!hasCookie) {
    return NextResponse.redirect(new URL("/admin/login", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
