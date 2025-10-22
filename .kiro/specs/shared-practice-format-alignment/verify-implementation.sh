#!/bin/bash

# Verification Script for Shared Practice Format Alignment
# This script performs automated checks on the implementation

echo "🔍 Verifying Shared Practice Format Alignment Implementation..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Function to check if file exists
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} File exists: $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} File missing: $1"
        ((FAIL++))
        return 1
    fi
}

# Function to check if string exists in file
check_string() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} Found in $1: $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} Not found in $1: $2"
        ((FAIL++))
        return 1
    fi
}

# Function to check CSS property
check_css() {
    if grep -q "$2" "$1"; then
        echo -e "${GREEN}✓${NC} CSS property in $1: $2"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} CSS property missing in $1: $2"
        ((FAIL++))
        return 1
    fi
}

echo "📁 Checking Required Files..."
echo "================================"
check_file "src/components/practice/AllQuestionsView.vue"
check_file "src/pages/StudentPracticeView.vue"
check_file "src/utils/questionTransform.ts"
check_file "practice_template.html"
echo ""

echo "🔧 Checking AllQuestionsView Component..."
echo "================================"
check_string "src/components/practice/AllQuestionsView.vue" "transformedQuestions"
check_string "src/components/practice/AllQuestionsView.vue" "handleEnglishClick"
check_string "src/components/practice/AllQuestionsView.vue" "handleMandarinClick"
check_string "src/components/practice/AllQuestionsView.vue" "handleOptionClick"
check_string "src/components/practice/AllQuestionsView.vue" "handleSubmit"
check_string "src/components/practice/AllQuestionsView.vue" "validateMatch"
check_string "src/components/practice/AllQuestionsView.vue" "recordPracticeMistake"
echo ""

echo "🎨 Checking CSS Styles..."
echo "================================"
check_css "src/components/practice/AllQuestionsView.vue" "max-width: 800px"
check_css "src/components/practice/AllQuestionsView.vue" "border-radius: 16px"
check_css "src/components/practice/AllQuestionsView.vue" "padding: 32px"
check_css "src/components/practice/AllQuestionsView.vue" "background: #ffffff"
check_css "src/components/practice/AllQuestionsView.vue" "border: 2px solid #e5e7eb"
check_css "src/components/practice/AllQuestionsView.vue" "border-color: #000000"
check_css "src/components/practice/AllQuestionsView.vue" "border-color: #10b981"
check_css "src/components/practice/AllQuestionsView.vue" "border-color: #ef4444"
check_css "src/components/practice/AllQuestionsView.vue" "@keyframes shake"
echo ""

echo "🔄 Checking Question Types..."
echo "================================"
check_string "src/components/practice/AllQuestionsView.vue" "type === 'matching'"
check_string "src/components/practice/AllQuestionsView.vue" "type === 'fill-blank'"
check_string "src/components/practice/AllQuestionsView.vue" "type === 'multiple-choice'"
echo ""

echo "📱 Checking Responsive Styles..."
echo "================================"
check_css "src/components/practice/AllQuestionsView.vue" "@media (max-width: 640px)"
check_css "src/components/practice/AllQuestionsView.vue" "grid-template-columns: 1fr"
echo ""

echo "🔗 Checking StudentPracticeView Integration..."
echo "================================"
check_string "src/pages/StudentPracticeView.vue" "AllQuestionsView"
check_string "src/pages/StudentPracticeView.vue" "handlePracticeComplete"
check_string "src/pages/StudentPracticeView.vue" ":questions=\"questions\""
check_string "src/pages/StudentPracticeView.vue" ":wordlist-id=\"wordlist!.id\""
check_string "src/pages/StudentPracticeView.vue" ":wordlist-name=\"wordlist!.title\""
echo ""

echo "🛠️ Checking Question Transform Utility..."
echo "================================"
check_string "src/utils/questionTransform.ts" "transformQuestionsForView"
check_string "src/utils/questionTransform.ts" "TransformedQuestion"
check_string "src/utils/questionTransform.ts" "shuffledMandarin"
check_string "src/utils/questionTransform.ts" "hint"
echo ""

echo "📊 Checking HTML Template Reference..."
echo "================================"
check_string "practice_template.html" "matching-pairs"
check_string "practice_template.html" "fill-blank"
check_string "practice_template.html" "multiple-choice"
check_string "practice_template.html" "matching-item"
check_string "practice_template.html" "option-button"
check_string "practice_template.html" "submit-button"
echo ""

echo "🎯 Checking Mistake Recording..."
echo "================================"
check_string "src/components/practice/AllQuestionsView.vue" "recordPracticeMistake"
check_string "src/components/practice/AllQuestionsView.vue" "questionType: 'matching'"
check_string "src/components/practice/AllQuestionsView.vue" "questionType: 'fill_blank'"
check_string "src/components/practice/AllQuestionsView.vue" "questionType: 'multiple_choice'"
echo ""

echo "✨ Checking Animation States..."
echo "================================"
check_string "src/components/practice/AllQuestionsView.vue" "class=\"selected\""
check_string "src/components/practice/AllQuestionsView.vue" "class=\"matched\""
check_string "src/components/practice/AllQuestionsView.vue" "class=\"incorrect\""
check_css "src/components/practice/AllQuestionsView.vue" "animation: shake"
echo ""

echo "📋 Summary"
echo "================================"
echo -e "Total Checks: $((PASS + FAIL))"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ All automated checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Start the dev server: pnpm dev"
    echo "2. Create a share link for a wordlist"
    echo "3. Follow the manual testing guide: MANUAL_TESTING_GUIDE.md"
    echo "4. Compare with HTML template: VISUAL_COMPARISON_CHECKLIST.md"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the implementation.${NC}"
    exit 1
fi
