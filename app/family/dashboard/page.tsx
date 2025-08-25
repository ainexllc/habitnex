'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { FamilyHeader } from '@/components/family/FamilyHeader';
import { TouchScreenOptimizer } from '@/components/touch/TouchScreenOptimizer';
import { EmergencyButton } from '@/components/touch/EmergencyButton';
import { FamilyStats } from '@/components/family/FamilyStats';
import { AddMemberModal } from '@/components/family/AddMemberModal';
import { Button } from '@/components/ui/Button';
import { Plus, Settings, Users, Trophy, BarChart3, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FamilyDashboardPage() {
  const { currentFamily, currentMember, loading: familyLoading, isParent } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, loading: habitsLoading } = useAllFamilyHabits();
  const { activeChallenges, challengeProgress } = useFamilyChallenges();
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  
  const loading = familyLoading || habitsLoading;
  
  // Touch screen optimization
  useEffect(() => {
    if (currentFamily?.settings.touchScreenMode) {
      setTouchMode(true);
    }
  }, [currentFamily?.settings.touchScreenMode]);
  
  // Activity tracking for auto-timeout
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('keydown', handleActivity);
    
    return () => {
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);
  
  // Auto-timeout for touch screens
  useEffect(() => {
    if (!touchMode || !currentFamily?.settings.autoTimeout) return;
    
    const timeoutMs = currentFamily.settings.autoTimeout * 60 * 1000; // Convert to milliseconds
    
    const checkTimeout = () => {
      if (Date.now() - lastActivity > timeoutMs) {
        setSelectedMember(null); // Return to main view
      }
    };
    
    const interval = setInterval(checkTimeout, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [touchMode, currentFamily?.settings.autoTimeout, lastActivity]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading family dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!currentFamily || !currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Family Found</h2>
          <p className="text-gray-600 mb-6">You need to create or join a family first.</p>
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
  
  const members = currentFamily.members.filter(m => m.isActive);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <>
      {touchMode && <TouchScreenOptimizer />}
      
      <div className={cn(
        "min-h-screen transition-all duration-300",
        touchMode 
          ? "bg-gradient-to-br from-blue-100 to-purple-100 p-4 md:p-8" 
          : "bg-gradient-to-br from-blue-50 to-indigo-100 p-4"
      )}>
        {/* Header */}
        <FamilyHeader 
          familyName={currentFamily.name}
          date={today}
          touchMode={touchMode}
          onSettingsClick={() => {/* TODO: Implement settings */}}
        />
        
        {/* Quick Links Bar - Always visible */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <Link href="/family/members">
            <Button variant="outline" size="sm">
              <Users className="w-4 h-4 mr-2" />
              View Members
            </Button>
          </Link>
          {isParent && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowAddMemberModal(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </>
          )}
        </div>
        
        {/* Emergency Button for Touch Screens */}
        {touchMode && (
          <EmergencyButton />
        )}
        
        {/* Family Stats Overview */}
        <FamilyStats 
          members={members}
          getMemberStats={getMemberStats}
          touchMode={touchMode}
          className="mb-6"
        />
        
        {/* Member Zones Grid */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          touchMode ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
          members.length === 2 && "md:grid-cols-2",
          members.length === 3 && "lg:grid-cols-3",
          members.length >= 4 && "xl:grid-cols-4"
        )}>
          {members.map((member) => (
            <FamilyMemberZone
              key={member.id}
              member={member}
              habits={getHabitsByMember(member.id)}
              stats={getMemberStats(member.id)}
              touchMode={touchMode}
              isExpanded={selectedMember === member.id}
              onExpand={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
              className={cn(
                "transition-all duration-300",
                touchMode && "min-h-[400px]",
                selectedMember && selectedMember !== member.id && touchMode && "opacity-50 scale-95"
              )}
            />
          ))}
        </div>
        
        {/* Quick Actions Bar */}
        {isParent && !touchMode && (
          <div className="fixed bottom-6 right-6 flex flex-col space-y-2">
            <Link href="/family/habits/create">
              <Button size="lg" className="rounded-full shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Habit
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="rounded-full shadow-lg"
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Add Member
            </Button>
            <Link href="/family/challenges">
              <Button variant="outline" size="lg" className="rounded-full shadow-lg">
                <Trophy className="w-5 h-5 mr-2" />
                Challenges
              </Button>
            </Link>
            <Link href="/family/analytics">
              <Button variant="outline" size="lg" className="rounded-full shadow-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                Analytics
              </Button>
            </Link>
            <Link href="/family/members">
              <Button variant="outline" size="lg" className="rounded-full shadow-lg">
                <Users className="w-5 h-5 mr-2" />
                Members
              </Button>
            </Link>
            <Link href="/family/settings">
              <Button variant="outline" size="lg" className="rounded-full shadow-lg">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        )}
        
        {/* Touch Mode Quick Actions */}
        {isParent && touchMode && (
          <div className="mt-8 flex justify-center space-x-4 flex-wrap">
            <Link href="/family/habits/create">
              <Button size="lg" className="px-8 py-4 text-lg mb-2">
                <Plus className="w-6 h-6 mr-2" />
                Add New Habit
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="px-8 py-4 text-lg mb-2"
              onClick={() => setShowAddMemberModal(true)}
            >
              <UserPlus className="w-6 h-6 mr-2" />
              Add Member
            </Button>
            <Link href="/family/rewards/create">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg mb-2">
                <Plus className="w-6 h-6 mr-2" />
                Add Reward
              </Button>
            </Link>
            <Link href="/family/challenges/create">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg mb-2">
                <Trophy className="w-6 h-6 mr-2" />
                Create Challenge
              </Button>
            </Link>
            <Link href="/family/analytics">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg mb-2">
                <BarChart3 className="w-6 h-6 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Link href="/family/members">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg mb-2">
                <Users className="w-6 h-6 mr-2" />
                Manage Members
              </Button>
            </Link>
          </div>
        )}
        
        {/* Celebration Overlay */}
        {/* TODO: Add celebration animations when habits are completed */}
      </div>
      
      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />
    </>
  );
}