import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  UsageRecord, 
  UserUsageSummary, 
  SystemUsageStats,
  DailyUsage,
  WeeklyUsage,
  MonthlyUsage,
  UsageBudgetConfig,
  UsageAlert,
  EndpointUsageStats
} from '@/types';
import { calculateCost, DEFAULT_BUDGET_CONFIG, checkBudgetThresholds } from './costCalculation';

// Collection names
const USAGE_RECORDS_COLLECTION = 'usage_tracking';
const USER_USAGE_SUMMARY_COLLECTION = 'user_usage_summary';
const SYSTEM_USAGE_STATS_COLLECTION = 'system_usage_stats';
const USAGE_ALERTS_COLLECTION = 'usage_alerts';
const USAGE_CONFIG_COLLECTION = 'usage_config';

/**
 * Track an API usage event
 */
export async function trackAPIUsage(
  userId: string,
  endpoint: string,
  inputTokens: number,
  outputTokens: number,
  duration: number,
  success: boolean,
  errorCode?: string,
  cacheHit: boolean = false,
  userAgent?: string | null,
  ipAddress?: string | null,
  requestId?: string
): Promise<string> {
  try {
    const cost = calculateCost(inputTokens, outputTokens);
    const timestamp = Timestamp.now();
    const totalTokens = inputTokens + outputTokens;

    const usageRecord: Omit<UsageRecord, 'id'> = {
      userId,
      endpoint,
      timestamp,
      inputTokens,
      outputTokens,
      totalTokens,
      cost,
      duration,
      success,
      ...(errorCode && { errorCode }), // Only include errorCode if it's defined
      cacheHit,
      ...(userAgent && { userAgent }), // Only include userAgent if it's defined
      ...(ipAddress && { ipAddress }), // Only include ipAddress if it's defined
      ...(requestId && { requestId }) // Only include requestId if it's defined
    };

    // Add usage record
    const docRef = await addDoc(collection(db, USAGE_RECORDS_COLLECTION), usageRecord);

    // Update user and system summaries asynchronously (don't wait for these)
    updateUserUsageSummary(userId, endpoint, cost, duration, success, cacheHit, timestamp).catch(err => 
      console.warn('Failed to update user usage summary:', err)
    );
    updateSystemUsageStats(endpoint, cost, duration, success, timestamp, userId).catch(err => 
      console.warn('Failed to update system usage stats:', err)
    );

    // Check for budget alerts (don't wait for this)
    checkAndCreateAlerts(userId, cost, endpoint).catch(err => 
      console.warn('Failed to check budget alerts:', err)
    );

    return docRef.id;
  } catch (error) {
    console.error('Error tracking API usage:', error);
    // Return a dummy ID instead of throwing - this allows the main API call to continue
    return 'tracking-failed-' + Date.now();
  }
}

/**
 * Update user usage summary
 */
