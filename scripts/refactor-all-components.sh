#!/bin/bash

# Batch refactor all family components to workspace components

echo "🚀 Refactoring all family components..."
echo ""

# Array of all component files
files=(
  "components/family/tabs/FamilyHabitsTab.tsx"
  "components/family/tabs/FamilyMembersTab.tsx"
  "components/family/tabs/FamilyRewardsTab.tsx"
  "components/family/tabs/FamilyAnalyticsTab.tsx"
  "components/family/tabs/FamilyHabitsTabOld.tsx"
  "components/family/tabs/FamilyOverviewTab.tsx"
  "components/family/tabs/FamilyChallengesTab.tsx"
  "components/family/tabs/FamilySettingsTab.tsx"
  "components/family/FamilyPageLayout.tsx"
  "components/family/CreateFamilyRewardModal.tsx"
  "components/family/FamilyStats.tsx"
  "components/family/MemberCalendarSelector.tsx"
  "components/family/FamilyPageHeader.tsx"
  "components/family/FamilyMemberZone.tsx"
  "components/family/EditFamilyHabitModal.tsx"
  "components/family/FamilyDashboardLayout.tsx"
  "components/family/CreateFamilyChallengeModal.tsx"
  "components/family/MemberModal.tsx"
  "components/family/challenges/ChallengeDetailDrawer.tsx"
  "components/family/FamilyHabitForm.old.tsx"
  "components/family/modals/ManageFocusHabitsModal.tsx"
  "components/family/ManageFamilyRewardsModal.tsx"
  "components/family/FamilyHeader.tsx"
  "components/family/ModernFamilyHeader.tsx"
  "components/family/MemberModalOld.tsx"
  "components/family/InviteCodeDisplay.tsx"
  "components/family/MemberHistoryModal.tsx"
  "components/family/HabitLayoutOptions.tsx"
  "components/family/CreateFamilyHabitModal.tsx"
  "components/family/RewardMomentumStrip.tsx"
  "components/family/FamilyHabitFormSimple.tsx"
  "components/family/HabitBenefitsModal.tsx"
  "components/family/MemberDateSelector.tsx"
  "components/family/CompactHabitList.tsx"
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
