import { Habit, HabitCompletion, MoodEntry, HabitStats } from '@/types';
import { getTodayDateString, getDateDaysAgo, calculateStreak } from '@/lib/utils';

// AI Coach Types
export interface CoachingInsight {
  id: string;
  type: 'recommendation' | 'strategy' | 'challenge' | 'celebration' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionable: boolean;
  habitId?: string;
  habitName?: string;
  category: 'mood' | 'performance' | 'streak' | 'general' | 'challenge';
  confidence: number; // 0-1 confidence score
  metadata?: {
    targetImprovement?: number;
    timeframe?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

export interface DailyRecommendation extends CoachingInsight {
  type: 'recommendation';
  suggestedTime?: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  basedOn: 'mood' | 'performance' | 'streak' | 'pattern';
}

export interface MoodBasedStrategy extends CoachingInsight {
  type: 'strategy';
  moodTrigger: {
    mood?: [number, number];
    energy?: [number, number];
    stress?: [number, number];
    sleep?: [number, number];
  };
  strategy: string;
  implementation: string[];
}

export interface ChallengeRecommendation extends CoachingInsight {
  type: 'challenge';
  challenge: string;
  duration: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
  potentialBenefit: string;
  successCriteria: string;
}

export interface ProgressCelebration extends CoachingInsight {
  type: 'celebration';
  achievement: string;
  milestone: string;
  encouragement: string;
  nextGoal?: string;
}

// Performance Analysis Types
export interface UserPerformanceData {
  habits: Habit[];
  completions: HabitCompletion[];
  moods: MoodEntry[];
  stats: HabitStats[];
}

export interface WeeklyAnalysis {
  completionRate: number;
  averageMood: number;
  streakChanges: Array<{
    habitId: string;
    habitName: string;
    change: number;
    current: number;
  }>;
  topPerformers: Array<{
    habitId: string;
    habitName: string;
    rate: number;
  }>;
  strugglingHabits: Array<{
    habitId: string;
    habitName: string;
    rate: number;
    issues: string[];
  }>;
}

// Claude AI Prompts for Coaching
export const DAILY_COACHING_PROMPT = (
  userName: string,
  todaysMood: MoodEntry | null,
  pendingHabits: Array<{ name: string; streak: number; lastCompleted?: string }>,
  weeklyPerformance: { avgCompletion: number; moodTrend: string },
  personalPatterns?: string
) => `
Generate personalized daily coaching recommendations for ${userName || 'user'}.

Today's Context:
${todaysMood ? `Current mood: ${todaysMood.mood}/5, energy: ${todaysMood.energy}/5, stress: ${todaysMood.stress}/5, sleep: ${todaysMood.sleep}/5` : 'No mood data today'}

Pending Habits (not completed today):
${pendingHabits.map(h => `- ${h.name} (${h.streak} day streak, last: ${h.lastCompleted || 'never'})`).join('\n')}

Weekly Performance:
- Average completion: ${weeklyPerformance.avgCompletion}%
- Mood trend: ${weeklyPerformance.moodTrend}
${personalPatterns ? `\nPersonal patterns: ${personalPatterns}` : ''}

Return JSON with 3-5 prioritized recommendations:
{
  "recommendations": [
    {
      "priority": "high"|"medium"|"low",
      "title": "clear action title (max 8 words)",
      "message": "specific, encouraging guidance (max 40 words)",
      "habitId": "relevant habit ID if applicable",
      "basedOn": "mood"|"performance"|"streak"|"pattern",
      "suggestedTime": "morning"|"afternoon"|"evening"|"now",
      "estimatedImpact": "high"|"medium"|"low"
    }
  ],
  "motivation": "personalized motivational message (max 30 words)",
  "focus": "main area to focus on today (max 15 words)"
}`;

export const WEEKLY_ANALYSIS_PROMPT = (
  analysis: WeeklyAnalysis,
  moodPatterns: string,
  previousWeekComparison: number
) => `
Analyze this user's weekly habit performance and provide insights.

Week Performance:
- Overall completion rate: ${analysis.completionRate}%
- Average mood score: ${analysis.averageMood}/5
- Compared to previous week: ${previousWeekComparison > 0 ? '+' : ''}${previousWeekComparison}%

Top Performers:
${analysis.topPerformers.map(h => `- ${h.habitName}: ${h.rate}%`).join('\n')}

Struggling Habits:
${analysis.strugglingHabits.map(h => `- ${h.habitName}: ${h.rate}% (issues: ${h.issues.join(', ')})`).join('\n')}

Mood patterns: ${moodPatterns}

Return JSON with insights and next week's strategy:
{
  "insight": "key finding about their performance patterns (max 50 words)",
  "strengths": ["what they're doing well", "another strength"],
  "opportunities": ["specific area to improve", "another opportunity"],  
  "nextWeekFocus": "main area to concentrate on (max 20 words)",
  "strategicAdvice": "actionable strategy for improvement (max 40 words)"
}`;

export const CHALLENGE_SUGGESTION_PROMPT = (
  userLevel: 'beginner' | 'intermediate' | 'advanced',
  weakAreas: string[],
  strengths: string[],
  availableTime: number, // minutes per day
  recentChallenges: string[]
) => `
Suggest personalized challenges for habit improvement.

User Profile:
- Experience level: ${userLevel}
- Time available: ${availableTime} minutes/day
- Areas needing improvement: ${weakAreas.join(', ')}
- Current strengths: ${strengths.join(', ')}
- Recent challenges attempted: ${recentChallenges.join(', ') || 'none'}

Return JSON with 3 progressive challenges:
{
  "challenges": [
    {
      "name": "challenge name (max 8 words)",
      "description": "what the challenge involves (max 30 words)",
      "difficulty": "easy"|"medium"|"hard",
      "duration": 7|14|21|30,
      "potentialBenefit": "expected improvement (max 25 words)",
      "successCriteria": "how to measure success (max 20 words)",
      "tips": ["helpful tip", "another tip"]
    }
  ]
}`;

export const MOTIVATIONAL_MESSAGE_PROMPT = (
  context: {
    recentAchievements: string[];
    currentStruggle?: string;
    personality: 'encouraging' | 'direct' | 'analytical';
    timeOfDay: 'morning' | 'afternoon' | 'evening';
  }
) => `
Generate a motivational message based on user context.

Context:
- Recent achievements: ${context.recentAchievements.join(', ')}
${context.currentStruggle ? `- Current challenge: ${context.currentStruggle}` : ''}
- Communication style: ${context.personality}
- Time: ${context.timeOfDay}

Return a single encouraging message (max 35 words) that:
1. Acknowledges their efforts
2. Provides specific motivation
3. Matches the requested tone
4. Is appropriate for time of day

Message:`;

// Utility Functions for AI Coach
export function calculateUserPerformanceLevel(stats: HabitStats[]): 'beginner' | 'intermediate' | 'advanced' {
  if (stats.length === 0) return 'beginner';
  
  const avgCompletionRate = stats.reduce((sum, stat) => sum + stat.completionRate, 0) / stats.length;
  const avgStreak = stats.reduce((sum, stat) => sum + stat.currentStreak, 0) / stats.length;
  const maxStreak = Math.max(...stats.map(stat => stat.longestStreak));
  
  // Advanced: High completion rates, long streaks
  if (avgCompletionRate >= 80 && avgStreak >= 14 && maxStreak >= 30) {
    return 'advanced';
  }
  
  // Intermediate: Moderate performance
  if (avgCompletionRate >= 60 && avgStreak >= 7 && maxStreak >= 14) {
    return 'intermediate';
  }
  
  return 'beginner';
}

export function analyzeWeeklyPerformance(
  habits: Habit[],
  completions: HabitCompletion[],
  moods: MoodEntry[]
): WeeklyAnalysis {
  const oneWeekAgo = getDateDaysAgo(7);
  const recentCompletions = completions.filter(c => c.date > oneWeekAgo);
  const recentMoods = moods.filter(m => m.date > oneWeekAgo);
  
  // Calculate completion rate
  const totalPossibleCompletions = habits.length * 7;
  const actualCompletions = recentCompletions.filter(c => c.completed).length;
  const completionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0;
  
  // Calculate average mood
  const averageMood = recentMoods.length > 0 
    ? recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length 
    : 0;
  
  // Find top performers and struggling habits
  const habitPerformance = habits.map(habit => {
    const habitCompletions = recentCompletions.filter(c => c.habitId === habit.id);
    const completedCount = habitCompletions.filter(c => c.completed).length;
    const rate = (completedCount / 7) * 100;
    
    return { habitId: habit.id, habitName: habit.name, rate };
  });
  
  const topPerformers = habitPerformance
    .filter(h => h.rate >= 70)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 3);
  
  const strugglingHabits = habitPerformance
    .filter(h => h.rate < 50)
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 3)
    .map(h => ({
      ...h,
      issues: identifyHabitIssues(h.rate, h.habitId, recentCompletions)
    }));
  
