import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove boot fallback once React loads
const bootFallback = document.getElementById('boot-fallback')
if (bootFallback) {
  bootFallback.classList.add('hidden')
  setTimeout(() => bootFallback.remove(), 500)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
