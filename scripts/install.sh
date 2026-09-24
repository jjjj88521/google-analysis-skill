#!/usr/bin/env bash
set -euo pipefail

PACKAGE_SOURCE="google-analysis-skill"
PRINT_HELP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      if [[ $# -lt 2 ]]; then
        echo "Error: --source requires a value" >&2
        exit 1
      fi
      PACKAGE_SOURCE="$2"
      shift 2
      ;;
    --help|-h)
      PRINT_HELP=true
      shift
      ;;
    *)
      echo "Error: unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

if [[ "$PRINT_HELP" == "true" ]]; then
  cat <<'EOF'
Install ga-skill globally.

Usage:
  bash install.sh [--source <npm-or-git-source>]

Examples:
  bash install.sh
  bash install.sh --source google-analysis-skill
  bash install.sh --source github:owner/repo
  bash install.sh --source /absolute/path/to/google-analysis-skill
EOF
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but not found in PATH." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but not found in PATH." >&2
  exit 1
fi

echo "Installing ga-skill from source: $PACKAGE_SOURCE"
npm install -g "$PACKAGE_SOURCE"

echo "Install complete. Validate with: ga-skill --help"
