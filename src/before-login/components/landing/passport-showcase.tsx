'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, BadgeCheck, Eye, Link2, ShieldCheck, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Eyebrow } from '@/components/shared/bits'
import { Reveal } from '@/components/shared/motion'
import { PassportCard } from '@/components/shared/passport-card'
import { evidence, passportSkills, student } from '@/lib/data'
import { buttonClass, copyProfileLink, easeOut } from '@/lib/ui'

function SampleProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      prev?.focus()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close sample profile"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sample-profile-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-black/[0.08] bg-background shadow-float sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/[0.06] bg-background/90 px-6 py-4 backdrop-blur">
              <div>
                <p id="sample-profile-title" className="text-[15px] font-semibold tracking-tight text-ink">
                  Sample profile
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">skillprof.dev/passport/demo</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className={buttonClass({ variant: 'ghost', size: 'sm', className: 'size-8 px-0' })}
                aria-label="Close"
              >
                <X aria-hidden="true" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-ink">{student.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.role} · {student.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-semibold tracking-tight text-ink">
                    {student.score}
                    <span className="text-base text-muted-foreground">/100</span>
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">Overall score</p>
                </div>
              </div>
              <h3 className="mt-8 text-[13px] font-medium text-muted-foreground">Skills</h3>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border bg-white">
                {passportSkills.map((s) => (
                  <li key={s.name} className="flex items-center gap-3 px-4 py-3">
                    <BadgeCheck
                      className={s.status === 'verified' ? 'size-4 text-verified' : 'size-4 text-muted-foreground'}
                      aria-label={s.status === 'verified' ? 'Verified' : 'In progress'}
                    />
                    <span className="flex-1 text-sm font-medium text-ink">{s.name}</span>
                    <span className="hidden text-[12px] text-muted-foreground sm:inline">{s.evidenceCount} evidence</span>
                    <span className="w-20 text-right text-[12px] text-muted-foreground">{s.level}</span>
                    <span className="w-8 text-right font-mono text-sm tabular-nums text-ink">{s.score}</span>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 text-[13px] font-medium text-muted-foreground">Recent evidence</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {evidence.map((e) => (
                  <li key={e.title} className="rounded-lg border border-border bg-white px-3.5 py-3">
                    <p className="text-sm font-medium text-ink">{e.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {e.skill} · {e.type} · {e.result}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/passport/demo" className={buttonClass()}>
                  Open full profile <ArrowUpRight aria-hidden="true" />
                </Link>
                <button type="button" onClick={copyProfileLink} className={buttonClass({ variant: 'secondary' })}>
                  <Link2 aria-hidden="true" /> Copy link
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export function PassportShowcase() {
  const [open, setOpen] = useState(false)

  return (
    <section id="passport" className="relative overflow-hidden py-20 sm:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid mask-radial-fade" />
        <div className="absolute left-[55%] top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(80_70_230/0.16),transparent)] animate-drift" />
        <div className="absolute left-[70%] top-[65%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.1),transparent)] animate-drift-slow" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
        <Reveal>
          <Eyebrow>Skill Passport</Eyebrow>
          <h2 className="mt-4 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-ink sm:text-[3.5rem]">
            Proof you can carry anywhere.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
            Every demonstrated skill, supported by evidence. One profile you can share with the world.
          </p>
          <ul className="mt-8 flex flex-col gap-3 text-[15px] text-ink">
            {[
              'Scores linked to the challenges behind them',
              'Clear verified and in-progress states',
              'Updates automatically as you reassess',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-verified-ink" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <button type="button" onClick={copyProfileLink} className={buttonClass({ size: 'lg' })}>
              <Link2 aria-hidden="true" /> Copy profile link
            </button>
            <button type="button" onClick={() => setOpen(true)} className={buttonClass({ variant: 'secondary', size: 'lg' })}>
              <Eye aria-hidden="true" /> View sample profile
            </button>
          </div>
        </Reveal>

        <motion.div
          initial={{ opacity: 0, y: 32, rotateX: 8 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: easeOut }}
          className="[perspective:1400px]"
        >
          <PassportCard tilt className="mx-auto max-w-[520px]" />
        </motion.div>
      </div>

      <SampleProfileModal open={open} onClose={() => setOpen(false)} />
    </section>
  )
}
