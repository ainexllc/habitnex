'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useClaudeAI } from '@/hooks/useClaudeAI';
import { HabitEnhancementCard } from '@/components/ai/HabitEnhancementCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FamilyHabit } from '@/types/family';
import { HabitEnhancement } from '@/types/claude';
import { Edit3, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditFamilyHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: FamilyHabit | null;
  onSuccess: () => void;
}

const difficultyOptions = [
  { value: 1, label: 'Easy', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 3, label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 5, label: 'Hard', color: 'bg-red-100 text-red-700 border-red-200' }
];

const emojiOptions = [
  '💪', '🏃‍♀️', '📚', '🧘', '🚰', '🥗', '😴', '🧹', '📱', '🎯',
  '🏋️', '🚴', '🎨', '🧠', '☀️', '🌱', '⚽', '🎵', '📝', '💝'
];

export function EditFamilyHabitModal({ isOpen, onClose, habit, onSuccess }: EditFamilyHabitModalProps) {
  const { currentFamily } = useFamily();
  const { updateHabit, loading } = useAllFamilyHabits();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '🎯',
    basePoints: 3,
    frequency: 'daily',
    tags: [] as string[],
    assignedMembers: [] as string[]
  });
  
  const [error, setError] = useState<string | null>(null);
  const [aiEnhancement, setAiEnhancement] = useState<HabitEnhancement | null>(null);
  const { enhanceHabit, loading: aiLoading } = useClaudeAI();

  // Initialize form data when habit changes
  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || '',
        description: habit.description || '',
        emoji: habit.emoji || '🎯',
        basePoints: habit.basePoints || 3,
        frequency: habit.frequency || 'daily',
        tags: habit.tags || [],
        assignedMembers: habit.assignedMembers || []
      });
    }
  }, [habit]);

  const handleAiEnhancement = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a habit name first');
      return;
    }

    setError(null);

    try {
      const response = await enhanceHabit(
        formData.name.trim(),
        'general', // You could make this dynamic based on the habit
        []
      );

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
          setError('AI enhancement is currently unavailable. You can still edit your habit manually.');
        } else {
          setError(response?.error || 'Failed to enhance habit with AI');
        }
      }

    } catch (err) {
      // Handle network errors or other issues
      if (err instanceof Error && err.message.includes('fetch')) {
        setError('AI enhancement is currently unavailable. You can still edit your habit manually.');
      } else {
        setError('Failed to enhance habit with AI. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!habit || !currentFamily) return;
    
    if (!formData.name.trim()) {
      setError('Habit name is required');
      return;
    }

    try {
      await updateHabit(habit.id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        emoji: formData.emoji,
        basePoints: formData.basePoints,
        frequency: formData.frequency,
        tags: formData.tags,
        assignedMembers: formData.assignedMembers
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit');
    }
  };

  const handleClose = () => {
    setError(null);
    setAiEnhancement(null);
    onClose();
  };

  const toggleMemberAssignment = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedMembers: prev.assignedMembers.includes(memberId)
        ? prev.assignedMembers.filter(id => id !== memberId)
        : [...prev.assignedMembers, memberId]
    }));
  };

  if (!habit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Family Habit"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <Edit3 className="w-12 h-12 mx-auto text-blue-600 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Habit Details</h3>
          <p className="text-gray-600 dark:text-gray-400">Update this family habit</p>
        </div>
        
        {/* Habit Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name
          </label>
          <Input
            type="text"
            placeholder="e.g., Morning Exercise"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiEnhancement}
              disabled={aiLoading || !formData.name.trim()}
              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
            >
              <Sparkles className="w-4 h-4" />
              {aiLoading ? 'AI Enhancing...' : 'AI Enhance'}
            </Button>
          </div>
          <textarea
            placeholder="Brief description of the habit..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none"
            rows={3}
          />

          {/* AI Enhancement Display */}
          {aiEnhancement && (
            <div className="mt-4">
              <HabitEnhancementCard
                enhancement={aiEnhancement}
                onApply={(enhancement) => {
                  // Apply title if different from current
                  if (enhancement.title && enhancement.title !== formData.name) {
                    setFormData(prev => ({ ...prev, name: enhancement.title }));
                  }
                  // Apply enhanced description
                  if (enhancement.enhancedDescription) {
                    setFormData(prev => ({ ...prev, description: enhancement.enhancedDescription }));
                  }
                  setAiEnhancement(null);
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
                    Click the "AI Enhance" button to get personalized suggestions for improving your habit description, benefits, and success tips.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Emoji Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Emoji
          </label>
          <div className="flex flex-wrap gap-2">
            {emojiOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={cn(
                  "w-10 h-10 rounded border-2 transition-all",
                  formData.emoji === emoji 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                )}
                onClick={() => setFormData(prev => ({ ...prev, emoji }))}
              >
                <span className="text-lg">{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Points/Difficulty */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty & Points
          </label>
          <div className="grid grid-cols-3 gap-3">
            {difficultyOptions.map((option) => (
              <label key={option.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="points"
                  value={option.value}
                  checked={formData.basePoints === option.value}
                  onChange={() => setFormData(prev => ({ ...prev, basePoints: option.value }))}
                  className="sr-only"
                />
                <div className={cn(
                  "p-3 border-2 rounded-lg text-center transition-all",
                  formData.basePoints === option.value 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                )}>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{option.value} pts</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Assigned Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assigned Members
          </label>
          <div className="grid grid-cols-2 gap-3">
            {currentFamily?.members.filter(m => m.isActive).map((member) => (
              <label key={member.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.assignedMembers.includes(member.id)}
                  onChange={() => toggleMemberAssignment(member.id)}
                  className="sr-only"
                />
                <div className={cn(
                  "p-3 border-2 rounded-lg transition-all flex items-center space-x-2",
                  formData.assignedMembers.includes(member.id) 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                )}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{member.displayName}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}