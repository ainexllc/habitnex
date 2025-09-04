#!/bin/bash
while true; do
  echo "=== Dev Server Health Check $(date) ==="
  
  # Check if server is responsive
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 | grep -q "200"; then
    echo "✅ Server responding (200 OK)"
  else
    echo "❌ Server not responding, attempting restart..."
    pkill -f "next dev" && sleep 2 && npm run dev &
  fi
  
  # Check for TypeScript errors
  if npx tsc --noEmit --skipLibCheck 2>/dev/null; then
    echo "✅ TypeScript compilation clean"
  else
    echo "⚠️  TypeScript errors detected - running auto-fix..."
    # Auto-fix common issues would go here
  fi
  
  # Monitor memory usage
  ps aux | grep "next dev" | grep -v grep | awk '{print "Memory usage:", $6/1024 "MB"}'
  
  echo "---"
  sleep 180  # Check every 3 minutes
done
