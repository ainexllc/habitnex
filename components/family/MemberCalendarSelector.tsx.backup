'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getLocalDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface MemberCalendarSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  memberName: string;
  memberColor?: string;
}

export function MemberCalendarSelector({
  selectedDate,
  onDateChange,
  memberName,
  memberColor = '#3b82f6'
}: MemberCalendarSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const today = getLocalDateString();

  // Parse selected date
  const currentDate = new Date(selectedDate + 'T00:00:00');
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const [viewYear, setViewYear] = useState(currentYear);
  const [viewMonth, setViewMonth] = useState(currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handlePreviousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(viewYear, viewMonth, day);
    const dateString = getLocalDateString(selected);

    // Don't allow selecting future dates
    if (dateString <= today) {
      onDateChange(dateString);
      setShowCalendar(false);
    }
  };

  const handleToday = () => {
    onDateChange(today);
    setShowCalendar(false);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = dateString === selectedDate;
      const isToday = dateString === today;
      const isFuture = dateString > today;

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          disabled={isFuture}
          className={cn(
            "aspect-square rounded-lg text-sm font-medium transition-all",
            "hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
            isSelected && "ring-2 shadow-lg transform scale-105",
            isToday && !isSelected && "border-2 border-blue-500 dark:border-blue-400",
            isFuture && "text-gray-300 dark:text-gray-700",
            !isSelected && !isFuture && "hover:bg-gray-100 dark:hover:bg-gray-700"
          )}
          style={{
            backgroundColor: isSelected ? memberColor : undefined,
            color: isSelected ? 'white' : undefined,
            ringColor: isSelected ? memberColor : undefined
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <>
      {/* Calendar Icon Button */}
      <button
        onClick={() => setShowCalendar(true)}
        className={cn(
          "p-2 rounded-lg transition-all hover:scale-110",
          theme.surface.hover
        )}
        title={`View calendar for ${memberName}`}
      >
        <CalendarIcon
          className="w-6 h-6"
          style={{ color: memberColor }}
        />
      </button>

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className={cn(
              "w-full max-w-md rounded-2xl shadow-2xl",
              theme.surface.primary
            )}
          >
            {/* Header */}
            <div
              className="p-6 rounded-t-2xl"
              style={{
                background: `linear-gradient(135deg, ${memberColor}dd, ${memberColor}99)`
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">
                  {memberName}'s Calendar
                </h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-sm text-white/90">
                Select a date to view and edit habits
              </p>
            </div>

            {/* Month Navigation */}
            <div className={cn("flex items-center justify-between p-4 border-b", theme.border.default)}>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePreviousMonth}
                className="h-9 w-9 p-0"
              >
                ←
              </Button>

              <div className={cn("text-lg font-semibold", theme.text.primary)}>
                {monthNames[viewMonth]} {viewYear}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-9 w-9 p-0"
              >
                →
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "text-center text-xs font-semibold py-2",
                      theme.text.secondary
                    )}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Footer Actions */}
            <div className={cn("p-4 border-t flex justify-between items-center", theme.border.default)}>
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                  <span className={theme.text.secondary}>Today</span>
                </div>
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: memberColor }}
                  ></div>
                  <span className={theme.text.secondary}>Selected</span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleToday}
                style={{ backgroundColor: memberColor }}
                className="text-white"
              >
                Go to Today
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
