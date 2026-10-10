import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

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
  sessionToken?: string;
  error?: string;
  code?: string;
}

/**
 * Returns authorization headers containing Bearer token
 * (used as an automatic fallback when third-party cookies are partitioned or blocked in preview iframes)
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};
  try {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
        return headers;
      }
    }
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const idToken = window.sessionStorage.getItem('skillproof_id_token');
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
        return headers;
      }
      const sessionToken = window.sessionStorage.getItem('skillproof_session_token');
      if (sessionToken) {
        headers['Authorization'] = `Bearer ${sessionToken}`;
        return headers;
      }
    }
  } catch {}
  return headers;
}

/**
 * Syncs user profile document to Firestore directly from the client using the authenticated user's credentials.
 * Rules allow create and update if request.auth.uid == userId.
 * Login must NEVER fail because of this write.
 */
export async function syncUserProfileToFirestore(user: User): Promise<void> {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'Candidate',
        photoURL: user.photoURL || '',
        role: 'student',
        provider: user.providerData?.[0]?.providerId || 'password',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        onboardingCompleted: false,
        onboardingSkipped: false,
        passportPublic: false,
      });
      console.log(`[Firestore Client] Created users profile document for ${user.uid}`);
    } else {
      await updateDoc(userDocRef, {
        lastLoginAt: serverTimestamp(),
      });
      console.log(`[Firestore Client] Updated users profile lastLoginAt for ${user.uid}`);
    }
  } catch (fsErr) {
    // Non-blocking catch: Login and sign-in MUST never fail because of this write
    console.warn('[Firestore Client] User profile sync warning (non-fatal):', fsErr);
  }
}

/**
 * Exchanges Firebase user's ID token for our secure server session cookie,
 * with Authorization Bearer header fallback if cookies are blocked in iframes.
 */
export async function establishServerSession(user: User): Promise<void> {
  const idToken = await user.getIdToken();

  // Save ID token in sessionStorage for iframe Bearer fallback
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('skillproof_id_token', idToken);
    }
  } catch {}

  const response = await fetch('/api/auth/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
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

  // Save session token from server if returned
  try {
    const data = (await response.clone().json().catch(() => ({}))) as { sessionToken?: string };
    if (data.sessionToken && typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem('skillproof_session_token', data.sessionToken);
    }
  } catch {}

  // Sync users/{uid} document to Firestore using user's own credentials (never blocks login)
  await syncUserProfileToFirestore(user);
}

/**
 * Checks for a redirect sign-in result when returning from signInWithRedirect.
 * If present, establishes the server session.
 */
export async function checkRedirectResult(): Promise<User | null> {
  try {
    const cred = await getRedirectResult(auth);
    if (cred && cred.user) {
      await establishServerSession(cred.user);
      return cred.user;
    }
  } catch (err: unknown) {
    console.error('[Firebase Auth] getRedirectResult failed:', err);
    throw err;
  }
  return null;
}

/**
 * Handles Google Sign-in.
 * 1. Executes signInWithPopup (or falls back to signInWithRedirect if popup is blocked).
 * 2. Gets the fresh ID token.
 * 3. Sends POST /api/auth/session to create the secure server session cookie.
 */
export async function signInWithGoogle(): Promise<{ user: User } | void> {
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  let userCred;
  try {
    userCred = await signInWithPopup(auth, googleProvider);
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    const shouldRedirectFallback =
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/operation-not-supported-in-this-environment' ||
      (isIframe && (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/internal-error'));

    if (shouldRedirectFallback) {
      console.warn('[Firebase Auth] Popup blocked or restricted in iframe environment; initiating signInWithRedirect fallback...');
      try {
        await signInWithRedirect(auth, googleProvider);
        // Return pending promise so redirect navigation proceeds without UI flashing an error
        return new Promise(() => {});
      } catch (redirectErr) {
        console.error('[Firebase Auth] signInWithRedirect fallback failed:', redirectErr);
        throw redirectErr;
      }
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
    const authHeaders = await getAuthHeaders();
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: authHeaders,
      credentials: 'include',
    });
  } catch (err) {
    console.error('Server logout request failed:', err);
  } finally {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem('skillproof_id_token');
        window.sessionStorage.removeItem('skillproof_session_token');
      }
    } catch {}
    await firebaseSignOut(auth).catch(() => {});
    window.location.assign('/login');
  }
}
