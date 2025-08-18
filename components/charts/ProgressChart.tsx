'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HabitCompletion } from '@/types';
import { addDays, getDateString } from '@/lib/utils';

interface ProgressChartProps {
  completions: HabitCompletion[];
  habitId?: string;
  className?: string;
}

export function ProgressChart({ completions, habitId, className = '' }: ProgressChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = addDays(today, -i);
      const dateString = getDateString(date);
      
      let completedCount = 0;
      if (habitId) {
        // Single habit chart
        const completion = completions.find(c => c.habitId === habitId && c.date === dateString);
        completedCount = completion?.completed ? 1 : 0;
      } else {
        // Overall progress chart
        completedCount = completions.filter(c => c.date === dateString && c.completed).length;
      }
      
      data.push({
        date: dateString,
        completed: completedCount,
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      });
    }
    
    return data;
  }, [completions, habitId]);

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          {habitId ? 'Completion Trend' : 'Overall Progress'} (Last 30 Days)
        </h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              domain={[0, 'dataMax']}
            />
            <Tooltip 
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value) => [value, habitId ? 'Completed' : 'Habits Completed']}
              contentStyle={{
                backgroundColor: 'rgb(var(--surface-light))',
                border: '1px solid rgb(var(--border-light))',
                borderRadius: '8px',
              }}
            />
            <Line 
              type="monotone" 
              dataKey="completed" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}