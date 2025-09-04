'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { FamilyHabit } from '@/types/family';
import {
  CheckCircle,
  Clock,
  Target,
  Star,
  Calendar,
  TrendingUp,
  Award,
  Heart,
  Brain,
  Leaf,
  Lightbulb,
  Users,
  Zap,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: (FamilyHabit & { completed: boolean }) | null;
  onComplete?: () => Promise<void>;
  memberName?: string;
  memberColor?: string;
  isCompleting?: boolean;
}

export function HabitDetailsModal({
  isOpen,
  onClose,
  habit,
  onComplete,
  memberName,
  memberColor,
  isCompleting = false
}: HabitDetailsModalProps) {
  if (!habit) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'hard': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getFrequencyDisplay = () => {
    switch (habit.frequency) {
      case 'daily': return 'Every day';
      case 'weekly': return `Weekly (${habit.targetDays?.length || 0} days)`;
      case 'interval': return `Every ${habit.intervalDays} day${habit.intervalDays! > 1 ? 's' : ''}`;
      default: return habit.frequency;
    }
  };

  const handleComplete = async () => {
    if (onComplete && !habit.completed) {
      await onComplete();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Habit Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span
              className="text-4xl"
              style={{
                fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                fontSize: '48px',
                fontWeight: '400'
              }}
            >
              {habit.emoji}
            </span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{habit.name}</h2>
              {memberName && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For <span style={{ color: memberColor }}>{memberName}</span>
                </p>
              )}
            </div>
          </div>

          {habit.completed ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed Today!</span>
            </div>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {isCompleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Complete Habit
                </>
              )}
            </Button>
          )}
        </div>

        {/* Basic Info Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Difficulty & Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium capitalize",
                    getDifficultyColor(habit.difficulty)
                  )}>
                    {habit.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Points:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    +{habit.basePoints}
                  </span>
                </div>
                {habit.difficulty === 'hard' && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg">
                    💪 Extra challenging! Great job taking this on!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                  <span className="font-medium">{getFrequencyDisplay()}</span>
                </div>
                {habit.targetDays && habit.targetDays.length > 0 && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 block mb-1">Active Days:</span>
                    <div className="flex flex-wrap gap-1">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <span
                          key={day}
                          className={cn(
                            "px-2 py-1 text-xs rounded",
                            habit.targetDays!.includes(index)
                              ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                          )}
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {habit.description && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5" />
                About This Habit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{habit.description}</p>
            </CardContent>
          </Card>
        )}

        {/* AI Enhancement Benefits */}
        {(habit.healthBenefits || habit.mentalBenefits || habit.longTermBenefits) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                Benefits & Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {habit.healthBenefits && (
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Physical Health</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{habit.healthBenefits}</p>
                    </div>
                  </div>
                )}

                {habit.mentalBenefits && (
                  <div className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Mental Health</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{habit.mentalBenefits}</p>
                    </div>
                  </div>
                )}

                {habit.longTermBenefits && (
                  <div className="flex items-start gap-3">
                    <Leaf className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">Long-term Impact</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{habit.longTermBenefits}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Tips */}
        {habit.tip && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="w-5 h-5" />
                Success Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200">{habit.tip}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complementary Habits */}
        {habit.complementary && habit.complementary.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Works Great With
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {habit.complementary.map((complement, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {complement}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {habit.tags && habit.tags.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {habit.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        {habit.milestoneRewards && habit.milestoneRewards.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5" />
                Achievement Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {habit.milestoneRewards.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{milestone.streak} day streak</span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{milestone.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-yellow-600 dark:text-yellow-400">+{milestone.points} pts</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  );
}
