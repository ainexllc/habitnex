'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthContext';
import { 
  Family, 
  FamilyMember, 
  FamilyDashboardData,
  CreateFamilyRequest,
  JoinFamilyRequest 
} from '@/types/family';
import { 
  createFamily, 
  joinFamily, 
  getFamily, 
  getFamilyDashboardData,
  subscribeFamilyData,
  addDirectFamilyMember,
  updateFamilyMemberInDb,
  updateFamilySettingsInDb,
  updateFamilyName as updateFamilyNameInDb,
  getUserFamilies
} from '@/lib/familyDb';
import { 
  updateUserSelectedFamily, 
  getUserSelectedFamily, 
  clearUserSelectedFamily 
} from '@/lib/db';
import { recoverOrphanedFamilies } from '@/lib/familyRecovery';

interface FamilyContextType {
  // State
  currentFamily: Family | null;
  currentMember: FamilyMember | null;
  dashboardData: FamilyDashboardData | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  createNewFamily: (request: CreateFamilyRequest) => Promise<void>;
  joinExistingFamily: (request: JoinFamilyRequest) => Promise<void>;
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
    role: 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
    motivationStyle?: 'rewards' | 'progress' | 'competition';
  }) => Promise<void>;
  updateFamilyMember: (memberId: string, updates: {
    displayName?: string;
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
    role?: 'parent' | 'child' | 'teen' | 'adult';
  }) => Promise<void>;
  updateFamilySettings: (settings: Partial<Family['settings']>) => Promise<void>;
  updateFamilyName: (name: string) => Promise<void>;
  switchFamily: (familyId: string) => Promise<void>;
  leaveFamily: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // Utilities
  isParent: boolean;
  canManageFamily: boolean;
  clearError: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  
  // State
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [currentMember, setCurrentMember] = useState<FamilyMember | null>(null);
  const [dashboardData, setDashboardData] = useState<FamilyDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Computed properties
  const isParent = currentMember?.role === 'parent' || currentMember?.role === 'adult';
  const canManageFamily = isParent || currentFamily?.createdBy === user?.uid;
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Load family data on user login
  useEffect(() => {
    if (!user || authLoading) return;
    
    const isFamilyRoute = pathname.startsWith('/family') || pathname.startsWith('/dashboard/family');
    
    const loadUserFamily = async () => {
      try {
        setLoading(true);
        
        // Always check for basic family status first
        const lastFamilyId = await getUserSelectedFamily(user.uid);
        
        if (lastFamilyId) {
          try {
            if (isFamilyRoute) {
              // On family routes, load full family data
              await switchFamily(lastFamilyId);
            } else {
              // On non-family routes, just set basic family info without full data loading
              const familyData = await getFamily(lastFamilyId);
              if (familyData) {
                const member = familyData.members.find(m => m.userId === user.uid);
                setCurrentFamily(familyData);
                setCurrentMember(member || null);
                // Don't load dashboard data on non-family routes
                setDashboardData(null);
              }
            }
            return; // Successfully loaded family info
          } catch (err) {
            console.warn('Failed to load family from user profile, searching for user families:', err);
            // Clear invalid family ID from user profile
            await clearUserSelectedFamily(user.uid);
          }
        }
        
        // If no saved family or failed to load, discover user's families
        // But only do the full search on family routes to avoid unnecessary database calls
        if (isFamilyRoute) {
          let userFamilies = await getUserFamilies(user.uid);
          
          // If no families found, try to recover orphaned families
          if (userFamilies.length === 0 && user.email) {
            const recovered = await recoverOrphanedFamilies(user.uid, user.email);
            
            if (recovered) {
              // Re-fetch families after recovery
              userFamilies = await getUserFamilies(user.uid);
            }
          }
          
          if (userFamilies.length > 0) {
            // Auto-select the first family (or most recently used)
            const selectedFamily = userFamilies[0];
            await switchFamily(selectedFamily.familyId);
          } else {
            // Clear any existing family state
            setCurrentFamily(null);
            setCurrentMember(null);
            setDashboardData(null);
          }
        } else {
          // On non-family routes, just clear state if no saved family found
          setCurrentFamily(null);
          setCurrentMember(null);
          setDashboardData(null);
        }
      } catch (err) {
        console.error('Failed to load user family:', err);
        setError('Failed to load family data');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserFamily();
  }, [user, authLoading, pathname]);
  
  // Real-time subscription to family data
  useEffect(() => {
    // Clean up immediately if no user
    if (!user) {
      setCurrentFamily(null);
      setCurrentMember(null);
      setDashboardData(null);
      return;
    }
    
    if (!currentFamily?.id) return;
    
    const unsubscribe = subscribeFamilyData(currentFamily.id, (updates) => {
      
      // Update family if it's included in the updates
      if (updates.family) {
        setCurrentFamily(updates.family);
        // Update current member if it exists in the updated family
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
  }, [currentFamily?.id, user?.uid]);
  
  // Create new family
  const createNewFamily = useCallback(async (request: CreateFamilyRequest) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const familyId = await createFamily(user.uid, request);
      await switchFamily(familyId);
      
      // Store as last family in user profile
      await updateUserSelectedFamily(user.uid, familyId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create family';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Join existing family
  const joinExistingFamily = useCallback(async (request: JoinFamilyRequest) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      const familyId = await joinFamily(user.uid, request);
      await switchFamily(familyId);
      
      // Store as last family in user profile
      await updateUserSelectedFamily(user.uid, familyId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join family';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Add direct family member (no user account required)
  const addDirectMember = useCallback(async (memberInfo: {
    name: string;
    displayName: string;
    avatarSeed?: string;
    avatarSkinColor?: string;
    avatarMouth?: string;
    color: string;
    role: 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
    motivationStyle?: 'rewards' | 'progress' | 'competition';
  }) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentFamily || !currentMember) throw new Error('Must be in a family to add members');
    
    try {
      setLoading(true);
      setError(null);
      
      await addDirectFamilyMember(currentFamily.id, currentMember.id, memberInfo);
      
      // Refresh family data to include the new member
      const updatedFamily = await getFamily(currentFamily.id);
      if (updatedFamily) {
        setCurrentFamily(updatedFamily);
      }
      await refreshDashboard();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add family member';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentFamily, currentMember]);
  
  // Update family member
  const updateFamilyMember = useCallback(async (memberId: string, updates: {
    displayName?: string;
    profileImageUrl?: string | null;  // Added for new profile image system
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
    role?: 'parent' | 'child' | 'teen' | 'adult';
  }) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentFamily) throw new Error('No family selected');
    
    try {
      setLoading(true);
      setError(null);
      
      await updateFamilyMemberInDb(currentFamily.id, memberId, updates);
      
      // Debug logging
      console.log('🔄 FamilyContext: Refreshing family data after member update', { 
        memberId, 
        updates, 
        hasProfileImageUrl: !!updates.profileImageUrl 
      });
      
      // Refresh family data to show updates
      const updatedFamily = await getFamily(currentFamily.id);
      if (updatedFamily) {
        setCurrentFamily(updatedFamily);
        // Update current member if it's the one being edited
        if (currentMember?.id === memberId) {
          const updatedMember = updatedFamily.members.find(m => m.id === memberId);
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
  }, [user, currentFamily, currentMember]);

  // Update family settings
  const updateFamilySettings = useCallback(async (settings: Partial<Family['settings']>) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentFamily) throw new Error('No family selected');
    if (!isParent && currentFamily.createdBy !== user.uid) {
      throw new Error('Only parents can update family settings');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await updateFamilySettingsInDb(currentFamily.id, settings);
      
      // Refresh family data to show updates
      const updatedFamily = await getFamily(currentFamily.id);
      if (updatedFamily) {
        setCurrentFamily(updatedFamily);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentFamily, isParent]);
  
  // Update family name
  const updateFamilyName = useCallback(async (name: string) => {
    if (!user) throw new Error('User must be logged in');
    if (!currentFamily) throw new Error('No family selected');
    if (!isParent && currentFamily.createdBy !== user.uid) {
      throw new Error('Only parents can update family name');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await updateFamilyNameInDb(currentFamily.id, name);
      
      // Refresh family data to show updates
      const updatedFamily = await getFamily(currentFamily.id);
      if (updatedFamily) {
        setCurrentFamily(updatedFamily);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update family name';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, currentFamily, isParent]);
  
  // Switch to different family
  const switchFamily = useCallback(async (familyId: string) => {
    if (!user) throw new Error('User must be logged in');
    
    try {
      setLoading(true);
      setError(null);
      
      // Load family data
      const family = await getFamily(familyId);
      if (!family) {
        throw new Error('Family not found');
      }
      
      // Find current user's member record
      const member = family.members.find(m => m.userId === user.uid);
      if (!member) {
        throw new Error('You are not a member of this family');
      }
      
      // Load dashboard data
      const dashboard = await getFamilyDashboardData(familyId);
      
      // Update state
      setCurrentFamily(family);
      setCurrentMember(member);
      setDashboardData(dashboard);
      
      // Store as last family in user profile
      await updateUserSelectedFamily(user.uid, familyId);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to switch family';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Leave current family
  const leaveFamily = useCallback(async () => {
    if (!user || !currentFamily) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear state
      setCurrentFamily(null);
      setCurrentMember(null);
      setDashboardData(null);
      
      // Clear user profile family selection
      await clearUserSelectedFamily(user.uid);
      
      // TODO: Implement actual leave family logic in backend
      console.log('Left family:', currentFamily.name);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to leave family';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, currentFamily]);
  
  // Refresh dashboard data
  const refreshDashboard = useCallback(async () => {
    if (!currentFamily?.id) return;
    
    try {
      const dashboard = await getFamilyDashboardData(currentFamily.id);
      setDashboardData(dashboard);
    } catch (err) {
      console.error('Failed to refresh dashboard:', err);
    }
  }, [currentFamily?.id]);
  
  const value: FamilyContextType = {
    // State
    currentFamily,
    currentMember,
    dashboardData,
    loading: loading || authLoading,
    error,
    
    // Actions
    createNewFamily,
    joinExistingFamily,
    addDirectMember,
    updateFamilyMember,
    updateFamilySettings,
    updateFamilyName,
    switchFamily,
    leaveFamily,
    refreshDashboard,
    
    // Utilities
    isParent,
    canManageFamily,
    clearError
  };
  
  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  
  return context;
}

// Hook for checking if user has a family
export function useFamilyStatus() {
  const { currentFamily, currentMember, loading } = useFamily();
  
  return {
    hasFamily: !!currentFamily,
    isMember: !!currentMember,
    loading,
    familyName: currentFamily?.name,
    memberName: currentMember?.displayName
  };
}

// Hook for family member utilities
export function useFamilyMember(memberId: string) {
  const { currentFamily } = useFamily();
  
  const member = currentFamily?.members.find(m => m.id === memberId);
  
  return {
    member,
    isCurrentUser: member?.userId === member?.userId, // TODO: Fix with actual user comparison
    displayName: member?.displayName || 'Unknown',
    avatar: member?.avatar || '👤',
    color: member?.color || '#6B7280',
    role: member?.role || 'child',
    stats: member?.stats
  };
}