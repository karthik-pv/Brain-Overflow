import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { isConfigured, clearSupabase } from './lib/supabase.js'
import SetupScreen   from './components/SetupScreen.jsx'
import IdeasPage      from './pages/IdeasPage.jsx'
import IdeaDetailPage from './pages/IdeaDetailPage.jsx'
import PromptsPage    from './pages/PromptsPage.jsx'
import FlowsPage      from './pages/FlowsPage.jsx'
import ModelsPage     from './pages/ModelsPage.jsx'

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
      <div className="app-layout">
        <nav className="nav">
          <span className="nav-brand">🧠 Brain Overflow</span>
          <NavLink to="/"        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Ideas</NavLink>
          <NavLink to="/prompts" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Prompts</NavLink>
          <NavLink to="/flows"   className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Flows</NavLink>
          <NavLink to="/models"  className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Models</NavLink>
          <span style={{ flex: 1 }} />
          <button className="btn btn-sm" onClick={handleDisconnect}>Disconnect</button>
        </nav>

        <Routes>
          <Route path="/"        element={<IdeasPage />} />
          <Route path="/idea/:id" element={<IdeaDetailPage />} />
          <Route path="/prompts" element={<PromptsPage />} />
          <Route path="/flows"   element={<FlowsPage />} />
          <Route path="/models"  element={<ModelsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
