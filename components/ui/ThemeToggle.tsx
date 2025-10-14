'use client';

import { useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
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

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center gap-2 rounded-lg border border-transparent bg-black/10 px-3 py-2 text-sm font-medium text-white transition-all duration-200 backdrop-blur hover:bg-black/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label="Cycle theme"
      title={`Theme: ${label}. Click to switch.`}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
