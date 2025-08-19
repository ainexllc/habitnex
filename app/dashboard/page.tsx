'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { HabitCard } from '@/components/habits/HabitCard';
import { QuickActions } from '@/components/habits/QuickActions';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { MoodForm } from '@/components/moods/MoodForm';
import { MoodCard } from '@/components/moods/MoodCard';
import { MoodEditModal } from '@/components/moods/MoodEditModal';
import { Button } from '@/components/ui/Button';
import { useHabits } from '@/hooks/useHabits';
import { useMoods } from '@/hooks/useMoods';
import { calculateStreak, calculateCompletionRate, getTodayDateString, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { Target, TrendingUp, Calendar, Zap, Plus } from 'lucide-react';
import Link from 'next/link';
import { MoodEntry } from '@/types';

export default function DashboardPage() {
  const { habits, completions, loading } = useHabits();
  const { moods, addMood, editMood, removeMood, getTodayMood, loading: moodsLoading } = useMoods();
  
  // State for mood editing
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Filter habits that are due today or overdue
  const todayHabits = useMemo(() => {
    return habits.filter(habit => 
      isHabitDueToday(habit) || isHabitOverdue(habit, completions)
    );
  }, [habits, completions]);

  // Get today's mood
  const todayMood = getTodayMood();

  const handleMoodSubmit = async (moodData: any) => {
    try {
      await addMood(moodData);
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  };

  const handleMoodEdit = (mood: MoodEntry) => {
    setEditingMood(mood);
    setIsEditModalOpen(true);
  };

  const handleMoodEditSave = async (moodData: any) => {
    if (!editingMood) return;
    
    try {
      await editMood(editingMood.id, moodData);
    } catch (error) {
      console.error('Failed to edit mood:', error);
      throw error;
    }
  };

  const handleMoodDelete = async (moodId: string) => {
    try {
      await removeMood(moodId);
    } catch (error) {
      console.error('Failed to delete mood:', error);
    }
  };
  
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
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatsCard
                  title="Total Habits"
                  value={stats.totalHabits}
                  icon={Target}
                />
                <StatsCard
                  title="Completed Today"
                  value={`${stats.completedToday}/${stats.todayDueHabits}`}
                  icon={Calendar}
                />
                <StatsCard
                  title="Current Streak"
                  value={`${stats.overallStreak} days`}
                  icon={Zap}
                />
                <StatsCard
                  title="Avg Completion"
                  value={`${stats.avgCompletionRate}%`}
                  icon={TrendingUp}
                />
              </div>
              
              {habits.length === 0 && (
                <Link href="/habits/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Habit
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Today's Habits */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                Today's Habits
              </h2>
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>

            {habits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  No habits yet
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark mb-4">
                  Start building better habits by creating your first one.
                </p>
                <Link href="/habits/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Habit
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Habits Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <QuickActions />
                  </div>
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {habits.map((habit) => (
                      <HabitCard key={habit.id} habit={habit} />
                    ))}
                  </div>
                </div>

                {/* Mood Section */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
                      Today's Mood
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mood Form or Today's Mood */}
                    <div>
                      {!todayMood ? (
                        <MoodForm 
                          onSubmit={handleMoodSubmit}
                          loading={moodsLoading}
                          date={getTodayDateString()}
                        />
                      ) : (
                        <MoodCard 
                          mood={todayMood} 
                          onEdit={handleMoodEdit}
                          onDelete={handleMoodDelete}
                        />
                      )}
                    </div>

                    {/* Recent Mood History */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark">
                        Recent Mood History
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {moods.slice(0, 3).map((mood) => (
                          <MoodCard 
                            key={mood.id} 
                            mood={mood} 
                            onEdit={handleMoodEdit}
                            onDelete={handleMoodDelete}
                          />
                        ))}
                        {moods.length === 0 && !moodsLoading && (
                          <p className="text-text-secondary-light dark:text-text-secondary-dark text-center py-8">
                            No mood entries yet. Track your first mood!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Mood Edit Modal */}
        <MoodEditModal
          mood={editingMood}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMood(null);
          }}
          onSave={handleMoodEditSave}
          loading={moodsLoading}
        />
      </div>
    </ProtectedRoute>
  );
}