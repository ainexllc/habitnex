'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyStatus } from '@/contexts/FamilyContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Heart, User, LogOut, Users, Home } from 'lucide-react';
import { theme } from '@/lib/theme';

export function Header() {
  const { user, userProfile, signOut } = useAuth();
  const { hasFamily, familyName } = useFamilyStatus();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Handle sign out error silently - user will see auth context error
    }
  };

  return (
    <header className={`${theme.surface.primary} border-b ${theme.border.default}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Logo linkToHome={false} textSize="sm" />
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

            {/* Family Dashboard Icon */}
            {hasFamily && (
              <Link
                href="/dashboard/family"
                className={`group relative p-2 rounded-lg ${theme.surface.hover} transition-all duration-200 hover:scale-105`}
                title={`Go to ${familyName} Family Dashboard`}
              >
                <div className="relative">
                  <Home className={`w-5 h-5 ${theme.text.secondary} group-hover:${theme.text.primary} transition-colors duration-200`} />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>

                {/* Tooltip */}
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {familyName}
                </div>
              </Link>
            )}

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