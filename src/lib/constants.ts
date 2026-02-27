export const ORDER_STATUSES = [
  "pending",
  "processing",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  ready_for_pickup: "Ready for Pickup",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  ready_for_pickup: "bg-amber-100 text-amber-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILLMENT_TYPES = ["delivery", "pickup"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const TAX_RATE = 0.085; // 8.5%
export const SHIPPING_COST = 1500; // $15.00 flat rate

export const CATEGORIES = [
  { name: "Road", slug: "road", description: "Built for speed on paved surfaces", order: 0 },
  { name: "Mountain", slug: "mountain", description: "Conquer any trail with confidence", order: 1 },
  { name: "Hybrid", slug: "hybrid", description: "Versatile rides for any terrain", order: 2 },
  { name: "Electric", slug: "electric", description: "Power-assisted cycling at its finest", order: 3 },
  { name: "Kids", slug: "kids", description: "Safe and fun bikes for young riders", order: 4 },
  { name: "Cruiser", slug: "cruiser", description: "Relaxed riding in style", order: 5 },
  { name: "Gravel", slug: "gravel", description: "Adventure-ready for mixed terrain", order: 6 },
  { name: "BMX", slug: "bmx", description: "Trick-ready and built tough", order: 7 },
] as const;

export const FRAME_MATERIALS = ["Carbon", "Aluminum", "Steel", "Titanium"] as const;
export const FRAME_SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const BIKE_COLORS = [
  "Midnight Black",
  "Arctic White",
  "Electric Blue",
  "Crimson Red",
  "Forest Green",
  "Sunset Orange",
  "Gunmetal Gray",
  "Pearl Silver",
] as const;
