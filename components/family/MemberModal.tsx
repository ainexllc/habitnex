'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { UserPlus, UserPen, RefreshCw, Sparkles } from 'lucide-react';
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
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'teen', label: 'Teen' },
  { value: 'adult', label: 'Adult' },
];

// Skin color options for adventurer avatars - using hex values that adventurer collection supports
const skinColors = [
  { value: 'f2d3b1', label: 'Light', color: '#f2d3b1' },
  { value: 'ecad80', label: 'Medium', color: '#ecad80' },
  { value: '9e5622', label: 'Dark', color: '#9e5622' },
  { value: '763900', label: 'Deep', color: '#763900' },
];

// Mouth expressions for adventurer avatars  
const mouthOptions = [
  { value: 'variant01', label: '😊 Happy', icon: '😊' },
  { value: 'variant02', label: '😄 Big Smile', icon: '😄' },
  { value: 'variant03', label: '😮 Surprised', icon: '😮' },
  { value: 'variant04', label: '😐 Neutral', icon: '😐' },
  { value: 'variant05', label: '🙂 Slight Smile', icon: '🙂' },
  { value: 'variant06', label: '😔 Sad', icon: '😔' },
  { value: 'variant07', label: '😎 Cool', icon: '😎' },
  { value: 'variant08', label: '😋 Playful', icon: '😋' },
  { value: 'variant09', label: '🤔 Thinking', icon: '🤔' },
  { value: 'variant10', label: '😴 Sleepy', icon: '😴' },
];

// Hair color options for adventurer avatars (using hex values)
const hairColors = [
  { value: '2C1B18', label: 'Black', color: '#2C1B18' },
  { value: '724133', label: 'Brown', color: '#724133' },
  { value: 'A55728', label: 'Light Brown', color: '#A55728' },
  { value: 'B58143', label: 'Blonde', color: '#B58143' },
  { value: 'C93305', label: 'Red', color: '#C93305' },
  { value: 'B7B7B7', label: 'Gray', color: '#B7B7B7' },
  { value: 'E8E1E1', label: 'White', color: '#E8E1E1' },
  { value: 'FF69B4', label: 'Pink', color: '#FF69B4' },
];

