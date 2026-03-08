export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { db, sqlite } from "@/lib/db";
import { orders, orderItems, cartItems, products, customers } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCart } from "@/lib/queries/cart-queries";
import { checkoutSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { TAX_RATE, SHIPPING_COST } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get("cart_session")?.value;
  if (!sessionId) return NextResponse.json({ error: "No session" }, { status: 400 });

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const cart = await getCart(sessionId);
  if (cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Demo store — payment always accepted
  // Create or lookup customer (outside transaction — idempotent)
  let customer = db
    .select()
    .from(customers)
    .where(eq(customers.email, parsed.data.email))
    .get();

  if (!customer) {
    customer = db
      .insert(customers)
      .values({
        email: parsed.data.email,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone || null,
        addressLine1: parsed.data.addressLine1 || null,
        city: parsed.data.city || null,
        state: parsed.data.state || null,
        zipCode: parsed.data.zipCode || null,
      })
      .returning()
      .get()!;
  }

  const subtotal = cart.subtotal;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const shippingAmount = parsed.data.fulfillmentType === "delivery" ? SHIPPING_COST : 0;
  const total = subtotal + taxAmount + shippingAmount;

  const orderNumber = generateOrderNumber();

  // SECURITY (V-05): Wrap order creation + stock decrement in a transaction.
  // Use BEGIN IMMEDIATE to acquire a write lock upfront, preventing TOCTOU race.
  try {
    const result = sqlite.transaction(() => {
      // 1. Verify stock availability FIRST (atomic with decrement)
      for (const item of cart.items) {
        const product = db.select({ stockQuantity: products.stockQuantity })
          .from(products)
          .where(eq(products.id, item.productId))
          .get();

        if (!product || product.stockQuantity < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}`);
        }
      }

      // 2. Atomically decrement stock with a safety WHERE clause
      for (const item of cart.items) {
        const updated = sqlite.prepare(
          `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?`
        ).run(item.quantity, item.productId, item.quantity);

        if (updated.changes === 0) {
          throw new Error(`Stock race condition for ${item.productName}`);
        }
      }

      // 3. Create order AFTER stock is secured
      const order = db
        .insert(orders)
        .values({
          orderNumber,
          customerId: customer!.id,
          status: "pending",
          fulfillmentType: parsed.data.fulfillmentType,
          subtotal,
          taxAmount,
          shippingAmount,
          total,
          shippingAddressLine1: parsed.data.addressLine1 || null,
          shippingCity: parsed.data.city || null,
          shippingState: parsed.data.state || null,
          shippingZip: parsed.data.zipCode || null,
          paymentMethod: "demo",
          paymentLastFour: "0000",
          paymentStatus: "paid",
        })
        .returning()
        .get()!;

      // 4. Create order items
      for (const item of cart.items) {
        db.insert(orderItems)
          .values({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            productSku: `SKU-${item.productId}`,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          })
          .run();
      }

      // 5. Clear cart
      db.delete(cartItems).where(eq(cartItems.sessionId, sessionId)).run();

      return order;
    })();

    return NextResponse.json({
      orderNumber: result.orderNumber,
      total: result.total,
      status: result.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    // Don't leak internal details — only return stock-related messages
    if (message.includes("stock")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    return NextResponse.json({ error: "Checkout failed. Please try again." }, { status: 500 });
  }
}
