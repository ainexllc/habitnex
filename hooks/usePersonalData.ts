'use client';

import { useCallback } from 'react';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { HabitCompletion, CreateHabitForm } from '@/types';
import { getTodayDateString } from '@/lib/utils';
import { createHabit } from '@/lib/db';

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
      addHabit: async () => { throw new Error('No user authenticated'); }
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
    addHabit
  };
}