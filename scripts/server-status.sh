#!/bin/bash

# Quick server status checker for NextVibe development server

echo "=== NextVibe Server Status ==="
echo "Port: 3000"
echo "Time: $(date)"
echo ""

# Check if pm2 process is running
echo "PM2 Process Status:"
pm2 status | grep nextvibe-dev || echo "No nextvibe-dev process found"
echo ""

# Check if port 3000 is listening
echo "Port 3000 Status:"
lsof -i :3000 | head -1 || echo "Port 3000 not in use"
echo ""

# Check HTTP response
echo "HTTP Response:"
curl -I http://localhost:3000 2>/dev/null | head -1 || echo "No response from server"
echo ""

# Show recent logs
echo "Recent PM2 Logs:"
pm2 logs nextvibe-dev --lines 3 --nostream 2>/dev/null || echo "No logs available"
echo ""

echo "=== End Status ==="
