import { NextRequest, NextResponse } from "next/server";
import { validateToken, ADMIN_COOKIE_NAME } from "@/lib/admin-session";

/**
 * Middleware handles two concerns:
 * 1. Admin authentication — protect /admin routes with session cookie
 * 2. CSRF protection (V-11) — validate Origin on mutating API requests
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin seed page protection (login required only for /admin/seed) ──
  if (pathname.startsWith("/admin/seed")) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const user = token ? await validateToken(token) : null;

    if (!user) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── CSRF protection for API routes (V-11) ──
  if (pathname.startsWith("/api")) {
    const method = request.method.toUpperCase();

    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      if (origin && host) {
        try {
          const originUrl = new URL(origin);
          if (originUrl.host !== host) {
            return NextResponse.json(
              { error: "Cross-origin request blocked" },
              { status: 403 }
            );
          }
        } catch {
          return NextResponse.json(
            { error: "Invalid origin" },
            { status: 403 }
          );
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  // Apply to admin pages and API routes
  matcher: ["/admin/:path*", "/api/:path*"],
};
