'use client'

import { motion } from 'motion/react'
import {
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  FileCode2,
  GitBranch,
  LayoutGrid,
  Database,
  Map as MapIcon,
  Plus,
  Search,
  Terminal,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { Logomark } from '@bl/components/brand/logo'
import { Avatar, SectionHeading } from '@bl/components/shared/bits'
import { Counter, Reveal, ScoreRing } from '@bl/components/shared/motion'
import { getRole, student } from '@bl/lib/data'
import { easeOut } from '@bl/lib/ui'
import { cn } from '@bl/lib/utils'

const sideNav: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: LayoutGrid, label: 'Overview', active: true },
  { icon: ClipboardCheck, label: 'Assessments' },
  { icon: BarChart3, label: 'Skill gaps' },
  { icon: MapIcon, label: 'Improvement plan' },
  { icon: BadgeCheck, label: 'Skill Passport' },
]

const evidenceRows = [
  { icon: Database, title: 'Window functions challenge', skill: 'SQL', result: '92%' },
  { icon: Terminal, title: 'Async job processor', skill: 'Python', result: '88%' },
  { icon: FileCode2, title: 'Paginated REST endpoint', skill: 'REST APIs', result: 'Reviewed' },
  { icon: GitBranch, title: 'Rebase & conflict resolution', skill: 'Git', result: 'Passed' },
]

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-black/[0.06] bg-white p-4 shadow-card transition-[box-shadow,border-color] duration-300 hover:border-black/[0.1] hover:shadow-lift',
        className,
      )}
    >
      {children}
    </div>
  )
}

function PanelLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <p className="text-[12px] font-medium text-muted-foreground">{children}</p>
      {right}
    </div>
  )
}

