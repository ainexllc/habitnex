'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getLocalDateString } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface CalendarPickerProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateSelect: (date: string) => void;
  minDate?: string; // Optional: earliest selectable date
  maxDate?: string; // Optional: latest selectable date (defaults to today)
  onClose?: () => void;
  highlightedDates?: string[]; // Dates to highlight (e.g., dates with completions)
}

export function CalendarPicker({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate = getLocalDateString(),
  onClose,
  highlightedDates = []
}: CalendarPickerProps) {
  const [viewDate, setViewDate] = useState(selectedDate);

  const viewMonth = new Date(viewDate + 'T00:00:00').getMonth();
  const viewYear = new Date(viewDate + 'T00:00:00').getFullYear();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first day of month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sunday

  // Get number of days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Get days from previous month to fill the grid
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();
  const prevMonthStartDay = prevMonthDays - firstDayWeekday + 1;

  // Generate calendar grid
  const calendarDays: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isHighlighted: boolean;
  }> = [];

  // Previous month days
  for (let i = 0; i < firstDayWeekday; i++) {
    const day = prevMonthStartDay + i;
    const month = viewMonth === 0 ? 11 : viewMonth - 1;
    const year = viewMonth === 0 ? viewYear - 1 : viewYear;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    calendarDays.push({
      date: dateStr,
      day,
      isCurrentMonth: false,
      isToday: dateStr === getLocalDateString(),
      isSelected: dateStr === selectedDate,
      isDisabled: (minDate && dateStr < minDate) || dateStr > maxDate,
      isHighlighted: highlightedDates.includes(dateStr)
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    calendarDays.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      isToday: dateStr === getLocalDateString(),
      isSelected: dateStr === selectedDate,
      isDisabled: (minDate && dateStr < minDate) || dateStr > maxDate,
      isHighlighted: highlightedDates.includes(dateStr)
    });
  }

  // Next month days to complete the grid (42 cells = 6 rows × 7 days)
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const month = viewMonth === 11 ? 0 : viewMonth + 1;
    const year = viewMonth === 11 ? viewYear + 1 : viewYear;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    calendarDays.push({
      date: dateStr,
      day,
      isCurrentMonth: false,
      isToday: dateStr === getLocalDateString(),
      isSelected: dateStr === selectedDate,
      isDisabled: (minDate && dateStr < minDate) || dateStr > maxDate,
      isHighlighted: highlightedDates.includes(dateStr)
    });
  }

  const handlePrevMonth = () => {
    const newDate = new Date(viewYear, viewMonth - 1, 1);
    setViewDate(getLocalDateString(newDate));
  };

  const handleNextMonth = () => {
    const newDate = new Date(viewYear, viewMonth + 1, 1);
    setViewDate(getLocalDateString(newDate));
  };

  const handleDateClick = (date: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onDateSelect(date);
    if (onClose) onClose();
  };

  const handleToday = () => {
    const today = getLocalDateString();
    setViewDate(today);
    onDateSelect(today);
    if (onClose) onClose();
  };

  return (
    <div className={`${theme.surface.primary} rounded-xl shadow-xl border ${theme.border.default} p-4 w-full max-w-sm`}>
      {/* Header with month/year navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="p-2"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="text-center">
          <div className={`text-lg font-bold ${theme.text.primary}`}>
            {monthNames[viewMonth]} {viewYear}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="p-2"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className={`text-center text-xs font-medium ${theme.text.secondary} py-2`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => {
          const isWeekend = index % 7 === 0 || index % 7 === 6;

          return (
            <button
              key={`${dayInfo.date}-${index}`}
              onClick={() => handleDateClick(dayInfo.date, dayInfo.isDisabled)}
              disabled={dayInfo.isDisabled}
              className={`
                aspect-square rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center relative
                ${dayInfo.isDisabled
                  ? 'cursor-not-allowed opacity-30'
                  : 'cursor-pointer hover:scale-110 hover:shadow-md'
                }
                ${!dayInfo.isCurrentMonth
                  ? 'opacity-40'
                  : ''
                }
                ${dayInfo.isSelected
                  ? 'bg-primary-600 text-white ring-2 ring-primary-300 dark:ring-primary-700 scale-105 shadow-lg'
                  : dayInfo.isToday
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400 dark:ring-blue-600'
                  : dayInfo.isHighlighted
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : isWeekend
                  ? `${theme.surface.secondary} ${theme.text.secondary}`
                  : `${theme.surface.hover} ${theme.text.primary}`
                }
              `}
              title={dayInfo.isToday ? 'Today' : dayInfo.date}
            >
              {dayInfo.day}

              {/* Highlight dot for days with completions */}
              {dayInfo.isHighlighted && !dayInfo.isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer with quick actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="flex-1"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Today
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className={`mt-3 pt-3 border-t ${theme.border.light} text-xs ${theme.text.muted}`}>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-400"></div>
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/40"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-primary-600"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
