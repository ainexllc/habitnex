'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getLocalDateString, formatDate } from '@/lib/utils';

interface MemberDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  memberName: string;
}

export function MemberDateSelector({ selectedDate, onDateChange, memberName }: MemberDateSelectorProps) {
  const today = getLocalDateString();
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;

  const handlePrevious = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() - 1);
    onDateChange(getLocalDateString(date));
  };

  const handleNext = () => {
    const date = new Date(selectedDate + 'T00:00:00');
    date.setDate(date.getDate() + 1);
    const nextDate = getLocalDateString(date);
    if (nextDate <= today) {
      onDateChange(nextDate);
    }
  };

  const handleToday = () => {
    onDateChange(today);
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatDate(selectedDate)}
          </div>
          {isPast && (
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Historical View
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevious}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Previous day"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>

        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="h-8 px-3 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            Today
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleNext}
          disabled={selectedDate >= today}
          className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          title="Next day"
        >
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>
    </div>
  );
}
