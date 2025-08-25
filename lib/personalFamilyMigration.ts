import { 
  collection, 
  doc, 
  addDoc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { getUserProfile, getUserHabits, getCompletions, getMoodEntries } from './db';
import { createFamily, addDirectFamilyMember } from './familyDb';
import type { User, Habit, HabitCompletion, MoodEntry } from '../types';

export interface PersonalFamilyMigrationResult {
  familyId: string;
  memberId: string;
  migratedData: {
    habits: number;
    completions: number;
    moods: number;
  };
  success: boolean;
  error?: string;
}

/**
 * Creates a personal family for a solo user and migrates their existing data
 */
export const createPersonalFamily = async (
  userId: string, 
  userProfile: User
): Promise<PersonalFamilyMigrationResult> => {
  try {
    // Check if user already has a personal family
    const existingFamily = await checkForPersonalFamily(userId);
    if (existingFamily) {
      return {
        familyId: existingFamily.familyId,
        memberId: existingFamily.memberId,
        migratedData: { habits: 0, completions: 0, moods: 0 },
        success: true
      };
    }

    // Create personal family
    const familyId = await createFamily(userId, {
      name: `${userProfile.displayName || 'My'} Personal`,
      description: 'Personal habit tracking family',
      isPersonal: true,
      settings: {
        allowPublicJoining: false,
        requireApprovalToJoin: true,
        maxMembers: 1,
        challengesEnabled: false,
        rewardsEnabled: false,
        moodSharingEnabled: false
      },
      creatorProfile: {
        name: userProfile.displayName || 'User',
        displayName: userProfile.displayName || 'Me',
        avatar: userProfile.avatar || '👤',
        color: '#3B82F6',
        role: 'parent' as const,
        birthYear: userProfile.birthYear,
        motivationStyle: 'progress' as const
      }
    });

    // Get the auto-created member ID (should be the userId)
    const memberId = userId;

    // Migrate existing data from individual collections
    const migratedData = await migrateUserDataToFamily(userId, familyId, memberId);

    return {
      familyId,
      memberId,
      migratedData,
      success: true
    };

  } catch (error) {
    console.error('Failed to create personal family:', error);
    return {
      familyId: '',
      memberId: '',
      migratedData: { habits: 0, completions: 0, moods: 0 },
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Migrates user's individual data to their personal family structure
 */
const migrateUserDataToFamily = async (
  userId: string, 
  familyId: string, 
  memberId: string
): Promise<{ habits: number; completions: number; moods: number }> => {
  const batch = writeBatch(db);
  let habitCount = 0;
  let completionCount = 0;
  let moodCount = 0;

  try {
    // Migrate habits
    const habits = await getUserHabits(userId);
    for (const habit of habits) {
      const familyHabitRef = doc(collection(db, 'families', familyId, 'habits'));
      const familyHabitData = {
        ...habit,
        createdBy: memberId,
        familyId: familyId,
        assignedMembers: [memberId],
        isPersonal: true,
        originalId: habit.id, // Keep reference to original
        migratedAt: Timestamp.now()
      };
      delete familyHabitData.id; // Remove the old ID
      batch.set(familyHabitRef, familyHabitData);
      habitCount++;
    }

    // Migrate completions
    const completions = await getCompletions(userId);
    for (const completion of completions) {
      const familyCompletionRef = doc(collection(db, 'families', familyId, 'completions'));
      const familyCompletionData = {
        ...completion,
        memberId: memberId,
        familyId: familyId,
        originalId: completion.id,
        migratedAt: Timestamp.now()
      };
      delete familyCompletionData.id;
      batch.set(familyCompletionRef, familyCompletionData);
      completionCount++;
    }

    // Migrate moods
    const moods = await getMoodEntries(userId);
    for (const mood of moods) {
      const familyMoodRef = doc(collection(db, 'families', familyId, 'moods'));
      const familyMoodData = {
        ...mood,
        memberId: memberId,
        familyId: familyId,
        sharedWithFamily: false, // Personal moods are private by default
        originalId: mood.id,
        migratedAt: Timestamp.now()
      };
      delete familyMoodData.id;
      batch.set(familyMoodRef, familyMoodData);
      moodCount++;
    }

    // Commit all migrations
    await batch.commit();

    console.log(`Migrated data for user ${userId}: ${habitCount} habits, ${completionCount} completions, ${moodCount} moods`);
    
    return { habits: habitCount, completions: completionCount, moods: moodCount };

  } catch (error) {
    console.error('Failed to migrate user data:', error);
    throw error;
  }
};

/**
 * Checks if a user already has a personal family
 */
export const checkForPersonalFamily = async (userId: string): Promise<{ familyId: string; memberId: string } | null> => {
  try {
    // Look for families where the user is a member and isPersonal = true
    const familiesSnapshot = await getDocs(collection(db, 'families'));
    
    for (const familyDoc of familiesSnapshot.docs) {
      const familyData = familyDoc.data();
      
      // Check if this is a personal family
      if (familyData.isPersonal) {
        // Check if user is a member
        const memberDoc = await getDoc(doc(db, 'families', familyDoc.id, 'members', userId));
        if (memberDoc.exists() && memberDoc.data().isActive) {
          return {
            familyId: familyDoc.id,
            memberId: userId
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to check for personal family:', error);
    return null;
  }
};

/**
 * Auto-migration hook - creates personal family when user logs in if they don't have one
 */
export const ensurePersonalFamily = async (userId: string): Promise<string | null> => {
  try {
    // Check if user already has a personal family
    const existingFamily = await checkForPersonalFamily(userId);
    if (existingFamily) {
      return existingFamily.familyId;
    }

    // Get user profile
    const userProfile = await getUserProfile(userId);
    if (!userProfile) {
      console.warn('No user profile found for', userId);
      return null;
    }

    // Create personal family and migrate data
    const result = await createPersonalFamily(userId, userProfile);
    
    if (result.success) {
      console.log(`Created personal family for user ${userId}:`, result);
      return result.familyId;
    } else {
      console.error('Failed to create personal family:', result.error);
      return null;
    }

  } catch (error) {
    console.error('Error ensuring personal family:', error);
    return null;
  }
};

/**
 * Batch migration utility for existing users
 */
export const migrateAllUsers = async (): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: PersonalFamilyMigrationResult[];
}> => {
  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(db, 'users'));
    const results: PersonalFamilyMigrationResult[] = [];
    
    let successful = 0;
    let failed = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data() as User;
      
      try {
        const result = await createPersonalFamily(userId, userData);
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
        
        // Add delay to avoid overwhelming Firestore
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        failed++;
        results.push({
          familyId: '',
          memberId: '',
          migratedData: { habits: 0, completions: 0, moods: 0 },
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`Migration complete: ${successful} successful, ${failed} failed out of ${usersSnapshot.docs.length} total`);
    
    return {
      total: usersSnapshot.docs.length,
      successful,
      failed,
      results
    };
    
  } catch (error) {
    console.error('Failed to migrate all users:', error);
    throw error;
  }
};