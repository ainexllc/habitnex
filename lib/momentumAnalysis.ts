// Momentum analysis utilities for habit tracking
import { Habit, HabitCompletion } from '@/types';
import { MomentumState } from './waveAnimations';

export interface HabitMomentumData {
  habitId: string;
  momentum: MomentumState;
  trend: {
    direction: 'up' | 'down' | 'stable';
    strength: number; // 0-1 scale
    duration: number; // days
  };
  streakData: {
    current: number;
    longest: number;
    recent: number; // streak in last 30 days
  };
  completion: {
    last7Days: number;
    last30Days: number;
    last90Days: number;
    allTime: number;
  };
  prediction: {
    nextWeek: number; // predicted completion rate
    confidence: number; // 0-1 scale
  };
}

export interface MomentumInsight {
  type: 'positive' | 'warning' | 'critical' | 'celebration';
  title: string;
  message: string;
  habitId: string;
  priority: number; // 1-10 scale
  actionable: boolean;
  suggestion?: string;
}

// Calculate comprehensive habit momentum
export function calculateHabitMomentum(
  habit: Habit,
  completions: HabitCompletion[],
  analysisDate: Date = new Date()
): HabitMomentumData {
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id && c.completed)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate completion rates for different periods
  const completion = {
    last7Days: calculateCompletionRate(habitCompletions, analysisDate, 7),
    last30Days: calculateCompletionRate(habitCompletions, analysisDate, 30),
    last90Days: calculateCompletionRate(habitCompletions, analysisDate, 90),
    allTime: calculateCompletionRate(habitCompletions, analysisDate, Infinity),
  };

  // Calculate streaks
  const streakData = calculateStreakData(habitCompletions, analysisDate);

  // Determine momentum state
  const momentum = determineMomentumState(completion, streakData);

  // Analyze trend
  const trend = analyzeTrend(habitCompletions, analysisDate);

  // Predict future performance
  const prediction = predictFuturePerformance(completion, trend, momentum);

  return {
    habitId: habit.id,
    momentum,
    trend,
    streakData,
    completion,
    prediction,
  };
}

// Calculate completion rate for a specific time period
function calculateCompletionRate(
  completions: HabitCompletion[],
  analysisDate: Date,
  days: number
): number {
  if (days === Infinity) {
    // All-time rate calculation would need the habit start date
    // For now, use a reasonable period
    days = 365;
  }

  const periodStart = new Date(analysisDate);
  periodStart.setDate(periodStart.getDate() - days);

  const completionsInPeriod = completions.filter(c => {
    const completionDate = new Date(c.date);
    return completionDate >= periodStart && completionDate <= analysisDate;
  });

  // Calculate expected completions based on habit frequency
  // For now, assume daily habits (this could be enhanced based on habit.frequency)
  const expectedCompletions = days;

  return Math.min(1, completionsInPeriod.length / expectedCompletions);
}

