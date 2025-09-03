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
      <div className={`bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-600/50 p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                Today's Mood
              </span>
            </div>

            {todayMood ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getMoodEmoji(todayMood.mood)}</span>
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${getMoodColor(todayMood.mood)}`}>
                    {getMoodLabel(todayMood.mood)}
                  </span>
                  <span className="text-xs text-text-muted-light dark:text-text-muted-dark">
                    {todayMood.mood}/5
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Meh className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Not logged
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {todayMood ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoodEdit(todayMood)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-2 py-1 h-7 text-xs"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setShowMoodModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Log
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