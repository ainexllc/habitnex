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
import { ensurePersonalFamily } from './personalFamilyMigration';
import { getUserFamilies, getFamily } from './familyDb';
import type { Habit, HabitCompletion, User, MoodEntry, CreateMoodForm } from '../types';
import type { FamilyHabit, FamilyHabitCompletion, FamilyMoodEntry } from '../types/family';

// Legacy imports for fallback
import * as legacyDb from './db';

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

/**
 * Get user's active context (personal family or selected family)
 */
export const getUserContext = async (userId: string): Promise<UnifiedContext> => {
  try {
    // First, try to get user's families
    const userFamilies = await getUserFamilies(userId);
    
    if (userFamilies.length === 0) {
      // No families found, ensure personal family exists
      const personalFamilyId = await ensurePersonalFamily(userId);
      
      if (personalFamilyId) {
        return {
          userId,
          familyId: personalFamilyId,
          memberId: userId,
          isPersonalFamily: true
        };
      }
      
      // Fallback to individual mode
      return {
        userId,
        familyId: null,
        memberId: null,
        isPersonalFamily: false
      };
    }
    
    // Check localStorage for last selected family
    const lastFamilyId = localStorage.getItem(`lastFamily_${userId}`);
    let selectedFamily = userFamilies.find(f => f.familyId === lastFamilyId);
    
    if (!selectedFamily) {
      // Default to first family (likely personal family)
      selectedFamily = userFamilies[0];
    }
    
    // Check if this is a personal family
    const family = await getFamily(selectedFamily.familyId);
    const isPersonalFamily = family?.isPersonal || false;
    
    return {
      userId,
      familyId: selectedFamily.familyId,
      memberId: selectedFamily.member.id,
      isPersonalFamily
    };
    
  } catch (error) {
    console.error('Failed to get user context:', error);
    // Fallback to individual mode
    return {
      userId,
      familyId: null,
      memberId: null,
      isPersonalFamily: false
    };
  }
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
      ...habitData,
      familyId: context.familyId,
      createdBy: context.memberId,
      assignedMembers: [context.memberId],
      isActive: true,
      isArchived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      milestoneRewards: [],
      linkedRewards: []
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
        title: data.title,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        targetDays: data.targetDays,
        completionGoal: data.completionGoal,
        color: data.color,
        icon: data.icon,
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
    
    // Convert individual habit updates to family habit format
    const familyUpdates = {
      ...updates,
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
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure - check if mood already exists for this member/date
    const moodsRef = collection(db, 'families', context.familyId, 'moods');
    const q = query(moodsRef, 
      where('memberId', '==', context.memberId),
      where('date', '==', date)
    );
    const existingSnapshot = await getDocs(q);
    
    if (!existingSnapshot.empty) {
      throw new Error('A mood entry already exists for this date. You can only add one mood per day.');
    }
    
    const familyMoodData: Omit<FamilyMoodEntry, 'id'> = {
      ...moodData,
      familyId: context.familyId,
      memberId: context.memberId,
      date,
      sharedWithFamily: context.isPersonalFamily ? false : moodData.sharedWithFamily || false,
      parentNotification: false, // Can be configured later
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(moodsRef, familyMoodData);
    return docRef.id;
  } else {
    // Fallback to individual structure
    return legacyDb.createMoodEntry(userId, moodData, date);
  }
};

export const getMoodEntries = async (userId: string, startDate?: string, endDate?: string): Promise<MoodEntry[]> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const moodsRef = collection(db, 'families', context.familyId, 'moods');
    let q = query(moodsRef, 
      where('memberId', '==', context.memberId),
      orderBy('date', 'desc')
    );

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FamilyMoodEntry;
      // Convert to individual mood format for compatibility
      return {
        id: doc.id,
        date: data.date,
        mood: data.mood,
        energy: data.energy,
        stress: data.stress,
        sleep: data.sleep,
        notes: data.notes,
        timestamp: data.timestamp
      } as MoodEntry;
    });
  } else {
    // Fallback to individual structure
    return legacyDb.getMoodEntries(userId, startDate, endDate);
  }
};

export const updateMoodEntry = async (userId: string, moodId: string, updates: Partial<MoodEntry>): Promise<void> => {
  const context = await getUserContext(userId);
  
  if (context.familyId) {
    // Use family structure
    const moodRef = doc(db, 'families', context.familyId, 'moods', moodId);
    await updateDoc(moodRef, {
      ...updates,
      timestamp: Timestamp.now()
    });
  } else {
    // Fallback to individual structure
    return legacyDb.updateMoodEntry(userId, moodId, updates);
  }
};

export const deleteMoodEntry = async (userId: string, moodId: string): Promise<void> => {
  const context = await getUserContext(userId);
  
  if (context.familyId) {
    // Use family structure
    const moodRef = doc(db, 'families', context.familyId, 'moods', moodId);
    await deleteDoc(moodRef);
  } else {
    // Fallback to individual structure
    return legacyDb.deleteMoodEntry(userId, moodId);
  }
};

export const getMoodForDate = async (userId: string, date: string): Promise<MoodEntry | null> => {
  const context = await getUserContext(userId);
  
  if (context.familyId && context.memberId) {
    // Use family structure
    const moodsRef = collection(db, 'families', context.familyId, 'moods');
    const q = query(moodsRef, 
      where('memberId', '==', context.memberId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const data = doc.data() as FamilyMoodEntry;
    
    return {
      id: doc.id,
      date: data.date,
      mood: data.mood,
      energy: data.energy,
      stress: data.stress,
      sleep: data.sleep,
      notes: data.notes,
      timestamp: data.timestamp
    } as MoodEntry;
  } else {
    // Fallback to individual structure
    return legacyDb.getMoodForDate(userId, date);
  }
};