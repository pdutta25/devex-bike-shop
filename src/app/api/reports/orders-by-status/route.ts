import { NextResponse } from "next/server";
import { getOrdersByStatus } from "@/lib/queries/report-queries";

export async function GET() {
  const result = await getOrdersByStatus();
  return NextResponse.json(result);
}
