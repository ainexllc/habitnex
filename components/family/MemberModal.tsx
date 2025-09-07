'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { AdventurerAvatarBuilder } from '@/components/ui/AvataaarsAvatarBuilder';
import { FamilyMember } from '@/types/family';
import { UserPlus, UserPen } from 'lucide-react';
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

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { addDirectMember, updateFamilyMember, loading } = useFamily();
  
  const isEditing = !!member;
  const [showAvatarDesigner, setShowAvatarDesigner] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    avatarData: {
      seed: '',
      eyes: '',
      eyebrows: '',
      mouth: '',
      hair: '',
      skinColor: '',
      hairColor: '',
      backgroundColor: 'transparent',
      flip: false,
      rotate: 0,
      scale: 100,
      avatarUrl: ''
    },
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data when member changes (for editing)
  useEffect(() => {
    if (member) {
      const memberData = member as any;
      
      // Handle custom avatar data (from avatarConfig) or fallback to individual fields
      let avatarData;
      if (memberData.avatarConfig && memberData.avatarOrigin === 'custom') {
        // Use existing custom avatar configuration
        avatarData = {
          seed: memberData.avatarConfig.seed || memberData.avatarSeed || member.displayName || 'member',
          eyes: memberData.avatarConfig.eyes || '',
          eyebrows: memberData.avatarConfig.eyebrows || '',
          mouth: memberData.avatarConfig.mouth || '',
          hair: memberData.avatarConfig.hair || '',
          skinColor: memberData.avatarConfig.skinColor || '',
          hairColor: memberData.avatarConfig.hairColor || '',
          backgroundColor: memberData.avatarConfig.backgroundColor || 'transparent',
          flip: memberData.avatarConfig.flip ?? false,
          rotate: memberData.avatarConfig.rotate ?? 0,
          scale: memberData.avatarConfig.scale ?? 100,
          avatarUrl: memberData.avatarConfig.avatarUrl || ''
        };
      } else {
        // Fallback to individual avatar fields or default
        avatarData = {
          seed: memberData.avatarSeed || member.displayName || 'member',
          eyes: memberData.eyes || '',
          eyebrows: memberData.eyebrows || '',
          mouth: memberData.mouth || '',
          hair: memberData.hair || '',
          skinColor: memberData.skinColor || '',
          hairColor: memberData.hairColor || '',
          backgroundColor: memberData.backgroundColor || 'transparent',
          flip: memberData.flip ?? false,
          rotate: memberData.rotate ?? 0,
          scale: memberData.scale ?? 100,
          avatarUrl: ''
        };
      }
      
      setFormData({
        name: member.name || '',
        displayName: member.displayName || '',
        avatarData,
        color: member.color || '#3B82F6',
        role: member.role || 'child',
      });
    } else {
      // Reset for new member
      setFormData({
        name: '',
        displayName: '',
        avatarData: {
          seed: '',
          eyes: '',
          eyebrows: '',
          mouth: '',
          hair: '',
          skinColor: '',
          hairColor: '',
          backgroundColor: 'transparent',
          flip: false,
          rotate: 0,
          scale: 100,
          avatarUrl: ''
        },
        color: '#3B82F6',
        role: 'child',
      });
    }
    setShowAvatarDesigner(false);
  }, [member, isOpen]);
  
  // Handle avatar save from designer
  const handleAvatarSave = (avatarData: any) => {
    setFormData(prev => ({
      ...prev,
      avatarData
    }));
    setShowAvatarDesigner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    
    try {
      const memberData = {
        name: formData.name.trim() || formData.displayName.trim(),
        displayName: formData.displayName.trim(),
        avatar: '', // Not used for adventurer style
        avatarStyle: 'adventurer' as const,
        avatarSeed: formData.avatarData.seed || formData.displayName.trim(),
        avatarConfig: formData.avatarData,
        avatarOrigin: 'custom' as const,
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
    <>
      <Modal
        isOpen={isOpen && !showAvatarDesigner}
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                displayName: e.target.value,
                // Auto-generate avatar seed from name if not already set
                avatarData: {
                  ...prev.avatarData,
                  seed: prev.avatarData.seed || e.target.value
                }
              }))}
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
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                {formData.avatarData.seed ? (
                  <DiceBearAvatar
                    style="adventurer"
                    options={formData.avatarData}
                    size={80}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Avatar</span>
                  </div>
                )}
              </div>
              
              {/* Design Button */}
              <button
                type="button"
                onClick={() => setShowAvatarDesigner(true)}
                className={cn(
                  "px-4 py-2 rounded-lg",
                  theme.components.button.primary,
                  "text-white font-medium"
                )}
              >
                {formData.avatarData.seed ? 'Edit Avatar' : 'Create Avatar'}
              </button>
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
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
                    "p-3 border-2 rounded-lg text-center",
                    formData.role === option.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
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
    
    {/* Avatar Designer Modal */}
    <Modal
      isOpen={showAvatarDesigner}
      onClose={() => setShowAvatarDesigner(false)}
      title="Design Your Avatar"
      size="xl"
    >
      <div className="h-[600px]">
        <AdventurerAvatarBuilder
          initialData={formData.avatarData}
          onSave={handleAvatarSave}
          onCancel={() => setShowAvatarDesigner(false)}
        />
      </div>
    </Modal>
    </>
  );
}
