'use client'

import { ArrowUpRight, Sparkles } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Role } from '@bl/lib/data'

type TooltipProps = {
  active?: boolean
  label?: string
  payload?: { name: string; value: number }[]
}

function ChartTooltip({ active, label, payload }: TooltipProps) {
  if (!active || !payload?.length) return null
  const current = payload.find((p) => p.name === 'Current')?.value ?? 0
  const target = payload.find((p) => p.name === 'Target')?.value ?? 0
  const delta = current - target
  return (
    <div className="rounded-lg border border-black/[0.08] bg-white px-3 py-2 shadow-lift">
      <p className="text-[12px] font-semibold text-ink">{label}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">
        Current {current} · Target {target}
      </p>
      <p className={delta >= 0 ? 'font-mono text-[11px] text-verified-ink' : 'font-mono text-[11px] text-gap-ink'}>
        {delta >= 0 ? `Meets target (+${delta})` : `Gap of ${Math.abs(delta)}`}
      </p>
    </div>
  )
}

export function StepGaps({ role }: { role: Role }) {
  const gaps = role.metrics
    .map((m) => ({ ...m, gap: m.target - m.current }))
    .filter((m) => m.gap > 0)
    .sort((a, b) => b.gap - a.gap)
  const topGaps = gaps.slice(0, 2).map((g) => g.name)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Your gaps for {role.title}</h3>
        <p className="mt-2 text-[15px] text-muted-foreground">Current proficiency compared with the role benchmark.</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-ink" /> Meets target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-gap" /> Largest gaps
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-brand" /> Below target
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-[#e4e3dc]" /> Role target
          </span>
        </div>
        <div className="mt-4 h-[280px] w-full" role="img" aria-label={`Bar chart comparing current and target proficiency for ${role.title}`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={role.metrics} barGap={3} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="rgba(23,23,23,0.06)" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                interval={0}
                tick={{ fontSize: 11, fill: '#66665f' }}
                tickFormatter={(v: string) => (v.length > 10 ? v.split(' ')[0] : v)}
              />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#66665f' }} />
              <Tooltip cursor={{ fill: 'rgba(23,23,23,0.03)' }} content={<ChartTooltip />} />
              <Bar dataKey="target" name="Target" fill="#e4e3dc" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={800} />
              <Bar dataKey="current" name="Current" radius={[4, 4, 0, 0]} maxBarSize={24} animationDuration={1000}>
                {role.metrics.map((m) => (
                  <Cell
                    key={m.name}
                    fill={m.current >= m.target ? '#171717' : topGaps.includes(m.name) ? '#f59e0b' : '#5046e6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-xl border border-brand/15 bg-[linear-gradient(160deg,#f3f2ff,#ffffff_60%)] p-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-brand-ink">
            <Sparkles className="size-3.5" aria-hidden="true" /> Simulated insight
          </p>
          <p className="mt-3 text-pretty text-[17px] font-semibold leading-snug tracking-tight text-ink">{role.insight}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Closing your top {topGaps.length} gaps would raise your overall score by an estimated 7 points.
          </p>
        </div>

        <div className="rounded-xl border border-black/[0.07] p-5">
          <p className="text-[13px] font-medium text-ink">Recommended next steps</p>
          <ol className="mt-3 flex flex-col gap-3">
            {role.recommendations.map((r, i) => (
              <li key={r.title} className="group flex gap-3">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-muted-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-sm font-medium text-ink">
                    {r.title}
                    <ArrowUpRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  </p>
                  <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                    {r.skill} · {r.duration}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  )
}
