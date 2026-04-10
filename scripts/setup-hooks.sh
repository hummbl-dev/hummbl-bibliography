#!/bin/bash

# Setup Git hooks for HUMMBL Bibliography
# Installs pre-commit hook directly to .git/hooks/ (no Husky required).
# Also supports Husky if it's already initialized.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Setting up Git hooks for HUMMBL Bibliography..."

if [ ! -d "$REPO_ROOT/.git" ]; then
    echo "Error: Not a git repository: $REPO_ROOT"
    exit 1
fi

# ---------------------------------------------------------------------------
# Install pre-commit hook directly to .git/hooks/
# ---------------------------------------------------------------------------

HOOK_PATH="$REPO_ROOT/.git/hooks/pre-commit"

cat > "$HOOK_PATH" << 'HOOK_EOF'
#!/bin/sh
# HUMMBL Bibliography pre-commit hook
# Validates .bib files and Memory Palace alias collisions before commit.

REPO_ROOT="$(git rev-parse --show-toplevel)"
TOOLKIT="$REPO_ROOT/toolkit"

echo "Running pre-commit validation..."

# 1. Validate .bib files if any are staged
if git diff --cached --name-only | grep -q '\.bib$'; then
    echo "Validating bibliography files..."
    cd "$TOOLKIT" && node src/validate.js ../bibliography --ci
    if [ $? -ne 0 ]; then
        echo "Validation failed. Commit blocked." >&2
        echo "Run 'cd toolkit && npm run validate' for the full report." >&2
        exit 1
    fi
    echo "Bibliography validation passed"
fi

# 2. Check Memory Palace alias collisions if memoryPalace.ts is staged
if git diff --cached --name-only | grep -q 'memoryPalace\.ts$'; then
    echo "Checking Memory Palace alias collisions..."
    cd "$TOOLKIT" && node scripts/check-memory-palace-aliases.js
    if [ $? -ne 0 ]; then
        echo "Memory Palace check failed. Commit blocked." >&2
        echo "Run 'cd toolkit && npm run validate:memory-palace' to debug." >&2
        exit 1
    fi
fi

echo "Pre-commit checks passed"
HOOK_EOF

chmod +x "$HOOK_PATH"
echo "Installed: $HOOK_PATH"

# ---------------------------------------------------------------------------
# Also update Husky hook if .husky/ already exists
# ---------------------------------------------------------------------------

HUSKY_HOOK="$TOOLKIT/.husky/pre-commit"
if [ -d "$TOOLKIT/.husky" ]; then
    cat > "$HUSKY_HOOK" << 'HUSKY_EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

REPO_ROOT="$(git rev-parse --show-toplevel)"
TOOLKIT="$REPO_ROOT/toolkit"

echo "Running pre-commit validation..."

if git diff --cached --name-only | grep -q '\.bib$'; then
    echo "Validating bibliography files..."
    cd "$TOOLKIT" && node src/validate.js ../bibliography --ci
    if [ $? -ne 0 ]; then
        echo "Validation failed. Commit blocked." >&2
        exit 1
    fi
fi

if git diff --cached --name-only | grep -q 'memoryPalace\.ts$'; then
    echo "Checking Memory Palace alias collisions..."
    cd "$TOOLKIT" && node scripts/check-memory-palace-aliases.js
    if [ $? -ne 0 ]; then
        echo "Memory Palace check failed. Commit blocked." >&2
        exit 1
    fi
fi

echo "Pre-commit checks passed"
HUSKY_EOF
    chmod +x "$HUSKY_HOOK"
    echo "Updated Husky hook: $HUSKY_HOOK"
fi

echo ""
echo "Installed hooks:"
echo "  pre-commit: .bib validation + Memory Palace alias collision check"
echo ""
echo "To bypass (not recommended): git commit --no-verify"
