import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, Environment, ContactShadows, 
  MeshTransmissionMaterial, Float, PositionalAudio 
} from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';

// Nuestros componentes de ingeniería avanzada
import { useGameStore } from '../store/useGameStore';
import MolecularPhysics from './MolecularPhysics';
import HeatField from './HeatField'; // El shader de distorsión térmica [cite: 23, 70]
import SparkParticles from './SparkParticles'; // VFX de emergencia [cite: 28, 75]
import EmergencyLights from './EmergencyLights';

/**
 * REACTOR SHELL: El contenedor visual con refracción física real.
 */
function ReactorShell() {
  const { temp, isCritical } = useGameStore();
  const audioRef = useRef();

  useFrame(() => {
    if (audioRef.current) {
      // Modulación de frecuencia basada en temperatura [cite: 12, 59]
      audioRef.current.setPlaybackRate(1 + (temp / 1000));
      audioRef.current.setVolume(isCritical ? 1.5 : 0.4);
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh castShadow position={[0, 2, 0]}>
        <cylinderGeometry args={[2.2, 2.2, 4.5, 32]} />
        <MeshTransmissionMaterial 
          backside 
          samples={16} 
          thickness={0.2} 
          chromaticAberration={isCritical ? 0.8 : 0.05} 
          distortion={isCritical ? 1.5 : 0.1} 
          temporalDistortion={0.1} 
          color={isCritical ? "#ffaaaa" : "#ffffff"}
        />
        {/* Audio Espacial Industrial [cite: 11, 58] */}
        <Suspense fallback={null}>
          <PositionalAudio 
            ref={audioRef} 
            url="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav" 
            loop 
            distance={5} 
          />
        </Suspense>
      </mesh>
    </Float>
  );
}

/**
 * ESCENA PRINCIPAL: Configuración de Grado Industrial.
 */
export default function Reactor3D() {
  const { isCritical, shakeIntensity } = useGameStore();
  const groupRef = useRef();

  // TIER GOD: Efecto de sacudida de cámara (Camera Shake)
  useFrame((state) => {
    if (shakeIntensity > 0) {
      state.camera.position.x += (Math.random() - 0.5) * shakeIntensity;
      state.camera.position.y += (Math.random() - 0.5) * shakeIntensity;
    }
  });

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020205' }}>
      <Canvas shadows camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        
        <Suspense fallback={null}>
          {/* 1. Iluminación y Atmosfera AAA */}
          <EmergencyLights />
          <Environment preset="night" blur={0.8} />

          <group ref={groupRef}>
            {/* 2. El Reactor y su Capa de Calor (Shader GLSL) [cite: 70, 71] */}
            <ReactorShell />
            <HeatField /> 

            {/* 3. Motor de Físicas WASM (Rapier)  */}
            <Physics gravity={[0, -9.81, 0]}>
              <MolecularPhysics count={500} />
              <SparkParticles count={100} /> {/* VFX Procedural [cite: 75] */}
            </Physics>
          </group>

          {/* 4. Post-procesamiento Cinematográfico [cite: 30, 77] */}
          <EffectComposer disableNormalPass>
            <Bloom 
              luminanceThreshold={1} 
              intensity={isCritical ? 3.0 : 0.5} 
              mipmapBlur 
            />
            <Noise opacity={isCritical ? 0.3 : 0.05} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>

          <ContactShadows 
            resolution={1024} 
            scale={20} 
            blur={2} 
            opacity={0.8} 
            far={10} 
            color="#000000" 
            position={[0, -0.01, 0]} 
          />
        </Suspense>

        <OrbitControls 
          enablePan={false} 
          minDistance={5} 
          maxDistance={25} 
          makeDefault 
        />
      </Canvas>
    </div>
  );
}
