'use client'

import { motion } from 'motion/react'
import { BadgeCheck, CalendarDays, GraduationCap, Link2, MapPin, ShieldCheck } from 'lucide-react'
import { Link } from '@bl/lib/link'
import { Logo } from '@bl/components/brand/logo'
import { DemoTag, InProgressBadge, VerifiedBadge } from '@bl/components/shared/bits'
import { Reveal } from '@bl/components/shared/motion'
import { PassportCard } from '@bl/components/shared/passport-card'
import { assessmentHistory, passportSkills, student, type AssessmentRecord, type PassportSkill } from '@bl/lib/data'
import { buttonClass, copyProfileLink, easeOut } from '@bl/lib/ui'
import { cn } from '@bl/lib/utils'

const verificationSteps = [
  {
    title: 'Demonstrated, not declared',
    body: 'A skill is only verified after the student completes role-specific assessments or practical challenges.',
  },
  {
    title: 'Backed by evidence',
    body: 'Each verified skill links to at least two pieces of evidence, such as challenge results or reviewed code.',
  },
  {
    title: 'Kept current',
    body: 'Scores show the date they were last assessed, and update automatically when the student reassesses.',
  },
]

export function PassportProfile() {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-black/[0.06]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <DemoTag className="hidden sm:inline-flex">Sample profile</DemoTag>
            <button type="button" onClick={copyProfileLink} className={buttonClass({ size: 'sm' })}>
              <Link2 aria-hidden="true" /> Copy link
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <section className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: easeOut }}>
            <VerifiedBadge label="Evidence-verified profile" />
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">{student.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Aspiring <span className="font-medium text-ink">{student.role}</span>
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden="true" /> {student.location}
              </li>
              <li className="flex items-center gap-1.5">
                <GraduationCap className="size-4" aria-hidden="true" /> {student.education}
              </li>
              <li className="flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" /> Last assessed {student.lastAssessed}
              </li>
            </ul>
            <dl className="mt-8 grid max-w-sm grid-cols-3 gap-px overflow-hidden rounded-xl border border-black/[0.07] bg-black/[0.07]">
              {[
                ['Overall', `${student.score}`],
                ['Verified', `${passportSkills.filter((s: PassportSkill) => s.status === 'verified').length} skills`],
                ['Evidence', `${passportSkills.reduce((n: number, s: PassportSkill) => n + s.evidenceCount, 0)} items`],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-3 py-3">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{k}</dt>
                  <dd className="mt-1 text-[15px] font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, ease: easeOut, delay: 0.1 }}
          >
            <PassportCard tilt className="mx-auto max-w-[460px]" />
          </motion.div>
        </section>

        <Reveal>
          <section aria-labelledby="skills-heading" className="rounded-2xl border border-black/[0.07] bg-white shadow-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
              <h2 id="skills-heading" className="text-[15px] font-semibold tracking-tight text-ink">
                Skill scores & evidence
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground">0–100 scale</span>
            </div>
            <ul className="divide-y divide-border">
              {passportSkills.map((s: PassportSkill, i: number) => (
                <li key={s.name} className="grid gap-4 px-5 py-5 sm:px-6 md:grid-cols-[200px_1fr_1.2fr] md:items-center">
                  <div>
                    <p className="text-[15px] font-semibold text-ink">{s.name}</p>
                    <div className="mt-1.5">{s.status === 'verified' ? <VerifiedBadge /> : <InProgressBadge />}</div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[13px] text-muted-foreground">{s.level}</span>
                      <span className="font-mono text-[13px] tabular-nums text-ink">{s.score}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-black/[0.05]">
                      <motion.div
                        className={cn('h-full rounded-full', s.status === 'verified' ? 'bg-ink' : 'bg-black/25')}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.score}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: easeOut, delay: 0.1 + i * 0.06 }}
                      />
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">Assessed {s.lastAssessed}</p>
                  </div>
                  <ul className="flex flex-col gap-1.5" aria-label={`${s.name} evidence`}>
                    {s.evidence.map((e: string) => (
                      <li key={e} className="flex items-center gap-2 text-[13px] text-ink">
                        <BadgeCheck
                          className={cn('size-3.5 shrink-0', s.status === 'verified' ? 'text-verified' : 'text-muted-foreground')}
                          aria-hidden="true"
                        />
                        {e}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <section aria-labelledby="history-heading" className="h-full rounded-2xl border border-black/[0.07] bg-white p-5 shadow-card sm:p-6">
              <h2 id="history-heading" className="text-[15px] font-semibold tracking-tight text-ink">
                Assessment history
              </h2>
              <ol className="relative mt-5 flex flex-col gap-5 border-l border-border pl-5">
                {assessmentHistory.map((a: AssessmentRecord) => (
                  <li key={a.name} className="relative">
                    <span className="absolute -left-[25px] top-1.5 size-2 rounded-full bg-ink ring-4 ring-white" aria-hidden="true" />
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-[14px] font-medium text-ink">{a.name}</p>
                      <span className="font-mono text-[13px] tabular-nums text-ink">{a.score}%</span>
                    </div>
                    <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {a.date} · {a.questions} questions · {a.duration}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          <Reveal delay={0.08}>
            <section aria-labelledby="verify-heading" className="h-full rounded-2xl bg-ink p-5 text-white sm:p-6">
              <h2 id="verify-heading" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
                <ShieldCheck className="size-4 text-verified" aria-hidden="true" /> What “verified” means
              </h2>
              <ol className="mt-5 flex flex-col gap-5">
                {verificationSteps.map((v, i) => (
                  <li key={v.title} className="flex gap-3">
                    <span className="font-mono text-[11px] text-white/40">0{i + 1}</span>
                    <div>
                      <p className="text-[14px] font-medium">{v.title}</p>
                      <p className="mt-1 text-[13px] leading-relaxed text-white/60">{v.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-white/10 pt-4 font-mono text-[11px] text-white/45">
                This is a demo profile. Assessments and verification are simulated.
              </p>
            </section>
          </Reveal>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">Want a profile like this?</p>
          <Link href="/signup" className={buttonClass()}>
            Build your Skill Passport
          </Link>
        </div>
      </main>
    </div>
  )
}
