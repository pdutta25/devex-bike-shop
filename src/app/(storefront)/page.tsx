export const dynamic = "force-dynamic";

import Link from "next/link";
import { getFeaturedProducts, getCategories } from "@/lib/queries/product-queries";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { BikeImagePlaceholder } from "@/components/ui/bike-image-placeholder";
import { applySpringDiscount } from "@/lib/utils";

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
  ]);

  return (
    <div className="bg-[#0f0f1a]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-brand-dark min-h-[70vh] flex items-center">
        {/* Animated mesh background */}
        <div className="absolute inset-0 bg-mesh-gradient bg-[length:400%_400%] animate-gradient-shift" />

        {/* Decorative elements */}
        <div className="absolute inset-0">
          {/* Large glowing orb */}
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-brand-accent/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />

          {/* Geometric lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Floating bike silhouette */}
          <div className="absolute right-[15%] top-1/2 -translate-y-1/2 opacity-[0.06] hidden lg:block">
            <svg width="500" height="400" viewBox="0 0 120 100" fill="none">
              <circle cx="28" cy="70" r="24" stroke="white" strokeWidth="1.5" />
              <circle cx="92" cy="70" r="24" stroke="white" strokeWidth="1.5" />
              <path d="M28 70 L52 38 L92 70 L52 38 L80 32 L92 70" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M52 38 L47 26" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M42 26 L52 26" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M80 32 L84 24 L88 28" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                New 2026 Collection Available
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-fade-in-up animate-delay-100 text-left">
              <span className="text-white">Ride the </span>
              <span className="gradient-text">Future</span>
            </h1>

            {/* Spring Sale Badge */}
            <div className="relative inline-flex items-center gap-3 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-amber-500/10 border border-red-500/30 rounded-2xl px-6 py-3 mb-8 animate-fade-in-up animate-delay-150 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-amber-500/5 animate-pulse" />
              <span className="relative text-lg">🌸</span>
              <div className="relative">
                <span className="text-sm font-bold text-red-400 tracking-wide">
                  Spring into savings
                </span>
                <span className="block text-xs text-gray-400">
                  30% off every bike in the shop
                </span>
              </div>
            </div>

            {/* Subhead */}
            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl animate-fade-in-up animate-delay-200">
              Premium bikes built for every journey. From mountain trails to city streets, ride the future with DevEx.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <Link
                href="/bikes"
                className="group inline-flex items-center gap-2 h-13 px-8 text-sm font-semibold rounded-xl bg-brand-accent text-white hover:bg-brand-accent-hover transition-all duration-300 shadow-glow-amber hover:shadow-glow-amber-lg"
              >
                Shop All Bikes
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/category/electric"
                className="inline-flex items-center gap-2 h-13 px-8 text-sm font-semibold rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span>⚡</span>
                Explore Electric
              </Link>
              <Link
                href="/bikes?onSale=true"
                className="inline-flex items-center gap-2 h-13 px-8 text-sm font-semibold rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50 transition-all duration-300"
              >
                <span>🏷️</span>
                Bikes on Sale
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 mt-16 animate-fade-in-up animate-delay-500">
              {[
                { value: "48+", label: "Bike Models" },
                { value: "8", label: "Categories" },
                { value: "4.8", label: "Avg Rating" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f1a] to-transparent" />
      </section>

      {/* ─── FEATURED BIKES ─── */}
      <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-heading">Featured Bikes</h2>
            <p className="section-subheading">
              Hand-picked selections from our latest collection
            </p>
          </div>
          <Link
            href="/bikes"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors group"
          >
            View all bikes
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-300 font-medium">No featured products yet</p>
            <p className="text-sm text-gray-500 mt-1">Check back soon for our latest picks!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, idx) => (
              <Link
                key={product.id}
                href={`/bikes/${product.slug}`}
                className="product-card group"
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div className="product-card-image aspect-[4/3]">
                  <BikeImagePlaceholder
                    category={product.categorySlug ?? "road"}
                    size="md"
                    className="w-full h-full"
                  />
                  {/* Quick view overlay */}
                  <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 text-xs font-semibold text-white bg-brand-accent/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                      View Details
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
                    <StarRating rating={product.averageRating ?? 0} size="sm" />
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
        )}
      </section>

      {/* ─── CATEGORY GRID ─── */}
      <section className="py-20">
        <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24">
          <div className="text-left mb-12">
            <h2 className="section-heading">Shop by Category</h2>
            <p className="section-subheading mx-auto">
              Find your perfect ride across our diverse collection
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((category, idx) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative bg-white/5 rounded-2xl border border-white/10 hover:border-brand-accent/30 hover:shadow-glow-amber p-6 sm:p-8 text-center transition-all duration-300 overflow-hidden"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-accent/0 to-brand-accent/0 group-hover:from-brand-accent/10 group-hover:to-transparent transition-all duration-500 rounded-2xl" />

                <div className="relative z-10">
                  <div className="text-4xl sm:text-5xl mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                    {getCategoryEmoji(category.slug)}
                  </div>
                  <h3 className="font-semibold text-gray-100 group-hover:text-white transition-colors mb-1">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 mt-3 text-[11px] font-semibold text-brand-accent opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                    Browse
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROMO BANNER ─── */}
      <section className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-white/5 border border-white/10 p-8 sm:p-12 lg:p-16">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-hero-pattern" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Free Shipping on Orders Over $500
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-lg">
                Every bike ships fully assembled and ready to ride. Plus, enjoy
                complimentary shipping on all orders above $500.
              </p>
              <Link
                href="/bikes"
                className="inline-flex items-center gap-2 h-12 px-8 text-sm font-semibold rounded-xl bg-brand-accent text-white hover:bg-brand-accent-hover transition-all duration-300 shadow-glow-amber hover:shadow-glow-amber-lg"
              >
                Start Shopping
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="flex gap-6 text-center">
              {[
                { icon: "🚚", title: "Free Shipping", desc: "On orders $500+" },
                { icon: "🔧", title: "Expert Assembly", desc: "Ready to ride" },
                { icon: "🛡️", title: "2-Year Warranty", desc: "Full coverage" },
              ].map((perk) => (
                <div
                  key={perk.title}
                  className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-5 min-w-[130px]"
                >
                  <span className="text-2xl">{perk.icon}</span>
                  <p className="text-sm font-semibold text-white">{perk.title}</p>
                  <p className="text-[11px] text-gray-500">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    road: "🏎️",
    mountain: "⛰️",
    hybrid: "🔄",
    electric: "⚡",
    kids: "👶",
    cruiser: "🏖️",
    gravel: "🌄",
    bmx: "🤸",
  };
  return emojiMap[slug] ?? "🚲";
}
