import { NextRequest, NextResponse } from "next/server";
import { seedAll, seedProducts, seedCustomersAndOrders, seedReviews, resetAllData } from "@/lib/seed";
import { isAdminAuthorized } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await request.json();

  try {
    let result;
    switch (action) {
      case "seed_products":
        result = await seedProducts();
        break;
      case "seed_orders":
        result = await seedCustomersAndOrders();
        break;
      case "seed_reviews":
        result = await seedReviews();
        break;
      case "seed_all":
        result = await seedAll();
        break;
      case "reset":
        result = await resetAllData();
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed operation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
