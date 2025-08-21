'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { HabitPrediction } from '@/lib/habitPrediction';
import { Button } from '@/components/ui/Button';
import { 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Eye, 
  EyeOff,
  ChevronDown,
  Filter
} from 'lucide-react';

interface TimelineControlsProps {
  timeRange: 30 | 60 | 90;
  onTimeRangeChange: (range: 30 | 60 | 90) => void;
  predictionMode: 'probability' | 'trajectory' | 'risk';
  onPredictionModeChange: (mode: 'probability' | 'trajectory' | 'risk') => void;
  showConfidenceIntervals: boolean;
  onShowConfidenceIntervalsChange: (show: boolean) => void;
  selectedHabits: string[];
  onSelectedHabitsChange: (habitIds: string[]) => void;
  habits: Habit[];
  predictions: HabitPrediction[];
}

export function TimelineControls({
  timeRange,
  onTimeRangeChange,
  predictionMode,
  onPredictionModeChange,
  showConfidenceIntervals,
  onShowConfidenceIntervalsChange,
  selectedHabits,
  onSelectedHabitsChange,
  habits,
  predictions
}: TimelineControlsProps) {
  const [showHabitSelector, setShowHabitSelector] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const timeRangeOptions = [
    { value: 30, label: '30 Days', icon: Calendar },
    { value: 60, label: '60 Days', icon: Calendar },
    { value: 90, label: '90 Days', icon: Calendar }
  ];

  const predictionModeOptions = [
    { value: 'probability', label: 'Probability', icon: TrendingUp, description: 'Success likelihood over time' },
    { value: 'trajectory', label: 'Trajectory', icon: TrendingUp, description: 'Habit completion patterns' },
    { value: 'risk', label: 'Risk Analysis', icon: AlertTriangle, description: 'Failure risk assessment' }
  ];

  const toggleHabit = (habitId: string) => {
    if (selectedHabits.includes(habitId)) {
      onSelectedHabitsChange(selectedHabits.filter(id => id !== habitId));
    } else {
      onSelectedHabitsChange([...selectedHabits, habitId]);
    }
  };

  const selectAllHabits = () => {
    onSelectedHabitsChange(habits.map(h => h.id));
  };

  const clearAllHabits = () => {
    onSelectedHabitsChange([]);
  };

  const selectTopHabits = () => {
    const topHabits = predictions
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 3)
      .map(p => p.habitId);
    onSelectedHabitsChange(topHabits);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Time Range Selector */}
      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {timeRangeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onTimeRangeChange(option.value as 30 | 60 | 90)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              timeRange === option.value
                ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <option.icon className="w-4 h-4" />
            {option.label}
          </button>
        ))}
      </div>

      {/* Prediction Mode Selector */}
      <div className="relative">
        <button
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          {predictionModeOptions.find(opt => opt.value === predictionMode)?.icon && (
            <div className="w-4 h-4">
              {(() => {
                const Icon = predictionModeOptions.find(opt => opt.value === predictionMode)?.icon!;
                return <Icon />;
              })()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {predictionModeOptions.find(opt => opt.value === predictionMode)?.label}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
            showAdvancedOptions ? 'rotate-180' : ''
          }`} />
        </button>

        {showAdvancedOptions && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Prediction Mode
              </h4>
              <div className="space-y-2">
                {predictionModeOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        onPredictionModeChange(option.value as typeof predictionMode);
                        setShowAdvancedOptions(false);
                      }}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                        predictionMode === option.value
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {option.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showConfidenceIntervals}
                    onChange={(e) => onShowConfidenceIntervalsChange(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700 dark:text-gray-200">Show confidence intervals</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Habit Selector */}
      <div className="relative">
        <button
          onClick={() => setShowHabitSelector(!showHabitSelector)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Habits ({selectedHabits.length})
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
            showHabitSelector ? 'rotate-180' : ''
          }`} />
        </button>

        {showHabitSelector && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  Select Habits to Analyze
                </h4>
                <div className="flex items-center gap-1">
                  <button
                    onClick={selectTopHabits}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    Top 3
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <button
                    onClick={selectAllHabits}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    All
                  </button>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <button
                    onClick={clearAllHabits}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {predictions.map(prediction => {
                  const habit = habits.find(h => h.id === prediction.habitId);
                  if (!habit) return null;
                  
                  const isSelected = selectedHabits.includes(prediction.habitId);
                  const confidenceScore = Math.round(prediction.confidenceScore * 100);
                  
                  return (
                    <label
                      key={prediction.habitId}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleHabit(prediction.habitId)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                      
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: habit.color }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                          {habit.name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>Confidence: {confidenceScore}%</span>
                          <span>•</span>
                          <span className={`capitalize ${
                            prediction.riskLevel === 'high' ? 'text-red-600 dark:text-red-400' :
                            prediction.riskLevel === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                            'text-green-600 dark:text-green-400'
                          }`}>
                            {prediction.riskLevel} risk
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {Math.round(prediction.predictions.slice(0, 30).reduce((sum, p) => sum + p.probability, 0) / 30 * 100)}%
                      </div>
                    </label>
                  );
                })}
              </div>
              
              {predictions.length === 0 && (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                  No habits available for prediction
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onShowConfidenceIntervalsChange(!showConfidenceIntervals)}
          className="flex items-center gap-2"
        >
          {showConfidenceIntervals ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">
            {showConfidenceIntervals ? 'Hide' : 'Show'} Confidence
          </span>
        </Button>
      </div>

      {/* Backdrop for mobile */}
      {(showHabitSelector || showAdvancedOptions) && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => {
            setShowHabitSelector(false);
            setShowAdvancedOptions(false);
          }}
        />
      )}
    </div>
  );
}