import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getWishlist } from "@/lib/queries/wishlist-queries";

export async function GET(request: NextRequest) {
  const customerId = request.nextUrl.searchParams.get("customer_id");
  if (!customerId) return NextResponse.json({ error: "customer_id required" }, { status: 400 });

  const result = await getWishlist(Number(customerId));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { customerId, productId } = await request.json();

  // Toggle: if exists, remove; if not, add
  const existing = db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.customerId, customerId), eq(wishlists.productId, productId)))
    .get();

  if (existing) {
    db.delete(wishlists).where(eq(wishlists.id, existing.id)).run();
    return NextResponse.json({ action: "removed" });
  }

  db.insert(wishlists).values({ customerId, productId }).run();
  return NextResponse.json({ action: "added" }, { status: 201 });
}
