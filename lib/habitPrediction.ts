import { Habit, HabitCompletion, MoodEntry, HabitStats } from '@/types';
import { isToday, parseISO, format, addDays, differenceInDays, startOfWeek, endOfWeek, getDay } from 'date-fns';

export interface PredictionDataPoint {
  date: string;
  predicted: boolean;
  confidence: number;
  probability: number;
}

export interface HabitPrediction {
  habitId: string;
  habitName: string;
  currentStreak: number;
  predictions: PredictionDataPoint[];
  overallTrend: 'improving' | 'declining' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
  goalPredictions: GoalPrediction[];
  recommendations: string[];
  confidenceScore: number;
  nextRiskDate?: string;
}

export interface GoalPrediction {
  type: 'streak' | 'completion';
  target: number;
  period: 'weekly' | 'monthly' | '30-day' | '60-day' | '90-day';
  probability: number;
  confidence: number;
  estimatedDate?: string;
  daysRemaining?: number;
}

export interface RiskFactor {
  factor: 'streak_length' | 'recent_performance' | 'weekly_pattern' | 'mood_correlation' | 'frequency_mismatch';
  impact: number; // 0-1 scale
  description: string;
}

export interface PredictionAnalytics {
  totalHabits: number;
  avgSuccessProbability: number;
  highRiskHabits: number;
  goalAchievementRate: number;
  optimalHabitLoad: number;
  bestPerformanceDays: number[];
  worstPerformanceDays: number[];
}

