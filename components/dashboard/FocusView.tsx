'use client';

import { useMemo } from 'react';
import { Habit } from '@/types';
import { DashboardSection } from '@/types/dashboard';
import { BenefitsHabitCard } from '@/components/habits/BenefitsHabitCard';
import { CompactHabitCard } from './CompactHabitCard';
import {
  isHabitDueToday,
  isHabitOverdue,
  getNextDueDate,
  calculateStreak
} from '@/lib/utils';
import { useHabits } from '@/hooks/useHabits';
import {
  Clock,
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Target,
  Flame,
  Star,
  Zap,
  Trophy,
  Sparkles,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { theme } from '@/lib/theme';

interface FocusViewProps {
  habits: Habit[];
  onEdit: (habit: Habit) => void;
}

export function FocusView({ habits, onEdit }: FocusViewProps) {
  const { completions } = useHabits();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overdue: true,
    today: true,
    upcoming: false
  });

    const sections = useMemo((): DashboardSection[] => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Categorize habits
    const overdueHabits = habits.filter(habit => isHabitOverdue(habit, completions));
    const todayHabits = habits.filter(habit =>
      isHabitDueToday(habit) && !isHabitOverdue(habit, completions)
    );
    const upcomingHabits = habits.filter(habit => {
      const nextDue = getNextDueDate(habit);
      return nextDue && nextDue === tomorrow && !isHabitDueToday(habit);
    });

    return [
      {
        title: 'Overdue',
        habits: overdueHabits,
        priority: 'high',
        collapsible: true,
        defaultExpanded: true
      },
      {
        title: 'Due Today',
        habits: todayHabits,
        priority: 'high',
        collapsible: false, // Always expanded, no collapse arrow
        defaultExpanded: true
      },
      {
        title: 'Up Next',
        habits: upcomingHabits,
        priority: 'medium',
        collapsible: true,
        defaultExpanded: false
      }
    ];
  }, [habits, completions]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle.toLowerCase()]: !prev[sectionTitle.toLowerCase()]
    }));
  };

  const getSectionIcon = (title: string) => {
    switch (title) {
      case 'Overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-sm" />;
      case 'Due Today':
        return <Clock className="w-5 h-5 text-blue-500 drop-shadow-sm" />;
      case 'Up Next':
        return <Calendar className="w-5 h-5 text-purple-500 drop-shadow-sm" />;
      default:
        return <Target className="w-5 h-5 text-gray-500 drop-shadow-sm" />;
    }
  };

  const getSectionGradient = (title: string) => {
    switch (title) {
      case 'Overdue':
        return 'from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30';
      case 'Due Today':
        return 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30';
      case 'Up Next':
        return 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30';
      default:
        return 'from-gray-50 to-slate-50 dark:from-gray-950/30 dark:to-slate-950/30';
    }
  };

  const getSectionBorder = (title: string) => {
    switch (title) {
      case 'Overdue':
        return 'border-red-200 dark:border-red-800';
      case 'Due Today':
        return 'border-blue-200 dark:border-blue-800';
      case 'Up Next':
        return 'border-purple-200 dark:border-purple-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getMotivationalIcon = (title: string) => {
    switch (title) {
      case 'Overdue':
        return <Zap className="w-4 h-4 text-orange-500" />;
      case 'Due Today':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'Up Next':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate total completed habits today
  const todayCompletions = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return completions.filter(c => c.date === today && c.completed).length;
  }, [completions]);

  if (habits.length === 0) {
    return (
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
            <Target className="relative w-20 h-20 text-blue-500 mx-auto drop-shadow-lg animate-bounce" />
          </div>

          <h3 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>
            Ready to Build Great Habits? 🌟
          </h3>

          <p className={`text-base ${theme.text.secondary} mb-8 max-w-lg mx-auto leading-relaxed`}>
            Your habit journey starts here. Create your first habit and watch your daily routine transform into something extraordinary.
            Every small step leads to amazing results!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-medium px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <Sparkles className="w-4 h-4" />
              Start small, dream big
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
              <Trophy className="w-4 h-4" />
              Track your progress
            </div>
          </div>

          {/* Motivational checklist */}
          <div className="max-w-md mx-auto">
            <div className="text-left space-y-2">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span>Set achievable daily goals</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span>Build consistent routines</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <span>Celebrate your progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalHabitsDue = sections[0].habits.length + sections[1].habits.length;
  const progressPercentage = totalHabitsDue > 0 ? Math.round((todayCompletions / totalHabitsDue) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Progress Overview Card */}
      {totalHabitsDue > 0 && (
        <div className={`${theme.surface.primary} rounded-2xl p-4 sm:p-6 border ${theme.border.default} shadow-lg hover:shadow-xl transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-bold ${theme.text.primary}`}>Today's Progress</h3>
                <p className={`text-sm ${theme.text.secondary}`}>{todayCompletions} of {totalHabitsDue} habits completed</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className={`text-3xl sm:text-2xl font-bold ${progressPercentage >= 80 ? 'text-green-600 dark:text-green-400' : progressPercentage >= 50 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                {progressPercentage}%
              </div>
              <p className={`text-xs ${theme.text.muted}`}>Complete</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className={`w-full ${theme.surface.tertiary} rounded-full h-3 overflow-hidden`}>
              <div
                className={`h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            {progressPercentage >= 100 && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse opacity-30"></div>
            )}
          </div>
        </div>
      )}

      {/* Habit Sections */}
      {sections.map((section) => {
        if (section.habits.length === 0) return null;

        const isExpanded = expandedSections[section.title.toLowerCase()];
        const sectionGradient = getSectionGradient(section.title);

        return (
          <div key={section.title} className={`group ${theme.surface.primary} rounded-2xl border-2 ${section.title === 'Due Today' ? theme.border.default : getSectionBorder(section.title)} shadow-lg hover:shadow-xl transition-all duration-300`}>
            {/* Section Header with Gradient Background */}
            <div className={`bg-gradient-to-r ${sectionGradient} px-4 sm:px-6 py-4 border-b ${section.title === 'Due Today' ? theme.border.default : getSectionBorder(section.title)}`}>
              {section.collapsible ? (
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between text-left group-hover:scale-[1.02] transition-transform duration-200 gap-3 sm:gap-0"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center shadow-md backdrop-blur-sm flex-shrink-0">
                      {getSectionIcon(section.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-bold ${theme.text.primary} flex items-center gap-2`}>
                        {section.title}
                        {getMotivationalIcon(section.title)}
                      </h3>
                      <p className={`text-sm ${theme.text.secondary} hidden sm:block`}>
                        {section.title === 'Overdue' && 'Let\'s get these done!'}
                        {section.title === 'Due Today' && 'Your daily focus'}
                        {section.title === 'Up Next' && 'Coming up tomorrow'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                        section.title === 'Overdue' ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' :
                        section.title === 'Due Today' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                        'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
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
                      {getSectionIcon(section.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-base sm:text-lg font-bold ${theme.text.primary} flex items-center gap-2`}>
                        {section.title}
                        {getMotivationalIcon(section.title)}
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </h3>
                      <p className={`text-sm ${theme.text.secondary} hidden sm:block`}>
                        {section.title === 'Due Today' && 'Your daily focus - always visible!'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 shadow-sm`}>
                        {section.habits.length}
                      </span>
                    </div>
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Content with Smooth Animation */}
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

                {/* Section Completion Message */}
                {section.habits.length > 3 && (
                  <div className={`mt-6 p-4 rounded-xl ${theme.status.info.bg} border ${theme.status.info.border}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className={`text-sm ${theme.status.info.text}`}>
                        {section.title === 'Overdue' && 'Focus on completing these first - every step counts!'}
                        {section.title === 'Due Today' && 'You\'ve got this! Complete these habits to maintain your streak.'}
                        {section.title === 'Up Next' && 'These are scheduled for tomorrow. Review and prepare if needed.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Enhanced Motivational Footer */}
      <div className={`text-center py-8 px-6 ${theme.surface.primary} rounded-2xl border ${theme.border.default} shadow-xl bg-gradient-to-r from-indigo-50/60 via-purple-50/60 to-pink-50/60 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-4 left-4 w-16 h-16 bg-indigo-500 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 bg-purple-500 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-pink-500 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">



        </div>
      </div>


    </div>
  );
}