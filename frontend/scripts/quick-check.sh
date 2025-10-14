#!/bin/bash

# Quick Check Script for Frontend
# Run type checking and build verification

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Quick Frontend Verification${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: TypeScript Type Check
echo -e "${YELLOW}📝 Step 1: TypeScript Type Check...${NC}"
if npm run type-check 2>&1 | tee /tmp/typecheck.log; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${RED}❌ Type check failed${NC}"
    cat /tmp/typecheck.log
    exit 1
fi
echo ""

# Step 2: Build Check
echo -e "${YELLOW}🔨 Step 2: Build Verification...${NC}"
if npm run build 2>&1 | tee /tmp/build.log; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    cat /tmp/build.log
    exit 1
fi
echo ""

# Step 3: Check for common issues
echo -e "${YELLOW}🔍 Step 3: Checking for common issues...${NC}"

# Check for missing dependencies
if grep -r "Cannot find module" /tmp/build.log 2>/dev/null; then
    echo -e "${RED}❌ Missing dependencies detected${NC}"
    exit 1
fi

# Check for syntax errors
if grep -r "SyntaxError" /tmp/build.log 2>/dev/null; then
    echo -e "${RED}❌ Syntax errors detected${NC}"
    exit 1
fi

echo -e "${GREEN}✅ No common issues found${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}🎉 All checks passed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

exit 0
