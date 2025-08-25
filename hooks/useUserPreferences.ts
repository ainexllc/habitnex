import { useState, useEffect } from 'react';

interface UserPreferences {
  timeFormat: '12' | '24';
}

interface TimeFormatPreferences {
  is24Hour: boolean;
  format: '12' | '24';
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    timeFormat: '12'
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
    is24Hour: preferences.timeFormat === '24',
    format: preferences.timeFormat
  };

  return {
    preferences,
    updatePreferences,
    timeFormatPreferences
  };
}