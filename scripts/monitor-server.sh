#!/bin/bash

# HabitNex Server Monitor Script
# Monitors the development server on port 3000 and logs any errors

LOG_FILE="./logs/server-monitor.log"
HEALTH_CHECK_URL="http://localhost:3000"
CHECK_INTERVAL=10  # seconds

# Create logs directory if it doesn't exist
mkdir -p logs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "Starting HabitNex server monitor..." | tee -a "$LOG_FILE"
echo "Monitoring: $HEALTH_CHECK_URL" | tee -a "$LOG_FILE"
echo "Check interval: ${CHECK_INTERVAL}s" | tee -a "$LOG_FILE"
echo "Log file: $LOG_FILE" | tee -a "$LOG_FILE"
echo "----------------------------------------" | tee -a "$LOG_FILE"

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

    # Check if pm2 process is running
    PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name == "habitnex-dev") | .pm2_env.status')

    if [ "$PM2_STATUS" != "online" ]; then
        echo -e "${RED}[$TIMESTAMP] ERROR: PM2 process is not online (status: $PM2_STATUS)${NC}" | tee -a "$LOG_FILE"

        # Try to restart the process
        echo -e "${YELLOW}[$TIMESTAMP] Attempting to restart server...${NC}" | tee -a "$LOG_FILE"
        pm2 restart habitnex-dev >> "$LOG_FILE" 2>&1

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[$TIMESTAMP] Server restarted successfully${NC}" | tee -a "$LOG_FILE"
        else
            echo -e "${RED}[$TIMESTAMP] ERROR: Failed to restart server${NC}" | tee -a "$LOG_FILE"
        fi

        sleep $CHECK_INTERVAL
        continue
    fi

    # Check HTTP response
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_CHECK_URL" 2>/dev/null)

    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}[$TIMESTAMP] ✓ Server healthy (HTTP $HTTP_STATUS)${NC}"
    elif [ "$HTTP_STATUS" = "000" ]; then
        echo -e "${RED}[$TIMESTAMP] ERROR: Server not responding (connection failed)${NC}" | tee -a "$LOG_FILE"

        # Try to restart
        echo -e "${YELLOW}[$TIMESTAMP] Attempting to restart unresponsive server...${NC}" | tee -a "$LOG_FILE"
        pm2 restart habitnex-dev >> "$LOG_FILE" 2>&1
    else
        echo -e "${RED}[$TIMESTAMP] ERROR: Server returned HTTP $HTTP_STATUS${NC}" | tee -a "$LOG_FILE"

        # Log the response body for debugging
        RESPONSE_BODY=$(curl -s "$HEALTH_CHECK_URL" 2>/dev/null | head -c 500)
        echo "[$TIMESTAMP] Response body: $RESPONSE_BODY" >> "$LOG_FILE"
    fi

    # Check pm2 logs for errors
    RECENT_LOGS=$(pm2 logs habitnex-dev --lines 5 --nostream 2>/dev/null | grep -i "error\|exception\|failed" | tail -3)

    if [ ! -z "$RECENT_LOGS" ]; then
        echo -e "${YELLOW}[$TIMESTAMP] WARNING: Recent errors in logs:${NC}" | tee -a "$LOG_FILE"
        echo "$RECENT_LOGS" | tee -a "$LOG_FILE"
    fi

    sleep $CHECK_INTERVAL
done
