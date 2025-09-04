'use client';

import React from 'react';
import { FamilyHabitForm } from './FamilyHabitForm';

interface CreateFamilyHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateFamilyHabitModal({ isOpen, onClose }: CreateFamilyHabitModalProps) {
  return <FamilyHabitForm mode="create" isOpen={isOpen} onClose={onClose} />;
}