import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { wishlists } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.delete(wishlists).where(eq(wishlists.id, Number(id))).run();
  return NextResponse.json({ success: true });
}
