#!/usr/bin/env node
/**
 * AI-powered documentation generator using GitHub Models API (Copilot).
 *
 * Scans the codebase, gathers compact context, and uses GPT-4o-mini to generate:
 *   docs/USER-EXPERIENCE.md — UX patterns, flows, and design system
 *
 * Note: GitHub Models free tier has an 8000 token limit.
 * Context is kept tight to fit within that budget.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node scripts/generate-ai-docs.mjs
 *
 * In GitHub Actions, GITHUB_TOKEN is provided automatically.
 */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const DOCS_DIR = join(ROOT, "docs");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";
const MODEL = "gpt-4o-mini";

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

function truncate(str, maxLines = 20) {
  const lines = str.split("\n");
  if (lines.length <= maxLines) return str;
  return lines.slice(0, maxLines).join("\n") + "\n// ...truncated";
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
      max_tokens: 3000,
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
// Gather compact UX context
// ─────────────────────────────────────────

function gatherUXContext() {
  const parts = [];

  // Design tokens from tailwind (just the theme extend)
  const tw = readFile(join(ROOT, "tailwind.config.ts"));
  const themeMatch = tw.match(/extend:\s*\{[\s\S]*?\n\s{4}\}/);
  if (themeMatch) parts.push("Tailwind theme:\n" + themeMatch[0].slice(0, 600));

  // Global CSS classes (compact)
  const css = readFile(join(ROOT, "src/app/globals.css"));
  const classes = [...css.matchAll(/\.([\w-]+)\s*\{[^}]{0,120}\}/g)].map((m) => m[0]).join("\n");
  if (classes) parts.push("CSS classes:\n" + classes.slice(0, 400));

  // Storefront pages list
  const pages = [
    "/ — Home: hero, featured bikes, categories",
    "/bikes — Catalog with filters and sorting",
    "/bikes/[slug] — Product detail, specs, reviews",
    "/cart — Shopping cart with quantity controls",
    "/checkout — Delivery/pickup, address, payment form",
    "/checkout/confirmation — Order confirmation",
    "/orders — Order history list",
    "/orders/[num] — Order detail with status timeline",
    "/wishlist — Saved items",
    "/search — Product search results",
    "/account — Customer profile",
    "/admin — Dashboard with KPIs, revenue chart",
    "/admin/products — Product CRUD",
    "/admin/inventory — Stock management",
    "/admin/reports — Analytics",
  ];
  parts.push("Pages:\n" + pages.join("\n"));

  // UI component names
  const uiDir = join(ROOT, "src/components/ui");
  if (existsSync(uiDir)) {
    const comps = readdirSync(uiDir).filter((f) => f.endsWith(".tsx")).map((f) => f.replace(".tsx", ""));
    parts.push("UI components: " + comps.join(", "));
  }

  // Hooks
  const hooksDir = join(ROOT, "src/hooks");
  if (existsSync(hooksDir)) {
    const hooks = readdirSync(hooksDir).filter((f) => f.endsWith(".ts")).map((f) => f.replace(".ts", ""));
    parts.push("Hooks: " + hooks.join(", "));
  }

  // Design summary
  parts.push("Design: Dark theme #0f0f1a bg, amber #f59e0b accent, glassmorphism header, Inter font, SVG bike illustrations, fade-in/hover animations, responsive mobile+tablet+desktop");

  return parts.join("\n\n");
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function main() {
  console.log("🤖 Generating AI-powered UX documentation...\n");
  ensureDir(DOCS_DIR);

  console.log("  🎨 Gathering UX context...");
  const uxContext = gatherUXContext();
  console.log(`  📏 Context size: ~${Math.round(uxContext.length / 4)} tokens\n`);

  console.log("  🎨 Calling GitHub Models API...");
  const uxDoc = await callGitHubModel(
    `You are a senior UX engineer writing user experience documentation for a project wiki. Write professional markdown. Cover: design system (colors, typography, animations), user flows (browse → cart → checkout → tracking), component library, responsive design, navigation structure. Be concise but comprehensive.`,
    `Generate a User Experience doc for this Next.js e-commerce app:\n\n${uxContext}`
  );

  const uxMd = `# User Experience\n\n> AI-generated documentation — auto-updated on every push to main.\n\n${uxDoc}`;
  writeFileSync(join(DOCS_DIR, "USER-EXPERIENCE.md"), uxMd);
  console.log("  ✅ docs/USER-EXPERIENCE.md\n");

  console.log("Done!");
}

main().catch((err) => {
  console.error("❌ Failed to generate AI docs:", err.message);
  process.exit(1);
});
