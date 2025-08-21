import { HabitCompletion, Habit } from '@/types';
import { getTodayDateString, getDateString, addDays } from './utils';

export interface HeatmapDay {
  date: Date;
  dateString: string;
  completionCount: number;
  totalHabits: number;
  completionRate: number;
  completedHabits: string[];
  isToday: boolean;
  isWeekend: boolean;
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
}

export interface HeatmapData {
  weeks: HeatmapWeek[];
  startDate: Date;
  endDate: Date;
  totalDays: number;
  monthLabels: Array<{
    month: string;
    weekIndex: number;
    position: number;
  }>;
}

/**
 * Convert habit completions into daily completion counts for heatmap display
 */
export function processCompletionsForHeatmap(
  habits: Habit[], 
  completions: HabitCompletion[], 
  days: number = 365
): HeatmapData {
  const today = new Date();
  const endDate = new Date(today);
  const startDate = addDays(today, -days + 1);
  
  // Create a map of date strings to completion data
  const dateCompletionMap = new Map<string, {
    completionCount: number;
    totalHabits: number;
    completedHabits: string[];
  }>();

  // Initialize all dates with zero completions
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dateString = getDateString(date);
    dateCompletionMap.set(dateString, {
      completionCount: 0,
      totalHabits: habits.length,
      completedHabits: []
    });
  }

  // Process completions
  completions.forEach(completion => {
    const dateData = dateCompletionMap.get(completion.date);
    if (dateData && completion.completed) {
      dateData.completionCount++;
      const habit = habits.find(h => h.id === completion.habitId);
      if (habit) {
        dateData.completedHabits.push(habit.name);
      }
    }
  });

  // Generate weeks starting from the first Sunday before or equal to startDate
  const firstSunday = new Date(startDate);
  firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

  const weeks: HeatmapWeek[] = [];
  const monthLabels: Array<{ month: string; weekIndex: number; position: number }> = [];
  
  let currentDate = new Date(firstSunday);
  let weekIndex = 0;
  let lastMonth = -1;

  // Generate 53 weeks to cover a full year
  while (weekIndex < 53) {
    const week: HeatmapWeek = { days: [] };
    
    // Track month changes for labels
    const monthOfFirstDay = currentDate.getMonth();
    if (monthOfFirstDay !== lastMonth) {
      monthLabels.push({
        month: currentDate.toLocaleDateString('en-US', { month: 'short' }),
        weekIndex,
        position: currentDate.getDay() // Position within the week
      });
      lastMonth = monthOfFirstDay;
    }

    // Generate 7 days for this week
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dateString = getDateString(currentDate);
      const dateData = dateCompletionMap.get(dateString);
      
      // Only include days within our target range
      if (currentDate >= startDate && currentDate <= endDate) {
        const completionRate = dateData && dateData.totalHabits > 0 
          ? Math.round((dateData.completionCount / dateData.totalHabits) * 100)
          : 0;

        const heatmapDay: HeatmapDay = {
          date: new Date(currentDate),
          dateString,
          completionCount: dateData?.completionCount || 0,
          totalHabits: dateData?.totalHabits || habits.length,
          completionRate,
          completedHabits: dateData?.completedHabits || [],
          isToday: dateString === getTodayDateString(),
          isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6
        };
        
        week.days.push(heatmapDay);
      } else if (currentDate < startDate) {
        // Empty cell before start date
        week.days.push(null);
      } else {
        // Empty cell after end date
        week.days.push(null);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    weeks.push(week);
    weekIndex++;
  }

  return {
    weeks,
    startDate,
    endDate,
    totalDays: days,
    monthLabels
  };
}

/**
 * Get color intensity class based on completion rate
 */
export function getHeatmapIntensity(completionRate: number): string {
  if (completionRate === 0) {
    return 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
  } else if (completionRate <= 25) {
    return 'bg-primary-200 dark:bg-primary-900 border-primary-300 dark:border-primary-800';
  } else if (completionRate <= 50) {
    return 'bg-primary-400 dark:bg-primary-800 border-primary-500 dark:border-primary-700';
  } else if (completionRate <= 75) {
    return 'bg-primary-600 dark:bg-primary-700 border-primary-700 dark:border-primary-600';
  } else {
    return 'bg-primary-800 dark:bg-primary-600 border-primary-900 dark:border-primary-500';
  }
}

/**
 * Get hover color for interactive states
 */
export function getHeatmapHoverIntensity(completionRate: number): string {
  if (completionRate === 0) {
    return 'hover:bg-gray-300 dark:hover:bg-gray-600';
  } else if (completionRate <= 25) {
    return 'hover:bg-primary-300 dark:hover:bg-primary-800';
  } else if (completionRate <= 50) {
    return 'hover:bg-primary-500 dark:hover:bg-primary-700';
  } else if (completionRate <= 75) {
    return 'hover:bg-primary-700 dark:hover:bg-primary-600';
  } else {
    return 'hover:bg-primary-900 dark:hover:bg-primary-500';
  }
}

/**
 * Generate tooltip content for a heatmap day
 */
export function generateTooltipContent(day: HeatmapDay): string {
  const dateStr = day.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (day.completionCount === 0) {
    return `No habits completed on ${dateStr}`;
  } else if (day.completionCount === 1) {
    return `1 habit completed on ${dateStr}${day.completedHabits.length > 0 ? `\n${day.completedHabits[0]}` : ''}`;
  } else {
    const habitsList = day.completedHabits.length > 3 
      ? `${day.completedHabits.slice(0, 3).join(', ')} +${day.completedHabits.length - 3} more`
      : day.completedHabits.join(', ');
    return `${day.completionCount} habits completed on ${dateStr}${habitsList ? `\n${habitsList}` : ''}`;
  }
}

/**
 * Calculate overall statistics from heatmap data
 */
export function calculateHeatmapStats(heatmapData: HeatmapData) {
  const validDays = heatmapData.weeks
    .flatMap(week => week.days)
    .filter((day): day is HeatmapDay => day !== null);

  const totalCompletions = validDays.reduce((sum, day) => sum + day.completionCount, 0);
  const daysWithActivity = validDays.filter(day => day.completionCount > 0).length;
  const averageCompletionRate = validDays.length > 0 
    ? validDays.reduce((sum, day) => sum + day.completionRate, 0) / validDays.length
    : 0;

  // Find longest streak of active days
  let currentStreak = 0;
  let longestStreak = 0;
  
  for (const day of validDays.reverse()) { // Start from most recent
    if (day.completionCount > 0) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalCompletions,
    daysWithActivity,
    totalDays: validDays.length,
    averageCompletionRate: Math.round(averageCompletionRate),
    longestStreak,
    currentStreak: calculateCurrentStreak(validDays)
  };
}

/**
 * Calculate current streak of active days from today backwards
 */
function calculateCurrentStreak(validDays: HeatmapDay[]): number {
  const sortedDays = validDays
    .filter(day => day.dateString <= getTodayDateString())
    .sort((a, b) => new Date(b.dateString).getTime() - new Date(a.dateString).getTime());

  let streak = 0;
  for (const day of sortedDays) {
    if (day.completionCount > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get contribution level for GitHub-style display
 */
export function getContributionLevel(completionRate: number): 0 | 1 | 2 | 3 | 4 {
  if (completionRate === 0) return 0;
  if (completionRate <= 25) return 1;
  if (completionRate <= 50) return 2;
  if (completionRate <= 75) return 3;
  return 4;
}