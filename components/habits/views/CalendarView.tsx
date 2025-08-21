'use client';

import { useState, useMemo } from 'react';
import { Habit } from '@/types';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Edit, 
  Trash2,
  Hash,
  Flame,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CalendarViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

export function CalendarView({ habits, onEdit }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const { completions, removeHabit, isHabitCompleted, toggleCompletion } = useHabits();

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Generate calendar days
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get completions for this date
      const dayCompletions = completions.filter(completion => 
        completion.date === dateStr
      );
      
      days.push({
        date,
        day,
        dateStr,
        completions: dayCompletions,
        isToday: dateStr === new Date().toISOString().split('T')[0]
      });
    }
    
    return { days, month: firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  }, [currentDate, completions]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleToggleCompletion = async (habitId: string, date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const isCompleted = isHabitCompleted(habitId, dateStr);
      await toggleCompletion(habitId, dateStr, !isCompleted);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleDelete = async (habit: Habit) => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      try {
        await removeHabit(habit.id);
        setSelectedHabit(null);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Hash className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No habits found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first habit to see the calendar view!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {calendarData.month}
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      <div className="flex gap-6">
        {/* Calendar Grid */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Days of week header */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7">
              {calendarData.days.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700 ${
                    day ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                  } ${day?.isToday ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-medium mb-2 ${
                        day.isToday 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {day.day}
                      </div>
                      
                      {/* Habit completion dots */}
                      <div className="space-y-1">
                        {habits.slice(0, 4).map(habit => {
                          const isCompleted = day.completions.some(c => c.habitId === habit.id);
                          return (
                            <button
                              key={habit.id}
                              onClick={() => handleToggleCompletion(habit.id, day.date)}
                              className={`w-full h-2 rounded-full transition-all ${
                                isCompleted 
                                  ? 'opacity-100' 
                                  : 'opacity-30 hover:opacity-60'
                              }`}
                              style={{ backgroundColor: habit.color }}
                              title={`${habit.name} - ${isCompleted ? 'Completed' : 'Not completed'}`}
                            />
                          );
                        })}
                        {habits.length > 4 && (
                          <div className="text-xs text-gray-400 text-center">
                            +{habits.length - 4} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Habit Legend */}
        <div className="w-80">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
              Habits
            </h3>
            
            <div className="space-y-3">
              {habits.map(habit => {
                const monthCompletions = calendarData.days
                  .filter(day => day?.completions.some(c => c.habitId === habit.id))
                  .length;
                
                const totalDays = calendarData.days.filter(day => day !== null).length;
                const completionRate = totalDays > 0 ? Math.round((monthCompletions / totalDays) * 100) : 0;
                
                const habitCompletions = completions
                  .filter(c => c.habitId === habit.id)
                  .map(c => ({ date: c.date, completed: c.completed }));
                const currentStreak = calculateStreak(habitCompletions);
                
                return (
                  <div
                    key={habit.id}
                    className={`group p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedHabit?.id === habit.id
                        ? 'border-primary-300 bg-primary-50 dark:bg-primary-950 dark:border-primary-700'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedHabit(selectedHabit?.id === habit.id ? null : habit)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-4 h-4 rounded-full mt-0.5"
                        style={{ backgroundColor: habit.color }}
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {habit.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {completionRate}% complete this month
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1 ml-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(habit);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(habit);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Additional info when selected */}
                        {selectedHabit?.id === habit.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Flame className="w-4 h-4" />
                                <span>Current streak: {currentStreak} days</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{habit.frequency === 'daily' ? 'Daily' : 'Weekly'}</span>
                              </div>
                            </div>
                            
                            {habit.tags && habit.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                <Hash className="w-4 h-4" />
                                <span className="truncate">
                                  {habit.tags.slice(0, 3).join(', ')}
                                  {habit.tags.length > 3 && ` +${habit.tags.length - 3}`}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}