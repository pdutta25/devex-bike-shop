import { db } from "@/lib/db";
import { customers, orders } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function getCustomerByEmail(email: string) {
  return db.select().from(customers).where(eq(customers.email, email)).get();
}

export async function getCustomerById(id: number) {
  return db.select().from(customers).where(eq(customers.id, id)).get();
}

export async function getAllCustomers() {
  return db
    .select({
      customer: customers,
      orderCount: sql<number>`count(${orders.id})`.as("order_count"),
      totalSpent: sql<number>`COALESCE(sum(${orders.total}), 0)`.as("total_spent"),
    })
    .from(customers)
    .leftJoin(orders, eq(customers.id, orders.customerId))
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt));
}
