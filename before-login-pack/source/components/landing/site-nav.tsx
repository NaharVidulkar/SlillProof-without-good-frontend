'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Logo } from '@/components/brand/logo'
import { cn } from '@/lib/utils'
import { buttonClass, easeOut } from '@/lib/ui'

const links = [
  { href: '#product', label: 'Product' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#passport', label: 'Skill Passport' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'border-b transition-[background-color,border-color,backdrop-filter] duration-300',
          scrolled || open
            ? 'border-black/[0.06] bg-background/75 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent',
        )}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-10">
            <Logo />
            <ul className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/60"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2 text-sm text-muted-foreground outline-none transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/60"
            >
              Sign in
            </Link>
            <Link href="/assessment/demo" className={buttonClass({ size: 'sm' })}>
              Get started
              <ArrowRight className="transition-transform duration-200 group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative grid size-10 place-items-center rounded-lg text-ink outline-none hover:bg-black/[0.04] focus-visible:ring-2 focus-visible:ring-brand/60 md:hidden"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={open ? 'x' : 'menu'}
                initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                transition={{ duration: 0.18 }}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, y: -8, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="border-b border-black/[0.06] bg-background/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col px-5 pb-6 pt-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: easeOut }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-border py-4 text-lg font-medium tracking-tight text-ink"
                  >
                    {l.label}
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </a>
                </motion.li>
              ))}
              <motion.li
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 grid grid-cols-2 gap-3"
              >
                <Link href="/dashboard" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
                  Sign in
                </Link>
                <Link href="/assessment/demo" className={buttonClass({ size: 'lg' })}>
                  Get started
                </Link>
              </motion.li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
