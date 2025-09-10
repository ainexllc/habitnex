#!/bin/bash

# NextVibe Monitoring Dashboard
# Comprehensive monitoring and troubleshooting tool

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           NextVibe Monitoring Dashboard      ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Server Status
echo -e "${BLUE}📊 SERVER STATUS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PM2_STATUS=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name == "nextvibe-dev") | .pm2_env.status' 2>/dev/null)
if [ "$PM2_STATUS" = "online" ]; then
    echo -e "PM2 Process: ${GREEN}● Online${NC}"
else
    echo -e "PM2 Process: ${RED}● $PM2_STATUS${NC}"
fi

# Port Check
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "Port 3000: ${GREEN}● Listening${NC}"
else
    echo -e "Port 3000: ${RED}● Not listening${NC}"
fi

# HTTP Check
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "HTTP Response: ${GREEN}● $HTTP_CODE OK${NC}"
elif [ "$HTTP_CODE" = "000" ]; then
    echo -e "HTTP Response: ${RED}● Connection failed${NC}"
else
    echo -e "HTTP Response: ${YELLOW}● $HTTP_CODE${NC}"
fi

echo ""

# System Resources
echo -e "${BLUE}💻 SYSTEM RESOURCES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# PM2 Process Info
PM2_INFO=$(pm2 jlist 2>/dev/null | jq -r '.[] | select(.name == "nextvibe-dev") | "\(.monit.cpu)% CPU, \(.monit.memory/1024/1024 | floor)MB RAM, \(.pm2_env.restart_time) restarts"' 2>/dev/null)
if [ ! -z "$PM2_INFO" ]; then
    echo -e "Process: $PM2_INFO"
fi

# Disk Space
DISK_USAGE=$(df -h . | tail -1 | awk '{print $5}')
echo -e "Disk Usage: $DISK_USAGE"

echo ""

# Recent Logs
echo -e "${BLUE}📝 RECENT LOGS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# PM2 Logs
echo -e "${YELLOW}PM2 Output (last 3 lines):${NC}"
pm2 logs nextvibe-dev --lines 3 --nostream 2>/dev/null | tail -3 || echo "No PM2 logs available"

# Error Logs
echo ""
echo -e "${YELLOW}PM2 Errors (last 3 lines):${NC}"
pm2 logs nextvibe-dev --lines 3 --err --nostream 2>/dev/null | tail -3 || echo "No error logs available"

# Monitor Logs
if [ -f "logs/server-monitor.log" ]; then
    echo ""
    echo -e "${YELLOW}Monitor Logs (last 5 lines):${NC}"
    tail -5 logs/server-monitor.log
fi

echo ""

# Quick Actions
echo -e "${BLUE}⚡ QUICK ACTIONS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}r${NC}  Restart server"
echo -e "${CYAN}s${NC}  Show full logs"
echo -e "${CYAN}e${NC}  Show error logs only"
echo -e "${CYAN}m${NC}  Monitor logs live"
echo -e "${CYAN}q${NC}  Quit dashboard"
echo ""

# Interactive menu
while true; do
    read -n1 -p "Choose action: " choice
    echo ""

    case $choice in
        r|R)
            echo -e "${YELLOW}Restarting server...${NC}"
            pm2 restart nextvibe-dev
            sleep 2
            exec "$0"  # Reload dashboard
            ;;
        s|S)
            echo -e "${YELLOW}Full PM2 logs:${NC}"
            pm2 logs nextvibe-dev --lines 20
            echo ""
            read -p "Press Enter to continue..."
            exec "$0"
            ;;
        e|E)
            echo -e "${YELLOW}Error logs only:${NC}"
            pm2 logs nextvibe-dev --err --lines 20
            echo ""
            read -p "Press Enter to continue..."
            exec "$0"
            ;;
        m|M)
            echo -e "${YELLOW}Live monitoring (Ctrl+C to exit):${NC}"
            pm2 logs nextvibe-dev
            exec "$0"
            ;;
        q|Q)
            echo -e "${GREEN}Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please select r, s, e, m, or q.${NC}"
            ;;
    esac
done
