'use client';

import { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { 
  getUserHabits, 
  createHabit, 
  updateHabit, 
  deleteHabit,
  getCompletions,
  toggleHabitCompletion 
} from '@/lib/unifiedDb';
import { Habit, HabitCompletion, CreateHabitForm } from '@/types';
import { getTodayDateString } from '@/lib/utils';

export function useHabits() {
  const { user } = useAuth();
  const {
    habits,
    completions,
    loading,
    error,
    updateHabitOptimistic,
    updateCompletionOptimistic,
    addCompletionOptimistic,
    removeCompletionOptimistic,
    rollbackOptimisticUpdate,
    refreshData
  } = useGlobalData();

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

  const editHabit = useCallback(async (habitId: string, updates: Partial<Habit> | CreateHabitForm) => {
    if (!user) return;

    // Apply optimistic update immediately
    updateHabitOptimistic(habitId, updates);

    try {
      await updateHabit(user.uid, habitId, updates);
      // Success - real-time listener will sync the final state
    } catch (err) {
      // Rollback optimistic update on error
      rollbackOptimisticUpdate('habit', habitId);
      throw new Error('Failed to update habit');
    }
  }, [user, updateHabitOptimistic, rollbackOptimisticUpdate]);

  const removeHabit = useCallback(async (habitId: string) => {
    if (!user) return;

    try {
      await deleteHabit(user.uid, habitId);
      // Real-time listener will handle removal from UI
    } catch (err) {
      throw new Error('Failed to delete habit');
    }
  }, [user]);

  const toggleCompletion = useCallback(async (habitId: string, date: string = getTodayDateString(), completed: boolean, notes?: string) => {
    if (!user) return;

    const existingCompletion = completions.find(c => c.habitId === habitId && c.date === date);
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
      await toggleHabitCompletion(user.uid, habitId, date, completed, notes);
      // Success - real-time listener will sync the actual data
    } catch (err) {
      // Rollback optimistic update on error
      rollbackOptimisticUpdate('completion', rollbackKey);
      throw new Error('Failed to update completion');
    }
  }, [user, completions, updateCompletionOptimistic, addCompletionOptimistic, removeCompletionOptimistic, rollbackOptimisticUpdate]);

  const getHabitCompletion = useCallback((habitId: string, date: string = getTodayDateString()): HabitCompletion | null => {
    return completions.find(c => c.habitId === habitId && c.date === date) || null;
  }, [completions]);

  const isHabitCompleted = useCallback((habitId: string, date: string = getTodayDateString()): boolean => {
    const completion = getHabitCompletion(habitId, date);
    return completion?.completed || false;
  }, [getHabitCompletion]);

  return {
    habits,
    completions,
    loading,
    error,
    addHabit,
    editHabit,
    removeHabit,
    toggleCompletion,
    getHabitCompletion,
    isHabitCompleted,
    refetchHabits: refreshData, // Use global refresh function
  };
}