import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/product-queries";
import { getProductReviews } from "@/lib/queries/review-queries";
import { formatPrice } from "@/lib/utils";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { Badge } from "@/components/ui/badge";
import { BikeImagePlaceholder } from "@/components/ui/bike-image-placeholder";
import { AddToCartSection } from "./add-to-cart";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product.id, product.categoryId, 4),
  ]);

  const frameSizes: string[] = product.frameSizes
    ? JSON.parse(product.frameSizes)
    : [];
  const colors: string[] = product.colors ? JSON.parse(product.colors) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-brand-accent transition-colors">
          Home
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <Link href="/bikes" className="text-gray-500 hover:text-brand-accent transition-colors">
          Bikes
        </Link>
        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-white font-medium">{product.name}</span>
      </nav>

      {/* Product Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Left: Image */}
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <BikeImagePlaceholder
            category={product.categorySlug ?? "road"}
            size="lg"
            className="w-full aspect-square"
          />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          {/* Category badge */}
          {product.categoryName && (
            <Link
              href={`/category/${product.categorySlug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-accent hover:text-brand-accent-hover transition-colors mb-3 w-fit"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {product.categoryName}
            </Link>
          )}

          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">
            {product.brand}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-3 mb-5">
            <StarRating rating={product.averageRating ?? 0} size="md" />
            <span className="text-sm text-gray-400">
              ({product.reviewCount ?? 0} review
              {(product.reviewCount ?? 0) !== 1 ? "s" : ""})
            </span>
          </div>

          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            size="lg"
            className="mb-6"
          />

          <p className="text-gray-400 leading-relaxed mb-6 text-[15px]">
            {product.description}
          </p>

          {/* Stock badge */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <Badge variant="success">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  In Stock ({product.stockQuantity} available)
                </span>
              </Badge>
            ) : (
              <Badge variant="destructive">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Out of Stock
                </span>
              </Badge>
            )}
          </div>

          {/* Size & Color Selectors + Add to Cart */}
          <AddToCartSection
            productId={product.id}
            frameSizes={frameSizes}
            colors={colors}
            inStock={product.stockQuantity > 0}
          />

          {/* Trust badges */}
          <div className="flex gap-6 mt-8 pt-8 border-t border-white/10">
            {[
              { icon: "\uD83D\uDE9A", label: "Free Shipping" },
              { icon: "\uD83D\uDD27", label: "Expert Assembly" },
              { icon: "\uD83D\uDEE1\uFE0F", label: "2-Year Warranty" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-xs text-gray-400">
                <span className="text-base">{badge.icon}</span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs Table */}
      <section className="mb-20">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-6">
          Specifications
        </h2>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <tbody className="divide-y divide-white/5">
              {product.frameMaterial && (
                <SpecRow label="Frame Material" value={product.frameMaterial} />
              )}
              {product.wheelSize && (
                <SpecRow label="Wheel Size" value={product.wheelSize} />
              )}
              {product.speeds && (
                <SpecRow label="Speeds" value={`${product.speeds}-speed`} />
              )}
              {product.weightLbs && (
                <SpecRow label="Weight" value={`${product.weightLbs} lbs`} />
              )}
              {frameSizes.length > 0 && (
                <SpecRow label="Available Sizes" value={frameSizes.join(", ")} />
              )}
              {colors.length > 0 && (
                <SpecRow label="Available Colors" value={colors.join(", ")} />
              )}
              <SpecRow label="SKU" value={product.sku} />
            </tbody>
          </table>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Customer Reviews
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((item) => (
              <div
                key={item.review.id}
                className="bg-white/5 rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                      {item.customerFirstName?.[0]}
                      {item.customerLastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">
                        {item.customerFirstName} {item.customerLastName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {item.review.isVerifiedPurchase && (
                          <Badge variant="success">Verified Purchase</Badge>
                        )}
                        <span className="text-[11px] text-gray-500">
                          {new Date(item.review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <StarRating rating={item.review.rating} size="sm" />
                </div>
                {item.review.title && (
                  <h4 className="font-semibold text-white mb-1">
                    {item.review.title}
                  </h4>
                )}
                {item.review.body && (
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.review.body}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relProduct) => (
              <Link
                key={relProduct.id}
                href={`/bikes/${relProduct.slug}`}
                className="product-card group"
              >
                <div className="product-card-image aspect-[4/3]">
                  <BikeImagePlaceholder
                    category={relProduct.categorySlug ?? "road"}
                    size="md"
                    className="w-full h-full"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    {relProduct.brand}
                  </p>
                  <h3 className="font-semibold text-gray-100 group-hover:text-brand-accent transition-colors duration-200 mb-2 line-clamp-1">
                    {relProduct.name}
                  </h3>
                  <PriceDisplay
                    price={relProduct.price}
                    compareAtPrice={relProduct.compareAtPrice}
                    size="sm"
                  />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="hover:bg-white/5 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-500 w-1/3">
        {label}
      </td>
      <td className="px-6 py-4 text-sm text-white font-medium">
        {value}
      </td>
    </tr>
  );
}
