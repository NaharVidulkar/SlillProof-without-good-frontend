'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Lightbulb, RotateCcw, XCircle } from 'lucide-react'
import { demoQuestion } from '@/lib/data'
import { buttonClass, easeOut } from '@/lib/ui'
import { cn } from '@/lib/utils'

const letters = ['A', 'B', 'C', 'D']

export function StepAssessment({
  answer,
  submitted,
  onAnswer,
  onSubmit,
  onRetry,
}: {
  answer: number | null
  submitted: boolean
  onAnswer: (i: number) => void
  onSubmit: () => void
  onRetry: () => void
}) {
  const correct = answer === demoQuestion.correct

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-brand-soft px-2 py-0.5 font-mono text-[11px] text-brand-ink">
            {demoQuestion.category}
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">Question 1 of 1 · sample</span>
        </div>
        <h3 id="demo-question" className="mt-4 text-pretty text-lg font-semibold leading-snug tracking-tight text-ink sm:text-xl">
          {demoQuestion.prompt}
        </h3>
        <div role="radiogroup" aria-labelledby="demo-question" className="mt-6 flex flex-col gap-2">
          {demoQuestion.options.map((opt, i) => {
            const selected = answer === i
            const isCorrect = submitted && i === demoQuestion.correct
            const isWrong = submitted && selected && !correct
            return (
              <button
                key={opt}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={submitted}
                onClick={() => onAnswer(i)}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] outline-none transition-[border-color,background-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-brand/60 disabled:cursor-default',
                  !submitted && selected && 'border-brand/60 bg-brand-soft/40 shadow-[0_0_0_3px_rgb(80_70_230/0.1)]',
                  !submitted && !selected && 'border-black/[0.08] bg-white hover:border-black/[0.16] hover:bg-[#fcfcfa]',
                  isCorrect && 'border-verified/50 bg-verified-soft',
                  isWrong && 'border-gap/50 bg-gap-soft',
                  submitted && !isCorrect && !isWrong && 'border-black/[0.06] bg-white opacity-60',
                )}
              >
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-md border font-mono text-[12px] transition-colors',
                    selected && !submitted ? 'border-brand bg-brand text-white' : 'border-black/[0.08] bg-white text-muted-foreground',
                    isCorrect && 'border-verified bg-verified text-white',
                    isWrong && 'border-gap bg-gap text-white',
                  )}
                >
                  {letters[i]}
                </span>
                <span className="flex-1 text-ink">{opt}</span>
                {isCorrect ? <CheckCircle2 className="size-5 text-verified-ink" aria-label="Correct answer" /> : null}
                {isWrong ? <XCircle className="size-5 text-gap-ink" aria-label="Your answer, incorrect" /> : null}
              </button>
            )
          })}
        </div>
        {!submitted ? (
          <div className="mt-5 flex items-center gap-3">
            <button type="button" onClick={onSubmit} disabled={answer === null} className={buttonClass()}>
              Submit answer
            </button>
            <span className="text-sm text-muted-foreground">{answer === null ? 'Select an option first' : 'Ready when you are'}</span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: easeOut }}
              className="flex h-full flex-col rounded-xl border border-black/[0.07] bg-[#fbfbf9] p-5"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Simulated evaluation</p>
              <div className="mt-4 flex items-center gap-3">
                {correct ? (
                  <CheckCircle2 className="size-8 text-verified" aria-hidden="true" />
                ) : (
                  <XCircle className="size-8 text-gap" aria-hidden="true" />
                )}
                <div>
                  <p className="font-semibold tracking-tight text-ink">{correct ? 'Correct — strong reasoning' : 'Not quite'}</p>
                  <p className="text-sm text-muted-foreground">{correct ? 'Query optimisation · +4 SQL' : 'Marked as a growth area for SQL'}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3 rounded-lg border border-black/[0.06] bg-white p-3.5">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                <p className="text-sm leading-relaxed text-muted-foreground">{demoQuestion.explanation}</p>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Accuracy', correct ? '100%' : '0%'],
                  ['Time', '0:42'],
                  ['Difficulty', 'Medium'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-black/[0.05] bg-white px-2 py-2.5">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{k}</dt>
                    <dd className="mt-1 text-sm font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" onClick={onRetry} className={buttonClass({ variant: 'ghost', size: 'sm', className: 'mt-auto self-start pt-0' })}>
                <RotateCcw aria-hidden="true" /> Try again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#d9d8d1] p-6 text-center"
            >
              <span className="grid size-10 place-items-center rounded-full bg-muted">
                <Lightbulb className="size-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-medium text-ink">Feedback appears here</p>
              <p className="mt-1 max-w-56 text-sm text-muted-foreground">
                Each answer is explained, so you learn while you&apos;re assessed.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
