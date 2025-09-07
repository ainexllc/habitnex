'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { AdventurerAvatarBuilder } from '@/components/ui/AdventurerAvatarBuilder';
import { AvataaarsBuilder } from '@/components/ui/AvataaarsBuilder';
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
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    avatarSeed: '',
    avatarBackgroundColor: '#ffffff',
    avatarStyle: 'adventurer' as 'adventurer' | 'avataaars',
    avatarOptions: {} as any,
    color: '#3B82F6',
    role: 'child' as 'parent' | 'child' | 'teen' | 'adult',
  });

  const [error, setError] = useState<string | null>(null);

  // Initialize form data when member changes (for editing)
  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        displayName: member.displayName || '',
        avatarSeed: (member as any).avatarSeed || member.displayName || 'member',
        avatarBackgroundColor: (member as any).avatarBackgroundColor || '#ffffff',
        avatarStyle: (member as any).avatarStyle || 'adventurer',
        avatarOptions: (member as any).avatarOptions || {},
        color: member.color || '#3B82F6',
        role: member.role || 'child',
      });
    } else {
      // Reset for new member
      setFormData({
        name: '',
        displayName: '',
        avatarSeed: '',
        avatarBackgroundColor: '#ffffff',
        avatarStyle: 'adventurer',
        avatarOptions: {},
        color: '#3B82F6',
        role: 'child',
      });
    }
  }, [member, isOpen]);
  
  // Handle avatar changes from builder
  const handleAvatarChange = (seed: string, optionsOrBg?: any) => {
    if (formData.avatarStyle === 'adventurer') {
      // For adventurer, second param is backgroundColor array
      setFormData(prev => ({
        ...prev,
        avatarSeed: seed,
        avatarBackgroundColor: optionsOrBg?.[0] || '#ffffff'
      }));
    } else {
      // For avataaars, second param is options object
      setFormData(prev => ({
        ...prev,
        avatarSeed: seed,
        avatarOptions: optionsOrBg || {}
      }));
    }
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
        avatarStyle: formData.avatarStyle,
        avatarSeed: formData.avatarSeed || formData.displayName.trim(),
        avatarBackgroundColor: formData.avatarBackgroundColor,
        avatarOptions: formData.avatarOptions,
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
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                displayName: e.target.value,
                // Auto-generate avatar seed from name if not already set
                avatarSeed: prev.avatarSeed || e.target.value
              }))}
              required
            />
          </div>

          {/* Avatar */}
          <div>
            <label className={cn("block text-sm font-medium mb-2", theme.text.primary)}>
              Avatar Style
            </label>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatarStyle: 'adventurer' }))}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  formData.avatarStyle === 'adventurer'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                Simple (Adventurer)
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatarStyle: 'avataaars' }))}
                className={cn(
                  "flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  formData.avatarStyle === 'avataaars'
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                )}
              >
                Detailed (Avataaars)
              </button>
            </div>
            
            {formData.avatarStyle === 'adventurer' ? (
              <AdventurerAvatarBuilder
                initialSeed={formData.avatarSeed || formData.displayName || 'member'}
                onChange={handleAvatarChange}
              />
            ) : (
              <AvataaarsBuilder
                initialSeed={formData.avatarSeed || formData.displayName || 'member'}
                onChange={handleAvatarChange}
              />
            )}
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
  );
}