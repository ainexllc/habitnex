import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  FamilyHabit, 
  FamilyHabitCompletion,
  CreateFamilyHabitRequest 
} from '@/types/family';
import {
  createFamilyHabit,
  getFamilyHabits,
  updateFamilyHabit,
  toggleFamilyHabitCompletion,
  getFamilyCompletions
} from '@/lib/familyDb';

export function useFamilyHabits(memberId?: string) {
  const { currentFamily, currentMember } = useFamily();
  
  const [habits, setHabits] = useState<FamilyHabit[]>([]);
  const [completions, setCompletions] = useState<FamilyHabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const targetMemberId = memberId || currentMember?.id;
  
  // Load habits and completions
  const loadData = useCallback(async () => {
    if (!currentFamily?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [habitsData, completionsData] = await Promise.all([
        getFamilyHabits(currentFamily.id, targetMemberId),
        getFamilyCompletions(currentFamily.id, {
          memberId: targetMemberId,
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
          endDate: new Date().toISOString().split('T')[0]
        })
      ]);
      
      setHabits(habitsData);
      setCompletions(completionsData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load habits';
      setError(errorMessage);
      console.error('Failed to load family habits:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, targetMemberId]);
  
  // Load data when family or member changes
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Create new habit
  const createHabit = useCallback(async (habitData: Omit<CreateFamilyHabitRequest['habit'], 'familyId'>) => {
    if (!currentFamily?.id || !currentMember?.id) {
      throw new Error('Must be in a family to create habits');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const request: CreateFamilyHabitRequest = {
        familyId: currentFamily.id,
        habit: {
          ...habitData,
          createdBy: currentMember.id,
          assignedMembers: habitData.assignedMembers || [currentMember.id],
          basePoints: habitData.basePoints || getDefaultPoints(habitData.difficulty || 'medium'),
          linkedRewards: habitData.linkedRewards || [],
          milestoneRewards: habitData.milestoneRewards || []
        }
      };
      
      await createFamilyHabit(request);
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, currentMember?.id, loadData]);
  
  // Update habit
  const updateHabit = useCallback(async (habitId: string, updates: Partial<FamilyHabit>) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to update habits');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await updateFamilyHabit(currentFamily.id, habitId, updates);
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, loadData]);
  
  // Toggle habit completion
  const toggleCompletion = useCallback(async (
    habitId: string, 
    date: string = new Date().toISOString().split('T')[0],
    completed?: boolean,
    notes?: string
  ) => {
    if (!currentFamily?.id || !targetMemberId) {
      throw new Error('Must be in a family to toggle completions');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // If completed is not specified, toggle current state
      if (completed === undefined) {
        const existingCompletion = completions.find(c => 
          c.habitId === habitId && 
          c.memberId === targetMemberId && 
          c.date === date
        );
        completed = !existingCompletion?.completed;
      }
      
      await toggleFamilyHabitCompletion(
        currentFamily.id,
        habitId,
        targetMemberId,
        date,
        completed,
        notes
      );
      
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle completion';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, targetMemberId, completions, loadData]);
  
  // Get today's habits for a member
  const getTodayHabits = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayString = today.toISOString().split('T')[0];
    
    return habits.filter(habit => {
      // Check if habit is due today
      if (habit.frequency === 'daily') {
        return habit.targetDays.includes(dayOfWeek);
      } else if (habit.frequency === 'weekly') {
        return habit.targetDays.includes(dayOfWeek);
      } else if (habit.frequency === 'interval' && habit.intervalDays && habit.startDate) {
        const startDate = new Date(habit.startDate);
        const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff >= 0 && daysDiff % habit.intervalDays === 0;
      }
      return false;
    }).map(habit => ({
      ...habit,
      completed: completions.some(c => 
        c.habitId === habit.id && 
        c.memberId === targetMemberId && 
        c.date === todayString && 
        c.completed
      )
    }));
  }, [habits, completions, targetMemberId]);
  
  // Get habit completion status for a specific date
  const getHabitCompletion = useCallback((habitId: string, date: string) => {
    return completions.find(c => 
      c.habitId === habitId && 
      c.memberId === targetMemberId && 
      c.date === date
    );
  }, [completions, targetMemberId]);
  
  // Get habit streak
  const getHabitStreak = useCallback((habitId: string) => {
    const habitCompletions = completions
      .filter(c => c.habitId === habitId && c.memberId === targetMemberId && c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitCompletions.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (const completion of habitCompletions) {
      const completionDate = new Date(completion.date);
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, [completions, targetMemberId]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Data
    habits,
    completions,
    todayHabits: getTodayHabits(),
    
    // State
    loading,
    error,
    
    // Actions
    createHabit,
    updateHabit,
    toggleCompletion,
    refresh: loadData,
    
    // Utilities
    getHabitCompletion,
    getHabitStreak,
    clearError
  };
}

// Helper function to get default points based on difficulty
function getDefaultPoints(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'medium': return 3;
    case 'hard': return 5;
    default: return 3;
  }
}

// Hook for managing all family members' habits (for parents/dashboard view)
export function useAllFamilyHabits() {
  const { currentFamily, isParent } = useFamily();
  
  const [allHabits, setAllHabits] = useState<FamilyHabit[]>([]);
  const [allCompletions, setAllCompletions] = useState<FamilyHabitCompletion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const loadAllData = useCallback(async () => {
    if (!currentFamily?.id || !isParent) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date().toISOString().split('T')[0];
      
      const [habitsData, completionsData] = await Promise.all([
        getFamilyHabits(currentFamily.id), // All habits
        getFamilyCompletions(currentFamily.id, {
          startDate: today,
          endDate: today
        }) // Today's completions
      ]);
      
      setAllHabits(habitsData);
      setAllCompletions(completionsData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load family data';
      setError(errorMessage);
      console.error('Failed to load all family habits:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, isParent]);
  
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);
  
  // Get habits by member
  const getHabitsByMember = useCallback((memberId: string) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const todayString = today.toISOString().split('T')[0];
    
    return allHabits
      .filter(habit => habit.assignedMembers.includes(memberId))
      .filter(habit => {
        // Check if habit is due today
        if (habit.frequency === 'daily') {
          return habit.targetDays.includes(dayOfWeek);
        } else if (habit.frequency === 'weekly') {
          return habit.targetDays.includes(dayOfWeek);
        }
        return true; // Include other frequencies for now
      })
      .map(habit => ({
        ...habit,
        completed: allCompletions.some(c => 
          c.habitId === habit.id && 
          c.memberId === memberId && 
          c.date === todayString && 
          c.completed
        )
      }));
  }, [allHabits, allCompletions]);
  
  // Get completion stats by member
  const getMemberStats = useCallback((memberId: string) => {
    const memberCompletions = allCompletions.filter(c => c.memberId === memberId);
    const memberHabits = allHabits.filter(habit => habit.assignedMembers.includes(memberId));
    
    const completed = memberCompletions.filter(c => c.completed).length;
    const total = memberHabits.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const totalPoints = memberCompletions.reduce((sum, c) => sum + (c.pointsEarned || 0), 0);
    
    return {
      completed,
      total,
      completionRate,
      totalPoints,
      pending: total - completed
    };
  }, [allHabits, allCompletions]);
  
  return {
    // Data
    allHabits,
    allCompletions,
    
    // State
    loading,
    error,
    
    // Actions
    refresh: loadAllData,
    
    // Utilities
    getHabitsByMember,
    getMemberStats,
    clearError: () => setError(null)
  };
}