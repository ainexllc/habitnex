import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getUserUsageStats, 
  checkUsageLimits, 
  trackAPIUsage as trackUsage 
} from '@/lib/usageTracking';
import { 
  UserUsageSummary, 
  UsageRecord, 
  UsageAlert 
} from '@/types';

/**
 * Hook for user usage tracking and limits
 */
export function useUsageTracking() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserUsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load user usage stats
  const loadUserStats = useCallback(async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const stats = await getUserUsageStats(user.uid);
      setUserStats(stats);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error loading user stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load usage stats');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Check if user can make API call
  const canMakeRequest = useCallback(async (): Promise<{
    allowed: boolean;
    reason?: string;
    remainingRequests?: number;
    resetTime?: Date;
  }> => {
    if (!user?.uid) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    try {
      const limitCheck = await checkUsageLimits(user.uid);
      return {
        allowed: limitCheck.canProceed,
        reason: limitCheck.reason,
        remainingRequests: limitCheck.remainingRequests,
        resetTime: limitCheck.resetTime
      };
    } catch (error) {
      console.error('Error checking usage limits:', error);
      // Default to allowing request if check fails
      return { 
        allowed: true, 
        reason: 'Unable to verify limits - proceeding with caution' 
      };
    }
  }, [user?.uid]);

  // Track an API usage event
  const trackAPIUsage = useCallback(async (
    endpoint: string,
    inputTokens: number,
    outputTokens: number,
    duration: number,
    success: boolean,
    errorCode?: string,
    cacheHit: boolean = false,
    requestId?: string
  ): Promise<string | null> => {
    if (!user?.uid) {
      console.warn('Cannot track usage: user not authenticated');
      return null;
    }

    try {
      const usageId = await trackUsage(
        user.uid,
        endpoint,
        inputTokens,
        outputTokens,
        duration,
        success,
        errorCode,
        cacheHit,
        navigator.userAgent,
        undefined, // IP address will be determined server-side
        requestId
      );

      // Refresh stats after tracking
      loadUserStats();

      return usageId;
    } catch (error) {
      console.error('Error tracking API usage:', error);
      return null;
    }
  }, [user?.uid, loadUserStats]);

  // Get usage summary for display
  const getUsageSummary = useCallback(() => {
    if (!userStats) return null;

    const today = new Date().toISOString().split('T')[0];
    const isToday = userStats.daily.date === today;

    return {
      dailyUsage: {
        requests: isToday ? userStats.daily.requests : 0,
        cost: isToday ? userStats.daily.cost : 0,
        limit: userStats.dailyLimit,
        remaining: Math.max(0, userStats.dailyLimit - (isToday ? userStats.daily.requests : 0)),
        resetTime: userStats.nextResetTime.toDate()
      },
      weeklyUsage: {
        requests: userStats.weekly.requests,
        cost: userStats.weekly.cost
      },
      monthlyUsage: {
        requests: userStats.monthly.requests,
        cost: userStats.monthly.cost
      },
      totalUsage: {
        requests: userStats.totalRequests,
        cost: userStats.totalCost
      },
      isLimitExceeded: userStats.isLimitExceeded
    };
  }, [userStats]);

  // Calculate usage percentage
  const getUsagePercentage = useCallback(() => {
    const summary = getUsageSummary();
    if (!summary) return 0;

    return summary.dailyUsage.limit > 0 
      ? Math.min(100, (summary.dailyUsage.requests / summary.dailyUsage.limit) * 100)
      : 0;
  }, [getUsageSummary]);

  // Get status color based on usage
  const getUsageStatus = useCallback(() => {
    const percentage = getUsagePercentage();
    
    if (percentage >= 90) return { color: 'red', status: 'critical' };
    if (percentage >= 75) return { color: 'orange', status: 'warning' };
    if (percentage >= 50) return { color: 'yellow', status: 'moderate' };
    return { color: 'green', status: 'good' };
  }, [getUsagePercentage]);

  // Load stats on mount and when user changes
  useEffect(() => {
    loadUserStats();
  }, [loadUserStats]);

  // Auto-refresh every 5 minutes if component is active
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadUserStats();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [loadUserStats]);

  return {
    // Data
    userStats,
    usageSummary: getUsageSummary(),
    usagePercentage: getUsagePercentage(),
    usageStatus: getUsageStatus(),
    
    // State
    loading,
    error,
    lastRefresh,
    
    // Actions
    canMakeRequest,
    trackAPIUsage,
    refreshStats: loadUserStats,
    
    // Helpers
    isLimitExceeded: userStats?.isLimitExceeded || false,
    isNearLimit: getUsagePercentage() >= 75
  };
}

