'use client';

import { useMemo, useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyRewards } from '@/hooks/useFamilyRewards';
import { approveRedemption, denyRedemption } from '@/lib/familyDb';

import { Button } from '@/components/ui/Button';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { CreateWorkspaceRewardModal } from '@/components/workspace/CreateWorkspaceRewardModal';
import { ManageWorkspaceRewardsModal } from '@/components/workspace/ManageWorkspaceRewardsModal';
import {
  CheckCircle,
  Clock,
  Gift,
  Lock,
  Plus,
  Settings,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function FamilyRewardsTab() {
  const { currentFamily, currentMember, isParent } = useFamily();
  const {
    rewards,
    getAvailableRewards,
    getRewardsByCategory,
    redeemReward,
    getPendingRedemptions,
    loading,
  } = useFamilyRewards();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showManageRewardsModal, setShowManageRewardsModal] = useState(false);

  if (!currentFamily || !currentMember) {
    return null;
  }

  const memberPoints = currentMember.stats?.totalPoints ?? 0;
  const availableRewards = getAvailableRewards(memberPoints);
  const categories = getRewardsByCategory();
  const pendingRedemptions = getPendingRedemptions();

  const filteredRewards = selectedCategory
    ? categories[selectedCategory] ?? []
    : rewards;

  const accentButtonClasses =
    'rounded-full bg-[#ff7a1c] px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_35px_rgba(255,122,28,0.35)] transition hover:bg-[#ff8a35] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a1c]/70';

  const secondaryButtonClasses =
    'rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

  const categoryIcons: Record<string, string> = {
    experience: '🎪',
    purchase: '🛍️',
    privilege: '👑',
    activity: '🎨',
    time: '⏰',
  };

  const handleRedeem = async (rewardId: string) => {
    if (!currentMember) return;

    try {
      setRedeeming(rewardId);
      await redeemReward(rewardId);
    } catch (error) {
      console.error('Failed to redeem reward:', error);
    } finally {
      setRedeeming(null);
    }
  };

  const handleApproveRedemption = async (redemptionId: string) => {
    if (!currentMember || !currentFamily) return;

    try {
      setProcessingApproval(redemptionId);
      await approveRedemption(currentFamily.id, redemptionId, currentMember.id);
    } catch (error) {
      console.error('Failed to approve redemption:', error);
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleDenyRedemption = async (redemptionId: string, reason?: string) => {
    if (!currentMember || !currentFamily) return;

    try {
      setProcessingApproval(redemptionId);
      await denyRedemption(currentFamily.id, redemptionId, currentMember.id, reason);
    } catch (error) {
      console.error('Failed to deny redemption:', error);
    } finally {
      setProcessingApproval(null);
    }
  };

  const activeCategories = useMemo(
    () =>
      Object.entries(categories)
        .filter(([, list]) => list.length > 0)
        .map(([key, list]) => ({ key, label: key, count: list.length })),
    [categories]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8 text-white">
      <section className="rounded-[32px] border border-white/5 bg-[radial-gradient(circle_at_top,_rgba(255,122,28,0.14),transparent_60%),_rgba(12,13,22,0.9)] px-6 py-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)] sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.48em] text-[#ff7a1c]">Reward orbit</p>
            <h2 className="mt-3 text-3xl font-semibold sm:text-[36px]">Family rewards hub</h2>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {rewards.length
                ? `You have ${rewards.length} reward${rewards.length === 1 ? '' : 's'} ready and ${availableRewards.length} within reach.`
                : 'Design meaningful rewards to keep every habit win feeling celebratory.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-3">
            {isParent && (
              <>
                <Button
                  onClick={() => setShowManageRewardsModal(true)}
                  variant="ghost"
                  className={secondaryButtonClasses}
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage</span>
                </Button>
                <Button
                  onClick={() => setShowCreateRewardModal(true)}
                  variant="ghost"
                  className={accentButtonClasses}
                >
                  <Plus className="h-4 w-4" />
                  <span>Create reward</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Points bank</p>
            <p className="mt-2 text-2xl font-semibold text-white">{memberPoints}</p>
            <p className="text-sm text-white/60">Live balance for {currentMember.displayName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Within reach</p>
            <p className="mt-2 text-2xl font-semibold text-[#7fe8c1]">{availableRewards.length}</p>
            <p className="text-sm text-white/60">Rewards you can unlock right now</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-inner shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">Pending requests</p>
            <p className="mt-2 text-2xl font-semibold text-white">{pendingRedemptions.length}</p>
            <p className="text-sm text-white/60">Awaiting parent approval</p>
          </div>
        </div>
      </section>

      {(isParent || rewards.length > 0) && (
        <section className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {pendingRedemptions.length > 0 ? (
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/80">
              <Clock className="h-4 w-4 text-[#ffb876]" />
              <span>
                {pendingRedemptions.length} pending approval{pendingRedemptions.length === 1 ? '' : 's'}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
              <Sparkles className="h-4 w-4 text-[#7fe8c1]" />
              <span>Keep the streak alive with consistent rewards</span>
            </div>
          )}

          {rewards.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition',
                  selectedCategory === null ? 'bg-white/15 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                )}
              >
                <span>All</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white/70">
                  {rewards.length}
                </span>
              </button>
              {activeCategories.map(({ key, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedCategory(key)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm transition',
                    selectedCategory === key ? 'bg-white/15 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)]' : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span>{categoryIcons[key] ?? '🎁'}</span>
                  <span className="capitalize">{key}</span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 text-xs font-semibold text-white/70">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {rewards.length === 0 ? (
        <section className="mt-8">
          <div className="flex flex-col items-center rounded-[28px] border border-dashed border-white/15 bg-white/[0.04] px-10 py-16 text-center shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/10">
              <Gift className="h-10 w-10 text-white/60" />
            </div>
            <h3 className="text-2xl font-semibold">No rewards yet</h3>
            <p className="mt-2 max-w-md text-sm text-white/70">
              {isParent
                ? 'Create your first reward to motivate every streak and milestone.'
                : 'Ask a parent to add rewards so you can turn points into celebrations.'}
            </p>
            {isParent && (
              <Button
                onClick={() => setShowCreateRewardModal(true)}
                variant="ghost"
                className={`mt-6 ${accentButtonClasses}`}
              >
                <Plus className="h-4 w-4" />
                <span>Create first reward</span>
              </Button>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredRewards.map((reward) => {
            const canAfford = memberPoints >= reward.pointsRequired;
            const isAvailable = availableRewards.some((item) => item.id === reward.id);
            const isRedeeming = redeeming === reward.id;

            return (
              <div
                key={reward.id}
                className={cn(
                  'flex h-full flex-col gap-4 rounded-3xl border border-white/8 bg-white/[0.05] p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_45px_140px_rgba(0,0,0,0.55)]',
                  !canAfford && 'opacity-75'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{reward.emoji}</div>
                    <div>
                      <h3 className="text-lg font-semibold">{reward.title}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 capitalize">
                          {categoryIcons[reward.category] ?? '🎁'}
                          {reward.category}
                        </span>
                        {reward.requiresApproval && (
                          <span className="inline-flex items-center gap-2 rounded-full border border-[#ffb876]/40 bg-[#ffb876]/10 px-3 py-1 text-[#ffdeb1]">
                            <Lock className="h-3.5 w-3.5" />
                            Approval required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold',
                    canAfford && isAvailable
                      ? 'border-[#7fe8c1]/60 bg-[#7fe8c1]/15 text-[#7fe8c1]'
                      : 'border-white/10 bg-white/10 text-white/60'
                  )}>
                    <Star className="h-4 w-4" />
                    {reward.pointsRequired}
                  </div>
                </div>

                {reward.description && (
                  <p className="text-sm text-white/70 line-clamp-3">{reward.description}</p>
                )}

                <div className="mt-auto">
                  {!isParent ? (
                    <Button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!canAfford || !isAvailable || isRedeeming || loading}
                      variant="ghost"
                      className={cn(
                        'w-full rounded-full px-5 py-3 text-sm font-semibold transition',
                        canAfford && isAvailable
                          ? 'bg-[#7fe8c1]/80 text-[#04251a] hover:bg-[#7fe8c1] disabled:opacity-60'
                          : 'bg-white/10 text-white/50 disabled:opacity-60'
                      )}
                    >
                      {isRedeeming
                        ? 'Redeeming…'
                        : !canAfford
                          ? `Need ${reward.pointsRequired - memberPoints} more points`
                          : !isAvailable
                            ? 'Currently locked'
                            : 'Redeem now'}
                    </Button>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-center text-xs text-white/60">
                      Members can redeem this reward when they reach {reward.pointsRequired} points.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {isParent && pendingRedemptions.length > 0 && (
        <section className="mt-10 rounded-[28px] border border-white/8 bg-white/[0.05] p-6 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
          <header className="flex items-center gap-3 border-b border-white/10 pb-4 text-sm font-semibold uppercase tracking-[0.24em] text-white/60">
            <Clock className="h-4 w-4 text-[#ffb876]" />
            Pending approvals
          </header>
          <div className="mt-4 space-y-4">
            {pendingRedemptions.map((redemption) => {
              const reward = rewards.find((item) => item.id === redemption.rewardId);
              const member = currentFamily.members.find((item) => item.id === redemption.memberId);
              if (!reward || !member) {
                return null;
              }

              const isProcessing = processingApproval === redemption.id;

              return (
                <div
                  key={redemption.id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/8 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <ProfileImage
                      name={member.displayName}
                      profileImageUrl={member.profileImageUrl}
                      color={member.color}
                      size={44}
                      showBorder
                      borderColor="rgba(255,255,255,0.25)"
                      className="shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {member.displayName} wants {reward.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="text-xl">{reward.emoji}</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-1">
                          <Star className="h-3 w-3" />
                          {reward.pointsRequired} pts
                        </span>
                        <span>
                          Requested {new Date(redemption.requestedAt.toDate()).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full bg-[#7fe8c1]/80 px-4 py-2 text-sm font-semibold text-[#04251a] hover:bg-[#7fe8c1] disabled:opacity-60"
                      onClick={() => handleApproveRedemption(redemption.id)}
                      disabled={isProcessing}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Approving…' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border border-red-400/50 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-60"
                      onClick={() => handleDenyRedemption(redemption.id, 'Not available right now')}
                      disabled={isProcessing}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {isProcessing ? 'Denying…' : 'Deny'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <CreateWorkspaceRewardModal
        isOpen={showCreateRewardModal}
        onClose={() => setShowCreateRewardModal(false)}
      />

      <ManageWorkspaceRewardsModal
        isOpen={showManageRewardsModal}
        onClose={() => setShowManageRewardsModal(false)}
      />
    </div>
  );
}
