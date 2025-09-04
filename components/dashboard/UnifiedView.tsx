'use client';

import { useMemo, useState } from 'react';
import { Habit } from '@/types';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { usePersonalData } from '@/hooks/usePersonalData';
import {
  isHabitDueToday,
  isHabitOverdue,
  getNextDueDate,
} from '@/lib/utils';
import {
  Clock,
  AlertTriangle,
  Calendar,
  ChevronDown,
  Star,
  Sparkles,
  Target,
  CheckCircle
} from 'lucide-react';
import { theme } from '@/lib/theme';

interface UnifiedViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
}

export function UnifiedView({ habits, onEdit, onDelete }: UnifiedViewProps) {
  const { completions, isHabitCompleted, removeHabit } = usePersonalData();
  const [animatingHabits, setAnimatingHabits] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    upcoming: false,
    completed: false
  });

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    habit: Habit | null;
    loading: boolean;
  }>({
    isOpen: false,
    habit: null,
    loading: false
  });

  const sections = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Re-check completion status for all habits to ensure real-time updates
    const overdueHabits = habits.filter(habit => 
      isHabitOverdue(habit, completions) && !isHabitCompleted(habit.id)
    );
    const todayHabits = habits.filter(habit =>
      isHabitDueToday(habit) && !isHabitOverdue(habit, completions) && !isHabitCompleted(habit.id)
    );
    const completedTodayHabits = habits.filter(habit =>
      (isHabitDueToday(habit) || isHabitOverdue(habit, completions)) && isHabitCompleted(habit.id)
    );
    const upcomingHabits = habits.filter(habit => {
      const nextDue = getNextDueDate(habit);
      return nextDue && nextDue === tomorrow && !isHabitDueToday(habit);
    });

    return [
      {
        title: 'Overdue',
        habits: overdueHabits,
        priority: 'high' as const,
        collapsible: true,
        icon: AlertTriangle,
        color: 'red',
        gradient: 'from-red-50/60 via-orange-50/60 to-yellow-50/60 dark:from-red-950/30 dark:via-orange-950/30 dark:to-yellow-950/30',
        border: 'border-red-200/60 dark:border-red-800/60',
        description: 'Needs immediate attention',
        showCount: true
      },
      {
        title: 'Due Today',
        habits: todayHabits,
        priority: 'high' as const,
        collapsible: false, // Always expanded
        icon: Clock,
        color: 'blue',
        gradient: 'from-blue-50/60 via-indigo-50/60 to-purple-50/60 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30',
        border: 'border-blue-200/60 dark:border-blue-800/60',
        description: 'Your daily focus',
        showCount: true
      },
      {
        title: 'Completed Today',
        habits: completedTodayHabits,
        priority: 'low' as const,
        collapsible: true,
        icon: CheckCircle,
        color: 'green',
        gradient: 'from-green-50/60 via-emerald-50/60 to-teal-50/60 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30',
        border: 'border-green-200/60 dark:border-green-800/60',
        description: 'Great work today!',
        showCount: true
      },
      {
        title: 'Up Next',
        habits: upcomingHabits,
        priority: 'medium' as const,
        collapsible: true,
        icon: Calendar,
        color: 'purple',
        gradient: 'from-purple-50/60 via-pink-50/60 to-rose-50/60 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-rose-950/30',
        border: 'border-purple-200/60 dark:border-purple-800/60',
        description: 'Coming up tomorrow',
        showCount: true
      }
    ].filter(section => section.habits.length > 0);
  }, [habits, completions, isHabitCompleted]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle.toLowerCase().replace(/\s+/g, '')]: !prev[sectionTitle.toLowerCase().replace(/\s+/g, '')]
    }));
  };

  // Delete modal handlers
  const handleDeleteClick = (habit: Habit) => {
    setDeleteModalState({
      isOpen: true,
      habit,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.habit) return;

    try {
      setDeleteModalState(prev => ({ ...prev, loading: true }));
      await removeHabit(deleteModalState.habit!.id);

      // Call the parent's onDelete if provided
      if (onDelete) {
        onDelete(deleteModalState.habit!);
      }

      setDeleteModalState({
        isOpen: false,
        habit: null,
        loading: false
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      setDeleteModalState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalState({
      isOpen: false,
      habit: null,
      loading: false
    });
  };

  // Calculate today's progress - recalculate when sections or completions change
  const todayProgress = useMemo(() => {
    const todayTotal = sections.find(s => s.title === 'Due Today')?.habits.length || 0;
    const completedTotal = sections.find(s => s.title === 'Completed Today')?.habits.length || 0;
    const overdueTotal = sections.find(s => s.title === 'Overdue')?.habits.length || 0;
    const total = todayTotal + completedTotal + overdueTotal;
    const percentage = total > 0 ? Math.round((completedTotal / total) * 100) : 0;
    
    return { completed: completedTotal, total, percentage, timestamp: Date.now() };
  }, [sections, completions.length]); // Added completions.length to ensure updates

  if (habits.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Today's Progress Bar */}
      {todayProgress.total > 0 && (
        <div key={`progress-${todayProgress.timestamp}`} className={`${theme.surface.primary} rounded-xl p-6 border ${theme.border.default} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold ${theme.text.primary}`}>Today's Progress</h3>
              <p className={`text-sm ${theme.text.secondary}`}>
                {todayProgress.completed} of {todayProgress.total} habits completed
              </p>
            </div>
            <div className={`text-3xl font-bold ${
              todayProgress.percentage >= 80 ? 'text-green-600 dark:text-green-400' :
              todayProgress.percentage >= 50 ? 'text-blue-600 dark:text-blue-400' :
              todayProgress.percentage >= 30 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>
              {todayProgress.percentage}%
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                todayProgress.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                todayProgress.percentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                todayProgress.percentage >= 30 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}
              style={{ width: `${todayProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Sectioned Habits Display */}
      <div className="space-y-6">
        {sections.map((section) => {
          const isExpanded = section.collapsible 
            ? expandedSections[section.title.toLowerCase().replace(/\s+/g, '')]
            : true;
          const IconComponent = section.icon;

          return (
            <div key={section.title} className={`group ${theme.surface.primary} rounded-2xl border-2 ${section.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              {/* Section Header */}
              <div className={`bg-gradient-to-r ${section.gradient} px-4 sm:px-6 py-4 border-b ${section.border}`}>
                {section.collapsible ? (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-left group-hover:scale-[1.01] transition-transform duration-200 gap-3 sm:gap-0"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm flex-shrink-0">
                        <IconComponent className={`w-5 h-5 ${
                          section.color === 'red' ? 'text-red-500' :
                          section.color === 'blue' ? 'text-blue-500' :
                          section.color === 'green' ? 'text-green-500' :
                          section.color === 'purple' ? 'text-purple-500' :
                          'text-gray-500'
                        } drop-shadow-sm`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base sm:text-lg font-bold ${theme.text.primary} flex items-center gap-2`}>
                          {section.title}
                          {section.priority === 'high' && section.title !== 'Completed Today' && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                          {section.priority === 'medium' && <Sparkles className="w-4 h-4 text-purple-500" />}
                        </h3>
                        <p className={`text-sm ${theme.text.secondary}`}>
                          {section.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {section.showCount && (
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                          section.color === 'red' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                          section.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                          section.color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
                          section.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                          'bg-gray-100 dark:bg-gray-900/50 text-gray-700 dark:text-gray-300'
                        } shadow-sm`}>
                          {section.habits.length}
                        </span>
                      )}
                      <div className={`p-2 rounded-lg ${theme.surface.secondary} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                    </div>
                  </button>
                ) : (
                  // Non-collapsible header (Due Today)
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
                        <p className={`text-sm ${theme.text.secondary}`}>
                          {section.description} - always visible
                        </p>
                      </div>
                    </div>

                    {section.showCount && (
                      <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm">
                        {section.habits.length}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Section Content with Cards Layout */}
              <div className={`transition-all duration-500 ease-in-out ${
                isExpanded ? 'max-h-none opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'
              }`}>
                <div className="p-4 sm:p-6">
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                    {section.habits.map((habit, index) => (
                      <div
                        key={habit.id}
                        className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        <BenefitsHabitCard
                          habit={habit}
                          onEdit={onEdit}
                          onDelete={handleDeleteClick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        description={deleteModalState.habit ? `Are you sure you want to delete "${deleteModalState.habit.name}"?` : ''}
        confirmText="Delete Habit"
        isLoading={deleteModalState.loading}
      />
    </div>
  );
}