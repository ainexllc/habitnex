'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { 
  Check, 
  Edit, 
  Trash2, 
  Hash, 
  Flame, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ListViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

export function ListView({ habits, onEdit }: ListViewProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { 
    isHabitCompleted, 
    toggleCompletion, 
    completions, 
    removeHabit 
  } = useHabits();

  const handleToggleCompletion = async (habitId: string) => {
    try {
      setLoading(habitId);
      const currentStatus = isHabitCompleted(habitId);
      await toggleCompletion(habitId, undefined, !currentStatus);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (habit: Habit) => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      try {
        await removeHabit(habit.id);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  const getHabitStatus = (habit: Habit) => {
    const isDue = isHabitDueToday(habit);
    const isOverdue = isHabitOverdue(habit, completions);
    const isCompleted = isHabitCompleted(habit.id);
    
    if (isCompleted) return 'completed';
    if (isOverdue) return 'overdue';
    if (isDue) return 'due';
    return 'upcoming';
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'overdue':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      case 'due':
        return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
      case 'upcoming':
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 opacity-75';
      default:
        return 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No habits found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first habit to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {habits.map((habit) => {
        const status = getHabitStatus(habit);
        const isCompleted = status === 'completed';
        const streak = calculateStreak(completions.filter(c => c.habitId === habit.id));
        const isLoading = loading === habit.id;

        return (
          <div
            key={habit.id}
            className={`group border rounded-lg p-4 transition-all duration-200 ${getStatusStyles(status)}`}
          >
            <div className="flex items-center gap-4">
              {/* Completion Checkbox */}
              <button
                onClick={() => handleToggleCompletion(habit.id)}
                disabled={isLoading}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLoading ? (
                  <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : null}
              </button>

              {/* Color Indicator */}
              <div
                className="flex-shrink-0 w-3 h-3 rounded-full"
                style={{ backgroundColor: habit.color }}
              />

              {/* Habit Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`task-title font-task-title transition-all ${
                      isCompleted 
                        ? 'line-through text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {habit.name}
                    </h3>
                    {habit.description && (
                      <p className={`task-description font-task-description text-sm mt-1 transition-all ${
                        isCompleted 
                          ? 'line-through text-gray-400 dark:text-gray-500' 
                          : 'text-gray-600 dark:text-gray-300'
                      }`}>
                        {habit.description}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(habit)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(habit)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {/* Streak */}
                  <div className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>{streak} day{streak !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Frequency */}
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {habit.frequency === 'daily' 
                        ? 'Daily' 
                        : habit.frequency === 'weekly' 
                        ? 'Weekly' 
                        : `Every ${habit.intervalDays} days`
                      }
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {status === 'overdue' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>Overdue</span>
                    </div>
                  )}

                  {/* Tags */}
                  {habit.tags && habit.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      <span className="truncate">
                        {habit.tags.slice(0, 2).join(', ')}
                        {habit.tags.length > 2 && ` +${habit.tags.length - 2}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}