import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedCustomerId } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const wishlistId = Number(id);

  if (!Number.isInteger(wishlistId) || wishlistId <= 0) {
    return NextResponse.json({ error: "Invalid wishlist ID" }, { status: 400 });
  }

  // SECURITY (V-08): Verify the requester owns this wishlist item
  const authenticatedId = getAuthenticatedCustomerId(request);
  if (!authenticatedId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Only delete if the item belongs to the authenticated customer
  db.delete(wishlists)
    .where(and(eq(wishlists.id, wishlistId), eq(wishlists.customerId, authenticatedId)))
    .run();
  return NextResponse.json({ success: true });
}
