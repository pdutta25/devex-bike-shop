import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = db.select().from(orders).where(eq(orders.id, Number(id))).get();
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (order.status === "delivered" || order.status === "cancelled") {
    return NextResponse.json({ error: "Cannot cancel this order" }, { status: 400 });
  }

  const result = db
    .update(orders)
    .set({ status: "cancelled", paymentStatus: "refunded", updatedAt: new Date().toISOString() })
    .where(eq(orders.id, Number(id)))
    .returning()
    .get();

  return NextResponse.json(result);
}
