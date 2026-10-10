import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Logomark } from '@/components/brand/logo'
import { buttonClass } from '@/lib/ui'

export function FinalCta() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink px-6 py-20 text-center sm:px-12 sm:py-28">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:44px_44px] mask-radial-fade" />
          <div className="absolute left-1/4 top-0 h-[420px] w-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-brand/45 blur-[110px] animate-drift" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[460px] translate-x-1/4 translate-y-1/3 rounded-full bg-verified/25 blur-[110px] animate-drift-slow" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center">
          <Logomark inverted className="size-10" />
          <h2 className="mt-8 text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl">
            Stop listing skills. Start proving them.
          </h2>
          <p className="mt-5 text-pretty text-lg text-white/60">Build a profile that shows what you can actually do.</p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <Link href="/assessment/demo" className={buttonClass({ variant: 'inverse', size: 'lg' })}>
              Get started
              <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md text-[15px] font-medium text-white/70 underline-offset-4 outline-none transition-colors hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-white/50"
            >
              Explore how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
