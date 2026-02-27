import { db } from "@/lib/db";
import { products, categories } from "@/lib/db/schema";
import { eq, and, gte, lte, like, desc, asc, sql } from "drizzle-orm";

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
  active?: boolean;
}

// Build a lookup map of categoryId -> slug
function getCategorySlugMap(): Map<number, string> {
  const cats = db.select({ id: categories.id, slug: categories.slug }).from(categories).all();
  return new Map(cats.map((c) => [c.id, c.slug]));
}

// Augment product objects with categorySlug
function withCategorySlug<T extends { categoryId: number }>(
  items: T[],
  slugMap?: Map<number, string>
): (T & { categorySlug: string | null })[] {
  const map = slugMap ?? getCategorySlugMap();
  return items.map((item) => ({
    ...item,
    categorySlug: map.get(item.categoryId) ?? null,
  }));
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    sort = "created_at_desc",
    page = 1,
    limit = 12,
    featured,
    active = true,
  } = filters;

  const conditions = [];

  if (active) {
    conditions.push(eq(products.isActive, true));
  }

  if (category) {
    const cat = db.select({ id: categories.id }).from(categories).where(eq(categories.slug, category)).get();
    if (cat) {
      conditions.push(eq(products.categoryId, cat.id));
    }
  }

  if (minPrice !== undefined) {
    conditions.push(gte(products.price, minPrice));
  }

  if (maxPrice !== undefined) {
    conditions.push(lte(products.price, maxPrice));
  }

  if (search) {
    conditions.push(like(products.name, `%${search}%`));
  }

  if (featured) {
    conditions.push(eq(products.isFeatured, true));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let orderBy;
  switch (sort) {
    case "price_asc":
      orderBy = asc(products.price);
      break;
    case "price_desc":
      orderBy = desc(products.price);
      break;
    case "name_asc":
      orderBy = asc(products.name);
      break;
    case "rating_desc":
      orderBy = desc(products.averageRating);
      break;
    default:
      orderBy = desc(products.createdAt);
  }

  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(products)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    products: withCategorySlug(items),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductBySlug(slug: string) {
  const product = db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) return undefined;
  const cat = db.select({ slug: categories.slug, name: categories.name }).from(categories).where(eq(categories.id, product.categoryId)).get();
  return { ...product, categorySlug: cat?.slug ?? null, categoryName: cat?.name ?? null };
}

export async function getProductById(id: number) {
  return db.select().from(products).where(eq(products.id, id)).get();
}

export async function getFeaturedProducts(limit = 8) {
  const items = db
    .select()
    .from(products)
    .where(and(eq(products.isFeatured, true), eq(products.isActive, true)))
    .limit(limit)
    .all();
  return withCategorySlug(items);
}

export async function getRelatedProducts(productId: number, categoryId: number, limit = 4) {
  const items = db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.isActive, true),
        sql`${products.id} != ${productId}`
      )
    )
    .limit(limit)
    .all();
  return withCategorySlug(items);
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.displayOrder));
}

export async function getCategoryBySlug(slug: string) {
  return db.select().from(categories).where(eq(categories.slug, slug)).get();
}

export async function getLowStockProducts(limit = 20) {
  return db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        sql`${products.stockQuantity} <= ${products.lowStockThreshold}`
      )
    )
    .orderBy(asc(products.stockQuantity))
    .limit(limit);
}

export async function getAllProducts() {
  return db
    .select({
      product: products,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
}

export async function searchProducts(query: string, limit = 20) {
  const items = db
    .select()
    .from(products)
    .where(
      and(
        eq(products.isActive, true),
        sql`(${products.name} LIKE ${'%' + query + '%'} OR ${products.brand} LIKE ${'%' + query + '%'} OR ${products.description} LIKE ${'%' + query + '%'})`
      )
    )
    .limit(limit)
    .all();
  return withCategorySlug(items);
}
