'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateUserTheme } from '@/lib/db';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  syncWithFirebase: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
    }
  }, [userId]);

  const loadTheme = async () => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return;
    }
    
    let initialTheme: Theme = 'light';
    
    // First priority: Firebase (if user is logged in)
    if (userId) {
      try {
        const profile = await getUserProfile(userId);
        if (profile?.preferences?.theme) {
          initialTheme = profile.preferences.theme;
        } else {
          // If no theme in Firebase, check localStorage
          const savedTheme = localStorage.getItem('theme') as Theme | null;
          if (savedTheme) {
            initialTheme = savedTheme;
            // Save to Firebase for future
            await updateUserTheme(userId, savedTheme);
          } else {
            // Fall back to system preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            initialTheme = systemTheme;
            await updateUserTheme(userId, systemTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme from Firebase:', error);
        // Fall back to localStorage if Firebase fails
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
    } else {
      // Not logged in - use localStorage or system preference
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      initialTheme = savedTheme || systemTheme;
    }
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
  };

  const applyTheme = (newTheme: Theme) => {
    if (typeof window === 'undefined') {
      return;
    }
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
    applyTheme(newTheme);
    
    // Sync with Firebase if user is logged in
    if (userId) {
      try {
        await updateUserTheme(userId, newTheme);
      } catch (error) {
        console.error('Error syncing theme to Firebase:', error);
      }
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
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

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, syncWithFirebase }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  // During SSR or before ThemeProvider mounts, return a fallback
  if (context === undefined) {
    return {
      theme: 'light' as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      syncWithFirebase: async () => {}
    };
  }

  return context;
}