'use client';

import { useMemo } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { HabitCalendar } from '@/components/charts/HabitCalendar';
import { ProgressChart } from '@/components/charts/ProgressChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import MoodHabitCorrelationComponent from '@/components/MoodHabitCorrelation';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak, calculateCompletionRate } from '@/lib/utils';
import { Target, TrendingUp, Calendar, Zap, Award } from 'lucide-react';

export default function StatsPage() {
  const { habits, completions, loading } = useHabits();

  const overallStats = useMemo(() => {
    const totalCompletions = completions.filter(c => c.completed).length;
    const totalPossible = completions.length;
    const overallCompletionRate = totalPossible > 0 ? Math.round((totalCompletions / totalPossible) * 100) : 0;
    
    // Calculate best streak across all habits
    let bestStreak = 0;
    habits.forEach(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const streak = calculateStreak(habitCompletions);
      if (streak > bestStreak) bestStreak = streak;
    });
    
    // Calculate active habits (completed at least once in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentCompletions = completions.filter(c => 
      c.completed && new Date(c.date) >= sevenDaysAgo
    );
    const activeHabits = new Set(recentCompletions.map(c => c.habitId)).size;

    return {
      totalHabits: habits.length,
      activeHabits,
      overallCompletionRate,
      bestStreak,
      totalCompletions,
    };
  }, [habits, completions]);

  const habitStats = useMemo(() => {
    return habits.map(habit => {
      const habitCompletions = completions.filter(c => c.habitId === habit.id);
      const streak = calculateStreak(habitCompletions);
      const completionRate = calculateCompletionRate(habitCompletions);
      const totalCompletions = habitCompletions.filter(c => c.completed).length;

      return {
        habit,
        streak,
        completionRate,
        totalCompletions,
        habitCompletions,
      };
    }).sort((a, b) => b.completionRate - a.completionRate);
  }, [habits, completions]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-surface-light dark:bg-background-dark">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-light dark:bg-background-dark">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Statistics
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Track your progress and see how you're doing
            </p>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                No data yet
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Create some habits and start tracking to see your statistics.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overall Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatsCard
                  title="Total Habits"
                  value={overallStats.totalHabits}
                  description="Habits you're tracking"
                  icon={Target}
                />
                <StatsCard
                  title="Active Habits"
                  value={overallStats.activeHabits}
                  description="Completed in last 7 days"
                  icon={Zap}
                />
                <StatsCard
                  title="Completion Rate"
                  value={`${overallStats.overallCompletionRate}%`}
                  description="Overall completion rate"
                  icon={TrendingUp}
                />
                <StatsCard
                  title="Best Streak"
                  value={`${overallStats.bestStreak} days`}
                  description="Longest streak achieved"
                  icon={Award}
                />
                <StatsCard
                  title="Total Completions"
                  value={overallStats.totalCompletions}
                  description="Habits completed"
                  icon={Calendar}
                />
              </div>

              {/* Progress Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart completions={completions} />
                </CardContent>
              </Card>

              {/* Mood-Habit Correlation */}
              <Card>
                <CardHeader>
                  <CardTitle>Mood & Habit Correlation</CardTitle>
                </CardHeader>
                <CardContent>
                  <MoodHabitCorrelationComponent days={30} />
                </CardContent>
              </Card>

              {/* Individual Habit Statistics */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Habit Performance
                </h2>
                
                <div className="grid gap-6">
                  {habitStats.map(({ habit, streak, completionRate, totalCompletions, habitCompletions }) => (
                    <Card key={habit.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: habit.color }}
                            />
                            <CardTitle className="task-title text-lg font-task-title">{habit.name}</CardTitle>
                          </div>
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                {streak}
                              </div>
                              <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                Current Streak
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-success-600 dark:text-success-400">
                                {completionRate}%
                              </div>
                              <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                Completion Rate
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                {totalCompletions}
                              </div>
                              <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                                Total Completions
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <ProgressChart 
                            completions={completions} 
                            habitId={habit.id}
                          />
                          <HabitCalendar 
                            completions={completions}
                            habitId={habit.id}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}