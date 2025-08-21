'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { useMoods } from '@/hooks/useMoods';
import {
  CoachingInsight,
  DailyRecommendation,
  MoodBasedStrategy,
  ChallengeRecommendation,
  ProgressCelebration,
  WeeklyAnalysis,
  UserPerformanceData,
  calculateUserPerformanceLevel,
  analyzeWeeklyPerformance,
  prioritizeHabits,
  generateMotivationalMessage,
  createMoodBasedStrategy,
  DAILY_COACHING_PROMPT,
  WEEKLY_ANALYSIS_PROMPT,
  CHALLENGE_SUGGESTION_PROMPT,
  MOTIVATIONAL_MESSAGE_PROMPT
} from '@/lib/aiCoach';
import { MoodAnalysisApiResponse, EnhancedMoodAnalysisResponse } from '@/types';
import { getTodayDateString, getDateDaysAgo, calculateStreak } from '@/lib/utils';

interface AICoachState {
  insights: CoachingInsight[];
  dailyRecommendations: DailyRecommendation[];
  weeklyAnalysis: WeeklyAnalysis | null;
  moodStrategies: MoodBasedStrategy[];
  challenges: ChallengeRecommendation[];
  celebrations: ProgressCelebration[];
  motivationalMessage: string;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface CoachingPreferences {
  communicationStyle: 'encouraging' | 'direct' | 'analytical';
  focusAreas: string[];
  dailyGoals: number;
  challengeLevel: 'easy' | 'medium' | 'hard';
}

export function useAICoach(preferences?: CoachingPreferences) {
  const { user } = useAuth();
  const { habits, completions, loading: habitsLoading } = useHabits();
  const { moods, getTodayMood, loading: moodsLoading } = useMoods();
  
  const [coachState, setCoachState] = useState<AICoachState>({
    insights: [],
    dailyRecommendations: [],
    weeklyAnalysis: null,
    moodStrategies: [],
    challenges: [],
    celebrations: [],
    motivationalMessage: '',
    loading: false,
    error: null,
    lastUpdated: null
  });

  const [moodAnalysisData, setMoodAnalysisData] = useState<EnhancedMoodAnalysisResponse | null>(null);
  const [moodAnalysisLoading, setMoodAnalysisLoading] = useState(false);

  // Memoized user performance data
  const performanceData: UserPerformanceData = useMemo(() => {
    const stats = habits.map(habit => {
      const streak = calculateStreak(habit.id, completions);
      const recentCompletions = completions.filter(c => 
        c.habitId === habit.id && 
        c.date > getDateDaysAgo(30)
      );
      const completionRate = recentCompletions.length > 0 
        ? (recentCompletions.filter(c => c.completed).length / recentCompletions.length) * 100 
        : 0;
      
      return {
        habitId: habit.id,
        currentStreak: streak,
        longestStreak: streak, // Would need historical data for true longest streak
        completionRate,
        totalCompletions: completions.filter(c => c.habitId === habit.id && c.completed).length,
        lastCompleted: completions
          .filter(c => c.habitId === habit.id && c.completed)
          .sort((a, b) => b.date.localeCompare(a.date))[0]?.date
      };
    });

    return { habits, completions, moods, stats };
  }, [habits, completions, moods]);

  // Get mood analysis data
  const fetchMoodAnalysis = useCallback(async () => {
    if (!user || moods.length < 7) return;

    setMoodAnalysisLoading(true);
    try {
      const endDate = getTodayDateString();
      const startDate = getDateDaysAgo(30);

      const response = await fetch('/api/claude/mood-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          userId: user.uid
        })
      });

      if (response.ok) {
        const data: MoodAnalysisApiResponse = await response.json();
        if (data.success && data.data) {
          setMoodAnalysisData(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching mood analysis:', error);
    } finally {
      setMoodAnalysisLoading(false);
    }
  }, [user, moods]);

  // Generate daily recommendations (local + AI)
  const generateDailyRecommendations = useCallback(async (): Promise<DailyRecommendation[]> => {
    const today = getTodayDateString();
    const todaysMood = moods.find(mood => mood.date === today);
    
    // Get pending habits (not completed today)
    const pendingHabits = habits.filter(habit => {
      const todayCompletion = completions.find(c => c.habitId === habit.id && c.date === today);
      return !todayCompletion?.completed;
    });

    // Priority-based local recommendations
    const prioritizedHabits = prioritizeHabits(habits, completions, todaysMood ?? undefined);
    const localRecommendations: DailyRecommendation[] = prioritizedHabits
      .slice(0, 3)
      .map((item, index) => ({
        id: `daily-${item.habit.id}-${Date.now()}`,
        type: 'recommendation' as const,
        priority: index === 0 ? 'high' as const : 'medium' as const,
        title: `Complete ${item.habit.name}`,
        message: `${item.reason}. Small consistent actions build lasting change.`,
        actionable: true,
        habitId: item.habit.id,
        habitName: item.habit.name,
        category: 'performance' as const,
        confidence: 0.8,
        suggestedTime: getSuggestedTime(item.habit, todaysMood),
        estimatedImpact: item.priority > 70 ? 'high' as const : 'medium' as const,
        basedOn: determineBasedOn(item.reason)
      }));

    // Add mood-based recommendations
    if (todaysMood) {
      if (todaysMood.stress >= 4) {
        localRecommendations.unshift({
          id: `stress-${Date.now()}`,
          type: 'recommendation',
          priority: 'high',
          title: 'Manage Stress First',
          message: 'High stress detected. Consider meditation or breathing exercises before other habits.',
          actionable: true,
          category: 'mood',
          confidence: 0.9,
          suggestedTime: 'now',
          estimatedImpact: 'high',
          basedOn: 'mood'
        });
      }

      if (todaysMood.energy <= 2) {
        localRecommendations.push({
          id: `energy-${Date.now()}`,
          type: 'recommendation',
          priority: 'medium',
          title: 'Gentle Energy Boost',
          message: 'Low energy today. Start with light movement or step outside for fresh air.',
          actionable: true,
          category: 'mood',
          confidence: 0.85,
          suggestedTime: 'morning',
          estimatedImpact: 'medium',
          basedOn: 'mood'
        });
      }
    }

    return localRecommendations.slice(0, 5);
  }, [habits, completions, moods]);

  // Generate weekly insights
  const generateWeeklyInsights = useCallback((): WeeklyAnalysis => {
    return analyzeWeeklyPerformance(habits, completions, moods);
  }, [habits, completions, moods]);

  // Generate mood-based strategies
  const generateMoodStrategies = useCallback((): MoodBasedStrategy[] => {
    const todaysMood = getTodayMood();
    if (!todaysMood) return [];

    const strugglingHabits = habits
      .filter(habit => {
        const recent = completions
          .filter(c => c.habitId === habit.id && c.date > getDateDaysAgo(7))
          .filter(c => c.completed);
        return recent.length < 3; // Less than 3 completions in last week
      })
      .map(h => ({ habitId: h.id, habitName: h.name }));

    return createMoodBasedStrategy(todaysMood, strugglingHabits);
  }, [habits, completions, getTodayMood]);

  // Generate celebrations
  const generateCelebrations = useCallback((): ProgressCelebration[] => {
    const celebrations: ProgressCelebration[] = [];
    const today = getTodayDateString();

    // Celebrate streaks
    habits.forEach(habit => {
      const streak = calculateStreak(habit.id, completions);
      if (streak > 0 && streak % 7 === 0) { // Weekly milestones
        celebrations.push({
          id: `streak-${habit.id}-${Date.now()}`,
          type: 'celebration',
          priority: 'medium',
          title: `${streak} Day Streak!`,
          message: `Amazing work maintaining ${habit.name} for ${streak} days straight!`,
          actionable: false,
          habitId: habit.id,
          habitName: habit.name,
          category: 'streak',
          confidence: 1.0,
          achievement: `${streak}-day streak`,
          milestone: `Week ${Math.floor(streak / 7)}`,
          encouragement: 'Consistency is the foundation of lasting change.',
          nextGoal: `Reach ${streak + 7} days`
        });
      }
    });

    // Celebrate daily completions
    const todayCompletions = completions.filter(c => c.date === today && c.completed);
    if (todayCompletions.length === habits.length && habits.length > 0) {
      celebrations.push({
        id: `perfect-day-${Date.now()}`,
        type: 'celebration',
        priority: 'high',
        title: 'Perfect Day!',
        message: 'You completed all your habits today. That\'s exceptional dedication!',
        actionable: false,
        category: 'performance',
        confidence: 1.0,
        achievement: 'Perfect day',
        milestone: 'All habits completed',
        encouragement: 'This is what peak performance looks like!',
        nextGoal: 'Build a perfect week'
      });
    }

    return celebrations;
  }, [habits, completions]);

  // Generate challenges
  const generateChallenges = useCallback((): ChallengeRecommendation[] => {
    const userLevel = calculateUserPerformanceLevel(performanceData.stats);
    const challenges: ChallengeRecommendation[] = [];

    // Streak challenges
    const longestStreak = Math.max(...performanceData.stats.map(s => s.currentStreak), 0);
    if (longestStreak >= 7 && longestStreak < 21) {
      challenges.push({
        id: `streak-challenge-${Date.now()}`,
        type: 'challenge',
        priority: 'medium',
        title: '21-Day Consistency Challenge',
        message: 'Build a habit that sticks by maintaining it for 21 consecutive days.',
        actionable: true,
        category: 'streak',
        confidence: 0.8,
        challenge: 'Choose one habit and complete it every day for 21 days',
        duration: 21,
        difficulty: userLevel === 'beginner' ? 'medium' : 'easy',
        potentialBenefit: 'Scientifically-backed habit formation duration',
        successCriteria: 'Complete chosen habit 21 days in a row'
      });
    }

    // Performance challenges
    const avgCompletionRate = performanceData.stats.reduce((sum, s) => sum + s.completionRate, 0) / performanceData.stats.length;
    if (avgCompletionRate < 80 && avgCompletionRate > 50) {
      challenges.push({
        id: `performance-challenge-${Date.now()}`,
        type: 'challenge',
        priority: 'high',
        title: '80% Week Challenge',
        message: 'Aim for 80% completion rate across all habits for one week.',
        actionable: true,
        category: 'performance',
        confidence: 0.9,
        challenge: 'Achieve 80% overall completion rate for 7 consecutive days',
        duration: 7,
        difficulty: 'medium',
        potentialBenefit: 'Significant improvement in habit consistency',
        successCriteria: 'Complete 80% or more of daily habits for 7 days'
      });
    }

    return challenges;
  }, [performanceData]);

  // Update all coaching insights
  const updateCoachingInsights = useCallback(async () => {
    if (habitsLoading || moodsLoading || !user) return;

    setCoachState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Generate insights directly instead of using callbacks
      const dailyRecs = await (async (): Promise<DailyRecommendation[]> => {
        const today = getTodayDateString();
        const todaysMood = moods.find(mood => mood.date === today);
        
        const prioritizedHabits = prioritizeHabits(habits, completions, todaysMood ?? undefined);
        const localRecommendations: DailyRecommendation[] = prioritizedHabits
          .slice(0, 3)
          .map((item, index) => ({
            id: `daily-${item.habit.id}-${Date.now()}`,
            type: 'recommendation' as const,
            priority: index === 0 ? 'high' as const : 'medium' as const,
            title: `Complete ${item.habit.name}`,
            message: `${item.reason}. Small consistent actions build lasting change.`,
            actionable: true,
            habitId: item.habit.id,
            habitName: item.habit.name,
            category: 'performance' as const,
            confidence: 0.8,
            suggestedTime: getSuggestedTime(item.habit, todaysMood),
            estimatedImpact: item.priority > 70 ? 'high' as const : 'medium' as const,
            basedOn: determineBasedOn(item.reason)
          }));

        // Add mood-based recommendations
        if (todaysMood) {
          if (todaysMood.stress >= 4) {
            localRecommendations.unshift({
              id: `stress-${Date.now()}`,
              type: 'recommendation',
              priority: 'high',
              title: 'Manage Stress First',
              message: 'High stress detected. Consider meditation or breathing exercises before other habits.',
              actionable: true,
              category: 'mood',
              confidence: 0.9,
              suggestedTime: 'now',
              estimatedImpact: 'high',
              basedOn: 'mood'
            });
          }

          if (todaysMood.energy <= 2) {
            localRecommendations.push({
              id: `energy-${Date.now()}`,
              type: 'recommendation',
              priority: 'medium',
              title: 'Gentle Energy Boost',
              message: 'Low energy today. Start with light movement or step outside for fresh air.',
              actionable: true,
              category: 'mood',
              confidence: 0.85,
              suggestedTime: 'morning',
              estimatedImpact: 'medium',
              basedOn: 'mood'
            });
          }
        }

        return localRecommendations.slice(0, 5);
      })();

      const weeklyAnalysis = analyzeWeeklyPerformance(habits, completions, moods);
      const moodStrategies = generateMoodStrategiesFromData(performanceData, moods);
      const celebrations = generateCelebrationsFromData(habits, completions);
      const challenges = generateChallengesFromData(performanceData);

      const currentTime = new Date();
      const timeOfDay = currentTime.getHours() < 12 ? 'morning' : 
                      currentTime.getHours() < 17 ? 'afternoon' : 'evening';
      
      const recentAchievements = celebrations.map(c => c.achievement);
      const motivationalMessage = generateMotivationalMessage(
        recentAchievements,
        undefined,
        timeOfDay
      );

      // Combine all insights
      const allInsights: CoachingInsight[] = [
        ...dailyRecs,
        ...moodStrategies,
        ...challenges,
        ...celebrations
      ].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      setCoachState({
        insights: allInsights,
        dailyRecommendations: dailyRecs,
        weeklyAnalysis,
        moodStrategies,
        challenges,
        celebrations,
        motivationalMessage,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

    } catch (error) {
      console.error('Error updating coaching insights:', error);
      setCoachState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to update coaching insights'
      }));
    }
  }, [
    habits,
    completions, 
    moods,
    habitsLoading,
    moodsLoading,
    user,
    performanceData
  ]);

  // Auto-update coaching insights when data changes
  useEffect(() => {
    if (!habitsLoading && !moodsLoading && habits.length > 0) {
      updateCoachingInsights();
    }
  }, [habits.length, completions.length, moods.length, habitsLoading, moodsLoading]);

  // Auto-fetch mood analysis
  useEffect(() => {
    if (moods.length >= 7) {
      fetchMoodAnalysis();
    }
  }, [moods.length, fetchMoodAnalysis]);

  // Helper functions
  const getSuggestedTime = (habit: any, mood: any): 'morning' | 'afternoon' | 'evening' | 'now' => {
    if (mood?.energy <= 2 && habit.tags?.includes('exercise')) return 'afternoon';
    if (habit.tags?.includes('meditation')) return 'morning';
    if (habit.tags?.includes('evening')) return 'evening';
    return 'morning';
  };

  const determineBasedOn = (reason: string): 'mood' | 'performance' | 'streak' | 'pattern' => {
    if (reason.includes('mood') || reason.includes('energy')) return 'mood';
    if (reason.includes('streak')) return 'streak';
    if (reason.includes('performance')) return 'performance';
    return 'pattern';
  };

  return {
    // State
    ...coachState,
    moodAnalysisData,
    moodAnalysisLoading,
    performanceData,
    
    // Actions
    updateCoachingInsights,
    fetchMoodAnalysis,
    
    // Computed
    isDataReady: !habitsLoading && !moodsLoading && habits.length > 0,
    hasEnoughData: moods.length >= 7 && habits.length > 0,
    userLevel: calculateUserPerformanceLevel(performanceData.stats)
  };
}

// Custom hook for specific coaching features
export function useCoachingRecommendations() {
  const coach = useAICoach();
  
  return {
    todayRecommendations: coach.dailyRecommendations.filter(r => 
      r.suggestedTime === 'now' || r.priority === 'high'
    ),
    moodBasedAdvice: coach.moodStrategies,
    celebrationMoments: coach.celebrations,
    loading: coach.loading,
    error: coach.error
  };
}

export function useCoachingChallenges() {
  const coach = useAICoach();
  
  return {
    availableChallenges: coach.challenges,
    userLevel: coach.userLevel,
    loading: coach.loading,
    error: coach.error
  };
}