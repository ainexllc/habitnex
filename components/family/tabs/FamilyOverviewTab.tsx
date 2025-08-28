'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { ModernFamilyHeader } from '@/components/family/ModernFamilyHeader';
import { TouchScreenOptimizer } from '@/components/touch/TouchScreenOptimizer';
import { cn } from '@/lib/utils';

interface FamilyOverviewTabProps {
  onAddMember: () => void;
}

export function FamilyOverviewTab({ onAddMember }: FamilyOverviewTabProps) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, toggleMemberCompletion, loading: habitsLoading } = useAllFamilyHabits();
  const { activeChallenges, challengeProgress } = useFamilyChallenges();
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

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

  if (!currentFamily || !currentMember) {
    return null;
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
        onAddMemberClick={onAddMember}
      />
      
      <div className={cn(
        "transition-all duration-300 -mt-6", // Negative margin to integrate with tab layout
        touchMode 
          ? "bg-transparent p-4 md:p-8" 
          : "bg-transparent p-4"
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
    </>
  );
}