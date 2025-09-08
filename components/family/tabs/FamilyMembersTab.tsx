'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { MemberModal } from '@/components/family/MemberModal';

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
      {/* Tab Header with Actions - Enhanced */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" style={{
            fontFamily: '"Henny Penny", cursive',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Family Members
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            🏡 Manage your family members and celebrate together
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </span>
            <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
              {members.filter(m => (m.stats?.currentStreak || 0) > 0).length} Active Streaks
            </span>
          </div>
        </div>
        
        {isParent && (
          <Button 
            onClick={onAddMember}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Members Grid - Enhanced with bigger avatars and names */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden"
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: member.color || '#6B7280' }}
              />
            </div>
            
            {/* Edit Button - Positioned at top right */}
            {isParent && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditMember(member)}
                className="absolute top-4 right-4 opacity-60 hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-5 h-5" />
              </Button>
            )}
            
            {/* Member Avatar - Much Larger */}
            <div className="flex flex-col items-center mb-6">
              <div className="rounded-full shadow-lg ring-4 ring-white dark:ring-gray-700 hover:ring-opacity-75 transition-all overflow-hidden">
                <DiceBearAvatar
                  seed={member.avatarSeed || member.id}
                  style="adventurer"
                  size={120}
                  backgroundColor="#ffffff"
                />
              </div>
              
              {/* Current User Crown Indicator */}
              {member.id === currentMember.id && (
                <div className="absolute -top-2 transform">
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full p-2 shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Member Name - Much Larger */}
            <div className="text-center mb-6">
              <h3 className="font-bold text-3xl mb-2 leading-tight" style={{
                fontFamily: '"Henny Penny", cursive',
                color: member.color,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {member.displayName}
              </h3>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">{member.name}</p>
              
              {/* Current User Badge */}
              {member.id === currentMember.id && (
                <div className="mt-3">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                    ✨ This is you
                  </span>
                </div>
              )}
            </div>
            
            {/* Role Badge - Enhanced */}
            <div className="flex justify-center mb-6">
              <span className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 shadow-sm",
                getRoleColor(member.role)
              )}>
                {getRoleIcon(member.role)}
                {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              </span>
            </div>
            
            {/* Member Stats - Enhanced Layout */}
            <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 mb-2">
                  <Trophy className="w-6 h-6 text-white mx-auto" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Points</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {member.stats?.totalPoints || 0}
                </p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-4 mb-2">
                  <Star className="w-6 h-6 text-white mx-auto" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Streak</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {member.stats?.currentStreak || 0}
                  <span className="text-sm font-normal"> days</span>
                </p>
              </div>
            </div>
            
            {/* Achievement Level Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Level Progress</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Lv. {Math.floor((member.stats?.totalPoints || 0) / 100) + 1}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 shadow-inner"
                  style={{ 
                    width: `${((member.stats?.totalPoints || 0) % 100)}%` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty State - Enhanced */}
      {members.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full w-32 h-32 mx-auto mb-8 flex items-center justify-center">
            <Users className="w-16 h-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Family Awaits!</h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            Create a warm and connected family experience by adding your first family member
          </p>
          {isParent && (
            <Button 
              onClick={onAddMember}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <UserPlus className="w-6 h-6 mr-3" />
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
    </div>
  );
}