async function updateUserUsageSummary(
  userId: string,
  endpoint: string,
  cost: number,
  duration: number,
  success: boolean,
  cacheHit: boolean,
  timestamp: Timestamp
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userSummaryRef = doc(db, USER_USAGE_SUMMARY_COLLECTION, userId);
    const userSummaryDoc = await getDoc(userSummaryRef);

    const now = new Date();
    const weekStart = getWeekStart(now).toISOString().split('T')[0];
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    if (!userSummaryDoc.exists()) {
      // Create new user summary
      const newSummary: UserUsageSummary = {
        userId,
        lastUpdated: timestamp,
        daily: createDailyUsage(today, 1, cost, duration, success, endpoint),
        weekly: createWeeklyUsage(weekStart, 1, cost, duration, success),
        monthly: createMonthlyUsage(monthStr, 1, cost, duration, success),
        totalCost: cost,
        totalRequests: 1,
        dailyLimit: DEFAULT_BUDGET_CONFIG.userDailyLimit,
        isLimitExceeded: false,
        nextResetTime: getNextResetTime()
      };

      await updateDoc(userSummaryRef, newSummary as any);
    } else {
      // Update existing summary
      const currentSummary = userSummaryDoc.data() as UserUsageSummary;
      const batch = writeBatch(db);

      // Update daily stats
      if (currentSummary.daily.date === today) {
        currentSummary.daily = updateDailyUsage(currentSummary.daily, 1, cost, duration, success, endpoint);
      } else {
        currentSummary.daily = createDailyUsage(today, 1, cost, duration, success, endpoint);
      }

      // Update weekly stats
      if (currentSummary.weekly.weekStart === weekStart) {
        currentSummary.weekly = updateWeeklyUsage(currentSummary.weekly, 1, cost, duration, success);
      } else {
        currentSummary.weekly = createWeeklyUsage(weekStart, 1, cost, duration, success);
      }

      // Update monthly stats
      if (currentSummary.monthly.month === monthStr) {
        currentSummary.monthly = updateMonthlyUsage(currentSummary.monthly, 1, cost, duration, success);
      } else {
        currentSummary.monthly = createMonthlyUsage(monthStr, 1, cost, duration, success);
      }

      // Update totals and limits
      currentSummary.totalCost += cost;
      currentSummary.totalRequests += 1;
      currentSummary.lastUpdated = timestamp;
      currentSummary.isLimitExceeded = currentSummary.daily.requests >= currentSummary.dailyLimit;

      batch.update(userSummaryRef, currentSummary as any);
      await batch.commit();
    }
  } catch (error) {
    console.error('Error updating user usage summary:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Update system usage stats
 */
async function updateSystemUsageStats(
  endpoint: string,
  cost: number,
  duration: number,
  success: boolean,
  timestamp: Timestamp,
  userId: string
): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const hour = new Date().getHours();
    
    const systemStatsRef = doc(db, SYSTEM_USAGE_STATS_COLLECTION, today);
    const systemStatsDoc = await getDoc(systemStatsRef);

    if (!systemStatsDoc.exists()) {
      // Create new system stats
      const hourlyDistribution = Array(24).fill(0).map((_, i) => ({
        hour: i,
        requests: i === hour ? 1 : 0,
        cost: i === hour ? cost : 0
      }));

      const newStats: SystemUsageStats = {
        date: today,
        totalUsers: 1,
        totalRequests: 1,
        totalTokens: 0, // Will be updated by separate token tracking
        totalCost: cost,
        avgCostPerRequest: cost,
        avgTokensPerRequest: 0,
        successRate: success ? 100 : 0,
        avgResponseTime: duration,
        topEndpoints: [{
          endpoint,
          requests: 1,
          cost,
          avgResponseTime: duration
        }],
        hourlyDistribution
      };

      await updateDoc(systemStatsRef, newStats as any);
    } else {
      // Update existing stats
      const currentStats = systemStatsDoc.data() as SystemUsageStats;
      const batch = writeBatch(db);

      currentStats.totalRequests += 1;
      currentStats.totalCost += cost;
      currentStats.avgCostPerRequest = currentStats.totalCost / currentStats.totalRequests;
      
      // Update success rate
      const previousSuccessCount = Math.round((currentStats.successRate / 100) * (currentStats.totalRequests - 1));
      const newSuccessCount = previousSuccessCount + (success ? 1 : 0);
      currentStats.successRate = (newSuccessCount / currentStats.totalRequests) * 100;

      // Update average response time
      const previousTotalTime = currentStats.avgResponseTime * (currentStats.totalRequests - 1);
      currentStats.avgResponseTime = (previousTotalTime + duration) / currentStats.totalRequests;

      // Update hourly distribution
      const hourlyEntry = currentStats.hourlyDistribution.find(h => h.hour === hour);
      if (hourlyEntry) {
        hourlyEntry.requests += 1;
        hourlyEntry.cost += cost;
      }

      // Update top endpoints
      const endpointEntry = currentStats.topEndpoints.find(e => e.endpoint === endpoint);
      if (endpointEntry) {
        const prevTotalTime = endpointEntry.avgResponseTime * endpointEntry.requests;
        endpointEntry.requests += 1;
        endpointEntry.cost += cost;
        endpointEntry.avgResponseTime = (prevTotalTime + duration) / endpointEntry.requests;
      } else {
        currentStats.topEndpoints.push({
          endpoint,
          requests: 1,
          cost,
          avgResponseTime: duration
        });
      }

      // Sort and limit top endpoints
      currentStats.topEndpoints.sort((a, b) => b.requests - a.requests);
      currentStats.topEndpoints = currentStats.topEndpoints.slice(0, 10);

      batch.update(systemStatsRef, currentStats as any);
      await batch.commit();
    }
  } catch (error) {
    console.error('Error updating system usage stats:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Check usage limits before making API call
 */
export async function checkUsageLimits(userId: string): Promise<{
  canProceed: boolean;
  reason?: string;
  remainingRequests?: number;
  resetTime?: Date;
}> {
  try {
    const userSummaryRef = doc(db, USER_USAGE_SUMMARY_COLLECTION, userId);
    const userSummaryDoc = await getDoc(userSummaryRef);

    if (!userSummaryDoc.exists()) {
      // New user - can proceed
      return {
        canProceed: true,
        remainingRequests: DEFAULT_BUDGET_CONFIG.userDailyLimit
      };
    }

    const summary = userSummaryDoc.data() as UserUsageSummary;
    const today = new Date().toISOString().split('T')[0];

    // Check if it's a new day (reset daily limits)
    if (summary.daily.date !== today) {
      return {
        canProceed: true,
        remainingRequests: summary.dailyLimit
      };
    }

    // Check daily limit
    if (summary.daily.requests >= summary.dailyLimit) {
      return {
        canProceed: false,
        reason: `Daily AI limit reached (${summary.dailyLimit} requests). Resets at midnight.`,
        remainingRequests: 0,
        resetTime: new Date(new Date().setHours(24, 0, 0, 0))
      };
    }

    // Check system budget limits (but don't fail if we can't check)
    try {
      const budgetConfig = await getBudgetConfig();
      const systemStats = await getTodaySystemStats();
      
      if (systemStats && systemStats.totalCost >= budgetConfig.dailyBudget) {
        return {
          canProceed: false,
          reason: 'System daily budget exceeded. AI features temporarily unavailable.',
          remainingRequests: 0
        };
      }
    } catch (budgetError) {
      console.warn('Failed to check system budget limits:', budgetError);
    }

    return {
      canProceed: true,
      remainingRequests: summary.dailyLimit - summary.daily.requests
    };
  } catch (error) {
    console.error('Error checking usage limits:', error);
    // In case of error, allow the request but log the issue
    // Use a reasonable default limit for safety
    return {
      canProceed: true,
      remainingRequests: DEFAULT_BUDGET_CONFIG.userDailyLimit,
      reason: 'Unable to verify limits - proceeding with default limit'
    };
  }
}

/**
 * Get user usage statistics
 */
export async function getUserUsageStats(userId: string): Promise<UserUsageSummary | null> {
  try {
    const userSummaryRef = doc(db, USER_USAGE_SUMMARY_COLLECTION, userId);
    const userSummaryDoc = await getDoc(userSummaryRef);

    if (!userSummaryDoc.exists()) {
      return null;
    }

    return userSummaryDoc.data() as UserUsageSummary;
  } catch (error) {
    console.error('Error getting user usage stats:', error);
    throw error;
  }
}

/**
 * Get system usage statistics
 */
export async function getSystemUsageStats(date?: string): Promise<SystemUsageStats | null> {
  try {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const systemStatsRef = doc(db, SYSTEM_USAGE_STATS_COLLECTION, targetDate);
    const systemStatsDoc = await getDoc(systemStatsRef);

    if (!systemStatsDoc.exists()) {
      return null;
    }

    return systemStatsDoc.data() as SystemUsageStats;
  } catch (error) {
    console.error('Error getting system usage stats:', error);
    throw error;
  }
}

/**
 * Generate usage report for a date range
 */
export async function generateUsageReport(
  startDate: string,
  endDate: string,
  userId?: string
): Promise<{
  records: UsageRecord[];
  totalCost: number;
  totalRequests: number;
  successRate: number;
  avgResponseTime: number;
  endpointBreakdown: Record<string, EndpointUsageStats>;
}> {
  try {
    let q = query(
      collection(db, USAGE_RECORDS_COLLECTION),
      where('timestamp', '>=', Timestamp.fromDate(new Date(startDate + 'T00:00:00Z'))),
      where('timestamp', '<=', Timestamp.fromDate(new Date(endDate + 'T23:59:59Z'))),
      orderBy('timestamp', 'desc')
    );

    if (userId) {
      q = query(q, where('userId', '==', userId));
    }

    const querySnapshot = await getDocs(q);
    const records: UsageRecord[] = [];

    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as UsageRecord);
    });

    // Calculate aggregated stats
    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const totalRequests = records.length;
    const successfulRequests = records.filter(record => record.success).length;
    const successRate = totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0;
    const avgResponseTime = totalRequests > 0 
      ? records.reduce((sum, record) => sum + record.duration, 0) / totalRequests 
      : 0;

    // Calculate endpoint breakdown
    const endpointBreakdown: Record<string, EndpointUsageStats> = {};
    
    records.forEach((record) => {
      if (!endpointBreakdown[record.endpoint]) {
        endpointBreakdown[record.endpoint] = {
          endpoint: record.endpoint,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalCost: 0,
          avgCost: 0,
          avgResponseTime: 0,
          avgTokensPerRequest: 0,
          cacheHitRate: 0,
          lastUsed: record.timestamp,
          hourlyDistribution: Array(24).fill(0)
        };
      }

      const stats = endpointBreakdown[record.endpoint];
      stats.totalRequests += 1;
      
      if (record.success) {
        stats.successfulRequests += 1;
      } else {
        stats.failedRequests += 1;
      }

      stats.totalCost += record.cost;
      
      // Update averages
      const prevTotalTime = stats.avgResponseTime * (stats.totalRequests - 1);
      stats.avgResponseTime = (prevTotalTime + record.duration) / stats.totalRequests;

      const prevTotalTokens = stats.avgTokensPerRequest * (stats.totalRequests - 1);
      stats.avgTokensPerRequest = (prevTotalTokens + record.totalTokens) / stats.totalRequests;

      stats.avgCost = stats.totalCost / stats.totalRequests;

      // Update cache hit rate
      const cacheHits = records
        .filter(r => r.endpoint === record.endpoint && r.cacheHit)
        .length;
      stats.cacheHitRate = (cacheHits / stats.totalRequests) * 100;

      // Update hourly distribution
      const hour = record.timestamp.toDate().getHours();
      stats.hourlyDistribution[hour] += 1;

      // Update last used
      if (record.timestamp.toMillis() > stats.lastUsed.toMillis()) {
        stats.lastUsed = record.timestamp;
      }
    });

    return {
      records,
      totalCost,
      totalRequests,
      successRate,
      avgResponseTime,
      endpointBreakdown
    };
  } catch (error) {
    console.error('Error generating usage report:', error);
    throw error;
  }
}

