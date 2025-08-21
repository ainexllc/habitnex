'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Edit, Trash2, Target, Clock, Calendar } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak, isHabitDueToday, getNextDueDate, getDaysUntilDue, isHabitOverdue, calculateIntervalStreak } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

export function HabitCard({ habit, onEdit }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { isHabitCompleted, toggleCompletion, completions, removeHabit } = useHabits();
  
  const isCompleted = isHabitCompleted(habit.id);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = habit.frequency === 'interval' 
    ? calculateIntervalStreak(habit, completions)
    : calculateStreak(habitCompletions);
  
  // Check if habit is due today or overdue
  const isDueToday = isHabitDueToday(habit);
  const isOverdue = isHabitOverdue(habit, completions);
  const nextDueDate = getNextDueDate(habit);
  const daysUntilDue = getDaysUntilDue(habit);

  const handleToggleCompletion = async () => {
    try {
      setLoading(true);
      await toggleCompletion(habit.id, undefined, !isCompleted);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
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

  return (
    <Card className={`hover:shadow-md transition-all duration-300 ${
      !isDueToday && !isOverdue ? 'opacity-75 border-dashed' : ''
    } ${
      isCompleted ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 opacity-80' : ''
    } ${
      isOverdue && !isCompleted ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
            <div>
              <CardTitle className={`task-title text-sm font-task-title truncate transition-all duration-300 ${
                isCompleted ? 'line-through text-text-muted-light dark:text-text-muted-dark' : 'text-gray-900 dark:text-white'
              }`} title={habit.name}>
                {habit.name}
              </CardTitle>
              {habit.description && (
                <p className={`task-description text-sm font-task-description mt-1 transition-all duration-300 ${
                  isCompleted 
                    ? 'line-through text-text-muted-light dark:text-text-muted-dark' 
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {habit.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-error-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {currentStreak}
              </div>
              <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                {habit.frequency === 'interval' ? 'Streak' : 'Day Streak'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                {habit.frequency === 'interval' 
                  ? `Every ${habit.intervalDays} days`
                  : (habit.tags && habit.tags.length > 0 
                    ? habit.tags.slice(0, 2).map(tag => `#${tag}`).join(' ')
                    : ((habit as any).category || 'No tags')
                  )
                }
              </div>
              <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                {habit.frequency === 'interval' ? 'Frequency' : 'Tags'}
              </div>
            </div>

            {/* Next due date for interval habits */}
            {habit.frequency === 'interval' && !isDueToday && nextDueDate && (
              <div className="text-center">
                <div className="flex items-center text-sm text-warning-600 dark:text-warning-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {daysUntilDue === 0 ? 'Today' : `${daysUntilDue} days`}
                </div>
                <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                  Next due
                </div>
              </div>
            )}

            {habit.goal && (
              <div className="text-center">
                <div className="flex items-center text-sm text-warning-600 dark:text-warning-400">
                  <Target className="w-3 h-3 mr-1" />
                  {habit.goal.target}
                </div>
                <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                  {habit.goal.period} goal
                </div>
              </div>
            )}
          </div>

          {isDueToday || isOverdue ? (
            <Button
              onClick={handleToggleCompletion}
              loading={loading}
              variant={isCompleted ? "secondary" : "primary"}
              className={`${
                isCompleted 
                  ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-800' 
                  : isOverdue 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : ''
              }`}
            >
              <Check className={`w-4 h-4 mr-2 ${isCompleted ? 'text-success-600 dark:text-success-400' : ''}`} />
              {isCompleted ? 'Completed' : isOverdue ? 'Overdue - Mark Done' : 'Mark Done'}
            </Button>
          ) : (
            <div className="text-center">
              <div className="text-sm text-text-muted-light dark:text-text-muted-dark">
                {habit.frequency === 'interval' 
                  ? `Next due: ${nextDueDate ? new Date(nextDueDate).toLocaleDateString() : 'Not scheduled'}`
                  : 'Not due today'
                }
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}