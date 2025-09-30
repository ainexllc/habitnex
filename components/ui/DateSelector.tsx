'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CalendarPicker } from '@/components/ui/CalendarPicker';
import { getLocalDateString, formatDate } from '@/lib/utils';

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD format
  onDateChange: (date: string) => void;
  minDate?: string; // Optional: earliest selectable date
  maxDate?: string; // Optional: latest selectable date (defaults to today)
  highlightedDates?: string[]; // Optional: dates to highlight in calendar
}

export function DateSelector({
  selectedDate,
  onDateChange,
  minDate,
  maxDate = getLocalDateString(), // Default to today
  highlightedDates = []
}: DateSelectorProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousDay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextDay();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        handleToday();
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setShowCalendar(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowCalendar(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDate, minDate, maxDate]);

  const handlePreviousDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() - 1);
    const newDate = getLocalDateString(current);

    // Check if we're going below minDate
    if (minDate && newDate < minDate) return;

    onDateChange(newDate);
  };

  const handleNextDay = () => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + 1);
    const newDate = getLocalDateString(current);

    // Check if we're going above maxDate
    if (newDate > maxDate) return;

    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(getLocalDateString());
  };

  const handleCalendarSelect = (date: string) => {
    onDateChange(date);
    setShowCalendar(false);
  };

  const isToday = selectedDate === getLocalDateString();
  const isPastDate = selectedDate < getLocalDateString();
  const isFutureDate = selectedDate > getLocalDateString();
  const canGoPrevious = !minDate || selectedDate > minDate;
  const canGoNext = selectedDate < maxDate;

  return (
    <div className="relative space-y-3">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            title="Open calendar picker (C)"
          >
            <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isToday && '✨ Today'}
              {isPastDate && '📅 Historical View'}
              {isFutureDate && '🔮 Future Date'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousDay}
            disabled={!canGoPrevious}
            title="Previous day (←)"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {!isToday && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleToday}
              title="Jump to today (T)"
            >
              Today
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextDay}
            disabled={!canGoNext}
            title="Next day (→)"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-4 flex-wrap">
        <span>⌨️ Shortcuts:</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">← → Navigate</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">T Today</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">C Calendar</span>
        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">ESC Close</span>
      </div>

      {/* Calendar Picker Overlay */}
      {showCalendar && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2">
          <CalendarPicker
            selectedDate={selectedDate}
            onDateSelect={handleCalendarSelect}
            minDate={minDate}
            maxDate={maxDate}
            highlightedDates={highlightedDates}
            onClose={() => setShowCalendar(false)}
          />
        </div>
      )}
    </div>
  );
}