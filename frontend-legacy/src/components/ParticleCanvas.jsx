import React, { useRef, useEffect } from 'react'

const ParticleCanvas = React.memo(function ParticleCanvas({ frequencyData, isListening, size = 400 }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const rafRef = useRef(null)
  const timeRef = useRef(0)

  const PARTICLE_COUNT = 120
  const RINGS = 3
  const BASE_RADIUS = size * 0.35

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Initialize particles in rings
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ring = Math.floor((i / PARTICLE_COUNT) * RINGS)
        const angle = (i / (PARTICLE_COUNT / RINGS)) * Math.PI * 2 + (ring * 0.5)
        const radiusOffset = (ring / RINGS) * BASE_RADIUS * 0.4
        particlesRef.current.push({
          angle,
          baseRadius: BASE_RADIUS - radiusOffset,
          ring,
          size: 2 + Math.random() * 2,
          phase: Math.random() * Math.PI * 2,
          speed: 0.5 + Math.random() * 1.5,
        })
      }
    }

    const draw = () => {
      timeRef.current += 0.016
      const time = timeRef.current

      // Trailing effect - fade previous frame
      ctx.fillStyle = 'rgba(5, 8, 17, 0.15)'
      ctx.fillRect(0, 0, size, size)

      const centerX = size / 2
      const centerY = size / 2

      // Get frequency data or use zeros
      const freqs = frequencyData || new Uint8Array(128)
      const freqLen = freqs.length

      // Draw particles
      particlesRef.current.forEach((p, i) => {
        // Map particle to frequency bin
        const freqIndex = Math.floor((i / PARTICLE_COUNT) * freqLen)
        const amplitude = freqs[freqIndex] || 0
        const normalizedAmp = amplitude / 255

        // Calculate position with frequency reaction
        const pulseRadius = p.baseRadius + (normalizedAmp * 40) + (Math.sin(time * p.speed + p.phase) * 8)
        const x = centerX + Math.cos(p.angle + time * 0.1) * pulseRadius
        const y = centerY + Math.sin(p.angle + time * 0.1) * pulseRadius

        // Size reacts to amplitude
        const particleSize = p.size + (normalizedAmp * 6)

        // Alpha based on amplitude and ring
        const baseAlpha = 0.3 + (p.ring / RINGS) * 0.4
        const alpha = baseAlpha + (normalizedAmp * 0.5)

        // Draw particle glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize * 3)
        gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(0, 212, 255, ${alpha * 0.3})`)
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')

        ctx.beginPath()
        ctx.arc(x, y, particleSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Draw core
        ctx.beginPath()
        ctx.arc(x, y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha + 0.2})`
        ctx.fill()

        // Connect nearby particles with high amplitude
        if (normalizedAmp > 0.3) {
          const connectRange = 60 + (normalizedAmp * 40)
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p2 = particlesRef.current[j]
            const p2FreqIdx = Math.floor((j / PARTICLE_COUNT) * freqLen)
            const p2Amp = freqs[p2FreqIdx] || 0
            const p2NormAmp = p2Amp / 255

            if (p2NormAmp > 0.2) {
              const p2PulseRadius = p2.baseRadius + (p2NormAmp * 40) + (Math.sin(time * p2.speed + p2.phase) * 8)
              const x2 = centerX + Math.cos(p2.angle + time * 0.1) * p2PulseRadius
              const y2 = centerY + Math.sin(p2.angle + time * 0.1) * p2PulseRadius

              const dx = x - x2
              const dy = y - y2
              const dist = Math.sqrt(dx * dx + dy * dy)

              if (dist < connectRange) {
                const lineAlpha = (1 - dist / connectRange) * normalizedAmp * 0.3
                ctx.beginPath()
                ctx.moveTo(x, y)
                ctx.lineTo(x2, y2)
                ctx.strokeStyle = `rgba(0, 212, 255, ${lineAlpha})`
                ctx.lineWidth = 0.5
                ctx.stroke()
              }
            }
          }
        }
      })

      // Draw center glow when listening
      if (isListening) {
        const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60)
        centerGlow.addColorStop(0, 'rgba(0, 212, 255, 0.15)')
        centerGlow.addColorStop(1, 'rgba(0, 212, 255, 0)')
        ctx.beginPath()
        ctx.arc(centerX, centerY, 60, 0, Math.PI * 2)
        ctx.fillStyle = centerGlow
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [size, isListening, frequencyData])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: size,
        height: size,
        display: 'block',
      }}
    />
  )
})

export default ParticleCanvas
