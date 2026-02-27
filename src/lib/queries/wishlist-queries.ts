import { db } from "@/lib/db";
import { wishlists, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function getWishlist(customerId: number) {
  return db
    .select({
      id: wishlists.id,
      productId: wishlists.productId,
      product: products,
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.customerId, customerId));
}

export async function isInWishlist(customerId: number, productId: number) {
  const result = db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.productId, productId)))
    .get();
  return !!result;
}
