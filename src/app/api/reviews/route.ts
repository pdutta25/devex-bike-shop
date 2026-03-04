import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getProductReviews } from "@/lib/queries/review-queries";
import { getAuthenticatedCustomerId } from "@/lib/auth";
import { z } from "zod";

// SECURITY (V-10): Review schema WITHOUT customerId — derived from session
const reviewInputSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("product_id");
  if (!productId) return NextResponse.json({ error: "product_id required" }, { status: 400 });

  const pid = Number(productId);
  if (!Number.isInteger(pid) || pid <= 0) {
    return NextResponse.json({ error: "Invalid product_id" }, { status: 400 });
  }

  const result = await getProductReviews(pid);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  // SECURITY (V-10): Derive customer ID from session, not request body
  const authenticatedId = getAuthenticatedCustomerId(request);
  if (!authenticatedId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const result = db.insert(reviews).values({
      ...parsed.data,
      customerId: authenticatedId, // Server-derived, not client-supplied
    }).returning().get();

    // Update product average rating and count
    const stats = db
      .select({
        avgRating: sql<number>`avg(${reviews.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, parsed.data.productId))
      .get();

    if (stats) {
      db.update(products)
        .set({
          averageRating: Math.round((stats.avgRating ?? 0) * 10) / 10,
          reviewCount: stats.count ?? 0,
        })
        .where(eq(products.id, parsed.data.productId))
        .run();
    }

    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already reviewed this product" }, { status: 409 });
  }
}
