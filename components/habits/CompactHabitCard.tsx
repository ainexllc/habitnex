'use client';

import { useState, useEffect } from 'react';
import { Habit } from '@/types';
import { usePersonalData } from '@/hooks/usePersonalData';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { calculateStreak, isHabitDueToday, isHabitOverdue, getNextDueDate, calculateIntervalStreak } from '@/lib/utils';
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Clock, 
  AlertCircle,
  Target,
  Calendar,
  Hash,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';

interface CompactHabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function CompactHabitCard({ 
  habit, 
  onEdit,
  isExpanded: controlledExpanded,
  onToggleExpand 
}: CompactHabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const { isHabitCompleted, toggleCompletion, completions, removeHabit } = usePersonalData();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggleExpand = onToggleExpand || (() => setInternalExpanded(!internalExpanded));
  
  const isCompleted = isHabitCompleted(habit.id);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = habit.frequency === 'interval' 
    ? calculateIntervalStreak(habit, completions)
    : calculateStreak(habitCompletions);
  
  const isDueToday = isHabitDueToday(habit);
  const isOverdue = isHabitOverdue(habit, completions);
  const nextDueDate = getNextDueDate(habit);
  
  // Calculate completion rate for last 30 days
  const last30Days = habitCompletions.filter(c => {
    const date = new Date(c.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return date >= thirtyDaysAgo;
  });
  const completionRate = Math.round((last30Days.length / 30) * 100);

  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking checkbox
    try {
      setLoading(true);
      await toggleCompletion(habit.id, undefined, !isCompleted);
    } catch (error) {
      // Failed to toggle completion - handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(habit);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      setShowDeleteModal(false);
      await removeHabit(habit.id);
    } catch (error) {
      console.error('Failed to delete habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Determine card styling based on status
  const getCardStyles = () => {
    if (isCompleted) {
      return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800';
    }
    if (isOverdue) {
      return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
    }
    if (!isDueToday) {
      return 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 opacity-75';
    }
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <div className={`border rounded-xl transition-all duration-300 overflow-hidden ${getCardStyles()}`}>
      {/* Compact View - Always Visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center gap-3">
          {/* Large Checkbox - Mobile Optimized */}
          <button
            onClick={handleToggleCompletion}
            disabled={loading || (!isDueToday && !isOverdue)}
            className={`flex-shrink-0 w-11 h-11 rounded-lg border-2 flex items-center justify-center transition-all ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white animate-check-bounce'
                : isDueToday || isOverdue
                ? 'border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
            } ${loading ? 'opacity-50' : ''}`}
            aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isCompleted ? (
              <Check className="w-6 h-6" strokeWidth={3} />
            ) : null}
          </button>

          {/* Color Indicator */}
          <div
            className="flex-shrink-0 w-3 h-3 rounded-full"
            style={{ backgroundColor: habit.color }}
          />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0 mr-2">
                <h3 className={`font-semibold text-base transition-all ${
                  isCompleted 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {habit.name}
                </h3>
                
                {/* Status Line */}
                <div className="flex items-center gap-3 mt-1 text-sm">
                  {isOverdue && !isCompleted && (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Overdue
                    </span>
                  )}
                  {isDueToday && !isOverdue && !isCompleted && (
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      Due today
                    </span>
                  )}
                  {!isDueToday && !isOverdue && (
                    <span className="text-gray-500 dark:text-gray-400">
                      {habit.frequency === 'interval' 
                        ? `Next: ${nextDueDate ? new Date(nextDueDate).toLocaleDateString() : 'Not scheduled'}`
                        : 'Not due'
                      }
                    </span>
                  )}
                  
                  {/* First Tag */}
                  {habit.tags && habit.tags[0] && (
                    <span className="text-gray-500 dark:text-gray-400">
                      #{habit.tags[0]}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Side - Streak & Expand */}
              <div className="flex items-center gap-2">
                {currentStreak > 0 && (
                  <div className="flex items-center gap-1 text-orange-500 dark:text-orange-400">
                    <Flame className="w-4 h-4" />
                    <span className="font-bold text-sm">{currentStreak}</span>
                  </div>
                )}
                
                <div className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded View - Details */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 animate-expand">
          <div className="pt-4 space-y-4">
            {/* Description */}
            {habit.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {habit.description}
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Progress */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Progress</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {completionRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Last 30 days
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">Schedule</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {habit.frequency === 'daily' 
                    ? 'Daily' 
                    : habit.frequency === 'weekly' 
                    ? 'Weekly'
                    : `${habit.intervalDays}d`
                  }
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {habit.frequency === 'interval' ? 'Interval' : 'Frequency'}
                </div>
              </div>

              {/* Goal */}
              {habit.goal && (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-medium">Goal</span>
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {habit.goal.target}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Per {habit.goal.period}
                  </div>
                </div>
              )}

              {/* Best Streak */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-medium">Best Streak</span>
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {Math.max(currentStreak, ...habitCompletions.map(() => 1))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Days
                </div>
              </div>
            </div>

            {/* Tags */}
            {habit.tags && habit.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Hash className="w-4 h-4 text-gray-400" />
                {habit.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs text-gray-600 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleEdit}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleDeleteClick}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Habit"
        description={`Are you sure you want to delete "${habit.name}"?`}
        confirmText="Delete Habit"
        isLoading={loading}
      />
    </div>
  );
}