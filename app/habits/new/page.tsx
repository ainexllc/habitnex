'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { HabitForm } from '@/components/forms/HabitForm';
import { useHabits } from '@/hooks/useHabits';
import { CreateHabitForm } from '@/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewHabitPage() {
  const [loading, setLoading] = useState(false);
  const { addHabit } = useHabits();
  const router = useRouter();

  const handleSubmit = async (data: CreateHabitForm) => {
    try {
      setLoading(true);
      await addHabit(data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-light dark:bg-background-dark">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Link 
              href="/dashboard"
              className="inline-flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              Create New Habit
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Start building a new positive habit today
            </p>
          </div>

          <HabitForm 
            onSubmit={handleSubmit}
            loading={loading}
            submitText="Create Habit"
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}