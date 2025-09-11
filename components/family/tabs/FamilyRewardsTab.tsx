'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyRewards } from '@/hooks/useFamilyRewards';
import { approveRedemption, denyRedemption } from '@/lib/familyDb';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProfileImage } from '@/components/ui/ProfileImage';
import { CreateFamilyRewardModal } from '@/components/family/CreateFamilyRewardModal';
import { ManageFamilyRewardsModal } from '@/components/family/ManageFamilyRewardsModal';
import { Gift, Plus, Star, Clock, Users, DollarSign, Crown, CheckCircle, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FamilyRewardsTab() {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { 
    rewards, 
    getAvailableRewards, 
    getRewardsByCategory, 
    redeemReward, 
    getPendingRedemptions, 
    loading 
  } = useFamilyRewards();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [showCreateRewardModal, setShowCreateRewardModal] = useState(false);
  const [showManageRewardsModal, setShowManageRewardsModal] = useState(false);
  
  if (!currentFamily || !currentMember) {
    return null;
  }
  
  const categories = getRewardsByCategory();
  const memberPoints = currentMember?.stats.totalPoints || 0;
  const availableRewards = getAvailableRewards(memberPoints);
  const pendingRedemptions = getPendingRedemptions();
  
  const categoryIcons: Record<string, string> = {
    experience: '🎪',
    purchase: '🛍️',
    privilege: '👑',
    activity: '🎨',
    time: '⏰'
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

  return (
    <div className="px-6">
      {/* Stats and Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
            {memberPoints} Points Available
          </span>
          <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
            {rewards.length} Rewards Available
          </span>
        </div>
        
        {isParent && (
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowManageRewardsModal(true)}
            >
              <Settings className="w-5 h-5 mr-2" />
              Manage
            </Button>
            <Button onClick={() => setShowCreateRewardModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create Reward
            </Button>
          </div>
        )}
      </div>
      
      {/* Member Points Display */}
      <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: currentMember.color }}
              >
                {currentMember.avatar}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">{currentMember.displayName}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Level {Math.floor(memberPoints / 100) + 1}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{memberPoints}</span>
              <span className="text-sm text-gray-600 dark:text-gray-300">points</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter & Pending Approvals */}
      {(isParent || rewards.length > 0) && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {pendingRedemptions.length > 0 && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span className="text-orange-800 dark:text-orange-200 text-sm font-medium">
                  {pendingRedemptions.length} pending approval{pendingRedemptions.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          
          {/* Category Filter */}
          {rewards.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant={selectedCategory === null ? "primary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {Object.entries(categories).map(([category, categoryRewards]) => (
                categoryRewards.length > 0 && (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="flex items-center space-x-1"
                  >
                    <span>{categoryIcons[category]}</span>
                    <span className="capitalize">{category}</span>
                    <span className="text-xs">({categoryRewards.length})</span>
                  </Button>
                )
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Empty State */}
      {rewards.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Rewards Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {isParent 
              ? "Create your first family reward to get started!" 
              : "Ask a parent to set up some rewards for the family."}
          </p>
          {isParent && (
            <Button onClick={() => setShowCreateRewardModal(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Create First Reward
            </Button>
          )}
        </div>
      )}
      
      {/* Rewards Grid */}
      {rewards.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(selectedCategory 
            ? categories[selectedCategory as keyof typeof categories] || []
            : rewards
          ).map((reward: any) => {
            const canAfford = memberPoints >= reward.pointsRequired;
            const isAvailable = availableRewards.some(r => r.id === reward.id);
            const isRedemptionPending = redeeming === reward.id;
            
            return (
              <Card 
                key={reward.id} 
                className={cn(
                  "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-lg",
                  canAfford && isAvailable ? "border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600" : "opacity-75",
                  isRedemptionPending && "animate-pulse"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">{reward.emoji}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight text-gray-900 dark:text-white">{reward.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium capitalize">
                            {reward.category}
                          </div>
                          {reward.requiresApproval && (
                            <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-xs font-medium">
                              Approval Required
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Points Badge */}
                    <div className={cn(
                      "flex items-center space-x-1 px-3 py-2 rounded-full font-bold text-sm",
                      canAfford && isAvailable 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    )}>
                      <Star className="w-4 h-4" />
                      <span>{reward.pointsRequired}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {reward.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {reward.description}
                    </p>
                  )}
                  
                  {/* Redeem Button */}
                  {!isParent ? (
                    <Button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={!canAfford || !isAvailable || isRedemptionPending || loading}
                      className={cn(
                        "w-full",
                        canAfford && isAvailable 
                          ? "bg-blue-600 hover:bg-blue-700" 
                          : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                      )}
                    >
                      {isRedemptionPending ? (
                        "Redeeming..."
                      ) : !canAfford ? (
                        `Need ${reward.pointsRequired - memberPoints} more points`
                      ) : !isAvailable ? (
                        "Not Available"
                      ) : (
                        "Redeem Now"
                      )}
                    </Button>
                  ) : (
                    <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                      Parent view - members can redeem this reward
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Pending Redemptions for Parents */}
      {isParent && pendingRedemptions.length > 0 && (
        <Card className="mt-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRedemptions.map((redemption) => {
                const reward = rewards.find(r => r.id === redemption.rewardId);
                const member = currentFamily.members.find(m => m.id === redemption.memberId);
                
                if (!reward || !member) return null;
                
                return (
                  <div key={redemption.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <ProfileImage
                        name={member.displayName}
                        profileImageUrl={member.profileImageUrl}
                        color={member.color}
                        size={40}
                        showBorder={true}
                        borderColor="rgba(255,255,255,0.8)"
                        className="shadow-sm"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.displayName} wants to redeem:
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-2xl">{reward.emoji}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{reward.title}</span>
                          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                            <Star className="w-3 h-3" />
                            <span>{reward.pointsRequired} points</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Requested {new Date(redemption.requestedAt.toDate()).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApproveRedemption(redemption.id)}
                        disabled={processingApproval === redemption.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {processingApproval === redemption.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() => handleDenyRedemption(redemption.id, 'Not available at this time')}
                        disabled={processingApproval === redemption.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {processingApproval === redemption.id ? 'Denying...' : 'Deny'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <CreateFamilyRewardModal
        isOpen={showCreateRewardModal}
        onClose={() => setShowCreateRewardModal(false)}
      />

      <ManageFamilyRewardsModal
        isOpen={showManageRewardsModal}
        onClose={() => setShowManageRewardsModal(false)}
      />
    </div>
  );
}