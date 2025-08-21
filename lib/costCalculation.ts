import { DailyUsage, WeeklyUsage, MonthlyUsage, UsageBudgetConfig } from '@/types';

// Claude 3 Haiku pricing (as of 2024)
export const CLAUDE_PRICING = {
  // Input tokens per million
  INPUT_TOKEN_PRICE: 0.25, // $0.25 per 1M input tokens
  // Output tokens per million  
  OUTPUT_TOKEN_PRICE: 1.25, // $1.25 per 1M output tokens
  // Currency
  CURRENCY: 'USD'
} as const;

// Default budget configuration
export const DEFAULT_BUDGET_CONFIG: UsageBudgetConfig = {
  dailyBudget: 5.0, // $5 USD per day
  weeklyBudget: 30.0, // $30 USD per week
  monthlyBudget: 100.0, // $100 USD per month
  userDailyLimit: 10, // 10 requests per user per day
  emergencyShutoffThreshold: 150, // 150% of monthly budget
  alertThresholds: {
    warning: 75, // 75% of budget
    critical: 90 // 90% of budget
  }
};

/**
 * Calculate the cost of a Claude API call
 */
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * CLAUDE_PRICING.INPUT_TOKEN_PRICE;
  const outputCost = (outputTokens / 1_000_000) * CLAUDE_PRICING.OUTPUT_TOKEN_PRICE;
  const totalCost = inputCost + outputCost;
  
  // Round to 6 decimal places for precision
  return Math.round(totalCost * 1_000_000) / 1_000_000;
}

/**
 * Calculate estimated cost for a given number of tokens
 */
export function estimateCost(estimatedInputTokens: number, estimatedOutputTokens: number): number {
  return calculateCost(estimatedInputTokens, estimatedOutputTokens);
}

/**
 * Calculate cost efficiency metrics
 */
export function calculateCostEfficiency(totalCost: number, successfulRequests: number, totalRequests: number) {
  return {
    costPerSuccessfulRequest: successfulRequests > 0 ? totalCost / successfulRequests : 0,
    costPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
    successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
    efficiency: successfulRequests > 0 ? (successfulRequests / totalRequests) * (1 / (totalCost || 0.001)) : 0
  };
}

/**
 * Calculate daily cost projections based on current usage
 */
export function calculateDailyProjection(currentHourOfDay: number, currentCost: number): number {
  if (currentHourOfDay === 0) return currentCost * 24;
  
  const costPerHour = currentCost / currentHourOfDay;
  const remainingHours = 24 - currentHourOfDay;
  const projectedRemainingCost = costPerHour * remainingHours;
  
  return currentCost + projectedRemainingCost;
}

/**
 * Calculate weekly cost projections
 */
export function calculateWeeklyProjection(currentDayOfWeek: number, currentWeeklyCost: number): number {
  if (currentDayOfWeek === 0) return currentWeeklyCost * 7;
  
  const costPerDay = currentWeeklyCost / currentDayOfWeek;
  const remainingDays = 7 - currentDayOfWeek;
  const projectedRemainingCost = costPerDay * remainingDays;
  
  return currentWeeklyCost + projectedRemainingCost;
}

/**
 * Calculate monthly cost projections
 */
export function calculateMonthlyProjection(currentDayOfMonth: number, currentMonthlyCost: number): number {
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  
  if (currentDayOfMonth === 0) return currentMonthlyCost * daysInMonth;
  
  const costPerDay = currentMonthlyCost / currentDayOfMonth;
  const remainingDays = daysInMonth - currentDayOfMonth;
  const projectedRemainingCost = costPerDay * remainingDays;
  
  return currentMonthlyCost + projectedRemainingCost;
}

/**
 * Check if budget thresholds are exceeded
 */
export function checkBudgetThresholds(
  currentCost: number, 
  budget: number, 
  config: UsageBudgetConfig
): {
  isWarning: boolean;
  isCritical: boolean;
  isEmergency: boolean;
  percentage: number;
} {
  const percentage = budget > 0 ? (currentCost / budget) * 100 : 0;
  
  return {
    isWarning: percentage >= config.alertThresholds.warning,
    isCritical: percentage >= config.alertThresholds.critical,
    isEmergency: percentage >= config.emergencyShutoffThreshold,
    percentage
  };
}

/**
 * Calculate average cost metrics for a time period
 */
export function calculateAverageCosts(usage: DailyUsage[]): {
  avgCostPerDay: number;
  avgCostPerRequest: number;
  avgTokensPerRequest: number;
  avgCostPerToken: number;
} {
  if (usage.length === 0) {
    return {
      avgCostPerDay: 0,
      avgCostPerRequest: 0,
      avgTokensPerRequest: 0,
      avgCostPerToken: 0
    };
  }

  const totalCost = usage.reduce((sum, day) => sum + day.cost, 0);
  const totalRequests = usage.reduce((sum, day) => sum + day.requests, 0);
  const totalTokens = usage.reduce((sum, day) => sum + day.totalTokens, 0);

  return {
    avgCostPerDay: totalCost / usage.length,
    avgCostPerRequest: totalRequests > 0 ? totalCost / totalRequests : 0,
    avgTokensPerRequest: totalRequests > 0 ? totalTokens / totalRequests : 0,
    avgCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0
  };
}

