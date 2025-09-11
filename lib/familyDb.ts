import {
  collection,
  collectionGroup,
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
  setDoc,
  onSnapshot,
  Unsubscribe,
  limit
} from 'firebase/firestore';
import { db } from './firebase';
import { getTodayDateString } from './utils';
import type {
  Family,
  FamilyMember,
  FamilySettings,
  FamilyHabit,
  FamilyHabitCompletion,
  FamilyMoodEntry,
  Reward,
  RewardRedemption,
  FamilyChallenge,
  CreateFamilyRequest,
  JoinFamilyRequest,
  CreateFamilyHabitRequest,
  CreateRewardRequest,
  FamilyDashboardData
} from '../types/family';

// Get families that a user is a member of (simplified approach to avoid data pollution)
export const getUserFamilies = async (userId: string): Promise<Array<{ familyId: string; familyName: string; member: FamilyMember }>> => {
  try {
    console.log('🔍 Searching for families where user is a member:', userId);
    
    // First, check if user has any families at all by querying user document
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.log('📊 User document does not exist, no families');
      return [];
    }
    
    // Get families with reasonable limit to prevent data pollution
    const familiesQuery = query(
      collection(db, 'families'),
      where('isActive', '==', true),
      limit(20) // Reasonable limit - most users should have < 20 families
    );
    
    const familiesSnapshot = await getDocs(familiesQuery);
    console.log(`📊 Checking ${familiesSnapshot.size} active families for membership`);
    
    // Check membership in parallel, but only for reasonable number of families
    const membershipChecks = familiesSnapshot.docs.map(async (familyDoc) => {
      const familyData = familyDoc.data();
      
      try {
        // Check if user is a member of this family
        const memberDoc = await getDoc(doc(db, 'families', familyDoc.id, 'members', userId));
        
        if (memberDoc.exists()) {
          const memberData = memberDoc.data() as Omit<FamilyMember, 'id'>;
          
          // Only include active members
          if (memberData.isActive) {
            return {
              familyId: familyDoc.id,
              familyName: familyData.name,
              member: {
                id: memberDoc.id,
                ...memberData
              }
            };
          }
        }
      } catch (err) {
        // Skip families with access issues
        console.warn(`Cannot access family ${familyDoc.id}:`, err.message);
      }
      return null;
    });
    
    const results = await Promise.all(membershipChecks);
    const validFamilies = results.filter(family => family !== null);
    
    console.log(`✅ User is member of ${validFamilies.length} families`);
    return validFamilies;
    
  } catch (error) {
    console.error('Error getting user families:', error);
    return [];
  }
};

// Family Operations
export const createFamily = async (creatorUserId: string, request: CreateFamilyRequest): Promise<string> => {
  try {
    const batch = writeBatch(db);
    
    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Create family document
    const familyRef = doc(collection(db, 'families'));
    const familyData: Omit<Family, 'id' | 'members'> = {
      name: request.name,
      createdBy: creatorUserId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      inviteCode,
      isActive: true,
      isPersonal: request.isPersonal || false,
      settings: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekStartsOn: 1, // Monday
        theme: 'light',
        avatarStyle: 'personas', // Default to personas for new families
        touchScreenMode: false,
        voiceFeedback: false,
        autoTimeout: 5,
        notifications: {
          dailyReminders: true,
          weeklyReports: true,
          rewardAlerts: true
        },
        display: {
          showAllMembers: true,
          compactMode: false,
          animationSpeed: 'normal'
        },
        ...request.settings
      },
      members: [] // Will be populated by subcollection
    };
    
    batch.set(familyRef, familyData);
    
    // Create creator as first family member (parent)
    const memberRef = doc(collection(familyRef, 'members'), creatorUserId);
    const creatorProfile = request.creatorProfile;
    const memberData: Omit<FamilyMember, 'id'> = {
      familyId: familyRef.id,
      userId: creatorUserId,
      name: creatorProfile?.name || 'Family Admin',
      displayName: creatorProfile?.displayName || 'Admin',
      avatar: creatorProfile?.avatar || '👨‍💼',
      avatarStyle: creatorProfile?.avatarStyle || request.settings?.avatarStyle || 'personas',
      avatarSeed: creatorProfile?.avatarSeed || null,
      color: creatorProfile?.color || '#3B82F6',
      role: creatorProfile?.role || 'parent',
      birthYear: creatorProfile?.birthYear || null,
      isActive: true,
      joinedAt: Timestamp.now(),
      preferences: {
        favoriteEmojis: ['⭐', '🎉', '💪'],
        difficulty: 'normal',
        motivationStyle: creatorProfile?.motivationStyle || 'progress'
      },
      stats: {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        habitsCompleted: 0,
        rewardsEarned: 0,
        level: 1,
        badges: [],
        lastActive: Timestamp.now()
      }
    };
    
    batch.set(memberRef, memberData);
    
    await batch.commit();
    return familyRef.id;
  } catch (error) {
    throw error;
  }
};

