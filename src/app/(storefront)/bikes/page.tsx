import Link from "next/link";
import { getProducts, getCategories } from "@/lib/queries/product-queries";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { BikeImagePlaceholder } from "@/components/ui/bike-image-placeholder";
import { ProductFilters } from "./product-filters";

interface BikesPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BikesPage({ searchParams }: BikesPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  const [{ products, pagination }, categories] = await Promise.all([
    getProducts({
      category: params.category,
      minPrice,
      maxPrice,
      search: params.search,
      sort: params.sort,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            All Bikes
          </h1>
          <p className="text-gray-400 mt-1.5 text-sm">
            {pagination.total} bike{pagination.total !== 1 ? "s" : ""} found
          </p>
        </div>
        <SortDropdown currentSort={params.sort} searchParams={params} />
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <ProductFilters
              categories={categories}
              currentCategory={params.category}
              currentMinPrice={params.minPrice}
              currentMaxPrice={params.maxPrice}
            />
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-24 bg-white/5 rounded-2xl border border-white/10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                No bikes found
              </h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                Try adjusting your filters or search terms to find what you&apos;re looking for.
              </p>
              <Link
                href="/bikes"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover bg-brand-accent/10 hover:bg-brand-accent/20 rounded-xl transition-all"
              >
                Clear all filters
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
                        category={product.categorySlug ?? "road"}
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
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500 text-white shadow-sm uppercase tracking-wide">
                          30% Off
                        </span>
                      </div>
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
                        price={Math.round(product.price * 0.7)}
                        compareAtPrice={product.price}
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
                      href={buildPageUrl(params, page - 1)}
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
                        href={buildPageUrl(params, p)}
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
                      href={buildPageUrl(params, page + 1)}
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
      </div>
    </div>
  );
}

function buildPageUrl(
  params: Record<string, string | undefined>,
  page: number
): string {
  const searchParams = new URLSearchParams();
  if (params.category) searchParams.set("category", params.category);
  if (params.minPrice) searchParams.set("minPrice", params.minPrice);
  if (params.maxPrice) searchParams.set("maxPrice", params.maxPrice);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) searchParams.set("sort", params.sort);
  searchParams.set("page", String(page));
  return `/bikes?${searchParams.toString()}`;
}

function SortDropdown({
  currentSort,
  searchParams,
}: {
  currentSort?: string;
  searchParams: Record<string, string | undefined>;
}) {
  const options = [
    { value: "created_at_desc", label: "Newest" },
    { value: "price_asc", label: "Price: Low \u2192 High" },
    { value: "price_desc", label: "Price: High \u2192 Low" },
    { value: "rating_desc", label: "Top Rated" },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:block">
        Sort
      </span>
      <div className="flex gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
        {options.map((option) => {
          const params = new URLSearchParams();
          if (searchParams.category) params.set("category", searchParams.category);
          if (searchParams.minPrice) params.set("minPrice", searchParams.minPrice);
          if (searchParams.maxPrice) params.set("maxPrice", searchParams.maxPrice);
          if (searchParams.search) params.set("search", searchParams.search);
          params.set("sort", option.value);

          const isActive =
            currentSort === option.value ||
            (!currentSort && option.value === "created_at_desc");

          return (
            <Link
              key={option.value}
              href={`/bikes?${params.toString()}`}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-brand-accent text-white shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
