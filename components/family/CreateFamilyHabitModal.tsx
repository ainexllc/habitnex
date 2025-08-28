'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';
import { useClaudeAI } from '@/hooks/useClaudeAI';
import { HabitEnhancementCard } from '@/components/ai/HabitEnhancementCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagInput } from '@/components/ui/TagInput';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { CreateFamilyHabitRequest } from '@/types/family';
import { HabitEnhancement } from '@/types/claude';
import {
  Target,
  Clock,
  Users,
  Sparkles,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateFamilyHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const difficultyOptions = [
  { value: 'easy', label: 'Easy', points: 1, color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'medium', label: 'Medium', points: 3, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'hard', label: 'Hard', points: 5, color: 'bg-red-100 text-red-700 border-red-200' }
] as const;

const frequencyOptions = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Specific days of the week' },
  { value: 'interval', label: 'Every X Days', description: 'Custom interval' }
] as const;

const weekDays = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' }
];

const emojiOptions = [
  '💪', '🏃‍♀️', '📚', '🧘', '🚰', '🥗', '😴', '🧹', '📱', '🎯',
  '🏋️', '🚴', '🎨', '🧠', '☀️', '🌱', '⚽', '🎵', '📝', '💝'
];

export function CreateFamilyHabitModal({ isOpen, onClose }: CreateFamilyHabitModalProps) {
  const { currentFamily, currentMember } = useFamily();
  const { createHabit, loading } = useFamilyHabits();
  const { enhanceHabit, loading: aiLoading, clearError: clearAiError } = useClaudeAI();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '🎯',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    frequency: 'daily' as 'daily' | 'weekly' | 'interval',
    targetDays: [1, 2, 3, 4, 5, 6, 0], // All days for daily
    intervalDays: 1,
    assignedMembers: [] as string[],
    isShared: false,
    tags: [] as string[]
  });

  const [aiEnhancement, setAiEnhancement] = useState<HabitEnhancement | null>(null);
  const [step, setStep] = useState<'basic' | 'schedule' | 'members' | 'preview'>('basic');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        emoji: '🎯',
        difficulty: 'medium',
        frequency: 'daily',
        targetDays: [1, 2, 3, 4, 5, 6, 0],
        intervalDays: 1,
        assignedMembers: [],
        isShared: false,
        tags: []
      });
      setAiEnhancement(null);
      setStep('basic');
      setError(null);
    }
  }, [isOpen]);

  const handleAiEnhance = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a habit name first');
      return;
    }

    try {
      clearAiError();
      setError(null);

      const response = await enhanceHabit(formData.name, formData.description);

      if (response?.success && response.data) {
        setAiEnhancement(response.data);

        // Auto-populate enhanced fields
        if (response.data?.title && response.data.title !== formData.name) {
          setFormData(prev => ({ ...prev, name: response.data.title }));
        }
        if (response.data?.enhancedDescription) {
          setFormData(prev => ({ ...prev, description: response.data.enhancedDescription }));
        }
      } else {
        // Handle specific AI unavailable error
        if (response?.error?.includes('AI features are not available')) {
          setError('AI enhancement is currently unavailable. You can still create your habit manually.');
        } else {
          setError(response?.error || 'Failed to enhance habit with AI');
        }
      }

    } catch (err) {
      // Handle network errors or other issues
      if (err instanceof Error && err.message.includes('fetch')) {
        setError('AI enhancement is currently unavailable. You can still create your habit manually.');
      } else {
        setError('Failed to enhance habit with AI. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentFamily || !currentMember) {
      setError('Must be in a family to create habits');
      return;
    }

    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    if (formData.assignedMembers.length === 0) {
      setError('Please assign this habit to at least one family member');
      return;
    }

    try {
      setError(null);

      const habitData: Omit<CreateFamilyHabitRequest['habit'], 'familyId'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        emoji: formData.emoji,
        color: difficultyOptions.find(d => d.value === formData.difficulty)?.color.split(' ')[0].replace('bg-', '') || 'blue',
        tags: formData.tags,
        assignedMembers: formData.assignedMembers,
        isShared: formData.isShared,
        createdBy: currentMember.id,
        frequency: formData.frequency,
        targetDays: formData.frequency === 'interval' ? [] : formData.targetDays,
        ...(formData.frequency === 'interval' && { intervalDays: formData.intervalDays }),
        difficulty: formData.difficulty,
        basePoints: difficultyOptions.find(d => d.value === formData.difficulty)?.points || 3,
        linkedRewards: [],
        milestoneRewards: [
          { streak: 7, points: 5, description: '1 week streak bonus!' },
          { streak: 30, points: 20, description: '1 month streak bonus!' },
          { streak: 90, points: 50, description: '3 month streak bonus!' }
        ],
        // AI Enhancement fields
        aiEnhanced: !!aiEnhancement,
        ...(aiEnhancement?.tip && { tip: aiEnhancement.tip }),
        ...(aiEnhancement?.healthBenefits && { healthBenefits: aiEnhancement.healthBenefits }),
        ...(aiEnhancement?.mentalBenefits && { mentalBenefits: aiEnhancement.mentalBenefits }),
        ...(aiEnhancement?.longTermBenefits && { longTermBenefits: aiEnhancement.longTermBenefits }),
        ...(aiEnhancement?.complementary && { complementary: aiEnhancement.complementary })
      };

      await createHabit(habitData);
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create habit');
    }
  };

  const handleClose = () => {
    setError(null);
    setAiEnhancement(null);
    setStep('basic');
    onClose();
  };

  if (!currentFamily || !currentMember) {
    return null;
  }

  const renderStepContent = () => {
    switch (step) {
      case 'basic':
        return (
          <>
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Family Habit</h3>
              <p className="text-gray-600 dark:text-gray-400">Build better habits together as a family</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Habit Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Drink 8 glasses of water"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiEnhance}
                      disabled={aiLoading || !formData.name.trim()}
                      className="flex items-center"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {aiLoading ? 'Enhancing...' : 'AI Enhance'}
                    </Button>
                  </div>
                  <textarea
                    placeholder="Describe your habit and why it's important..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Choose Emoji
                  </label>
                  <div className="grid grid-cols-10 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2",
                          formData.emoji === emoji
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <div className="space-y-2">
                    {difficultyOptions.map((option) => (
                      <label key={option.value} className="cursor-pointer">
                        <input
                          type="radio"
                          name="difficulty"
                          value={option.value}
                          checked={formData.difficulty === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className={cn(
                          "p-3 border-2 rounded-lg flex items-center justify-between",
                          formData.difficulty === option.value
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        )}>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{option.points} points per completion</div>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            option.color
                          )}>
                            {option.points} pts
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (Optional)
                  </label>
                  <TagInput
                    tags={formData.tags}
                    onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                    placeholder="Add tags like 'health', 'morning', etc."
                  />
                </div>
              </div>

              {/* AI Enhancement Display */}
              {aiEnhancement && (
                <div className="mt-6">
                  <HabitEnhancementCard
                    enhancement={aiEnhancement}
                    onApply={() => {
                      if (aiEnhancement.title) {
                        setFormData(prev => ({ ...prev, name: aiEnhancement.title }));
                      }
                      if (aiEnhancement.enhancedDescription) {
                        setFormData(prev => ({ ...prev, description: aiEnhancement.enhancedDescription }));
                      }
                    }}
                    onClose={() => setAiEnhancement(null)}
                  />
                </div>
              )}

              {/* AI Enhancement Info */}
              {!aiEnhancement && formData.name.trim() && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Try AI Enhancement
                      </p>
                      <p className="text-blue-700 dark:text-blue-300">
                        Click the "AI Enhance" button above to get personalized suggestions for your habit description, benefits, and success tips.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6">
                <Button
                  type="button"
                  onClick={() => setStep('schedule')}
                  size="lg"
                  disabled={!formData.name.trim()}
                >
                  Next: Schedule
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'schedule':
        return (
          <>
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">When & How Often</h3>
              <p className="text-gray-600 dark:text-gray-400">Set the habit schedule</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Frequency
                </label>
                <div className="space-y-3">
                  {frequencyOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={formData.frequency === option.value}
                        onChange={(e) => {
                          const newFreq = e.target.value as any;
                          setFormData(prev => ({
                            ...prev,
                            frequency: newFreq,
                            targetDays: newFreq === 'daily' ? [1, 2, 3, 4, 5, 6, 0] :
                                      newFreq === 'weekly' ? [] : prev.targetDays
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg",
                        formData.frequency === option.value
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Weekly Days Selection */}
              {formData.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Which days of the week?
                  </label>
                  <div className="flex space-x-2">
                    {weekDays.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium",
                          formData.targetDays.includes(day.value)
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                        )}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            targetDays: prev.targetDays.includes(day.value)
                              ? prev.targetDays.filter(d => d !== day.value)
                              : [...prev.targetDays, day.value]
                          }));
                        }}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Interval Days */}
              {formData.frequency === 'interval' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Every how many days?
                  </label>
                  <select
                    value={formData.intervalDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, intervalDays: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {Array.from({ length: 14 }, (_, i) => i + 1).map(num => (
                      <option key={num} value={num}>
                        Every {num} day{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('basic')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('members')}
                  className="flex-1"
                  disabled={formData.frequency === 'weekly' && formData.targetDays.length === 0}
                >
                  Next: Assign Members
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'members':
        return (
          <>
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign to Family Members</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose who will participate in this habit</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer mb-4">
                  <input
                    type="checkbox"
                    checked={formData.isShared}
                    onChange={(e) => setFormData(prev => ({ ...prev, isShared: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 dark:text-blue-400 rounded"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Shared Family Habit</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Everyone must complete this together (like family dinner)
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Assign to Members *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentFamily.members.filter(m => m.isActive).map((member) => (
                    <label key={member.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.assignedMembers.includes(member.id)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            assignedMembers: e.target.checked
                              ? [...prev.assignedMembers, member.id]
                              : prev.assignedMembers.filter(id => id !== member.id)
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg flex items-center space-x-3",
                        formData.assignedMembers.includes(member.id)
                          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        {member.avatarStyle && member.avatarSeed ? (
                          <DiceBearAvatar
                            seed={member.avatarSeed}
                            style={member.avatarStyle}
                            size={48}
                            className="border-2 border-white shadow-sm"
                            backgroundColor={member.color}
                            fallbackEmoji={member.avatar}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.avatar}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{member.displayName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('schedule')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('preview')}
                  className="flex-1"
                  disabled={formData.assignedMembers.length === 0}
                >
                  Review & Create
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'preview':
        return (
          <>
            <div className="text-center mb-6">
              <Target className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Your Family Habit</h3>
              <p className="text-gray-600 dark:text-gray-400">Make sure everything looks good before creating</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{formData.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h3>
                    {formData.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Difficulty:</span>
                    <span className="ml-2 font-medium capitalize">{formData.difficulty}</span>
                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                      ({difficultyOptions.find(d => d.value === formData.difficulty)?.points} pts)
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                    <span className="ml-2 font-medium capitalize">{formData.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium">{formData.isShared ? 'Shared Family' : 'Individual'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Members:</span>
                    <span className="ml-2 font-medium">{formData.assignedMembers.length}</span>
                  </div>
                </div>

                {/* Assigned Members */}
                <div className="mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Assigned to:</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.assignedMembers.map((memberId) => {
                      const member = currentFamily.members.find(m => m.id === memberId);
                      return member ? (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: `${member.color}20`, color: member.color }}
                        >
                          <span>{member.avatar}</span>
                          <span>{member.displayName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Schedule Display */}
                <div className="mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Schedule:</div>
                  <div className="text-sm text-gray-900 dark:text-white">
                    {formData.frequency === 'daily' && 'Every day'}
                    {formData.frequency === 'weekly' && (
                      formData.targetDays.length === 7 ? 'Every day' :
                      `${formData.targetDays.map(d => weekDays.find(w => w.value === d)?.label).join(', ')}`
                    )}
                    {formData.frequency === 'interval' && `Every ${formData.intervalDays} day${formData.intervalDays > 1 ? 's' : ''}`}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('members')}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Family Habit'}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Family Habit"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['basic', 'schedule', 'members', 'preview'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === stepName ? 'bg-blue-600 text-white' :
                  ['basic', 'schedule', 'members', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                    <div className={cn(
                      "h-full bg-blue-600 transition-all duration-300",
                      ['basic', 'schedule', 'members', 'preview'].indexOf(step) > index ? 'w-full' : 'w-0'
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}
      </form>
    </Modal>
  );
}
