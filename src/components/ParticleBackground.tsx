"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ParticlesProps {
  beatIntensity: number;
  isPlaying: boolean;
}

function Particles({ beatIntensity, isPlaying }: ParticlesProps) {
  const meshRef = useRef<THREE.Points>(null);
  const particleCount = 2000;
  
  // Generate particle positions and initial data
  const [positions, velocities, originalPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    const origPos = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Create particles in a sphere distribution, concentrated at center
      const radius = Math.random() * 40 * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      
      // Store original positions
      origPos[i3] = pos[i3];
      origPos[i3 + 1] = pos[i3 + 1];
      origPos[i3 + 2] = pos[i3 + 2];
      
      // Random velocities for ambient motion
      vel[i3] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.01;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    
    return [pos, vel, origPos];
  }, []);

  // Animation frame
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const time = state.clock.elapsedTime;
    
    // Pulse effect based on beat intensity 
    const pulseScale = 1 + beatIntensity * 0.5;
    const rotationSpeed = isPlaying ? 0.08 : 0.02;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Get original position
      const origX = originalPositions[i3];
      const origY = originalPositions[i3 + 1];
      const origZ = originalPositions[i3 + 2];
      
      // Apply rotation
      const angle = time * rotationSpeed;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      // Rotate around Y axis
      const rotX = origX * cosA - origZ * sinA;
      const rotZ = origX * sinA + origZ * cosA;
      
      // Apply pulse effect from center with dancing motion
      const danceX = Math.sin(time * 2 + i * 0.1) * 3;
      const danceY = Math.cos(time * 1.5 + i * 0.15) * 3;
      const danceZ = Math.sin(time * 1.8 + i * 0.08) * 3;
      
      positions[i3] = rotX * pulseScale + velocities[i3] * Math.sin(time + i) * 8 + danceX;
      positions[i3 + 1] = origY * pulseScale + velocities[i3 + 1] * Math.cos(time + i) * 8 + danceY;
      positions[i3 + 2] = rotZ * pulseScale + velocities[i3 + 2] * Math.sin(time + i) * 8 + danceZ;
    }
    
    meshRef.current.geometry.attributes.position.needsUpdate = true;
    
    // Rotate the whole mesh slightly
    meshRef.current.rotation.y = time * 0.05;
    
    // Scale based on beat for extra impact (subtle)
    const scale = 1 + beatIntensity * 0.05;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#60a5fa"
        transparent
        opacity={isPlaying ? 0.5 * (0.2 + beatIntensity * 0.8) : 0}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

interface ParticleBackgroundProps {
  beatIntensity: number;
  isPlaying: boolean;
}

export default function ParticleBackground({ beatIntensity, isPlaying }: ParticleBackgroundProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 50], fov: 75 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <Particles beatIntensity={beatIntensity} isPlaying={isPlaying} />
      </Canvas>
    </div>
  );
}