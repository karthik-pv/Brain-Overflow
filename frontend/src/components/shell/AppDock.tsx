import { useLocation, useNavigate } from 'react-router-dom'
import {
  Mic,
  Layers,
  MessageSquareText,
  Workflow,
  Cpu,
  LogOut,
} from 'lucide-react'
import { Dock, DockIcon } from '@/components/ui/dock'
import { useProcessingPulse } from '@/hooks/useProcessingPulse'
import { clearCredentials, credentialsSource } from '@/lib/supabase'

const ITEMS = [
  { to: '/', label: 'RECORDER', icon: Mic },
  { to: '/ideas', label: 'IDEAS', icon: Layers },
  { to: '/prompts', label: 'PROMPTS', icon: MessageSquareText },
  { to: '/flows', label: 'FLOWS', icon: Workflow },
  { to: '/models', label: 'MODELS', icon: Cpu },
]

export function AppDock() {
  const location = useLocation()
  const navigate = useNavigate()
  const { count } = useProcessingPulse()
  const canDisconnect = credentialsSource() === 'localStorage'

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <Dock>
        {ITEMS.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to)
          const showPulse = item.to === '/ideas' && count > 0
          return (
            <DockIcon
              key={item.to}
              icon={item.icon}
              label={item.label}
              active={isActive}
              onClick={() => navigate(item.to)}
              badge={
                showPulse ? (
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                  </span>
                ) : undefined
              }
            />
          )
        })}
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" aria-hidden />
        <DockIcon
          icon={LogOut}
          label={canDisconnect ? 'DISCONNECT' : 'ENV-LOCKED'}
          onClick={() => {
            if (!canDisconnect) return
            if (clearCredentials()) window.location.reload()
          }}
        />
      </Dock>
    </div>
  )
}
