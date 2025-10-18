'use client';

import { cn } from '@/lib/utils';
import type { FamilyMember } from '@/types/family';
import type { MemberRewardProgress } from '@/hooks/useRewardMomentum';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { Flame, Sparkles } from 'lucide-react';

interface RewardMomentumStripProps {
  members: FamilyMember[];
  progressMap: Record<string, MemberRewardProgress>;
  onConfigure?: () => void;
  isParent: boolean;
  className?: string;
}

export function RewardMomentumStrip({ members, progressMap, onConfigure, isParent, className }: RewardMomentumStripProps) {
  if (!members.length) return null;

  return (
    <section
      className={cn(
        'rounded-[24px] border border-white/10 bg-[#0d101c]/85 p-5 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur md:p-6',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.35em] text-[#ff7a1c]">Daily Boost</p>
          <h2 className="text-xl font-semibold text-white sm:text-[22px]">Keep everyone’s focus habits aligned</h2>
          <p className="text-xs text-slate-300">
            Earn a boost when each member finishes their focus habits. Collect boosts to unlock weekly rewards.
          </p>
        </div>
        {isParent && (
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-[#ff7a1c] px-4 py-2 text-xs font-semibold text-black shadow-[0_10px_30px_rgba(255,122,28,0.3)] hover:bg-[#ff8a35]"
            onClick={onConfigure}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Manage Focus Habits
          </Button>
        )}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {members.map((member) => {
          const progress = progressMap[member.id];
          if (!progress) return null;

          return (
            <article
              key={member.id}
              className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/35 backdrop-blur"
            >
              <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">{member.displayName}</h3>
                  <p className="text-[11px] text-slate-300">
                    Daily focus {progress.today.completed}/{progress.today.total}
                    {progress.today.total > 0 && progress.today.tokenEarned
                      ? ' · Boost earned'
                      : progress.today.missingHabitNames.length > 0
                      ? ` · Needs ${progress.today.missingHabitNames[0]}`
                      : ''}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/70"
                >
                  <Flame className="h-3 w-3 text-amber-300" />
                  {progress.availableTokens} boosts
                </span>
              </header>

              <div className="mb-3 flex flex-wrap gap-1">
                {progress.focusHabits.length ? (
                  progress.focusHabits.map((habit) => (
                    <span
                      key={habit.id}
                      className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-medium text-white/80"
                    >
                      <span>{habit.emoji}</span>
                      <span className="truncate max-w-[96px]">{habit.name}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">No focus habits selected.</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span>Weekly boosts</span>
                  <span>
                    {progress.weekly.tokens}/{progress.weekly.goal} {progress.weekly.readyForReward ? '· Ready!' : ''}
                  </span>
                </div>
                <Progress
                  value={progress.weekly.tokens}
                  max={Math.max(progress.weekly.goal, 1)}
                  className="h-1.5"
                />
                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                  {progress.weekly.history.map((day) => (
                    <span
                      key={day.date}
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded-full border border-white/10',
                        day.earned ? 'bg-emerald-400 text-emerald-950' : 'bg-white/5 text-slate-500'
                      )}
                      title={`${day.date}: ${day.earned ? 'Boost earned' : 'Incomplete'}`}
                    >
                      {day.earned ? '★' : '·'}
                    </span>
                  ))}
                </div>
              </div>

              <footer className="mt-3 text-[11px] text-slate-300">
                <span className="font-semibold text-white/90">Monthly boosts:</span> {progress.monthlyTokens}
              </footer>
            </article>
          );
        })}
      </div>
    </section>
  );
}
