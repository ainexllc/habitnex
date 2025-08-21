'use client';

import { HabitPrediction, PredictionAnalytics } from '@/lib/habitPrediction';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Target, Activity } from 'lucide-react';

interface PredictionSummaryProps {
  predictions: HabitPrediction[];
  analytics: PredictionAnalytics;
  timeRange: 30 | 60 | 90;
}

export function PredictionSummary({ predictions, analytics, timeRange }: PredictionSummaryProps) {
  if (predictions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Select habits to view prediction summary
        </div>
      </div>
    );
  }

  // Calculate summary statistics for selected habits
  const avgSuccessRate = predictions.reduce((sum, pred) => 
    sum + pred.predictions.slice(0, timeRange).reduce((pSum, p) => pSum + p.probability, 0) / timeRange, 0
  ) / predictions.length;

  const improvingHabits = predictions.filter(p => p.overallTrend === 'improving').length;
  const decliningHabits = predictions.filter(p => p.overallTrend === 'declining').length;
  const stableHabits = predictions.filter(p => p.overallTrend === 'stable').length;

  const highRiskHabits = predictions.filter(p => p.riskLevel === 'high').length;
  const mediumRiskHabits = predictions.filter(p => p.riskLevel === 'medium').length;

  const avgGoalProbability = predictions.reduce((sum, pred) => 
    sum + pred.goalPredictions.reduce((gSum, goal) => gSum + goal.probability, 0) / pred.goalPredictions.length, 0
  ) / predictions.length;

  const nextRiskHabits = predictions.filter(p => p.nextRiskDate).length;

  const summaryCards = [
    {
      title: 'Average Success Rate',
      value: `${Math.round(avgSuccessRate * 100)}%`,
      change: avgSuccessRate >= 0.7 ? 'positive' : avgSuccessRate >= 0.5 ? 'neutral' : 'negative',
      icon: Activity,
      description: `Predicted success rate over ${timeRange} days`,
      color: 'blue'
    },
    {
      title: 'Habit Trends',
      value: `${improvingHabits}↑ ${stableHabits}→ ${decliningHabits}↓`,
      change: improvingHabits > decliningHabits ? 'positive' : improvingHabits < decliningHabits ? 'negative' : 'neutral',
      icon: TrendingUp,
      description: 'Improving, stable, and declining habits',
      color: 'green'
    },
    {
      title: 'Risk Assessment',
      value: highRiskHabits > 0 ? `${highRiskHabits} High Risk` : 'Low Risk',
      change: highRiskHabits > 0 ? 'negative' : mediumRiskHabits > 0 ? 'neutral' : 'positive',
      icon: AlertTriangle,
      description: `${highRiskHabits} high, ${mediumRiskHabits} medium risk habits`,
      color: 'red'
    },
    {
      title: 'Goal Achievement',
      value: `${Math.round(avgGoalProbability * 100)}%`,
      change: avgGoalProbability >= 0.7 ? 'positive' : avgGoalProbability >= 0.5 ? 'neutral' : 'negative',
      icon: Target,
      description: 'Average probability of reaching goals',
      color: 'purple'
    }
  ];

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'red':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <div
              key={index}
              className={`bg-white dark:bg-gray-800 border rounded-xl p-4 ${getColorClasses(card.color)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    card.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    card.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    card.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                    card.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-gray-100 dark:bg-gray-900'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      card.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      card.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      card.color === 'red' ? 'text-red-600 dark:text-red-400' :
                      card.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {card.title}
                  </h3>
                </div>
                {getChangeIcon(card.change)}
              </div>
              
              <div className="mb-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detailed Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Key Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Performance Overview */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Performance Overview
            </h4>
            <div className="space-y-3">
              {predictions.slice(0, 3).map(prediction => {
                const avgProbability = prediction.predictions.slice(0, timeRange)
                  .reduce((sum, p) => sum + p.probability, 0) / timeRange;
                
                return (
                  <div key={prediction.habitId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#3b82f6' }} // Would use habit color
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]">
                        {prediction.habitName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(avgProbability * 100)}%
                      </span>
                      {prediction.overallTrend === 'improving' && (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      )}
                      {prediction.overallTrend === 'declining' && (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Goals */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Upcoming Goals
            </h4>
            <div className="space-y-3">
              {predictions
                .flatMap(p => p.goalPredictions.map(g => ({ ...g, habitName: p.habitName })))
                .sort((a, b) => (a.daysRemaining || 999) - (b.daysRemaining || 999))
                .slice(0, 3)
                .map((goal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {goal.habitName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.target} {goal.type} • {goal.period}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {Math.round(goal.probability * 100)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.daysRemaining}d left
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Risk Alerts */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
              Risk Alerts
            </h4>
            <div className="space-y-3">
              {nextRiskHabits > 0 ? (
                predictions
                  .filter(p => p.nextRiskDate)
                  .slice(0, 3)
                  .map(prediction => (
                    <div key={prediction.habitId} className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {prediction.habitName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Risk spike on {prediction.nextRiskDate}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">All habits look good!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}