/**
 * Check and create budget alerts
 */
async function checkAndCreateAlerts(userId: string, cost: number, endpoint: string): Promise<void> {
  try {
    const budgetConfig = await getBudgetConfig();
    const systemStats = await getTodaySystemStats();
    
    if (systemStats) {
      const { isWarning, isCritical, isEmergency, percentage } = checkBudgetThresholds(
        systemStats.totalCost,
        budgetConfig.dailyBudget,
        budgetConfig
      );

      if (isEmergency || isCritical || isWarning) {
        const alertType = isEmergency ? 'system_limit' : isCritical ? 'budget_critical' : 'budget_warning';
        const message = isEmergency 
          ? `EMERGENCY: Daily budget exceeded by ${(percentage - 100).toFixed(1)}%`
          : isCritical
          ? `CRITICAL: Daily budget at ${percentage.toFixed(1)}% usage`
          : `WARNING: Daily budget at ${percentage.toFixed(1)}% usage`;

        await createAlert(alertType, message, percentage, systemStats.totalCost);
      }
    }

    // Check user limits
    const userStats = await getUserUsageStats(userId);
    if (userStats && userStats.daily.requests >= userStats.dailyLimit * 0.8) {
      const percentage = (userStats.daily.requests / userStats.dailyLimit) * 100;
      await createAlert(
        'user_limit',
        `User approaching daily limit: ${userStats.daily.requests}/${userStats.dailyLimit} requests`,
        percentage,
        userStats.daily.requests,
        userId
      );
    }
  } catch (error) {
    console.error('Error checking and creating alerts:', error);
    // Don't throw - this is a background operation
  }
}

