import { useState, useEffect } from 'react'
import { useAppStore } from './stores/appStore'
import BootSequence from './components/terminal/BootSequence'
import Terminal from './components/terminal/Terminal'
import StatusBar from './components/ui/StatusBar'
import Scanlines from './components/effects/Scanlines'
import Vignette from './components/effects/Vignette'
import NoiseOverlay from './components/effects/NoiseOverlay'
import Flicker from './components/effects/Flicker'
import CanvasLayer from './components/layout/CanvasLayer'

export default function App() {
  const [showBoot, setShowBoot] = useState(true)
  const bootComplete = useAppStore((s) => s.bootComplete)
  
  const handleBootComplete = () => {
    setTimeout(() => {
      setShowBoot(false)
    }, 500)
  }
  
  return (
    <div className="relative w-screen h-screen bg-[#020202] overflow-hidden">
      {/* WebGL Background */}
      <CanvasLayer />
      
      {/* Visual Effects */}
      <Scanlines />
      <Vignette />
      <NoiseOverlay />
      <Flicker />
      
      {/* UI Layer */}
      <div className="relative z-10 w-full h-full">
        <StatusBar />
        
        {/* Main Content */}
        <div className="pt-10 h-full">
          <Terminal />
        </div>
      </div>
      
      {/* Boot Sequence */}
      {showBoot && <BootSequence onComplete={handleBootComplete} />}
    </div>
  )
}
