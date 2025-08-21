import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SystemUsageStats,
  UserUsageSummary,
  UsageRecord,
  UsageAlert,
  EndpointUsageStats,
  UsageAnalyticsResponse
} from '@/types';
import {
  getUsageRecords,
  getUsageStatistics,
  getTopUsers,
  getSystemUsageTrends,
  getUsageEfficiencyMetrics
} from '@/lib/db/usageOperations';

/**
 * Hook for system-wide usage analytics (admin view)
 */
export function useSystemAnalytics() {
  const { user } = useAuth();
  const [systemStats, setSystemStats] = useState<SystemUsageStats | null>(null);
  const [trends, setTrends] = useState<any>(null);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return user?.email === 'dinohorn35@gmail.com'; // Replace with proper admin check
  }, [user]);

  // Load system analytics data
  const loadSystemAnalytics = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch data from API endpoints
      const [statsResponse, trendsResponse, topUsersResponse] = await Promise.all([
        fetch('/api/usage/analytics/system'),
        fetch(`/api/usage/analytics/trends?days=30`),
        fetch('/api/usage/analytics/top-users?metric=requests&timeframe=daily&limit=10')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(statsData.data);
      }

      if (trendsResponse.ok) {
        const trendsData = await trendsResponse.json();
        setTrends(trendsData.data);
      }

      if (topUsersResponse.ok) {
        const topUsersData = await topUsersResponse.json();
        setTopUsers(topUsersData.data || []);
      }

    } catch (err) {
      console.error('Error loading system analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Update date range
  const updateDateRange = useCallback((start: string, end: string) => {
    setDateRange({ startDate: start, endDate: end });
  }, []);

  useEffect(() => {
    loadSystemAnalytics();
  }, [loadSystemAnalytics, dateRange]);

  return {
    systemStats,
    trends,
    topUsers,
    loading,
    error,
    isAdmin,
    dateRange,
    updateDateRange,
    refreshData: loadSystemAnalytics
  };
}

/**
 * Hook for user-specific usage analytics
 */
export function useUserAnalytics(userId?: string) {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<any>(null);
  const [usageRecords, setUsageRecords] = useState<UsageRecord[]>([]);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetUserId = userId || user?.uid;

  // Load user analytics
  const loadUserAnalytics = useCallback(async () => {
    if (!targetUserId) return;

    try {
      setLoading(true);
      setError(null);

      const [statsResponse, recordsResponse, efficiencyResponse] = await Promise.all([
        fetch(`/api/usage/analytics/user?userId=${targetUserId}`),
        fetch(`/api/usage/analytics/records?userId=${targetUserId}&limit=50`),
        fetch(`/api/usage/analytics/efficiency?userId=${targetUserId}`)
      ]);

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setUserStats(data.data);
      }

      if (recordsResponse.ok) {
        const data = await recordsResponse.json();
        setUsageRecords(data.data.records || []);
      }

      if (efficiencyResponse.ok) {
        const data = await efficiencyResponse.json();
        setEfficiencyMetrics(data.data);
      }

    } catch (err) {
      console.error('Error loading user analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user analytics');
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    loadUserAnalytics();
  }, [loadUserAnalytics]);

  return {
    userStats,
    usageRecords,
    efficiencyMetrics,
    loading,
    error,
    refreshData: loadUserAnalytics
  };
}

/**
 * Hook for endpoint analytics
 */
export function useEndpointAnalytics() {
  const [endpointStats, setEndpointStats] = useState<Record<string, EndpointUsageStats>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');

  // Load endpoint analytics
  const loadEndpointAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/usage/analytics/endpoints');
      if (response.ok) {
        const data = await response.json();
        setEndpointStats(data.data || {});
      }
    } catch (err) {
      console.error('Error loading endpoint analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load endpoint analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Get top endpoints by metric
  const getTopEndpoints = useCallback((metric: 'requests' | 'cost' | 'avgResponseTime', limit = 5) => {
    return Object.values(endpointStats)
      .sort((a, b) => {
        switch (metric) {
          case 'requests':
            return b.totalRequests - a.totalRequests;
          case 'cost':
            return b.totalCost - a.totalCost;
          case 'avgResponseTime':
            return b.avgResponseTime - a.avgResponseTime;
          default:
            return 0;
        }
      })
      .slice(0, limit);
  }, [endpointStats]);

  useEffect(() => {
    loadEndpointAnalytics();
  }, [loadEndpointAnalytics]);

  return {
    endpointStats,
    loading,
    error,
    selectedEndpoint,
    setSelectedEndpoint,
    getTopEndpoints,
    refreshData: loadEndpointAnalytics
  };
}

/**
 * Hook for cost analysis and budgeting
 */
export function useCostAnalytics() {
  const [costData, setCostData] = useState<any>(null);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [projections, setProjections] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCostAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [costResponse, budgetResponse, projectionsResponse] = await Promise.all([
        fetch('/api/usage/analytics/costs'),
        fetch('/api/usage/analytics/budget'),
        fetch('/api/usage/analytics/projections')
      ]);

      if (costResponse.ok) {
        const data = await costResponse.json();
        setCostData(data.data);
      }

      if (budgetResponse.ok) {
        const data = await budgetResponse.json();
        setBudgetStatus(data.data);
      }

      if (projectionsResponse.ok) {
        const data = await projectionsResponse.json();
        setProjections(data.data);
      }

    } catch (err) {
      console.error('Error loading cost analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cost analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCostAnalytics();
  }, [loadCostAnalytics]);

  return {
    costData,
    budgetStatus,
    projections,
    loading,
    error,
    refreshData: loadCostAnalytics
  };
}

/**
 * Hook for real-time usage monitoring
 */
export function useRealTimeUsage() {
  const [realtimeData, setRealtimeData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  // In a real implementation, this would use WebSockets or Server-Sent Events
  const connectRealtime = useCallback(() => {
    // Simulate real-time updates with polling
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/usage/analytics/realtime');
        if (response.ok) {
          const data = await response.json();
          setRealtimeData(data.data);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Real-time update failed:', error);
        setIsConnected(false);
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const cleanup = connectRealtime();
    return cleanup;
  }, [connectRealtime]);

  return {
    realtimeData,
    isConnected
  };
}

/**
 * Hook for usage search and filtering
 */
export function useUsageSearch() {
  const [searchResults, setSearchResults] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const searchUsage = useCallback(async (filters: {
    searchTerm?: string;
    userId?: string;
    dateRange?: { start: string; end: string };
    endpoint?: string;
    success?: boolean;
    reset?: boolean;
  }) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end);
      if (filters.endpoint) params.append('endpoint', filters.endpoint);
      if (filters.success !== undefined) params.append('success', String(filters.success));
      if (!filters.reset && lastDoc) params.append('lastDoc', JSON.stringify(lastDoc));

      const response = await fetch(`/api/usage/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (filters.reset) {
          setSearchResults(data.data.records);
        } else {
          setSearchResults(prev => [...prev, ...data.data.records]);
        }
        
        setHasMore(data.data.hasMore);
        setLastDoc(data.data.lastDoc);
      }
    } catch (error) {
      console.error('Error searching usage:', error);
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      // This would trigger searchUsage with the current filters
      // Implementation depends on how you store current filters
    }
  }, [hasMore, loading]);

  const resetSearch = useCallback(() => {
    setSearchResults([]);
    setLastDoc(null);
    setHasMore(false);
  }, []);

  return {
    searchResults,
    loading,
    hasMore,
    searchUsage,
    loadMore,
    resetSearch
  };
}

/**
 * Hook for usage alerts management
 */
export function useUsageAlertsManagement() {
  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/usage/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error('Error loading alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      const response = await fetch(`/api/usage/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true })
      });

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, resolved: true } : alert
        ));
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  }, []);

  const createAlert = useCallback(async (alert: Omit<UsageAlert, 'id' | 'timestamp' | 'resolved'>) => {
    try {
      const response = await fetch('/api/usage/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert)
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(prev => [data.data, ...prev]);
      }
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  return {
    alerts,
    loading,
    error,
    resolveAlert,
    createAlert,
    refreshAlerts: loadAlerts,
    activeAlerts: alerts.filter(a => !a.resolved),
    criticalAlerts: alerts.filter(a => !a.resolved && (a.type === 'budget_critical' || a.type === 'system_limit'))
  };
}