'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/Button';
import {
  Home,
  Users,
  Target,
  Trophy,
  Gift,
  BarChart3,
} from 'lucide-react';
import { FamilyMembersTab } from '@/components/family/tabs/FamilyMembersTab';
import { FamilyHabitsTab } from '@/components/family/tabs/FamilyHabitsTab';
import { FamilyChallengesTab } from '@/components/family/tabs/FamilyChallengesTab';
import { FamilyRewardsTab } from '@/components/family/tabs/FamilyRewardsTab';
import { FamilyAnalyticsTab } from '@/components/family/tabs/FamilyAnalyticsTab';
import { FamilyOverviewTab } from '@/components/family/tabs/FamilyOverviewTab';
import { FamilySettingsTab } from '@/components/family/tabs/FamilySettingsTab';
import { MemberModal } from '@/components/family/MemberModal';
import { CreateFamilyHabitModal } from '@/components/family/CreateFamilyHabitModal';
import { CreateFamilyChallengeModal } from '@/components/family/CreateFamilyChallengeModal';
import { ModernFamilyHeader } from '@/components/family/ModernFamilyHeader';
import { FeedbackSystem } from '@/components/feedback';
import type { FamilyTabId } from '@/types/family';

const FAMILY_TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Users }, // icon replaced dynamically
] as const satisfies ReadonlyArray<{ id: FamilyTabId; label: string; icon: typeof Home }>;

type FamilyTab = FamilyTabId;

export interface WorkspaceDashboardProps {
  enforceWorkspaceRoute?: boolean;
  redirectIfUnauthenticated?: boolean;
}

export function WorkspaceDashboard({
  enforceWorkspaceRoute = false,
  redirectIfUnauthenticated = true,
}: WorkspaceDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { currentFamily, currentMember, loading, isParent } = useFamily();

  const initialTab = useMemo<FamilyTab>(() => {
    if (pathname?.startsWith('/workspace')) {
      const tabFromUrl = searchParams?.get('tab') as FamilyTab | null;
      if (tabFromUrl && FAMILY_TABS.some(tab => tab.id === tabFromUrl)) {
        return tabFromUrl;
      }
    }
    return 'overview';
  }, [pathname, searchParams]);

  const [activeTab, setActiveTab] = useState<FamilyTab>(initialTab);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);

  // Sync tab state when URL query changes (only when on /workspace)
  useEffect(() => {
    if (!pathname?.startsWith('/workspace')) return;
    const tabFromUrl = searchParams?.get('tab') as FamilyTab | null;
    if (tabFromUrl && FAMILY_TABS.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [pathname, searchParams]);

  // Ensure authenticated users viewing the marketing page land on /workspace
  useEffect(() => {
    if (
      enforceWorkspaceRoute &&
      (pathname === '/' || !pathname?.startsWith('/workspace')) &&
      !authLoading &&
      user
    ) {
      router.replace('/workspace?tab=overview');
      if (typeof window !== 'undefined') {
        window.location.replace('/workspace?tab=overview');
      }
    }
  }, [enforceWorkspaceRoute, pathname, authLoading, user, router]);

  // Default the tab query when visiting /workspace without a tab param
  useEffect(() => {
    if (!pathname?.startsWith('/workspace')) return;
    if (!searchParams?.has('tab') && !authLoading) {
      router.replace('/workspace?tab=overview');
    }
  }, [pathname, searchParams, authLoading, router]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (redirectIfUnauthenticated) {
      router.replace('/');
    }
    return null;
  }

  if (!currentFamily || !currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Family Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to create or join a family first.</p>
          <div className="space-x-4">
            <Link href="/family/create">
              <Button>Create Family</Button>
            </Link>
            <Link href="/family/join">
              <Button variant="outline">Join Family</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <FamilyOverviewTab />;
      case 'members':
        return <FamilyMembersTab onAddMember={() => setShowAddMemberModal(true)} />;
      case 'habits':
        return <FamilyHabitsTab onCreateHabit={() => setShowCreateHabitModal(true)} />;
      case 'challenges':
        return <FamilyChallengesTab onCreateChallenge={() => setShowCreateChallengeModal(true)} />;
      case 'rewards':
        return <FamilyRewardsTab />;
      case 'analytics':
        return <FamilyAnalyticsTab />;
      case 'settings':
        return <FamilySettingsTab />;
      default:
        return <FamilyOverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ModernFamilyHeader
        familyName={currentFamily.name}
        date={today}
        isParent={isParent}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>

      <MemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />

      <CreateFamilyHabitModal
        isOpen={showCreateHabitModal}
        onClose={() => setShowCreateHabitModal(false)}
      />

      <CreateFamilyChallengeModal
        isOpen={showCreateChallengeModal}
        onClose={() => setShowCreateChallengeModal(false)}
      />

      <FeedbackSystem />
    </div>
  );
}

export function WorkspaceDashboardWithSuspense(props: WorkspaceDashboardProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
            <p className="text-blue-600 dark:text-blue-400 font-medium">Loading workspace...</p>
          </div>
        </div>
      }
    >
      <WorkspaceDashboard {...props} />
    </Suspense>
  );
}
