import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'brand' | 'inverse'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.18)] hover:bg-[#2a2a2a]',
  secondary:
    'bg-white text-ink border border-border shadow-[0_1px_2px_rgb(23_23_23/0.05)] hover:border-[#d6d5ce] hover:bg-[#fcfcfa]',
  ghost: 'text-muted-foreground hover:text-ink hover:bg-black/[0.04]',
  brand:
    'bg-brand text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.18),0_1px_2px_rgb(30_27_75/0.3)] hover:bg-brand-ink',
  inverse: 'bg-white text-ink hover:bg-white/90 shadow-[0_1px_2px_rgb(0_0_0/0.2)]',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-[15px] gap-2',
}

export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'group/btn inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-lg font-medium tracking-[-0.01em] outline-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-4 [&_svg]:shrink-0',
    variants[variant],
    sizes[size],
    className,
  )
}

export async function copyProfileLink() {
  const url = `${window.location.origin}/passport/demo`
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Profile link copied', { description: url })
  } catch {
    toast('Copy this demo link', { description: url })
  }
}

export const easeOut = [0.16, 1, 0.3, 1] as const
