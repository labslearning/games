import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Reactor3D from './components/Reactor3D';
import HolographicHUD from './components/HolographicHUD';
import AITutorHUD from './components/AITutorHUD';

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505' }}>
      {/* HUD de la IA y Telemetría (Capa Superior) */}
      <AITutorHUD />
      
      <Canvas camera={{ position: [0, 5, 12], fov: 45 }}>
        <color attach="background" args={['#020205']} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00f2ff" />
        <spotLight position={[-10, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="#ff0055" />

        <Suspense fallback={null}>
          <Reactor3D />
          <HolographicHUD />
        </Suspense>

        <OrbitControls makeDefault minDistance={5} maxDistance={20} />
      </Canvas>
      
      <div style={styles.overlay}>
        <h1 style={styles.title}>LEARNING LABS: FORJA MOLECULAR</h1>
        <p style={styles.status}>SISTEMA EN LÍNEA // NÚCLEO ACTIVO</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'absolute', bottom: '30px', left: '30px', color: '#00f2ff', pointerEvents: 'none', fontFamily: 'Orbitron, sans-serif' },
  title: { margin: 0, fontSize: '18px', letterSpacing: '4px', textShadow: '0 0 10px #00f2ff' },
  status: { margin: 0, fontSize: '10px', opacity: 0.6, letterSpacing: '2px' }
};
