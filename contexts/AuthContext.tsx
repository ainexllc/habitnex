'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signUp, signIn, signInWithGoogle, logOut, resetPassword, handleRedirectResult, getAuthErrorMessage } from '@/lib/auth';
import { createUserProfile, getUserProfile } from '@/lib/db';
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
          
          if (!profile) {
            // Create new user profile
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              preferences: {
                theme: 'light',
                weekStartsOn: 0,
                notifications: true,
                timeFormat: '12h', // Default to 12-hour format
                locale: navigator.language || 'en-US', // Auto-detect user's locale
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
      console.error('Sign out error:', error);
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