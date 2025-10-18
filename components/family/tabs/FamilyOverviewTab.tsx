'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { FamilyMemberZone } from '@/components/family/FamilyMemberZone';
import { MemberRewardProfile } from '@/types/family';
import { cn } from '@/lib/utils';
import { useRewardMomentum } from '@/hooks/useRewardMomentum';
import { RewardMomentumStrip } from '@/components/family/RewardMomentumStrip';
import { ManageFocusHabitsModal } from '@/components/family/modals/ManageFocusHabitsModal';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { ArrowRight, CheckCircle, Flame, Plus, Sparkles } from 'lucide-react';

interface FamilyOverviewTabProps {}

export function FamilyOverviewTab({}: FamilyOverviewTabProps) {
  const router = useRouter();
  const { currentFamily, currentMember, isParent, updateFamilyMember } = useFamily();
  const { allHabits, getHabitsByMember, getMemberStats, toggleMemberCompletion, getHabitCompletion } = useAllFamilyHabits();
  const { progressMap, defaultFocusMap } = useRewardMomentum();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [touchMode, setTouchMode] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [savingFocus, setSavingFocus] = useState(false);

  useEffect(() => {
    if (currentFamily?.settings.touchScreenMode) {
      setTouchMode(true);
    }
  }, [currentFamily?.settings.touchScreenMode]);

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

  const handleSaveFocus = async (updates: Record<string, MemberRewardProfile | undefined>) => {
    if (Object.keys(updates).length === 0) {
      setFocusModalOpen(false);
      return;
    }

    try {
      setSavingFocus(true);
      const entries = Object.entries(updates);
      for (const [memberId, profile] of entries) {
        await updateFamilyMember(memberId, {
          rewardProfile: profile ?? { dailyFocusHabitIds: [], weeklyGoal: 4 },
        });
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

  const members = currentFamily.members.filter((m) => m.isActive);
  const isSolo = members.length === 1;
  const soloMember = isSolo ? members[0] : null;
  const soloProgress = soloMember ? progressMap[soloMember.id] : undefined;
  const soloStats = soloMember ? getMemberStats(soloMember.id) : null;
  const soloHabits = soloMember ? getHabitsByMember(soloMember.id) : [];
  const soloNextHabit = soloHabits.find((habit) => !habit.completed);
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const handleNavigateToHabits = () => router.push('/workspace?tab=habits');
  const handleNavigateToAnalytics = () => router.push('/workspace?tab=analytics');

  const overviewContent = isSolo ? (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,122,28,0.08),transparent_55%),_rgba(10,11,20,0.92)] px-6 py-8 shadow-[0_50px_140px_rgba(0,0,0,0.55)] sm:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.48em] text-[#ff7a1c]">Solo Mode</span>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-[38px]">
              Welcome back, {soloMember?.displayName ?? 'Friend'}
            </h2>
            <p className="mt-2 text-sm text-[#9ea1b5]">Here’s your day at a glance · {formattedDate}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#ff7a1c]">Today</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {soloStats ? `${soloStats.completed}/${soloStats.total}` : '0/0'}
              </p>
              <p className="text-[11px] text-[#9ea1b5]">Habits complete</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#ff7a1c]">Streak</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {soloMember?.stats?.currentStreak ?? 0}d
              </p>
              <p className="text-[11px] text-[#9ea1b5]">Current streak</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner shadow-black/30">
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#ff7a1c]">Lifetime</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {soloStats?.totalPoints ?? soloMember?.stats?.totalPoints ?? 0}
              </p>
              <p className="text-[11px] text-[#9ea1b5]">Total points</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setFocusModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#ff7a1c] px-5 py-3 text-sm font-semibold text-black hover:bg-[#ff8a35]"
          >
            <Sparkles className="h-4 w-4" />
            Plan today’s focus
          </Button>
          <Button
            variant="ghost"
            onClick={handleNavigateToHabits}
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white"
          >
            Review habits
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[24px] border border-white/5 bg-[#0d0d15]/90 px-6 py-6 shadow-[0_30px_110px_rgba(0,0,0,0.5)]">
          <header className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <span className="text-[11px] uppercase tracking-[0.35em] text-[#ff7a1c]">Daily Boost</span>
              <h3 className="mt-2 text-lg font-semibold text-white">Stay on track to unlock rewards</h3>
            </div>
            {isParent && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full border border-[#ff7a1c]/40 bg-[#ff7a1c]/10 text-[#ffb876] hover:bg-[#ff7a1c]/20"
                onClick={() => setFocusModalOpen(true)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Manage focus habits
              </Button>
            )}
          </header>

          <div className="mt-4 space-y-3">
            {soloProgress?.focusHabits?.length ? (
              soloProgress.focusHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-white/90"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{habit.emoji}</span>
                    <div>
                      <p className="font-medium">{habit.name}</p>
                      <p className="text-xs text-[#98a0b3]">
                        {habit.completed ? 'Completed today' : 'Waiting for your check-in'}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#ffbb7b]">
                    Focus
                  </span>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#ff7a1c]/40 bg-[#ff7a1c]/5 px-5 py-6 text-center text-sm text-[#ffbb7b]">
                <p className="font-medium text-[#ffd7ac]">No focus habits selected yet.</p>
                <p className="mt-2 text-xs text-[#e8a86a]">
                  Choose up to three habits to earn a boost when you complete them all.
                </p>
                <Button
                  size="sm"
                  className="mt-4 rounded-full bg-[#ff7a1c] px-4 py-2 text-xs font-semibold text-black hover:bg-[#ff8a35]"
                  onClick={() => setFocusModalOpen(true)}
                >
                  Pick focus habits
                </Button>
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2 text-xs text-[#8a90a4]">
            <div className="flex items-center justify-between">
              <span>Weekly boosts</span>
              <span>
                {soloProgress?.weekly.tokens ?? 0}/{soloProgress?.weekly.goal ?? 4}
                {soloProgress?.weekly.readyForReward ? ' · Ready for reward!' : ''}
              </span>
            </div>
            <Progress
              value={soloProgress?.weekly.tokens ?? 0}
              max={Math.max(soloProgress?.weekly.goal ?? 4, 1)}
              className="h-2 rounded-full bg-[#1f1f29]"
            />
            <div className="flex items-center gap-2 text-[10px]">
              {(soloProgress?.weekly.history ?? []).map((day) => (
                <span
                  key={day.date}
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border border-white/10',
                    day.earned ? 'bg-[#ff7a1c] text-black' : 'bg-white/5 text-[#5e6275]'
                  )}
                >
                  {day.earned ? '★' : '·'}
                </span>
              ))}
            </div>
            <p className="mt-2 flex items-center gap-2 text-[11px] text-[#6d7387]">
              <Flame className="h-4 w-4 text-[#ff7a1c]" />
              Monthly boosts: {soloProgress?.monthlyTokens ?? 0}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/5 bg-[#0c0d13]/90 px-6 py-6 shadow-[0_30px_110px_rgba(0,0,0,0.5)]">
          <span className="text-[11px] uppercase tracking-[0.35em] text-[#ff7a1c]">Next steps</span>
          <h3 className="mt-2 text-lg font-semibold text-white">Keep your momentum going</h3>
          <div className="mt-4 space-y-4 text-sm text-[#d5d8e6]">
            {soloNextHabit ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.24em] text-[#ffbb7b]">Up next</p>
                <div className="mt-2 flex items-center gap-3 text-white">
                  <span className="text-xl">{soloNextHabit.emoji}</span>
                  <div>
                    <p className="font-semibold">{soloNextHabit.name}</p>
                    <p className="text-xs text-[#98a0b3]">Tap the card below to log this habit when you’re done.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#3a3a45] bg-[#0f1017] px-4 py-4 text-center text-sm text-[#8a90a4]">
                <p className="font-medium text-white">No habits scheduled today.</p>
                <p className="mt-2 text-xs text-[#8a90a4]">Add a habit to give yourself something to celebrate.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4 rounded-full border-[#ff7a1c]/40 text-[#ff7a1c] hover:border-[#ff7a1c] hover:bg-[#ff7a1c]/10"
                  onClick={handleNavigateToHabits}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add a habit
                </Button>
              </div>
            )}

            <div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-4 text-xs text-[#9ea1b5]">
              <p className="flex items-center gap-2 text-sm text-white">
                <CheckCircle className="h-4 w-4 text-[#ff7a1c]" />
                Yesterday’s recap
              </p>
              <p className="mt-2">
                You’ve earned {soloProgress?.weekly.tokens ?? 0} boosts this week. Review analytics to spot trends.
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="mt-3 inline-flex items-center gap-2 text-xs text-[#ff7a1c] hover:text-[#ff9a45]"
                onClick={handleNavigateToAnalytics}
              >
                View insights
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl">
        {soloMember && (
          <FamilyMemberZone
            member={soloMember}
            habits={soloHabits}
            stats={soloStats ?? { completed: 0, total: 0, completionRate: 0, totalPoints: 0, pending: 0 }}
            toggleCompletion={toggleMemberCompletion}
            getHabitCompletion={getHabitCompletion}
            texturePattern={currentFamily.settings.cardTexture}
            touchMode={touchMode}
            rewardProgress={soloProgress}
            isExpanded
            onExpand={() => undefined}
            className="rounded-[24px] border border-white/10 bg-[#0c0d13]/90 shadow-[0_30px_110px_rgba(0,0,0,0.5)]"
          />
        )}
      </section>
    </div>
  ) : (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
      <RewardMomentumStrip
        members={members}
        progressMap={progressMap}
        onConfigure={isParent ? () => setFocusModalOpen(true) : undefined}
        isParent={isParent}
        className="shadow-[0_32px_120px_rgba(0,0,0,0.45)]"
      />

      <div
        className={cn(
          'grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          touchMode && 'grid-cols-1',
          members.length === 2 && 'lg:grid-cols-2 xl:grid-cols-2',
          members.length <= 1 && 'grid-cols-1'
        )}
      >
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
              'min-h-[310px] rounded-[24px] border border-white/10 bg-[#0c0d13]/85 shadow-[0_30px_110px_rgba(0,0,0,0.35)] transition-all duration-300',
              selectedMember && selectedMember !== member.id && 'opacity-60'
            )}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(isSolo ? 'px-4 pb-16 sm:px-6 lg:px-0' : 'px-6')}>
      {overviewContent}

      <ManageFocusHabitsModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        members={members}
        habits={allHabits}
        defaultFocus={defaultFocusMap}
        onSave={handleSaveFocus}
        saving={savingFocus}
      />
    </div>
  );
}
