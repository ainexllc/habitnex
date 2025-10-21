'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { MemberModal } from '@/components/family/MemberModal';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { FamilyMember } from '@/types/family';
import { Button } from '@/components/ui/Button';
import {
  Award,
  Clock,
  Crown,
  Edit2,
  Flame,
  Sparkles,
  Star,
  Trash2,
  Trophy,
  UserPlus,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMembersTabProps {
  onAddMember: () => void;
}

const roleStyles: Record<
  FamilyMember['role'],
  { label: string; badgeClasses: string; icon: ReactNode }
> = {
  parent: {
    label: 'Parent',
    badgeClasses:
      'border-[#ffb876]/60 bg-[#ffb876]/12 text-[#ffddab] shadow-[0_0_18px_rgba(255,186,118,0.25)]',
    icon: <Crown className="h-3.5 w-3.5" />,
  },
  adult: {
    label: 'Adult',
    badgeClasses:
      'border-[#8ea2ff]/60 bg-[#8ea2ff]/10 text-[#c7d3ff] shadow-[0_0_18px_rgba(142,162,255,0.25)]',
    icon: <Users className="h-3.5 w-3.5" />,
  },
  teen: {
    label: 'Teen',
    badgeClasses:
      'border-[#f19dff]/60 bg-[#f19dff]/12 text-[#f6d4ff] shadow-[0_0_18px_rgba(241,157,255,0.25)]',
    icon: <Star className="h-3.5 w-3.5" />,
  },
  child: {
    label: 'Child',
    badgeClasses:
      'border-[#7fe8c1]/60 bg-[#7fe8c1]/12 text-[#c5f7e5] shadow-[0_0_18px_rgba(127,232,193,0.25)]',
    icon: <Trophy className="h-3.5 w-3.5" />,
  },
};

export function FamilyMembersTab({ onAddMember }: FamilyMembersTabProps) {
  const { currentFamily, currentMember, isParent, removeMember } = useFamily();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [removingMember, setRemovingMember] = useState(false);

  if (!currentFamily || !currentMember) {
    return null;
  }

  const members = currentFamily.members.filter((member) => member.isActive);

  const { activeStreaks, topStreakMember, totalPoints } = useMemo(() => {
    if (!members.length) {
      return {
        activeStreaks: 0,
        topStreakMember: null as FamilyMember | null,
        totalPoints: 0,
      };
    }

    const active = members.filter((member) => (member.stats?.currentStreak || 0) > 0).length;
    const topMember = members.reduce((acc, member) => {
      const streak = member.stats?.currentStreak || 0;
      if (!acc || streak > (acc.stats?.currentStreak || 0)) {
        return member;
      }
      return acc;
    }, members[0]);
    const points = members.reduce((sum, member) => sum + (member.stats?.totalPoints || 0), 0);

    return {
      activeStreaks: active,
      topStreakMember: topMember,
      totalPoints: points,
    };
  }, [members]);

  const isFamilyCreator = currentFamily?.createdBy === currentMember?.userId;

  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleRemoveMember = (member: FamilyMember) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemovingMember(true);
      await removeMember(memberToRemove.id);
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
    } finally {
      setRemovingMember(false);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
  };

  const accentButtonClasses =
    'rounded-full bg-[#ff7a1c] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_35px_rgba(255,122,28,0.35)] transition hover:bg-[#ff8a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1c]/70';

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,122,28,0.14),transparent_60%),_rgba(12,13,22,0.9)] px-6 py-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.48em] text-[#ff7a1c]">Family roster</p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-[36px]">Members</h2>
            <p className="mt-3 text-sm text-white/70">
              Celebrate every role in your orbit and keep the crew energized.
            </p>
          </div>
          {isParent && (
            <Button onClick={onAddMember} variant="ghost" className={accentButtonClasses}>
              <UserPlus className="h-4 w-4" />
              <span>Add member</span>
            </Button>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Active members</p>
            <p className="mt-2 text-2xl font-semibold text-white">{members.length}</p>
            <p className="text-sm text-white/60">Ready to earn points today</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Active streaks</p>
            <p className="mt-2 text-2xl font-semibold text-white">{activeStreaks}</p>
            <p className="text-sm text-white/60">Keeping the momentum alive</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Collective points</p>
            <p className="mt-2 text-2xl font-semibold text-white">{totalPoints}</p>
            <p className="text-sm text-white/60">
              Top streak:{' '}
              {topStreakMember
                ? `${topStreakMember.displayName} · ${topStreakMember.stats?.currentStreak || 0}d`
                : '—'}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {members.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {members.map((member) => {
              const role = roleStyles[member.role];
              const focusHabits = member.rewardProfile?.dailyFocusHabitIds?.length ?? 0;
              const favoriteEmojis = member.preferences?.favoriteEmojis?.slice(0, 3) ?? [];
              const lastActiveLabel = member.stats?.lastActive
                ? new Date(member.stats.lastActive.toDate()).toLocaleDateString()
                : '—';

              return (
                <div
                  key={member.id}
                  className="relative flex h-full flex-col gap-6 rounded-3xl border border-white/7 bg-white/[0.06] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_45px_140px_rgba(0,0,0,0.5)]"
                >
                  <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="flex items-start justify-between gap-4 pt-1">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <ProfileImage
                          name={member.displayName}
                          profileImageUrl={member.profileImageUrl}
                          color={member.color}
                          size={76}
                          showBorder
                          borderColor="rgba(255,255,255,0.25)"
                          className="shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
                        />
                        {member.id === currentMember.id && (
                          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white/40 bg-white/20 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
                            You
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{member.displayName}</h3>
                        <p className="text-sm text-white/60">{member.name}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                              role.badgeClasses
                            )}
                          >
                            {role.icon}
                            <span>{role.label}</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                            <Star className="h-3 w-3 text-[#ffb876]" />
                            Level {member.stats?.level ?? 1}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {isParent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMember(member)}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white/80 hover:bg-white/15 hover:text-white"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {isFamilyCreator && member.id !== currentMember.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(member)}
                          className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Points</p>
                      <p className="mt-1 text-lg font-semibold">
                        {member.stats?.totalPoints ?? 0}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Streak</p>
                      <div className="mt-1 flex items-center justify-center gap-1 text-lg font-semibold">
                        <Flame className="h-4 w-4 text-orange-300" />
                        <span>{member.stats?.currentStreak ?? 0}d</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-3 text-center">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/60">Rewards</p>
                      <div className="mt-1 flex items-center justify-center gap-1 text-lg font-semibold">
                        <Award className="h-4 w-4 text-[#ffb876]" />
                        <span>{member.stats?.rewardsEarned ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#ffb876]" />
                      <span>{focusHabits} focus habit{focusHabits === 1 ? '' : 's'}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                      <Clock className="h-3.5 w-3.5 text-white/60" />
                      <span>Active {lastActiveLabel}</span>
                    </span>
                    {member.preferences?.motivationStyle && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                          Motivation
                        </span>
                        <span className="capitalize">
                          {member.preferences.motivationStyle.replace('-', ' ')}
                        </span>
                      </span>
                    )}
                    {favoriteEmojis.length > 0 && (
                      <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                        <span className="text-base leading-none">{favoriteEmojis.join(' ')}</span>
                        <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                          Favorite vibes
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.04] px-8 py-16 text-center text-white shadow-[0_35px_120px_rgba(0,0,0,0.4)]">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10 text-3xl">
              <Users className="h-10 w-10 text-white/70" />
            </div>
            <h3 className="mt-6 text-2xl font-semibold">Your family awaits</h3>
            <p className="mt-2 max-w-md text-sm text-white/70">
              Invite your crew, share rewards, and build daily rituals together. Add your first
              member to get the orbit spinning.
            </p>
            {isParent && (
              <Button
                onClick={onAddMember}
                variant="ghost"
                className={`mt-6 ${accentButtonClasses}`}
              >
                <UserPlus className="h-4 w-4" />
                <span>Add first member</span>
              </Button>
            )}
          </div>
        )}
      </section>

      <MemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />

      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0c0d16]/95 p-6 text-white shadow-[0_45px_140px_rgba(0,0,0,0.55)]">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
                <Trash2 className="h-6 w-6 text-red-300" />
              </div>
              <h3 className="text-lg font-semibold">Remove family member</h3>
              <p className="mt-2 text-sm text-white/70">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-white">{memberToRemove.displayName}</span> from
                the family? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelRemoveMember}
                  className="flex-1 rounded-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
                  disabled={removingMember}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRemoveMember}
                  variant="ghost"
                  className="flex-1 rounded-full bg-red-500 text-white shadow-[0_12px_30px_rgba(239,68,68,0.35)] hover:bg-red-400"
                  disabled={removingMember}
                >
                  {removingMember ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                      Removing…
                    </div>
                  ) : (
                    'Remove member'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