// Probability-based options for adventurer features
const featureProbabilities = [
  { key: 'hairProbability', label: 'Hair', description: 'Chance of having hair' },
  { key: 'glassesProbability', label: 'Glasses', description: 'Chance of wearing glasses' },
  { key: 'featuresProbability', label: 'Features', description: 'Chance of facial features (freckles, etc.)' },
  { key: 'earringsProbability', label: 'Earrings', description: 'Chance of wearing earrings' },
];

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { addDirectMember, updateFamilyMember, loading } = useFamily();
  
  const isEditing = !!member;
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    avatarSeed: '',
    avatarSkinColor: '',
    avatarMouth: '',
    avatarHairColor: '',
    hairProbability: 100,
    glassesProbability: 50,
    featuresProbability: 10,
    earringsProbability: 30,
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
  });

  const [error, setError] = useState<string | null>(null);
  
  // Generate a unique avatar seed
  const generateAvatarSeed = (baseName: string = '') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${baseName || 'member'}-${timestamp}-${random}`;
  };

  // Generate a seed that's more likely to show hair and customizations
  const generateCustomizationFriendlySeed = (baseName: string = '') => {
    // Use specific seeds that are known to work well with customizations
    const goodSeeds = ['alex', 'sam', 'jordan', 'taylor', 'casey', 'riley', 'morgan', 'avery'];
    const randomSeed = goodSeeds[Math.floor(Math.random() * goodSeeds.length)];
    const timestamp = Date.now().toString().slice(-6);
    return `${randomSeed}-${baseName}-${timestamp}`;
  };

  // Initialize form data when member changes (for editing)
  useEffect(() => {
    if (member) {
      console.log('🎭 Loading member for edit:', {
        id: member.id,
        name: member.displayName,
        avatarSeed: member.avatarSeed,
        avatarConfig: member.avatarConfig
      });
      
      setFormData({
        name: member.name || '',
        displayName: member.displayName || '',
        avatarSeed: member.avatarSeed || member.id || generateAvatarSeed(member.displayName),
        avatarSkinColor: member.avatarConfig?.skinColor || '',
        avatarMouth: member.avatarConfig?.mouthType || '',
        avatarHairColor: member.avatarConfig?.hairColor || '',
        hairProbability: member.avatarConfig?.hairProbability !== undefined ? member.avatarConfig.hairProbability : 100,
        glassesProbability: member.avatarConfig?.glassesProbability !== undefined ? member.avatarConfig.glassesProbability : 50,
        featuresProbability: member.avatarConfig?.featuresProbability !== undefined ? member.avatarConfig.featuresProbability : 10,
        earringsProbability: member.avatarConfig?.earringsProbability !== undefined ? member.avatarConfig.earringsProbability : 30,
        color: member.color || '#3B82F6',
        role: member.role || 'child',
      });
    } else {
      // Reset for new member - use customization-friendly seed
      const newSeed = generateCustomizationFriendlySeed('member');
      setFormData({
        name: '',
        displayName: '',
        avatarSeed: newSeed,
        avatarSkinColor: '',
        avatarMouth: '',
        avatarHairColor: '',
        hairProbability: 100,
        glassesProbability: 50,
        featuresProbability: 10,
        earringsProbability: 30,
        color: '#3B82F6',
        role: 'child',
      });
    }
  }, [member, isOpen]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    
    try {
      // Generate avatar seed if not set
      const avatarSeed = formData.avatarSeed || generateAvatarSeed(formData.displayName.trim());
      
      const memberData = {
        name: formData.name.trim() || formData.displayName.trim(),
        displayName: formData.displayName.trim(),
        avatarSeed: avatarSeed,
        avatarSkinColor: formData.avatarSkinColor,
        avatarMouth: formData.avatarMouth,
        avatarHairColor: formData.avatarHairColor,
        hairProbability: formData.hairProbability,
        glassesProbability: formData.glassesProbability,
        featuresProbability: formData.featuresProbability,
        earringsProbability: formData.earringsProbability,
        color: formData.color,
        role: formData.role,
      };
      
      if (isEditing && member) {
        // Update existing member
        await updateFamilyMember(member.id, memberData);
      } else {
        // Add new member
        await addDirectMember(memberData);
      }
      
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'add'} family member`);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Family Member' : 'Add Family Member'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          {isEditing ? (
            <UserPen className="w-12 h-12 mx-auto text-blue-600 mb-2" />
          ) : (
            <UserPlus className={cn("w-12 h-12 mx-auto mb-2", theme.status.info.text)} />
          )}
          <h3 className={cn("text-lg font-semibold", theme.text.primary)}>Member Profile</h3>
          <p className={theme.text.secondary}>
            {isEditing 
              ? `Update ${member?.displayName}'s profile information`
              : 'Add a new family member'
            }
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Display Name */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Display Name *
            </label>
            <Input
              type="text"
              placeholder="e.g., Dad, Mom, Emma, etc."
              value={formData.displayName}
              onChange={(e) => {
                const newDisplayName = e.target.value;
                setFormData(prev => ({ 
                  ...prev, 
                  displayName: newDisplayName,
                  // Auto-generate avatar seed if it's empty and we're creating a new member
                  avatarSeed: (!isEditing && !prev.avatarSeed && newDisplayName) 
                    ? generateAvatarSeed(newDisplayName) 
                    : prev.avatarSeed
                }));
              }}
              required
            />
          </div>

          {/* Avatar */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Avatar
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-300 dark:border-gray-600 shadow-lg">
                <DiceBearAvatar
                  seed={formData.avatarSeed || formData.displayName || 'preview'}
                  style="adventurer"
                  size={96}
                  backgroundColor="#ffffff"
                  options={{
                    ...(formData.avatarSkinColor && { skinColor: [formData.avatarSkinColor] }),
                    ...(formData.avatarMouth && { mouth: [formData.avatarMouth] }),
                    ...(formData.avatarHairColor && { 
                      hairColor: [formData.avatarHairColor.replace('#', '')] 
                    }),
                    hairProbability: formData.hairProbability !== undefined ? formData.hairProbability / 100 : 1,
                    glassesProbability: formData.glassesProbability !== undefined ? formData.glassesProbability / 100 : 0.5,
                    featuresProbability: formData.featuresProbability !== undefined ? formData.featuresProbability / 100 : 0.1,
                    earringsProbability: formData.earringsProbability !== undefined ? formData.earringsProbability / 100 : 0.3,
                  }}
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newSeed = generateCustomizationFriendlySeed(formData.displayName);
                    setFormData(prev => ({ ...prev, avatarSeed: newSeed }));
                  }}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg",
                    "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
                    "text-white font-medium shadow-md hover:shadow-lg transition-all"
                  )}
                >
                  <Sparkles className="w-4 h-4" />
                  New Avatar
                </button>
                
                {formData.avatarSeed && (
                  <button
                    type="button"
                    onClick={() => {
                      const newSeed = generateCustomizationFriendlySeed(formData.displayName);
                      setFormData(prev => ({ ...prev, avatarSeed: newSeed }));
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg",
                      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600",
                      "text-gray-700 dark:text-gray-300 font-medium transition-all"
                    )}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Each avatar is unique and generated based on a seed. Click "New Avatar" to see different options.
            </p>
          </div>

          {/* Skin Color Selection */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Skin Color
            </label>
            <div className={`flex flex-wrap gap-2 p-3 border rounded-lg ${theme.surface.secondary} ${theme.border.default}`}>
              {skinColors.map((skinColor) => (
                <button
                  key={skinColor.value}
                  type="button"
                  className={cn(
                    "rounded-full border transition-all flex items-center justify-center",
                    formData.avatarSkinColor === skinColor.value
                      ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110'
                      : 'border-gray-400 hover:scale-110 hover:border-gray-600'
                  )}
                  style={{
                    backgroundColor: skinColor.color,
                    width: '32px',
                    height: '32px',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, avatarSkinColor: skinColor.value }))}
                  title={skinColor.label}
                >
                  {formData.avatarSkinColor === skinColor.value && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              ))}
              {/* Clear button */}
              <button
                type="button"
                className={cn(
                  "rounded-full border transition-all flex items-center justify-center",
                  !formData.avatarSkinColor
                    ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110'
                    : 'border-gray-400 hover:scale-110 hover:border-gray-600 bg-gray-100'
                )}
                style={{
                  width: '32px',
                  height: '32px',
                }}
                onClick={() => setFormData(prev => ({ ...prev, avatarSkinColor: '' }))}
                title="Default"
              >
                {!formData.avatarSkinColor && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                  </div>
                )}
                <span className="text-xs">✕</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose a skin color for the avatar. Leave blank for default.
            </p>
          </div>

          {/* Mouth Expression */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Expression
            </label>
            <div className={`grid grid-cols-5 gap-2 p-3 border rounded-lg ${theme.surface.secondary} ${theme.border.default}`}>
              {mouthOptions.map((mouth) => (
                <button
                  key={mouth.value}
                  type="button"
                  className={cn(
                    "rounded-lg border transition-all flex flex-col items-center justify-center p-2",
                    formData.avatarMouth === mouth.value
                      ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, avatarMouth: mouth.value }))}
                  title={mouth.label}
                >
                  <span className="text-lg mb-1">{mouth.icon}</span>
                  <span className="text-xs text-center">{mouth.label.split(' ')[1]}</span>
                </button>
              ))}
              {/* Clear button */}
              <button
                type="button"
                className={cn(
                  "rounded-lg border transition-all flex flex-col items-center justify-center p-2",
                  !formData.avatarMouth
                    ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
                onClick={() => setFormData(prev => ({ ...prev, avatarMouth: '' }))}
                title="Default"
              >
                <span className="text-lg mb-1">😶</span>
                <span className="text-xs text-center">Default</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose an expression for the avatar. Leave blank for default.
            </p>
          </div>

          {/* Hair Color */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Hair Color
            </label>
            <div className={`flex flex-wrap gap-2 p-3 border rounded-lg ${theme.surface.secondary} ${theme.border.default}`}>
              {hairColors.map((hairColor) => (
                <button
                  key={hairColor.value}
                  type="button"
                  className={cn(
                    "rounded-full border transition-all relative",
                    formData.avatarHairColor === hairColor.value 
                      ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110' 
                      : 'border-gray-400 hover:scale-110 hover:border-gray-600'
                  )}
                  style={{
                    backgroundColor: hairColor.color,
                    width: '32px',
                    height: '32px',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, avatarHairColor: hairColor.value }))}
                  title={hairColor.label}
                >
                  {formData.avatarHairColor === hairColor.value && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              ))}
              {/* Clear button */}
              <button
                type="button"
                className={cn(
                  "rounded-full border transition-all flex items-center justify-center",
                  !formData.avatarHairColor
                    ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110'
                    : 'border-gray-400 hover:scale-110 hover:border-gray-600 bg-gray-100'
                )}
                style={{
                  width: '32px',
                  height: '32px',
                }}
                onClick={() => setFormData(prev => ({ ...prev, avatarHairColor: '' }))}
                title="Random"
              >
                {!formData.avatarHairColor && (
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                  </div>
                )}
                <span className="text-xs">?</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose a hair color. Leave blank for random.
            </p>
          </div>

          {/* Feature Probabilities */}
          <div>
            <label className={cn("block text-sm font-medium mb-3", theme.text.primary)}>
              Avatar Features
            </label>
            <div className="space-y-4">
              {featureProbabilities.map((feature) => (
                <div key={feature.key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-sm font-medium", theme.text.primary)}>{feature.label}</span>
                    <span className={cn("text-sm", theme.text.muted)}>
                      {formData[feature.key as keyof typeof formData] as number}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    value={formData[feature.key as keyof typeof formData] as number}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [feature.key]: Number(e.target.value) 
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Color */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Personal Color
            </label>
            <div className={`flex flex-wrap gap-2 p-3 border rounded-lg ${theme.surface.secondary} ${theme.border.default}`}>
              {memberColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={cn(
                    "rounded-full border transition-all",
                    formData.color === color 
                      ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110' 
                      : 'border-gray-400 hover:scale-110 hover:border-gray-600'
                  )}
                  style={{ 
                    backgroundColor: color,
                    width: '32px',
                    height: '32px',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  title={color}
                >
                  {formData.color === color && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection (simplified) */}
          <div>
            <label className={cn("block text-sm font-medium mb-3", theme.text.primary)}>
              Family Role
            </label>
            <div className="grid grid-cols-2 gap-3">
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
                    "p-3 border-2 rounded-lg text-center transition-all",
                    formData.role === option.value 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}>
                    <div className={cn("font-medium", theme.text.primary)}>{option.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`p-3 ${theme.status.error.bg} border ${theme.status.error.border} rounded-lg ${theme.status.error.text} text-sm`}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            disabled={loading || !formData.displayName.trim()}
          >
            {loading 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Save Changes' : 'Add Member')
            }
          </Button>
        </div>
      </form>
    </Modal>
  );
}
