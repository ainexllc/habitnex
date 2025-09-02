import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  writeBatch,
  setDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserFamilies, getFamily } from './familyDb';
import type { Habit, HabitCompletion, User, MoodEntry, CreateMoodForm } from '../types';
import type { FamilyHabit, FamilyHabitCompletion, FamilyMoodEntry } from '../types/family';

// Legacy imports for fallback
import * as legacyDb from './db';
import { getUserSelectedFamily } from './db';

/**
 * Unified database operations that work with both individual and family data structures
 * This provides a migration path from individual user data to family-first architecture
 */

export interface UnifiedContext {
  userId: string;
  familyId: string | null;
  memberId: string | null;
  isPersonalFamily: boolean;
}

// In-memory cache for user contexts to prevent repeated family queries
const userContextCache = new Map<string, { context: UnifiedContext; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Session-level cache to remember which operations should use fallback
const fallbackCache = new Map<string, { shouldUseFallback: boolean; timestamp: number }>();
const FALLBACK_CACHE_TTL = 10 * 60 * 1000; // 10 minutes - longer than context cache

/**
 * Check if a specific operation should use fallback for a user
 */
const shouldUseFallback = (userId: string, operation: string): boolean => {
  const key = `${userId}:${operation}`;
  const cached = fallbackCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < FALLBACK_CACHE_TTL) {
    return cached.shouldUseFallback;
  }
  return false; // Default to trying family structure first
};

/**
 * Mark an operation to use fallback for a user (due to missing indexes, etc.)
 */
const markForFallback = (userId: string, operation: string) => {
  const key = `${userId}:${operation}`;
  fallbackCache.set(key, { shouldUseFallback: true, timestamp: Date.now() });
};

/**
 * Get user's active context (personal family or selected family) with caching
 */
export const getUserContext = async (userId: string): Promise<UnifiedContext> => {
  try {
    // Check cache first
    const cached = userContextCache.get(userId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.context;
    }

    // Cache miss or expired, fetch fresh data
    const userFamilies = await getUserFamilies(userId);
    
    if (userFamilies.length === 0) {
      // No families found - user can choose to create one manually
      // This gives users control instead of forcing family creation
      const context = {
        userId,
        familyId: null,
        memberId: null,
        isPersonalFamily: false
      };
      userContextCache.set(userId, { context, timestamp: Date.now() });
      return context;
    }
    
    // Check user profile for last selected family
    const lastFamilyId = await getUserSelectedFamily(userId);
    let selectedFamily = userFamilies.find(f => f.familyId === lastFamilyId);
    
    if (!selectedFamily) {
      // Default to first family (likely personal family)
      selectedFamily = userFamilies[0];
    }
    
    // Check if this is a personal family
    const family = await getFamily(selectedFamily.familyId);
    const isPersonalFamily = family?.isPersonal || false;
    
    const context = {
      userId,
      familyId: selectedFamily.familyId,
      memberId: selectedFamily.member.id,
      isPersonalFamily
    };
    userContextCache.set(userId, { context, timestamp: Date.now() });
    return context;
    
  } catch (error) {
    console.error('Failed to get user context:', error);
    // Fallback to individual mode
    const context = {
      userId,
      familyId: null,
      memberId: null,
      isPersonalFamily: false
    };
    userContextCache.set(userId, { context, timestamp: Date.now() });
    return context;
  }
};

/**
 * Clear cached user context (call when family selection changes)
 */
export const clearUserContextCache = (userId: string) => {
  userContextCache.delete(userId);
};

/**
 * Unified habit operations that work with both individual and family contexts
 */

