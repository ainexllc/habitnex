'use client';

import { useMemo, useState } from 'react';
import { Habit } from '@/types';
import { CompactHabitCard } from './CompactHabitCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  isHabitDueToday,
  isHabitOverdue,
  calculateStreak,
  calculateCompletionRate,
  getNextDueDate
} from '@/lib/utils';
import { theme } from '@/lib/theme';
import { useHabits } from '@/hooks/useHabits';
import {
  Target,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  CheckCircle,
  List,
  Grid,
  Filter
} from 'lucide-react';

interface SummaryViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

type ViewMode = 'summary' | 'list';
type FilterMode = 'all' | 'today' | 'overdue' | 'upcoming';

export function SummaryView({ habits, onEdit }: SummaryViewProps) {
  const { completions, isHabitCompleted } = useHabits();
  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showAll, setShowAll] = useState(false);

  const INITIAL_DISPLAY_COUNT = 6;

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    const todayHabits = habits.filter(h => isHabitDueToday(h));
    const overdueHabits = habits.filter(h => isHabitOverdue(h, completions));
    const completedToday = habits.filter(h => isHabitCompleted(h.id)).length;
    const upcomingHabits = habits.filter(h => {
      const nextDue = getNextDueDate(h);
      if (!nextDue) return false;
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return nextDue === tomorrow && !isHabitDueToday(h);
    });

    const avgCompletionRate = habits.length > 0
      ? Math.round(habits.reduce((sum, habit) =>
          sum + calculateCompletionRate(completions.filter(c => c.habitId === habit.id)), 0
        ) / habits.length)
      : 0;

    const currentStreaks = habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      return calculateStreak(habitCompletions);
    });

    const bestStreak = Math.max(...currentStreaks, 0);
    const activeStreaks = currentStreaks.filter(streak => streak > 0).length;

    return {
      totalHabits: habits.length,
      todayHabits: todayHabits.length,
      overdueHabits: overdueHabits.length,
      completedToday,
      upcomingHabits: upcomingHabits.length,
      avgCompletionRate,
      bestStreak,
      activeStreaks
    };
  }, [habits, completions, isHabitCompleted]);

  const filteredHabits = useMemo(() => {
    let filtered = habits;

    switch (filterMode) {
      case 'today':
        filtered = habits.filter(h => isHabitDueToday(h));
        break;
      case 'overdue':
        filtered = habits.filter(h => isHabitOverdue(h, completions));
        break;
      case 'upcoming':
        filtered = habits.filter(h => {
          const nextDue = getNextDueDate(h);
          if (!nextDue) return false;
          const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          return nextDue === tomorrow && !isHabitDueToday(h);
        });
        break;
      default:
        // Sort by priority: overdue first, then due today, then others
        filtered = [...habits].sort((a, b) => {
          const aOverdue = isHabitOverdue(a, completions);
          const bOverdue = isHabitOverdue(b, completions);
          const aDueToday = isHabitDueToday(a);
          const bDueToday = isHabitDueToday(b);

          if (aOverdue && !bOverdue) return -1;
          if (!aOverdue && bOverdue) return 1;
          if (aDueToday && !bDueToday) return -1;
          if (!aDueToday && bDueToday) return 1;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return filtered;
  }, [habits, filterMode, completions]);

  const displayedHabits = showAll
    ? filteredHabits
    : filteredHabits.slice(0, INITIAL_DISPLAY_COUNT);

  const hiddenCount = filteredHabits.length - INITIAL_DISPLAY_COUNT;

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
          No habits yet
        </h3>
        <p className={theme.text.muted}>
          Create your first habit to see your progress overview here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className={`${theme.status.info.bg} ${theme.status.info.border}`}>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.todayHabits}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Due Today</div>
          </CardContent>
        </Card>

        <Card className={`${theme.status.error.bg} ${theme.status.error.border}`}>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.overdueHabits}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Overdue</div>
          </CardContent>
        </Card>

        <Card className={`${theme.status.success.bg} ${theme.status.success.border}`}>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.completedToday}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Completed</div>
          </CardContent>
        </Card>

        <Card className={`${theme.surface.secondary}`}>
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.avgCompletionRate}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Avg Success</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className={`font-semibold ${theme.text.primary}`}>
            {viewMode === 'summary' ? 'Today\'s Overview' : 'All Habits'}
          </h3>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'summary' ? 'primary' : 'outline'}
              onClick={() => setViewMode('summary')}
            >
              <Target className="w-4 h-4 mr-1" />
              Summary
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-1" />
              List
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="all">All ({stats.totalHabits})</option>
            <option value="today">Due Today ({stats.todayHabits})</option>
            <option value="overdue">Overdue ({stats.overdueHabits})</option>
            <option value="upcoming">Upcoming ({stats.upcomingHabits})</option>
          </select>
        </div>
      </div>

      {viewMode === 'summary' ? (
        <div className="space-y-4">
          {/* Priority Sections */}
          {stats.overdueHabits > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h4 className={`font-medium ${theme.text.primary}`}>
                  Overdue ({stats.overdueHabits})
                </h4>
              </div>
              <div className="space-y-2">
                {filteredHabits
                  .filter(h => isHabitOverdue(h, completions))
                  .slice(0, 3)
                  .map((habit) => (
                    <CompactHabitCard
                      key={habit.id}
                      habit={habit}
                      onEdit={onEdit}
                    />
                  ))}
              </div>
            </div>
          )}

          {stats.todayHabits > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <h4 className={`font-medium ${theme.text.primary}`}>
                  Due Today ({stats.todayHabits})
                </h4>
              </div>
              <div className="space-y-2">
                {filteredHabits
                  .filter(h => isHabitDueToday(h) && !isHabitOverdue(h, completions))
                  .slice(0, 3)
                  .map((habit) => (
                    <CompactHabitCard
                      key={habit.id}
                      habit={habit}
                      onEdit={onEdit}
                    />
                  ))}
              </div>
            </div>
          )}

          {stats.upcomingHabits > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <h4 className={`font-medium ${theme.text.primary}`}>
                  Coming Up ({stats.upcomingHabits})
                </h4>
              </div>
              <div className="space-y-2">
                {filteredHabits
                  .filter(h => {
                    const nextDue = getNextDueDate(h);
                    if (!nextDue) return false;
                    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    return nextDue === tomorrow && !isHabitDueToday(h);
                  })
                  .slice(0, 2)
                  .map((habit) => (
                    <CompactHabitCard
                      key={habit.id}
                      habit={habit}
                      onEdit={onEdit}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Success Metrics */}
          <Card className={`${theme.status.success.bg} ${theme.status.success.border}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <TrendingUp className="w-5 h-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.bestStreak}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Best Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {stats.activeStreaks}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Active Streaks</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {displayedHabits.map((habit) => {
            const isOverdueHabit = isHabitOverdue(habit, completions);
            const isDueTodayHabit = isHabitDueToday(habit);
            const priority = isOverdueHabit ? 'high' : isDueTodayHabit ? 'high' : 'medium';

            return (
              <CompactHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
              />
            );
          })}

          {/* Show More Button */}
          {hiddenCount > 0 && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show Less' : `Show ${hiddenCount} More Habits`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

