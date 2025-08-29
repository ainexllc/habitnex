'use client';

import { useMemo } from 'react';
import { HabitCompletion } from '@/types';
import { addDays, getDateString } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface HabitCalendarProps {
  completions: HabitCompletion[];
  habitId: string;
  className?: string;
}

export function HabitCalendar({ completions, habitId, className = '' }: HabitCalendarProps) {
  const calendarData = useMemo(() => {
    const today = new Date();
    const startDate = addDays(today, -90); // Show last 90 days
    
    const days = [];
    for (let i = 0; i < 90; i++) {
      const date = addDays(startDate, i);
      const dateString = getDateString(date);
      const completion = completions.find(c => c.habitId === habitId && c.date === dateString);
      
      days.push({
        date: dateString,
        completed: completion?.completed || false,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        month: date.getMonth(),
      });
    }
    
    return days;
  }, [completions, habitId]);

  const getIntensity = (completed: boolean) => {
    if (!completed) return theme.surface.tertiary;
    return theme.status.success.bg;
  };

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className={`text-sm font-medium ${theme.text.primary} mb-2`}>
          Activity Calendar (Last 90 Days)
        </h3>
      </div>
      
      <div className="grid grid-cols-13 gap-1">
        {calendarData.map((day, index) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-sm ${getIntensity(day.completed)} transition-colors hover:opacity-80`}
            title={`${day.date}: ${day.completed ? 'Completed' : 'Not completed'}`}
          />
        ))}
      </div>
      
      <div className={`flex items-center justify-between text-xs ${theme.text.muted} mt-3`}>
        <span>90 days ago</span>
        <div className="flex items-center space-x-2">
          <span>Less</span>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 ${theme.surface.tertiary} rounded-sm`}></div>
            <div className={`w-2 h-2 ${theme.iconContainer.green} rounded-sm`}></div>
            <div className={`w-2 h-2 ${theme.status.success.bg} rounded-sm`}></div>
            <div className="w-2 h-2 bg-green-600 dark:bg-green-500 rounded-sm"></div>
          </div>
          <span>More</span>
        </div>
        <span>Today</span>
      </div>
    </div>
  );
}