/**
 * Format cost for display
 */
export function formatCost(cost: number, currency: string = CLAUDE_PRICING.CURRENCY): string {
  if (cost < 0.001) {
    return `<$0.001 ${currency}`;
  }
  
  if (cost < 0.01) {
    return `$${cost.toFixed(4)} ${currency}`;
  }
  
  return `$${cost.toFixed(2)} ${currency}`;
}

/**
 * Calculate cost savings from caching
 */
export function calculateCacheSavings(
  totalRequests: number,
  cacheHits: number,
  avgCostPerRequest: number
): {
  savedRequests: number;
  savedCost: number;
  savingsPercentage: number;
  cacheHitRate: number;
} {
  const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;
  const savedCost = cacheHits * avgCostPerRequest;
  const savingsPercentage = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

  return {
    savedRequests: cacheHits,
    savedCost,
    savingsPercentage,
    cacheHitRate
  };
}

/**
 * Calculate token usage patterns
 */
export function analyzeTokenUsage(
  inputTokens: number[], 
  outputTokens: number[]
): {
  avgInputTokens: number;
  avgOutputTokens: number;
  totalTokens: number;
  inputOutputRatio: number;
  tokenVariance: {
    inputVariance: number;
    outputVariance: number;
  };
} {
  const avgInputTokens = inputTokens.length > 0 
    ? inputTokens.reduce((sum, tokens) => sum + tokens, 0) / inputTokens.length 
    : 0;
  
  const avgOutputTokens = outputTokens.length > 0
    ? outputTokens.reduce((sum, tokens) => sum + tokens, 0) / outputTokens.length
    : 0;

  const totalTokens = inputTokens.reduce((sum, tokens) => sum + tokens, 0) + 
                     outputTokens.reduce((sum, tokens) => sum + tokens, 0);

  const inputOutputRatio = avgInputTokens > 0 ? avgOutputTokens / avgInputTokens : 0;

  // Calculate variance
  const inputVariance = inputTokens.length > 1
    ? inputTokens.reduce((sum, tokens) => sum + Math.pow(tokens - avgInputTokens, 2), 0) / (inputTokens.length - 1)
    : 0;

  const outputVariance = outputTokens.length > 1
    ? outputTokens.reduce((sum, tokens) => sum + Math.pow(tokens - avgOutputTokens, 2), 0) / (outputTokens.length - 1)
    : 0;

  return {
    avgInputTokens,
    avgOutputTokens,
    totalTokens,
    inputOutputRatio,
    tokenVariance: {
      inputVariance,
      outputVariance
    }
  };
}

/**
 * Generate cost optimization recommendations
 */
export function generateCostOptimizationTips(
  avgCostPerRequest: number,
  cacheHitRate: number,
  successRate: number,
  avgResponseTime: number
): string[] {
  const tips: string[] = [];

  // High cost per request
  if (avgCostPerRequest > 0.01) {
    tips.push('Consider optimizing prompts to reduce token usage and lower costs');
  }

  // Low cache hit rate
  if (cacheHitRate < 50) {
    tips.push('Enable caching for similar requests to reduce API calls and costs');
  }

  // Low success rate
  if (successRate < 90) {
    tips.push('Improve input validation to reduce failed requests and wasted costs');
  }

  // Slow response times
  if (avgResponseTime > 5000) {
    tips.push('Consider using parallel processing or request batching to improve efficiency');
  }

  // General optimization tips
  if (tips.length === 0) {
    tips.push('Your AI usage is well-optimized! Keep monitoring for cost efficiency opportunities');
  }

  return tips;
}

/**
 * Calculate budget runway (how long current budget will last)
 */
export function calculateBudgetRunway(
  currentMonthlyCost: number,
  monthlyBudget: number,
  daysIntoMonth: number
): {
  daysRemaining: number;
  budgetRemaining: number;
  dailyBurnRate: number;
  projectedOverage: number;
} {
  const dailyBurnRate = daysIntoMonth > 0 ? currentMonthlyCost / daysIntoMonth : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - daysIntoMonth;
  const budgetRemaining = monthlyBudget - currentMonthlyCost;
  const projectedTotalCost = currentMonthlyCost + (dailyBurnRate * remainingDays);
  const projectedOverage = Math.max(0, projectedTotalCost - monthlyBudget);

  const daysRemaining = dailyBurnRate > 0 && budgetRemaining > 0 
    ? budgetRemaining / dailyBurnRate 
    : remainingDays;

  return {
    daysRemaining: Math.max(0, daysRemaining),
    budgetRemaining,
    dailyBurnRate,
    projectedOverage
  };
}