  return {
    completionRate,
    averageMood,
    streakChanges: [], // Would need historical data to calculate
    topPerformers,
    strugglingHabits
  };
}

export function identifyHabitIssues(completionRate: number, habitId: string, completions: HabitCompletion[]): string[] {
  const issues: string[] = [];
  const habitCompletions = completions.filter(c => c.habitId === habitId);
  
  if (completionRate === 0) {
    issues.push('not started');
  } else if (completionRate < 25) {
    issues.push('very low frequency');
  } else if (completionRate < 50) {
    issues.push('inconsistent');
  }
  
  // Check for patterns in missed days
  const dates = habitCompletions.map(c => new Date(c.date).getDay());
  const weekendMisses = dates.filter(d => d === 0 || d === 6).length;
  const weekdayMisses = dates.filter(d => d > 0 && d < 6).length;
  
  if (weekendMisses > weekdayMisses * 2) {
    issues.push('weekend struggles');
  }
  
  return issues;
}

export function prioritizeHabits(
  habits: Habit[],
  completions: HabitCompletion[],
  currentMood?: MoodEntry
): Array<{habit: Habit, priority: number, reason: string}> {
  const today = getTodayDateString();
  
  return habits.map(habit => {
    let priority = 50; // Base priority
    let reason = 'regular practice';
    
    // Check if completed today
    const todayCompletion = completions.find(c => c.habitId === habit.id && c.date === today);
    if (todayCompletion?.completed) {
      priority = 10; // Low priority if already done
      reason = 'already completed';
      return { habit, priority, reason };
    }
    
    // Calculate current streak
    const streak = calculateStreak(habit.id, completions);
    
    // High priority for maintaining long streaks
    if (streak >= 7) {
      priority += 30;
      reason = `maintain ${streak}-day streak`;
    }
    
    // High priority for habits at risk of breaking streak
    if (streak > 0) {
      priority += 20;
      reason = `protect ${streak}-day progress`;
    }
    
    // Consider mood-based prioritization
    if (currentMood) {
      // Prioritize mood-boosting habits when mood is low
      if (currentMood.mood <= 2 && habit.tags?.includes('mental-health')) {
        priority += 25;
        reason = 'boost mood';
      }
      
      // Prioritize energy habits when energy is low
      if (currentMood.energy <= 2 && habit.tags?.includes('energy')) {
        priority += 20;
        reason = 'increase energy';
      }
      
      // Lower priority for strenuous habits when energy is very low
      if (currentMood.energy === 1 && habit.tags?.includes('exercise')) {
        priority -= 15;
        reason = 'adapt to low energy';
      }
    }
    
    return { habit, priority, reason };
  }).sort((a, b) => b.priority - a.priority);
}