/**
 * Create usage alert
 */
async function createAlert(
  type: UsageAlert['type'],
  message: string,
  threshold: number,
  currentValue: number,
  userId?: string
): Promise<void> {
  try {
    const alert: Omit<UsageAlert, 'id'> = {
      type,
      message,
      threshold,
      currentValue,
      timestamp: Timestamp.now(),
      resolved: false,
      userId
    };

    await addDoc(collection(db, USAGE_ALERTS_COLLECTION), alert);
  } catch (error) {
    console.error('Error creating alert:', error);
  }
}

// Helper functions
function getWeekStart(date: Date): Date {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(date.setDate(diff));
}

function getNextResetTime(): Timestamp {
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  return Timestamp.fromDate(tomorrow);
}

function createDailyUsage(
  date: string,
  requests: number,
  cost: number,
  duration: number,
  success: boolean,
  endpoint: string
): DailyUsage {
  return {
    date,
    requests,
    totalTokens: 0, // Will be updated separately
    cost,
    successRate: success ? 100 : 0,
    avgResponseTime: duration,
    endpoints: { [endpoint]: requests }
  };
}

function updateDailyUsage(
  current: DailyUsage,
  requests: number,
  cost: number,
  duration: number,
  success: boolean,
  endpoint: string
): DailyUsage {
  const newTotal = current.requests + requests;
  const previousSuccessCount = Math.round((current.successRate / 100) * current.requests);
  const newSuccessCount = previousSuccessCount + (success ? 1 : 0);
  const previousTotalTime = current.avgResponseTime * current.requests;

  return {
    ...current,
    requests: newTotal,
    cost: current.cost + cost,
    successRate: (newSuccessCount / newTotal) * 100,
    avgResponseTime: (previousTotalTime + duration) / newTotal,
    endpoints: {
      ...current.endpoints,
      [endpoint]: (current.endpoints[endpoint] || 0) + requests
    }
  };
}

