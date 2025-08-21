'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { MoodBar } from '@/components/moods/MoodBar';
import { Button } from '@/components/ui/Button';
import { useHabits } from '@/hooks/useHabits';
import { calculateStreak, calculateCompletionRate, getTodayDateString, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { Target, Plus } from 'lucide-react';
import Link from 'next/link';
import { Habit } from '@/types';

export default function DashboardPage() {
  const { habits, completions, loading } = useHabits();
  
  // State for habit editing
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Filter habits that are due today or overdue
  const todayHabits = useMemo(() => {
    return habits.filter(habit => 
      isHabitDueToday(habit) || isHabitOverdue(habit, completions)
    );
  }, [habits, completions]);

  
  const stats = useMemo(() => {
    const today = getTodayDateString();
    const todayCompletions = completions.filter(c => c.date === today && c.completed);
    const totalHabits = habits.length;
    const todayDueHabits = todayHabits.length;
    const completedToday = todayCompletions.length;
    
    // Calculate overall streak (consecutive days with at least one habit completed)
    const recentDates = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    });
    
    let overallStreak = 0;
    for (const date of recentDates) {
      const dayCompletions = completions.filter(c => c.date === date && c.completed);
      if (dayCompletions.length > 0) {
        overallStreak++;
      } else {
        break;
      }
    }
    
    // Calculate average completion rate
    const avgCompletionRate = habits.length > 0 
      ? Math.round(habits.reduce((sum, habit) => {
          const habitCompletions = completions.filter(c => c.habitId === habit.id);
          return sum + calculateCompletionRate(habitCompletions);
        }, 0) / habits.length)
      : 0;

    return {
      totalHabits,
      todayDueHabits,
      completedToday,
      overallStreak,
      avgCompletionRate,
    };
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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Link href="/habits/new">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Habit
                  </Button>
                </Link>
                <Link href="/habits">
                  <Button size="sm" variant="outline">
                    View All Habits
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Mood Bar */}
          <MoodBar className="mb-8" />

          {/* Today's Habits */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                  Today's Habits
                </h2>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {habits.length > 0 && (
                <Link href="/habits/new">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Habit
                  </Button>
                </Link>
              )}
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark mb-3">
                  Welcome to NextVibe!
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6 max-w-md mx-auto">
                  Start your journey to better habits. Create your first habit and begin tracking your progress with our intelligent insights.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/habits/new">
                    <Button size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Habit
                    </Button>
                  </Link>
                  <Link href="/habits">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Habits Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {habits.map((habit) => (
                    <BenefitsHabitCard 
                      key={habit.id} 
                      habit={habit} 
                      onEdit={(habit) => setEditingHabit(habit)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Floating Action Button */}
        {habits.length > 0 && (
          <Link href="/habits/new">
            <button className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group">
              <Plus className="w-6 h-6" />
              <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Quick Add Habit
              </span>
            </button>
          </Link>
        )}

        <EditHabitModal
          habit={editingHabit}
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      </div>
    </ProtectedRoute>
  );
}