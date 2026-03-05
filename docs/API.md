# API Reference

> Auto-generated from source code on 2026-03-05 19:24:16 UTC

## Authentication

| Method | Description |
|--------|-------------|
| `x-admin-key` header | Required for admin endpoints (product CRUD, reports, order status updates) |
| `customer_id` cookie | Required for customer-scoped endpoints (orders, wishlist, reviews) |
| None | Public endpoints (product listing, categories, health) |

## Endpoints

### Cart

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/cart` | None | `addToCartSchema` |
| `POST` | `/api/cart` | None | `addToCartSchema` |
| `DELETE` | `/api/cart/:id` | None | `updateCartSchema` |
| `PUT` | `/api/cart/:id` | None | `updateCartSchema` |

### Categories

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/categories` | None | — |

### Checkout

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `POST` | `/api/checkout` | None | `checkoutSchema` |

### Customers

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/customers` | Admin (x-admin-key) | `customerSchema` |
| `POST` | `/api/customers` | Admin (x-admin-key) | `customerSchema` |
| `GET` | `/api/customers/:id` | Customer (cookie) | — |
| `PUT` | `/api/customers/:id` | Customer (cookie) | — |

### Health

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/health` | None | — |

### Orders

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/orders` | Admin (x-admin-key) | — |
| `GET` | `/api/orders/:id` | Admin (x-admin-key) | — |
| `PUT` | `/api/orders/:id` | Admin (x-admin-key) | — |
| `POST` | `/api/orders/:id/cancel` | Customer (cookie) | — |

**`GET /api/orders`** query params: `customer_id`, `customer_id`, `page`, `page`, `limit`, `limit`, `status`

### Products

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/products` | Admin (x-admin-key) | `productSchema` |
| `POST` | `/api/products` | Admin (x-admin-key) | `productSchema` |
| `DELETE` | `/api/products/:id` | Admin (x-admin-key) | — |
| `GET` | `/api/products/:id` | Admin (x-admin-key) | — |
| `PUT` | `/api/products/:id` | Admin (x-admin-key) | — |

**`GET /api/products`** query params: `category`, `minPrice`, `minPrice`, `maxPrice`, `maxPrice`, `search`, `sort`, `page`, `page`, `limit`, `limit`, `featured`

### Reports

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/reports/category-performance` | Admin (x-admin-key) | — |
| `GET` | `/api/reports/orders-by-status` | Admin (x-admin-key) | — |
| `GET` | `/api/reports/revenue` | Admin (x-admin-key) | — |
| `GET` | `/api/reports/top-products` | Admin (x-admin-key) | — |

**`GET /api/reports/revenue`** query params: `period`, `start`, `end`

### Reviews

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/reviews` | Customer (cookie) | `reviewInputSchema` |
| `POST` | `/api/reviews` | Customer (cookie) | `reviewInputSchema` |

### Seed

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `POST` | `/api/seed` | Admin (x-admin-key) | — |

### Wishlist

| Method | Path | Auth | Validation |
|--------|------|------|------------|
| `GET` | `/api/wishlist` | Customer (cookie) | `wishlistSchema` |
| `POST` | `/api/wishlist` | Customer (cookie) | `wishlistSchema` |
| `DELETE` | `/api/wishlist/:id` | Customer (cookie) | — |

## Validation Schemas

### `customerSchema`

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `firstName` | string | Yes |
| `lastName` | string | Yes |
| `phone` | string | No |
| `addressLine1` | string | No |
| `addressLine2` | string | No |
| `city` | string | No |
| `state` | string | No |
| `zipCode` | string | No |

### `checkoutSchema`

| Field | Type | Required |
|-------|------|----------|
| `email` | string | Yes |
| `firstName` | string | Yes |
| `lastName` | string | Yes |
| `phone` | string | No |
| `fulfillmentType` | enum | Yes |
| `addressLine1` | string | No |
| `city` | string | No |
| `state` | string | No |
| `zipCode` | string | No |
| `cardNumber` | string | Yes |
| `cardExpiry` | string | Yes |
| `cardCvv` | string | Yes |
| `cardholderName` | string | Yes |

### `productSchema`

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `description` | string | Yes |
| `price` | number | Yes |
| `compareAtPrice` | number | No |
| `categoryId` | number | Yes |
| `brand` | string | Yes |
| `sku` | string | Yes |
| `stockQuantity` | number | Yes |
| `lowStockThreshold` | number | Yes |
| `frameMaterial` | string | No |
| `frameSizes` | string | No |
| `colors` | string | No |
| `weightLbs` | number | No |
| `wheelSize` | string | No |
| `speeds` | number | No |
| `imageUrl` | string | Yes |
| `isFeatured` | boolean | Yes |
| `isActive` | boolean | Yes |

### `reviewSchema`

| Field | Type | Required |
|-------|------|----------|
| `productId` | number | Yes |
| `customerId` | number | Yes |
| `rating` | number | Yes |
| `title` | string | No |
| `body` | string | No |

