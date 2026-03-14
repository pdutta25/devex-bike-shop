#!/usr/bin/env node
/**
 * Auto-generate project documentation from source code.
 *
 * Scans the codebase and produces:
 *   1. docs/API.md          — REST API reference (routes, methods, auth, validation)
 *   2. docs/SCHEMA.md       — Database schema reference (tables, columns, types)
 *   3. docs/ARCHITECTURE.md — Project structure and architecture overview
 *   4. docs/README.md       — Combined project documentation
 *
 * Usage:  node scripts/generate-docs.mjs
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join, relative, dirname } from "path";

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, "docs");
const API_DIR = join(ROOT, "src/app/api");
const SCHEMA_FILE = join(ROOT, "src/lib/db/schema.ts");
const VALIDATIONS_FILE = join(ROOT, "src/lib/validations.ts");
const PACKAGE_FILE = join(ROOT, "package.json");

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function findFiles(dir, pattern) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFiles(full, pattern));
    } else if (entry.name.match(pattern)) {
      results.push(full);
    }
  }
  return results;
}

function readFile(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

// ─────────────────────────────────────────
// 1. API Reference Generator
// ─────────────────────────────────────────

function generateApiDocs() {
  const routeFiles = findFiles(API_DIR, /^route\.ts$/);
  const validations = readFile(VALIDATIONS_FILE);

  // Extract Zod schema names and their fields
  const schemas = {};
  const schemaRegex = /export const (\w+)\s*=\s*z\.object\(\{([\s\S]*?)\}\)/g;
  let match;
  while ((match = schemaRegex.exec(validations)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields = [];
    const fieldRegex = /(\w+):\s*z\.(\w+)\(([^)]*)\)([\s\S]*?)(?=,\s*\w+:|$)/g;
    let fm;
    while ((fm = fieldRegex.exec(body)) !== null) {
      const optional = fm[4].includes(".optional()");
      const nullable = fm[4].includes(".nullable()");
      fields.push({
        name: fm[1],
        type: fm[2],
        optional: optional || nullable,
      });
    }
    schemas[name] = fields;
  }

  const endpoints = [];

  for (const file of routeFiles) {
    const rel = relative(API_DIR, file);
    const routePath = "/" + dirname(rel)
      .replace(/\\/g, "/")
      .replace(/\[(\w+)\]/g, ":$1");
    const apiPath = "/api" + (routePath === "/." ? "" : routePath);

    const content = readFile(file);

    // Extract HTTP methods
    const methods = [];
    const methodRegex = /export async function (GET|POST|PUT|DELETE|PATCH)\s*\(/g;
    let mm;
    while ((mm = methodRegex.exec(content)) !== null) {
      methods.push(mm[1]);
    }

    // Detect auth requirements
    const hasAdminAuth = content.includes("isAdminAuthorized");
    const hasCustomerAuth = content.includes("getAuthenticatedCustomerId") || content.includes("isOwnerOrAdmin");

    // Detect validation schema used
    const schemaMatch = content.match(/(\w+)\.safeParse/);
    const schemaName = schemaMatch ? schemaMatch[1] : null;

    // Detect query params
    const queryParams = [];
    const qpRegex = /params\.get\("(\w+)"\)/g;
    let qm;
    while ((qm = qpRegex.exec(content)) !== null) {
      queryParams.push(qm[1]);
    }

    for (const method of methods) {
      const auth = hasAdminAuth && method !== "GET"
        ? "Admin (x-admin-key)"
        : hasAdminAuth
          ? "Admin (x-admin-key)"
          : hasCustomerAuth
            ? "Customer (cookie)"
            : "None";

      endpoints.push({
        method,
        path: apiPath,
        auth,
        schema: schemaName,
        queryParams: method === "GET" ? queryParams : [],
      });
    }
  }

  // Sort endpoints by path then method
  endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

  // Build markdown
  let md = `# API Reference\n\n`;
  md += `> Auto-generated from source code on ${timestamp()}\n\n`;
  md += `## Authentication\n\n`;
  md += `| Method | Description |\n|--------|-------------|\n`;
  md += `| \`x-admin-key\` header | Required for admin endpoints (product CRUD, reports, order status updates) |\n`;
  md += `| \`customer_id\` cookie | Required for customer-scoped endpoints (orders, wishlist, reviews) |\n`;
  md += `| None | Public endpoints (product listing, categories, health) |\n\n`;

  md += `## Endpoints\n\n`;

  // Group by resource
  const groups = {};
  for (const ep of endpoints) {
    const resource = ep.path.split("/")[2] || "root";
    if (!groups[resource]) groups[resource] = [];
    groups[resource].push(ep);
  }

  for (const [resource, eps] of Object.entries(groups)) {
    md += `### ${resource.charAt(0).toUpperCase() + resource.slice(1)}\n\n`;
    md += `| Method | Path | Auth | Validation |\n|--------|------|------|------------|\n`;
    for (const ep of eps) {
      const validation = ep.schema ? `\`${ep.schema}\`` : "—";
      md += `| \`${ep.method}\` | \`${ep.path}\` | ${ep.auth} | ${validation} |\n`;
    }
    md += `\n`;

    // Add query params if any
    for (const ep of eps) {
      if (ep.queryParams.length > 0) {
        md += `**\`${ep.method} ${ep.path}\`** query params: ${ep.queryParams.map(p => `\`${p}\``).join(", ")}\n\n`;
      }
    }
  }

  // Add validation schemas
  md += `## Validation Schemas\n\n`;
  for (const [name, fields] of Object.entries(schemas)) {
    md += `### \`${name}\`\n\n`;
    md += `| Field | Type | Required |\n|-------|------|----------|\n`;
    for (const f of fields) {
      md += `| \`${f.name}\` | ${f.type} | ${f.optional ? "No" : "Yes"} |\n`;
    }
    md += `\n`;
  }

  return md;
}

// ─────────────────────────────────────────
// 2. Database Schema Generator
// ─────────────────────────────────────────

function generateSchemaDocs() {
  const content = readFile(SCHEMA_FILE);
  if (!content) return "# Database Schema\n\nSchema file not found.\n";

  let md = `# Database Schema\n\n`;
  md += `> Auto-generated from \`src/lib/db/schema.ts\` on ${timestamp()}\n\n`;
  md += `**ORM:** Drizzle ORM | **Database:** SQLite (better-sqlite3) | **Storage:** \`data/bikeshop.db\`\n\n`;

  // Parse table definitions
  const tableRegex = /export const (\w+) = sqliteTable\("(\w+)",\s*\{([\s\S]*?)\}(?:,\s*\(table\)[\s\S]*?\])?\);/g;
  let tm;

  while ((tm = tableRegex.exec(content)) !== null) {
    const varName = tm[1];
    const tableName = tm[2];
    const body = tm[3];

    md += `## \`${tableName}\`\n\n`;
    md += `| Column | Type | Constraints |\n|--------|------|-------------|\n`;

    // Parse columns
    const colRegex = /(\w+):\s*(text|integer|real)\("(\w+)"(?:,\s*\{[^}]*\})?\)([\s\S]*?)(?=,\s*\w+:|$)/g;
    let cm;
    while ((cm = colRegex.exec(body)) !== null) {
      const colName = cm[3];
      const colType = cm[2].toUpperCase();
      const rest = cm[4];

      const constraints = [];
      if (rest.includes(".primaryKey")) constraints.push("PRIMARY KEY");
      if (rest.includes("autoIncrement")) constraints.push("AUTOINCREMENT");
      if (rest.includes(".notNull()")) constraints.push("NOT NULL");
      if (rest.includes(".unique()")) constraints.push("UNIQUE");
      if (rest.includes(".references(")) {
        const refMatch = rest.match(/references\(\(\)\s*=>\s*(\w+)\.(\w+)\)/);
        if (refMatch) constraints.push(`FK → ${refMatch[1]}.${refMatch[2]}`);
      }
      if (rest.includes(".default(")) {
        const defMatch = rest.match(/\.default\(([^)]+)\)/);
        if (defMatch) constraints.push(`DEFAULT ${defMatch[1]}`);
      }

      md += `| \`${colName}\` | ${colType} | ${constraints.join(", ") || "—"} |\n`;
    }
    md += `\n`;
  }

  // Entity Relationship summary
  md += `## Relationships\n\n`;
  md += `\`\`\`\n`;
  md += `categories  1 ──── * products\n`;
  md += `customers   1 ──── * orders\n`;
  md += `customers   1 ──── * reviews\n`;
  md += `customers   1 ──── * wishlists\n`;
  md += `orders      1 ──── * order_items\n`;
  md += `products    1 ──── * order_items\n`;
  md += `products    1 ──── * reviews\n`;
  md += `products    1 ──── * wishlists\n`;
  md += `products    1 ──── * cart_items (via session)\n`;
  md += `\`\`\`\n\n`;

  return md;
}

// ─────────────────────────────────────────
// 3. Architecture Overview Generator
// ─────────────────────────────────────────

function generateArchDocs() {
  const pkg = JSON.parse(readFile(PACKAGE_FILE));

  let md = `# Architecture\n\n`;
  md += `> Auto-generated on ${timestamp()}\n\n`;

  md += `## Tech Stack\n\n`;
  md += `| Layer | Technology | Version |\n|-------|------------|--------|\n`;
  md += `| Framework | Next.js (App Router) | ${pkg.dependencies?.next || "—"} |\n`;
  md += `| Language | TypeScript | ${pkg.dependencies?.typescript || "—"} |\n`;
  md += `| UI | React + Tailwind CSS | ${pkg.dependencies?.react || "—"} |\n`;
  md += `| ORM | Drizzle ORM | ${pkg.dependencies?.["drizzle-orm"] || "—"} |\n`;
  md += `| Database | SQLite (better-sqlite3) | ${pkg.dependencies?.["better-sqlite3"] || "—"} |\n`;
  md += `| Validation | Zod | ${pkg.dependencies?.zod || "—"} |\n`;
  md += `| Charts | Recharts | ${pkg.dependencies?.recharts || "—"} |\n\n`;

  md += `## Project Structure\n\n`;
  md += `\`\`\`\n`;
  md += `src/\n`;
  md += `  app/\n`;
  md += `    (storefront)/     # Customer-facing pages\n`;
  md += `    (admin)/          # Admin dashboard pages\n`;
  md += `    api/              # REST API routes\n`;
  md += `      cart/           # Shopping cart CRUD\n`;
  md += `      categories/     # Product categories\n`;
  md += `      checkout/       # Order checkout\n`;
  md += `      customers/      # Customer CRUD\n`;
  md += `      health/         # Health check endpoint\n`;
  md += `      orders/         # Order management\n`;
  md += `      products/       # Product catalog\n`;
  md += `      reports/        # Business intelligence (admin)\n`;
  md += `      reviews/        # Product reviews\n`;
  md += `      seed/           # Database seeding\n`;
  md += `      wishlist/       # Customer wishlists\n`;
  md += `  components/         # Reusable UI components\n`;
  md += `  hooks/              # Custom React hooks\n`;
  md += `  lib/\n`;
  md += `    db/               # Database schema + connection\n`;
  md += `    queries/          # Drizzle query functions\n`;
  md += `    auth.ts           # Auth helpers\n`;
  md += `    constants.ts      # App constants\n`;
  md += `    utils.ts          # Utility functions\n`;
  md += `    validations.ts    # Zod schemas\n`;
  md += `  middleware.ts       # CSRF protection\n`;
  md += `harness/              # Harness CD pipeline YAML\n`;
  md += `.github/workflows/    # CI/CD workflows\n`;
  md += `\`\`\`\n\n`;

  md += `## Security\n\n`;
  md += `- **Admin auth**: \`x-admin-key\` header required for admin endpoints in production\n`;
  md += `- **Customer auth**: Cookie-based customer identity with ownership verification\n`;
  md += `- **CSRF**: Origin header validation middleware on all mutation requests\n`;
  md += `- **Input validation**: Zod schemas on all write endpoints\n`;
  md += `- **SQL injection**: Drizzle ORM parameterized queries throughout\n`;
  md += `- **Security headers**: X-Frame-Options, HSTS, nosniff, Referrer-Policy, Permissions-Policy\n`;
  md += `- **Atomic checkout**: SQLite transaction with \`BEGIN IMMEDIATE\` for stock management\n\n`;

  md += `## CI/CD Pipeline\n\n`;
  md += `\`\`\`\n`;
  md += `GitHub Actions (CI)          Harness (CD)\n`;
  md += `─────────────────           ──────────────────\n`;
  md += `build ──┐                   DEV  → Deploy + Smoke Tests → Auto-Certify\n`;
  md += `lint  ──┤→ security-scan    SIT  → Deploy + Integration Tests → Manual Certify\n`;
  md += `test  ──┤→ code-quality     PROD → Manual Approve → Render Deploy → Smoke Tests\n`;
  md += `        └→ deploy-gate\n`;
  md += `\`\`\`\n\n`;

  return md;
}

// ─────────────────────────────────────────
// 4. Combined README
// ─────────────────────────────────────────

function generateReadme(apiMd, schemaMd, archMd) {
  const pkg = JSON.parse(readFile(PACKAGE_FILE));

  let md = `# ${pkg.name || "DevEx Bike Shop"} — Documentation\n\n`;
  md += `> Auto-generated on ${timestamp()}. Do not edit manually — run \`npm run docs\` to regenerate.\n\n`;

  md += `## Table of Contents\n\n`;
  md += `- [User Experience](./USER-EXPERIENCE.md) 🤖\n`;
  md += `- [Architecture](./ARCHITECTURE.md)\n`;
  md += `- [API Reference](./API.md)\n`;
  md += `- [Database Schema](./SCHEMA.md)\n\n`;

  md += `## Quick Start\n\n`;
  md += `\`\`\`bash\n`;
  md += `# Install dependencies\nnpm install\n\n`;
  md += `# Set up environment\ncp .env.example .env\n\n`;
  md += `# Run development server (auto-seeds database)\nnpm run dev\n\n`;
  md += `# Build for production\nnpm run build && npm start\n\`\`\`\n\n`;

  md += `## Environment Variables\n\n`;
  md += `| Variable | Required | Description |\n|----------|----------|-------------|\n`;
  md += `| \`ADMIN_API_KEY\` | Production | API key for admin endpoints |\n\n`;

  md += `---\n\n`;
  md += `See individual docs for details: [Architecture](./ARCHITECTURE.md) | [API](./API.md) | [Schema](./SCHEMA.md)\n`;

  return md;
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

console.log("Generating documentation...\n");

ensureDir(DOCS_DIR);

const apiMd = generateApiDocs();
writeFileSync(join(DOCS_DIR, "API.md"), apiMd);
console.log("  \u2705 docs/API.md");

const schemaMd = generateSchemaDocs();
writeFileSync(join(DOCS_DIR, "SCHEMA.md"), schemaMd);
console.log("  \u2705 docs/SCHEMA.md");

const archMd = generateArchDocs();
writeFileSync(join(DOCS_DIR, "ARCHITECTURE.md"), archMd);
console.log("  \u2705 docs/ARCHITECTURE.md");

const readmeMd = generateReadme(apiMd, schemaMd, archMd);
writeFileSync(join(DOCS_DIR, "README.md"), readmeMd);
console.log("  \u2705 docs/README.md");

console.log("\nDone! Documentation generated in docs/");
