import React, { useMemo, useRef, useCallback } from 'react';
import { InstancedRigidBodies, CylinderCollider, RigidBody } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * COMPONENTE: MolecularPhysics (TIER GOD EDITION)
 * 1. Físicas WASM (Rapier): Colisiones reales entre miles de cuerpos.
 * 2. Audio Dinámico: Gatilla el sonido de 'Crash' de Cloudinary según la fuerza.
 * 3. Simulación Térmica: Movimiento Browniano basado en la temperatura del reactor.
 */
export default function MolecularPhysics({ count = 500 }) {
  const { temp, triggerAIAssistance, reportImpact } = useGameStore();
  const rigidBodies = useRef();

  // URL del actor (sonido) en Cloudinary para impactos
  const CRASH_SOUND_URL = "https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/crash_ebp5po.wav";

  // 1. Optimización de Memoria: Matrices y Colores para la GPU
  const colorArray = useMemo(() => new Float32Array(count * 3), [count]);
  const tempColor = new THREE.Color();

  // 2. Setup Inicial: Posicionamiento aleatorio dentro del volumen del reactor
  const instances = useMemo(() => {
    const inst = [];
    for (let i = 0; i < count; i++) {
      inst.push({
        key: `part-${i}`,
        position: [
          (Math.random() - 0.5) * 1.8, 
          Math.random() * 3.5 + 0.5, 
          (Math.random() - 0.5) * 1.8
        ],
        rotation: [Math.random(), Math.random(), Math.random()],
      });
    }
    return inst;
  }, [count]);

  /**
   * TIER GOD PHYSICS LOOP
   * Aplicamos la Ley de los Gases Ideales: A mayor temperatura, mayor agitación molecular.
   */
  useFrame((state) => {
    if (!rigidBodies.current) return;

    // Calculamos la energía cinética basada en la temperatura (Kelvin)
    const thermalAgitation = temp / 800; 

    rigidBodies.current.forEach((api) => {
      // Aplicamos impulsos aleatorios (Movimiento Browniano) para simular calor
      api.applyImpulse({
        x: (Math.random() - 0.5) * thermalAgitation,
        y: (Math.random() - 0.5) * thermalAgitation,
        z: (Math.random() - 0.5) * thermalAgitation,
      }, true);
    });
  });

  /**
   * MANEJADOR DE IMPACTOS AAA
   * Registra datos pedagógicos y dispara el audio posicional de Cloudinary.
   */
  const handleCollision = useCallback((event) => {
    const force = event.totalForceMagnitude;

    // Solo procesamos colisiones significativas para optimizar el rendimiento
    if (force > 60) {
      // A. Feedback Auditivo: Sonido de choque dinámico 
      const audio = new Audio(CRASH_SOUND_URL);
      audio.volume = Math.min(force / 300, 1.0); // El volumen depende de la fuerza
      audio.play().catch(() => {}); // Evita errores de política de autoplay

      // B. Telemetría: Enviamos el impacto al SyncEngine de Learning Labs
      reportImpact({
        force,
        type: 'MOLECULAR_CRASH',
        timestamp: Date.now()
      });

      // C. Intervención IA: Si el impacto es crítico, llamamos a DeepSeek [cite: 2, 28]
      if (force > 250) {
        triggerAIAssistance("Inestabilidad por Energía Cinética Alta", "Critical");
      }
    }
  }, [reportImpact, triggerAIAssistance]);

  return (
    <group>
      {/* CONTENEDOR FÍSICO (Vaso de precipitación invisible) */}
      <RigidBody type="fixed" colliders={false} name="container">
        {/* Cilindro de colisión para mantener las partículas encerradas */}
        <CylinderCollider args={[2.1, 2.0]} position={[0, 2, 0]} restitution={1.2} friction={0} />
        {/* Suelo del reactor */}
        <CylinderCollider args={[0.1, 2.0]} position={[0, 0, 0]} restitution={1.2} />
      </RigidBody>

      {/* MOTOR DE INSTANCIAS (Renderizado de alta densidad) */}
      <InstancedRigidBodies
        ref={rigidBodies}
        instances={instances}
        colliders="ball"
        restitution={1.1} // Rebote elástico industrial
        friction={0.1}
        onCollisionEnter={handleCollision}
      >
        <instancedMesh args={[null, null, count]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          {/* Material reactivo: Brilla más intensamente con el calor  */}
          <meshStandardMaterial 
            roughness={0.1} 
            metalness={0.8}
            emissive={temp > 400 ? "#ff4400" : "#00ffff"}
            emissiveIntensity={Math.max(0.5, temp / 150)}
            color={temp > 400 ? "#ff8844" : "#88ffff"}
          />
        </instancedMesh>
      </InstancedRigidBodies>
    </group>
  );
}
