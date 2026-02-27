import { db } from "@/lib/db";
import { categories, products } from "@/lib/db/schema";
import { slugify, randomBetween, pickRandom } from "@/lib/utils";
import { CATEGORIES, BIKE_COLORS } from "@/lib/constants";

const BRANDS = ["Apex Cycles", "VeloForge", "TerraPedal", "SwiftRide", "PeakCraft", "UrbanGlide", "TrailBlaze", "EcoVelo"];
const ADJECTIVES = ["Apex", "Swift", "Titan", "Blaze", "Echo", "Vortex", "Zenith", "Pulse", "Surge", "Drift", "Ridge", "Phantom"];
const NOUNS = ["Carbon", "Alloy", "Trail", "Peak", "Racer", "Explorer", "Storm", "Flash", "Bolt", "Thunder"];
const SUFFIXES = ["Pro", "Elite", "Sport", "Comp", "Expert", "SL", "XT", "DX"];

interface CategorySpecs {
  priceRange: [number, number];
  materials: string[];
  wheelSizes: string[];
  speedRange: [number, number];
  weightRange: [number, number];
  frameSizes: string[];
}

const CATEGORY_SPECS: Record<string, CategorySpecs> = {
  road: { priceRange: [120000, 400000], materials: ["Carbon", "Aluminum"], wheelSizes: ["700c"], speedRange: [11, 24], weightRange: [15, 22], frameSizes: ["XS", "S", "M", "L", "XL"] },
  mountain: { priceRange: [100000, 380000], materials: ["Aluminum", "Carbon"], wheelSizes: ["27.5\"", "29\""], speedRange: [10, 12], weightRange: [25, 32], frameSizes: ["S", "M", "L", "XL"] },
  hybrid: { priceRange: [60000, 200000], materials: ["Aluminum"], wheelSizes: ["700c"], speedRange: [7, 21], weightRange: [22, 30], frameSizes: ["XS", "S", "M", "L", "XL"] },
  electric: { priceRange: [150000, 400000], materials: ["Aluminum"], wheelSizes: ["27.5\"", "700c"], speedRange: [8, 11], weightRange: [40, 55], frameSizes: ["S", "M", "L", "XL"] },
  kids: { priceRange: [60000, 150000], materials: ["Aluminum", "Steel"], wheelSizes: ["16\"", "20\"", "24\""], speedRange: [1, 7], weightRange: [15, 25], frameSizes: ["S", "M"] },
  cruiser: { priceRange: [60000, 180000], materials: ["Steel", "Aluminum"], wheelSizes: ["26\""], speedRange: [1, 7], weightRange: [28, 38], frameSizes: ["S", "M", "L"] },
  gravel: { priceRange: [110000, 380000], materials: ["Carbon", "Aluminum"], wheelSizes: ["700c"], speedRange: [11, 22], weightRange: [18, 25], frameSizes: ["XS", "S", "M", "L", "XL"] },
  bmx: { priceRange: [60000, 160000], materials: ["Chromoly", "Aluminum"], wheelSizes: ["20\""], speedRange: [1, 1], weightRange: [20, 28], frameSizes: ["One Size"] },
};

