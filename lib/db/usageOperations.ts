import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  UsageRecord,
  UserUsageSummary,
  SystemUsageStats,
  UsageAlert,
  EndpointUsageStats,
  DailyUsage
} from '@/types';

// Collection references
const usageRecordsRef = collection(db, 'usage_tracking');
const userSummaryRef = collection(db, 'user_usage_summary');
const systemStatsRef = collection(db, 'system_usage_stats');
const usageAlertsRef = collection(db, 'usage_alerts');

/**
 * Get paginated usage records with optional filters
 */
export async function getUsageRecords(options: {
  userId?: string;
  endpoint?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
  orderField?: 'timestamp' | 'cost' | 'duration';
  orderDirection?: 'asc' | 'desc';
}): Promise<{
  records: UsageRecord[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> {
  try {
    const {
      userId,
      endpoint,
      startDate,
      endDate,
      success,
      pageSize = 25,
      lastDoc,
      orderField = 'timestamp',
      orderDirection = 'desc'
    } = options;

    // Build query constraints
    const constraints: QueryConstraint[] = [];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    if (endpoint) {
      constraints.push(where('endpoint', '==', endpoint));
    }

    if (startDate) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(new Date(startDate + 'T00:00:00Z'))));
    }

    if (endDate) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(new Date(endDate + 'T23:59:59Z'))));
    }

    if (success !== undefined) {
      constraints.push(where('success', '==', success));
    }

    // Add ordering and pagination
    constraints.push(orderBy(orderField, orderDirection));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));

    const q = query(usageRecordsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const records: UsageRecord[] = [];
    let lastDocument: DocumentSnapshot | null = null;

    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as UsageRecord);
      lastDocument = doc;
    });

    const hasMore = querySnapshot.docs.length === pageSize;

    return {
      records,
      lastDoc: lastDocument,
      hasMore
    };
  } catch (error) {
    console.error('Error getting usage records:', error);
    throw error;
  }
}

/**
 * Get usage statistics for a specific date range
 */
export async function getUsageStatistics(options: {
  userId?: string;
  startDate: string;
  endDate: string;
  endpoint?: string;
}): Promise<{
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  totalTokens: number;
  avgResponseTime: number;
  cacheHitRate: number;
  endpointBreakdown: Record<string, EndpointUsageStats>;
  hourlyDistribution: Array<{ hour: number; requests: number; cost: number }>;
  dailyTrend: Array<{ date: string; requests: number; cost: number; successRate: number }>;
}> {
  try {
    const { userId, startDate, endDate, endpoint } = options;

    // Build base query
    const constraints: QueryConstraint[] = [
      where('timestamp', '>=', Timestamp.fromDate(new Date(startDate + 'T00:00:00Z'))),
      where('timestamp', '<=', Timestamp.fromDate(new Date(endDate + 'T23:59:59Z')))
    ];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    if (endpoint) {
      constraints.push(where('endpoint', '==', endpoint));
    }

    const q = query(usageRecordsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const records: UsageRecord[] = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as UsageRecord);
    });

    // Calculate basic statistics
    const totalRequests = records.length;
    const successfulRequests = records.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
    const avgResponseTime = totalRequests > 0
      ? records.reduce((sum, r) => sum + r.duration, 0) / totalRequests
      : 0;
    const cacheHits = records.filter(r => r.cacheHit).length;
    const cacheHitRate = totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    // Calculate endpoint breakdown
    const endpointBreakdown: Record<string, EndpointUsageStats> = {};
    records.forEach(record => {
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
      stats.totalRequests++;
      
      if (record.success) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }

      stats.totalCost += record.cost;

      // Update last used timestamp
      if (record.timestamp.toMillis() > stats.lastUsed.toMillis()) {
        stats.lastUsed = record.timestamp;
      }

      // Update hourly distribution
      const hour = record.timestamp.toDate().getHours();
      stats.hourlyDistribution[hour]++;
    });

    // Calculate averages for endpoints
    Object.values(endpointBreakdown).forEach(stats => {
      stats.avgCost = stats.totalRequests > 0 ? stats.totalCost / stats.totalRequests : 0;
      
      const endpointRecords = records.filter(r => r.endpoint === stats.endpoint);
      stats.avgResponseTime = endpointRecords.length > 0
        ? endpointRecords.reduce((sum, r) => sum + r.duration, 0) / endpointRecords.length
        : 0;
      
      stats.avgTokensPerRequest = endpointRecords.length > 0
        ? endpointRecords.reduce((sum, r) => sum + r.totalTokens, 0) / endpointRecords.length
        : 0;

      const endpointCacheHits = endpointRecords.filter(r => r.cacheHit).length;
      stats.cacheHitRate = stats.totalRequests > 0 ? (endpointCacheHits / stats.totalRequests) * 100 : 0;
    });

    // Calculate hourly distribution
    const hourlyDistribution = Array(24).fill(0).map((_, hour) => ({
      hour,
      requests: 0,
      cost: 0
    }));

    records.forEach(record => {
      const hour = record.timestamp.toDate().getHours();
      hourlyDistribution[hour].requests++;
      hourlyDistribution[hour].cost += record.cost;
    });

    // Calculate daily trend
    const dailyMap = new Map<string, { requests: number; cost: number; successful: number }>();
    
    records.forEach(record => {
      const date = record.timestamp.toDate().toISOString().split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { requests: 0, cost: 0, successful: 0 });
      }
      const dayStats = dailyMap.get(date)!;
      dayStats.requests++;
      dayStats.cost += record.cost;
      if (record.success) {
        dayStats.successful++;
      }
    });

    const dailyTrend = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      requests: stats.requests,
      cost: stats.cost,
      successRate: stats.requests > 0 ? (stats.successful / stats.requests) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      totalCost,
      totalTokens,
      avgResponseTime,
      cacheHitRate,
      endpointBreakdown,
      hourlyDistribution,
      dailyTrend
    };
  } catch (error) {
    console.error('Error getting usage statistics:', error);
    throw error;
  }
}