function createWeeklyUsage(
  weekStart: string,
  requests: number,
  cost: number,
  duration: number,
  success: boolean
): WeeklyUsage {
  return {
    weekStart,
    requests,
    totalTokens: 0,
    cost,
    successRate: success ? 100 : 0,
    avgResponseTime: duration,
    dailyBreakdown: []
  };
}

function updateWeeklyUsage(
  current: WeeklyUsage,
  requests: number,
  cost: number,
  duration: number,
  success: boolean
): WeeklyUsage {
  const newTotal = current.requests + requests;
  const previousSuccessCount = Math.round((current.successRate / 100) * current.requests);
  const newSuccessCount = previousSuccessCount + (success ? 1 : 0);
  const previousTotalTime = current.avgResponseTime * current.requests;

  return {
    ...current,
    requests: newTotal,
    cost: current.cost + cost,
    successRate: (newSuccessCount / newTotal) * 100,
    avgResponseTime: (previousTotalTime + duration) / newTotal
  };
}

function createMonthlyUsage(
  month: string,
  requests: number,
  cost: number,
  duration: number,
  success: boolean
): MonthlyUsage {
  return {
    month,
    requests,
    totalTokens: 0,
    cost,
    successRate: success ? 100 : 0,
    avgResponseTime: duration,
    weeklyBreakdown: []
  };
}

function updateMonthlyUsage(
  current: MonthlyUsage,
  requests: number,
  cost: number,
  duration: number,
  success: boolean
): MonthlyUsage {
  const newTotal = current.requests + requests;
  const previousSuccessCount = Math.round((current.successRate / 100) * current.requests);
  const newSuccessCount = previousSuccessCount + (success ? 1 : 0);
  const previousTotalTime = current.avgResponseTime * current.requests;

  return {
    ...current,
    requests: newTotal,
    cost: current.cost + cost,
    successRate: (newSuccessCount / newTotal) * 100,
    avgResponseTime: (previousTotalTime + duration) / newTotal
  };
}

async function getBudgetConfig(): Promise<UsageBudgetConfig> {
  try {
    const configRef = doc(db, USAGE_CONFIG_COLLECTION, 'budget');
    const configDoc = await getDoc(configRef);

    if (configDoc.exists()) {
      return configDoc.data() as UsageBudgetConfig;
    }

    return DEFAULT_BUDGET_CONFIG;
  } catch (error) {
    console.error('Error getting budget config:', error);
    return DEFAULT_BUDGET_CONFIG;
  }
}

async function getTodaySystemStats(): Promise<SystemUsageStats | null> {
  const today = new Date().toISOString().split('T')[0];
  return getSystemUsageStats(today);
}