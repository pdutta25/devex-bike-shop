import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { getCart, getCartItem } from "@/lib/queries/cart-queries";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 });

  const cart = await getCart(sessionId);
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const { productId, quantity = 1, selectedSize, selectedColor } = await request.json();

  const existing = await getCartItem(sessionId, productId, selectedSize, selectedColor);

  if (existing) {
    db.update(cartItems)
      .set({ quantity: existing.quantity + quantity, updatedAt: new Date().toISOString() })
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
