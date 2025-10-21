'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { 
  getFamilyCompletionsForAnalytics as getFamilyCompletions, 
  getFamilyMoods, 
  getFamilyRewards, 
  getRedemptionHistory,
  getWorkspaceAnalyticsSummary
} from '@/lib/workspaceDb';
import type { WorkspaceAnalytics } from '@/types/workspace';

interface AnalyticsData {
  completions: any[];
  moods: any[];
  rewards: any[];
  redemptions: any[];
}

interface MemberAnalytics {
  memberId: string;
  memberName: string;
  memberColor: string;
  completions: number;
  completionRate: number;
  pointsEarned: number;
  currentStreak: number;
  longestStreak: number;
  averageMood: number;
  rewardsEarned: number;
  favoriteHabits: string[];
}

interface HabitAnalytics {
  habitId: string;
  habitName: string;
  habitEmoji: string;
  totalCompletions: number;
  completionRate: number;
  averageStreak: number;
  mostSuccessfulMember: string;
  trendDirection: 'up' | 'down' | 'stable';
}

interface TimeAnalytics {
  period: string;
  completions: number;
  pointsEarned: number;
  averageMood: number;
  perfectDays: number; // Days where all habits were completed
}

export function useWorkspaceAnalytics(period: 'week' | 'month' | 'year' = 'week') {
  const { currentWorkspace } = useWorkspace();
  const [analytics, setAnalytics] = useState<WorkspaceAnalytics | null>(null);
  const [memberAnalytics, setMemberAnalytics] = useState<MemberAnalytics[]>([]);
  const [habitAnalytics, setHabitAnalytics] = useState<HabitAnalytics[]>([]);
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDateRange = useCallback((period: 'week' | 'month' | 'year') => {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);

    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(now.getDate() - 365);
        break;
    }

    return { startDate, endDate };
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = calculateDateRange(period);

      // Load all necessary data
      const [completions, moods, rewards, redemptions] = await Promise.all([
        getFamilyCompletions(currentWorkspace.id, startDate, endDate),
        getFamilyMoods(currentWorkspace.id, startDate, endDate), 
        getWorkspaceRewards(currentWorkspace.id),
        getRedemptionHistory(currentWorkspace.id)
      ]);

      const data: AnalyticsData = { completions, moods, rewards, redemptions };
      
      // Calculate analytics
      const overallAnalytics = calculateOverallAnalytics(data);
      const memberStats = calculateMemberAnalytics(data, currentWorkspace.members);
      const habitStats = calculateHabitAnalytics(data);
      const timeStats = calculateTimeAnalytics(data, period);

      setAnalytics(overallAnalytics);
      setMemberAnalytics(memberStats);
      setHabitAnalytics(habitStats);
      setTimeAnalytics(timeStats);

    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace?.id, period, calculateDateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const calculateOverallAnalytics = (data: AnalyticsData): WorkspaceAnalytics => {
    const totalCompletions = data.completions.length;
    const totalMembers = currentWorkspace?.members.length || 0;
    const totalHabits = new Set(data.completions.map(c => c.habitId)).size;
    
    // Calculate completion rate (assuming each member should complete habits daily)
    const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const expectedCompletions = totalMembers * totalHabits * daysInPeriod;
    const averageCompletionRate = expectedCompletions > 0 ? (totalCompletions / expectedCompletions) * 100 : 0;

    const totalPointsEarned = data.completions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
    const activeMembers = new Set(data.completions.map(c => c.memberId)).size;

    return {
      workspaceId: currentWorkspace?.id || '',
      period,
      overall: {
        totalCompletions,
        averageCompletionRate,
        totalPointsEarned,
        activeMembers
      },
      memberBreakdown: [],
      habitPerformance: [],
      rewardActivity: {
        totalRedemptions: data.redemptions.length,
        totalPointsSpent: data.redemptions.reduce((sum, r) => sum + r.pointsSpent, 0),
        mostPopularReward: getMostPopularReward(data.rewards, data.redemptions),
        pendingApprovals: data.redemptions.filter(r => r.status === 'pending').length
      }
    };
  };

  const calculateMemberAnalytics = (data: AnalyticsData, members: any[]): MemberAnalytics[] => {
    return members.map(member => {
      const memberCompletions = data.completions.filter(c => c.memberId === member.id);
      const memberMoods = data.moods.filter(m => m.memberId === member.id);
      const memberRedemptions = data.redemptions.filter(r => r.memberId === member.id);

      const totalCompletions = memberCompletions.length;
      const totalPossibleCompletions = calculatePossibleCompletions(period);
      const completionRate = totalPossibleCompletions > 0 ? (totalCompletions / totalPossibleCompletions) * 100 : 0;
      
      const pointsEarned = memberCompletions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
      const currentStreak = calculateCurrentStreak(memberCompletions);
      const longestStreak = calculateLongestStreak(memberCompletions);
      
      const averageMood = memberMoods.length > 0 
        ? memberMoods.reduce((sum, m) => sum + m.mood, 0) / memberMoods.length 
        : 0;
      
      const rewardsEarned = memberRedemptions.filter(r => r.status === 'completed').length;
      const favoriteHabits = getFavoriteHabits(memberCompletions);

      return {
        memberId: member.id,
        memberName: member.displayName,
        memberColor: member.color,
        completions: totalCompletions,
        completionRate,
        pointsEarned,
        currentStreak,
        longestStreak,
        averageMood,
        rewardsEarned,
        favoriteHabits
      };
    });
  };

  const calculateHabitAnalytics = (data: AnalyticsData): HabitAnalytics[] => {
    const habitGroups = data.completions.reduce((acc, completion) => {
      if (!acc[completion.habitId]) {
        acc[completion.habitId] = [];
      }
      acc[completion.habitId].push(completion);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(habitGroups).map(([habitId, completions]) => {
      const firstCompletion = completions[0];
      const totalCompletions = completions.length;
      const uniqueMembers = new Set(completions.map(c => c.memberId)).size;
      
      // Calculate completion rate based on active members
      const totalMembers = currentWorkspace?.members.length || 1;
      const daysInPeriod = period === 'week' ? 7 : period === 'month' ? 30 : 365;
      const possibleCompletions = totalMembers * daysInPeriod;
      const completionRate = (totalCompletions / possibleCompletions) * 100;

      const averageStreak = completions.reduce((sum, c) => sum + (c.streakCount || 0), 0) / completions.length;
      
      const memberCompletionCounts = completions.reduce((acc, c) => {
        acc[c.memberId] = (acc[c.memberId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostSuccessfulMemberId = Object.entries(memberCompletionCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

      const mostSuccessfulMember = currentWorkspace?.members.find(m => m.id === mostSuccessfulMemberId)?.displayName || 'Unknown';

      // Calculate trend (simplified - could be more sophisticated)
      const trendDirection = calculateHabitTrend(completions);

      return {
        habitId,
        habitName: firstCompletion.habitName || 'Unknown Habit',
        habitEmoji: firstCompletion.habitEmoji || '📝',
        totalCompletions,
        completionRate,
        averageStreak,
        mostSuccessfulMember,
        trendDirection
      };
    });
  };

  const calculateTimeAnalytics = (data: AnalyticsData, period: 'week' | 'month' | 'year'): TimeAnalytics[] => {
    // Group data by time periods (days, weeks, or months depending on the period)
    const timeGroups = groupDataByTime(data.completions, period);
    
    return Object.entries(timeGroups).map(([timeKey, completions]) => {
      const pointsEarned = completions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
      
      const dayMoods = data.moods.filter(m => 
        timeKey === getTimeKey(new Date(m.date), period)
      );
      const averageMood = dayMoods.length > 0
        ? dayMoods.reduce((sum, m) => sum + m.mood, 0) / dayMoods.length
        : 0;

      // Calculate perfect days (all habits completed by all members)
      const perfectDays = calculatePerfectDays(completions, timeKey);

      return {
        period: timeKey,
        completions: completions.length,
        pointsEarned,
        averageMood,
        perfectDays
      };
    });
  };

  // Helper functions
  const getMostPopularReward = (rewards: any[], redemptions: any[]): string => {
    const rewardCounts = redemptions.reduce((acc, r) => {
      acc[r.rewardId] = (acc[r.rewardId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostPopularRewardId = Object.entries(rewardCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0];

    return rewards.find(r => r.id === mostPopularRewardId)?.title || 'None';
  };

  const calculatePossibleCompletions = (period: 'week' | 'month' | 'year'): number => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
    const habitsCount = 3; // Assume average of 3 habits per member
    return days * habitsCount;
  };

  const calculateCurrentStreak = (completions: any[]): number => {
    if (completions.length === 0) return 0;
    
    // Sort by date and calculate current streak
    const sortedCompletions = completions
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    let currentDate = new Date();
    
    for (const completion of sortedCompletions) {
      const completionDate = new Date(completion.date);
      const dayDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff <= streak + 1) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateLongestStreak = (completions: any[]): number => {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions
      .filter(c => c.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedCompletions.length; i++) {
      const prevDate = new Date(sortedCompletions[i - 1].date);
      const currentDate = new Date(sortedCompletions[i].date);
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const getFavoriteHabits = (completions: any[]): string[] => {
    const habitCounts = completions.reduce((acc, c) => {
      acc[c.habitId] = (acc[c.habitId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(habitCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([habitId]) => habitId);
  };

  const calculateHabitTrend = (completions: any[]): 'up' | 'down' | 'stable' => {
    if (completions.length < 7) return 'stable';

    const sortedCompletions = completions.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const firstHalf = sortedCompletions.slice(0, Math.floor(completions.length / 2));
    const secondHalf = sortedCompletions.slice(Math.floor(completions.length / 2));

    const firstHalfRate = firstHalf.length;
    const secondHalfRate = secondHalf.length;

    if (secondHalfRate > firstHalfRate * 1.1) return 'up';
    if (secondHalfRate < firstHalfRate * 0.9) return 'down';
    return 'stable';
  };

  const groupDataByTime = (completions: any[], period: 'week' | 'month' | 'year'): Record<string, any[]> => {
    return completions.reduce((acc, completion) => {
      const timeKey = getTimeKey(new Date(completion.date), period);
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(completion);
      return acc;
    }, {} as Record<string, any[]>);
  };

  const getTimeKey = (date: Date, period: 'week' | 'month' | 'year'): string => {
    switch (period) {
      case 'week':
        return date.toISOString().split('T')[0]; // Daily for week view
      case 'month':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().split('T')[0]; // Weekly for month view
      case 'year':
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly for year view
      default:
        return date.toISOString().split('T')[0];
    }
  };

  const calculatePerfectDays = (completions: any[], timeKey: string): number => {
    // Simplified calculation - could be more accurate with actual habit requirements
    const uniqueDays = new Set(completions.map(c => c.date)).size;
    const expectedCompletionsPerDay = currentWorkspace?.members.length || 1;
    const actualCompletionsPerDay = completions.length / uniqueDays;
    
    return actualCompletionsPerDay >= expectedCompletionsPerDay ? uniqueDays : 0;
  };

  return {
    analytics,
    memberAnalytics,
    habitAnalytics,
    timeAnalytics,
    loading,
    error,
    refreshAnalytics: loadAnalyticsData
  };
}

// Helper function to format data for analytics
const formatAnalyticsData = (rawData: any): AnalyticsData => {
  return {
    completions: rawData.completions || [],
    moods: rawData.moods || [],
    rewards: rawData.rewards || [],
    redemptions: rawData.redemptions || []
  };
};