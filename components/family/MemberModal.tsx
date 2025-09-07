'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar, AvatarStyle, getDefaultAvatarStyle, useAvatarPreview, avatarConfigToDiceBearOptions } from '@/components/ui/DiceBearAvatar';
import { AvatarBuilder } from '@/components/ui/AvatarBuilder';
import { FamilyMember, AvatarConfig } from '@/types/family';
import { UserPlus, UserPen, Palette, Users, Crown, Star, Trophy, Shuffle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: FamilyMember | null; // If provided, we're editing; if null/undefined, we're adding
}

const memberColors = [
  '#3B82F6', // Blue
  '#60A5FA', // Light Blue
  '#06B6D4', // Cyan
  '#14B8A6', // Teal
  '#10B981', // Green
  '#84CC16', // Lime
  '#EAB308', // Yellow
  '#F59E0B', // Amber
  '#F97316', // Orange
  '#EF4444', // Red
  '#DC2626', // Red Dark
  '#EC4899', // Pink
  '#F472B6', // Light Pink
  '#8B5CF6', // Purple
  '#A78BFA', // Light Purple
  '#6366F1', // Indigo
  '#4F46E5', // Indigo Dark
  '#6B7280', // Gray
  '#374151', // Dark Gray
  '#1F2937', // Charcoal
];

