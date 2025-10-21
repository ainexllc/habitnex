'use client';

import { useGlobalData } from '@/contexts/GlobalDataContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';

/**
 * Hook for accessing ONLY family data
 * This should NEVER be used in individual dashboard components
 */
export function useWorkspaceData() {
  const { currentWorkspace } = useWorkspace();
  const {
    familyHabits,
    familyCompletions,
    loading,
    error,
    connectionStatus,
    refreshData
  } = useGlobalData();

  // Validate that we're only returning family data and only when in a family context
  if (!currentWorkspace) {
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
  const validatedHabits = familyHabits.filter(habit => habit.workspaceId === currentWorkspace.id);
  const validatedCompletions = familyCompletions.filter(completion => completion.workspaceId === currentWorkspace.id);

  return {
    habits: validatedHabits,
    completions: validatedCompletions,
    loading,
    error,
    connectionStatus,
    refreshData
  };
}