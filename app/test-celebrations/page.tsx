'use client';

import { useCelebration } from '@/contexts/CelebrationContext';
import { FeedbackButton } from '@/components/celebration/VisualFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function TestCelebrationsPage() {
  const { addCelebration } = useCelebration();

  const triggerHabitCompletion = () => {
    addCelebration({
      type: 'habit_complete',
      memberName: 'Test User',
      memberAvatar: '🧪',
      memberColor: '#8B5CF6',
      title: 'Morning Run Complete!',
      description: 'Great job! You completed your morning run.',
      emoji: '🏃‍♀️',
      points: 25
    });
  };

  const triggerStreakMilestone = () => {
    addCelebration({
      type: 'streak_milestone',
      memberName: 'Test User',
      memberAvatar: '🔥',
      memberColor: '#F59E0B',
      title: '7 Day Streak!',
      description: 'Amazing! You\'ve kept up your habit for a whole week!',
      emoji: '🔥',
      streak: 7,
      points: 50
    });
  };

  const triggerRewardEarned = () => {
    addCelebration({
      type: 'reward_earned',
      memberName: 'Test User',
      memberAvatar: '🎁',
      memberColor: '#EF4444',
      title: 'Reward Earned!',
      description: 'Enjoy your ice cream! You\'ve earned it!',
      emoji: '🍦',
      points: 100
    });
  };

  const triggerChallengeComplete = () => {
    addCelebration({
      type: 'challenge_complete',
      memberName: 'Test User',
      memberAvatar: '🏆',
      memberColor: '#10B981',
      title: 'Challenge Complete!',
      description: 'You completed the "Healthy Week" challenge!',
      emoji: '🏆'
    });
  };

  const triggerLevelUp = () => {
    addCelebration({
      type: 'level_up',
      memberName: 'Test User',
      memberAvatar: '👑',
      memberColor: '#8B5CF6',
      title: 'Level Up!',
      description: 'Congratulations! You\'ve reached Level 5!',
      emoji: '🎉',
      level: 5
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🎉 Test Celebration System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <FeedbackButton
                feedbackType="success"
                size="lg"
                onClick={triggerHabitCompletion}
                className="h-20"
              >
                🏃‍♀️ Habit Complete
              </FeedbackButton>

              <FeedbackButton
                feedbackType="success"
                size="lg"
                onClick={triggerStreakMilestone}
                className="h-20 bg-yellow-600 hover:bg-yellow-700"
              >
                🔥 7-Day Streak!
              </FeedbackButton>

              <FeedbackButton
                feedbackType="success"
                size="lg"
                onClick={triggerRewardEarned}
                className="h-20 bg-pink-600 hover:bg-pink-700"
              >
                🎁 Reward Earned
              </FeedbackButton>

              <FeedbackButton
                feedbackType="success"
                size="lg"
                onClick={triggerChallengeComplete}
                className="h-20 bg-green-600 hover:bg-green-700"
              >
                🏆 Challenge Won
              </FeedbackButton>

              <FeedbackButton
                feedbackType="success"
                size="lg"
                onClick={triggerLevelUp}
                className="h-20 bg-indigo-600 hover:bg-indigo-700 md:col-span-2"
              >
                👑 Level Up!
              </FeedbackButton>
            </div>

            <div className="mt-8 text-center text-gray-600">
              <p>Click any button to trigger celebration effects!</p>
              <p className="text-sm mt-2">
                This page tests the visual feedback, sound effects, and celebration overlays.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}