import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app: App = getApps().length
  ? getApps()[0]
  : initializeApp({
      projectId: firebaseConfig.projectId,
    });

export const adminAuth: Auth = getAuth(app);
export const adminDb: Firestore = getFirestore(app);
export { FieldValue, firebaseConfig };
export type { DecodedIdToken };
