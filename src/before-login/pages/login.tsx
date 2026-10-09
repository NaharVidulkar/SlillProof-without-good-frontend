import { Logomark } from '@bl/components/brand/logo';
import { SiteFooter } from '@bl/components/landing/site-footer';
import { SiteNav } from '@bl/components/landing/site-nav';
import { Link } from '@bl/lib/link';
import { buttonClass } from '@bl/lib/ui';

export function LoginPage() {
  return (
    <>
      <title>Sign in · SkillProof</title>
      <SiteNav />
      <main className="mx-auto flex min-h-[calc(100vh-180px)] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Logomark className="size-10" />
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Sign in to SkillProof</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Welcome back. Prove your skills with verifiable evidence.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                disabled
                placeholder="you@example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-ink outline-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-ink">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-border bg-muted/40 px-3.5 py-2 text-sm text-ink outline-none"
              />
            </div>
            <button
              type="button"
              disabled
              className={buttonClass({ variant: 'primary', size: 'lg', className: 'w-full opacity-60 cursor-not-allowed' })}
            >
              Sign In (Stage 2)
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Authentication will be fully connected in Stage 2.
            </p>
          </div>

          <div className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-ink underline underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

export default LoginPage;
