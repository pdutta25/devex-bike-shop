import { NextResponse } from "next/server";
import { getCategoryPerformance } from "@/lib/queries/report-queries";

export async function GET() {
  const result = await getCategoryPerformance();
  return NextResponse.json(result);
}
