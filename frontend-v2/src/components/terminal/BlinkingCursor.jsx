import { useState, useEffect } from 'react'

export default function BlinkingCursor({ 
  active = true, 
  className = '',
  style = 'block' // 'block' | 'underline' | 'line'
}) {
  const [visible, setVisible] = useState(true)
  
  useEffect(() => {
    if (!active) {
      setVisible(true)
      return
    }
    
    const baseInterval = 530
    const variance = 100
    
    let timeoutId
    
    const blink = () => {
      setVisible(v => !v)
      const nextInterval = baseInterval + (Math.random() - 0.5) * variance * 2
      timeoutId = setTimeout(blink, Math.max(300, nextInterval))
    }
    
    timeoutId = setTimeout(blink, baseInterval)
    
    return () => clearTimeout(timeoutId)
  }, [active])
  
  const cursorStyles = {
    block: 'w-2 h-4',
    underline: 'w-2 h-0.5 mt-3',
    line: 'w-0.5 h-4'
  }
  
  return (
    <span 
      className={`inline-block bg-current align-middle ${cursorStyles[style]} ${className}`}
      style={{ 
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.05s'
      }}
    />
  )
}
