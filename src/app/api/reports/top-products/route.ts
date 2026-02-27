import { NextRequest, NextResponse } from "next/server";
import { getTopProducts } from "@/lib/queries/report-queries";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit")) || 10;
  const result = await getTopProducts(limit);
  return NextResponse.json(result);
}
