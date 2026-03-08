export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getCategoryPerformance } from "@/lib/queries/report-queries";
import { isAdminAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // SECURITY (V-09): Reports are admin-only
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getCategoryPerformance();
  return NextResponse.json(result);
}
