import { describe, it, expect } from "vitest";
import {
  cn,
  formatPrice,
  generateOrderNumber,
  slugify,
  generateSku,
  randomBetween,
  pickRandom,
  shuffleArray,
} from "@/lib/utils";

// ─────────────────────────────────────────
// formatPrice
// ─────────────────────────────────────────
describe("formatPrice", () => {
  it("formats cents to USD currency string", () => {
    expect(formatPrice(1500)).toBe("$15.00");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("formats large amounts", () => {
    expect(formatPrice(249999)).toBe("$2,499.99");
  });

  it("formats single cent", () => {
    expect(formatPrice(1)).toBe("$0.01");
  });

  it("formats amounts with thousands separator", () => {
    expect(formatPrice(100000)).toBe("$1,000.00");
  });
});

// ─────────────────────────────────────────
// generateOrderNumber
// ─────────────────────────────────────────
describe("generateOrderNumber", () => {
  it("starts with SSB- prefix", () => {
    const orderNum = generateOrderNumber();
    expect(orderNum).toMatch(/^SSB-/);
  });

  it("contains date in YYYYMMDD format", () => {
    const orderNum = generateOrderNumber();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    expect(orderNum).toContain(dateStr);
  });

  it("has format SSB-YYYYMMDD-XXXXXXXX", () => {
    const orderNum = generateOrderNumber();
    expect(orderNum).toMatch(/^SSB-\d{8}-[A-F0-9]{8}$/);
  });

  it("generates unique order numbers", () => {
    const numbers = new Set(
      Array.from({ length: 50 }, () => generateOrderNumber())
    );
    expect(numbers.size).toBe(50);
  });
});

// ─────────────────────────────────────────
// slugify
// ─────────────────────────────────────────
describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("mountain bike")).toBe("mountain-bike");
  });

  it("removes special characters", () => {
    expect(slugify("Trek Domane SL 7!")).toBe("trek-domane-sl-7");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("road---bike")).toBe("road-bike");
  });
});

// ─────────────────────────────────────────
// generateSku
// ─────────────────────────────────────────
describe("generateSku", () => {
  it("uses first 3 chars of category as prefix", () => {
    expect(generateSku("mountain", 1)).toBe("MOU-0001");
  });

  it("pads index to 4 digits", () => {
    expect(generateSku("road", 42)).toBe("ROA-0042");
  });

  it("handles large index", () => {
    expect(generateSku("electric", 9999)).toBe("ELE-9999");
  });
});

// ─────────────────────────────────────────
// cn (class name merger)
// ─────────────────────────────────────────
describe("cn", () => {
  it("merges class names", () => {
    expect(cn("text-red-500", "bg-white")).toBe("text-red-500 bg-white");
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("btn", isActive && "btn-active")).toContain("btn-active");
  });

  it("deduplicates tailwind classes", () => {
    const result = cn("p-4", "p-8");
    expect(result).toBe("p-8");
  });

  it("handles undefined/false values", () => {
    const result = cn("base", undefined, false, "extra");
    expect(result).toBe("base extra");
  });
});

// ─────────────────────────────────────────
// randomBetween
// ─────────────────────────────────────────
describe("randomBetween", () => {
  it("returns value within range", () => {
    for (let i = 0; i < 100; i++) {
      const val = randomBetween(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it("returns integer", () => {
    const val = randomBetween(1, 100);
    expect(Number.isInteger(val)).toBe(true);
  });

  it("works with same min and max", () => {
    expect(randomBetween(5, 5)).toBe(5);
  });
});

// ─────────────────────────────────────────
// pickRandom
// ─────────────────────────────────────────
describe("pickRandom", () => {
  it("returns an element from the array", () => {
    const arr = ["a", "b", "c"];
    expect(arr).toContain(pickRandom(arr));
  });

  it("works with single element", () => {
    expect(pickRandom([42])).toBe(42);
  });
});

// ─────────────────────────────────────────
// shuffleArray
// ─────────────────────────────────────────
describe("shuffleArray", () => {
  it("returns array with same length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr)).toHaveLength(5);
  });

  it("contains same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffleArray(arr).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it("does not mutate original array", () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});
