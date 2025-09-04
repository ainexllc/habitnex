'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ModernMoodModal } from '@/components/moods/ModernMoodModal';
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
      <div className={`bg-white/80 dark:bg-white/10 backdrop-blur-md rounded-xl border border-white/40 dark:border-white/20 p-4 ${className}`}>
        {todayMood ? (
          <div className="space-y-3">
            {/* Current mood display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <span className="text-3xl">{getMoodEmoji(todayMood.mood)}</span>
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getMoodColor(todayMood.mood).replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} rounded-full flex items-center justify-center text-xs font-bold text-white`}>
                    {todayMood.mood}
                  </div>
                </div>
                <div>
                  <h4 className={`font-bold text-white`}>
                    {getMoodLabel(todayMood.mood)}
                  </h4>
                  <p className="text-white/70 text-sm">Feeling great today!</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMoodEdit(todayMood)}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-3 py-1.5 h-auto text-xs rounded-lg transition-all hover:scale-105"
              >
                <Edit3 className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>

            {/* Mini mood breakdown */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center bg-white/10 rounded-lg p-2">
                <div className="text-lg mb-1">😊</div>
                <div className="text-xs text-white/80">{todayMood.mood}/5</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-2">
                <div className="text-lg mb-1">⚡</div>
                <div className="text-xs text-white/80">{todayMood.energy}/5</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-2">
                <div className="text-lg mb-1">🌊</div>
                <div className="text-xs text-white/80">{5 - todayMood.stress + 1}/5</div>
              </div>
              <div className="text-center bg-white/10 rounded-lg p-2">
                <div className="text-lg mb-1">🌙</div>
                <div className="text-xs text-white/80">{todayMood.sleep}/5</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="mb-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                <Smile className="w-8 h-8 text-white/80" />
              </div>
              <h4 className="font-bold text-white mb-1">Track Your Mood</h4>
              <p className="text-white/70 text-sm">How are you feeling today?</p>
            </div>
            
            <Button
              onClick={() => setShowMoodModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-4 py-2 text-sm rounded-lg transition-all hover:scale-105 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Mood
            </Button>
          </div>
        )}
      </div>

      {/* Mood Creation Modal */}
      <ModernMoodModal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        onSubmit={handleMoodSubmit}
        loading={loading}
        date={getTodayDateString()}
        mode="create"
      />

      {/* Edit Modal */}
      <ModernMoodModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMood(null);
        }}
        onSubmit={handleMoodEditSave}
        loading={loading}
        date={editingMood?.date}
        initialData={editingMood}
        mode="edit"
      />
    </>
  );
}