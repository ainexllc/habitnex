'use client';

import { useState, useMemo } from 'react';
import { Habit } from '@/types';
import { CompactHabitCard } from './CompactHabitCard';
import { Button } from '@/components/ui/Button';
import { 
  isHabitDueToday, 
  isHabitOverdue, 
  calculateStreak,
  calculateCompletionRate 
} from '@/lib/utils';
import { theme } from '@/lib/theme';
import { useHabits } from '@/hooks/useHabits';
import { 
  ChevronDown, 
  ChevronUp, 
  SortAsc,
  Filter,
  List
} from 'lucide-react';

interface CompactViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

type SortBy = 'name' | 'dueDate' | 'streak' | 'completionRate';
type FilterBy = 'all' | 'dueToday' | 'overdue' | 'completed';

export function CompactView({ habits, onEdit }: CompactViewProps) {
  const { completions, isHabitCompleted } = useHabits();
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [showControls, setShowControls] = useState(false);

  const INITIAL_DISPLAY_COUNT = 8;

  const filteredAndSortedHabits = useMemo(() => {
    // Filter habits
    let filtered = habits;
    
    switch (filterBy) {
      case 'dueToday':
        filtered = habits.filter(habit => isHabitDueToday(habit));
        break;
      case 'overdue':
        filtered = habits.filter(habit => isHabitOverdue(habit, completions));
        break;
      case 'completed':
        filtered = habits.filter(habit => isHabitCompleted(habit.id));
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Sort habits
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'dueDate':
          // Prioritize overdue, then due today, then others
          const aOverdue = isHabitOverdue(a, completions);
          const bOverdue = isHabitOverdue(b, completions);
          const aDueToday = isHabitDueToday(a);
          const bDueToday = isHabitDueToday(b);
          
          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          if (aDueToday && !bDueToday) return -1;
          if (!aDueToday && bDueToday) return 1;
          return a.name.localeCompare(b.name);
        case 'streak':
          const aStreak = calculateStreak(completions.filter(c => c.habitId === a.id));
          const bStreak = calculateStreak(completions.filter(c => c.habitId === b.id));
          return bStreak - aStreak; // Descending
        case 'completionRate':
          const aRate = calculateCompletionRate(completions.filter(c => c.habitId === a.id));
          const bRate = calculateCompletionRate(completions.filter(c => c.habitId === b.id));
          return bRate - aRate; // Descending
        default:
          return 0;
      }
    });

    return sorted;
  }, [habits, completions, filterBy, sortBy, isHabitCompleted]);

  const displayedHabits = showAll 
    ? filteredAndSortedHabits 
    : filteredAndSortedHabits.slice(0, INITIAL_DISPLAY_COUNT);

  const hiddenCount = filteredAndSortedHabits.length - INITIAL_DISPLAY_COUNT;

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <List className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
          No habits to display
        </h3>
        <p className={theme.text.muted}>
          Create your first habit to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className={`font-medium ${theme.text.primary}`}>
            All Habits
          </h3>
          <span className={`text-sm ${theme.text.muted}`}>
            ({filteredAndSortedHabits.length} of {habits.length})
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className={`${theme.text.muted} hover:${theme.text.secondary}`}
        >
          <Filter className="w-4 h-4 mr-1" />
          Options
          <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showControls ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Filter and Sort Controls */}
      {showControls && (
        <div className={`${theme.surface.secondary} rounded-lg p-3 space-y-3`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className={`block text-xs font-medium ${theme.text.secondary} mb-1`}>
                Filter
              </label>
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterBy)}
                className="input text-sm w-full"
              >
                <option value="all">All Habits</option>
                <option value="dueToday">Due Today</option>
                <option value="overdue">Overdue</option>
                <option value="completed">Completed Today</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className={`block text-xs font-medium ${theme.text.secondary} mb-1`}>
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="input text-sm w-full"
              >
                <option value="dueDate">Due Date</option>
                <option value="name">Name</option>
                <option value="streak">Streak</option>
                <option value="completionRate">Success Rate</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className="space-y-2">
        {displayedHabits.map((habit) => (
          <CompactHabitCard 
            key={habit.id}
            habit={habit} 
            onEdit={onEdit}
          />
        ))}
      </div>

      {/* Show More/Less Button */}
      {filteredAndSortedHabits.length > INITIAL_DISPLAY_COUNT && (
        <div className="text-center pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className={theme.text.muted}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Show {hiddenCount} More
              </>
            )}
          </Button>
        </div>
      )}

      {/* Summary Info */}
      {filteredAndSortedHabits.length > 0 && (
        <div className={`${theme.surface.secondary} rounded-lg p-3 text-sm ${theme.text.muted}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className={`font-medium ${theme.text.primary}`}>
                {habits.filter(h => isHabitDueToday(h)).length}
              </div>
              <div className="text-xs">Due Today</div>
            </div>
            <div>
              <div className="font-medium text-red-600 dark:text-red-400">
                {habits.filter(h => isHabitOverdue(h, completions)).length}
              </div>
              <div className="text-xs">Overdue</div>
            </div>
            <div>
              <div className="font-medium text-green-600 dark:text-green-400">
                {habits.filter(h => isHabitCompleted(h.id)).length}
              </div>
              <div className="text-xs">Completed</div>
            </div>
            <div>
              <div className={`font-medium ${theme.text.primary}`}>
                {Math.round(habits.reduce((sum, h) => 
                  sum + calculateCompletionRate(completions.filter(c => c.habitId === h.id)), 0
                ) / habits.length) || 0}%
              </div>
              <div className="text-xs">Avg. Success</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}