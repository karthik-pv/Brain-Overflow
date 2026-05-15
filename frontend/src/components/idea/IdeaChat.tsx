import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { User, Bot } from 'lucide-react'
import type { ChatMessage, Idea } from '@/types'
import { PromptInputBox } from '@/components/ui/ai-prompt-box'
import { createCustomChatPrompt } from '@/lib/api/prompts'
import { updateIdeaStatus } from '@/lib/api/ideas'
import { triggerProcessPrompt } from '@/lib/api/edgeFn'

interface Props {
  ideaId: string
  idea: Idea
  messages: ChatMessage[]
  onUpdate?: () => void
}

const ROLE_META = {
  idea: { label: 'YOU', Icon: User },
  response: { label: 'AI', Icon: Bot },
} as const

export function IdeaChat({ ideaId, idea, messages, onUpdate }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const visible = messages.filter((m) => m.message_type !== 'prompt')
  const isProcessing = idea.status === 'processing'

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(text: string) {
    if (!text.trim()) return
    try {
      const prompt = await createCustomChatPrompt(text)
      await updateIdeaStatus(ideaId, 'processing')
      await triggerProcessPrompt(ideaId, { customPromptId: prompt.id })
      onUpdate?.()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        {visible.length === 0 && !isProcessing && (
          <p className="font-mono text-sm text-[color:var(--color-text-mute)] text-center py-12">
            no transmissions yet. waiting on the chain…
          </p>
        )}
        {visible.map((msg, i) => {
          const meta = ROLE_META[msg.message_type as keyof typeof ROLE_META] ?? ROLE_META.idea
          const Icon = meta.Icon
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.24 }}
              className="border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/40 backdrop-blur p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-3.5 w-3.5 text-[color:var(--color-text-mute)]" />
                <span className="font-pixel text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
                  {meta.label}
                </span>
                <span className="ml-auto font-mono text-[10px] text-[color:var(--color-text-dim)]">
                  #{msg.sequence_number}
                </span>
              </div>
              {msg.message_type === 'response' ? (
                <div className="prose-os text-sm">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message}</ReactMarkdown>
                </div>
              ) : (
                <p className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.message}
                </p>
              )}
            </motion.div>
          )
        })}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border border-[color:var(--color-edge-glow)] bg-[color:var(--color-surface)]/30 px-4 py-3 flex items-center gap-3"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[color:var(--color-pivot)] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[color:var(--color-pivot)]" />
            </span>
            <span className="font-pixel text-[10px] tracking-[0.2em] uppercase text-[color:var(--color-text-mute)]">
              ANALYZING…
            </span>
          </motion.div>
        )}
        <div ref={ref} />
      </div>

      {!isProcessing && visible.length > 0 && (
        <PromptInputBox
          placeholder="continue the thought…"
          onSend={(msg) => handleSend(msg)}
        />
      )}
    </div>
  )
}
