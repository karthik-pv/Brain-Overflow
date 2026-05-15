import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import DotPattern from '@/components/ui/dot-pattern-1'
import type { Idea } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_META: Record<
  Idea['status'],
  { label: string; tone: string }
> = {
  recorded: { label: 'RECORDED', tone: 'var(--color-text-mute)' },
  processing: { label: 'PROCESSING', tone: 'var(--color-pivot)' },
  completed: { label: 'COMPLETED', tone: 'var(--color-strong)' },
  failed: { label: 'FAILED', tone: 'var(--color-weak)' },
}

const SCORE_META: Record<
  NonNullable<Idea['score']>,
  { label: string; tone: string }
> = {
  strong: { label: 'STRONG', tone: 'var(--color-strong)' },
  weak: { label: 'WEAK', tone: 'var(--color-weak)' },
  needs_pivot: { label: 'PIVOT', tone: 'var(--color-pivot)' },
  needs_refinement: { label: 'REFINE', tone: 'var(--color-refine)' },
}

const CATEGORY_LABELS: Record<NonNullable<Idea['category']>, string> = {
  startup_idea: 'Startup',
  automation: 'Automation',
  personal_tool: 'Personal Tool',
  dev_tool: 'Dev Tool',
  other: 'Other',
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export interface IdeaCardProps {
  idea: Idea
  onDelete?: (id: string) => void
  compact?: boolean
  className?: string
}

export function IdeaCard({ idea, onDelete, compact = false, className }: IdeaCardProps) {
  const navigate = useNavigate()
  const status = STATUS_META[idea.status]
  const score = idea.score ? SCORE_META[idea.score] : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 140, damping: 22 }}
      onClick={() => navigate(`/idea/${idea.id}`)}
      className={cn(
        'group relative cursor-pointer overflow-hidden border border-[color:var(--color-edge)]',
        'bg-[color:var(--color-surface)]/60 backdrop-blur-md p-5',
        'transition-[transform,border-color] duration-200',
        'hover:-translate-y-0.5 hover:border-[color:var(--color-edge-glow)]',
        className,
      )}
    >
      <DotPattern
        width={6}
        height={6}
        className="fill-[color:var(--color-edge-glow)] opacity-30"
      />
      <span className="absolute -left-px -top-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
      <span className="absolute -right-px -top-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
      <span className="absolute -bottom-px -left-px h-2 w-2 bg-[color:var(--color-text-dim)]" />
      <span className="absolute -bottom-px -right-px h-2 w-2 bg-[color:var(--color-text-dim)]" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: status.tone, boxShadow: `0 0 6px ${status.tone}80` }}
            aria-label={status.label}
          />
          <span className="font-pixel text-[10px] tracking-[0.18em] uppercase" style={{ color: status.tone }}>
            {status.label}
          </span>
          {idea.category && (
            <span className="font-pixel text-[10px] tracking-[0.18em] uppercase text-[color:var(--color-text-dim)] ml-auto">
              {CATEGORY_LABELS[idea.category]}
            </span>
          )}
        </div>

        <p
          className={cn(
            'font-mono text-sm leading-relaxed text-[color:var(--color-text)]',
            compact ? 'line-clamp-2' : 'line-clamp-3',
          )}
        >
          {idea.idea}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
            {formatDate(idea.created_at)}
          </span>
          <div className="flex items-center gap-3">
            {score && (
              <span
                className="font-pixel text-[10px] tracking-[0.18em] uppercase"
                style={{ color: score.tone }}
              >
                {score.label}
              </span>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(idea.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 -m-1 text-[color:var(--color-text-dim)] hover:text-[color:var(--color-weak)]"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
