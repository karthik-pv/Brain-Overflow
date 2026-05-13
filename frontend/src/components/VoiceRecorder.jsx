import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Microphone, Stop, PaperPlaneRight, Spinner, Warning, Keyboard } from '@phosphor-icons/react'
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
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualText, setManualText] = useState('')
  
  const { start: startAudio, stop: stopAudio } = useAudioVisualizer()
  const { 
    transcript, 
    interimTranscript, 
    isListening, 
    start: startSpeech, 
    stop: stopSpeech, 
    reset: resetSpeech 
  } = useSpeechRecognition()
  
  // Use ref to avoid stale closure
  const transcriptRef = useRef('')
  const fullTranscript = transcript + interimTranscript
  
  // Keep ref in sync
  useEffect(() => {
    transcriptRef.current = fullTranscript
  }, [fullTranscript])

  const handleStart = useCallback(async () => {
    setError('')
    setState(STATES.LISTENING)
    setEditableTranscript('')
    setManualText('')
    resetSpeech()

    const audioStarted = await startAudio((data) => {
      setFrequencyData(new Uint8Array(data))
    })

    if (!audioStarted) {
      setError('Microphone access denied. Please allow microphone permissions or type your idea below.')
      setState(STATES.IDLE)
      setShowManualInput(true)
      return
    }

    const speechStarted = startSpeech()
    if (!speechStarted) {
      setError('Speech recognition not supported in this browser. Please type your idea below.')
      stopAudio()
      setState(STATES.IDLE)
      setShowManualInput(true)
    }
  }, [startAudio, startSpeech, resetSpeech, stopAudio])

  const handleStop = useCallback(() => {
    stopAudio()
    stopSpeech()
    setFrequencyData(null)
    
    // Use ref to get latest transcript (avoids stale closure)
    const capturedTranscript = transcriptRef.current.trim()
    setEditableTranscript(capturedTranscript)
    setState(STATES.IDLE)
    
    if (!capturedTranscript) {
      setShowManualInput(true)
    }
  }, [stopAudio, stopSpeech])

  const handleSubmit = useCallback(async (textToSubmit) => {
    const text = textToSubmit || editableTranscript || manualText
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
        setManualText('')
        setShowManualInput(false)
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to submit idea')
      setState(STATES.ERROR)
    }
  }, [editableTranscript, manualText, onIdeaCreated, resetSpeech])

  const isListeningState = state === STATES.LISTENING
  const isProcessing = state === STATES.PROCESSING
  const isCompleted = state === STATES.COMPLETED
  const hasError = state === STATES.ERROR
  const hasTranscript = editableTranscript || manualText

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto">
      {/* Main Visualizer Area */}
      <div className="relative flex flex-col items-center justify-center mb-6 w-full">
        {/* Particle Canvas */}
        <div className="relative w-[320px] h-[320px] flex items-center justify-center">
          <AnimatePresence>
            {isListeningState && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <ParticleCanvas
                  frequencyData={frequencyData}
                  isListening={isListeningState}
                  size={320}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Record Button - Always visible, positioned in center */}
          <motion.button
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListeningState
                ? 'bg-[rgba(255,71,87,0.2)] border-2 border-[#ff4757] shadow-[0_0_30px_rgba(255,71,87,0.3)]'
                : isProcessing
                ? 'bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.3)]'
                : 'bg-[rgba(0,212,255,0.15)] border-2 border-[rgba(0,212,255,0.3)] hover:bg-[rgba(0,212,255,0.25)] hover:border-[rgba(0,212,255,0.5)] hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]'
            }`}
            whileHover={!isProcessing ? { scale: 1.08 } : {}}
            whileTap={!isProcessing ? { scale: 0.92 } : {}}
            onClick={isListeningState ? handleStop : isProcessing ? undefined : handleStart}
            disabled={isProcessing}
            style={{ margin: '0 auto' }}
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
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        </div>

        {/* Status Text */}
        <motion.p
          className="text-sm font-mono tracking-widest uppercase mt-4 mb-2"
          style={{ color: 'var(--color-text-muted)' }}
          animate={isListeningState ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isListeningState && 'Listening... Speak your idea'}
          {isProcessing && 'Processing your idea...'}
          {isCompleted && 'Idea captured! Redirecting...'}
          {hasError && 'Something went wrong'}
          {state === STATES.IDLE && !hasTranscript && 'Tap microphone to speak'}
        </motion.p>
      </div>

      {/* Transcript / Manual Input Area */}
      <AnimatePresence mode="wait">
        {(isListeningState || hasTranscript || showManualInput) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="w-full liquid-glass rounded-2xl p-6 mb-6"
          >
            {isListeningState ? (
              <div className="min-h-[100px]">
                <p className="text-base leading-relaxed">
                  {fullTranscript}
                  <span className="animate-pulse text-[#00d4ff] ml-0.5">|</span>
                </p>
                {!fullTranscript && (
                  <p className="text-sm italic mt-2" style={{ color: 'var(--color-text-dim)' }}>
                    Start speaking... your words will appear here
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider mb-2 block" style={{ color: 'var(--color-text-muted)' }}>
                  {editableTranscript ? 'Your Idea (editable)' : 'Type Your Idea'}
                </label>
                <textarea
                  value={editableTranscript || manualText}
                  onChange={(e) => {
                    if (editableTranscript) {
                      setEditableTranscript(e.target.value)
                    } else {
                      setManualText(e.target.value)
                    }
                  }}
                  className="w-full bg-transparent border-none outline-none text-base leading-relaxed resize-none min-h-[100px]"
                  placeholder="Describe your startup idea here..."
                  rows={4}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        <AnimatePresence>
          {hasTranscript && !isListeningState && !isProcessing && !isCompleted && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[rgba(0,212,255,0.15)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] font-medium hover:bg-[rgba(0,212,255,0.25)] transition-all duration-300 shadow-[0_0_20px_rgba(0,212,255,0.1)]"
            >
              <PaperPlaneRight weight="fill" className="w-5 h-5" />
              Analyze Idea
            </motion.button>
          )}
        </AnimatePresence>

        {/* Manual input toggle */}
        {!isListeningState && !isProcessing && !isCompleted && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowManualInput(!showManualInput)
              if (!showManualInput) {
                setEditableTranscript('')
                setManualText('')
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <Keyboard className="w-4 h-4" />
            {showManualInput ? 'Hide Keyboard' : 'Type Instead'}
          </motion.button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 mt-6 p-4 rounded-xl bg-[rgba(255,71,87,0.1)] border border-[rgba(255,71,87,0.2)] text-[#ff4757] text-sm max-w-lg text-center"
          >
            <Warning className="w-5 h-5 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      {state === STATES.IDLE && !hasTranscript && !showManualInput && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center max-w-md"
        >
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
            Speak naturally about your startup idea. Our AI will analyze it using the Paul Graham framework — 
            evaluating market need, competition, and feasibility.
          </p>
        </motion.div>
      )}
    </div>
  )
}
