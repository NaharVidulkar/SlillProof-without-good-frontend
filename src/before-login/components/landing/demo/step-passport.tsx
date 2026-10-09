'use client'

import { motion } from 'motion/react'
import { ArrowUpRight, BadgeCheck, CircleDashed, Link2 } from 'lucide-react'
import { Link } from '@bl/lib/link'
import { Logomark } from '@bl/components/brand/logo'
import { Avatar, QrPattern } from '@bl/components/shared/bits'
import { Counter, ScoreRing } from '@bl/components/shared/motion'
import { student, type Role } from '@bl/lib/data'
import { buttonClass, copyProfileLink, easeOut } from '@bl/lib/ui'
import { cn } from '@bl/lib/utils'

export function StepPassport({ role, answeredCorrectly }: { role: Role; answeredCorrectly: boolean }) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
      <div>
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
          className="grid size-12 place-items-center rounded-full bg-verified text-white shadow-[0_0_0_6px_var(--verified-soft)]"
        >
          <BadgeCheck className="size-6" aria-hidden="true" />
        </motion.span>
        <h3 className="mt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your Skill Passport is ready.</h3>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Every verified skill links back to the evidence behind it. Share one link with recruiters, mentors, or
          your next team.
        </p>
        {answeredCorrectly ? (
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-verified-soft px-2.5 py-1 text-[13px] text-verified-ink">
            <BadgeCheck className="size-4" aria-hidden="true" /> Your sample answer was added as evidence
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={copyProfileLink} className={buttonClass()}>
            <Link2 aria-hidden="true" /> Copy profile link
          </button>
          <Link href="/sample-passport" className={buttonClass({ variant: 'secondary' })}>
            Open full profile <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.8, ease: easeOut, delay: 0.1 }}
        className="relative"
      >
        <div className="absolute -inset-6 rounded-[32px] bg-[radial-gradient(closest-side,rgb(80_70_230/0.14),transparent)]" aria-hidden="true" />
        <article className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 shadow-float">
          <div className="absolute inset-0 bg-grid-sm opacity-50 mask-top-fade" aria-hidden="true" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logomark className="size-5" />
              <span className="text-[13px] font-semibold tracking-tight">Skill Passport</span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Demo</span>
          </div>
          <div className="relative mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar initials={student.initials} className="size-11" />
              <div>
                <p className="text-lg font-semibold tracking-tight text-ink">{student.name}</p>
                <p className="text-sm text-muted-foreground">{role.title}</p>
              </div>
            </div>
            <ScoreRing value={role.overall} size={68} stroke={5}>
              <Counter value={role.overall} className="text-lg font-semibold text-ink" />
            </ScoreRing>
          </div>
          <ul className="relative mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {role.metrics.slice(0, 4).map((m, i) => {
              const verified = m.current >= 60
              return (
                <motion.li
                  key={m.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex items-center justify-between rounded-lg border border-black/[0.06] bg-[#fbfbf9] px-3 py-2"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    {verified ? (
                      <BadgeCheck className="size-4 text-verified" aria-label="Verified" />
                    ) : (
                      <CircleDashed className="size-4 text-muted-foreground" aria-label="In progress" />
                    )}
                    {m.name}
                  </span>
                  <span className={cn('font-mono text-[11px] tabular-nums', verified ? 'text-ink' : 'text-muted-foreground')}>
                    {m.current}
                  </span>
                </motion.li>
              )
            })}
          </ul>
          <div className="relative mt-6 flex items-end justify-between border-t border-dashed border-border pt-4">
            <div className="text-[12px] text-muted-foreground">
              <p>
                <span className="font-medium text-ink">{role.metrics.filter((m) => m.current >= 60).length} verified</span> ·
                12 evidence items
              </p>
              <p className="mt-0.5 font-mono text-[11px]">Assessed Oct 7, 2026</p>
            </div>
            <QrPattern className="size-12" />
          </div>
        </article>
      </motion.div>
    </div>
  )
}
