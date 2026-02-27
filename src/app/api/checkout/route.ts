import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

  // Simulate payment processing (90% success rate)
  const simulateFailure = body.simulateFailure === true;
  const paymentSuccess = simulateFailure ? false : Math.random() > 0.1;

  if (!paymentSuccess) {
    return NextResponse.json({ error: "Payment declined. Please try again." }, { status: 402 });
  }

  // Create or lookup customer
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
  const lastFour = parsed.data.cardNumber.slice(-4);

  // Create order
  const order = db
    .insert(orders)
    .values({
      orderNumber,
      customerId: customer.id,
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
      paymentMethod: "credit_card",
      paymentLastFour: lastFour,
      paymentStatus: "paid",
    })
    .returning()
    .get()!;

  // Verify stock availability before creating order
  for (const item of cart.items) {
    const product = db.select({ stockQuantity: products.stockQuantity })
      .from(products)
      .where(eq(products.id, item.productId))
      .get();
    if (!product || product.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${item.productName}` },
        { status: 400 }
      );
    }
  }

  // Create order items and decrement stock
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

    db.update(products)
      .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
      .where(eq(products.id, item.productId))
      .run();
  }

  // Clear cart
  db.delete(cartItems).where(eq(cartItems.sessionId, sessionId)).run();

  return NextResponse.json({
    orderNumber: order.orderNumber,
    total: order.total,
    status: order.status,
  });
}