/**
 * Hook for tracking individual API calls
 */
export function useAPICall(endpoint: string) {
  const { trackAPIUsage, canMakeRequest } = useUsageTracking();
  const [isLoading, setIsLoading] = useState(false);
  const [lastCall, setLastCall] = useState<{
    success: boolean;
    duration: number;
    cost?: number;
    tokens?: { input: number; output: number };
    timestamp: Date;
  } | null>(null);

  // Execute API call with tracking
  const executeCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      estimatedInputTokens?: number;
      estimatedOutputTokens?: number;
      skipLimitCheck?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { estimatedInputTokens = 100, estimatedOutputTokens = 200, skipLimitCheck = false } = options;

    try {
      setIsLoading(true);

      // Check usage limits first
      if (!skipLimitCheck) {
        const limitCheck = await canMakeRequest();
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason || 'Usage limit exceeded');
        }
      }

      const startTime = Date.now();
      const result = await apiCall();
      const duration = Date.now() - startTime;

      // Track successful usage
      let actualTokens = { input: estimatedInputTokens, output: estimatedOutputTokens };
      let cost = 0;

      // Try to extract actual token counts from response
      if (result && typeof result === 'object') {
        const response = result as any;
        if (response.usage) {
          actualTokens.input = response.usage.inputTokens || estimatedInputTokens;
          actualTokens.output = response.usage.outputTokens || estimatedOutputTokens;
        }
        if (response.cost !== undefined) {
          cost = response.cost;
        }
      }

      await trackAPIUsage(
        endpoint,
        actualTokens.input,
        actualTokens.output,
        duration,
        true, // success
        undefined, // no error
        false, // assume not cached for now
        `${endpoint}-${Date.now()}`
      );

      setLastCall({
        success: true,
        duration,
        cost,
        tokens: actualTokens,
        timestamp: new Date()
      });

      return result;

    } catch (error) {
      const duration = Date.now() - Date.now(); // This will be 0, but that's fine for errors
      const errorCode = error instanceof Error ? error.message : 'Unknown error';

      // Track failed usage
      await trackAPIUsage(
        endpoint,
        estimatedInputTokens,
        0, // no output tokens on error
        duration,
        false, // not successful
        errorCode,
        false,
        `${endpoint}-${Date.now()}-error`
      );

      setLastCall({
        success: false,
        duration,
        timestamp: new Date()
      });

      throw error;

    } finally {
      setIsLoading(false);
    }
  }, [endpoint, trackAPIUsage, canMakeRequest]);

  return {
    executeCall,
    isLoading,
    lastCall
  };
}

/**
 * Hook for usage alerts and notifications
 */
export function useUsageAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlerts = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      // This would typically call an API endpoint
      const response = await fetch('/api/usage/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  const dismissAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/usage/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true })
      });

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      }
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    dismissAlert,
    hasAlerts: alerts.length > 0,
    criticalAlerts: alerts.filter(a => a.type === 'budget_critical' || a.type === 'system_limit'),
    warningAlerts: alerts.filter(a => a.type === 'budget_warning' || a.type === 'user_limit')
  };
}