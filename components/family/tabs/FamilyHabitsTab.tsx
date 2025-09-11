'use client';

import { useState, useMemo } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { EditFamilyHabitModal } from '@/components/family/EditFamilyHabitModal';
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal';
import { ProfileImage } from '@/components/ui/ProfileImage';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  Target, 
  TrendingUp, 
  Check, 
  X, 
  Flame, 
  Calendar,
  Award,
  ChevronRight,
  Filter,
  Star,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FamilyHabit } from '@/types/family';
import { isHabitDueToday, getNextDueDate } from '@/lib/utils';

interface FamilyHabitsTabProps {
  onCreateHabit?: () => void;
}

type ViewMode = 'overview' | 'byMember' | 'calendar';

export function FamilyHabitsTab({ onCreateHabit }: FamilyHabitsTabProps = {}) {
  const { currentFamily, isParent } = useFamily();
  const { allHabits, allCompletions, deleteHabit, toggleMemberCompletion, loading: habitsLoading } = useAllFamilyHabits();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingHabit, setEditingHabit] = useState<FamilyHabit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
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

  // Calculate family stats
  const familyStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeHabits = allHabits.filter(h => !h.archived);
    const todaysHabits = activeHabits.filter(h => isHabitDueToday(h));
    const completedToday = allCompletions.filter(c => c.date === today && c.completed);
    
    const totalPossibleCompletions = todaysHabits.reduce((sum, habit) => 
      sum + habit.assignedMembers.length, 0
    );
    
    const completionRate = totalPossibleCompletions > 0 
      ? Math.round((completedToday.length / totalPossibleCompletions) * 100) 
      : 0;

    return {
      totalHabits: activeHabits.length,
      todaysHabits: todaysHabits.length,
      completedToday: completedToday.length,
      completionRate,
      totalPossibleCompletions
    };
  }, [allHabits, allCompletions]);

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

  // Get member's streak for a habit
  const getMemberStreak = (habitId: string, memberId: string): number => {
    const memberCompletions = allCompletions
      .filter(c => c.habitId === habitId && c.memberId === memberId && c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < memberCompletions.length; i++) {
      const completionDate = new Date(memberCompletions[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (completionDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  // Handle completion of a habit by a family member
  const handleHabitCompletion = async (habit: FamilyHabit, memberId: string, success: boolean) => {
    const habitKey = `${habit.id}-${memberId}`;
    try {
      setCompletingHabit(habitKey);
      await toggleMemberCompletion(
        habit.id,
        memberId,
        true,
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
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full p-8 mb-6">
          <Target className="w-16 h-16 text-blue-500 mx-auto" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-md">Only parents can manage family habits and track progress.</p>
      </div>
    );
  }

  // Filter habits based on search term
  const filteredHabits = allHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="px-6">
      {/* Tab Header - Enhanced */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3" style={{
            fontFamily: '"Henny Penny", cursive',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Family Habits
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
            🎯 Track progress and build healthy habits together
          </p>
          <div className="flex items-center gap-4">
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              {familyStats.totalHabits} Total Habits
            </span>
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
              {familyStats.completionRate}% Success Rate Today
            </span>
          </div>
        </div>
        
        <div>
          <Button 
            onClick={onCreateHabit}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Habit
          </Button>
        </div>
      </div>


      {/* Search and Filters */}
      <Card className="mb-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search habits by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 dark:bg-gray-700/70"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'overview' ? 'default' : 'outline'}
                onClick={() => setViewMode('overview')}
                size="sm"
              >
                Overview
              </Button>
              <Button
                variant={viewMode === 'byMember' ? 'default' : 'outline'}
                onClick={() => setViewMode('byMember')}
                size="sm"
              >
                By Member
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      {filteredHabits.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full p-12 mb-8 inline-block">
            <Target className="w-20 h-20 text-blue-500 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {searchTerm ? 'No Matching Habits' : 'Ready to Start?'}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
            {searchTerm 
              ? 'Try adjusting your search terms or create a new habit.' 
              : 'Create your first family habit and start building healthy routines together.'
            }
          </p>
          <Button 
            onClick={onCreateHabit}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create First Habit
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {viewMode === 'overview' ? (
            // Overview Mode - All habits in a grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHabits.map((habit) => (
                <Card key={habit.id} className="group hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600">
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          {habit.emoji}
                        </div>
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {habit.name}
                          </CardTitle>
                          {habit.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {habit.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHabit(habit)}
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => handleDeleteClick(habit)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 text-xs font-medium rounded-full">
                        <Star className="w-3 h-3 inline mr-1" />
                        {habit.basePoints} pts
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 text-xs font-medium rounded-full">
                        {habit.frequency || 'Daily'}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span>Team Progress Today</span>
                        <span className="font-medium">
                          {habit.assignedMembers.filter(memberId => 
                            isHabitCompletedByMember(habit.id, memberId)
                          ).length} / {habit.assignedMembers.length}
                        </span>
                      </div>
                      
                      {/* Team Members Progress */}
                      <div className="space-y-3">
                        {habit.assignedMembers.map(memberId => {
                          const member = currentFamily.members.find(m => m.id === memberId);
                          if (!member) return null;
                          
                          const isCompleted = isHabitCompletedByMember(habit.id, member.id);
                          const streak = getMemberStreak(habit.id, member.id);
                          const isLoading = completingHabit === `${habit.id}-${member.id}`;
                          
                          return (
                            <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <ProfileImage
                                  name={member.displayName}
                                  profileImageUrl={member.profileImageUrl}
                                  color={member.color}
                                  size={28}
                                  className="flex-shrink-0"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {member.displayName}
                                  </p>
                                  {streak > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                      <Flame className="w-3 h-3" />
                                      {streak} day streak
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {isHabitDueToday(habit) && !isCompleted ? (
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => handleHabitCompletion(habit, member.id, true)}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-green-500 hover:bg-green-600 text-white h-7 px-2"
                                  >
                                    {isLoading ? <div className="w-3 h-3 animate-spin border border-white rounded-full border-t-transparent" /> : <Check className="w-3 h-3" />}
                                  </Button>
                                  <Button
                                    onClick={() => handleHabitCompletion(habit, member.id, false)}
                                    disabled={isLoading}
                                    size="sm"
                                    className="bg-red-500 hover:bg-red-600 text-white h-7 px-2"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : isCompleted ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-xs font-medium rounded-full">
                                  <Check className="w-3 h-3" />
                                  Done
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Not due today</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            // By Member Mode - Grouped by family member
            <div className="space-y-6">
              {currentFamily.members
                .filter(member => 
                  filteredHabits.some(habit => habit.assignedMembers.includes(member.id))
                )
                .map(member => {
                  const memberHabits = filteredHabits.filter(habit => 
                    habit.assignedMembers.includes(member.id)
                  );
                  
                  const completedToday = memberHabits.filter(habit => 
                    isHabitCompletedByMember(habit.id, member.id)
                  ).length;
                  
                  return (
                    <Card key={member.id} className="overflow-hidden bg-white dark:bg-gray-800">
                      <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <ProfileImage
                              name={member.displayName}
                              profileImageUrl={member.profileImageUrl}
                              color={member.color}
                              size={48}
                              className="flex-shrink-0"
                            />
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                                {member.displayName}
                              </CardTitle>
                              <p className="text-gray-600 dark:text-gray-400">
                                {memberHabits.length} habits • {completedToday} completed today
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {memberHabits.length > 0 ? Math.round((completedToday / memberHabits.length) * 100) : 0}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Success Rate</div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {memberHabits.map(habit => {
                            const isCompleted = isHabitCompletedByMember(habit.id, member.id);
                            const streak = getMemberStreak(habit.id, member.id);
                            const isLoading = completingHabit === `${habit.id}-${member.id}`;
                            
                            return (
                              <div key={habit.id} className="p-5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div className="text-lg">{habit.emoji}</div>
                                    <div>
                                      <h4 className="font-medium text-gray-900 dark:text-white">
                                        {habit.name}
                                      </h4>
                                      {streak > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mt-1">
                                          <Flame className="w-3 h-3" />
                                          {streak} day streak
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditHabit(habit)}
                                      className="opacity-60 hover:opacity-100"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700 opacity-60 hover:opacity-100"
                                      onClick={() => handleDeleteClick(habit)}
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {isHabitDueToday(habit) && !isCompleted ? (
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleHabitCompletion(habit, member.id, true)}
                                      disabled={isLoading}
                                      size="sm"
                                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      {isLoading ? (
                                        <div className="w-4 h-4 animate-spin border border-white rounded-full border-t-transparent" />
                                      ) : (
                                        <>
                                          <Check className="w-4 h-4 mr-1" />
                                          Complete
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => handleHabitCompletion(habit, member.id, false)}
                                      disabled={isLoading}
                                      size="sm"
                                      className="bg-red-500 hover:bg-red-600 text-white px-3"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                ) : isCompleted ? (
                                  <div className="flex items-center justify-center gap-2 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm font-medium rounded-lg">
                                    <Check className="w-4 h-4" />
                                    Completed Today
                                  </div>
                                ) : (
                                  <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                                    Not due today
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
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