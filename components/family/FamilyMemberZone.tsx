'use client';

import { useState, useCallback } from 'react';
import { FamilyMember, FamilyHabit } from '@/types/family';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useCelebrationTriggers } from '@/hooks/useCelebrationTriggers';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { VisualFeedback, FeedbackButton } from '@/components/celebration/VisualFeedback';
import { CheckCircle2, Circle, Star, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';

interface FamilyMemberZoneProps {
  member: FamilyMember;
  habits: (FamilyHabit & { completed: boolean })[];
  stats: {
    completed: number;
    total: number;
    completionRate: number;
    totalPoints: number;
    pending: number;
  };
  touchMode?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
  className?: string;
}

export function FamilyMemberZone({
  member,
  habits,
  stats,
  touchMode = false,
  isExpanded = false,
  onExpand,
  className
}: FamilyMemberZoneProps) {
  const { toggleCompletion, loading } = useFamilyHabits(member.id);
  const { celebrateHabitCompletion, celebrateStreakMilestone, celebratePerfectDay, celebrateFirstHabit } = useCelebrationTriggers();
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [previousStats, setPreviousStats] = useState(member.stats);
  
  const handleHabitToggle = useCallback(async (habitId: string, currentCompleted: boolean) => {
    try {
      const result = await toggleCompletion(habitId, undefined, !currentCompleted);
      
      // Trigger celebration animation if completing
      if (!currentCompleted && result) {
        setCelebratingHabitId(habitId);
        setTimeout(() => setCelebratingHabitId(null), 2000);

        // Find the habit that was completed
        const completedHabit = habits.find(h => h.id === habitId);
        if (completedHabit) {
          // Basic habit completion celebration
          celebrateHabitCompletion({
            member,
            habit: completedHabit,
            completion: result // Assuming toggleCompletion returns completion data
          });

          // Check for streak milestones
          if (result.streakCount) {
            celebrateStreakMilestone({
              member,
              habit: completedHabit,
              completion: result
            });
          }

          // Check for first habit completion
          if (member.stats.habitsCompleted === 0) {
            celebrateFirstHabit(member, completedHabit);
          }

          // Check for perfect day (all habits completed)
          const completedToday = habits.filter(h => h.completed).length + 1; // +1 for the one just completed
          if (completedToday === habits.length) {
            celebratePerfectDay(member, habits.length);
          }
        }
      }
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    }
  }, [toggleCompletion]);
  
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const level = Math.floor(member.stats.totalPoints / 100) + 1; // Level up every 100 points
  const pointsToNextLevel = 100 - (member.stats.totalPoints % 100);
  
  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        touchMode && "touch-optimized shadow-xl",
        isExpanded && touchMode && "scale-105 shadow-2xl z-10",
        "border-2",
        className
      )}
      style={{ borderColor: member.color }}
      onClick={touchMode && onExpand ? onExpand : undefined}
    >
      {/* Member Header */}
      <CardHeader className={cn(
        "pb-3",
        touchMode ? "p-6" : "p-4"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {member.avatarStyle && member.avatarSeed ? (
              <DiceBearAvatar
                seed={member.avatarSeed}
                style={member.avatarStyle}
                size={touchMode ? 64 : 48}
                className="border-2 border-white shadow-sm"
                backgroundColor={member.color}
                fallbackEmoji={member.avatar}
              />
            ) : (
              <div 
                className={cn(
                  "rounded-full flex items-center justify-center text-white font-bold",
                  touchMode ? "w-16 h-16 text-2xl" : "w-12 h-12 text-lg"
                )}
                style={{ backgroundColor: member.color }}
              >
                {member.avatar}
              </div>
            )}
            <div>
              <h3 className={cn(
                "font-bold text-gray-900 dark:text-white",
                touchMode ? "text-2xl" : "text-lg"
              )}>
                {member.displayName}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Level {level}</span>
                <span>•</span>
                <span>{member.stats.totalPoints} pts</span>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="text-right">
            <div className={cn(
              "font-bold",
              touchMode ? "text-2xl" : "text-lg",
              completionRate === 100 ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
            )}>
              {stats.completed}/{stats.total}
            </div>
            <div className={cn(
              "text-sm text-gray-500 dark:text-gray-400",
              touchMode && "text-base"
            )}>
              {Math.round(completionRate)}% today
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <Progress 
            value={completionRate} 
            className={cn(
              "w-full",
              touchMode ? "h-3" : "h-2"
            )}
            style={{ 
              backgroundColor: `${member.color}20`,
            }}
          />
        </div>
        
        {/* Level Progress */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Level {level}</span>
            <span>{pointsToNextLevel} pts to next level</span>
          </div>
          <Progress 
            value={(member.stats.totalPoints % 100)} 
            className={cn(
              "w-full mt-1",
              touchMode ? "h-2" : "h-1"
            )}
          />
        </div>
      </CardHeader>
      
      {/* Habits List */}
      <CardContent className={cn(
        touchMode ? "p-6 pt-0" : "p-4 pt-0"
      )}>
        <div className="space-y-2">
          {habits.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className={touchMode ? "text-lg" : "text-sm"}>
                No habits for today
              </p>
            </div>
          ) : (
            habits.map((habit) => (
              <div
                key={habit.id}
                className={cn(
                  "relative flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                  touchMode ? "p-4 min-h-[80px]" : "p-3 min-h-[60px]",
                  habit.completed 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-gray-50 hover:bg-gray-100 border border-gray-200",
                  celebratingHabitId === habit.id && "animate-pulse bg-yellow-100 border-yellow-300",
                  loading && "opacity-50 pointer-events-none"
                )}
              >
                {/* Habit Info */}
                <div className="flex items-center space-x-3 flex-1">
                  <div 
                    className={cn(
                      "flex-shrink-0 text-center",
                      touchMode ? "text-2xl w-8" : "text-xl w-6"
                    )}
                  >
                    {habit.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium text-gray-900 truncate",
                      touchMode ? "text-lg" : "text-sm",
                      habit.completed && "text-green-700"
                    )}>
                      {habit.name}
                    </h4>
                    {habit.description && (
                      <p className={cn(
                        "text-gray-500 truncate",
                        touchMode ? "text-base" : "text-xs"
                      )}>
                        {habit.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        <span className={cn(
                          "text-yellow-600 font-medium",
                          touchMode ? "text-sm" : "text-xs"
                        )}>
                          {habit.basePoints} pts
                        </span>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        habit.difficulty === 'easy' && "bg-green-100 text-green-700",
                        habit.difficulty === 'medium' && "bg-yellow-100 text-yellow-700",
                        habit.difficulty === 'hard' && "bg-red-100 text-red-700"
                      )}>
                        {habit.difficulty}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Completion Button */}
                <VisualFeedback
                  feedbackType={habit.completed ? "success" : "info"}
                  onInteraction={(e) => {
                    e.stopPropagation();
                    handleHabitToggle(habit.id, habit.completed);
                  }}
                  disabled={loading}
                >
                  <Button
                    variant={habit.completed ? "default" : "ghost"}
                    size={touchMode ? "lg" : "sm"}
                    className={cn(
                      "flex-shrink-0 rounded-full",
                      touchMode ? "w-16 h-16 p-0" : "w-10 h-10 p-0",
                      habit.completed 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                    )}
                    disabled={loading}
                  >
                    {habit.completed ? (
                      <CheckCircle2 className={cn(
                        "text-white",
                        touchMode ? "w-8 h-8" : "w-5 h-5"
                      )} />
                    ) : (
                      <Circle className={cn(
                        touchMode ? "w-8 h-8" : "w-5 h-5"
                      )} />
                    )}
                  </Button>
                </VisualFeedback>
                
                {/* Celebration Effect */}
                {celebratingHabitId === habit.id && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-4xl animate-bounce">🎉</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Member Stats Summary */}
        {(isExpanded || !touchMode) && stats.total > 0 && (
          <div className={cn(
            "mt-6 pt-4 border-t border-gray-200",
            touchMode && "mt-8 pt-6"
          )}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={cn(
                  "font-bold text-green-600",
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.currentStreak}
                </div>
                <div className={cn(
                  "text-gray-500",
                  touchMode ? "text-base" : "text-xs"
                )}>
                  Day Streak
                </div>
              </div>
              <div>
                <div className={cn(
                  "font-bold text-blue-600",
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.habitsCompleted}
                </div>
                <div className={cn(
                  "text-gray-500",
                  touchMode ? "text-base" : "text-xs"
                )}>
                  Total Done
                </div>
              </div>
              <div>
                <div className={cn(
                  "font-bold text-purple-600",
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.rewardsEarned}
                </div>
                <div className={cn(
                  "text-gray-500",
                  touchMode ? "text-base" : "text-xs"
                )}>
                  Rewards
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Achievement Badges */}
        {member.stats.badges.length > 0 && (
          <div className={cn(
            "mt-4 flex flex-wrap gap-2",
            touchMode && "mt-6"
          )}>
            {member.stats.badges.slice(0, 3).map((badge, index) => (
              <div
                key={index}
                className={cn(
                  "px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium",
                  touchMode && "px-3 py-2 text-sm"
                )}
              >
                🏆 {badge}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Completion Celebration */}
      {completionRate === 100 && (
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <Star className="w-5 h-5 text-yellow-800" />
          </div>
        </div>
      )}
    </Card>
  );
}