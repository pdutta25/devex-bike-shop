import { NextRequest, NextResponse } from "next/server";
import { getTopProducts } from "@/lib/queries/report-queries";
import { isAdminAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // SECURITY (V-09): Reports are admin-only
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
  // Cap limit to prevent unbounded queries
  const safeLim = Math.min(Math.max(1, limit), 100);
  const result = await getTopProducts(safeLim);
  return NextResponse.json(result);
}
