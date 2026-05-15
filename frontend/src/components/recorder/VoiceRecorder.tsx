import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Keyboard, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAudioVisualizer } from '@/hooks/useAudioVisualizer'
import { AudioVisualizer } from './AudioVisualizer'
import { IdeateButton } from './IdeateButton'
import { createIdea, updateIdeaStatus } from '@/lib/api/ideas'
import { insertIdeaMessage } from '@/lib/api/chatMessages'
import { getDefaultFlow } from '@/lib/api/flows'
import { triggerProcessPrompt } from '@/lib/api/edgeFn'

type State = 'idle' | 'listening' | 'analyzing' | 'captured' | 'error'

interface Props {
  onRecordingStateChange?: (recording: boolean) => void
}

export function VoiceRecorder({ onRecordingStateChange }: Props) {
  const navigate = useNavigate()
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null)
  const [showManual, setShowManual] = useState(false)
  const [manualText, setManualText] = useState('')
  const [editable, setEditable] = useState('')

  const { start: startAudio, stop: stopAudio } = useAudioVisualizer()
  const {
    fullTranscript,
    start: startSpeech,
    stop: stopSpeech,
    reset: resetSpeech,
  } = useSpeechRecognition()

  useEffect(() => {
    onRecordingStateChange?.(state === 'listening')
  }, [state, onRecordingStateChange])

  const handleStart = useCallback(async () => {
    setError('')
    setEditable('')
    setManualText('')
    resetSpeech()
    setState('listening')

    const audioOk = await startAudio((data) => setFrequencyData(new Uint8Array(data)))
    if (!audioOk) {
      setError('Microphone denied. Type your idea instead.')
      setShowManual(true)
      setState('idle')
      return
    }
    const speechOk = startSpeech()
    if (!speechOk) {
      stopAudio()
      setError('Speech recognition unsupported. Type your idea instead.')
      setShowManual(true)
      setState('idle')
    }
  }, [startAudio, startSpeech, resetSpeech, stopAudio])

  const handleStop = useCallback(async () => {
    stopAudio()
    const captured = (await stopSpeech()).trim()
    setFrequencyData(null)
    setEditable(captured)
    setState('idle')
    if (!captured) setShowManual(true)
  }, [stopAudio, stopSpeech])

  const handleSubmit = useCallback(async () => {
    const text = editable || manualText
    if (!text.trim()) {
      setError('Speak or type your idea first.')
      return
    }
    setState('analyzing')
    setError('')

    try {
      const flow = await getDefaultFlow()
      const flowId = flow?.id ?? null
      const idea = await createIdea(text, flowId)
      await insertIdeaMessage(idea.id, text)
      if (flowId) {
        await updateIdeaStatus(idea.id, 'processing')
        await triggerProcessPrompt(idea.id, { promptIndex: 0 })
      }
      setState('captured')
      window.setTimeout(() => {
        navigate(`/idea/${idea.id}`)
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit idea')
      setState('error')
    }
  }, [editable, manualText, navigate])

  const hasTranscript = !!(editable || manualText).trim()
  const ideateState =
    state === 'listening' ? 'recording' : state === 'analyzing' ? 'analyzing' : 'idle'

  return (
    <div className="relative flex flex-col items-center gap-7">
      <div className="relative h-[280px] w-[280px] flex items-center justify-center">
        <AudioVisualizer
          frequencyData={frequencyData}
          active={state === 'listening'}
          size={280}
        />
        <button
          type="button"
          onClick={state === 'listening' ? handleStop : handleStart}
          disabled={state === 'analyzing'}
          className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 grid h-20 w-20 place-items-center rounded-full border border-[color:var(--color-edge-glow)] bg-[color:var(--color-deep)]/80 backdrop-blur transition-all hover:border-[color:var(--color-text-mute)] disabled:opacity-50"
          aria-label={state === 'listening' ? 'Stop recording' : 'Start recording'}
        >
          {state === 'listening' ? (
            <MicOff className="h-7 w-7 text-[color:var(--color-text)]" />
          ) : (
            <Mic className="h-7 w-7 text-[color:var(--color-text)]" />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {(state === 'listening' || hasTranscript || showManual) && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
            className="w-full max-w-2xl border border-[color:var(--color-edge)] bg-[color:var(--color-surface)]/60 backdrop-blur p-5"
          >
            {state === 'listening' ? (
              <div className="min-h-[80px]">
                <p className="font-mono text-sm leading-relaxed text-[color:var(--color-text)]">
                  {fullTranscript || (
                    <span className="text-[color:var(--color-text-mute)] italic">Start speaking… words land here.</span>
                  )}
                  <span className="blink-cursor" />
                </p>
              </div>
            ) : (
              <div>
                <div className="font-pixel text-[10px] tracking-[0.18em] uppercase text-[color:var(--color-text-mute)] mb-2">
                  {editable ? 'IDEA — EDITABLE' : 'TYPE YOUR IDEA'}
                </div>
                <textarea
                  value={editable || manualText}
                  onChange={(e) => {
                    if (editable) setEditable(e.target.value)
                    else setManualText(e.target.value)
                  }}
                  rows={4}
                  className="w-full bg-transparent border-0 outline-none font-mono text-sm leading-relaxed resize-none min-h-[80px] placeholder:text-[color:var(--color-text-dim)]"
                  placeholder="Describe your idea…"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-4">
        <AnimatePresence>
          {hasTranscript && state !== 'listening' && state !== 'captured' && (
            <motion.div
              key="ideate"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              transition={{ duration: 0.24 }}
            >
              <IdeateButton
                state={ideateState}
                onClick={handleSubmit}
                disabled={state === 'analyzing'}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {state === 'captured' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-pixel text-xs tracking-[0.2em] uppercase text-[color:var(--color-strong)]"
          >
            IDEA CAPTURED → ROUTING
          </motion.p>
        )}

        {state !== 'listening' && state !== 'analyzing' && state !== 'captured' && (
          <button
            type="button"
            onClick={() => {
              setShowManual((v) => !v)
              if (!showManual) {
                setEditable('')
                setManualText('')
              }
            }}
            className="flex items-center gap-2 font-mono text-xs text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)] transition-colors"
          >
            <Keyboard className="h-3 w-3" />
            {showManual ? 'hide keyboard' : 'type instead'}
          </button>
        )}

        {error && (
          <p className="font-mono text-xs text-[color:var(--color-weak)] border border-[color:var(--color-weak)]/30 px-3 py-2">
            ! {error}
          </p>
        )}
      </div>
    </div>
  )
}
