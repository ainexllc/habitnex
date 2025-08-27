'use client';

import { useState, useEffect } from 'react';
import { useFamily } from '@/contexts/FamilyContext';
import { useAllFamilyHabits } from '@/hooks/useFamilyHabits';
import { EditFamilyHabitModal } from '@/components/family/EditFamilyHabitModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Users, Target, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FamilyHabit } from '@/types/family';

export default function FamilyHabitsPage() {
  const { currentFamily, isParent, loading: familyLoading } = useFamily();
  const { allHabits, deleteHabit, loading: habitsLoading } = useAllFamilyHabits();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [editingHabit, setEditingHabit] = useState<FamilyHabit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingHabit, setDeletingHabit] = useState<string | null>(null);

  const handleEditHabit = (habit: FamilyHabit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    // Refresh data is handled automatically by useAllFamilyHabits
    setEditingHabit(null);
    setShowEditModal(false);
  };

  const handleDeleteHabit = async (habitId: string, habitName: string) => {
    if (window.confirm(`Are you sure you want to delete "${habitName}"? This action cannot be undone.`)) {
      try {
        setDeletingHabit(habitId);
        await deleteHabit(habitId);
      } catch (error) {
        console.error('Failed to delete habit:', error);
        alert('Failed to delete habit. Please try again.');
      } finally {
        setDeletingHabit(null);
      }
    }
  };

  const loading = familyLoading || habitsLoading;

  // Filter habits based on search term
  const filteredHabits = allHabits.filter(habit =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group habits by member for better organization
  const habitsByMember = currentFamily?.members.reduce((acc, member) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading family habits...</p>
        </div>
      </div>
    );
  }

  if (!currentFamily || !isParent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Only parents can manage family habits.</p>
          <Link href="/dashboard/family">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/family">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Habits</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">Manage all family habits in one place</p>
            </div>
            
            <Link href="/family/habits/create">
              <Button>
                <Plus className="w-5 h-5 mr-2" />
                Create Habit
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Habits</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{allHabits.length}</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active Members</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentFamily.members.filter(m => m.isActive).length}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Points</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allHabits.reduce((sum, habit) => sum + habit.basePoints, 0)}
                  </p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Difficulty</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allHabits.length > 0 ? Math.round(allHabits.reduce((sum, habit) => sum + habit.basePoints, 0) / allHabits.length) : 0}
                  </p>
                </div>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">⚡</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
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
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Habits Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'No habits match your search.' : 'Create your first family habit to get started.'}
              </p>
              <Link href="/family/habits/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Habit
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(habitsByMember).map(([memberId, { member, habits }]) => (
              <Card key={memberId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: member.color }}
                    >
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{member.displayName}</h3>
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
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="text-xl">{habit.emoji}</span>
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
                            onClick={() => handleDeleteHabit(habit.id, habit.name)}
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
      </div>

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
    </div>
  );
}