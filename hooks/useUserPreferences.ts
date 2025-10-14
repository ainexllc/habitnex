import { useState, useEffect } from 'react';
import { defaultThemePreference, themePresets, themeFonts, type ThemePreference, type ThemePresetId, type FontId } from '@/lib/theme-presets';

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
      const raw = incoming.theme as unknown;
      if (typeof raw === 'string') {
        const preset = raw === 'dark' ? 'aurora' : defaultThemePreference.preset;
        updates.theme = {
          preset,
          font: defaultThemePreference.font,
          mode: themePresets[preset]?.appearance ?? 'light',
        };
      } else if (typeof raw === 'object' && raw) {
        const candidate = raw as Partial<{ preset: ThemePresetId; font: FontId; mode: string }>;
        let preset: ThemePresetId = defaultThemePreference.preset;
        if (candidate.preset && candidate.preset in themePresets) {
          preset = candidate.preset;
        } else if (candidate.mode) {
          preset = candidate.mode === 'dark' ? 'aurora' : defaultThemePreference.preset;
        }
        const font: FontId =
          candidate.font && candidate.font in themeFonts ? candidate.font : defaultThemePreference.font;
        updates.theme = {
          preset,
          font,
          mode: themePresets[preset]?.appearance ?? 'light',
        };
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
