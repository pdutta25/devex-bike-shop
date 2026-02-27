"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { StarRating } from "@/components/ui/star-rating";
import { PriceDisplay } from "@/components/ui/price-display";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Product } from "@/lib/db/schema";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query.trim())}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Search Bikes
        </h1>
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, brand, or description..."
            className="w-full h-14 pl-12 pr-4 text-lg rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent"
            autoFocus
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Results */}
      {!loading && hasSearched && results.length === 0 && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🔍</span>
          <h3 className="text-lg font-semibold text-white mb-1">
            No bikes found
          </h3>
          <p className="text-sm text-gray-500">
            Try a different search term or{" "}
            <Link
              href="/bikes"
              className="text-brand-accent hover:underline"
            >
              browse all bikes
            </Link>
            .
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/bikes/${product.slug}`}
                className="group bg-white/5 rounded-xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-t-xl flex items-center justify-center text-6xl">
                  🚲
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {product.brand}
                  </p>
                  <h3 className="font-semibold text-white group-hover:text-brand-accent transition-colors mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating
                      rating={product.averageRating ?? 0}
                      size="sm"
                    />
                    <span className="text-xs text-gray-400">
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
        </>
      )}

      {/* Initial State */}
      {!loading && !hasSearched && (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">🚲</span>
          <p className="text-gray-500">
            Start typing to search our bike collection
          </p>
        </div>
      )}
    </div>
  );
}
