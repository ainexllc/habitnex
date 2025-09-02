'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { MoodModal } from '@/components/moods/MoodModal';
import { MoodEditModal } from '@/components/moods/MoodEditModal';
import { useMoods } from '@/hooks/useMoods';
import { getTodayDateString } from '@/lib/utils';
import { Plus, Edit3, Smile, Meh, Frown, Heart } from 'lucide-react';
import { MoodEntry } from '@/types';

interface MoodBarProps {
  className?: string;
}

export function MoodBar({ className = '' }: MoodBarProps) {
  const { moods, addMood, editMood, getTodayMood, loading } = useMoods();
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [editingMood, setEditingMood] = useState<MoodEntry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const todayMood = getTodayMood();

  const getMoodEmoji = (rating: number) => {
    if (rating === 5) return '😊';
    if (rating === 4) return '🙂';
    if (rating === 3) return '😐';
    if (rating === 2) return '😔';
    return '😢';
  };

  const getMoodLabel = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Good';
    if (rating === 3) return 'Okay';
    if (rating === 2) return 'Bad';
    return 'Very Bad';
  };

  const getMoodColor = (rating: number) => {
    if (rating === 5) return 'text-green-600 dark:text-green-400';
    if (rating === 4) return 'text-blue-600 dark:text-blue-400';
    if (rating === 3) return 'text-yellow-600 dark:text-yellow-400';
    if (rating === 2) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const handleMoodSubmit = async (moodData: any) => {
    try {
      await addMood(moodData);
      // Mood saved successfully - no need to log
    } catch (error) {
      // Failed to save mood - let the modal handle the error
      throw error;
    }
  };

  const handleMoodEdit = (mood: MoodEntry) => {
    setEditingMood(mood);
    setIsEditModalOpen(true);
  };

  const handleMoodEditSave = async (moodData: any) => {
    if (!editingMood) return;

    try {
      await editMood(editingMood.id, moodData);
      setIsEditModalOpen(false);
      setEditingMood(null);
    } catch (error) {
      // Failed to edit mood - let the modal handle the error
      throw error;
    }
  };

  return (
    <>
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Today's Mood:
              </span>
            </div>
            
            {todayMood ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{getMoodEmoji(todayMood.mood)}</span>
                  <div>
                    <span className={`text-lg font-semibold ${getMoodColor(todayMood.mood)}`}>
                      {getMoodLabel(todayMood.mood)}
                    </span>
                    <div className="text-xs text-text-muted-light dark:text-text-muted-dark">
                      {todayMood.mood}/5 mood
                    </div>
                  </div>
                </div>
                
                {todayMood.notes && (
                  <div className="hidden sm:block text-sm text-text-secondary-light dark:text-text-secondary-dark max-w-xs truncate">
                    "{todayMood.notes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Meh className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  Not logged yet
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {todayMood ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleMoodEdit(todayMood)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={() => setShowMoodModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Log Mood
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mood Creation Modal */}
      <MoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
        loading={loading}
        date={getTodayDateString()}
      />

      {/* Edit Modal */}
      <MoodEditModal
        mood={editingMood}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMood(null);
        }}
        onSave={handleMoodEditSave}
        loading={loading}
      />
    </>
  );
}