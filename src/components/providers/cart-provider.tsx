"use client";

import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

export interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
  stockQuantity: number;
}

interface CartContextType {
  items: CartItemData[];
  itemCount: number;
  subtotal: number;
  loading: boolean;
  addItem: (productId: number, quantity?: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeItem: (cartItemId: number) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | null>(null);

function getSessionId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/cart_session=([^;]+)/);
  if (match) return match[1];
  const id = crypto.randomUUID();
  document.cookie = `cart_session=${id}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  return id;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getSessionId();
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId: number, quantity = 1, size?: string, color?: string) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity, selectedSize: size, selectedColor: color }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }, []);

  const updateQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items || []);
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: number) => {
    await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider value={{ items, itemCount, subtotal, loading, addItem, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}
