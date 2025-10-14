'use client';

import { createContext, useContext, useEffect, useMemo, useState, useCallback, ReactNode } from 'react';
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
    [preference.preset, preference.mode]
  );
  const storageKey = 'habitnex:theme-preference';

  const deriveMode = useCallback((preset: ThemePresetId): ThemeMode => {
    return themePresets[preset]?.appearance ?? 'light';
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    
    return unsubscribe;
  }, []);

  const applyPreference = useCallback(
    (incoming: ThemePreference) => {
      const normalizedPreset = incoming.preset && incoming.preset in themePresets ? incoming.preset : defaultThemePreference.preset;
      const normalizedFont = incoming.font && incoming.font in themeFonts ? incoming.font : defaultThemePreference.font;
      const resolvedMode = deriveMode(normalizedPreset);
      const normalizedPreference: ThemePreference = {
        preset: normalizedPreset,
      font: normalizedFont,
      mode: resolvedMode,
    };
      setPreferenceState(normalizedPreference);

      if (typeof window === 'undefined') {
        return;
      }

      localStorage.setItem(storageKey, JSON.stringify(normalizedPreference));
      localStorage.setItem('theme', resolvedMode);
      const root = window.document.documentElement;
      const body = window.document.body;
      const paletteTokens = resolvePalette(normalizedPreference.preset, resolvedMode);
      const fontTokens = resolveFont(normalizedPreference.font);

      root.classList.remove('light', 'dark');
      root.classList.add(resolvedMode);
      root.dataset.themePreset = normalizedPreference.preset;
      root.dataset.themeMode = resolvedMode;
      root.dataset.themeFont = normalizedPreference.font;
      root.setAttribute('data-theme', resolvedMode);

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
    },
    [deriveMode]
  );

  const sanitizePreference = useCallback(
    (value: unknown): ThemePreference => {
      if (!value) {
        return defaultThemePreference;
      }

      if (typeof value === 'string') {
        const presetFromMode = value === 'dark' ? 'aurora' : defaultThemePreference.preset;
        const resolvedMode = deriveMode(presetFromMode as ThemePresetId);
        return {
          mode: resolvedMode,
          preset: presetFromMode as ThemePresetId,
          font: defaultThemePreference.font,
        };
      }

      if (typeof value === 'object') {
        const record = value as Partial<{ mode: ThemeMode; preset: ThemePresetId; font: FontId }>;
        let preset: ThemePresetId = defaultThemePreference.preset;
        if (typeof record.preset === 'string' && record.preset in themePresets) {
          preset = record.preset as ThemePresetId;
        } else if (record.mode) {
          preset = record.mode === 'dark' ? 'aurora' : defaultThemePreference.preset;
        }

        const font: FontId =
          record.font && record.font in themeFonts ? (record.font as FontId) : defaultThemePreference.font;
        const resolvedMode = deriveMode(preset);

        return { mode: resolvedMode, preset, font };
      }

      return defaultThemePreference;
    },
    [deriveMode]
  );

  const loadTheme = useCallback(async () => {
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
          const mappedPreset = (legacyTheme || systemTheme) === 'dark' ? 'aurora' : defaultThemePreference.preset;
          initialPreference = {
            mode: deriveMode(mappedPreset),
            preset: mappedPreset,
            font: defaultThemePreference.font,
          };
          await updateUserTheme(userId, initialPreference);
        }
      } catch {
        // Error loading theme from Firebase - fall back to localStorage
        const legacyTheme = localStorage.getItem('theme') as ThemeMode | null;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const mappedPreset = (legacyTheme || systemTheme) === 'dark' ? 'aurora' : defaultThemePreference.preset;
        initialPreference = {
          mode: deriveMode(mappedPreset),
          preset: mappedPreset,
          font: defaultThemePreference.font,
        };
      }
    } else {
      // Not logged in - use localStorage or system preference
      const legacyTheme = localStorage.getItem('theme') as ThemeMode | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const mappedPreset = (legacyTheme || systemTheme) === 'dark' ? 'aurora' : initialPreference.preset;
      initialPreference = {
        mode: deriveMode(mappedPreset),
        preset: mappedPreset,
        font: initialPreference.font ?? defaultThemePreference.font,
      };
    }

    applyPreference(initialPreference);
  }, [applyPreference, deriveMode, sanitizePreference, userId]);

  // Load theme on mount and when user changes
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      loadTheme().catch(() => {});
    } else {
      setPreferenceState(defaultThemePreference);
    }
  }, [loadTheme]);

  const syncWithFirebase = async () => {
    if (userId) {
      await loadTheme();
    }
  };

  // Prevent hydration mismatch - render children but without context during SSR
  if (!mounted) {
    return <>{children}</>;
  }

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
      setPreset: () => {},
      setPreference: () => {},
      syncWithFirebase: async () => {},
    };
  }

  return context;
}
