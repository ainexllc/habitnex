// TypeScript interfaces for Claude AI features

export interface HabitEnhancement {
  description: string;
  healthBenefits: string;
  mentalBenefits: string;
  longTermBenefits: string;
  difficulty: 'easy' | 'medium' | 'hard'; // Keep for enhancement card display only
  tip: string;
  bestTime: 'morning' | 'afternoon' | 'evening'; // Keep for enhancement card display only
  duration: string; // Keep for enhancement card display only
  complementary: string[];
}

export interface EnhancementResponse {
  success: boolean;
  data?: HabitEnhancement;
  cached: boolean;
  cost: number;
  responseTime?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface InsightResponse {
  success: boolean;
  insight: string;
  cached: boolean;
  cost: number;
  responseTime?: number;
  method?: 'template' | 'ai';
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  error?: string;
}

export interface MoodAnalysis {
  pattern: 'improving' | 'declining' | 'stable' | 'mixed';
  insight: string;
  suggestion: string;
}

export interface MoodAnalysisResponse {
  success: boolean;
  data?: MoodAnalysis;
  cached: boolean;
  cost: number;
  error?: string;
}

export interface AIUsageStats {
  totalRequests: number;
  totalCost: number;
  cacheHitRate: number;
  averageCostPerRequest: number;
  requestsByFeature: {
    habitEnhancement: number;
    quickInsights: number;
    moodAnalysis: number;
  };
}

export interface RateLimitError {
  error: string;
  resetTime: number;
  remainingRequests: number;
}