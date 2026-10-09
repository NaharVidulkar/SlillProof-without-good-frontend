'use client'

import { motion } from 'motion/react'
import { BadgeCheck, FileCode2, GitBranch, Database, TrendingUp } from 'lucide-react'
import { Logomark } from '@bl/components/brand/logo'
import { Avatar } from '@bl/components/shared/bits'
import { Counter, ScoreRing } from '@bl/components/shared/motion'
import { student } from '@bl/lib/data'
import { easeOut } from '@bl/lib/ui'
import { cn } from '@bl/lib/utils'

function Float({
  children,
  className,
  delay,
  duration = 7,
  amplitude = 6,
}: {
  children: React.ReactNode
  className?: string
  delay: number
  duration?: number
  amplitude?: number
}) {
  return (
    <motion.div
      className={cn('absolute', className)}
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: easeOut, delay }}
    >
      <motion.div
        animate={{ y: [0, -amplitude, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.9 }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

const evidenceItems = [
  { icon: Database, label: 'SQL window functions', meta: '92%' },
  { icon: FileCode2, label: 'REST endpoint review', meta: 'Reviewed' },
  { icon: GitBranch, label: 'Git rebase workflow', meta: 'Passed' },
]

const bars = [
  { name: 'Py', v: 84 },
  { name: 'SQL', v: 61 },
  { name: 'API', v: 52 },
  { name: 'Git', v: 81 },
  { name: 'PS', v: 76 },
]

export function HeroVisual() {
  return (
    <div
      className="relative mx-auto h-[calc(520px*var(--s))] w-[calc(560px*var(--s))] [--s:0.58] min-[400px]:[--s:0.66] sm:[--s:0.9] lg:[--s:0.84] xl:[--s:1]"
      aria-hidden="true"
    >
      <div className="absolute left-0 top-0 h-[520px] w-[560px] origin-top-left scale-(--s)">
        <div className="absolute inset-6 overflow-hidden rounded-[28px] border border-black/[0.05] bg-white/40">
          <div className="absolute inset-0 bg-dots opacity-70 mask-radial-fade" />
          <div className="absolute -left-1/3 top-[-20%] h-[140%] w-24 bg-gradient-to-r from-transparent via-brand/15 to-transparent blur-xl animate-beam" />
          <div className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-3xl" />
        </div>

        <svg className="absolute inset-0 size-full overflow-visible" viewBox="0 0 560 520" fill="none">
          <motion.path
            d="M236 128 C 268 128, 262 178, 296 182"
            stroke="url(#hero-line)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: easeOut, delay: 1.4 }}
          />
          <motion.path
            d="M236 178 C 262 178, 270 250, 296 252"
            stroke="url(#hero-line)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: easeOut, delay: 1.6 }}
          />
          <motion.path
            d="M236 228 C 258 228, 262 318, 296 322"
            stroke="url(#hero-line)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: easeOut, delay: 1.8 }}
          />
          {[182, 252, 322].map((y, i) => (
            <motion.circle
              key={y}
              cx="296"
              cy={y}
              r="3.5"
              className="fill-brand"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 2.4 + i * 0.2, type: 'spring', stiffness: 300, damping: 18 }}
            />
          ))}
          <defs>
            <linearGradient id="hero-line" x1="236" x2="296" y1="0" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5046e6" stopOpacity="0.15" />
              <stop offset="1" stopColor="#5046e6" />
            </linearGradient>
          </defs>
        </svg>

        <Float className="left-0 top-[70px] w-[236px]" delay={0.5} duration={8}>
          <div className="rounded-xl border border-black/[0.07] bg-white/90 p-3 shadow-lift backdrop-blur">
            <div className="flex items-center justify-between px-1 pb-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Evidence</p>
              <span className="rounded-full bg-brand-soft px-1.5 py-0.5 font-mono text-[10px] text-brand-ink">3 new</span>
            </div>
            <ul className="flex flex-col gap-1.5">
              {evidenceItems.map((e, i) => (
                <motion.li
                  key={e.label}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.15, duration: 0.6, ease: easeOut }}
                  className="flex items-center gap-2.5 rounded-lg border border-black/[0.05] bg-[#fbfbf9] px-2.5 py-2"
                >
                  <span className="grid size-6 place-items-center rounded-md bg-white shadow-card">
                    <e.icon className="size-3.5 text-ink" />
                  </span>
                  <span className="flex-1 truncate text-[12px] font-medium text-ink">{e.label}</span>
                  <span className="font-mono text-[10px] text-verified-ink">{e.meta}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Float>

        <Float className="left-[296px] top-[96px] w-[264px]" delay={0.3} duration={9} amplitude={8}>
          <div className="relative overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-5 shadow-float">
            <div className="absolute inset-0 bg-grid-sm opacity-50 mask-top-fade" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Logomark className="size-5" />
                <span className="text-[12px] font-semibold tracking-tight text-ink">Skill Passport</span>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[10px] font-medium text-verified-ink">
                <BadgeCheck className="size-3" /> Verified
              </span>
            </div>
            <div className="relative mt-5 flex items-center gap-3">
              <Avatar initials={student.initials} className="size-10" />
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-ink">{student.name}</p>
                <p className="text-[12px] text-muted-foreground">{student.role}</p>
              </div>
            </div>
            <div className="relative mt-5 flex flex-col gap-2">
              {['Python', 'SQL', 'REST APIs', 'Git'].map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 2.4 + i * 0.12, type: 'spring', stiffness: 260, damping: 20 }}
                  className="flex items-center justify-between rounded-lg border border-black/[0.05] bg-[#fbfbf9] px-2.5 py-1.5"
                >
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink">
                    <BadgeCheck className="size-3.5 text-verified" />
                    {s}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">verified</span>
                </motion.div>
              ))}
            </div>
          </div>
        </Float>

        <Float className="left-[40px] top-[300px] w-[236px]" delay={0.7} duration={7.5}>
          <div className="rounded-xl border border-black/[0.07] bg-white p-4 shadow-lift">
            <div className="flex items-center gap-3">
              <ScoreRing value={82} size={56} stroke={5}>
                <Counter value={82} className="text-[15px] font-semibold text-ink" />
              </ScoreRing>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">SkillProof score</p>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] font-medium text-verified-ink">
                  <TrendingUp className="size-3.5" /> +6 since August
                </p>
              </div>
            </div>
            <div className="mt-4 flex h-16 items-end gap-2">
              {bars.map((b, i) => (
                <div key={b.name} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-12 w-full items-end overflow-hidden rounded-[4px] bg-black/[0.04]">
                    <motion.div
                      className={cn('w-full rounded-[4px]', i === 2 ? 'bg-gap' : 'bg-ink')}
                      initial={{ height: 0 }}
                      animate={{ height: `${b.v}%` }}
                      transition={{ delay: 1.2 + i * 0.08, duration: 0.9, ease: easeOut }}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </Float>

        <Float className="left-[330px] top-[424px]" delay={2.9} duration={6} amplitude={4}>
          <div className="flex items-center gap-2.5 rounded-full border border-black/[0.07] bg-white py-1.5 pl-1.5 pr-4 shadow-lift">
            <span className="grid size-7 place-items-center rounded-full bg-verified text-white">
              <BadgeCheck className="size-4" />
            </span>
            <span className="text-[12px] font-medium text-ink">Python verified</span>
            <span className="font-mono text-[10px] text-muted-foreground">84/100</span>
          </div>
        </Float>
      </div>
    </div>
  )
}
