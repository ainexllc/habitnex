'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { Button } from '@/components/ui/Button';
import { 
  Check, 
  Edit, 
  Trash2, 
  Flame, 
  Clock,
  AlertCircle,
  Timer,
  Target
} from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { 
  calculateStreak, 
  isHabitDueToday, 
  isHabitOverdue, 
  calculateIntervalStreak,
  calculateCompletionRate 
} from '@/lib/utils';
import { formatTime } from '@/lib/timeUtils';
import { theme } from '@/lib/theme';

interface CompactHabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  showActions?: boolean;
}

export function CompactHabitCard({ habit, onEdit, showActions = true }: CompactHabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { isHabitCompleted, toggleCompletion, completions, removeHabit } = useHabits();
  const { timeFormatPreferences } = useUserPreferences();
  
  const isCompleted = isHabitCompleted(habit.id);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = habit.frequency === 'interval' 
    ? calculateIntervalStreak(habit, completions)
    : calculateStreak(habitCompletions);
  
  const completionRate = calculateCompletionRate(habitCompletions);
  const isDueToday = isHabitDueToday(habit);
  const isOverdue = isHabitOverdue(habit, completions);

  const handleToggleCompletion = async () => {
    try {
      setLoading(true);
      await toggleCompletion(habit.id, undefined, !isCompleted);
    } catch (error) {
      // Failed to toggle completion - handle silently
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
        await removeHabit(habit.id);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  // Get status styling
  const getStatusStyling = () => {
    if (isCompleted) {
      return `${theme.status.success.bg} ${theme.status.success.border}`;
    }
    if (isOverdue) {
      return `${theme.status.error.bg} ${theme.status.error.border}`;
    }
    if (isDueToday) {
      return `${theme.status.info.bg} ${theme.status.info.border}`;
    }
    return `${theme.surface.primary} ${theme.border.default}`;
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getStatusStyling()}`}>
      {/* Completion Button */}
      <Button
        size="sm"
        variant={isCompleted ? "primary" : "outline"}
        onClick={handleToggleCompletion}
        disabled={loading}
        className={`flex-shrink-0 w-9 h-9 p-0 rounded-full ${
          isCompleted 
            ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
            : 'border-2'
        }`}
      >
        {loading ? (
          <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Check className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-transparent'}`} />
        )}
      </Button>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium text-sm truncate ${
            isCompleted 
              ? `${theme.status.success.text} line-through opacity-75` 
              : theme.text.primary
          }`}>
            {habit.name}
          </h3>
          
          {/* Time indicator for interval habits */}
          {habit.frequency === 'interval' && habit.reminderTime && (
            <span className={`text-xs ${theme.status.info.bg} ${theme.status.info.text} px-2 py-0.5 rounded-full`}>
              {formatTime(new Date(`1970-01-01T${habit.reminderTime}`), timeFormatPreferences.is24Hour)}
            </span>
          )}
          
          {/* Status indicators */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isOverdue && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
            {isDueToday && !isCompleted && (
              <Clock className="w-4 h-4 text-blue-500" />
            )}
            {currentStreak > 0 && (
              <div className="flex items-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  {currentStreak}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Completion rate */}
        <div className="flex items-center gap-2 mt-1">
          <div className={`flex-1 ${theme.surface.tertiary} rounded-full h-1.5`}>
            <div 
              className={`h-1.5 rounded-full bg-blue-500 transition-all duration-300`}
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <span className={`text-xs ${theme.text.muted}`}>
            {completionRate}%
          </span>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEdit}
            className={`w-8 h-8 p-0 ${theme.text.muted} hover:text-gray-700 dark:hover:text-gray-200`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className={`w-8 h-8 p-0 ${theme.text.muted} hover:text-red-600 dark:hover:text-red-400`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}