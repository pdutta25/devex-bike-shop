import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function getCart(sessionId: string) {
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      selectedSize: cartItems.selectedSize,
      selectedColor: cartItems.selectedColor,
      productName: products.name,
      productSlug: products.slug,
      productImage: products.imageUrl,
      price: products.price,
      stockQuantity: products.stockQuantity,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, itemCount };
}

export async function getCartItem(sessionId: string, productId: number, size?: string, color?: string) {
  const conditions = [
    eq(cartItems.sessionId, sessionId),
    eq(cartItems.productId, productId),
  ];

  if (size) conditions.push(eq(cartItems.selectedSize, size));
  if (color) conditions.push(eq(cartItems.selectedColor, color));

  return db.select().from(cartItems).where(and(...conditions)).get();
}
