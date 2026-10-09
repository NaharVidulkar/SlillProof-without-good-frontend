'use client'

import { motion } from 'motion/react'
import { BarChart2, Check, Layout, Server, type LucideIcon } from 'lucide-react'
import { roles, type RoleId } from '@bl/lib/data'
import { cn } from '@bl/lib/utils'

const icons: Record<RoleId, LucideIcon> = {
  backend: Server,
  frontend: Layout,
  data: BarChart2,
}

export function StepRole({ roleId, onSelect }: { roleId: RoleId; onSelect: (id: RoleId) => void }) {
  return (
    <div>
      <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Where are you headed?</h3>
      <p className="mt-2 max-w-lg text-[15px] text-muted-foreground">
        Pick a target role. SkillProof tailors assessments and benchmarks to what that role actually requires.
      </p>
      <div role="radiogroup" aria-label="Career path" className="mt-8 grid gap-3 md:grid-cols-3">
        {roles.map((r) => {
          const Icon = icons[r.id]
          const selected = r.id === roleId
          return (
            <motion.button
              key={r.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(r.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className={cn(
                'relative flex flex-col rounded-xl border p-5 text-left outline-none transition-[border-color,box-shadow,background-color] duration-200 focus-visible:ring-2 focus-visible:ring-brand/60',
                selected
                  ? 'border-brand/60 bg-brand-soft/40 shadow-[0_0_0_3px_rgb(80_70_230/0.12)]'
                  : 'border-black/[0.08] bg-white hover:border-black/[0.16] hover:shadow-card',
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    'grid size-10 place-items-center rounded-lg border transition-colors',
                    selected ? 'border-brand/20 bg-brand text-white' : 'border-black/[0.06] bg-[#fbfbf9] text-ink',
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    'grid size-5 place-items-center rounded-full border transition-colors',
                    selected ? 'border-brand bg-brand text-white' : 'border-border bg-white',
                  )}
                  aria-hidden="true"
                >
                  {selected ? <Check className="size-3" /> : null}
                </span>
              </div>
              <p className="mt-5 text-[15px] font-semibold tracking-tight text-ink">{r.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
              <ul className="mt-5 flex flex-wrap gap-1.5" aria-label={`${r.title} skills`}>
                {r.skills.map((s) => (
                  <li
                    key={s}
                    className="rounded-md border border-black/[0.06] bg-white px-2 py-0.5 font-mono text-[11px] text-ink"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
