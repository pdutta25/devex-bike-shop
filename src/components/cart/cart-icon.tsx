"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link href="/cart" className="relative text-gray-300 hover:text-amber-400 transition-colors" aria-label="Cart">
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-amber-500 text-[10px] font-bold text-white flex items-center justify-center">
          {itemCount > 9 ? "9+" : itemCount}
        </span>
      )}
    </Link>
  );
}
