import { Link } from '@bl/lib/link'
import { cn } from '@bl/lib/utils'

export function Logomark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  const bg = inverted ? '#ffffff' : '#171717'
  const fg = inverted ? '#171717' : '#ffffff'
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className={cn('size-7', className)}>
      <rect width="32" height="32" rx="8" fill={bg} />
      <path
        d="M8 20.5 13.5 15l4 4L24 11.5"
        stroke={fg}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="20.5" r="2" fill={fg} />
      <circle cx="13.5" cy="15" r="2" fill={fg} />
      <circle cx="17.5" cy="19" r="2" fill={fg} />
      <circle cx="24" cy="11.5" r="3" fill="#7d75ff" />
    </svg>
  )
}

export function Logo({
  className,
  href = '/',
  inverted = false,
  size = 'md',
}: {
  className?: string
  href?: string
  inverted?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <Link
      href={href}
      aria-label="SkillProof home"
      className={cn(
        'inline-flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2',
        className,
      )}
    >
      <Logomark inverted={inverted} className={size === 'sm' ? 'size-6' : 'size-7'} />
      <span
        className={cn(
          'font-semibold tracking-[-0.03em]',
          size === 'sm' ? 'text-[15px]' : 'text-[17px]',
          inverted ? 'text-white' : 'text-ink',
        )}
      >
        SkillProof
      </span>
    </Link>
  )
}
