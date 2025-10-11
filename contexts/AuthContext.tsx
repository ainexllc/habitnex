'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signUp, signIn, signInWithGoogle, logOut, resetPassword, handleRedirectResult, getAuthErrorMessage } from '@/lib/auth';
import { createUserProfile, getUserProfile } from '@/lib/db';
import { defaultThemePreference, themePresets, themeFonts } from '@/lib/theme-presets';
import type { User as UserType } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserType | null;
  loading: boolean;
  authError: string | null;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (usePopup?: boolean) => Promise<User | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result on app initialization
    const handleInitialRedirect = async () => {
      try {
        const redirectUser = await handleRedirectResult();
        if (redirectUser) {
          // Auth state change will handle profile creation
        }
      } catch (error: any) {
        setAuthError(getAuthErrorMessage(error));
      }
    };

    handleInitialRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Clear any previous auth errors on successful sign-in
        setAuthError(null);
        
        // Get or create user profile
        try {
          let profile = await getUserProfile(firebaseUser.uid);
          
          const resolveInitialTheme = () => {
            if (typeof window === 'undefined') {
              return defaultThemePreference;
            }

            const persisted = localStorage.getItem('habitnex:theme-preference');
            if (persisted) {
              try {
                const parsed = JSON.parse(persisted);
                if (
                  parsed &&
                  (parsed.mode === 'light' || parsed.mode === 'dark') &&
                  parsed.preset &&
                  parsed.preset in themePresets
                ) {
                  const font =
                    parsed.font && parsed.font in themeFonts
                      ? parsed.font
                      : defaultThemePreference.font;

                  return {
                    mode: parsed.mode,
                    preset: parsed.preset,
                    font,
                  };
                }
              } catch {
                // ignore parsing errors and fall back
              }
            }

            const legacyTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
            const systemMode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

            return {
              mode: legacyTheme || systemMode,
              preset: defaultThemePreference.preset,
              font: defaultThemePreference.font,
            };
          };

          if (!profile) {
            const themePreference = resolveInitialTheme();
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              preferences: {
                theme: themePreference,
                weekStartsOn: 0,
                notifications: true,
                timeFormat: '12h', // Default to 12-hour format
                locale: navigator.language || 'en-US', // Auto-detect user's locale
              },
            });
            profile = await getUserProfile(firebaseUser.uid);
          } else if (!profile.preferences?.theme) {
            const themePreference = resolveInitialTheme();
            await createUserProfile(firebaseUser.uid, {
              preferences: {
                theme: themePreference,
                weekStartsOn: profile.preferences?.weekStartsOn || 0,
                notifications: profile.preferences?.notifications ?? true,
                timeFormat: profile.preferences?.timeFormat || '12h',
                locale: profile.preferences?.locale || navigator.language || 'en-US',
              },
            });
            profile = await getUserProfile(firebaseUser.uid);
          }
          
          setUserProfile(profile);
          
          // Family creation is now optional - users can create families manually
          // This gives users choice and control over their data structure
        } catch (error) {
          setAuthError('Failed to load user profile');
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSignUp = async (email: string, password: string, displayName?: string) => {
    try {
      await signUp(email, password);
      // User profile will be created in the onAuthStateChanged listener
    } catch (error) {
      throw error;
    }
  };

  const handleSignIn = async (email: string, password: string) => {
    try {
      await signIn(email, password);
    } catch (error) {
      throw error;
    }
  };

  const handleSignInWithGoogle = async (usePopup?: boolean) => {
    try {
      setAuthError(null);
      const result = await signInWithGoogle(usePopup);
      return result;
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      setAuthError(errorMessage);
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear user profile immediately for faster state cleanup
      setUserProfile(null);
      await logOut();
    } catch (error) {
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await resetPassword(email);
    } catch (error) {
      throw error;
    }
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    authError,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
    clearAuthError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
