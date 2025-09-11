'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { FamilyMember, FamilyHabit, FamilyHabitCompletion } from '@/types/family';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useCelebrationTriggers } from '@/hooks/useCelebrationTriggers';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { VisualFeedback, FeedbackButton } from '@/components/celebration/VisualFeedback';
import { CheckCircle2, Circle, Star, Trophy, Zap, Users, Check, X, Undo2, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn, getTodayDateString } from '@/lib/utils';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { HabitBenefitsModal } from './HabitBenefitsModal';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { theme } from '@/lib/theme';

interface FamilyMemberZoneProps {
  member: FamilyMember;
  habits: (FamilyHabit & { completed: boolean; todaysCompletion: FamilyHabitCompletion | null })[];
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
  const today = getTodayDateString();

  // Check actual database completion status for today
  const getTodaysCompletionStatus = useCallback((habitId: string) => {
    // First check if the habit has todaysCompletion data from the hook
    const habit = habits.find(h => h.id === habitId);
    if (habit?.todaysCompletion && habit.todaysCompletion.completed) {
      // Return success/failure based on notes, default to success
      if (habit.todaysCompletion.notes === 'Marked as failed') {
        return 'failure';
      }
      return 'success';
    }
    
    // Fallback to direct database query if needed
    const todaysCompletion = getHabitCompletion(habitId, today);
    if (todaysCompletion && todaysCompletion.completed) {
      // Return success/failure based on notes, default to success
      if (todaysCompletion.notes === 'Marked as failed') {
        return 'failure';
      }
      return 'success';
    }
    return null;
  }, [habits, getHabitCompletion, today]);
  
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
      // Check current completion status for TODAY specifically
      const currentCompletion = getTodaysCompletionStatus(habitId);
      const isCurrentlyCompleted = currentCompletion !== null;
      
      console.log(`🎯 DEBUG handleHabitCompletion: habitId=${habitId}, success=${success}, isCurrentlyCompleted=${isCurrentlyCompleted}, currentCompletion=${currentCompletion}`);

