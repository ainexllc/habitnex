'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { Button } from '@/components/ui/Button';
import { FamilyMembersTab } from '@/components/family/tabs/FamilyMembersTab';
import { FamilyHabitsTab } from '@/components/family/tabs/FamilyHabitsTab';
import { FamilyChallengesTab } from '@/components/family/tabs/FamilyChallengesTab';
import { FamilyRewardsTab } from '@/components/family/tabs/FamilyRewardsTab';
import { FamilyAnalyticsTab } from '@/components/family/tabs/FamilyAnalyticsTab';
import { FamilyOverviewTab } from '@/components/family/tabs/FamilyOverviewTab';
import { AddMemberModal } from '@/components/family/AddMemberModal';
import { FeedbackSystem } from '@/components/feedback';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  Trophy, 
  Gift, 
  BarChart3, 
  Home,
  Settings 
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FamilyTab = 'overview' | 'members' | 'habits' | 'challenges' | 'rewards' | 'analytics';

const FAMILY_TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'habits', label: 'Habits', icon: Target },
  { id: 'challenges', label: 'Challenges', icon: Trophy },
  { id: 'rewards', label: 'Rewards', icon: Gift },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
] as const;

export default function FamilyDashboard() {
  const { currentFamily, currentMember, loading, isParent } = useFamily();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<FamilyTab>('overview');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // Handle URL tab parameter
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as FamilyTab;
    if (tabFromUrl && FAMILY_TABS.some(tab => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading family dashboard...</p>
        </div>
      </div>
    );
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
        return <FamilyOverviewTab onAddMember={() => setShowAddMemberModal(true)} />;
      case 'members':
        return <FamilyMembersTab onAddMember={() => setShowAddMemberModal(true)} />;
      case 'habits':
        return <FamilyHabitsTab />;
      case 'challenges':
        return <FamilyChallengesTab />;
      case 'rewards':
        return <FamilyRewardsTab />;
      case 'analytics':
        return <FamilyAnalyticsTab />;
      default:
        return <FamilyOverviewTab onAddMember={() => setShowAddMemberModal(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {currentFamily.name} • {currentFamily.members.filter(m => m.isActive).length} members
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/family/settings">
                <Button variant="outline">
                  <Settings className="w-5 h-5 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {FAMILY_TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as FamilyTab)}
                    className={cn(
                      "flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors",
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600 dark:text-blue-400"
                        : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />

      {/* Feedback System */}
      <FeedbackSystem />
    </div>
  );
}