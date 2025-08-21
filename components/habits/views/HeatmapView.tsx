'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Habit } from '@/types';
import { useHabits } from '@/hooks/useHabits';
import { 
  processCompletionsForHeatmap,
  getHeatmapIntensity,
  getHeatmapHoverIntensity,
  generateTooltipContent,
  calculateHeatmapStats,
  HeatmapDay
} from '@/lib/heatmapUtils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  TrendingUp,
  Target,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeatmapViewProps {
  habits: Habit[];
}

interface TooltipState {
  visible: boolean;
  content: string;
  x: number;
  y: number;
}

export function HeatmapView({ habits }: HeatmapViewProps) {
  const { completions } = useHabits();
  const [timeRange, setTimeRange] = useState(365);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });
  const heatmapRef = useRef<HTMLDivElement>(null);

  // Process data for heatmap
  const heatmapData = useMemo(() => {
    return processCompletionsForHeatmap(habits, completions, timeRange);
  }, [habits, completions, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    return calculateHeatmapStats(heatmapData);
  }, [heatmapData]);

  // Handle mouse events for tooltip
  const handleMouseEnter = (event: React.MouseEvent, day: HeatmapDay) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const tooltipContent = generateTooltipContent(day);
    
    setTooltip({
      visible: true,
      content: tooltipContent,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // Handle window resize to update tooltip position
  useEffect(() => {
    const handleResize = () => {
      if (tooltip.visible) {
        setTooltip(prev => ({ ...prev, visible: false }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [tooltip.visible]);

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No habits found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create your first habit to see the heatmap view!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Habit Heatmap
          </h2>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 text-sm">
            <Button
              variant={timeRange === 365 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(365)}
            >
              1 Year
            </Button>
            <Button
              variant={timeRange === 180 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(180)}
            >
              6 Months
            </Button>
            <Button
              variant={timeRange === 90 ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(90)}
            >
              3 Months
            </Button>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Completions</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCompletions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Days</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.daysWithActivity}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Rate</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.averageCompletionRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Streak</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stats.currentStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              {timeRange === 365 ? 'Past year' : timeRange === 180 ? 'Past 6 months' : 'Past 3 months'} of habit completions
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary-200 dark:bg-primary-900 border border-primary-300 dark:border-primary-800 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary-400 dark:bg-primary-800 border border-primary-500 dark:border-primary-700 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary-600 dark:bg-primary-700 border border-primary-700 dark:border-primary-600 rounded-sm"></div>
                <div className="w-3 h-3 bg-primary-800 dark:bg-primary-600 border border-primary-900 dark:border-primary-500 rounded-sm"></div>
              </div>
              <span className="text-gray-500 dark:text-gray-400">More</span>
            </div>
          </div>

          {/* Heatmap Grid */}
          <div 
            ref={heatmapRef}
            className="overflow-x-auto"
          >
            <div className="inline-flex gap-4">
              {/* Month Labels */}
              <div className="w-12 flex flex-col justify-start pt-4 shrink-0">
                {heatmapData.monthLabels.map((label, index) => (
                  <div
                    key={index}
                    className="text-xs text-gray-500 dark:text-gray-400 h-3 flex items-center"
                    style={{
                      marginTop: index === 0 ? `${label.position * 14}px` : '0px',
                      marginBottom: index < heatmapData.monthLabels.length - 1 ? '10px' : '0px'
                    }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="flex">
                {/* Day Labels */}
                <div className="flex flex-col gap-0.5 pr-2 pt-4">
                  {['Sun', '', 'Mon', '', 'Tue', '', 'Wed', '', 'Thu', '', 'Fri', '', 'Sat'].map((day, index) => (
                    <div
                      key={index}
                      className="h-3 w-6 flex items-center text-xs text-gray-500 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Weeks Grid */}
                <div className="flex gap-0.5">
                  {heatmapData.weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-0.5">
                      {week.days.map((day, dayIndex) => (
                        <div
                          key={`${weekIndex}-${dayIndex}`}
                          className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-150 ${
                            day 
                              ? `${getHeatmapIntensity(day.completionRate)} ${getHeatmapHoverIntensity(day.completionRate)} border` 
                              : 'bg-transparent'
                          }`}
                          onMouseEnter={day ? (e) => handleMouseEnter(e, day) : undefined}
                          onMouseLeave={handleMouseLeave}
                          title={day ? generateTooltipContent(day) : undefined}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none whitespace-pre-line max-w-xs"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          {tooltip.content}
          <div
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
          />
        </div>
      )}
    </div>
  );
}