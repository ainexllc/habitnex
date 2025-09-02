'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = async () => {
    if (!user) {
      // No user available for fetching habits
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [habitsData, completionsData] = await Promise.all([
        getUserHabits(user.uid),
        getCompletions(user.uid)
      ]);

      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (err) {
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: CreateHabitForm) => {
    if (!user) {
      // No user found when trying to create habit
      return;
    }

    try {
      const habitId = await createHabit(user.uid, { ...habitData, isArchived: false });

      await fetchHabits(); // Refresh the list

      return habitId;
    } catch (err) {
      throw new Error('Failed to create habit');
    }
  };

  const editHabit = async (habitId: string, updates: Partial<Habit> | CreateHabitForm) => {
    if (!user) return;

    // Optimistic update - update UI immediately
    const originalHabits = habits;
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId
          ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
          : habit
      )
    );

    try {
      await updateHabit(user.uid, habitId, updates);
      // The UI is already updated, no need to refetch
    } catch (err) {
      // Revert on error
      setHabits(originalHabits);
      throw new Error('Failed to update habit');
    }
  };

  const removeHabit = async (habitId: string) => {
    if (!user) return;

    // Optimistic update - remove from UI immediately
    const originalHabits = habits;
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== habitId));

    try {
      await deleteHabit(user.uid, habitId);
      // Also remove related completions for cleaner state
      setCompletions(prevCompletions => 
        prevCompletions.filter(completion => completion.habitId !== habitId)
      );
    } catch (err) {
      // Revert on error
      setHabits(originalHabits);
      throw new Error('Failed to delete habit');
    }
  };

  const toggleCompletion = async (habitId: string, date: string = getTodayDateString(), completed: boolean, notes?: string) => {
    if (!user) return;

    // Optimistic update - update completions immediately
    const originalCompletions = completions;
    const existingCompletion = completions.find(c => c.habitId === habitId && c.date === date);
    
    if (existingCompletion) {
      // Update existing completion
      setCompletions(prevCompletions =>
        prevCompletions.map(c =>
          c.habitId === habitId && c.date === date
            ? { ...c, completed, notes: notes || c.notes, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } else {
      // Create new completion
      const newCompletion = {
        id: `temp-${Date.now()}`, // Temporary ID
        habitId,
        date,
        completed,
        notes: notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCompletions(prevCompletions => [...prevCompletions, newCompletion]);
    }

    try {
      await toggleHabitCompletion(user.uid, habitId, date, completed, notes);
      // Refresh to get the actual completion data with real ID
      await fetchHabits();
    } catch (err) {
      // Revert on error
      setCompletions(originalCompletions);
      throw new Error('Failed to update completion');
    }
  };

  const getHabitCompletion = (habitId: string, date: string = getTodayDateString()): HabitCompletion | null => {
    return completions.find(c => c.habitId === habitId && c.date === date) || null;
  };

  const isHabitCompleted = (habitId: string, date: string = getTodayDateString()): boolean => {
    const completion = getHabitCompletion(habitId, date);
    return completion?.completed || false;
  };

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

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
    refetchHabits: fetchHabits,
  };
}