// Core prediction algorithms
export function analyzeHabitPatterns(
  habit: Habit,
  completions: HabitCompletion[],
  moods?: MoodEntry[]
): {
  baseSuccessRate: number;
  trendFactor: number;
  cyclicalPattern: number[];
  moodCorrelation: number;
  streakFactor: number;
  recencyFactor: number;
} {
  const habitCompletions = completions
    .filter(c => c.habitId === habit.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (habitCompletions.length < 7) {
    return {
      baseSuccessRate: 0.5,
      trendFactor: 1.0,
      cyclicalPattern: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      moodCorrelation: 0,
      streakFactor: 1.0,
      recencyFactor: 1.0
    };
  }

  // Calculate base success rate
  const totalCompletions = habitCompletions.filter(c => c.completed).length;
  const baseSuccessRate = totalCompletions / habitCompletions.length;

  // Calculate trend factor using weighted recent performance
  const recent30Days = habitCompletions.slice(-30);
  const recent7Days = habitCompletions.slice(-7);
  const recentRate = recent7Days.filter(c => c.completed).length / recent7Days.length;
  const monthlyRate = recent30Days.filter(c => c.completed).length / recent30Days.length;
  const trendFactor = (recentRate * 0.7 + monthlyRate * 0.3) / baseSuccessRate || 1.0;

  // Analyze weekly cyclical patterns
  const cyclicalPattern = analyzeCyclicalPattern(habitCompletions);

  // Calculate mood correlation if mood data is available
  const moodCorrelation = moods ? calculateMoodCorrelation(habitCompletions, moods) : 0;

  // Calculate streak factor (longer streaks indicate higher commitment)
  const streakFactor = calculateStreakFactor(habitCompletions);

  // Calculate recency factor (more recent data is more reliable)
  const recencyFactor = calculateRecencyFactor(habitCompletions);

  return {
    baseSuccessRate: Math.max(0.1, Math.min(0.9, baseSuccessRate)),
    trendFactor: Math.max(0.5, Math.min(1.5, trendFactor)),
    cyclicalPattern,
    moodCorrelation,
    streakFactor,
    recencyFactor
  };
}

export function calculateSuccessProbability(
  habit: Habit,
  targetDate: string,
  patterns: ReturnType<typeof analyzeHabitPatterns>
): { probability: number; confidence: number } {
  const targetDay = getDay(parseISO(targetDate));
  const dayOfWeekFactor = patterns.cyclicalPattern[targetDay];
  
  // Base probability calculation
  let probability = patterns.baseSuccessRate * 
                   patterns.trendFactor * 
                   dayOfWeekFactor * 
                   patterns.streakFactor * 
                   patterns.recencyFactor;

  // Apply mood correlation if available
  if (patterns.moodCorrelation !== 0) {
    const moodFactor = 1 + (patterns.moodCorrelation * 0.1); // ±10% based on mood correlation
    probability *= moodFactor;
  }

  // Apply diminishing confidence for future dates
  const daysFromNow = differenceInDays(parseISO(targetDate), new Date());
  const distanceFactor = Math.exp(-daysFromNow * 0.02); // Exponential decay
  const confidence = Math.max(0.3, Math.min(0.95, distanceFactor * patterns.recencyFactor));

  return {
    probability: Math.max(0.05, Math.min(0.95, probability)),
    confidence
  };
}

export function predictHabitTrajectory(
  habit: Habit,
  completions: HabitCompletion[],
  days: number = 90,
  moods?: MoodEntry[]
): PredictionDataPoint[] {
  const patterns = analyzeHabitPatterns(habit, completions, moods);
  const predictions: PredictionDataPoint[] = [];
  
  for (let i = 0; i < days; i++) {
    const targetDate = format(addDays(new Date(), i), 'yyyy-MM-dd');
    const { probability, confidence } = calculateSuccessProbability(habit, targetDate, patterns);
    
    predictions.push({
      date: targetDate,
      predicted: probability > 0.5,
      confidence,
      probability
    });
  }

  return predictions;
}

export function identifyRiskFactors(
  habit: Habit,
  completions: HabitCompletion[],
  moods?: MoodEntry[]
): RiskFactor[] {
  const patterns = analyzeHabitPatterns(habit, completions, moods);
  const riskFactors: RiskFactor[] = [];
  
  // Recent performance risk
  const recent7Days = completions.filter(c => 
    c.habitId === habit.id && 
    differenceInDays(new Date(), parseISO(c.date)) <= 7
  );
  const recentRate = recent7Days.filter(c => c.completed).length / Math.max(1, recent7Days.length);
  
  if (recentRate < 0.4) {
    riskFactors.push({
      factor: 'recent_performance',
      impact: (0.6 - recentRate) / 0.6,
      description: `Recent completion rate is ${Math.round(recentRate * 100)}%, indicating declining motivation`
    });
  }

  // Streak length risk (too long streaks can lead to burnout)
  const currentStreak = calculateCurrentStreak(completions.filter(c => c.habitId === habit.id));
  if (currentStreak > 30) {
    riskFactors.push({
      factor: 'streak_length',
      impact: Math.min(0.3, (currentStreak - 30) / 100),
      description: `Long streak of ${currentStreak} days may lead to burnout or complacency`
    });
  }

  // Weekly pattern inconsistency
  const patternVariance = calculatePatternVariance(patterns.cyclicalPattern);
  if (patternVariance > 0.3) {
    riskFactors.push({
      factor: 'weekly_pattern',
      impact: Math.min(0.5, patternVariance),
      description: 'Inconsistent weekly pattern makes predictions less reliable'
    });
  }

  // Mood correlation risk
  if (patterns.moodCorrelation < -0.3) {
    riskFactors.push({
      factor: 'mood_correlation',
      impact: Math.abs(patterns.moodCorrelation) * 0.5,
      description: 'Strong negative mood correlation suggests external factors affecting habit completion'
    });
  }

  return riskFactors.sort((a, b) => b.impact - a.impact);
}

export function generateGoalPredictions(
  habit: Habit,
  completions: HabitCompletion[],
  moods?: MoodEntry[]
): GoalPrediction[] {
  const predictions = predictHabitTrajectory(habit, completions, 90, moods);
  const goalPredictions: GoalPrediction[] = [];

  // 30-day streak goal
  const streak30Probability = calculateStreakProbability(predictions.slice(0, 30));
  goalPredictions.push({
    type: 'streak',
    target: 30,
    period: '30-day',
    probability: streak30Probability,
    confidence: predictions.slice(0, 30).reduce((sum, p) => sum + p.confidence, 0) / 30,
    estimatedDate: predictions.length >= 30 ? predictions[29].date : undefined,
    daysRemaining: 30
  });

  // 60-day streak goal
  const streak60Probability = calculateStreakProbability(predictions.slice(0, 60));
  goalPredictions.push({
    type: 'streak',
    target: 60,
    period: '60-day',
    probability: streak60Probability,
    confidence: predictions.slice(0, 60).reduce((sum, p) => sum + p.confidence, 0) / 60,
    estimatedDate: predictions.length >= 60 ? predictions[59].date : undefined,
    daysRemaining: 60
  });

  // 90-day completion rate goals
  const completion90Probability = predictions.filter(p => p.predicted).length / predictions.length;
  goalPredictions.push({
    type: 'completion',
    target: 80, // 80% completion rate
    period: '90-day',
    probability: completion90Probability >= 0.8 ? Math.min(0.95, completion90Probability * 1.1) : completion90Probability * 0.8,
    confidence: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
    daysRemaining: 90
  });

  // Monthly goals based on habit frequency
  if (habit.frequency === 'weekly') {
    const weeklyCompletionGoal = Math.floor(habit.targetDays.length * 4.33); // Average weeks per month
    goalPredictions.push({
      type: 'completion',
      target: weeklyCompletionGoal,
      period: 'monthly',
      probability: Math.min(0.95, completion90Probability * 1.05),
      confidence: 0.8,
      daysRemaining: 30
    });
  }

  return goalPredictions;
}

export function optimizeHabitSchedule(
  habits: Habit[],
  completions: HabitCompletion[],
  moods?: MoodEntry[]
): {
  recommendations: string[];
  optimalDays: { [habitId: string]: number[] };
  loadDistribution: number[];
} {
  const recommendations: string[] = [];
  const optimalDays: { [habitId: string]: number[] } = {};
  const loadDistribution = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday

  habits.forEach(habit => {
    const patterns = analyzeHabitPatterns(habit, completions, moods);
    
    // Find optimal days based on success patterns
    const bestDays = patterns.cyclicalPattern
      .map((rate, day) => ({ day, rate }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, Math.min(3, habit.targetDays.length))
      .map(item => item.day);

    optimalDays[habit.id] = bestDays;

    // Calculate current load distribution
    habit.targetDays.forEach(day => {
      loadDistribution[day] += 1;
    });

    // Generate recommendations
    if (patterns.baseSuccessRate < 0.4) {
      recommendations.push(`Consider reducing frequency for "${habit.name}" to build consistency`);
    }

    if (patterns.cyclicalPattern.some(rate => rate < 0.3)) {
      const worstDay = patterns.cyclicalPattern.indexOf(Math.min(...patterns.cyclicalPattern));
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      recommendations.push(`"${habit.name}" performs poorly on ${dayNames[worstDay]}s - consider rescheduling`);
    }
  });

  // Overall load balancing recommendations
  const maxLoad = Math.max(...loadDistribution);
  const minLoad = Math.min(...loadDistribution);
  if (maxLoad - minLoad > 2) {
    recommendations.push('Consider redistributing habits across the week for better balance');
  }

  return {
    recommendations: recommendations.slice(0, 5), // Top 5 recommendations
    optimalDays,
    loadDistribution
  };
}

// Helper functions

function analyzeCyclicalPattern(completions: HabitCompletion[]): number[] {
  const dayPattern = [0, 0, 0, 0, 0, 0, 0]; // Sunday to Saturday
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  completions.forEach(completion => {
    const dayOfWeek = getDay(parseISO(completion.date));
    dayCounts[dayOfWeek]++;
    if (completion.completed) {
      dayPattern[dayOfWeek]++;
    }
  });

  return dayPattern.map((completed, index) => 
    dayCounts[index] > 0 ? completed / dayCounts[index] : 0.5
  );
}

function calculateMoodCorrelation(completions: HabitCompletion[], moods: MoodEntry[]): number {
  const moodMap = new Map(moods.map(mood => [mood.date, mood]));
  const correlationData: { completed: number; moodScore: number }[] = [];

  completions.forEach(completion => {
    const mood = moodMap.get(completion.date);
    if (mood) {
      const moodScore = (mood.mood + mood.energy + (6 - mood.stress) + mood.sleep) / 4;
      correlationData.push({
        completed: completion.completed ? 1 : 0,
        moodScore
      });
    }
  });

  if (correlationData.length < 5) return 0;

  // Simple Pearson correlation
  const n = correlationData.length;
  const sumX = correlationData.reduce((sum, d) => sum + d.completed, 0);
  const sumY = correlationData.reduce((sum, d) => sum + d.moodScore, 0);
  const sumXY = correlationData.reduce((sum, d) => sum + d.completed * d.moodScore, 0);
  const sumX2 = correlationData.reduce((sum, d) => sum + d.completed * d.completed, 0);
  const sumY2 = correlationData.reduce((sum, d) => sum + d.moodScore * d.moodScore, 0);

  const correlation = (n * sumXY - sumX * sumY) / 
    Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return isNaN(correlation) ? 0 : Math.max(-1, Math.min(1, correlation));
}

function calculateStreakFactor(completions: HabitCompletion[]): number {
  const currentStreak = calculateCurrentStreak(completions);
  // Streak factor increases with current streak but with diminishing returns
  return Math.min(1.3, 1 + Math.log(currentStreak + 1) * 0.05);
}

function calculateCurrentStreak(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0;

  const sortedCompletions = completions.sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;

  for (const completion of sortedCompletions) {
    if (completion.completed) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateRecencyFactor(completions: HabitCompletion[]): number {
  if (completions.length === 0) return 0.5;

  const mostRecentDate = Math.max(...completions.map(c => parseISO(c.date).getTime()));
  const daysSinceLastEntry = Math.abs(differenceInDays(new Date(), new Date(mostRecentDate)));

  // Decay factor for data freshness
  return Math.max(0.3, Math.min(1.0, Math.exp(-daysSinceLastEntry * 0.1)));
}

function calculatePatternVariance(pattern: number[]): number {
  const mean = pattern.reduce((sum, val) => sum + val, 0) / pattern.length;
  const variance = pattern.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pattern.length;
  return Math.sqrt(variance);
}

function calculateStreakProbability(predictions: PredictionDataPoint[]): number {
  // Probability that ALL predictions in the sequence will be successful
  return predictions.reduce((prob, prediction) => prob * prediction.probability, 1);
}

// Comprehensive habit prediction analysis
export function generateComprehensivePrediction(
  habit: Habit,
  completions: HabitCompletion[],
  stats: HabitStats,
  moods?: MoodEntry[]
): HabitPrediction {
  const predictions = predictHabitTrajectory(habit, completions, 90, moods);
  const riskFactors = identifyRiskFactors(habit, completions, moods);
  const goalPredictions = generateGoalPredictions(habit, completions, moods);
  const patterns = analyzeHabitPatterns(habit, completions, moods);

  // Determine overall trend
  const recentTrend = predictions.slice(0, 14).reduce((sum, p) => sum + p.probability, 0) / 14;
  const laterTrend = predictions.slice(14, 28).reduce((sum, p) => sum + p.probability, 0) / 14;
  const trendDirection = laterTrend - recentTrend;

  let overallTrend: 'improving' | 'declining' | 'stable';
  if (trendDirection > 0.05) overallTrend = 'improving';
  else if (trendDirection < -0.05) overallTrend = 'declining';
  else overallTrend = 'stable';

  // Calculate risk level
  const totalRisk = riskFactors.reduce((sum, factor) => sum + factor.impact, 0);
  let riskLevel: 'low' | 'medium' | 'high';
  if (totalRisk < 0.3) riskLevel = 'low';
  else if (totalRisk < 0.6) riskLevel = 'medium';
  else riskLevel = 'high';

  // Generate recommendations
  const recommendations = generateRecommendations(habit, patterns, riskFactors, overallTrend);

  // Find next risk date (first day with probability < 0.4)
  const nextRiskDate = predictions.find(p => p.probability < 0.4)?.date;

  return {
    habitId: habit.id,
    habitName: habit.name,
    currentStreak: stats.currentStreak,
    predictions,
    overallTrend,
    riskLevel,
    goalPredictions,
    recommendations,
    confidenceScore: predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length,
    nextRiskDate
  };
}

function generateRecommendations(
  habit: Habit,
  patterns: ReturnType<typeof analyzeHabitPatterns>,
  riskFactors: RiskFactor[],
  trend: 'improving' | 'declining' | 'stable'
): string[] {
  const recommendations: string[] = [];

  if (trend === 'declining') {
    recommendations.push('Consider reducing habit frequency temporarily to rebuild consistency');
    recommendations.push('Focus on your strongest days of the week to maintain momentum');
  } else if (trend === 'improving') {
    recommendations.push('Great progress! Consider gradually increasing habit frequency');
    recommendations.push('Use this momentum to add complementary habits');
  }

  // Risk-based recommendations
  riskFactors.slice(0, 2).forEach(risk => {
    switch (risk.factor) {
      case 'recent_performance':
        recommendations.push('Consider habit stacking or environmental changes to improve consistency');
        break;
      case 'streak_length':
        recommendations.push('Plan for rest days or modified versions to prevent burnout');
        break;
      case 'weekly_pattern':
        recommendations.push('Identify and address barriers on low-performance days');
        break;
      case 'mood_correlation':
        recommendations.push('Focus on mood management and stress reduction techniques');
        break;
    }
  });

  // Pattern-based recommendations
  const bestDayIndex = patterns.cyclicalPattern.indexOf(Math.max(...patterns.cyclicalPattern));
  const worstDayIndex = patterns.cyclicalPattern.indexOf(Math.min(...patterns.cyclicalPattern));
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (patterns.cyclicalPattern[bestDayIndex] > patterns.cyclicalPattern[worstDayIndex] + 0.3) {
    recommendations.push(`Consider scheduling more important habits on ${dayNames[bestDayIndex]}s`);
    recommendations.push(`Create special strategies for ${dayNames[worstDayIndex]}s when motivation is lower`);
  }

  return recommendations.slice(0, 5);
}

// Analytics and insights
export function calculatePredictionAnalytics(
  habits: Habit[],
  predictions: HabitPrediction[]
): PredictionAnalytics {
  const totalHabits = habits.length;
  const avgSuccessProbability = predictions.reduce((sum, pred) => 
    sum + pred.predictions.slice(0, 30).reduce((pSum, p) => pSum + p.probability, 0) / 30, 0
  ) / totalHabits;

  const highRiskHabits = predictions.filter(pred => pred.riskLevel === 'high').length;
  
  const goalAchievementRate = predictions.reduce((sum, pred) => 
    sum + pred.goalPredictions.reduce((gSum, goal) => gSum + goal.probability, 0) / pred.goalPredictions.length, 0
  ) / totalHabits;

  // Calculate optimal habit load (number of habits that can be sustained)
  const optimalHabitLoad = Math.floor(totalHabits * avgSuccessProbability + 2);

  // Analyze best and worst performance days across all habits
  const dayPerformance = [0, 0, 0, 0, 0, 0, 0];
  const dayCount = [0, 0, 0, 0, 0, 0, 0];

  predictions.forEach(pred => {
    pred.predictions.slice(0, 7).forEach((prediction, index) => {
      const dayOfWeek = (new Date().getDay() + index) % 7;
      dayPerformance[dayOfWeek] += prediction.probability;
      dayCount[dayOfWeek]++;
    });
  });

  const avgDayPerformance = dayPerformance.map((perf, index) => 
    dayCount[index] > 0 ? perf / dayCount[index] : 0
  );

  const bestPerformanceDays = avgDayPerformance
    .map((perf, day) => ({ day, perf }))
    .sort((a, b) => b.perf - a.perf)
    .slice(0, 3)
    .map(item => item.day);

  const worstPerformanceDays = avgDayPerformance
    .map((perf, day) => ({ day, perf }))
    .sort((a, b) => a.perf - b.perf)
    .slice(0, 2)
    .map(item => item.day);

  return {
    totalHabits,
    avgSuccessProbability,
    highRiskHabits,
    goalAchievementRate,
    optimalHabitLoad,
    bestPerformanceDays,
    worstPerformanceDays
  };
}