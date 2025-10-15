'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  compact?: boolean;
  showLabel?: boolean;
}

export function ThemeToggle({ className, compact = false, showLabel = true }: ThemeToggleProps = {}) {
  const { availableThemes, preset, setPreset } = useTheme();

  const { appearance, label } = useMemo(() => {
    const current = availableThemes.find((theme) => theme.id === preset);
    return {
      appearance: current?.appearance ?? 'light',
      label: current?.name ?? 'Classic',
    };
  }, [availableThemes, preset]);

  const handleClick = () => {
    if (!availableThemes.length) return;
    const currentIndex = availableThemes.findIndex((theme) => theme.id === preset);
    const nextPreset = availableThemes[(currentIndex + 1) % availableThemes.length].id;
    setPreset(nextPreset);
  };

  const Icon = appearance === 'dark' ? Moon : Sun;
  const baseClasses =
    'relative flex items-center border border-transparent bg-black/10 font-medium text-white transition-all duration-200 backdrop-blur hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400';
  const sizeClasses = compact
    ? 'rounded-full px-2.5 py-1.5 text-xs gap-1.5'
    : 'rounded-lg px-3 py-2 text-sm gap-2';

  return (
    <button
      onClick={handleClick}
      className={cn(baseClasses, sizeClasses, className)}
      aria-label={`Theme: ${label}. Click to switch.`}
      title={`Theme: ${label}. Click to switch.`}
    >
      <Icon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span
        className={cn(
          showLabel ? 'hidden sm:inline' : 'sr-only',
          compact ? 'text-[0.75rem] font-semibold tracking-wide' : 'font-medium'
        )}
      >
        {label}
      </span>
    </button>
  );
}
