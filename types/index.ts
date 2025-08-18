import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  timezone: string;
  preferences: {
    theme: 'light' | 'dark';
    weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, etc.
    notifications: boolean;
  };
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  color: string; // hex color
  frequency: 'daily' | 'weekly' | 'interval';
  targetDays: number[]; // For weekly: [0,1,2,3,4,5,6], for daily: [0,1,2,3,4,5,6]
  intervalDays?: number; // For interval frequency: every X days
  startDate?: string; // For interval habits: when to start counting (YYYY-MM-DD)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isArchived: boolean;
  goal?: {
    type: 'streak' | 'completion';
    target: number;
    period: 'weekly' | 'monthly';
  };
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  notes?: string;
  timestamp: Timestamp;
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD format
  mood: 1 | 2 | 3 | 4 | 5; // 1 = very bad, 5 = excellent
  energy: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  stress: 1 | 2 | 3 | 4 | 5; // 1 = very low, 5 = very high
  sleep: 1 | 2 | 3 | 4 | 5; // 1 = very poor, 5 = excellent
  notes?: string;
  tags?: string[]; // e.g., ['work-stress', 'family-time', 'exercise']
  timestamp: Timestamp;
}

export interface HabitCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  completionRate: number; // percentage
  totalCompletions: number;
  lastCompleted?: string; // date string
}

export interface DashboardData {
  todayHabits: Habit[];
  completions: HabitCompletion[];
  stats: HabitStats[];
  streaks: {
    current: number;
    longest: number;
  };
}

// Form types
export interface CreateHabitForm {
  name: string;
  description?: string;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'interval';
  targetDays: number[];
  intervalDays?: number;
  startDate?: string;
  goal?: {
    type: 'streak' | 'completion';
    target: number;
    period: 'weekly' | 'monthly';
  };
}

export interface AuthForm {
  email: string;
  password: string;
}

export interface SignUpForm extends AuthForm {
  confirmPassword: string;
  displayName?: string;
}

export interface CreateMoodForm {
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  tags?: string[];
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Theme types
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
}