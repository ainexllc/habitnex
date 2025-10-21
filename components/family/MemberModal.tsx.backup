'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProfileImageUploader } from '@/components/ui/ProfileImageUploader';
import { FamilyMember } from '@/types/family';
import { UserPlus, UserPen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';
import { MEMBER_COLORS } from '@/lib/avatar/colors';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: FamilyMember | null; // If provided, we're editing; if null/undefined, we're adding
}

const roleOptions = [
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'teen', label: 'Teen' },
  { value: 'adult', label: 'Adult' },
];

export function MemberModal({ isOpen, onClose, member }: MemberModalProps) {
  const { addDirectMember, updateFamilyMember, loading } = useFamily();
  const { user } = useAuth();

  const isEditing = !!member;

  // Generate a unique member ID for new members
  const [tempMemberId] = useState(() => `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    profileImageUrl: null as string | null,
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return;
    }
    
    try {
      const memberData: any = {
        name: formData.name.trim() || formData.displayName.trim(),
        displayName: formData.displayName.trim(),
        profileImageUrl: formData.profileImageUrl,
        color: formData.color,
        role: formData.role,
        // Keep avatar field for backwards compatibility
        avatar: formData.profileImageUrl || '',
      };
      
      // Debug logging
      console.log('💾 MemberModal saving member data:', {
        isEditing,
        memberName: memberData.displayName,
        hasProfileImageUrl: !!memberData.profileImageUrl,
        profileImageUrl: memberData.profileImageUrl,
        fullMemberData: memberData
      });
      
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

  // Initialize form data when member changes (for editing)
  React.useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        displayName: member.displayName || '',
        profileImageUrl: member.profileImageUrl || null,
        color: member.color || '#3B82F6',
        role: member.role || 'child',
      });
    } else {
      // Reset for new member
      setFormData({
        name: '',
        displayName: '',
        profileImageUrl: null,
        color: '#3B82F6',
        role: 'child',
      });
    }
  }, [member, isOpen]);

  return (
    <div>
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
                  displayName: newDisplayName
                }));
              }}
              required
            />
          </div>

          {/* Profile Image */}
          <div className="mt-6">
            <h4 className={cn("text-lg font-semibold mb-4", theme.text.primary)}>Profile Image</h4>
            <div className="flex justify-center">
              <ProfileImageUploader
                name={formData.displayName || 'New Member'}
                color={formData.color}
                profileImageUrl={formData.profileImageUrl}
                onImageChange={(imageUrl) => {
                  setFormData(prev => ({ ...prev, profileImageUrl: imageUrl }));
                }}
                size={100}
                userId={user?.uid || 'temp-user'}
                memberId={member?.id || tempMemberId}
              />
            </div>
          </div>

          {/* Personal Color */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Personal Color
            </label>
            <div className={`flex flex-wrap gap-2 p-3 border rounded-lg ${theme.surface.secondary} ${theme.border.default}`}>
              {MEMBER_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={cn(
                    "rounded-full border transition-all",
                    formData.color === color.hex 
                      ? 'border-gray-900 shadow-sm ring-2 ring-blue-400 scale-110' 
                      : 'border-gray-400 hover:scale-110 hover:border-gray-600'
                  )}
                  style={{ 
                    backgroundColor: color.hex,
                    width: '32px',
                    height: '32px',
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color: color.hex }))}
                  title={color.label}
                >
                  {formData.color === color.hex && (
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection */}
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
    </div>
  );
}