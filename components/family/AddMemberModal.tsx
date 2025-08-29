'use client';

import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar, AvatarStyle, getDefaultAvatarStyle, useAvatarPreview } from '@/components/ui/DiceBearAvatar';
import { UserPlus, Palette, Users, Crown, Star, Trophy, Shuffle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const avatarStyles = [
  { 
    value: 'bottts' as AvatarStyle, 
    label: 'Robots', 
    description: 'Fun robot avatars (great for kids)',
    icon: '🤖'
  },
  { 
    value: 'fun-emoji' as AvatarStyle, 
    label: 'Fun Faces', 
    description: 'Colorful emoji-style faces',
    icon: '😊'
  },
  { 
    value: 'avataaars' as AvatarStyle, 
    label: 'Illustrated', 
    description: 'Popular cartoon-style avatars',
    icon: '👤'
  },
  { 
    value: 'personas' as AvatarStyle, 
    label: 'Professional', 
    description: 'Clean, professional avatars',
    icon: '💼'
  }
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

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const { addDirectMember, loading, currentFamily } = useFamily();
  
  // Use family's avatar style or default to 'personas'
  const familyAvatarStyle = currentFamily?.settings?.avatarStyle || 'personas';
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    avatar: '👤', // Fallback emoji (backwards compatibility)
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

  // Generate avatar previews based on name + style + generation key for randomization
  const avatarPreviews = useAvatarPreview(
    `${formData.displayName || 'member'}-gen${avatarGenerationKey}`, 
    familyAvatarStyle as AvatarStyle
  );

  // Keep avatar style consistent with family setting
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, avatarStyle: familyAvatarStyle as AvatarStyle }));
  }, [familyAvatarStyle]);

  // Update avatar seed when selection changes
  React.useEffect(() => {
    if (avatarPreviews[selectedAvatarIndex]) {
      setFormData(prev => ({ 
        ...prev, 
        avatarSeed: avatarPreviews[selectedAvatarIndex].seed 
      }));
    }
  }, [selectedAvatarIndex, avatarPreviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name.trim() || !formData.displayName.trim()) {
      setError('Name and display name are required');
      return;
    }
    
    try {
      console.log('Attempting to add family member:', {
        name: formData.name,
        displayName: formData.displayName,
        avatarStyle: formData.avatarStyle,
        avatarSeed: formData.avatarSeed,
        role: formData.role
      });
      
      await addDirectMember({
        name: formData.name,
        displayName: formData.displayName,
        avatar: formData.avatar,
        avatarStyle: formData.avatarStyle,
        avatarSeed: formData.avatarSeed,
        color: formData.color,
        role: formData.role,
        birthYear: formData.birthYear > 1950 ? formData.birthYear : undefined,
        motivationStyle: formData.motivationStyle
      });
      
      console.log('Family member added successfully!');
      
      // Reset form and close modal
      setFormData({
        name: '',
        displayName: '',
        avatar: '👤',
        avatarStyle: 'personas' as AvatarStyle,
        avatarSeed: '',
        color: '#3B82F6',
        role: 'child',
        birthYear: new Date().getFullYear() - 8,
        motivationStyle: 'rewards'
      });
      setStep('profile');
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add family member');
    }
  };

  const handleClose = () => {
    setError(null);
    setStep('profile');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Family Member"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step Progress */}
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

        {/* Profile Step */}
        {step === 'profile' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserPlus className={cn("w-12 h-12 mx-auto mb-2", theme.status.info.text)} />
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Member Profile</h3>
              <p className={theme.text.secondary}>Basic information about the new family member</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Emma Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
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
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                Avatar Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {avatarPreviews.map((preview, index) => (
                  <button
                    key={preview.seed}
                    type="button"
                    className={cn(
                      "p-2 rounded-lg border-2 hover:scale-105 transition-transform",
                      selectedAvatarIndex === index
                        ? theme.status.info.border + ' ' + theme.status.info.bg + ' border-2'
                        : theme.border.default + ' ' + theme.surface.hover + ' border-2'
                    )}
                    onClick={() => setSelectedAvatarIndex(index)}
                  >
                    <DiceBearAvatar
                      seed={preview.seed}
                      style={familyAvatarStyle as AvatarStyle}
                      size={40}
                      className="mx-auto"
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => {
                  // Increment generation key to force new avatar generation
                  setAvatarGenerationKey(prev => prev + 1);
                  setSelectedAvatarIndex(0); // Reset selection to first avatar
                }}
                className={cn("mt-2 text-sm flex items-center gap-1", theme.text.link)}
              >
                <Shuffle className="w-3 h-3" />
                Generate new avatars
              </button>
            </div>

            <div>
              <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
                Personal Color
              </label>
              <div className={cn("flex flex-wrap gap-2 p-3 border rounded-lg", theme.surface.secondary, theme.border.default)}>
                {memberColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "rounded-full border transition-all relative flex-shrink-0",
                      formData.color === color 
                        ? 'shadow-sm ring-2 scale-110 z-10 ' + theme.status.info.border + ' ring-blue-400' 
                        : 'hover:scale-110 ' + theme.border.strong + ' hover:border-gray-600'
                    )}
                    style={{ 
                      backgroundColor: color,
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      minHeight: '40px',
                      maxWidth: '40px',
                      maxHeight: '40px'
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    title={color}
                  >
                    {formData.color === color && (
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

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
          </div>
        )}

        {/* Preferences Step */}
        {step === 'preferences' && (
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
        {step === 'preview' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Users className={cn("w-12 h-12 mx-auto mb-2", theme.status.success.text)} />
              <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Review Member</h3>
              <p className={theme.text.secondary}>Confirm the details before adding to your family</p>
            </div>

            <div className={cn("rounded-lg p-6", theme.surface.secondary)}>
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.avatar}
                </div>
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
          <div className={cn("p-4 border rounded-lg", theme.status.error.bg, theme.status.error.border)}>
            <div className={theme.status.error.text}>{error}</div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className={cn("flex justify-between pt-6 border-t", theme.border.default)}>
          <Button
            type="button"
            variant="outline"
            onClick={step === 'profile' ? handleClose : () => {
              if (step === 'preferences') setStep('profile');
              if (step === 'preview') setStep('preferences');
            }}
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
            {loading ? 'Adding...' : step === 'preview' ? 'Add Family Member' : 'Next'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}