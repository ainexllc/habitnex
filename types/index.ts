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
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays: number[]; // For weekly: [0,1,2,3,4,5,6], for daily: [0,1,2,3,4,5,6]
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
  frequency: 'daily' | 'weekly' | 'custom';
  targetDays: number[];
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