/**
 * Mood Pattern Analysis System
 * Provides statistical correlation analysis between mood dimensions and habit completion patterns
 */

import { getMoodEntries, getCompletions, getUserHabits } from './db';
import type { 
  MoodEntry, 
  HabitCompletion, 
  Habit,
  MoodHabitCorrelationData,
  CorrelationCoefficients,
  OptimalMoodRange,
  MoodAnalysisResult
} from '@/types';

/**
 * Calculate Pearson correlation coefficient between two arrays
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate composite mood score (accounting for stress being inverse)
 */
function calculateCompositeScore(mood: MoodEntry): number {
  return (mood.mood + mood.energy + (6 - mood.stress) + mood.sleep) / 4;
}

/**
 * Get mood and habit data with correlations
 */
export async function getMoodHabitData(
  userId: string, 
  startDate: string, 
  endDate: string
): Promise<MoodHabitCorrelationData[]> {
  const [moods, completions, habits] = await Promise.all([
    getMoodEntries(userId, startDate, endDate),
    getCompletions(userId, undefined, startDate, endDate),
    getUserHabits(userId)
  ]);

  // Group completions by date
  const completionsByDate = completions.reduce((acc, completion) => {
    if (!acc[completion.date]) {
      acc[completion.date] = [];
    }
    acc[completion.date].push(completion);
    return acc;
  }, {} as Record<string, HabitCompletion[]>);

  // Get active habits for the date range to calculate proper completion rates
  const activeHabits = habits.filter(h => !h.isArchived);
  
  // Calculate correlation data for each day with mood data
  return moods.map(mood => {
    const dayCompletions = completionsByDate[mood.date] || [];
    const completedHabits = dayCompletions.filter(c => c.completed).length;
    
    // For proper completion rate, we need to consider how many habits were active on that day
    // For simplicity, we'll use the number of habits that have completion records for that day
    // or fall back to total active habits if no completions exist
    const totalHabits = dayCompletions.length || activeHabits.length;
    const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;

    return {
      date: mood.date,
      mood: mood.mood,
      energy: mood.energy,
      stress: mood.stress,
      sleep: mood.sleep,
      completionRate: completionRate * 100, // Convert to percentage
      completedHabits,
      totalHabits,
      compositeScore: calculateCompositeScore(mood)
    };
  }).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate correlation coefficients between mood dimensions and habit completion rates
 */
export function calculateMoodHabitCorrelations(data: MoodHabitCorrelationData[]): CorrelationCoefficients {
  if (data.length === 0) {
    return { mood: 0, energy: 0, stress: 0, sleep: 0 };
  }

  const completionRates = data.map(d => d.completionRate);
  
  return {
    mood: calculateCorrelation(data.map(d => d.mood), completionRates),
    energy: calculateCorrelation(data.map(d => d.energy), completionRates),
    stress: calculateCorrelation(data.map(d => d.stress), completionRates), // Note: negative correlation expected
    sleep: calculateCorrelation(data.map(d => d.sleep), completionRates)
  };
}

/**
 * Identify recurring mood patterns
 */
export function identifyMoodPatterns(data: MoodHabitCorrelationData[]): {
  highPerformanceDays: MoodHabitCorrelationData[];
  lowPerformanceDays: MoodHabitCorrelationData[];
  trends: {
    improvingMood: boolean;
    improvingHabits: boolean;
  };
} {
  if (data.length === 0) {
    return {
      highPerformanceDays: [],
      lowPerformanceDays: [],
      trends: { improvingMood: false, improvingHabits: false }
    };
  }

  // Sort by completion rate to identify high/low performance days
  const sorted = [...data].sort((a, b) => b.completionRate - a.completionRate);
  const topThird = Math.ceil(sorted.length / 3);
  
  const highPerformanceDays = sorted.slice(0, topThird);
  const lowPerformanceDays = sorted.slice(-topThird);

  // Calculate trends (comparing first half to second half of date range)
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const avgMoodFirst = firstHalf.reduce((sum, d) => sum + d.compositeScore, 0) / firstHalf.length;
  const avgMoodSecond = secondHalf.reduce((sum, d) => sum + d.compositeScore, 0) / secondHalf.length;
  const avgHabitsFirst = firstHalf.reduce((sum, d) => sum + d.completionRate, 0) / firstHalf.length;
  const avgHabitsSecond = secondHalf.reduce((sum, d) => sum + d.completionRate, 0) / secondHalf.length;

  return {
    highPerformanceDays,
    lowPerformanceDays,
    trends: {
      improvingMood: avgMoodSecond > avgMoodFirst,
      improvingHabits: avgHabitsSecond > avgHabitsFirst
    }
  };
}

/**
 * Analyze habit performance by mood ranges
 */
export function analyzeHabitPerformanceByMood(data: MoodHabitCorrelationData[]): {
  optimalRanges: OptimalMoodRange;
  performanceByMoodLevel: {
    low: number;
    medium: number;
    high: number;
  };
} {
  if (data.length === 0) {
    return {
      optimalRanges: {
        mood: [3, 5],
        energy: [3, 5], 
        stress: [1, 3],
        sleep: [3, 5]
      },
      performanceByMoodLevel: { low: 0, medium: 0, high: 0 }
    };
  }

  // Group by composite mood levels
  const lowMood = data.filter(d => d.compositeScore <= 2.5);
  const mediumMood = data.filter(d => d.compositeScore > 2.5 && d.compositeScore <= 3.5);
  const highMood = data.filter(d => d.compositeScore > 3.5);

  const avgPerformance = (group: MoodHabitCorrelationData[]) => 
    group.length > 0 ? group.reduce((sum, d) => sum + d.completionRate, 0) / group.length : 0;

  // Find optimal ranges by analyzing top 25% performing days
  const topPerformers = data
    .filter(d => d.completionRate >= 80) // High completion rate days
    .sort((a, b) => b.completionRate - a.completionRate)
    .slice(0, Math.ceil(data.length * 0.25));

  const optimalRanges: OptimalMoodRange = {
    mood: topPerformers.length > 0 
      ? [Math.min(...topPerformers.map(d => d.mood)), Math.max(...topPerformers.map(d => d.mood))]
      : [3, 5],
    energy: topPerformers.length > 0
      ? [Math.min(...topPerformers.map(d => d.energy)), Math.max(...topPerformers.map(d => d.energy))]
      : [3, 5],
    stress: topPerformers.length > 0
      ? [Math.min(...topPerformers.map(d => d.stress)), Math.max(...topPerformers.map(d => d.stress))]
      : [1, 3],
    sleep: topPerformers.length > 0
      ? [Math.min(...topPerformers.map(d => d.sleep)), Math.max(...topPerformers.map(d => d.sleep))]
      : [3, 5]
  };

  return {
    optimalRanges,
    performanceByMoodLevel: {
      low: avgPerformance(lowMood),
      medium: avgPerformance(mediumMood),
      high: avgPerformance(highMood)
    }
  };
}

/**
 * Calculate mood trends over time
 */
export function calculateMoodTrends(data: MoodHabitCorrelationData[]): {
  moodTrend: 'improving' | 'declining' | 'stable';
  energyTrend: 'improving' | 'declining' | 'stable';
  stressTrend: 'improving' | 'declining' | 'stable';
  sleepTrend: 'improving' | 'declining' | 'stable';
  habitTrend: 'improving' | 'declining' | 'stable';
} {
  if (data.length < 7) {
    return {
      moodTrend: 'stable',
      energyTrend: 'stable',
      stressTrend: 'stable',
      sleepTrend: 'stable',
      habitTrend: 'stable'
    };
  }

  // Calculate linear trend using simple slope
  const calculateTrend = (values: number[]): 'improving' | 'declining' | 'stable' => {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (slope > 0.1) return 'improving';
    if (slope < -0.1) return 'declining';
    return 'stable';
  };

  const moods = data.map(d => d.mood);
  const energy = data.map(d => d.energy);
  const stress = data.map(d => d.stress);
  const sleep = data.map(d => d.sleep);
  const habits = data.map(d => d.completionRate);

  return {
    moodTrend: calculateTrend(moods),
    energyTrend: calculateTrend(energy),
    stressTrend: calculateTrend(stress.map(s => 6 - s)), // Invert stress for trend analysis
    sleepTrend: calculateTrend(sleep),
    habitTrend: calculateTrend(habits)
  };
}

/**
 * Generate data-driven recommendations based on analysis
 */
export function generateMoodBasedRecommendations(
  correlations: CorrelationCoefficients,
  patterns: ReturnType<typeof identifyMoodPatterns>,
  trends: ReturnType<typeof calculateMoodTrends>,
  optimalRanges: OptimalMoodRange
): string[] {
  const recommendations: string[] = [];

  // Correlation-based recommendations
  const correlationEntries = Object.entries(correlations).sort(([,a], [,b]) => Math.abs(b) - Math.abs(a));
  const strongest = correlationEntries[0];
  
  if (strongest && Math.abs(strongest[1]) > 0.3) {
    const [dimension, coefficient] = strongest;
    const direction = coefficient > 0 ? 'higher' : 'lower';
    const impact = Math.abs(coefficient) > 0.5 ? 'strong' : 'moderate';
    
    recommendations.push(`Your ${dimension} levels show a ${impact} correlation with habit completion. Focus on maintaining ${direction} ${dimension} for better performance.`);
  }

  // Stress-specific recommendations (since stress should be inversely correlated)
  if (correlations.stress > -0.2) {
    recommendations.push('Stress management appears to significantly impact your habit completion. Consider stress-reduction techniques during busy periods.');
  }

  // Energy-based recommendations
  if (correlations.energy > 0.3) {
    recommendations.push('Your energy levels strongly predict habit success. Prioritize habits during high-energy periods and consider energy-boosting activities.');
  }

  // Sleep-based recommendations
  if (correlations.sleep > 0.3) {
    recommendations.push('Good sleep quality significantly improves your habit completion. Maintain consistent sleep schedule for better performance.');
  }

  // Trend-based recommendations
  if (trends.habitTrend === 'declining' && trends.moodTrend === 'declining') {
    recommendations.push('Both mood and habit completion are declining. Consider reducing habit complexity temporarily and focusing on mood-boosting activities.');
  }

  if (trends.stressTrend === 'declining' && trends.habitTrend === 'improving') {
    recommendations.push('Excellent progress! Lower stress levels are supporting better habit completion. Maintain current stress management strategies.');
  }

  // Pattern-based recommendations
  if (patterns.highPerformanceDays.length > 0) {
    const avgHighMood = patterns.highPerformanceDays.reduce((sum, d) => sum + d.compositeScore, 0) / patterns.highPerformanceDays.length;
    recommendations.push(`Your best habit completion days average ${avgHighMood.toFixed(1)} mood score. Aim to replicate conditions that support this mood level.`);
  }

  // Optimal range recommendations
  const optimalMoodAvg = (optimalRanges.mood[0] + optimalRanges.mood[1]) / 2;
  if (optimalMoodAvg >= 4) {
    recommendations.push('Your habit completion peaks when your overall mood is high. Schedule important habits during naturally positive periods.');
  }

  // Default recommendations if no clear patterns
  if (recommendations.length === 0) {
    recommendations.push('Continue tracking to identify patterns. Focus on maintaining consistent mood tracking for better insights.');
    recommendations.push('Consider the relationship between your daily activities and both mood and habit completion.');
  }

  return recommendations.slice(0, 5); // Limit to top 5 recommendations
}

/**
 * Main analysis function that orchestrates all calculations
 */
export async function performMoodAnalysis(
  userId: string,
  startDate: string,
  endDate: string
): Promise<MoodAnalysisResult> {
  try {
    // Get mood-habit correlation data
    const patterns = await getMoodHabitData(userId, startDate, endDate);
    
    if (patterns.length === 0) {
      throw new Error('No mood data found for the specified date range');
    }

    // Perform all analyses
    const correlations = calculateMoodHabitCorrelations(patterns);
    const moodPatterns = identifyMoodPatterns(patterns);
    const trends = calculateMoodTrends(patterns);
    const { optimalRanges } = analyzeHabitPerformanceByMood(patterns);
    
    // Generate insights
    const correlationEntries = Object.entries(correlations);
    const strongestPositive = correlationEntries
      .filter(([, coeff]) => coeff > 0)
      .sort(([, a], [, b]) => b - a)[0];
    const strongestNegative = correlationEntries
      .filter(([, coeff]) => coeff < 0)
      .sort(([, a], [, b]) => a - b)[0];

    // Generate recommendations
    const recommendations = generateMoodBasedRecommendations(
      correlations,
      moodPatterns,
      trends,
      optimalRanges
    );

    // Calculate statistics
    const avgCompletionRate = patterns.reduce((sum, p) => sum + p.completionRate, 0) / patterns.length;
    const avgMoodScores = {
      mood: patterns.reduce((sum, p) => sum + p.mood, 0) / patterns.length,
      energy: patterns.reduce((sum, p) => sum + p.energy, 0) / patterns.length,
      stress: patterns.reduce((sum, p) => sum + p.stress, 0) / patterns.length,
      sleep: patterns.reduce((sum, p) => sum + p.sleep, 0) / patterns.length
    };

    return {
      correlations,
      insights: {
        strongestPositiveCorrelation: strongestPositive ? `${strongestPositive[0]} (${(strongestPositive[1] * 100).toFixed(1)}%)` : 'None identified',
        strongestNegativeCorrelation: strongestNegative ? `${strongestNegative[0]} (${(strongestNegative[1] * 100).toFixed(1)}%)` : 'None identified',
        optimalMoodRange: optimalRanges
      },
      recommendations,
      statistics: {
        totalDaysAnalyzed: patterns.length,
        avgCompletionRate: Math.round(avgCompletionRate * 100) / 100,
        avgMoodScores: {
          mood: Math.round(avgMoodScores.mood * 100) / 100,
          energy: Math.round(avgMoodScores.energy * 100) / 100,
          stress: Math.round(avgMoodScores.stress * 100) / 100,
          sleep: Math.round(avgMoodScores.sleep * 100) / 100
        }
      },
      patterns
    };
  } catch (error) {
    console.error('Error performing mood analysis:', error);
    throw error;
  }
}