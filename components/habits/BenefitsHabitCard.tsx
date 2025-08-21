'use client';

import { useState } from 'react';
import { Habit } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Check, 
  Edit, 
  Trash2, 
  Target, 
  Clock, 
  Calendar,
  Heart,
  Brain,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Timer
} from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { 
  calculateStreak, 
  isHabitDueToday, 
  getNextDueDate, 
  getDaysUntilDue, 
  isHabitOverdue, 
  calculateIntervalStreak,
  calculateCompletionRate 
} from '@/lib/utils';

interface BenefitsHabitCardProps {
  habit: Habit;
  onEdit?: (habit: Habit) => void;
}

export function BenefitsHabitCard({ habit, onEdit }: BenefitsHabitCardProps) {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { isHabitCompleted, toggleCompletion, completions, removeHabit } = useHabits();
  
  const isCompleted = isHabitCompleted(habit.id);
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const currentStreak = habit.frequency === 'interval' 
    ? calculateIntervalStreak(habit, completions)
    : calculateStreak(habitCompletions);
  
  const completionRate = calculateCompletionRate(habitCompletions);
  const isDueToday = isHabitDueToday(habit);
  const isOverdue = isHabitOverdue(habit, completions);
  const nextDueDate = getNextDueDate(habit);
  const daysUntilDue = getDaysUntilDue(habit);

  const handleToggleCompletion = async () => {
    try {
      setLoading(true);
      await toggleCompletion(habit.id, undefined, !isCompleted);
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(habit);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this habit?')) {
      try {
        await removeHabit(habit.id);
      } catch (error) {
        console.error('Failed to delete habit:', error);
      }
    }
  };

  const getStatusColor = () => {
    if (isCompleted) return 'border-green-400/50 bg-white dark:bg-gray-800';
    if (isOverdue) return 'border-red-400/50 bg-white dark:bg-gray-800';
    if (isDueToday) return 'border-blue-400/50 bg-white dark:bg-gray-800';
    return 'border-gray-200 dark:border-gray-600/50 bg-white dark:bg-gray-800';
  };

  const getStreakColor = () => {
    if (currentStreak >= 21) return 'text-purple-600 dark:text-purple-400';
    if (currentStreak >= 7) return 'text-green-600 dark:text-green-400';
    if (currentStreak >= 3) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getCompletionColor = () => {
    if (completionRate >= 80) return 'text-green-600 dark:text-green-400';
    if (completionRate >= 60) return 'text-blue-600 dark:text-blue-400';
    if (completionRate >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${getStatusColor()}`}>
      <CardHeader className="pb-2">
        {/* Top Row: Title, Status, Actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div
              className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 border-white shadow-sm"
              style={{ backgroundColor: habit.color }}
            />
            <div className="flex-1 min-w-0">
              <h3 className={`task-title text-base font-task-title truncate transition-all duration-300 ${
                isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'
              }`} title={habit.name}>
                {habit.name}
              </h3>
              {habit.description && (
                <p className={`task-description text-sm font-task-description mt-1 transition-all duration-300 ${
                  isCompleted 
                    ? 'line-through text-gray-500 dark:text-gray-400' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {habit.description}
                </p>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 text-error-500" />
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-center">
            <div className={`text-xl font-bold ${getStreakColor()}`}>
              {currentStreak}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Day Streak
            </div>
          </div>
          
          <div className="text-center">
            <div className={`text-xl font-bold ${getCompletionColor()}`}>
              {completionRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Success Rate
            </div>
          </div>
          
          <div className="text-center">
            {habit.goal ? (
              <>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {habit.goal.target}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {habit.goal.period} goal
                </div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-400 dark:text-gray-500">
                  —
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No goal
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Benefits Preview */}
        <div className="space-y-2 mb-4">
          {habit.healthBenefits && (
            <div className="flex items-start space-x-2">
              <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                <span className="font-medium text-red-600 dark:text-red-400">Health:</span> {habit.healthBenefits}
              </p>
            </div>
          )}
          
          {habit.mentalBenefits && (
            <div className="flex items-start space-x-2">
              <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2">
                <span className="font-medium text-blue-600 dark:text-blue-400">Mental:</span> {habit.mentalBenefits}
              </p>
            </div>
          )}
          
          {expanded && habit.longTermBenefits && (
            <div className="flex items-start space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium text-green-600 dark:text-green-400">Long-term:</span> {habit.longTermBenefits}
              </p>
            </div>
          )}
          
          {expanded && habit.tip && (
            <div className="flex items-start space-x-2">
              <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700 dark:text-gray-200">
                <span className="font-medium text-yellow-600 dark:text-yellow-400">Tip:</span> {habit.tip}
              </p>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {(habit.longTermBenefits || habit.tip) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center space-x-1 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 py-2 border-t border-gray-200 dark:border-gray-600"
          >
            <span>{expanded ? 'Show Less' : 'Show More Benefits'}</span>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {/* Bottom Action Area */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          {/* Schedule Info */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
            {isDueToday || isOverdue ? (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{isOverdue ? 'Overdue' : 'Due Today'}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {habit.frequency === 'interval' && nextDueDate
                    ? `Next: ${daysUntilDue === 0 ? 'Today' : `${daysUntilDue}d`}`
                    : 'Not due today'
                  }
                </span>
              </div>
            )}
            
            {habit.tags && habit.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                <span className="text-xs">
                  #{habit.tags[0]}
                  {habit.tags.length > 1 && ` +${habit.tags.length - 1}`}
                </span>
              </div>
            )}
          </div>

          {/* Completion Button */}
          {isDueToday || isOverdue ? (
            <Button
              onClick={handleToggleCompletion}
              loading={loading}
              size="sm"
              variant={isCompleted ? "secondary" : "primary"}
              className={`${
                isCompleted 
                  ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300 hover:bg-success-200 dark:hover:bg-success-800' 
                  : isOverdue 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : ''
              }`}
            >
              <Check className={`w-4 h-4 mr-2 ${isCompleted ? 'text-success-600 dark:text-success-400' : ''}`} />
              {isCompleted ? 'Completed' : 'Mark Done'}
            </Button>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Not scheduled
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}