export const createHabit = async (userId: string, habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const familyHabitsRef = collection(db, 'families', context.familyId, 'habits');
    
    const familyHabitData: Omit<FamilyHabit, 'id'> = {
      familyId: context.familyId,
      name: habitData.name, // Explicitly map name field
      description: habitData.description,
      emoji: '✅', // Default emoji since Habit doesn't have this field
      color: habitData.color,
      tags: habitData.tags || [],
      assignedMembers: [context.memberId],
      isShared: false, // Default to individual habit
      createdBy: context.memberId,
      frequency: habitData.frequency,
      targetDays: habitData.targetDays,
      intervalDays: habitData.intervalDays,
      startDate: habitData.startDate,
      difficulty: 'medium', // Default difficulty
      basePoints: 10, // Default points
      linkedRewards: [],
      milestoneRewards: [],
      isActive: true,
      isArchived: habitData.isArchived,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      // AI enhancement fields
      aiEnhanced: habitData.aiEnhanced,
      tip: habitData.tip,
      healthBenefits: habitData.healthBenefits,
      mentalBenefits: habitData.mentalBenefits,
      longTermBenefits: habitData.longTermBenefits,
      complementary: habitData.complementary
    };
    
    const docRef = await addDoc(familyHabitsRef, familyHabitData);
    return docRef.id;
  } else {
    // Fallback to individual structure
    return legacyDb.createHabit(userId, habitData);
  }
};

export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const habitsRef = collection(db, 'families', context.familyId, 'habits');
    const q = query(
      habitsRef, 
      where('isActive', '==', true),
      where('assignedMembers', 'array-contains', context.memberId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FamilyHabit;
      // Convert family habit to individual habit format for compatibility
      return {
        id: doc.id,
        name: data.name, // Both FamilyHabit and Habit use 'name' field
        description: data.description,
        tags: data.tags || [], // Use tags directly if available
        frequency: data.frequency,
        targetDays: data.targetDays,
        intervalDays: data.intervalDays,
        startDate: data.startDate,
        reminderTime: undefined, // FamilyHabit doesn't have reminderTime for habits
        reminderType: undefined, // FamilyHabit doesn't have reminderType
        goal: undefined, // FamilyHabit doesn't have completionGoal field
        color: data.color,
        isArchived: data.isArchived,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        // AI enhancement fields
        aiEnhanced: data.aiEnhanced,
        tip: data.tip,
        healthBenefits: data.healthBenefits,
        mentalBenefits: data.mentalBenefits,
        longTermBenefits: data.longTermBenefits,
        complementary: data.complementary
      } as Habit;
    });
  } else {
    // Fallback to individual structure
    return legacyDb.getUserHabits(userId);
  }
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>): Promise<void> => {
  const context = await getUserContext(userId);

  if (context.familyId && context.memberId) {
    // Use family structure
    const habitRef = doc(db, 'families', context.familyId, 'habits', habitId);

    // Clean the updates object to remove undefined values and empty strings
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key, value]) => {
        // Keep false values but remove undefined, null, and empty strings
        if (value === false || value === 0) return true;
        if (value === undefined || value === null) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      })
    );

    // Special handling for AI enhancement fields - preserve them even if empty
    // but ensure they don't get set to undefined
    const aiFields = ['aiEnhanced', 'tip', 'healthBenefits', 'mentalBenefits', 'longTermBenefits', 'complementary'];
    aiFields.forEach(field => {
      if (field in updates) {
        if (field === 'aiEnhanced') {
          // Ensure aiEnhanced is a boolean
          cleanUpdates[field] = !!updates[field];
        } else if (field === 'complementary') {
          // Ensure complementary is an array
          cleanUpdates[field] = Array.isArray(updates[field]) ? updates[field] : [];
        } else if (typeof updates[field] === 'string') {
          // Keep string fields even if empty for AI data
          cleanUpdates[field] = updates[field] || '';
        }
      }
    });

    // Convert individual habit updates to family habit format
    const familyUpdates = {
      ...cleanUpdates,
      updatedAt: Timestamp.now()
    };

    await updateDoc(habitRef, familyUpdates);
  } else {
    // Fallback to individual structure
    return legacyDb.updateHabit(userId, habitId, updates);
  }
};

export const deleteHabit = async (userId: string, habitId: string): Promise<void> => {
  const context = await getUserContext(userId);
  
  if (context.familyId) {
    // Use family structure
    const habitRef = doc(db, 'families', context.familyId, 'habits', habitId);
    await deleteDoc(habitRef);
  } else {
    // Fallback to individual structure
    return legacyDb.deleteHabit(userId, habitId);
  }
};

/**
 * Unified completion operations
 */

