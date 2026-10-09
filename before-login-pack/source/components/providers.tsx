'use client'

import { MotionConfig } from 'motion/react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          classNames: {
            toast:
              '!rounded-xl !border !border-border !bg-white !text-ink !shadow-lift !font-sans',
            description: '!text-muted-foreground !font-mono !text-xs',
          },
        }}
      />
    </MotionConfig>
  )
}
