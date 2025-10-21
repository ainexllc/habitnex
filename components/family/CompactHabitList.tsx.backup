'use client';

import { FamilyHabit } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Circle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompactHabitListProps {
  habits: (FamilyHabit & { completed: boolean })[];
  onToggleCompletion: (habitId: string, currentCompleted: boolean) => void;
  touchMode?: boolean;
  loading?: boolean;
  memberColor: string;
}

export function CompactHabitList({
  habits,
  onToggleCompletion,
  touchMode = false,
  loading = false,
  memberColor
}: CompactHabitListProps) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p className={cn(touchMode ? "text-base" : "text-sm")}>
          No habits for today
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={cn(
            "flex items-center justify-between rounded-md transition-all duration-200 group",
            touchMode ? "px-3 py-2 min-h-[44px]" : "px-2 py-1.5 min-h-[36px]",
            habit.completed 
              ? "bg-green-50 dark:bg-green-900/20" 
              : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            loading && "opacity-50 pointer-events-none"
          )}
        >
          {/* Habit Content */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Emoji */}
            <span className={cn(
              "flex-shrink-0",
              touchMode ? "text-lg" : "text-base"
            )}>
              <span
                style={{
                  fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                  fontWeight: '400'
                }}
              >
                {habit.emoji}
              </span>
            </span>
            
            {/* Title */}
            <span className={cn(
              "font-medium truncate transition-colors",
              touchMode ? "text-base" : "text-sm",
              habit.completed 
                ? "text-gray-500 dark:text-gray-400 line-through" 
                : "text-gray-900 dark:text-white"
            )}>
              {habit.name}
            </span>
            
            {/* Points */}
            <div className={cn(
              "flex items-center space-x-1 flex-shrink-0",
              habit.completed && "opacity-60"
            )}>
              <Zap className={cn(
                "text-yellow-500",
                touchMode ? "w-4 h-4" : "w-3 h-3"
              )} />
              <span className={cn(
                "text-yellow-600 dark:text-yellow-400 font-medium",
                touchMode ? "text-sm" : "text-xs"
              )}>
                {habit.basePoints}
              </span>
            </div>
          </div>
          
          {/* Completion Button */}
          <Button
            variant="ghost"
            size={touchMode ? "sm" : "xs"}
            className={cn(
              "flex-shrink-0 rounded-full p-1",
              touchMode ? "w-8 h-8" : "w-6 h-6",
              habit.completed 
                ? "text-green-600 hover:text-green-700" 
                : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            )}
            onClick={() => onToggleCompletion(habit.id, habit.completed)}
            disabled={loading}
          >
            {habit.completed ? (
              <CheckCircle2 className={cn(
                touchMode ? "w-5 h-5" : "w-4 h-4"
              )} />
            ) : (
              <Circle className={cn(
                touchMode ? "w-5 h-5" : "w-4 h-4"
              )} />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}