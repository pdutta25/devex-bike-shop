import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export const SPRING_SALE_DISCOUNT = 0.3;

export function applySpringDiscount(priceInCents: number): number {
  return Math.round(priceInCents * (1 - SPRING_SALE_DISCOUNT));
}

export function getDiscountAmount(priceInCents: number): number {
  return priceInCents - applySpringDiscount(priceInCents);
}

// SECURITY (V-18): Use cryptographically secure random bytes for order numbers.
// 8 hex chars = 4 billion possible values per day — infeasible to enumerate.
export function generateOrderNumber(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = randomBytes(4).toString("hex").toUpperCase();
  return `SSB-${date}-${rand}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateSku(category: string, index: number): string {
  const prefix = category.slice(0, 3).toUpperCase();
  return `${prefix}-${String(index).padStart(4, "0")}`;
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
