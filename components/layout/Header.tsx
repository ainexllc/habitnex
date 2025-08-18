'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Plus, User, LogOut } from 'lucide-react';

export function Header() {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="bg-white dark:bg-surface-dark border-b border-border-light dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                HabitTracker
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/habits"
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
            >
              Habits
            </Link>
            <Link
              href="/stats"
              className="text-text-secondary-light dark:text-text-secondary-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors"
            >
              Statistics
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Link href="/habits/new">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                New Habit
              </Button>
            </Link>
            
            <ThemeToggle />

            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {userProfile?.displayName || user?.email?.split('@')[0] || 'User'}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}