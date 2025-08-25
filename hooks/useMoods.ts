'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getMoodEntries,
  createMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
  getMoodForDate
} from '@/lib/unifiedDb';
import { MoodEntry, CreateMoodForm } from '@/types';
import { getTodayDateString } from '@/lib/utils';

export function useMoods() {
  const { user } = useAuth();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMoods = async () => {
    if (!user) {
      console.log('No user available for fetching moods');
      return;
    }

    console.log('Fetching moods for user:', user.uid);

    try {
      setLoading(true);
      setError(null);
      
      const moodsData = await getMoodEntries(user.uid);
      
      console.log('Fetched moods:', moodsData);
      setMoods(moodsData);
    } catch (err) {
      console.error('Error fetching moods:', err);
      setError('Failed to load mood entries');
    } finally {
      setLoading(false);
    }
  };

  const addMood = async (moodData: CreateMoodForm, date: string = getTodayDateString()) => {
    if (!user) {
      console.error('No user found when trying to create mood entry');
      return;
    }

    // Check if mood already exists for this date
    const existingMood = moods.find(mood => mood.date === date);
    if (existingMood) {
      throw new Error('A mood entry already exists for this date. You can only add one mood per day.');
    }

    console.log('Creating mood entry for user:', user.uid);
    console.log('Mood data:', moodData);

    try {
      const moodId = await createMoodEntry(user.uid, moodData, date);
      console.log('Mood entry created with ID:', moodId);
      
      await fetchMoods(); // Refresh the list
      console.log('Moods refetched after creation');
      
      return moodId;
    } catch (err) {
      console.error('Error creating mood entry:', err);
      throw new Error('Failed to create mood entry');
    }
  };

  const editMood = async (moodId: string, updates: Partial<MoodEntry>) => {
    if (!user) return;

    try {
      await updateMoodEntry(user.uid, moodId, updates);
      await fetchMoods(); // Refresh the list
    } catch (err) {
      console.error('Error updating mood entry:', err);
      throw new Error('Failed to update mood entry');
    }
  };

  const removeMood = async (moodId: string) => {
    if (!user) return;

    try {
      await deleteMoodEntry(user.uid, moodId);
      await fetchMoods(); // Refresh the list
    } catch (err) {
      console.error('Error deleting mood entry:', err);
      throw new Error('Failed to delete mood entry');
    }
  };

  const getMoodByDate = async (date: string): Promise<MoodEntry | null> => {
    if (!user) return null;

    try {
      return await getMoodForDate(user.uid, date);
    } catch (err) {
      console.error('Error getting mood for date:', err);
      return null;
    }
  };

  const getTodayMood = (): MoodEntry | null => {
    const today = getTodayDateString();
    return moods.find(mood => mood.date === today) || null;
  };

  const hasMoodForDate = (date: string): boolean => {
    return moods.some(mood => mood.date === date);
  };

  useEffect(() => {
    if (user) {
      fetchMoods();
    } else {
      // Reset state when user is not available
      setMoods([]);
      setLoading(false);
      setError(null);
    }
  }, [user]);

  return {
    moods,
    loading,
    error,
    addMood,
    editMood,
    removeMood,
    getMoodByDate,
    getTodayMood,
    hasMoodForDate,
    refetchMoods: fetchMoods,
  };
}