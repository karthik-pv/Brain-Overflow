import { useEffect, useRef } from 'react'

interface Props {
  frequencyData: Uint8Array | null
  active: boolean
  size?: number
}

function getAmplitude(data: Uint8Array | null): number {
  if (!data) return 0
  let sum = 0
  const n = Math.min(data.length, 80)
  for (let i = 0; i < n; i++) sum += data[i]
  return sum / n / 255
}

export function AuraVisualizer({ frequencyData, active, size = 280 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const tRef = useRef(0)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = size * dpr
    c.height = size * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)
    const cx = size / 2
    const cy = size / 2

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      tRef.current += active ? 0.025 : 0.008

      const t = tRef.current
      const amp = getAmplitude(frequencyData)
      const pulse = active ? amp : 0.04 + 0.03 * Math.sin(t * 1.3)
      const baseR = size * 0.16

      // Core radial glow
      const coreR = baseR * (1 + pulse * 0.9)
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2.4)
      grad.addColorStop(0, `hsla(320, 100%, 78%, ${0.55 + pulse * 0.35})`)
      grad.addColorStop(0.22, `hsla(320, 95%, 66%, ${0.28 + pulse * 0.22})`)
      grad.addColorStop(0.55, `hsla(320, 80%, 55%, ${0.1 + pulse * 0.12})`)
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(cx, cy, coreR * 2.4, 0, Math.PI * 2)
      ctx.fill()

      // Concentric aura rings
      for (let r = 0; r < 4; r++) {
        const phase = t * (0.8 + r * 0.15) + r * Math.PI * 0.5
        const ringR = baseR * (1.9 + r * 0.75) + pulse * baseR * (0.55 - r * 0.08) * Math.sin(phase)
        const alpha = Math.max(0, 0.3 - r * 0.055 + pulse * 0.22)
        ctx.beginPath()
        ctx.arc(cx, cy, Math.max(4, ringR), 0, Math.PI * 2)
        ctx.strokeStyle = `hsla(320, 100%, 70%, ${alpha})`
        ctx.lineWidth = Math.max(0.4, 1.4 - r * 0.28)
        ctx.stroke()
      }

      // Orbital sparkle particles when recording
      if (active) {
        const n = 14
        for (let i = 0; i < n; i++) {
          const angle = (i / n) * Math.PI * 2 + t * 0.6
          const d =
            baseR * (1.65 + Math.sin(t * 2.2 + i * 0.7) * 0.4) *
            (1 + pulse * 0.55)
          const px = cx + Math.cos(angle) * d
          const py = cy + Math.sin(angle) * d
          const a = pulse * (0.45 + 0.3 * Math.sin(t * 3 + i))
          ctx.beginPath()
          ctx.arc(px, py, 1.4, 0, Math.PI * 2)
          ctx.fillStyle = `hsla(320, 100%, 82%, ${Math.max(0, a)})`
          ctx.fill()
        }
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [frequencyData, active, size])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-hidden
    />
  )
}
