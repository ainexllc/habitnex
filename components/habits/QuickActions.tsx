'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHabits } from '@/hooks/useHabits';
import { CheckSquare, Square } from 'lucide-react';

export function QuickActions() {
  const { habits, isHabitCompleted, toggleCompletion } = useHabits();
  const [loadingHabits, setLoadingHabits] = useState<Set<string>>(new Set());

  const handleToggle = async (habitId: string) => {
    const isCompleted = isHabitCompleted(habitId);
    
    setLoadingHabits(prev => new Set([...prev, habitId]));
    
    try {
      await toggleCompletion(habitId, undefined, !isCompleted);
    } catch (error) {
      console.error('Failed to toggle habit:', error);
    } finally {
      setLoadingHabits(prev => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  if (habits.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {habits.map(habit => {
            const isCompleted = isHabitCompleted(habit.id);
            const isLoading = loadingHabits.has(habit.id);

            return (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border-light dark:border-border-dark hover:bg-secondary-50 dark:hover:bg-secondary-900 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className={`text-sm ${
                    isCompleted 
                      ? 'text-text-secondary-light dark:text-text-secondary-dark line-through' 
                      : 'text-text-primary-light dark:text-text-primary-dark'
                  }`}>
                    {habit.name}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(habit.id)}
                  disabled={isLoading}
                  className={`p-1 ${isCompleted ? 'text-success-600 dark:text-success-400' : 'text-text-muted-light dark:text-text-muted-dark'}`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isCompleted ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}