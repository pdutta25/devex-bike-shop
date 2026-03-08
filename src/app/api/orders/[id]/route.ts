export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getOrderById } from "@/lib/queries/order-queries";
import { isAdminAuthorized, isOwnerOrAdmin } from "@/lib/auth";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = await getOrderById(orderId);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // SECURITY (V-07): Verify the requester owns this order or is admin
  // getOrderById returns { order: <row>, customerFirstName, ... } spread with items
  if (!isOwnerOrAdmin(request, order.order.customerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const { status } = await request.json();

  // Validate status against allowed values
  if (!ORDER_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const result = db
    .update(orders)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(orders.id, orderId))
    .returning()
    .get();

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}
