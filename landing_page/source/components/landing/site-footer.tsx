import Link from 'next/link'
import { Logo } from '@/components/brand/logo'

const links = [
  { href: '/#product', label: 'Product' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#passport', label: 'Skill Passport' },
  { href: '/privacy', label: 'Privacy' },
  { href: 'mailto:hello@skillprof.dev', label: 'Contact' },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.06]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Skill assessment and evidence-based verification for students and early-career developers.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="rounded text-sm text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/60"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t border-black/[0.05] px-5 py-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:justify-between sm:px-8">
        <p>© 2026 SkillProf. All rights reserved.</p>
        <p>Demo product · assessments and verification are simulated.</p>
      </div>
    </footer>
  )
}
