#!/bin/bash

# HabitNex Safe Development Server
# Prevents white screen issues by managing Next.js cache properly

echo "🚀 Starting HabitNex development server with white screen prevention..."

# Function to clean caches
clean_cache() {
    echo "🧹 Cleaning Next.js build cache..."
    rm -rf .next
    rm -rf node_modules/.cache
    echo "✅ Cache cleaned successfully"
}

# Function to check if server is healthy
check_server_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health 2>/dev/null)
    if [ "$response" = "200" ] || [ "$response" = "404" ]; then
        return 0
    else
        return 1
    fi
}

# Clean cache if .next directory exists and is potentially corrupted
if [ -d ".next" ]; then
    echo "⚠️  Existing .next directory found. Checking for corruption..."
    
    # Check if there are missing chunk files (common cause of white screen)
    if [ ! -f ".next/BUILD_ID" ] || [ ! -d ".next/static" ]; then
        echo "🔧 Detected corrupted cache, cleaning..."
        clean_cache
    fi
fi

# Start development server
echo "🌟 Starting development server on port 3001..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 5

# Check server health
if check_server_health; then
    echo "✅ Development server is healthy and running!"
    echo "🌐 Visit: http://localhost:3001"
    echo "📋 Workspace: http://localhost:3001/workspace"
    echo "🎯 Habits: http://localhost:3001/habits"
    echo ""
    echo "💡 If you encounter a white screen:"
    echo "   1. Don't panic!"
    echo "   2. Run: ./scripts/fix-white-screen.sh"
    echo "   3. Or manually: rm -rf .next && npm run dev"
    echo ""
    echo "Press Ctrl+C to stop the server"
else
    echo "❌ Server health check failed, attempting cache clean and restart..."
    kill $DEV_PID 2>/dev/null
    clean_cache
    echo "🔄 Restarting server..."
    npm run dev &
    DEV_PID=$!
fi

# Keep script running and monitor for issues
wait $DEV_PID
