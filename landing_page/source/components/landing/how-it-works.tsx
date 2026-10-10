'use client'

import { motion } from 'motion/react'
import { ClipboardCheck, ScanSearch, BadgeCheck, type LucideIcon } from 'lucide-react'
import { SectionHeading } from '@/components/shared/bits'
import { Reveal } from '@/components/shared/motion'
import { easeOut } from '@/lib/ui'

const steps: { n: string; title: string; body: string; icon: LucideIcon; meta: string }[] = [
  {
    n: '01',
    title: 'Assess',
    body: 'Go beyond self-reported skills with role-specific knowledge and practical challenges.',
    icon: ClipboardCheck,
    meta: 'Questions · challenges · code tasks',
  },
  {
    n: '02',
    title: 'Identify',
    body: 'Understand where your abilities stand and which skills need more work.',
    icon: ScanSearch,
    meta: 'Benchmarks · gaps · priorities',
  },
  {
    n: '03',
    title: 'Prove',
    body: 'Turn demonstrated skills into a shareable profile backed by evidence.',
    icon: BadgeCheck,
    meta: 'Skill Passport · evidence trail',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative border-y border-black/[0.05] bg-white/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title="From claim to credential in three steps."
            description="A simple loop you can repeat as you grow: measure, improve, and prove."
          />
        </Reveal>

        <div className="relative mt-16">
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-black/[0.07] md:left-0 md:right-0 md:top-[19px] md:bottom-auto md:h-px md:w-auto" aria-hidden="true">
            <motion.div
              className="absolute inset-0 origin-top bg-gradient-to-b from-brand via-brand/60 to-verified md:origin-left md:bg-gradient-to-r"
              initial={{ scaleX: 0, scaleY: 0 }}
              whileInView={{ scaleX: 1, scaleY: 1 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1.6, ease: easeOut }}
            />
          </div>

          <ol className="relative grid gap-12 md:grid-cols-3 md:gap-10">
            {steps.map((s, i) => (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-120px' }}
                transition={{ duration: 0.7, ease: easeOut, delay: 0.25 + i * 0.25 }}
                className="flex gap-5 md:flex-col md:gap-0"
              >
                <span className="relative grid size-10 shrink-0 place-items-center rounded-full border border-black/[0.08] bg-white shadow-card">
                  <s.icon className="size-[18px] text-ink" aria-hidden="true" />
                </span>
                <div className="md:mt-8">
                  <p className="font-mono text-[12px] text-brand">{s.n}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">{s.title}</h3>
                  <p className="mt-3 max-w-xs text-pretty text-[15px] leading-relaxed text-muted-foreground">{s.body}</p>
                  <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground/80">{s.meta}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
