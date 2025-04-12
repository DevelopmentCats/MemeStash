#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Verifying Meme Stash project structure...${NC}"

# Check if directories exist
echo -e "\n${YELLOW}Checking directory structure:${NC}"
directories=("frontend" "backend" "docker")
for dir in "${directories[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "${GREEN}✓${NC} $dir directory exists"
  else
    echo -e "${RED}✗${NC} $dir directory is missing"
  fi
done

# Check if key files exist
echo -e "\n${YELLOW}Checking key files:${NC}"
files=(
  "docker-compose.yml"
  "docker-compose.dev.yml"
  "README.md"
  "frontend/package.json"
  "backend/package.json"
  "frontend/src/main.js"
  "backend/src/index.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file exists"
  else
    echo -e "${RED}✗${NC} $file is missing"
  fi
done

# Check if Docker is installed
echo -e "\n${YELLOW}Checking if Docker is installed:${NC}"
if command -v docker &> /dev/null; then
  echo -e "${GREEN}✓${NC} Docker is installed"
  docker --version
else
  echo -e "${RED}✗${NC} Docker is not installed"
fi

# Check if Docker Compose is installed
echo -e "\n${YELLOW}Checking if Docker Compose is installed:${NC}"
if command -v docker-compose &> /dev/null; then
  echo -e "${GREEN}✓${NC} Docker Compose is installed"
  docker-compose --version
else
  echo -e "${RED}✗${NC} Docker Compose is not installed"
fi

echo -e "\n${YELLOW}Setup verification complete!${NC}"
echo -e "Run ${GREEN}docker-compose -f docker-compose.dev.yml up${NC} to start the development environment."