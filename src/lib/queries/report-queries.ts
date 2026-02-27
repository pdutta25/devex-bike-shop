import { db } from "@/lib/db";
import { orders, orderItems, products, categories, customers } from "@/lib/db/schema";
import { sql, eq, and, gte, lte, desc, ne } from "drizzle-orm";

export async function getRevenueOverTime(period: "daily" | "weekly" | "monthly" = "daily", startDate?: string, endDate?: string) {
  const groupBy = period === "daily"
    ? sql`date(${orders.createdAt})`
    : period === "weekly"
    ? sql`strftime('%Y-W%W', ${orders.createdAt})`
    : sql`strftime('%Y-%m', ${orders.createdAt})`;

  const conditions = [ne(orders.status, "cancelled"), eq(orders.paymentStatus, "paid")];
  if (startDate) conditions.push(gte(orders.createdAt, startDate));
  if (endDate) conditions.push(lte(orders.createdAt, endDate));

  return db
    .select({
      period: groupBy.as("period"),
      revenue: sql<number>`sum(${orders.total})`.as("revenue"),
      orderCount: sql<number>`count(*)`.as("order_count"),
    })
    .from(orders)
    .where(and(...conditions))
    .groupBy(groupBy)
    .orderBy(groupBy);
}

export async function getTopProducts(limit = 10) {
  return db
    .select({
      productId: orderItems.productId,
      productName: orderItems.productName,
      totalRevenue: sql<number>`sum(${orderItems.totalPrice})`.as("total_revenue"),
      totalQuantity: sql<number>`sum(${orderItems.quantity})`.as("total_quantity"),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(ne(orders.status, "cancelled"))
    .groupBy(orderItems.productId, orderItems.productName)
    .orderBy(desc(sql`total_revenue`))
    .limit(limit);
}

export async function getOrdersByStatus() {
  return db
    .select({
      status: orders.status,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(orders)
    .groupBy(orders.status);
}

export async function getCategoryPerformance() {
  return db
    .select({
      categoryId: products.categoryId,
      categoryName: categories.name,
      revenue: sql<number>`sum(${orderItems.totalPrice})`.as("revenue"),
      orderCount: sql<number>`count(DISTINCT ${orders.id})`.as("order_count"),
      unitsSold: sql<number>`sum(${orderItems.quantity})`.as("units_sold"),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(ne(orders.status, "cancelled"))
    .groupBy(products.categoryId, categories.name)
    .orderBy(desc(sql`revenue`));
}

export async function getDashboardStats() {
  const [revenueResult, orderCountResult, productCountResult, customerCountResult] = await Promise.all([
    db
      .select({ total: sql<number>`sum(${orders.total})` })
      .from(orders)
      .where(and(ne(orders.status, "cancelled"), eq(orders.paymentStatus, "paid")))
      .get(),
    db.select({ count: sql<number>`count(*)` }).from(orders).get(),
    db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.isActive, true)).get(),
    db.select({ count: sql<number>`count(*)` }).from(customers).get(),
  ]);

  const avgOrderResult = await db
    .select({ avg: sql<number>`avg(${orders.total})` })
    .from(orders)
    .where(and(ne(orders.status, "cancelled"), eq(orders.paymentStatus, "paid")))
    .get();

  return {
    totalRevenue: revenueResult?.total ?? 0,
    totalOrders: orderCountResult?.count ?? 0,
    activeProducts: productCountResult?.count ?? 0,
    totalCustomers: customerCountResult?.count ?? 0,
    avgOrderValue: Math.round(avgOrderResult?.avg ?? 0),
  };
}

export async function getRecentOrders(limit = 5) {
  return db
    .select({
      order: orders,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}
