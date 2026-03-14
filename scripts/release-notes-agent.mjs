#!/usr/bin/env node
/**
 * AI-powered release notes agent using GitHub Models API (Copilot).
 *
 * Gathers git context (commits, diffs since last tag), calls GPT-4o-mini,
 * and writes structured release notes to a file.
 *
 * Note: GitHub Models free tier has an 8000 token limit.
 * Context is kept tight to fit within that budget.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node scripts/release-notes-agent.mjs
 *
 * Environment variables:
 *   GITHUB_TOKEN   — Required. GitHub token for Models API auth.
 *   OUTPUT_FILE    — Where to write notes (default: /tmp/release-notes.md)
 *   SHORT_SHA      — Short commit SHA (used in fallback)
 *   BRANCH         — Branch name (used in fallback)
 *   BUILD_NUMBER   — CI build number (used in fallback)
 *
 * In GitHub Actions, GITHUB_TOKEN is provided automatically.
 */

import { execSync } from "child_process";
import { writeFileSync } from "fs";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL_ENDPOINT = "https://models.inference.ai.azure.com/chat/completions";
const MODEL = "gpt-4o-mini";
const OUTPUT_FILE = process.env.OUTPUT_FILE || "/tmp/release-notes.md";
const SHORT_SHA = process.env.SHORT_SHA || "";
const BRANCH = process.env.BRANCH || "";
const BUILD_NUMBER = process.env.BUILD_NUMBER || "";

const SYSTEM_PROMPT = `You write release notes for a business audience. Use this exact template:

## 🚀 What's New
(New features or capabilities added)

## 🔄 What Changed
(Improvements or updates to existing functionality)

## 🐛 What's Fixed
(Bug fixes and resolved issues)

## 📝 In a nutshell
(One plain-English sentence anyone on the team can understand)

Write in plain English. Describe WHAT changed and WHY it matters — not file names or commit hashes. If a section has no changes, write NA. Keep each bullet to one line.`;

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024, timeout: 15_000 }).trim();
  } catch {
    return "";
  }
}

function truncate(str, maxLen = 5000) {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "\n// ...truncated for token budget";
}

async function callGitHubModel(systemPrompt, userPrompt) {
  if (!GITHUB_TOKEN) {
    console.error("❌ GITHUB_TOKEN not set. Cannot call GitHub Models API.");
    process.exit(1);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  const res = await fetch(MODEL_ENDPOINT, {
    method: "POST",
    signal: controller.signal,
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
      max_tokens: 2000,
    }),
  });

  clearTimeout(timeout);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub Models API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

// ─────────────────────────────────────────
// Git context gathering
// ─────────────────────────────────────────

function gatherGitContext() {
  // Last commit message (the one that triggered this build)
  const commitMsg = git('log -1 --pretty=format:"%s"');

  // Diff of just the last commit
  const diffStat = git("diff HEAD~1..HEAD --stat").split("\n").pop() || "";

  // Actual code diff for the last commit (filtered, truncated for token budget)
  const rawDiff = git(
    `diff HEAD~1..HEAD -- "*.ts" "*.tsx" "*.yml" "*.json" "*.yaml" ":!package-lock.json" ":!*.test.*"`
  );
  const diff = truncate(rawDiff, 5000);

  return { commitMsg, diffStat, diff };
}

// ─────────────────────────────────────────
// Fallback
// ─────────────────────────────────────────

function buildFallbackNotes() {
  const parts = [
    "## 📝 In a nutshell",
    "Pipeline changes and maintenance updates.",
  ];
  const info = [];
  if (SHORT_SHA) info.push(`**Commit:** ${SHORT_SHA}`);
  if (BRANCH) info.push(`**Branch:** ${BRANCH}`);
  if (BUILD_NUMBER) info.push(`**Build:** #${BUILD_NUMBER}`);
  if (info.length) {
    parts.push("", "## Release Info", info.join(" | "));
  }
  return parts.join("\n");
}

// ─────────────────────────────────────────
// Main
// ─────────────────────────────────────────

async function main() {
  console.log("🤖 Release Notes Agent\n");

  // 1. Gather git context (last commit only)
  console.log("  📋 Gathering git context...");
  const { commitMsg, diffStat, diff } = gatherGitContext();
  console.log(`     Commit:   ${commitMsg}`);
  console.log(`     Summary:  ${diffStat}`);
  console.log(`     Diff:     ~${Math.round(diff.length / 4)} tokens\n`);

  // 2. Build the user prompt
  const userPrompt = [
    "Commit message:",
    commitMsg,
    "",
    `Change summary: ${diffStat}`,
    "",
    "Code diff:",
    "```",
    diff,
    "```",
    "",
    "Write release notes for this change in plain English.",
  ].join("\n");

  // 3. Call the AI model
  let notes;
  try {
    console.log("  🧠 Calling GitHub Models API...");
    notes = await callGitHubModel(SYSTEM_PROMPT, userPrompt);
    console.log("  ✅ AI generation succeeded.\n");
  } catch (err) {
    console.error(`  ⚠️  AI generation failed: ${err.message}`);
    console.error("     Using fallback release notes.\n");
    notes = buildFallbackNotes();
  }

  // 4. Append commit history to notes
  const lastTag = git("describe --tags --abbrev=0 HEAD~1");
  const base = lastTag || "HEAD~10";
  const commitLog = git(`log ${base}..HEAD --pretty=format:"- %s (%h)" --no-merges`);
  if (commitLog) {
    notes += `\n\n---\n\n## 📋 Commits in this release\n\n${commitLog}`;
  }

  // 5. Write output
  writeFileSync(OUTPUT_FILE, notes);
  console.log(`  📄 Written to: ${OUTPUT_FILE}`);
  console.log("\nDone!");
}

main().catch((err) => {
  console.error("❌ Failed to generate release notes:", err.message);
  process.exit(1);
});
