import { useState, useRef, useCallback } from 'react'

export function useAudioVisualizer() {
  const [frequencyData, setFrequencyData] = useState(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const sourceRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  const start = useCallback(async (onData) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const analyze = () => {
        analyser.getByteFrequencyData(dataArray)
        setFrequencyData(new Uint8Array(dataArray))
        onData?.(dataArray)
        animationFrameRef.current = requestAnimationFrame(analyze)
      }
      
      analyze()
      return true
    } catch (err) {
      console.error('Audio visualizer error:', err)
      return false
    }
  }, [])
  
  const stop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect()
    }
    
    setFrequencyData(null)
  }, [])
  
  return { frequencyData, start, stop }
}
