'use client';

import { useState, useCallback, useEffect, useMemo, type CSSProperties, type ReactNode } from 'react';
import { FamilyMember, FamilyHabit, FamilyHabitCompletion } from '@/types/family';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useCelebrationTriggers } from '@/hooks/useCelebrationTriggers';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Circle, Star, Trophy, Zap, Check, X, RefreshCcw, Sparkles } from 'lucide-react';
import { cn, getTodayDateString } from '@/lib/utils';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { HabitBenefitsModal } from './HabitBenefitsModal';
import { MemberHistoryModal } from './MemberHistoryModal';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { Calendar as CalendarIcon } from 'lucide-react';
import { theme } from '@/lib/theme';
import { getTextureDataUrl, defaultTexturePattern, type TexturePatternId } from '@/lib/familyTextures';
import type { MemberRewardProgress } from '@/hooks/useRewardMomentum';

const parseHexColor = (hexColor: string) => {
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((char) => char + char).join('');
  }
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16)
  };
};

const colorToRgba = (hexColor: string, alpha: number) => {
  const { r, g, b } = parseHexColor(hexColor);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const svgToDataUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

type SolidGlowVariant = 'success' | 'failure' | 'reset';

const solidGlowStyles: Record<SolidGlowVariant, string> = {
  success:
    'border-emerald-500/40 bg-gradient-to-r from-emerald-400 to-lime-400 text-emerald-950 shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:brightness-105',
  failure:
    'border-rose-500/40 bg-gradient-to-r from-rose-400 to-orange-400 text-rose-950 shadow-[0_0_12px_rgba(244,63,94,0.35)] hover:brightness-105',
  reset:
    'border-slate-500/40 bg-slate-800/70 text-slate-200 hover:bg-slate-700/70 hover:text-white',
};

const SolidGlowButton = ({
  variant,
  onClick,
  disabled,
  title,
  icon,
}: {
  variant: SolidGlowVariant;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: ReactNode;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex h-6 w-8 items-center justify-center rounded-full border transition-all duration-150 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/40',
        solidGlowStyles[variant],
        disabled && 'cursor-not-allowed opacity-50 hover:brightness-100'
      )}
    >
      {icon}
    </button>
  );
};

interface WorkspaceMemberZoneProps {
  member: FamilyMember;
  habits: (FamilyHabit & { completed: boolean; todaysCompletion: FamilyHabitCompletion | null })[];
  stats: {
    completed: number;
    total: number;
    completionRate: number;
    totalPoints: number;
    pending: number;
  };
  toggleCompletion: (habitId: string, memberId: string, currentCompleted: boolean, date?: string) => Promise<void>;
  getHabitCompletion: (habitId: string, date: string, memberId?: string) => FamilyHabitCompletion | null;
  texturePattern?: TexturePatternId;
  touchMode?: boolean;
  rewardProgress?: MemberRewardProgress;
  isExpanded?: boolean;
  onExpand?: () => void;
  className?: string;
}

