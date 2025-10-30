#!/bin/bash

# Setup Git hooks for HUMMBL Bibliography
# This script configures pre-commit hooks using Husky

set -e

echo "🔧 Setting up Git hooks for HUMMBL Bibliography..."

# Check if we're in the right directory
if [ ! -f "../toolkit/package.json" ]; then
    echo "❌ Error: Must be run from scripts/ directory"
    exit 1
fi

# Navigate to toolkit directory
cd ../toolkit

# Check if Husky is installed
if [ ! -d "node_modules/husky" ]; then
    echo "📦 Installing Husky..."
    npm install
fi

# Initialize Husky
echo "🎣 Initializing Husky..."
npx husky install .husky

# Create pre-commit hook
echo "📝 Creating pre-commit hook..."
cat > .husky/pre-commit << 'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit validation..."

cd toolkit

# Run validation on staged .bib files
if git diff --cached --name-only | grep -q '\.bib$'; then
    echo "📚 Validating bibliography files..."
    npm run validate:ci
    
    if [ $? -ne 0 ]; then
        echo "❌ Validation failed. Commit blocked."
        echo "Run 'cd toolkit && npm run validate' for detailed report."
        exit 1
    fi
    
    echo "✅ Validation passed"
fi

# Check for duplicates
echo "🔍 Checking for duplicates..."
npm run check-dups

if [ $? -eq 1 ]; then
    echo "⚠️  Duplicates detected."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "✨ Pre-commit checks passed!"
EOF

# Make hook executable
chmod +x .husky/pre-commit

echo "✅ Git hooks setup complete!"
echo ""
echo "📋 Installed hooks:"
echo "  - pre-commit: Validates .bib files and checks for duplicates"
echo ""
echo "💡 To bypass hooks (not recommended): git commit --no-verify"
