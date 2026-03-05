# Architecture

> Auto-generated on 2026-03-05 19:24:16 UTC

## Tech Stack

| Layer | Technology | Version |
|-------|------------|--------|
| Framework | Next.js (App Router) | 15.1.0 |
| Language | TypeScript | ^5.7.0 |
| UI | React + Tailwind CSS | ^19.0.0 |
| ORM | Drizzle ORM | ^0.38.0 |
| Database | SQLite (better-sqlite3) | ^11.7.0 |
| Validation | Zod | ^3.24.0 |
| Charts | Recharts | ^2.15.0 |

## Project Structure

```
src/
  app/
    (storefront)/     # Customer-facing pages
    (admin)/          # Admin dashboard pages
    api/              # REST API routes
      cart/           # Shopping cart CRUD
      categories/     # Product categories
      checkout/       # Order checkout
      customers/      # Customer CRUD
      health/         # Health check endpoint
      orders/         # Order management
      products/       # Product catalog
      reports/        # Business intelligence (admin)
      reviews/        # Product reviews
      seed/           # Database seeding
      wishlist/       # Customer wishlists
  components/         # Reusable UI components
  hooks/              # Custom React hooks
  lib/
    db/               # Database schema + connection
    queries/          # Drizzle query functions
    auth.ts           # Auth helpers
    constants.ts      # App constants
    utils.ts          # Utility functions
    validations.ts    # Zod schemas
  middleware.ts       # CSRF protection
harness/              # Harness CD pipeline YAML
.github/workflows/    # CI/CD workflows
```

## Security

- **Admin auth**: `x-admin-key` header required for admin endpoints in production
- **Customer auth**: Cookie-based customer identity with ownership verification
- **CSRF**: Origin header validation middleware on all mutation requests
- **Input validation**: Zod schemas on all write endpoints
- **SQL injection**: Drizzle ORM parameterized queries throughout
- **Security headers**: X-Frame-Options, HSTS, nosniff, Referrer-Policy, Permissions-Policy
- **Atomic checkout**: SQLite transaction with `BEGIN IMMEDIATE` for stock management

## CI/CD Pipeline

```
GitHub Actions (CI)          Harness (CD)
─────────────────           ──────────────────
build ──┐                   DEV  → Deploy + Smoke Tests → Auto-Certify
lint  ──┤→ security-scan    SIT  → Deploy + Integration Tests → Manual Certify
test  ──┤→ code-quality     PROD → Manual Approve → Render Deploy → Smoke Tests
        └→ deploy-gate
```