export function WorkspaceMemberZone({
  member,
  habits,
  stats,
  toggleCompletion,
  getHabitCompletion,
  texturePattern = defaultTexturePattern,
  touchMode = false,
  rewardProgress,
  isExpanded = false,
  onExpand,
  className
}: WorkspaceMemberZoneProps) {
  // We still need loading state from the hook, but toggleCompletion and getHabitCompletion come from props
  const { loading } = useFamilyHabits(member.id);
  const { celebratePerfectDay } = useCelebrationTriggers();
  const [celebratingHabitId, setCelebratingHabitId] = useState<string | null>(null);
  const [previousStats, setPreviousStats] = useState(member.stats);
  const [benefitsModalHabit, setBenefitsModalHabit] = useState<FamilyHabit | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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
    const todaysCompletion = getHabitCompletion(habitId, today, member.id);
    if (todaysCompletion && todaysCompletion.completed) {
      // Return success/failure based on notes, default to success
      if (todaysCompletion.notes === 'Marked as failed') {
        return 'failure';
      }
      return 'success';
    }
    return null;
  }, [habits, getHabitCompletion, today, member.id]);

  const handleHabitToggle = useCallback(async (habitId: string, currentCompleted: boolean) => {
    try {
      await toggleCompletion(habitId, member.id, currentCompleted, today);
      
      // Trigger celebration animation if completing
      if (!currentCompleted) {
        setCelebratingHabitId(habitId);
        setTimeout(() => setCelebratingHabitId(null), 2000);

        // Find the habit that was completed
        const completedHabit = habits.find(h => h.id === habitId);
        if (completedHabit) {
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
          const completedToday = habits.filter(h => getTodaysCompletionStatus(h.id) !== null).length + 1;
          if (completedToday === habits.length) {
            celebratePerfectDay(member, habits.length);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
    }
  }, [toggleCompletion, habits, member, celebratePerfectDay, getTodaysCompletionStatus]);

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
  const accentFade = colorToRgba(member.color, isLight ? 0.18 : 0.28);
  const accentLine = colorToRgba(member.color, isLight ? 0.35 : 0.45);
  const neutralSoft = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.12)';
  const neutralBold = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.18)';
  const neutralHighlight = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.08)';
  const gradientLayer = `linear-gradient(to bottom, ${member.color}E6 0%, ${member.color}99 40%, ${member.color}4D 70%, ${member.color}1A 90%, transparent 100%)`;

  // Keep the cards in sync with system theme toggles
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window === 'undefined') return;
      const htmlElement = document.documentElement;
      const bodyElement = document.body;
      const hasDarkClass = htmlElement.classList.contains('dark') || bodyElement.classList.contains('dark');
      const prefersDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
      setIsDarkMode(hasDarkClass || prefersDark);
    };

    checkDarkMode();

    if (process.env.NODE_ENV !== 'production') {
      console.log('🎨 WorkspaceMemberZone Dark Mode Detection:', {
        memberName: member.displayName,
        memberColor: member.color,
        isLightMode: isLight
      });
    }

    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => checkDarkMode();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
      observer.disconnect();
    };
  }, [isLight, member.displayName, member.color]);

  // Use the selected texture pattern from family settings
  const selectedTexture = useMemo(() => {
    return getTextureDataUrl(texturePattern, accentFade, neutralSoft, neutralBold);
  }, [texturePattern, accentFade, neutralSoft, neutralBold]);

  const cardStyle = useMemo<CSSProperties>(() => ({
    backgroundImage: selectedTexture ? `${selectedTexture}, ${gradientLayer}` : gradientLayer,
    backgroundColor: 'transparent',
    border: `2px solid ${borderColor}`,
    backdropFilter: isDarkMode && !isLight ? 'blur(12px)' : 'none',
    backgroundBlendMode: selectedTexture ? 'overlay, normal' : undefined,
    backgroundSize: selectedTexture ? '220px 220px, cover' : undefined,
    backgroundRepeat: selectedTexture ? 'repeat, no-repeat' : undefined,
    backgroundPosition: selectedTexture ? 'center, center' : undefined
  }), [selectedTexture, gradientLayer, borderColor, isDarkMode, isLight]);
  
  // No complex avatar options needed - using simple ProfileImage
 
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
      style={cardStyle}
      onClick={touchMode && onExpand ? onExpand : undefined}
    >
      {/* Member Header - Extra Compact */}
      <CardHeader className={cn(
        "pb-2",
        touchMode ? "p-4 pt-3" : "p-3 pt-2"
      )}>
        {/* Centered Avatar and Name Layout - Extra Compact */}
        <div className="flex flex-col items-center text-center mb-2">
          {/* Profile Image with Calendar Button - Smaller */}
          <div className="relative mb-2">
            {/* Calendar Button - Top Right */}
            <button
              onClick={() => setShowHistoryModal(true)}
              className="absolute -top-2 -right-2 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:scale-110 transition-all border-2"
              style={{ borderColor: member.color }}
              title="View history"
            >
              <CalendarIcon
                className="w-5 h-5"
                style={{ color: member.color }}
              />
            </button>
            <ProfileImage
              name={member.displayName}
              profileImageUrl={member.profileImageUrl}
              color={member.color}
              size={touchMode ? 80 : 64}
              showBorder={true}
              borderColor={isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}
              className="shadow-md transition-all hover:shadow-lg hover:scale-105"
              fontWeight="bold"
            />
            
            {/* Completion Badge on Avatar - Compact */}
            {completionRate === 100 && (
              <div className="absolute -top-1 -right-1">
                <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <Star className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
          </div>
          
          {/* Name and Level Info - Compact */}
          <div>
            <h3 className={cn(
              "font-bold leading-tight",
              touchMode ? "text-2xl" : "text-xl",
              textColor
            )} style={{
              fontFamily: '"Henny Penny", cursive',
              textShadow: isLight ? '0 1px 2px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.3)'
            }}>
              {member.displayName}
            </h3>
          </div>
        </div>
        
      </CardHeader>
      
      {/* Habits List - Extra Compact */}
      <CardContent className={cn(
        touchMode ? "p-3 pt-0" : "p-2 pt-0"
      )}>
        {rewardProgress && rewardProgress.focusHabits.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
            <div className="flex items-center gap-2">
              <span className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide',
                rewardProgress.today.tokenEarned
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-white/10 text-white/70'
              )}>
                {rewardProgress.today.tokenEarned ? <Check className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {rewardProgress.today.completed}/{rewardProgress.today.total} Today
              </span>
              {rewardProgress.today.missingHabitNames.length > 0 && (
                <span className="text-[10px] text-white/60">Needs {rewardProgress.today.missingHabitNames[0]}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                <Sparkles className="h-3 w-3" />
                {rewardProgress.weekly.tokens}/{rewardProgress.weekly.goal} boosts
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/60">
                {rewardProgress.focusHabits.map((habit) => habit.emoji).join(' ')}
              </span>
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          {habits.length === 0 ? (
            <div className={`text-center py-4 ${theme.text.muted}`}>
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
              
              // Debug logging
              console.log(`🎯 WorkspaceMemberZone - ${member.displayName} - ${habit.name}:`, {
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
                    "relative p-2 rounded-lg transition-all duration-200 space-y-1 overflow-hidden backdrop-blur-sm",
                    touchMode ? "p-3" : "p-2",
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
                  {/* Single Line: name and actions */}
                  <div className="flex items-center gap-2">
                    {/* Habit Name - Takes remaining space */}
                    <h4 className={cn(
                      `font-medium flex-1 ${theme.text.primary}`,
                      "!text-xs",
                      isCompleted && (status === 'failure' ? "line-through text-gray-500 dark:text-gray-400" : "line-through text-green-700 dark:text-green-400"),
                      autoFailed && "line-through text-red-500 dark:text-red-400"
                    )}
                    style={{
                      fontSize: '13px !important',
                      lineHeight: '1.2rem !important'
                    }}>
                      {habit.name}
                      {autoFailed && (
                        <span className="ml-2 text-xs text-red-600 dark:text-red-400 font-normal">
                          (Yesterday - Failed)
                        </span>
                      )}
                    </h4>

                    {/* Actions */}
                    {autoFailed ? (
                      <div className="flex items-center gap-1.5">
                        <div className="px-1.5 py-1.5 rounded-md flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-500">
                          <OpenMoji
                            emoji="😔"
                            size={20}
                            alt="Auto-failed"
                          />
                        </div>
                        <span className="text-xs text-red-600 dark:text-red-400">
                          Missed yesterday
                        </span>
                      </div>
                    ) : isCompleted ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-semibold uppercase tracking-wide',
                            status === 'failure'
                              ? 'bg-gradient-to-r from-rose-500 to-orange-400 text-rose-950'
                              : 'bg-gradient-to-r from-emerald-500 to-lime-400 text-emerald-950'
                          )}
                        >
                          {status === 'failure' ? (
                            <X className="h-3.5 w-3.5" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          <span>{status === 'failure' ? 'Missed' : 'Done'}</span>
                        </div>
                        <SolidGlowButton
                          variant="reset"
                          onClick={() => handleUndo(habit.id)}
                          disabled={loading}
                          title="Reset status"
                          icon={<RefreshCcw className="h-3.5 w-3.5" />}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <SolidGlowButton
                          variant="success"
                          onClick={() => handleHabitCompletion(habit.id, true)}
                          disabled={loading}
                          title="Mark as complete"
                          icon={<Check className="h-3.5 w-3.5" />}
                        />
                        <SolidGlowButton
                          variant="failure"
                          onClick={() => handleHabitCompletion(habit.id, false)}
                          disabled={loading}
                          title="Mark as missed"
                          icon={<X className="h-3.5 w-3.5" />}
                        />
                      </div>
                    )}
                  </div>
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

      {/* History Modal */}
      <MemberHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        member={member}
        habits={habits}
        onToggleCompletion={toggleCompletion}
        getHabitCompletion={getHabitCompletion}
      />
    </>
  );
}
