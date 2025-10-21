'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getTodayDateString } from '@/lib/utils';
import type { Habit, HabitCompletion, MoodEntry } from '@/types';
import type { WorkspaceHabit, WorkspaceHabitCompletion } from '@/types/workspace';

// Connection status for real-time updates
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

// Subscription manager for cleanup
class SubscriptionManager {
  private subscriptions = new Map<string, Unsubscribe>();

  add(key: string, unsubscribe: Unsubscribe) {
    // Clean up existing subscription if it exists
    this.cleanup(key);
    this.subscriptions.set(key, unsubscribe);
  }

  cleanup(key: string) {
    const existing = this.subscriptions.get(key);
    if (existing) {
      existing();
      this.subscriptions.delete(key);
    }
  }

  cleanupAll() {
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();
  }
}

interface GlobalDataContextType {
  // Personal data
  habits: Habit[];
  completions: HabitCompletion[];
  moods: MoodEntry[];
  
  // Workspace data
  familyHabits: WorkspaceHabit[];
  familyCompletions: WorkspaceHabitCompletion[];
  
  // State management
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  
  // Actions with optimistic updates
  updateHabitOptimistic: (habitId: string, updates: Partial<Habit>) => void;
  updateCompletionOptimistic: (completion: Partial<HabitCompletion>) => void;
  addCompletionOptimistic: (completion: HabitCompletion) => void;
  removeCompletionOptimistic: (habitId: string, date: string) => void;
  
  // Rollback functions for error handling
  rollbackOptimisticUpdate: (type: 'habit' | 'completion', id: string) => void;
  
  // Force refresh function
  refreshData: () => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType | undefined>(undefined);

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { currentWorkspace, currentMember } = useWorkspace();
  
  // State for personal data
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  
  // State for family data
  const [familyHabits, setWorkspaceHabits] = useState<WorkspaceHabit[]>([]);
  const [familyCompletions, setFamilyCompletions] = useState<WorkspaceHabitCompletion[]>([]);
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  
  // Subscription management
  const subscriptionManager = useMemo(() => new SubscriptionManager(), []);
  
  // Optimistic update stores for rollback
  const [optimisticHabits, setOptimisticHabits] = useState<Map<string, Habit>>(new Map());
  const [optimisticCompletions, setOptimisticCompletions] = useState<Map<string, HabitCompletion>>(new Map());

