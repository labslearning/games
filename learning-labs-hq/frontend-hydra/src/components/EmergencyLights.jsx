import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';

/**
 * TIER GOD LIGHTING: Emergency Flickering
 * Manipula la intensidad de la luz basándose en ruido aleatorio.
 */
export default function EmergencyLights() {
  const lightRef = useRef();
  const { isCritical, pressure } = useGameStore();

  useFrame((state) => {
    if (!lightRef.current) return;

    if (isCritical) {
      // 1. Efecto de parpadeo (Strobe) 
      const flicker = Math.sin(state.clock.getElapsedTime() * 20) > 0 ? 2 : 0.2;
      lightRef.current.intensity = flicker;
      lightRef.current.color.set(0xff0000); // Rojo emergencia
    } else {
      // 2. Luz de operación normal (Azul laboratorio)
      lightRef.current.intensity = 1.5;
      lightRef.current.color.set(0x4488ff);
    }
  });

  return (
    <spotLight 
      ref={lightRef}
      position={[0, 15, 0]} 
      penumbra={1} 
      castShadow 
    />
  );
}