export function generateMotivationalMessage(
  achievements: string[],
  currentStruggle?: string,
  timeOfDay: 'morning' | 'afternoon' | 'evening' = 'morning'
): string {
  const timeGreetings = {
    morning: ['Start strong', 'Good morning', 'Rise and shine'],
    afternoon: ['Keep going', 'Stay focused', 'Push through'],
    evening: ['Finish strong', 'End well', 'Complete your day']
  };
  
  const greeting = timeGreetings[timeOfDay][Math.floor(Math.random() * timeGreetings[timeOfDay].length)];
  
  if (achievements.length > 0) {
    const achievement = achievements[Math.floor(Math.random() * achievements.length)];
    return `${greeting}! Your ${achievement} shows real dedication. Keep building that momentum!`;
  }
  
  if (currentStruggle) {
    return `${greeting}! Every small step counts. Progress isn't always linear, but you're still moving forward.`;
  }
  
  return `${greeting}! Today is a new opportunity to build positive habits. One small action at a time.`;
}

export function createMoodBasedStrategy(
  moodEntry: MoodEntry,
  strugglingHabits: Array<{habitId: string, habitName: string}>
): MoodBasedStrategy[] {
  const strategies: MoodBasedStrategy[] = [];
  
  // Low mood strategies
  if (moodEntry.mood <= 2) {
    strategies.push({
      id: `mood-strategy-${Date.now()}`,
      type: 'strategy',
      priority: 'high',
      title: 'Low Mood Support',
      message: 'When mood is low, focus on gentle, nurturing habits that provide immediate comfort.',
      actionable: true,
      category: 'mood',
      confidence: 0.8,
      moodTrigger: { mood: [1, 2] },
      strategy: 'Gentle Self-Care Focus',
      implementation: [
        'Choose one easy habit to maintain momentum',
        'Practice self-compassion if you miss habits',
        'Focus on habits that boost mood (meditation, gratitude)',
        'Reduce expectations temporarily'
      ]
    });
  }
  
  // Low energy strategies
  if (moodEntry.energy <= 2) {
    strategies.push({
      id: `energy-strategy-${Date.now()}`,
      type: 'strategy',
      priority: 'high',
      title: 'Low Energy Adaptation',
      message: 'Adapt your habits to match your energy levels rather than forcing high-intensity actions.',
      actionable: true,
      category: 'performance',
      confidence: 0.9,
      moodTrigger: { energy: [1, 2] },
      strategy: 'Energy-Matched Habits',
      implementation: [
        'Replace intense workouts with gentle stretching',
        'Choose shorter versions of habits (5-min meditation vs 20-min)',
        'Focus on habits that naturally boost energy',
        'Schedule demanding habits for higher energy periods'
      ]
    });
  }
  
  // High stress strategies
  if (moodEntry.stress >= 4) {
    strategies.push({
      id: `stress-strategy-${Date.now()}`,
      type: 'strategy',
      priority: 'high',
      title: 'Stress Management Mode',
      message: 'When stress is high, prioritize habits that create calm and reduce overwhelm.',
      actionable: true,
      category: 'mood',
      confidence: 0.85,
      moodTrigger: { stress: [4, 5] },
      strategy: 'Stress-First Approach',
      implementation: [
        'Start with stress-reducing habits (breathing, meditation)',
        'Simplify your habit routine temporarily',
        'Use habits as stress-relief tools',
        'Focus on process over outcomes'
      ]
    });
  }
  
  return strategies;
}