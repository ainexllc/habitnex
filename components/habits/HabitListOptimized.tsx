'use client';

import { useState, useEffect, useMemo } from 'react';
import { Habit } from '@/types';
import { CompactHabitCard } from './CompactHabitCard';
import { QuickStatsBar } from './QuickStatsBar';
import { useHabits } from '@/hooks/useHabits';
import { isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Archive
} from 'lucide-react';
import { theme } from '@/lib/theme';

interface HabitListOptimizedProps {
  habits: Habit[];
  onEdit?: (habit: Habit) => void;
  showStats?: boolean;
}

export function HabitListOptimized({ 
  habits, 
  onEdit,
  showStats = true 
}: HabitListOptimizedProps) {
  const { completions, isHabitCompleted } = useHabits();
  const [expandedHabits, setExpandedHabits] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  // Load expanded state from localStorage
  useEffect(() => {
    const savedExpanded = localStorage.getItem('expandedHabits');
    if (savedExpanded) {
      try {
        const parsed = JSON.parse(savedExpanded);
        setExpandedHabits(new Set(parsed));
      } catch (e) {
        // Failed to parse expanded habits from localStorage
      }
    }
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    localStorage.setItem('expandedHabits', JSON.stringify(Array.from(expandedHabits)));
  }, [expandedHabits]);

  // Categorize and sort habits
  const categorizedHabits = useMemo(() => {
    const overdue: Habit[] = [];
    const dueToday: Habit[] = [];
    const upcoming: Habit[] = [];
    const completed: Habit[] = [];

    habits.forEach(habit => {
      const isDue = isHabitDueToday(habit);
      const isOverdue = isHabitOverdue(habit, completions);
      const isCompleted = isHabitCompleted(habit.id);

      if (isCompleted) {
        completed.push(habit);
      } else if (isOverdue) {
        overdue.push(habit);
      } else if (isDue) {
        dueToday.push(habit);
      } else {
        upcoming.push(habit);
      }
    });

    // Sort each category by name for consistency
    const sortByName = (a: Habit, b: Habit) => a.name.localeCompare(b.name);
    
    return {
      overdue: overdue.sort(sortByName),
      dueToday: dueToday.sort(sortByName),
      upcoming: upcoming.sort(sortByName),
      completed: completed.sort(sortByName)
    };
  }, [habits, completions, isHabitCompleted]);

  const toggleHabitExpanded = (habitId: string) => {
    setExpandedHabits(prev => {
      const newSet = new Set(prev);
      if (newSet.has(habitId)) {
        newSet.delete(habitId);
      } else {
        newSet.add(habitId);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedHabits(new Set());
    } else {
      setExpandedHabits(new Set(habits.map(h => h.id)));
    }
    setExpandAll(!expandAll);
  };

  const totalCount = habits.length;
  const hasHabits = totalCount > 0;

  if (!hasHabits) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No habits yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first habit to start tracking your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Stats Bar */}
      {showStats && (
        <QuickStatsBar 
          habits={habits} 
          completions={completions} 
          isHabitCompleted={isHabitCompleted}
        />
      )}

      {/* Expand/Collapse All Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-semibold ${theme.text.primary}`}>
          Your Habits ({totalCount})
        </h2>
        <button
          onClick={handleExpandAll}
          className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {/* Overdue Habits */}
      {categorizedHabits.overdue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-semibold">
              Overdue ({categorizedHabits.overdue.length})
            </h3>
          </div>
          <div className="space-y-2">
            {categorizedHabits.overdue.map(habit => (
              <CompactHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                isExpanded={expandedHabits.has(habit.id)}
                onToggleExpand={() => toggleHabitExpanded(habit.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Due Today */}
      {categorizedHabits.dueToday.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold">
              Due Today ({categorizedHabits.dueToday.length})
            </h3>
          </div>
          <div className="space-y-2">
            {categorizedHabits.dueToday.map(habit => (
              <CompactHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                isExpanded={expandedHabits.has(habit.id)}
                onToggleExpand={() => toggleHabitExpanded(habit.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed */}
      {categorizedHabits.completed.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-semibold">
              Completed ({categorizedHabits.completed.length})
            </h3>
          </div>
          <div className="space-y-2">
            {categorizedHabits.completed.map(habit => (
              <CompactHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                isExpanded={expandedHabits.has(habit.id)}
                onToggleExpand={() => toggleHabitExpanded(habit.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {categorizedHabits.upcoming.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
              <Clock className="w-5 h-5" />
              <h3 className="font-semibold">
                Upcoming ({categorizedHabits.upcoming.length})
              </h3>
            </div>
          </summary>
          <div className="mt-3 space-y-2 pl-7">
            {categorizedHabits.upcoming.map(habit => (
              <CompactHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                isExpanded={expandedHabits.has(habit.id)}
                onToggleExpand={() => toggleHabitExpanded(habit.id)}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}