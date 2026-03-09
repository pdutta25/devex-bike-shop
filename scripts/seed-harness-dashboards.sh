#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Seed Harness Dashboards with Pipeline Execution History
# ═══════════════════════════════════════════════════════════
#
# Triggers multiple pipeline executions with varied data to
# populate Harness dashboards and metrics for demo purposes.
#
# Prerequisites:
#   export HARNESS_API_KEY="your-api-key"
#   export HARNESS_ACCOUNT_ID="your-account-id"
#   export HARNESS_ORG_ID="default"
#   export HARNESS_PROJECT_ID="devexbikeshop"
#
# Usage:
#   ./scripts/seed-harness-dashboards.sh          # 10 runs (default)
#   ./scripts/seed-harness-dashboards.sh 20        # 20 runs
#   ./scripts/seed-harness-dashboards.sh 5 15      # 5 runs, 15s apart
#
# ═══════════════════════════════════════════════════════════

set -euo pipefail

# ── Config ──
NUM_RUNS="${1:-10}"
DELAY="${2:-10}"
PIPELINE_ID="deploydevexbikeshop"
BASE_URL="https://app.harness.io/pipeline/api"
SCOPE="accountIdentifier=${HARNESS_ACCOUNT_ID}&orgIdentifier=${HARNESS_ORG_ID}&projectIdentifier=${HARNESS_PROJECT_ID}"
REPO_URL="https://github.com/pdutta25/devex-bike-shop"

# ── Validate ──
if [ -z "${HARNESS_API_KEY:-}" ] || [ -z "${HARNESS_ACCOUNT_ID:-}" ]; then
  echo "❌ Missing required env vars. Set:"
  echo "   HARNESS_API_KEY"
  echo "   HARNESS_ACCOUNT_ID"
  echo "   HARNESS_ORG_ID"
  echo "   HARNESS_PROJECT_ID"
  exit 1
fi

# ── Simulated commit data ──
# Realistic fake commit SHAs, branches, and PR numbers
SHAS=("a3f7c21" "b8d4e56" "c1a9f03" "d5e2b78" "e7f3a94"
      "f2c8d15" "1a4b7e3" "2d9c6f8" "3e5a1b7" "4f8d2c9"
      "5a1e3f6" "6b4f7d2" "7c8a9e5" "8d2b4f1" "9e5c7a3"
      "0f1d8b6" "a2e4c97" "b3f5d08" "c6a7e19" "d8b9f2a")

BRANCHES=("main" "main" "main" "feature/cart-update" "main"
          "main" "fix/checkout-bug" "main" "main" "feature/search"
          "main" "main" "fix/payment-flow" "main" "main"
          "feature/reviews" "main" "main" "fix/mobile-nav" "main")

PR_NUMS=("none" "42" "none" "43" "44"
         "none" "45" "46" "none" "47"
         "48" "none" "49" "50" "none"
         "51" "52" "none" "53" "54")

TRIGGERED_BY=("GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions"
              "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions"
              "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions"
              "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions" "GitHub Actions")

# ── Banner ──
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   HARNESS DASHBOARD SEEDER               ║"
echo "╠══════════════════════════════════════════╣"
echo "║  Runs:     $NUM_RUNS                              ║"
echo "║  Delay:    ${DELAY}s between runs                 ║"
echo "║  Pipeline: $PIPELINE_ID          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

SUCCESS=0
FAILED=0

for i in $(seq 1 "$NUM_RUNS"); do
  IDX=$(( (i - 1) % ${#SHAS[@]} ))
  SHA="${SHAS[$IDX]}"
  BRANCH="${BRANCHES[$IDX]}"
  PR="${PR_NUMS[$IDX]}"
  BUILD_NUM=$((100 + i))
  RUN_ID=$((9000000000 + RANDOM))
  EXEC_NAME="${SHA}-${BUILD_NUM}"

  if [ "$PR" != "none" ]; then
    EXEC_NAME="PR${PR}-${SHA}-${BUILD_NUM}"
  fi

  echo "[$i/$NUM_RUNS] Triggering: $EXEC_NAME (branch: $BRANCH)"

  PAYLOAD=$(jq -n \
    --arg name "$EXEC_NAME" \
    --arg sha "$SHA" \
    --arg pr "$PR" \
    --arg build "$BUILD_NUM" \
    --arg branch "$BRANCH" \
    --arg repo "$REPO_URL" \
    --arg runid "$RUN_ID" \
    '{
      notesForPipelineExecution: ("Triggered by GitHub Actions | Run #" + $build + " | Branch: " + $branch + " | Commit: " + $sha),
      pipeline: {
        identifier: "deploydevexbikeshop",
        tags: {
          commitSha: $sha,
          prNumber: $pr,
          buildNumber: $build,
          branch: $branch,
          executionName: $name
        },
        variables: [
          { name: "commitSha", type: "String", value: $sha },
          { name: "buildNumber", type: "String", value: $build },
          { name: "branch", type: "String", value: $branch },
          { name: "prNumber", type: "String", value: $pr },
          { name: "triggeredBy", type: "String", value: "GitHub Actions" },
          { name: "repoUrl", type: "String", value: $repo },
          { name: "runId", type: "String", value: ($runid | tostring) }
        ]
      }
    }')

  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    "${BASE_URL}/pipeline/execute/${PIPELINE_ID}?${SCOPE}" \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${HARNESS_API_KEY}" \
    -d "$PAYLOAD")

  CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | head -n -1)

  if [ "$CODE" -ge 200 ] && [ "$CODE" -lt 300 ]; then
    EXEC_ID=$(echo "$BODY" | jq -r '.data.planExecution.uuid // "unknown"')
    echo "   ✅ Triggered (HTTP $CODE) — ID: $EXEC_ID"
    SUCCESS=$((SUCCESS + 1))
  else
    echo "   ❌ Failed (HTTP $CODE)"
    echo "   $BODY" | head -1
    FAILED=$((FAILED + 1))
  fi

  # Delay between runs (skip after last)
  if [ "$i" -lt "$NUM_RUNS" ]; then
    echo "   ⏳ Waiting ${DELAY}s..."
    sleep "$DELAY"
  fi
done

echo ""
echo "════════════════════════════════════════════"
echo "  Done! Triggered: $SUCCESS ✅  Failed: $FAILED ❌"
echo "  Pipelines are executing in Harness now."
echo "  Dashboards will populate as runs complete."
echo "════════════════════════════════════════════"
echo ""
