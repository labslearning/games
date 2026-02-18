import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

export default function Reactor3D() {
  const { isCritical, volume, pressure, temp } = useGameStore();
  const { camera } = useThree();
  const baseCamPos = useRef(new THREE.Vector3(0, 5, 12));
  
  const ring1 = useRef();
  const ring2 = useRef();
  const pistonAssembly = useRef(); 

  useFrame(() => {
    const speed = temp / 1000;
    if (ring1.current) ring1.current.rotation.y += speed * 0.1;
    if (ring2.current) ring2.current.rotation.y -= speed * 0.15;

    // Cinemática del Ensamblaje del Pistón
    const targetPistonY = 4 * (volume / 100);
    if (pistonAssembly.current) {
      pistonAssembly.current.position.y += (targetPistonY - pistonAssembly.current.position.y) * 0.15;
    }

    // Screen Shake (Limitado y Seguro)
    if (pressure > 1800) {
      const rawIntensity = (pressure - 1800) / 4000; 
      const cappedIntensity = Math.min(0.8, rawIntensity); 
      camera.position.x = baseCamPos.current.x + (Math.random() - 0.5) * cappedIntensity;
      camera.position.y = baseCamPos.current.y + (Math.random() - 0.5) * cappedIntensity;
      camera.position.z = baseCamPos.current.z + (Math.random() - 0.5) * cappedIntensity;
    } else {
      camera.position.lerp(baseCamPos.current, 0.1);
    }
  });

  return (
    <group>
      <Environment preset="night" />
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 2, 0]} intensity={isCritical ? 10 : 2} color={isCritical ? "#ff0055" : "#00f2ff"} />

      <Float speed={isCritical ? 8 : 1} rotationIntensity={isCritical ? 1 : 0.1}>
        
        {/* EL CRISTAL DE CONTENCIÓN */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[2.5, 2.5, 4, 64]} />
          <meshPhysicalMaterial color={isCritical ? "#ff0055" : "#0055ff"} transparent opacity={0.15} roughness={0.0} metalness={1} side={2} />
        </mesh>
        
        {/* ⚙️ EL NUEVO ENSAMBLAJE MECÁNICO DEL PISTÓN TIER GOD */}
        <group ref={pistonAssembly} position={[0, 4, 0]}>
          
          {/* 1. El Eje de Transmisión (Piston Rod) */}
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.4, 0.4, 5, 32]} />
            <meshStandardMaterial color="#aaaaaa" metalness={1} roughness={0.2} />
          </mesh>

          {/* 2. La Cabeza del Pistón (Bloque Principal) */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[2.46, 2.46, 0.3, 64]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.5} />
          </mesh>

          {/* 3. Anillos de Sellado (Goma Industrial) */}
          <mesh position={[0, -0.05, 0]}>
            <torusGeometry args={[2.46, 0.04, 16, 64]} />
            <meshStandardMaterial color="#000000" roughness={0.9} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <torusGeometry args={[2.46, 0.04, 16, 64]} />
            <meshStandardMaterial color="#000000" roughness={0.9} metalness={0.1} />
          </mesh>

          {/* 4. Anillo LED Dinámico (Indica el estrés de presión) */}
          <mesh position={[0, 0.15, 0]}>
            <torusGeometry args={[2.4, 0.03, 16, 64]} />
            <meshStandardMaterial color={isCritical ? "#ff0055" : "#ffea00"} emissive={isCritical ? "#ff0055" : "#ffea00"} emissiveIntensity={isCritical ? 5 : 2} />
          </mesh>

        </group>

        {/* Base del Reactor */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[2.6, 2.8, 0.4, 64]} />
          <meshStandardMaterial color="#111" metalness={0.9} roughness={0.4} />
        </mesh>

        {/* Anillos Magnéticos Exteriores */}
        <mesh ref={ring1} position={[0, 1, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[2.8, 0.05, 16, 64]} />
          <meshStandardMaterial color={isCritical ? "#ff0055" : "#00f2ff"} emissive={isCritical ? "#ff0055" : "#00f2ff"} emissiveIntensity={4} />
        </mesh>
        <mesh ref={ring2} position={[0, 3, 0]} rotation={[Math.PI/2, 0, 0]}>
          <torusGeometry args={[2.8, 0.05, 16, 64]} />
          <meshStandardMaterial color={isCritical ? "#ff0055" : "#00f2ff"} emissive={isCritical ? "#ff0055" : "#00f2ff"} emissiveIntensity={4} />
        </mesh>

      </Float>
    </group>
  );
}
