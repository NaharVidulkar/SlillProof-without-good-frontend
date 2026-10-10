import React, { useState } from 'react';
import { Copy, Check, AlertTriangle, ShieldAlert } from 'lucide-react';

export interface FormattedAuthError {
  message: string;
  code?: string;
  domain?: string;
  isSetupError?: boolean;
}

/**
 * Checks whether the current runtime is a development or preview environment.
 * Evaluates localhost, ais-dev, ais-pre, Cloud Run preview hostnames, and Vite dev mode.
 */
export function isDevOrPreviewEnvironment(): boolean {
  // Support Vite / Node test environment
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    return true;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    return true;
  }
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('ais-dev') ||
    hostname.includes('ais-pre') ||
    hostname.endsWith('.run.app')
  );
}

/**
 * Formats Firebase Authentication errors with friendly, actionable diagnostics.
 * In production, setup-related errors show a friendly temporary downtime message
 * while logging the real technical error code to console.
 */
export function formatAuthError(err: unknown, defaultFallback = 'An unexpected error occurred.'): FormattedAuthError {
  const errorObj = err as { code?: string; message?: string };
  const code = errorObj?.code;
  const rawMsg = errorObj?.message || defaultFallback;
  const isDevOrPreview = isDevOrPreviewEnvironment();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  if (!code) {
    return { message: rawMsg };
  }

  // Always log the actual Firebase error code to console for debugging
  console.warn(`[Firebase Auth] Error code: ${code} | Message: ${rawMsg}`);

  switch (code) {
    case 'auth/operation-not-allowed': {
      if (!isDevOrPreview) {
        console.error('[Firebase Auth] auth/operation-not-allowed in production environment.');
        return {
          message: 'Sign-in is temporarily unavailable, please try again later.',
          code,
          isSetupError: true,
        };
      }
      return {
        message: 'Email/Password sign-in is turned off for this project. The site owner needs to enable it in Firebase Console.',
        code,
        isSetupError: true,
      };
    }

    case 'auth/unauthorized-domain': {
      if (!isDevOrPreview) {
        console.error(`[Firebase Auth] auth/unauthorized-domain for ${currentHostname} in production environment.`);
        return {
          message: 'Sign-in is temporarily unavailable, please try again later.',
          code,
          isSetupError: true,
        };
      }
      return {
        message: 'Add this domain in Firebase Console under Authentication → Settings → Authorized domains.',
        code,
        domain: currentHostname,
        isSetupError: true,
      };
    }

    case 'auth/popup-blocked':
      return {
        message: 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again, or continue via redirect.',
        code,
      };

    case 'auth/popup-closed-by-user':
      return {
        message: 'The sign-in popup window was closed before completing. Please allow popups and try again without closing the window.',
        code,
      };

    case 'auth/network-request-failed':
      return {
        message: 'A network error occurred. Please check your internet connection and try again.',
        code,
      };

    case 'auth/too-many-requests':
      return {
        message: 'Access temporarily disabled due to too many failed attempts. Please try again later or reset your password.',
        code,
      };

    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return {
        message: 'Incorrect email or password. Please verify your credentials and try again.',
        code,
      };

    case 'auth/user-not-found':
      return {
        message: 'No account found with this email address. Please create an account first.',
        code,
      };

    case 'auth/email-already-in-use':
      return {
        message: 'An account with this email already exists. Please sign in instead.',
        code,
      };

    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please use at least 8 characters with a mix of letters and numbers.',
        code,
      };

    case 'auth/invalid-email':
      return {
        message: 'Please provide a valid email address.',
        code,
      };

    case 'auth/user-disabled':
      return {
        message: 'This account has been disabled. Please contact support.',
        code,
      };

    default: {
      // If code starts with auth/ and we are in production and it looks like a configuration issue:
      if (!isDevOrPreview && (code.includes('configuration') || code.includes('admin') || code.includes('internal-error'))) {
        console.error(`[Firebase Auth] Internal/configuration error in production: ${code}`);
        return {
          message: 'Sign-in is temporarily unavailable, please try again later.',
          code,
        };
      }
      return {
        message: rawMsg,
        code,
      };
    }
  }
}

/**
 * Reusable alert component for displaying authentication errors with diagnostic badges,
 * copyable domain box for auth/unauthorized-domain, and technical error code display.
 */
export function AuthErrorAlert({ error }: { error: FormattedAuthError | null }) {
  const [copied, setCopied] = useState(false);

  if (!error) return null;

  const handleCopyDomain = async (domainText: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(domainText);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = domainText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy domain to clipboard:', err);
    }
  };

  const isSetupAlert = Boolean(error.isSetupError || error.domain);

  return (
    <div
      role="alert"
      className={`mt-6 rounded-xl border p-4 text-xs leading-relaxed transition-all shadow-2xs ${
        isSetupAlert
          ? 'border-amber-300 bg-amber-50/90 text-amber-900'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      <div className="flex items-center gap-1.5 font-semibold mb-1">
        {isSetupAlert ? (
          <>
            <ShieldAlert className="size-4 text-amber-700 shrink-0" />
            <span className="text-amber-900 font-bold">Firebase Configuration Notice</span>
          </>
        ) : (
          <>
            <AlertTriangle className="size-4 text-red-700 shrink-0" />
            <span className="text-red-800 font-bold">Authentication Error</span>
          </>
        )}
      </div>

      <p className="mt-1 text-[13px]">{error.message}</p>

      {error.domain && (
        <div className="mt-3 pt-2.5 border-t border-amber-200/80">
          <div className="text-[11px] font-medium text-amber-900 mb-1.5">
            Current domain to authorize in Firebase Console:
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-300/90 bg-white p-2 font-mono text-xs text-amber-950 shadow-2xs">
            <span className="truncate select-all font-semibold pl-1">{error.domain}</span>
            <button
              type="button"
              onClick={() => handleCopyDomain(error.domain!)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 px-2.5 py-1 text-xs font-sans font-medium transition-colors cursor-pointer border border-amber-300/80 active:scale-95"
              title="Copy hostname to clipboard"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5 text-amber-800" />
                  <span>Copy domain</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error.code && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="font-mono text-[11px] text-slate-600 bg-black/[0.05] border border-black/[0.08] px-2 py-0.5 rounded inline-block">
            Code: <strong className="font-semibold text-slate-800">{error.code}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
