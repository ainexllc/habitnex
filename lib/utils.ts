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
  return new Date().toISOString().split('T')[0];
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function calculateStreak(completions: { date: string; completed: boolean }[]): number {
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