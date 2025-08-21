'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DailyRecommendation } from '@/lib/aiCoach';
import { 
  ArrowRight,
  Clock,
  Zap,
  Brain,
  Heart,
  Target,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface RecommendationsListProps {
  recommendations: DailyRecommendation[];
  onApplyRecommendation?: (recommendationId: string) => void;
  onCompleteHabit?: (habitId: string) => void;
  title?: string;
  showPriority?: boolean;
  maxItems?: number;
}

export function RecommendationsList({ 
  recommendations,
  onApplyRecommendation,
  onCompleteHabit,
  title = "Today's Recommendations",
  showPriority = true,
  maxItems
}: RecommendationsListProps) {
  const displayRecommendations = maxItems 
    ? recommendations.slice(0, maxItems)
    : recommendations;

  const getImpactIcon = (impact: DailyRecommendation['estimatedImpact']) => {
    switch (impact) {
      case 'high':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Target className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <Heart className="w-4 h-4 text-green-500" />;
    }
  };

  const getBasedOnIcon = (basedOn: DailyRecommendation['basedOn']) => {
    switch (basedOn) {
      case 'mood':
        return <Heart className="w-3 h-3 text-purple-500" />;
      case 'performance':
        return <Target className="w-3 h-3 text-blue-500" />;
      case 'streak':
        return <Zap className="w-3 h-3 text-orange-500" />;
      case 'pattern':
        return <Brain className="w-3 h-3 text-green-500" />;
    }
  };

  const getTimeText = (suggestedTime?: string) => {
    switch (suggestedTime) {
      case 'now':
        return 'Right now';
      case 'morning':
        return 'This morning';
      case 'afternoon':
        return 'This afternoon';
      case 'evening':
        return 'This evening';
      default:
        return 'When convenient';
    }
  };

  const getPriorityColor = (priority: DailyRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
    }
  };

  if (displayRecommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              All caught up!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              You're doing great. Keep up the momentum!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary-600" />
            {title}
          </CardTitle>
          <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {displayRecommendations.length} recommendation{displayRecommendations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {displayRecommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                showPriority ? getPriorityColor(recommendation.priority) : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    recommendation.priority === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : recommendation.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    #{index + 1}
                  </span>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1">
                    {recommendation.title}
                  </h3>
                  {getImpactIcon(recommendation.estimatedImpact)}
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-700 dark:text-gray-300 mb-3 ml-10">
                {recommendation.message}
              </p>

              {/* Metadata */}
              <div className="flex items-center justify-between ml-10">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {recommendation.suggestedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeText(recommendation.suggestedTime)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {getBasedOnIcon(recommendation.basedOn)}
                    <span className="capitalize">Based on {recommendation.basedOn}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="capitalize">{recommendation.estimatedImpact} impact</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {recommendation.habitId && onCompleteHabit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCompleteHabit(recommendation.habitId!)}
                      className="text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Complete
                    </Button>
                  )}
                  {onApplyRecommendation && (
                    <Button
                      size="sm"
                      onClick={() => onApplyRecommendation(recommendation.id)}
                      className="text-xs"
                    >
                      Apply
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Habit-specific information */}
              {recommendation.habitName && (
                <div className="mt-3 ml-10 p-2 bg-primary-50 dark:bg-primary-950/30 rounded border border-primary-200 dark:border-primary-800">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-3 h-3 text-primary-600" />
                    <span className="font-medium text-primary-800 dark:text-primary-200">
                      Habit: {recommendation.habitName}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show more indicator */}
        {maxItems && recommendations.length > maxItems && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {maxItems} of {recommendations.length} recommendations
            </p>
          </div>
        )}

        {/* Quick tips */}
        {displayRecommendations.some(r => r.priority === 'high') && (
          <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-orange-800 dark:text-orange-200 mb-1">
                  High Priority Items
                </p>
                <p className="text-orange-700 dark:text-orange-300">
                  Focus on high-priority recommendations first for maximum impact today.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}