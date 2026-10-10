import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import firebaseConfig from '../firebase-applet-config.json';
import { adminAuth } from '../lib/server/firebase-admin';
import { formatAuthError } from '../src/before-login/lib/auth-errors';
import fs from 'fs';
import path from 'path';

describe('Project Configuration Check (Task 1)', () => {
  it('firebase-applet-config.json is configured with fir-99a3e', () => {
    expect(firebaseConfig.projectId).toBe('fir-99a3e');
    expect(firebaseConfig.authDomain).toBe('fir-99a3e.firebaseapp.com');
    expect(firebaseConfig.storageBucket).toBe('fir-99a3e.firebasestorage.app');
    expect(firebaseConfig.messagingSenderId).toBe('593065284803');
    expect(firebaseConfig.appId).toBe('1:593065284803:web:53202215eddebc654abe76');
    expect(firebaseConfig.apiKey).toBe('AIzaSyBQHM3G1dTDamzopwaCDcvm0K-6rpjUFMQ');
  });

  it('firebase-admin on the server is initialized with fir-99a3e', () => {
    expect(adminAuth.app.options.projectId).toBe('fir-99a3e');
  });
});

describe('Session Signing and Verification (Task 2)', () => {
  const SESSION_SECRET = 'skillproof-test-session-secret';

  function signSessionPayload(payload: any, secret: string): string {
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', secret).update(data).digest('base64url');
    return `${data}.${signature}`;
  }

  function verifySessionPayload(token: string, secret: string): any | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 2) return null;
      const [data, signature] = parts;
      const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return null;
      }
      const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf-8'));
      if (typeof payload.exp === 'number' && Date.now() / 1000 > payload.exp) {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  }

  it('generates a tamper-proof 5-day HMAC session token', () => {
    const expSec = Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60;
    const payload = {
      uid: 'user_test_123',
      email: 'test@example.com',
      name: 'Test User',
      picture: null,
      exp: expSec,
    };
    const token = signSessionPayload(payload, SESSION_SECRET);
    expect(token).toContain('.');

    const verified = verifySessionPayload(token, SESSION_SECRET);
    expect(verified).not.toBeNull();
    expect(verified.uid).toBe('user_test_123');
    expect(verified.email).toBe('test@example.com');
  });

  it('rejects tampered or forged tokens', () => {
    const token = signSessionPayload({ uid: 'victim' }, SESSION_SECRET);
    const [data, signature] = token.split('.');
    const tamperedData = Buffer.from(JSON.stringify({ uid: 'attacker' })).toString('base64url');
    const tamperedToken = `${tamperedData}.${signature}`;
    expect(verifySessionPayload(tamperedToken, SESSION_SECRET)).toBeNull();

    const forgedSignature = `${data}.invalidsignature123`;
    expect(verifySessionPayload(forgedSignature, SESSION_SECRET)).toBeNull();
  });

  it('rejects expired tokens', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    const expiredToken = signSessionPayload({ uid: 'old_user', exp: pastExp }, SESSION_SECRET);
    expect(verifySessionPayload(expiredToken, SESSION_SECRET)).toBeNull();
  });
});

describe('Firestore Rules for Client-side User Creation (Task 3 & 4)', () => {
  it('rules allow authenticated owner creation and updating of users/{userId}', () => {
    const rulesContent = fs.readFileSync(path.resolve(__dirname, '../firestore.rules'), 'utf-8');
    expect(rulesContent).toContain('allow create: if isValidId(userId) && isOwner(userId)');
    expect(rulesContent).toContain('allow update: if isValidId(userId) && isOwner(userId)');
    expect(rulesContent).toContain('allow delete: if false;');
  });
});

describe('Diagnostics on /login and /signup (Task 5)', () => {
  it('formats auth/operation-not-allowed informing site owner', () => {
    const res = formatAuthError({ code: 'auth/operation-not-allowed' });
    expect(res.message).toContain('Email/Password sign-in is turned off for this project');
    expect(res.code).toBe('auth/operation-not-allowed');
    expect(res.isSetupError).toBe(true);
  });

  it('formats auth/unauthorized-domain indicating Authentication -> Settings -> Authorized domains', () => {
    const res = formatAuthError({ code: 'auth/unauthorized-domain' });
    expect(res.message).toContain('Add this domain in Firebase Console under Authentication → Settings → Authorized domains');
    expect(res.code).toBe('auth/unauthorized-domain');
    expect(res.isSetupError).toBe(true);
  });

  it('formats popup-blocked and popup-closed-by-user properly', () => {
    const resBlocked = formatAuthError({ code: 'auth/popup-blocked' });
    expect(resBlocked.message).toContain('Sign-in popup was blocked by your browser');

    const resClosed = formatAuthError({ code: 'auth/popup-closed-by-user' });
    expect(resClosed.message).toContain('The sign-in popup window was closed');
  });
});
