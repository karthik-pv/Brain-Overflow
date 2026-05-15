import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, RefreshCw, Clock } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { useProcessingPulse, type CompletedEvent } from '@/hooks/useProcessingPulse'

interface QueueItem extends CompletedEvent {
  visible: boolean
}

const SCORE_META = {
  strong: { label: 'STRONG', tone: 'var(--color-strong)', Icon: TrendingUp, variant: 'default' as const },
  needs_refinement: {
    label: 'NEEDS REFINEMENT',
    tone: 'var(--color-refine)',
    Icon: Clock,
    variant: 'default' as const,
  },
  needs_pivot: {
    label: 'NEEDS PIVOT',
    tone: 'var(--color-pivot)',
    Icon: RefreshCw,
    variant: 'destructive' as const,
  },
  weak: { label: 'WEAK', tone: 'var(--color-weak)', Icon: TrendingDown, variant: 'destructive' as const },
}

export function AlertStack() {
  const { completedEvents } = useProcessingPulse()
  const navigate = useNavigate()
  const [items, setItems] = useState<QueueItem[]>([])
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!completedEvents.length) return
    setItems((prev) => {
      const next = [...prev]
      for (const ev of completedEvents) {
        const key = `${ev.id}:${ev.ts}`
        if (seenIds.has(key)) continue
        seenIds.add(key)
        next.push({ ...ev, visible: true })
        // auto-dismiss
        window.setTimeout(() => {
          setItems((curr) =>
            curr.map((q) => (q.id === ev.id && q.ts === ev.ts ? { ...q, visible: false } : q)),
          )
        }, 8000)
      }
      return next
    })
    setSeenIds(new Set(seenIds))
  }, [completedEvents, seenIds])

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-[340px] max-w-[calc(100vw-3rem)] pointer-events-none">
      <AnimatePresence>
        {items
          .filter((it) => it.visible)
          .map((it) => {
            const meta = it.score ? SCORE_META[it.score as keyof typeof SCORE_META] : null
            if (!meta) return null
            const { Icon, label, tone, variant } = meta
            return (
              <motion.div
                key={`${it.id}:${it.ts}`}
                initial={{ opacity: 0, x: 60, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                className="pointer-events-auto cursor-pointer"
                onClick={() => {
                  navigate(`/idea/${it.id}`)
                  setItems((curr) =>
                    curr.map((q) =>
                      q.id === it.id && q.ts === it.ts ? { ...q, visible: false } : q,
                    ),
                  )
                }}
              >
                <Alert
                  variant={variant}
                  className="border bg-[color:var(--color-deep)] text-[color:var(--color-text)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-md"
                  style={{
                    borderColor: tone,
                    boxShadow: `inset 0 0 0 1px ${tone}30, 0 8px 32px rgba(0,0,0,0.4)`,
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: tone }} />
                  <AlertTitle className="font-pixel text-[11px] tracking-[0.18em] uppercase" style={{ color: tone }}>
                    {label}
                  </AlertTitle>
                  <AlertDescription className="text-xs font-mono text-[color:var(--color-text)] line-clamp-2">
                    {it.idea}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}
