import { NextRequest } from "next/server";

const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

/**
 * Check if a request is authorized for admin/write operations.
 * In development, all requests are allowed.
 * In production, requires x-admin-key header matching ADMIN_API_KEY env var.
 */
export function isAdminAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const key = request.headers.get("x-admin-key") || "";
  return ADMIN_KEY.length > 0 && key === ADMIN_KEY;
}
