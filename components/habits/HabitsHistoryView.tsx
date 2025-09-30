'use client';

import { useState, useMemo } from 'react';
import { DateSelector } from '@/components/ui/DateSelector';
import { DateRangeQuickJumps } from '@/components/ui/DateRangeQuickJumps';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { Habit } from '@/types';
import { getLocalDateString } from '@/lib/utils';
import { usePersonalData } from '@/hooks/usePersonalData';
import { theme } from '@/lib/theme';
import { History, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

interface HabitsHistoryViewProps {
  habits: Habit[];
  onEdit?: (habit: Habit) => void;
  minDate?: string; // Optional: earliest date to allow
}

export function HabitsHistoryView({ habits, onEdit, minDate }: HabitsHistoryViewProps) {
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const { completions } = usePersonalData();

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  const isToday = selectedDate === getLocalDateString();

  // Calculate highlighted dates (dates with completions) for calendar
  const highlightedDates = useMemo(() => {
    const dates = new Set<string>();
    completions.forEach(completion => {
      if (completion.completed) {
        dates.add(completion.date);
      }
    });
    return Array.from(dates);
  }, [completions]);

  // Calculate completion stats for selected date
  const dateStats = useMemo(() => {
    const dateCompletions = completions.filter(c => c.date === selectedDate && c.completed);
    const totalHabits = habits.length;
    const completedHabits = dateCompletions.length;
    const completionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    return {
      total: totalHabits,
      completed: completedHabits,
      rate: completionRate
    };
  }, [selectedDate, completions, habits]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className={`${theme.surface.primary} rounded-xl p-6 border ${theme.border.default} shadow-sm`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
              History & Calendar View
            </h2>
            <p className={`text-sm ${theme.text.secondary}`}>
              View and update habit completions for any date
            </p>
          </div>
        </div>
      </div>

      {/* Quick Jump Shortcuts */}
      <DateRangeQuickJumps onDateSelect={handleDateChange} />

      {/* Date Selector with Calendar */}
      <DateSelector
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        minDate={minDate}
        highlightedDates={highlightedDates}
      />

      {/* Date Statistics */}
      <div className={`${theme.surface.primary} rounded-lg p-4 border ${theme.border.default} bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-green-50/50 dark:from-purple-950/20 dark:via-blue-950/20 dark:to-green-950/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-lg flex items-center justify-center shadow-sm">
              <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${theme.text.primary}`}>
                Completion Rate for This Date
              </h4>
              <p className={`text-xs ${theme.text.secondary}`}>
                {dateStats.completed} of {dateStats.total} habits completed
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              dateStats.rate >= 80 ? 'text-green-600 dark:text-green-400' :
              dateStats.rate >= 50 ? 'text-blue-600 dark:text-blue-400' :
              dateStats.rate > 0 ? 'text-orange-600 dark:text-orange-400' :
              'text-gray-400 dark:text-gray-600'
            }`}>
              {dateStats.rate}%
            </div>
            <p className={`text-xs ${theme.text.muted}`}>
              {dateStats.rate === 100 ? 'Perfect! 🎉' :
               dateStats.rate >= 80 ? 'Great! 👍' :
               dateStats.rate >= 50 ? 'Good 👌' :
               dateStats.rate > 0 ? 'Keep going 💪' :
               'No completions'}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      {!isToday && (
        <div className={`${theme.surface.primary} rounded-lg p-4 border ${theme.border.default} bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800`}>
          <div className="flex items-start gap-3">
            <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className={`text-sm font-semibold ${theme.text.primary} mb-1`}>
                Historical View Mode
              </h4>
              <p className={`text-xs ${theme.text.secondary}`}>
                You're viewing habits for a past date. You can mark habits as complete or incomplete to update your history.
                This is useful for logging missed completions or correcting mistakes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Habits List */}
      <div className={`${theme.surface.primary} rounded-xl border ${theme.border.default} shadow-sm p-6`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>
            {isToday ? 'Today\'s Habits' : 'All Habits'}
          </h3>
          <span className={`text-sm ${theme.text.secondary}`}>
            {habits.length} habit{habits.length !== 1 ? 's' : ''}
          </span>
        </div>

        {habits.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className={`text-sm ${theme.text.secondary}`}>
              No habits found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => (
              <BenefitsHabitCard
                key={habit.id}
                habit={habit}
                onEdit={onEdit}
                selectedDate={selectedDate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className={`${theme.surface.primary} rounded-lg p-4 border ${theme.border.light} bg-gray-50 dark:bg-gray-900/20`}>
        <h4 className={`text-sm font-semibold ${theme.text.primary} mb-2`}>
          💡 Tips
        </h4>
        <ul className={`text-xs ${theme.text.secondary} space-y-1.5 list-disc list-inside`}>
          <li>Use the arrow buttons to navigate between days</li>
          <li>Click "Today" to quickly return to the current date</li>
          <li>Historical entries are marked with a blue indicator</li>
          <li>You can mark past habits as complete to fill in gaps</li>
        </ul>
      </div>
    </div>
  );
}