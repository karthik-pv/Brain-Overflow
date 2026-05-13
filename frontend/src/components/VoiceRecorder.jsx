import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, Stop, PaperPlaneRight, Spinner, Warning } from '@phosphor-icons/react'
import ParticleCanvas from './ParticleCanvas'
import { useAudioVisualizer } from '../hooks/useAudioVisualizer'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { getSupabase } from '../lib/supabase.js'

const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
}

export default function VoiceRecorder({ onIdeaCreated }) {
  const [state, setState] = useState(STATES.IDLE)
  const [error, setError] = useState('')
  const [frequencyData, setFrequencyData] = useState(null)
  const [editableTranscript, setEditableTranscript] = useState('')
  const { start: startAudio, stop: stopAudio } = useAudioVisualizer()
  const { transcript, interimTranscript, isListening, start: startSpeech, stop: stopSpeech, reset: resetSpeech } = useSpeechRecognition()
  const containerRef = useRef(null)

  const fullTranscript = transcript + interimTranscript

  const handleStart = useCallback(async () => {
    setError('')
    setState(STATES.LISTENING)
    resetSpeech()

    const audioStarted = await startAudio((data) => {
      setFrequencyData(new Uint8Array(data))
    })

    if (!audioStarted) {
      setError('Microphone access denied. Please allow microphone permissions.')
      setState(STATES.ERROR)
      return
    }

    const speechStarted = startSpeech()
    if (!speechStarted) {
      setError('Speech recognition not supported in this browser.')
      setState(STATES.ERROR)
      stopAudio()
    }
  }, [startAudio, startSpeech, resetSpeech, stopAudio])

  const handleStop = useCallback(() => {
    stopAudio()
    stopSpeech()
    setFrequencyData(null)
    setEditableTranscript(fullTranscript.trim())
    setState(STATES.IDLE)
  }, [stopAudio, stopSpeech, fullTranscript])

  const handleSubmit = useCallback(async () => {
    const text = editableTranscript || fullTranscript
    if (!text.trim()) {
      setError('Please speak or type your idea first.')
      setState(STATES.ERROR)
      return
    }

    setState(STATES.PROCESSING)
    setError('')

    try {
      const supabase = getSupabase()

      // Get default flow
      const { data: flows } = await supabase
        .from('flows')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)

      const flowId = flows?.[0]?.id || null

      // Create idea
      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .insert({
          idea: text.trim(),
          flow_id: flowId,
          status: flowId ? 'recorded' : 'completed',
        })
        .select('id')
        .single()

      if (ideaError) throw ideaError

      // Store initial message
      await supabase.from('chat_messages').insert({
        idea_id: idea.id,
        message: text.trim(),
        role: 'user',
        sequence_number: 1,
      })

      if (flowId) {
        // Trigger processing
        await supabase.from('ideas').update({ status: 'processing' }).eq('id', idea.id)

        const url = localStorage.getItem('sb_url')
        const key = localStorage.getItem('sb_key')
        await fetch(`${url}/functions/v1/process-prompt`, {
          method: 'POST',
          headers: { apikey: key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea_id: idea.id, prompt_index: 0 }),
        })
      }

      setState(STATES.COMPLETED)
      if (onIdeaCreated) onIdeaCreated(idea.id)

      // Reset after delay
      setTimeout(() => {
        setState(STATES.IDLE)
        resetSpeech()
        setEditableTranscript('')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit idea')
      setState(STATES.ERROR)
    }
  }, [editableTranscript, fullTranscript, onIdeaCreated, resetSpeech])

  const isListeningState = state === STATES.LISTENING
  const isProcessing = state === STATES.PROCESSING
  const isCompleted = state === STATES.COMPLETED
  const hasError = state === STATES.ERROR

  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
      {/* Visualizer */}
      <div className="relative mb-8">
        <AnimatePresence>
          {isListeningState && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <ParticleCanvas
                frequencyData={frequencyData}
                isListening={isListeningState}
                size={320}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Button */}
        <motion.button
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListeningState
              ? 'bg-[rgba(255,71,87,0.2)] border-2 border-[#ff4757]'
              : isProcessing
              ? 'bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.3)]'
              : 'bg-[rgba(0,212,255,0.15)] border-2 border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.25)] hover:border-[rgba(0,212,255,0.5)]'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isListeningState ? handleStop : isProcessing ? undefined : handleStart}
          disabled={isProcessing}
        >
          {isListeningState ? (
            <Stop weight="fill" className="w-8 h-8 text-[#ff4757]" />
          ) : isProcessing ? (
            <Spinner className="w-8 h-8 text-[#00d4ff] animate-spin" />
          ) : (
            <Microphone weight="fill" className="w-8 h-8 text-[#00d4ff]" />
          )}

          {/* Pulse ring when listening */}
          {isListeningState && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-[#ff4757]"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </motion.button>
      </div>

      {/* Status Text */}
      <motion.p
        className="text-sm font-mono tracking-wider uppercase mb-6"
        style={{ color: 'var(--color-text-muted)' }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {isListeningState && 'Listening...'}
        {isProcessing && 'Analyzing your idea...'}
        {isCompleted && 'Idea captured!'}
        {hasError && 'Error occurred'}
        {state === STATES.IDLE && 'Tap to speak your idea'}
      </motion.p>

      {/* Transcript Area */}
      <AnimatePresence mode="wait">
        {(isListeningState || editableTranscript || fullTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="w-full liquid-glass rounded-2xl p-6 mb-6"
          >
            {isListeningState ? (
              <p className="text-base leading-relaxed min-h-[80px]">
                {fullTranscript}
                <span className="animate-pulse text-[#00d4ff]">|</span>
              </p>
            ) : (
              <textarea
                value={editableTranscript || fullTranscript}
                onChange={(e) => setEditableTranscript(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-base leading-relaxed resize-none min-h-[80px]"
                placeholder="Your idea will appear here..."
                rows={4}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <AnimatePresence>
        {(editableTranscript || fullTranscript) && !isListeningState && !isProcessing && !isCompleted && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] font-medium hover:bg-[rgba(0,212,255,0.25)] transition-colors"
          >
            <PaperPlaneRight weight="fill" className="w-5 h-5" />
            Analyze Idea
          </motion.button>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-4 text-[#ff4757] text-sm"
          >
            <Warning className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