export const joinFamily = async (userId: string, request: JoinFamilyRequest): Promise<string> => {
  try {
    // Find family by invite code
    const familiesRef = collection(db, 'families');
    const q = query(familiesRef, where('inviteCode', '==', request.inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid invite code');
    }
    
    const familyDoc = querySnapshot.docs[0];
    const familyId = familyDoc.id;
    
    // Check if user is already a member
    const memberRef = doc(db, 'families', familyId, 'members', userId);
    const existingMember = await getDoc(memberRef);
    
    if (existingMember.exists()) {
      throw new Error('You are already a member of this family');
    }
    
    // Add user as family member
    const memberData: Omit<FamilyMember, 'id'> = {
      familyId,
      userId,
      name: request.memberInfo.name,
      displayName: request.memberInfo.displayName,
      avatar: request.memberInfo.avatar,
      avatarStyle: request.memberInfo.avatarStyle || 'personas',
      avatarSeed: request.memberInfo.avatarSeed || null,
      color: request.memberInfo.color,
      role: request.memberInfo.role,
      birthYear: request.memberInfo.birthYear || null,
      isActive: true,
      joinedAt: Timestamp.now(),
      preferences: {
        favoriteEmojis: ['😊', '🌟', '🚀'],
        difficulty: 'normal',
        motivationStyle: 'rewards'
      },
      stats: {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        habitsCompleted: 0,
        rewardsEarned: 0,
        level: 1,
        badges: [],
        lastActive: Timestamp.now()
      }
    };
    
    await setDoc(memberRef, memberData);
    return familyId;
  } catch (error) {
    throw error;
  }
};

export const getFamily = async (familyId: string): Promise<Family | null> => {
  try {
    const familyRef = doc(db, 'families', familyId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return null;
    }
    
    // Get family members
    const membersRef = collection(db, 'families', familyId, 'members');
    const membersQuery = query(membersRef, where('isActive', '==', true), orderBy('joinedAt', 'asc'));
    const membersSnap = await getDocs(membersQuery);
    
    const members = membersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyMember[];
    
    return {
      id: familySnap.id,
      ...familySnap.data(),
      members
    } as Family;
  } catch (error) {
    throw error;
  }
};

export const updateFamilySettings = async (familyId: string, settings: Partial<FamilySettings>) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      'settings': settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const updateFamilyName = async (familyId: string, name: string) => {
  try {
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      name: name,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

// Family Member Operations
export const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
  try {
    const membersRef = collection(db, 'families', familyId, 'members');
    const q = query(membersRef, where('isActive', '==', true), orderBy('joinedAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyMember[];
  } catch (error) {
    throw error;
  }
};

export const updateFamilyMember = async (familyId: string, memberId: string, updates: Partial<FamilyMember>) => {
  try {
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    await updateDoc(memberRef, updates);
  } catch (error) {
    throw error;
  }
};

export const addDirectFamilyMember = async (
  familyId: string,
  createdBy: string,
  memberInfo: {
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
  }
): Promise<string> => {
  try {
    console.log('addDirectFamilyMember called with:', { familyId, createdBy, memberInfo });
    
    // Verify that the person adding the member is a parent/admin
    const creatorRef = doc(db, 'families', familyId, 'members', createdBy);
    const creatorDoc = await getDoc(creatorRef);
    console.log('Creator doc exists:', creatorDoc.exists());
    
    if (!creatorDoc.exists()) {
      throw new Error('You must be a family member to add others');
    }
    
    const creator = creatorDoc.data() as FamilyMember;
    console.log('Creator role:', creator.role);
    if (creator.role !== 'parent' && creator.role !== 'adult') {
      throw new Error('Only parents and adults can add family members directly');
    }
    
    // Create new member document with auto-generated ID
    const membersRef = collection(db, 'families', familyId, 'members');
    
    const memberData: any = {
      familyId,
      // Don't include userId field at all for direct members
      name: memberInfo.name.trim(),
      displayName: memberInfo.displayName.trim(),
      avatarSeed: memberInfo.avatarSeed || `${memberInfo.displayName.trim()}-${Date.now()}`,
      color: memberInfo.color,
      role: memberInfo.role,
      ...(memberInfo.birthYear && { birthYear: memberInfo.birthYear }),
      isActive: true,
      joinedAt: Timestamp.now(),

      // Handle avatar configuration - prefer full avatarConfig if provided
      ...(memberInfo.avatarConfig ? {
        avatarConfig: memberInfo.avatarConfig
      } : (memberInfo.avatarSkinColor || memberInfo.avatarMouth || memberInfo.avatarHairStyle || memberInfo.avatarHairColor || 
          memberInfo.hairProbability !== undefined || memberInfo.glassesProbability !== undefined ||
          memberInfo.featuresProbability !== undefined || memberInfo.earringsProbability !== undefined ? {
        avatarConfig: {
          ...(memberInfo.avatarSkinColor && { skinColor: memberInfo.avatarSkinColor }),
          ...(memberInfo.avatarMouth && { mouthType: memberInfo.avatarMouth }),
          ...(memberInfo.avatarHairStyle && { 
            hair: memberInfo.avatarHairStyle,  // For adventurer style
            topType: memberInfo.avatarHairStyle  // Keep for backwards compatibility
          }),
          ...(memberInfo.avatarHairColor && { hairColor: memberInfo.avatarHairColor }),
          ...(memberInfo.hairProbability !== undefined && { hairProbability: memberInfo.hairProbability }),
          ...(memberInfo.glassesProbability !== undefined && { glassesProbability: memberInfo.glassesProbability }),
          ...(memberInfo.featuresProbability !== undefined && { featuresProbability: memberInfo.featuresProbability }),
          ...(memberInfo.earringsProbability !== undefined && { earringsProbability: memberInfo.earringsProbability }),
        }
      } : {})),
      preferences: {
        favoriteEmojis: [],
        difficulty: 'normal',
        motivationStyle: memberInfo.motivationStyle || 'rewards'
      },
      stats: {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        habitsCompleted: 0,
        rewardsEarned: 0,
        level: 1,
        badges: [],
        lastActive: Timestamp.now()
      }
    };
    
    const docRef = await addDoc(membersRef, memberData);
    console.log('Member created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating family member:', error);
    throw error;
  }
};

// Update family member
export const updateFamilyMemberInDb = async (
  familyId: string,
  memberId: string,
  updates: {
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
  }
): Promise<void> => {
  try {
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
    if (updates.profileImageUrl !== undefined) updateData.profileImageUrl = updates.profileImageUrl;  // Added for new profile image system
    if (updates.avatarSeed !== undefined) updateData.avatarSeed = updates.avatarSeed;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.role !== undefined) updateData.role = updates.role;

    // Handle avatar configuration - save all avatar options in avatarConfig
    // Prefer full avatarConfig if provided by UI
    if ((updates as any).avatarConfig) {
      updateData.avatarConfig = (updates as any).avatarConfig;
    } else if (updates.avatarSkinColor !== undefined || updates.avatarMouth !== undefined || 
        updates.avatarHairStyle !== undefined || updates.avatarHairColor !== undefined || updates.hairProbability !== undefined ||
        updates.glassesProbability !== undefined || updates.featuresProbability !== undefined ||
        updates.earringsProbability !== undefined) {
      updateData.avatarConfig = {};
      if (updates.avatarSkinColor !== undefined) {
        updateData.avatarConfig.skinColor = updates.avatarSkinColor;
      }
      if (updates.avatarMouth !== undefined) {
        updateData.avatarConfig.mouthType = updates.avatarMouth;
      }
      if (updates.avatarHairStyle !== undefined) {
        updateData.avatarConfig.hair = updates.avatarHairStyle;
        updateData.avatarConfig.topType = updates.avatarHairStyle;
      }
      if (updates.avatarHairColor !== undefined) {
        updateData.avatarConfig.hairColor = updates.avatarHairColor;
      }
      if (updates.hairProbability !== undefined) {
        updateData.avatarConfig.hairProbability = updates.hairProbability;
      }
      if (updates.glassesProbability !== undefined) {
        updateData.avatarConfig.glassesProbability = updates.glassesProbability;
      }
      if (updates.featuresProbability !== undefined) {
        updateData.avatarConfig.featuresProbability = updates.featuresProbability;
      }
      if (updates.earringsProbability !== undefined) {
        updateData.avatarConfig.earringsProbability = updates.earringsProbability;
      }
    }
    
    // Debug logging
    console.log('🗄️ Database updating member:', { 
      memberId, 
      updateData, 
      hasProfileImageUrl: !!updateData.profileImageUrl 
    });
    
    await updateDoc(memberRef, updateData);
    console.log('Member updated successfully:', memberId);
  } catch (error) {
    console.error('Error updating family member:', error);
    throw error;
  }
};

// Update family settings
export const updateFamilySettingsInDb = async (
  familyId: string,
  settings: Partial<FamilySettings>
): Promise<void> => {
  try {
    const familyRef = doc(db, 'families', familyId);
    
    // First get current family to merge settings
    const familyDoc = await getDoc(familyRef);
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const currentFamily = familyDoc.data() as Family;
    const mergedSettings = {
      ...currentFamily.settings,
      ...settings
    };
    
    // Update with merged settings
    await updateDoc(familyRef, {
      settings: mergedSettings,
      updatedAt: Timestamp.now()
    });
    
    console.log('Family settings updated successfully:', familyId);
  } catch (error) {
    console.error('Error updating family settings:', error);
    throw error;
  }
};

// Family Habit Operations
export const createFamilyHabit = async (request: CreateFamilyHabitRequest): Promise<string> => {
  try {
    const habitsRef = collection(db, 'families', request.familyId, 'habits');
    
    const habitData: Omit<FamilyHabit, 'id'> = {
      ...request.habit,
      familyId: request.familyId,
      isActive: true,
      isArchived: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      milestoneRewards: request.habit.milestoneRewards || [],
      linkedRewards: request.habit.linkedRewards || []
    };
    
    const docRef = await addDoc(habitsRef, habitData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getFamilyHabits = async (familyId: string, memberId?: string): Promise<FamilyHabit[]> => {
  try {
    const habitsRef = collection(db, 'families', familyId, 'habits');
    let q = query(habitsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    
    if (memberId) {
      q = query(q, where('assignedMembers', 'array-contains', memberId));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyHabit[];
  } catch (error) {
    throw error;
  }
};

export const updateFamilyHabit = async (familyId: string, habitId: string, updates: Partial<FamilyHabit>) => {
  try {
    const habitRef = doc(db, 'families', familyId, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteFamilyHabit = async (familyId: string, habitId: string): Promise<void> => {
  try {
    const habitRef = doc(db, 'families', familyId, 'habits', habitId);
    // Soft delete by setting isActive to false to preserve completion history
    await updateDoc(habitRef, {
      isActive: false,
      isArchived: true,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

// Family Completion Operations
export const addFamilyCompletion = async (
  familyId: string,
  completion: Omit<FamilyHabitCompletion, 'id' | 'timestamp' | 'encouragements'>
): Promise<string> => {
  try {
    const completionsRef = collection(db, 'families', familyId, 'completions');
    const completionData = {
      ...completion,
      timestamp: Timestamp.now(),
      encouragements: []
    };
    
    const docRef = await addDoc(completionsRef, completionData);
    
    // Update member stats if completed
    if (completion.completed) {
      await updateMemberStats(familyId, completion.memberId, {
        pointsEarned: completion.pointsEarned,
        habitCompleted: true,
        streakCount: completion.streakCount
      });
    }
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getFamilyCompletions = async (
  familyId: string,
  options: {
    memberId?: string;
    habitId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<FamilyHabitCompletion[]> => {
  try {
    const completionsRef = collection(db, 'families', familyId, 'completions');
    let q = query(completionsRef, orderBy('date', 'desc'));
    
    if (options.memberId) {
      q = query(q, where('memberId', '==', options.memberId));
    }
    if (options.habitId) {
      q = query(q, where('habitId', '==', options.habitId));
    }
    if (options.startDate) {
      q = query(q, where('date', '>=', options.startDate));
    }
    if (options.endDate) {
      q = query(q, where('date', '<=', options.endDate));
    }
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyHabitCompletion[];
  } catch (error) {
    throw error;
  }
};

export const toggleFamilyHabitCompletion = async (
  familyId: string,
  habitId: string,
  memberId: string,
  date: string,
  completed: boolean,
  notes?: string
): Promise<void> => {
  try {
    const completionsRef = collection(db, 'families', familyId, 'completions');
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('memberId', '==', memberId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    // Get habit details for points calculation
    const habitRef = doc(db, 'families', familyId, 'habits', habitId);
    const habitSnap = await getDoc(habitRef);
    const habit = habitSnap.data() as FamilyHabit;
    
    if (querySnapshot.empty) {
      // Create new completion only if marking as completed
      if (completed) {
        await addFamilyCompletion(familyId, {
          familyId,
          habitId,
          memberId,
          date,
          completed,
          notes: notes || '',
          pointsEarned: calculatePoints(habit),
          streakCount: await calculateStreak(familyId, habitId, memberId, date)
        });
      }
      // If not completed and no existing record, nothing to do (already uncompleted)
    } else {
      // Existing completion found
      const existingDoc = querySnapshot.docs[0];
      
      if (!completed) {
        // If marking as uncompleted (undo), delete the record
        await deleteDoc(existingDoc.ref);
      } else {
        // Update existing completion
        const currentData = existingDoc.data() as FamilyHabitCompletion;
        
        await updateDoc(existingDoc.ref, {
          completed,
          notes: notes || currentData.notes,
          pointsEarned: calculatePoints(habit),
          streakCount: await calculateStreak(familyId, habitId, memberId, date),
          timestamp: Timestamp.now()
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

// Helper function to calculate points based on habit difficulty and bonuses
const calculatePoints = (habit: FamilyHabit): number => {
  let points = habit.basePoints;
  
  // Difficulty multiplier
  switch (habit.difficulty) {
    case 'easy':
      points *= 1;
      break;
    case 'medium':
      points *= 1.5;
      break;
    case 'hard':
      points *= 2;
      break;
  }
  
  return Math.round(points);
};

// Helper function to calculate current streak
const calculateStreak = async (familyId: string, habitId: string, memberId: string, currentDate: string): Promise<number> => {
  try {
    const completionsRef = collection(db, 'families', familyId, 'completions');
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('memberId', '==', memberId),
      where('completed', '==', true),
      orderBy('date', 'desc'),
      limit(30)
    );
    
    const querySnapshot = await getDocs(q);
    const completions = querySnapshot.docs.map(doc => doc.data().date as string).sort().reverse();
    
    let streak = 0;
    const today = new Date(currentDate);
    
    for (let i = 0; i < completions.length; i++) {
      const completionDate = new Date(completions[i]);
      const daysDiff = Math.floor((today.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    return 0;
  }
};

// Member Stats Update
const updateMemberStats = async (familyId: string, memberId: string, updates: {
  pointsEarned: number;
  habitCompleted: boolean;
  streakCount: number;
}) => {
  try {
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    const memberSnap = await getDoc(memberRef);
    
    if (memberSnap.exists()) {
      const currentStats = memberSnap.data().stats;
      
      await updateDoc(memberRef, {
        'stats.totalPoints': currentStats.totalPoints + updates.pointsEarned,
        'stats.currentStreak': Math.max(updates.streakCount, currentStats.currentStreak),
        'stats.longestStreak': Math.max(updates.streakCount, currentStats.longestStreak),
        'stats.habitsCompleted': currentStats.habitsCompleted + (updates.habitCompleted ? 1 : 0),
        'stats.lastActive': Timestamp.now()
      });
    }
  } catch (error) {
    console.error('Failed to update member stats:', error);
  }
};

// Reward Operations
export const createReward = async (request: CreateRewardRequest): Promise<string> => {
  try {
    const rewardsRef = collection(db, 'families', request.familyId, 'rewards');
    
    const rewardData: Omit<Reward, 'id'> = {
      ...request.reward,
      familyId: request.familyId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      totalRedemptions: 0
    };
    
    const docRef = await addDoc(rewardsRef, rewardData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getFamilyRewards = async (familyId: string, memberId?: string): Promise<Reward[]> => {
  try {
    const rewardsRef = collection(db, 'families', familyId, 'rewards');
    const q = query(rewardsRef, where('isActive', '==', true), orderBy('pointsRequired', 'asc'));
    
    const querySnapshot = await getDocs(q);
    let rewards = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Reward[];
    
    // Filter by member availability
    if (memberId) {
      rewards = rewards.filter(reward => 
        reward.availableToMembers.length === 0 || 
        reward.availableToMembers.includes(memberId)
      );
    }
    
    return rewards;
  } catch (error) {
    throw error;
  }
};

export const redeemReward = async (familyId: string, rewardId: string, memberId: string): Promise<string> => {
  try {
    // Check if member has enough points
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    const memberSnap = await getDoc(memberRef);
    const member = memberSnap.data() as FamilyMember;
    
    const rewardRef = doc(db, 'families', familyId, 'rewards', rewardId);
    const rewardSnap = await getDoc(rewardRef);
    const reward = rewardSnap.data() as Reward;
    
    if (member.stats.totalPoints < reward.pointsRequired) {
      throw new Error('Insufficient points');
    }
    
    // Create redemption request
    const redemptionsRef = collection(db, 'families', familyId, 'redemptions');
    const redemptionData: Omit<RewardRedemption, 'id'> = {
      familyId,
      rewardId,
      memberId,
      pointsSpent: reward.pointsRequired,
      status: reward.requiresApproval ? 'pending' : 'approved',
      requestedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(redemptionsRef, redemptionData);
    
    // If auto-approved, deduct points immediately
    if (!reward.requiresApproval) {
      await updateDoc(memberRef, {
        'stats.totalPoints': member.stats.totalPoints - reward.pointsRequired,
        'stats.rewardsEarned': member.stats.rewardsEarned + 1
      });
    }
    
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Challenge Operations
export const createFamilyChallenge = async (familyId: string, challenge: Omit<FamilyChallenge, 'id' | 'familyId' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const challengesRef = collection(db, 'families', familyId, 'challenges');
    
    const challengeData: Omit<FamilyChallenge, 'id'> = {
      ...challenge,
      familyId,
      status: 'upcoming',
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(challengesRef, challengeData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getFamilyChallenges = async (familyId: string, status?: 'upcoming' | 'active' | 'completed'): Promise<FamilyChallenge[]> => {
  try {
    const challengesRef = collection(db, 'families', familyId, 'challenges');
    let q = query(challengesRef, orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(challengesRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyChallenge[];
  } catch (error) {
    throw error;
  }
};

export const startChallenge = async (familyId: string, challengeId: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'families', familyId, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status: 'active',
      startDate: getTodayDateString()
    });
  } catch (error) {
    throw error;
  }
};

export const completeChallenge = async (familyId: string, challengeId: string, winnerId?: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'families', familyId, 'challenges', challengeId);
    const updateData: any = {
      status: 'completed',
      completedAt: Timestamp.now()
    };
    
    if (winnerId) {
      updateData.winner = winnerId;
    }
    
    await updateDoc(challengeRef, updateData);
  } catch (error) {
    throw error;
  }
};

export const joinChallenge = async (familyId: string, challengeId: string, memberId: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'families', familyId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as FamilyChallenge;
    
    if (!challenge.participantIds.includes(memberId)) {
      await updateDoc(challengeRef, {
        participantIds: [...challenge.participantIds, memberId]
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getChallengeProgress = async (familyId: string, challengeId: string): Promise<Record<string, number>> => {
  try {
    const challengeRef = doc(db, 'families', familyId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as FamilyChallenge;
    
    if (!challenge) return {};
    
    const progress: Record<string, number> = {};
    
    // Get completions for challenge habits during challenge period
    const completionsRef = collection(db, 'families', familyId, 'completions');
    const completionsQuery = query(
      completionsRef,
      where('habitId', 'in', challenge.habitIds),
      where('date', '>=', challenge.startDate),
      where('date', '<=', challenge.endDate)
    );
    
    const completionsSnap = await getDocs(completionsQuery);
    const completions = completionsSnap.docs.map(doc => doc.data()) as FamilyHabitCompletion[];
    
    // Calculate progress based on challenge type
    for (const memberId of challenge.participantIds) {
      const memberCompletions = completions.filter(c => c.memberId === memberId);
      
      switch (challenge.type) {
        case 'total':
          progress[memberId] = memberCompletions.length;
          break;
        case 'streak':
          progress[memberId] = calculateMaxStreak(memberCompletions);
          break;
        case 'race':
          progress[memberId] = memberCompletions.length;
          break;
        case 'collaboration':
          progress[memberId] = memberCompletions.length;
          break;
      }
    }
    
    return progress;
  } catch (error) {
    throw error;
  }
};

// Daily progress breakdown per member within challenge period
export const getChallengeDailyProgress = async (
  familyId: string,
  challengeId: string
): Promise<Record<string, { date: string; count: number }[]>> => {
  try {
    const challengeRef = doc(db, 'families', familyId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as FamilyChallenge;
    if (!challenge) return {};

    const completionsRef = collection(db, 'families', familyId, 'completions');
    const completionsQuery = query(
      completionsRef,
      where('habitId', 'in', challenge.habitIds),
      where('date', '>=', challenge.startDate),
      where('date', '<=', challenge.endDate)
    );
    const completionsSnap = await getDocs(completionsQuery);
    const completions = completionsSnap.docs.map(doc => doc.data()) as FamilyHabitCompletion[];

    const byMemberDate: Record<string, Record<string, number>> = {};
    for (const memberId of challenge.participantIds) {
      byMemberDate[memberId] = {};
    }
    for (const c of completions) {
      if (!byMemberDate[c.memberId]) continue;
      byMemberDate[c.memberId][c.date] = (byMemberDate[c.memberId][c.date] || 0) + 1;
    }

    const result: Record<string, { date: string; count: number }[]> = {};
    for (const memberId of Object.keys(byMemberDate)) {
      const entries = Object.entries(byMemberDate[memberId])
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => (a.date < b.date ? -1 : 1));
      result[memberId] = entries;
    }
    return result;
  } catch (error) {
    throw error;
  }
};

// Helper function to calculate max streak from completions
function calculateMaxStreak(completions: FamilyHabitCompletion[]): number {
  if (completions.length === 0) return 0;
  
  const sortedDates = completions
    .filter(c => c.completed)
    .map(c => c.date)
    .sort();
  
  let maxStreak = 1;
  let currentStreak = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currentDate = new Date(sortedDates[i]);
    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  
  return maxStreak;
}

// Analytics Operations
export const getFamilyCompletionsForAnalytics = async (familyId: string, startDate?: Date, endDate?: Date): Promise<any[]> => {
  try {
    const completionsRef = collection(db, 'families', familyId, 'completions');
    let q = query(completionsRef, orderBy('timestamp', 'desc'));
    
    if (startDate && endDate) {
      q = query(
        completionsRef, 
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate)),
        orderBy('timestamp', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getFamilyMoods = async (familyId: string, startDate?: Date, endDate?: Date): Promise<any[]> => {
  try {
    const moodsRef = collection(db, 'families', familyId, 'moods');
    let q = query(moodsRef, orderBy('timestamp', 'desc'));
    
    if (startDate && endDate) {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      q = query(
        moodsRef,
        where('date', '>=', startDateStr),
        where('date', '<=', endDateStr),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    throw error;
  }
};

export const getFamilyAnalyticsSummary = async (familyId: string, period: 'week' | 'month' | 'year'): Promise<any> => {
  try {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    const [completions, moods, rewards, redemptions] = await Promise.all([
      getFamilyCompletionsForAnalytics(familyId, startDate, now),
      getFamilyMoods(familyId, startDate, now),
      getFamilyRewards(familyId),
      getRedemptionHistory(familyId)
    ]);
    
    return {
      completions,
      moods,
      rewards,
      redemptions,
      period,
      dateRange: { startDate, endDate: now }
    };
  } catch (error) {
    throw error;
  }
};

// Reward Redemption Approval Operations
export const approveRedemption = async (familyId: string, redemptionId: string, approverMemberId: string): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'families', familyId, 'redemptions', redemptionId);
    const redemptionSnap = await getDoc(redemptionRef);
    const redemption = redemptionSnap.data() as RewardRedemption;
    
    if (!redemption || redemption.status !== 'pending') {
      throw new Error('Redemption not found or not pending');
    }
    
    // Get member info to deduct points
    const memberRef = doc(db, 'families', familyId, 'members', redemption.memberId);
    const memberSnap = await getDoc(memberRef);
    const member = memberSnap.data() as FamilyMember;
    
    const batch = writeBatch(db);
    
    // Update redemption status
    batch.update(redemptionRef, {
      status: 'approved',
      approvedBy: approverMemberId,
      approvedAt: Timestamp.now()
    });
    
    // Deduct points from member
    batch.update(memberRef, {
      'stats.totalPoints': member.stats.totalPoints - redemption.pointsSpent,
      'stats.rewardsEarned': member.stats.rewardsEarned + 1
    });
    
    // Update reward usage count
    const rewardRef = doc(db, 'families', familyId, 'rewards', redemption.rewardId);
    const rewardSnap = await getDoc(rewardRef);
    if (rewardSnap.exists()) {
      const reward = rewardSnap.data() as Reward;
      batch.update(rewardRef, {
        totalRedemptions: reward.totalRedemptions + 1,
        lastRedeemed: Timestamp.now()
      });
    }
    
    await batch.commit();
  } catch (error) {
    throw error;
  }
};

export const denyRedemption = async (familyId: string, redemptionId: string, approverMemberId: string, reason?: string): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'families', familyId, 'redemptions', redemptionId);
    await updateDoc(redemptionRef, {
      status: 'denied',
      approvedBy: approverMemberId,
      approvedAt: Timestamp.now(),
      denialReason: reason || 'No reason provided'
    });
  } catch (error) {
    throw error;
  }
};

export const completeRedemption = async (familyId: string, redemptionId: string, notes?: string, rating?: number): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'families', familyId, 'redemptions', redemptionId);
    await updateDoc(redemptionRef, {
      status: 'completed',
      completedAt: Timestamp.now(),
      notes: notes || '',
      rating: rating
    });
  } catch (error) {
    throw error;
  }
};

export const getPendingRedemptions = async (familyId: string): Promise<RewardRedemption[]> => {
  try {
    const redemptionsRef = collection(db, 'families', familyId, 'redemptions');
    const q = query(redemptionsRef, where('status', '==', 'pending'), orderBy('requestedAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RewardRedemption[];
  } catch (error) {
    throw error;
  }
};

export const getRedemptionHistory = async (familyId: string, memberId?: string): Promise<RewardRedemption[]> => {
  try {
    const redemptionsRef = collection(db, 'families', familyId, 'redemptions');
    let q = query(redemptionsRef, orderBy('requestedAt', 'desc'), limit(50));
    
    if (memberId) {
      q = query(redemptionsRef, where('memberId', '==', memberId), orderBy('requestedAt', 'desc'), limit(50));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as RewardRedemption[];
  } catch (error) {
    throw error;
  }
};

// Real-time subscriptions
export const subscribeFamilyData = (familyId: string, callback: (data: Partial<FamilyDashboardData>) => void): Unsubscribe => {
  const unsubscribes: Unsubscribe[] = [];
  
  // Subscribe to family habits
  const habitsRef = collection(db, 'families', familyId, 'habits');
  const habitsQuery = query(habitsRef, where('isActive', '==', true));
  
  const habitsUnsub = onSnapshot(habitsQuery, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyHabit[];
    
    callback({ todayHabits: habits });
  });
  
  unsubscribes.push(habitsUnsub);
  
  // Subscribe to completions
  const completionsRef = collection(db, 'families', familyId, 'completions');
  const today = getTodayDateString();
  const completionsQuery = query(completionsRef, where('date', '==', today));
  
  const completionsUnsub = onSnapshot(completionsQuery, (snapshot) => {
    const completions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyHabitCompletion[];
    
    callback({ completions });
  });
  
  unsubscribes.push(completionsUnsub);
  
  // Subscribe to family members
  const membersRef = collection(db, 'families', familyId, 'members');
  const membersQuery = query(membersRef, where('isActive', '==', true));
  
  const membersUnsub = onSnapshot(membersQuery, async (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FamilyMember[];
    
    // Get the full family data to update the context
    const family = await getFamily(familyId);
    if (family) {
      callback({ family });
    }
  });
  
  unsubscribes.push(membersUnsub);
  
  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
};

// Dashboard Data
export const getFamilyDashboardData = async (familyId: string): Promise<FamilyDashboardData> => {
  try {
    const [family, habits, completions, rewards] = await Promise.all([
      getFamily(familyId),
      getFamilyHabits(familyId),
      getFamilyCompletions(familyId, { 
        startDate: getTodayDateString(),
        endDate: getTodayDateString()
      }),
      getFamilyRewards(familyId)
    ]);
    
    if (!family) {
      throw new Error('Family not found');
    }
    
    // Get member stats
    const memberStats = family.members.reduce((acc, member) => {
      acc[member.id] = member.stats;
      return acc;
    }, {} as Record<string, any>);
    
    return {
      family,
      todayHabits: habits,
      completions,
      memberStats,
      activeRewards: rewards,
      pendingRedemptions: [], // TODO: Implement
      activeChallenges: [] // TODO: Implement
    };
  } catch (error) {
    throw error;
  }
};

// Remove a family member (soft delete - mark as inactive)
export const removeFamilyMember = async (familyId: string, memberId: string): Promise<void> => {
  try {
    console.log('🗑️ Removing family member:', { familyId, memberId });

    const batch = writeBatch(db);

    // Mark member as inactive
    const memberRef = doc(db, 'families', familyId, 'members', memberId);
    batch.update(memberRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });

    // Remove member from all habits they're assigned to
    const habitsRef = collection(db, 'families', familyId, 'habits');
    const habitsQuery = query(habitsRef, where('assignedMembers', 'array-contains', memberId));
    const habitsSnapshot = await getDocs(habitsQuery);

    habitsSnapshot.docs.forEach(habitDoc => {
      const habitData = habitDoc.data();
      const assignedMembers = habitData.assignedMembers || [];
      const updatedMembers = assignedMembers.filter((id: string) => id !== memberId);

      if (updatedMembers.length !== assignedMembers.length) {
        batch.update(habitDoc.ref, {
          assignedMembers: updatedMembers,
          updatedAt: Timestamp.now()
        });
      }
    });

    // Remove all completions for this member
    const completionsRef = collection(db, 'families', familyId, 'completions');
    const completionsQuery = query(completionsRef, where('memberId', '==', memberId));
    const completionsSnapshot = await getDocs(completionsQuery);

    completionsSnapshot.docs.forEach(completionDoc => {
      batch.delete(completionDoc.ref);
    });

    // Remove member from any challenges they're participating in
    const challengesRef = collection(db, 'families', familyId, 'challenges');
    const challengesQuery = query(challengesRef, where('participantIds', 'array-contains', memberId));
    const challengesSnapshot = await getDocs(challengesQuery);

    challengesSnapshot.docs.forEach(challengeDoc => {
      const challengeData = challengeDoc.data();
      const participantIds = challengeData.participantIds || [];
      const updatedParticipants = participantIds.filter((id: string) => id !== memberId);

      if (updatedParticipants.length !== participantIds.length) {
        batch.update(challengeDoc.ref, {
          participantIds: updatedParticipants,
          updatedAt: Timestamp.now()
        });
      }
    });

    // Update family updatedAt timestamp
    const familyRef = doc(db, 'families', familyId);
    batch.update(familyRef, {
      updatedAt: Timestamp.now()
    });

    // Commit all changes
    await batch.commit();

    console.log('✅ Family member removed successfully');
  } catch (error) {
    console.error('❌ Failed to remove family member:', error);
    throw new Error('Failed to remove family member. Please try again.');
  }
};