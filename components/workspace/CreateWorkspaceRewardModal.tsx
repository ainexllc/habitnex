'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyRewards, useRewardTemplates } from '@/hooks/useFamilyRewards';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { CreateRewardRequest } from '@/types/family';
import {
  Gift,
  Star,
  Clock,
  DollarSign,
  Users,
  Target,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateWorkspaceRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryOptions = [
  { value: 'experience', label: 'Experience', icon: '🎪', description: 'Fun activities and outings' },
  { value: 'purchase', label: 'Purchase', icon: '🛍️', description: 'Toys, books, and items' },
  { value: 'privilege', label: 'Privilege', icon: '👑', description: 'Special permissions and perks' },
  { value: 'activity', label: 'Activity', icon: '🎨', description: 'Creative and learning activities' },
  { value: 'time', label: 'Time', icon: '⏰', description: 'Extra screen time and late bedtime' }
] as const;

const pointSuggestions = [
  { range: '5-10', description: 'Small rewards (treats, stickers)', examples: ['Special snack', 'Choose TV show'] },
  { range: '15-25', description: 'Medium rewards (toys, activities)', examples: ['Small toy', 'Extra playtime'] },
  { range: '30-50', description: 'Big rewards (outings, experiences)', examples: ['Movie night', 'Park visit'] },
  { range: '75-100+', description: 'Major rewards (special purchases)', examples: ['New book', 'Special outing'] }
];

const emojiOptions = ['🎁', '🎯', '⭐', '🎪', '🛍️', '👑', '🎨', '⏰', '🎮', '🍕', '🎬', '🏆', '🌟', '💝', '🎲', '🎪'];

export function CreateWorkspaceRewardModal({ isOpen, onClose }: CreateWorkspaceRewardModalProps) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const { createReward, loading } = useFamilyRewards();
  const templates = useRewardTemplates();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    emoji: '🎁',
    category: 'experience' as 'experience' | 'purchase' | 'privilege' | 'activity' | 'time',
    pointsRequired: 10,
    budgetCost: 0,
    requiresApproval: true,
    maxRedemptions: 0,
    availableToMembers: [] as string[],
    expiresAt: '',
  });

  const [step, setStep] = useState<'basic' | 'members' | 'review'>('basic');
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        emoji: '🎁',
        category: 'experience',
        pointsRequired: 10,
        budgetCost: 0,
        requiresApproval: true,
        maxRedemptions: 0,
        availableToMembers: [],
        expiresAt: '',
      });
      setStep('basic');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentFamily || !currentMember) {
      setError('Must be in a family to create rewards');
      return;
    }

    if (!formData.title.trim()) {
      setError('Reward title is required');
      return;
    }

    if (formData.availableToMembers.length === 0) {
      setError('Please select at least one family member');
      return;
    }

    try {
      setError(null);

      const rewardData: Omit<CreateRewardRequest['reward'], 'familyId'> = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        emoji: formData.emoji,
        category: formData.category,
        pointsRequired: formData.pointsRequired,
        budgetCost: formData.budgetCost,
        requiresApproval: formData.requiresApproval,
        maxRedemptions: formData.maxRedemptions || undefined,
        availableToMembers: formData.availableToMembers,
        expiresAt: formData.expiresAt || undefined,
        createdBy: currentMember.id,
      };

      await createReward(rewardData);
      onClose();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reward');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setStep('basic');
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'basic':
        return (
          <>
            <div className="text-center mb-6">
              <Gift className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Family Reward</h3>
              <p className="text-gray-600 dark:text-gray-400">Set up rewards for your family's hard work</p>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reward Title *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Movie Night, New Toy"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="text-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe what this reward includes..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose Emoji
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2",
                            formData.emoji === emoji
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                          onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <div className="space-y-2">
                      {categoryOptions.map((category) => (
                        <label key={category.value} className="cursor-pointer">
                          <input
                            type="radio"
                            name="category"
                            value={category.value}
                            checked={formData.category === category.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                            className="sr-only"
                          />
                          <div className={cn(
                            "p-3 border-2 rounded-lg flex items-center space-x-3",
                            formData.category === category.value
                              ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}>
                            <span className="text-2xl">{category.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{category.label}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{category.description}</div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Points Required *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.pointsRequired}
                        onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget Cost ($)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.budgetCost}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresApproval}
                        onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                        className="w-5 h-5 text-purple-600 dark:text-purple-400 rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Requires Parent Approval</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Parent must approve before reward is redeemed
                        </div>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Redemptions (0 = unlimited)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.maxRedemptions}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || 0 }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expires At (Optional)
                      </label>
                      <Input
                        type="datetime-local"
                        value={formData.expiresAt}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Point Suggestions</h4>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  {pointSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white dark:bg-gray-700 p-3 rounded border">
                      <div className="font-medium text-purple-600 dark:text-purple-400">{suggestion.range} points</div>
                      <div className="text-gray-600 dark:text-gray-400 mb-1">{suggestion.description}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        Examples: {suggestion.examples.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  type="button"
                  onClick={() => setStep('members')}
                  size="lg"
                  disabled={!formData.title.trim()}
                >
                  Next: Select Members
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'members':
        return (
          <>
            <div className="text-center mb-6">
              <Users className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Family Members</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose who can redeem this reward</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Available to Members *
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentFamily.members.filter(m => m.isActive).map((member) => (
                    <label key={member.id} className="cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.availableToMembers.includes(member.id)}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            availableToMembers: e.target.checked
                              ? [...prev.availableToMembers, member.id]
                              : prev.availableToMembers.filter(id => id !== member.id)
                          }));
                        }}
                        className="sr-only"
                      />
                      <div className={cn(
                        "p-4 border-2 rounded-lg flex items-center space-x-3",
                        formData.availableToMembers.includes(member.id)
                          ? 'border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      )}>
                        {member.avatarStyle && member.avatarSeed ? (
                          <DiceBearAvatar
                            seed={member.avatarSeed}
                            style={member.avatarStyle}
                            size={48}
                            className="border-2 border-white shadow-sm"
                            backgroundColor={member.color}
                            fallbackEmoji={member.avatar}
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.avatar}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{member.displayName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {member.stats?.totalPoints || 0} points available
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('basic')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep('review')}
                  className="flex-1"
                  disabled={formData.availableToMembers.length === 0}
                >
                  Review & Create
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      case 'review':
        return (
          <>
            <div className="text-center mb-6">
              <Star className="w-12 h-12 mx-auto text-green-600 dark:text-green-400 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Your Reward</h3>
              <p className="text-gray-600 dark:text-gray-400">Make sure everything looks good before creating</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-4xl">{formData.emoji}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.title}</h3>
                    {formData.description && (
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{formData.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="ml-2 font-medium capitalize">{formData.category}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Points Required:</span>
                    <span className="ml-2 font-medium">{formData.pointsRequired}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Budget Cost:</span>
                    <span className="ml-2 font-medium">${formData.budgetCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Requires Approval:</span>
                    <span className="ml-2 font-medium">{formData.requiresApproval ? 'Yes' : 'No'}</span>
                  </div>
                  {formData.maxRedemptions > 0 && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Max Redemptions:</span>
                      <span className="ml-2 font-medium">{formData.maxRedemptions}</span>
                    </div>
                  )}
                  {formData.expiresAt && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                      <span className="ml-2 font-medium">{new Date(formData.expiresAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Available Members */}
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available to:</div>
                  <div className="flex flex-wrap gap-2">
                    {formData.availableToMembers.map((memberId) => {
                      const member = currentFamily.members.find(m => m.id === memberId);
                      return member ? (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm"
                          style={{ backgroundColor: `${member.color}20`, color: member.color }}
                        >
                          <span>{member.avatar}</span>
                          <span>{member.displayName}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('members')}
                  className="flex-1"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Reward'}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Family Reward"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['basic', 'members', 'review'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === stepName ? 'bg-purple-600 text-white' :
                  ['basic', 'members', 'review'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                )}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className="w-8 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                    <div className={cn(
                      "h-full bg-purple-600 transition-all duration-300",
                      ['basic', 'members', 'review'].indexOf(step) > index ? 'w-full' : 'w-0'
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}
      </form>
    </Modal>
  );
}
