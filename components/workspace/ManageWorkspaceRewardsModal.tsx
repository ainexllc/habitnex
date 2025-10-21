'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import {
  getPendingRedemptions,
  getRedemptionHistory,
  approveRedemption,
  denyRedemption,
  completeRedemption
} from '@/lib/familyDb';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import {
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  User,
  Gift,
  AlertTriangle,
  History,
  ThumbsUp,
  MessageSquare,
  DollarSign,
  Trophy,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RewardRedemption, Reward } from '@/types/family';

interface ManageWorkspaceRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'pending' | 'history';

export function ManageWorkspaceRewardsModal({ isOpen, onClose }: ManageWorkspaceRewardsModalProps) {
  const { currentFamily, currentMember, isParent } = useFamily();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [pendingRedemptions, setPendingRedemptions] = useState<RewardRedemption[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RewardRedemption[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRedemption, setProcessingRedemption] = useState<string | null>(null);

  // Denial dialog state
  const [denialDialog, setDenialDialog] = useState<{
    redemptionId: string;
    memberName: string;
    rewardTitle: string;
  } | null>(null);
  const [denialReason, setDenialReason] = useState('');

  // Completion dialog state
  const [completionDialog, setCompletionDialog] = useState<{
    redemptionId: string;
    memberName: string;
    rewardTitle: string;
  } | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [completionRating, setCompletionRating] = useState<number>(5);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab('pending');
      setPendingRedemptions([]);
      setRedemptionHistory([]);
      setRewards([]);
      setLoading(true);
      setProcessingRedemption(null);
      setDenialDialog(null);
      setDenialReason('');
      setCompletionDialog(null);
      setCompletionNotes('');
      setCompletionRating(5);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!currentFamily?.id || !isOpen) return;

    const loadData = async () => {
      try {
        setLoading(true);

        const [pending, history, rewardsData] = await Promise.all([
          getPendingRedemptions(currentFamily.id),
          getRedemptionHistory(currentFamily.id),
          // We'll need to fetch rewards to show reward details
          fetch(`/api/family/${currentFamily.id}/rewards`).then(r => r.json()).catch(() => [])
        ]);

        setPendingRedemptions(pending);
        setRedemptionHistory(history);
        setRewards(Array.isArray(rewardsData) ? rewardsData : []);
      } catch (error) {
        console.error('Failed to load redemption data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentFamily?.id, isOpen]);

  const handleApprove = async (redemptionId: string) => {
    if (!currentFamily || !currentMember) return;

    try {
      setProcessingRedemption(redemptionId);
      await approveRedemption(currentFamily.id, redemptionId, currentMember.id);

      // Refresh data
      const [pending, history] = await Promise.all([
        getPendingRedemptions(currentFamily.id),
        getRedemptionHistory(currentFamily.id)
      ]);

      setPendingRedemptions(pending);
      setRedemptionHistory(history);
    } catch (error) {
      console.error('Failed to approve redemption:', error);
    } finally {
      setProcessingRedemption(null);
    }
  };

  const handleDeny = async () => {
    if (!denialDialog || !currentFamily || !currentMember) return;

    try {
      setProcessingRedemption(denialDialog.redemptionId);
      await denyRedemption(currentFamily.id, denialDialog.redemptionId, currentMember.id, denialReason);

      // Refresh data
      const [pending, history] = await Promise.all([
        getPendingRedemptions(currentFamily.id),
        getRedemptionHistory(currentFamily.id)
      ]);

      setPendingRedemptions(pending);
      setRedemptionHistory(history);
      setDenialDialog(null);
      setDenialReason('');
    } catch (error) {
      console.error('Failed to deny redemption:', error);
    } finally {
      setProcessingRedemption(null);
    }
  };

  const handleComplete = async () => {
    if (!completionDialog || !currentFamily || !currentMember) return;

    try {
      setProcessingRedemption(completionDialog.redemptionId);
      await completeRedemption(currentFamily.id, completionDialog.redemptionId, currentMember.id, completionNotes, completionRating);

      // Refresh data
      const [pending, history] = await Promise.all([
        getPendingRedemptions(currentFamily.id),
        getRedemptionHistory(currentFamily.id)
      ]);

      setPendingRedemptions(pending);
      setRedemptionHistory(history);
      setCompletionDialog(null);
      setCompletionNotes('');
      setCompletionRating(5);
    } catch (error) {
      console.error('Failed to complete redemption:', error);
    } finally {
      setProcessingRedemption(null);
    }
  };

  const getRewardDetails = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const getMemberDetails = (memberId: string) => {
    return currentFamily?.members.find(m => m.id === memberId);
  };

  const renderRedemptionCard = (redemption: RewardRedemption) => {
    const reward = getRewardDetails(redemption.rewardId);
    const member = getMemberDetails(redemption.memberId);
    const isProcessing = processingRedemption === redemption.id;

    if (!reward || !member) return null;

    return (
      <Card key={redemption.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{reward.emoji}</div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{reward.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Requested by {member.displayName} • {redemption.pointsRequired} points
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(redemption.requestedAt).toLocaleDateString()}
              </div>
              <div className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                redemption.status === 'pending' && "bg-yellow-100 text-yellow-700",
                redemption.status === 'approved' && "bg-green-100 text-green-700",
                redemption.status === 'denied' && "bg-red-100 text-red-700",
                redemption.status === 'completed' && "bg-blue-100 text-blue-700"
              )}>
                {redemption.status}
              </div>
            </div>
          </div>

          {redemption.requestMessage && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Message</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{redemption.requestMessage}</p>
            </div>
          )}

          {activeTab === 'pending' && redemption.status === 'pending' && (
            <div className="flex space-x-3">
              <Button
                onClick={() => handleApprove(redemption.id)}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isProcessing ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDenialDialog({
                  redemptionId: redemption.id,
                  memberName: member.displayName,
                  rewardTitle: reward.title
                })}
                disabled={isProcessing}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deny
              </Button>
            </div>
          )}

          {activeTab === 'history' && redemption.status === 'approved' && (
            <div className="flex space-x-3">
              <Button
                onClick={() => setCompletionDialog({
                  redemptionId: redemption.id,
                  memberName: member.displayName,
                  rewardTitle: reward.title
                })}
                disabled={isProcessing}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
          )}

          {redemption.denialReason && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-400">Denial Reason</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">{redemption.denialReason}</p>
            </div>
          )}

          {redemption.completionNotes && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">Completion Notes</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400">{redemption.completionNotes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const getRedemptionList = () => {
    switch (activeTab) {
      case 'pending':
        return pendingRedemptions;
      case 'history':
        return redemptionHistory;
      default:
        return [];
    }
  };

  if (!currentFamily || !currentMember || !isParent) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Reward Redemptions"
      size="xl"
    >
      <div className="text-center mb-6">
        <Gift className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Reward Redemptions</h3>
        <p className="text-gray-600 dark:text-gray-400">Approve, deny, and track reward redemptions</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'pending', label: 'Pending', icon: Clock, count: pendingRedemptions.length },
          { id: 'history', label: 'History', icon: History, count: redemptionHistory.length }
        ].map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as TabType)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === id
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            <span className={cn(
              "px-2 py-1 text-xs rounded-full",
              activeTab === id
                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-purple-600 dark:text-purple-400 font-medium">Loading redemptions...</p>
        </div>
      ) : getRedemptionList().length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {activeTab === 'pending' ? 'No Pending Redemptions' : 'No Redemption History'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {activeTab === 'pending'
              ? 'All redemptions have been processed!'
              : 'No completed redemptions yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {getRedemptionList().map(renderRedemptionCard)}
        </div>
      )}

      {/* Denial Dialog */}
      {denialDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Deny Redemption
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Deny {denialDialog.memberName}'s request for "{denialDialog.rewardTitle}"?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={denialReason}
                onChange={(e) => setDenialReason(e.target.value)}
                placeholder="Explain why this redemption was denied..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setDenialDialog(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeny}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                Deny Redemption
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Dialog */}
      {completionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Mark as Complete
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mark {completionDialog.memberName}'s "{completionDialog.rewardTitle}" as completed?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rating (1-5 stars)
              </label>
              <div className="flex space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setCompletionRating(star)}
                    className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      star <= completionRating
                        ? "text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Add notes about the redemption..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setCompletionDialog(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mark Complete
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
