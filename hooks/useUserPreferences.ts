import { useState, useEffect } from 'react';

interface UserPreferences {
  timeFormat: '12h' | '24h';
  locale: string;
  theme: 'light' | 'dark';
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
    theme: 'light',
    notifications: true,
    weekStartsOn: 0
  });

  useEffect(() => {
    // Load preferences from localStorage
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse user preferences:', error);
      }
    }
  }, []);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
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