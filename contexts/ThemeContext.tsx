'use client';

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserTheme } from '@/lib/db';
import {
  defaultThemePreference,
  resolvePalette,
  resolveFont,
  themeList,
  themePresets,
  themeFonts,
  type ThemePreference,
  type ThemePresetId,
  type ThemeMode,
  type FontId,
} from '@/lib/theme-presets';

interface ThemeContextType {
  mode: ThemeMode;
  preset: ThemePresetId;
  preference: ThemePreference;
  palette: ReturnType<typeof resolvePalette>;
  availableThemes: typeof themeList;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPreset: (preset: ThemePresetId) => void;
  setPreference: (preference: ThemePreference) => void;
  syncWithFirebase: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preference, setPreferenceState] = useState<ThemePreference>(defaultThemePreference);
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const palette = useMemo(
    () => resolvePalette(preference.preset, preference.mode),
    [preference.mode, preference.preset]
  );
  const storageKey = 'habitnex:theme-preference';

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    
    return unsubscribe;
  }, []);

  // Load theme on mount and when user changes
  useEffect(() => {
    setMounted(true);
    // Only load theme after mounting (client-side only)
    if (typeof window !== 'undefined') {
      loadTheme();
    } else {
      setPreferenceState(defaultThemePreference);
    }
  }, [userId]);

  const applyPreference = (newPreference: ThemePreference) => {
    setPreferenceState(newPreference);

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(storageKey, JSON.stringify(newPreference));
    localStorage.setItem('theme', newPreference.mode);
    const root = window.document.documentElement;
    const body = window.document.body;
    const paletteTokens = resolvePalette(newPreference.preset, newPreference.mode);
    const fontTokens = resolveFont(newPreference.font);

    root.classList.remove('light', 'dark');
    root.classList.add(newPreference.mode);
    root.dataset.themePreset = newPreference.preset;
    root.dataset.themeMode = newPreference.mode;
    root.dataset.themeFont = newPreference.font;
    root.setAttribute('data-theme', newPreference.mode);

    Object.entries(paletteTokens).forEach(([token, value]) => {
      root.style.setProperty(`--hn-${token}`, value);
    });

    root.style.setProperty('--hn-font-body', fontTokens.body);
    root.style.setProperty('--hn-font-display', fontTokens.display);
    root.style.setProperty('--hn-font-sample', fontTokens.sample);

    const linkKey = `theme-font-${fontTokens.id}`;
    if (typeof document !== 'undefined' && !document.querySelector(`link[data-theme-font="${linkKey}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontTokens.importUrl;
      link.dataset.themeFont = linkKey;
      document.head.appendChild(link);
    }

    body.style.background = paletteTokens.background;
    body.style.color = paletteTokens.textPrimary;
    body.style.fontFamily = fontTokens.body;
  };

  const sanitizePreference = (value: any): ThemePreference => {
    if (!value) {
      return defaultThemePreference;
    }

    if (typeof value === 'string') {
      return {
        mode: value === 'dark' ? 'dark' : 'light',
        preset: defaultThemePreference.preset,
        font: defaultThemePreference.font,
      };
    }

    const mode: ThemeMode = value.mode === 'dark' ? 'dark' : 'light';
    const preset: ThemePresetId = value.preset && value.preset in themePresets ? value.preset : defaultThemePreference.preset;
    const font: FontId = value.font && value.font in themeFonts ? value.font : defaultThemePreference.font;

    return { mode, preset, font };
  };

  const loadTheme = async () => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return;
    }
    
    let initialPreference: ThemePreference = defaultThemePreference;
    const storedPreference = localStorage.getItem(storageKey);

    if (storedPreference) {
      try {
        initialPreference = sanitizePreference(JSON.parse(storedPreference));
      } catch {
        initialPreference = defaultThemePreference;
      }
    }
    
    // First priority: Firebase (if user is logged in)
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        if (profile?.preferences?.theme) {
          initialPreference = sanitizePreference(profile.preferences.theme);
        } else {
          // If no theme in Firebase, check localStorage
          const legacyTheme = localStorage.getItem('theme') as ThemeMode | null;
          const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          initialPreference = {
            mode: legacyTheme || systemTheme,
            preset: defaultThemePreference.preset,
            font: defaultThemePreference.font,
          };
          await updateUserTheme(userId, initialPreference);
        }
      } catch (error) {
        // Error loading theme from Firebase - fall back to localStorage
        const legacyTheme = localStorage.getItem('theme') as ThemeMode | null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        initialPreference = {
          mode: legacyTheme || systemTheme,
          preset: defaultThemePreference.preset,
          font: defaultThemePreference.font,
        };
      }
    } else {
      // Not logged in - use localStorage or system preference
      const legacyTheme = localStorage.getItem('theme') as ThemeMode | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      initialPreference = {
        mode: legacyTheme || systemTheme,
        preset: initialPreference.preset,
        font: initialPreference.font ?? defaultThemePreference.font,
      };
    }

    applyPreference(sanitizePreference(initialPreference));
  };

  const syncWithFirebase = async () => {
    if (userId) {
      await loadTheme();
    }
  };

  // Prevent hydration mismatch - render children but without context during SSR
  if (!mounted) {
    return <>{children}</>;
  }

  const setMode = (mode: ThemeMode) => {
    const nextPreference = { ...preference, mode };
    applyPreference(nextPreference);
    if (userId) {
      updateUserTheme(userId, nextPreference).catch(() => {});
    }
  };

  const toggleMode = () => {
    setMode(preference.mode === 'light' ? 'dark' : 'light');
  };

  const setPreset = (preset: ThemePresetId) => {
    const nextPreference = { ...preference, preset };
    applyPreference(nextPreference);
    if (userId) {
      updateUserTheme(userId, nextPreference).catch(() => {});
    }
  };

  const setPreference = (next: ThemePreference) => {
    const sanitized = sanitizePreference(next);
    applyPreference(sanitized);
    if (userId) {
      updateUserTheme(userId, sanitized).catch(() => {});
    }
  };

  const contextValue: ThemeContextType = {
    mode: preference.mode,
    preset: preference.preset,
    preference,
    palette,
    availableThemes: themeList,
    setMode,
    toggleMode,
    setPreset,
    setPreference,
    syncWithFirebase,
  };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  // During SSR or before ThemeProvider mounts, return a fallback
  if (context === undefined) {
    const fallbackPalette = resolvePalette(defaultThemePreference.preset, defaultThemePreference.mode);
    return {
      mode: defaultThemePreference.mode,
      preset: defaultThemePreference.preset,
      preference: defaultThemePreference,
      palette: fallbackPalette,
      availableThemes: themeList,
      setMode: () => {},
      toggleMode: () => {},
      setPreset: () => {},
      setPreference: () => {},
      syncWithFirebase: async () => {},
    };
  }

  return context;
}
