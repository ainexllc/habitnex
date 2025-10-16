'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { 
  getPendingRedemptions, 
  getRedemptionHistory, 
  approveRedemption, 
  denyRedemption, 
  completeRedemption 
} from '@/lib/familyDb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  AlertTriangle,
  History,
  MessageSquare,
  DollarSign,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { RewardRedemption, Reward } from '@/types/family';

type TabType = 'pending' | 'history';

export default function RewardManagementPage() {
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

  useEffect(() => {
    if (!currentFamily?.id) return;

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
  }, [currentFamily?.id]);

  if (!currentFamily || !currentMember || !isParent) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">Only parents can manage reward redemptions.</p>
              <Link href="/family/rewards">
                <Button>Back to Rewards</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const handleApprove = async (redemptionId: string) => {
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
    if (!denialDialog) return;

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
    if (!completionDialog) return;

    try {
      setProcessingRedemption(completionDialog.redemptionId);
      await completeRedemption(
        currentFamily.id, 
        completionDialog.redemptionId, 
        completionNotes, 
        completionRating
      );
      
      // Refresh data
      const history = await getRedemptionHistory(currentFamily.id);
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

  const getRewardInfo = (rewardId: string) => {
    return rewards.find(r => r.id === rewardId);
  };

  const getMemberInfo = (memberId: string) => {
    return currentFamily.members.find(m => m.id === memberId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderRedemptionCard = (redemption: RewardRedemption) => {
    const reward = getRewardInfo(redemption.rewardId);
    const member = getMemberInfo(redemption.memberId);
    const isPending = redemption.status === 'pending';
    const isApproved = redemption.status === 'approved';

    return (
      <Card key={redemption.id} className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: member?.color }}
              >
                {member?.avatar}
              </div>
              <div>
                <h3 className="font-semibold">{member?.displayName}</h3>
                <div className="text-sm text-gray-600">
                  Requested {new Date(redemption.requestedAt.toDate()).toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              getStatusColor(redemption.status)
            )}>
              {redemption.status.charAt(0).toUpperCase() + redemption.status.slice(1)}
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">{reward?.emoji}</div>
            <div className="flex-1">
              <h4 className="font-medium">{reward?.title}</h4>
              <p className="text-sm text-gray-600">{reward?.description}</p>
            </div>
            <div className="flex items-center space-x-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-full">
              <Star className="w-4 h-4" />
              <span className="font-semibold">{redemption.pointsSpent}</span>
            </div>
          </div>

          {reward?.budgetCost && (
            <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
              <DollarSign className="w-4 h-4" />
              <span>Estimated cost: ${reward.budgetCost.toFixed(2)}</span>
            </div>
          )}

          {redemption.denialReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Denied</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{redemption.denialReason}</p>
            </div>
          )}

          {redemption.notes && redemption.status === 'completed' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700 mb-1">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">Completion Notes</span>
              </div>
              <p className="text-blue-600 text-sm">{redemption.notes}</p>
              {redemption.rating && (
                <div className="flex items-center space-x-1 mt-2">
                  <span className="text-xs text-blue-600">Rating:</span>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "w-3 h-3",
                        i < redemption.rating! ? "text-yellow-500 fill-current" : "text-gray-300"
                      )} 
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-xs text-gray-500">
              {redemption.approvedAt && (
                <span>
                  {redemption.status === 'denied' ? 'Denied' : 'Approved'} by {
                    getMemberInfo(redemption.approvedBy!)?.displayName
                  } on {new Date(redemption.approvedAt.toDate()).toLocaleDateString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {isPending && (
                <>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(redemption.id)}
                    disabled={processingRedemption === redemption.id}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {processingRedemption === redemption.id ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() => setDenialDialog({
                      redemptionId: redemption.id,
                      memberName: member?.displayName || 'Unknown',
                      rewardTitle: reward?.title || 'Unknown Reward'
                    })}
                    disabled={processingRedemption === redemption.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Deny
                  </Button>
                </>
              )}

              {isApproved && (
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setCompletionDialog({
                    redemptionId: redemption.id,
                    memberName: member?.displayName || 'Unknown',
                    rewardTitle: reward?.title || 'Unknown Reward'
                  })}
                  disabled={processingRedemption === redemption.id}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-purple-600 font-medium">Loading redemption data...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/family/rewards">
                <Button variant="ghost" className="flex items-center mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Rewards
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Manage Reward Redemptions</h1>
              <p className="text-gray-600">Approve, deny, and track family reward redemptions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div className="text-2xl font-bold text-orange-600">{pendingRedemptions.length}</div>
                </div>
                <div className="text-gray-600 text-sm">Pending Approvals</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {redemptionHistory.filter(r => r.status === 'approved' || r.status === 'completed').length}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">Approved This Month</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Star className="w-6 h-6 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    {redemptionHistory.reduce((sum, r) => sum + r.pointsSpent, 0)}
                  </div>
                </div>
                <div className="text-gray-600 text-sm">Total Points Redeemed</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('pending')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2",
                activeTab === 'pending'
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              )}
            >
              <Clock className="w-4 h-4" />
              <span>Pending ({pendingRedemptions.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2",
                activeTab === 'history'
                  ? "bg-purple-600 text-white"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              )}
            >
              <History className="w-4 h-4" />
              <span>History ({redemptionHistory.length})</span>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'pending' && (
              <>
                {pendingRedemptions.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Approvals</h3>
                      <p className="text-gray-600">All reward redemptions have been processed!</p>
                    </CardContent>
                  </Card>
                ) : (
                  pendingRedemptions.map(renderRedemptionCard)
                )}
              </>
            )}

            {activeTab === 'history' && (
              <>
                {redemptionHistory.length === 0 ? (
                  <Card className="text-center py-12">
                    <CardContent>
                      <History className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Redemption History</h3>
                      <p className="text-gray-600">No rewards have been redeemed yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  redemptionHistory.map(renderRedemptionCard)
                )}
              </>
            )}
          </div>
        </div>

        {/* Denial Dialog */}
        {denialDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span>Deny Redemption</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Are you sure you want to deny <strong>{denialDialog.memberName}&apos;s</strong> request for <strong>{denialDialog.rewardTitle}</strong>?
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for denial
                  </label>
                  <Textarea
                    value={denialReason}
                    onChange={(e) => setDenialReason(e.target.value)}
                    placeholder="Explain why this request is being denied..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleDeny}
                    disabled={!denialReason.trim() || processingRedemption === denialDialog.redemptionId}
                    className="bg-red-600 hover:bg-red-700 flex-1"
                  >
                    {processingRedemption === denialDialog.redemptionId ? 'Denying...' : 'Deny Redemption'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDenialDialog(null);
                      setDenialReason('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completion Dialog */}
        {completionDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span>Complete Redemption</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Mark <strong>{completionDialog.memberName}&apos;s</strong> <strong>{completionDialog.rewardTitle}</strong> as completed.
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion notes (optional)
                  </label>
                  <Textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="Any notes about how the reward was fulfilled..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars)
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setCompletionRating(rating)}
                        className="p-1"
                      >
                        <Star
                          className={cn(
                            "w-6 h-6",
                            rating <= completionRating
                              ? "text-yellow-500 fill-current"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    onClick={handleComplete}
                    disabled={processingRedemption === completionDialog.redemptionId}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {processingRedemption === completionDialog.redemptionId ? 'Completing...' : 'Mark Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCompletionDialog(null);
                      setCompletionNotes('');
                      setCompletionRating(5);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}