import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { randomBetween, pickRandom, generateOrderNumber } from "@/lib/utils";
import { TAX_RATE, SHIPPING_COST } from "@/lib/constants";
import type { Product, Customer } from "@/lib/db/schema";

const STATUS_DISTRIBUTION = [
  ...Array(15).fill("pending"),
  ...Array(20).fill("processing"),
  ...Array(10).fill("ready_for_pickup"),
  ...Array(15).fill("shipped"),
  ...Array(35).fill("delivered"),
  ...Array(5).fill("cancelled"),
];

const PAYMENT_STATUS_MAP: Record<string, string> = {
  pending: "pending",
  processing: "paid",
  ready_for_pickup: "paid",
  shipped: "paid",
  delivered: "paid",
  cancelled: "refunded",
};

export async function seedOrdersData(customerList: Customer[], productList: Product[]) {
  const now = Date.now();
  const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000;
  let orderCount = 0;
  let itemCount = 0;

  for (let i = 0; i < 200; i++) {
    const customer = pickRandom(customerList);
    const status = pickRandom(STATUS_DISTRIBUTION);
    const fulfillmentType = Math.random() > 0.3 ? "delivery" : "pickup";

    // Spread dates with upward trend (more recent = more likely)
    const recencyBias = Math.pow(Math.random(), 0.7);
    const orderDate = new Date(now - ninetyDaysMs * (1 - recencyBias));
    const dateStr = orderDate.toISOString().replace("T", " ").slice(0, 19);

    const numItems = randomBetween(1, 3);
    const selectedProducts = [];
    const usedProductIds = new Set<number>();

    for (let j = 0; j < numItems; j++) {
      let product;
      let attempts = 0;
      do {
        product = pickRandom(productList);
        attempts++;
      } while (usedProductIds.has(product.id) && attempts < 20);

      if (!usedProductIds.has(product.id)) {
        usedProductIds.add(product.id);
        const qty = randomBetween(1, 2);
        selectedProducts.push({ product, quantity: qty });
      }
    }

    if (selectedProducts.length === 0) continue;

    const subtotal = selectedProducts.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxAmount = Math.round(subtotal * TAX_RATE);
    const shippingAmount = fulfillmentType === "delivery" ? SHIPPING_COST : 0;
    const total = subtotal + taxAmount + shippingAmount;

    const lastFour = String(randomBetween(1000, 9999));
    const orderNumber = `SSB-${orderDate.toISOString().slice(0, 10).replace(/-/g, "")}-${String(i + 1).padStart(3, "0")}`;

    const order = db
      .insert(orders)
      .values({
        orderNumber,
        customerId: customer.id,
        status,
        fulfillmentType,
        subtotal,
        taxAmount,
        shippingAmount,
        total,
        shippingAddressLine1: fulfillmentType === "delivery" ? customer.addressLine1 : null,
        shippingCity: fulfillmentType === "delivery" ? customer.city : null,
        shippingState: fulfillmentType === "delivery" ? customer.state : null,
        shippingZip: fulfillmentType === "delivery" ? customer.zipCode : null,
        paymentMethod: "credit_card",
        paymentLastFour: lastFour,
        paymentStatus: PAYMENT_STATUS_MAP[status] || "paid",
        createdAt: dateStr,
        updatedAt: dateStr,
      })
      .returning()
      .get();

    if (!order) continue;

    for (const item of selectedProducts) {
      const sizes = item.product.frameSizes ? JSON.parse(item.product.frameSizes) : ["M"];
      const colors = item.product.colors ? JSON.parse(item.product.colors) : ["Black"];

      db.insert(orderItems)
        .values({
          orderId: order.id,
          productId: item.product.id,
          productName: item.product.name,
          productSku: item.product.sku,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
          selectedSize: pickRandom(sizes),
          selectedColor: pickRandom(colors),
        })
        .run();

      itemCount++;
    }

    orderCount++;
  }

  return { orders: orderCount, orderItems: itemCount };
}
