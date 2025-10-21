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

export const REDIRECT_STORAGE_KEY = 'habitnex:redirect-after-auth';

export interface SignInWithGoogleOptions {
  redirectPath?: string;
  forceRedirect?: boolean;
}

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

const isPopupRecoverableError = (error: any) => {
  if (!error) return false;
  const popupErrors = [
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
  ];

  return popupErrors.includes(error.code) || error.message?.includes('Cross-Origin-Opener-Policy');
};

const clearStoredRedirect = () => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
  } catch {
    // Ignore storage access issues (e.g., Safari private mode)
  }
};

const storeRedirectPath = (path: string) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(REDIRECT_STORAGE_KEY, path);
  } catch {
    // Ignore storage access issues (e.g., Safari private mode)
  }
};

export const signInWithGoogle = async (options: SignInWithGoogleOptions = {}) => {
  const { redirectPath = '/workspace?tab=overview', forceRedirect = false } = options;
  const provider = new GoogleAuthProvider();
  
  // Add scopes for profile and email
  provider.addScope('email');
  provider.addScope('profile');
  
  // For localhost development, use popup (works immediately)
  // For production, use redirect (better for mobile)
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const isMobileDevice = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent || '');
  const shouldTryPopup = !forceRedirect && (!isMobileDevice || isLocalhost);
  
  try {
    if (shouldTryPopup) {
      const result = await signInWithPopup(auth, provider);
      clearStoredRedirect();
      return result.user;
    }
  } catch (error: any) {
    // If popup is blocked or fails, fallback to redirect
    if (!isPopupRecoverableError(error)) {
      throw error;
    }
  }

  if (redirectPath) {
    storeRedirectPath(redirectPath);
  } else {
    clearStoredRedirect();
  }

  await signInWithRedirect(auth, provider);
  return null; // Redirect doesn't return immediately
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
    case 'auth/unauthorized-domain':
    case 'auth/domain-not-authorized':
      return 'This domain is not authorized for Google sign-in. Please verify the Firebase Auth configuration.';
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
