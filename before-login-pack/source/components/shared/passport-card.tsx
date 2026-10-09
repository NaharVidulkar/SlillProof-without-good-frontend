'use client'

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { BadgeCheck, CircleDashed } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Logomark } from '@/components/brand/logo'
import { Avatar, QrPattern } from '@/components/shared/bits'
import { Counter, ScoreRing } from '@/components/shared/motion'
import { passportSkills, student } from '@/lib/data'
import { cn } from '@/lib/utils'
import { easeOut } from '@/lib/ui'

function VerifiedSeal({ className }: { className?: string }) {
  return (
    <div className={cn('relative grid size-16 place-items-center', className)} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full">
        <defs>
          <path id="seal-circle" d="M32 32 m-24 0 a24 24 0 1 1 48 0 a24 24 0 1 1 -48 0" />
        </defs>
        <circle cx="32" cy="32" r="30.5" fill="none" stroke="currentColor" className="text-verified/30" strokeDasharray="2 3" />
        <text className="fill-verified-ink font-mono text-[6.2px] uppercase tracking-[0.32em]">
          <textPath href="#seal-circle">Evidence verified · SkillProf ·</textPath>
        </text>
      </svg>
      <span className="grid size-7 place-items-center rounded-full bg-verified text-white shadow-[0_0_0_4px_var(--verified-soft)]">
        <BadgeCheck className="size-4" />
      </span>
    </div>
  )
}

export function PassportCard({
  variant = 'full',
  tilt = false,
  className,
}: {
  variant?: 'full' | 'compact'
  tilt?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const [canTilt, setCanTilt] = useState(false)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 160, damping: 18 })
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 160, damping: 18 })
  const glareX = useTransform(mx, [-0.5, 0.5], ['20%', '80%'])
  const glareY = useTransform(my, [-0.5, 0.5], ['15%', '85%'])
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, rgba(255,255,255,0.9), transparent 45%)`,
  )

  useEffect(() => {
    if (!tilt) return
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanTilt(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [tilt])

  const tiltEnabled = tilt && canTilt && !reduce
  const compact = variant === 'compact'
  const skills = compact ? passportSkills.slice(0, 4) : passportSkills
  const verifiedCount = passportSkills.filter((s) => s.status === 'verified').length
  const evidenceTotal = passportSkills.reduce((n, s) => n + s.evidenceCount, 0)

  return (
    <div className={cn('[perspective:1400px]', className)}>
      <motion.article
        aria-label={`Skill Passport for ${student.name}`}
        onPointerMove={(e) => {
          if (!tiltEnabled) return
          const rect = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - rect.left) / rect.width - 0.5)
          my.set((e.clientY - rect.top) / rect.height - 0.5)
        }}
        onPointerLeave={() => {
          mx.set(0)
          my.set(0)
        }}
        style={tiltEnabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : undefined}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-float',
          compact ? 'p-5' : 'p-6 sm:p-8',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-sm opacity-60 mask-top-fade" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-brand/10 blur-3xl"
          aria-hidden="true"
        />
        {tiltEnabled ? (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light"
            style={{ background: glare }}
          />
        ) : null}

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Logomark className="size-6" />
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-ink">Skill Passport</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {student.passportId}
              </p>
            </div>
          </div>
          {compact ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified-ink">
              <BadgeCheck className="size-3.5" aria-hidden="true" /> Verified
            </span>
          ) : (
            <VerifiedSeal className="-mr-1 -mt-1" />
          )}
        </div>

        <div className={cn('relative flex items-end justify-between gap-4', compact ? 'mt-5' : 'mt-8')}>
          <div className="flex items-center gap-3">
            <Avatar initials={student.initials} className={compact ? 'size-10' : 'size-12'} />
            <div>
              <p className={cn('font-semibold tracking-[-0.03em] text-ink', compact ? 'text-lg' : 'text-2xl')}>
                {student.name}
              </p>
              <p className="text-sm text-muted-foreground">{student.role}</p>
            </div>
          </div>
          <ScoreRing value={student.score} size={compact ? 64 : 84} stroke={compact ? 5 : 6}>
            <div className="text-center leading-none">
              <Counter value={student.score} className={cn('font-semibold tracking-tight text-ink', compact ? 'text-lg' : 'text-2xl')} />
              <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">/ 100</p>
            </div>
          </ScoreRing>
        </div>

        <ul className={cn('relative grid gap-2.5', compact ? 'mt-5' : 'mt-8')}>
          {skills.map((s, i) => (
            <li key={s.name} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5">
              <div className="flex items-center gap-2">
                {s.status === 'verified' ? (
                  <BadgeCheck className="size-4 text-verified" aria-label="Verified" />
                ) : (
                  <CircleDashed className="size-4 text-muted-foreground" aria-label="In progress" />
                )}
                <span className="text-sm font-medium text-ink">{s.name}</span>
                {!compact ? (
                  <span className="hidden text-xs text-muted-foreground sm:inline">· {s.level}</span>
                ) : null}
              </div>
              <span className="font-mono text-xs tabular-nums text-ink">{s.score}</span>
              <div className="col-span-2 h-1 overflow-hidden rounded-full bg-black/[0.06]">
                <motion.div
                  className={cn('h-full rounded-full', s.status === 'verified' ? 'bg-ink' : 'bg-[#bdbcb5]')}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${s.score}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: easeOut, delay: 0.15 + i * 0.07 }}
                />
              </div>
            </li>
          ))}
        </ul>

        <div
          className={cn(
            'relative flex items-end justify-between gap-4 border-t border-dashed border-border',
            compact ? 'mt-5 pt-4' : 'mt-8 pt-6',
          )}
        >
          <dl className={cn('grid gap-x-6 gap-y-3', compact ? 'grid-cols-2' : 'grid-cols-3')}>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Verified</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{verifiedCount} skills</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Evidence</dt>
              <dd className="mt-0.5 text-sm font-medium text-ink">{evidenceTotal} items</dd>
            </div>
            {!compact ? (
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Assessed</dt>
                <dd className="mt-0.5 text-sm font-medium text-ink">{student.lastAssessed}</dd>
              </div>
            ) : null}
          </dl>
          <div className="flex flex-col items-center gap-1">
            <div className="rounded-md border border-border bg-white p-1.5">
              <QrPattern className={compact ? 'size-11' : 'size-14'} />
            </div>
            <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted-foreground">Demo code</span>
          </div>
        </div>
      </motion.article>
    </div>
  )
}
