/**
 * @deprecated This file is deprecated. Use types/workspace.ts instead.
 * These types are re-exported from workspace.ts for backward compatibility.
 * All "family" terminology has been replaced with "workspace" for better scalability.
 *
 * Migration Path:
 * - Family → Workspace
 * - FamilyMember → WorkspaceMember
 * - FamilyHabit → WorkspaceHabit
 * - familyId → workspaceId
 *
 * This file will be removed in a future version.
 */

import { Timestamp } from 'firebase/firestore';
import * as WS from './workspace';

// Re-export workspace types with family aliases for backward compatibility
/** @deprecated Use WorkspaceType from workspace.ts */
export type { WorkspaceType as FamilyType } from './workspace';

export type HabitNexModeId = 'personalPulse' | 'partnerBoost' | 'householdHarmony' | 'familyOrbit';

/** @deprecated Use WorkspaceTabId from workspace.ts */
export type FamilyTabId = 'overview' | 'members' | 'habits' | 'challenges' | 'rewards' | 'analytics' | 'settings';

export interface Family {
  id: string;
  name: string;
  createdBy: string;           // User ID of family creator
  createdAt: Timestamp;
  updatedAt: Timestamp;
  inviteCode: string;          // 6-digit code for joining family
  isActive: boolean;
  isPersonal?: boolean;        // True for auto-created personal families
  settings: FamilySettings;
  members: FamilyMember[];
}

export interface FamilySettings {
  mode: HabitNexModeId;
  timezone: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  theme: 'light' | 'dark';
  avatarStyle: 'fun-emoji' | 'bottts' | 'personas' | 'adventurer';  // Consistent avatar style for whole family
  cardTexture?: 'sparkle-bubbles' | 'minimalist-dots' | 'playful-mix' | 'fall' | 'halloween' | 'winter' | 'christmas'; // Member card background texture
  touchScreenMode: boolean;    // Optimized for wall mount displays
  voiceFeedback: boolean;      // Audio confirmations
  autoTimeout: number;         // Minutes before returning to main screen
  weatherZip?: string;         // Optional ZIP code for weather lookups
  notifications: {
    dailyReminders: boolean;
    weeklyReports: boolean;
    rewardAlerts: boolean;
  };
  display: {
    showAllMembers: boolean;   // Show all members on main dashboard
    compactMode: boolean;      // Smaller cards for more members
    animationSpeed: 'slow' | 'normal' | 'fast';
  };
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId?: string;             // Connected user account (optional)
  name: string;
  displayName: string;
  
  // New Profile Image System
  profileImageUrl?: string;    // URL to uploaded profile photo (optional)
  
  // Legacy Avatar Fields (deprecated but kept for backwards compatibility)
  avatar: string;              // Legacy: URL or emoji (kept for backwards compatibility)
  avatarStyle?: 'fun-emoji' | 'bottts' | 'personas' | 'adventurer'; // DiceBear style
  avatarSeed?: string;         // Seed for DiceBear avatar generation
  avatarConfig?: AvatarConfig; // Custom avatar configuration
  avatarOrigin?: 'auto' | 'custom'; // Track if avatar is auto-generated or custom
  
  color: string;               // Personal theme color (hex) - used for initials background
  role: 'parent' | 'child' | 'teen' | 'adult';
  birthYear?: number;          // For age-appropriate features
  isActive: boolean;
  joinedAt: Timestamp;
  preferences: MemberPreferences;
  rewardProfile?: MemberRewardProfile;
  stats: MemberStats;
}

export interface MemberPreferences {
  favoriteEmojis: string[];
  reminderTime?: string;       // Time for daily reminders
  difficulty: 'easy' | 'normal' | 'challenging';
  motivationStyle: 'rewards' | 'progress' | 'competition';
}

export interface MemberRewardProfile {
  dailyFocusHabitIds: string[];
  weeklyGoal?: number;
  tokenBalance?: number;
  lastUpdated?: Timestamp;
}

export interface MemberStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  habitsCompleted: number;
  rewardsEarned: number;
  level: number;               // Gamification level
  badges: string[];            // Achievement badges
  lastActive: Timestamp;
}

