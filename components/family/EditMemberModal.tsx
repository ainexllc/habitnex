'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar, AvatarStyle, getDefaultAvatarStyle, useAvatarPreview } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { UserPen, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
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
  { value: 'child', label: 'Child', description: 'Can complete habits and earn rewards' },
  { value: 'teen', label: 'Teenager', description: 'Can create habits and earn rewards' },
  { value: 'adult', label: 'Adult', description: 'Full access to family features' },
  { value: 'parent', label: 'Parent', description: 'Can manage family settings and rewards' }
];

export function EditMemberModal({ isOpen, onClose, member }: EditMemberModalProps) {
  const { updateFamilyMember, loading, currentFamily } = useFamily();
  
  // Use family's avatar style or default to 'personas'
  const familyAvatarStyle = currentFamily?.settings?.avatarStyle || 'personas';
  
  const [formData, setFormData] = useState({
    displayName: '',
    avatarStyle: familyAvatarStyle as AvatarStyle,
    avatarSeed: '',
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
  });
  
  const [error, setError] = useState<string | null>(null);
  
  // Generate professional avatar based on display name with family's style
  const avatarPreviews = useAvatarPreview(
    `${formData.displayName || member?.displayName || 'member'}`,
    familyAvatarStyle as AvatarStyle
  );
  
  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        displayName: member.displayName || '',
        avatarStyle: familyAvatarStyle as AvatarStyle,  // Always use family style
        avatarSeed: (member as any).avatarSeed || '',
        color: member.color || '#3B82F6',
        role: member.role || 'child',
      });
    }
  }, [member, familyAvatarStyle]);
  
  // Automatically use first generated professional avatar
  useEffect(() => {
    if (avatarPreviews[0] && formData.displayName) {
      setFormData(prev => ({ 
        ...prev, 
        avatarSeed: avatarPreviews[0].seed 
      }));
    }
  }, [avatarPreviews, formData.displayName]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!member) return;
    
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    
    try {
      await updateFamilyMember(member.id, {
        displayName: formData.displayName.trim(),
        avatarStyle: formData.avatarStyle,
        avatarSeed: formData.avatarSeed,
        color: formData.color,
        role: formData.role,
      });
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member');
    }
  };
  
  const handleClose = () => {
    setError(null);
    onClose();
  };
  
  if (!member) return null;
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Family Member"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <UserPen className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Member Details</h3>
          <p className="text-gray-600 dark:text-gray-400">Update {member.name}'s profile</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <Input
            type="text"
            placeholder="e.g., Dad, Mom, etc."
            value={formData.displayName}
            onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            required
          />
        </div>

        {/* Avatar Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Avatar
            </label>
            <button
              type="button"
              onClick={() => {
                // Force re-generation by changing a temporary state
                setFormData(prev => ({ ...prev, displayName: prev.displayName + ' ' }));
                setTimeout(() => {
                  setFormData(prev => ({ ...prev, displayName: prev.displayName.trim() }));
                }, 100);
              }}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
            >
              Generate New Avatars
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Choose from generated avatars based on your name</p>
          <div className="flex justify-center">
            <div className="grid grid-cols-6 gap-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 max-w-fit">
              {avatarPreviews.map((preview) => (
                <button
                  key={preview.id}
                  type="button"
                  className={cn(
                    "rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center",
                    formData.avatarSeed === preview.seed
                      ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-300 dark:ring-blue-400'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                  onClick={() => setFormData(prev => ({ ...prev, avatarSeed: preview.seed }))}
                  title={`Avatar ${preview.id + 1}`}
                >
                  <div
                    className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: preview.svg }}
                  />
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Avatars are automatically generated based on your display name
          </p>
        </div>


        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Personal Color
          </label>
          <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
            {memberColors.map((color) => (
              <button
                key={color}
                type="button"
                className={cn(
                  "rounded-full border transition-all relative flex-shrink-0",
                  formData.color === color
                    ? 'border-gray-900 dark:border-gray-100 shadow-sm ring-2 ring-blue-400 dark:ring-blue-500 scale-110 z-10'
                    : 'border-gray-400 dark:border-gray-600 hover:scale-110 hover:border-gray-600 dark:hover:border-gray-400'
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
                  <div className="absolute inset-0 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  "p-3 border-2 rounded-lg",
                  formData.role === option.value
                    ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}>
                  <div className="font-medium text-gray-900 dark:text-white">{option.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3 pt-4">
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
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}