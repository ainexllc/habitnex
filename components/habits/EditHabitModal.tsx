'use client';

import { useState, useEffect } from 'react';
import { Habit, CreateHabitForm } from '@/types';
import { HabitForm } from '@/components/forms/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

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
    if (!habit) return;
    
    try {
      setLoading(true);
      await editHabit(habit.id, data);
      onClose();
    } catch (error) {
      console.error('Failed to update habit:', error);
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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-surface-light dark:bg-background-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-light dark:bg-background-dark border-b border-border-light dark:border-border-dark p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Edit Habit
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Update "{habit.name}" settings
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="p-6">
          <HabitForm 
            onSubmit={handleSubmit}
            loading={loading}
            initialData={{
              name: habit.name,
              description: habit.description,
              tags: habit.tags || ((habit as any).category ? [(habit as any).category.toLowerCase().replace(/\s+/g, '-')] : []), // Migrate category to tags
              color: habit.color,
              frequency: habit.frequency,
              targetDays: habit.targetDays,
              intervalDays: habit.intervalDays,
              startDate: habit.startDate,
              goal: habit.goal,
              // AI Enhancement fields
              aiEnhanced: habit.aiEnhanced,
              tip: habit.tip,
              healthBenefits: habit.healthBenefits,
              mentalBenefits: habit.mentalBenefits,
              longTermBenefits: habit.longTermBenefits,
              complementary: habit.complementary
            }}
            submitText="Update Habit"
          />
        </div>
      </div>
    </div>
  );
}