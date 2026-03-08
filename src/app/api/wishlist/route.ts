export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getWishlist } from "@/lib/queries/wishlist-queries";
import { getAuthenticatedCustomerId } from "@/lib/auth";
import { z } from "zod";

const wishlistSchema = z.object({
  productId: z.number().int().positive(),
});

export async function GET(request: NextRequest) {
  // SECURITY (V-08): Derive customer ID from session, not query params
  const authenticatedId = getAuthenticatedCustomerId(request);
  if (!authenticatedId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const result = await getWishlist(authenticatedId);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  // SECURITY (V-08): Derive customer ID from session, not request body
  const authenticatedId = getAuthenticatedCustomerId(request);
  if (!authenticatedId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = wishlistSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { productId } = parsed.data;

  // Toggle: if exists, remove; if not, add
  const existing = db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, authenticatedId), eq(wishlists.productId, productId)))
    .get();

  if (existing) {
    db.delete(wishlists).where(eq(wishlists.id, existing.id)).run();
    return NextResponse.json({ action: "removed" });
  }

  db.insert(wishlists).values({ customerId: authenticatedId, productId }).run();
  return NextResponse.json({ action: "added" }, { status: 201 });
}
