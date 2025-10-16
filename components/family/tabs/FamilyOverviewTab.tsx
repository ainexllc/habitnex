'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { HabitDetailsModal } from '@/components/habits/HabitDetailsModal';
import { FamilyHabit, MemberRewardProfile } from '@/types/family';
import { cn } from '@/lib/utils';
import { useRewardMomentum } from '@/hooks/useRewardMomentum';
import { RewardMomentumStrip } from '@/components/family/RewardMomentumStrip';
import { ManageFocusHabitsModal } from '@/components/family/modals/ManageFocusHabitsModal';

interface FamilyOverviewTabProps {
}

export function FamilyOverviewTab({}: FamilyOverviewTabProps) {
  const { currentFamily, currentMember, isParent, updateFamilyMember } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, toggleMemberCompletion, getHabitCompletion } = useAllFamilyHabits();
  const { progressMap, defaultFocusMap } = useRewardMomentum();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedHabit, setSelectedHabit] = useState<(FamilyHabit & { completed: boolean }) | null>(null);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [completingHabitId, setCompletingHabitId] = useState<string | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [savingFocus, setSavingFocus] = useState(false);

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

    const timeoutMs = currentFamily.settings.autoTimeout * 60 * 1000;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeoutMs) {
        setSelectedMember(null);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [touchMode, currentFamily?.settings.autoTimeout, lastActivity]);

  const handleHabitClick = (habit: FamilyHabit & { completed: boolean }) => {
    setSelectedHabit(habit);
    setShowHabitModal(true);
  };

  const handleCompleteHabit = async () => {
    if (!selectedHabit || !currentMember) return;

    try {
      setCompletingHabitId(selectedHabit.id);
      await toggleMemberCompletion(selectedHabit.id, currentMember.id, selectedHabit.completed);
      setShowHabitModal(false);
      setSelectedHabit(null);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabitId(null);
    }
  };

  const handleSaveFocus = async (updates: Record<string, MemberRewardProfile | undefined>) => {
    if (Object.keys(updates).length === 0) {
      setFocusModalOpen(false);
      return;
    }
    try {
      setSavingFocus(true);
      const entries = Object.entries(updates);
      for (const [memberId, profile] of entries) {
        await updateFamilyMember(memberId, { rewardProfile: profile ?? { dailyFocusHabitIds: [], weeklyGoal: 4 } });
      }
      setFocusModalOpen(false);
    } catch (error) {
      console.error('Failed to save focus habits:', error);
    } finally {
      setSavingFocus(false);
    }
  };

  if (!currentFamily || !currentMember) {
    return null;
  }

  const members = currentFamily.members.filter(m => m.isActive);

  return (
    <div className="px-6">
      <RewardMomentumStrip
        members={members}
        progressMap={progressMap}
        onConfigure={isParent ? () => setFocusModalOpen(true) : undefined}
        isParent={isParent}
      />

      {/* Member Zones Grid - Compact spacing between cards */}
      <div className={cn(
        "grid gap-2 md:gap-3",
        touchMode ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        members.length === 1 && "grid-cols-1 max-w-md mx-auto",
        members.length === 2 && "md:grid-cols-2 max-w-4xl mx-auto",
        members.length === 3 && "lg:grid-cols-3",
        members.length >= 4 && "xl:grid-cols-3 2xl:grid-cols-4"
      )}>
        {members.map((member) => (
          <FamilyMemberZone
            key={member.id}
            member={member}
            habits={getHabitsByMember(member.id)}
            stats={getMemberStats(member.id)}
            toggleCompletion={toggleMemberCompletion}
            getHabitCompletion={getHabitCompletion}
            texturePattern={currentFamily.settings.cardTexture}
            touchMode={touchMode}
            rewardProgress={progressMap[member.id]}
            isExpanded={selectedMember === member.id}
            onExpand={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
            className={cn(
              "transition-all duration-300",
              touchMode && "min-h-[350px]",
              selectedMember && selectedMember !== member.id && touchMode && "opacity-50 scale-95"
            )}
          />
        ))}
      </div>

      {/* Habit Details Modal */}
      <HabitDetailsModal
        isOpen={showHabitModal}
        onClose={() => {
          setShowHabitModal(false);
          setSelectedHabit(null);
        }}
        habit={selectedHabit}
        onComplete={handleCompleteHabit}
        memberName={selectedHabit ? currentFamily.members.find(m => m.id === selectedHabit.assignedMembers?.[0])?.displayName : undefined}
        memberColor={selectedHabit ? currentFamily.members.find(m => m.id === selectedHabit.assignedMembers?.[0])?.color : undefined}
        isCompleting={completingHabitId === selectedHabit?.id}
      />
    </div>
  );
}