export function ProductPreview() {
  const role = getRole('backend')

  return (
    <section id="product" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="Product"
            title="One calm workspace for everything you can prove."
            description="Scores, evidence, and gaps live side by side, so you always know where you stand and what to work on next."
          />
        </Reveal>

        <Reveal delay={0.1} className="mt-14">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-x-10 -top-10 bottom-0 rounded-[40px] bg-[radial-gradient(ellipse_at_top,rgb(80_70_230/0.12),transparent_60%)]"
              aria-hidden="true"
            />
            <figure
              className="relative overflow-hidden rounded-2xl border border-black/[0.08] bg-[#f7f7f4] shadow-float"
              aria-label="SkillProof dashboard preview with demo data"
            >
              <div className="flex items-center gap-3 border-b border-black/[0.06] bg-white/70 px-4 py-2.5">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="size-2.5 rounded-full bg-[#e3e2dc]" />
                  <span className="size-2.5 rounded-full bg-[#e3e2dc]" />
                  <span className="size-2.5 rounded-full bg-[#e3e2dc]" />
                </div>
                <div className="mx-auto flex h-6 w-full max-w-xs items-center justify-center gap-1.5 rounded-md bg-black/[0.04] font-mono text-[11px] text-muted-foreground">
                  app.skillproof.dev/overview
                </div>
                <span className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:block">
                  Demo
                </span>
              </div>

              <div className="flex">
                <aside className="hidden w-52 shrink-0 flex-col border-r border-black/[0.06] p-3 md:flex">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <Logomark className="size-5" />
                    <span className="text-[13px] font-semibold tracking-tight">SkillProof</span>
                  </div>
                  <div className="mt-3 flex h-8 items-center gap-2 rounded-md border border-black/[0.06] bg-white px-2 text-[12px] text-muted-foreground">
                    <Search className="size-3.5" aria-hidden="true" /> Search
                    <kbd className="ml-auto font-mono text-[10px]">⌘K</kbd>
                  </div>
                  <ul className="mt-4 flex flex-col gap-0.5">
                    {sideNav.map((n) => (
                      <li
                        key={n.label}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition-colors',
                          n.active ? 'bg-white font-medium text-ink shadow-card' : 'text-muted-foreground hover:bg-black/[0.03] hover:text-ink',
                        )}
                      >
                        <n.icon className="size-4" aria-hidden="true" />
                        {n.label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center gap-2 rounded-lg px-2 pt-10">
                    <Avatar initials={student.initials} className="size-7 p-[1.5px] [&>span]:text-[10px]" />
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-[12px] font-medium">{student.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">Student plan</p>
                    </div>
                  </div>
                </aside>

                <div className="min-w-0 flex-1 p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[12px] text-muted-foreground">Overview</p>
                      <p className="text-lg font-semibold tracking-tight text-ink">Welcome back, Alex</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="hidden rounded-md border border-black/[0.07] bg-white px-2.5 py-1.5 text-[12px] text-muted-foreground sm:inline-flex">
                        Target · <span className="ml-1 font-medium text-ink">{student.role}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-[12px] font-medium text-white">
                        <Plus className="size-3.5" aria-hidden="true" /> New assessment
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-12">
                    <Panel className="lg:col-span-5">
                      <PanelLabel
                        right={
                          <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified-ink">
                            <BadgeCheck className="size-3.5" aria-hidden="true" /> Verified profile
                          </span>
                        }
                      >
                        SkillProof score
                      </PanelLabel>
                      <div className="flex items-center gap-5">
                        <ScoreRing value={student.score} size={104} stroke={8}>
                          <div className="text-center leading-none">
                            <Counter value={student.score} className="text-3xl font-semibold tracking-tight text-ink" />
                            <p className="mt-1 font-mono text-[10px] text-muted-foreground">/ 100</p>
                          </div>
                        </ScoreRing>
                        <div className="flex flex-col gap-2.5">
                          <p className="flex items-center gap-1 text-[13px] font-medium text-verified-ink">
                            <TrendingUp className="size-4" aria-hidden="true" /> +6 since August
                          </p>
                          <p className="text-[12px] leading-relaxed text-muted-foreground">
                            Top 18% of Backend Developer candidates in the demo cohort.
                          </p>
                          <div className="flex gap-1.5">
                            {['Python', 'SQL', 'REST APIs', 'Git'].map((s) => (
                              <span key={s} className="rounded border border-black/[0.06] bg-[#fbfbf9] px-1.5 py-0.5 font-mono text-[10px] text-ink">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Panel>

                    <Panel className="lg:col-span-7">
                      <PanelLabel
                        right={
                          <span className="flex items-center gap-3 font-mono text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-3 rounded-full bg-ink" /> Current
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="h-2.5 w-px bg-brand" /> Target
                            </span>
                          </span>
                        }
                      >
                        Skill proficiency
                      </PanelLabel>
                      <ul className="flex flex-col gap-3">
                        {role.metrics.map((m, i) => {
                          const meets = m.current >= m.target
                          return (
                            <li key={m.name} className="group grid grid-cols-[92px_1fr_36px] items-center gap-3">
                              <span className="truncate text-[12px] text-ink">{m.name}</span>
                              <div className="relative h-2 rounded-full bg-black/[0.05]">
                                <motion.div
                                  className={cn('h-full rounded-full', meets ? 'bg-ink' : 'bg-gap')}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${m.current}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.1, ease: easeOut, delay: 0.2 + i * 0.08 }}
                                />
                                <span
                                  className="absolute -top-1 h-4 w-0.5 rounded-full bg-brand"
                                  style={{ left: `${m.target}%` }}
                                  aria-hidden="true"
                                />
                              </div>
                              <span className="text-right font-mono text-[11px] tabular-nums text-muted-foreground group-hover:text-ink">
                                {m.current}
                              </span>
                            </li>
                          )
                        })}
                      </ul>
                    </Panel>

                    <Panel className="lg:col-span-4">
                      <PanelLabel right={<span className="font-mono text-[10px] text-muted-foreground">Sep 24</span>}>
                        Recent assessment
                      </PanelLabel>
                      <p className="text-[15px] font-semibold tracking-tight text-ink">Backend Fundamentals</p>
                      <p className="mt-1 text-[12px] text-muted-foreground">24 questions · 3 practical tasks · 38 min</p>
                      <div className="mt-4 flex items-end justify-between">
                        <p className="text-3xl font-semibold tracking-tight text-ink">
                          <Counter value={82} />
                          <span className="text-base text-muted-foreground">%</span>
                        </p>
                        <span className="inline-flex items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified-ink">
                          <BadgeCheck className="size-3.5" aria-hidden="true" /> Passed
                        </span>
                      </div>
                      <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                        <div className="w-[62%] bg-ink" />
                        <div className="w-[20%] bg-gap" />
                        <div className="flex-1 bg-black/[0.06]" />
                      </div>
                    </Panel>

                    <Panel className="lg:col-span-5">
                      <PanelLabel right={<span className="font-mono text-[10px] text-muted-foreground">11 items</span>}>
                        Evidence
                      </PanelLabel>
                      <ul className="-mx-1 flex flex-col">
                        {evidenceRows.map((e) => (
                          <li
                            key={e.title}
                            className="flex items-center gap-2.5 rounded-md px-1 py-1.5 transition-colors hover:bg-black/[0.03]"
                          >
                            <span className="grid size-6 place-items-center rounded-md border border-black/[0.06] bg-[#fbfbf9]">
                              <e.icon className="size-3.5 text-ink" aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{e.title}</span>
                            <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">{e.skill}</span>
                            <span className="w-14 text-right font-mono text-[11px] text-verified-ink">{e.result}</span>
                          </li>
                        ))}
                      </ul>
                    </Panel>

                    <Panel className="lg:col-span-3">
                      <PanelLabel>Verified skills</PanelLabel>
                      <ul className="flex flex-col gap-2">
                        {[
                          ['Python', 84],
                          ['Git', 81],
                          ['SQL', 61],
                          ['REST APIs', 52],
                        ].map(([s, v]) => (
                          <li key={s} className="flex items-center justify-between text-[12px]">
                            <span className="flex items-center gap-1.5 text-ink">
                              <BadgeCheck className="size-3.5 text-verified" aria-label="Verified" />
                              {s}
                            </span>
                            <span className="font-mono tabular-nums text-muted-foreground">{v}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-dashed border-border pt-2.5 text-[11px] text-muted-foreground">
                        Problem Solving · in progress
                      </p>
                    </Panel>
                  </div>
                </div>
              </div>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
