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
  Workspace,
  WorkspaceMember,
  WorkspaceSettings,
  WorkspaceHabit,
  WorkspaceHabitCompletion,
  WorkspaceMoodEntry,
  Reward,
  RewardRedemption,
  WorkspaceChallenge,
  CreateFamilyRequest,
  JoinFamilyRequest,
  CreateWorkspaceHabitRequest,
  CreateRewardRequest,
  WorkspaceDashboardData,
  HabitNexModeId
} from '../types/family';
import { resolveMode } from '@/lib/modes';

// Get families that a user is a member of (simplified approach to avoid data pollution)
export const getUserFamilies = async (userId: string): Promise<Array<{ workspaceId: string; familyName: string; member: WorkspaceMember }>> => {
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
      collection(db, 'workspaces'),
      where('isActive', '==', true),
      limit(20) // Reasonable limit - most users should have < 20 families
    );
    
    const familiesSnapshot = await getDocs(familiesQuery);
    console.log(`📊 Checking ${familiesSnapshot.size} active families for membership`);
    
    // Check membership in parallel, but only for reasonable number of families
    const membershipChecks = familiesSnapshot.docs.map(async (familyDoc) => {
      const workspaceData = familyDoc.data();
      
      try {
        // Check if user is a member of this family
        const memberDoc = await getDoc(doc(db, 'workspaces', familyDoc.id, 'members', userId));
        
        if (memberDoc.exists()) {
          const memberData = memberDoc.data() as Omit<WorkspaceMember, 'id'>;
          
          // Only include active members
          if (memberData.isActive) {
            return {
              workspaceId: familyDoc.id,
              familyName: workspaceData.name,
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

// Workspace Operations
export const createFamily = async (creatorUserId: string, request: CreateFamilyRequest): Promise<string> => {
  try {
    const batch = writeBatch(db);

    // Generate unique invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const incomingSettings = request.settings ?? {};
    const { mode: requestedMode, ...restSettings } = incomingSettings as Partial<WorkspaceSettings> & { mode?: HabitNexModeId };
    const initialMode = resolveMode(requestedMode, {
      isPersonal: request.isPersonal,
      memberCount: request.isPersonal ? 1 : undefined,
    });

    // Create family document
    const familyRef = doc(collection(db, 'workspaces'));
    const workspaceData: Omit<Workspace, 'id' | 'members'> = {
      name: request.name,
      createdBy: creatorUserId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      inviteCode,
      isActive: true,
      isPersonal: request.isPersonal || false,
      settings: {
        mode: initialMode,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekStartsOn: 1, // Monday
        theme: 'light',
        avatarStyle: 'personas', // Default to personas for new families
        touchScreenMode: false,
        voiceFeedback: false,
        autoTimeout: 5,
        weatherZip: request.settings?.weatherZip || '',
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
        ...restSettings
      },
      members: [] // Will be populated by subcollection
    };

    batch.set(familyRef, workspaceData);
    
    // Create creator as first family member (parent)
    const memberRef = doc(collection(familyRef, 'members'), creatorUserId);
    const creatorProfile = request.creatorProfile;
    const memberData: Omit<WorkspaceMember, 'id'> = {
      workspaceId: familyRef.id,
      userId: creatorUserId,
      name: creatorProfile?.name || 'Workspace Admin',
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
      rewardProfile: {
        dailyFocusHabitIds: [],
        weeklyGoal: 4,
        tokenBalance: 0,
        lastUpdated: Timestamp.now()
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
    const familiesRef = collection(db, 'workspaces');
    const q = query(familiesRef, where('inviteCode', '==', request.inviteCode.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Invalid invite code');
    }
    
    const familyDoc = querySnapshot.docs[0];
    const workspaceId = familyDoc.id;
    
    // Check if user is already a member
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', userId);
    const existingMember = await getDoc(memberRef);
    
    if (existingMember.exists()) {
      throw new Error('You are already a member of this family');
    }
    
    // Add user as family member
    const memberData: Omit<WorkspaceMember, 'id'> = {
      workspaceId,
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

export const getFamily = async (workspaceId: string): Promise<Workspace | null> => {
  try {
    const familyRef = doc(db, 'workspaces', workspaceId);
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      return null;
    }
    
    const workspaceData = familySnap.data() as Omit<Workspace, 'id' | 'members'>;

    // Get family members
    const membersRef = collection(db, 'workspaces', workspaceId, 'members');
    const membersQuery = query(membersRef, where('isActive', '==', true), orderBy('joinedAt', 'asc'));
    const membersSnap = await getDocs(membersQuery);
    const members = membersSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceMember[];

    const settingsWithMode: WorkspaceSettings = {
      ...workspaceData.settings,
      mode: resolveMode(workspaceData.settings?.mode as HabitNexModeId | undefined, {
        isPersonal: workspaceData.isPersonal,
        memberCount: members.length,
      }),
    };

    return {
      id: familySnap.id,
      ...workspaceData,
      settings: settingsWithMode,
      members,
    } as Workspace;
  } catch (error) {
    throw error;
  }
};

export const updateWorkspaceSettings = async (workspaceId: string, settings: Partial<WorkspaceSettings>) => {
  try {
    const familyRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(familyRef, {
      'settings': settings,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const updateFamilyName = async (workspaceId: string, name: string) => {
  try {
    const familyRef = doc(db, 'workspaces', workspaceId);
    await updateDoc(familyRef, {
      name: name,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

// Workspace Member Operations
export const getWorkspaceMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
  try {
    const membersRef = collection(db, 'workspaces', workspaceId, 'members');
    const q = query(membersRef, where('isActive', '==', true), orderBy('joinedAt', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceMember[];
  } catch (error) {
    throw error;
  }
};

export const updateWorkspaceMember = async (workspaceId: string, memberId: string, updates: Partial<WorkspaceMember>) => {
  try {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', memberId);
    await updateDoc(memberRef, updates);
  } catch (error) {
    throw error;
  }
};

export const addDirectWorkspaceMember = async (
  workspaceId: string,
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
    console.log('addDirectWorkspaceMember called with:', { workspaceId, createdBy, memberInfo });
    
    // Verify that the person adding the member is a parent/admin
    const creatorRef = doc(db, 'workspaces', workspaceId, 'members', createdBy);
    const creatorDoc = await getDoc(creatorRef);
    console.log('Creator doc exists:', creatorDoc.exists());
    
    if (!creatorDoc.exists()) {
      throw new Error('You must be a family member to add others');
    }
    
    const creator = creatorDoc.data() as WorkspaceMember;
    console.log('Creator role:', creator.role);
    if (creator.role !== 'parent' && creator.role !== 'adult') {
      throw new Error('Only parents and adults can add family members directly');
    }
    
    // Create new member document with auto-generated ID
    const membersRef = collection(db, 'workspaces', workspaceId, 'members');
    
    const memberData: any = {
      workspaceId,
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
export const updateWorkspaceMemberInDb = async (
  workspaceId: string,
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
    rewardProfile?: any;
  }
): Promise<void> => {
  try {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', memberId);
    
    // Build update object with only provided fields
    const updateData: any = {};
    if (updates.displayName !== undefined) updateData.displayName = updates.displayName;
    if (updates.profileImageUrl !== undefined) updateData.profileImageUrl = updates.profileImageUrl;  // Added for new profile image system
    if (updates.avatarSeed !== undefined) updateData.avatarSeed = updates.avatarSeed;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.rewardProfile !== undefined) updateData.rewardProfile = updates.rewardProfile;

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
export const updateWorkspaceSettingsInDb = async (
  workspaceId: string,
  settings: Partial<WorkspaceSettings>
): Promise<void> => {
  try {
    const familyRef = doc(db, 'workspaces', workspaceId);
    
    // First get current family to merge settings
    const familyDoc = await getDoc(familyRef);
    if (!familyDoc.exists()) {
      throw new Error('Workspace not found');
    }
    
    const currentWorkspace = familyDoc.data() as Workspace;
    const mergedSettings = {
      ...currentWorkspace.settings,
      ...settings
    };
    
    // Update with merged settings
    await updateDoc(familyRef, {
      settings: mergedSettings,
      updatedAt: Timestamp.now()
    });
    
    console.log('Workspace settings updated successfully:', workspaceId);
  } catch (error) {
    console.error('Error updating family settings:', error);
    throw error;
  }
};

// Workspace Habit Operations
export const createWorkspaceHabit = async (request: CreateWorkspaceHabitRequest): Promise<string> => {
  try {
    const habitsRef = collection(db, 'workspaces', request.workspaceId, 'habits');
    
    const habitData: Omit<WorkspaceHabit, 'id'> = {
      ...request.habit,
      workspaceId: request.workspaceId,
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

export const getWorkspaceHabits = async (workspaceId: string, memberId?: string): Promise<WorkspaceHabit[]> => {
  try {
    const habitsRef = collection(db, 'workspaces', workspaceId, 'habits');
    let q = query(habitsRef, where('isActive', '==', true), orderBy('createdAt', 'desc'));
    
    if (memberId) {
      q = query(q, where('assignedMembers', 'array-contains', memberId));
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceHabit[];
  } catch (error) {
    throw error;
  }
};

export const updateWorkspaceHabit = async (workspaceId: string, habitId: string, updates: Partial<WorkspaceHabit>) => {
  try {
    const habitRef = doc(db, 'workspaces', workspaceId, 'habits', habitId);
    await updateDoc(habitRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    throw error;
  }
};

export const deleteWorkspaceHabit = async (workspaceId: string, habitId: string): Promise<void> => {
  try {
    const habitRef = doc(db, 'workspaces', workspaceId, 'habits', habitId);
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

// Workspace Completion Operations
export const addFamilyCompletion = async (
  workspaceId: string,
  completion: Omit<WorkspaceHabitCompletion, 'id' | 'timestamp' | 'encouragements'>
): Promise<string> => {
  try {
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
    const completionData = {
      ...completion,
      timestamp: Timestamp.now(),
      encouragements: []
    };
    
    const docRef = await addDoc(completionsRef, completionData);
    
    // Update member stats if completed
    if (completion.completed) {
      await updateMemberStats(workspaceId, completion.memberId, {
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
  workspaceId: string,
  options: {
    memberId?: string;
    habitId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  } = {}
): Promise<WorkspaceHabitCompletion[]> => {
  try {
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
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
    })) as WorkspaceHabitCompletion[];
  } catch (error) {
    throw error;
  }
};

export const toggleWorkspaceHabitCompletion = async (
  workspaceId: string,
  habitId: string,
  memberId: string,
  date: string,
  completed: boolean,
  notes?: string
): Promise<void> => {
  try {
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
    const q = query(
      completionsRef,
      where('habitId', '==', habitId),
      where('memberId', '==', memberId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    // Get habit details for points calculation
    const habitRef = doc(db, 'workspaces', workspaceId, 'habits', habitId);
    const habitSnap = await getDoc(habitRef);
    const habit = habitSnap.data() as WorkspaceHabit;
    
    if (querySnapshot.empty) {
      // Create new completion only if marking as completed
      if (completed) {
        await addFamilyCompletion(workspaceId, {
          workspaceId,
          habitId,
          memberId,
          date,
          completed,
          notes: notes || '',
          pointsEarned: calculatePoints(habit),
          streakCount: await calculateStreak(workspaceId, habitId, memberId, date)
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
        const currentData = existingDoc.data() as WorkspaceHabitCompletion;
        
        await updateDoc(existingDoc.ref, {
          completed,
          notes: notes || currentData.notes,
          pointsEarned: calculatePoints(habit),
          streakCount: await calculateStreak(workspaceId, habitId, memberId, date),
          timestamp: Timestamp.now()
        });
      }
    }
  } catch (error) {
    throw error;
  }
};

// Helper function to calculate points based on habit difficulty and bonuses
const calculatePoints = (habit: WorkspaceHabit): number => {
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
const calculateStreak = async (workspaceId: string, habitId: string, memberId: string, currentDate: string): Promise<number> => {
  try {
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
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
const updateMemberStats = async (workspaceId: string, memberId: string, updates: {
  pointsEarned: number;
  habitCompleted: boolean;
  streakCount: number;
}) => {
  try {
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', memberId);
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
    const rewardsRef = collection(db, 'workspaces', request.workspaceId, 'rewards');
    
    const rewardData: Omit<Reward, 'id'> = {
      ...request.reward,
      workspaceId: request.workspaceId,
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

export const getFamilyRewards = async (workspaceId: string, memberId?: string): Promise<Reward[]> => {
  try {
    const rewardsRef = collection(db, 'workspaces', workspaceId, 'rewards');
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

export const redeemReward = async (workspaceId: string, rewardId: string, memberId: string): Promise<string> => {
  try {
    // Check if member has enough points
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', memberId);
    const memberSnap = await getDoc(memberRef);
    const member = memberSnap.data() as WorkspaceMember;
    
    const rewardRef = doc(db, 'workspaces', workspaceId, 'rewards', rewardId);
    const rewardSnap = await getDoc(rewardRef);
    const reward = rewardSnap.data() as Reward;
    
    if (member.stats.totalPoints < reward.pointsRequired) {
      throw new Error('Insufficient points');
    }
    
    // Create redemption request
    const redemptionsRef = collection(db, 'workspaces', workspaceId, 'redemptions');
    const redemptionData: Omit<RewardRedemption, 'id'> = {
      workspaceId,
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
export const createWorkspaceChallenge = async (workspaceId: string, challenge: Omit<WorkspaceChallenge, 'id' | 'workspaceId' | 'createdAt' | 'status'>): Promise<string> => {
  try {
    const challengesRef = collection(db, 'workspaces', workspaceId, 'challenges');
    
    const challengeData: Omit<WorkspaceChallenge, 'id'> = {
      ...challenge,
      workspaceId,
      status: 'upcoming',
      createdAt: Timestamp.now()
    };
    
    const docRef = await addDoc(challengesRef, challengeData);
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getWorkspaceChallenges = async (workspaceId: string, status?: 'upcoming' | 'active' | 'completed'): Promise<WorkspaceChallenge[]> => {
  try {
    const challengesRef = collection(db, 'workspaces', workspaceId, 'challenges');
    let q = query(challengesRef, orderBy('createdAt', 'desc'));
    
    if (status) {
      q = query(challengesRef, where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceChallenge[];
  } catch (error) {
    throw error;
  }
};

export const startChallenge = async (workspaceId: string, challengeId: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'workspaces', workspaceId, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status: 'active',
      startDate: getTodayDateString()
    });
  } catch (error) {
    throw error;
  }
};

export const completeChallenge = async (workspaceId: string, challengeId: string, winnerId?: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'workspaces', workspaceId, 'challenges', challengeId);
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

export const joinChallenge = async (workspaceId: string, challengeId: string, memberId: string): Promise<void> => {
  try {
    const challengeRef = doc(db, 'workspaces', workspaceId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as WorkspaceChallenge;
    
    if (!challenge.participantIds.includes(memberId)) {
      await updateDoc(challengeRef, {
        participantIds: [...challenge.participantIds, memberId]
      });
    }
  } catch (error) {
    throw error;
  }
};

export const getChallengeProgress = async (workspaceId: string, challengeId: string): Promise<Record<string, number>> => {
  try {
    const challengeRef = doc(db, 'workspaces', workspaceId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as WorkspaceChallenge;
    
    if (!challenge) return {};
    
    const progress: Record<string, number> = {};
    
    // Get completions for challenge habits during challenge period
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
    const completionsQuery = query(
      completionsRef,
      where('habitId', 'in', challenge.habitIds),
      where('date', '>=', challenge.startDate),
      where('date', '<=', challenge.endDate)
    );
    
    const completionsSnap = await getDocs(completionsQuery);
    const completions = completionsSnap.docs.map(doc => doc.data()) as WorkspaceHabitCompletion[];
    
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
  workspaceId: string,
  challengeId: string
): Promise<Record<string, { date: string; count: number }[]>> => {
  try {
    const challengeRef = doc(db, 'workspaces', workspaceId, 'challenges', challengeId);
    const challengeSnap = await getDoc(challengeRef);
    const challenge = challengeSnap.data() as WorkspaceChallenge;
    if (!challenge) return {};

    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
    const completionsQuery = query(
      completionsRef,
      where('habitId', 'in', challenge.habitIds),
      where('date', '>=', challenge.startDate),
      where('date', '<=', challenge.endDate)
    );
    const completionsSnap = await getDocs(completionsQuery);
    const completions = completionsSnap.docs.map(doc => doc.data()) as WorkspaceHabitCompletion[];

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
function calculateMaxStreak(completions: WorkspaceHabitCompletion[]): number {
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
export const getFamilyCompletionsForAnalytics = async (workspaceId: string, startDate?: Date, endDate?: Date): Promise<any[]> => {
  try {
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
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

export const getFamilyMoods = async (workspaceId: string, startDate?: Date, endDate?: Date): Promise<any[]> => {
  try {
    const moodsRef = collection(db, 'workspaces', workspaceId, 'moods');
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

export const getWorkspaceAnalyticsSummary = async (workspaceId: string, period: 'week' | 'month' | 'year'): Promise<any> => {
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
      getFamilyCompletionsForAnalytics(workspaceId, startDate, now),
      getFamilyMoods(workspaceId, startDate, now),
      getWorkspaceRewards(workspaceId),
      getRedemptionHistory(workspaceId)
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
export const approveRedemption = async (workspaceId: string, redemptionId: string, approverMemberId: string): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'workspaces', workspaceId, 'redemptions', redemptionId);
    const redemptionSnap = await getDoc(redemptionRef);
    const redemption = redemptionSnap.data() as RewardRedemption;
    
    if (!redemption || redemption.status !== 'pending') {
      throw new Error('Redemption not found or not pending');
    }
    
    // Get member info to deduct points
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', redemption.memberId);
    const memberSnap = await getDoc(memberRef);
    const member = memberSnap.data() as WorkspaceMember;
    
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
    const rewardRef = doc(db, 'workspaces', workspaceId, 'rewards', redemption.rewardId);
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

export const denyRedemption = async (workspaceId: string, redemptionId: string, approverMemberId: string, reason?: string): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'workspaces', workspaceId, 'redemptions', redemptionId);
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

export const completeRedemption = async (workspaceId: string, redemptionId: string, notes?: string, rating?: number): Promise<void> => {
  try {
    const redemptionRef = doc(db, 'workspaces', workspaceId, 'redemptions', redemptionId);
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

export const getPendingRedemptions = async (workspaceId: string): Promise<RewardRedemption[]> => {
  try {
    const redemptionsRef = collection(db, 'workspaces', workspaceId, 'redemptions');
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

export const getRedemptionHistory = async (workspaceId: string, memberId?: string): Promise<RewardRedemption[]> => {
  try {
    const redemptionsRef = collection(db, 'workspaces', workspaceId, 'redemptions');
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
export const subscribeFamilyData = (workspaceId: string, callback: (data: Partial<WorkspaceDashboardData>) => void): Unsubscribe => {
  const unsubscribes: Unsubscribe[] = [];
  
  // Subscribe to family habits
  const habitsRef = collection(db, 'workspaces', workspaceId, 'habits');
  const habitsQuery = query(habitsRef, where('isActive', '==', true));
  
  const habitsUnsub = onSnapshot(habitsQuery, (snapshot) => {
    const habits = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceHabit[];
    
    callback({ todayHabits: habits });
  });
  
  unsubscribes.push(habitsUnsub);
  
  // Subscribe to completions
  const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
  const today = getTodayDateString();
  const completionsQuery = query(completionsRef, where('date', '==', today));
  
  const completionsUnsub = onSnapshot(completionsQuery, (snapshot) => {
    const completions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceHabitCompletion[];
    
    callback({ completions });
  });
  
  unsubscribes.push(completionsUnsub);
  
  // Subscribe to family members
  const membersRef = collection(db, 'workspaces', workspaceId, 'members');
  const membersQuery = query(membersRef, where('isActive', '==', true));
  
  const membersUnsub = onSnapshot(membersQuery, async (snapshot) => {
    const members = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkspaceMember[];
    
    // Get the full family data to update the context
    const family = await getWorkspace(workspaceId);
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
export const getWorkspaceDashboardData = async (workspaceId: string): Promise<WorkspaceDashboardData> => {
  try {
    const [family, habits, completions, rewards] = await Promise.all([
      getWorkspace(workspaceId),
      getWorkspaceHabits(workspaceId),
      getFamilyCompletions(workspaceId, { 
        startDate: getTodayDateString(),
        endDate: getTodayDateString()
      }),
      getWorkspaceRewards(workspaceId)
    ]);
    
    if (!family) {
      throw new Error('Workspace not found');
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
export const removeWorkspaceMember = async (workspaceId: string, memberId: string): Promise<void> => {
  try {
    console.log('🗑️ Removing family member:', { workspaceId, memberId });

    const batch = writeBatch(db);

    // Mark member as inactive
    const memberRef = doc(db, 'workspaces', workspaceId, 'members', memberId);
    batch.update(memberRef, {
      isActive: false,
      updatedAt: Timestamp.now()
    });

    // Remove member from all habits they're assigned to
    const habitsRef = collection(db, 'workspaces', workspaceId, 'habits');
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
    const completionsRef = collection(db, 'workspaces', workspaceId, 'completions');
    const completionsQuery = query(completionsRef, where('memberId', '==', memberId));
    const completionsSnapshot = await getDocs(completionsQuery);

    completionsSnapshot.docs.forEach(completionDoc => {
      batch.delete(completionDoc.ref);
    });

    // Remove member from any challenges they're participating in
    const challengesRef = collection(db, 'workspaces', workspaceId, 'challenges');
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
    const familyRef = doc(db, 'workspaces', workspaceId);
    batch.update(familyRef, {
      updatedAt: Timestamp.now()
    });

    // Commit all changes
    await batch.commit();

    console.log('✅ Workspace member removed successfully');
  } catch (error) {
    console.error('❌ Failed to remove family member:', error);
    throw new Error('Failed to remove family member. Please try again.');
  }
};
