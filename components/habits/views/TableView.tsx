'use client';

import { useState, useMemo } from 'react';
import { Habit } from '@/types';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak, calculateCompletionRate, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Edit,
  Trash2,
  Hash,
  Flame,
  Clock,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TableViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

type SortKey = 'name' | 'streak' | 'completionRate' | 'frequency' | 'createdAt' | 'lastCompleted';
type SortDirection = 'asc' | 'desc';

export function TableView({ habits, onEdit }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState<string | null>(null);
  
  const { 
    completions, 
    isHabitCompleted, 
    toggleCompletion, 
    removeHabit 
  } = useHabits();

  // Transform habits with calculated data for sorting
  const enrichedHabits = useMemo(() => {
    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const streak = calculateStreak(habitCompletions);
      const completionRate = calculateCompletionRate(habitCompletions);
      const lastCompleted = habitCompletions
        .filter(c => c.completed)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      return {
        ...habit,
        streak,
        completionRate,
        lastCompleted: lastCompleted?.date || null,
        isDue: isHabitDueToday(habit),
        isOverdue: isHabitOverdue(habit, completions),
        isCompleted: isHabitCompleted(habit.id),
        tagsCount: habit.tags?.length || 0
      };
    });
  }, [habits, completions, isHabitCompleted]);

  // Sort habits based on current sort settings
  const sortedHabits = useMemo(() => {
    const sorted = [...enrichedHabits].sort((a, b) => {
      let aValue: any = a[sortKey];
      let bValue: any = b[sortKey];

      // Handle special cases
      if (sortKey === 'createdAt') {
        aValue = a.createdAt?.toDate?.()?.getTime() || 0;
        bValue = b.createdAt?.toDate?.()?.getTime() || 0;
      } else if (sortKey === 'lastCompleted') {
        aValue = a.lastCompleted ? new Date(a.lastCompleted).getTime() : 0;
        bValue = b.lastCompleted ? new Date(b.lastCompleted).getTime() : 0;
      }

      // Convert to strings for consistent comparison
      aValue = aValue?.toString().toLowerCase() || '';
      bValue = bValue?.toString().toLowerCase() || '';

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [enrichedHabits, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

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

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-600" />
      : <ArrowDown className="w-4 h-4 text-primary-600" />;
  };

  const getStatusBadge = (habit: any) => {
    if (habit.isCompleted) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Check className="w-3 h-3 mr-1" />
          Completed
        </span>
      );
    }
    if (habit.isOverdue) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <X className="w-3 h-3 mr-1" />
          Overdue
        </span>
      );
    }
    if (habit.isDue) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Due Today
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
        Upcoming
      </span>
    );
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No habits found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first habit to see the table view!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span>{habits.length} total habits</span>
          </div>
          <div className="flex items-center gap-1">
            <Check className="w-4 h-4" />
            <span>{sortedHabits.filter(h => h.isCompleted).length} completed today</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4" />
            <span>Avg. streak: {Math.round(sortedHabits.reduce((acc, h) => acc + h.streak, 0) / habits.length)} days</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Habit
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('streak')}
                >
                  <div className="flex items-center gap-2">
                    Streak
                    {getSortIcon('streak')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('completionRate')}
                >
                  <div className="flex items-center gap-2">
                    Success Rate
                    {getSortIcon('completionRate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('frequency')}
                >
                  <div className="flex items-center gap-2">
                    Frequency
                    {getSortIcon('frequency')}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => handleSort('lastCompleted')}
                >
                  <div className="flex items-center gap-2">
                    Last Completed
                    {getSortIcon('lastCompleted')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedHabits.map((habit) => {
                const isLoading = loading === habit.id;
                
                return (
                  <tr key={habit.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    {/* Status & Toggle */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleCompletion(habit.id)}
                          disabled={isLoading}
                          className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            habit.isCompleted
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
                          } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isLoading ? (
                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                          ) : habit.isCompleted ? (
                            <Check className="w-3 h-3" />
                          ) : null}
                        </button>
                        {getStatusBadge(habit)}
                      </div>
                    </td>

                    {/* Habit Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex-shrink-0 w-3 h-3 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {habit.name}
                          </div>
                          {habit.description && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {habit.description}
                            </div>
                          )}
                          {habit.tags && habit.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Hash className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {habit.tags.slice(0, 2).join(', ')}
                                {habit.tags.length > 2 && ` +${habit.tags.length - 2}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {habit.streak}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          day{habit.streak !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </td>

                    {/* Success Rate */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {habit.completionRate}%
                        </span>
                      </div>
                    </td>

                    {/* Frequency */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {habit.frequency === 'daily' 
                          ? 'Daily' 
                          : habit.frequency === 'weekly' 
                          ? 'Weekly' 
                          : `Every ${habit.intervalDays} days`
                        }
                      </span>
                    </td>

                    {/* Last Completed */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {habit.lastCompleted 
                          ? new Date(habit.lastCompleted).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEdit(habit)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDelete(habit)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}