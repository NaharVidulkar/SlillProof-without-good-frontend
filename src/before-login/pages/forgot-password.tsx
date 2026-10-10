import React, { useState } from 'react';
import { Logomark } from '@bl/components/brand/logo';
import { SiteFooter } from '@bl/components/landing/site-footer';
import { SiteNav } from '@bl/components/landing/site-nav';
import { Link } from '@bl/lib/link';
import { buttonClass } from '@bl/lib/ui';
import { sendPasswordReset } from '../../firebase';
import { formatAuthError, FormattedAuthError, AuthErrorAlert } from '../lib/auth-errors';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FormattedAuthError | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSentSuccess(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError({ message: 'Please enter your email address.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError({ message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setLoading(true);
      await sendPasswordReset(trimmedEmail);
      setSentSuccess(true);
    } catch (err: unknown) {
      console.error('Password reset error:', err);
      setError(formatAuthError(err, 'Failed to send password reset email. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <title>Reset Password · SkillProof</title>
      <SiteNav />
      <main className="mx-auto flex min-h-[calc(100vh-180px)] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logomark className="size-10" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Reset Password</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Enter your email address to receive password reset instructions.
            </p>
          </div>

          {sentSuccess && (
            <div
              role="status"
              className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 leading-relaxed"
            >
              <div className="font-semibold text-emerald-900 mb-0.5">Password reset link sent!</div>
              <p>We sent a reset link to <span className="font-semibold">{email}</span>. Please check your inbox and spam folder.</p>
            </div>
          )}

          <AuthErrorAlert error={error} />

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="reset-email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-ink outline-none transition focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={buttonClass({
                variant: 'primary',
                size: 'lg',
                className: 'w-full flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50',
              })}
            >
              {loading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : null}
              <span>{loading ? 'Sending link...' : 'Send Reset Link'}</span>
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/login" className="font-medium text-ink underline underline-offset-4">
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default ForgotPasswordPage;
