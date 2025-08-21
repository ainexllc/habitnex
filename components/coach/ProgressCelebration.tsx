'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ProgressCelebration } from '@/lib/aiCoach';
import { 
  Sparkles,
  Trophy,
  Target,
  TrendingUp,
  Heart,
  Zap,
  Star,
  Gift,
  ChevronRight,
  Share2,
  Bookmark
} from 'lucide-react';

interface ProgressCelebrationProps {
  celebration: ProgressCelebration;
  onShareAchievement?: (celebrationId: string) => void;
  onSetNextGoal?: (celebrationId: string, nextGoal: string) => void;
  onSaveMilestone?: (celebrationId: string) => void;
  showActions?: boolean;
  animated?: boolean;
}

export function ProgressCelebration({ 
  celebration, 
  onShareAchievement,
  onSetNextGoal,
  onSaveMilestone,
  showActions = true,
  animated = false
}: ProgressCelebrationProps) {
  const [celebrating, setCelebrating] = useState(animated);

  const getCelebrationIcon = (category: ProgressCelebration['category']) => {
    switch (category) {
      case 'streak':
        return <Zap className="w-6 h-6 text-orange-500" />;
      case 'performance':
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case 'mood':
        return <Heart className="w-6 h-6 text-pink-500" />;
      case 'general':
        return <Star className="w-6 h-6 text-blue-500" />;
      default:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getCelebrationGradient = () => {
    switch (celebration.category) {
      case 'streak':
        return 'from-orange-400 via-red-400 to-pink-400';
      case 'performance':
        return 'from-green-400 via-blue-400 to-purple-400';
      case 'mood':
        return 'from-pink-400 via-rose-400 to-red-400';
      default:
        return 'from-yellow-400 via-orange-400 to-red-400';
    }
  };

  const getAchievementEmoji = (achievement: string) => {
    if (achievement.includes('streak')) return '🔥';
    if (achievement.includes('perfect')) return '💯';
    if (achievement.includes('week')) return '📅';
    if (achievement.includes('habit')) return '✅';
    return '🎉';
  };

  const getMilestoneColor = () => {
    switch (celebration.priority) {
      case 'high':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'medium':
        return 'bg-gradient-to-r from-blue-400 to-purple-500 text-white';
      case 'low':
        return 'bg-gradient-to-r from-green-400 to-teal-500 text-white';
    }
  };

  React.useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setCelebrating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [animated]);

  return (
    <Card className={`relative overflow-hidden border-2 transition-all duration-500 ${
      celebrating 
        ? 'border-yellow-300 shadow-lg transform scale-105' 
        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
    }`}>
      {/* Celebratory background pattern */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCelebrationGradient()} opacity-5`} />
      
      {/* Sparkle animation overlay */}
      {celebrating && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="animate-pulse absolute top-4 right-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="animate-pulse absolute bottom-4 left-4 animation-delay-300">
            <Sparkles className="w-3 h-3 text-pink-400" />
          </div>
          <div className="animate-pulse absolute top-8 left-1/3 animation-delay-600">
            <Sparkles className="w-2 h-2 text-blue-400" />
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${getMilestoneColor()} ${celebrating ? 'animate-bounce' : ''}`}>
              {getCelebrationIcon(celebration.category)}
            </div>
            
            <div>
              <CardTitle className="text-xl text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span>{getAchievementEmoji(celebration.achievement)}</span>
                {celebration.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {celebration.milestone}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${getMilestoneColor()}`}>
              {celebration.achievement}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Celebration message */}
        <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed mb-2">
            {celebration.message}
          </p>
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 italic">
              "{celebration.encouragement}"
            </p>
          </div>
        </div>

        {/* Achievement details */}
        {celebration.habitName && (
          <div className="mb-4 p-3 bg-primary-50 dark:bg-primary-950/30 rounded border border-primary-200 dark:border-primary-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                Habit: {celebration.habitName}
              </span>
            </div>
          </div>
        )}

        {/* Next goal */}
        {celebration.nextGoal && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Next Challenge
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {celebration.nextGoal}
                  </p>
                </div>
              </div>
              {onSetNextGoal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSetNextGoal(celebration.id, celebration.nextGoal!)}
                  className="text-xs"
                >
                  Set Goal
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Confidence/Achievement level */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Achievement Level
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Outstanding
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${getCelebrationGradient()} animate-pulse`} />
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center gap-2 flex-wrap">
            {onShareAchievement && (
              <Button
                onClick={() => onShareAchievement(celebration.id)}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share Achievement
              </Button>
            )}
            
            {onSaveMilestone && (
              <Button
                variant="outline"
                onClick={() => onSaveMilestone(celebration.id)}
                className="flex items-center gap-2"
              >
                <Bookmark className="w-4 h-4" />
                Save Milestone
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto"
            >
              <Gift className="w-4 h-4 mr-1" />
              Treat Yourself
            </Button>
          </div>
        )}

        {/* Celebration stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {celebration.confidence ? Math.round(celebration.confidence * 100) : 100}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Consistency</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {celebration.priority === 'high' ? 'Major' : celebration.priority === 'medium' ? 'Good' : 'Great'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Impact</div>
            </div>
            
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                🎯
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Milestone</div>
            </div>
          </div>
        </div>

        {/* Motivational quote */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg">
          <div className="text-center">
            <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium italic">
              "Success is the sum of small efforts repeated day in and day out."
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Keep building those positive habits! 🌟
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}