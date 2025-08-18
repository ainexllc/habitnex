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
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Habit, HabitCompletion, User } from '../types';

// User operations
export const createUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
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
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    const docRef = await addDoc(habitsRef, {
      ...habitData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getUserHabits = async (userId: string) => {
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    const q = query(habitsRef, where('isArchived', '==', false), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
  } catch (error) {
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