'use client';

import { useGlobalData } from '@/contexts/GlobalDataContext';
import { useFamily } from '@/contexts/FamilyContext';

/**
 * Hook for accessing ONLY family data
 * This should NEVER be used in individual dashboard components
 */
export function useFamilyData() {
  const { currentFamily } = useFamily();
  const {
    familyHabits,
    familyCompletions,
    loading,
    error,
    connectionStatus,
    refreshData
  } = useGlobalData();

  // Validate that we're only returning family data and only when in a family context
  if (!currentFamily) {
    return {
      habits: [],
      completions: [],
      loading: false,
      error: null,
      connectionStatus: 'disconnected' as const,
      refreshData: async () => {}
    };
  }

  // Additional validation - ensure all data belongs to current family
  const validatedHabits = familyHabits.filter(habit => habit.familyId === currentFamily.id);
  const validatedCompletions = familyCompletions.filter(completion => completion.familyId === currentFamily.id);

  return {
    habits: validatedHabits,
    completions: validatedCompletions,
    loading,
    error,
    connectionStatus,
    refreshData
  };
}