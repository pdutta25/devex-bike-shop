import { db } from "@/lib/db";
import { orders, orderItems, customers, products } from "@/lib/db/schema";
import { eq, desc, sql, and, gte, lte } from "drizzle-orm";

export async function getOrders(filters: { customerId?: number; status?: string; page?: number; limit?: number } = {}) {
  const { customerId, status, page = 1, limit = 20 } = filters;
  const conditions = [];

  if (customerId) conditions.push(eq(orders.customerId, customerId));
  if (status) conditions.push(eq(orders.status, status));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const [items, countResult] = await Promise.all([
    db
      .select({
        order: orders,
        customerFirstName: customers.firstName,
        customerLastName: customers.lastName,
        customerEmail: customers.email,
      })
      .from(orders)
      .leftJoin(customers, eq(orders.customerId, customers.id))
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(orders).where(whereClause),
  ]);

  return {
    orders: items,
    pagination: { page, limit, total: countResult[0]?.count ?? 0, totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit) },
  };
}

export async function getOrderByNumber(orderNumber: string) {
  const order = db
    .select({
      order: orders,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.orderNumber, orderNumber))
    .get();

  if (!order) return null;

  const items = db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.order.id));

  return { ...order, items: await items };
}

export async function getOrderById(id: number) {
  const order = db
    .select({
      order: orders,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
      customerPhone: customers.phone,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id))
    .get();

  if (!order) return null;

  const items = db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, id));

  return { ...order, items: await items };
}

export async function getCustomerOrders(customerId: number) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}

export async function getOrderItemCount(orderId: number) {
  const result = db
    .select({ count: sql<number>`count(*)` })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))
    .get();
  return result?.count ?? 0;
}
