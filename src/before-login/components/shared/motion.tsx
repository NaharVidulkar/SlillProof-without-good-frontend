'use client'

import { animate, motion, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@bl/lib/utils'
import { easeOut } from '@bl/lib/ui'

export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  // preview-only workaround
  const skipInitial = typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_PREVIEW_MODE === 'true'

  return (
    <motion.div
      className={className}
      initial={skipInitial ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Counter({
  value,
  duration = 1.4,
  className,
}: {
  value: number
  duration?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)
  const from = useRef(0)

  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setDisplay(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: easeOut,
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => {
        from.current = value
      },
    })
    return () => {
      controls.stop()
      from.current = value
    }
  }, [inView, value, reduce, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
    </span>
  )
}

export function ScoreRing({
  value,
  size = 96,
  stroke = 7,
  className,
  children,
  trackClassName = 'stroke-black/[0.06]',
  barClassName = 'stroke-brand',
}: {
  value: number
  size?: number
  stroke?: number
  className?: string
  children?: React.ReactNode
  trackClassName?: string
  barClassName?: string
}) {
  const r = (size - stroke) / 2
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <div ref={ref} className={cn('relative grid place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClassName} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={barClassName}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: inView ? value / 100 : 0 }}
          transition={{ duration: 1.4, ease: easeOut, delay: 0.1 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  )
}
