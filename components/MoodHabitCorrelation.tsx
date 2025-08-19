'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getMoodHabitCorrelation, getHabitMoodImpact, getUserHabits } from '@/lib/db';
import { MoodHabitCorrelation, HabitMoodImpact, Habit } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, Brain, Zap } from 'lucide-react';

interface MoodHabitCorrelationProps {
  days?: number;
}

export default function MoodHabitCorrelationComponent({ days = 30 }: MoodHabitCorrelationProps) {
  const { user } = useAuth();
  const [correlationData, setCorrelationData] = useState<MoodHabitCorrelation[]>([]);
  const [habitImpacts, setHabitImpacts] = useState<HabitMoodImpact[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCorrelationData = async () => {
      try {
        setLoading(true);
        setError(null);

        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const [correlation, userHabits] = await Promise.all([
          getMoodHabitCorrelation(user.uid, startDate, endDate),
          getUserHabits(user.uid)
        ]);

        // Get mood impact for each habit
        const impacts = await Promise.all(
          userHabits.map(habit => getHabitMoodImpact(user.uid, habit.id, days))
        );

        setCorrelationData(correlation);
        setHabitImpacts(impacts.filter(impact => impact.totalDaysWithData > 0));
        setHabits(userHabits);
      } catch (err) {
        console.error('Error fetching correlation data:', err);
        setError('Failed to load correlation data');
      } finally {
        setLoading(false);
      }
    };

    fetchCorrelationData();
  }, [user, days]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (correlationData.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Correlation Data</h3>
        <p className="text-gray-500">
          Start tracking your mood and habits for at least a few days to see correlations.
        </p>
      </div>
    );
  }

  // Calculate overall correlation coefficient
  const calculateCorrelation = (data: MoodHabitCorrelation[]) => {
    if (data.length < 2) return 0;
    
    const moodScores = data.map(d => d.moodScore);
    const completionRates = data.map(d => d.completionRate);
    
    const meanMood = moodScores.reduce((sum, val) => sum + val, 0) / moodScores.length;
    const meanCompletion = completionRates.reduce((sum, val) => sum + val, 0) / completionRates.length;
    
    let numerator = 0;
    let sumSquaredMood = 0;
    let sumSquaredCompletion = 0;
    
    for (let i = 0; i < data.length; i++) {
      const moodDiff = moodScores[i] - meanMood;
      const completionDiff = completionRates[i] - meanCompletion;
      
      numerator += moodDiff * completionDiff;
      sumSquaredMood += moodDiff * moodDiff;
      sumSquaredCompletion += completionDiff * completionDiff;
    }
    
    const denominator = Math.sqrt(sumSquaredMood * sumSquaredCompletion);
    return denominator === 0 ? 0 : numerator / denominator;
  };

  const correlation = calculateCorrelation(correlationData);
  
  // Find top habits by mood impact
  const topPositiveHabits = habitImpacts
    .filter(impact => impact.moodDifference > 0)
    .sort((a, b) => b.moodDifference - a.moodDifference)
    .slice(0, 3);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'completionRate') {
      return [`${(value * 100).toFixed(1)}%`, 'Completion Rate'];
    }
    if (name === 'moodScore') {
      return [value.toFixed(1), 'Mood Score'];
    }
    return [value, name];
  };

  return (
    <div className="space-y-6">
      {/* Overall Correlation Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mood-Habit Correlation</p>
              <p className="text-2xl font-bold text-gray-900">
                {(correlation * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {correlation > 0.3 ? 'Strong positive' : correlation > 0.1 ? 'Moderate positive' : 'Weak'} correlation
          </p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Points</p>
              <p className="text-2xl font-bold text-gray-900">{correlationData.length}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Days with mood & habit data</p>
        </div>

        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Completion</p>
              <p className="text-2xl font-bold text-gray-900">
                {(correlationData.reduce((sum, d) => sum + d.completionRate, 0) / correlationData.length * 100).toFixed(1)}%
              </p>
            </div>
            <Zap className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-xs text-gray-500 mt-1">Over the period</p>
        </div>
      </div>

      {/* Correlation Scatter Plot */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood vs Habit Completion</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="completionRate" 
                type="number"
                domain={[0, 1]}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Habit Completion Rate', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="moodScore"
                type="number"
                domain={[1, 5]}
                label={{ value: 'Mood Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(value) => `Completion: ${(value * 100).toFixed(1)}%`}
              />
              <Scatter dataKey="moodScore" fill="#3B82F6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood and Completion Timeline */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood & Completion Timeline</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={correlationData.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis yAxisId="left" domain={[1, 5]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={formatTooltipValue}
              />
              <Line yAxisId="left" type="monotone" dataKey="moodScore" stroke="#8B5CF6" strokeWidth={2} name="moodScore" />
              <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#10B981" strokeWidth={2} name="completionRate" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Positive Impact Habits */}
      {topPositiveHabits.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Habits with Positive Mood Impact</h3>
          <div className="space-y-3">
            {topPositiveHabits.map((impact) => {
              const habit = habits.find(h => h.id === impact.habitId);
              if (!habit) return null;

              return (
                <div key={impact.habitId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: habit.color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{habit.name}</p>
                      <p className="text-sm text-gray-600">
                        {impact.completedDaysCount} completed days tracked
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{impact.moodDifference.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">mood boost</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}