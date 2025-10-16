import { useMemo } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import type { FamilyHabit } from '@/types/family';
import { addDays, getDateString, getTodayDateString } from '@/lib/utils';

export interface RewardDaySnapshot {
  date: string;
  earned: boolean;
}

export interface MemberRewardProgress {
  memberId: string;
  focusHabitIds: string[];
  focusHabits: FamilyHabit[];
  today: {
    completed: number;
    total: number;
    tokenEarned: boolean;
    missingHabitNames: string[];
  };
  weekly: {
    tokens: number;
    goal: number;
    history: RewardDaySnapshot[];
    readyForReward: boolean;
  };
  monthlyTokens: number;
  availableTokens: number;
}

export function useRewardMomentum() {
  const { currentFamily } = useFamily();
  const { familyHabits, familyCompletions } = useGlobalData();

  const progressMap = useMemo(() => {
    if (!currentFamily) return {} as Record<string, MemberRewardProgress>;

    const memberMap: Record<string, MemberRewardProgress> = {};

    // Build completions index member -> date -> set(habitId)
    const completionIndex = new Map<string, Map<string, Set<string>>>();
    familyCompletions
      .filter((completion) => completion.completed)
      .forEach((completion) => {
        let memberDates = completionIndex.get(completion.memberId);
        if (!memberDates) {
          memberDates = new Map();
          completionIndex.set(completion.memberId, memberDates);
        }
        let habits = memberDates.get(completion.date);
        if (!habits) {
          habits = new Set();
          memberDates.set(completion.date, habits);
        }
        habits.add(completion.habitId);
      });

    const today = new Date();
    const todayString = getTodayDateString();

    currentFamily.members
      .filter((member) => member.isActive)
      .forEach((member) => {
        const memberHabits = familyHabits.filter((habit) =>
          habit.assignedMembers?.includes(member.id) && !habit.isArchived && habit.isActive
        );

        const configuredFocus = member.rewardProfile?.dailyFocusHabitIds || [];
        const focusHabitIds = configuredFocus.length > 0
          ? configuredFocus
          : memberHabits.slice(0, 3).map((habit) => habit.id);

        const focusHabits = focusHabitIds
          .map((habitId) => memberHabits.find((habit) => habit.id === habitId))
          .filter((habit): habit is FamilyHabit => Boolean(habit));

        const totalFocus = focusHabits.length;
        const todayCompletions = completionIndex.get(member.id)?.get(todayString) ?? new Set<string>();
        const completedFocus = focusHabits.filter((habit) => todayCompletions.has(habit.id)).length;
        const missingHabitNames = focusHabits
          .filter((habit) => !todayCompletions.has(habit.id))
          .map((habit) => habit.name);
        const tokenEarnedToday = totalFocus > 0 && completedFocus === totalFocus;

        const weeklyHistory: RewardDaySnapshot[] = [];
        let weeklyTokens = 0;
        for (let i = 6; i >= 0; i--) {
          const date = getDateString(addDays(today, -i));
          const dayCompletions = completionIndex.get(member.id)?.get(date);
          const earned = totalFocus > 0 && focusHabits.every((habit) => dayCompletions?.has(habit.id));
          if (earned) weeklyTokens++;
          weeklyHistory.push({ date, earned });
        }

        let monthlyTokens = 0;
        for (let i = 0; i < 30; i++) {
          const date = getDateString(addDays(today, -i));
          const dayCompletions = completionIndex.get(member.id)?.get(date);
          const earned = totalFocus > 0 && focusHabits.every((habit) => dayCompletions?.has(habit.id));
          if (earned) monthlyTokens++;
        }

        const weeklyGoal = member.rewardProfile?.weeklyGoal ?? 4;
        const availableTokens = weeklyTokens;

        memberMap[member.id] = {
          memberId: member.id,
          focusHabitIds,
          focusHabits,
          today: {
            completed: completedFocus,
            total: totalFocus,
            tokenEarned: tokenEarnedToday,
            missingHabitNames,
          },
          weekly: {
            tokens: weeklyTokens,
            goal: weeklyGoal,
            history: weeklyHistory,
            readyForReward: weeklyTokens >= weeklyGoal && weeklyGoal > 0,
          },
          monthlyTokens,
          availableTokens,
        };
      });

    return memberMap;
  }, [currentFamily, familyHabits, familyCompletions]);

  const defaultFocusMap = useMemo(() => {
    if (!currentFamily) return {} as Record<string, string[]>;
    const defaults: Record<string, string[]> = {};

    currentFamily.members
      .filter((member) => member.isActive)
      .forEach((member) => {
        const memberHabits = familyHabits.filter((habit) =>
          habit.assignedMembers?.includes(member.id) && !habit.isArchived && habit.isActive
        );
        defaults[member.id] = memberHabits.slice(0, 3).map((habit) => habit.id);
      });

    return defaults;
  }, [currentFamily, familyHabits]);

  return { progressMap, defaultFocusMap };
}
