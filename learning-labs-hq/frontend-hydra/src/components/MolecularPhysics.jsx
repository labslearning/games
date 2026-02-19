import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, MATERIALS } from '../store/useGameStore';

export default function MolecularPhysics({ count = 200 }) {
  const meshRef = useRef(); const materialRef = useRef(); const pistonRef = useRef();
  const { temp, volume, activeMaterial, phaseID, activeQuiz } = useGameStore();
  const visualVolume = useRef(volume);

  const mat = MATERIALS[activeMaterial] || MATERIALS['H2O'];

  const crystalLattice = useMemo(() => {
    const pos = []; let idx = 0;
    for(let x=0; x<6; x++) for(let y=0; y<6; y++) for(let z=0; z<6; z++) {
      if(idx < count) { pos.push(new THREE.Vector3((x*0.5)-1.25, (y*0.2)+0.15, (z*0.5)-1.25)); idx++; }
    }
    return pos;
  }, [count]);

  const particles = useMemo(() => Array.from({ length: count }, () => ({
    position: new THREE.Vector3((Math.random()-0.5)*3, Math.random()*2 + 0.5, (Math.random()-0.5)*3),
    velocity: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize()
  })), [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!meshRef.current || !materialRef.current) return;

    visualVolume.current += (volume - visualVolume.current) * 0.2;
    const currentCeiling = Math.max(1.0, 4 * (visualVolume.current / 100) - 0.2); 
    if (pistonRef.current) pistonRef.current.position.y = currentCeiling + 0.2; 

    const currentTemp = temp || 300;
    const isSolid = phaseID === 'solid'; const isLiquid = phaseID === 'liquid';

    const targetColor = new THREE.Color(isSolid ? mat.colorS : (isLiquid ? mat.colorL : mat.colorG));
    materialRef.current.emissive.lerp(targetColor, 0.1);
    materialRef.current.emissiveIntensity = isSolid ? 0.5 : (isLiquid ? 1.5 : (currentTemp > 2000 ? 4 : 2));

    const baseSpeed = Math.min(8.0, Math.max(0.05, currentTemp / 120)); 
    const substeps = 5; const subDelta = Math.min(delta, 0.1) / substeps; const radiusLimit = 2.3;

    particles.forEach((p, i) => {
      if (!activeQuiz) {
        if (isSolid) {
          p.position.lerp(crystalLattice[i], 0.1); p.velocity.set(0,0,0);
        } else {
          for(let s = 0; s < substeps; s++) {
            if (isLiquid) {
              p.velocity.y -= 0.5 * subDelta * 50; 
              p.velocity.x += (Math.random() - 0.5) * 0.5; p.velocity.z += (Math.random() - 0.5) * 0.5;
            }
            p.position.addScaledVector(p.velocity, subDelta * baseSpeed * (isLiquid ? 0.3 : 1.5));

            const dist2D = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
            if (dist2D > radiusLimit) {
              const nx = p.position.x / dist2D; const nz = p.position.z / dist2D;
              const dot = p.velocity.x * nx + p.velocity.z * nz;
              if (dot > 0) { p.velocity.x -= 2 * dot * nx; p.velocity.z -= 2 * dot * nz; }
              p.position.x = nx * (radiusLimit - 0.05); p.position.z = nz * (radiusLimit - 0.05);
            }

            if (p.position.y > currentCeiling) { p.position.y = currentCeiling - 0.01; p.velocity.y = -Math.abs(p.velocity.y) * 1.1; }
            if (p.position.y < 0.1) { p.position.y = 0.1; p.velocity.y = Math.abs(p.velocity.y) * (isLiquid ? 0.3 : 1); }
          }
        }
      }
      dummy.position.copy(p.position); dummy.scale.setScalar(0.08); dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <group ref={pistonRef}>
         <mesh position={[0, 2, 0]}><cylinderGeometry args={[0.2, 0.2, 4]} /><meshStandardMaterial color="#444" metalness={1} /></mesh>
         <mesh position={[0, 0, 0]}><cylinderGeometry args={[2.45, 2.45, 0.4, 64]} /><meshStandardMaterial color="#111" metalness={1} /></mesh>
         <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[2.4, 2.4, 0.05, 64]} /><meshStandardMaterial color="#00f2ff" emissive="#00f2ff" emissiveIntensity={2} /></mesh>
      </group>
      <instancedMesh ref={meshRef} args={[null, null, count]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial ref={materialRef} roughness={0.1} metalness={0.9} color={mat.colorG} />
      </instancedMesh>
    </group>
  );
}
