'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { DemoTag, SectionHeading } from '@/components/shared/bits'
import { Reveal } from '@/components/shared/motion'
import { StepRole } from '@/components/landing/demo/step-role'
import { StepAssessment } from '@/components/landing/demo/step-assessment'
import { StepGaps } from '@/components/landing/demo/step-gaps'
import { StepPassport } from '@/components/landing/demo/step-passport'
import { getRole, type RoleId } from '@/lib/data'
import { buttonClass, easeOut } from '@/lib/ui'
import { cn } from '@/lib/utils'

const steps = [
  { label: 'Choose a career path', short: 'Career' },
  { label: 'Complete an assessment', short: 'Assess' },
  { label: 'Review your skill gaps', short: 'Gaps' },
  { label: 'Generate your Passport', short: 'Passport' },
]

export function InteractiveDemo() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [roleId, setRoleId] = useState<RoleId>('backend')
  const [answer, setAnswer] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const role = getRole(roleId)

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const reset = () => {
    setAnswer(null)
    setSubmitted(false)
    setRoleId('backend')
    go(0)
  }

  const canContinue = step !== 1 || submitted

  return (
    <section id="demo" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Interactive demo"
            title="See your path to a verified profile."
            description="Click through a simulated SkillProf session. No sign-in, no real scoring — just the experience."
          />
          <DemoTag>Simulated experience</DemoTag>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div className="overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-lift">
            <div className="border-b border-black/[0.06] bg-[#fbfbf9] p-2">
              <ol className="grid grid-cols-4 gap-1" aria-label="Demo steps">
                {steps.map((s, i) => {
                  const active = i === step
                  const done = i < step
                  return (
                    <li key={s.label}>
                      <button
                        type="button"
                        onClick={() => go(i)}
                        aria-current={active ? 'step' : undefined}
                        className={cn(
                          'relative flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/60 sm:px-3',
                          active ? 'text-ink' : 'text-muted-foreground hover:text-ink',
                        )}
                      >
                        {active ? (
                          <motion.span
                            layoutId="demo-step-active"
                            className="absolute inset-0 rounded-lg border border-black/[0.07] bg-white shadow-card"
                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                          />
                        ) : null}
                        <span
                          className={cn(
                            'relative grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition-colors',
                            active && 'border-brand bg-brand text-white',
                            done && 'border-ink bg-ink text-white',
                            !active && !done && 'border-border bg-white',
                          )}
                        >
                          {done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                        </span>
                        <span className="relative min-w-0">
                          <span className="block truncate text-[13px] font-medium sm:hidden">{s.short}</span>
                          <span className="hidden truncate text-[13px] font-medium sm:block">{s.label}</span>
                        </span>
                        {done ? <span className="sr-only">(completed)</span> : null}
                      </button>
                    </li>
                  )
                })}
              </ol>
              <div className="mx-2 mt-2 h-0.5 overflow-hidden rounded-full bg-black/[0.05]" aria-hidden="true">
                <motion.div
                  className="h-full rounded-full bg-brand"
                  animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.6, ease: easeOut }}
                />
              </div>
            </div>

            <div className="relative min-h-[520px] overflow-hidden p-5 sm:p-8 lg:p-10" aria-live="polite">
              <AnimatePresence mode="wait" custom={direction} initial={false}>
                <motion.div
                  key={step}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 24, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: direction * -24, filter: 'blur(4px)' }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  {step === 0 ? <StepRole roleId={roleId} onSelect={setRoleId} /> : null}
                  {step === 1 ? (
                    <StepAssessment
                      answer={answer}
                      submitted={submitted}
                      onAnswer={setAnswer}
                      onSubmit={() => setSubmitted(true)}
                      onRetry={() => {
                        setAnswer(null)
                        setSubmitted(false)
                      }}
                    />
                  ) : null}
                  {step === 2 ? <StepGaps role={role} /> : null}
                  {step === 3 ? <StepPassport role={role} answeredCorrectly={submitted && answer === 1} /> : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] bg-[#fbfbf9] px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className={buttonClass({ variant: 'ghost', size: 'sm' })}
              >
                <ArrowLeft aria-hidden="true" /> Back
              </button>
              <p className="hidden font-mono text-[11px] text-muted-foreground sm:block">
                {step === 1 && !submitted ? 'Submit an answer to continue' : `Step ${step + 1} of ${steps.length}`}
              </p>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => go(step + 1)}
                  disabled={!canContinue}
                  className={buttonClass({ size: 'sm' })}
                >
                  Continue
                  <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
                </button>
              ) : (
                <button type="button" onClick={reset} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
                  <RotateCcw aria-hidden="true" /> Start again
                </button>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
