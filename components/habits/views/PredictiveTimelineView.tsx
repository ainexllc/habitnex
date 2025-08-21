'use client';

import { useState, useMemo, useEffect } from 'react';
import { Habit, HabitCompletion, MoodEntry, HabitStats } from '@/types';
import { 
  generateComprehensivePrediction, 
  calculatePredictionAnalytics,
  optimizeHabitSchedule,
  HabitPrediction,
  PredictionAnalytics
} from '@/lib/habitPrediction';
import { TimelineChart } from './timeline/TimelineChart';
import { TimelineControls } from './timeline/TimelineControls';
import { PredictionSummary } from './timeline/PredictionSummary';
import { GoalDashboard } from './timeline/GoalDashboard';
import { RiskAlerts } from './timeline/RiskAlerts';
import { format, addDays } from 'date-fns';
import { TrendingUp, AlertTriangle, Target, Brain, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PredictiveTimelineViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  moods?: MoodEntry[];
  onEdit?: (habit: Habit) => void;
}

// Helper function to calculate habit stats from completions
function calculateHabitStats(habitId: string, completions: HabitCompletion[]): HabitStats {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (habitCompletions.length === 0) {
    return {
      habitId,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
      totalCompletions: 0
    };
  }

  const totalCompletions = habitCompletions.filter(c => c.completed).length;
  const completionRate = (totalCompletions / habitCompletions.length) * 100;

  // Calculate current streak (from most recent backwards)
  let currentStreak = 0;
  for (let i = habitCompletions.length - 1; i >= 0; i--) {
    if (habitCompletions[i].completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  for (const completion of habitCompletions) {
    if (completion.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  const lastCompleted = habitCompletions
    .filter(c => c.completed)
    .pop()?.date;

  return {
    habitId,
    currentStreak,
    longestStreak,
    completionRate,
    totalCompletions,
    lastCompleted
  };
}

export function PredictiveTimelineView({ 
  habits, 
  completions, 
  moods,
  onEdit 
}: PredictiveTimelineViewProps) {
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<30 | 60 | 90>(90);
  const [showConfidenceIntervals, setShowConfidenceIntervals] = useState(true);
  const [predictionMode, setPredictionMode] = useState<'probability' | 'trajectory' | 'risk'>('probability');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'goals' | 'risks' | 'analytics'>('timeline');

  // Generate predictions for all habits
  const predictions = useMemo<HabitPrediction[]>(() => {
    if (habits.length === 0 || completions.length === 0) return [];

    setIsLoading(true);
    const predictions = habits.map(habit => {
      const habitStats = calculateHabitStats(habit.id, completions);

      return generateComprehensivePrediction(habit, completions, habitStats, moods);
    });
    
    setIsLoading(false);
    return predictions;
  }, [habits, completions, moods]);

  // Calculate analytics
  const analytics = useMemo<PredictionAnalytics>(() => {
    return calculatePredictionAnalytics(habits, predictions);
  }, [habits, predictions]);

  // Optimization suggestions
  const optimizationSuggestions = useMemo(() => {
    return optimizeHabitSchedule(habits, completions, moods);
  }, [habits, completions, moods]);

  // Initialize selected habits to show top 3 by default
  useEffect(() => {
    if (predictions.length > 0 && selectedHabits.length === 0) {
      const topHabits = predictions
        .sort((a, b) => b.confidenceScore - a.confidenceScore)
        .slice(0, Math.min(3, predictions.length))
        .map(p => p.habitId);
      setSelectedHabits(topHabits);
    }
  }, [predictions]);

  const selectedPredictions = predictions.filter(p => selectedHabits.includes(p.habitId));

  const refreshPredictions = () => {
    setIsLoading(true);
    // Force re-computation by updating a dependency
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Habits to Analyze
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create some habits first to see predictive insights and future projections.
        </p>
      </div>
    );
  }

  if (completions.length < 14) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="w-8 h-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Insufficient Data for Predictions
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Complete habits for at least 2 weeks to generate reliable predictions and insights.
        </p>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Current data: {completions.length} days • Need: 14+ days
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Predictive Timeline
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              AI-powered habit success predictions and insights
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshPredictions}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <TimelineControls
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            predictionMode={predictionMode}
            onPredictionModeChange={setPredictionMode}
            showConfidenceIntervals={showConfidenceIntervals}
            onShowConfidenceIntervalsChange={setShowConfidenceIntervals}
            selectedHabits={selectedHabits}
            onSelectedHabitsChange={setSelectedHabits}
            habits={habits}
            predictions={predictions}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'timeline', label: 'Timeline', icon: TrendingUp },
            { id: 'goals', label: 'Goals', icon: Target },
            { id: 'risks', label: 'Risk Analysis', icon: AlertTriangle },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-gray-500 dark:text-gray-400">Generating predictions...</span>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {!isLoading && (
        <>
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <PredictionSummary 
                predictions={selectedPredictions}
                analytics={analytics}
                timeRange={timeRange}
              />
              
              <TimelineChart
                predictions={selectedPredictions}
                timeRange={timeRange}
                showConfidenceIntervals={showConfidenceIntervals}
                predictionMode={predictionMode}
                moods={moods}
              />
            </div>
          )}

          {activeTab === 'goals' && (
            <GoalDashboard
              predictions={selectedPredictions}
              habits={habits}
              onEditHabit={onEdit}
            />
          )}

          {activeTab === 'risks' && (
            <RiskAlerts
              predictions={predictions}
              habits={habits}
              optimizationSuggestions={optimizationSuggestions}
              onEditHabit={onEdit}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analytics Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Performance Analytics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Average Success Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(analytics.avgSuccessProbability * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">High-Risk Habits</span>
                    <span className={`font-semibold ${
                      analytics.highRiskHabits > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {analytics.highRiskHabits} of {analytics.totalHabits}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Goal Achievement Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {Math.round(analytics.goalAchievementRate * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400">Optimal Habit Load</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {analytics.optimalHabitLoad} habits
                    </span>
                  </div>
                </div>
              </div>

              {/* Optimization Insights */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Optimization Insights
                </h3>
                <div className="space-y-3">
                  {optimizationSuggestions.recommendations.slice(0, 4).map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Load Distribution */}
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Weekly Load Distribution
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                    const load = optimizationSuggestions.loadDistribution[index];
                    const maxLoad = Math.max(...optimizationSuggestions.loadDistribution);
                    const intensity = maxLoad > 0 ? load / maxLoad : 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {day}
                        </div>
                        <div 
                          className="w-full h-16 bg-primary-100 dark:bg-primary-900 rounded flex items-end justify-center relative"
                        >
                          <div 
                            className="w-full bg-primary-500 rounded transition-all duration-300"
                            style={{ height: `${Math.max(20, intensity * 100)}%` }}
                          />
                          <span className="absolute text-xs font-medium text-white">
                            {load}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  Number of habits scheduled per day
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}