'use client';

import { useState, useMemo } from 'react';
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { OpenMoji } from '@/components/ui/OpenMoji';
import { FamilyMember, FamilyHabit, FamilyHabitCompletion } from '@/types/family';
import { getLocalDateString, formatDate, cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface MemberHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember;
  habits: (FamilyHabit & { completed: boolean; todaysCompletion: FamilyHabitCompletion | null })[];
  onToggleCompletion: (habitId: string, memberId: string, currentCompleted: boolean, date?: string) => Promise<void>;
  getHabitCompletion: (habitId: string, date: string, memberId?: string) => FamilyHabitCompletion | null;
}

export function MemberHistoryModal({
  isOpen,
  onClose,
  member,
  habits,
  onToggleCompletion,
  getHabitCompletion
}: MemberHistoryModalProps) {
  const today = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get habits with completion status for selected date
  const habitsForDate = useMemo(() => {
    return habits.map(habit => {
      const completion = getHabitCompletion(habit.id, selectedDate, member.id);
      return {
        ...habit,
        completed: completion?.completed || false,
        completion: completion
      };
    });
  }, [habits, selectedDate, member.id, getHabitCompletion]);

  // Calculate stats for selected date
  const stats = useMemo(() => {
    const completed = habitsForDate.filter(h => h.completed).length;
    const total = habitsForDate.length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { completed, total, rate };
  }, [habitsForDate]);

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
    const dateString = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dateString <= today) {
      setSelectedDate(dateString);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setSelectedDate(today);
    setViewMonth(now.getMonth());
    setViewYear(now.getFullYear());
  };

  const handleToggle = async (habitId: string, currentCompleted: boolean) => {
    await onToggleCompletion(habitId, member.id, currentCompleted, selectedDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // Days
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
            "hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100",
            isSelected && "ring-2 shadow-lg transform scale-105 text-white",
            isToday && !isSelected && "border-2",
            !isSelected && !isFuture && "hover:bg-gray-100 dark:hover:bg-gray-700",
            !isSelected && theme.text.primary
          )}
          style={{
            backgroundColor: isSelected ? member.color : undefined,
            borderColor: isToday && !isSelected ? member.color : undefined
          }}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={cn(
        "w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl",
        theme.surface.primary
      )}>
        {/* Header */}
        <div
          className="p-6 rounded-t-2xl"
          style={{
            background: `linear-gradient(135deg, ${member.color}dd, ${member.color}99)`
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <ProfileImage
                name={member.displayName}
                profileImageUrl={member.profileImageUrl}
                color={member.color}
                size={64}
                showBorder={true}
                borderColor="rgba(255,255,255,0.3)"
              />
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {member.displayName}'s Habit History
                </h2>
                <p className="text-white/90 text-sm">
                  Select a date to view and edit completions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div>
              <div className={cn("p-4 rounded-xl", theme.surface.secondary)}>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreviousMonth}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
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
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className={cn("text-center text-xs font-semibold py-2", theme.text.secondary)}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {renderCalendarDays()}
                </div>

                {/* Legend & Actions */}
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="flex gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 border-2 rounded"
                        style={{ borderColor: member.color }}
                      ></div>
                      <span className={theme.text.secondary}>Today</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: member.color }}
                      ></div>
                      <span className={theme.text.secondary}>Selected</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleToday}
                    style={{ backgroundColor: member.color }}
                    className="text-white"
                  >
                    Today
                  </Button>
                </div>
              </div>

              {/* Selected Date & Stats */}
              <div className={cn("mt-4 p-4 rounded-xl", theme.surface.secondary)}>
                <div className="flex items-center gap-2 mb-3">
                  <CalendarIcon
                    className="w-5 h-5"
                    style={{ color: member.color }}
                  />
                  <h3 className={cn("font-semibold", theme.text.primary)}>
                    {formatDate(selectedDate)}
                  </h3>
                  {selectedDate !== today && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Historical
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "text-3xl font-bold",
                    stats.rate === 100 ? "text-green-600 dark:text-green-400" :
                    stats.rate >= 50 ? "text-blue-600 dark:text-blue-400" :
                    stats.rate > 0 ? "text-orange-600 dark:text-orange-400" :
                    "text-gray-500 dark:text-gray-400"
                  )}>
                    {stats.rate}%
                  </div>
                  <div className={cn("text-sm", theme.text.secondary)}>
                    <div className="font-medium">
                      {stats.completed} of {stats.total} completed
                    </div>
                    <div className="text-xs">
                      {stats.rate === 100 ? "Perfect day! 🎉" :
                       stats.rate >= 50 ? "Good progress 👍" :
                       stats.rate > 0 ? "Keep going 💪" :
                       "No completions yet"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Habits List */}
            <div>
              <h3 className={cn("font-semibold mb-3", theme.text.primary)}>
                Habits for this day
              </h3>
              <div className="space-y-2">
                {habitsForDate.map((habit) => (
                  <div
                    key={habit.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      habit.completed
                        ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                        : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {habit.emoji && (
                        <OpenMoji emoji={habit.emoji} size={24} />
                      )}
                      <div className="flex-1">
                        <div className={cn(
                          "font-medium text-sm",
                          habit.completed && "line-through text-green-700 dark:text-green-400",
                          !habit.completed && theme.text.primary
                        )}>
                          {habit.name}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleToggle(habit.id, habit.completed)}
                        className={cn(
                          "h-8 px-3 text-xs",
                          habit.completed
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-gray-600 hover:bg-gray-700"
                        )}
                      >
                        {habit.completed ? "✓ Done" : "Mark Done"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={cn("p-4 border-t flex justify-end", theme.border.default)}>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
