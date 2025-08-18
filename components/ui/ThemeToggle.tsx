'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative p-2 rounded-lg
        bg-surface-light dark:bg-surface-dark
        border border-border-light dark:border-border-dark
        hover:bg-secondary-100 dark:hover:bg-secondary-800
        transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500
      "
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5
            text-secondary-600 dark:text-secondary-400
            transition-all duration-300 ease-in-out
            ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-5 h-5
            text-secondary-600 dark:text-secondary-400
            transition-all duration-300 ease-in-out
            ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}