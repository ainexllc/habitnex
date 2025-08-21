'use client';

import React from 'react';
import { useUsageTracking } from '@/hooks/useUsageTracking';

interface UsageIndicatorProps {
  showCost?: boolean;
  showRemaining?: boolean;
  compact?: boolean;
  className?: string;
}

export default function UsageIndicator({ 
  showCost = false, 
  showRemaining = true, 
  compact = false,
  className = '' 
}: UsageIndicatorProps) {
  const { usageSummary, usagePercentage, usageStatus, loading, isLimitExceeded } = useUsageTracking();

  if (loading || !usageSummary) {
    return (
      <div className={`animate-pulse ${className}`}>
        {compact ? (
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ) : (
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        )}
      </div>
    );
  }

  const { dailyUsage } = usageSummary;
  const percentage = usagePercentage;
  const status = usageStatus;

  // Status colors
  const statusColors: Record<string, string> = {
    good: 'bg-green-500',
    moderate: 'bg-yellow-500', 
    warning: 'bg-orange-500',
    critical: 'bg-red-500'
  };

  const textColors: Record<string, string> = {
    good: 'text-green-600 dark:text-green-400',
    moderate: 'text-yellow-600 dark:text-yellow-400',
    warning: 'text-orange-600 dark:text-orange-400', 
    critical: 'text-red-600 dark:text-red-400'
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${statusColors[status.status]}`}></div>
          <span className={`text-sm font-medium ${textColors[status.status]}`}>
            {dailyUsage.requests}/{dailyUsage.limit}
          </span>
        </div>
        {showCost && dailyUsage.cost > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ${dailyUsage.cost.toFixed(4)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          AI Usage Today
        </span>
        {showRemaining && (
          <span className={`text-sm ${textColors[status.status]}`}>
            {dailyUsage.remaining} left
          </span>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">
            {dailyUsage.requests} of {dailyUsage.limit} requests
          </span>
          <span className={`${textColors[status.status]}`}>
            {Math.round(percentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${statusColors[status.status]}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>

      {showCost && dailyUsage.cost > 0 && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Cost today: ${dailyUsage.cost.toFixed(4)}
        </div>
      )}

      {isLimitExceeded && (
        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
          Daily limit reached. Resets at midnight.
        </div>
      )}

      {status.status === 'warning' && !isLimitExceeded && (
        <div className="text-xs text-orange-600 dark:text-orange-400">
          Approaching daily limit
        </div>
      )}
    </div>
  );
}

interface UsageBadgeProps {
  className?: string;
}

export function UsageBadge({ className = '' }: UsageBadgeProps) {
  const { usageSummary, usageStatus, loading } = useUsageTracking();

  if (loading || !usageSummary) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
    );
  }

  const { dailyUsage } = usageSummary;
  const { status } = usageStatus;

  const badgeColors: Record<string, string> = {
    good: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    warning: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColors[status]} ${className}`}>
      {dailyUsage.requests}/{dailyUsage.limit}
    </span>
  );
}

interface UsageTooltipProps {
  children: React.ReactNode;
  className?: string;
}

export function UsageTooltip({ children, className = '' }: UsageTooltipProps) {
  const { usageSummary, loading } = useUsageTracking();

  if (loading || !usageSummary) {
    return <>{children}</>;
  }

  const { dailyUsage, weeklyUsage, monthlyUsage } = usageSummary;

  return (
    <div className={`group relative ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        <div className="space-y-1">
          <div>Today: {dailyUsage.requests}/{dailyUsage.limit} requests</div>
          <div>This week: {weeklyUsage.requests} requests</div>
          <div>This month: {monthlyUsage.requests} requests</div>
          {dailyUsage.cost > 0 && (
            <div className="border-t border-gray-700 pt-1 mt-1">
              <div>Today's cost: ${dailyUsage.cost.toFixed(4)}</div>
            </div>
          )}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}