"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { TAX_RATE } from "@/lib/constants";

export default function CartPage() {
  const { items, subtotal, loading, updateQuantity, removeItem } = useCart();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🛒</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            Your cart is empty
          </h1>
          <p className="text-gray-500 mb-6">
            Looks like you haven&apos;t added any bikes to your cart yet.
          </p>
          <Link href="/bikes">
            <Button size="lg">Browse Bikes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const estimatedTax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + estimatedTax;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 rounded-xl border border-white/10 p-4 flex gap-4"
            >
              {/* Product Image */}
              <div className="w-24 h-24 bg-gradient-to-br from-white/5 to-white/10 rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                🚲
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <Link
                  href={`/bikes/${item.productSlug}`}
                  className="font-semibold text-white hover:text-brand-accent transition-colors"
                >
                  {item.productName}
                </Link>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                  {item.selectedColor && (
                    <span>Color: {item.selectedColor}</span>
                  )}
                </div>
                <p className="font-semibold text-white mt-2">
                  {formatPrice(item.price)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  Remove
                </button>
                <div className="flex items-center border border-white/10 rounded-lg">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }
                    disabled={item.quantity <= 1}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                  >
                    -
                  </button>
                  <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x border-white/10">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        Math.min(item.stockQuantity, item.quantity + 1)
                      )
                    }
                    disabled={item.quantity >= item.stockQuantity}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 rounded-xl border border-white/10 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Estimated Tax (8.5%)</span>
                <span>{formatPrice(estimatedTax)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-white text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block mt-6">
              <Button size="lg" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
            <Link
              href="/bikes"
              className="block text-center mt-3 text-sm text-gray-500 hover:text-gray-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
