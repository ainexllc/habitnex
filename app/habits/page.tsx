'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { HabitCard } from '@/components/habits/HabitCard';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { ViewSwitcher } from '@/components/habits/ViewSwitcher';
import { ListView } from '@/components/habits/views/ListView';
import { CalendarView } from '@/components/habits/views/CalendarView';
import { TableView } from '@/components/habits/views/TableView';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useHabits } from '@/hooks/useHabits';
import { Habit } from '@/types';
import { HabitViewType } from '@/types/views';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function HabitsPage() {
  const { habits, loading } = useHabits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [currentView, setCurrentView] = useState<HabitViewType>(HabitViewType.GRID);

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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                All Habits
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Manage and track all your habits
              </p>
            </div>
            
            <Link href="/habits/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Habit
              </Button>
            </Link>
          </div>

          {/* Search, Filter, and View Switcher */}
          {habits.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted-light dark:text-text-muted-dark w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search habits..."
                  className="input w-full pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-text-muted-light dark:text-text-muted-dark" />
                  <select
                    className="input min-w-[150px]"
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
                
                <ViewSwitcher
                  currentView={currentView}
                  onViewChange={setCurrentView}
                  enabledViews={[HabitViewType.GRID, HabitViewType.LIST, HabitViewType.CALENDAR, HabitViewType.TABLE]}
                />
              </div>
            </div>
          )}

          {/* Habits Grid */}
          <div className="space-y-6">
            {habits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
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
            ) : filteredHabits.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
                </div>
                <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                  No habits found
                </h3>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    Showing {filteredHabits.length} of {habits.length} habits
                  </p>
                </div>
                
{/* Conditional View Rendering */}
                {currentView === HabitViewType.GRID ? (
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
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Coming Soon
                    </h3>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark">
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
      </div>
    </ProtectedRoute>
  );
}