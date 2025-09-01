'use client';

import { useMemo, useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { MoodBar } from '@/components/moods/MoodBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FamilyCreationBanner } from '@/components/ui/FamilyCreationBanner';
import { DashboardViewSwitcher } from '@/components/dashboard/DashboardViewSwitcher';
import { FocusView } from '@/components/dashboard/FocusView';
import { CompactView } from '@/components/dashboard/CompactView';
import { SummaryView } from '@/components/dashboard/SummaryView';
import { useHabits } from '@/hooks/useHabits';
import { useFamilyStatus } from '@/contexts/FamilyContext';
import { calculateStreak, calculateCompletionRate, getTodayDateString, isHabitDueToday, isHabitOverdue } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { Target, Plus, Users, Home } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Habit } from '@/types';
import { DashboardViewType } from '@/types/dashboard';

export default function DashboardPage() {
  const { habits, completions, loading } = useHabits();
  const { hasFamily, familyName, loading: familyLoading } = useFamilyStatus();
  const router = useRouter();
  
  // State for habit editing
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  
  // Dashboard view state
  const [currentView, setCurrentView] = useState<DashboardViewType>(DashboardViewType.FOCUS);

  // Load preferred view from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('preferredDashboardView') as DashboardViewType;
    if (savedView && Object.values(DashboardViewType).includes(savedView)) {
      setCurrentView(savedView);
    }
  }, []);
  
  // Navigation handlers for family creation banner
  const handleCreateFamily = () => {
    router.push('/family/create');
  };
  
  const handleJoinFamily = () => {
    router.push('/family/join');
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
          
          {/* Family Mode Active */}
          {hasFamily && (
            <Card className="mb-8 border-2 border-green-200 dark:border-green-700 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">{familyName}</h3>
                      <p className="text-gray-600 dark:text-gray-300">Your family dashboard is ready!</p>
                    </div>
                  </div>
                  <Link href="/dashboard/family">
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Users className="w-4 h-4 mr-2" />
                      Family Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-start justify-between mb-8">
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

          {/* Mood Bar */}
          <MoodBar className="mb-8" />

          {/* Habits Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
                  {currentView === DashboardViewType.FOCUS ? 'Today\'s Focus' : 'Your Habits'}
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
                {habits.length > 0 && (
                  <DashboardViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    habitCount={habits.length}
                  />
                )}
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
              <div className="space-y-8">
                {/* Dynamic View Rendering */}
                {currentView === DashboardViewType.FOCUS && (
                  <FocusView
                    habits={habits}
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                )}

                {currentView === DashboardViewType.SUMMARY && (
                  <SummaryView
                    habits={habits}
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                )}

                {currentView === DashboardViewType.COMPACT && (
                  <CompactView
                    habits={habits}
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                )}
                
                {currentView === DashboardViewType.CARDS && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {habits.map((habit) => (
                      <BenefitsHabitCard 
                        key={habit.id} 
                        habit={habit} 
                        onEdit={(habit) => setEditingHabit(habit)}
                      />
                    ))}
                  </div>
                )}
                
                {(currentView === DashboardViewType.PRIORITY || currentView === DashboardViewType.CATEGORIES) && (
                  <div className={`${theme.surface.secondary} rounded-lg p-8 text-center`}>
                    <Target className={`w-12 h-12 ${theme.text.muted} mx-auto mb-4`} />
                    <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
                      Coming Soon
                    </h3>
                    <p className={`${theme.text.muted} mb-4`}>
                      {currentView === DashboardViewType.PRIORITY 
                        ? 'Priority Matrix view is coming in the next update.'
                        : 'Category Groups view is coming in the next update.'
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentView(DashboardViewType.FOCUS)}
                    >
                      Switch to Focus View
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Floating Action Button */}
        {habits.length > 0 && (
          <button
            onClick={() => setShowCreateHabitModal(true)}
            className="fixed bottom-6 right-6 bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50 group"
          >
            <Plus className="w-6 h-6" />
            <span className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Quick Add Habit
            </span>
          </button>
        )}

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