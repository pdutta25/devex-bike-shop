import { describe, it, expect } from "vitest";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUSES,
  FULFILLMENT_TYPES,
  TAX_RATE,
  SHIPPING_COST,
  CATEGORIES,
  FRAME_MATERIALS,
  FRAME_SIZES,
  BIKE_COLORS,
} from "@/lib/constants";

describe("constants", () => {
  // ─────────────────────────────────────────
  // Order statuses
  // ─────────────────────────────────────────
  it("has 6 order statuses", () => {
    expect(ORDER_STATUSES).toHaveLength(6);
  });

  it("every order status has a label", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_LABELS[status]).toBeDefined();
      expect(ORDER_STATUS_LABELS[status].length).toBeGreaterThan(0);
    }
  });

  it("every order status has a color class", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_COLORS[status]).toBeDefined();
      expect(ORDER_STATUS_COLORS[status]).toContain("bg-");
      expect(ORDER_STATUS_COLORS[status]).toContain("text-");
    }
  });

  // ─────────────────────────────────────────
  // Payment & fulfillment
  // ─────────────────────────────────────────
  it("has expected payment statuses", () => {
    expect(PAYMENT_STATUSES).toContain("pending");
    expect(PAYMENT_STATUSES).toContain("paid");
    expect(PAYMENT_STATUSES).toContain("failed");
    expect(PAYMENT_STATUSES).toContain("refunded");
  });

  it("has delivery and pickup fulfillment types", () => {
    expect(FULFILLMENT_TYPES).toContain("delivery");
    expect(FULFILLMENT_TYPES).toContain("pickup");
    expect(FULFILLMENT_TYPES).toHaveLength(2);
  });

  // ─────────────────────────────────────────
  // Tax & shipping
  // ─────────────────────────────────────────
  it("tax rate is 8.5%", () => {
    expect(TAX_RATE).toBe(0.085);
  });

  it("shipping cost is $15.00 (1500 cents)", () => {
    expect(SHIPPING_COST).toBe(1500);
  });

  // ─────────────────────────────────────────
  // Categories
  // ─────────────────────────────────────────
  it("has 8 bike categories", () => {
    expect(CATEGORIES).toHaveLength(8);
  });

  it("every category has name, slug, and description", () => {
    for (const cat of CATEGORIES) {
      expect(cat.name.length).toBeGreaterThan(0);
      expect(cat.slug.length).toBeGreaterThan(0);
      expect(cat.description.length).toBeGreaterThan(0);
    }
  });

  it("category slugs are unique", () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("category display orders are sequential from 0", () => {
    const orders = CATEGORIES.map((c) => c.order);
    expect(orders).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });

  // ─────────────────────────────────────────
  // Product specs
  // ─────────────────────────────────────────
  it("has frame materials", () => {
    expect(FRAME_MATERIALS.length).toBeGreaterThan(0);
    expect(FRAME_MATERIALS).toContain("Carbon");
    expect(FRAME_MATERIALS).toContain("Aluminum");
  });

  it("has frame sizes from XS to XL", () => {
    expect(FRAME_SIZES).toEqual(["XS", "S", "M", "L", "XL"]);
  });

  it("has bike colors", () => {
    expect(BIKE_COLORS.length).toBeGreaterThanOrEqual(5);
  });
});
