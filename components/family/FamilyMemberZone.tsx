'use client';

import { useState, useCallback } from 'react';
import { FamilyMember, FamilyHabit } from '@/types/family';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useCelebrationTriggers } from '@/hooks/useCelebrationTriggers';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { VisualFeedback, FeedbackButton } from '@/components/celebration/VisualFeedback';
import { CheckCircle2, Circle, Star, Trophy, Zap, Users, Check, X, Undo2, ChevronDown, ChevronUp } from 'lucide-react';
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
  toggleCompletion: (habitId: string, memberId: string, currentCompleted: boolean) => Promise<void>;
  touchMode?: boolean;
  isExpanded?: boolean;
  onExpand?: () => void;
  className?: string;
}

export function FamilyMemberZone({
  member,
  habits,
  stats,
  toggleCompletion,
  touchMode = false,
  isExpanded = false,
  onExpand,
  className
}: FamilyMemberZoneProps) {
  // We still need loading state from the hook, but toggleCompletion comes from props
  const { loading } = useFamilyHabits(member.id);
  const { celebrateHabitCompletion, celebrateStreakMilestone, celebratePerfectDay, celebrateFirstHabit } = useCelebrationTriggers();
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [previousStats, setPreviousStats] = useState(member.stats);
  // Initialize completion statuses - start empty for family dashboard
  // Family dashboard should show fresh state each day, not carry over from database
  const [completionStatuses, setCompletionStatuses] = useState<Record<string, 'success' | 'failure' | null>>({});
  
  // Track which habits are expanded to show details
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());
  
  const toggleHabitExpanded = useCallback((habitId: string) => {
    setExpandedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  }, []);
  
  const handleHabitToggle = useCallback(async (habitId: string, currentCompleted: boolean) => {
    try {
      await toggleCompletion(habitId, member.id, currentCompleted);
      
      // Trigger celebration animation if completing
      if (!currentCompleted) {
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
      // Failed to toggle habit - handle silently
    }
  }, [toggleCompletion]);

  // New handlers for dual completion buttons
  const handleHabitCompletion = useCallback(async (habitId: string, success: boolean) => {
    try {
      // Always mark as completed (true) but track success/failure
      await toggleCompletion(habitId, member.id, false); // false means we want to mark as completed (toggle from uncompleted state)
      
      // Update completion status
      setCompletionStatuses(prev => ({
        ...prev,
        [habitId]: success ? 'success' : 'failure'
      }));
      
      // Trigger celebration animation only for success
      if (success) {
        setCelebratingHabitId(habitId);
        setTimeout(() => setCelebratingHabitId(null), 2000);

        const completedHabit = habits.find(h => h.id === habitId);
        if (completedHabit) {
          celebrateHabitCompletion({
            member,
            habit: completedHabit,
            completion: {}
          });

          if (member.stats.habitsCompleted === 0) {
            celebrateFirstHabit(member, completedHabit);
          }

          const completedToday = habits.filter(h => h.completed).length + 1;
          if (completedToday === habits.length) {
            celebratePerfectDay(member, habits.length);
          }
        }
      }
    } catch (error) {
      // Error toggling completion - handle silently
    }
  }, [toggleCompletion, habits, member, celebrateHabitCompletion, celebrateFirstHabit, celebratePerfectDay]);

  const handleUndo = useCallback(async (habitId: string) => {
    console.log('🔄 Undo clicked for habit:', habitId, 'member:', member.id);
    try {
      // Toggle back to uncompleted (true means current state is completed, so we want to undo it)
      console.log('📤 Calling toggleCompletion with member.id and true (current completed state)...');
      await toggleCompletion(habitId, member.id, true);
      console.log('✅ Toggle completion successful');
      setCompletionStatuses(prev => ({
        ...prev,
        [habitId]: null
      }));
      console.log('🔄 Local completion status cleared');
    } catch (error) {
      console.error('❌ Undo failed:', error);
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
            habits.map((habit) => {
              const status = completionStatuses[habit.id];
              // For family dashboard, only show as completed if user explicitly marked it today
              // Don't use database completion state as that persists across days
              const isCompleted = status !== null;
              const isExpanded = expandedHabits.has(habit.id);
              
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "relative p-3 rounded-lg transition-all duration-200 space-y-3",
                    touchMode ? "p-4" : "p-3",
                    isCompleted 
                      ? "bg-green-50/50 dark:bg-green-950/10 border border-green-200/50 dark:border-green-800/30" 
                      : `${theme.surface.secondary} ${theme.surface.hover} border ${theme.border.default}`,
                    celebratingHabitId === habit.id && "animate-pulse bg-yellow-100 border-yellow-300",
                    loading && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* First Line: Expand arrow and habit name */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleHabitExpanded(habit.id)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-110"
                      aria-label={isExpanded ? "Collapse details" : "Expand details"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    
                    <h4 className={cn(
                      `font-semibold flex-1 ${theme.text.primary}`,
                      touchMode ? "text-lg" : "text-base",
                      isCompleted && (status === 'failure' ? "line-through text-gray-500 dark:text-gray-400" : "line-through text-green-700 dark:text-green-400")
                    )}>
                      {habit.name}
                    </h4>
                  </div>
                  
                  {/* Second Line: Dual Completion Buttons or Undo */}
                  <div className="flex justify-end items-center gap-2 flex-wrap">
                    {isCompleted ? (
                      <>
                        <div className={cn(
                          "px-3 py-1 rounded-lg font-medium text-white text-sm",
                          status === 'failure' 
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        )}>
                          {status === 'success' ? '🎉 Done!' : status === 'failure' ? '😔 Failed' : '✅ Completed'}
                        </div>
                        <Button
                          onClick={() => handleUndo(habit.id)}
                          size="sm"
                          variant="outline"
                          className="hover:scale-105 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Undo"
                        >
                          <Undo2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleHabitCompletion(habit.id, true)}
                            loading={loading}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Done
                          </Button>
                          <Button
                            onClick={() => handleHabitCompletion(habit.id, false)}
                            loading={loading}
                            size="sm"
                            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Skip
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Expanded Details Section */}
                  {isExpanded && (
                    <div className={cn(
                      "mt-3 pt-3 border-t space-y-2",
                      theme.border.light
                    )}>
                      {habit.description && (
                        <p className={cn(
                          "text-sm",
                          theme.text.secondary
                        )}>
                          {habit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className={theme.text.muted}>
                          Points: {habit.points || 10}
                        </span>
                        {habit.tags && habit.tags.length > 0 && (
                          <span className={theme.text.muted}>
                            Tags: {habit.tags.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
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