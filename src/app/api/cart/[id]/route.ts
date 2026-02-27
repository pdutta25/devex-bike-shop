import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCart } from "@/lib/queries/cart-queries";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const { quantity } = await request.json();

  if (quantity <= 0) {
    db.delete(cartItems).where(eq(cartItems.id, Number(id))).run();
  } else {
    db.update(cartItems)
      .set({ quantity, updatedAt: new Date().toISOString() })
      .where(eq(cartItems.id, Number(id)))
      .run();
  }

  const cart = await getCart(sessionId);
  return NextResponse.json(cart);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(cartItems).where(eq(cartItems.id, Number(id))).run();
  return NextResponse.json({ success: true });
}
