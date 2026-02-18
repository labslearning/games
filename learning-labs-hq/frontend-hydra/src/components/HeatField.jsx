import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function HeatField({ temperature = 300 }) {
  const meshRef = useRef();
  
  // Escalar el color de azul (frío) a rojo (calor extremo)
  const heatColor = new THREE.Color().setHSL(
    Math.max(0, 0.6 - (temperature - 300) / 1000), 
    1, 
    0.5
  );

  useFrame((state) => {
    if (meshRef.current) {
      // Efecto de pulsación térmica
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.set(s, s, s);
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4, 32, 32]} />
      <meshStandardMaterial 
        color={heatColor} 
        transparent 
        opacity={0.15} 
        wireframe
        emissive={heatColor}
        emissiveIntensity={2}
      />
    </mesh>
  );
}
