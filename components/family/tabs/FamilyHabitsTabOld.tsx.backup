'use client';

import { useState } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { EditFamilyHabitModal } from '@/components/family/EditFamilyHabitModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Plus, Search, Edit3, Trash2, Users, Target, BarChart3, Check, X } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FamilyHabit } from '@/types/family';
import { isHabitDueToday, getNextDueDate } from '@/lib/utils';

interface FamilyHabitsTabProps {
  onCreateHabit?: () => void;
}

export function FamilyHabitsTab({ onCreateHabit }: FamilyHabitsTabProps = {}) {
  const { currentFamily, isParent } = useFamily();
  const { allHabits, allCompletions, deleteHabit, toggleMemberCompletion, loading: habitsLoading } = useAllFamilyHabits();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHabit, setEditingHabit] = useState<FamilyHabit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingHabit, setDeletingHabit] = useState<string | null>(null);
  const [completingHabit, setCompletingHabit] = useState<string | null>(null);

  // Delete modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    habit: FamilyHabit | null;
    loading: boolean;
  }>({
    isOpen: false,
    habit: null,
    loading: false
  });

  const handleEditHabit = (habit: FamilyHabit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setEditingHabit(null);
    setShowEditModal(false);
  };

  const handleDeleteClick = (habit: FamilyHabit) => {
    setDeleteModalState({
      isOpen: true,
      habit,
      loading: false
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalState.habit) return;

    try {
      setDeleteModalState(prev => ({ ...prev, loading: true }));
      setDeletingHabit(deleteModalState.habit.id);
      await deleteHabit(deleteModalState.habit.id);
      setDeleteModalState({
        isOpen: false,
        habit: null,
        loading: false
      });
    } catch (error) {
      console.error('Failed to delete habit:', error);
      alert('Failed to delete habit. Please try again.');
      setDeleteModalState(prev => ({ ...prev, loading: false }));
    } finally {
      setDeletingHabit(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalState({
      isOpen: false,
      habit: null,
      loading: false
    });
  };

  // Helper function to check if a habit is completed by a member today
  const isHabitCompletedByMember = (habitId: string, memberId: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return allCompletions.some(c =>
      c.habitId === habitId &&
      c.memberId === memberId &&
      c.date === today &&
      c.completed
    );
  };

  // Handle completion of a habit by a family member
  const handleHabitCompletion = async (habit: FamilyHabit, memberId: string, success: boolean) => {
    const habitKey = `${habit.id}-${memberId}`;
    try {
      setCompletingHabit(habitKey);
      await toggleMemberCompletion(
        habit.id,
        memberId,
        true, // Always mark as completed
        success ? 'Completed successfully' : 'Marked as failed'
      );
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setCompletingHabit(null);
    }
  };

  if (!currentFamily || !isParent) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access Denied</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Only parents can manage family habits.</p>
      </div>
    );
  }

  // Filter habits based on search term
  const filteredHabits = allHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group habits by member for better organization
  const habitsByMember = currentFamily.members.reduce((acc, member) => {
    const memberHabits = filteredHabits.filter(habit => 
      habit.assignedMembers.includes(member.id)
    );
    if (memberHabits.length > 0) {
      acc[member.id] = {
        member,
        habits: memberHabits
      };
    }
    return acc;
  }, {} as Record<string, { member: any, habits: FamilyHabit[] }>) || {};

  return (
    <div className="px-6">
      {/* Tab Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Family Habits</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">Manage all family habits in one place</p>
        </div>
        
        <Button onClick={onCreateHabit}>
          <Plus className="w-5 h-5 mr-2" />
          Create Habit
        </Button>
      </div>



      {/* Search and Filters */}
      <Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Habits by Member */}
      {Object.keys(habitsByMember).length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Habits Found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm ? 'No habits match your search.' : 'Create your first family habit to get started.'}
          </p>
          <Button onClick={onCreateHabit}>
            <Plus className="w-5 h-5 mr-2" />
            Create First Habit
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(habitsByMember).map(([memberId, { member, habits }]) => (
            <Card key={memberId} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{member.displayName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                      {habits.length} habit{habits.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span
                          className="text-xl"
                          style={{
                            fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif',
                            fontSize: '20px',
                            fontWeight: '400'
                          }}
                        >
                          {habit.emoji}
                        </span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {habit.name}
                          </h4>
                          {habit.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {habit.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs font-medium rounded">
                            {habit.basePoints} pts
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs font-medium rounded">
                            {habit.frequency || 'Daily'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {/* Completion Buttons - Only show if habit is due today and not completed */}
                        {isHabitDueToday(habit) && !isHabitCompletedByMember(habit.id, member.id) ? (
                          <div className="flex gap-1 mr-2">
                            <Button
                              onClick={() => handleHabitCompletion(habit, member.id, true)}
                              loading={completingHabit === `${habit.id}-${member.id}`}
                              size="sm"
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Completed
                            </Button>
                            <Button
                              onClick={() => handleHabitCompletion(habit, member.id, false)}
                              loading={completingHabit === `${habit.id}-${member.id}`}
                              size="sm"
                              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-md transition-all duration-300 hover:scale-105"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Failed
                            </Button>
                          </div>
                        ) : isHabitCompletedByMember(habit.id, member.id) ? (
                          <div className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium rounded mr-2">
                            ✅ Completed Today
                          </div>
                        ) : null}

                        {/* Edit and Delete buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHabit(habit)}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                                                <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(habit)}
                          disabled={deletingHabit === habit.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Habit Modal */}
      <EditFamilyHabitModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
        }}
        habit={editingHabit}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Delete "${deleteModalState.habit?.name}"?`}
        description={`This will permanently delete the habit "${deleteModalState.habit?.name}" and all its completion history. This action cannot be undone.`}
        isLoading={deleteModalState.loading}
      />
    </div>
  );
}