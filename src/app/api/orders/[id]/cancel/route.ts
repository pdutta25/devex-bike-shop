import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isOwnerOrAdmin } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
  }

  const order = db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // SECURITY (V-06): Verify the requester owns this order or is admin
  if (!isOwnerOrAdmin(request, order.customerId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status === "delivered" || order.status === "cancelled") {
    return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 });
  }

  const result = db
    .update(orders)
    .set({ status: "cancelled", paymentStatus: "refunded", updatedAt: new Date().toISOString() })
    .where(eq(orders.id, orderId))
    .returning()
    .get();

  return NextResponse.json(result);
}