const roleOptions = [
  { 
    value: 'child', 
    label: 'Child', 
    description: 'Can complete habits and earn rewards',
    icon: <Trophy className="w-4 h-4 text-green-600" />,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  { 
    value: 'teen', 
    label: 'Teenager', 
    description: 'Can create habits and earn rewards',
    icon: <Star className="w-4 h-4 text-purple-600" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  { 
    value: 'adult', 
    label: 'Adult', 
    description: 'Full access to family features',
    icon: <Users className="w-4 h-4 text-blue-600" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  { 
    value: 'parent', 
    label: 'Parent', 
    description: 'Can manage family settings and rewards',
    icon: <Crown className="w-4 h-4 text-yellow-600" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  }
];

const motivationOptions = [
  { value: 'rewards', label: 'Rewards', description: 'Motivated by earning points and prizes' },
  { value: 'progress', label: 'Progress', description: 'Motivated by tracking improvement' },
  { value: 'competition', label: 'Competition', description: 'Motivated by friendly competition' }
];

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { addDirectMember, updateFamilyMember, loading, currentFamily } = useFamily();
  
  const isEditing = !!member;
  // Always use adventurer style for member profiles for consistent visual identity
  const familyAvatarStyle = 'adventurer';
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    avatar: '👤',
    avatarStyle: familyAvatarStyle as AvatarStyle,
    avatarSeed: '',
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
    birthYear: new Date().getFullYear() - 8,
    motivationStyle: 'rewards' as 'rewards' | 'progress' | 'competition'
  });

  const [step, setStep] = useState<'profile' | 'preferences' | 'preview'>('profile');
  const [error, setError] = useState<string | null>(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(0);
  const [avatarGenerationKey, setAvatarGenerationKey] = useState(0);
  const [avatarMode, setAvatarMode] = useState<'quick' | 'custom'>('quick');
  const [customAvatarConfig, setCustomAvatarConfig] = useState<AvatarConfig | undefined>(undefined);

  // Generate avatar previews
  const avatarPreviews = useAvatarPreview(
    `${formData.displayName || member?.displayName || 'member'}-gen${avatarGenerationKey}`,
    familyAvatarStyle as AvatarStyle
  );

  // Initialize form data when member changes (for editing)
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        displayName: member.displayName || '',
        avatar: member.avatar || '👤',
        avatarStyle: familyAvatarStyle as AvatarStyle,
        avatarSeed: (member as any).avatarSeed || '',
        color: member.color || '#3B82F6',
        role: member.role || 'child',
        birthYear: (member as any).birthYear || new Date().getFullYear() - 8,
        motivationStyle: (member as any).motivationStyle || 'rewards'
      });
      setSelectedAvatarIndex(0);
      setAvatarGenerationKey(prev => prev + 1);
    } else {
      // Reset for new member
      setFormData({
        name: '',
        displayName: '',
        avatar: '👤',
        avatarStyle: familyAvatarStyle as AvatarStyle,
        avatarSeed: '',
        color: '#3B82F6',
        role: 'child',
        birthYear: new Date().getFullYear() - 8,
        motivationStyle: 'rewards'
      });
      setStep('profile');
      setSelectedAvatarIndex(0);
      setAvatarGenerationKey(0);
    }
  }, [member, familyAvatarStyle, isOpen]);

  // Update avatar seed when selection changes
  useEffect(() => {
    if (avatarMode === 'quick' && avatarPreviews[selectedAvatarIndex]) {
      setFormData(prev => ({ 
        ...prev, 
        avatarSeed: avatarPreviews[selectedAvatarIndex].seed 
      }));
    }
  }, [selectedAvatarIndex, avatarPreviews, avatarMode]);
  
  // Handle custom avatar changes
  const handleCustomAvatarChange = (config: AvatarConfig) => {
    setCustomAvatarConfig(config);
    setFormData(prev => ({
      ...prev,
      avatarStyle: 'avataaars' as AvatarStyle,
      avatarSeed: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim() || !formData.displayName.trim()) {
      setError('Name and display name are required');
      return;
    }
    
    try {
      // Prepare avatar data based on mode
      const avatarData = avatarMode === 'custom' && customAvatarConfig
        ? {
            avatarStyle: 'avataaars' as AvatarStyle,
            avatarConfig: customAvatarConfig,
            avatarOrigin: 'custom' as const,
            avatarSeed: ''
          }
        : {
            avatarStyle: formData.avatarStyle,
            avatarSeed: formData.avatarSeed,
            avatarOrigin: 'auto' as const
          };
      
      if (isEditing && member) {
        // Update existing member
        await updateFamilyMember(member.id, {
          name: formData.name.trim(),
          displayName: formData.displayName.trim(),
          ...avatarData,
          color: formData.color,
          role: formData.role,
          ...(formData.birthYear > 1950 && { birthYear: formData.birthYear }),
          motivationStyle: formData.motivationStyle
        });
      } else {
        // Add new member
        await addDirectMember({
          name: formData.name.trim(),
          displayName: formData.displayName.trim(),
          avatar: formData.avatar,
          ...avatarData,
          color: formData.color,
          role: formData.role,
          birthYear: formData.birthYear > 1950 ? formData.birthYear : undefined,
          motivationStyle: formData.motivationStyle
        });
      }
      
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} family member`);
    }
  };

  const handleClose = () => {
    setError(null);
    if (!isEditing) {
      setStep('profile');
    }
    onClose();
  };

  // Always use wizard format for consistent UX
  const showWizard = true;
  const currentStep = step;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Family Member' : 'Add Family Member'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Progress (only for adding) */}
        {showWizard && (
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-4">
              {['profile', 'preferences', 'preview'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step === stepName ? theme.components.button.primary + ' text-white' : 
                    ['profile', 'preferences', 'preview'].indexOf(step) > index ? theme.status.success.bg + ' ' + theme.status.success.text : theme.surface.secondary + ' ' + theme.text.muted
                  )}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className="w-8 h-1 bg-gray-200 mx-2">
                      <div className={cn(
                        "h-full transition-all duration-300",
                        theme.components.button.primary,
                        ['profile', 'preferences', 'preview'].indexOf(step) > index ? 'w-full' : 'w-0'
                      )} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step Headers */}
        {currentStep === 'profile' && (
          <div className="text-center mb-6">
            {isEditing ? (
              <UserPen className="w-12 h-12 mx-auto text-blue-600 mb-2" />
            ) : (
              <UserPlus className={cn("w-12 h-12 mx-auto mb-2", theme.status.info.text)} />
            )}
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Member Profile</h3>
            <p className={theme.text.secondary}>
              {isEditing 
                ? `Update ${member?.name || member?.displayName}'s profile information`
                : 'Basic information about the new family member'
              }
            </p>
          </div>
        )}

        {currentStep === 'preferences' && (
          <div className="text-center mb-6">
            <Star className={cn("w-12 h-12 mx-auto mb-2", theme.status.info.text)} />
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Role & Preferences</h3>
            <p className={theme.text.secondary}>
              {isEditing ? 'Update permissions and settings' : 'Set permissions and motivation style'}
            </p>
          </div>
        )}

        {currentStep === 'preview' && (
          <div className="text-center mb-6">
            <Users className={cn("w-12 h-12 mx-auto mb-2", theme.status.success.text)} />
            <h3 className={cn("text-lg font-semibold", theme.text.primary)}>
              {isEditing ? 'Review Changes' : 'Review Member'}
            </h3>
            <p className={theme.text.secondary}>
              {isEditing 
                ? 'Confirm the updates before saving changes'
                : 'Confirm the details before adding to your family'
              }
            </p>
          </div>
        )}

        {/* Profile Section */}
        {currentStep === 'profile' && (
          <div className="space-y-6">
            <div className={isEditing ? 'grid grid-cols-1 gap-6' : 'grid md:grid-cols-2 gap-6'}>
              <div>
                <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                  {isEditing ? 'Display Name *' : 'Full Name *'}
                </label>
                <Input
                  type="text"
                  placeholder={isEditing ? "e.g., Dad, Mom, etc." : "e.g., Emma Johnson"}
                  value={isEditing ? formData.displayName : formData.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    [isEditing ? 'displayName' : 'name']: e.target.value,
                    ...(isEditing ? {} : { displayName: e.target.value }) // Auto-fill display name for new members
                  }))}
                  required
                />
              </div>
              
              {!isEditing && (
                <div>
                  <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                    Display Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Emma"
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                Avatar
              </label>
              
              {/* Avatar Mode Tabs */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAvatarMode('quick')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                    avatarMode === 'quick'
                      ? theme.components.button.primary + ' text-white'
                      : theme.surface.secondary + ' ' + theme.text.primary + ' hover:' + theme.surface.hover
                  )}
                >
                  <Shuffle className="w-4 h-4" />
                  Quick Select
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarMode('custom')}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                    avatarMode === 'custom'
                      ? theme.components.button.primary + ' text-white'
                      : theme.surface.secondary + ' ' + theme.text.primary + ' hover:' + theme.surface.hover
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  Create Custom
                </button>
              </div>
              
              {/* Quick Select Mode */}
              {avatarMode === 'quick' && (
                <>
                  <div className="grid grid-cols-4 gap-2 relative z-10">
                    {avatarPreviews.map((preview, index) => (
                      <button
                        key={preview.seed}
                        type="button"
                        className={cn(
                          "p-2 rounded-lg border-2 hover:scale-105 transition-transform relative z-20",
                          selectedAvatarIndex === index
                            ? `border-blue-500 ${theme.status.info.bg}`
                            : `${theme.border.default} hover:border-gray-300`
                        )}
                        onClick={() => setSelectedAvatarIndex(index)}
                      >
                        <div
                          className="mx-auto relative z-30 flex items-center justify-center rounded-full overflow-hidden"
                          style={{ width: 40, height: 40, isolation: 'isolate' }}
                          dangerouslySetInnerHTML={{ __html: preview.svg }}
                        />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarGenerationKey(prev => prev + 1);
                      setSelectedAvatarIndex(0);
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    Generate new avatars
                  </button>
                </>
              )}
              
              {/* Custom Builder Mode */}
              {avatarMode === 'custom' && (
                <div className="mt-4">
                  <AvatarBuilder
                    initialConfig={customAvatarConfig}
                    onChange={handleCustomAvatarChange}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                Personal Color
              </label>
              <div className={`flex flex-wrap gap-2 p-3 border rounded-lg relative z-10 ${theme.surface.secondary} ${theme.border.default}`}>
                {memberColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "rounded-full border transition-all relative flex-shrink-0",
                      formData.color === color 
                        ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110 z-20' 
                        : 'border-gray-400 hover:scale-110 hover:border-gray-600 z-10'
                    )}
                    style={{ 
                      backgroundColor: color,
                      width: '40px',
                      height: '40px',
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    title={color}
                  >
                    {formData.color === color && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center z-30">
                        <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {!isEditing && (
              <div>
                <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                  Birth Year (Optional)
                </label>
                <Input
                  type="number"
                  min="1950"
                  max={new Date().getFullYear()}
                  value={formData.birthYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthYear: parseInt(e.target.value) || new Date().getFullYear() - 8 }))}
                />
              </div>
            )}
          </div>
        )}

        {/* Preferences Step */}
        {currentStep === 'preferences' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Star className={cn("w-12 h-12 mx-auto mb-2", theme.status.info.text)} />
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Role & Preferences</h3>
              <p className={theme.text.secondary}>Set permissions and motivation style</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Family Role *
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {roleOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className={cn(
                      "p-4 border-2 rounded-lg",
                      formData.role === option.value 
                        ? theme.status.info.border + ' ' + theme.status.info.bg + ' border-2' 
                        : theme.border.default + ' ' + theme.surface.hover + ' border-2'
                    )}>
                      <div className="flex items-center space-x-3 mb-2">
                        {option.icon}
                        <div className={cn("font-medium", theme.text.primary)}>{option.label}</div>
                      </div>
                      <div className={cn("text-sm", theme.text.secondary)}>{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Motivation Style
              </label>
              <div className="space-y-2">
                {motivationOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="motivationStyle"
                      value={option.value}
                      checked={formData.motivationStyle === option.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, motivationStyle: e.target.value as any }))}
                      className="sr-only"
                    />
                    <div className={cn(
                      "p-3 border-2 rounded-lg flex items-center justify-between",
                      formData.motivationStyle === option.value 
                        ? theme.status.info.border + ' ' + theme.status.info.bg + ' border-2' 
                        : theme.border.default + ' ' + theme.surface.hover + ' border-2'
                    )}>
                      <div>
                        <div className={cn("font-medium", theme.text.primary)}>{option.label}</div>
                        <div className={cn("text-sm", theme.text.secondary)}>{option.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {currentStep === 'preview' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className={cn("w-12 h-12 mx-auto mb-2", theme.status.success.text)} />
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Review Member</h3>
              <p className={theme.text.secondary}>Confirm the details before adding to your family</p>
            </div>

            <div className={cn("rounded-lg p-6", theme.surface.secondary)}>
              <div className="flex items-center space-x-4 mb-4">
                {avatarMode === 'custom' && customAvatarConfig ? (
                  <DiceBearAvatar
                    style="avataaars"
                    options={avatarConfigToDiceBearOptions(customAvatarConfig)}
                    size={64}
                    className="rounded-full"
                  />
                ) : (
                  <DiceBearAvatar
                    style={formData.avatarStyle}
                    seed={formData.avatarSeed}
                    size={64}
                    className="rounded-full"
                  />
                )}
                <div>
                  <h3 className={cn("font-bold", theme.text.primary)}>{formData.displayName}</h3>
                  <p className={theme.text.secondary}>{formData.name}</p>
                  <div className={cn(
                    "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border mt-1",
                    roleOptions.find(r => r.value === formData.role)?.color
                  )}>
                    {roleOptions.find(r => r.value === formData.role)?.icon}
                    <span className="capitalize">{formData.role}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={theme.text.muted}>Birth Year:</span>
                  <span className="ml-2 font-medium">{formData.birthYear > 1950 ? formData.birthYear : 'Not set'}</span>
                </div>
                <div>
                  <span className={theme.text.muted}>Motivation:</span>
                  <span className="ml-2 font-medium capitalize">{formData.motivationStyle}</span>
                </div>
              </div>
            </div>

            <div className={cn("border rounded-lg p-4", theme.status.info.bg, theme.status.info.border)}>
              <div className="flex items-start space-x-2">
                <div className={cn("mt-0.5", theme.status.info.text)}>ℹ️</div>
                <div className={cn("text-sm", theme.status.info.text)}>
                  <div className="font-medium mb-1">Direct Member</div>
                  <div>This family member won't have their own login account. You can manage their habits and track their progress on their behalf.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-3 ${theme.status.error.bg} border ${theme.status.error.border} rounded-lg ${theme.status.error.text} text-sm`}>
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={step === 'profile' ? handleClose : () => {
              if (step === 'preferences') setStep('profile');
              if (step === 'preview') setStep('preferences');
            }}
            disabled={loading}
          >
            {step === 'profile' ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            type={step === 'preview' ? 'submit' : 'button'}
            onClick={step === 'preview' ? undefined : () => {
              if (step === 'profile') setStep('preferences');
              if (step === 'preferences') setStep('preview');
            }}
            disabled={loading || (!formData.name.trim() || !formData.displayName.trim())}
          >
            {loading 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : step === 'preview' 
                ? (isEditing ? 'Save Changes' : 'Add Family Member')
                : 'Next'
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
}