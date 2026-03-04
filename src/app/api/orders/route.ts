import { NextRequest, NextResponse } from "next/server";
import { getOrders } from "@/lib/queries/order-queries";
import { getAuthenticatedCustomerId, isAdminAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const requestedCustomerId = params.get("customer_id") ? Number(params.get("customer_id")) : undefined;

  // SECURITY (V-07): Non-admin users can only view their own orders
  const isAdmin = isAdminAuthorized(request);
  const authenticatedId = getAuthenticatedCustomerId(request);

  if (!isAdmin) {
    // Must provide a customer_id and it must match the authenticated user
    if (!requestedCustomerId || !authenticatedId || requestedCustomerId !== authenticatedId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const page = params.get("page") ? Number(params.get("page")) : 1;
  const limit = params.get("limit") ? Number(params.get("limit")) : 20;

  const filters = {
    customerId: isAdmin ? requestedCustomerId : authenticatedId!,
    status: params.get("status") || undefined,
    page: Math.max(1, page),
    limit: Math.min(Math.max(1, limit), 100),
  };

  const result = await getOrders(filters);
  return NextResponse.json(result);
}
