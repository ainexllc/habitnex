'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { CoachingInsight } from '@/lib/aiCoach';
import { 
  Bot, 
  TrendingUp, 
  Heart, 
  Trophy,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Sparkles,
  MessageSquare
} from 'lucide-react';

interface CoachInsightCardProps {
  insight: CoachingInsight;
  onAction?: (insightId: string, action: string) => void;
  compact?: boolean;
  showCategory?: boolean;
}

export function CoachInsightCard({ 
  insight, 
  onAction, 
  compact = false,
  showCategory = true 
}: CoachInsightCardProps) {
  const getIcon = (type: CoachingInsight['type'], category: CoachingInsight['category']) => {
    switch (type) {
      case 'recommendation':
        return <Bot className="w-5 h-5 text-blue-500" />;
      case 'strategy':
        return <Target className="w-5 h-5 text-purple-500" />;
      case 'challenge':
        return <Trophy className="w-5 h-5 text-orange-500" />;
      case 'celebration':
        return <Sparkles className="w-5 h-5 text-yellow-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: CoachingInsight['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getCategoryBadgeColor = (category: CoachingInsight['category']) => {
    switch (category) {
      case 'mood':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'performance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'streak':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'challenge':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.9) return 'Very confident';
    if (confidence >= 0.7) return 'Confident';
    if (confidence >= 0.5) return 'Moderate confidence';
    return 'Low confidence';
  };

  const handleAction = (action: string) => {
    if (onAction) {
      onAction(insight.id, action);
    }
  };

  return (
    <Card 
      className={`border-l-4 ${getPriorityColor(insight.priority)} transition-all duration-200 hover:shadow-md`}
      hover
    >
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            {getIcon(insight.type, insight.category)}
            <div className="flex-1 min-w-0">
              <CardTitle className={`${compact ? 'text-base' : 'text-lg'} text-gray-900 dark:text-gray-100`}>
                {insight.title}
              </CardTitle>
              {showCategory && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(insight.category)}`}>
                    {insight.category}
                  </span>
                  {insight.priority === 'high' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      Priority
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              insight.priority === 'high' 
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                : insight.priority === 'medium'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            }`}>
              {insight.priority}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
          {insight.message}
        </p>

        {/* Additional metadata for specific types */}
        {insight.type === 'challenge' && insight.metadata && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              {insight.metadata.timeframe && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{insight.metadata.timeframe}</span>
                </div>
              )}
              {insight.metadata.difficulty && (
                <div className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  <span className="capitalize">{insight.metadata.difficulty}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Habit-specific information */}
        {insight.habitName && (
          <div className="mb-3 p-2 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                Related to: {insight.habitName}
              </span>
            </div>
          </div>
        )}

        {/* Confidence indicator (for advanced users) */}
        {!compact && (
          <div className="mb-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>{getConfidenceText(insight.confidence)}</span>
            <div className="flex items-center gap-1">
              <div className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${insight.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(insight.confidence * 100)}%</span>
            </div>
          </div>
        )}

        {/* Actions */}
        {insight.actionable && (
          <div className="flex items-center gap-2 flex-wrap">
            {insight.type === 'recommendation' && (
              <Button
                size="sm"
                onClick={() => handleAction('apply')}
                className="text-xs"
              >
                Apply Now
              </Button>
            )}
            {insight.type === 'challenge' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleAction('accept')}
                  className="text-xs"
                >
                  Accept Challenge
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction('learn-more')}
                  className="text-xs"
                >
                  Learn More
                </Button>
              </>
            )}
            {insight.type === 'strategy' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('save-strategy')}
                className="text-xs"
              >
                Save Strategy
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction('dismiss')}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}