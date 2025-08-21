'use client';

import { useState } from 'react';
import { HabitPrediction } from '@/lib/habitPrediction';
import { Habit } from '@/types';
import { 
  AlertTriangle, 
  AlertCircle, 
  Shield, 
  TrendingDown,
  Calendar,
  Lightbulb,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format, parseISO } from 'date-fns';

interface RiskAlertsProps {
  predictions: HabitPrediction[];
  habits: Habit[];
  optimizationSuggestions: {
    recommendations: string[];
    optimalDays: { [habitId: string]: number[] };
    loadDistribution: number[];
  };
  onEditHabit?: (habit: Habit) => void;
}

export function RiskAlerts({ 
  predictions, 
  habits, 
  optimizationSuggestions,
  onEditHabit 
}: RiskAlertsProps) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);
  const [showOptimizations, setShowOptimizations] = useState(true);

  // Filter predictions by risk level
  const filteredPredictions = predictions.filter(prediction => 
    selectedRiskLevel === 'all' || prediction.riskLevel === selectedRiskLevel
  );

  // Sort by risk level and upcoming risk dates
  const sortedPredictions = filteredPredictions.sort((a, b) => {
    const riskOrder = { high: 3, medium: 2, low: 1 };
    const aRisk = riskOrder[a.riskLevel];
    const bRisk = riskOrder[b.riskLevel];
    
    if (aRisk !== bRisk) return bRisk - aRisk;
    
    // If same risk level, sort by next risk date
    if (a.nextRiskDate && b.nextRiskDate) {
      return a.nextRiskDate.localeCompare(b.nextRiskDate);
    }
    if (a.nextRiskDate) return -1;
    if (b.nextRiskDate) return 1;
    
    return 0;
  });

  const riskCounts = {
    high: predictions.filter(p => p.riskLevel === 'high').length,
    medium: predictions.filter(p => p.riskLevel === 'medium').length,
    low: predictions.filter(p => p.riskLevel === 'low').length
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getRiskTextColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-800 dark:text-red-200';
      case 'medium':
        return 'text-amber-800 dark:text-amber-200';
      default:
        return 'text-green-800 dark:text-green-200';
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderHabitRiskCard = (prediction: HabitPrediction) => {
    const habit = habits.find(h => h.id === prediction.habitId);
    if (!habit) return null;

    const isExpanded = expandedHabit === prediction.habitId;
    const optimalDays = optimizationSuggestions.optimalDays[prediction.habitId] || [];

    return (
      <div
        key={prediction.habitId}
        className={`border rounded-xl p-4 ${getRiskColor(prediction.riskLevel)}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {getRiskIcon(prediction.riskLevel)}
            <div>
              <h4 className={`font-semibold ${getRiskTextColor(prediction.riskLevel)}`}>
                {prediction.habitName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current streak: {prediction.currentStreak} days • {prediction.overallTrend} trend
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
              prediction.riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
              prediction.riskLevel === 'medium' ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' :
              'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            }`}>
              {prediction.riskLevel} risk
            </span>
            <button
              onClick={() => setExpandedHabit(isExpanded ? null : prediction.habitId)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Risk Details */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Success Rate (30d)
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {Math.round(prediction.predictions.slice(0, 30).reduce((sum, p) => sum + p.probability, 0) / 30 * 100)}%
            </div>
          </div>
          
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Confidence Score
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {Math.round(prediction.confidenceScore * 100)}%
            </div>
          </div>
          
          {prediction.nextRiskDate && (
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Next Risk Date
              </div>
              <div className="font-medium text-gray-900 dark:text-white">
                {format(parseISO(prediction.nextRiskDate), 'MMM dd')}
              </div>
            </div>
          )}
        </div>

        {/* Quick Recommendations */}
        <div className="space-y-2 mb-4">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Quick Actions:
          </div>
          <div className="flex flex-wrap gap-2">
            {prediction.recommendations.slice(0, 2).map((recommendation, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs"
              >
                <Lightbulb className="w-3 h-3" />
                <span className="truncate max-w-[200px]">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            {/* All Recommendations */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Detailed Recommendations:
              </h5>
              <ul className="space-y-2">
                {prediction.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Optimal Days */}
            {optimalDays.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Optimal Days for This Habit:
                </h5>
                <div className="flex flex-wrap gap-2">
                  {optimalDays.map(dayIndex => (
                    <span
                      key={dayIndex}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {dayNames[dayIndex]}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Goal Predictions */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Goal Achievement Outlook:
              </h5>
              <div className="space-y-2">
                {prediction.goalPredictions.slice(0, 3).map((goal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {goal.target} {goal.type} ({goal.period})
                    </span>
                    <span className={`text-sm font-medium ${
                      goal.probability >= 0.7 ? 'text-green-600 dark:text-green-400' :
                      goal.probability >= 0.4 ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {Math.round(goal.probability * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        {onEditHabit && (
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditHabit(habit)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Habit Settings
            </Button>
          </div>
        )}
      </div>
    );
  };

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No Risk Analysis Available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Select habits to view risk assessments and optimization recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Risk Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Risk Analysis & Recommendations
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Identify potential issues and get personalized optimization suggestions
          </p>
        </div>
        
        {/* Risk Level Filter */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { value: 'all', label: 'All Risks' },
            { value: 'high', label: `High (${riskCounts.high})` },
            { value: 'medium', label: `Medium (${riskCounts.medium})` },
            { value: 'low', label: `Low (${riskCounts.low})` }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => setSelectedRiskLevel(option.value as typeof selectedRiskLevel)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedRiskLevel === option.value
                  ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-800 dark:text-red-200">
              High Risk Habits
            </h4>
          </div>
          <div className="text-2xl font-bold text-red-900 dark:text-red-100">
            {riskCounts.high}
          </div>
          <p className="text-sm text-red-700 dark:text-red-300">
            Require immediate attention
          </p>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Medium Risk Habits
            </h4>
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            {riskCounts.medium}
          </div>
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Monitor for changes
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Low Risk Habits
            </h4>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {riskCounts.low}
          </div>
          <p className="text-sm text-green-700 dark:text-green-300">
            Performing well
          </p>
        </div>
      </div>

      {/* Global Optimization Suggestions */}
      {showOptimizations && optimizationSuggestions.recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">
                System-Wide Optimizations
              </h4>
            </div>
            <button
              onClick={() => setShowOptimizations(false)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
            >
              Dismiss
            </button>
          </div>
          
          <div className="space-y-2">
            {optimizationSuggestions.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 flex-shrink-0"></div>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Habit Risk Cards */}
      <div className="space-y-4">
        {sortedPredictions.length > 0 ? (
          sortedPredictions.map(renderHabitRiskCard)
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {selectedRiskLevel === 'all' ? 
              'No risks identified for selected habits' :
              `No ${selectedRiskLevel} risk habits found`
            }
          </div>
        )}
      </div>

      {/* Risk Mitigation Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          General Risk Mitigation Strategies
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              For High-Risk Habits:
            </h5>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Reduce frequency temporarily to rebuild consistency</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Focus on environmental changes and habit stacking</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Plan for obstacles and create contingency strategies</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              For Medium-Risk Habits:
            </h5>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Monitor performance closely and track mood patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Optimize timing based on your strongest days</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1 h-1 rounded-full bg-current mt-2 flex-shrink-0"></div>
                <span>Consider adding accountability partners or reminders</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}