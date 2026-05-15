import { useEffect, useRef } from 'react'

interface Props {
  frequencyData: Uint8Array | null
  active: boolean
  size?: number
}

// TODO: replace with snippet #11 (audio input UI) once user provides it.
export function AudioVisualizer({ frequencyData, active, size = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)
  const phaseRef = useRef(0)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const dpr = window.devicePixelRatio || 1
    c.width = size * dpr
    c.height = size * dpr
    const ctx = c.getContext('2d')!
    ctx.scale(dpr, dpr)

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2
      const baseR = size * 0.32
      const bars = 64
      ctx.lineCap = 'butt'

      // Outer ring
      ctx.beginPath()
      ctx.strokeStyle = 'rgba(220,224,230,0.06)'
      ctx.lineWidth = 1
      ctx.arc(cx, cy, baseR + 30, 0, Math.PI * 2)
      ctx.stroke()

      phaseRef.current += active ? 0.02 : 0.005
      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
        const idx = frequencyData
          ? Math.floor((i / bars) * frequencyData.length * 0.5)
          : 0
        const amp = frequencyData ? frequencyData[idx] / 255 : 0
        const idle = 0.04 + 0.04 * Math.sin(phaseRef.current * 2 + i * 0.5)
        const len = (active ? Math.max(idle, amp * 0.4) : idle) * 36
        const r1 = baseR + 6
        const r2 = baseR + 6 + len
        const x1 = cx + Math.cos(angle) * r1
        const y1 = cy + Math.sin(angle) * r1
        const x2 = cx + Math.cos(angle) * r2
        const y2 = cy + Math.sin(angle) * r2
        ctx.beginPath()
        ctx.strokeStyle = active
          ? `rgba(228, 230, 235, ${0.35 + amp * 0.55})`
          : 'rgba(228, 230, 235, 0.18)'
        ctx.lineWidth = 1.2
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
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
