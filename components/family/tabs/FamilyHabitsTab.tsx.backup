'use client';

import { useMemo, useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { EditFamilyHabitModal } from '@/components/family/EditFamilyHabitModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Award,
  Calendar,
  Check,
  Edit3,
  Flame,
  Plus,
  Search,
  Target,
  Trash2,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FamilyHabit } from '@/types/family';
import { getNextDueDate, isHabitDueToday } from '@/lib/utils';

interface FamilyHabitsTabProps {
  onCreateHabit?: () => void;
}

type ViewMode = 'overview' | 'byMember';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'byMember', label: 'By member' },
];

export function FamilyHabitsTab({ onCreateHabit }: FamilyHabitsTabProps = {}) {
  const { currentFamily, isParent } = useFamily();
  const {
    allHabits,
    allCompletions,
    deleteHabit,
    toggleMemberCompletion,
  } = useAllFamilyHabits();

  const [searchTerm, setSearchTerm] = useState('');
  const [editingHabit, setEditingHabit] = useState<FamilyHabit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    habit: FamilyHabit | null;
    loading: boolean;
  }>({
    isOpen: false,
    habit: null,
    loading: false,
  });

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const familyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeHabits = allHabits.filter((habit) => {
      const legacyArchived = (habit as { archived?: boolean }).archived;
      const archived = legacyArchived ?? habit.isArchived ?? false;
      return !archived;
    });
    const todaysHabits = activeHabits.filter((habit) => isHabitDueToday(habit));
    const completedToday = allCompletions.filter(
      (completion) => completion.date === today && completion.completed,
    );

    const totalPossibleCompletions = todaysHabits.reduce(
      (sum, habit) => sum + habit.assignedMembers.length,
      0,
    );

    const completionRate =
      totalPossibleCompletions > 0
        ? Math.round((completedToday.length / totalPossibleCompletions) * 100)
        : 0;

    return {
      totalHabits: activeHabits.length,
      todaysHabits: todaysHabits.length,
      completedToday: completedToday.length,
      completionRate,
      totalPossibleCompletions,
    };
  }, [allHabits, allCompletions]);

  const handleEditHabit = (habit: FamilyHabit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setEditingHabit(null);
    setShowEditModal(false);
  };

  const handleDeleteClick = (habit: FamilyHabit) => {
    setDeleteModalState({
      isOpen: true,
      habit,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.habit) {
      return;
    }

    try {
      setDeleteModalState((prev) => ({ ...prev, loading: true }));
      await deleteHabit(deleteModalState.habit.id);
      setDeleteModalState({
        isOpen: false,
        habit: null,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      setDeleteModalState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalState({
      isOpen: false,
      habit: null,
      loading: false,
    });
  };

  const isHabitCompletedByMember = (habitId: string, memberId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return allCompletions.some(
      (completion) =>
        completion.habitId === habitId &&
        completion.memberId === memberId &&
        completion.date === today &&
        completion.completed,
    );
  };

  const getMemberStreak = (habitId: string, memberId: string): number => {
    const memberCompletions = allCompletions
      .filter((completion) => completion.habitId === habitId && completion.memberId === memberId && completion.completed)
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );

    let streak = 0;
    const today = new Date();

    for (let i = 0; i < memberCompletions.length; i++) {
      const completionDate = new Date(memberCompletions[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (completionDate.toDateString() === expectedDate.toDateString()) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  };

  const handleHabitCompletion = async (
    habit: FamilyHabit,
    memberId: string,
    success: boolean,
  ) => {
    const habitKey = `${habit.id}-${memberId}`;

    try {
      setCompletingHabit(habitKey);
      await toggleMemberCompletion(
        habit.id,
        memberId,
        true,
        success ? 'Completed successfully' : 'Marked as failed',
      );
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabit(null);
    }
  };

  if (!currentFamily || !isParent) {
    return (
      <div className="mx-auto flex h-[420px] max-w-3xl flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/5 px-8 text-center text-white shadow-[0_40px_120px_rgba(0,0,0,0.5)]">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
          <Target className="h-10 w-10 text-white/70" />
        </div>
        <h3 className="text-2xl font-semibold">Parent access required</h3>
        <p className="mt-2 max-w-md text-sm text-white/70">
          Only parents can manage family habits and track progress.
        </p>
      </div>
    );
  }

  const filteredHabits = allHabits.filter((habit) => {
    const term = searchTerm.toLowerCase();
    return (
      habit.name.toLowerCase().includes(term) ||
      habit.description?.toLowerCase().includes(term)
    );
  });

  const accentButtonClasses =
    'rounded-full bg-[#ff7a1c] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_35px_rgba(255,122,28,0.35)] transition hover:bg-[#ff8a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1c]/70';

  const renderOverview = () => {
    if (!filteredHabits.length) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredHabits.map((habit) => {
          const completedCount = habit.assignedMembers.filter((memberId) =>
            isHabitCompletedByMember(habit.id, memberId),
          ).length;
          const nextDue = getNextDueDate(habit);
          const formattedNextDue = formatDueDate(nextDue);
          const dueToday = isHabitDueToday(habit);

          return (
            <div
              key={habit.id}
              className="group relative flex h-full flex-col gap-5 rounded-3xl border border-white/7 bg-white/[0.06] p-6 text-white shadow-[0_35px_120px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_45px_150px_rgba(0,0,0,0.55)]"
            >
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              <div className="flex items-start justify-between gap-4 pt-1">
                <div className="flex flex-1 items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl shadow-inner shadow-black/30">
                    {habit.emoji}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{habit.name}</h3>
                    {habit.description && (
                      <p className="mt-1 text-sm text-white/70 line-clamp-2">
                        {habit.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                        <Award className="h-3.5 w-3.5 text-[#ffb876]" />
                        {habit.basePoints} pts
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 capitalize">
                        <Calendar className="h-3.5 w-3.5 text-white/60" />
                        {habit.frequency}
                      </span>
                      {formattedNextDue && (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                          <TrendingUp className="h-3.5 w-3.5 text-[#7fe8c1]" />
                          Next {formattedNextDue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditHabit(habit)}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white/80 hover:bg-white/15 hover:text-white"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(habit)}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Team progress today</span>
                  <span className="font-semibold text-white">
                    {completedCount} / {habit.assignedMembers.length}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {habit.assignedMembers.map((memberId) => {
                    const member = currentFamily.members.find((m) => m.id === memberId);
                    if (!member) {
                      return null;
                    }

                    const habitCompleted = isHabitCompletedByMember(habit.id, member.id);
                    const streak = getMemberStreak(habit.id, member.id);
                    const isLoading = completingHabit === `${habit.id}-${member.id}`;

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/8 px-3 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <ProfileImage
                            name={member.displayName}
                            profileImageUrl={member.profileImageUrl}
                            color={member.color}
                            size={32}
                            className="flex-shrink-0"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              {member.displayName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Users className="h-3.5 w-3.5" />
                              <span>{member.role}</span>
                              {streak > 0 && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] text-orange-200">
                                  <Flame className="h-3 w-3" />
                                  {streak}d streak
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {dueToday && !habitCompleted ? (
                          <div className="flex gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHabitCompletion(habit, member.id, true)}
                              disabled={isLoading}
                              className="h-8 rounded-full bg-[#7fe8c1]/80 px-3 text-xs font-semibold text-[#04251a] transition hover:bg-[#7fe8c1] disabled:opacity-60"
                            >
                              {isLoading ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#04251a]/60 border-t-transparent" />
                              ) : (
                                <Check className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHabitCompletion(habit, member.id, false)}
                              disabled={isLoading}
                              className="h-8 rounded-full bg-red-500/80 px-3 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                            >
                              {isLoading ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        ) : habitCompleted ? (
                          <div className="inline-flex items-center gap-2 rounded-full border border-[#7fe8c1]/40 bg-[#7fe8c1]/15 px-3 py-1 text-xs font-semibold text-[#7fe8c1]">
                            <Check className="h-3.5 w-3.5" />
                            Completed
                          </div>
                        ) : (
                          <span className="text-xs text-white/50">Not due today</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderByMember = () => {
    const relevantMembers = currentFamily.members.filter((member) =>
      filteredHabits.some((habit) => habit.assignedMembers.includes(member.id)),
    );

    if (!relevantMembers.length) {
      return null;
    }

    return (
      <div className="space-y-6">
        {relevantMembers.map((member) => {
          const memberHabits = filteredHabits.filter((habit) =>
            habit.assignedMembers.includes(member.id),
          );
          const completedToday = memberHabits.filter((habit) =>
            isHabitCompletedByMember(habit.id, member.id),
          ).length;
          const successRate = memberHabits.length
            ? Math.round((completedToday / memberHabits.length) * 100)
            : 0;

          return (
            <div
              key={member.id}
              className="overflow-hidden rounded-[28px] border border-white/8 bg-white/[0.06] shadow-[0_35px_120px_rgba(0,0,0,0.45)]"
            >
              <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <ProfileImage
                    name={member.displayName}
                    profileImageUrl={member.profileImageUrl}
                    color={member.color}
                    size={56}
                  />
                  <div>
                    <p className="text-lg font-semibold text-white">{member.displayName}</p>
                    <p className="text-sm text-white/60">
                      {memberHabits.length} habit{memberHabits.length === 1 ? '' : 's'} ·{' '}
                      {completedToday} completed today
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/70">
                  <TrendingUp className="h-4 w-4 text-[#7fe8c1]" />
                  <span>{successRate}% success today</span>
                </div>
              </div>

              <div className="grid gap-4 px-6 py-6 lg:grid-cols-2">
                {memberHabits.map((habit) => {
                  const habitCompleted = isHabitCompletedByMember(habit.id, member.id);
                  const streak = getMemberStreak(habit.id, member.id);
                  const isLoading = completingHabit === `${habit.id}-${member.id}`;
                  const dueToday = isHabitDueToday(habit);
                  const formattedNextDue = formatDueDate(getNextDueDate(habit));

                  return (
                    <div
                      key={habit.id}
                      className="flex h-full flex-col gap-4 rounded-2xl border border-white/10 bg-white/8 p-4 text-white"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <div className="text-xl">{habit.emoji}</div>
                            <span className="rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-[0.22em]">
                              {habit.frequency}
                            </span>
                          </div>
                          <h4 className="mt-2 text-lg font-semibold">{habit.name}</h4>
                          {habit.description && (
                            <p className="text-sm text-white/70 line-clamp-2">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditHabit(habit)}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-white/80 hover:bg-white/15 hover:text-white"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(habit)}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                          <Award className="h-3.5 w-3.5 text-[#ffb876]" />
                          {habit.basePoints} pts
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1">
                          <Calendar className="h-3.5 w-3.5 text-white/60" />
                          {dueToday
                            ? 'Due today'
                            : formattedNextDue
                              ? `Next ${formattedNextDue}`
                              : 'Keep the rhythm'}
                        </span>
                        {streak > 0 && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-orange-200">
                            <Flame className="h-3.5 w-3.5" />
                            {streak} day streak
                          </span>
                        )}
                      </div>

                      <div className="mt-auto">
                        {dueToday && !habitCompleted ? (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleHabitCompletion(habit, member.id, true)}
                              disabled={isLoading}
                              variant="ghost"
                              className="flex-1 rounded-full bg-[#7fe8c1]/80 py-2 text-sm font-semibold text-[#04251a] hover:bg-[#7fe8c1] disabled:opacity-60"
                            >
                              {isLoading ? (
                                <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-[#04251a]/50 border-t-transparent" />
                              ) : (
                                <span className="inline-flex items-center justify-center gap-2">
                                  <Check className="h-4 w-4" />
                                  Complete
                                </span>
                              )}
                            </Button>
                            <Button
                              onClick={() => handleHabitCompletion(habit, member.id, false)}
                              disabled={isLoading}
                              variant="ghost"
                              className="rounded-full bg-red-500/80 px-4 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                            >
                              {isLoading ? (
                                <div className="mx-auto h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : habitCompleted ? (
                          <div className="flex items-center justify-center gap-2 rounded-full border border-[#7fe8c1]/40 bg-[#7fe8c1]/15 px-4 py-2 text-sm font-semibold text-[#7fe8c1]">
                            <Check className="h-4 w-4" />
                            Completed today
                          </div>
                        ) : (
                          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-center text-sm text-white/60">
                            Not due today
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 text-white">
      <section className="rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(111,117,255,0.18),transparent_60%),_rgba(12,13,22,0.9)] px-6 py-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.48em] text-[#6f75ff]">Habit pulse</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[36px]">Habit mission control</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {familyStats.totalHabits
                ? `Tracking ${familyStats.totalHabits} shared ritual${familyStats.totalHabits === 1 ? '' : 's'} across the family orbit.`
                : 'Create your first habit to kick off the daily rhythm.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-xs">
              {VIEW_MODES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewMode(id)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 font-medium tracking-[0.14em] uppercase transition',
                    viewMode === id
                      ? 'bg-[#6f75ff] text-black shadow-[0_12px_30px_rgba(111,117,255,0.4)]'
                      : 'text-white/70 hover:text-white',
                  )}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <Button onClick={onCreateHabit} variant="ghost" className={accentButtonClasses}>
              <Plus className="h-4 w-4" />
              <span>Create habit</span>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Active habits</p>
            <p className="mt-2 text-2xl font-semibold text-white">{familyStats.totalHabits}</p>
            <p className="text-sm text-white/60">Across the entire family</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Due today</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {familyStats.todaysHabits} habit{familyStats.todaysHabits === 1 ? '' : 's'}
            </p>
            <p className="text-sm text-white/60">
              {familyStats.totalPossibleCompletions} possible completions
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Today&apos;s momentum</p>
            <p className="mt-2 text-2xl font-semibold text-[#7fe8c1]">
              {familyStats.completionRate}%
            </p>
            <p className="text-sm text-white/60">
              {familyStats.completedToday} completions logged so far
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.05] px-6 py-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search habits by name or description…"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="!rounded-full !border-white/20 !bg-white/10 !px-12 !py-3 !text-white placeholder:text-white/50"
              />
            </div>
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Zap className="h-4 w-4 text-[#7fe8c1]" />
              <span>
                {familyStats.completedToday}/{familyStats.totalPossibleCompletions || 1} completions
                logged today
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        {filteredHabits.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-10 py-16 text-center text-white shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Target className="h-10 w-10 text-white/70" />
            </div>
            <h3 className="text-2xl font-semibold">
              {searchTerm ? 'No habits match your search' : 'Ready to start a new habit?'}
            </h3>
            <p className="mt-2 max-w-md text-sm text-white/70">
              {searchTerm
                ? 'Try adjusting the search terms or reset the filters to see all family habits.'
                : 'Design your first family habit and unlock daily momentum together.'}
            </p>
            <Button onClick={onCreateHabit} variant="ghost" className={`mt-6 ${accentButtonClasses}`}>
              <Plus className="h-4 w-4" />
              <span>{searchTerm ? 'Create matching habit' : 'Create first habit'}</span>
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'overview' && renderOverview()}
            {viewMode === 'byMember' && renderByMember()}
          </>
        )}
      </section>

      <EditFamilyHabitModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSuccess={handleEditSuccess}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteModalState.habit?.name}"?`}
        description={`This will permanently delete the habit "${deleteModalState.habit?.name}" and all of its completion history. This action cannot be undone.`}
        isLoading={deleteModalState.loading}
      />
    </div>
  );
}
