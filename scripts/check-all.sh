#!/usr/bin/env bash
# Runs the same checks CI runs on every pull request.
# Usage: bash scripts/check-all.sh   (from the repo root)
set -uo pipefail
cd "$(dirname "$0")/.."

failed=0
run() {
  echo "== $*"
  if ! "$@"; then
    echo "!! FAILED: $*"
    failed=1
  fi
  echo
}

run node scripts/js-syntax-check.js
run node scripts/math-sanity-check.js
run node scripts/site-audit.js
run python3 scripts/ci-verifier.py

if [ "$failed" -ne 0 ]; then
  echo "One or more checks failed. Fix them before pushing."
  exit 1
fi
echo "All checks passed."
