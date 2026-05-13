import { useState, useRef, useCallback, useEffect } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const interimRef = useRef('')

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported')
      return false
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      if (final) {
        setTranscript(prev => prev + final)
      }
      setInterimTranscript(interim)
      interimRef.current = interim
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      // NOTE: We intentionally do NOT clear interim here.
      // The stop() function will append it to the final transcript.
    }

    recognitionRef.current = recognition
    recognition.start()
    return true
  }, [])

  const stop = useCallback(() => {
    // CRITICAL FIX: Append any remaining interim transcript to final
    // before stopping, so we don't lose the last words spoken.
    const remainingInterim = interimRef.current.trim()
    if (remainingInterim) {
      setTranscript(prev => {
        const combined = (prev + ' ' + remainingInterim).trim()
        return combined
      })
      interimRef.current = ''
      setInterimTranscript('')
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    interimRef.current = ''
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    start,
    stop,
    reset,
    fullTranscript: transcript + interimTranscript,
  }
}
