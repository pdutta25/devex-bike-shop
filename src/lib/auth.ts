import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

/**
 * Check if a request is authorized for admin/write operations.
 * In development, all requests are allowed.
 * In production, requires a valid x-admin-key header.
 *
 * SECURITY: Removed Referer-based bypass (V-01) — Referer and Host
 * headers are attacker-controlled and trivially spoofable.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;

  // Require a valid API key — no header-sniffing fallbacks
  const key = request.headers.get("x-admin-key") || "";
  return ADMIN_KEY.length > 0 && key === ADMIN_KEY;
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