/**
 * Get top users by usage metrics
 */
export async function getTopUsers(options: {
  metric: 'requests' | 'cost' | 'tokens';
  timeframe: 'daily' | 'weekly' | 'monthly';
  limit?: number;
}): Promise<Array<{
  userId: string;
  value: number;
  rank: number;
}>> {
  try {
    const { metric, timeframe, limit: maxResults = 10 } = options;

    // Get all user summaries
    const q = query(userSummaryRef, orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);

    const userMetrics: Array<{ userId: string; value: number }> = [];

    querySnapshot.forEach(doc => {
      const summary = doc.data() as UserUsageSummary;
      let value = 0;

      switch (timeframe) {
        case 'daily':
          value = metric === 'requests' ? summary.daily.requests :
                  metric === 'cost' ? summary.daily.cost :
                  summary.daily.totalTokens;
          break;
        case 'weekly':
          value = metric === 'requests' ? summary.weekly.requests :
                  metric === 'cost' ? summary.weekly.cost :
                  summary.weekly.totalTokens;
          break;
        case 'monthly':
          value = metric === 'requests' ? summary.monthly.requests :
                  metric === 'cost' ? summary.monthly.cost :
                  summary.monthly.totalTokens;
          break;
      }

      if (value > 0) {
        userMetrics.push({ userId: summary.userId, value });
      }
    });

    // Sort by value and add ranking
    userMetrics.sort((a, b) => b.value - a.value);
    
    return userMetrics.slice(0, maxResults).map((user, index) => ({
      ...user,
      rank: index + 1
    }));
  } catch (error) {
    console.error('Error getting top users:', error);
    throw error;
  }
}

/**
 * Get active usage alerts
 */
export async function getActiveAlerts(userId?: string): Promise<UsageAlert[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('resolved', '==', false),
      orderBy('timestamp', 'desc')
    ];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    const q = query(usageAlertsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const alerts: UsageAlert[] = [];
    querySnapshot.forEach(doc => {
      alerts.push({ id: doc.id, ...doc.data() } as UsageAlert);
    });

    return alerts;
  } catch (error) {
    console.error('Error getting active alerts:', error);
    throw error;
  }
}

/**
 * Get system usage trends
 */
