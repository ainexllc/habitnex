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
import { WorkspaceMembersTab } from '@/components/workspace/tabs/WorkspaceMembersTab';
import { WorkspaceHabitsTab } from '@/components/workspace/tabs/WorkspaceHabitsTab';
import { WorkspaceChallengesTab } from '@/components/workspace/tabs/WorkspaceChallengesTab';
import { WorkspaceRewardsTab } from '@/components/workspace/tabs/WorkspaceRewardsTab';
import { WorkspaceAnalyticsTab } from '@/components/workspace/tabs/WorkspaceAnalyticsTab';
import { WorkspaceOverviewTab } from '@/components/workspace/tabs/WorkspaceOverviewTab';
import { WorkspaceSettingsTab } from '@/components/workspace/tabs/WorkspaceSettingsTab';
import { MemberModal } from '@/components/workspace/MemberModal';
import { CreateWorkspaceHabitModal } from '@/components/workspace/CreateWorkspaceHabitModal';
import { CreateWorkspaceChallengeModal } from '@/components/workspace/CreateWorkspaceChallengeModal';
import { ModernWorkspaceHeader } from '@/components/workspace/ModernWorkspaceHeader';
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

  // If no workspace loaded yet, WorkspaceContext is creating one automatically
  // Just return null and let the loading state handle it
  if (!currentFamily || !currentMember) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <WorkspaceOverviewTab />;
      case 'members':
        return <WorkspaceMembersTab onAddMember={() => setShowAddMemberModal(true)} />;
      case 'habits':
        return <WorkspaceHabitsTab onCreateHabit={() => setShowCreateHabitModal(true)} />;
      case 'challenges':
        return <WorkspaceChallengesTab onCreateChallenge={() => setShowCreateChallengeModal(true)} />;
      case 'rewards':
        return <WorkspaceRewardsTab />;
      case 'analytics':
        return <WorkspaceAnalyticsTab />;
      case 'settings':
        return <WorkspaceSettingsTab />;
      default:
        return <WorkspaceOverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <ModernWorkspaceHeader
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

      <CreateWorkspaceHabitModal
        isOpen={showCreateHabitModal}
        onClose={() => setShowCreateHabitModal(false)}
      />

      <CreateWorkspaceChallengeModal
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
