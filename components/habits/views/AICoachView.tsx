'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAICoach } from '@/hooks/useAICoach';
import { useHabits } from '@/hooks/useHabits';
import { CoachInsightCard } from '@/components/coach/CoachInsightCard';
import { RecommendationsList } from '@/components/coach/RecommendationsList';
import { MoodStrategyCard } from '@/components/coach/MoodStrategyCard';
import { ChallengeCard } from '@/components/coach/ChallengeCard';
import { ProgressCelebration } from '@/components/coach/ProgressCelebration';
import { 
  Bot,
  Brain,
  TrendingUp,
  Heart,
  Trophy,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Clock,
  Target,
  Lightbulb,
  Calendar,
  CheckCircle,
  Zap
} from 'lucide-react';
import { getTodayDateString } from '@/lib/utils';

interface AICoachViewProps {
  habits: any[];
  completions: any[];
  moods: any[];
}

export function AICoachView({ habits, completions, moods }: AICoachViewProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'recommendations' | 'strategies' | 'challenges' | 'celebrations'>('overview');
  const { toggleCompletion } = useHabits();
  
  const {
    dailyRecommendations,
    weeklyAnalysis,
    moodStrategies,
    challenges,
    celebrations,
    motivationalMessage,
    moodAnalysisData,
    loading,
    error,
    hasEnoughData,
    isDataReady,
    userLevel,
    updateCoachingInsights,
    lastUpdated
  } = useAICoach();

  const handleApplyRecommendation = (recommendationId: string) => {
    console.log('Applying recommendation:', recommendationId);
    // Implementation for applying recommendations
  };

  const handleCompleteHabit = async (habitId: string) => {
    try {
      await toggleCompletion(habitId, getTodayDateString(), true);
    } catch (error) {
      console.error('Error completing habit:', error);
    }
  };

  const handleAcceptChallenge = (challengeId: string) => {
    console.log('Accepting challenge:', challengeId);
    // Implementation for accepting challenges
  };

  const handleShareAchievement = (celebrationId: string) => {
    console.log('Sharing achievement:', celebrationId);
    // Implementation for sharing achievements
  };

  const sections = [
    { id: 'overview', label: 'Overview', icon: Brain, count: null },
    { id: 'recommendations', label: 'Today', icon: Target, count: dailyRecommendations.length },
    { id: 'strategies', label: 'Strategies', icon: Lightbulb, count: moodStrategies.length },
    { id: 'challenges', label: 'Challenges', icon: Trophy, count: challenges.length },
    { id: 'celebrations', label: 'Wins', icon: Sparkles, count: celebrations.length }
  ] as const;

  // Loading state
  if (!isDataReady || loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Bot className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                AI Coach is analyzing your data...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Preparing personalized insights and recommendations
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Insufficient data state
  if (!hasEnoughData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Not Enough Data Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              AI Coach needs at least 7 days of mood and habit data to provide personalized insights.
            </p>
            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className={`w-4 h-4 ${habits.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Habits: {habits.length} created</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className={`w-4 h-4 ${moods.length >= 7 ? 'text-green-500' : 'text-gray-400'}`} />
                <span>Mood entries: {moods.length}/7 minimum</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button onClick={updateCoachingInsights}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Bot className="w-6 h-6 text-primary-600" />
            </div>
            AI Coach
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Personalized insights and recommendations for {userLevel} level
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={updateCoachingInsights}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Motivational Message */}
      {motivationalMessage && (
        <Card className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/30 border-primary-200 dark:border-primary-800">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="p-2 bg-primary-200 dark:bg-primary-800 rounded-full">
              <Zap className="w-5 h-5 text-primary-700 dark:text-primary-300" />
            </div>
            <div>
              <p className="text-primary-800 dark:text-primary-200 font-medium">
                {motivationalMessage}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <Button
              key={section.id}
              variant={isActive ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              <span>{section.label}</span>
              {section.count !== null && section.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive 
                    ? 'bg-white text-primary-600' 
                    : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {section.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Personal Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Personal Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {weeklyAnalysis?.completionRate.toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Weekly completion</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {weeklyAnalysis?.averageMood.toFixed(1)}/5
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average mood</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 capitalize">
                    {userLevel}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Experience level</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            {weeklyAnalysis?.topPerformers && weeklyAnalysis.topPerformers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Trophy className="w-5 h-5" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklyAnalysis.topPerformers.slice(0, 3).map((habit, index) => (
                      <div key={habit.habitId} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded">
                        <span className="text-sm font-medium">{habit.habitName}</span>
                        <span className="text-sm text-green-600 font-bold">{habit.rate.toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Areas for Improvement */}
            {weeklyAnalysis?.strugglingHabits && weeklyAnalysis.strugglingHabits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <Target className="w-5 h-5" />
                    Growth Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklyAnalysis.strugglingHabits.slice(0, 3).map((habit, index) => (
                      <div key={habit.habitId} className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{habit.habitName}</span>
                          <span className="text-sm text-orange-600 font-bold">{habit.rate.toFixed(0)}%</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {habit.issues.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeSection === 'recommendations' && (
        <div className="space-y-6">
          <RecommendationsList 
            recommendations={dailyRecommendations}
            onApplyRecommendation={handleApplyRecommendation}
            onCompleteHabit={handleCompleteHabit}
          />
        </div>
      )}

      {activeSection === 'strategies' && (
        <div className="space-y-6">
          {moodStrategies.length > 0 ? (
            moodStrategies.map((strategy) => (
              <MoodStrategyCard 
                key={strategy.id}
                strategy={strategy}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Mood Strategies Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your mood for a few more days to unlock personalized strategies.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeSection === 'challenges' && (
        <div className="space-y-6">
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <ChallengeCard 
                key={challenge.id}
                challenge={challenge}
                onAcceptChallenge={handleAcceptChallenge}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Challenges Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep building your habits! Challenges will appear as you progress.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeSection === 'celebrations' && (
        <div className="space-y-6">
          {celebrations.length > 0 ? (
            celebrations.map((celebration) => (
              <ProgressCelebration 
                key={celebration.id}
                celebration={celebration}
                onShareAchievement={handleShareAchievement}
                animated={celebration.priority === 'high'}
              />
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No Recent Achievements
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Keep up the great work! Achievements will appear as you build momentum.
                </p>
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Habit Progress
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}