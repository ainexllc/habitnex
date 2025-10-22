'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import {
  Workspace,
  WorkspaceMember,
  WorkspaceDashboardData,
  CreateWorkspaceRequest,
  JoinWorkspaceRequest,
  MemberRewardProfile
} from '@/types/workspace';

// TODO Phase 3: Replace with workspaceDb imports
import {
  createFamily as createWorkspace_TEMP,
  joinFamily as joinWorkspace_TEMP,
  getFamily as getWorkspace_TEMP,
  getFamilyDashboardData as getWorkspaceDashboardData_TEMP,
  subscribeFamilyData as subscribeWorkspaceData_TEMP,
  addDirectFamilyMember as addDirectWorkspaceMember_TEMP,
  updateFamilyMemberInDb as updateWorkspaceMemberInDb_TEMP,
  updateFamilySettingsInDb as updateWorkspaceSettingsInDb_TEMP,
  updateFamilyName as updateWorkspaceName_TEMP,
  getUserFamilies as getUserWorkspaces_TEMP
} from '@/lib/familyDb';

// TODO Phase 3: Update user profile functions for workspace
import {
  updateUserSelectedFamily as updateUserSelectedWorkspace_TEMP,
  getUserSelectedFamily as getUserSelectedWorkspace_TEMP,
  clearUserSelectedFamily as clearUserSelectedWorkspace_TEMP
} from '@/lib/db';

// TODO Phase 3: Update recovery function
import { recoverOrphanedFamilies as recoverOrphanedWorkspaces_TEMP } from '@/lib/familyRecovery';

interface WorkspaceContextType {
  // State
  currentWorkspace: Workspace | null;
  currentMember: WorkspaceMember | null;
  dashboardData: WorkspaceDashboardData | null;
  loading: boolean;
  error: string | null;

  // Actions
  createNewWorkspace: (request: CreateWorkspaceRequest) => Promise<void>;
  joinExistingWorkspace: (request: JoinWorkspaceRequest) => Promise<void>;
  addDirectMember: (memberInfo: {
    name: string;
    displayName: string;
    avatarSeed?: string;
    avatarSkinColor?: string;
    avatarMouth?: string;
    avatarHairStyle?: string;
    avatarHairColor?: string;
    hairProbability?: number;
    glassesProbability?: number;
    featuresProbability?: number;
    earringsProbability?: number;
    color: string;
    role: 'owner' | 'admin' | 'member' | 'viewer' | 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
    motivationStyle?: 'rewards' | 'progress' | 'competition';
  }) => Promise<void>;
  updateWorkspaceMember: (memberId: string, updates: {
    displayName?: string;
    profileImageUrl?: string | null;
    avatarSeed?: string;
    avatarSkinColor?: string;
    avatarMouth?: string;
    avatarHairStyle?: string;
    avatarHairColor?: string;
    hairProbability?: number;
    glassesProbability?: number;
    featuresProbability?: number;
    earringsProbability?: number;
    color?: string;
    role?: 'owner' | 'admin' | 'member' | 'viewer' | 'parent' | 'child' | 'teen' | 'adult';
    rewardProfile?: MemberRewardProfile | null;
  }) => Promise<void>;
  updateWorkspaceSettings: (settings: Partial<Workspace['settings']>) => Promise<void>;
  updateWorkspaceName: (name: string) => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  leaveWorkspace: () => Promise<void>;
  refreshDashboard: () => Promise<void>;