export async function getSystemUsageTrends(days: number = 30): Promise<{
  dailyStats: SystemUsageStats[];
  trends: {
    requestsTrend: number; // percentage change
    costTrend: number;
    usersTrend: number;
    successRateTrend: number;
  };
}> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const constraints: QueryConstraint[] = [
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0]),
      orderBy('date', 'desc')
    ];

    const q = query(systemStatsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const dailyStats: SystemUsageStats[] = [];
    querySnapshot.forEach(doc => {
      dailyStats.push({ ...doc.data() } as SystemUsageStats);
    });

    // Calculate trends (comparing first half vs second half of the period)
    const midPoint = Math.floor(dailyStats.length / 2);
    const firstHalf = dailyStats.slice(midPoint);
    const secondHalf = dailyStats.slice(0, midPoint);

    const calculateTrend = (oldValue: number, newValue: number): number => {
      if (oldValue === 0) return newValue > 0 ? 100 : 0;
      return ((newValue - oldValue) / oldValue) * 100;
    };

    const avgFirst = {
      requests: firstHalf.reduce((sum, s) => sum + s.totalRequests, 0) / firstHalf.length || 0,
      cost: firstHalf.reduce((sum, s) => sum + s.totalCost, 0) / firstHalf.length || 0,
      users: firstHalf.reduce((sum, s) => sum + s.totalUsers, 0) / firstHalf.length || 0,
      successRate: firstHalf.reduce((sum, s) => sum + s.successRate, 0) / firstHalf.length || 0
    };

    const avgSecond = {
      requests: secondHalf.reduce((sum, s) => sum + s.totalRequests, 0) / secondHalf.length || 0,
      cost: secondHalf.reduce((sum, s) => sum + s.totalCost, 0) / secondHalf.length || 0,
      users: secondHalf.reduce((sum, s) => sum + s.totalUsers, 0) / secondHalf.length || 0,
      successRate: secondHalf.reduce((sum, s) => sum + s.successRate, 0) / secondHalf.length || 0
    };

    const trends = {
      requestsTrend: calculateTrend(avgFirst.requests, avgSecond.requests),
      costTrend: calculateTrend(avgFirst.cost, avgSecond.cost),
      usersTrend: calculateTrend(avgFirst.users, avgSecond.users),
      successRateTrend: calculateTrend(avgFirst.successRate, avgSecond.successRate)
    };

    return {
      dailyStats: dailyStats.sort((a, b) => a.date.localeCompare(b.date)),
      trends
    };
  } catch (error) {
    console.error('Error getting system usage trends:', error);
    throw error;
  }
}

/**
 * Search usage records with flexible criteria
 */
export async function searchUsageRecords(options: {
  searchTerm?: string; // Search in endpoint names
  userId?: string;
  dateRange?: { start: string; end: string };
  costRange?: { min: number; max: number };
  durationRange?: { min: number; max: number };
  success?: boolean;
  cacheHit?: boolean;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{
  records: UsageRecord[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
  totalMatches?: number;
}> {
  try {
    const {
      searchTerm,
      userId,
      dateRange,
      costRange,
      durationRange,
      success,
      cacheHit,
      pageSize = 25,
      lastDoc
    } = options;

    const constraints: QueryConstraint[] = [];

    // Basic filters
    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    if (dateRange) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(new Date(dateRange.start + 'T00:00:00Z'))));
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(new Date(dateRange.end + 'T23:59:59Z'))));
    }

    if (success !== undefined) {
      constraints.push(where('success', '==', success));
    }

    if (cacheHit !== undefined) {
      constraints.push(where('cacheHit', '==', cacheHit));
    }

    // Cost range filters
    if (costRange) {
      if (costRange.min > 0) {
        constraints.push(where('cost', '>=', costRange.min));
      }
      if (costRange.max < Infinity) {
        constraints.push(where('cost', '<=', costRange.max));
      }
    }

    // Add ordering and pagination
    constraints.push(orderBy('timestamp', 'desc'));

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    constraints.push(limit(pageSize));

    const q = query(usageRecordsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    let records: UsageRecord[] = [];
    let lastDocument: DocumentSnapshot | null = null;

    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() } as UsageRecord);
      lastDocument = doc;
    });

    // Apply client-side filters (Firestore limitations)
    if (searchTerm) {
      records = records.filter(record => 
        record.endpoint.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (durationRange) {
      records = records.filter(record => 
        record.duration >= (durationRange.min || 0) && 
        record.duration <= (durationRange.max || Infinity)
      );
    }

    const hasMore = querySnapshot.docs.length === pageSize && records.length === pageSize;

    return {
      records,
      lastDoc: lastDocument,
      hasMore
    };
  } catch (error) {
    console.error('Error searching usage records:', error);
    throw error;
  }
}

