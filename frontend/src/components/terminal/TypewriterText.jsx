import { useState, useEffect, useRef, useCallback } from 'react'

export default function TypewriterText({ 
  text, 
  speed = 60, 
  variance = 20, 
  onComplete,
  className = '',
  showCursor = false 
}) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)
  const timeoutRef = useRef(null)
  
  const calculateDelay = useCallback((char) => {
    let delay = speed + (Math.random() - 0.5) * variance * 2
    
    // Punctuation pauses
    if ('.!?'.includes(char)) delay *= 2.5
    if (',;'.includes(char)) delay *= 1.5
    if (char === ' ') delay *= 0.8
    
    return Math.max(10, delay)
  }, [speed, variance])
  
  useEffect(() => {
    indexRef.current = 0
    setDisplayedText('')
    setIsComplete(false)
    
    const typeNext = () => {
      if (indexRef.current >= text.length) {
        setIsComplete(true)
        onComplete?.()
        return
      }
      
      const char = text[indexRef.current]
      const delay = calculateDelay(char)
      
      timeoutRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + char)
        indexRef.current++
        typeNext()
      }, delay)
    }
    
    typeNext()
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, calculateDelay, onComplete])
  
  return (
    <span className={className}>
      {displayedText}
      {showCursor && !isComplete && (
        <span className="inline-block w-2 h-4 bg-current cursor-blink ml-0.5 align-middle" />
      )}
    </span>
  )
}
