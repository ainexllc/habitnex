'use client';

import { Button } from '@/components/ui/Button';
import { getLocalDateString } from '@/lib/utils';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { theme } from '@/lib/theme';

interface DateRangeQuickJumpsProps {
  onDateSelect: (date: string) => void;
}

export function DateRangeQuickJumps({ onDateSelect }: DateRangeQuickJumpsProps) {
  const today = getLocalDateString();

  const getDateOffset = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return getLocalDateString(date);
  };

  const getWeekStart = (weeksAgo: number = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() - (date.getDay() || 7) + 1 - (weeksAgo * 7)); // Monday
    return getLocalDateString(date);
  };

  const getMonthStart = (monthsAgo: number = 0): string => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo, 1);
    return getLocalDateString(date);
  };

  const quickJumps = [
    {
      label: 'Yesterday',
      date: getDateOffset(-1),
      icon: Clock,
      color: 'blue'
    },
    {
      label: '3 Days Ago',
      date: getDateOffset(-3),
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Last Week',
      date: getDateOffset(-7),
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'This Week Start',
      date: getWeekStart(0),
      icon: Calendar,
      color: 'blue'
    },
    {
      label: 'Last Week Start',
      date: getWeekStart(1),
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'This Month Start',
      date: getMonthStart(0),
      icon: TrendingUp,
      color: 'green'
    },
    {
      label: 'Last Month Start',
      date: getMonthStart(1),
      icon: TrendingUp,
      color: 'orange'
    },
    {
      label: '30 Days Ago',
      date: getDateOffset(-30),
      icon: Clock,
      color: 'red'
    },
  ];

  return (
    <div className={`${theme.surface.primary} rounded-xl p-4 border ${theme.border.default} shadow-sm`}>
      <div className="mb-3">
        <h3 className={`text-sm font-semibold ${theme.text.primary} mb-1`}>
          ⚡ Quick Jump
        </h3>
        <p className={`text-xs ${theme.text.secondary}`}>
          Jump to common date ranges instantly
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {quickJumps.map((jump) => {
          const IconComponent = jump.icon;
          return (
            <Button
              key={jump.label}
              variant="outline"
              size="sm"
              onClick={() => onDateSelect(jump.date)}
              className={`
                flex flex-col items-center justify-center p-3 h-auto
                hover:scale-105 transition-transform duration-200
                ${jump.color === 'blue' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700' : ''}
                ${jump.color === 'purple' ? 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700' : ''}
                ${jump.color === 'green' ? 'hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700' : ''}
                ${jump.color === 'orange' ? 'hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700' : ''}
                ${jump.color === 'red' ? 'hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700' : ''}
              `}
            >
              <IconComponent className={`w-4 h-4 mb-1 ${
                jump.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                jump.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                jump.color === 'green' ? 'text-green-600 dark:text-green-400' :
                jump.color === 'orange' ? 'text-orange-600 dark:text-orange-400' :
                'text-red-600 dark:text-red-400'
              }`} />
              <span className="text-xs font-medium">{jump.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Usage tip */}
      <div className={`mt-3 pt-3 border-t ${theme.border.light}`}>
        <p className={`text-xs ${theme.text.muted} text-center`}>
          💡 Tip: Use these buttons to quickly navigate to common dates without clicking through the calendar
        </p>
      </div>
    </div>
  );
}
