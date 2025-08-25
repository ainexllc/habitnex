'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/contexts/FamilyContext';
import { useFamilyRewards, useRewardTemplates } from '@/hooks/useFamilyRewards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { CreateRewardRequest } from '@/types/family';
import { ArrowLeft, Gift, Star, Clock, DollarSign, Users, Target } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

export default function CreateRewardPage() {
  const router = useRouter();
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
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [step, setStep] = useState<'template' | 'details' | 'settings' | 'preview'>('template');
  const [error, setError] = useState<string | null>(null);
  
  const handleTemplateSelect = (template: any) => {
    setFormData(prev => ({
      ...prev,
      title: template.title,
      description: template.description,
      emoji: template.emoji,
      pointsRequired: template.points,
      category: template.category || 'experience'
    }));
    setSelectedTemplate(template.title);
    setStep('details');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentFamily || !currentMember || !isParent) {
      setError('Only parents can create rewards');
      return;
    }
    
    if (!formData.title.trim()) {
      setError('Reward title is required');
      return;
    }
    
    if (formData.pointsRequired <= 0) {
      setError('Points required must be greater than 0');
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
        isActive: true,
        availableToMembers: formData.availableToMembers,
        maxRedemptions: formData.maxRedemptions > 0 ? formData.maxRedemptions : undefined,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt) as any : undefined,
        requiresApproval: formData.requiresApproval,
        budgetCost: formData.budgetCost > 0 ? formData.budgetCost : undefined,
        createdBy: currentMember.id
      };
      
      await createReward(rewardData);
      router.push('/family/rewards');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reward');
    }
  };
  
  if (!currentFamily || !currentMember) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">No Family Found</h2>
              <p className="text-gray-600 mb-4">You need to be in a family to create rewards.</p>
              <Link href="/family/onboarding">
                <Button>Join or Create Family</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }
  
  if (!isParent) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold mb-2">Parents Only</h2>
              <p className="text-gray-600 mb-4">Only parents can create and manage family rewards.</p>
              <Link href="/family/dashboard">
                <Button>Back to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }
  
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/family/dashboard">
                <Button variant="ghost" className="flex items-center mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Family Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Create Family Reward</h1>
              <p className="text-gray-600">Set up incentives for your family members</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Creating for</div>
              <div className="font-medium text-gray-900">{currentFamily.name}</div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {['template', 'details', 'settings', 'preview'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === stepName ? 'bg-purple-600 text-white' : 
                    ['template', 'details', 'settings', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  )}>
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className="w-8 h-1 bg-gray-200 mx-2">
                      <div className={cn(
                        "h-full bg-purple-600 transition-all duration-300",
                        ['template', 'details', 'settings', 'preview'].indexOf(step) > index ? 'w-full' : 'w-0'
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <Card className="shadow-xl">
              {/* Template Selection Step */}
              {step === 'template' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      Choose a Template or Start Fresh
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Categories */}
                    {Object.entries({
                      experience: templates.experienceRewards,
                      purchase: templates.purchaseRewards,
                      privilege: templates.privilegeRewards,
                      time: templates.timeRewards,
                      activity: templates.activityRewards
                    }).map(([category, rewards]) => (
                      <div key={category}>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="text-2xl mr-2">
                            {categoryOptions.find(c => c.value === category)?.icon}
                          </span>
                          {categoryOptions.find(c => c.value === category)?.label} Rewards
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {rewards.map((template) => (
                            <button
                              key={template.title}
                              type="button"
                              className={cn(
                                "p-4 border-2 rounded-lg text-left hover:border-purple-300 transition-colors",
                                selectedTemplate === template.title
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200'
                              )}
                              onClick={() => handleTemplateSelect({ ...template, category })}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <span className="text-2xl">{template.emoji}</span>
                                <div>
                                  <div className="font-medium text-gray-900">{template.title}</div>
                                  <div className="text-sm text-purple-600 font-medium">{template.points} points</div>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{template.description}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Custom Reward Option */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Gift className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Create Custom Reward</h3>
                      <p className="text-gray-600 mb-4">Start from scratch with your own reward idea</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep('details')}
                      >
                        Start Custom Reward
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Details Step */}
              {step === 'details' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Gift className="w-5 h-5 mr-2" />
                      Reward Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reward Title *
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g., Movie Night Choice"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="text-lg"
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          placeholder="Describe what this reward includes..."
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <div className="space-y-2">
                          {categoryOptions.map((option) => (
                            <label key={option.value} className="cursor-pointer">
                              <input
                                type="radio"
                                name="category"
                                value={option.value}
                                checked={formData.category === option.value}
                                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                                className="sr-only"
                              />
                              <div className={cn(
                                "p-3 border-2 rounded-lg flex items-center space-x-3",
                                formData.category === option.value 
                                  ? 'border-purple-500 bg-purple-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              )}>
                                <span className="text-xl">{option.icon}</span>
                                <div>
                                  <div className="font-medium text-gray-900">{option.label}</div>
                                  <div className="text-sm text-gray-500">{option.description}</div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Choose Emoji
                        </label>
                        <div className="grid grid-cols-8 gap-2 mb-4">
                          {['🎁', '🏆', '⭐', '🎉', '🍕', '🎬', '🎮', '📚', '🧸', '🍦', '🎨', '⚽', '🎵', '🛍️', '🎪', '👑'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center text-lg border-2",
                                formData.emoji === emoji
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              )}
                              onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <Input
                          type="text"
                          placeholder="Or enter custom emoji"
                          value={formData.emoji}
                          onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
                          className="text-center"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Points Required *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="1000"
                          value={formData.pointsRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 1 }))}
                          className="text-lg font-bold text-center"
                        />
                        
                        {/* Point Suggestions */}
                        <div className="mt-3">
                          <div className="text-sm text-gray-600 mb-2">Suggested point ranges:</div>
                          <div className="grid md:grid-cols-2 gap-2">
                            {pointSuggestions.map((suggestion) => (
                              <div key={suggestion.range} className="p-2 bg-gray-50 rounded text-xs">
                                <div className="font-medium text-gray-900">{suggestion.range} points</div>
                                <div className="text-gray-600">{suggestion.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {formData.category === 'purchase' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Cost (Optional)
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.budgetCost}
                              onChange={(e) => setFormData(prev => ({ ...prev, budgetCost: parseFloat(e.target.value) || 0 }))}
                              className="pl-10"
                              placeholder="0.00"
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Track real money cost for budgeting
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-4 pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('template')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep('settings')}
                        className="flex-1"
                        disabled={!formData.title.trim() || formData.pointsRequired <= 0}
                      >
                        Next: Settings
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Settings Step */}
              {step === 'settings' && (
                <>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Reward Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.requiresApproval}
                          onChange={(e) => setFormData(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                          className="w-5 h-5 text-purple-600 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">Requires Parent Approval</div>
                          <div className="text-sm text-gray-500">
                            Parent must approve before reward is given
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available to Members
                      </label>
                      <p className="text-sm text-gray-600 mb-3">
                        Leave empty to make available to all family members
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {currentFamily.members.filter(m => m.isActive && m.role !== 'parent').map((member) => (
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
                              "p-3 border-2 rounded-lg flex items-center space-x-3",
                              formData.availableToMembers.includes(member.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            )}>
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
                                <div className="font-medium text-gray-900">{member.displayName}</div>
                                <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Redemption Limit (Optional)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.maxRedemptions}
                          onChange={(e) => setFormData(prev => ({ ...prev, maxRedemptions: parseInt(e.target.value) || 0 }))}
                          placeholder="0 = unlimited"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum times this reward can be redeemed per member
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date (Optional)
                        </label>
                        <Input
                          type="date"
                          value={formData.expiresAt}
                          onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          When this reward becomes unavailable
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 pt-6">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('details')}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep('preview')}
                        className="flex-1"
                      >
                        Review & Create
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Preview Step */}
              {step === 'preview' && (
                <>
                  <CardHeader>
                    <CardTitle>Review Your Reward</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="text-4xl">{formData.emoji}</div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{formData.title}</h3>
                          {formData.description && (
                            <p className="text-gray-600 mt-1">{formData.description}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-purple-600" />
                              <span className="text-purple-600 font-bold">{formData.pointsRequired} points</span>
                            </div>
                            <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
                              {formData.category}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Requires Approval:</span>
                          <span className="ml-2 font-medium">{formData.requiresApproval ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Redemption Limit:</span>
                          <span className="ml-2 font-medium">{formData.maxRedemptions || 'Unlimited'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires:</span>
                          <span className="ml-2 font-medium">{formData.expiresAt || 'Never'}</span>
                        </div>
                      </div>
                      
                      {formData.budgetCost > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm text-yellow-800">
                              Estimated cost: ${formData.budgetCost.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {formData.availableToMembers.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-600 mb-2">Available to:</div>
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
                      )}
                      
                      {formData.availableToMembers.length === 0 && (
                        <div className="mt-4">
                          <div className="text-sm text-gray-600">Available to all family members</div>
                        </div>
                      )}
                    </div>
                    
                    {error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-red-800">{error}</div>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setStep('settings')}
                        className="flex-1"
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button 
                        type="submit"
                        className="flex-1"
                        size="lg"
                        disabled={loading}
                      >
                        {loading ? 'Creating...' : 'Create Reward'}
                        <Gift className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}