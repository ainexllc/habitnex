import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Timezone-safe date string for current user's local date
// This should be used instead of new Date().toISOString().split('T')[0]
export function getLocalDateString(date?: Date): string {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get local date string for any timezone offset (for server-side use)
export function getLocalDateStringForTimezone(timezoneOffsetMinutes: number, date?: Date): string {
  const d = date || new Date();
  const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  const localTime = new Date(utc + (timezoneOffsetMinutes * 60000));
  
  const year = localTime.getFullYear();
  const month = String(localTime.getMonth() + 1).padStart(2, '0');
  const day = String(localTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return getDateString(date);
}

// Overloaded function for calculateStreak
export function calculateStreak(habitId: string, completions: { habitId: string; date: string; completed: boolean }[]): number;
export function calculateStreak(completions: { date: string; completed: boolean }[]): number;
export function calculateStreak(
  habitIdOrCompletions: string | { date: string; completed: boolean }[], 
  completions?: { habitId: string; date: string; completed: boolean }[]
): number {
  let filteredCompletions: { date: string; completed: boolean }[];
  
  if (typeof habitIdOrCompletions === 'string' && completions) {
    // First overload: filter by habitId
    filteredCompletions = completions
      .filter(c => c.habitId === habitIdOrCompletions)
      .map(c => ({ date: c.date, completed: c.completed }));
  } else if (Array.isArray(habitIdOrCompletions)) {
    // Second overload: use completions directly
    filteredCompletions = habitIdOrCompletions;
  } else {
    return 0;
  }
  
  return calculateStreakInternal(filteredCompletions);
}

function calculateStreakInternal(completions: { date: string; completed: boolean }[]): number {
  if (completions.length === 0) return 0;
  
  const sortedCompletions = completions
    .filter(c => c.completed)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  if (sortedCompletions.length === 0) return 0;
  
  let streak = 0;
  const today = getTodayDateString();
  
  for (let i = 0; i < sortedCompletions.length; i++) {
    const completion = sortedCompletions[i];
    const expectedDate = addDays(new Date(today), -i);
    const expectedDateString = getDateString(expectedDate);
    
    if (completion.date === expectedDateString) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

export function calculateCompletionRate(completions: { completed: boolean }[], days: number = 30): number {
  if (completions.length === 0) return 0;
  
  const recentCompletions = completions.slice(0, days);
  const completedCount = recentCompletions.filter(c => c.completed).length;
  
  return Math.round((completedCount / recentCompletions.length) * 100);
}

// Interval habit utilities
export function isHabitDueToday(habit: any, today: string = getTodayDateString()): boolean {
  if (habit.frequency === 'daily') {
    return true;
  }
  
  if (habit.frequency === 'weekly') {
    const todayDayOfWeek = new Date(today).getDay();
    return habit.targetDays?.includes(todayDayOfWeek) || false;
  }
  
  if (habit.frequency === 'interval' && habit.startDate && habit.intervalDays) {
    const startDate = new Date(habit.startDate);
    const todayDate = new Date(today);
    const daysDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 0 && daysDiff % habit.intervalDays === 0;
  }
  
  return false;
}

export function getNextDueDate(habit: any, fromDate: string = getTodayDateString()): string | null {
  if (habit.frequency === 'daily') {
    return fromDate;
  }
  
  if (habit.frequency === 'weekly') {
    const today = new Date(fromDate);
    const todayDayOfWeek = today.getDay();
    
    // Find next day in targetDays
    const sortedTargetDays = [...(habit.targetDays || [])].sort();
    
    for (const targetDay of sortedTargetDays) {
      if (targetDay > todayDayOfWeek) {
        const daysUntil = targetDay - todayDayOfWeek;
        return getDateString(addDays(today, daysUntil));
      }
    }
    
    // If no day this week, get first day of next week
    if (sortedTargetDays.length > 0) {
      const daysUntilNextWeek = 7 - todayDayOfWeek + sortedTargetDays[0];
      return getDateString(addDays(today, daysUntilNextWeek));
    }
  }
  
  if (habit.frequency === 'interval' && habit.startDate && habit.intervalDays) {
    const startDate = new Date(habit.startDate);
    const fromDateObj = new Date(fromDate);
    
    if (fromDateObj < startDate) {
      return habit.startDate;
    }
    
    const daysSinceStart = Math.floor((fromDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysSinceLastDue = daysSinceStart % habit.intervalDays;
    
    if (daysSinceLastDue === 0) {
      return fromDate; // Due today
    }
    
    const daysUntilNext = habit.intervalDays - daysSinceLastDue;
    return getDateString(addDays(fromDateObj, daysUntilNext));
  }
  
  return null;
}

export function getDaysUntilDue(habit: any, fromDate: string = getTodayDateString()): number | null {
  const nextDue = getNextDueDate(habit, fromDate);
  if (!nextDue) return null;
  
  const today = new Date(fromDate);
  const dueDate = new Date(nextDue);
  
  return Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isHabitOverdue(habit: any, completions: any[], fromDate: string = getTodayDateString()): boolean {
  if (habit.frequency === 'interval' && habit.startDate && habit.intervalDays) {
    const startDate = new Date(habit.startDate);
    const today = new Date(fromDate);
    
    if (today < startDate) return false; // Not started yet
    
    const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const intervalsPassed = Math.floor(daysSinceStart / habit.intervalDays);
    
    // Check if there should have been completions that are missing
    for (let i = 0; i <= intervalsPassed; i++) {
      const expectedDate = new Date(startDate);
      expectedDate.setDate(expectedDate.getDate() + (i * habit.intervalDays));
      const expectedDateString = getDateString(expectedDate);
      
      // If this expected date is in the past and not completed, it's overdue
      if (expectedDate <= today) {
        const hasCompletion = completions.some(c => 
          c.date === expectedDateString && c.completed && c.habitId === habit.id
        );
        if (!hasCompletion) {
          return true; // Found a missing completion = overdue
        }
      }
    }
  }
  
  return false;
}

export function calculateIntervalStreak(habit: any, completions: any[]): number {
  if (habit.frequency !== 'interval' || !habit.startDate || !habit.intervalDays) {
    return calculateStreak(completions); // Fall back to regular streak for non-interval
  }
  
  const startDate = new Date(habit.startDate);
  const today = new Date();
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const intervalsPassed = Math.floor(daysSinceStart / habit.intervalDays);
  
  let streak = 0;
  
  // Check backwards from the most recent expected completion
  for (let i = intervalsPassed; i >= 0; i--) {
    const expectedDate = new Date(startDate);
    expectedDate.setDate(expectedDate.getDate() + (i * habit.intervalDays));
    const expectedDateString = getDateString(expectedDate);
    
    // Only count if this date is in the past or today
    if (expectedDate <= today) {
      const hasCompletion = completions.some(c => 
        c.date === expectedDateString && c.completed && c.habitId === habit.id
      );
      
      if (hasCompletion) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
  }
  
  return streak;
}