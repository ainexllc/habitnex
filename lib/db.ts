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
import type { Habit, HabitCompletion, User, MoodEntry, CreateMoodForm } from '../types';

// User operations
export const createUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() } as User;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Habit operations
export const createHabit = async (userId: string, habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
  console.log('createHabit called with userId:', userId);
  console.log('createHabit called with habitData:', habitData);
  
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    console.log('Created habits collection reference');
    
    const dataToWrite = {
      ...habitData,
      isArchived: false, // Ensure this field is always set
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('Data to write to Firestore:', dataToWrite);
    
    const docRef = await addDoc(habitsRef, dataToWrite);
    console.log('Document written with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error in createHabit:', error);
    throw error;
  }
};

export const getUserHabits = async (userId: string) => {
  console.log('getUserHabits called for userId:', userId);
  
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    const q = query(habitsRef, where('isArchived', '==', false), orderBy('createdAt', 'desc'));
    
    console.log('Executing habits query...');
    const querySnapshot = await getDocs(q);
    
    console.log('Query returned', querySnapshot.size, 'documents');
    
    const habits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
    
    console.log('Parsed habits:', habits);
    return habits;
  } catch (error) {
    console.error('Error in getUserHabits:', error);
    throw error;
  }
};

export const updateHabit = async (userId: string, habitId: string, updates: Partial<Habit>) => {
  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteHabit = async (userId: string, habitId: string) => {
  try {
    const habitRef = doc(db, 'users', userId, 'habits', habitId);
    await deleteDoc(habitRef);
  } catch (error) {
    throw error;
  }
};

// Completion operations
export const addCompletion = async (userId: string, completion: Omit<HabitCompletion, 'id' | 'timestamp'>) => {
  try {
    const completionsRef = collection(db, 'users', userId, 'completions');
    const docRef = await addDoc(completionsRef, {
      ...completion,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getCompletions = async (userId: string, habitId?: string, startDate?: string, endDate?: string) => {
  try {
    const completionsRef = collection(db, 'users', userId, 'completions');
    let q = query(completionsRef, orderBy('date', 'desc'));

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
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as HabitCompletion[];
  } catch (error) {
    throw error;
  }
};

export const updateCompletion = async (userId: string, completionId: string, updates: Partial<HabitCompletion>) => {
  try {
    const completionRef = doc(db, 'users', userId, 'completions', completionId);
    await updateDoc(completionRef, updates);
  } catch (error) {
    throw error;
  }
};

export const toggleHabitCompletion = async (userId: string, habitId: string, date: string, completed: boolean, notes?: string) => {
  try {
    const completionsRef = collection(db, 'users', userId, 'completions');
    const q = query(completionsRef, where('habitId', '==', habitId), where('date', '==', date));
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
      await updateCompletion(userId, existingDoc.id, { completed, notes });
    }
  } catch (error) {
    throw error;
  }
};

// Mood tracking operations
export const createMoodEntry = async (userId: string, moodData: CreateMoodForm, date: string) => {
  console.log('createMoodEntry called with userId:', userId);
  console.log('createMoodEntry called with moodData:', moodData);
  
  try {
    const moodRef = collection(db, 'users', userId, 'moods');
    console.log('Created moods collection reference');
    
    const dataToWrite = {
      ...moodData,
      date,
      timestamp: Timestamp.now()
    };
    
    console.log('Data to write to Firestore:', dataToWrite);
    
    const docRef = await addDoc(moodRef, dataToWrite);
    console.log('Mood entry written with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('Error in createMoodEntry:', error);
    throw error;
  }
};

export const getMoodEntries = async (userId: string, startDate?: string, endDate?: string) => {
  console.log('getMoodEntries called for userId:', userId);
  
  try {
    const moodRef = collection(db, 'users', userId, 'moods');
    let q = query(moodRef, orderBy('date', 'desc'));

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    console.log('Executing mood query...');
    const querySnapshot = await getDocs(q);
    
    console.log('Query returned', querySnapshot.size, 'mood entries');
    
    const moods = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MoodEntry[];
    
    console.log('Parsed mood entries:', moods);
    return moods;
  } catch (error) {
    console.error('Error in getMoodEntries:', error);
    throw error;
  }
};

export const updateMoodEntry = async (userId: string, moodId: string, updates: Partial<MoodEntry>) => {
  try {
    const moodRef = doc(db, 'users', userId, 'moods', moodId);
    await updateDoc(moodRef, {
      ...updates,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating mood entry:', error);
    throw error;
  }
};

export const deleteMoodEntry = async (userId: string, moodId: string) => {
  try {
    const moodRef = doc(db, 'users', userId, 'moods', moodId);
    await deleteDoc(moodRef);
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
};

export const getMoodForDate = async (userId: string, date: string): Promise<MoodEntry | null> => {
  try {
    const moodRef = collection(db, 'users', userId, 'moods');
    const q = query(moodRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as MoodEntry;
  } catch (error) {
    console.error('Error getting mood for date:', error);
    throw error;
  }
};