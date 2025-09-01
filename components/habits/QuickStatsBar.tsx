'use client';

import { useMemo } from 'react';
import { Habit, Completion } from '@/types';
import { 
  CheckCircle2, 
  Flame, 
  TrendingUp, 
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { theme } from '@/lib/theme';
import { calculateStreak, isHabitDueToday, calculateIntervalStreak } from '@/lib/utils';

interface QuickStatsBarProps {
  habits: Habit[];
  completions: Completion[];
  isHabitCompleted: (habitId: string) => boolean;
}

export function QuickStatsBar({ habits, completions, isHabitCompleted }: QuickStatsBarProps) {
  const stats = useMemo(() => {
    // Today's progress
    const dueToday = habits.filter(habit => isHabitDueToday(habit));
    const completedToday = dueToday.filter(habit => isHabitCompleted(habit.id));
    
    // Best streak calculation
    let bestStreak = 0;
    habits.forEach(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const streak = habit.frequency === 'interval' 
        ? calculateIntervalStreak(habit, completions)
        : calculateStreak(habitCompletions);
      bestStreak = Math.max(bestStreak, streak);
    });
    
    // This week's completion rate
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekCompletions = completions.filter(c => new Date(c.date) >= weekStart);
    const expectedCompletions = habits.filter(h => h.frequency === 'daily').length * 7 +
                                habits.filter(h => h.frequency === 'weekly').length;
    const weekRate = expectedCompletions > 0 
      ? Math.round((weekCompletions.length / expectedCompletions) * 100)
      : 0;
    
    // Active streaks count
    const activeStreaks = habits.filter(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const streak = habit.frequency === 'interval' 
        ? calculateIntervalStreak(habit, completions)
        : calculateStreak(habitCompletions);
      return streak > 0;
    }).length;
    
    // Total habits with goals
    const habitsWithGoals = habits.filter(h => h.goal).length;
    
    return {
      todayCompleted: completedToday.length,
      todayTotal: dueToday.length,
      bestStreak,
      weekRate,
      activeStreaks,
      totalHabits: habits.length,
      habitsWithGoals
    };
  }, [habits, completions, isHabitCompleted]);

  // Calculate progress percentage
  const todayProgress = stats.todayTotal > 0 
    ? Math.round((stats.todayCompleted / stats.todayTotal) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900 rounded-xl p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Today's Progress */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            todayProgress === 100 
              ? 'bg-green-100 dark:bg-green-900/50' 
              : 'bg-white dark:bg-gray-800'
          }`}>
            <CheckCircle2 className={`w-5 h-5 ${
              todayProgress === 100 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-primary-600 dark:text-primary-400'
            }`} />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Today
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {stats.todayCompleted}/{stats.todayTotal}
            </div>
            <div className={`text-xs ${
              todayProgress === 100 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {todayProgress}% done
            </div>
          </div>
        </div>

        {/* Best Streak */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-100 dark:bg-orange-900/50">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Best Streak
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {stats.bestStreak} days
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.activeStreaks} active
            </div>
          </div>
        </div>

        {/* Week Performance */}
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${
            stats.weekRate >= 80 
              ? 'bg-green-100 dark:bg-green-900/50'
              : stats.weekRate >= 60
              ? 'bg-yellow-100 dark:bg-yellow-900/50'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <TrendingUp className={`w-5 h-5 ${
              stats.weekRate >= 80 
                ? 'text-green-600 dark:text-green-400'
                : stats.weekRate >= 60
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              This Week
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {stats.weekRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              completion
            </div>
          </div>
        </div>

        {/* Total Overview */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-100 dark:bg-purple-900/50">
            <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Total
            </div>
            <div className="font-bold text-gray-900 dark:text-gray-100">
              {stats.totalHabits} habits
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.habitsWithGoals} with goals
            </div>
          </div>
        </div>
      </div>

      {/* Optional Motivational Message */}
      {todayProgress === 100 && (
        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
          <p className="text-sm text-center font-medium text-green-600 dark:text-green-400">
            🎉 Perfect day! All habits completed!
          </p>
        </div>
      )}
      {todayProgress > 0 && todayProgress < 100 && stats.todayTotal > 0 && (
        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800">
          <p className="text-sm text-center font-medium text-primary-600 dark:text-primary-400">
            Keep going! {stats.todayTotal - stats.todayCompleted} more to complete today
          </p>
        </div>
      )}
    </div>
  );
}