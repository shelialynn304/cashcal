#!/usr/bin/env bash
set -euo pipefail

echo "Setting up Edge Over Luck (cashcal) dev environment..."
echo "Node version: $(node --version)"

echo ""
echo "This is a static HTML/CSS/vanilla JS site with zero npm dependencies -- no 'npm install' needed."

echo ""
echo "Running the repo's own validation scripts once to confirm the environment is healthy..."
node scripts/js-syntax-check.js
node scripts/math-sanity-check.js
node scripts/site-audit.js

echo ""
echo "Setup complete."
echo "Run 'bash .devcontainer/postStart.sh' any time to (re)start the local static preview server on port 8080."
