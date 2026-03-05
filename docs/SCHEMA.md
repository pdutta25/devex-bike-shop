# Database Schema

> Auto-generated from `src/lib/db/schema.ts` on 2026-03-05 19:24:16 UTC

**ORM:** Drizzle ORM | **Database:** SQLite (better-sqlite3) | **Storage:** `data/bikeshop.db`

## `categories`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `name` | TEXT | NOT NULL, UNIQUE |
| `slug` | TEXT | NOT NULL, UNIQUE |
| `description` | TEXT | — |
| `image_url` | TEXT | — |
| `display_order` | INTEGER | NOT NULL, DEFAULT 0 |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `products`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `name` | TEXT | NOT NULL |
| `slug` | TEXT | NOT NULL, UNIQUE |
| `description` | TEXT | NOT NULL |
| `price` | INTEGER | NOT NULL |
| `category_id` | INTEGER | NOT NULL, FK → categories.id |
| `brand` | TEXT | NOT NULL |
| `sku` | TEXT | NOT NULL, UNIQUE |
| `stock_quantity` | INTEGER | NOT NULL, DEFAULT 0 |
| `low_stock_threshold` | INTEGER | NOT NULL, DEFAULT 5 |
| `frame_material` | TEXT | — |
| `frame_sizes` | TEXT | — |
| `wheel_size` | TEXT | — |
| `speeds` | INTEGER | — |
| `image_url` | TEXT | NOT NULL |
| `image_urls` | TEXT | NOT NULL, DEFAULT false |
| `is_active` | INTEGER | NOT NULL, DEFAULT true |
| `average_rating` | REAL | DEFAULT 0 |
| `review_count` | INTEGER | DEFAULT 0 |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |
| `updated_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `customers`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `email` | TEXT | NOT NULL, UNIQUE |
| `first_name` | TEXT | NOT NULL |
| `last_name` | TEXT | NOT NULL |
| `phone` | TEXT | — |
| `address_line1` | TEXT | — |
| `address_line2` | TEXT | — |
| `city` | TEXT | — |
| `state` | TEXT | — |
| `zip_code` | TEXT | — |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |
| `updated_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `orders`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `order_number` | TEXT | NOT NULL, UNIQUE |
| `customer_id` | INTEGER | NOT NULL, FK → customers.id |
| `status` | TEXT | NOT NULL, DEFAULT "pending" |
| `fulfillment_type` | TEXT | NOT NULL, DEFAULT 0 |
| `shipping_address_line2` | TEXT | — |
| `shipping_city` | TEXT | — |
| `shipping_state` | TEXT | — |
| `shipping_zip` | TEXT | — |
| `payment_method` | TEXT | NOT NULL, DEFAULT "credit_card" |
| `payment_last_four` | TEXT | — |
| `payment_status` | TEXT | NOT NULL, DEFAULT "pending" |
| `notes` | TEXT | — |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |
| `updated_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `order_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `order_id` | INTEGER | NOT NULL |
| `product_id` | INTEGER | NOT NULL, FK → products.id |
| `product_name` | TEXT | NOT NULL |
| `product_sku` | TEXT | NOT NULL |
| `quantity` | INTEGER | NOT NULL |
| `unit_price` | INTEGER | NOT NULL |
| `selected_color` | TEXT | — |

## `reviews`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `product_id` | INTEGER | NOT NULL |
| `customer_id` | INTEGER | NOT NULL, FK → customers.id |
| `rating` | INTEGER | NOT NULL |
| `title` | TEXT | — |
| `body` | TEXT | — |
| `is_verified_purchase` | INTEGER | NOT NULL, DEFAULT false |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `wishlists`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `customer_id` | INTEGER | NOT NULL |
| `product_id` | INTEGER | NOT NULL |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## `cart_items`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT |
| `session_id` | TEXT | NOT NULL |
| `product_id` | INTEGER | NOT NULL, FK → products.id |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1 |
| `selected_size` | TEXT | — |
| `selected_color` | TEXT | — |
| `created_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |
| `updated_at` | TEXT | NOT NULL, DEFAULT sql`(datetime('now' |

## Relationships

```
categories  1 ──── * products
customers   1 ──── * orders
customers   1 ──── * reviews
customers   1 ──── * wishlists
orders      1 ──── * order_items
products    1 ──── * order_items
products    1 ──── * reviews
products    1 ──── * wishlists
products    1 ──── * cart_items (via session)
```

