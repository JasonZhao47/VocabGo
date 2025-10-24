#!/bin/bash

# CSS Bundle Analysis Script
# Analyzes CSS bundle size before and after optimization

set -e

echo "🔍 CSS Bundle Analysis"
echo "======================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build the project
echo -e "${BLUE}Building project...${NC}"
pnpm build

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "❌ Build failed - dist directory not found"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Analyze CSS files
echo "📊 CSS Bundle Analysis:"
echo "----------------------"

# Find all CSS files in dist
CSS_FILES=$(find dist -name "*.css" -type f)

if [ -z "$CSS_FILES" ]; then
  echo "❌ No CSS files found in dist"
  exit 1
fi

TOTAL_SIZE=0
TOTAL_GZIP=0

echo ""
echo "Individual CSS Files:"
echo ""

for file in $CSS_FILES; do
  # Get file size
  SIZE=$(wc -c < "$file")
  SIZE_KB=$(echo "scale=2; $SIZE / 1024" | bc)
  
  # Get gzipped size
  GZIP_SIZE=$(gzip -c "$file" | wc -c)
  GZIP_KB=$(echo "scale=2; $GZIP_SIZE / 1024" | bc)
  
  # Add to totals
  TOTAL_SIZE=$((TOTAL_SIZE + SIZE))
  TOTAL_GZIP=$((TOTAL_GZIP + GZIP_SIZE))
  
  # Get relative path
  REL_PATH=${file#dist/}
  
  echo "  📄 $REL_PATH"
  echo "     Size: ${SIZE_KB} KB"
  echo "     Gzipped: ${GZIP_KB} KB"
  echo ""
done

# Calculate totals
TOTAL_SIZE_KB=$(echo "scale=2; $TOTAL_SIZE / 1024" | bc)
TOTAL_GZIP_KB=$(echo "scale=2; $TOTAL_GZIP / 1024" | bc)

echo "----------------------"
echo -e "${YELLOW}Total CSS Bundle:${NC}"
echo "  Size: ${TOTAL_SIZE_KB} KB"
echo "  Gzipped: ${TOTAL_GZIP_KB} KB"
echo ""

# Check if size is acceptable (< 100KB gzipped is good)
if (( $(echo "$TOTAL_GZIP_KB < 100" | bc -l) )); then
  echo -e "${GREEN}✓ CSS bundle size is excellent (< 100KB gzipped)${NC}"
elif (( $(echo "$TOTAL_GZIP_KB < 150" | bc -l) )); then
  echo -e "${YELLOW}⚠ CSS bundle size is acceptable (< 150KB gzipped)${NC}"
else
  echo -e "${YELLOW}⚠ CSS bundle size is large (> 150KB gzipped)${NC}"
  echo "  Consider further optimization"
fi

echo ""

# Analyze unused CSS (if purgecss is available)
if command -v purgecss &> /dev/null; then
  echo "🔍 Checking for unused CSS..."
  # This is a basic check - in production you'd want more sophisticated analysis
  echo "  (Manual review recommended)"
else
  echo "💡 Tip: Install purgecss for unused CSS analysis"
  echo "   npm install -g purgecss"
fi

echo ""
echo "✅ Analysis complete!"
