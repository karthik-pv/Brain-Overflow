import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { VoiceRecorder } from '@/components/recorder/VoiceRecorder'
import { IdeaCard } from '@/components/idea/IdeaCard'
import { listRecentIdeas } from '@/lib/api/ideas'
import type { Idea } from '@/types'

const TELEGRAM_BOT = 'brain_overflow_bot'
const TELEGRAM_URL = `https://t.me/${TELEGRAM_BOT}`

export function LandingPage() {
  const [recent, setRecent] = useState<Idea[]>([])

  useEffect(() => {
    listRecentIdeas(6).then(setRecent).catch(() => {})
  }, [])

  return (
    <div className="relative min-h-[100dvh] pt-20 pb-32 px-4 md:px-8">
      {/* Telegram alert — inline on mobile, fixed top-right on md+ */}
      <div className="md:fixed md:top-4 md:right-4 z-40 flex items-start gap-2 max-w-sm mb-6 md:mb-0">
        <div
          role="alert"
          className="flex-1 border border-[color:var(--color-pivot)]/40 bg-[color:var(--color-deep)]/90 backdrop-blur-md p-3 md:p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-4 w-4 text-[color:var(--color-pivot)]" />
            <span className="font-pixel text-[11px] md:text-[12px] tracking-[0.18em] uppercase text-[color:var(--color-pivot)]">
              Record via Telegram
            </span>
          </div>
          <p className="font-mono text-[11px] md:text-xs text-[color:var(--color-text-mute)] leading-relaxed mb-3">
            Speak ideas to <span className="text-[color:var(--color-text)]">@{TELEGRAM_BOT}</span> — they appear here instantly. Use keyboard TTS to dictate.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-pixel text-[10px] md:text-[11px] tracking-[0.18em] uppercase bg-[color:var(--color-pivot)] text-[color:var(--color-void)] px-3 md:px-4 py-1.5 md:py-2 hover:opacity-90 transition-opacity"
          >
            <Send className="h-3 w-3 md:h-3.5" />
            Open Bot
          </a>
        </div>
        <TelegramInstructionsPopover />
      </div>

      <div className="mx-auto max-w-5xl flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="text-center mb-12 relative"
        >
          <div className="absolute inset-x-[-3rem] inset-y-[-2rem] bg-[color:var(--color-void)]/50 backdrop-blur-sm -z-10 rounded-sm" />
          <h1 className="font-pixel text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] tracking-[0.06em] text-[color:var(--color-text)] blink-cursor">
            BRAIN_OVERFLOW
          </h1>
          <p className="mt-4 font-mono text-base text-[color:var(--color-text)] opacity-80 max-w-xl mx-auto">
            an abandoned operating system for thinkers and dreamers.
            <br />
            speak an idea — the machine remembers.
          </p>
        </motion.div>

        <VoiceRecorder />

        {recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="mt-20 w-full"
          >
            <div className="mb-5 flex items-baseline justify-between">
              <h2 className="font-pixel text-xs tracking-[0.25em] uppercase text-[color:var(--color-text-mute)]">
                RECENT_TRANSMISSIONS
              </h2>
              <span className="font-mono text-[10px] text-[color:var(--color-text-dim)]">
                last {recent.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recent.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} compact />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
