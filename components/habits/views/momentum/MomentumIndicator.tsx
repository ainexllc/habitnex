'use client';

import React from 'react';
import { MomentumState } from '@/lib/waveAnimations';
import { HabitMomentumData } from '@/lib/momentumAnalysis';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Zap } from 'lucide-react';

interface MomentumIndicatorProps {
  momentum: MomentumState;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showDetails?: boolean;
  animated?: boolean;
}

export function MomentumIndicator({
  momentum,
  className = '',
  size = 'md',
  showLabel = true,
  showDetails = false,
  animated = true
}: MomentumIndicatorProps) {
  const { level, intensity, trend, completionRate, streak } = momentum;

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5'
    },
    md: {
      container: 'w-12 h-12',
      icon: 'w-6 h-6',
      text: 'text-sm',
      badge: 'text-sm px-2 py-1'
    },
    lg: {
      container: 'w-16 h-16',
      icon: 'w-8 h-8',
      text: 'text-base',
      badge: 'text-base px-3 py-1.5'
    }
  };

  const config = sizeConfig[size];

  // Get visual properties based on momentum level
  const getVisualProps = () => {
    switch (level) {
      case 'building':
        return {
          color: completionRate >= 0.8 ? 'text-success-600' : 'text-primary-600',
          bgColor: completionRate >= 0.8 ? 'bg-success-100 dark:bg-success-900' : 'bg-primary-100 dark:bg-primary-900',
          borderColor: completionRate >= 0.8 ? 'border-success-200 dark:border-success-700' : 'border-primary-200 dark:border-primary-700',
          icon: TrendingUp,
          label: 'Building',
          description: 'Strong upward momentum'
        };
      case 'stable':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-100 dark:bg-blue-900',
          borderColor: 'border-blue-200 dark:border-blue-700',
          icon: Activity,
          label: 'Stable',
          description: 'Consistent performance'
        };
      case 'declining':
        return {
          color: 'text-warning-600 dark:text-warning-400',
          bgColor: 'bg-warning-100 dark:bg-warning-900',
          borderColor: 'border-warning-200 dark:border-warning-700',
          icon: TrendingDown,
          label: 'Declining',
          description: 'Needs attention'
        };
      case 'stalled':
        return {
          color: 'text-error-600 dark:text-error-400',
          bgColor: 'bg-error-100 dark:bg-error-900',
          borderColor: 'border-error-200 dark:border-error-700',
          icon: AlertCircle,
          label: 'Stalled',
          description: 'Immediate focus needed'
        };
      default:
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-900',
          borderColor: 'border-gray-200 dark:border-gray-700',
          icon: Activity,
          label: 'Unknown',
          description: 'No data available'
        };
    }
  };

  const visual = getVisualProps();
  const Icon = visual.icon;

  // Calculate intensity percentage for visual effects
  const intensityPercentage = Math.round(intensity * 100);

  // Trend arrow component
  const TrendArrow = () => {
    if (trend === 'stable') return null;
    
    return (
      <div className={`absolute -top-1 -right-1 ${
        trend === 'up' ? 'text-success-500' : 'text-error-500'
      }`}>
        {trend === 'up' ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
      </div>
    );
  };

  // Pulse animation for building momentum
  const shouldPulse = animated && level === 'building' && intensity > 0.7;
  const pulseClass = shouldPulse ? 'animate-pulse' : '';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Main Indicator */}
      <div className="relative">
        {/* Background Circle */}
        <div
          className={`${config.container} ${visual.bgColor} ${visual.borderColor} border-2 rounded-full 
            flex items-center justify-center transition-all duration-300 ${pulseClass}`}
        >
          <Icon className={`${config.icon} ${visual.color}`} />
          
          {/* Intensity Ring */}
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              className={`${visual.color}`}
              stroke="currentColor"
              strokeWidth="2"
              strokeOpacity="0.3"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="transparent"
              className={`${visual.color}`}
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${intensity * 100} 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Trend Arrow */}
        <TrendArrow />

        {/* Streak Badge */}
        {streak > 0 && size !== 'sm' && (
          <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2
            ${config.badge} bg-white dark:bg-gray-800 border rounded-full font-medium
            ${visual.color} min-w-0`}>
            {streak > 99 ? '99+' : streak}
          </div>
        )}
      </div>

      {/* Label and Details */}
      {(showLabel || showDetails) && (
        <div className="flex flex-col min-w-0">
          {showLabel && (
            <span className={`font-medium ${visual.color} ${config.text} capitalize`}>
              {visual.label}
            </span>
          )}
          
          {showDetails && (
            <div className={`${config.text} text-text-secondary-light dark:text-text-secondary-dark`}>
              <div className="flex items-center gap-1">
                <span>{Math.round(completionRate * 100)}%</span>
                {streak > 0 && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-0.5">
                      <Zap className="w-3 h-3" />
                      <span>{streak}</span>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs opacity-75 mt-0.5">
                {visual.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for lists
export function CompactMomentumIndicator({ 
  momentum, 
  className = '' 
}: { 
  momentum: MomentumState; 
  className?: string; 
}) {
  return (
    <MomentumIndicator
      momentum={momentum}
      size="sm"
      showLabel={false}
      showDetails={false}
      className={className}
    />
  );
}

// Detailed version for cards
export function DetailedMomentumIndicator({ 
  momentum, 
  className = '' 
}: { 
  momentum: MomentumState; 
  className?: string; 
}) {
  return (
    <MomentumIndicator
      momentum={momentum}
      size="lg"
      showLabel={true}
      showDetails={true}
      className={className}
    />
  );
}

// Grid of momentum indicators
interface MomentumGridProps {
  momentumData: HabitMomentumData[];
  className?: string;
  onIndicatorClick?: (habitId: string) => void;
}

export function MomentumGrid({ 
  momentumData, 
  className = '',
  onIndicatorClick 
}: MomentumGridProps) {
  if (momentumData.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          No momentum data available
        </p>
      </div>
    );
  }

  // Group by momentum level for better visualization
  const groupedData = momentumData.reduce((acc, data) => {
    const level = data.momentum.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(data);
    return acc;
  }, {} as Record<string, HabitMomentumData[]>);

  return (
    <div className={`space-y-4 ${className}`}>
      {(['building', 'stable', 'declining', 'stalled'] as const).map(level => {
        const levelData = groupedData[level];
        if (!levelData || levelData.length === 0) return null;

        return (
          <div key={level} className="space-y-2">
            <h4 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark capitalize">
              {level} ({levelData.length})
            </h4>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {levelData.map(data => (
                <button
                  key={data.habitId}
                  onClick={() => onIndicatorClick?.(data.habitId)}
                  className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  title={`Habit momentum: ${level}`}
                >
                  <MomentumIndicator
                    momentum={data.momentum}
                    size="sm"
                    showLabel={false}
                    showDetails={false}
                  />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}