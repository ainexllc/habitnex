'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyRewards } from '@/hooks/useFamilyRewards';
import { approveRedemption, denyRedemption } from '@/lib/familyDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { Gift, Plus, Star, Clock, Users, DollarSign, ArrowLeft, Crown, CheckCircle, XCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FamilyRewardsPage() {
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
  
  const categories = getRewardsByCategory();
  const memberPoints = currentMember?.stats.totalPoints || 0;
  const availableRewards = getAvailableRewards(memberPoints);
  const pendingRedemptions = getPendingRedemptions();
  
  const handleRedeem = async (rewardId: string) => {
    if (!currentMember) return;
    
    try {
      setRedeeming(rewardId);
      await redeemReward(rewardId);
      // Success feedback handled by the hook
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
      // The UI will update automatically through the hook's real-time subscription
    } catch (error) {
      console.error('Failed to approve redemption:', error);
      // TODO: Show error toast
    } finally {
      setProcessingApproval(null);
    }
  };

  const handleDenyRedemption = async (redemptionId: string, reason?: string) => {
    if (!currentMember || !currentFamily) return;

    try {
      setProcessingApproval(redemptionId);
      await denyRedemption(currentFamily.id, redemptionId, currentMember.id, reason);
      // The UI will update automatically through the hook's real-time subscription
    } catch (error) {
      console.error('Failed to deny redemption:', error);
      // TODO: Show error toast
    } finally {
      setProcessingApproval(null);
    }
  };
  
  if (!currentFamily || !currentMember) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">No Family Found</h2>
              <p className="text-gray-600 mb-4">You need to be in a family to view rewards.</p>
              <Link href="/family/onboarding">
                <Button>Join or Create Family</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }
  
  const categoryIcons: Record<string, string> = {
    experience: '🎪',
    purchase: '🛍️',
    privilege: '👑',
    activity: '🎨',
    time: '⏰'
  };
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/family/dashboard">
                <Button variant="ghost" className="flex items-center mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Family Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Family Rewards Store</h1>
              <p className="text-gray-600">Redeem your points for awesome rewards!</p>
            </div>
            
            {/* Member Points Display */}
            <Card className="shadow-lg border-2 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: currentMember.color }}
                  >
                    {currentMember.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{currentMember.displayName}</div>
                    <div className="text-sm text-gray-500">Level {Math.floor(memberPoints / 100) + 1}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-2xl font-bold text-purple-600">{memberPoints}</span>
                  <span className="text-sm text-gray-600">points</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Parent Controls */}
          {isParent && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/family/rewards/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Reward
                  </Button>
                </Link>
                <Link href="/family/rewards/manage">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Redemptions
                  </Button>
                </Link>
                {pendingRedemptions.length > 0 && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-orange-100 border border-orange-200 rounded-lg">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-800 text-sm font-medium">
                      {pendingRedemptions.length} pending approval{pendingRedemptions.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Category Filter */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {Object.entries(categories).map(([category, categoryRewards]) => (
                  categoryRewards.length > 0 && (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
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
            </div>
          )}
          
          {/* No Rewards Message */}
          {rewards.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Gift className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rewards Yet</h3>
                <p className="text-gray-600 mb-6">
                  {isParent 
                    ? "Create your first family reward to get started!" 
                    : "Ask a parent to set up some rewards for the family."}
                </p>
                {isParent && (
                  <Link href="/family/rewards/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Reward
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Rewards Grid */}
          {rewards.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedCategory 
                ? categories[selectedCategory] || []
                : rewards
              ).map((reward) => {
                const canAfford = memberPoints >= reward.pointsRequired;
                const isAvailable = availableRewards.some(r => r.id === reward.id);
                const isRedemptionPending = redeeming === reward.id;
                
                return (
                  <Card 
                    key={reward.id} 
                    className={cn(
                      "transition-all duration-200 hover:shadow-lg",
                      canAfford && isAvailable ? "border-2 border-purple-200 hover:border-purple-400" : "opacity-75",
                      isRedemptionPending && "animate-pulse"
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{reward.emoji}</div>
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight">{reward.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                                {reward.category}
                              </div>
                              {reward.requiresApproval && (
                                <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
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
                            ? "bg-purple-600 text-white" 
                            : "bg-gray-200 text-gray-600"
                        )}>
                          <Star className="w-4 h-4" />
                          <span>{reward.pointsRequired}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {reward.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {reward.description}
                        </p>
                      )}
                      
                      {/* Reward Info */}
                      <div className="space-y-2 mb-4 text-xs text-gray-500">
                        {reward.budgetCost && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-3 h-3" />
                            <span>Est. cost: ${reward.budgetCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {reward.maxRedemptions && (
                          <div className="flex items-center space-x-2">
                            <Crown className="w-3 h-3" />
                            <span>Limit: {reward.maxRedemptions} redemptions</span>
                          </div>
                        )}
                        
                        {reward.availableToMembers.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Users className="w-3 h-3" />
                            <span>Limited availability</span>
                          </div>
                        )}
                        
                        {reward.expiresAt && (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              Expires: {new Date(reward.expiresAt.toDate()).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Redeem Button */}
                      {!isParent ? (
                        <Button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canAfford || !isAvailable || isRedemptionPending || loading}
                          className={cn(
                            "w-full",
                            canAfford && isAvailable 
                              ? "bg-purple-600 hover:bg-purple-700" 
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
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
                        <div className="text-center text-sm text-gray-500">
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
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-orange-600" />
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
                      <div key={redemption.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {member.avatarStyle && member.avatarSeed ? (
                            <DiceBearAvatar
                              seed={member.avatarSeed}
                              style={member.avatarStyle}
                              size={40}
                              className="border-2 border-white shadow-sm"
                              backgroundColor={member.color}
                              fallbackEmoji={member.avatar}
                            />
                          ) : (
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: member.color }}
                            >
                              {member.avatar}
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {member.displayName} wants to redeem:
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-2xl">{reward.emoji}</span>
                              <span className="font-medium">{reward.title}</span>
                              <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                <Star className="w-3 h-3" />
                                <span>{reward.pointsRequired} points</span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
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
        </div>
      </div>
    </ProtectedRoute>
  );
}