export const addCompletion = async (userId: string, completion: Omit<HabitCompletion, 'id' | 'timestamp'>): Promise<string> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const completionsRef = collection(db, 'families', context.familyId, 'completions');
    
    const familyCompletionData: Omit<FamilyHabitCompletion, 'id'> = {
      ...completion,
      familyId: context.familyId,
      memberId: context.memberId,
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(completionsRef, familyCompletionData);
    return docRef.id;
  } else {
    // Fallback to individual structure
    return legacyDb.addCompletion(userId, completion);
  }
};

export const getCompletions = async (userId: string, habitId?: string, startDate?: string, endDate?: string): Promise<HabitCompletion[]> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const completionsRef = collection(db, 'families', context.familyId, 'completions');
    let q = query(completionsRef, 
      where('memberId', '==', context.memberId),
      orderBy('date', 'desc')
    );

    if (habitId) {
      q = query(q, where('habitId', '==', habitId));
    }
    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FamilyHabitCompletion;
      // Convert to individual completion format for compatibility
      return {
        id: doc.id,
        habitId: data.habitId,
        date: data.date,
        completed: data.completed,
        notes: data.notes,
        timestamp: data.timestamp
      } as HabitCompletion;
    });
  } else {
    // Fallback to individual structure
    return legacyDb.getCompletions(userId, habitId, startDate, endDate);
  }
};

export const toggleHabitCompletion = async (userId: string, habitId: string, date: string, completed: boolean, notes?: string): Promise<void> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const completionsRef = collection(db, 'families', context.familyId, 'completions');
    const q = query(completionsRef, 
      where('memberId', '==', context.memberId),
      where('habitId', '==', habitId), 
      where('date', '==', date)
    );
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Create new completion
      await addCompletion(userId, {
        habitId,
        date,
        completed,
        notes: notes || ''
      });
    } else {
      // Update existing completion
      const existingDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, 'families', context.familyId, 'completions', existingDoc.id), { 
        completed, 
        notes: notes || ''
      });
    }
  } else {
    // Fallback to individual structure
    return legacyDb.toggleHabitCompletion(userId, habitId, date, completed, notes);
  }
};

/**
 * Unified mood operations
 */

export const createMoodEntry = async (userId: string, moodData: CreateMoodForm, date: string): Promise<string> => {
  // Skip family structure entirely for mood operations due to permission issues and missing Firestore indexes
  // Use individual structure directly to avoid permission errors
  return legacyDb.createMoodEntry(userId, moodData, date);
  
  // TODO: Re-enable family structure after fixing family permissions and deploying composite indexes
  // const context = await getUserContext(userId);
  // if (context.familyId && context.memberId) {
  //   // Use family structure - check if mood already exists for this member/date
  //   const moodsRef = collection(db, 'families', context.familyId, 'moods');
  //   const q = query(moodsRef, 
  //     where('memberId', '==', context.memberId),
  //     where('date', '==', date)
  //   );
  //   const existingSnapshot = await getDocs(q);
  //   
  //   if (!existingSnapshot.empty) {
  //     throw new Error('A mood entry already exists for this date. You can only add one mood per day.');
  //   }
  //   
  //   const familyMoodData: Omit<FamilyMoodEntry, 'id'> = {
  //     ...moodData,
  //     familyId: context.familyId,
  //     memberId: context.memberId,
  //     date,
  //     sharedWithFamily: context.isPersonalFamily ? false : moodData.sharedWithFamily || false,
  //     parentNotification: false, // Can be configured later
  //     timestamp: Timestamp.now()
  //   };
  //   
  //   const docRef = await addDoc(moodsRef, familyMoodData);
  //   return docRef.id;
  // } else {
  //   // Fallback to individual structure
  //   return legacyDb.createMoodEntry(userId, moodData, date);
  // }
};

