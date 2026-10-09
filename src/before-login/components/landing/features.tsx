'use client'

import { motion } from 'motion/react'
import { BadgeCheck, Check, FileCode2, Database, GitBranch, Sparkles, Target } from 'lucide-react'
import { SectionHeading } from '@bl/components/shared/bits'
import { Reveal } from '@bl/components/shared/motion'
import { easeOut } from '@bl/lib/ui'
import { cn } from '@bl/lib/utils'

function FeatureCopy({
  label,
  title,
  body,
  dark = false,
}: {
  label: string
  title: string
  body: string
  dark?: boolean
}) {
  return (
    <div>
      <p className={cn('font-mono text-[11px] uppercase tracking-[0.14em]', dark ? 'text-white/50' : 'text-muted-foreground')}>
        {label}
      </p>
      <h3 className={cn('mt-3 text-balance text-2xl font-semibold leading-tight tracking-[-0.03em]', dark ? 'text-white' : 'text-ink')}>
        {title}
      </h3>
      <p className={cn('mt-3 max-w-md text-pretty text-[15px] leading-relaxed', dark ? 'text-white/60' : 'text-muted-foreground')}>
        {body}
      </p>
    </div>
  )
}

function AssessmentVisual() {
  const levels = [32, 44, 52, 61, 70, 76, 82]
  return (
    <div className="relative rounded-xl border border-black/[0.07] bg-white p-4 shadow-card transition-transform duration-500 group-hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[10px] text-brand-ink">REST APIs · Q7</span>
        <span className="font-mono text-[10px] text-muted-foreground">Adaptive difficulty</span>
      </div>
      <p className="mt-3 text-[14px] font-medium leading-snug text-ink">
        Which status code should a rate-limited request return?
      </p>
      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {['400 Bad Request', '429 Too Many Requests', '503 Unavailable', '403 Forbidden'].map((o, i) => (
          <span
            key={o}
            className={cn(
              'rounded-md border px-2.5 py-1.5 text-[12px]',
              i === 1 ? 'border-brand/50 bg-brand-soft/50 text-ink' : 'border-black/[0.07] text-muted-foreground',
            )}
          >
            {o}
          </span>
        ))}
      </div>
      <div className="mt-4 flex h-12 items-end gap-1">
        {levels.map((l, i) => (
          <motion.span
            key={i}
            className={cn('flex-1 rounded-sm', i === levels.length - 1 ? 'bg-brand' : 'bg-black/[0.09]')}
            initial={{ height: 0 }}
            whileInView={{ height: `${l}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.1 + i * 0.06 }}
          />
        ))}
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground">Difficulty rises as you answer correctly</p>
    </div>
  )
}

function VerificationVisual() {
  const chain = [
    { icon: Database, label: 'Window functions challenge', meta: '92%' },
    { icon: FileCode2, label: 'Schema design review', meta: 'Reviewed' },
    { icon: GitBranch, label: 'Migration pull request', meta: 'Merged' },
  ]
  return (
    <div className="relative">
      <ul className="relative flex flex-col gap-2">
        {chain.map((c, i) => (
          <motion.li
            key={c.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.1 + i * 0.12 }}
            className="flex items-center gap-2.5 rounded-lg border border-verified/15 bg-white px-3 py-2 shadow-card transition-transform duration-300 group-hover:translate-x-1"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <c.icon className="size-4 text-ink" aria-hidden="true" />
            <span className="flex-1 truncate text-[13px] text-ink">{c.label}</span>
            <span className="font-mono text-[11px] text-verified-ink">{c.meta}</span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-verified px-3 py-2.5 text-white">
        <BadgeCheck className="size-4" aria-hidden="true" />
        <span className="text-[13px] font-medium">SQL verified at 61 / 100</span>
        <span className="ml-auto font-mono text-[10px] text-white/80">3 sources</span>
      </div>
    </div>
  )
}

function GapVisual() {
  const rows = [
    { name: 'REST APIs', c: 52, t: 70 },
    { name: 'SQL', c: 61, t: 75 },
    { name: 'Python', c: 84, t: 75 },
  ]
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((r, i) => {
        const meets = r.c >= r.t
        return (
          <li key={r.name}>
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-medium text-ink">{r.name}</span>
              <span className={cn('font-mono', meets ? 'text-verified-ink' : 'text-gap-ink')}>
                {meets ? `+${r.c - r.t} over` : `${r.t - r.c} to go`}
              </span>
            </div>
            <div className="relative mt-1.5 h-2 rounded-full bg-black/[0.05]">
              <motion.div
                className={cn('h-full rounded-full', meets ? 'bg-verified' : 'bg-gap')}
                initial={{ width: 0 }}
                whileInView={{ width: `${r.c}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: easeOut, delay: 0.15 + i * 0.1 }}
              />
              <span className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink" style={{ left: `${r.t}%` }} aria-hidden="true" />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function PlanVisual() {
  const weeks = [
    { w: 'Week 1', t: 'HTTP semantics & status codes', done: true },
    { w: 'Week 2', t: 'Build a paginated, versioned API', done: true },
    { w: 'Week 3', t: 'SQL joins & window functions', done: false, current: true },
    { w: 'Week 4', t: 'Reassess REST APIs and SQL', done: false },
  ]
  return (
    <ol className="relative flex flex-col gap-0.5">
      {weeks.map((w) => (
        <li
          key={w.w}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
            w.current ? 'bg-white/[0.08] ring-1 ring-white/10' : 'group-hover:bg-white/[0.03]',
          )}
        >
          <span
            className={cn(
              'grid size-5 shrink-0 place-items-center rounded-full border',
              w.done ? 'border-transparent bg-white text-ink' : w.current ? 'border-[#9a94ff] bg-transparent' : 'border-white/20',
            )}
          >
            {w.done ? <Check className="size-3" aria-label="Done" /> : null}
            {w.current ? <span className="size-1.5 rounded-full bg-[#9a94ff] animate-pulse-soft" /> : null}
          </span>
          <span className="w-14 shrink-0 font-mono text-[11px] text-white/45">{w.w}</span>
          <span className={cn('flex-1 text-[13px]', w.done ? 'text-white/50 line-through decoration-white/25' : 'text-white')}>
            {w.t}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Core features"
            title="Built to measure what matters, and show it."
            description="Four connected capabilities that turn practice into proof."
          />
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <article className="group relative h-full overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 transition-shadow duration-300 hover:shadow-lift sm:p-8">
              <div className="absolute inset-0 bg-grid opacity-60 mask-radial-fade" aria-hidden="true" />
              <div className="relative grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
                <FeatureCopy
                  label="AI skill assessment"
                  title="Assessments that adapt to how you think."
                  body="Role-specific questions and hands-on challenges calibrate to your level, so every answer reveals something useful."
                />
                <AssessmentVisual />
              </div>
            </article>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.08}>
            <article className="group relative h-full overflow-hidden rounded-2xl border border-verified/15 bg-[linear-gradient(170deg,#eefaf4,#fafaf8_70%)] p-6 transition-shadow duration-300 hover:shadow-lift sm:p-8">
              <FeatureCopy
                label="Evidence-based verification"
                title="Every score traces back to proof."
                body="Skills are verified only when backed by completed challenges, reviews, and real work."
              />
              <div className="mt-8">
                <VerificationVisual />
              </div>
            </article>
          </Reveal>

          <Reveal className="lg:col-span-2" delay={0.04}>
            <article className="group relative h-full overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-6 transition-shadow duration-300 hover:shadow-lift sm:p-8">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-lg border border-black/[0.07] bg-[#fbfbf9]">
                  <Target className="size-4 text-ink" aria-hidden="true" />
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">Backend Developer</span>
              </div>
              <div className="mt-6">
                <FeatureCopy
                  label="Intelligent gap analysis"
                  title="See the distance to your next role."
                  body="Compare your proficiency with real role benchmarks and know exactly what to prioritise."
                />
              </div>
              <div className="mt-8">
                <GapVisual />
              </div>
            </article>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.12}>
            <article className="group relative h-full overflow-hidden rounded-2xl bg-ink p-6 transition-shadow duration-300 hover:shadow-float sm:p-8">
              <div className="absolute -right-20 -top-24 size-80 rounded-full bg-brand/40 blur-[100px] animate-drift" aria-hidden="true" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.04)_1px,transparent_1px)] bg-[size:40px_40px] mask-radial-fade" aria-hidden="true" />
              <div className="relative grid gap-8 md:grid-cols-[1fr_1.15fr] md:items-center">
                <div>
                  <FeatureCopy
                    dark
                    label="Personalised improvement plan"
                    title="A plan built from your actual gaps."
                    body="Weekly, focused practice generated from your results — then reassess to update your Passport."
                  />
                  <p className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 font-mono text-[11px] text-white/70">
                    <Sparkles className="size-3.5 text-[#9a94ff]" aria-hidden="true" /> Est. +7 points in 4 weeks
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur">
                  <PlanVisual />
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
