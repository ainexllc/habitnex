'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signUp, signIn, signInWithGoogle, logOut, resetPassword } from '@/lib/auth';
import { createUserProfile, getUserProfile } from '@/lib/db';
import type { User as UserType } from '@/types';

interface AuthContextType {
  user: User | null;
  userProfile: UserType | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
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
              },
            });
            profile = await getUserProfile(firebaseUser.uid);
          }
          
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
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

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
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

  const value = {
    user,
    userProfile,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signInWithGoogle: handleSignInWithGoogle,
    signOut: handleSignOut,
    resetPassword: handleResetPassword,
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