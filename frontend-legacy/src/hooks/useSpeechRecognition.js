import { useState, useRef, useCallback, useEffect } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  const transcriptRef = useRef('')
  const interimRef = useRef('')
  const stopResolveRef = useRef(null)

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported in this browser')
      return false
    }

    transcriptRef.current = ''
    interimRef.current = ''
    setTranscript('')
    setInterimTranscript('')

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript + ' '
        } else {
          interimChunk += result[0].transcript
        }
      }

      if (finalChunk) {
        transcriptRef.current += finalChunk
        setTranscript(transcriptRef.current)
      }

      interimRef.current = interimChunk
      setInterimTranscript(interimChunk)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      console.error('Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      setIsListening(false)

      const remainingInterim = interimRef.current.trim()
      if (remainingInterim) {
        transcriptRef.current = (transcriptRef.current + ' ' + remainingInterim).trim()
        interimRef.current = ''
      }

      setTranscript(transcriptRef.current)
      setInterimTranscript('')

      if (stopResolveRef.current) {
        stopResolveRef.current(transcriptRef.current)
        stopResolveRef.current = null
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
      return true
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      return false
    }
  }, [])

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      return new Promise((resolve) => {
        stopResolveRef.current = resolve
        try {
          recognitionRef.current.stop()
        } catch (e) {
          stopResolveRef.current = null
          const remainingInterim = interimRef.current.trim()
          if (remainingInterim) {
            transcriptRef.current = (transcriptRef.current + ' ' + remainingInterim).trim()
            interimRef.current = ''
          }
          resolve(transcriptRef.current)
        }
        recognitionRef.current = null
      })
    }

    const remainingInterim = interimRef.current.trim()
    if (remainingInterim) {
      transcriptRef.current = (transcriptRef.current + ' ' + remainingInterim).trim()
      interimRef.current = ''
    }
    setTranscript(transcriptRef.current)
    setInterimTranscript('')
    setIsListening(false)
    return Promise.resolve(transcriptRef.current)
  }, [])

  const reset = useCallback(() => {
    transcriptRef.current = ''
    interimRef.current = ''
    setTranscript('')
    setInterimTranscript('')
  }, [])

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) { }
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