// Calculate streak information
function calculateStreakData(
  completions: HabitCompletion[],
  analysisDate: Date
): HabitMomentumData['streakData'] {
  if (completions.length === 0) {
    return { current: 0, longest: 0, recent: 0 };
  }

  // Sort completions by date (newest first)
  const sortedCompletions = completions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate current streak (from today backwards)
  let currentStreak = 0;
  const today = new Date(analysisDate);
  let checkDate = new Date(today);

  while (true) {
    const dateString = checkDate.toISOString().split('T')[0];
    const hasCompletion = sortedCompletions.some(c => c.date === dateString);
    
    if (hasCompletion) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak ever
  let longestStreak = 0;
  let tempStreak = 0;
  const allDates = sortedCompletions.map(c => c.date).sort();
  
  for (let i = 0; i < allDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = new Date(allDates[i - 1]);
      const currentDate = new Date(allDates[i]);
      const daysDiff = Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  // Calculate recent streak (best streak in last 30 days)
  const thirtyDaysAgo = new Date(analysisDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentCompletions = completions.filter(c => 
    new Date(c.date) >= thirtyDaysAgo
  );
  
  const recentStreak = calculateBestRecentStreak(recentCompletions);

  return {
    current: currentStreak,
    longest: longestStreak,
    recent: recentStreak,
  };
}

// Calculate best streak in recent completions
function calculateBestRecentStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  const dates = completions.map(c => c.date).sort();
  let bestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currentDate = new Date(dates[i]);
    const daysDiff = Math.abs(currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff === 1) {
      currentStreak++;
    } else {
      bestStreak = Math.max(bestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(bestStreak, currentStreak);
}

// Determine momentum state based on performance metrics
function determineMomentumState(
  completion: HabitMomentumData['completion'],
  streakData: HabitMomentumData['streakData']
): MomentumState {
  const { last7Days, last30Days } = completion;
  const { current } = streakData;

  // Determine level based on recent performance
  let level: MomentumState['level'];
  if (last7Days > last30Days && last7Days >= 0.7) {
    level = 'building';
  } else if (last7Days >= 0.6 && Math.abs(last7Days - last30Days) <= 0.1) {
    level = 'stable';
  } else if (last7Days < last30Days && last7Days >= 0.3) {
    level = 'declining';
  } else {
    level = 'stalled';
  }

  // Calculate intensity based on completion rate and streak
  const completionIntensity = Math.max(last7Days, last30Days);
  const streakIntensity = Math.min(1, current / 10); // Normalize streak to 0-1
  const intensity = (completionIntensity * 0.7) + (streakIntensity * 0.3);

  // Determine trend
  let trend: MomentumState['trend'];
  if (last7Days > last30Days + 0.1) {
    trend = 'up';
  } else if (last7Days < last30Days - 0.1) {
    trend = 'down';
  } else {
    trend = 'stable';
  }

  return {
    level,
    intensity: Math.max(0.1, Math.min(1, intensity)), // Ensure 0.1 minimum for visibility
    trend,
    completionRate: last30Days,
    streak: current,
  };
}

// Analyze trend direction and strength
function analyzeTrend(
  completions: HabitCompletion[],
  analysisDate: Date
): HabitMomentumData['trend'] {
  if (completions.length < 7) {
    return { direction: 'stable', strength: 0, duration: 0 };
  }

  // Calculate completion rates for each week over the last 8 weeks
  const weeklyRates: number[] = [];
  for (let week = 0; week < 8; week++) {
    const weekStart = new Date(analysisDate);
    weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekCompletions = completions.filter(c => {
      const date = new Date(c.date);
      return date >= weekStart && date < weekEnd;
    });

    weeklyRates.unshift(weekCompletions.length / 7); // Add to beginning for chronological order
  }

  // Calculate trend using linear regression
  const n = weeklyRates.length;
  const sumX = n * (n - 1) / 2; // Sum of indices: 0 + 1 + 2 + ... + (n-1)
  const sumY = weeklyRates.reduce((sum, rate) => sum + rate, 0);
  const sumXY = weeklyRates.reduce((sum, rate, index) => sum + index * rate, 0);
  const sumX2 = weeklyRates.reduce((sum, _, index) => sum + index * index, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Determine direction and strength
  let direction: 'up' | 'down' | 'stable';
  let strength: number;

  if (slope > 0.05) {
    direction = 'up';
    strength = Math.min(1, slope * 2);
  } else if (slope < -0.05) {
    direction = 'down';
    strength = Math.min(1, Math.abs(slope) * 2);
  } else {
    direction = 'stable';
    strength = 0;
  }

  // Calculate duration of current trend
  let duration = 1;
  for (let i = weeklyRates.length - 2; i >= 0; i--) {
    const currentTrend = weeklyRates[i + 1] - weeklyRates[i];
    const prevTrend = weeklyRates[i] - weeklyRates[i - 1] || 0;

    // Check if trend continues in same direction
    if ((direction === 'up' && currentTrend > 0 && prevTrend > 0) ||
        (direction === 'down' && currentTrend < 0 && prevTrend < 0)) {
      duration++;
    } else {
      break;
    }
  }

  return { direction, strength, duration: duration * 7 }; // Convert weeks to days
}

// Predict future performance based on current data
function predictFuturePerformance(
  completion: HabitMomentumData['completion'],
  trend: HabitMomentumData['trend'],
  momentum: MomentumState
): HabitMomentumData['prediction'] {
  const { last7Days, last30Days } = completion;
  const { direction, strength } = trend;

  // Base prediction on recent performance
  let prediction = last7Days * 0.6 + last30Days * 0.4;

  // Adjust based on trend
  if (direction === 'up') {
    prediction = Math.min(1, prediction + (strength * 0.2));
  } else if (direction === 'down') {
    prediction = Math.max(0, prediction - (strength * 0.2));
  }

  // Adjust based on momentum level
  switch (momentum.level) {
    case 'building':
      prediction = Math.min(1, prediction * 1.1);
      break;
    case 'declining':
      prediction = prediction * 0.9;
      break;
    case 'stalled':
      prediction = prediction * 0.8;
      break;
  }

  // Calculate confidence based on data consistency
  const variance = Math.abs(last7Days - last30Days);
  const confidence = Math.max(0.3, 1 - (variance * 2)); // Lower variance = higher confidence

  return {
    nextWeek: Math.max(0, Math.min(1, prediction)),
    confidence: Math.max(0, Math.min(1, confidence)),
  };
}

// Generate momentum insights for habits
export function generateMomentumInsights(
  habits: Habit[],
  momentumData: HabitMomentumData[]
): MomentumInsight[] {
  const insights: MomentumInsight[] = [];

  momentumData.forEach(data => {
    const habit = habits.find(h => h.id === data.habitId);
    if (!habit) return;

    // Celebration insights
    if (data.momentum.level === 'building' && data.streakData.current >= 7) {
      insights.push({
        type: 'celebration',
        title: `${habit.name} is on fire!`,
        message: `You're on a ${data.streakData.current}-day streak and building strong momentum.`,
        habitId: habit.id,
        priority: 8,
        actionable: false,
      });
    }

    // Warning insights
    if (data.momentum.level === 'declining' && data.completion.last7Days < 0.3) {
      insights.push({
        type: 'warning',
        title: `${habit.name} needs attention`,
        message: `Completion rate has dropped to ${Math.round(data.completion.last7Days * 100)}% this week.`,
        habitId: habit.id,
        priority: 6,
        actionable: true,
        suggestion: 'Try breaking this habit into smaller, more manageable steps.',
      });
    }

    // Critical insights
    if (data.momentum.level === 'stalled' && data.streakData.current === 0) {
      insights.push({
        type: 'critical',
        title: `${habit.name} has stalled`,
        message: `No completions in the last week. This habit needs immediate attention.`,
        habitId: habit.id,
        priority: 9,
        actionable: true,
        suggestion: 'Start with just doing this habit for 1 minute to rebuild momentum.',
      });
    }

    // Positive insights
    if (data.trend.direction === 'up' && data.trend.strength > 0.5) {
      insights.push({
        type: 'positive',
        title: `${habit.name} is trending up`,
        message: `Strong upward trend detected over the last ${data.trend.duration} days.`,
        habitId: habit.id,
        priority: 5,
        actionable: false,
      });
    }
  });

  // Sort by priority (highest first)
  return insights.sort((a, b) => b.priority - a.priority);
}

// Get momentum state color for visualization
export function getMomentumStateColor(state: MomentumState): string {
  switch (state.level) {
    case 'building':
      return state.completionRate >= 0.8 ? '#22c55e' : '#3b82f6';
    case 'stable':
      return state.completionRate >= 0.7 ? '#16a34a' : '#2563eb';
    case 'declining':
      return state.completionRate >= 0.4 ? '#f59e0b' : '#f97316';
    case 'stalled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

// Calculate overall momentum score for all habits
export function calculateOverallMomentum(momentumData: HabitMomentumData[]): {
  score: number;
  level: 'excellent' | 'good' | 'moderate' | 'poor';
  summary: string;
} {
  if (momentumData.length === 0) {
    return { score: 0, level: 'poor', summary: 'No habits to analyze' };
  }

  // Calculate weighted average momentum
  const totalScore = momentumData.reduce((sum, data) => {
    const levelWeight = {
      'building': 1.0,
      'stable': 0.8,
      'declining': 0.4,
      'stalled': 0.1,
    }[data.momentum.level];
    
    return sum + (data.momentum.intensity * levelWeight);
  }, 0);

  const averageScore = totalScore / momentumData.length;

  // Determine level and summary
  let level: 'excellent' | 'good' | 'moderate' | 'poor';
  let summary: string;

  if (averageScore >= 0.8) {
    level = 'excellent';
    summary = 'Outstanding momentum across all habits!';
  } else if (averageScore >= 0.6) {
    level = 'good';
    summary = 'Strong momentum with room for improvement.';
  } else if (averageScore >= 0.4) {
    level = 'moderate';
    summary = 'Mixed momentum - some habits need attention.';
  } else {
    level = 'poor';
    summary = 'Multiple habits need immediate focus.';
  }

  return { score: averageScore, level, summary };
}