export interface FamilyHabit {
  id: string;
  familyId: string;
  name: string;
  description?: string;
  emoji: string;
  color: string;
  tags?: string[];
  
  // Assignment
  assignedMembers: string[];   // Member IDs
  isShared: boolean;          // All members must complete together
  createdBy: string;          // Member ID who created it
  
  // Scheduling
  frequency: 'daily' | 'weekly' | 'interval';
  targetDays: number[];       // Days of week [0=Sunday, 1=Monday, etc.]
  intervalDays?: number;      // For interval frequency
  startDate?: string;         // YYYY-MM-DD
  endDate?: string;           // Optional end date
  
  // Gamification
  difficulty: 'easy' | 'medium' | 'hard';
  basePoints: number;         // Points awarded per completion
  bonusPoints?: number;       // Extra points for streaks/challenges
  
  // Rewards
  linkedRewards: string[];    // Reward IDs that can be earned
  milestoneRewards: MilestoneReward[];
  
  // Status
  isActive: boolean;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // AI Enhancement (inherited from original system)
  aiEnhanced?: boolean;
  tip?: string;
  healthBenefits?: string;
  mentalBenefits?: string;
  longTermBenefits?: string;
  complementary?: string[];
}

export interface MilestoneReward {
  streak: number;             // Days of streak required
  points: number;             // Bonus points awarded
  badge?: string;             // Special badge earned
  description: string;        // Achievement description
}

export interface FamilyHabitCompletion {
  id: string;
  familyId: string;
  habitId: string;
  memberId: string;
  date: string;               // YYYY-MM-DD
  completed: boolean;
  notes?: string;
  pointsEarned: number;
  streakCount: number;        // Streak at time of completion
  timestamp: Timestamp;
  
  // Family features
  encouragements: Encouragement[];  // From other family members
  photos?: string[];          // Optional photo proof
}

export interface Encouragement {
  fromMemberId: string;
  emoji: string;
  message?: string;
  timestamp: Timestamp;
}

export interface Reward {
  id: string;
  familyId: string;
  title: string;
  description: string;
  emoji: string;
  category: 'experience' | 'purchase' | 'privilege' | 'activity' | 'time';
  pointsRequired: number;
  
  // Availability
  isActive: boolean;
  availableToMembers: string[]; // Member IDs who can redeem
  maxRedemptions?: number;      // Limit per member
  expiresAt?: Timestamp;        // Optional expiration
  
  // Parent controls
  requiresApproval: boolean;    // Parent must approve redemption
  budgetCost?: number;          // Real money cost (for purchases)
  
  // Metadata
  createdBy: string;            // Member ID (usually parent)
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Usage tracking
  totalRedemptions: number;
  lastRedeemed?: Timestamp;
}

export interface RewardRedemption {
  id: string;
  familyId: string;
  rewardId: string;
  memberId: string;
  pointsSpent: number;
  
  // Status
  status: 'pending' | 'approved' | 'denied' | 'completed';
  requestedAt: Timestamp;
  
  // Approval workflow
  approvedBy?: string;          // Parent member ID
  approvedAt?: Timestamp;
  denialReason?: string;
  
  // Completion
  completedAt?: Timestamp;
  notes?: string;               // Completion notes
  rating?: number;              // Member satisfaction rating
}

export interface FamilyChallenge {
  id: string;
  familyId: string;
  name: string;
  description: string;
  emoji: string;
  
  // Challenge details
  type: 'streak' | 'total' | 'race' | 'collaboration';
  habitIds: string[];          // Related habits
  participantIds: string[];    // Participating members
  
  // Goals
  target: number;              // Target completions/streak/etc.
  duration: number;            // Days to complete challenge
  
  // Rewards
  winnerReward?: string;       // Reward ID for winner
  participationReward?: string;// Reward for all participants
  bonusPoints: number;         // Extra points for participation
  
  // Status
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  startDate: string;           // YYYY-MM-DD
  endDate: string;             // YYYY-MM-DD
  
  // Results
  winner?: string;             // Member ID of winner
  completedAt?: Timestamp;
  
  createdBy: string;
  createdAt: Timestamp;
}

export interface FamilyMoodEntry {
  id: string;
  familyId: string;
  memberId: string;
  date: string;                // YYYY-MM-DD
  
