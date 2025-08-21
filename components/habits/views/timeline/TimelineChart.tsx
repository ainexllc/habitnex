'use client';

import { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Legend
} from 'recharts';
import { HabitPrediction } from '@/lib/habitPrediction';
import { MoodEntry } from '@/types';
import { format, parseISO, addDays } from 'date-fns';
import { ProbabilityCurve } from './ProbabilityCurve';
import { GoalMilestone } from './GoalMilestone';
import { RiskIndicator } from './RiskIndicator';
import { ConfidenceInterval } from './ConfidenceInterval';

interface TimelineChartProps {
  predictions: HabitPrediction[];
  timeRange: 30 | 60 | 90;
  showConfidenceIntervals: boolean;
  predictionMode: 'probability' | 'trajectory' | 'risk';
  moods?: MoodEntry[];
}

interface ChartDataPoint {
  date: string;
  day: number;
  isToday: boolean;
  [habitId: string]: any; // Dynamic habit predictions
}

export function TimelineChart({
  predictions,
  timeRange,
  showConfidenceIntervals,
  predictionMode,
  moods
}: TimelineChartProps) {
  const [hoveredHabit, setHoveredHabit] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Prepare chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const data: ChartDataPoint[] = [];
    const today = new Date();

    for (let i = -7; i < timeRange; i++) { // Include 7 days of history
      const date = addDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      const dataPoint: ChartDataPoint = {
        date: dateString,
        day: i,
        isToday: i === 0
      };

      predictions.forEach(prediction => {
        const predictionPoint = prediction.predictions.find(p => p.date === dateString);
        if (predictionPoint || i < 0) {
          // For historical data (i < 0), we'll show actual completion status if available
          if (i < 0) {
            // This would need actual historical data - for now showing null
            dataPoint[`${prediction.habitId}_probability`] = null;
            dataPoint[`${prediction.habitId}_confidence`] = null;
            dataPoint[`${prediction.habitId}_actual`] = null; // Would be set from historical data
          } else if (predictionPoint) {
            dataPoint[`${prediction.habitId}_probability`] = predictionPoint.probability;
            dataPoint[`${prediction.habitId}_confidence`] = predictionPoint.confidence;
            dataPoint[`${prediction.habitId}_predicted`] = predictionPoint.predicted;
            
            // Calculate risk level for this specific prediction
            const riskLevel = predictionPoint.probability < 0.3 ? 'high' : 
                            predictionPoint.probability < 0.6 ? 'medium' : 'low';
            dataPoint[`${prediction.habitId}_risk`] = riskLevel;
          }
        }
      });

      data.push(dataPoint);
    }

    return data;
  }, [predictions, timeRange]);

  // Color mapping for different habits
  const habitColors = useMemo(() => {
    const colors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
    ];
    
    const colorMap: { [habitId: string]: string } = {};
    predictions.forEach((prediction, index) => {
      colorMap[prediction.habitId] = colors[index % colors.length];
    });
    
    return colorMap;
  }, [predictions]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload as ChartDataPoint;
    const isHistorical = data.day < 0;
    const isToday = data.isToday;
    
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3 shadow-lg">
        <div className="mb-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {format(parseISO(data.date), 'MMM dd, yyyy')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isHistorical ? 'Historical' : isToday ? 'Today' : `${data.day} days ahead`}
          </p>
        </div>
        
        <div className="space-y-2">
          {predictions.map(prediction => {
            const probability = data[`${prediction.habitId}_probability`];
            const confidence = data[`${prediction.habitId}_confidence`];
            const risk = data[`${prediction.habitId}_risk`];
            
            if (probability === null || probability === undefined) return null;
            
            return (
              <div key={prediction.habitId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: habitColors[prediction.habitId] }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[120px]">
                    {prediction.habitName}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(probability * 100)}%
                  </div>
                  {showConfidenceIntervals && confidence && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ±{Math.round((1 - confidence) * 100)}%
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (predictions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Select habits to view predictions in the timeline
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {predictionMode === 'probability' && 'Success Probability Timeline'}
            {predictionMode === 'trajectory' && 'Habit Trajectory Forecast'}
            {predictionMode === 'risk' && 'Risk Assessment Timeline'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {predictionMode === 'probability' && 'Likelihood of completing each habit over time'}
            {predictionMode === 'trajectory' && 'Predicted habit completion patterns'}
            {predictionMode === 'risk' && 'Risk levels for habit failure'}
          </p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600"></div>
            <span className="text-gray-500 dark:text-gray-400">Historical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary-500"></div>
            <span className="text-gray-500 dark:text-gray-400">Predicted</span>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {predictionMode === 'probability' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const data = chartData.find(d => d.date === value);
                  if (data?.isToday) return 'Today';
                  if (data?.day === -7) return '7d ago';
                  if (data?.day && data.day > 0 && data.day % 14 === 0) {
                    return `+${data.day}d`;
                  }
                  return format(parseISO(value), 'MMM dd');
                }}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#6b7280' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Today reference line */}
              <ReferenceLine 
                x={format(new Date(), 'yyyy-MM-dd')} 
                stroke="#ef4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
              />
              
              {/* Confidence intervals */}
              {showConfidenceIntervals && predictions.map(prediction => (
                <ConfidenceInterval
                  key={`confidence-${prediction.habitId}`}
                  habitId={prediction.habitId}
                  color={habitColors[prediction.habitId]}
                  opacity={0.2}
                />
              ))}
              
              {/* Probability curves */}
              {predictions.map((prediction, index) => (
                <Area
                  key={prediction.habitId}
                  type="monotone"
                  dataKey={`${prediction.habitId}_probability`}
                  stroke={habitColors[prediction.habitId]}
                  fill={habitColors[prediction.habitId]}
                  fillOpacity={hoveredHabit === prediction.habitId ? 0.3 : 0.1}
                  strokeWidth={hoveredHabit === prediction.habitId ? 3 : 2}
                  dot={false}
                  connectNulls={false}
                  onMouseEnter={() => setHoveredHabit(prediction.habitId)}
                  onMouseLeave={() => setHoveredHabit(null)}
                />
              ))}
            </AreaChart>
          ) : predictionMode === 'trajectory' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => {
                  const data = chartData.find(d => d.date === value);
                  if (data?.isToday) return 'Today';
                  return format(parseISO(value), 'MMM dd');
                }}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                domain={[0, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={format(new Date(), 'yyyy-MM-dd')} stroke="#ef4444" strokeDasharray="5 5" />
              
              {predictions.map(prediction => (
                <Line
                  key={prediction.habitId}
                  type="monotone"
                  dataKey={`${prediction.habitId}_probability`}
                  stroke={habitColors[prediction.habitId]}
                  strokeWidth={2}
                  dot={{ r: 3, strokeWidth: 2 }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), 'MMM dd')}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis 
                domain={[0, 1]}
                tickFormatter={(value) => {
                  if (value >= 0.7) return 'Low Risk';
                  if (value >= 0.4) return 'Medium';
                  return 'High Risk';
                }}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={format(new Date(), 'yyyy-MM-dd')} stroke="#ef4444" strokeDasharray="5 5" />
              
              {predictions.map(prediction => (
                <Area
                  key={prediction.habitId}
                  type="monotone"
                  dataKey={`${prediction.habitId}_probability`}
                  stroke={habitColors[prediction.habitId]}
                  fill={habitColors[prediction.habitId]}
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Goal Milestones Overlay */}
      <div className="mt-4 flex flex-wrap gap-2">
        {predictions.flatMap(prediction => 
          prediction.goalPredictions
            .filter(goal => goal.daysRemaining && goal.daysRemaining <= timeRange)
            .map(goal => (
              <GoalMilestone
                key={`${prediction.habitId}-${goal.type}-${goal.target}`}
                habitId={prediction.habitId}
                habitName={prediction.habitName}
                goal={goal}
                color={habitColors[prediction.habitId]}
                onClick={() => setSelectedGoal(`${prediction.habitId}-${goal.type}-${goal.target}`)}
                isSelected={selectedGoal === `${prediction.habitId}-${goal.type}-${goal.target}`}
              />
            ))
        )}
      </div>

      {/* Risk Indicators */}
      <div className="mt-4 space-y-2">
        {predictions
          .filter(prediction => prediction.riskLevel === 'high')
          .map(prediction => (
            <RiskIndicator
              key={prediction.habitId}
              habitName={prediction.habitName}
              riskLevel={prediction.riskLevel}
              nextRiskDate={prediction.nextRiskDate}
              recommendations={prediction.recommendations.slice(0, 2)}
              color={habitColors[prediction.habitId]}
            />
          ))
        }
      </div>
    </div>
  );
}