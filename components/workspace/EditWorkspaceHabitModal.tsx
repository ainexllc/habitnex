'use client';

import React from 'react';
import { FamilyHabitFormSimple } from './WorkspaceHabitFormSimple';
import { FamilyHabit } from '@/types/family';

interface EditWorkspaceHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: FamilyHabit | null;
  onSuccess: () => void;
}

export function EditWorkspaceHabitModal({ isOpen, onClose, habit, onSuccess }: EditWorkspaceHabitModalProps) {
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
  };

  return <FamilyHabitFormSimple mode="edit" isOpen={isOpen} onClose={handleSuccess} habit={habit} />;
}