  // 4D Mood tracking (same as original)
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  stress: 1 | 2 | 3 | 4 | 5;
  sleep: 1 | 2 | 3 | 4 | 5;
  
  notes?: string;
  tags?: string[];
  timestamp: Timestamp;
  
  // Family features
  sharedWithFamily: boolean;    // Visible to other family members
  parentNotification: boolean;  // Alert parents if mood is very low
}

// API Types
export interface CreateFamilyRequest {
  name: string;
  description?: string;
  isPersonal?: boolean;
  settings?: Partial<FamilySettings>;
  creatorProfile?: {
    name: string;
    displayName: string;
    avatar: string;
    avatarStyle?: 'fun-emoji' | 'bottts' | 'personas' | 'adventurer';
    avatarSeed?: string;
    color: string;
    role: 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
    motivationStyle?: 'rewards' | 'progress' | 'competition';
  };
}

export interface JoinFamilyRequest {
  inviteCode: string;
  memberInfo: {
    name: string;
    displayName: string;
    avatar: string;
    color: string;
    role: 'parent' | 'child' | 'teen' | 'adult';
    birthYear?: number;
  };
}

export interface CreateFamilyHabitRequest {
  familyId: string;
  habit: Omit<FamilyHabit, 'id' | 'familyId' | 'createdAt' | 'updatedAt' | 'isActive' | 'isArchived'>;
}

export interface CreateRewardRequest {
  familyId: string;
  reward: Omit<Reward, 'id' | 'familyId' | 'createdAt' | 'updatedAt' | 'totalRedemptions'>;
}

// Dashboard Types
export interface FamilyDashboardData {
  family: Family;
  todayHabits: FamilyHabit[];
  completions: FamilyHabitCompletion[];
  memberStats: Record<string, MemberStats>;
  activeRewards: Reward[];
  pendingRedemptions: RewardRedemption[];
  activeChallenges: FamilyChallenge[];
}

// Touch Screen Types
export interface TouchScreenSettings {
  displayMode: 'family' | 'member' | 'mixed';
  cardSize: 'small' | 'medium' | 'large';
  showPoints: boolean;
  showStreaks: boolean;
  enableGestures: boolean;
  hapticFeedback: boolean;
  screenTimeout: number;       // Minutes
}

// Analytics Types
export interface FamilyAnalytics {
  familyId: string;
  period: 'week' | 'month' | 'year';
  
  overall: {
    totalCompletions: number;
    averageCompletionRate: number;
    totalPointsEarned: number;
    activeMembers: number;
  };
  
  memberBreakdown: Array<{
    memberId: string;
    completions: number;
    completionRate: number;
    pointsEarned: number;
    currentStreak: number;
  }>;
  
  habitPerformance: Array<{
    habitId: string;
    completions: number;
    completionRate: number;
    averageStreak: number;
    mostSuccessfulMember: string;
  }>;
  
  rewardActivity: {
    totalRedemptions: number;
    totalPointsSpent: number;
    mostPopularReward: string;
    pendingApprovals: number;
  };
}

export type FamilyRole = 'parent' | 'child' | 'teen' | 'adult';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type RewardCategory = 'experience' | 'purchase' | 'privilege' | 'activity' | 'time';
export type ChallengeType = 'streak' | 'total' | 'race' | 'collaboration';
export type RedemptionStatus = 'pending' | 'approved' | 'denied' | 'completed';

// Avatar customization configuration for adventurer style
export interface AvatarConfig {
  // Face
  skinColor?: string;
  eyeType?: string;
  eyebrowType?: string;
  mouthType?: string;
  
  // Hair
  hair?: string; // Hair style for adventurer (short01-20, long01-26)
  topType?: string; // Hair style for avataaars (legacy)
  hairColor?: string;
  facialHairType?: string;
  facialHairColor?: string;
  
  // Accessories
  accessoriesType?: string;
  
  // Clothing
  clotheType?: string;
  clotheColor?: string;
  graphicType?: string;
  
  // Background
  backgroundColor?: string[];
  
  // Adventurer-specific probabilities (0-100)
  hairProbability?: number;
  glassesProbability?: number;
  featuresProbability?: number;
  earringsProbability?: number;
}
