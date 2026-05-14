import { useState, useRef, useCallback } from 'react'

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)
  
  const start = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return false
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    
    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      setInterimTranscript('')
    }
    
    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interim = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript)
      }
      setInterimTranscript(interim)
    }
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }
    
    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')
    }
    
    recognitionRef.current = recognition
    recognition.start()
    
    return true
  }, [])
  
  const stop = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
    setInterimTranscript('')
    return transcript
  }, [transcript])
  
  const reset = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])
  
  return {
    transcript,
    interimTranscript,
    isListening,
    start,
    stop,
    reset,
    fullTranscript: transcript + interimTranscript
  }
}
