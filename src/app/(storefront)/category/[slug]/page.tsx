import { notFound } from "next/navigation";
import Link from "next/link";
import { getProducts, getCategoryBySlug } from "@/lib/queries/product-queries";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { BikeImagePlaceholder } from "@/components/ui/bike-image-placeholder";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    sort?: string;
    page?: string;
  }>;
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const search = await searchParams;
  const page = Number(search.page) || 1;

  const category = await getCategoryBySlug(slug);
  if (!category) {
    notFound();
  }

  const { products, pagination } = await getProducts({
    category: slug,
    sort: search.sort,
    page,
    limit: 12,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-accent transition-colors">
          Home
        </Link>
        <span className="text-gray-600">/</span>
        <Link href="/bikes" className="hover:text-brand-accent transition-colors">
          Bikes
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          {category.name} Bikes
        </h1>
        {category.description && (
          <p className="text-gray-400 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {pagination.total} bike{pagination.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-2 mb-8">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sort</span>
        <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
          {[
            { value: "created_at_desc", label: "Newest" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "rating_desc", label: "Top Rated" },
          ].map((option) => (
            <Link
              key={option.value}
              href={`/category/${slug}?sort=${option.value}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                search.sort === option.value ||
                (!search.sort && option.value === "created_at_desc")
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">
            No bikes found in this category
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Check back soon for new arrivals.
          </p>
          <Link
            href="/bikes"
            className="text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
          >
            Browse all bikes
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/bikes/${product.slug}`}
                className="product-card group"
              >
                <div className="product-card-image aspect-[4/3] relative">
                  <BikeImagePlaceholder
                    category={product.categorySlug ?? slug}
                    size="md"
                    className="w-full h-full"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-xs font-semibold text-white bg-brand-accent/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      View Details
                    </span>
                  </div>
                  {/* Sale badge */}
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-sm uppercase tracking-wide">
                        Sale
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-gray-100 group-hover:text-brand-accent transition-colors duration-200 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <StarRating
                      rating={product.averageRating ?? 0}
                      size="sm"
                    />
                    <span className="text-xs text-gray-500">
                      ({product.reviewCount ?? 0})
                    </span>
                  </div>
                  <PriceDisplay
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                  />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-1.5 mt-12">
              {page > 1 && (
                <Link
                  href={`/category/${slug}?page=${page - 1}${search.sort ? `&sort=${search.sort}` : ""}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              )}
              <div className="flex gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((p) => (
                  <Link
                    key={p}
                    href={`/category/${slug}?page=${p}${search.sort ? `&sort=${search.sort}` : ""}`}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-xl transition-all ${
                      p === page
                        ? "bg-brand-accent text-white shadow-glow-amber"
                        : "text-gray-400 hover:bg-white/10 bg-white/5 border border-white/10"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
              {page < pagination.totalPages && (
                <Link
                  href={`/category/${slug}?page=${page + 1}${search.sort ? `&sort=${search.sort}` : ""}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
