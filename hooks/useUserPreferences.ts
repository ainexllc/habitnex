import { useState, useEffect } from 'react';
import { defaultThemePreference, themePresets, themeFonts, type ThemePreference, type ThemeMode, type ThemePresetId, type FontId } from '@/lib/theme-presets';

interface UserPreferences {
  timeFormat: '12h' | '24h';
  locale: string;
  theme: ThemePreference;
  notifications: boolean;
  weekStartsOn: number;
}

interface TimeFormatPreferences {
  is24Hour: boolean;
  format: '12h' | '24h';
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    timeFormat: '12h',
    locale: 'en-US',
    theme: defaultThemePreference,
    notifications: true,
    weekStartsOn: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...sanitize(parsed) }));
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    }
  }, []);

  const sanitize = (incoming: Partial<UserPreferences>): Partial<UserPreferences> => {
    const updates: Partial<UserPreferences> = { ...incoming };
    if (incoming.theme) {
      const raw = incoming.theme as any;
      if (typeof raw === 'string') {
        updates.theme = {
          mode: raw === 'dark' ? 'dark' : 'light',
          preset: defaultThemePreference.preset,
          font: defaultThemePreference.font,
        };
      } else if (raw.mode && raw.preset && raw.preset in themePresets) {
        const mode: ThemeMode = raw.mode === 'dark' ? 'dark' : 'light';
        const preset: ThemePresetId = raw.preset in themePresets ? raw.preset : defaultThemePreference.preset;
        const font: FontId = raw.font && raw.font in themeFonts ? raw.font : defaultThemePreference.font;
        updates.theme = { mode, preset, font };
      } else {
        updates.theme = defaultThemePreference;
      }
    }
    return updates;
  };

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const next = sanitize({ ...preferences, ...updates });
    setPreferences(next as UserPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(next));
  };

  const timeFormatPreferences: TimeFormatPreferences = {
    is24Hour: preferences.timeFormat === '24h',
    format: preferences.timeFormat
  };

  return {
    preferences,
    updatePreferences,
    timeFormatPreferences
  };
}
