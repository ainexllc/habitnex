'use client';

import { useCallback } from 'react';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { HabitCompletion, CreateHabitForm } from '@/types';
import { getTodayDateString } from '@/lib/utils';
import { createHabit, deleteHabit } from '@/lib/db';

/**
 * Hook for accessing ONLY personal/individual data
 * This should NEVER be used in family dashboard components
 */
export function usePersonalData() {
  const { user } = useAuth();
  const {
    habits: personalHabits,
    completions: personalCompletions,
    moods: personalMoods,
    loading,
    error,
    connectionStatus,
    updateHabitOptimistic,
    updateCompletionOptimistic,
    addCompletionOptimistic,
    removeCompletionOptimistic,
    rollbackOptimisticUpdate,
    refreshData
  } = useGlobalData();

  // Check if a habit is completed for today
  const isHabitCompleted = useCallback((habitId: string): boolean => {
    if (!personalCompletions) return false;

    const today = getTodayDateString();
    return personalCompletions.some(
      (completion: HabitCompletion) =>
        completion.habitId === habitId &&
        completion.date === today &&
        completion.completed === true
    );
  }, [personalCompletions]);

  // Get completion for a specific habit and date
  const getHabitCompletion = useCallback((habitId: string, date: string = getTodayDateString()): HabitCompletion | null => {
    if (!personalCompletions) return null;
    return personalCompletions.find(c => c.habitId === habitId && c.date === date) || null;
  }, [personalCompletions]);

  // Add habit function for creating new personal habits
  const addHabit = useCallback(async (habitData: CreateHabitForm) => {
    if (!user) {
      throw new Error('No user found when trying to create habit');
    }

    try {
      const habitId = await createHabit(user.uid, { ...habitData, isArchived: false });
      // Real-time listener will update the habits automatically
      return habitId;
    } catch (err) {
      throw new Error('Failed to create habit');
    }
  }, [user]);

  // Delete habit function for removing personal habits
  const removeHabit = useCallback(async (habitId: string) => {
    if (!user) {
      throw new Error('No user found when trying to delete habit');
    }

    try {
      await deleteHabit(user.uid, habitId);
      // Real-time listener will update the habits automatically
    } catch (err) {
      throw new Error('Failed to delete habit');
    }
  }, [user]);

  // Toggle completion function for marking habits complete/incomplete
  const toggleCompletion = useCallback(async (habitId: string, date: string = getTodayDateString(), completed: boolean, notes?: string) => {
    if (!user) return;

    const existingCompletion = personalCompletions?.find(c => c.habitId === habitId && c.date === date);
    const rollbackKey = `${habitId}-${date}`;

    if (existingCompletion) {
      if (completed) {
        // Update existing completion
        updateCompletionOptimistic({
          ...existingCompletion,
          completed,
          notes: notes || existingCompletion.notes
        });
      } else {
        // Remove completion (undo)
        removeCompletionOptimistic(habitId, date);
      }
    } else if (completed) {
      // Create new completion
      const newCompletion: HabitCompletion = {
        id: `temp-${Date.now()}`, // Temporary ID
        habitId,
        date,
        completed,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addCompletionOptimistic(newCompletion);
    }

    try {
      // Use direct individual database function to avoid family detection
      const { toggleHabitCompletion } = await import('@/lib/db');
      await toggleHabitCompletion(user.uid, habitId, date, completed, notes);
      // Success - real-time listener will sync the actual data
    } catch (err) {
      // Rollback optimistic update on error
      rollbackOptimisticUpdate('completion', rollbackKey);
      throw new Error('Failed to update completion');
    }
  }, [user, personalCompletions, updateCompletionOptimistic, removeCompletionOptimistic, addCompletionOptimistic, rollbackOptimisticUpdate]);

  // Validate that we're only returning personal data
  if (!user) {
    return {
      habits: [],
      completions: [],
      moods: [],
      loading: false,
      error: null,
      connectionStatus: 'disconnected' as const,
      updateHabitOptimistic: () => {},
      updateCompletionOptimistic: () => {},
      addCompletionOptimistic: () => {},
      removeCompletionOptimistic: () => {},
      rollbackOptimisticUpdate: () => {},
      refreshData: async () => {},
      isHabitCompleted: () => false,
      getHabitCompletion: () => null,
      toggleCompletion: async () => {},
      addHabit: async () => { throw new Error('No user authenticated'); },
      removeHabit: async () => { throw new Error('No user authenticated'); }
    };
  }

  return {
    habits: personalHabits,
    completions: personalCompletions,
    moods: personalMoods,
    loading,
    error,
    connectionStatus,
    updateHabitOptimistic,
    updateCompletionOptimistic,
    addCompletionOptimistic,
    removeCompletionOptimistic,
    rollbackOptimisticUpdate,
    refreshData,
    isHabitCompleted,
    getHabitCompletion,
    toggleCompletion,
    addHabit,
    removeHabit
  };
}