/**
 * AuthContext - Firebase Authentication for Desktop (macOS / Windows)
 *
 * Uses Firebase JS SDK (`firebase/auth`) instead of native @react-native-firebase/auth.
 * Google Sign-In uses the PKCE OAuth flow via WebAuth native module.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  onAuthStateChanged,
  type Auth,
  type User,
  // @ts-expect-error – getReactNativePersistence is exported at runtime
  getReactNativePersistence,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@/config/env';
import { signInWithGoogleOAuth } from '@/services/googleAuth';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isReady: boolean;
  token: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Lazy Firebase initialization
let app: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

function getFirebaseAuth(): Auth | null {
  if (!FIREBASE_CONFIG.apiKey) return null;
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
    firebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
  return firebaseAuth;
}

function toAuthUser(firebaseUser: User | null): AuthUser | null {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    isAnonymous: firebaseUser.isAnonymous,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [rawUser, setRawUser] = useState<User | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setIsLoading(false);
      setIsReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(toAuthUser(firebaseUser));
      setRawUser(firebaseUser);

      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);
        } catch (error) {
          console.error('[Auth] Error getting ID token:', error);
          setToken(null);
        }
      } else {
        setToken(null);
      }

      setIsLoading(false);
      setIsReady(true);
    });

    return unsubscribe;
  }, []);

  // Refresh token periodically (Firebase tokens expire after 1 hour)
  useEffect(() => {
    if (!rawUser) return;

    const refreshInterval = setInterval(async () => {
      try {
        const newToken = await rawUser.getIdToken(true);
        setToken(newToken);
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes

    return () => clearInterval(refreshInterval);
  }, [rawUser]);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    setIsLoading(true);
    try {
      const credential = await signInWithGoogleOAuth();
      if (credential) {
        await signInWithCredential(auth, credential);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendPasswordResetEmail = useCallback(async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error('Firebase not configured');
    await firebaseSendPasswordResetEmail(auth, email);
  }, []);

  const refreshToken = useCallback(async () => {
    if (!rawUser) return null;
    try {
      const newToken = await rawUser.getIdToken(true);
      setToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }, [rawUser]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isLoading,
    isReady,
    token,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    refreshToken,
  }), [
    user,
    isLoading,
    isReady,
    token,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    refreshToken,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
