/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { store } from './store.ts';
import { adminDb, FieldValue } from './firebase-admin.ts';

export interface UserRecord {
  id?: string;
  uid: string;
  email?: string | null;
  name?: string | null;
  photoURL?: string | null;
  role?: string;
  provider?: string;
  createdAt?: string;
  lastLoginAt?: string;
  onboardingCompleted?: boolean;
  onboardingSkipped?: boolean;
  passportPublic?: boolean;
  profile?: {
    role?: string;
    fieldOfStudy?: string;
    yearsOfExperience?: number;
    summary?: string;
  } | null;
  skills?: Array<{
    name: string;
    slug?: string;
    category?: string;
    level?: string;
    claimedLevel?: string;
    verified?: boolean;
    score?: number | null;
    tier?: string | null;
    verifiedAt?: string | null;
  }>;
  laterSkills?: Array<{
    name: string;
    slug?: string;
    category?: string;
    level?: string;
    claimedLevel?: string;
  }>;
  lastAssessmentScore?: number | null;
  lastAssessmentBadge?: string | null;
  updatedAt?: string;
}

// Cached check for Firestore Admin availability
let firestoreAdminChecked = false;
let firestoreAdminAvailable = false;

export async function isFirestoreAdminAvailable(): Promise<boolean> {
  if (firestoreAdminChecked) {
    return firestoreAdminAvailable;
  }
  firestoreAdminChecked = true;

  // Only attempt Firestore Admin operations if an explicit service account key or credential file is provided.
  // Ambient cloud environments without project-specific IAM roles will encounter PERMISSION_DENIED.
  const hasCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  );

  if (!hasCredentials) {
    firestoreAdminAvailable = false;
    return false;
  }

  try {
    const testDoc = adminDb.collection('_health').doc('check');
    await Promise.race([
      testDoc.get(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
    ]);
    firestoreAdminAvailable = true;
  } catch (_err) {
    firestoreAdminAvailable = false;
  }
  return firestoreAdminAvailable;
}

/**
 * Gets a user document by UID from store, optionally falling back to Firestore if available.
 */
export async function getUserRecord(uid: string): Promise<UserRecord | null> {
  if (!uid) return null;

  // 1. Primary lookup in store
  const stored = await store.get<UserRecord>('users', uid);
  if (stored) {
    return stored;
  }

  // 2. If not found in store, check Firestore Admin if available
  const fsOk = await isFirestoreAdminAvailable();
  if (fsOk) {
    try {
      const snap = await adminDb.collection('users').doc(uid).get();
      if (snap.exists) {
        const data = snap.data() as UserRecord;
        const normalized: UserRecord = {
          ...data,
          uid,
          id: uid,
        };
        await store.put('users', uid, normalized);
        return normalized;
      }
    } catch {}
  }

  return null;
}

/**
 * Saves or updates a user document in store and mirrors to Firestore Admin if available.
 */
export async function saveUserRecord(uid: string, patch: Partial<UserRecord>): Promise<UserRecord> {
  if (!uid) {
    throw new Error('User UID is required to save user record');
  }

  const existing = (await store.get<UserRecord>('users', uid)) || { uid, id: uid };
  const merged: UserRecord = {
    ...existing,
    ...patch,
    uid,
    id: uid,
    updatedAt: new Date().toISOString(),
  };

  // 1. Persist to atomic local store
  await store.put('users', uid, merged);

  // 2. Mirror to Firestore Admin in background if available
  const fsOk = await isFirestoreAdminAvailable();
  if (fsOk) {
    try {
      const fsData: Record<string, any> = { ...patch, updatedAt: FieldValue.serverTimestamp() };
      await adminDb.collection('users').doc(uid).set(fsData, { merge: true });
    } catch (fsErr: any) {
      // Non-fatal warning only if not permission denied
      const msg = fsErr?.message || String(fsErr);
      if (!msg.includes('PERMISSION_DENIED') && !msg.includes('7')) {
        console.warn('[Firestore Admin] Mirror write warning:', fsErr);
      }
    }
  }

  return merged;
}

/**
 * Syncs assessment section record to Firestore subcollection if Firestore Admin is available.
 */
export async function syncSectionToFirestore(
  userId: string,
  skillSlug: string,
  sectionData: Record<string, any>
): Promise<void> {
  const fsOk = await isFirestoreAdminAvailable();
  if (!fsOk) return;

  try {
    await adminDb
      .collection('users')
      .doc(userId)
      .collection('assessmentSections')
      .doc(skillSlug)
      .set(
        {
          ...sectionData,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  } catch (fsErr: any) {
    const msg = fsErr?.message || String(fsErr);
    if (!msg.includes('PERMISSION_DENIED') && !msg.includes('7')) {
      console.warn('[Firestore Admin] Section sync warning:', fsErr);
    }
  }
}

/**
 * Saves CV analysis result to store and mirrors to users/{uid}/analysis/latest in Firestore.
 */
export async function saveAnalysisRecord(
  userId: string,
  analysisData: Record<string, any>
): Promise<void> {
  const key = `${userId}_latest`;
  const recordWithMeta = {
    ...analysisData,
    userId,
    updatedAt: new Date().toISOString(),
  };

  // 1. Save to store
  await store.put('user_analysis', key, recordWithMeta);

  // 2. Mirror to Firestore Admin if available
  const fsOk = await isFirestoreAdminAvailable();
  if (fsOk) {
    try {
      await adminDb
        .collection('users')
        .doc(userId)
        .collection('analysis')
        .doc('latest')
        .set(
          {
            ...analysisData,
            updatedAt: FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      console.log(`[Firestore Admin] Saved analysis to users/${userId}/analysis/latest`);
    } catch (fsErr: any) {
      const msg = fsErr?.message || String(fsErr);
      if (!msg.includes('PERMISSION_DENIED') && !msg.includes('7')) {
        console.warn('[Firestore Admin] Analysis write warning:', fsErr);
      }
    }
  }
}

/**
 * Retrieves latest CV analysis record from store or Firestore Admin.
 */
export async function getLatestAnalysisRecord(userId: string): Promise<any | null> {
  if (!userId) return null;
  const fromStore = await store.get<any>('user_analysis', `${userId}_latest`);
  if (fromStore) return fromStore;

  const fsOk = await isFirestoreAdminAvailable();
  if (fsOk) {
    try {
      const snap = await adminDb
        .collection('users')
        .doc(userId)
        .collection('analysis')
        .doc('latest')
        .get();
      if (snap.exists) {
        return snap.data();
      }
    } catch {}
  }
  return null;
}

