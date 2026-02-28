import { NextRequest } from "next/server";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

/**
 * Check if a request is authorized for admin/write operations.
 * In development, all requests are allowed.
 * In production, allows same-origin requests from the admin UI
 * or requests with a valid x-admin-key header.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;

  // Allow same-origin requests from the admin UI (browser navigation)
  const referer = request.headers.get("referer") || "";
  const host = request.headers.get("host") || "";
  if (host && referer.includes(host) && referer.includes("/admin")) {
    return true;
  }

  // Allow API key-based access
  const key = request.headers.get("x-admin-key") || "";
  return ADMIN_KEY.length > 0 && key === ADMIN_KEY;
}
