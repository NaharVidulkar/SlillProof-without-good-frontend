export interface FormattedAuthError {
  message: string;
  code?: string;
}

export function formatAuthError(err: unknown, defaultFallback = 'An unexpected error occurred.'): FormattedAuthError {
  const errorObj = err as { code?: string; message?: string };
  const code = errorObj.code;
  const rawMsg = errorObj.message || defaultFallback;

  if (!code) {
    return { message: rawMsg };
  }

  switch (code) {
    case 'auth/email-already-in-use':
      return {
        message: 'An account with this email already exists. Please sign in instead.',
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
    case 'auth/weak-password':
      return {
        message: 'Password is too weak. Please use at least 8 characters with letters and numbers.',
        code,
      };
    case 'auth/too-many-requests':
      return {
        message: 'Access temporarily disabled due to many failed login attempts. Please try again later or reset your password.',
        code,
      };
    case 'auth/invalid-email':
      return {
        message: 'Please provide a valid email address.',
        code,
      };
    case 'auth/operation-not-allowed':
      return {
        message: 'Email/Password sign-in is not enabled in Firebase Console. Please enable the Email/Password provider under Authentication → Sign-in method.',
        code,
      };
    case 'auth/popup-closed-by-user':
      return {
        message: 'Sign-in cancelled: The Google popup window was closed before completing.',
        code,
      };
    case 'auth/popup-blocked':
      return {
        message: 'Sign-in popup was blocked by the browser. Redirecting to Google...',
        code,
      };
    case 'auth/unauthorized-domain':
      return {
        message: `Unauthorized domain: This domain (${window.location.hostname}) is not yet authorized in Firebase Console under Authentication → Settings → Authorized domains.`,
        code,
      };
    default:
      return {
        message: rawMsg,
        code,
      };
  }
}
