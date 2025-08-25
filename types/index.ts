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
    timeFormat: '12h' | '24h'; // 12-hour or 24-hour time format
    locale: string; // For date/time formatting (e.g., 'en-US', 'en-GB')
  };
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  tags?: string[]; // Flexible custom tags instead of single category (optional)
  color: string; // hex color
  frequency: 'daily' | 'weekly' | 'interval';
  targetDays: number[]; // For weekly: [0,1,2,3,4,5,6], for daily: [0,1,2,3,4,5,6]
  intervalDays?: number; // For interval frequency: every X days
  startDate?: string; // For interval habits: when to start counting (YYYY-MM-DD)
  reminderTime?: string; // For interval habits: preferred time (HH:MM format or morning/afternoon/evening)
  reminderType?: 'specific' | 'general'; // specific = HH:MM, general = morning/afternoon/evening
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isArchived: boolean;
  goal?: {
    type: 'streak' | 'completion';
    target: number;
    period: 'weekly' | 'monthly';
  };
  // AI Enhancement fields
  aiEnhanced?: boolean; // Track if habit was enhanced by AI
  tip?: string; // Comprehensive success strategy from AI (up to 2000 chars)
  healthBenefits?: string; // Detailed health benefits description
  mentalBenefits?: string; // Detailed mental/emotional benefits description
  longTermBenefits?: string; // Detailed long-term benefits description
  complementary?: string[]; // Complementary habits suggested by AI
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
  tags?: string[];
  color: string;
  frequency: 'daily' | 'weekly' | 'interval';
  targetDays: number[];
  intervalDays?: number;
  startDate?: string;
  reminderTime?: string;
  reminderType?: 'specific' | 'general';
  goal?: {
    type: 'streak' | 'completion';
    target: number;
    period: 'weekly' | 'monthly';
  };
  // AI Enhancement fields
  aiEnhanced?: boolean;
  tip?: string; // Comprehensive success strategy from AI (up to 2000 chars)
  healthBenefits?: string;
  mentalBenefits?: string;
  longTermBenefits?: string;
  complementary?: string[];
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

// Mood-Habit Correlation types
export interface MoodHabitCorrelation {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  completionRate: number;
  completedHabits: number;
  totalHabits: number;
  moodScore: number;
}

export interface HabitMoodImpact {
  habitId: string;
  avgMoodCompleted: number;
  avgMoodNotCompleted: number;
  moodDifference: number;
  completedDaysCount: number;
  notCompletedDaysCount: number;
  totalDaysWithData: number;
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

// Mood Pattern Analysis types
export interface MoodHabitCorrelationData {
  date: string;
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
  completionRate: number;
  completedHabits: number;
  totalHabits: number;
  compositeScore: number;
}

export interface CorrelationCoefficients {
  mood: number;
  energy: number;
  stress: number;
  sleep: number;
}

export interface OptimalMoodRange {
  mood: [number, number];
  energy: [number, number];
  stress: [number, number];
  sleep: [number, number];
}

export interface MoodAnalysisInsights {
  strongestPositiveCorrelation: string;
  strongestNegativeCorrelation: string;
  optimalMoodRange: OptimalMoodRange;
}

export interface MoodAnalysisStatistics {
  totalDaysAnalyzed: number;
  avgCompletionRate: number;
  avgMoodScores: {
    mood: number;
    energy: number;
    stress: number;
    sleep: number;
  };
}

export interface MoodAnalysisResult {
  correlations: CorrelationCoefficients;
  insights: MoodAnalysisInsights;
  recommendations: string[];
  statistics: MoodAnalysisStatistics;
  patterns: MoodHabitCorrelationData[];
}

export interface EnhancedMoodAnalysisResponse extends MoodAnalysisResult {
  aiInsight: string;
  primaryFactor: 'mood' | 'energy' | 'stress' | 'sleep';
  aiRecommendation: string;
  encouragement: string;
}

export interface MoodAnalysisRequest {
  startDate: string;
  endDate: string;
  userId?: string;
}

export interface MoodAnalysisApiResponse {
  success: boolean;
  data?: EnhancedMoodAnalysisResponse;
  error?: string;
  meta?: {
    dateRange: { startDate: string; endDate: string };
    daysAnalyzed: number;
    hasAiInsights: boolean;
    generatedAt: string;
  };
}

// Usage Tracking Types
export interface UsageRecord {
  id: string;
  userId: string;
  endpoint: string; // enhance-habit, quick-insight, mood-analysis
  timestamp: Timestamp;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number; // in USD
  duration: number; // response time in ms
  success: boolean;
  errorCode?: string;
  cacheHit?: boolean;
  userAgent?: string;
  ipAddress?: string;
  requestId?: string;
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  requests: number;
  totalTokens: number;
  cost: number;
  successRate: number;
  avgResponseTime: number;
  endpoints: Record<string, number>; // endpoint -> request count
}

export interface WeeklyUsage {
  weekStart: string; // YYYY-MM-DD (Monday)
  requests: number;
  totalTokens: number;
  cost: number;
  successRate: number;
  avgResponseTime: number;
  dailyBreakdown: DailyUsage[];
}

export interface MonthlyUsage {
  month: string; // YYYY-MM
  requests: number;
  totalTokens: number;
  cost: number;
  successRate: number;
  avgResponseTime: number;
  weeklyBreakdown: WeeklyUsage[];
}

export interface UserUsageSummary {
  userId: string;
  lastUpdated: Timestamp;
  daily: DailyUsage;
  weekly: WeeklyUsage;
  monthly: MonthlyUsage;
  totalCost: number;
  totalRequests: number;
  dailyLimit: number;
  isLimitExceeded: boolean;
  nextResetTime: Timestamp;
}

export interface SystemUsageStats {
  date: string; // YYYY-MM-DD
  totalUsers: number;
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  avgCostPerRequest: number;
  avgTokensPerRequest: number;
  successRate: number;
  avgResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    cost: number;
    avgResponseTime: number;
  }>;
  hourlyDistribution: Array<{
    hour: number; // 0-23
    requests: number;
    cost: number;
  }>;
}

export interface UsageBudgetConfig {
  dailyBudget: number; // USD
  weeklyBudget: number; // USD
  monthlyBudget: number; // USD
  userDailyLimit: number; // requests
  emergencyShutoffThreshold: number; // percentage of monthly budget
  alertThresholds: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

export interface UsageAlert {
  id: string;
  type: 'budget_warning' | 'budget_critical' | 'user_limit' | 'system_limit' | 'unusual_usage';
  message: string;
  threshold: number;
  currentValue: number;
  timestamp: Timestamp;
  resolved: boolean;
  userId?: string; // if user-specific alert
}

export interface UsageAnalyticsResponse {
  success: boolean;
  data?: {
    userStats?: UserUsageSummary;
    systemStats?: SystemUsageStats;
    alerts?: UsageAlert[];
    budgetStatus?: {
      current: UsageBudgetConfig;
      usage: {
        daily: { spent: number; percentage: number };
        weekly: { spent: number; percentage: number };
        monthly: { spent: number; percentage: number };
      };
    };
  };
  error?: string;
}

export interface EndpointUsageStats {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  avgCost: number;
  avgResponseTime: number;
  avgTokensPerRequest: number;
  cacheHitRate: number;
  lastUsed: Timestamp;
  hourlyDistribution: number[]; // 24 hours
}