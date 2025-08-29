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
  Target 
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
        collapsible: true,
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
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Due Today':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'Up Next':
        return <Calendar className="w-4 h-4 text-gray-500" />;
      default:
        return <Target className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSectionColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-blue-500';
      case 'medium':
        return `border-l-4 ${theme.border.strong}`;
      default:
        return `border-l-4 ${theme.border.light}`;
    }
  };

  if (habits.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className={`text-lg font-medium ${theme.text.primary} mb-2`}>
          No habits to focus on
        </h3>
        <p className={theme.text.muted}>
          Create your first habit to get started with your daily routine.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => {
        if (section.habits.length === 0) return null;
        
        const isExpanded = expandedSections[section.title.toLowerCase()];
        const isHighPriority = section.priority === 'high';
        
        return (
          <div key={section.title} className={`${theme.surface.primary} rounded-lg p-4 ${getSectionColor(section.priority)}`}>
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between mb-4 text-left"
            >
              <div className="flex items-center gap-3">
                {getSectionIcon(section.title)}
                <h3 className={`font-semibold ${theme.text.primary}`}>
                  {section.title}
                </h3>
                <span className={`${theme.components.badge.default} text-sm px-2 py-1 rounded-full`}>
                  {section.habits.length}
                </span>
              </div>
              {section.collapsible && (
                <div className={theme.text.muted}>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              )}
            </button>

            {/* Section Content */}
            {isExpanded && (
              <div className="space-y-3">
                {section.habits.map((habit) => (
                  <div key={habit.id}>
                    {isHighPriority && section.habits.length <= 4 ? (
                      // Use full cards for high priority sections with few habits
                      <BenefitsHabitCard 
                        habit={habit} 
                        onEdit={onEdit}
                      />
                    ) : (
                      // Use compact cards for other cases
                      <CompactHabitCard 
                        habit={habit} 
                        onEdit={onEdit}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className={`${theme.status.info.bg} rounded-lg p-4 border ${theme.status.info.border}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className={`font-medium ${theme.status.info.text}`}>
            Today's Focus
          </h4>
        </div>
        <p className={`text-sm ${theme.status.info.text}`}>
          {sections[0].habits.length > 0 && `${sections[0].habits.length} overdue habits need attention. `}
          {sections[1].habits.length > 0 && `${sections[1].habits.length} habits due today. `}
          Stay focused on what matters most!
        </p>
      </div>
    </div>
  );
}