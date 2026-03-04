import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCart } from "@/lib/queries/cart-queries";
import { z } from "zod";

// SECURITY (V-15): Validate quantity input
const updateCartSchema = z.object({
  quantity: z.number().int().min(0).max(99),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cartItemId = Number(id);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return NextResponse.json({ error: "Invalid cart item ID" }, { status: 400 });
  }

  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const body = await request.json();
  const parsed = updateCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { quantity } = parsed.data;

  // Verify ownership: only modify cart items belonging to this session
  const ownershipCheck = and(eq(cartItems.id, cartItemId), eq(cartItems.sessionId, sessionId));

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
  const cartItemId = Number(id);

  if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
    return NextResponse.json({ error: "Invalid cart item ID" }, { status: 400 });
  }

  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  // Verify ownership: only delete cart items belonging to this session
  db.delete(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.sessionId, sessionId)))
    .run();
  return NextResponse.json({ success: true });
}
