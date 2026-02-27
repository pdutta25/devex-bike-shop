import { db } from "@/lib/db";
import { reviews, products } from "@/lib/db/schema";
import { randomBetween, pickRandom } from "@/lib/utils";
import { eq, sql } from "drizzle-orm";

const RATING_DISTRIBUTION = [
  ...Array(5).fill(1),
  ...Array(5).fill(2),
  ...Array(15).fill(3),
  ...Array(35).fill(4),
  ...Array(40).fill(5),
];

const TITLES: Record<number, string[]> = {
  5: ["Excellent bike!", "Best bike I've owned", "Amazing performance", "Absolutely love it", "Worth every penny", "Incredible quality"],
  4: ["Great value", "Solid build quality", "Smooth ride", "Very happy", "Good investment", "Rides like a dream"],
  3: ["Decent for the price", "Good but heavy", "Average performer", "Does the job", "OK bike overall", "Meets expectations"],
  2: ["Not impressed", "Expected better", "Disappointing quality", "Mediocre at best", "Needs improvement"],
  1: ["Would not recommend", "Poor quality", "Very disappointed", "Waste of money", "Terrible experience"],
};

const BODIES: Record<number, string[]> = {
  5: [
    "This bike exceeds all expectations. The ride quality is phenomenal and the build quality is top-notch.",
    "I've been riding for years and this is hands-down the best bike I've owned. Handles like a dream.",
    "Smooth shifting, responsive braking, and a comfortable geometry. Can't ask for more at this price.",
    "From the first ride I knew this was special. Perfect balance of performance and comfort.",
    "Outstanding craftsmanship. Every detail has been thought through. Highly recommend to anyone.",
  ],
  4: [
    "Really solid bike. A few minor things could be better but overall I'm very satisfied with my purchase.",
    "Great ride quality and the components are well-chosen. Good value for the money.",
    "Handles well on both pavement and light trails. The frame is sturdy and the paint job is beautiful.",
    "Very pleased with this purchase. It's become my go-to bike for daily commutes.",
    "Comfortable geometry and smooth rolling. Wish the saddle was a bit better but that's easily swapped.",
  ],
  3: [
    "It's a decent bike for the price. Nothing spectacular but it gets the job done reliably.",
    "Middle of the road in terms of quality. The frame is nice but some components feel cheap.",
    "Rides OK. The shifting could be smoother and it's a bit heavier than advertised.",
    "Fair enough bike for casual riding. Don't expect top-tier performance though.",
    "Average build quality. It works fine but I might upgrade some components eventually.",
  ],
  2: [
    "The build quality doesn't match the price point. Several components feel flimsy.",
    "Disappointing experience. Shifting is rough and the brakes needed adjustment out of the box.",
    "Not what I expected based on the description. The frame feels heavy and sluggish.",
    "Had issues with the gearing from day one. Customer service was helpful but still frustrating.",
  ],
  1: [
    "Arrived with multiple issues. The derailleur was bent and the wheels were out of true.",
    "Worst bike purchase I've ever made. Returned within a week.",
    "Cheaply made despite the premium price tag. Very disappointed.",
  ],
};

export async function seedReviewsData(customerIds: number[], productIds: number[]) {
  let count = 0;
  const reviewPairs = new Set<string>();

  for (let i = 0; i < 300; i++) {
    const customerId = pickRandom(customerIds);
    const productId = pickRandom(productIds);
    const pairKey = `${productId}-${customerId}`;

    if (reviewPairs.has(pairKey)) continue;
    reviewPairs.add(pairKey);

    const rating = pickRandom(RATING_DISTRIBUTION);
    const isVerified = Math.random() > 0.2;

    const daysAgo = randomBetween(1, 90);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().replace("T", " ").slice(0, 19);

    try {
      db.insert(reviews)
        .values({
          productId,
          customerId,
          rating,
          title: pickRandom(TITLES[rating]),
          body: pickRandom(BODIES[rating]),
          isVerifiedPurchase: isVerified,
          createdAt: dateStr,
        })
        .run();
      count++;
    } catch {
      // duplicate, skip
    }
  }

  // Update product average ratings
  const allProducts = db.select({ id: products.id }).from(products).all();
  for (const p of allProducts) {
    const stats = db
      .select({
        avg: sql<number>`avg(${reviews.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, p.id))
      .get();

    if (stats && stats.count > 0) {
      db.update(products)
        .set({
          averageRating: Math.round((stats.avg ?? 0) * 10) / 10,
          reviewCount: stats.count,
        })
        .where(eq(products.id, p.id))
        .run();
    }
  }

  return count;
}
