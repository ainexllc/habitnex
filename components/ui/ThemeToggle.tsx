'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { theme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme: currentTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5 text-yellow-500
            transition-all duration-300 ease-in-out
            ${currentTheme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-5 h-5 text-blue-500
            transition-all duration-300 ease-in-out
            ${currentTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}