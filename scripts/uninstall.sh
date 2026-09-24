#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not found in PATH." >&2
  exit 1
fi

echo "Uninstalling ga-skill"
npm uninstall -g google-analysis-skill || true

echo "Uninstall complete."
