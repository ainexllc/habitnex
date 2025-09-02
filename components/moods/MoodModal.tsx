'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { MoodForm } from '@/components/moods/MoodForm';
import { X, Heart, Smile, AlertCircle, CheckCircle } from 'lucide-react';
import { theme } from '@/lib/theme';
import { getTodayDateString } from '@/lib/utils';

interface MoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodData: any) => Promise<void>;
  loading?: boolean;
  date?: string;
}

export function MoodModal({ isOpen, onClose, onSubmit, loading = false, date }: MoodModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Reset state when modal opens/closes
    if (isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
    
    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (moodData: any) => {
    try {
      setError(null);
      setIsSubmitting(true);
      await onSubmit(moodData);
      setSuccess(true);
      // Close modal after brief success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentDate = date || getTodayDateString();
  const formattedDate = new Date(currentDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className={`${theme.surface.primary} rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`sticky top-0 ${theme.surface.primary} border-b ${theme.border.default} p-6 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${theme.text.primary}`}>
                Log Your Mood
              </h2>
              <p className={`text-sm ${theme.text.secondary}`}>
                {formattedDate}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={`${theme.text.muted} ${theme.surface.hover}`}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smile className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={`text-lg font-semibold ${theme.text.primary} mb-2`}>
              How are you feeling today?
            </h3>
            <p className={`text-sm ${theme.text.secondary}`}>
              Track your mood to understand patterns and improve your well-being.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  Mood saved successfully! 🎉
                </p>
              </div>
            </div>
          )}

          <MoodForm 
            onSubmit={handleSubmit}
            loading={loading || isSubmitting}
            date={currentDate}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
}
