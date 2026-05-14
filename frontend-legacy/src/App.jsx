import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { isConfigured, clearSupabase } from './lib/supabase.js'
import SetupScreen from './components/SetupScreen.jsx'
import NavBar from './components/NavBar.jsx'
import VoiceRecorderPage from './pages/VoiceRecorderPage.jsx'
import IdeasPage from './pages/IdeasPage.jsx'
import IdeaDetailPage from './pages/IdeaDetailPage.jsx'
import PromptsPage from './pages/PromptsPage.jsx'
import FlowsPage from './pages/FlowsPage.jsx'
import ModelsPage from './pages/ModelsPage.jsx'

export default function App() {
  const [configured, setConfigured] = useState(isConfigured())

  if (!configured) {
    return <SetupScreen onDone={() => setConfigured(true)} />
  }

  function handleDisconnect() {
    localStorage.removeItem('sb_url')
    localStorage.removeItem('sb_key')
    clearSupabase()
    setConfigured(false)
  }

  return (
    <BrowserRouter>
      <div className="min-h-[100dvh] bg-[#050811] text-[#e8ecf1] font-sans">
        <NavBar onDisconnect={handleDisconnect} />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<VoiceRecorderPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/idea/:id" element={<IdeaDetailPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/flows" element={<FlowsPage />} />
            <Route path="/models" element={<ModelsPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  )
}
