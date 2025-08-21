#!/bin/bash

# NextVibe White Screen Fix Script
# Quick fix for white screen issues without full server restart

echo "🔧 NextVibe White Screen Fix"
echo "=============================="

# Stop all Next.js processes
echo "🛑 Stopping Next.js development server..."
pkill -f "next dev" 2>/dev/null || true

# Clean all caches
echo "🧹 Cleaning all caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .swc
rm -rf tsconfig.tsbuildinfo

# Clear any stuck node processes
echo "🔄 Clearing stuck processes..."
pkill -f "node.*next" 2>/dev/null || true

# Wait a moment for processes to clean up
sleep 2

# Restart development server
echo "🚀 Starting fresh development server..."
npm run dev &

# Wait for startup
sleep 3

# Check if server is running
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo "✅ Server is running successfully!"
    echo "🌐 Visit: http://localhost:3001"
    echo ""
    echo "White screen should now be fixed! 🎉"
else
    echo "⚠️  Server may still be starting up..."
    echo "Wait a few more seconds and try visiting http://localhost:3001"
fi

echo ""
echo "📝 To prevent future white screens:"
echo "   1. Use: ./scripts/dev-safe.sh instead of npm run dev"
echo "   2. Or run this script when issues occur"
echo "   3. Avoid stopping the server abruptly (use Ctrl+C gracefully)"