"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface AddToCartSectionProps {
  productId: number;
  frameSizes: string[];
  colors: string[];
  inStock: boolean;
}

export function AddToCartSection({
  productId,
  frameSizes,
  colors,
  inStock,
}: AddToCartSectionProps) {
  const { addItem } = useCart();
  const toast = useToast();
  const [selectedSize, setSelectedSize] = useState<string>(
    frameSizes[0] ?? ""
  );
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] ?? "");
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addItem(
        productId,
        1,
        selectedSize || undefined,
        selectedColor || undefined
      );
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      {frameSizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">
            Size: <span className="font-normal text-gray-400">{selectedSize}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {frameSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  selectedSize === size
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-white/20 text-gray-300 hover:border-white/40"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">
            Color: <span className="font-normal text-gray-400">{selectedColor}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  selectedColor === color
                    ? "border-brand-accent bg-brand-accent text-white"
                    : "border-white/20 text-gray-300 hover:border-white/40"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="w-full"
        onClick={handleAddToCart}
        disabled={!inStock || loading}
        loading={loading}
      >
        {inStock ? "Add to Cart" : "Out of Stock"}
      </Button>
    </div>
  );
}
