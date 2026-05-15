import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react'
import type { Idea } from '@/types'

const META: Record<
  NonNullable<Idea['score']>,
  { label: string; tone: string; value: number; Icon: typeof TrendingUp }
> = {
  strong: { label: 'STRONG', tone: 'var(--color-strong)', value: 100, Icon: TrendingUp },
  needs_refinement: {
    label: 'NEEDS REFINE',
    tone: 'var(--color-refine)',
    value: 75,
    Icon: Clock,
  },
  needs_pivot: {
    label: 'NEEDS PIVOT',
    tone: 'var(--color-pivot)',
    value: 50,
    Icon: RefreshCw,
  },
  weak: { label: 'WEAK', tone: 'var(--color-weak)', value: 25, Icon: TrendingDown },
}

interface Props {
  score: Idea['score']
  size?: number
}

export function ScoreRing({ score, size = 112 }: Props) {
  if (!score) return null
  const meta = META[score]
  const r = size / 2 - 6
  const c = 2 * Math.PI * r
  const dashOffset = c - (meta.value / 100) * c

  const Icon = meta.Icon

  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-edge)"
            strokeWidth={4}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={meta.tone}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-5 w-5" style={{ color: meta.tone }} />
        </div>
      </div>
      <div>
        <p className="font-pixel text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
          VALIDATION
        </p>
        <p
          className="mt-1 font-pixel text-lg tracking-[0.06em]"
          style={{ color: meta.tone }}
        >
          {meta.label}
        </p>
      </div>
    </div>
  )
}
