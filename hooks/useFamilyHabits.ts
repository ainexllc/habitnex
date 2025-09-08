import { useCallback, useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { 
  FamilyHabit, 
  FamilyHabitCompletion,
  CreateFamilyHabitRequest 
} from '@/types/family';
import {
  createFamilyHabit,
  getFamilyHabits,
  updateFamilyHabit,
  deleteFamilyHabit,
  toggleFamilyHabitCompletion,
  getFamilyCompletions
} from '@/lib/familyDb';
import { getTodayDateString } from '@/lib/utils';

// Helper function for default points
const getDefaultPoints = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  switch (difficulty) {
    case 'easy': return 10;
    case 'medium': return 20;
    case 'hard': return 30;
    default: return 20;
  }
};

export function useFamilyHabits(memberId?: string) {
  const { currentFamily, currentMember } = useFamily();
  const {
    familyHabits: habits,
    familyCompletions: completions,
    loading,
    error,
    refreshData
  } = useGlobalData();
  
  const targetMemberId = memberId || currentMember?.id;
  
  // Filter habits and completions for the target member
  const memberHabits = habits.filter(habit => 
    !targetMemberId || habit.assignedMembers?.includes(targetMemberId)
  );
  
  const memberCompletions = completions.filter(completion => 
    !targetMemberId || completion.memberId === targetMemberId
  );
  
  // Create new habit
  const createHabit = useCallback(async (habitData: Omit<CreateFamilyHabitRequest['habit'], 'familyId'>) => {
    if (!currentFamily?.id || !currentMember?.id) {
      throw new Error('Must be in a family to create habits');
    }
    
    try {
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
      // Real-time listener will update the habits automatically
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id, currentMember?.id]);
  
  // Update habit
  const updateHabit = useCallback(async (habitId: string, updates: Partial<FamilyHabit>) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to update habits');
    }
    
    try {
      await updateFamilyHabit(currentFamily.id, habitId, updates);
      // Real-time listener will update the habits automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id]);
  
  // Toggle habit completion
  const toggleCompletion = useCallback(async (
    habitId: string, 
    date?: string,
    completed?: boolean,
    notes?: string
  ) => {
    // Use local date if not provided
    if (!date) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      date = `${year}-${month}-${day}`;
    }
    if (!currentFamily?.id || !targetMemberId) {
      throw new Error('Must be in a family to toggle completions');
    }
    
    try {
      // If completed is not specified, toggle current state
      if (completed === undefined) {
        const existingCompletion = memberCompletions.find(c => 
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
      // Real-time listener will update the completions automatically
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle completion';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id, targetMemberId, memberCompletions]);
  
  // Get today's habits for a member
  const getTodayHabits = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Use local date string to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
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
  
  return {
    // Data
    habits: memberHabits,
    completions: memberCompletions,
    todayHabits: getTodayHabits(),
    
    // State
    loading,
    error,
    
    // Actions
    createHabit,
    updateHabit,
    toggleCompletion,
    refresh: refreshData, // Use global refresh function
    
    // Utilities
    getHabitCompletion,
    getHabitStreak,
    clearError: () => {} // No-op since error is managed globally
  };
}


// Hook for managing all family members' habits (for parents/dashboard view)
export function useAllFamilyHabits() {
  const { currentFamily, currentMember, isParent } = useFamily();
  const {
    familyHabits: allHabits,
    familyCompletions: allCompletions,
    loading,
    error,
    refreshData
  } = useGlobalData();
  
  // Create new habit
  const createHabit = useCallback(async (habitData: Omit<CreateFamilyHabitRequest['habit'], 'familyId'>) => {
    if (!currentFamily?.id || !currentMember?.id) {
      throw new Error('Must be in a family to create habits');
    }
    
    try {
      const request: CreateFamilyHabitRequest = {
        familyId: currentFamily.id,
        habit: {
          ...habitData,
          createdBy: currentMember.id,
          familyId: currentFamily.id,
          points: habitData.points || getDefaultPoints(habitData.difficulty || 'medium'),
          bonusPoints: habitData.bonusPoints || 0
        }
      };
      
      await createFamilyHabit(request);
      // Real-time listener will update the habits automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create habit';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id, currentMember?.id]);
  
  // Get habits by member
  const getHabitsByMember = useCallback((memberId: string) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Use local date string to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    // Calculate yesterday's date
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayYear = yesterday.getFullYear();
    const yesterdayMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yesterdayDay = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayString = `${yesterdayYear}-${yesterdayMonth}-${yesterdayDay}`;
    
    // Debug: Log the date strings being used
    console.log('[DEBUG] getHabitsByMember - Today:', todayString, 'Yesterday:', yesterdayString, 'Day of week:', dayOfWeek, 'Current time:', today.toString());
    
    // Debug logging
    console.log('🔍 DEBUG getHabitsByMember:', {
      memberId,
      todayString,
      dayOfWeek,
      totalCompletions: allCompletions.length,
      todaysCompletions: allCompletions.filter(c => c.date === todayString).length
    });
    
    return allHabits
      .filter(habit => habit.assignedMembers && Array.isArray(habit.assignedMembers) && habit.assignedMembers.includes(memberId))
      .filter(habit => {
        // Check if habit is due today
        if (habit.frequency === 'daily') {
          return habit.targetDays && Array.isArray(habit.targetDays) && habit.targetDays.includes(dayOfWeek);
        } else if (habit.frequency === 'weekly') {
          return habit.targetDays && Array.isArray(habit.targetDays) && habit.targetDays.includes(dayOfWeek);
        } else if (habit.frequency === 'interval' && habit.intervalDays && habit.startDate) {
          const startDate = new Date(habit.startDate);
          const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff >= 0 && daysDiff % habit.intervalDays === 0;
        }
        return false; // Exclude habits that don't match any frequency criteria
      })
      .map(habit => {
        // Check if habit was completed today
        const todayCompletion = allCompletions.find(c => 
          c.habitId === habit.id && 
          c.memberId === memberId && 
          c.date === todayString
        );
        
        // Debug: Log completion status
        if (todayCompletion) {
          console.log(`[DEBUG] Found today's completion for ${habit.name}:`, {
            date: todayCompletion.date,
            completed: todayCompletion.completed,
            habitId: habit.id,
            memberId
          });
        }
        
        // Check if habit was completed yesterday (for showing failure state)
        const yesterdayCompletion = allCompletions.find(c => 
          c.habitId === habit.id && 
          c.memberId === memberId && 
          c.date === yesterdayString
        );
        
        return {
          ...habit,
          // Only mark as completed if there's an actual completion record for TODAY with completed: true
          completed: todayCompletion ? (todayCompletion.completed === true) : false,
          // Add yesterday's status for UI display
          yesterdayStatus: yesterdayCompletion ? 
            (yesterdayCompletion.completed ? 
              (yesterdayCompletion.notes === 'Marked as failed' ? 'failed' : 'completed') 
              : 'incomplete'
            ) : null,
          // Add completion details for status checking (backward compatibility)
          todaysCompletion: todayCompletion || null
        };
      });
  }, [allHabits, allCompletions]);
  
  // Get completion stats by member
  const getMemberStats = useCallback((memberId: string) => {
    const today = new Date();
    // Use local date string to avoid timezone issues
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    const memberHabits = getHabitsByMember(memberId); // This already filters for today's habits
    
    // Get the IDs of habits that are due today
    const todaysHabitIds = new Set(memberHabits.map(h => h.id));
    
    // Count only TODAY's SUCCESSFUL completions for habits that are actually due today
    const todaysCompletions = allCompletions.filter(c => 
      c.memberId === memberId && 
      c.date === todayString && 
      c.completed &&
      c.notes !== 'Marked as failed' && // Exclude failed habits from completed count
      todaysHabitIds.has(c.habitId) // Only count if the habit is due today
    );
    
    // Count unique habits completed (not duplicate completion records)
    const uniqueCompletedHabitIds = new Set(todaysCompletions.map(c => c.habitId));
    const completed = uniqueCompletedHabitIds.size;
    const total = memberHabits.length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const totalPoints = allCompletions
      .filter(c => c.memberId === memberId)
      .reduce((sum, c) => sum + (c.pointsEarned || 0), 0); // Keep total points from all time
    
    return {
      completed,
      total,
      completionRate,
      totalPoints,
      pending: total - completed
    };
  }, [allHabits, allCompletions, getHabitsByMember]);
  
  // Update habit
  const updateHabit = useCallback(async (habitId: string, updates: Partial<FamilyHabit>) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to update habits');
    }
    
    try {
      await updateFamilyHabit(currentFamily.id, habitId, updates);
      // Real-time listener will update the habits automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update habit';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id]);

  // Delete habit
  const deleteHabit = useCallback(async (habitId: string) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to delete habits');
    }
    
    try {
      await deleteFamilyHabit(currentFamily.id, habitId);
      // Real-time listener will handle removal from UI
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete habit';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id]);

  // Toggle completion for any family member
  const toggleMemberCompletion = useCallback(async (
    habitId: string, 
    memberId: string,
    currentCompleted: boolean,
    date: string = getTodayDateString(),
    notes?: string
  ) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to toggle completions');
    }
    
    console.log(`🔄 DEBUG toggleMemberCompletion: habitId=${habitId}, memberId=${memberId}, currentCompleted=${currentCompleted}, date=${date}, toggleTo=${!currentCompleted}`);
    
    try {
      await toggleFamilyHabitCompletion(
        currentFamily.id,
        habitId,
        memberId,
        date,
        !currentCompleted, // Toggle the current state
        notes
      );
      // Real-time listener will update the completions automatically
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle completion';
      throw new Error(errorMessage);
    }
  }, [currentFamily?.id]);

  return {
    // Data
    allHabits,
    allCompletions,
    
    // State
    loading,
    error,
    
    // Actions
    createHabit,
    updateHabit,
    deleteHabit,
    toggleMemberCompletion,
    refresh: refreshData,
    
    // Utilities
    getHabitsByMember,
    getMemberStats,
    clearError: () => {} // No-op since error is managed globally
  };
}