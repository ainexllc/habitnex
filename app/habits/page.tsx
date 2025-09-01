'use client';

import { useState, useMemo, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { EditHabitModal } from '@/components/habits/EditHabitModal';
import { CreateHabitModal } from '@/components/habits/CreateHabitModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useHabits } from '@/hooks/useHabits';
import { useMoods } from '@/hooks/useMoods';
import { Habit } from '@/types';
import {
  Plus,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Star,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import {
  isHabitDueToday,
  isHabitOverdue,
  getNextDueDate,
  getDateString,
  addDays
} from '@/lib/utils';

export default function HabitsPage() {
  const { habits, completions, loading } = useHabits();
  const { moods } = useMoods();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    upcoming: false,
    all: false
  });

  const onEdit = (habit: Habit) => {
    setEditingHabit(habit);
  };


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

  // Categorize habits into sections (inspired by dashboard FocusView)
  const habitSections = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // First apply search/filter to get filtered habits
    const baseHabits = filteredHabits;

    // Categorize filtered habits
    const overdueHabits = baseHabits.filter(habit => isHabitOverdue(habit, completions));
    const todayHabits = baseHabits.filter(habit =>
      isHabitDueToday(habit) && !isHabitOverdue(habit, completions)
    );
    const upcomingHabits = baseHabits.filter(habit => {
      const nextDue = getNextDueDate(habit);
      return nextDue && nextDue === tomorrow && !isHabitDueToday(habit);
    });

    // All other habits (not overdue, not today, not tomorrow)
    const otherHabits = baseHabits.filter(habit => {
      return !isHabitOverdue(habit, completions) &&
             !isHabitDueToday(habit) &&
             (() => {
               const nextDue = getNextDueDate(habit);
               return !(nextDue && nextDue === tomorrow);
             })();
    });

    return [
      {
        title: 'Overdue',
        habits: overdueHabits,
        priority: 'high' as const,
        collapsible: true,
        icon: AlertTriangle,
        color: 'red',
        description: 'Needs immediate attention'
      },
      {
        title: 'Due Today',
        habits: todayHabits,
        priority: 'high' as const,
        collapsible: false, // Always expanded
        icon: Clock,
        color: 'blue',
        description: 'Your daily focus'
      },
      {
        title: 'Up Next',
        habits: upcomingHabits,
        priority: 'medium' as const,
        collapsible: true,
        icon: Calendar,
        color: 'purple',
        description: 'Coming up tomorrow'
      },
      {
        title: 'All Other Habits',
        habits: otherHabits,
        priority: 'low' as const,
        collapsible: true,
        icon: Target,
        color: 'gray',
        description: 'Future scheduled habits'
      }
    ].filter(section => section.habits.length > 0);
  }, [filteredHabits, completions]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle.toLowerCase().replace(/\s+/g, '')]: !prev[sectionTitle.toLowerCase().replace(/\s+/g, '')]
    }));
  };

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

                {/* Quick Actions Section */}
                <div className="lg:w-64">
                  <label className={`block text-sm font-medium ${theme.text.secondary} mb-2`}>
                    Quick Actions
                  </label>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateHabitModal(true)}
                      className="w-full justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Habit
                    </Button>
                    {filteredHabits.length !== habits.length && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedTag('');
                        }}
                        className="w-full justify-start"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
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
                {/* Sectioned Habits Display (Inspired by Dashboard FocusView) */}
                <div className="space-y-6">
                  {habitSections.map((section) => {
                    const isExpanded = expandedSections[section.title.toLowerCase().replace(/\s+/g, '')];
                    const IconComponent = section.icon;

                    return (
                      <div key={section.title} className={`group ${theme.surface.primary} rounded-2xl border-2 ${theme.border.default} shadow-lg hover:shadow-xl transition-all duration-300`}>
                        {/* Section Header */}
                        <div className="bg-gradient-to-r from-blue-50/60 via-purple-50/60 to-pink-50/60 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 px-4 sm:px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60">
                          {section.collapsible ? (
                            <button
                              onClick={() => toggleSection(section.title)}
                              className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-left group-hover:scale-[1.02] transition-transform duration-200 gap-3 sm:gap-0"
                            >
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm flex-shrink-0">
                                  <IconComponent className={`w-5 h-5 ${
                                    section.color === 'red' ? 'text-red-500' :
                                    section.color === 'blue' ? 'text-blue-500' :
                                    section.color === 'purple' ? 'text-purple-500' :
                                    'text-gray-500'
                                  } drop-shadow-sm`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-base sm:text-lg font-bold ${theme.text.primary} flex items-center gap-2`}>
                                    {section.title}
                                    {section.priority === 'high' && <Star className="w-4 h-4 text-yellow-500" />}
                                    {section.priority === 'medium' && <Sparkles className="w-4 h-4 text-purple-500" />}
                                  </h3>
                                  <p className={`text-sm ${theme.text.secondary} hidden sm:block`}>
                                    {section.description}
                                  </p>
                                  <p className={`text-xs ${theme.text.muted} sm:hidden`}>
                                    {section.habits.length} habit{section.habits.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="hidden sm:flex items-center gap-2">
                                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                                    section.color === 'red' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                                    section.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                                    section.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                                    'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
                                  } shadow-sm`}>
                                    {section.habits.length}
                                  </span>
                                </div>
                                <div className={`p-2 rounded-lg ${theme.surface.secondary} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                </div>
                              </div>
                            </button>
                          ) : (
                            // Non-collapsible header for "Due Today"
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm flex-shrink-0">
                                  <IconComponent className="w-5 h-5 text-blue-500 drop-shadow-sm" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className={`text-base sm:text-lg font-bold ${theme.text.primary} flex items-center gap-2`}>
                                    {section.title}
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                  </h3>
                                  <p className={`text-sm ${theme.text.secondary} hidden sm:block`}>
                                    {section.description} - always visible!
                                  </p>
                                  <p className={`text-xs ${theme.text.muted} sm:hidden`}>
                                    {section.habits.length} habit{section.habits.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="hidden sm:flex items-center gap-2">
                                  <span className={`px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm`}>
                                    {section.habits.length}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Section Content */}
                        <div className={`transition-all duration-500 ease-in-out ${
                          (section.collapsible && isExpanded) || (!section.collapsible && section.title === 'Due Today')
                            ? 'max-h-none opacity-100 overflow-visible'
                            : section.collapsible ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-none opacity-100 overflow-visible'
                        }`}>
                          <div className="p-4 sm:p-6">
                            <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                              {section.habits.map((habit, index) => (
                                <div
                                  key={habit.id}
                                  className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg fade-in-up"
                                  style={{
                                    animationDelay: `${index * 100}ms`
                                  }}
                                >
                                  <BenefitsHabitCard
                                    habit={habit}
                                    onEdit={onEdit}
                                  />
                                </div>
                              ))}
                            </div>

                            {/* Section completion message */}
                            {section.habits.length > 3 && (
                              <div className={`mt-6 p-4 rounded-xl ${
                                section.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                                section.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                                section.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' :
                                'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                              } border`}>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-white/80 dark:bg-gray-800/80 rounded-full flex items-center justify-center">
                                    <IconComponent className={`w-4 h-4 ${
                                      section.color === 'red' ? 'text-red-600 dark:text-red-400' :
                                      section.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                                      section.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                                      'text-gray-600 dark:text-gray-400'
                                    }`} />
                                  </div>
                                  <p className={`text-sm ${theme.status.info.text}`}>
                                    {section.title === 'Overdue' && 'Focus on completing these first - every step counts!'}
                                    {section.title === 'Due Today' && 'You\'ve got this! Complete these habits to maintain your streak.'}
                                    {section.title === 'Up Next' && 'These are scheduled for tomorrow. Review and prepare if needed.'}
                                    {section.title === 'All Other Habits' && 'These habits are scheduled for future dates. Keep building momentum!'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Weekly Summary - Desktop Only */}
                {habits.length > 0 && (
                  <div className="hidden md:block mt-8">
                    <div className={`${theme.surface.primary} rounded-xl p-6 border ${theme.border.default} shadow-sm`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Weekly Progress</h3>
                          <p className={`text-sm ${theme.text.secondary}`}>Your habit completion summary for this week</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-4">
                        {(() => {
                          const today = new Date();
                          const monday = new Date(today);
                          monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week

                          const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                          const fullWeekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

                          return weekDays.map((day, index) => {
                            const currentDate = new Date(monday);
                            currentDate.setDate(monday.getDate() + index);
                            const dateString = getDateString(currentDate);

                            // Get habits due on this day
                            const dayHabits = habits.filter(habit => {
                              const nextDue = getNextDueDate(habit);
                              return nextDue === dateString;
                            });

                            // Get completions for this day
                            const dayCompletions = completions.filter(c =>
                              c.date === dateString && c.completed
                            );

                            const completedCount = dayCompletions.length;
                            const totalCount = dayHabits.length;
                            const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

                            const isToday = dateString === getDateString(today);
                            const isPast = currentDate < today;

                            return (
                              <div
                                key={day}
                                className={`p-4 rounded-lg border transition-all duration-200 ${
                                  isToday
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 ring-2 ring-blue-200 dark:ring-blue-600'
                                    : isPast
                                    ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
                                    : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                                }`}
                              >
                                <div className="text-center">
                                  <div className={`text-sm font-medium ${theme.text.primary} mb-1`}>
                                    {day}
                                  </div>
                                  <div className={`text-xs ${theme.text.secondary} mb-2`}>
                                    {currentDate.getDate()}
                                  </div>

                                  {totalCount > 0 ? (
                                    <>
                                      <div className={`text-lg font-bold mb-1 ${
                                        completionRate >= 80 ? 'text-green-600 dark:text-green-400' :
                                        completionRate >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-orange-600 dark:text-orange-400'
                                      }`}>
                                        {completionRate}%
                                      </div>
                                      <div className={`text-xs ${theme.text.secondary} mb-3`}>
                                        {completedCount}/{totalCount}
                                      </div>

                                      {/* Mini progress bar */}
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
                                        <div
                                          className={`h-1.5 rounded-full transition-all duration-500 ${
                                            completionRate >= 80 ? 'bg-green-500' :
                                            completionRate >= 50 ? 'bg-blue-500' :
                                            'bg-orange-500'
                                          }`}
                                          style={{ width: `${completionRate}%` }}
                                        />
                                      </div>

                                      {/* Status indicator */}
                                      <div className={`text-xs font-medium ${
                                        isToday ? 'text-blue-600 dark:text-blue-400' :
                                        completionRate === 100 ? 'text-green-600 dark:text-green-400' :
                                        completionRate > 0 ? 'text-blue-600 dark:text-blue-400' :
                                        'text-gray-500'
                                      }`}>
                                        {isToday ? 'Today' :
                                         completionRate === 100 ? 'Complete' :
                                         completionRate > 0 ? 'Partial' :
                                         'Pending'}
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className={`text-lg font-bold mb-1 text-gray-400`}>
                                        -
                                      </div>
                                      <div className={`text-xs ${theme.text.secondary} mb-3`}>
                                        No habits
                                      </div>
                                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2 opacity-30">
                                        <div className="h-1.5 rounded-full bg-gray-400 w-0" />
                                      </div>
                                      <div className={`text-xs font-medium text-gray-500`}>
                                        Rest Day
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      {/* Weekly stats summary */}
                      <div className={`mt-6 pt-4 border-t ${theme.border.default}`}>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className={`text-2xl font-bold ${theme.text.primary}`}>
                              {(() => {
                                const thisWeek = completions.filter(c => {
                                  const completionDate = new Date(c.date);
                                  const today = new Date();
                                  const monday = new Date(today);
                                  monday.setDate(today.getDate() - today.getDay() + 1);
                                  const sunday = new Date(monday);
                                  sunday.setDate(monday.getDate() + 6);
                                  return completionDate >= monday && completionDate <= sunday && c.completed;
                                }).length;
                                return thisWeek;
                              })()}
                            </div>
                            <div className={`text-sm ${theme.text.secondary}`}>Completed This Week</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${theme.text.primary}`}>
                              {(() => {
                                const today = new Date();
                                const monday = new Date(today);
                                monday.setDate(today.getDate() - today.getDay() + 1);
                                const sunday = new Date(monday);
                                sunday.setDate(monday.getDate() + 6);

                                let totalHabitsThisWeek = 0;
                                for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
                                  const dateString = getDateString(d);
                                  totalHabitsThisWeek += habits.filter(habit => {
                                    const nextDue = getNextDueDate(habit);
                                    return nextDue === dateString;
                                  }).length;
                                }
                                return totalHabitsThisWeek;
                              })()}
                            </div>
                            <div className={`text-sm ${theme.text.secondary}`}>Total Habits This Week</div>
                          </div>
                          <div>
                            <div className={`text-2xl font-bold ${
                              (() => {
                                const today = new Date();
                                const monday = new Date(today);
                                monday.setDate(today.getDate() - today.getDay() + 1);
                                const sunday = new Date(monday);
                                sunday.setDate(monday.getDate() + 6);

                                let completed = 0;
                                let total = 0;
                                for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
                                  const dateString = getDateString(d);
                                  const dayHabits = habits.filter(habit => {
                                    const nextDue = getNextDueDate(habit);
                                    return nextDue === dateString;
                                  });
                                  total += dayHabits.length;
                                  completed += completions.filter(c => c.date === dateString && c.completed).length;
                                }
                                const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                                return rate >= 80 ? 'text-green-600 dark:text-green-400' :
                                       rate >= 50 ? 'text-blue-600 dark:text-blue-400' :
                                       'text-orange-600 dark:text-orange-400';
                              })()
                            }`}>
                              {(() => {
                                const today = new Date();
                                const monday = new Date(today);
                                monday.setDate(today.getDate() - today.getDay() + 1);
                                const sunday = new Date(monday);
                                sunday.setDate(monday.getDate() + 6);

                                let completed = 0;
                                let total = 0;
                                for (let d = new Date(monday); d <= sunday; d.setDate(d.getDate() + 1)) {
                                  const dateString = getDateString(d);
                                  const dayHabits = habits.filter(habit => {
                                    const nextDue = getNextDueDate(habit);
                                    return nextDue === dateString;
                                  });
                                  total += dayHabits.length;
                                  completed += completions.filter(c => c.date === dateString && c.completed).length;
                                }
                                return total > 0 ? Math.round((completed / total) * 100) : 0;
                              })()}%
                            </div>
                            <div className={`text-sm ${theme.text.secondary}`}>Weekly Average</div>
                          </div>
                        </div>
                      </div>
                    </div>
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