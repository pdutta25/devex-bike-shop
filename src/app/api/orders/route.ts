import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/queries/order-queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters = {
    customerId: params.get("customer_id") ? Number(params.get("customer_id")) : undefined,
    status: params.get("status") || undefined,
    page: params.get("page") ? Number(params.get("page")) : 1,
    limit: params.get("limit") ? Number(params.get("limit")) : 20,
  };

  const result = await getOrders(filters);
  return NextResponse.json(result);
}
