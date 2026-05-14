import { useState, useEffect } from 'react'
import { useAppStore } from '../../stores/appStore'

export default function StatusBar() {
  const [time, setTime] = useState('')
  const recordingState = useAppStore((s) => s.recordingState)
  const bootComplete = useAppStore((s) => s.bootComplete)
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Unix epoch format for atmosphere
      const epoch = Math.floor(now.getTime() / 1000)
      setTime(epoch.toString())
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])
  
  if (!bootComplete) return null
  
  const getStatusIndicator = () => {
    switch (recordingState) {
      case 'listening':
        return <span className="status-dot active" />
      case 'processing':
        return <span className="status-dot processing" />
      case 'completed':
        return <span className="status-dot complete" />
      default:
        return <span className="status-dot" style={{ background: '#2a2a2a' }} />
    }
  }
  
  const getStatusText = () => {
    switch (recordingState) {
      case 'listening':
        return 'LISTENING'
      case 'processing':
        return 'PROCESSING'
      case 'completed':
        return 'COMPLETE'
      default:
        return 'IDLE'
    }
  }
  
  return (
    <div className="fixed top-0 left-0 right-0 z-20 px-6 py-2 flex items-center justify-between text-xs font-mono bg-[#020202]/80 backdrop-blur-sm border-b border-[#2a2a2a]">
      <div className="flex items-center gap-4">
        <span className="text-[#4a4a4a]">BRAIN_OVERFLOW v0.7.3</span>
        <span className="text-[#2a2a2a]">|</span>
        <div className="flex items-center gap-2">
          {getStatusIndicator()}
          <span className="text-[#4a4a4a] uppercase">{getStatusText()}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-[#4a4a4a]">SECTOR 7G</span>
        <span className="text-[#2a2a2a]">|</span>
        <span className="text-[#4a4a4a]">TS: {time}</span>
      </div>
    </div>
  )
}
