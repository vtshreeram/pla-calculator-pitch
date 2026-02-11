#!/bin/bash

echo "🧹 Clearing Vite cache and build artifacts..."

# Remove Vite cache
rm -rf node_modules/.vite

# Remove dist folder if exists
rm -rf dist

# Remove any potential build artifacts
rm -rf .vite

echo "✅ Cache cleared!"
echo ""
echo "📝 Next steps:"
echo "1. In your browser, open DevTools (F12)"
echo "2. Go to Application tab > Service Workers"
echo "3. Click 'Unregister' on any service workers"
echo "4. Go to Application tab > Storage"
echo "5. Click 'Clear site data'"
echo "6. Close and reopen your browser"
echo ""
echo "Then run: bun run dev"
