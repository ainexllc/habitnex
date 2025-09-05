'use client';

import { useState, useCallback } from 'react';
import { FamilyMember, FamilyHabit } from '@/types/family';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useCelebrationTriggers } from '@/hooks/useCelebrationTriggers';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { VisualFeedback, FeedbackButton } from '@/components/celebration/VisualFeedback';
import { CheckCircle2, Circle, Star, Trophy, Zap, Users, Check, X, Undo2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { HabitBenefitsModal } from './HabitBenefitsModal';
import { OpenMoji } from '@/components/ui/OpenMoji';
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
  const { loading, getHabitCompletion } = useFamilyHabits(member.id);
  const { celebrateHabitCompletion, celebrateStreakMilestone, celebratePerfectDay, celebrateFirstHabit } = useCelebrationTriggers();
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [previousStats, setPreviousStats] = useState(member.stats);

  // Track which habits are expanded to show details
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());
  const [benefitsModalHabit, setBenefitsModalHabit] = useState<FamilyHabit | null>(null);

  // Get today's date for completion checking
  const today = new Date().toISOString().split('T')[0];

  // Check actual database completion status for today
  const getTodaysCompletionStatus = useCallback((habitId: string) => {
    const todaysCompletion = getHabitCompletion(habitId, today);
    if (todaysCompletion && todaysCompletion.completed) {
      // Return success/failure based on notes, default to success
      if (todaysCompletion.notes === 'Marked as failed') {
        return 'failure';
      }
      return 'success';
    }
    return null;
  }, [getHabitCompletion, today]);
  
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
      // Check current completion status
      const currentCompletion = getTodaysCompletionStatus(habitId);
      const isCurrentlyCompleted = currentCompletion !== null;

      // If not completed, mark as completed with appropriate notes
      if (!isCurrentlyCompleted) {
        const notes = success ? 'Completed successfully' : 'Marked as failed';
        await toggleCompletion(habitId, member.id, false, undefined, notes); // Mark as completed with notes
      }

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

          const completedToday = habits.filter(h => getTodaysCompletionStatus(h.id) !== null).length + 1;
          if (completedToday === habits.length) {
            celebratePerfectDay(member, habits.length);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  }, [toggleCompletion, habits, member, celebrateHabitCompletion, celebrateFirstHabit, celebratePerfectDay, getTodaysCompletionStatus]);

  const handleUndo = useCallback(async (habitId: string) => {
    try {
      // Check if currently completed
      const currentCompletion = getTodaysCompletionStatus(habitId);
      const isCurrentlyCompleted = currentCompletion !== null;

      // If completed, toggle to uncompleted
      if (isCurrentlyCompleted) {
        await toggleCompletion(habitId, member.id, true); // Mark as uncompleted
      }
    } catch (error) {
      console.error('Failed to undo habit:', error);
    }
  }, [toggleCompletion, member.id, getTodaysCompletionStatus]);
  
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const level = Math.floor(member.stats.totalPoints / 100) + 1; // Level up every 100 points
  const pointsToNextLevel = 100 - (member.stats.totalPoints % 100);
  
  return (
    <>
      <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]",
        theme.surface.primary,
        touchMode && "touch-optimized shadow-2xl",
        isExpanded && touchMode && "scale-105 shadow-2xl z-10",
        "border-2 rounded-3xl",
        className
      )}
      style={{ 
        borderColor: member.color,
        background: `linear-gradient(145deg, ${theme.surface.primary}, ${member.color}05)`
      }}
      onClick={touchMode && onExpand ? onExpand : undefined}
    >
      {/* Member Header - Enhanced with larger avatars and names */}
      <CardHeader className={cn(
        "pb-4",
        touchMode ? "p-8" : "p-6"
      )}>
        {/* Centered Avatar and Name Layout */}
        <div className="flex flex-col items-center text-center mb-6">
          {/* Large Avatar */}
          <div className="relative mb-4">
            {member.avatarStyle && member.avatarSeed ? (
              <div 
                className="rounded-full border-4 shadow-lg ring-4 ring-opacity-20 transition-all hover:shadow-xl hover:scale-105 overflow-hidden"
                style={{ borderColor: member.color }}
              >
                <DiceBearAvatar
                  seed={member.avatarSeed}
                  style={member.avatarStyle}
                  size={touchMode ? 120 : 96}
                  backgroundColor={member.color}
                  fallbackEmoji={member.avatar}
                />
              </div>
            ) : (
              <div 
                className={cn(
                  "rounded-full flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-opacity-20 transition-all hover:shadow-xl hover:scale-105 border-4",
                  touchMode ? "w-30 h-30 text-5xl" : "w-24 h-24 text-4xl"
                )}
                style={{ 
                  backgroundColor: member.color,
                  borderColor: member.color 
                }}
              >
                {member.avatar}
              </div>
            )}
            
            {/* Completion Badge on Avatar */}
            {completionRate === 100 && (
              <div className="absolute -top-2 -right-2">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Star className="w-6 h-6 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Large Name and Level Info */}
          <div>
            <h3 className={cn(
              "font-bold mb-2 leading-tight",
              touchMode ? "text-4xl" : "text-3xl"
            )} style={{
              fontFamily: '"Henny Penny", cursive',
              color: member.color,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              {member.displayName}
            </h3>
            
            {/* Level and Points Info */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className={cn(
                  "font-bold text-yellow-800 dark:text-yellow-200",
                  touchMode ? "text-lg" : "text-base"
                )}>
                  Level {level}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 px-4 py-2 rounded-full">
                <Trophy className="w-5 h-5 text-purple-500" />
                <span className={cn(
                  "font-bold text-purple-800 dark:text-purple-200",
                  touchMode ? "text-lg" : "text-base"
                )}>
                  {member.stats.totalPoints} pts
                </span>
              </div>
            </div>
            
            {/* Daily Completion Status */}
            <div className="flex items-center justify-center">
              <div className={cn(
                "px-6 py-3 rounded-full font-bold shadow-md",
                touchMode ? "text-xl" : "text-lg",
                completionRate === 100 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
              )}>
                {stats.completed}/{stats.total} Today ({Math.round(completionRate)}%)
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress Bars */}
        <div className="space-y-4 mt-6">
          {/* Daily Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={cn(
                "font-semibold text-gray-700 dark:text-gray-300",
                touchMode ? "text-lg" : "text-base"
              )}>
                Today's Progress
              </span>
              <span className={cn(
                "font-bold",
                touchMode ? "text-lg" : "text-base",
                completionRate === 100 ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
              )}>
                {Math.round(completionRate)}%
              </span>
            </div>
            <Progress 
              value={completionRate} 
              className={cn(
                "w-full",
                touchMode ? "h-4" : "h-3"
              )}
              style={{ 
                backgroundColor: `${member.color}20`,
              }}
            />
          </div>
          
          {/* Level Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={cn(
                "font-semibold text-gray-700 dark:text-gray-300",
                touchMode ? "text-lg" : "text-base"
              )}>
                Level Progress
              </span>
              <span className={cn(
                "font-bold text-purple-600 dark:text-purple-400",
                touchMode ? "text-lg" : "text-base"
              )}>
                {pointsToNextLevel} pts to Level {level + 1}
              </span>
            </div>
            <Progress 
              value={(member.stats.totalPoints % 100)} 
              className={cn(
                "w-full",
                touchMode ? "h-4" : "h-3"
              )}
              style={{ 
                backgroundColor: '#e0e7ff',
              }}
            />
          </div>
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
              // Check actual database completion for today
              const status = getTodaysCompletionStatus(habit.id);
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
                  {/* First Line: Expand arrow, emoji and habit name */}
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
                    
                    {habit.emoji && (
                      <div className="flex-shrink-0">
                        <OpenMoji 
                          emoji={habit.emoji} 
                          size={touchMode ? 32 : 24}
                          alt={habit.name}
                        />
                      </div>
                    )}
                    
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
                          "px-2 py-2 rounded-lg flex items-center justify-center",
                          status === 'failure' 
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500'
                        )}>
                          <OpenMoji 
                            emoji={status === 'success' ? '🎉' : status === 'failure' ? '😢' : '✅'} 
                            size={24}
                            alt={status === 'success' ? 'Celebration' : status === 'failure' ? 'Sad' : 'Done'}
                          />
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
                        <div className="flex items-center gap-3">
                          {/* Points Display */}
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                            <span>{habit.basePoints || 10}</span>
                            <span>pts</span>
                          </div>

                          {/* Completion Buttons */}
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleHabitCompletion(habit.id, true)}
                              loading={loading}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                            >
                              Done
                            </Button>
                            <Button
                              onClick={() => handleHabitCompletion(habit.id, false)}
                              loading={loading}
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                            >
                              Failed
                            </Button>
                          </div>
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
                        {/* View Benefits Link */}
                        {(habit.healthBenefits || habit.mentalBenefits || habit.longTermBenefits || habit.successTips || habit.description) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBenefitsModalHabit(habit);
                            }}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          >
                            <Info className="w-4 h-4" />
                            <span className="underline">View Benefits</span>
                          </button>
                        )}
                        <span className={theme.text.muted}>
                          {habit.points || 10} pts
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
        
        {/* Enhanced Member Stats Summary */}
        {(isExpanded || !touchMode) && stats.total > 0 && (
          <div className={cn(
            `mt-8 pt-6 border-t-2 ${theme.border.light}`,
            touchMode && "mt-10 pt-8"
          )}>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-4 mb-3 shadow-lg">
                  <Zap className="w-8 h-8 text-white mx-auto" />
                </div>
                <div className={cn(
                  `font-bold text-green-600 dark:text-green-400`,
                  touchMode ? "text-3xl" : "text-2xl"
                )}>
                  {member.stats.currentStreak}
                </div>
                <div className={cn(
                  "text-gray-600 dark:text-gray-400 font-medium",
                  touchMode ? "text-lg" : "text-base"
                )}>
                  Day Streak
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl p-4 mb-3 shadow-lg">
                  <Trophy className="w-8 h-8 text-white mx-auto" />
                </div>
                <div className={cn(
                  `font-bold text-blue-600 dark:text-blue-400`,
                  touchMode ? "text-3xl" : "text-2xl"
                )}>
                  {member.stats.habitsCompleted}
                </div>
                <div className={cn(
                  "text-gray-600 dark:text-gray-400 font-medium",
                  touchMode ? "text-lg" : "text-base"
                )}>
                  Total Done
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 mb-3 shadow-lg">
                  <Star className="w-8 h-8 text-white mx-auto" />
                </div>
                <div className={cn(
                  `font-bold text-purple-600 dark:text-purple-400`,
                  touchMode ? "text-3xl" : "text-2xl"
                )}>
                  {member.stats.rewardsEarned}
                </div>
                <div className={cn(
                  "text-gray-600 dark:text-gray-400 font-medium",
                  touchMode ? "text-lg" : "text-base"
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
      </Card>

      {/* Benefits Modal */}
      <HabitBenefitsModal
        isOpen={!!benefitsModalHabit}
        onClose={() => setBenefitsModalHabit(null)}
        habit={benefitsModalHabit}
      />
    </>
  );
}