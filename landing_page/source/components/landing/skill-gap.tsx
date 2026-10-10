'use client'

import { motion } from 'motion/react'
import { AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { DemoTag, SectionHeading } from '@/components/shared/bits'
import { Reveal } from '@/components/shared/motion'
import { getRole } from '@/lib/data'
import { easeOut } from '@/lib/ui'
import { cn } from '@/lib/utils'

type Mode = 'current' | 'target'

export function SkillGap() {
  const role = getRole('backend')
  const [mode, setMode] = useState<Mode>('current')
  const priorities = role.metrics
    .map((m) => ({ ...m, gap: m.target - m.current }))
    .filter((m) => m.gap > 0)
    .sort((a, b) => b.gap - a.gap)
  const maxGap = priorities[0]?.gap ?? 1

  return (
    <section id="skill-gap" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Skill gap analysis"
            title="Know exactly what stands between you and your next role."
            description="Your current proficiency, measured against what Backend Developer roles typically expect."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-card sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-semibold tracking-tight text-ink">Backend Developer benchmark</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Alex Morgan · 5 core skills</p>
                </div>
                <div role="tablist" aria-label="Chart emphasis" className="relative flex rounded-lg border border-black/[0.07] bg-[#f6f6f2] p-0.5">
                  {(
                    [
                      ['current', 'Current skills'],
                      ['target', 'Role requirements'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={mode === id}
                      onClick={() => setMode(id)}
                      className={cn(
                        'relative rounded-md px-3 py-1.5 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/60',
                        mode === id ? 'text-ink' : 'text-muted-foreground hover:text-ink',
                      )}
                    >
                      {mode === id ? (
                        <motion.span
                          layoutId="gap-toggle"
                          className="absolute inset-0 rounded-md bg-white shadow-card"
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className="relative">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <ul className="mt-10 flex flex-col gap-7">
                {role.metrics.map((m, i) => {
                  const meets = m.current >= m.target
                  const delta = m.current - m.target
                  const primary = mode === 'current' ? m.current : m.target
                  const marker = mode === 'current' ? m.target : m.current
                  return (
                    <li key={m.name} className="grid gap-2 sm:grid-cols-[140px_1fr_120px] sm:items-center sm:gap-5">
                      <span className="text-[15px] font-medium text-ink">{m.name}</span>
                      <div className="relative h-3 rounded-full bg-black/[0.05]">
                        <motion.div
                          className={cn(
                            'h-full rounded-full',
                            mode === 'target' ? 'bg-ink/80' : meets ? 'bg-verified' : 'bg-gap',
                          )}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${primary}%` }}
                          animate={{ width: `${primary}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: easeOut, delay: 0.1 + i * 0.08 }}
                        />
                        <motion.span
                          className={cn(
                            'absolute -top-1.5 h-6 w-[3px] -translate-x-1/2 rounded-full ring-2 ring-white',
                            mode === 'current' ? 'bg-ink' : meets ? 'bg-verified' : 'bg-gap',
                          )}
                          animate={{ left: `${marker}%` }}
                          transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                          aria-hidden="true"
                        />
                      </div>
                      <span
                        className={cn(
                          'flex items-center gap-1.5 font-mono text-[12px] sm:justify-end',
                          meets ? 'text-verified-ink' : 'text-gap-ink',
                        )}
                      >
                        {meets ? (
                          <CheckCircle2 className="size-4" aria-hidden="true" />
                        ) : (
                          <AlertTriangle className="size-4" aria-hidden="true" />
                        )}
                        {meets ? `Meets · +${delta}` : `Gap · ${Math.abs(delta)}`}
                        <span className="sr-only">
                          {`, current ${m.current}, target ${m.target}`}
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-dashed border-border pt-5 font-mono text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-verified" /> Meets target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-4 rounded-full bg-gap" /> Below target
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-[3px] rounded-full bg-ink" />
                  {mode === 'current' ? 'Role requirement' : 'Your current level'}
                </span>
                <DemoTag className="ml-auto">Sample data</DemoTag>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-black/[0.07] bg-white p-5 shadow-card sm:p-6">
                <p className="text-[13px] font-medium text-muted-foreground">Priority</p>
                <ol className="mt-4 flex flex-col gap-4">
                  {priorities.map((p, i) => (
                    <li key={p.name} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'grid size-6 shrink-0 place-items-center rounded-md font-mono text-[11px]',
                          i === 0 ? 'bg-gap text-white' : 'bg-gap-soft text-gap-ink',
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-ink">{p.name}</span>
                          <span className="font-mono text-[12px] text-gap-ink">−{p.gap}</span>
                        </div>
                        <div className="mt-1.5 h-1 rounded-full bg-black/[0.05]">
                          <motion.div
                            className="h-full rounded-full bg-gap/70"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(p.gap / maxGap) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: easeOut, delay: 0.3 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="mt-5 text-[13px] text-muted-foreground">
                  <span className="font-medium text-verified-ink">2 skills</span> already exceed the benchmark.
                </p>
              </div>

              <div className="relative flex-1 overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6">
                <div className="absolute -right-16 -top-16 size-48 rounded-full bg-brand/50 blur-3xl" aria-hidden="true" />
                <p className="relative flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">
                  <Sparkles className="size-3.5 text-[#9a94ff]" aria-hidden="true" /> Simulated insight
                </p>
                <p className="relative mt-4 text-pretty text-lg font-semibold leading-snug tracking-tight">
                  REST API design is your biggest opportunity for improvement.
                </p>
                <p className="relative mt-3 text-sm leading-relaxed text-white/60">
                  Your Python foundation is strong. Focusing on API contracts and SQL query design over the next four weeks
                  would bring you within range of every Backend Developer benchmark.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
