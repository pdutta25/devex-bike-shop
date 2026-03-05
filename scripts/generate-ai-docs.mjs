#!/usr/bin/env node
/**
 * AI-powered documentation generator using GitHub Models API (Copilot).
 *
 * Scans the codebase, gathers context, and uses GPT-4o to generate:
 *   1. docs/ARCHITECTURE.md  — Deep architecture documentation
 *   2. docs/USER-EXPERIENCE.md — UX patterns, flows, and design system
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node scripts/generate-ai-docs.mjs
 *
 * In GitHub Actions, GITHUB_TOKEN is provided automatically.
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from "fs";
import { join, relative, dirname } from "path";

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, "docs");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";
const MODEL = "gpt-4o";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function readFile(path) {
  try {
    return readFileSync(path, "utf-8");
  } catch {
    return "";
  }
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

function truncate(str, maxLines = 60) {
  const lines = str.split("\n");
  if (lines.length <= maxLines) return str;
  return lines.slice(0, maxLines).join("\n") + "\n// ... truncated";
}

async function callGitHubModel(systemPrompt, userPrompt) {
  if (!GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN not set. Cannot call GitHub Models API.");
    process.exit(1);
  }

  const res = await fetch(MODEL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub Models API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ─────────────────────────────────────────
// Gather codebase context
// ─────────────────────────────────────────

function gatherArchitectureContext() {
  const sections = [];

  // Package.json
  sections.push("## package.json\n```json\n" + truncate(readFile(join(ROOT, "package.json")), 40) + "\n```");

  // Project structure
  const tree = [];
  function walk(dir, prefix = "", depth = 0) {
    if (depth > 3) return;
    const entries = readdirSync(dir, { withFileTypes: true })
      .filter((e) => !e.name.startsWith(".") && e.name !== "node_modules")
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      tree.push(`${prefix}${entry.isDirectory() ? "📁 " : "📄 "}${entry.name}`);
      if (entry.isDirectory()) walk(join(dir, entry.name), prefix + "  ", depth + 1);
    }
  }
  walk(join(ROOT, "src"));
  sections.push("## Project Tree (src/)\n```\n" + tree.join("\n") + "\n```");

  // Database schema
  sections.push("## Database Schema\n```typescript\n" + truncate(readFile(join(ROOT, "src/lib/db/schema.ts")), 80) + "\n```");

  // Auth module
  sections.push("## Auth Module\n```typescript\n" + truncate(readFile(join(ROOT, "src/lib/auth.ts")), 50) + "\n```");

  // Middleware
  sections.push("## Middleware\n```typescript\n" + truncate(readFile(join(ROOT, "src/middleware.ts")), 40) + "\n```");

  // next.config.ts
  sections.push("## next.config.ts\n```typescript\n" + truncate(readFile(join(ROOT, "next.config.ts")), 40) + "\n```");

  // API routes summary
  const apiRoutes = findFiles(join(ROOT, "src/app/api"), /^route\.ts$/);
  const routeSummary = apiRoutes.map((f) => {
    const rel = relative(ROOT, f);
    const content = readFile(f);
    const methods = [...content.matchAll(/export async function (GET|POST|PUT|DELETE|PATCH)/g)].map((m) => m[1]);
    return `${rel}: ${methods.join(", ")}`;
  });
  sections.push("## API Routes\n```\n" + routeSummary.join("\n") + "\n```");

  // CI/CD workflows
  const workflows = findFiles(join(ROOT, ".github/workflows"), /\.yml$/);
  for (const wf of workflows) {
    sections.push(`## Workflow: ${relative(ROOT, wf)}\n\`\`\`yaml\n${truncate(readFile(wf), 40)}\n\`\`\``);
  }

  // Harness pipeline
  const harness = readFile(join(ROOT, "harness/deploy-devex-bike-shop.yaml"));
  if (harness) {
    sections.push("## Harness CD Pipeline\n```yaml\n" + truncate(harness, 40) + "\n```");
  }

  return sections.join("\n\n");
}

function gatherUXContext() {
  const sections = [];

  // Tailwind config
  sections.push("## Tailwind Config\n```typescript\n" + truncate(readFile(join(ROOT, "tailwind.config.ts")), 60) + "\n```");

  // Global CSS
  sections.push("## Global CSS\n```css\n" + truncate(readFile(join(ROOT, "src/app/globals.css")), 60) + "\n```");

  // Root layout
  sections.push("## Root Layout\n```tsx\n" + truncate(readFile(join(ROOT, "src/app/layout.tsx")), 50) + "\n```");

  // Storefront layout
  sections.push("## Storefront Layout\n```tsx\n" + truncate(readFile(join(ROOT, "src/app/(storefront)/layout.tsx")), 50) + "\n```");

  // Admin layout
  sections.push("## Admin Layout\n```tsx\n" + truncate(readFile(join(ROOT, "src/app/(admin)/layout.tsx")), 50) + "\n```");

  // Home page
  sections.push("## Home Page\n```tsx\n" + truncate(readFile(join(ROOT, "src/app/(storefront)/page.tsx")), 80) + "\n```");

  // Key storefront pages (first 50 lines each)
  const storefrontPages = [
    "bikes/page.tsx",
    "bikes/[slug]/page.tsx",
    "cart/page.tsx",
    "checkout/page.tsx",
    "orders/page.tsx",
    "wishlist/page.tsx",
    "search/page.tsx",
    "account/page.tsx",
  ];
  for (const page of storefrontPages) {
    const content = readFile(join(ROOT, "src/app/(storefront)", page));
    if (content) {
      sections.push(`## Page: ${page}\n\`\`\`tsx\n${truncate(content, 40)}\n\`\`\``);
    }
  }

  // UI Components (list them + read key ones)
  const uiDir = join(ROOT, "src/components/ui");
  if (existsSync(uiDir)) {
    const uiFiles = readdirSync(uiDir).filter((f) => f.endsWith(".tsx"));
    sections.push("## UI Components\n" + uiFiles.map((f) => `- ${f}`).join("\n"));
  }

  // Layout components
  const layoutDir = join(ROOT, "src/components/layout");
  if (existsSync(layoutDir)) {
    for (const f of readdirSync(layoutDir).filter((f) => f.endsWith(".tsx"))) {
      sections.push(`## Layout: ${f}\n\`\`\`tsx\n${truncate(readFile(join(layoutDir, f)), 50)}\n\`\`\``);
    }
  }

  // Hooks
  const hooksDir = join(ROOT, "src/hooks");
  if (existsSync(hooksDir)) {
    for (const f of readdirSync(hooksDir).filter((f) => f.endsWith(".ts"))) {
      sections.push(`## Hook: ${f}\n\`\`\`typescript\n${truncate(readFile(join(hooksDir, f)), 40)}\n\`\`\``);
    }
  }

  // Providers
  const providersDir = join(ROOT, "src/components/providers");
  if (existsSync(providersDir)) {
    for (const f of readdirSync(providersDir).filter((f) => f.endsWith(".tsx"))) {
      sections.push(`## Provider: ${f}\n\`\`\`tsx\n${truncate(readFile(join(providersDir, f)), 40)}\n\`\`\``);
    }
  }

  return sections.join("\n\n");
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function main() {
  console.log("🤖 Generating AI-powered documentation using GitHub Models API...\n");
  ensureDir(DOCS_DIR);

  // ── Architecture Doc ──
  console.log("  📐 Gathering architecture context...");
  const archContext = gatherArchitectureContext();

  console.log("  📐 Calling GitHub Models API for Architecture doc...");
  const archDoc = await callGitHubModel(
    `You are a senior software architect writing comprehensive architecture documentation for a project wiki.
Write in clear, professional markdown. Include diagrams using code blocks where helpful.
Focus on: system design, data flow, technology choices and rationale, security architecture, deployment pipeline, and key design patterns.
Do NOT include a title — start directly with the first section. The title will be added separately.`,
    `Analyze the following codebase context and generate a comprehensive Architecture document.\n\n${archContext}`
  );

  const archMd = `# Architecture\n\n> AI-generated documentation — auto-updated on every push to main.\n\n${archDoc}`;
  writeFileSync(join(DOCS_DIR, "ARCHITECTURE.md"), archMd);
  console.log("  ✅ docs/ARCHITECTURE.md\n");

  // ── User Experience Doc ──
  console.log("  🎨 Gathering UX context...");
  const uxContext = gatherUXContext();

  console.log("  🎨 Calling GitHub Models API for User Experience doc...");
  const uxDoc = await callGitHubModel(
    `You are a senior UX engineer writing comprehensive user experience documentation for a project wiki.
Write in clear, professional markdown. Include visual flow diagrams using text/code blocks where helpful.
Focus on: design system (colors, typography, spacing, animations), user flows (browsing → cart → checkout → order tracking),
component library, responsive design approach, accessibility patterns, state management, and navigation structure.
Do NOT include a title — start directly with the first section. The title will be added separately.`,
    `Analyze the following frontend codebase context and generate a comprehensive User Experience document.\n\n${uxContext}`
  );

  const uxMd = `# User Experience\n\n> AI-generated documentation — auto-updated on every push to main.\n\n${uxDoc}`;
  writeFileSync(join(DOCS_DIR, "USER-EXPERIENCE.md"), uxMd);
  console.log("  ✅ docs/USER-EXPERIENCE.md\n");

  console.log("Done! AI-powered documentation generated in docs/");
}

main().catch((err) => {
  console.error("❌ Failed to generate AI docs:", err.message);
  process.exit(1);
});