const DESCRIPTIONS: Record<string, string[]> = {
  road: [
    "Engineered for speed and efficiency on paved roads. Lightweight frame with aerodynamic design for maximum performance.",
    "A race-ready machine with responsive handling and a comfortable geometry for long-distance rides.",
    "Precision-crafted for serious cyclists. Exceptional power transfer and wind-cutting aerodynamics.",
    "The ultimate road companion. Stiff enough for sprinting, compliant enough for all-day comfort.",
    "Built for speed demons. Ultra-light construction with professional-grade components.",
    "Dominate the peloton with this competition-tuned rocket. Every gram optimized for velocity.",
  ],
  mountain: [
    "Built to conquer rugged terrain. Full suspension absorbs impacts while maintaining pedaling efficiency.",
    "Trail-ready and adventure-proven. Aggressive geometry for technical descents and confident climbing.",
    "Dominate any trail with confidence. Engineered for grip, control, and durability in all conditions.",
    "Your gateway to the mountains. Responsive handling meets bombproof construction.",
    "Tackle the gnarliest trails with ease. Progressive geometry and plush suspension.",
    "Mountain mastery starts here. Built tough for rock gardens, root sections, and steep drops.",
  ],
  hybrid: [
    "The perfect all-rounder. Equally at home on city streets and light trails.",
    "Versatile comfort meets everyday practicality. Ideal for commuting and weekend adventures.",
    "Blending road efficiency with off-road capability. The do-everything bike.",
    "Your daily ride, upgraded. Smooth rolling tires with upright, comfortable positioning.",
    "City to trail in one bike. Lightweight yet durable for mixed-terrain riding.",
    "The ultimate commuter. Fast on pavement, confident on gravel paths.",
  ],
  electric: [
    "Power-assisted cycling at its finest. Silent motor provides a smooth, natural boost.",
    "Go further with integrated electric assist. Premium battery delivers impressive range.",
    "The future of cycling. Powerful motor seamlessly blends with your pedaling effort.",
    "Conquer hills effortlessly. Advanced e-bike technology in a sleek, modern package.",
    "Revolutionize your ride. Class-leading motor and battery for unstoppable adventures.",
    "Electric freedom meets cycling joy. Commute faster, ride further, smile bigger.",
  ],
  kids: [
    "Safe, fun, and built to last. Perfect for young riders learning the joy of cycling.",
    "Growing riders deserve quality. Lightweight frame with age-appropriate components.",
    "First adventures start here. Durable construction with easy-to-use controls.",
    "Built for little shredders. Kid-friendly sizing with real bike performance.",
    "The perfect first bike. Quality components in a kid-approved colorful package.",
    "Inspire a lifetime of cycling. Safe, reliable, and exciting for young riders.",
  ],
  cruiser: [
    "Relax and roll in style. Classic cruiser design with modern comfort features.",
    "Beach vibes meet boulevard style. Effortless pedaling with a laid-back riding position.",
    "The essence of chill. Sweep-back handlebars and a plush saddle for maximum comfort.",
    "Cruise in comfort. Timeless design with a smooth, easy ride.",
    "Sunday vibes, every day. Classic styling with balloon tires for a cushioned ride.",
    "Laid-back luxury on two wheels. The most comfortable way to explore your neighborhood.",
  ],
  gravel: [
    "Adventure-ready for mixed terrain. Drop bars meet wide tires for limitless exploration.",
    "Road speed with off-road capability. The ultimate adventure bike for any surface.",
    "Where the pavement ends, your adventure begins. Built for gravel, dirt, and beyond.",
    "Explore without limits. Versatile geometry handles everything from bike-packing to racing.",
    "Gravel grinding excellence. Fast on road, confident on dirt, unstoppable everywhere.",
    "The all-surface explorer. Engineered for adventure cycling at its finest.",
  ],
  bmx: [
    "Trick-ready and built tough. Engineered for the skatepark, street, and dirt jumps.",
    "Freestyle freedom in a bombproof package. Strong enough for the biggest sends.",
    "Built to shred. Responsive handling for tricks, jumps, and technical riding.",
    "The park weapon. Lightweight yet indestructible for progressive BMX riding.",
    "Street-proven toughness. From bunny hops to barspins, this bike delivers.",
    "Unleash your creativity. Purpose-built for BMX with professional-grade durability.",
  ],
};

function generateProductName(usedNames: Set<string>): string {
  let name = "";
  let attempts = 0;
  do {
    const adj = pickRandom(ADJECTIVES);
    const noun = pickRandom(NOUNS);
    const suffix = pickRandom(SUFFIXES);
    name = `${adj} ${noun} ${suffix}`;
    attempts++;
  } while (usedNames.has(name) && attempts < 100);
  usedNames.add(name);
  return name;
}

function generateColors(): string {
  const count = randomBetween(2, 4);
  const shuffled = [...BIKE_COLORS].sort(() => Math.random() - 0.5);
  return JSON.stringify(shuffled.slice(0, count));
}

export async function seedCategoriesData() {
  const inserted = [];
  for (const cat of CATEGORIES) {
    const result = db
      .insert(categories)
      .values({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: `/images/categories/${cat.slug}.svg`,
        displayOrder: cat.order,
      })
      .returning()
      .get();
    if (result) inserted.push(result);
  }
  return inserted;
}

export async function seedProductsData(categoryList: { id: number; slug: string }[]) {
  const usedNames = new Set<string>();
  const usedSlugs = new Set<string>();
  let totalInserted = 0;

  for (const cat of categoryList) {
    const specs = CATEGORY_SPECS[cat.slug];
    const descs = DESCRIPTIONS[cat.slug] || DESCRIPTIONS.hybrid;
    const count = 6;

    for (let i = 0; i < count; i++) {
      const name = generateProductName(usedNames);
      let slug = slugify(name);
      while (usedSlugs.has(slug)) {
        slug = `${slug}-${randomBetween(1, 999)}`;
      }
      usedSlugs.add(slug);

      const price = randomBetween(specs.priceRange[0], specs.priceRange[1]);
      const hasComparePrice = Math.random() > 0.7;
      const compareAtPrice = hasComparePrice ? Math.round(price * (1 + Math.random() * 0.3)) : null;
      const stock = Math.random() > 0.15 ? randomBetween(5, 50) : randomBetween(0, 3);

      db.insert(products)
        .values({
          name,
          slug,
          description: descs[i % descs.length],
          price,
          compareAtPrice,
          categoryId: cat.id,
          brand: pickRandom(BRANDS),
          sku: `${cat.slug.slice(0, 3).toUpperCase()}-${String(totalInserted + 1).padStart(4, "0")}`,
          stockQuantity: stock,
          lowStockThreshold: 5,
          frameMaterial: pickRandom(specs.materials),
          frameSizes: JSON.stringify(specs.frameSizes),
          colors: generateColors(),
          weightLbs: randomBetween(specs.weightRange[0] * 10, specs.weightRange[1] * 10) / 10,
          wheelSize: pickRandom(specs.wheelSizes),
          speeds: randomBetween(specs.speedRange[0], specs.speedRange[1]),
          imageUrl: `/images/bikes/${slug}.svg`,
          isFeatured: i === 0,
          isActive: true,
        })
        .run();

      totalInserted++;
    }
  }

  return totalInserted;
}
