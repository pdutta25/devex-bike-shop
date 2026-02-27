import { db } from "@/lib/db";
import { reviews, customers } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getProductReviews(productId: number) {
  return db
    .select({
      review: reviews,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(reviews)
    .leftJoin(customers, eq(reviews.customerId, customers.id))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt));
}

export async function getReviewStats(productId: number) {
  const result = await db
    .select({
      avgRating: sql<number>`avg(${reviews.rating})`,
      count: sql<number>`count(*)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .get();

  return {
    averageRating: result?.avgRating ?? 0,
    reviewCount: result?.count ?? 0,
  };
}
