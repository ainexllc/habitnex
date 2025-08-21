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
  try {
    const habitsRef = collection(db, 'users', userId, 'habits');
    
    const dataToWrite = {
      ...habitData,
      isArchived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(habitsRef, dataToWrite);
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
    
    const habits = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Habit[];
    
    return habits;
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

// Mood tracking operations
export const createMoodEntry = async (userId: string, moodData: CreateMoodForm, date: string) => {
  try {
    // Check if a mood already exists for this date
    const existingMood = await getMoodForDate(userId, date);
    if (existingMood) {
      throw new Error('A mood entry already exists for this date. You can only add one mood per day.');
    }

    const moodRef = collection(db, 'users', userId, 'moods');
    
    const dataToWrite = {
      ...moodData,
      date,
      timestamp: Timestamp.now()
    };
    
    const docRef = await addDoc(moodRef, dataToWrite);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getMoodEntries = async (userId: string, startDate?: string, endDate?: string) => {
  try {
    const moodRef = collection(db, 'users', userId, 'moods');
    let q = query(moodRef, orderBy('date', 'desc'));

    if (startDate) {
      q = query(q, where('date', '>=', startDate));
    }
    if (endDate) {
      q = query(q, where('date', '<=', endDate));
    }

    const querySnapshot = await getDocs(q);
    
    const moods = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MoodEntry[];
    
    return moods;
  } catch (error) {
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
    throw error;
  }
};

export const deleteMoodEntry = async (userId: string, moodId: string) => {
  try {
    const moodRef = doc(db, 'users', userId, 'moods', moodId);
    await deleteDoc(moodRef);
  } catch (error) {
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
    throw error;
  }
};

// Mood-Habit Correlation Analysis
export const getMoodHabitCorrelation = async (userId: string, startDate?: string, endDate?: string) => {
  try {
    const [moods, completions] = await Promise.all([
      getMoodEntries(userId, startDate, endDate),
      getCompletions(userId, undefined, startDate, endDate)
    ]);

    // Group completions by date
    const completionsByDate = completions.reduce((acc, completion) => {
      if (!acc[completion.date]) {
        acc[completion.date] = [];
      }
      acc[completion.date].push(completion);
      return acc;
    }, {} as Record<string, HabitCompletion[]>);

    // Calculate correlation data
    const correlationData = moods.map(mood => {
      const dayCompletions = completionsByDate[mood.date] || [];
      const completedHabits = dayCompletions.filter(c => c.completed).length;
      const totalHabits = dayCompletions.length;
      const completionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;

      return {
        date: mood.date,
        mood: mood.mood,
        energy: mood.energy,
        stress: mood.stress,
        sleep: mood.sleep,
        completionRate,
        completedHabits,
        totalHabits,
        moodScore: (mood.mood + mood.energy + (6 - mood.stress) + mood.sleep) / 4 // Composite score
      };
    });

    return correlationData;
  } catch (error) {
    throw error;
  }
};

export const getHabitMoodImpact = async (userId: string, habitId: string, days: number = 30) => {
  try {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [completions, moods] = await Promise.all([
      getCompletions(userId, habitId, startDate, endDate),
      getMoodEntries(userId, startDate, endDate)
    ]);

    // Group data by completion status
    const moodsByDate = moods.reduce((acc, mood) => {
      acc[mood.date] = mood;
      return acc;
    }, {} as Record<string, MoodEntry>);

    const completedDays: number[] = [];
    const notCompletedDays: number[] = [];

    completions.forEach(completion => {
      const mood = moodsByDate[completion.date];
      if (mood) {
        const moodScore = (mood.mood + mood.energy + (6 - mood.stress) + mood.sleep) / 4;
        if (completion.completed) {
          completedDays.push(moodScore);
        } else {
          notCompletedDays.push(moodScore);
        }
      }
    });

    const avgMoodCompleted = completedDays.length > 0 
      ? completedDays.reduce((sum, score) => sum + score, 0) / completedDays.length 
      : 0;
    
    const avgMoodNotCompleted = notCompletedDays.length > 0 
      ? notCompletedDays.reduce((sum, score) => sum + score, 0) / notCompletedDays.length 
      : 0;

    return {
      habitId,
      avgMoodCompleted,
      avgMoodNotCompleted,
      moodDifference: avgMoodCompleted - avgMoodNotCompleted,
      completedDaysCount: completedDays.length,
      notCompletedDaysCount: notCompletedDays.length,
      totalDaysWithData: completedDays.length + notCompletedDays.length
    };
  } catch (error) {
    throw error;
  }
};