"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useCustomer } from "@/hooks/use-customer";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PriceDisplay } from "@/components/ui/price-display";
import { StarRating } from "@/components/ui/star-rating";

interface WishlistItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    slug: string;
    brand: string;
    price: number;
    compareAtPrice: number | null;
    averageRating: number | null;
    reviewCount: number | null;
  };
}

export default function WishlistPage() {
  const { customer, isLoggedIn, login } = useCustomer();
  const { addItem } = useCart();
  const toast = useToast();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const fetchWishlist = useCallback(async (customerId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/wishlist?customer_id=${customerId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      }
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (customer) {
      fetchWishlist(customer.id);
    }
  }, [customer, fetchWishlist]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    try {
      await login(email, firstName, lastName);
    } catch {
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addItem(productId);
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart.");
    }
  };

  const handleRemove = async (wishlistId: number) => {
    try {
      const res = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== wishlistId));
        toast.success("Removed from wishlist");
      }
    } catch {
      toast.error("Failed to remove from wishlist.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <span className="text-5xl mb-4 block">&#10084;&#65039;</span>
          <h1 className="text-2xl font-bold text-white mb-2">
            Your Wishlist
          </h1>
          <p className="text-gray-500 mb-8">
            Sign in to view your saved bikes.
          </p>
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <Input
              id="wish-email"
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="wish-first"
                label="First Name"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
              />
              <Input
                id="wish-last"
                label="Last Name"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loggingIn}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl mb-4 block">&#10084;&#65039;</span>
          <h3 className="text-lg font-semibold text-white mb-1">
            Your wishlist is empty
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Save your favorite bikes for later.
          </p>
          <Link href="/bikes">
            <Button>Browse Bikes</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 rounded-xl border border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
            >
              <Link href={`/bikes/${item.product.slug}`}>
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-t-xl flex items-center justify-center text-6xl">
                  🚲
                </div>
              </Link>
              <div className="p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  {item.product.brand}
                </p>
                <Link href={`/bikes/${item.product.slug}`}>
                  <h3 className="font-semibold text-white hover:text-brand-accent transition-colors mb-1">
                    {item.product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating
                    rating={item.product.averageRating ?? 0}
                    size="sm"
                  />
                  <span className="text-xs text-gray-400">
                    ({item.product.reviewCount ?? 0})
                  </span>
                </div>
                <PriceDisplay
                  price={item.product.price}
                  compareAtPrice={item.product.compareAtPrice}
                  className="mb-3"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddToCart(item.productId)}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
