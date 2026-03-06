import { NextRequest, NextResponse } from "next/server";
import { seedAll, seedProducts, seedCustomersAndOrders, seedReviews, resetAllData } from "@/lib/seed";

export async function POST(request: NextRequest) {
  // Seed is an internal admin tool — allow in dev and from same-origin in production.
  // External API callers can use x-admin-key if needed.
  if (process.env.NODE_ENV !== "development") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    const adminKey = request.headers.get("x-admin-key");
    const ADMIN_KEY = process.env.ADMIN_API_KEY || "";

    const isSameOrigin = origin && host && new URL(origin).host === host;
    const hasValidKey = ADMIN_KEY.length > 0 && adminKey === ADMIN_KEY;

    if (!isSameOrigin && !hasValidKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
