'use client';

import { useState, useMemo } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { MemberModal } from '@/components/family/MemberModal';

import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { UserPlus, Edit2, Users, Crown, Trophy, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMembersTabProps {
  onAddMember: () => void;
}

export function FamilyMembersTab({ onAddMember }: FamilyMembersTabProps) {
  const { currentFamily, currentMember, isParent, removeMember } = useFamily();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<FamilyMember | null>(null);
  const [removingMember, setRemovingMember] = useState(false);

  if (!currentFamily || !currentMember) {
    return null;
  }
  
  const members = currentFamily.members.filter(m => m.isActive);
  
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'parent':
        return <Crown className="w-4 h-4" />;
      case 'adult':
        return <Users className="w-4 h-4" />;
      case 'teen':
        return <Star className="w-4 h-4" />;
      case 'child':
        return <Trophy className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'parent':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'adult':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'teen':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'child':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };
  
  const handleEditMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleRemoveMember = (member: FamilyMember) => {
    setMemberToRemove(member);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemovingMember(true);
      await removeMember(memberToRemove.id);
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Failed to remove member:', error);
      // Error handling is done in the context
    } finally {
      setRemovingMember(false);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveConfirm(false);
    setMemberToRemove(null);
  };

  // Check if current user is the family creator
  const isFamilyCreator = currentFamily?.createdBy === currentMember?.userId;

  // Build adventurer avatar options from stored avatarConfig so members tab matches edit form and dashboard
  const getAvatarOptions = (member: FamilyMember) => {
    const cfg = (member as any).avatarConfig || {};
    const addHash = (c?: string) => (c ? (c.startsWith('#') ? c : `#${c}`) : c);
    const opts: any = {};

    // Only add options if they have values
    if (cfg.skinColor || (member as any).avatarSkinColor) {
      opts.skinColor = [addHash(cfg.skinColor || (member as any).avatarSkinColor)];
    }
    if (cfg.mouthType || (member as any).avatarMouth) {
      opts.mouth = [cfg.mouthType || (member as any).avatarMouth];
    }
    if (cfg.hairColor || (member as any).avatarHairColor) {
      opts.hairColor = [addHash(cfg.hairColor || (member as any).avatarHairColor)];
    }

    // Get hair probability - use new format or fallback to old
    const hairProb = (member as any).hairProbability ?? cfg.hairProbability ?? 100;
    if (hairProb >= 50) {
      opts.hair = ['short01', 'short02', 'short03', 'short04', 'short05', 'long01', 'long02', 'long03'];
    }

    // Get glasses probability and set options
    const glassesProb = (member as any).glassesProbability ?? cfg.glassesProbability ?? 50;
    if (glassesProb >= 50) {
      opts.accessories = ['prescription01', 'prescription02', 'round', 'sunglasses'];
    }

    // Get earrings probability and set options
    const earringsProb = (member as any).earringsProbability ?? cfg.earringsProbability ?? 30;
    if (earringsProb >= 50) {
      opts.earrings = ['variant01', 'variant02', 'variant03'];
    }

    // Get features probability and set options
    const featuresProb = (member as any).featuresProbability ?? cfg.featuresProbability ?? 10;
    if (featuresProb >= 50) {
      opts.facialHair = ['variant01', 'variant02', 'variant03', 'variant04'];
    }

    // Strip # from colors for adventurer style compatibility
    if (opts.skinColor && Array.isArray(opts.skinColor)) {
      opts.skinColor = opts.skinColor.map(color =>
        typeof color === 'string' && color.startsWith('#') ? color.slice(1) : color
      );
    }
    if (opts.hairColor && Array.isArray(opts.hairColor)) {
      opts.hairColor = opts.hairColor.map(color =>
        typeof color === 'string' && color.startsWith('#') ? color.slice(1) : color
      );
    }

    return opts;
  };

  return (
    <div className="px-6">
      {/* Tab Header with Actions - Compact */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Family Members
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </span>
            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">
              {members.filter(m => (m.stats?.currentStreak || 0) > 0).length} Active Streaks
            </span>
          </div>
        </div>
        {isParent && (
          <Button 
            onClick={onAddMember}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-3 py-2 text-sm font-medium shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members Grid - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-colors duration-200 relative"
          >
            {/* Action Buttons - Positioned at top right */}
            <div className="absolute top-2 right-2 flex gap-1">
              {isParent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                  className="opacity-60 hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
              {isFamilyCreator && member.id !== currentMember.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member)}
                  className="opacity-60 hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Member Avatar - Compact */}
            <div className="flex flex-col items-center mb-3">
              <div className="relative">
                <div className="rounded-full ring-2 ring-white dark:ring-gray-700 overflow-hidden">
                  <DiceBearAvatar
                    seed={member.avatarSeed || member.id}
                    style="adventurer"
                    size={64}
                    backgroundColor="transparent"
                    options={getAvatarOptions(member)}
                  />
                </div>
                {member.id === currentMember.id && (
                  <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1 ring-1 ring-white">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Member Name - Compact */}
            <div className="text-center mb-2">
              <h3 className="font-semibold text-lg mb-1 leading-tight" style={{
                fontFamily: '"Henny Penny", cursive',
                color: member.color
              }}>
                {member.displayName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{member.name}</p>
            </div>
            
            {/* Role Badge - Compact */}
            <div className="flex justify-center mb-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border",
                getRoleColor(member.role)
              )}>
                {getRoleIcon(member.role)}
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
            
            {/* Member Stats - Compact */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
                <Trophy className="w-4 h-4" />
                Pts {member.stats?.totalPoints || 0}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs">
                <Star className="w-4 h-4" />
                {member.stats?.currentStreak || 0}d
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State - Compact */}
      {members.length === 0 && (
        <div className="text-center py-8">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Users className="w-10 h-10 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Family Awaits!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 max-w-md mx-auto">
            Create a warm and connected family experience by adding your first family member
          </p>
          {isParent && (
            <Button 
              onClick={onAddMember}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 text-sm font-medium shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add First Family Member
            </Button>
          )}
        </div>
      )}

      {/* Member Modal (Edit) */}
      <MemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />

      {/* Remove Member Confirmation Dialog */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Remove Family Member
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to remove <span className="font-semibold">{memberToRemove.displayName}</span> from the family?
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={cancelRemoveMember}
                  className="flex-1"
                  disabled={removingMember}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRemoveMember}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={removingMember}
                >
                  {removingMember ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Removing...
                    </div>
                  ) : (
                    'Remove Member'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}