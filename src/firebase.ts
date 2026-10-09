import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export interface AuthSessionResponse {
  ok: boolean;
  user?: {
    uid: string;
    email?: string | null;
    name?: string | null;
    photoURL?: string | null;
  };
  error?: string;
  code?: string;
}

/**
 * Exchanges Firebase user's ID token for our secure server session cookie.
 */
async function establishServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ idToken }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      message?: string;
    };
    await firebaseSignOut(auth).catch(() => {});
    const errorObj = new Error(
      data.message || data.error || `Server session establishment failed (${response.status})`
    ) as Error & { code?: string };
    if (data.code) {
      errorObj.code = data.code;
    }
    throw errorObj;
  }
}

/**
 * Handles Google Sign-in.
 * 1. Executes signInWithPopup (or falls back to signInWithRedirect if popup is blocked).
 * 2. Gets the fresh ID token.
 * 3. Sends POST /api/auth/session to create the secure server session cookie.
 */
export async function signInWithGoogle(): Promise<{ user: User }> {
  let userCred;
  try {
    userCred = await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/operation-not-supported-in-this-environment'
    ) {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('Redirecting to Google Sign-in...');
    }
    throw err;
  }

  await establishServerSession(userCred.user);
  return { user: userCred.user };
}

/**
 * Signs in a user with email and password.
 */
export async function signInWithEmail(email: string, password: string): Promise<{ user: User }> {
  const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
  await establishServerSession(userCred.user);
  return { user: userCred.user };
}

/**
 * Creates a new user account with email and password.
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ user: User }> {
  const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await establishServerSession(userCred.user);
  return { user: userCred.user };
}

/**
 * Sends a password reset email.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Logs out the user from both server session and client Firebase Auth.
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (err) {
    console.error('Server logout request failed:', err);
  } finally {
    await firebaseSignOut(auth).catch(() => {});
    window.location.assign('/login');
  }
}
