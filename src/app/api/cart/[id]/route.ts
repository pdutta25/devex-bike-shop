import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCart } from "@/lib/queries/cart-queries";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const { quantity } = await request.json();

  // Verify ownership: only modify cart items belonging to this session
  const ownershipCheck = and(eq(cartItems.id, Number(id)), eq(cartItems.sessionId, sessionId));

  if (quantity <= 0) {
    db.delete(cartItems).where(ownershipCheck).run();
  } else {
    db.update(cartItems)
      .set({ quantity, updatedAt: new Date().toISOString() })
      .where(ownershipCheck)
      .run();
  }

  const cart = await getCart(sessionId);
  return NextResponse.json(cart);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  // Verify ownership: only delete cart items belonging to this session
  db.delete(cartItems)
    .where(and(eq(cartItems.id, Number(id)), eq(cartItems.sessionId, sessionId)))
    .run();
  return NextResponse.json({ success: true });
}
