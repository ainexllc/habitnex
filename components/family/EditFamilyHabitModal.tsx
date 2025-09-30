'use client';

import React from 'react';
import { FamilyHabitFormSimple } from './FamilyHabitFormSimple';
import { FamilyHabit } from '@/types/family';

interface EditFamilyHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: FamilyHabit | null;
  onSuccess: () => void;
}

export function EditFamilyHabitModal({ isOpen, onClose, habit, onSuccess }: EditFamilyHabitModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return <FamilyHabitFormSimple mode="edit" isOpen={isOpen} onClose={handleSuccess} habit={habit} />;
}