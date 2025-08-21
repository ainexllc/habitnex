'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { MoodForm } from '@/components/moods/MoodForm';
import { Button } from '@/components/ui/Button';
import { useMoods } from '@/hooks/useMoods';
import { getTodayDateString } from '@/lib/utils';
import { CreateMoodForm } from '@/types';
import { ArrowLeft, Heart } from 'lucide-react';
import Link from 'next/link';

export default function NewMoodPage() {
  const router = useRouter();
  const { addMood, loading, getTodayMood, hasMoodForDate } = useMoods();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const todayMood = !loading ? getTodayMood() : null;
  const today = getTodayDateString();

  // Show loading state while moods are being fetched
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-surface-light dark:bg-background-dark">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleMoodSubmit = async (moodData: CreateMoodForm) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await addMood(moodData);
      router.push('/moods');
    } catch (error) {
      console.error('Failed to save mood:', error);
      setError(error instanceof Error ? error.message : 'Failed to save mood entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-light dark:bg-background-dark">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <Link href="/moods">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Moods
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark flex items-center">
                <Heart className="w-8 h-8 mr-3 text-primary-600 dark:text-primary-400" />
                Track Your Mood
              </h1>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
                Record how you're feeling across four key dimensions.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="max-w-3xl mb-6">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Today's Mood Already Exists */}
          {todayMood ? (
            <div className="max-w-3xl">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="text-center">
                  <Heart className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                    You've already tracked your mood today!
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4">
                    You can only add one mood entry per day. You can edit your existing mood entry if needed.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/moods">
                      <Button variant="outline">
                        View Today's Mood
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Mood Form */
            <div className="max-w-3xl">
              <MoodForm
                onSubmit={handleMoodSubmit}
                loading={isSubmitting || loading}
                date={getTodayDateString()}
              />
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}