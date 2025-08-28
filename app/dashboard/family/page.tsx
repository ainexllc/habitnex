'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { ModernFamilyHeader } from '@/components/family/ModernFamilyHeader';
import { TouchScreenOptimizer } from '@/components/touch/TouchScreenOptimizer';
import { AddMemberModal } from '@/components/family/AddMemberModal';
import { FeedbackSystem } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FamilyDashboardPage() {
  const { currentFamily, currentMember, loading: familyLoading, isParent } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, toggleMemberCompletion, loading: habitsLoading } = useAllFamilyHabits();
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
          <p className="text-gray-600 dark:text-gray-400 mb-6">You need to create or join a family first.</p>
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
      
      {/* Modern Streaming Style Header */}
      <ModernFamilyHeader 
        familyName={currentFamily.name}
        date={today}
        touchMode={touchMode}
        isParent={isParent}
        onAddMemberClick={() => setShowAddMemberModal(true)}
      />
      
      <div className={cn(
        "min-h-screen transition-all duration-300",
        touchMode 
          ? "bg-gray-100 dark:bg-gray-800 p-4 md:p-8" 
          : "bg-gray-50 dark:bg-gray-900 p-4"
      )}>
        
        
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
              onToggleHabit={toggleMemberCompletion}
              className={cn(
                "transition-all duration-300",
                touchMode && "min-h-[400px]",
                selectedMember && selectedMember !== member.id && touchMode && "opacity-50 scale-95"
              )}
            />
          ))}
        </div>
        
        
        {/* Celebration Overlay */}
        {/* TODO: Add celebration animations when habits are completed */}
      </div>
      
      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
      />
      
      {/* Feedback System */}
      <FeedbackSystem />
    </>
  );
}