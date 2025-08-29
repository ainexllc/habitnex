'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Heart, User, LogOut } from 'lucide-react';
import { theme } from '@/lib/theme';

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
    <header className={`${theme.surface.primary} border-b ${theme.border.default}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard">
              <span className={`text-xl font-bold ${theme.text.primary}`}>
                NextVibe
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`${theme.components.nav.link} ${theme.animation.transition} px-3 py-2 rounded-md`}
            >
              Dashboard
            </Link>
            <Link
              href="/habits"
              className={`${theme.components.nav.link} ${theme.animation.transition} px-3 py-2 rounded-md`}
            >
              Habits
            </Link>
            <Link
              href="/moods"
              className={`${theme.components.nav.link} ${theme.animation.transition} px-3 py-2 rounded-md`}
            >
              Moods
            </Link>
            <Link
              href="/stats"
              className={`${theme.components.nav.link} ${theme.animation.transition} px-3 py-2 rounded-md`}
            >
              Statistics
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 ${theme.iconContainer.blue} rounded-full flex items-center justify-center`}>
                <User className={`w-4 h-4 ${theme.status.info.icon}`} />
              </div>
              <span className={`text-sm ${theme.text.secondary}`}>
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