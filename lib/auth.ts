import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  User,
  AuthError
} from 'firebase/auth';
import { auth } from './firebase';

export const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async (usePopup: boolean = true) => {
  const provider = new GoogleAuthProvider();
  
  // Add scopes for profile and email
  provider.addScope('email');
  provider.addScope('profile');
  
  // For localhost development, use popup (works immediately)
  // For production, use redirect (better for mobile)
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  try {
    if ((usePopup && !isLocalhost) || isLocalhost) {
      // Use popup method for localhost or when requested for production
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } else {
      // Use redirect method for production when popup not requested
      await signInWithRedirect(auth, provider);
      return null; // Redirect doesn't return immediately
    }
  } catch (error: any) {
    // If popup is blocked or fails, fallback to redirect
    if (error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' ||
        error.message?.includes('Cross-Origin-Opener-Policy')) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
};

export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Auth error handling utility
export const getAuthErrorMessage = (error: any): string => {
  if (!error?.code && !error?.message) return 'An unknown error occurred';
  
  // Check for Cross-Origin-Opener-Policy error first
  if (error?.message?.includes('Cross-Origin-Opener-Policy')) {
    return 'Google sign-in popup blocked by browser policy. Using redirect instead.';
  }
  
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Using redirect instead.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please try again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};