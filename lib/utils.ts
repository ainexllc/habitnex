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