import { NextRequest, NextResponse } from "next/server";

/**
 * SECURITY (V-11): CSRF protection middleware.
 *
 * Validates the Origin header on all state-changing requests (POST, PUT, DELETE, PATCH)
 * to ensure they originate from the same site. Blocks cross-origin mutation attempts.
 */
export function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();

  // Only check mutating methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    // If Origin header is present, it must match the host
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

  return NextResponse.next();
}

export const config = {
  // Apply to all API routes
  matcher: "/api/:path*",
};
