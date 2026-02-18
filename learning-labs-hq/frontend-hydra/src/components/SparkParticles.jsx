import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/useGameStore';

/**
 * TIER GOD VFX: Spark System
 * Simula chispas de cortocircuito en la base del reactor.
 */
export default function SparkParticles({ count = 50 }) {
  const meshRef = useRef();
  const { isCritical } = useGameStore();

  // 1. Inicialización de datos de partículas (Tier God: BufferGeometry)
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      temp.push({
        t: Math.random() * 100, // Tiempo inicial
        v: new THREE.Vector3((Math.random() - 0.5) * 0.5, Math.random() * 1.5, (Math.random() - 0.5) * 0.5), // Velocidad
        life: 0.5 + Math.random() // Tiempo de vida
      });
    }
    return temp;
  }, [count]);

  const dummy = new THREE.Object3D();

  useFrame((state, delta) => {
    if (!meshRef.current || !isCritical) {
      if (meshRef.current) meshRef.current.visible = false;
      return;
    }

    meshRef.current.visible = true;

    particles.forEach((p, i) => {
      // Física manual ultra-rápida
      p.t += delta;
      if (p.t > p.life) p.t = 0; // Reiniciar chispa

      const progress = p.t / p.life;
      
      // Movimiento parabólico (Gravedad)
      dummy.position.set(
        p.v.x * p.t * 5,
        p.v.y * p.t * 10 - 0.5 * 9.8 * p.t * p.t, // y = v0*t - 1/2*g*t^2
        p.v.z * p.t * 5
      );

      // Escala decreciente según vida
      const s = (1 - progress) * 0.05;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} position={[0, 0, 0]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshStandardMaterial 
        color="#ffaa00" 
        emissive="#ffcc00" 
        emissiveIntensity={10} 
        transparent 
      />
    </instancedMesh>
  );
}
