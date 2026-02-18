import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import * as THREE from 'three';

/**
 * AUDIO SYSTEM: TIER GOD (CDN Edition)
 * Orquestador de sonido espacial utilizando recursos remotos de Cloudinary.
 */
export default function AudioSystem() {
  const { camera } = useThree();
  const { temp, pressure, isCritical, ai } = useGameStore();
  
  const listener = useRef(new THREE.AudioListener());
  const reactorHumRef = useRef();
  const aiSoundRef = useRef();
  const alarmSoundRef = useRef();

  // 1. Configuración del "Oído" del estudiante [cite: 10, 11]
  useEffect(() => {
    camera.add(listener.current);
    return () => camera.remove(listener.current);
  }, [camera]);

  // 2. TIER GOD: Modulación Dinámica de Frecuencia 
  // El reactor "ruge" según las leyes de la termodinámica
  useFrame(() => {
    if (reactorHumRef.current) {
      // El tono sube con la temperatura (Pitch Shift) 
      const pitch = 1.0 + (temp / 1000); 
      reactorHumRef.current.setPlaybackRate(pitch);
      
      // El volumen escala con la presión
      const volume = Math.min(0.2 + (pressure / 5000), 1.5);
      reactorHumRef.current.setVolume(volume);
    }
  });

  // 3. Disparador de la IA (Holograma) 
  useEffect(() => {
    if (ai.isTalking && aiSoundRef.current) {
      if (aiSoundRef.current.isPlaying) aiSoundRef.current.stop();
      aiSoundRef.current.play();
    }
  }, [ai.isTalking]);

  // 4. Alarma Crítica (Se activa solo en IsCritical) 
  useEffect(() => {
    if (isCritical && alarmSoundRef.current) {
      if (!alarmSoundRef.current.isPlaying) alarmSoundRef.current.play();
    } else if (alarmSoundRef.current?.isPlaying) {
      alarmSoundRef.current.stop();
    }
  }, [isCritical]);

  return (
    <group>
      {/* Zumbido Eléctrico Espacial (Drone Sound)  */}
      <PositionalAudio
        ref={reactorHumRef}
        url="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav"
        loop
        distance={5}
        autoplay
      />

      {/* Sonido de la IA (Hologram Sound)  */}
      <audio
        ref={aiSoundRef}
        args={[listener.current]}
        onUpdate={(self) => {
          const loader = new THREE.AudioLoader();
          loader.load('https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364083/hologram_kgkmvs.wav', (buffer) => {
            self.setBuffer(buffer);
          });
        }}
      />

      {/* Alarma de Presión (Alarm Sound)  */}
      <audio
        ref={alarmSoundRef}
        args={[listener.current]}
        onUpdate={(self) => {
          const loader = new THREE.AudioLoader();
          loader.load('https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364149/Alarm_unobfl.wav', (buffer) => {
            self.setBuffer(buffer);
            self.setLoop(true);
            self.setVolume(0.4);
          });
        }}
      />
    </group>
  );
}
