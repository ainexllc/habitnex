'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Home, Users, Target, Trophy, Gift, BarChart3 } from 'lucide-react';
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
] as const;

type FamilyTab = FamilyTabId;

function WorkspaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { currentFamily, currentMember, loading, isParent } = useFamily();

  const [activeTab, setActiveTab] = useState<FamilyTab>('overview');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showCreateHabitModal, setShowCreateHabitModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!searchParams.get('tab')) {
      router.replace('/workspace?tab=overview');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as FamilyTab;
    if (tabFromUrl && FAMILY_TABS.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

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

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading workspace...</p>
        </div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
