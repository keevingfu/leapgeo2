#!/bin/bash

# Automatic Verification Script
# This script runs all configured checks based on .autocheck.config.json

set -e

CONFIG_FILE=".autocheck.config.json"
LOG_FILE=".autocheck.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get timestamp
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Log function
log_to_file() {
    echo "[$(timestamp)] $1" >> "$LOG_FILE"
}

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🤖 Automatic Verification System               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_to_file "=== Auto-Check Started ==="

# Check if config exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_FILE${NC}"
    exit 1
fi

# Read configuration
ENABLED=$(grep -o '"enabled": *true' "$CONFIG_FILE" | head -1)
if [ -z "$ENABLED" ]; then
    echo -e "${YELLOW}⚠️  Auto-check is disabled in configuration${NC}"
    exit 0
fi

echo -e "${CYAN}📋 Running configured checks...${NC}"
echo ""

CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to run a check
run_check() {
    local name=$1
    local command=$2
    local description=$3

    echo -e "${YELLOW}🔍 Running: $description${NC}"
    echo -e "${CYAN}   Command: $command${NC}"
    log_to_file "Running check: $description"

    if eval "$command" > "/tmp/${name}_output.log" 2>&1; then
        echo -e "${GREEN}   ✅ Passed${NC}"
        log_to_file "✅ $description - PASSED"
        ((CHECKS_PASSED++))
        echo ""
        return 0
    else
        echo -e "${RED}   ❌ Failed${NC}"
        echo -e "${RED}   Error output:${NC}"
        tail -n 20 "/tmp/${name}_output.log" | sed 's/^/   /'
        log_to_file "❌ $description - FAILED"
        ((CHECKS_FAILED++))
        echo ""
        return 1
    fi
}

# Always run Type Check (it's fast and important)
echo -e "${CYAN}📋 Configured checks found:${NC}"
echo -e "${CYAN}   - TypeScript Type Check${NC}"
echo -e "${CYAN}   - Production Build${NC}"
echo ""

# Run Type Check
run_check "typecheck" "npm run type-check" "TypeScript Type Check" || true

# Run Build Check
run_check "build" "npm run build" "Production Build" || true

# Final Report
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}   ✅ $CHECKS_PASSED check(s) passed${NC}"
    echo -e "${GREEN}   ✅ Project is ready to run${NC}"
    log_to_file "=== Auto-Check Completed Successfully ==="
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ CHECKS FAILED!${NC}"
    echo -e "${GREEN}   ✅ $CHECKS_PASSED check(s) passed${NC}"
    echo -e "${RED}   ❌ $CHECKS_FAILED check(s) failed${NC}"
    echo -e "${YELLOW}   ⚠️  Please fix the errors before continuing${NC}"
    log_to_file "=== Auto-Check Failed ==="
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo ""
    exit 1
fi
