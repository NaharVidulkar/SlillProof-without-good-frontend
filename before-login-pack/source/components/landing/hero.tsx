'use client'

import { motion, type Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { HeroVisual } from '@/components/landing/hero-visual'
import { buttonClass, easeOut } from '@/lib/ui'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(6px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: easeOut } },
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-16 pt-28 sm:pt-36 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid mask-radial-fade opacity-80" />
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(80_70_230/0.13),transparent)] animate-drift" />
        <div className="absolute right-[-10%] top-[30%] h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgb(16_185_129/0.07),transparent)] animate-drift-slow" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_1fr] lg:gap-8">
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-start">
          <motion.p
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-black/[0.07] bg-white/70 py-1 pl-1 pr-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-muted-foreground shadow-card backdrop-blur"
          >
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-brand-ink">New</span>
            The next standard for skill verification
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-7 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.1rem]"
          >
            Your skills deserve{' '}
            <span className="relative inline-block whitespace-nowrap">
              <span className="bg-[linear-gradient(100deg,#3f35c9_10%,#7d75ff_55%,#5046e6_90%)] bg-clip-text text-transparent">
                more than a line
              </span>
              <svg
                viewBox="0 0 300 12"
                preserveAspectRatio="none"
                className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand/50"
                aria-hidden="true"
              >
                <motion.path
                  d="M2 8 C 60 3, 140 3, 200 6 S 280 9, 298 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.1, ease: easeOut, delay: 0.9 }}
                />
              </svg>
            </span>{' '}
            on a resume.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-7 max-w-[34rem] text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl sm:leading-relaxed"
          >
            Prove what you can do. Discover what to improve. Build a skill profile backed by real evidence.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/assessment/demo" className={buttonClass({ size: 'lg' })}>
              Build your Skill Passport
            </Link>
            <a href="#demo" className={buttonClass({ variant: 'secondary', size: 'lg' })}>
              Explore the platform
              <ArrowRight
                className="text-muted-foreground transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:text-ink"
                aria-hidden="true"
              />
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {['Assess your skills.', 'Understand your gaps.', 'Show what you can do.'].map((t, i) => (
              <li key={t} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-brand">{`0${i + 1}`}</span>
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        <HeroVisual />
      </div>
    </section>
  )
}
