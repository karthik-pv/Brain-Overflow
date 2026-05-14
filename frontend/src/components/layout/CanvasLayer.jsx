import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'

function Particles({ count = 200 }) {
  const mesh = useRef()
  
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 10
        ],
        speed: Math.random() * 0.001 + 0.0005,
        offset: Math.random() * Math.PI * 2
      })
    }
    return temp
  }, [count])
  
  useFrame((state) => {
    if (!mesh.current) return
    const time = state.clock.elapsedTime
    
    mesh.current.children.forEach((child, i) => {
      const particle = particles[i]
      child.position.x += Math.sin(time * particle.speed + particle.offset) * 0.001
      child.position.y += Math.cos(time * particle.speed + particle.offset) * 0.001
      child.position.z += Math.sin(time * particle.speed * 0.5 + particle.offset) * 0.0005
    })
  })
  
  return (
    <group ref={mesh}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial 
            color="#00f3ff" 
            transparent 
            opacity={0.3 + Math.random() * 0.3}
          />
        </mesh>
      ))}
    </group>
  )
}

function PrometheusBust() {
  const group = useRef()
  
  useFrame((state) => {
    if (!group.current) return
    const time = state.clock.elapsedTime
    group.current.rotation.y = Math.sin(time * 0.1) * 0.05
    group.current.rotation.x = Math.cos(time * 0.08) * 0.02
  })
  
  return (
    <group ref={group} position={[0, -1, -5]}>
      {/* Simplified low-poly bust representation */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 2, 1]} />
        <meshBasicMaterial color="#1a1a2e" wireframe transparent opacity={0.3} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#1a1a2e" wireframe transparent opacity={0.2} />
      </mesh>
      {/* Digital flame */}
      <mesh position={[0.8, -0.5, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshBasicMaterial color="#00f3ff" transparent opacity={0.8} />
      </mesh>
      <pointLight position={[0.8, -0.5, 0]} color="#00f3ff" intensity={0.5} distance={3} />
    </group>
  )
}

function AtmosphericScene() {
  return (
    <>
      <color attach="background" args={['#020202']} />
      <fog attach="fog" args={['#020202', 5, 20]} />
      <ambientLight intensity={0.1} />
      <Particles count={150} />
      <PrometheusBust />
    </>
  )
}

export default function CanvasLayer() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
      >
        <AtmosphericScene />
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.3}
            mipmapBlur
          />
          <Vignette
            eskil={false}
            offset={0.1}
            darkness={1.2}
          />
          <Noise opacity={0.02} />
        </EffectComposer>
      </Canvas>
    </div>
  )
}
