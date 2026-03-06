import { z } from "zod";

export const customerSchema = z.object({
  email: z.string().email("Valid email required"),
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  phone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  fulfillmentType: z.enum(["delivery", "pickup"]),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional().nullable(),
  categoryId: z.number().int().positive(),
  brand: z.string().min(1),
  sku: z.string().min(1),
  stockQuantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(5),
  frameMaterial: z.string().optional().nullable(),
  frameSizes: z.string().optional().nullable(),
  colors: z.string().optional().nullable(),
  weightLbs: z.number().positive().optional().nullable(),
  wheelSize: z.string().optional().nullable(),
  speeds: z.number().int().positive().optional().nullable(),
  imageUrl: z.string().min(1),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const reviewSchema = z.object({
  productId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
