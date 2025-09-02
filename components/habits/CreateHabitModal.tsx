'use client';

import React, { useState } from 'react';
import { useHabits } from '@/hooks/useHabits';
import { Modal } from '@/components/ui/Modal';
import { HabitForm } from '@/components/forms/HabitForm';
import { CreateHabitForm } from '@/types';
import { Target } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateHabitModal({ isOpen, onClose }: CreateHabitModalProps) {
  const [loading, setLoading] = useState(false);
  const { addHabit } = useHabits();

  const handleSubmit = async (data: CreateHabitForm) => {
    try {
      setLoading(true);
      await addHabit(data);
      onClose();
    } catch (error) {
      // Failed to create habit - handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Habit"
      size="xl"
    >
      <div className="text-center mb-6">
        <Target className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Habit</h3>
        <p className="text-gray-600 dark:text-gray-400">Start building a new positive habit today</p>
      </div>

      <HabitForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Create Habit"
      />
    </Modal>
  );
}
