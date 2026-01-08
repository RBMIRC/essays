#!/bin/bash

# Deploy script for essays site
# Usage: ./deploy.sh

# Configuration - EDIT THESE
REMOTE_USER="your-username"
REMOTE_HOST="your-server.com"
REMOTE_PATH="/var/www/essays"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Building Quartz site...${NC}"
npx quartz build

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

echo -e "${YELLOW}Deploying to ${REMOTE_HOST}...${NC}"
rsync -avz --delete public/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Deployed successfully to https://essays.yourdomain.com${NC}"
else
    echo "Deployment failed!"
    exit 1
fi
