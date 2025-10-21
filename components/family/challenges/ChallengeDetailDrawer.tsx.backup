'use client';

import React from 'react';
import { X, Crown, Activity, Target, Calendar, Users, Award, Copy, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FamilyChallenge } from '@/types/family';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { useFamily } from '@/contexts/FamilyContext';

interface ChallengeDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  challenge: FamilyChallenge | null;
  progress: Record<string, number> | undefined;
  daily?: Record<string, { date: string; count: number }[]>;
  onJoin?: (challengeId: string, memberId: string) => void;
  onComplete?: (challengeId: string, winnerId?: string) => void;
  onStart?: (challengeId: string) => void;
  onDuplicate?: (challenge: FamilyChallenge) => void;
  onRestart?: (challenge: FamilyChallenge) => void;
  loading?: boolean;
}

export function ChallengeDetailDrawer({
  open,
  onClose,
  challenge,
  progress,
  daily,
  onJoin,
  onComplete,
  onStart,
  onDuplicate,
  onRestart,
  loading
}: ChallengeDetailDrawerProps) {
  const { currentFamily, currentMember, isParent } = useFamily();

  React.useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open || !challenge || !currentFamily || !currentMember) return null;

  const totalProgress = Object.values(progress || {}).reduce((s, v) => s + (v || 0), 0);
  const progressPct = Math.min((totalProgress / challenge.target) * 100, 100);
  const daysLeft = Math.ceil((new Date(challenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const sortedParticipants = [...challenge.participantIds].sort((a, b) => (progress?.[b] || 0) - (progress?.[a] || 0));
  const leaderId = sortedParticipants[0];
  const leader = currentFamily.members.find(m => m.id === leaderId);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-3xl">{challenge.emoji}</div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{challenge.name}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                <span className="inline-flex items-center gap-1">
                  <Target className="w-3 h-3" /> {challenge.target}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {challenge.duration}d{daysLeft >= 0 ? ` • ${daysLeft}d left` : ''}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                <Activity className="w-3.5 h-3.5" /> Progress
              </div>
              <div className="text-xs font-semibold">{totalProgress}/{challenge.target}</div>
            </div>
            <Progress value={progressPct} className="h-2" />
            {leader && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <Crown className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">Leader:</span>
                <span className="font-semibold" style={{ color: leader.color }}>{leader.displayName}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-auto">{progress?.[leader.id] || 0} pts</span>
              </div>
            )}
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mb-2">
              <Users className="w-3.5 h-3.5" /> Participants
            </div>
            <ul className="space-y-2">
              {sortedParticipants.map(pid => {
                const member = currentFamily.members.find(m => m.id === pid);
                if (!member) return null;
                const value = progress?.[pid] || 0;
                return (
                  <li key={pid} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-md px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full text-[11px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: member.color }}>
                        {member.displayName[0]}
                      </span>
                      <span className="text-sm font-medium truncate" style={{ color: member.color }}>{member.displayName}</span>
                    </div>
                    <span className="text-xs text-gray-700 dark:text-gray-200">{value} pts</span>
                  </li>
                );
              })}
              {sortedParticipants.length === 0 && (
                <li className="text-xs text-gray-500 dark:text-gray-400">No participants yet.</li>
              )}
            </ul>
          </div>

          {/* Last 7 days breakdown (compact sparkbars) */}
          {daily && challenge.status !== 'upcoming' && (
            <div>
              <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">Last days</div>
              <div className="space-y-1.5">
                {sortedParticipants.slice(0, 6).map(pid => {
                  const member = currentFamily.members.find(m => m.id === pid);
                  if (!member) return null;
                  const entries = (daily[pid] || []).slice(-7);
                  const max = Math.max(1, ...entries.map(e => e.count));
                  return (
                    <div key={pid} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: member.color }}>
                        {member.displayName[0]}
                      </span>
                      <div className="flex-1 flex gap-1">
                        {entries.map((e, idx) => (
                          <div key={idx} className="flex-1 h-3 rounded-sm" title={`${e.date}: ${e.count}`}
                            style={{ backgroundColor: 'var(--tw-prose-body, #cbd5e1)', opacity: Math.max(0.25, e.count / max) }} />
                        ))}
                        {entries.length === 0 && (
                          <div className="text-[10px] text-gray-500">No recent data</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rewards */}
          {(challenge.bonusPoints > 0 || challenge.winnerReward || challenge.participationReward) && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-md p-3">
              <div className="flex items-center gap-2 text-xs font-medium mb-2">
                <Award className="w-3.5 h-3.5" /> Rewards
              </div>
              <div className="text-xs text-gray-700 dark:text-gray-300 space-y-1.5">
                {challenge.bonusPoints > 0 && <div>Bonus points: <span className="font-semibold">+{challenge.bonusPoints}</span></div>}
                {challenge.winnerReward && <div>Winner reward: <span className="font-semibold">{challenge.winnerReward}</span></div>}
                {challenge.participationReward && <div>Participation: <span className="font-semibold">{challenge.participationReward}</span></div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-auto px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
          {isParent && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => challenge && onDuplicate?.(challenge)}>
                <Copy className="w-4 h-4 mr-1" /> Duplicate
              </Button>
              {challenge.status === 'completed' && (
                <Button variant="outline" size="sm" onClick={() => challenge && onRestart?.(challenge)}>
                  <RotateCcw className="w-4 h-4 mr-1" /> Restart
                </Button>
              )}
            </div>
          )}
          {challenge.status === 'upcoming' && (
            <div className="flex gap-2">
              {isParent && (
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={loading} onClick={() => onStart?.(challenge.id)}>
                  Start
                </Button>
              )}
              {!isParent && !challenge.participantIds.includes(currentMember.id) && (
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={loading} onClick={() => onJoin?.(challenge.id, currentMember.id)}>
                  Join
                </Button>
              )}
            </div>
          )}
          {challenge.status === 'active' && isParent && (
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white ml-auto" disabled={loading} onClick={() => onComplete?.(challenge.id, leaderId)}>
              Complete
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </aside>
    </div>
  );
}

export default ChallengeDetailDrawer;