      // If not completed, mark as completed with appropriate notes
      if (!isCurrentlyCompleted) {
        const notes = success ? 'Completed successfully' : 'Marked as failed';
        // Pass the actual current completion status instead of hardcoding false
        await toggleCompletion(habitId, member.id, isCurrentlyCompleted, today, notes);
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
      // Check if currently completed for TODAY
      const currentCompletion = getTodaysCompletionStatus(habitId);
      const isCurrentlyCompleted = currentCompletion !== null;
      
      console.log(`↩️ DEBUG handleUndo: habitId=${habitId}, isCurrentlyCompleted=${isCurrentlyCompleted}`);

      // If completed, toggle to uncompleted
      if (isCurrentlyCompleted) {
        await toggleCompletion(habitId, member.id, isCurrentlyCompleted, today); // Pass correct current state
      }
    } catch (error) {
      console.error('Failed to undo habit:', error);
    }
  }, [toggleCompletion, member.id, getTodaysCompletionStatus, today]);
  
  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
  const level = Math.floor(member.stats.totalPoints / 100) + 1; // Level up every 100 points
  const pointsToNextLevel = 100 - (member.stats.totalPoints % 100);
  
  // Helper function to determine if a color is light or dark
  const isLightColor = (color: string): boolean => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  const isLight = isLightColor(member.color);
  const textColor = isLight ? 'text-gray-900' : 'text-white';
  const mutedTextColor = isLight ? 'text-gray-700' : 'text-gray-200';
  const borderColor = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
  
  // No complex avatar options needed - using simple ProfileImage
  
  // Check if we're in dark mode - improved detection
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check for dark mode class on document or body
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;
        const hasDarkClass = htmlElement.classList.contains('dark') || bodyElement.classList.contains('dark');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(hasDarkClass || prefersDark);
      }
    };

    checkDarkMode();
    console.log('🎨 FamilyMemberZone Dark Mode Detection:', { isDarkMode, memberName: member.displayName, memberColor: member.color, isLight });
    
    // Listen for theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const observer = new MutationObserver(checkDarkMode);
      
      mediaQuery.addListener(checkDarkMode);
      observer.observe(document.documentElement, { 
        attributes: true, 
        attributeFilter: ['class'] 
      });
      
      return () => {
        mediaQuery.removeListener(checkDarkMode);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <>
      <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]",
        touchMode && "touch-optimized shadow-2xl",
        isExpanded && touchMode && "scale-105 shadow-2xl z-10",
        "rounded-3xl",
        className
      )}
      style={{ 
        backgroundColor: `${member.color}D9`,
        backgroundImage: 'none',
        border: `2px solid ${borderColor}`,
        backdropFilter: isDarkMode && !isLight ? 'blur(12px)' : 'none'
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
          {/* Large Profile Image */}
          <div className="relative mb-4">
            <ProfileImage
              name={member.displayName}
              profileImageUrl={member.profileImageUrl}
              color={member.color}
              size={touchMode ? 120 : 96}
              showBorder={true}
              borderColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
              className="shadow-lg transition-all hover:shadow-xl hover:scale-105"
              fontWeight="bold"
            />
            
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
              touchMode ? "text-4xl" : "text-3xl",
              textColor
            )} style={{
              fontFamily: '"Henny Penny", cursive',
              textShadow: isLight ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {member.displayName}
            </h3>
            
            {/* Level and Points Info */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm",
                isLight ? "bg-black/10" : (isDarkMode ? "bg-white/5" : "bg-white/20")
              )}>
                <Star className="w-5 h-5 text-yellow-400" />
                <span className={cn(
                  "font-bold",
                  touchMode ? "text-lg" : "text-base",
                  textColor
                )}>
                  Level {level}
                </span>
              </div>
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm",
                isLight ? "bg-black/10" : (isDarkMode ? "bg-white/5" : "bg-white/20")
              )}>
                <Trophy className="w-5 h-5 text-purple-400" />
                <span className={cn(
                  "font-bold",
                  touchMode ? "text-lg" : "text-base",
                  textColor
                )}>
                  {member.stats.totalPoints} pts
                </span>
              </div>
            </div>
            
            {/* Daily Completion Status */}
            <div className="flex items-center justify-center">
              <div className={cn(
                "px-6 py-3 rounded-full font-bold shadow-md text-white",
                touchMode ? "text-xl" : "text-lg",
                completionRate === 100 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
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
                "font-semibold",
                touchMode ? "text-lg" : "text-base",
                mutedTextColor
              )}>
                Today's Progress
              </span>
              <span className={cn(
                "font-bold",
                touchMode ? "text-lg" : "text-base",
                textColor
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
                backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'),
              }}
            />
          </div>
          
          {/* Level Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className={cn(
                "font-semibold",
                touchMode ? "text-lg" : "text-base",
                mutedTextColor
              )}>
                Level Progress
              </span>
              <span className={cn(
                "font-bold",
                touchMode ? "text-lg" : "text-base",
                textColor
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
                backgroundColor: isLight ? 'rgba(0,0,0,0.1)' : (isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)'),
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
              const hasExpandableContent = Boolean(
                (habit.description && habit.description.trim().length > 0) ||
                (habit as any).healthBenefits || (habit as any).mentalBenefits || (habit as any).longTermBenefits || (habit as any).successTips
              );
              
              // Debug logging
              console.log(`🎯 FamilyMemberZone - ${member.displayName} - ${habit.name}:`, {
                habitCompleted: habit.completed,
                status,
                isCompleted,
                todaysCompletion: habit.todaysCompletion,
                today
              });
              
              // Check if this is an incomplete task from yesterday
              const isFromYesterday = habit.yesterdayStatus === 'incomplete';
              const autoFailed = isFromYesterday && !isCompleted;
              
              return (
                <div
                  key={habit.id}
                  className={cn(
                    "relative p-3 rounded-lg transition-all duration-200 space-y-3 overflow-hidden backdrop-blur-sm",
                    touchMode ? "p-4" : "p-3",
                    isCompleted 
                      ? "bg-green-50/50 dark:bg-green-950/10 border border-green-200/50 dark:border-green-800/30" 
                      : autoFailed
                      ? "bg-red-50/30 dark:bg-red-950/10 border border-red-200/50 dark:border-red-800/30"
                      : `${theme.surface.secondary} ${theme.surface.hover} border ${theme.border.default}`,
                    celebratingHabitId === habit.id && "animate-pulse bg-yellow-100 border-yellow-300",
                    loading && "opacity-50 pointer-events-none"
                  )}
                >
                  {/* Celebration SVG Background - Only show when completed */}
                  {isCompleted && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {/* Confetti pieces */}
                      <svg className="absolute w-full h-full opacity-20" viewBox="0 0 200 60" preserveAspectRatio="none">
                        <g className="animate-pulse">
                          {/* Star bursts */}
                          <path d="M20,15 L22,10 L24,15 L29,13 L24,17 L26,22 L20,18 L14,22 L16,17 L11,13 Z" 
                                fill={status === 'success' ? '#10b981' : '#6b7280'} opacity="0.3"/>
                          <path d="M170,25 L172,20 L174,25 L179,23 L174,27 L176,32 L170,28 L164,32 L166,27 L161,23 Z" 
                                fill={status === 'success' ? '#34d399' : '#9ca3af'} opacity="0.25"/>
                          
                          {/* Confetti rectangles */}
                          <rect x="40" y="10" width="3" height="8" fill="#fbbf24" opacity="0.4" transform="rotate(25 41.5 14)" className="animate-bounce" style={{animationDelay: '0.1s'}}/>
                          <rect x="60" y="35" width="3" height="8" fill="#f59e0b" opacity="0.3" transform="rotate(-15 61.5 39)" className="animate-bounce" style={{animationDelay: '0.3s'}}/>
                          <rect x="90" y="15" width="3" height="8" fill="#ec4899" opacity="0.35" transform="rotate(45 91.5 19)" className="animate-bounce" style={{animationDelay: '0.2s'}}/>
                          <rect x="120" y="30" width="3" height="8" fill="#8b5cf6" opacity="0.3" transform="rotate(-30 121.5 34)" className="animate-bounce" style={{animationDelay: '0.4s'}}/>
                          <rect x="150" y="8" width="3" height="8" fill="#3b82f6" opacity="0.4" transform="rotate(60 151.5 12)" className="animate-bounce" style={{animationDelay: '0.15s'}}/>
                          
                          {/* Circles */}
                          <circle cx="30" cy="40" r="2" fill="#ef4444" opacity="0.3" className="animate-ping"/>
                          <circle cx="80" cy="35" r="2" fill="#10b981" opacity="0.35" className="animate-ping" style={{animationDelay: '0.5s'}}/>
                          <circle cx="140" cy="42" r="2" fill="#f59e0b" opacity="0.3" className="animate-ping" style={{animationDelay: '0.25s'}}/>
                          <circle cx="185" cy="15" r="2" fill="#6366f1" opacity="0.35" className="animate-ping" style={{animationDelay: '0.35s'}}/>
                          
                          {/* Streamers */}
                          <path d="M10,5 Q15,15 10,25 T10,45" stroke="#14b8a6" strokeWidth="1" fill="none" opacity="0.2" className="animate-pulse"/>
                          <path d="M190,5 Q185,15 190,25 T190,45" stroke="#f43f5e" strokeWidth="1" fill="none" opacity="0.2" className="animate-pulse" style={{animationDelay: '0.3s'}}/>
                        </g>
                      </svg>
                      
                      {/* Success specific graphics */}
                      {status === 'success' && (
                        <svg className="absolute -right-8 -top-8 w-32 h-32 opacity-10 animate-spin" style={{animationDuration: '20s'}}>
                          <path d="M64,16 L72,40 L96,40 L76,56 L84,80 L64,64 L44,80 L52,56 L32,40 L56,40 Z" 
                                fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                        </svg>
                      )}
                      
                      {/* Sparkles animation */}
                      <div className="absolute inset-0">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute animate-pulse"
                            style={{
                              left: `${15 + i * 25}%`,
                              top: `${20 + (i % 2) * 40}%`,
                              animationDelay: `${i * 0.2}s`,
                              animationDuration: '2s'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16">
                              <path d="M8,0 L10,6 L16,8 L10,10 L8,16 L6,10 L0,8 L6,6 Z" 
                                    fill={status === 'success' ? '#10b981' : '#6b7280'} 
                                    opacity="0.2"/>
                            </svg>
                          </div>
                        ))}
                      </div>
                      
                      {/* Gradient overlay for depth */}
                      <div className={cn(
                        "absolute inset-0",
                        status === 'success' 
                          ? "bg-gradient-to-br from-green-400/5 via-transparent to-emerald-400/5"
                          : "bg-gradient-to-br from-gray-400/5 via-transparent to-gray-400/5"
                      )}/>
                    </div>
                  )}
                  {/* Single Line: Expand, name, and actions */}
                  <div className="flex items-center gap-2">
                    {/* Expand/Collapse Button (only if there is content to expand) */}
                    {hasExpandableContent && (
                      <button
                        onClick={() => toggleHabitExpanded(habit.id)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200 hover:scale-110 flex-shrink-0"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </button>
                    )}
                    
                    {/* Habit Name - Takes remaining space */}
                    <h4 className={cn(
                      `font-semibold flex-1 ${theme.text.primary}`,
                      touchMode ? "text-lg" : "text-base",
                      isCompleted && (status === 'failure' ? "line-through text-gray-500 dark:text-gray-400" : "line-through text-green-700 dark:text-green-400"),
                      autoFailed && "line-through text-red-500 dark:text-red-400"
                    )}>
                      {habit.name}
                      {autoFailed && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-normal">
                          (Yesterday - Failed)
                        </span>
                      )}
                    </h4>

                    {/* Actions */}
                    {autoFailed ? (
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-2 rounded-lg flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500">
                          <OpenMoji 
                            emoji="😔" 
                            size={24}
                            alt="Auto-failed"
                          />
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Missed yesterday
                        </span>
                      </div>
                    ) : isCompleted ? (
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
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-bold rounded">
                          <span>{habit.basePoints || 10}</span>
                          <span>pts</span>
                        </div>
                        <Button
                          onClick={() => handleHabitCompletion(habit.id, true)}
                          loading={loading}
                          size="sm"
                          className="w-8 h-8 p-0 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-200 hover:scale-110 rounded-full flex-shrink-0"
                          title="Mark as completed"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleHabitCompletion(habit.id, false)}
                          loading={loading}
                          size="sm"
                          className="w-8 h-8 p-0 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-200 hover:scale-110 rounded-full flex-shrink-0"
                          title="Mark as failed"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                  
                  {/* Expanded Details Section */}
                  {hasExpandableContent && isExpanded && (
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