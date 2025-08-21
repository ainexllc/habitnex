'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ChallengeRecommendation } from '@/lib/aiCoach';
import { 
  Trophy,
  Target,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Flame,
  Star,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';

interface ChallengeCardProps {
  challenge: ChallengeRecommendation;
  onAcceptChallenge?: (challengeId: string) => void;
  onLearnMore?: (challengeId: string) => void;
  compact?: boolean;
  showDifficulty?: boolean;
}

export function ChallengeCard({ 
  challenge, 
  onAcceptChallenge,
  onLearnMore,
  compact = false,
  showDifficulty = true
}: ChallengeCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const getDifficultyIcon = (difficulty: ChallengeRecommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return <Star className="w-4 h-4 text-green-500" />;
      case 'medium':
        return <Target className="w-4 h-4 text-yellow-500" />;
      case 'hard':
        return <Flame className="w-4 h-4 text-red-500" />;
    }
  };

  const getDifficultyColor = (difficulty: ChallengeRecommendation['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
    }
  };

  const getPriorityGradient = () => {
    switch (challenge.priority) {
      case 'high':
        return 'from-orange-500 to-red-500';
      case 'medium':
        return 'from-blue-500 to-purple-500';
      case 'low':
        return 'from-green-500 to-teal-500';
    }
  };

  const getDurationText = (days: number) => {
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 21) return '3 Weeks';
    if (days === 30) return '1 Month';
    return `${days} Days`;
  };

  const getEstimatedEffort = (difficulty: string, duration: number) => {
    const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 }[difficulty] || 1;
    const minutesPerDay = Math.round(15 * difficultyMultiplier);
    return `~${minutesPerDay} min/day`;
  };

  return (
    <Card className="border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-200 overflow-hidden">
      {/* Gradient header */}
      <div className={`h-1 bg-gradient-to-r ${getPriorityGradient()}`} />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100 mb-1">
                {challenge.title}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {challenge.challenge}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showDifficulty && (
              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(challenge.difficulty)}`}>
                <div className="flex items-center gap-1">
                  {getDifficultyIcon(challenge.difficulty)}
                  <span className="capitalize">{challenge.difficulty}</span>
                </div>
              </div>
            )}
            
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="p-1"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Challenge overview */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
          {challenge.message}
        </p>

        {/* Challenge metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getDurationText(challenge.duration)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {getEstimatedEffort(challenge.difficulty, challenge.duration)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Daily effort</div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {Math.round(challenge.confidence * 100)}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Success rate</div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <>
            {/* Potential benefit */}
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                    Expected Benefits
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {challenge.potentialBenefit}
                  </p>
                </div>
              </div>
            </div>

            {/* Success criteria */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Success Criteria
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {challenge.successCriteria}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence meter */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Predicted Success Rate
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(challenge.confidence * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getPriorityGradient()} transition-all duration-500`}
                  style={{ width: `${challenge.confidence * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on your current performance and habit patterns
              </p>
            </div>

            {/* Habit connection */}
            {challenge.habitName && (
              <div className="mb-4 p-2 bg-primary-50 dark:bg-primary-950/30 rounded border border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-3 h-3 text-primary-600" />
                  <span className="font-medium text-primary-800 dark:text-primary-200">
                    Related habit: {challenge.habitName}
                  </span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onAcceptChallenge && (
            <Button
              onClick={() => onAcceptChallenge(challenge.id)}
              className="flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Accept Challenge
            </Button>
          )}
          
          {onLearnMore && (
            <Button
              variant="outline"
              onClick={() => onLearnMore(challenge.id)}
            >
              Learn More
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-auto"
          >
            Maybe Later
          </Button>
        </div>

        {/* Challenge tip */}
        {expanded && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                  Challenge Tip
                </p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {challenge.difficulty === 'easy' 
                    ? 'This challenge is designed to build confidence. Focus on consistency over perfection.'
                    : challenge.difficulty === 'medium'
                    ? 'This challenge will push your limits. Break it into smaller daily goals for better success.'
                    : 'This is an advanced challenge. Consider preparing with easier challenges first or adjust expectations.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}