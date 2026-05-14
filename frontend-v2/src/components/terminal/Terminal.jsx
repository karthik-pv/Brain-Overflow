import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '../../stores/appStore'
import TypewriterText from './TypewriterText'
import BlinkingCursor from './BlinkingCursor'

const COMMANDS = {
  help: {
    description: 'Show available commands',
    handler: () => [
      'AVAILABLE COMMANDS:',
      '  record [idea]     — Record a new idea (voice or text)',
      '  ideas             — List all recorded ideas',
      '  idea [id]         — View idea detail and analysis',
      '  analyze [id]      — Run analysis on an idea',
      '  flows             — List configured flows',
      '  prompts           — List available prompts',
      '  models            — List AI models',
      '  settings          — System settings',
      '  help              — Show this help',
      '  clear             — Clear terminal',
      '  theme [color]     — Change phosphor color (cyan/amber/green/white)',
      '  reboot            — Restart system',
      ''
    ]
  },
  clear: {
    description: 'Clear terminal',
    handler: () => {
      return ['CLEAR']
    }
  },
  theme: {
    description: 'Change phosphor color',
    handler: (args) => {
      const colors = ['cyan', 'amber', 'green', 'white']
      const color = args[0]
      
      if (!color) {
        return ['USAGE: theme [cyan|amber|green|white]', 'CURRENT: cyan', '']
      }
      
      if (!colors.includes(color)) {
        return [`ERROR: Unknown color "${color}"`, `VALID: ${colors.join(', ')}`, '']
      }
      
      // Update CSS variables
      const root = document.documentElement
      const colorMap = {
        cyan: { primary: '#00f3ff', dim: 'rgba(0, 243, 255, 0.3)', glow: 'rgba(0, 243, 255, 0.15)' },
        amber: { primary: '#ffb000', dim: 'rgba(255, 176, 0, 0.3)', glow: 'rgba(255, 176, 0, 0.15)' },
        green: { primary: '#33ff00', dim: 'rgba(51, 255, 0, 0.3)', glow: 'rgba(51, 255, 0, 0.15)' },
        white: { primary: '#e0e0e0', dim: 'rgba(224, 224, 224, 0.3)', glow: 'rgba(224, 224, 224, 0.15)' }
      }
      
      const c = colorMap[color]
      root.style.setProperty('--color-phosphor-primary', c.primary)
      root.style.setProperty('--color-phosphor-dim', c.dim)
      root.style.setProperty('--color-phosphor-glow', c.glow)
      
      return [`PHOSPHOR COLOR: ${color.toUpperCase()}`, '']
    }
  },
  reboot: {
    description: 'Restart system',
    handler: () => {
      window.location.reload()
      return ['REBOOTING...', '']
    }
  }
}

export default function Terminal() {
  const [lines, setLines] = useState([])
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const inputRef = useRef(null)
  const terminalRef = useRef(null)
  const bootComplete = useAppStore((s) => s.bootComplete)
  
  const addLine = useCallback((text, type = 'output') => {
    setLines(prev => [...prev, { text, type, id: Date.now() + Math.random() }])
  }, [])
  
  const executeCommand = useCallback((cmdLine) => {
    const trimmed = cmdLine.trim()
    if (!trimmed) return
    
    // Add command to history
    setHistory(prev => [...prev, trimmed])
    setHistoryIndex(-1)
    
    // Show command in terminal
    addLine(`> ${trimmed}`, 'command')
    
    // Parse command
    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)
    
    // Execute
    if (cmd === 'clear') {
      setLines([])
      return
    }
    
    const command = COMMANDS[cmd]
    if (command) {
      const results = command.handler(args)
      results.forEach((line, i) => {
        setTimeout(() => {
          if (line === 'CLEAR') {
            setLines([])
          } else {
            addLine(line, 'output')
          }
        }, i * 50)
      })
    } else {
      addLine(`ERROR: Unknown command "${cmd}"`, 'error')
      addLine('Type "help" for available commands.', 'system')
    }
  }, [addLine])
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!input.trim()) return
    
    executeCommand(input)
    setInput('')
  }, [input, executeCommand])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length > 0) {
        const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || '')
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        setHistoryIndex(newIndex)
        setInput(history[history.length - 1 - newIndex] || '')
      } else if (historyIndex === 0) {
        setHistoryIndex(-1)
        setInput('')
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Simple tab completion
      const partial = input.toLowerCase()
      const matches = Object.keys(COMMANDS).filter(cmd => cmd.startsWith(partial))
      if (matches.length === 1) {
        setInput(matches[0] + ' ')
      }
    }
  }, [input, history, historyIndex])
  
  // Auto-focus input
  useEffect(() => {
    if (bootComplete && inputRef.current) {
      inputRef.current.focus()
    }
  }, [bootComplete])
  
  // Scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])
  
  // Welcome message after boot
  useEffect(() => {
    if (bootComplete && lines.length === 0) {
      const welcomeLines = [
        '',
        'WELCOME TO BRAIN OVERFLOW.',
        'AN ABANDONED OPERATING SYSTEM FOR THINKERS AND DREAMERS.',
        '',
        'TYPE "help" FOR AVAILABLE COMMANDS.',
        'TYPE "record" TO CAPTURE AN IDEA.',
        ''
      ]
      
      welcomeLines.forEach((line, i) => {
        setTimeout(() => {
          addLine(line, line ? 'output' : 'system')
        }, i * 100)
      })
    }
  }, [bootComplete, lines.length, addLine])
  
  if (!bootComplete) return null
  
  return (
    <div className="fixed inset-0 z-10 flex flex-col p-6 md:p-12">
      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="flex-1 overflow-y-auto font-mono text-sm leading-relaxed"
        style={{ 
          fontFamily: 'var(--font-mono)',
          scrollbarWidth: 'thin'
        }}
      >
        {lines.map((line) => (
          <div 
            key={line.id}
            className={`terminal-line ${line.type === 'command' ? 'prompt phosphor-glow' : ''} ${line.type === 'error' ? 'text-[#ff3030]' : ''} ${line.type === 'system' ? 'text-[#4a4a4a] text-xs' : ''}`}
          >
            {line.type === 'command' ? line.text : line.text}
          </div>
        ))}
      </div>
      
      {/* Input Line */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center">
        <span className="text-[#00f3ff] mr-2 font-mono">{'>'}</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-[#e0e0e0] font-mono text-sm caret-[#00f3ff]"
          style={{ fontFamily: 'var(--font-mono)' }}
          placeholder="Type a command..."
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        <BlinkingCursor active={true} style="block" className="text-[#00f3ff]" />
      </form>
    </div>
  )
}
