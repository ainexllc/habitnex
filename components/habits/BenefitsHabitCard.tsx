'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Check,
  Edit,
  Trash2,
  Target,
  Clock,
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Timer,
  Sparkles,
  Flame,
  X,
  ThumbsUp,
  ThumbsDown,
  Undo2
} from 'lucide-react';
import { usePersonalData } from '@/hooks/usePersonalData';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  calculateStreak, 
  isHabitDueToday, 
  getNextDueDate, 
  getDaysUntilDue, 
  isHabitOverdue, 
  calculateIntervalStreak,
  calculateCompletionRate 
} from '@/lib/utils';
import { formatTime } from '@/lib/timeUtils';

interface BenefitsHabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  compact?: boolean;
}

export function BenefitsHabitCard({ habit, onEdit, compact = false }: BenefitsHabitCardProps) {
  const [loading, setLoading] = useState(false);
  
  // Check if habit has AI enhancement data for showing expand button
  const hasAIBenefits = !!(habit.healthBenefits || habit.mentalBenefits || habit.longTermBenefits || habit.tip);
  const [expanded, setExpanded] = useState(false); // Always start collapsed
  const [showDetails, setShowDetails] = useState(false); // Controls showing all extra details
  const [completionStatus, setCompletionStatus] = useState<'success' | 'failure' | null>(null); // Track completion state
  const [isCompletingAnimation, setIsCompletingAnimation] = useState(false); // Track completion animation
  const [justCompleted, setJustCompleted] = useState(false); // Track if habit was just completed
  
  const { isHabitCompleted, completions, removeHabit, getHabitCompletion, toggleCompletion } = usePersonalData();
  const { timeFormatPreferences } = useUserPreferences();
  
  const isCompleted = isHabitCompleted(habit.id);
  
  // Load completion status from notes when component mounts or completion changes
  useEffect(() => {
    const todayCompletion = getHabitCompletion(habit.id);
    if (todayCompletion && todayCompletion.completed) {
      if (todayCompletion.notes === 'Marked as failed') {
        setCompletionStatus('failure');
      } else if (todayCompletion.notes === 'Completed successfully') {
        setCompletionStatus('success');
      }
    } else {
      setCompletionStatus(null);
    }
  }, [habit.id, completions, getHabitCompletion]);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = habit.frequency === 'interval' 
    ? calculateIntervalStreak(habit, completions)
    : calculateStreak(habitCompletions);
  
  const completionRate = calculateCompletionRate(habitCompletions);
  const isDueToday = isHabitDueToday(habit);
  const isOverdue = isHabitOverdue(habit, completions);
  const nextDueDate = getNextDueDate(habit);
  const daysUntilDue = getDaysUntilDue(habit);

  const handleCompletion = async (success: boolean) => {
    try {
      setLoading(true);
      setIsCompletingAnimation(true);
      setJustCompleted(true);
      
      // Always mark as completed (true), but track success/failure separately
      await toggleCompletion(habit.id, undefined, true, success ? 'Completed successfully' : 'Marked as failed');
      setCompletionStatus(success ? 'success' : 'failure');
      
      // After 2 seconds, allow the habit to move to completed section
      setTimeout(() => {
        setIsCompletingAnimation(false);
        // The habit will now move to "Completed Today" section via the dashboard logic
      }, 2000);
      
    } catch (error) {
      // Failed to toggle completion - handle silently
      setIsCompletingAnimation(false);
      setJustCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = async () => {
    try {
      setLoading(true);
      // Toggle back to uncompleted
      await toggleCompletion(habit.id, undefined, false);
      setCompletionStatus(null);
    } catch (error) {
      // Failed to undo - handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(habit);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        setLoading(true);
        await removeHabit(habit.id);
        // The habit will be removed from the list automatically
        // when the habits state is updated in the useHabits hook
      } catch (error) {
        // Failed to delete habit - you could add a toast notification here for better UX
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-400/50 bg-white dark:bg-gray-800';
    if (isOverdue) return 'border-red-400/50 bg-white dark:bg-gray-800';
    if (isDueToday) return 'border-blue-400/50 bg-white dark:bg-gray-800';
    return 'border-gray-200 dark:border-gray-600/50 bg-white dark:bg-gray-800';
  };

  const getStreakColor = () => {
    if (currentStreak >= 21) return 'text-purple-600 dark:text-purple-400';
    if (currentStreak >= 7) return 'text-green-600 dark:text-green-400';
    if (currentStreak >= 3) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Removed completion rate color function as percentage is no longer displayed

  // Collapsed view for simpler presentation
  if (!showDetails) {
    return (
      <Card className={`group hover:shadow-lg transition-all duration-300 ${getStatusColor()} border-2 relative overflow-hidden ${
        isCompletingAnimation ? 'animate-pulse ring-2 ring-green-400 bg-green-50/50 dark:bg-green-950/30' : ''
      }`}>
        <div className="p-4 space-y-3">
          {/* Completion Animation Overlay */}
          {isCompletingAnimation && (
            <div className="absolute inset-0 bg-green-500/10 border-2 border-green-400 rounded-lg flex items-center justify-center z-10">
              <div className="text-green-600 font-semibold text-lg animate-bounce">
                ✨ Completing... ✨
              </div>
            </div>
          )}
          {/* First Line: Expand Arrow, Habit Name, and Streak */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDetails(true)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
              aria-label="Expand details"
            >
              <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200" />
            </button>
            
            <h3 className={`text-lg font-semibold flex-1 truncate transition-all duration-300 ${
              isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
            }`} title={habit.name}>
              {habit.name}
            </h3>

            {/* Quick stats */}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className={`w-4 h-4 ${getStreakColor()}`} />
                <span className={`font-semibold text-sm ${getStreakColor()}`}>{currentStreak}</span>
              </div>
            )}
          </div>

          {/* Second Line: Completion Buttons */}
          <div className="flex justify-end items-center gap-2">
            {isDueToday || isOverdue ? (
              isCompleted ? (
                <div className="flex items-center gap-2">
                  <div className={`px-4 py-2 rounded-lg font-medium text-white ${
                    completionStatus === 'success' ? 'animate-button-merge animate-celebrate' : 
                    completionStatus === 'failure' ? 'animate-button-merge' : ''
                  } transition-all duration-300 ${
                    completionStatus === 'failure' 
                      ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-500'
                  }`}>
                    {completionStatus === 'success' ? '🎉 Done!' : 
                     completionStatus === 'failure' ? '😔 Failed' : 
                     '✅ Completed'}
                  </div>
                  <Button
                    onClick={handleUndo}
                    size="sm"
                    variant="outline"
                    className="hover:scale-105 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Undo"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCompletion(true)}
                    loading={loading}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Completed
                  </Button>
                  <Button
                    onClick={() => handleCompletion(false)}
                    loading={loading}
                    size="sm"
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Failed
                  </Button>
                </div>
              )
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                Not due
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full expanded view (original design)
  return (
          <Card className={`group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 ${getStatusColor()} border-2 relative ${
            isCompletingAnimation ? 'animate-pulse ring-2 ring-green-400 bg-green-50/50 dark:bg-green-950/30' : ''
          }`}>
      {/* Permanent gradient overlay - always visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      {/* Enhanced gradient overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 via-purple-50/20 to-pink-50/20 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Completion Animation Overlay */}
      {isCompletingAnimation && (
        <div className="absolute inset-0 bg-green-500/10 border-2 border-green-400 rounded-lg flex items-center justify-center z-20">
          <div className="text-green-600 font-semibold text-xl animate-bounce">
            ✨ Completing... Moving to Completed Today! ✨
          </div>
        </div>
      )}

      {/* Top motivational badge */}
      {!isCompleted && currentStreak > 0 && (
        <div className="absolute -top-2 left-4 z-20">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Flame className="w-3 h-3" />
            {currentStreak} Day Streak!
          </div>
        </div>
      )}

      <CardHeader className="pb-3 relative">
        {/* Collapse button at the top */}
        <button
          onClick={() => setShowDetails(false)}
          className="absolute top-3 left-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 z-10"
          aria-label="Collapse details"
        >
          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
        
        {/* Top Row: Title, Status, Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 min-w-0">
            <div className="flex-1 min-w-0 pl-12 pt-2">
              <h3 className={`task-title text-lg font-bold truncate transition-all duration-300 mt-2 ${
                isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
              }`} title={habit.name}>
                {habit.name}
              </h3>
              {habit.description && (
                <p className={`task-description text-sm mt-2 transition-all duration-300 ${
                  isCompleted
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                }`}>
                  {habit.description}
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={loading}
              className="p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 rounded-lg"
            >
              {loading ? (
                <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Compact Stats Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50 bg-gradient-to-r from-gray-50/40 to-blue-50/20 dark:from-gray-800/40 dark:to-blue-900/10 rounded-lg px-3 py-2 -mx-1 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500 rounded-full blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-12 h-12 bg-purple-500 rounded-full blur-lg"></div>
          </div>

          {/* Left side: Day Streak */}
          <div className="flex items-center gap-4 relative z-10">
            {/* Day Streak */}
            <div className="flex items-center gap-2 group/stat">
              <div className="flex items-center gap-1">
                <span className="text-lg">🔥</span>
                <div className={`text-xl font-bold transition-all duration-300 ${getStreakColor()} group-hover/stat:scale-110`}>
                  {currentStreak}
                </div>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Day Streak</span>
            </div>
          </div>

          {/* Right side: View Benefits button */}
          {(habit.healthBenefits || habit.mentalBenefits || habit.longTermBenefits || habit.tip) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-1.5 text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-3 py-1.5 border border-gray-200/50 dark:border-gray-600/50 bg-gradient-to-r from-primary-50/60 to-blue-50/60 dark:from-primary-950/20 dark:to-blue-950/20 rounded-full transition-all duration-300 hover:shadow-sm hover:scale-105 relative z-10"
            >
              <span className="font-medium">{expanded ? 'Hide' : 'View'} Benefits</span>
              <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Enhanced Benefits Preview - Only show when expanded */}
        {expanded && (
          <div className="space-y-3 mb-4 animate-in slide-in-from-top duration-300">
            {habit.healthBenefits && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-red-50/90 to-pink-50/90 dark:from-red-950/40 dark:to-pink-950/40 rounded-xl border border-red-200/60 dark:border-red-800/60 hover:shadow-md transition-all duration-300 group/benefit">
                <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/60 dark:to-pink-900/60 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover/benefit:scale-110 transition-transform duration-300">
                  <Heart className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">💪 Health Benefits</p>
                    <div className="h-1 flex-1 bg-gradient-to-r from-red-200 to-pink-200 dark:from-red-800 dark:to-pink-800 rounded-full">
                      <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full w-3/4"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                    {habit.healthBenefits}
                  </p>
                </div>
              </div>
            )}

            {habit.mentalBenefits && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50/90 to-cyan-50/90 dark:from-blue-950/40 dark:to-cyan-950/40 rounded-xl border border-blue-200/60 dark:border-blue-800/60 hover:shadow-md transition-all duration-300 group/benefit">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/60 dark:to-cyan-900/60 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover/benefit:scale-110 transition-transform duration-300">
                  <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-300">🧠 Mental Benefits</p>
                    <div className="h-1 flex-1 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 rounded-full">
                      <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full w-4/5"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                    {habit.mentalBenefits}
                  </p>
                </div>
              </div>
            )}

            {habit.longTermBenefits && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-950/40 dark:to-emerald-950/40 rounded-xl border border-green-200/60 dark:border-green-800/60 hover:shadow-md transition-all duration-300 group/benefit">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/60 dark:to-emerald-900/60 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover/benefit:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-green-700 dark:text-green-300">🚀 Long-term Impact</p>
                    <div className="h-1 flex-1 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-800 dark:to-emerald-800 rounded-full">
                      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-2/3"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                    {habit.longTermBenefits}
                  </p>
                </div>
              </div>
            )}

            {habit.tip && (
              <div className="flex items-start space-x-3 p-4 bg-gradient-to-r from-yellow-50/90 to-orange-50/90 dark:from-yellow-950/40 dark:to-orange-950/40 rounded-xl border border-yellow-200/60 dark:border-yellow-800/60 hover:shadow-md transition-all duration-300 group/benefit">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/60 dark:to-orange-900/60 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover/benefit:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-bold text-yellow-700 dark:text-yellow-300">💡 Pro Tip</p>
                    <div className="h-1 flex-1 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800 rounded-full">
                      <div className="h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                    {habit.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}


        {/* Enhanced Bottom Action Area */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200/60 dark:border-gray-600/60 bg-gradient-to-r from-gray-50/30 to-transparent dark:from-gray-800/30 rounded-lg p-4 -mx-2 -mb-2">
          {/* Schedule Info with enhanced styling */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            {isDueToday || isOverdue ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  {isOverdue ? 'Overdue' : 'Due Today'}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 rounded-full">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  {habit.frequency === 'interval' && nextDueDate
                    ? `Next: ${daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}${
                        habit.reminderTime
                          ? ` (${formatTime(new Date(`1970-01-01T${habit.reminderTime}`), timeFormatPreferences.is24Hour)})`
                          : ''
                      }`
                    : 'Not due today'
                  }
                </span>
              </div>
            )}

            {habit.tags && habit.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full font-medium">
                  #{habit.tags[0]}
                  {habit.tags.length > 1 && ` +${habit.tags.length - 1}`}
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Completion Buttons */}
          {isDueToday || isOverdue ? (
            isCompleted ? (
              <div className="flex items-center gap-3">
                <div className={`px-6 py-2.5 rounded-full font-bold text-white ${
                  completionStatus === 'success' ? 'animate-button-merge animate-celebrate' : 
                  completionStatus === 'failure' ? 'animate-button-merge' : ''
                } transition-all duration-500 transform shadow-lg ${
                  completionStatus === 'failure'
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600 shadow-gray-500/25'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/25'
                }`}>
                  {completionStatus === 'success' ? '🎉 Congratulations!' : 
                   completionStatus === 'failure' ? '😔 Bummer!' : 
                   '✅ Completed Today'}
                </div>
                <Button
                  onClick={handleUndo}
                  size="sm"
                  variant="outline"
                  className="group/btn relative overflow-hidden bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 shadow-md"
                  title="Undo completion"
                >
                  <div className="absolute inset-0 bg-red-100/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <Undo2 className="w-4 h-4 mr-1.5 relative z-10" />
                  <span className="relative z-10 font-medium">Undo</span>
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCompletion(true)}
                  loading={loading}
                  size="sm"
                  className="group/btn relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <ThumbsUp className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">Completed</span>
                </Button>
                <Button
                  onClick={() => handleCompletion(false)}
                  loading={loading}
                  size="sm"
                  className="group/btn relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <ThumbsDown className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10 font-medium">Failed</span>
                </Button>
              </div>
            )
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
              Not scheduled
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}