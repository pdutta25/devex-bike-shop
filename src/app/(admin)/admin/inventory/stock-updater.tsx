"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StockUpdaterProps {
  productId: number;
  currentStock: number;
}

export function StockUpdater({ productId, currentStock }: StockUpdaterProps) {
  const [stock, setStock] = useState(currentStock);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const updateStock = async (newStock: number) => {
    if (newStock < 0) return;
    setStock(newStock);
    setLoading(true);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockQuantity: newStock }),
      });

      if (!res.ok) {
        throw new Error("Failed to update stock");
      }

      toast.success(`Stock updated to ${newStock}`);
      router.refresh();
    } catch {
      setStock(currentStock);
      toast.error("Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 text-lg"
        onClick={() => updateStock(stock - 1)}
        disabled={loading || stock <= 0}
      >
        -
      </Button>
      <span className="w-12 text-center font-semibold text-sm">{stock}</span>
      <Button
        variant="secondary"
        size="icon"
        className="w-8 h-8 text-lg"
        onClick={() => updateStock(stock + 1)}
        disabled={loading}
      >
        +
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="ml-2"
        onClick={() => updateStock(stock + 10)}
        disabled={loading}
      >
        +10
      </Button>
    </div>
  );
}
