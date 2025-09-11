'use client';

import { useMemo, useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { MoodBar } from '@/components/moods/MoodBar';
import { Button } from '@/components/ui/Button';
import { FamilyCreationBanner } from '@/components/ui/FamilyCreationBanner';
import { UnifiedView } from '@/components/dashboard/UnifiedView';

import { usePersonalData } from '@/hooks/usePersonalData';
import { calculateCompletionRate, getTodayDateString, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { Target, Plus, Flame, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Habit } from '@/types';
import { getRandomQuote, Quote } from '@/lib/quotes';

export default function DashboardPage() {
  const { habits, completions, loading } = usePersonalData();
  const router = useRouter();
  
  // State for habit editing
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  
  // Quote state
  const [currentQuote, setCurrentQuote] = useState<Quote>(() => getRandomQuote());
  
  // Navigation handlers for family creation banner
  const handleCreateFamily = () => {
    router.push('/family/create');
  };
  
  const handleJoinFamily = () => {
    router.push('/family/join');
  };

  // Quote refresh handler
  const handleRefreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  // Delete habit handler
  const handleDeleteHabit = (habit: Habit) => {
    // The delete confirmation is handled by UnifiedView
    // This callback can be used for any additional logic if needed
    console.log('Habit deletion initiated for:', habit.name);
  };
  
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
        <div className={`min-h-screen ${theme.surface.base}`}>
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
      <div className={`min-h-screen ${theme.surface.base}`}>
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dismissible Family Creation Banner */}
          <FamilyCreationBanner 
            onCreateFamily={handleCreateFamily}
            onJoinFamily={handleJoinFamily}
          />
          
          

                    {/* Dashboard Title and Actions */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button size="sm" onClick={() => setShowCreateHabitModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Habit
                </Button>
                <Link href="/habits">
                  <Button size="sm" variant="outline">
                    View All Habits
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Modern Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Momentum Card - Redesigned */}
            <div className="lg:col-span-2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-2xl opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <Flame className="w-7 h-7 text-white animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white animate-bounce">
                        🔥
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">Keep the Momentum Going!</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }}></div>
                          ))}
                        </div>
                        <span className="text-white/90 font-medium">You&apos;re crushing it today!</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats badges */}
                  <div className="flex flex-col gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                      <div className="text-xs text-white/70">Streak</div>
                      <div className="text-lg font-bold">{stats.overallStreak}d</div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                      <div className="text-xs text-white/70">Today</div>
                      <div className="text-lg font-bold">{stats.completedToday}/{stats.todayDueHabits}</div>
                    </div>
                  </div>
                </div>

                {/* Quote Section - Redesigned */}
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <blockquote className="text-white/95 italic text-sm leading-relaxed mb-2">
                        &ldquo;{currentQuote.text}&rdquo;
                      </blockquote>
                      <cite className="text-white/70 text-xs font-medium not-italic">
                        — {currentQuote.author}
                      </cite>
                    </div>
                    <button
                      onClick={handleRefreshQuote}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 group border border-white/20"
                      title="Get new inspiration"
                    >
                      <RefreshCw className="w-4 h-4 text-white/80 group-hover:text-white transition-all duration-200 group-hover:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Tracking Card - Enhanced */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl"></div>
              <div className="absolute inset-0 bg-white/10 rounded-2xl backdrop-blur-sm"></div>
              <div className="relative p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <span className="text-2xl">🧘</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Today&apos;s Vibe</h3>
                      <p className="text-white/70 text-sm">How are you feeling?</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/30">
                  <MoodBar className="mood-bar-enhanced" />
                </div>
                
                {/* Quick mood indicators */}
                <div className="flex justify-between mt-4 text-white/80">
                  <div className="text-center">
                    <div className="text-2xl mb-1">😊</div>
                    <div className="text-xs">Happy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚡</div>
                    <div className="text-xs">Energy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🧘</div>
                    <div className="text-xs">Calm</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-1">🌙</div>
                    <div className="text-xs">Rest</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Habits Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
                  Your Habits
                </h2>
                <p className={`text-sm ${theme.text.secondary}`}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Button size="sm" variant="outline" onClick={() => setShowCreateHabitModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Habit
                </Button>
              </div>
            </div>

            {habits.length === 0 ? (
              <div className={`text-center py-16 ${theme.surface.primary} rounded-xl border ${theme.border.default}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900 dark:to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className={`text-xl font-semibold ${theme.text.primary} mb-3`}>
                  Welcome to NextVibe!
                </h3>
                <p className={`${theme.text.secondary} mb-6 max-w-md mx-auto`}>
                  Start your journey to better habits. Create your first habit and begin tracking your progress with our intelligent insights.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button size="lg" onClick={() => setShowCreateHabitModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Habit
                  </Button>
                  <Link href="/habits">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <UnifiedView
                habits={habits}
                onEdit={(habit) => setEditingHabit(habit)}
                onDelete={handleDeleteHabit}
              />
            )}
          </div>
        </main>


        <EditHabitModal
          habit={editingHabit}
          isOpen={!!editingHabit}
          onClose={() => setEditingHabit(null)}
        />

        <CreateHabitModal
          isOpen={showCreateHabitModal}
          onClose={() => setShowCreateHabitModal(false)}
        />
      </div>
    </ProtectedRoute>
  );
}