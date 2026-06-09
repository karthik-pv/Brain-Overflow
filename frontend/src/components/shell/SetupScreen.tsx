import { useState } from 'react'
import { motion } from 'framer-motion'
import DotPattern from '@/components/ui/dot-pattern-1'
import AnimatedGenerateButton from '@/components/ui/animated-generate-button-shadcn-tailwind'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { setLocalCredentials } from '@/lib/supabase'

interface Props {
  initialError?: string
  onSubmitted: () => void
}

export function SetupScreen({ initialError, onSubmitted }: Props) {
  const [url, setUrl] = useState('')
  const [key, setKey] = useState('')
  const [err, setErr] = useState(initialError ?? '')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim() || !key.trim()) {
      setErr('Both fields required')
      return
    }
    setBusy(true)
    setErr('')
    try {
      setLocalCredentials(url.trim(), key.trim())
      onSubmitted()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to save credentials')
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[color:var(--color-void)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="relative border border-[color:var(--color-edge-glow)] p-8 bg-[color:var(--color-deep)]/80 backdrop-blur-md">
          <DotPattern
            width={5}
            height={5}
            className="fill-[color:var(--color-edge-glow)] opacity-60"
          />
          {/* Corner ticks */}
          <span className="absolute -left-1 -top-1 h-2 w-2 bg-[color:var(--color-text)]" />
          <span className="absolute -bottom-1 -left-1 h-2 w-2 bg-[color:var(--color-text)]" />
          <span className="absolute -right-1 -top-1 h-2 w-2 bg-[color:var(--color-text)]" />
          <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[color:var(--color-text)]" />

          <div className="relative">
            <div className="font-pixel text-xs tracking-[0.25em] text-[color:var(--color-text-mute)] uppercase mb-2">
              BRAIN_OVERFLOW.OS
            </div>
            <h1 className="font-pixel text-xl tracking-wider mb-6">// CONNECT</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="sb_url">SUPABASE_URL</Label>
                <Input
                  id="sb_url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://xxx.supabase.co"
                  className="mt-2"
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="sb_key">PUBLISHABLE_KEY</Label>
                <Input
                  id="sb_key"
                  type="password"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="sb_publishable_..."
                  className="mt-2"
                />
              </div>

              {err && (
                <div className="text-xs font-mono text-[color:var(--color-weak)] border border-[color:var(--color-weak)]/30 px-3 py-2">
                  ! {err}
                </div>
              )}

              <div className="pt-2 flex flex-col items-start gap-3">
                <button type="submit" className="contents" disabled={busy}>
                  <AnimatedGenerateButton
                    labelIdle="CONNECT"
                    labelActive="LINKING"
                    generating={busy}
                    highlightHueDeg={320}
                  />
                </button>
                <p className="text-[10px] font-mono text-[color:var(--color-text-dim)] leading-relaxed">
                  Nothing is stored on our servers — this connects you directly to your own Supabase DB. Your ideas stay with you, no one else has access.
                </p>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
