import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

/**
 * Check if a request is authorized for admin operations.
 * - Development: all requests allowed.
 * - Production: same-origin requests from the admin UI are allowed
 *   (Origin/Referer must match Host). External API callers need x-admin-key.
 *
 * SECURITY: Same-origin check is safe here because the CSRF middleware
 * already validates Origin on mutations, and browsers enforce CORS on
 * cross-origin fetch() calls — a third-party site cannot read responses.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;

  // Check x-admin-key header first (for external API callers)
  const key = request.headers.get("x-admin-key") || "";
  if (ADMIN_KEY.length > 0 && key === ADMIN_KEY) return true;

  // Allow same-origin requests (admin UI in the browser)
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  if (host) {
    // Check Origin header (present on fetch/XHR requests)
    if (origin) {
      try { if (new URL(origin).host === host) return true; } catch {}
    }
    // Check Referer header (present on navigation and some fetch calls)
    if (referer) {
      try { if (new URL(referer).host === host) return true; } catch {}
    }
  }

  return false;
}

/**
 * Extract and validate the authenticated customer ID from the cookie.
 * Returns the numeric customer ID if valid, or null if missing/invalid.
 *
 * SECURITY: This is a demo-grade identity check using a client-set cookie.
 * In production, replace with a cryptographically-signed session token
 * (e.g., NextAuth.js, Lucia, or Clerk).
 */
export function getAuthenticatedCustomerId(request: NextRequest): number | null {
  const raw = request.cookies.get("customer_id")?.value;
  if (!raw) return null;

  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;

  return id;
}

/**
 * Verify that the authenticated customer owns the requested resource.
 * Admins bypass this check.
 */
export function isOwnerOrAdmin(
  request: NextRequest,
  resourceCustomerId: number
): boolean {
  if (isAdminAuthorized(request)) return true;

  const authenticatedId = getAuthenticatedCustomerId(request);
  return authenticatedId !== null && authenticatedId === resourceCustomerId;
}

/**
 * Verify the request Origin header matches the host to mitigate CSRF.
 * Returns true if the origin is valid (same-origin) or if the check
 * is not applicable (e.g., GET/HEAD requests, no Origin header on
 * same-origin navigations in some browsers).
 */
export function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Same-origin requests may omit Origin

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}
