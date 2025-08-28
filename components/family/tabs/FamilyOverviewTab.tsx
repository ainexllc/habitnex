'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';



import { cn } from '@/lib/utils';

interface FamilyOverviewTabProps {
}

export function FamilyOverviewTab({}: FamilyOverviewTabProps) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, toggleMemberCompletion } = useAllFamilyHabits();

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

    const timeoutMs = currentFamily.settings.autoTimeout * 60 * 1000;
    const interval = setInterval(() => {
      if (Date.now() - lastActivity > timeoutMs) {
        setSelectedMember(null);
      }
    }, 10000);

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
    <div>
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Overview</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Welcome to your family dashboard - {today}</p>
        </div>


      </div>



      {/* Member Zones Grid */}
      <div className={cn(
        "mt-8",
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
    </div>
  );
}