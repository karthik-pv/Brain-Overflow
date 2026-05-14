import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const useAppStore = create(
  devtools(
    (set, get) => ({
      // Boot state
      bootComplete: false,
      setBootComplete: (complete) => set({ bootComplete: complete }),
      
      // Navigation
      currentPage: 'terminal',
      setCurrentPage: (page) => set({ currentPage: page }),
      
      // Terminal state
      terminalHistory: [],
      addTerminalLine: (line) => set((state) => ({
        terminalHistory: [...state.terminalHistory, line]
      })),
      clearTerminal: () => set({ terminalHistory: [] }),
      
      // UI state
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      ideaPanelOpen: false,
      setIdeaPanelOpen: (open) => set({ ideaPanelOpen: open }),
      
      // Recording state
      recordingState: 'idle', // 'idle' | 'listening' | 'processing' | 'completed'
      setRecordingState: (state) => set({ recordingState: state }),
      
      // WebGL quality
      sceneQuality: 'high', // 'high' | 'medium' | 'low'
      setSceneQuality: (quality) => set({ sceneQuality: quality }),
      
      // Theme
      phosphorColor: 'cyan', // 'cyan' | 'amber' | 'green' | 'white'
      setPhosphorColor: (color) => set({ phosphorColor: color }),
      
      // Supabase config
      supabaseConfigured: false,
      setSupabaseConfigured: (configured) => set({ supabaseConfigured: configured }),
    }),
    { name: 'BrainOverflowStore' }
  )
)
