#!/bin/bash

# Batch refactor all family routes to workspace routes

echo "🚀 Refactoring all family routes..."
echo ""

# Array of all route files
files=(
  "app/family/settings/page.tsx"
  "app/family/challenges/page.tsx"
  "app/family/challenges/create/page.tsx"
  "app/family/rewards/manage/page.tsx"
  "app/family/rewards/page.tsx"
  "app/family/rewards/create/page.tsx"
  "app/family/habits/page.tsx"
  "app/family/members/page.tsx"
  "app/family/analytics/page.tsx"
  "app/family/create/page.tsx"
  "app/family/join/page.tsx"
  "app/family/onboarding/page.tsx"
)

total=0
count=0

for file in "${files[@]}"; do
  ((count++))
  echo "[$count/${#files[@]}] Processing $file..."
  output=$(node scripts/refactor-family-to-workspace.js --file="$file" 2>&1)
  changes=$(echo "$output" | grep "Total changes:" | sed 's/.*Total changes: \([0-9]*\).*/\1/')
  if [ -n "$changes" ]; then
    echo "  ✓ $changes changes applied"
    ((total+=changes))
  fi
done

echo ""
echo "================================"
echo "✨ Refactoring Complete!"
echo "Total files processed: ${#files[@]}"
echo "Total changes applied: $total"
echo "================================"
