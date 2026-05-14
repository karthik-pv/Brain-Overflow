import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'

const BOOT_LINES = [
  { text: 'BRAIN OVERFLOW v0.7.3-alpha-recovered', delay: 200 },
  { text: 'COPYRIGHT (C) 1987-2026 COGNITION SYSTEMS INC.', delay: 400 },
  { text: '', delay: 600 },
  { text: 'MEMORY CHECK: 640K OK', delay: 800 },
  { text: 'EXTENDED MEMORY: 16384K OK', delay: 1000 },
  { text: '', delay: 1200 },
  { text: 'LOADING COGNITION KERNEL... [OK]', delay: 1400 },
  { text: 'MOUNTING THOUGHT_VOLUME... [OK]', delay: 1700 },
  { text: 'INITIALIZING NEURAL PATHWAYS... [OK]', delay: 2000 },
  { text: 'CALIBRATING PHOSPHOR ARRAY... [OK]', delay: 2300 },
  { text: '', delay: 2600 },
  { text: 'AN IDEA THAT IS NOT DANGEROUS', delay: 2800, style: 'quote' },
  { text: 'IS UNWORTHY OF BEING CALLED AN IDEA AT ALL.', delay: 3200, style: 'quote' },
  { text: '', delay: 3600 },
  { text: '    — OSCAR WILDE', delay: 3800, style: 'attribution' },
  { text: '', delay: 4200 },
  { text: 'SYSTEM READY.', delay: 4500, style: 'system' },
  { text: 'LAST BOOT: 1987-03-15 02:13:47', delay: 4700, style: 'system' },
  { text: '', delay: 4900 },
]

export default function BootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState([])
  const [showCursor, setShowCursor] = useState(false)
  const setBootComplete = useAppStore((s) => s.setBootComplete)
  
  useEffect(() => {
    const timers = []
    
    BOOT_LINES.forEach((line, index) => {
      const timer = setTimeout(() => {
        setVisibleLines(prev => [...prev, { ...line, id: index }])
        
        // Show cursor after last line
        if (index === BOOT_LINES.length - 1) {
          setTimeout(() => {
            setShowCursor(true)
            setTimeout(() => {
              setBootComplete(true)
              onComplete?.()
            }, 800)
          }, 400)
        }
      }, line.delay)
      
      timers.push(timer)
    })
    
    return () => timers.forEach(clearTimeout)
  }, [onComplete, setBootComplete])
  
  const getLineStyle = (style) => {
    switch (style) {
      case 'quote':
        return 'text-[#e0e0e0] phosphor-glow'
      case 'attribution':
        return 'text-[#4a4a4a]'
      case 'system':
        return 'text-[#00f3ff] text-xs'
      default:
        return 'text-[#00f3ff]'
    }
  }
  
  return (
    <div className="fixed inset-0 bg-[#020202] z-[100] flex flex-col items-center justify-center font-mono text-sm">
      <div className="w-full max-w-2xl px-8">
        {visibleLines.map((line) => (
          <div
            key={line.id}
            className={`terminal-line prompt ${getLineStyle(line.style)} opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]`}
            style={{ animationDelay: '0ms' }}
          >
            {line.text ? `> ${line.text}` : ''}
          </div>
        ))}
        
        {showCursor && (
          <div className="terminal-line prompt text-[#00f3ff] mt-2">
            {'>'} <span className="inline-block w-2 h-4 bg-[#00f3ff] cursor-blink ml-1" />
          </div>
        )}
      </div>
    </div>
  )
}
