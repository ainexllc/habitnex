'use client';

import React, { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar, AvatarStyle, getDefaultAvatarStyle, useAvatarPreview } from '@/components/ui/DiceBearAvatar';
import { UserPlus, Palette, Users, Crown, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Generate professional avatar based on name
  const avatarPreviews = useAvatarPreview(
    `${formData.displayName || 'member'}`, 
    familyAvatarStyle as AvatarStyle
  );

  // Keep avatar style consistent with family setting
  React.useEffect(() => {
    setFormData(prev => ({ ...prev, avatarStyle: familyAvatarStyle as AvatarStyle }));
  }, [familyAvatarStyle]);

  // Automatically use first generated professional avatar
  React.useEffect(() => {
    if (avatarPreviews[0]) {
      setFormData(prev => ({ 
        ...prev, 
        avatarSeed: avatarPreviews[0].seed 
      }));
    }
  }, [avatarPreviews]);

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
                  step === stepName ? 'bg-blue-600 text-white' : 
                  ['profile', 'preferences', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                )}>
                  {index + 1}
                </div>
                {index < 2 && (
                  <div className="w-8 h-1 bg-gray-200 mx-2">
                    <div className={cn(
                      "h-full bg-blue-600 transition-all duration-300",
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
              <UserPlus className="w-12 h-12 mx-auto text-blue-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Member Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">Basic information about the new family member</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Color
              </label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600">
                {memberColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "rounded-full border transition-all relative flex-shrink-0",
                      formData.color === color 
                        ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110 z-10' 
                        : 'border-gray-400 hover:scale-110 hover:border-gray-600'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <Star className="w-12 h-12 mx-auto text-purple-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Role & Preferences</h3>
              <p className="text-gray-600">Set permissions and motivation style</p>
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
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <div className="flex items-center space-x-3 mb-2">
                        {option.icon}
                        <div className="font-medium text-gray-900">{option.label}</div>
                      </div>
                      <div className="text-sm text-gray-600">{option.description}</div>
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
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    )}>
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
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
              <Users className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900">Review Member</h3>
              <p className="text-gray-600">Confirm the details before adding to your family</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{formData.displayName}</h3>
                  <p className="text-gray-600">{formData.name}</p>
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
                  <span className="text-gray-600">Birth Year:</span>
                  <span className="ml-2 font-medium">{formData.birthYear > 1950 ? formData.birthYear : 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Motivation:</span>
                  <span className="ml-2 font-medium capitalize">{formData.motivationStyle}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <div className="text-blue-600 mt-0.5">ℹ️</div>
                <div className="text-blue-800 text-sm">
                  <div className="font-medium mb-1">Direct Member</div>
                  <div>This family member won't have their own login account. You can manage their habits and track their progress on their behalf.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-200">
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