import { useState, useCallback, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useAudioVisualizer } from '../../hooks/useAudioVisualizer'
import { getSupabase, isConfigured } from '../../lib/supabase'
import BlinkingCursor from './BlinkingCursor'

const STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
}

export default function VoiceRecorder({ onComplete, onCancel }) {
  const [state, setState] = useState(STATES.IDLE)
  const [error, setError] = useState('')
  const [manualText, setManualText] = useState('')
  const [showManual, setShowManual] = useState(false)
  
  const setRecordingState = useAppStore((s) => s.setRecordingState)
  
  const { start: startAudio, stop: stopAudio, frequencyData } = useAudioVisualizer()
  const {
    transcript,
    interimTranscript,
    isListening,
    start: startSpeech,
    stop: stopSpeech,
    reset: resetSpeech,
    fullTranscript
  } = useSpeechRecognition()
  
  const handleStart = useCallback(async () => {
    setError('')
    setState(STATES.LISTENING)
    setManualText('')
    resetSpeech()
    setRecordingState('listening')
    
    const audioStarted = await startAudio()
    if (!audioStarted) {
      setError('Microphone access denied. Please allow microphone permissions or type your idea below.')
      setState(STATES.IDLE)
      setShowManual(true)
      setRecordingState('idle')
      return
    }
    
    const speechStarted = startSpeech()
    if (!speechStarted) {
      setError('Speech recognition not supported. Please type your idea below.')
      stopAudio()
      setState(STATES.IDLE)
      setShowManual(true)
      setRecordingState('idle')
    }
  }, [startAudio, startSpeech, resetSpeech, stopAudio, setRecordingState])
  
  const handleStop = useCallback(async () => {
    stopAudio()
    const capturedTranscript = await stopSpeech()
    setState(STATES.IDLE)
    setRecordingState('idle')
    
    if (capturedTranscript.trim()) {
      setManualText(capturedTranscript.trim())
      setShowManual(true)
    } else {
      setShowManual(true)
    }
  }, [stopAudio, stopSpeech, setRecordingState])
  
  const handleSubmit = useCallback(async () => {
    const text = manualText || fullTranscript
    if (!text.trim()) {
      setError('Please speak or type your idea first.')
      setState(STATES.ERROR)
      return
    }
    
    if (!isConfigured()) {
      setError('Supabase not configured. Run "setup" command first.')
      setState(STATES.ERROR)
      return
    }
    
    setState(STATES.PROCESSING)
    setError('')
    setRecordingState('processing')
    
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
      
      // Trigger processing if flow exists
      if (flowId) {
        await supabase.from('ideas').update({ status: 'processing' }).eq('id', idea.id)
        
        const url = localStorage.getItem('sb_url')
        const key = localStorage.getItem('sb_key')
        
        fetch(`${url}/functions/v1/process-prompt`, {
          method: 'POST',
          headers: { apikey: key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ idea_id: idea.id, prompt_index: 0 }),
        }).catch(err => console.error('Process prompt error:', err))
      }
      
      setState(STATES.COMPLETED)
      setRecordingState('completed')
      
      setTimeout(() => {
        onComplete?.(idea.id)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to submit idea')
      setState(STATES.ERROR)
      setRecordingState('idle')
    }
  }, [manualText, fullTranscript, setRecordingState, onComplete])
  
  const isListeningState = state === STATES.LISTENING
  const isProcessing = state === STATES.PROCESSING
  const isCompleted = state === STATES.COMPLETED
  const hasError = state === STATES.ERROR
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio()
      setRecordingState('idle')
    }
  }, [stopAudio, setRecordingState])
  
  return (
    <div className="font-mono text-sm">
      {/* Status */}
      <div className="mb-4">
        {isListeningState && (
          <div className="flex items-center gap-2 text-[#00f3ff]">
            <span className="status-dot active" />
            <span>LISTENING — SPEAK YOUR IDEA</span>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-[#ffb000]">
            <span className="status-dot processing" />
            <span>PROCESSING TRANSMISSION...</span>
          </div>
        )}
        {isCompleted && (
          <div className="flex items-center gap-2 text-[#50ff50]">
            <span className="status-dot complete" />
            <span>TRANSMISSION ARCHIVED.</span>
          </div>
        )}
        {hasError && (
          <div className="flex items-center gap-2 text-[#ff3030]">
            <span className="status-dot error" />
            <span>ERROR: {error}</span>
          </div>
        )}
        {state === STATES.IDLE && !showManual && (
          <div className="flex items-center gap-2 text-[#4a4a4a]">
            <span className="status-dot" style={{ background: '#2a2a2a' }} />
            <span>READY TO RECORD</span>
          </div>
        )}
      </div>
      
      {/* Audio Visualizer */}
      {isListeningState && frequencyData && (
        <div className="mb-4 h-16 flex items-end gap-0.5">
          {Array.from(frequencyData.slice(0, 64)).map((value, i) => (
            <div
              key={i}
              className="flex-1 bg-[#00f3ff] opacity-50"
              style={{
                height: `${(value / 255) * 100}%`,
                opacity: 0.2 + (value / 255) * 0.6
              }}
            />
          ))}
        </div>
      )}
      
      {/* Transcript Display */}
      {isListeningState && (
        <div className="mb-4 p-3 border border-[#2a2a2a] bg-[#0a0a0f] min-h-[80px]">
          <p className="text-[#e0e0e0]">
            {fullTranscript}
            <BlinkingCursor active={true} style="block" className="text-[#00f3ff]" />
          </p>
          {!fullTranscript && (
            <p className="text-[#4a4a4a] text-xs mt-2">Start speaking... your words will appear here</p>
          )}
        </div>
      )}
      
      {/* Manual Input */}
      {(showManual || hasError) && !isCompleted && (
        <div className="mb-4">
          <label className="text-xs text-[#4a4a4a] uppercase tracking-wider mb-2 block">
            {manualText ? 'Your Idea (editable)' : 'Type Your Idea'}
          </label>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#2a2a2a] p-3 text-sm font-mono text-[#e0e0e0] outline-none focus:border-[#00f3ff] resize-none"
            style={{ fontFamily: 'var(--font-mono)' }}
            placeholder="Describe your startup idea here..."
            rows={4}
          />
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center gap-3">
        {state === STATES.IDLE && !showManual && (
          <button
            onClick={handleStart}
            className="px-4 py-2 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors font-mono text-xs uppercase tracking-wider"
          >
            ● START RECORDING
          </button>
        )}
        
        {isListeningState && (
          <button
            onClick={handleStop}
            className="px-4 py-2 border border-[#ff3030] text-[#ff3030] hover:bg-[#ff3030]/10 transition-colors font-mono text-xs uppercase tracking-wider"
          >
            ■ STOP RECORDING
          </button>
        )}
        
        {(showManual || manualText) && !isProcessing && !isCompleted && (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 border border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff]/10 transition-colors font-mono text-xs uppercase tracking-wider"
          >
            → SUBMIT IDEA
          </button>
        )}
        
        {state === STATES.IDLE && (
          <button
            onClick={() => {
              setShowManual(!showManual)
              if (!showManual) setManualText('')
            }}
            className="px-4 py-2 border border-[#2a2a2a] text-[#4a4a4a] hover:border-[#4a4a4a] transition-colors font-mono text-xs uppercase tracking-wider"
          >
            {showManual ? 'HIDE INPUT' : 'TYPE INSTEAD'}
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-[#2a2a2a] text-[#4a4a4a] hover:border-[#4a4a4a] transition-colors font-mono text-xs uppercase tracking-wider"
        >
          CANCEL
        </button>
      </div>
    </div>
  )
}
