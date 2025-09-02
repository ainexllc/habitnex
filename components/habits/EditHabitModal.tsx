'use client';

import { useState, useEffect } from 'react';
import { Habit, CreateHabitForm } from '@/types';
import { HabitForm } from '@/components/forms/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';

interface EditHabitModalProps {
  habit: Habit | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditHabitModal({ habit, isOpen, onClose }: EditHabitModalProps) {
  const [loading, setLoading] = useState(false);
  const { editHabit } = useHabits();

  useEffect(() => {
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (data: CreateHabitForm) => {
    if (!habit) {
      // No habit available for editing
      return;
    }

    try {
      setLoading(true);
      await editHabit(habit.id, data);

      // Close modal immediately since the UI is already updated optimistically
      onClose();
    } catch (error) {
      alert(`Failed to update habit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !habit) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className={`${theme.surface.primary} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${theme.surface.primary} border-b ${theme.border.default} p-6 flex items-center justify-between`}>
          <div>
            <h2 className={`text-2xl font-bold ${theme.text.primary}`}>
              Edit Habit
            </h2>
            <p className={`${theme.text.secondary} mt-1`}>
              Update "{habit.name}" settings
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`${theme.text.muted} ${theme.surface.hover}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <HabitForm 
            onSubmit={(data) => handleSubmit({
              ...data,
              // Preserve existing AI enhancement data if not overridden
              aiEnhanced: data.aiEnhanced ?? habit.aiEnhanced,
              tip: data.tip ?? habit.tip,
              healthBenefits: data.healthBenefits ?? habit.healthBenefits,
              mentalBenefits: data.mentalBenefits ?? habit.mentalBenefits,
              longTermBenefits: data.longTermBenefits ?? habit.longTermBenefits,
              complementary: data.complementary ?? habit.complementary,
            })}
            loading={loading}
            initialData={{
              name: habit.name,
              description: habit.description,
              tags: habit.tags || ((habit as any).category ? [(habit as any).category.toLowerCase().replace(/\s+/g, '-')] : []), // Migrate category to tags
              color: habit.color,
              frequency: habit.frequency,
              targetDays: habit.targetDays || [],
              intervalDays: habit.intervalDays,
              startDate: habit.startDate,
              reminderTime: habit.reminderTime,
              reminderType: habit.reminderType,
              goal: habit.goal,
              // AI Enhancement fields - ensure they're properly set
              aiEnhanced: habit.aiEnhanced || false,
              tip: habit.tip || '',
              healthBenefits: habit.healthBenefits || '',
              mentalBenefits: habit.mentalBenefits || '',
              longTermBenefits: habit.longTermBenefits || '',
              complementary: habit.complementary || []
            }}
            submitText="Update Habit"
          />
        </div>
      </div>
    </div>
  );
}