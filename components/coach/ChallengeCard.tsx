'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';
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
        return `${theme.status.success.bg} ${theme.status.success.text} border ${theme.status.success.border}`;
      case 'medium':
        return `${theme.status.warning.bg} ${theme.status.warning.text} border ${theme.status.warning.border}`;
      case 'hard':
        return `${theme.status.error.bg} ${theme.status.error.text} border ${theme.status.error.border}`;
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
    <Card className={`border-2 border-transparent ${theme.border.interactive} ${theme.animation.transition} overflow-hidden`}>
      {/* Gradient header */}
      <div className={`h-1 bg-gradient-to-r ${getPriorityGradient()}`} />
      
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 ${theme.iconContainer.yellow} rounded-lg`}>
              <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            
            <div className="flex-1">
              <CardTitle className={`text-lg ${theme.text.primary} mb-1`}>
                {challenge.title}
              </CardTitle>
              <p className={`text-sm ${theme.text.muted}`}>
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
        <p className={`${theme.text.secondary} mb-4 leading-relaxed`}>
          {challenge.message}
        </p>

        {/* Challenge metrics */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className={`text-center p-3 ${theme.surface.secondary} rounded-lg`}>
            <Calendar className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <div className={`text-sm font-medium ${theme.text.primary}`}>
              {getDurationText(challenge.duration)}
            </div>
            <div className={`text-xs ${theme.text.muted}`}>Duration</div>
          </div>
          
          <div className={`text-center p-3 ${theme.surface.secondary} rounded-lg`}>
            <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <div className={`text-sm font-medium ${theme.text.primary}`}>
              {getEstimatedEffort(challenge.difficulty, challenge.duration)}
            </div>
            <div className={`text-xs ${theme.text.muted}`}>Daily effort</div>
          </div>
          
          <div className={`text-center p-3 ${theme.surface.secondary} rounded-lg`}>
            <TrendingUp className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <div className={`text-sm font-medium ${theme.text.primary}`}>
              {Math.round(challenge.confidence * 100)}%
            </div>
            <div className={`text-xs ${theme.text.muted}`}>Success rate</div>
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <>
            {/* Potential benefit */}
            <div className={`mb-4 p-3 ${theme.status.success.bg} border ${theme.status.success.border} rounded-lg`}>
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className={`font-medium ${theme.status.success.text} mb-1`}>
                    Expected Benefits
                  </h4>
                  <p className={`text-sm ${theme.status.success.text}`}>
                    {challenge.potentialBenefit}
                  </p>
                </div>
              </div>
            </div>

            {/* Success criteria */}
            <div className={`mb-4 p-3 ${theme.status.info.bg} border ${theme.status.info.border} rounded-lg`}>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className={`font-medium ${theme.status.info.text} mb-1`}>
                    Success Criteria
                  </h4>
                  <p className={`text-sm ${theme.status.info.text}`}>
                    {challenge.successCriteria}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence meter */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${theme.text.secondary}`}>
                  Predicted Success Rate
                </span>
                <span className={`text-sm ${theme.text.muted}`}>
                  {Math.round(challenge.confidence * 100)}%
                </span>
              </div>
              <div className={`w-full h-2 ${theme.surface.tertiary} rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${getPriorityGradient()} transition-all duration-500`}
                  style={{ width: `${challenge.confidence * 100}%` }}
                />
              </div>
              <p className={`text-xs ${theme.text.muted} mt-1`}>
                Based on your current performance and habit patterns
              </p>
            </div>

            {/* Habit connection */}
            {challenge.habitName && (
              <div className={`mb-4 p-2 ${theme.status.info.bg} rounded border ${theme.status.info.border}`}>
                <div className="flex items-center gap-2 text-sm">
                  <Target className={`w-3 h-3 ${theme.status.info.icon}`} />
                  <span className={`font-medium ${theme.status.info.text}`}>
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
            className={`${theme.text.muted} hover:${theme.text.secondary} ml-auto`}
          >
            Maybe Later
          </Button>
        </div>

        {/* Challenge tip */}
        {expanded && (
          <div className={`mt-4 p-3 ${theme.status.warning.bg} border ${theme.status.warning.border} rounded-lg`}>
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className={`font-medium ${theme.status.warning.text} mb-1`}>
                  Challenge Tip
                </p>
                <p className={`${theme.status.warning.text}`}>
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