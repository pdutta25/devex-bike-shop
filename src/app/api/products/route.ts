export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/queries/product-queries";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { slugify, generateSku } from "@/lib/utils";
import { productSchema } from "@/lib/validations";
import { isAdminAuthorized } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const filters = {
    category: params.get("category") || undefined,
    minPrice: params.get("minPrice") ? Number(params.get("minPrice")) : undefined,
    maxPrice: params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined,
    search: params.get("search") || undefined,
    sort: params.get("sort") || undefined,
    page: params.get("page") ? Number(params.get("page")) : 1,
    limit: params.get("limit") ? Number(params.get("limit")) : 12,
    featured: params.get("featured") === "true" ? true : undefined,
  };

  const result = await getProducts(filters);
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);

  const result = db
    .insert(products)
    .values({
      ...parsed.data,
      slug,
      imageUrl: parsed.data.imageUrl || `/images/bikes/${slug}.svg`,
    })
    .returning()
    .get();

  return NextResponse.json(result, { status: 201 });
}
