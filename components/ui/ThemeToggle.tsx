'use client';

import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { theme } from '@/lib/theme';

export function ThemeToggle() {
  const { theme: currentTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg
        ${theme.surface.primary}
        border ${theme.border.default}
        ${theme.surface.hover}
        ${theme.animation.transition}
        focus:outline-none focus:ring-2 focus:ring-blue-500
      `}
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5
            ${theme.text.secondary}
            transition-all duration-300 ease-in-out
            ${currentTheme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
          `}
        />
        <Moon
          className={`
            absolute inset-0 w-5 h-5
            ${theme.text.secondary}
            transition-all duration-300 ease-in-out
            ${currentTheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
          `}
        />
      </div>
    </button>
  );
}