export const getMoodEntries = async (userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> => {
  try {
    // Skip family structure entirely for mood operations due to missing Firestore indexes
    // Use individual structure directly to avoid console warnings
    return legacyDb.getMoodEntries(userId, startDate, endDate);
    
    // TODO: Re-enable family structure after deploying composite index for memberId + date + __name__
    // const context = await getUserContext(userId);
    // if (context.familyId && context.memberId) {
    //   const moodsRef = collection(db, 'families', context.familyId, 'moods');
    //   let q = query(moodsRef, 
    //     where('memberId', '==', context.memberId),
    //     orderBy('date', 'desc')
    //   );
    //   if (startDate) {
    //     q = query(q, where('date', '>=', startDate));
    //   }
    //   if (endDate) {
    //     q = query(q, where('date', '<=', endDate));
    //   }
    //   const querySnapshot = await getDocs(q);
    //   return querySnapshot.docs.map(doc => {
    //     const data = doc.data() as FamilyMoodEntry;
    //     return {
    //       id: doc.id,
    //       date: data.date,
    //       mood: data.mood,
    //       energy: data.energy,
    //       stress: data.stress,
    //       sleep: data.sleep,
    //       notes: data.notes,
    //       timestamp: data.timestamp
    //     } as MoodEntry;
    //   });
    // } else {
    //   return legacyDb.getMoodEntries(userId, startDate, endDate);
    // }
  } catch (error) {
    console.error('Error in getMoodEntries:', error);
    // Always fall back to individual structure on error
    return legacyDb.getMoodEntries(userId, startDate, endDate);
  }
};

export const updateMoodEntry = async (userId: string, moodId: string, updates: Partial<MoodEntry>): Promise<void> => {
  // Skip family structure entirely for mood operations due to permission issues
  // Use individual structure directly to avoid permission errors
  return legacyDb.updateMoodEntry(userId, moodId, updates);
  
  // TODO: Re-enable family structure after fixing family permissions
  // const context = await getUserContext(userId);
  // if (context.familyId) {
  //   // Use family structure
  //   const moodRef = doc(db, 'families', context.familyId, 'moods', moodId);
  //   await updateDoc(moodRef, {
  //     ...updates,
  //     timestamp: Timestamp.now()
  //   });
  // } else {
  //   // Fallback to individual structure
  //   return legacyDb.updateMoodEntry(userId, moodId, updates);
  // }
};

export const deleteMoodEntry = async (userId: string, moodId: string): Promise<void> => {
  // Skip family structure entirely for mood operations due to permission issues
  // Use individual structure directly to avoid permission errors
  return legacyDb.deleteMoodEntry(userId, moodId);
  
  // TODO: Re-enable family structure after fixing family permissions
  // const context = await getUserContext(userId);
  // if (context.familyId) {
  //   // Use family structure
  //   const moodRef = doc(db, 'families', context.familyId, 'moods', moodId);
  //   await deleteDoc(moodRef);
  // } else {
  //   // Fallback to individual structure
  //   return legacyDb.deleteMoodEntry(userId, moodId);
  // }
};

export const getMoodForDate = async (userId: string, date: string): Promise<MoodEntry | null> => {
  try {
    // Skip family structure entirely for mood operations due to missing Firestore indexes
    // Use individual structure directly to avoid console warnings
    return legacyDb.getMoodForDate(userId, date);
    
    // TODO: Re-enable family structure after deploying composite index for memberId + date + __name__
    // const context = await getUserContext(userId);
    // if (context.familyId && context.memberId) {
    //   const moodsRef = collection(db, 'families', context.familyId, 'moods');
    //   const q = query(moodsRef, 
    //     where('memberId', '==', context.memberId),
    //     where('date', '==', date)
    //   );
    //   const querySnapshot = await getDocs(q);
    //   if (querySnapshot.empty) {
    //     return null;
    //   }
    //   const doc = querySnapshot.docs[0];
    //   const data = doc.data() as FamilyMoodEntry;
    //   return {
    //     id: doc.id,
    //     date: data.date,
    //     mood: data.mood,
    //     energy: data.energy,
    //     stress: data.stress,
    //     sleep: data.sleep,
    //     notes: data.notes,
    //     timestamp: data.timestamp
    //   } as MoodEntry;
    // } else {
    //   return legacyDb.getMoodForDate(userId, date);
    // }
  } catch (error) {
    console.error('Error in getMoodForDate:', error);
    return legacyDb.getMoodForDate(userId, date);
  }
};