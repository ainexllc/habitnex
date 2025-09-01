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
import { theme } from '@/lib/theme';

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
            completion: {} // toggleCompletion doesn't return completion data
          });

          // Check for streak milestones - result doesn't contain streakCount, skip for now
          // TODO: Calculate streak from updated data after loadData() completes

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
        theme.surface.primary,
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
                "font-bold",
                touchMode ? "text-3xl" : "text-xl"
              )} style={{
                fontFamily: '"Flavors", cursive',
                color: member.color
              }}>
                {member.displayName}
              </h3>
              <div className={`flex items-center space-x-2 text-sm ${theme.text.muted}`}>
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
              completionRate === 100 ? theme.status.success.text : theme.text.primary
            )}>
              {stats.completed}/{stats.total}
            </div>
            <div className={cn(
              `text-sm ${theme.text.muted}`,
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
          <div className={`flex justify-between text-xs ${theme.text.muted}`}>
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
            <div className={`text-center py-6 ${theme.text.muted}`}>
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
                  touchMode ? "p-4" : "p-3",
                  habit.completed 
                    ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" 
                    : `${theme.surface.secondary} ${theme.surface.hover} border ${theme.border.default}`,
                  celebratingHabitId === habit.id && "animate-pulse bg-yellow-100 border-yellow-300",
                  loading && "opacity-50 pointer-events-none"
                )}
              >
                {/* Habit Info - Simplified */}
                <div className="flex-1 min-w-0 pr-3">
                  <h4 className={cn(
                    `font-semibold ${theme.text.primary}`,
                    touchMode ? "text-lg" : "text-base",
                    habit.completed && "text-green-700 dark:text-green-400"
                  )}>
                    {habit.name}
                  </h4>
                  {habit.description && (
                    <p className={cn(
                      `${theme.text.muted} mt-0.5`,
                      touchMode ? "text-base" : "text-sm",
                      habit.completed && "line-through"
                    )}>
                      {habit.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-1 mt-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className={cn(
                      `text-yellow-600 dark:text-yellow-400 font-semibold`,
                      touchMode ? "text-base" : "text-sm"
                    )}>
                      {habit.basePoints} pts
                    </span>
                  </div>
                </div>
                
                {/* Improved Completion Button */}
                <VisualFeedback
                  feedbackType={habit.completed ? "success" : "info"}
                  onInteraction={() => {
                    handleHabitToggle(habit.id, habit.completed);
                  }}
                  disabled={loading}
                >
                  <Button
                    variant="ghost"
                    size={touchMode ? "lg" : "sm"}
                    className={cn(
                      "flex-shrink-0 rounded-lg font-semibold transition-all duration-200",
                      touchMode ? "px-4 py-2 text-base min-w-[100px]" : "px-3 py-1.5 text-sm min-w-[80px]",
                      habit.completed 
                        ? "bg-green-600 hover:bg-green-700 text-white border-2 border-green-600" 
                        : "bg-green-500 hover:bg-green-600 text-white border-2 border-green-500"
                    )}
                    disabled={loading}
                  >
                    {habit.completed ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className={cn(
                          touchMode ? "w-5 h-5" : "w-4 h-4"
                        )} />
                        Done
                      </span>
                    ) : (
                      <span>Done</span>
                    )}
                  </Button>
                </VisualFeedback>
                
                {/* Celebration Effect - Keep this unchanged */}
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
            `mt-6 pt-4 border-t ${theme.border.light}`,
            touchMode && "mt-8 pt-6"
          )}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={cn(
                  `font-bold ${theme.status.success.text}`,
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.currentStreak}
                </div>
                <div className={cn(
                  theme.text.muted,
                  touchMode ? "text-base" : "text-xs"
                )}>
                  Day Streak
                </div>
              </div>
              <div>
                <div className={cn(
                  `font-bold ${theme.status.info.text}`,
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.habitsCompleted}
                </div>
                <div className={cn(
                  theme.text.muted,
                  touchMode ? "text-base" : "text-xs"
                )}>
                  Total Done
                </div>
              </div>
              <div>
                <div className={cn(
                  `font-bold text-purple-600`,
                  touchMode ? "text-2xl" : "text-lg"
                )}>
                  {member.stats.rewardsEarned}
                </div>
                <div className={cn(
                  theme.text.muted,
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
                  `px-2 py-1 ${theme.status.warning.bg} ${theme.status.warning.text} rounded-full text-xs font-medium`,
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