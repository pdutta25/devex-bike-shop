import { NextRequest, NextResponse } from "next/server";
import { getRevenueOverTime } from "@/lib/queries/report-queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const period = (params.get("period") as "daily" | "weekly" | "monthly") || "daily";
  const startDate = params.get("start") || undefined;
  const endDate = params.get("end") || undefined;

  const result = await getRevenueOverTime(period, startDate, endDate);
  return NextResponse.json(result);
}
