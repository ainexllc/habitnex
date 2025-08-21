'use client';

import { GoalPrediction } from '@/lib/habitPrediction';
import { Target, Calendar, TrendingUp } from 'lucide-react';

interface GoalMilestoneProps {
  habitId: string;
  habitName: string;
  goal: GoalPrediction;
  color: string;
  onClick: () => void;
  isSelected: boolean;
}

export function GoalMilestone({
  habitId,
  habitName,
  goal,
  color,
  onClick,
  isSelected
}: GoalMilestoneProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.7) return 'text-green-600 dark:text-green-400';
    if (probability >= 0.4) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-blue-600 dark:text-blue-400';
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
        isSelected
          ? 'bg-primary-100 dark:bg-primary-900 border border-primary-300 dark:border-primary-700 shadow-sm'
          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
      }`}
    >
      <div 
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      
      <Target className="w-3 h-3 flex-shrink-0" />
      
      <div className="flex items-center gap-2 text-left">
        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
          {habitName}
        </span>
        <span className="text-gray-500 dark:text-gray-400">•</span>
        <span className="text-gray-600 dark:text-gray-300">
          {goal.target} {goal.type}
        </span>
      </div>
      
      <div className="flex items-center gap-1 ml-2">
        <span className={`font-medium ${getProbabilityColor(goal.probability)}`}>
          {Math.round(goal.probability * 100)}%
        </span>
        {goal.daysRemaining && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {goal.daysRemaining}d
            </span>
          </>
        )}
      </div>
      
      {isSelected && (
        <div className="flex items-center gap-1 ml-2 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span className={getConfidenceColor(goal.confidence)}>
            {Math.round(goal.confidence * 100)}% confidence
          </span>
        </div>
      )}
    </button>
  );
}