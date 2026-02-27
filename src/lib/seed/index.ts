import { db } from "@/lib/db";
import { categories, products, customers, orders, orderItems, reviews, wishlists, cartItems } from "@/lib/db/schema";
import { seedCategoriesData, seedProductsData } from "./products";
import { seedCustomersData } from "./customers";
import { seedOrdersData } from "./orders";
import { seedReviewsData } from "./reviews";

export async function seedProducts() {


  // Clear existing products and categories
  db.delete(reviews).run();
  db.delete(orderItems).run();
  db.delete(orders).run();
  db.delete(wishlists).run();
  db.delete(cartItems).run();
  db.delete(products).run();
  db.delete(categories).run();
  db.delete(customers).run();

  const cats = await seedCategoriesData();
  const productCount = await seedProductsData(
    cats.map((c) => ({ id: c.id, slug: c.slug }))
  );

  return { categories: cats.length, products: productCount };
}

export async function seedCustomersAndOrders() {


  // Need products to exist
  const productList = db.select().from(products).all();
  if (productList.length === 0) {
    throw new Error("No products found. Please seed products first.");
  }

  // Clear existing orders and customers
  db.delete(orderItems).run();
  db.delete(orders).run();
  db.delete(reviews).run();
  db.delete(wishlists).run();
  db.delete(customers).run();

  const customerCount = await seedCustomersData();
  const customerList = db.select().from(customers).all();
  const orderResult = await seedOrdersData(customerList, productList);

  return { customers: customerCount, ...orderResult };
}

export async function seedReviews() {


  const customerList = db.select().from(customers).all();
  const productList = db.select().from(products).all();

  if (customerList.length === 0 || productList.length === 0) {
    throw new Error("Need customers and products first. Seed them before reviews.");
  }

  db.delete(reviews).run();

  const reviewCount = await seedReviewsData(
    customerList.map((c) => c.id),
    productList.map((p) => p.id)
  );

  return { reviews: reviewCount };
}

export async function seedAll() {

  await resetAllData();

  const prodResult = await seedProducts();
  const orderResult = await seedCustomersAndOrders();
  const reviewResult = await seedReviews();

  return {
    ...prodResult,
    ...orderResult,
    ...reviewResult,
  };
}

export async function resetAllData() {


  db.delete(cartItems).run();
  db.delete(wishlists).run();
  db.delete(reviews).run();
  db.delete(orderItems).run();
  db.delete(orders).run();
  db.delete(customers).run();
  db.delete(products).run();
  db.delete(categories).run();

  return { message: "All data has been reset" };
}
