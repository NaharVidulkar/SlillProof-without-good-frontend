import { BadgeCheck, CircleDashed } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
      {children}
    </p>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <div className={cn('flex max-w-2xl flex-col gap-4', align === 'center' && 'mx-auto items-center text-center', className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="text-balance text-3xl font-semibold leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.75rem]">
        {title}
      </h2>
      {description ? (
        <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

export function VerifiedBadge({ className, label = 'Verified' }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-verified/25 bg-verified-soft px-2 py-0.5 text-[11px] font-medium text-verified-ink',
        className,
      )}
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  )
}

export function InProgressBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground',
        className,
      )}
    >
      <CircleDashed className="size-3.5" aria-hidden="true" />
      In progress
    </span>
  )
}

export function DemoTag({ children = 'Demo data', className }: { children?: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-dashed border-[#d6d5ce] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}

const QR_SIZE = 25
const qrCells: [number, number][] = (() => {
  const cells: [number, number][] = []
  let seed = 418
  const inFinder = (x: number, y: number) => {
    const zones = [
      [0, 0],
      [QR_SIZE - 8, 0],
      [0, QR_SIZE - 8],
    ]
    return zones.some(([zx, zy]) => x >= zx && x < zx + 8 && y >= zy && y < zy + 8)
  }
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      seed = (seed * 9301 + 49297) % 233280
      if (!inFinder(x, y) && seed / 233280 > 0.54) cells.push([x, y])
    }
  }
  return cells
})()

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x + 0.5} y={y + 0.5} width={6} height={6} rx={1.4} fill="none" stroke="currentColor" strokeWidth={1} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={0.6} fill="currentColor" />
    </g>
  )
}

export function QrPattern({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`}
      className={cn('text-ink', className)}
      role="img"
      aria-label="Decorative demo code pattern, not a real verification code"
      shapeRendering="crispEdges"
    >
      <Finder x={0} y={0} />
      <Finder x={QR_SIZE - 7} y={0} />
      <Finder x={0} y={QR_SIZE - 7} />
      {qrCells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width={0.84} height={0.84} rx={0.25} fill="currentColor" />
      ))}
    </svg>
  )
}

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        'grid size-10 shrink-0 place-items-center rounded-full bg-[conic-gradient(from_210deg,#5046e6,#8f88ff,#10b981,#5046e6)] p-[2px]',
        className,
      )}
      aria-hidden="true"
    >
      <span className="grid size-full place-items-center rounded-full bg-white text-[13px] font-semibold tracking-tight text-ink">
        {initials}
      </span>
    </span>
  )
}
