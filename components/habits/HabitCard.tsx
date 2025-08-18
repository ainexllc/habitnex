'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Edit, Trash2, Target } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const [loading, setLoading] = useState(false);
  const { isHabitCompleted, toggleCompletion, completions, removeHabit } = useHabits();
  
  const isCompleted = isHabitCompleted(habit.id);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = calculateStreak(habitCompletions);

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: habit.color }}
            />
            <div>
              <CardTitle className="text-lg">{habit.name}</CardTitle>
              {habit.description && (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  {habit.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm">
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
                Day Streak
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                {habit.category}
              </div>
              <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                Category
              </div>
            </div>

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

          <Button
            onClick={handleToggleCompletion}
            loading={loading}
            variant={isCompleted ? "secondary" : "primary"}
            className={`${
              isCompleted 
                ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-800' 
                : ''
            }`}
          >
            <Check className={`w-4 h-4 mr-2 ${isCompleted ? 'text-success-600 dark:text-success-400' : ''}`} />
            {isCompleted ? 'Completed' : 'Mark Done'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}