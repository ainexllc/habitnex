'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { FamilyMember, FamilyHabit, MemberRewardProfile } from '@/types/family';
import { cn } from '@/lib/utils';

interface ManageFocusHabitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: FamilyMember[];
  habits: FamilyHabit[];
  defaultFocus: Record<string, string[]>;
  onSave: (updates: Record<string, MemberRewardProfile | undefined>) => Promise<void>;
  saving: boolean;
}

type MemberSelection = {
  dailyFocusHabitIds: string[];
  weeklyGoal: number;
};

const MAX_FOCUS = 3;

export function ManageFocusHabitsModal({
  isOpen,
  onClose,
  members,
  habits,
  defaultFocus,
  onSave,
  saving,
}: ManageFocusHabitsModalProps) {
  const [selections, setSelections] = useState<Record<string, MemberSelection>>({});

  useEffect(() => {
    if (!isOpen) return;
    const initial: Record<string, MemberSelection> = {};
    members.filter((m) => m.isActive).forEach((member) => {
      const profile = member.rewardProfile;
      const fallback = defaultFocus[member.id] || [];
      initial[member.id] = {
        dailyFocusHabitIds: profile?.dailyFocusHabitIds?.length ? profile.dailyFocusHabitIds : fallback,
        weeklyGoal: profile?.weeklyGoal ?? 4,
      };
    });
    setSelections(initial);
  }, [isOpen, members, defaultFocus]);

  const habitsByMember = useMemo(() => {
    const map = new Map<string, FamilyHabit[]>();
    members.forEach((member) => {
      const memberHabits = habits.filter((habit) =>
        habit.assignedMembers?.includes(member.id) && !habit.isArchived && habit.isActive
      );
      map.set(member.id, memberHabits);
    });
    return map;
  }, [members, habits]);

  const handleToggleHabit = (memberId: string, habitId: string) => {
    setSelections((prev) => {
      const current = prev[memberId] ?? { dailyFocusHabitIds: [], weeklyGoal: 4 };
      const exists = current.dailyFocusHabitIds.includes(habitId);
      let nextIds = current.dailyFocusHabitIds;
      if (exists) {
        nextIds = current.dailyFocusHabitIds.filter((id) => id !== habitId);
      } else {
        if (current.dailyFocusHabitIds.length >= MAX_FOCUS) {
          nextIds = [...current.dailyFocusHabitIds.slice(1), habitId];
        } else {
          nextIds = [...current.dailyFocusHabitIds, habitId];
        }
      }
      return {
        ...prev,
        [memberId]: {
          ...current,
          dailyFocusHabitIds: nextIds,
        },
      };
    });
  };

  const handleGoalChange = (memberId: string, value: number) => {
    setSelections((prev) => {
      const current = prev[memberId] ?? { dailyFocusHabitIds: [], weeklyGoal: 4 };
      const sanitized = Number.isFinite(value) ? Math.max(1, Math.min(14, Math.round(value))) : current.weeklyGoal;
      return {
        ...prev,
        [memberId]: {
          ...current,
          weeklyGoal: sanitized,
        },
      };
    });
  };

  const handleSave = async () => {
    const updates: Record<string, MemberRewardProfile | undefined> = {};
    members.filter((m) => m.isActive).forEach((member) => {
      const selected = selections[member.id];
      const normalizedIds = selected?.dailyFocusHabitIds?.filter(Boolean) ?? [];
      const weeklyGoal = selected?.weeklyGoal ?? 4;
      const existingIds = member.rewardProfile?.dailyFocusHabitIds ?? [];
      const existingGoal = member.rewardProfile?.weeklyGoal ?? 4;

      const changed =
        normalizedIds.sort().join(',') !== existingIds.slice().sort().join(',') || weeklyGoal !== existingGoal;

      if (changed) {
        updates[member.id] = {
          dailyFocusHabitIds: normalizedIds,
          weeklyGoal,
        };
      }
    });

    await onSave(updates);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Focus Habits"
      description="Choose the habits that count toward daily boosts and set each member's weekly goal."
      size="xl"
    >
      <div className="space-y-4">
        {members.filter((m) => m.isActive).map((member) => {
          const selection = selections[member.id] ?? { dailyFocusHabitIds: [], weeklyGoal: 4 };
          const memberHabits = habitsByMember.get(member.id) ?? [];
          const remainingSlots = MAX_FOCUS - selection.dailyFocusHabitIds.length;

          return (
            <Card key={member.id} className="border-white/10 bg-white/5 text-slate-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>{member.displayName}</span>
                  <span className="text-xs text-slate-300">
                    {selection.dailyFocusHabitIds.length}/{MAX_FOCUS} focus habits
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-slate-300">Select up to {MAX_FOCUS} habits to count towards the daily boost.</p>
                  <div className="flex flex-wrap gap-2">
                    {memberHabits.map((habit) => {
                      const selected = selection.dailyFocusHabitIds.includes(habit.id);
                      const disabled = !selected && remainingSlots <= 0;
                      return (
                        <button
                          key={habit.id}
                          type="button"
                          onClick={() => handleToggleHabit(member.id, habit.id)}
                          className={cn(
                            'flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition',
                            selected
                              ? 'border-emerald-400 bg-emerald-400/20 text-emerald-100'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:border-white/20',
                            disabled && !selected && 'cursor-not-allowed opacity-40'
                          )}
                          disabled={disabled}
                        >
                          <span>{habit.emoji}</span>
                          <span className="truncate max-w-[140px] text-left">{habit.name}</span>
                        </button>
                      );
                    })}
                    {memberHabits.length === 0 && (
                      <span className="text-xs text-slate-400">No active habits assigned.</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                    Weekly boost goal
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={selection.weeklyGoal}
                    onChange={(event) => handleGoalChange(member.id, Number(event.target.value))}
                    className="w-24 rounded-md border border-white/10 bg-slate-900/60 px-2 py-1 text-xs text-white focus:border-emerald-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400">
                    Earned boosts this week: {selection.weeklyGoal} required to redeem rewards.
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">
          {saving ? 'Saving...' : 'Save Focus Settings'}
        </Button>
      </div>
    </Modal>
  );
}
