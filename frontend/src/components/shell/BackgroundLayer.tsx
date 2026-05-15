import { Dithering } from '@/components/ui/portfolio-hero-with-paper-shaders'
import { useLocation } from 'react-router-dom'

interface Props {
  intense?: boolean
}

export function BackgroundLayer({ intense }: Props) {
  const location = useLocation()
  const isLanding = location.pathname === '/'
  const heavy = intense ?? isLanding

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          filter: heavy ? 'none' : 'blur(40px) brightness(0.4) opacity(0.30)',
          transition: 'filter 1.2s var(--ease-os)',
        }}
      >
        <Dithering
          style={{ height: '100%', width: '100%' }}
          colorBack="hsl(0, 0%, 0%)"
          colorFront="hsl(320, 100%, 70%)"
          {...({ shape: 'cat' } as any)}
          type="4x4"
          pxSize={3}
          offsetX={0}
          offsetY={0}
          scale={0.8}
          rotation={0}
          speed={heavy ? 0.05 : 0.02}
        />
      </div>
      {!heavy && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'color-mix(in srgb, var(--color-void) 72%, transparent)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        />
      )}
      {/* Subtle vignette for everything */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 50%, transparent, var(--color-void) 100%)',
        }}
      />
    </div>
  )
}
