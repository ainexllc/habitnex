import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  Reward, 
  RewardRedemption,
  CreateRewardRequest 
} from '@/types/family';
import {
  createReward,
  getFamilyRewards,
  redeemReward
} from '@/lib/familyDb';

export function useFamilyRewards(memberId?: string) {
  const { currentFamily, currentMember, isParent } = useFamily();
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const targetMemberId = memberId || currentMember?.id;
  
  // Load rewards data
  const loadData = useCallback(async () => {
    if (!currentFamily?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const rewardsData = await getFamilyRewards(currentFamily.id, targetMemberId);
      setRewards(rewardsData);
      
      // TODO: Load redemptions when implemented
      setRedemptions([]);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rewards';
      setError(errorMessage);
      console.error('Failed to load family rewards:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, targetMemberId]);
  
  // Load data when family or member changes
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Create new reward (parent only)
  const createNewReward = useCallback(async (rewardData: Omit<CreateRewardRequest['reward'], 'familyId'>) => {
    if (!currentFamily?.id || !currentMember?.id || !isParent) {
      throw new Error('Only parents can create rewards');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const request: CreateRewardRequest = {
        familyId: currentFamily.id,
        reward: {
          ...rewardData,
          createdBy: currentMember.id,
          isActive: true,
          totalRedemptions: 0,
          availableToMembers: rewardData.availableToMembers || [], // Empty means all members
          requiresApproval: rewardData.requiresApproval ?? true // Default to requiring approval
        }
      };
      
      await createReward(request);
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reward';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, currentMember?.id, isParent, loadData]);
  
  // Redeem a reward
  const redeemRewardForMember = useCallback(async (rewardId: string, memberId?: string) => {
    if (!currentFamily?.id) {
      throw new Error('Must be in a family to redeem rewards');
    }
    
    const redeemingMemberId = memberId || targetMemberId;
    if (!redeemingMemberId) {
      throw new Error('Member ID required for redemption');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await redeemReward(currentFamily.id, rewardId, redeemingMemberId);
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to redeem reward';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentFamily?.id, targetMemberId, loadData]);
  
  // Get available rewards for a member (filters by points and availability)
  const getAvailableRewards = useCallback((memberPoints: number, specificMemberId?: string) => {
    const checkMemberId = specificMemberId || targetMemberId;
    
    return rewards.filter(reward => {
      // Check if member has enough points
      if (memberPoints < reward.pointsRequired) return false;
      
      // Check if reward is available to this member
      if (reward.availableToMembers.length > 0 && checkMemberId) {
        if (!reward.availableToMembers.includes(checkMemberId)) return false;
      }
      
      // Check if reward is expired
      if (reward.expiresAt && new Date() > reward.expiresAt.toDate()) return false;
      
      // Check if reward has reached max redemptions
      if (reward.maxRedemptions && reward.totalRedemptions >= reward.maxRedemptions) return false;
      
      return reward.isActive;
    });
  }, [rewards, targetMemberId]);
  
  // Get rewards by category
  const getRewardsByCategory = useCallback(() => {
    const categories = {
      experience: rewards.filter(r => r.category === 'experience'),
      purchase: rewards.filter(r => r.category === 'purchase'),
      privilege: rewards.filter(r => r.category === 'privilege'),
      activity: rewards.filter(r => r.category === 'activity'),
      time: rewards.filter(r => r.category === 'time')
    };
    
    return categories;
  }, [rewards]);
  
  // Get member's redemption history
  const getMemberRedemptions = useCallback((specificMemberId?: string) => {
    const checkMemberId = specificMemberId || targetMemberId;
    
    return redemptions.filter(r => r.memberId === checkMemberId)
      .sort((a, b) => b.requestedAt.toMillis() - a.requestedAt.toMillis());
  }, [redemptions, targetMemberId]);
  
  // Get pending redemptions (for parents)
  const getPendingRedemptions = useCallback(() => {
    return redemptions.filter(r => r.status === 'pending')
      .sort((a, b) => a.requestedAt.toMillis() - b.requestedAt.toMillis());
  }, [redemptions]);
  
  // Approve redemption (parent only)
  const approveRedemption = useCallback(async (redemptionId: string) => {
    if (!isParent) {
      throw new Error('Only parents can approve redemptions');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement approval logic
      console.log('Approving redemption:', redemptionId);
      
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to approve redemption';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isParent, loadData]);
  
  // Deny redemption (parent only)
  const denyRedemption = useCallback(async (redemptionId: string, reason?: string) => {
    if (!isParent) {
      throw new Error('Only parents can deny redemptions');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement denial logic
      console.log('Denying redemption:', redemptionId, 'Reason:', reason);
      
      await loadData(); // Refresh data
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to deny redemption';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isParent, loadData]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    // Data
    rewards,
    redemptions,
    
    // State
    loading,
    error,
    
    // Actions
    createReward: createNewReward,
    redeemReward: redeemRewardForMember,
    approveRedemption,
    denyRedemption,
    refresh: loadData,
    
    // Utilities
    getAvailableRewards,
    getRewardsByCategory,
    getMemberRedemptions,
    getPendingRedemptions,
    clearError,
    
    // Permissions
    canCreateRewards: isParent,
    canApproveRedemptions: isParent
  };
}

// Hook for reward templates and suggestions
export function useRewardTemplates() {
  const experienceRewards = [
    { emoji: '🎬', title: 'Movie Night', description: 'Choose the family movie', points: 10 },
    { emoji: '🏊', title: 'Swimming Trip', description: 'Visit the local pool', points: 25 },
    { emoji: '🎳', title: 'Bowling', description: 'Family bowling night', points: 20 },
    { emoji: '🎮', title: 'Arcade Visit', description: 'Spend time at the arcade', points: 15 },
    { emoji: '🍕', title: 'Pizza Party', description: 'Order your favorite pizza', points: 12 }
  ];
  
  const purchaseRewards = [
    { emoji: '📚', title: 'New Book', description: 'Choose a book you want', points: 8 },
    { emoji: '🧸', title: 'Small Toy', description: 'Pick a small toy', points: 15 },
    { emoji: '🍫', title: 'Special Treat', description: 'Your favorite candy or snack', points: 5 },
    { emoji: '🎨', title: 'Art Supplies', description: 'New crayons, markers, or paper', points: 10 },
    { emoji: '⚽', title: 'Sports Equipment', description: 'Ball or sports gear', points: 20 }
  ];
  
  const privilegeRewards = [
    { emoji: '🌙', title: 'Stay Up Late', description: 'Stay up 30 minutes past bedtime', points: 8 },
    { emoji: '🍽️', title: 'Choose Dinner', description: 'Pick what the family eats', points: 6 },
    { emoji: '🚗', title: 'Front Seat', description: 'Ride in the front seat', points: 4 },
    { emoji: '🎵', title: 'Music Choice', description: 'Control the car radio', points: 3 },
    { emoji: '🛏️', title: 'Skip Chore', description: 'Skip one chore this week', points: 10 }
  ];
  
  const timeRewards = [
    { emoji: '📱', title: 'Extra Screen Time', description: '30 minutes extra device time', points: 7 },
    { emoji: '🎮', title: 'Gaming Time', description: '1 hour of video games', points: 10 },
    { emoji: '📺', title: 'TV Time', description: 'Watch an extra show', points: 5 },
    { emoji: '👨‍👩‍👧‍👦', title: 'One-on-One Time', description: 'Special time with parent', points: 15 }
  ];
  
  const activityRewards = [
    { emoji: '🎨', title: 'Art Project', description: 'Do a fun craft together', points: 12 },
    { emoji: '👩‍🍳', title: 'Cooking Together', description: 'Help make a special meal', points: 15 },
    { emoji: '🏃', title: 'Playground Visit', description: 'Extra time at the park', points: 8 },
    { emoji: '🎪', title: 'Family Game', description: 'Choose the family game night game', points: 6 }
  ];
  
  return {
    experienceRewards,
    purchaseRewards,
    privilegeRewards,
    timeRewards,
    activityRewards,
    
    getAllTemplates: () => [
      ...experienceRewards,
      ...purchaseRewards,
      ...privilegeRewards,
      ...timeRewards,
      ...activityRewards
    ]
  };
}