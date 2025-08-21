'use client';

import { useState } from 'react';
import { HabitPrediction } from '@/lib/habitPrediction';
import { Habit } from '@/types';
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format, addDays } from 'date-fns';

interface GoalDashboardProps {
  predictions: HabitPrediction[];
  habits: Habit[];
  onEditHabit?: (habit: Habit) => void;
}

export function GoalDashboard({ predictions, habits, onEditHabit }: GoalDashboardProps) {
  const [selectedGoalType, setSelectedGoalType] = useState<'all' | 'streak' | 'completion'>('all');
  const [sortBy, setSortBy] = useState<'probability' | 'daysRemaining' | 'target'>('probability');

  // Flatten all goals from all predictions
  const allGoals = predictions.flatMap(prediction => 
    prediction.goalPredictions.map(goal => ({
      ...goal,
      habitId: prediction.habitId,
      habitName: prediction.habitName,
      habitColor: habits.find(h => h.id === prediction.habitId)?.color || '#3b82f6'
    }))
  );

  // Filter and sort goals
  const filteredGoals = allGoals
    .filter(goal => selectedGoalType === 'all' || goal.type === selectedGoalType)
    .sort((a, b) => {
      switch (sortBy) {
        case 'probability':
          return b.probability - a.probability;
        case 'daysRemaining':
          return (a.daysRemaining || 999) - (b.daysRemaining || 999);
        case 'target':
          return b.target - a.target;
        default:
          return 0;
      }
    });

  // Group goals by achievement probability
  const highProbabilityGoals = filteredGoals.filter(g => g.probability >= 0.7);
  const mediumProbabilityGoals = filteredGoals.filter(g => g.probability >= 0.4 && g.probability < 0.7);
  const lowProbabilityGoals = filteredGoals.filter(g => g.probability < 0.4);

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (probability >= 0.4) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
  };

  const getProbabilityIcon = (probability: number) => {
    if (probability >= 0.7) return <CheckCircle className="w-5 h-5" />;
    if (probability >= 0.4) return <Clock className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  const renderGoalCard = (goal: any, index: number) => {
    const habit = habits.find(h => h.id === goal.habitId);
    
    return (
      <div
        key={`${goal.habitId}-${goal.type}-${goal.target}-${index}`}
        className={`border rounded-lg p-4 ${getProbabilityColor(goal.probability)}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: goal.habitColor }}
            />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {goal.habitName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {goal.target} {goal.type === 'streak' ? 'day streak' : '% completion'} • {goal.period}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getProbabilityIcon(goal.probability)}
            <span className="font-bold text-lg">
              {Math.round(goal.probability * 100)}%
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Confidence
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {Math.round(goal.confidence * 100)}%
            </div>
          </div>
          
          {goal.daysRemaining && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Days Left
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {goal.daysRemaining}
              </div>
            </div>
          )}
          
          {goal.estimatedDate && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Target Date
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {format(new Date(goal.estimatedDate), 'MMM dd')}
              </div>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{Math.round(goal.probability * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                goal.probability >= 0.7 ? 'bg-green-500' :
                goal.probability >= 0.4 ? 'bg-amber-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.round(goal.probability * 100)}%` }}
            />
          </div>
        </div>
        
        {habit && onEditHabit && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditHabit(habit)}
            className="w-full flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Habit
          </Button>
        )}
      </div>
    );
  };

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Goals to Track
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select habits to view their goal achievement predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Goal Achievement Dashboard
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Track your progress towards habit milestones
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Goal Type Filter */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { value: 'all', label: 'All Goals' },
              { value: 'streak', label: 'Streaks' },
              { value: 'completion', label: 'Completion' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedGoalType(option.value as typeof selectedGoalType)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedGoalType === option.value
                    ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
          >
            <option value="probability">Sort by Probability</option>
            <option value="daysRemaining">Sort by Time Remaining</option>
            <option value="target">Sort by Target</option>
          </select>
        </div>
      </div>

      {/* Goals Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Highly Likely
            </h4>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {highProbabilityGoals.length}
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Goals with 70%+ probability
          </p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Moderate Chance
            </h4>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {mediumProbabilityGoals.length}
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Goals with 40-70% probability
          </p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-800 dark:text-red-200">
              Needs Attention
            </h4>
          </div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {lowProbabilityGoals.length}
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            Goals with &lt;40% probability
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map(renderGoalCard)}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No goals found for the selected criteria
        </div>
      )}

      {/* Goal Insights */}
      {filteredGoals.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Goal Insights
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Most Achievable Goals
              </h5>
              <div className="space-y-2">
                {filteredGoals
                  .sort((a, b) => b.probability - a.probability)
                  .slice(0, 3)
                  .map((goal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.habitColor }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {goal.habitName} • {goal.target} {goal.type}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {Math.round(goal.probability * 100)}%
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                Upcoming Milestones
              </h5>
              <div className="space-y-2">
                {filteredGoals
                  .filter(goal => goal.daysRemaining)
                  .sort((a, b) => (a.daysRemaining || 999) - (b.daysRemaining || 999))
                  .slice(0, 3)
                  .map((goal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: goal.habitColor }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {goal.habitName} • {goal.target} {goal.type}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {goal.daysRemaining}d
                      </span>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}