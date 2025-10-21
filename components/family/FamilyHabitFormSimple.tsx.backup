'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { CreateFamilyHabitRequest, FamilyHabit } from '@/types/family';
import { Target, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface FamilyHabitFormSimpleProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  habit?: FamilyHabit | null;
}

const difficultyOptions = [
  {
    value: 'easy',
    label: 'Easy',
    points: 1,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-700',
  },
  {
    value: 'medium',
    label: 'Medium',
    points: 3,
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-700',
  },
  {
    value: 'hard',
    label: 'Hard',
    points: 5,
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-700',
  }
] as const;

const frequencyOptions = [
  { value: 'daily', label: 'Every Day', icon: '📅' },
  { value: 'weekdays', label: 'Weekdays', icon: '💼' },
  { value: 'weekends', label: 'Weekends', icon: '🎉' },
  { value: 'custom', label: 'Custom Days', icon: '⚙️' }
] as const;

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function FamilyHabitFormSimple({ mode, isOpen, onClose, habit }: FamilyHabitFormSimpleProps) {
  const { currentFamily } = useFamily();
  const { createHabit, updateHabit, loading } = useAllFamilyHabits();

  const [formData, setFormData] = useState<CreateFamilyHabitRequest>(() => {
    if (mode === 'edit' && habit) {
      return {
        name: habit.name,
        description: habit.description || '',
        frequency: habit.frequency || 'daily',
        customDays: habit.customDays || [],
        difficulty: habit.difficulty || 'medium',
        points: habit.points || 3,
        assignedMembers: habit.assignedMembers || [],
        rewards: habit.rewards || [],
        milestones: habit.milestones || []
      };
    }
    return {
      name: '',
      description: '',
      frequency: 'daily',
      customDays: [],
      difficulty: 'medium',
      points: 3,
      assignedMembers: [],
      rewards: [],
      milestones: []
    };
  });

  const [error, setError] = useState<string | null>(null);
  const [rewardText, setRewardText] = useState('');
  const [milestoneTarget, setMilestoneTarget] = useState(7);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const updateFormField = <K extends keyof CreateFamilyHabitRequest>(
    field: K,
    value: CreateFamilyHabitRequest[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMemberSelection = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(memberId)
        ? prev.assignedMembers.filter(id => id !== memberId)
        : [...prev.assignedMembers, memberId]
    }));
  };

  const toggleDaySelection = (day: string) => {
    setFormData(prev => ({
      ...prev,
      customDays: prev.customDays.includes(day)
        ? prev.customDays.filter(d => d !== day)
        : [...prev.customDays, day]
    }));
  };

  const addReward = () => {
    if (!rewardText.trim()) return;
    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, { id: Date.now().toString(), text: rewardText, pointCost: 0 }]
    }));
    setRewardText('');
  };

  const removeReward = (rewardId: string) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter(r => r.id !== rewardId)
    }));
  };

  const addMilestone = () => {
    if (milestoneTarget <= 0) return;
    setFormData(prev => ({
      ...prev,
      milestones: [...prev.milestones, { target: milestoneTarget, reward: '' }]
    }));
    setMilestoneTarget(7);
  };

  const removeMilestone = (index: number) => {
    setFormData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Please enter a habit name');
      return false;
    }
    if (formData.assignedMembers.length === 0) {
      setError('Please select at least one family member');
      return false;
    }
    if (formData.frequency === 'custom' && formData.customDays.length === 0) {
      setError('Please select at least one day for custom frequency');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setError(null);

      if (mode === 'create') {
        await createHabit(formData);
      } else if (mode === 'edit' && habit) {
        await updateHabit(habit.id, formData);
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    }
  };

  if (!currentFamily) return null;

  const activeMembers = currentFamily.members.filter(m => m.isActive);
  const selectedDifficulty = difficultyOptions.find(d => d.value === formData.difficulty) || difficultyOptions[1];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Family Habit' : 'Edit Habit'}
      size="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        {error && (
          <div className={cn(
            "p-4 rounded-lg border",
            theme.status.error.bg,
            theme.status.error.border,
            theme.status.error.text
          )}>
            {error}
          </div>
        )}

        {/* Basic Info Section */}
        <section className={cn("space-y-4 p-4 rounded-lg", theme.surface.secondary)}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-blue-500" />
            <h3 className={cn("font-semibold", theme.text.primary)}>Basic Information</h3>
          </div>

          {/* Habit Name */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
              Habit Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="e.g., Morning Exercise, Read for 30 minutes"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Add any additional details..."
              rows={2}
              maxLength={500}
              className={cn(
                "w-full px-3 py-2 rounded-lg resize-none",
                theme.components.input.base,
                theme.components.input.focus
              )}
            />
          </div>
        </section>

        {/* Schedule Section */}
        <section className={cn("space-y-4 p-4 rounded-lg", theme.surface.secondary)}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-purple-500" />
            <h3 className={cn("font-semibold", theme.text.primary)}>Schedule</h3>
          </div>

          {/* Frequency */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
              Frequency
            </label>
            <div className="grid grid-cols-2 gap-2">
              {frequencyOptions.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => updateFormField('frequency', freq.value)}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all",
                    formData.frequency === freq.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  )}
                >
                  <div className="text-2xl mb-1">{freq.icon}</div>
                  <div className={cn("text-sm font-medium", theme.text.primary)}>{freq.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days */}
          {formData.frequency === 'custom' && (
            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.secondary)}>
                Select Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDaySelection(day)}
                    className={cn(
                      "p-2 rounded-lg border-2 text-sm transition-all",
                      formData.customDays.includes(day)
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Assignment Section */}
        <section className={cn("space-y-4 p-4 rounded-lg", theme.surface.secondary)}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-500" />
            <h3 className={cn("font-semibold", theme.text.primary)}>Assign Members *</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {activeMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => toggleMemberSelection(member.id)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all hover:scale-105",
                  formData.assignedMembers.includes(member.id)
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md"
                    : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                )}
              >
                <ProfileImage
                  name={member.displayName}
                  profileImageUrl={member.profileImageUrl}
                  color={member.color}
                  size={48}
                  showBorder={false}
                  className="mx-auto mb-2"
                />
                <div className={cn("text-sm font-medium truncate", theme.text.primary)}>
                  {member.displayName}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Difficulty & Points Section */}
        <section className={cn("space-y-4 p-4 rounded-lg", theme.surface.secondary)}>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className={cn("font-semibold", theme.text.primary)}>Difficulty & Points</h3>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map((diff) => (
              <button
                key={diff.value}
                type="button"
                onClick={() => {
                  updateFormField('difficulty', diff.value);
                  updateFormField('points', diff.points);
                }}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all",
                  formData.difficulty === diff.value
                    ? `${diff.borderColor} ${diff.bgColor} shadow-md`
                    : "border-gray-200 dark:border-gray-700 hover:scale-105"
                )}
              >
                <div className={cn("font-bold text-lg mb-1", diff.color)}>
                  {diff.label}
                </div>
                <div className={cn("text-xs", theme.text.secondary)}>
                  {diff.points} {diff.points === 1 ? 'point' : 'points'}
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Form Actions */}
      <div className={cn("flex gap-3 mt-6 pt-4 border-t", theme.border.default)}>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
          className="flex-1"
        >
          {mode === 'create' ? 'Create Habit' : 'Save Changes'}
        </Button>
      </div>
    </Modal>
  );
}