  // Setup real-time listeners for personal data
  const setupPersonalListeners = useCallback(() => {
    if (!user?.uid) return;

    try {
      setConnectionStatus('connecting');
      
      // Habits listener
      const habitsQuery = query(
        collection(db, 'users', user.uid, 'habits'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeHabits = onSnapshot(
        habitsQuery,
        (snapshot) => {
          const habitsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Habit[];
          
          setHabits(habitsData);
          setConnectionStatus('connected');
          setError(null);
          console.log('Personal habits loaded:', habitsData.length, 'habits for user', user.uid);
        },
        (err) => {
          console.error('Habits listener error:', err);
          setError('Failed to sync habits');
          setConnectionStatus('disconnected');
        }
      );

      // Completions listener
      const completionsQuery = query(
        collection(db, 'users', user.uid, 'completions'),
        orderBy('date', 'desc')
      );
      
      const unsubscribeCompletions = onSnapshot(
        completionsQuery,
        (snapshot) => {
          const completionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as HabitCompletion[];
          
          setCompletions(completionsData);
        },
        (err) => {
          console.error('Completions listener error:', err);
          setError('Failed to sync completions');
        }
      );

      // Moods listener
      const moodsQuery = query(
        collection(db, 'users', user.uid, 'moods'),
        orderBy('date', 'desc')
      );
      
      const unsubscribeMoods = onSnapshot(
        moodsQuery,
        (snapshot) => {
          const moodsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as MoodEntry[];
          
          setMoods(moodsData);
          setLoading(false);
        },
        (err) => {
          console.error('Moods listener error:', err);
          setError('Failed to sync moods');
        }
      );

      // Register subscriptions for cleanup
      subscriptionManager.add('habits', unsubscribeHabits);
      subscriptionManager.add('completions', unsubscribeCompletions);
      subscriptionManager.add('moods', unsubscribeMoods);

    } catch (err) {
      console.error('Failed to setup personal listeners:', err);
      setError('Failed to connect to real-time updates');
      setConnectionStatus('disconnected');
      setLoading(false);
    }
  }, [user?.uid, subscriptionManager]);

  // Setup real-time listeners for family data
  const setupFamilyListeners = useCallback(() => {
    if (!currentWorkspace?.id) {
      setWorkspaceHabits([]);
      setFamilyCompletions([]);
      return;
    }

    try {
      // Workspace habits listener - ONLY from families collection, never users collection
      const familyHabitsQuery = query(
        collection(db, 'workspaces', currentWorkspace.id, 'habits'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribeWorkspaceHabits = onSnapshot(
        familyHabitsQuery,
        (snapshot) => {
          const familyHabitsData = snapshot.docs.map(doc => ({
            id: doc.id,
            workspaceId: currentWorkspace.id,
            ...doc.data()
          })) as WorkspaceHabit[];
          
          // Ensure these are definitively family habits, not individual habits, and are active
          const validatedWorkspaceHabits = familyHabitsData.filter(habit =>
            habit.workspaceId === currentWorkspace.id &&
            habit.assignedMembers &&
            habit.isActive !== false &&
            habit.isArchived !== true
          );
          
          setWorkspaceHabits(validatedWorkspaceHabits);
          console.log('Workspace habits loaded:', validatedWorkspaceHabits.length, 'habits for family', currentWorkspace.id);
        },
        (err) => {
          console.error('Workspace habits listener error:', err);
          setError('Failed to sync family habits');
        }
      );

      // Workspace completions listener - ONLY from families collection
      const familyCompletionsQuery = query(
        collection(db, 'workspaces', currentWorkspace.id, 'completions'),
        orderBy('date', 'desc')
      );
      
      const unsubscribeFamilyCompletions = onSnapshot(
        familyCompletionsQuery,
        (snapshot) => {
          const familyCompletionsData = snapshot.docs.map(doc => ({
            id: doc.id,
            workspaceId: currentWorkspace.id,
            ...doc.data()
          })) as WorkspaceHabitCompletion[];
          
          // Ensure these are definitively family completions, not individual completions
          const validatedFamilyCompletions = familyCompletionsData.filter(completion => 
            completion.workspaceId === currentWorkspace.id && completion.memberId
          );
          
          // Debug logging for completion data
          const today = getTodayDateString();
          const todaysCompletions = validatedFamilyCompletions.filter(c => c.date === today);
          const yesterdaysCompletions = validatedFamilyCompletions.filter(c => c.date === '2025-09-06');
          console.log('\n🔍 FAMILY COMPLETIONS DEBUG:');
          console.log(`📅 Today: ${today}`);
          console.log(`📊 Total completions loaded: ${validatedFamilyCompletions.length}`);
          console.log(`🎯 Today's completions (${today}):`, todaysCompletions.length);
          console.log(`⏮️ Yesterday's completions (2025-09-06):`, yesterdaysCompletions.length);
          if (todaysCompletions.length > 0) {
            console.log('Today\'s completion details:');
            todaysCompletions.forEach(c => {
              const timestamp = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
              console.log(`  - ${c.habitName || c.habitId} (${c.memberId}): completed=${c.completed}, date=${c.date}, timestamp=${timestamp?.toISOString()}, notes=${c.notes || 'none'}`);
            });
          }
          if (yesterdaysCompletions.length > 0) {
            console.log('Yesterday\'s completion details:');
            yesterdaysCompletions.forEach(c => {
              const timestamp = c.timestamp?.toDate ? c.timestamp.toDate() : new Date(c.timestamp);
              console.log(`  - ${c.habitName || c.habitId} (${c.memberId}): completed=${c.completed}, date=${c.date}, timestamp=${timestamp?.toISOString()}, notes=${c.notes || 'none'}`);
            });
          }
          
          setFamilyCompletions(validatedFamilyCompletions);
          console.log('Workspace completions loaded:', validatedFamilyCompletions.length, 'completions for family', currentWorkspace.id);
        },
        (err) => {
          console.error('Workspace completions listener error:', err);
          setError('Failed to sync family completions');
        }
      );

      // Register family subscriptions
      subscriptionManager.add('familyHabits', unsubscribeWorkspaceHabits);
      subscriptionManager.add('familyCompletions', unsubscribeFamilyCompletions);

    } catch (err) {
      console.error('Failed to setup family listeners:', err);
      setError('Failed to connect to family updates');
    }
  }, [currentWorkspace?.id, subscriptionManager]);

  // Optimistic update functions
  const updateHabitOptimistic = useCallback((habitId: string, updates: Partial<Habit>) => {
    setHabits(prev => {
      const existing = prev.find(h => h.id === habitId);
      if (existing) {
        // Store original for rollback
        setOptimisticHabits(store => new Map(store.set(habitId, existing)));
        
        return prev.map(habit =>
          habit.id === habitId
            ? { ...habit, ...updates, updatedAt: new Date().toISOString() }
            : habit
        );
      }
      return prev;
    });
  }, []);

  const updateCompletionOptimistic = useCallback((completion: Partial<HabitCompletion>) => {
    if (!completion.habitId || !completion.date) return;

    setCompletions(prev => {
      const existingIndex = prev.findIndex(c => 
        c.habitId === completion.habitId && c.date === completion.date
      );

      if (existingIndex >= 0) {
        const existing = prev[existingIndex];
        // Store original for rollback
        const rollbackKey = `${completion.habitId}-${completion.date}`;
        setOptimisticCompletions(store => new Map(store.set(rollbackKey, existing)));

        // Update existing completion
        const newCompletions = [...prev];
        newCompletions[existingIndex] = {
          ...existing,
          ...completion,
          updatedAt: new Date().toISOString()
        } as HabitCompletion;
        return newCompletions;
      }

      return prev;
    });
  }, []);

  const addCompletionOptimistic = useCallback((completion: HabitCompletion) => {
    setCompletions(prev => [completion, ...prev]);
  }, []);

  const removeCompletionOptimistic = useCallback((habitId: string, date: string) => {
    setCompletions(prev => {
      const existing = prev.find(c => c.habitId === habitId && c.date === date);
      if (existing) {
        // Store for rollback
        const rollbackKey = `${habitId}-${date}`;
        setOptimisticCompletions(store => new Map(store.set(rollbackKey, existing)));
      }
      return prev.filter(c => !(c.habitId === habitId && c.date === date));
    });
  }, []);

  // Rollback function for error handling
  const rollbackOptimisticUpdate = useCallback((type: 'habit' | 'completion', id: string) => {
    if (type === 'habit') {
      const original = optimisticHabits.get(id);
      if (original) {
        setHabits(prev => prev.map(habit => habit.id === id ? original : habit));
        setOptimisticHabits(store => {
          const newStore = new Map(store);
          newStore.delete(id);
          return newStore;
        });
      }
    } else if (type === 'completion') {
      const original = optimisticCompletions.get(id);
      if (original) {
        setCompletions(prev => {
          const existingIndex = prev.findIndex(c => 
            c.habitId === original.habitId && c.date === original.date
          );
          if (existingIndex >= 0) {
            const newCompletions = [...prev];
            newCompletions[existingIndex] = original;
            return newCompletions;
          } else {
            return [original, ...prev];
          }
        });
        setOptimisticCompletions(store => {
          const newStore = new Map(store);
          newStore.delete(id);
          return newStore;
        });
      }
    }
  }, [optimisticHabits, optimisticCompletions]);

  // Force refresh data
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Clean up existing subscriptions
    subscriptionManager.cleanupAll();
    
    // Re-setup listeners
    setupPersonalListeners();
    setupFamilyListeners();
  }, [setupPersonalListeners, setupFamilyListeners, subscriptionManager]);

  // Initialize listeners
  useEffect(() => {
    if (user?.uid) {
      setupPersonalListeners();
    } else {
      // User logged out, clean up
      setHabits([]);
      setCompletions([]);
      setMoods([]);
      subscriptionManager.cleanupAll();
      setLoading(false);
    }

    return () => {
      subscriptionManager.cleanupAll();
    };
  }, [user?.uid, setupPersonalListeners, subscriptionManager]);

  useEffect(() => {
    setupFamilyListeners();
  }, [setupFamilyListeners]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      subscriptionManager.cleanupAll();
    };
  }, [subscriptionManager]);

  const contextValue: GlobalDataContextType = {
    habits,
    completions,
    moods,
    familyHabits,
    familyCompletions,
    loading,
    error,
    connectionStatus,
    updateHabitOptimistic,
    updateCompletionOptimistic,
    addCompletionOptimistic,
    removeCompletionOptimistic,
    rollbackOptimisticUpdate,
    refreshData
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData(): GlobalDataContextType {
  const context = useContext(GlobalDataContext);
  if (context === undefined) {
    throw new Error('useGlobalData must be used within a GlobalDataProvider');
  }
  return context;
}