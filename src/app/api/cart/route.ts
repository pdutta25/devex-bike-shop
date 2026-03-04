import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { getCart, getCartItem } from "@/lib/queries/cart-queries";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";

// SECURITY (V-14): Validate all cart inputs
const addToCartSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(99).default(1),
  selectedSize: z.string().max(10).optional(),
  selectedColor: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 });

  const cart = await getCart(sessionId);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const body = await request.json();
  const parsed = addToCartSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId, quantity, selectedSize, selectedColor } = parsed.data;

  const existing = await getCartItem(sessionId, productId, selectedSize, selectedColor);

  if (existing) {
    const newQty = Math.min(existing.quantity + quantity, 99);
    db.update(cartItems)
      .set({ quantity: newQty, updatedAt: new Date().toISOString() })
      .where(eq(cartItems.id, existing.id))
      .run();
  } else {
    db.insert(cartItems)
      .values({ sessionId, productId, quantity, selectedSize, selectedColor })
      .run();
  }

  const cart = await getCart(sessionId);
  return NextResponse.json(cart);
}
