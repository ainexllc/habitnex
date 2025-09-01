'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { HabitCard } from '@/components/habits/HabitCard';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { ViewSwitcher } from '@/components/habits/ViewSwitcher';
import { HabitListOptimized } from '@/components/habits/HabitListOptimized';
import { ListView } from '@/components/habits/views/ListView';
import { CalendarView } from '@/components/habits/views/CalendarView';
import { TableView } from '@/components/habits/views/TableView';
import { HeatmapView } from '@/components/habits/views/HeatmapView';
import { AICoachView } from '@/components/habits/views/AICoachView';
import { MomentumWaveView } from '@/components/habits/views/MomentumWaveView';
import { PredictiveTimelineView } from '@/components/habits/views/PredictiveTimelineView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useHabits } from '@/hooks/useHabits';
import { useMoods } from '@/hooks/useMoods';
import { Habit } from '@/types';
import { HabitViewType } from '@/types/views';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';

export default function HabitsPage() {
  const { habits, completions, loading } = useHabits();
  const { moods } = useMoods();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [currentView, setCurrentView] = useState<HabitViewType>(HabitViewType.COMPACT);

  // Load preferred view from localStorage
  useEffect(() => {
    const savedView = localStorage.getItem('preferredHabitView') as HabitViewType;
    if (savedView && Object.values(HabitViewType).includes(savedView)) {
      setCurrentView(savedView);
    }
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    habits.forEach(habit => {
      // Handle both new tags array and legacy category
      if (habit.tags && habit.tags.length > 0) {
        habit.tags.forEach(tag => tags.add(tag));
      } else if ((habit as any).category) {
        tags.add((habit as any).category.toLowerCase().replace(/\s+/g, '-'));
      }
    });
    return Array.from(tags).filter(Boolean).sort();
  }, [habits]);

  const filteredHabits = useMemo(() => {
    return habits.filter(habit => {
      const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!selectedTag) return matchesSearch;
      
      // Check both new tags array and legacy category
      const habitTags = habit.tags || [];
      const legacyCategory = (habit as any).category?.toLowerCase().replace(/\s+/g, '-');
      const matchesTag = habitTags.includes(selectedTag) || legacyCategory === selectedTag;
      
      return matchesSearch && matchesTag;
    });
  }, [habits, searchTerm, selectedTag]);

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
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className={`text-3xl font-bold ${theme.text.primary}`}>
                  All Habits
                </h1>
                <p className={`${theme.text.secondary} mt-1`}>
                  Manage and track all your habits
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Button size="sm" onClick={() => setShowCreateHabitModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Habit
                </Button>
                <Link href="/dashboard">
                  <Button size="sm" variant="outline">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>

            {/* Motivational Section */}
            {habits.length > 0 && (
              <div className={`${theme.surface.primary} rounded-lg p-4 border ${theme.border.default} shadow-sm mb-6`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">💪</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Your Habit Journey</h3>
                    <p className={`text-sm ${theme.text.secondary}`}>
                      You're tracking {habits.length} habit{habits.length !== 1 ? 's' : ''} - every small step counts toward your goals!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls Section */}
          {habits.length > 0 && (
            <div className={`${theme.surface.primary} rounded-xl p-6 border ${theme.border.default} shadow-sm mb-8`}>
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Search Section */}
                <div className="flex-1">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Search Habits
                  </label>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.muted} w-4 h-4`} />
                    <input
                      type="text"
                      placeholder="Search by name or description..."
                      className={`w-full pl-10 pr-4 py-2 border ${theme.border.default} rounded-lg bg-white dark:bg-gray-800 ${theme.text.primary} placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Filter Section */}
                <div className="lg:w-48">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Filter by Tag
                  </label>
                  <div className="relative">
                    <Filter className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.text.muted} w-4 h-4`} />
                    <select
                      className={`w-full pl-10 pr-4 py-2 border ${theme.border.default} rounded-lg bg-white dark:bg-gray-800 ${theme.text.primary} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none`}
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                    >
                      <option value="">All Tags</option>
                      {allTags.map(tag => (
                        <option key={tag} value={tag}>
                          #{tag}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* View Switcher Section */}
                <div className="lg:w-64">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    View Style
                  </label>
                  <ViewSwitcher
                    currentView={currentView}
                    onViewChange={setCurrentView}
                    enabledViews={[HabitViewType.COMPACT, HabitViewType.GRID, HabitViewType.LIST, HabitViewType.CALENDAR, HabitViewType.TABLE, HabitViewType.HEATMAP, HabitViewType.AI_COACH, HabitViewType.MOMENTUM, HabitViewType.TIMELINE]}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Habits Display */}
          <div className="space-y-6">
            {habits.length === 0 ? (
              <div className={`text-center py-20 ${theme.surface.primary} rounded-3xl border-2 border-dashed ${theme.border.light} shadow-lg relative overflow-hidden`}>
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-8 left-8 w-20 h-20 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-8 right-8 w-24 h-24 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <Plus className="w-10 h-10 text-white" />
                    </div>
                  </div>

                  <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
                    Ready to Build Great Habits? 🌟
                  </h3>

                  <p className={`text-base ${theme.text.secondary} mb-8 max-w-lg mx-auto leading-relaxed`}>
                    Your habit journey starts here. Create your first habit and watch your daily routine transform into something extraordinary.
                    Every small step leads to amazing results!
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <Button size="lg" onClick={() => setShowCreateHabitModal(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Habit
                    </Button>
                  </div>

                  {/* Motivational checklist */}
                  <div className="max-w-md mx-auto">
                    <div className="text-left space-y-2">
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-xs">✓</span>
                        </div>
                        <span>Set achievable daily goals</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-xs">●</span>
                        </div>
                        <span>Build consistent routines</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 text-xs">●</span>
                        </div>
                        <span>Celebrate your progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredHabits.length === 0 ? (
              <div className={`text-center py-16 ${theme.surface.primary} rounded-2xl border ${theme.border.default} shadow-lg`}>
                <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
                  No habits found
                </h3>
                <p className={`${theme.text.secondary} mb-4 max-w-md mx-auto`}>
                  We couldn't find any habits matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button variant="outline" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTag('')}>
                    Clear Filter
                  </Button>
                </div>
              </div>
            ) : (
              <>

                
{/* Conditional View Rendering */}
                {currentView === HabitViewType.COMPACT ? (
                  <HabitListOptimized 
                    habits={filteredHabits} 
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : currentView === HabitViewType.GRID ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredHabits.map((habit) => (
                      <HabitCard 
                        key={habit.id} 
                        habit={habit} 
                        onEdit={(habit) => setEditingHabit(habit)}
                      />
                    ))}
                  </div>
                ) : currentView === HabitViewType.LIST ? (
                  <ListView 
                    habits={filteredHabits} 
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : currentView === HabitViewType.CALENDAR ? (
                  <CalendarView 
                    habits={filteredHabits} 
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : currentView === HabitViewType.TABLE ? (
                  <TableView 
                    habits={filteredHabits} 
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : currentView === HabitViewType.HEATMAP ? (
                  <HeatmapView habits={filteredHabits} />
                ) : currentView === HabitViewType.AI_COACH ? (
                  <AICoachView 
                    habits={filteredHabits}
                    completions={completions}
                    moods={moods}
                  />
                ) : currentView === HabitViewType.MOMENTUM ? (
                  <MomentumWaveView
                    habits={filteredHabits}
                    completions={completions}
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : currentView === HabitViewType.TIMELINE ? (
                  <PredictiveTimelineView
                    habits={filteredHabits}
                    completions={completions}
                    moods={moods}
                    onEdit={(habit) => setEditingHabit(habit)}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
                      Coming Soon
                    </h3>
                    <p className={theme.text.secondary}>
                      This view is coming in a future update.
                    </p>
                  </div>
                )}
              </>
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