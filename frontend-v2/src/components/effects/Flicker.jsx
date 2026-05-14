import { useState, useEffect } from 'react'

export default function Flicker() {
  const [opacity, setOpacity] = useState(0.97)
  
  useEffect(() => {
    const flicker = () => {
      const newOpacity = 0.95 + Math.random() * 0.04
      setOpacity(newOpacity)
      
      // Random interval between 50-200ms
      const nextInterval = 50 + Math.random() * 150
      setTimeout(flicker, nextInterval)
    }
    
    const timeout = setTimeout(flicker, 100)
    return () => clearTimeout(timeout)
  }, [])
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[95]"
      style={{ 
        opacity,
        background: 'transparent',
        transition: 'opacity 0.05s'
      }}
      aria-hidden="true"
    />
  )
}
