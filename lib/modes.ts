import type { LucideIcon } from 'lucide-react';
import { Home, Users, Target, Trophy, Gift, BarChart3, Settings } from 'lucide-react';
import type { FamilyTabId, HabitNexModeId } from '@/types/family';

export const defaultModeId: HabitNexModeId = 'familyOrbit';

export interface ModeNavigationConfig {
  primary: FamilyTabId[];
  secondary?: FamilyTabId[];
}

export interface HabitNexModeConfig {
  id: HabitNexModeId;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  onAccent: string;
  navigation: ModeNavigationConfig;
}

const baseTabMap: Record<FamilyTabId, { label: string; icon: LucideIcon }> = {
  overview: { label: 'Overview', icon: Home },
  members: { label: 'Members', icon: Users },
  habits: { label: 'Habits', icon: Target },
  challenges: { label: 'Challenges', icon: Trophy },
  rewards: { label: 'Rewards', icon: Gift },
  analytics: { label: 'Analytics', icon: BarChart3 },
  settings: { label: 'Settings', icon: Settings },
};

export const TAB_META = baseTabMap;

export const MODE_CONFIGS: Record<HabitNexModeId, HabitNexModeConfig> = {
  personalPulse: {
    id: 'personalPulse',
    name: 'Personal Pulse',
    tagline: 'Focus on your own momentum',
    description:
      'Stay centered with daily focus playlists, reflective prompts, and streak celebrations designed just for you.',
    accent: 'linear-gradient(135deg, #ff7a1c, #ffb347)',
    onAccent: '#0c0c0f',
    navigation: {
      primary: ['overview', 'habits', 'analytics', 'rewards'],
      secondary: [],
    },
  },
  partnerBoost: {
    id: 'partnerBoost',
    name: 'Partner Boost',
    tagline: 'Sync up and celebrate together',
    description:
      'Shared dashboards, appreciation prompts, and duo challenges help you stay aligned with your favorite person.',
    accent: 'linear-gradient(135deg, #ff6fb1, #ff8e4f)',
    onAccent: '#130b1a',
    navigation: {
      primary: ['overview', 'habits', 'members', 'analytics', 'rewards'],
      secondary: [],
    },
  },
  householdHarmony: {
    id: 'householdHarmony',
    name: 'Household Harmony',
    tagline: 'Keep roommates and friends in sync',
    description:
      'Chore drafts, shared essentials, and quick polls make running a home together actually enjoyable.',
    accent: 'linear-gradient(135deg, #5ee7df, #b490ca)',
    onAccent: '#0b1018',
    navigation: {
      primary: ['overview', 'habits', 'rewards', 'analytics'],
      secondary: ['members'],
    },
  },
  familyOrbit: {
    id: 'familyOrbit',
    name: 'Family Orbit',
    tagline: 'A joyful orbit for every family member',
    description:
      'Kid-friendly rewards, parent planning tools, and kiosks keep the household humming.',
    accent: 'linear-gradient(135deg, #6a5cff, #49c5ff)',
    onAccent: '#080b1a',
    navigation: {
      primary: ['overview', 'members', 'habits', 'challenges', 'rewards', 'analytics'],
      secondary: [],
    },
  },
};

export function resolveMode(
  mode?: HabitNexModeId | null,
  opts?: { isPersonal?: boolean; memberCount?: number }
): HabitNexModeId {
  if (mode && MODE_CONFIGS[mode]) {
    return mode;
  }

  if (opts?.isPersonal) {
    return 'personalPulse';
  }

  const memberCount = opts?.memberCount ?? 0;
  if (memberCount <= 1) {
    return 'personalPulse';
  }
  if (memberCount === 2) {
    return 'partnerBoost';
  }
  if (memberCount <= 3) {
    return 'householdHarmony';
  }

  return defaultModeId;
}
