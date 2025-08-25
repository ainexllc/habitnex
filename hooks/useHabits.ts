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
      console.log('No user available for fetching habits');
      return;
    }

    console.log('Fetching habits for user:', user.uid);

    try {
      setLoading(true);
      setError(null);
      
      const [habitsData, completionsData] = await Promise.all([
        getUserHabits(user.uid),
        getCompletions(user.uid)
      ]);
      
      console.log('Fetched habits:', habitsData);
      console.log('Fetched completions:', completionsData);
      
      setHabits(habitsData);
      setCompletions(completionsData);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError('Failed to load habits');
    } finally {
      setLoading(false);
    }
  };

  const addHabit = async (habitData: CreateHabitForm) => {
    if (!user) {
      console.error('No user found when trying to create habit');
      return;
    }

    console.log('Creating habit for user:', user.uid);
    console.log('Habit data:', habitData);

    try {
      const habitId = await createHabit(user.uid, { ...habitData, isArchived: false });
      console.log('Habit created with ID:', habitId);
      
      await fetchHabits(); // Refresh the list
      console.log('Habits refetched after creation');
      
      return habitId;
    } catch (err) {
      console.error('Error creating habit:', err);
      throw new Error('Failed to create habit');
    }
  };

  const editHabit = async (habitId: string, updates: Partial<Habit> | CreateHabitForm) => {
    if (!user) return;

    console.log('Editing habit:', habitId, 'with updates:', updates);

    try {
      await updateHabit(user.uid, habitId, updates);
      await fetchHabits(); // Refresh the list
      console.log('Habit updated successfully');
    } catch (err) {
      console.error('Error updating habit:', err);
      throw new Error('Failed to update habit');
    }
  };

  const removeHabit = async (habitId: string) => {
    if (!user) return;

    try {
      await deleteHabit(user.uid, habitId);
      await fetchHabits(); // Refresh the list
    } catch (err) {
      console.error('Error deleting habit:', err);
      throw new Error('Failed to delete habit');
    }
  };

  const toggleCompletion = async (habitId: string, date: string = getTodayDateString(), completed: boolean, notes?: string) => {
    if (!user) return;

    try {
      await toggleHabitCompletion(user.uid, habitId, date, completed, notes);
      await fetchHabits(); // Refresh completions
    } catch (err) {
      console.error('Error toggling completion:', err);
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