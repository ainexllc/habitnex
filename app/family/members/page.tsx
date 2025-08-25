'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { EditMemberModal } from '@/components/family/EditMemberModal';
import { AddMemberModal } from '@/components/family/AddMemberModal';
import { DiceBearAvatar } from '@/components/ui/DiceBearAvatar';
import { FamilyMember } from '@/types/family';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, UserPlus, Edit2, Trash2, Crown, Users, Trophy, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function FamilyMembersPage() {
  const { currentFamily, currentMember, isParent, loading } = useFamily();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading family members...</p>
        </div>
      </div>
    );
  }
  
  if (!currentFamily || !currentMember) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Family Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">You need to create or join a family first.</p>
          <Link href="/family/create">
            <Button>Create Family</Button>
          </Link>
        </div>
      </div>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/family/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Members</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your family members and their roles</p>
            </div>
            
            {isParent && (
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
            )}
          </div>
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
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.displayName}</h3>
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
              <Button onClick={() => setShowAddModal(true)}>
                <UserPlus className="w-5 h-5 mr-2" />
                Add First Member
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Modals */}
      <EditMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
      />
      
      <AddMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}