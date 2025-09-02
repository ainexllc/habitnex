'use client';

import { useState, useEffect } from 'react';
import { MoodEntry, CreateMoodForm } from '@/types';
import { MoodForm } from './MoodForm';
import { Button } from '@/components/ui/Button';
import { theme } from '@/lib/theme';
import { X } from 'lucide-react';

interface MoodEditModalProps {
  mood: MoodEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (moodData: CreateMoodForm) => Promise<void>;
  loading?: boolean;
}

export function MoodEditModal({ mood, isOpen, onClose, onSave, loading = false }: MoodEditModalProps) {
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mood) return null;

  const handleSubmit = async (moodData: CreateMoodForm) => {
    setSaving(true);
    try {
      await onSave(moodData);
      onClose();
    } catch (error) {
      // Error saving mood - let the parent component handle it
    } finally {
      setSaving(false);
    }
  };

  const initialData = {
    mood: mood.mood,
    energy: mood.energy,
    stress: mood.stress,
    sleep: mood.sleep,
    notes: mood.notes || '',
    tags: mood.tags || [],
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`relative w-full max-w-3xl ${theme.surface.primary} rounded-lg shadow-xl`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${theme.border.default}`}>
            <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
              Edit Mood Entry
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <MoodForm
              onSubmit={handleSubmit}
              loading={saving || loading}
              initialData={initialData}
              date={mood.date}
            />
          </div>
        </div>
      </div>
    </div>
  );
}