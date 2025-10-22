'use client';

import React from 'react';
import { FamilyHabitFormSimple } from './WorkspaceHabitFormSimple';

interface CreateWorkspaceHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceHabitModal({ isOpen, onClose }: CreateWorkspaceHabitModalProps) {
  return <FamilyHabitFormSimple mode="create" isOpen={isOpen} onClose={onClose} />;
}