'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { FamilyHeader } from '@/components/family/FamilyHeader';
import { TouchScreenOptimizer } from '@/components/touch/TouchScreenOptimizer';
import { AddMemberModal } from '@/components/family/AddMemberModal';
import { InviteCodeDisplay } from '@/components/family/InviteCodeDisplay';
import { FeedbackSystem } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { Plus, Settings, Users, BarChart3, UserPlus, User, Trophy, Gift, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

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
          <h2 className={`text-2xl font-bold ${theme.text.primary} mb-4`}>No Family Found</h2>
          <p className={`${theme.text.secondary} mb-6`}>You need to create or join a family first.</p>
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
          ? "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-900 dark:to-purple-900 p-4 md:p-8" 
          : "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4"
      )}>
        {/* Family Name - Prominent at the top */}
        <div className="text-center mb-6 pb-4 border-b-2 border-blue-200 dark:border-blue-800">
          <h1 className={cn(
            "font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text",
            touchMode ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl lg:text-5xl",
            "drop-shadow-sm"
          )}>
            {currentFamily.name}
          </h1>
        </div>
        
        {/* Header - Date and controls only, name is above */}
        <FamilyHeader 
          familyName=""
          date={today}
          touchMode={touchMode}
          onSettingsClick={() => {/* TODO: Implement settings */}}
        />
        
        {/* Combined Navigation Bar */}
        <div className={cn(
          `mb-6 p-4 ${theme.surface.primary} rounded-lg ${theme.shadow.md}`,
          touchMode && "p-6"
        )}>
          <div className="flex items-center justify-between gap-4 overflow-x-auto">
            {/* Left side - Navigation */}
            <div className="flex gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <User className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  <span className="hidden sm:inline">Individual</span>
                  <span className="sm:hidden">Me</span>
                </Button>
              </Link>
              <Link href="/family/members">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <Users className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  Members
                </Button>
              </Link>
              <Link href="/family/habits">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <Target className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  Habits
                </Button>
              </Link>
              <Link href="/family/challenges">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <Trophy className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  Challenges
                </Button>
              </Link>
              <Link href="/family/rewards">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <Gift className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  Rewards
                </Button>
              </Link>
              <Link href="/family/analytics">
                <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                  <BarChart3 className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  Analytics
                </Button>
              </Link>
            </div>
            
            {/* Right side - Actions (for parents) */}
            {isParent && (
              <div className="flex gap-2 items-center">
                <Link href="/family/habits/create">
                  <Button size={touchMode ? "default" : "sm"} className={cn(touchMode && "px-6")}>
                    <Plus className={cn("mr-2", touchMode ? "w-5 h-5" : "w-4 h-4")} />
                    Add Habit
                  </Button>
                </Link>
                <Button 
                  variant="secondary"
                  size={touchMode ? "default" : "sm"}
                  className={cn(touchMode && "px-6")}
                  onClick={() => setShowAddMemberModal(true)}
                >
                  <UserPlus className={cn(touchMode ? "w-5 h-5" : "w-4 h-4")} />
                  <span className="ml-2 hidden sm:inline">Add Member</span>
                </Button>
                <InviteCodeDisplay 
                  variant="inline"
                  showTitle={false}
                  className={cn(
                    "ml-2",
                    touchMode ? "scale-110" : "scale-90"
                  )}
                />
                <Link href="/family/settings">
                  <Button variant="ghost" size={touchMode ? "default" : "sm"}>
                    <Settings className={touchMode ? "w-5 h-5" : "w-4 h-4"} />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Invite Code Section - Card variant for non-touch mode when there's space */}
        {isParent && !touchMode && (
          <div className="mb-6">
            <InviteCodeDisplay 
              variant="card"
              showTitle={true}
              className="max-w-md mx-auto"
            />
          </div>
        )}
        
        
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