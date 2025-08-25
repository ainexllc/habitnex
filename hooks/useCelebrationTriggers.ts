'use client';

import { useEffect, useCallback } from 'react';
import { useCelebration } from '@/contexts/CelebrationContext';
import type { FamilyMember, FamilyHabit, FamilyHabitCompletion } from '@/types/family';

interface CelebrationTriggerOptions {
  member: FamilyMember;
  habit?: FamilyHabit;
  completion?: FamilyHabitCompletion;
  previousStats?: FamilyMember['stats'];
}

export function useCelebrationTriggers() {
  const { addCelebration } = useCelebration();

  // Celebrate habit completion
  const celebrateHabitCompletion = useCallback((options: CelebrationTriggerOptions) => {
    const { member, habit, completion } = options;
    
    if (!habit || !completion) return;

    addCelebration({
      type: 'habit_complete',
      memberName: member.displayName,
      memberAvatar: member.avatar,
      memberColor: member.color,
      title: `${habit.name} Complete!`,
      description: `Way to go! You completed "${habit.name}" today.`,
      emoji: habit.emoji,
      points: completion.pointsEarned
    });
  }, [addCelebration]);

  // Celebrate streak milestones
  const celebrateStreakMilestone = useCallback((options: CelebrationTriggerOptions) => {
    const { member, habit, completion } = options;
    
    if (!habit || !completion) return;

    const streak = completion.streakCount;
    const isMilestone = [3, 7, 14, 21, 30, 50, 100].includes(streak);
    
    if (isMilestone) {
      const milestoneEmojis: Record<number, string> = {
        3: '🔥',
        7: '⚡',
        14: '🌟',
        21: '💪',
        30: '🏆',
        50: '👑',
        100: '🎊'
      };

      addCelebration({
        type: 'streak_milestone',
        memberName: member.displayName,
        memberAvatar: member.avatar,
        memberColor: member.color,
        title: `${streak} Day Streak!`,
        description: `Amazing! You've kept up "${habit.name}" for ${streak} days in a row!`,
        emoji: milestoneEmojis[streak] || '🔥',
        streak: streak,
        points: Math.floor(streak / 3) * 10 // Bonus points for milestones
      });
    }
  }, [addCelebration]);

  // Celebrate level ups
  const celebrateLevelUp = useCallback((options: CelebrationTriggerOptions) => {
    const { member, previousStats } = options;
    
    if (!previousStats) return;

    const oldLevel = previousStats.level;
    const newLevel = member.stats.level;

    if (newLevel > oldLevel) {
      addCelebration({
        type: 'level_up',
        memberName: member.displayName,
        memberAvatar: member.avatar,
        memberColor: member.color,
        title: 'Level Up!',
        description: `Congratulations! You've reached Level ${newLevel}!`,
        emoji: '🎉',
        level: newLevel
      });
    }
  }, [addCelebration]);

  // Celebrate reward redemption
  const celebrateRewardEarned = useCallback((memberName: string, memberAvatar: string, memberColor: string, rewardTitle: string, rewardEmoji: string, pointsSpent: number) => {
    addCelebration({
      type: 'reward_earned',
      memberName,
      memberAvatar,
      memberColor,
      title: 'Reward Earned!',
      description: `Enjoy your ${rewardTitle}! You've earned it!`,
      emoji: rewardEmoji,
      points: pointsSpent
    });
  }, [addCelebration]);

  // Celebrate challenge completion
  const celebrateChallengeComplete = useCallback((memberName: string, memberAvatar: string, memberColor: string, challengeTitle: string, challengeEmoji: string, isWinner: boolean = false) => {
    addCelebration({
      type: 'challenge_complete',
      memberName,
      memberAvatar,
      memberColor,
      title: isWinner ? 'Challenge Winner!' : 'Challenge Complete!',
      description: `${isWinner ? 'You won' : 'You completed'} "${challengeTitle}"! Great job!`,
      emoji: isWinner ? '👑' : challengeEmoji
    });
  }, [addCelebration]);

  // Celebrate first habit completion (for new family members)
  const celebrateFirstHabit = useCallback((member: FamilyMember, habit: FamilyHabit) => {
    addCelebration({
      type: 'habit_complete',
      memberName: member.displayName,
      memberAvatar: member.avatar,
      memberColor: member.color,
      title: 'First Habit Complete!',
      description: `Welcome to the family! You completed your first habit: "${habit.name}"`,
      emoji: '🌟',
      points: habit.basePoints + 10 // Bonus points for first habit
    });
  }, [addCelebration]);

  // Celebrate perfect day (all habits completed)
  const celebratePerfectDay = useCallback((member: FamilyMember, habitsCompleted: number) => {
    addCelebration({
      type: 'habit_complete',
      memberName: member.displayName,
      memberAvatar: member.avatar,
      memberColor: member.color,
      title: 'Perfect Day!',
      description: `Amazing! You completed all ${habitsCompleted} of your habits today!`,
      emoji: '💯',
      points: habitsCompleted * 5 // Bonus points for perfect day
    });
  }, [addCelebration]);

  // Celebrate family milestone (when all family members complete habits)
  const celebrateFamilyMilestone = useCallback((familyName: string, milestone: string) => {
    // Use the first active family member for the celebration display
    addCelebration({
      type: 'challenge_complete',
      memberName: familyName,
      memberAvatar: '👨‍👩‍👧‍👦',
      memberColor: '#8B5CF6', // Purple for family celebrations
      title: 'Family Milestone!',
      description: `The whole family achieved: ${milestone}!`,
      emoji: '🏠'
    });
  }, [addCelebration]);

  return {
    celebrateHabitCompletion,
    celebrateStreakMilestone,
    celebrateLevelUp,
    celebrateRewardEarned,
    celebrateChallengeComplete,
    celebrateFirstHabit,
    celebratePerfectDay,
    celebrateFamilyMilestone
  };
}