'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyChallenges } from '@/hooks/useFamilyChallenges';
import { useFamilyHabits } from '@/hooks/useFamilyHabits';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { 
  Trophy, 
  Plus, 
  Target, 
  Users, 
  Calendar,
  Play,
  CheckCircle,
  Clock,
  Zap,
  Flag,
  Crown,
  Timer,
  UserCheck,
  Award,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Star,
  Flame,
  Medal,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FamilyChallenge, ChallengeType } from '@/types/family';
import { ChallengeDetailDrawer } from '@/components/workspace/challenges/ChallengeDetailDrawer';

interface WorkspaceChallengesTabProps {
  onCreateChallenge?: () => void;
}

export function WorkspaceChallengesTab({ onCreateChallenge }: WorkspaceChallengesTabProps = {}) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { 
    activeChallenges, 
    upcomingChallenges, 
    completedChallenges, 
    challengeProgress,
    dailyProgress,
    startChallenge,
    completeChallenge,
    joinChallenge,
    getChallengeLeader,
    isChallengeExpiring,
    getChallengeCompletionRate,
    duplicateChallenge,
    restartChallenge,
    loading 
  } = useFamilyChallenges();
  const { habits } = useFamilyHabits();
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'upcoming' | 'completed'>('active');
  const [openDrawerFor, setOpenDrawerFor] = useState<string | null>(null);

  if (!currentFamily || !currentMember) {
    return null;
  }

  const challengeTypeData: Record<
    ChallengeType,
    { icon: React.ReactNode; glow: string; badgeGradient: string; label: string }
  > = {
    streak: {
      icon: <Flame className="w-5 h-5" />,
      glow: 'rgba(255,122,28,0.45)',
      badgeGradient: 'from-[#ff7a1c] to-[#ff9f4a]',
      label: 'Streak',
    },
    total: {
      icon: <Target className="w-5 h-5" />,
      glow: 'rgba(73,197,255,0.45)',
      badgeGradient: 'from-[#49c5ff] to-[#6a5cff]',
      label: 'Total',
    },
    race: {
      icon: <Flag className="w-5 h-5" />,
      glow: 'rgba(226,147,255,0.45)',
      badgeGradient: 'from-[#c46bff] to-[#ff6fb1]',
      label: 'Race',
    },
    collaboration: {
      icon: <Users className="w-5 h-5" />,
      glow: 'rgba(127,232,193,0.45)',
      badgeGradient: 'from-[#7fe8c1] to-[#3cd8a0]',
      label: 'Team',
    },
  };

  const accentButtonClasses =
    'rounded-full bg-[#ff7a1c] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_35px_rgba(255,122,28,0.35)] transition hover:bg-[#ff8a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1c]/70';

  const tabs = [
    {
      key: 'active',
      label: 'Active',
      icon: <Zap className="h-4 w-4" />,
      count: activeChallenges.length,
      gradient: 'from-[#7fe8c1] to-[#3cd8a0]',
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: <Clock className="h-4 w-4" />,
      count: upcomingChallenges.length,
      gradient: 'from-[#49c5ff] to-[#6a5cff]',
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: <Trophy className="h-4 w-4" />,
      count: completedChallenges.length,
      gradient: 'from-[#ff7a1c] to-[#ff9f4a]',
    },
  ] as const;

  const getChallengeList = () => {
    switch (selectedTab) {
      case 'active':
        return activeChallenges;
      case 'upcoming':
        return upcomingChallenges;
      case 'completed':
        return completedChallenges;
      default:
        return [];
    }
  };

  const renderChallengeCard = (challenge: FamilyChallenge) => {
    const progress = challengeProgress[challenge.id] || {};
    const leaderId = getChallengeLeader(challenge.id);
    const leader = currentFamily.members.find(m => m.id === leaderId);
    const isExpiring = isChallengeExpiring(challenge);
    const completionRate = getChallengeCompletionRate(challenge.id);
    const isParticipating = challenge.participantIds.includes(currentMember.id);
    const memberProgress = progress[currentMember.id] || 0;
    
    const challengeHabits = habits.filter(h => challenge.habitIds.includes(h.id));
    const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const totalProgress = Object.values(progress).reduce((sum, val) => sum + (val as number), 0);
    const progressPercentage = Math.min((totalProgress / challenge.target) * 100, 100);

    return (
      <Card
        key={challenge.id}
        className={cn(
          "group relative overflow-hidden rounded-[32px] !border-white/10 !bg-white/[0.06] text-white !shadow-[0_35px_120px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_45px_160px_rgba(0,0,0,0.55)]",
          isExpiring && challenge.status === 'active' && "ring-2 ring-orange-400/80 ring-offset-2 ring-offset-[#0b0c16]"
        )}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, ${challengeTypeData[challenge.type].glow} 0%, transparent 55%)`,
            }}
          />
        </div>

        {/* Status Ribbon */}
        {challenge.status === 'active' && (
          <div className="absolute top-4 -right-12 transform rotate-45 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold py-1 px-12 shadow-md">
            ACTIVE
          </div>
        )}

        <CardHeader className="p-6 pb-4 relative">
          <div className="flex items-start justify-between">
            {/* Challenge Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                {/* Emoji with animation */}
                <div className="relative">
                  <div className="text-5xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {challenge.emoji}
                  </div>
                  {challenge.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                {/* Title and Type */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white leading-relaxed">
                    {challenge.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-black shadow-[0_12px_30px_rgba(0,0,0,0.2)]',
                        challengeTypeData[challenge.type].badgeGradient
                      )}
                    >
                      {challengeTypeData[challenge.type].icon}
                      {challengeTypeData[challenge.type].label}
                    </span>
                    {isExpiring && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white animate-pulse">
                        <Timer className="w-3 h-3" />
                        {daysLeft}d left
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-white/70 text-sm leading-loose mt-3">
                {challenge.description}
              </p>
            </div>

            {/* Points Badge */}
            {challenge.bonusPoints > 0 && (
              <div className="ml-4 flex flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                <Award className="mb-2 h-6 w-6 text-[#ffb876]" />
                <span className="text-sm font-semibold text-[#ffb876]">+{challenge.bonusPoints}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-2 space-y-5">
          {/* Progress Section */}
          {challenge.status === 'active' && (
            <div className="bg-white/8 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-white/60" />
                  <span className="text-sm font-medium text-white/70">
                    Progress
                  </span>
                </div>
                <span className="text-sm font-bold text-white">
                  {totalProgress}/{challenge.target}
                </span>
              </div>
              
              <Progress
                value={progressPercentage}
                className="h-3 rounded-full bg-white/10"
                style={{
                  background: `linear-gradient(to right, ${progressPercentage > 75 ? '#10b981' : progressPercentage > 50 ? '#3b82f6' : progressPercentage > 25 ? '#f59e0b' : '#ef4444'} ${progressPercentage}%, transparent ${progressPercentage}%)`
                }}
              />

              {/* Leader Board Mini */}
              {leader && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-white/60">Leader:</span>
                    <span className="text-xs font-semibold" style={{ color: leader.color }}>
                      {leader.displayName}
                    </span>
                  </div>
                  <span className="text-xs text-white/60">
                    {progress[leader.id] || 0} points
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Participants */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex -space-x-1">
              {challenge.participantIds.slice(0, 5).map((participantId, index) => {
                const participant = currentFamily.members.find(m => m.id === participantId);
                if (!participant) return null;
                return (
                  <div
                    key={participantId}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 text-xs font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                    style={{ 
                      backgroundColor: participant.color,
                      zIndex: 5 - index
                    }}
                    title={participant.displayName}
                  >
                    {participant.displayName[0]}
                  </div>
                );
              })}
              {challenge.participantIds.length > 5 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-xs font-bold text-white/80">
                  +{challenge.participantIds.length - 5}
                </div>
              )}
            </div>

            {/* Challenge Info */}
            <div className="flex items-center gap-5 text-xs text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{challenge.duration} days</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{challenge.target} goal</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {/* Parent Controls */}
            {isParent && challenge.status === 'upcoming' && (
              <Button
                onClick={() => startChallenge(challenge.id)}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="flex-1 rounded-full bg-[#7fe8c1]/80 px-4 py-2 text-sm font-semibold text-[#04251a] transition hover:bg-[#7fe8c1] disabled:opacity-60"
              >
                <Play className="mr-2 h-4 w-4" />
                Start challenge
              </Button>
            )}
            
            {isParent && challenge.status === 'active' && completionRate >= 100 && (
              <Button
                onClick={() => completeChallenge(challenge.id, leaderId || undefined)}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="flex-1 rounded-full bg-[#49c5ff]/80 px-4 py-2 text-sm font-semibold text-[#04192c] transition hover:bg-[#49c5ff] disabled:opacity-60"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete challenge
              </Button>
            )}

            {/* Member Controls */}
            {!isParent && challenge.status === 'upcoming' && !isParticipating && (
              <Button
                onClick={() => joinChallenge(challenge.id, currentMember.id)}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="flex-1 rounded-full bg-[#c46bff]/80 px-4 py-2 text-sm font-semibold text-[#2b0a3d] transition hover:bg-[#c46bff] disabled:opacity-60"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Join challenge
              </Button>
            )}

            {/* View Details (for all) */}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/15"
              onClick={() => setOpenDrawerFor(challenge.id)}
            >
              View details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 text-white">
      <section className="mb-10 rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,122,28,0.14),transparent_65%),_rgba(12,13,22,0.9)] px-6 py-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.48em] text-[#ff7a1c]">Challenge arena</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[36px]">Family challenges</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {activeChallenges.length
                ? `Running ${activeChallenges.length} live challenge${activeChallenges.length === 1 ? '' : 's'} with ${completedChallenges.length} already conquered.`
                : 'Launch a new challenge to spark friendly competition and keep everyone engaged.'}
            </p>
          </div>
          {isParent && (
            <Button onClick={onCreateChallenge} variant="ghost" className={accentButtonClasses}>
              <Plus className="h-4 w-4" />
              <span>Create challenge</span>
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Active</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activeChallenges.length}</p>
            <p className="text-sm text-white/60">In progress right now</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Queued</p>
            <p className="mt-2 text-2xl font-semibold text-white">{upcomingChallenges.length}</p>
            <p className="text-sm text-white/60">Scheduled to start</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Victories</p>
            <p className="mt-2 text-2xl font-semibold text-[#7fe8c1]">{completedChallenges.length}</p>
            <p className="text-sm text-white/60">Completed challenges</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={cn(
                'inline-flex flex-1 min-w-[140px] items-center justify-between gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/12 hover:text-white',
                selectedTab === tab.key && 'bg-gradient-to-r text-black shadow-[0_12px_35px_rgba(0,0,0,0.35)]',
                selectedTab === tab.key && tab.gradient
              )}
              type="button"
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </span>
              <span
                className={cn(
                  'rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold',
                  selectedTab === tab.key ? 'text-black/80' : 'text-white/60'
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Challenges Grid */}
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        {getChallengeList().length === 0 ? (
          <div className="col-span-full text-center">
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-10 py-16 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
                <Trophy className="h-10 w-10 text-white/60" />
              </div>
              <h3 className="text-2xl font-semibold">
                {selectedTab === 'active'
                  ? 'No active challenges yet'
                  : selectedTab === 'upcoming'
                    ? 'Nothing queued up yet'
                    : 'No victories logged yet'}
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/70">
                {selectedTab === 'active'
                  ? 'Start a challenge to add a spark of friendly competition to your family routines.'
                  : selectedTab === 'upcoming'
                    ? 'Queue a challenge so the next big push is already on the calendar.'
                    : 'Complete your first challenge to celebrate it here with the whole crew.'}
              </p>
              {isParent && selectedTab !== 'completed' && (
                <Button onClick={onCreateChallenge} variant="ghost" className={`mt-6 ${accentButtonClasses}`}>
                  <Sparkles className="h-4 w-4" />
                  <span>Create your first challenge</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          getChallengeList().map(renderChallengeCard)
        )}
      </div>

      {/* Detail Drawer */}
      <ChallengeDetailDrawer
        open={!!openDrawerFor}
        onClose={() => setOpenDrawerFor(null)}
        challenge={[...activeChallenges, ...upcomingChallenges, ...completedChallenges].find(c => c.id === openDrawerFor) || null}
        progress={openDrawerFor ? challengeProgress[openDrawerFor] : undefined}
        daily={openDrawerFor ? dailyProgress[openDrawerFor] : undefined}
        onJoin={joinChallenge}
        onComplete={completeChallenge}
        onStart={startChallenge}
        onDuplicate={(ch) => duplicateChallenge(ch)}
        onRestart={(ch) => restartChallenge(ch)}
        loading={loading}
      />
    </div>
  );
}
