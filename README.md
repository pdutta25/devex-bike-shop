# DevEx Bike Shop

A full-stack demo e-commerce application for a premium bike shop — built with Next.js 14+, Drizzle ORM, SQLite, and Tailwind CSS. Features a dark-themed storefront, shopping cart, mock checkout, admin dashboard with sales analytics, and one-click data seeding.

> **Note:** This is a demo application. No real authentication or payment processing is implemented.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14+ (App Router, Server Components) |
| **Language** | TypeScript |
| **Database** | SQLite via better-sqlite3 |
| **ORM** | Drizzle ORM |
| **Styling** | Tailwind CSS |
| **Charts** | Recharts |
| **Validation** | Zod |
| **Font** | Inter (Google Fonts) |

---

## Features

### Storefront
- **Homepage** — Hero section, featured bikes, category grid, promo banner
- **Catalog** — Browse 48 bikes across 8 categories with sort and filter options
- **Product Detail** — SVG bike illustrations, specs table, customer reviews, related products
- **Shopping Cart** — Server-persisted cart with size/color selection
- **Checkout** — Delivery/pickup toggle, shipping address, mock payment form
- **Order Tracking** — Order history with visual status timeline
- **Wishlist** — Save bikes for later
- **Search** — Full-text product search
- **Account** — Cookie-based customer identification (no passwords)

### Admin Dashboard
- **KPI Cards** — Total revenue, orders, average order value, product count
- **Revenue Chart** — 30-day revenue trend (Recharts)
- **Order Management** — View all orders, update status, cancel orders
- **Product CRUD** — Create, edit, delete products with full spec management
- **Inventory** — Stock levels, low-stock alerts, inline stock updates
- **Reports** — Revenue trends, top products, orders by status, category performance
- **Data Seeding** — One-click seed/reset with progress indicators

### Design
- **Dark Theme** — Deep charcoal (`#0f0f1a`) with amber accent (`#f59e0b`)
- **Glassmorphism** — Frosted glass header with scroll detection
- **SVG Illustrations** — Category-themed bike illustrations (no external images)
- **Responsive** — Mobile, tablet, and desktop layouts
- **Animations** — Fade-in, hover effects, gradient shifts, glow shadows

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/pdutta25/devex-bike-shop.git
cd devex-bike-shop
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Seed Demo Data

1. Navigate to [http://localhost:3000/admin/seed](http://localhost:3000/admin/seed)
2. Click **"Seed Everything"** to populate the database with:
   - 48 products across 8 categories
   - 60 customers
   - 200 orders (spanning 90 days)
   - 280+ reviews

The SQLite database is automatically created at `data/bikeshop.db` on first run.

---

## Project Structure

```
src/
├── app/
│   ├── (storefront)/        # Customer-facing pages
│   │   ├── bikes/           # Catalog + product detail
│   │   ├── category/        # Category filtered views
│   │   ├── cart/             # Shopping cart
│   │   ├── checkout/        # Checkout + confirmation
│   │   ├── orders/          # Order history + detail
│   │   ├── wishlist/        # Saved items
│   │   ├── search/          # Search results
│   │   └── account/         # Customer account
│   ├── (admin)/admin/       # Admin dashboard
│   │   ├── orders/          # Order management
│   │   ├── products/        # Product CRUD
│   │   ├── inventory/       # Stock management
│   │   ├── reports/         # Analytics charts
│   │   ├── customers/       # Customer list
│   │   └── seed/            # Data seeding controls
│   └── api/                 # REST API routes
├── components/
│   ├── ui/                  # Reusable UI primitives
│   ├── layout/              # Header, footer, admin sidebar
│   ├── cart/                # Cart icon
│   └── providers/           # Context providers
├── lib/
│   ├── db/                  # Schema, connection, migrations
│   ├── queries/             # Database query functions
│   ├── seed/                # Data generation modules
│   ├── utils.ts             # Helpers (formatPrice, cn, etc.)
│   ├── constants.ts         # Enums, categories, config
│   └── validations.ts       # Zod schemas
└── hooks/                   # Custom React hooks
```

---

## Database Schema

| Table | Description |
|---|---|
| `categories` | 8 bike categories (road, mountain, hybrid, electric, kids, cruiser, gravel, bmx) |
| `products` | Bikes with pricing, specs, stock levels, ratings |
| `customers` | Customer profiles (email-based identification) |
| `orders` | Orders with status tracking, fulfillment type, payment info |
| `order_items` | Line items with product snapshots |
| `reviews` | Star ratings and written reviews |
| `wishlists` | Saved products per customer |
| `cart_items` | Session-based shopping cart |

---

## Key Pages

| Route | Description |
|---|---|
| `/` | Homepage with hero, featured bikes, categories |
| `/bikes` | Full catalog with filters and sorting |
| `/bikes/[slug]` | Product detail with specs and reviews |
| `/category/[slug]` | Category filtered view |
| `/cart` | Shopping cart |
| `/checkout` | Checkout form |
| `/orders` | Order history |
| `/admin` | Dashboard with KPIs and charts |
| `/admin/products` | Product management |
| `/admin/inventory` | Stock levels and alerts |
| `/admin/reports` | Sales analytics |
| `/admin/seed` | Data seeding controls |

---

## Scripts

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## License

[MIT](LICENSE)