/**
 * Get usage efficiency metrics
 */
export async function getUsageEfficiencyMetrics(userId?: string): Promise<{
  costEfficiency: number; // cost per successful request
  timeEfficiency: number; // average response time for successful requests
  cacheEfficiency: number; // percentage of requests served from cache
  errorRate: number; // percentage of failed requests
  peakUsageHour: number; // hour of day with most usage
  leastUsedEndpoint: string;
  mostUsedEndpoint: string;
  recommendations: string[];
}> {
  try {
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - 30); // Last 30 days

    const constraints: QueryConstraint[] = [
      where('timestamp', '>=', Timestamp.fromDate(startDate)),
      where('timestamp', '<=', Timestamp.fromDate(now))
    ];

    if (userId) {
      constraints.push(where('userId', '==', userId));
    }

    const q = query(usageRecordsRef, ...constraints);
    const querySnapshot = await getDocs(q);

    const records: UsageRecord[] = [];
    querySnapshot.forEach(doc => {
      records.push({ id: doc.id, ...doc.data() } as UsageRecord);
    });

    if (records.length === 0) {
      return {
        costEfficiency: 0,
        timeEfficiency: 0,
        cacheEfficiency: 0,
        errorRate: 0,
        peakUsageHour: 0,
        leastUsedEndpoint: 'none',
        mostUsedEndpoint: 'none',
        recommendations: ['No usage data available for analysis']
      };
    }

    // Calculate metrics
    const successfulRecords = records.filter(r => r.success);
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
    const successfulCost = successfulRecords.reduce((sum, r) => sum + r.cost, 0);
    const costEfficiency = successfulRecords.length > 0 ? successfulCost / successfulRecords.length : 0;

    const avgResponseTime = successfulRecords.length > 0
      ? successfulRecords.reduce((sum, r) => sum + r.duration, 0) / successfulRecords.length
      : 0;

    const cacheHits = records.filter(r => r.cacheHit).length;
    const cacheEfficiency = (cacheHits / records.length) * 100;

    const errorRate = ((records.length - successfulRecords.length) / records.length) * 100;

    // Calculate peak usage hour
    const hourlyUsage = Array(24).fill(0);
    records.forEach(record => {
      const hour = record.timestamp.toDate().getHours();
      hourlyUsage[hour]++;
    });
    const peakUsageHour = hourlyUsage.indexOf(Math.max(...hourlyUsage));

    // Calculate endpoint usage
    const endpointUsage: Record<string, number> = {};
    records.forEach(record => {
      endpointUsage[record.endpoint] = (endpointUsage[record.endpoint] || 0) + 1;
    });

    const sortedEndpoints = Object.entries(endpointUsage).sort((a, b) => b[1] - a[1]);
    const mostUsedEndpoint = sortedEndpoints[0]?.[0] || 'none';
    const leastUsedEndpoint = sortedEndpoints[sortedEndpoints.length - 1]?.[0] || 'none';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (cacheEfficiency < 30) {
      recommendations.push('Low cache efficiency detected. Consider implementing request caching for repeated queries.');
    }
    
    if (errorRate > 10) {
      recommendations.push('High error rate detected. Review input validation and error handling.');
    }
    
    if (avgResponseTime > 3000) {
      recommendations.push('Slow response times detected. Consider optimizing prompts or using parallel processing.');
    }
    
    if (costEfficiency > 0.02) {
      recommendations.push('High cost per successful request. Consider optimizing prompts to reduce token usage.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Usage efficiency is good! Continue monitoring for optimization opportunities.');
    }

    return {
      costEfficiency,
      timeEfficiency: avgResponseTime,
      cacheEfficiency,
      errorRate,
      peakUsageHour,
      leastUsedEndpoint,
      mostUsedEndpoint,
      recommendations
    };
  } catch (error) {
    console.error('Error getting usage efficiency metrics:', error);
    throw error;
  }
}