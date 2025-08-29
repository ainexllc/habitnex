'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useHabits } from '@/hooks/useHabits';
import { isHabitDueToday } from '@/lib/utils';
import { CheckSquare, Square } from 'lucide-react';
import { theme } from '@/lib/theme';

export function QuickActions() {
  const { habits, isHabitCompleted, toggleCompletion } = useHabits();
  const [loadingHabits, setLoadingHabits] = useState<Set<string>>(new Set());

  // Only show habits that are due today in quick actions
  const todayHabits = useMemo(() => {
    return habits.filter(habit => isHabitDueToday(habit));
  }, [habits]);

  const handleToggle = async (habitId: string) => {
    const isCompleted = isHabitCompleted(habitId);
    
    setLoadingHabits(prev => new Set([...Array.from(prev), habitId]));
    
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

  if (todayHabits.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {todayHabits.map(habit => {
            const isCompleted = isHabitCompleted(habit.id);
            const isLoading = loadingHabits.has(habit.id);

            return (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${theme.border.default} ${theme.surface.hover} transition-colors`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habit.color }}
                  />
                  <span className={`text-sm ${
                    isCompleted 
                      ? `${theme.text.secondary} line-through` 
                      : theme.text.primary
                  }`}>
                    {habit.name}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggle(habit.id)}
                  disabled={isLoading}
                  className={`p-1 ${isCompleted ? 'text-success-600 dark:text-success-400' : theme.text.muted}`}
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