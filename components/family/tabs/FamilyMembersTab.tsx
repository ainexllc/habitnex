'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { EditMemberModal } from '@/components/family/EditMemberModal';

import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { UserPlus, Edit2, Users, Crown, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMembersTabProps {
  onAddMember: () => void;
}

export function FamilyMembersTab({ onAddMember }: FamilyMembersTabProps) {
  const { currentFamily, currentMember, isParent } = useFamily();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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

  return (
    <div className="px-6">
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Members</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your family members and their roles</p>
        </div>
        
        {isParent && (
          <Button onClick={onAddMember}>
            <UserPlus className="w-5 h-5 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Member Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {(member as any).avatarSeed && (member as any).avatarStyle ? (
                  <DiceBearAvatar
                    seed={(member as any).avatarSeed}
                    style={(member as any).avatarStyle}
                    size={48}
                    className="rounded-full"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: member.color || '#6B7280' }}
                  >
                    {member.displayName?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-lg" style={{
                    fontFamily: '"Flavors", cursive',
                    color: member.color
                  }}>
                    {member.displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.name}</p>
                </div>
              </div>
              
              {isParent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMember(member)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {/* Role Badge */}
            <div className="mb-4">
              <span className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border",
                getRoleColor(member.role)
              )}>
                {getRoleIcon(member.role)}
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
            
            {/* Member Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {member.stats?.totalPoints || 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Streak</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {member.stats?.currentStreak || 0} days
                </p>
              </div>
            </div>
            
            {/* Current User Indicator */}
            {member.id === currentMember.id && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  This is you
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Empty State */}
      {members.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No family members yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Add your first family member to get started</p>
          {isParent && (
            <Button onClick={onAddMember}>
              <UserPlus className="w-5 h-5 mr-2" />
              Add First Member
            </Button>
          )}
        </div>
      )}

      {/* Edit Member Modal */}
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
    </div>
  );
}