  // Utilities
  isAdmin: boolean;
  canManageWorkspace: boolean;
  clearError: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // State
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentMember, setCurrentMember] = useState<WorkspaceMember | null>(null);
  const [dashboardData, setDashboardData] = useState<WorkspaceDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed properties - Updated for workspace roles
  const isAdmin = currentMember?.role === 'owner' ||
                  currentMember?.role === 'admin' ||
                  currentMember?.role === 'parent';
  const canManageWorkspace = isAdmin || currentWorkspace?.createdBy === user?.uid;

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load workspace data on user login
  useEffect(() => {
    if (!user || authLoading) return;

    const isWorkspaceRoute =
      pathname.startsWith('/family') ||  // Backward compatibility
      pathname.startsWith('/workspace') ||
      pathname === '/';

    const loadUserWorkspace = async () => {
      try {
        setLoading(true);

        // Always check for basic workspace status first
        const lastWorkspaceId = await getUserSelectedWorkspace_TEMP(user.uid);

        if (lastWorkspaceId) {
          try {
            if (isWorkspaceRoute) {
              // On workspace routes, load full workspace data
              await switchWorkspace(lastWorkspaceId);
            } else {
              // On non-workspace routes, just set basic workspace info without full data loading
              const workspaceData = await getWorkspace_TEMP(lastWorkspaceId);
              if (workspaceData) {
                const member = workspaceData.members.find(m => m.userId === user.uid);
                setCurrentWorkspace(workspaceData);
                setCurrentMember(member || null);
                // Don't load dashboard data on non-workspace routes
                setDashboardData(null);
              }
            }
            return; // Successfully loaded workspace info
          } catch (err) {
            console.warn('Failed to load workspace from user profile, searching for user workspaces:', err);
            // Clear invalid workspace ID from user profile
            await clearUserSelectedWorkspace_TEMP(user.uid);
          }
        }

        // If no saved workspace or failed to load, discover user's workspaces
        // But only do the full search on workspace routes to avoid unnecessary database calls
        if (isWorkspaceRoute) {
          let userWorkspaces = await getUserWorkspaces_TEMP(user.uid);

          // If no workspaces found, try to recover orphaned workspaces
          if (userWorkspaces.length === 0 && user.email) {
            const recovered = await recoverOrphanedWorkspaces_TEMP(user.uid, user.email);

            if (recovered) {
              // Re-fetch workspaces after recovery
              userWorkspaces = await getUserWorkspaces_TEMP(user.uid);
            }
          }

          if (userWorkspaces.length > 0) {
            // Auto-select the first workspace (or most recently used)
            const selectedWorkspace = userWorkspaces[0];
            await switchWorkspace(selectedWorkspace.familyId); // TODO Phase 3: Update to workspaceId
          } else {
            // No workspaces found - create a default personal workspace for first-time users
            try {
              const defaultWorkspace: CreateWorkspaceRequest = {
                name: `${user.displayName || user.email?.split('@')[0] || 'My'}'s Workspace`,
                type: 'personal' as any, // TODO Phase 3: Fix type
              };
              const workspaceId = await createWorkspace_TEMP(user.uid, defaultWorkspace as any);
              await updateUserSelectedWorkspace_TEMP(user.uid, workspaceId);
              await switchWorkspace(workspaceId);
            } catch (err) {
              console.error('Failed to create default workspace:', err);
              // If auto-creation fails, clear workspace state
              setCurrentWorkspace(null);
              setCurrentMember(null);
              setDashboardData(null);
            }
          }
        } else {
          // On non-workspace routes, just clear state if no saved workspace found
          setCurrentWorkspace(null);
          setCurrentMember(null);
          setDashboardData(null);
        }
      } catch (err) {
        console.error('Failed to load user workspace:', err);
        setError('Failed to load workspace data');
      } finally {
        setLoading(false);
      }
    };

    loadUserWorkspace();
  }, [user, authLoading, pathname]);

  // Real-time subscription to workspace data
  useEffect(() => {
    // Clean up immediately if no user
    if (!user) {
      setCurrentWorkspace(null);
      setCurrentMember(null);
      setDashboardData(null);
      return;
    }

    if (!currentWorkspace?.id) return;

    const unsubscribe = subscribeWorkspaceData_TEMP(currentWorkspace.id, (updates) => {

      // Update workspace if it's included in the updates
      if (updates.family) { // TODO Phase 3: Update to workspace
        setCurrentWorkspace(updates.family);
        // Update current member if it exists in the updated workspace
        const updatedMember = updates.family.members.find(m => m.userId === user?.uid);
        if (updatedMember) {
          setCurrentMember(updatedMember);
        }
      }

      setDashboardData(prev => {
        if (!prev) return prev;

        return {
          ...prev,
          ...updates
        };
      });
    });

    return unsubscribe;
  }, [currentWorkspace?.id, user?.uid]);

  // Create new workspace
  const createNewWorkspace = useCallback(async (request: CreateWorkspaceRequest) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      setError(null);

      const workspaceId = await createWorkspace_TEMP(user.uid, request as any); // TODO Phase 3: Fix types
      await switchWorkspace(workspaceId);

      // Store as last workspace in user profile
      await updateUserSelectedWorkspace_TEMP(user.uid, workspaceId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workspace';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Join existing workspace
  const joinExistingWorkspace = useCallback(async (request: JoinWorkspaceRequest) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      setError(null);

      const workspaceId = await joinWorkspace_TEMP(user.uid, request as any); // TODO Phase 3: Fix types
      await switchWorkspace(workspaceId);

      // Store as last workspace in user profile
      await updateUserSelectedWorkspace_TEMP(user.uid, workspaceId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join workspace';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add direct workspace member (no user account required)
  const addDirectMember = useCallback(async (memberInfo: {
    name: string;
    displayName: string;
    avatarSeed?: string;
    avatarSkinColor?: string;
    avatarMouth?: string;
    color: string;
    role: 'owner' | 'admin' | 'member' | 'viewer' | 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
    motivationStyle?: 'rewards' | 'progress' | 'competition';
  }) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentWorkspace || !currentMember) throw new Error('Must be in a workspace to add members');

    try {
      setLoading(true);
      setError(null);

      await addDirectWorkspaceMember_TEMP(currentWorkspace.id, currentMember.id, memberInfo as any); // TODO Phase 3: Fix types

      // Refresh workspace data to include the new member
      const updatedWorkspace = await getWorkspace_TEMP(currentWorkspace.id);
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
      }
      await refreshDashboard();

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add workspace member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, currentMember]);

  // Update workspace member
  const updateWorkspaceMember = useCallback(async (memberId: string, updates: {
    displayName?: string;
    profileImageUrl?: string | null;
    avatarSeed?: string;
    avatarSkinColor?: string;
    avatarMouth?: string;
    avatarHairStyle?: string;
    avatarHairColor?: string;
    hairProbability?: number;
    glassesProbability?: number;
    featuresProbability?: number;
    earringsProbability?: number;
    color?: string;
    role?: 'owner' | 'admin' | 'member' | 'viewer' | 'parent' | 'child' | 'teen' | 'adult';
    rewardProfile?: MemberRewardProfile | null;
  }) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentWorkspace) throw new Error('No workspace selected');

    try {
      setLoading(true);
      setError(null);

      await updateWorkspaceMemberInDb_TEMP(currentWorkspace.id, memberId, updates as any); // TODO Phase 3: Fix types

      // Debug logging
      console.log('🔄 WorkspaceContext: Refreshing workspace data after member update', {
        memberId,
        updates,
        hasProfileImageUrl: !!updates.profileImageUrl
      });

      // Refresh workspace data to show updates
      const updatedWorkspace = await getWorkspace_TEMP(currentWorkspace.id);
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
        // Update current member if it's the one being edited
        if (currentMember?.id === memberId) {
          const updatedMember = updatedWorkspace.members.find(m => m.id === memberId);
          if (updatedMember) {
            setCurrentMember(updatedMember);
          }
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, currentMember]);

  // Update workspace settings
  const updateWorkspaceSettings = useCallback(async (settings: Partial<Workspace['settings']>) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentWorkspace) throw new Error('No workspace selected');
    if (!isAdmin && currentWorkspace.createdBy !== user.uid) {
      throw new Error('Only admins can update workspace settings');
    }

    try {
      setLoading(true);
      setError(null);

      await updateWorkspaceSettingsInDb_TEMP(currentWorkspace.id, settings);

      // Refresh workspace data to show updates
      const updatedWorkspace = await getWorkspace_TEMP(currentWorkspace.id);
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, isAdmin]);

  // Update workspace name
  const updateWorkspaceName = useCallback(async (name: string) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentWorkspace) throw new Error('No workspace selected');
    if (!isAdmin && currentWorkspace.createdBy !== user.uid) {
      throw new Error('Only admins can update workspace name');
    }

    try {
      setLoading(true);
      setError(null);

      await updateWorkspaceName_TEMP(currentWorkspace.id, name);

      // Refresh workspace data to show updates
      const updatedWorkspace = await getWorkspace_TEMP(currentWorkspace.id);
      if (updatedWorkspace) {
        setCurrentWorkspace(updatedWorkspace);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workspace name';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace, isAdmin]);

  // Switch to different workspace
  const switchWorkspace = useCallback(async (workspaceId: string) => {
    if (!user) throw new Error('User must be logged in');

    try {
      setLoading(true);
      setError(null);

      // Load workspace data
      const workspace = await getWorkspace_TEMP(workspaceId);
      if (!workspace) {
        throw new Error('Workspace not found');
      }

      // Find current user's member record
      const member = workspace.members.find(m => m.userId === user.uid);
      if (!member) {
        throw new Error('You are not a member of this workspace');
      }

      // Load dashboard data
      const dashboard = await getWorkspaceDashboardData_TEMP(workspaceId);

      // Update state
      setCurrentWorkspace(workspace);
      setCurrentMember(member);
      setDashboardData(dashboard);

      // Store as last workspace in user profile
      await updateUserSelectedWorkspace_TEMP(user.uid, workspaceId);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch workspace';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Leave current workspace
  const leaveWorkspace = useCallback(async () => {
    if (!user || !currentWorkspace) return;

    try {
      setLoading(true);
      setError(null);

      // Clear state
      setCurrentWorkspace(null);
      setCurrentMember(null);
      setDashboardData(null);

      // Clear user profile workspace selection
      await clearUserSelectedWorkspace_TEMP(user.uid);

      // TODO Phase 3: Implement actual leave workspace logic in backend
      console.log('Left workspace:', currentWorkspace.name);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave workspace';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentWorkspace]);

  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      const dashboard = await getWorkspaceDashboardData_TEMP(currentWorkspace.id);
      setDashboardData(dashboard);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  }, [currentWorkspace?.id]);

  const value: WorkspaceContextType = {
    // State
    currentWorkspace,
    currentMember,
    dashboardData,
    loading: loading || authLoading,
    error,

    // Actions
    createNewWorkspace,
    joinExistingWorkspace,
    addDirectMember,
    updateWorkspaceMember,
    updateWorkspaceSettings,
    updateWorkspaceName,
    switchWorkspace,
    leaveWorkspace,
    refreshDashboard,

    // Utilities
    isAdmin,
    canManageWorkspace,
    clearError
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }

  return context;
}

// Hook for checking if user has a workspace
export function useWorkspaceStatus() {
  const { currentWorkspace, currentMember, loading } = useWorkspace();

  return {
    hasWorkspace: !!currentWorkspace,
    isMember: !!currentMember,
    loading,
    workspaceName: currentWorkspace?.name,
    memberName: currentMember?.displayName
  };
}

// Hook for workspace member utilities
export function useWorkspaceMember(memberId: string) {
  const { currentWorkspace } = useWorkspace();

  const member = currentWorkspace?.members.find(m => m.id === memberId);

  return {
    member,
    isCurrentUser: member?.userId === member?.userId, // TODO: Fix with actual user comparison
    displayName: member?.displayName || 'Unknown',
    avatar: member?.avatar || '👤',
    color: member?.color || '#6B7280',
    role: member?.role || 'member',
    stats: member?.stats
  };
}

// Backward compatibility exports
/** @deprecated Use useWorkspace instead */
export const useFamily = useWorkspace;
/** @deprecated Use useWorkspaceStatus instead */
export const useFamilyStatus = useWorkspaceStatus;
/** @deprecated Use useWorkspaceMember instead */
export const useFamilyMember = useWorkspaceMember;
