import { describe, it, expect } from "vitest";
import {
  customerSchema,
  checkoutSchema,
  productSchema,
  reviewSchema,
} from "@/lib/validations";

// ─────────────────────────────────────────
// customerSchema
// ─────────────────────────────────────────
describe("customerSchema", () => {
  it("accepts valid customer data", () => {
    const result = customerSchema.safeParse({
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(true);
  });

  it("accepts customer with all optional fields", () => {
    const result = customerSchema.safeParse({
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      phone: "555-1234",
      addressLine1: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "94103",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = customerSchema.safeParse({
      email: "not-an-email",
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = customerSchema.safeParse({
      firstName: "John",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty first name", () => {
    const result = customerSchema.safeParse({
      email: "john@example.com",
      firstName: "",
      lastName: "Doe",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty last name", () => {
    const result = customerSchema.safeParse({
      email: "john@example.com",
      firstName: "John",
      lastName: "",
    });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────
// checkoutSchema
// ─────────────────────────────────────────
describe("checkoutSchema", () => {
  it("accepts valid delivery checkout", () => {
    const result = checkoutSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      fulfillmentType: "delivery",
      addressLine1: "456 Oak Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97201",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid pickup checkout", () => {
    const result = checkoutSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      fulfillmentType: "pickup",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid fulfillment type", () => {
    const result = checkoutSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      fulfillmentType: "drone",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fulfillment type", () => {
    const result = checkoutSchema.safeParse({
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = checkoutSchema.safeParse({
      firstName: "Jane",
      lastName: "Smith",
      fulfillmentType: "pickup",
    });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────
// productSchema
// ─────────────────────────────────────────
describe("productSchema", () => {
  const validProduct = {
    name: "Trek Domane SL 7",
    description: "A high-performance endurance road bike",
    price: 549900,
    categoryId: 1,
    brand: "Trek",
    sku: "ROA-0001",
    stockQuantity: 10,
    imageUrl: "/images/trek-domane.jpg",
  };

  it("accepts valid product data", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it("applies defaults for isFeatured and isActive", () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isFeatured).toBe(false);
      expect(result.data.isActive).toBe(true);
      expect(result.data.lowStockThreshold).toBe(5);
    }
  });

  it("rejects negative price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects zero price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer price", () => {
    const result = productSchema.safeParse({ ...validProduct, price: 49.99 });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock quantity", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stockQuantity: -1,
    });
    expect(result.success).toBe(false);
  });

  it("accepts zero stock quantity", () => {
    const result = productSchema.safeParse({
      ...validProduct,
      stockQuantity: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = productSchema.safeParse({ name: "Bike" });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────
// reviewSchema
// ─────────────────────────────────────────
describe("reviewSchema", () => {
  it("accepts valid review", () => {
    const result = reviewSchema.safeParse({
      productId: 1,
      customerId: 1,
      rating: 5,
      title: "Great bike!",
      body: "Love the handling.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts review without title/body", () => {
    const result = reviewSchema.safeParse({
      productId: 1,
      customerId: 1,
      rating: 3,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    const result = reviewSchema.safeParse({
      productId: 1,
      customerId: 1,
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects rating above 5", () => {
    const result = reviewSchema.safeParse({
      productId: 1,
      customerId: 1,
      rating: 6,
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = reviewSchema.safeParse({
      productId: 1,
      customerId: 1,
      rating: 3.5,
    });
    expect(result.success).toBe(false);
  });
});
