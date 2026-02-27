"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/lib/db/schema";

interface ProductFiltersProps {
  categories: Category[];
  currentCategory?: string;
  currentMinPrice?: string;
  currentMaxPrice?: string;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentMinPrice,
  currentMaxPrice,
}: ProductFiltersProps) {
  const router = useRouter();
  const hasFilters = currentCategory || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-3 px-1">
          Categories
        </h3>
        <div className="space-y-0.5">
          <Link
            href="/bikes"
            className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
              !currentCategory
                ? "bg-brand-accent text-white font-medium shadow-glow-amber"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            All Bikes
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/bikes?category=${category.slug}`}
              className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-xl transition-all duration-200 ${
                currentCategory === category.slug
                  ? "bg-brand-accent text-white font-medium shadow-glow-amber"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{getCategoryEmoji(category.slug)}</span>
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-[0.15em] mb-3 px-1">
          Price Range
        </h3>
        {currentMinPrice || currentMaxPrice ? (
          <div className="text-xs text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-lg px-3 py-2 mb-3 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>
              {currentMinPrice && <span>${(Number(currentMinPrice) / 100).toLocaleString()}</span>}
              {currentMinPrice && currentMaxPrice && <span> — </span>}
              {currentMaxPrice && <span>${(Number(currentMaxPrice) / 100).toLocaleString()}</span>}
            </span>
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Under $500", min: undefined, max: "50000" },
            { label: "$500\u2013$1K", min: "50000", max: "100000" },
            { label: "$1K\u2013$2K", min: "100000", max: "200000" },
            { label: "Over $2K", min: "200000", max: undefined },
          ].map((range) => {
            const params = new URLSearchParams();
            if (currentCategory) params.set("category", currentCategory);
            if (range.min) params.set("minPrice", range.min);
            if (range.max) params.set("maxPrice", range.max);
            const isActive =
              currentMinPrice === (range.min ?? undefined) &&
              currentMaxPrice === (range.max ?? undefined);

            return (
              <Link
                key={range.label}
                href={`/bikes?${params.toString()}`}
                className={`px-3 py-2 text-xs text-center font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-brand-accent text-white shadow-sm"
                    : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white"
                }`}
              >
                {range.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={() => router.push("/bikes")}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all duration-200"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Clear All Filters
        </button>
      )}
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    road: "\uD83C\uDFCE\uFE0F",
    mountain: "\u26F0\uFE0F",
    hybrid: "\uD83D\uDD04",
    electric: "\u26A1",
    kids: "\uD83D\uDC76",
    cruiser: "\uD83C\uDFD6\uFE0F",
    gravel: "\uD83C\uDF04",
    bmx: "\uD83E\uDD38",
  };
  return map[slug] ?? "\uD83D\uDEB2";
}
