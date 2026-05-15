import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBootSequence } from '@/hooks/useBootSequence'
import { SetupScreen } from './SetupScreen'

interface Props {
  onReady: () => void
}

export function BootSequence({ onReady }: Props) {
  const { frame, message, error } = useBootSequence()
  const [skipped, setSkipped] = useState(false)

  useEffect(() => {
    if (frame === 'done' && !skipped) {
      const t = window.setTimeout(onReady, 200)
      return () => window.clearTimeout(t)
    }
  }, [frame, onReady, skipped])

  useEffect(() => {
    const skip = (e: KeyboardEvent) => {
      if (frame === 'init' || frame === 'verify') return
      if (frame === 'setup' || frame === 'error') return
      setSkipped(true)
      onReady()
      window.removeEventListener('keydown', skip)
      void e
    }
    window.addEventListener('keydown', skip)
    return () => window.removeEventListener('keydown', skip)
  }, [frame, onReady])

  if (frame === 'setup') {
    return <SetupScreen onSubmitted={() => window.location.reload()} />
  }

  if (frame === 'error') {
    return (
      <SetupScreen
        initialError={error ?? 'CONNECTION_LOST'}
        onSubmitted={() => window.location.reload()}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[color:var(--color-void)] text-[color:var(--color-text)]">
      <div className="scanline absolute inset-0 pointer-events-none opacity-50" />
      <div className="relative w-full max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={frame}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {frame === 'init' && (
              <div className="font-pixel text-base tracking-[0.2em] uppercase blink-cursor">
                INITIALIZING…
              </div>
            )}
            {(frame === 'verify' || frame === 'probe' || frame === 'reveal') && (
              <div className="font-mono text-xs text-[color:var(--color-text-mute)] space-y-2">
                <div className="font-pixel text-[color:var(--color-text)] text-sm tracking-wider mb-4">
                  BRAIN_OVERFLOW.OS
                </div>
                <div>&gt; verifying credentials</div>
                {(frame === 'probe' || frame === 'reveal') && (
                  <div>&gt; probing supabase</div>
                )}
                {frame === 'reveal' && (
                  <div className="text-[color:var(--color-strong)]">
                    &gt; READY
                  </div>
                )}
                <div className="pt-3 text-[color:var(--color-text-dim)] text-[10px] uppercase tracking-widest">
                  {message}
                </div>
                <div className="pt-2 text-[color:var(--color-text-dim)] text-[10px]">
                  [press any key to skip]
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
