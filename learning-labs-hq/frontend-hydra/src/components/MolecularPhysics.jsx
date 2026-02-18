import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, MATERIALS } from '../store/useGameStore';

export default function MolecularPhysics({ count = 150 }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { temp, volume, activeMaterial } = useGameStore();
  const visualVolume = useRef(volume);

  const crystalLattice = useMemo(() => {
    const pos = []; let idx = 0;
    // Redimensionado para encajar perfectamente debajo del límite del 35%
    for(let x=0; x<6; x++) for(let y=0; y<5; y++) for(let z=0; z<6; z++) {
      if(idx < count) { pos.push(new THREE.Vector3((x*0.6)-1.5, (y*0.25)+0.15, (z*0.6)-1.5)); idx++; }
    }
    return pos;
  }, [count]);

  const particles = useMemo(() => Array.from({ length: count }, () => ({
    position: new THREE.Vector3((Math.random()-0.5)*4, Math.random()*2 + 0.5, (Math.random()-0.5)*4),
    velocity: new THREE.Vector3(Math.random()-0.5, Math.random()-0.5, Math.random()-0.5).normalize()
  })), [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!meshRef.current || !materialRef.current) return;
    visualVolume.current += (volume - visualVolume.current) * 0.15;

    const mat = MATERIALS[activeMaterial];
    const currentTemp = temp || 300;
    const baseSpeed = Math.min(4.0, Math.max(0.05, currentTemp / 100)); 
    
    // 🛡️ LÍMITE DE COLISIÓN SEGURO
    const currentCeiling = Math.max(1.0, 4 * (visualVolume.current / 100) - 0.15); 
    const radiusLimit = 2.3;
    const liquidLevel = 0.9;

    const isSolid = currentTemp <= mat.mp;
    const isLiquid = currentTemp > mat.mp && currentTemp < mat.bp && mat.mp !== mat.bp;

    const targetColor = new THREE.Color(isSolid ? mat.colorSolid : (isLiquid ? mat.colorLiquid : mat.colorGas));
    materialRef.current.emissive.lerp(targetColor, 0.1);
    materialRef.current.emissiveIntensity = isSolid ? 4 : (isLiquid ? 2 : (currentTemp > 2000 ? 3 : 1));

    const substeps = 3;
    const subDelta = delta / substeps;

    particles.forEach((p, i) => {
      if (isSolid) {
        // En estado sólido, ignoran las colisiones del pistón para no generar conflictos matemáticos
        p.position.lerp(crystalLattice[i], 0.2); 
        p.velocity.set(0,0,0);
      } else {
        for(let s = 0; s < substeps; s++) {
          if (isLiquid) {
            p.velocity.y -= 0.5 * subDelta * 60; 
            p.velocity.x *= 0.98; p.velocity.z *= 0.98;
            p.velocity.x += (Math.random() - 0.5) * 0.3; p.velocity.z += (Math.random() - 0.5) * 0.3;
          } else {
            if (p.position.y < 0.5 && Math.random() < 0.05) p.velocity.y += Math.random() * 0.5;
          }

          p.position.addScaledVector(p.velocity, subDelta * baseSpeed * (isLiquid ? 0.2 : 2.0));

          const dist2D = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
          if (dist2D > radiusLimit) {
            const nx = p.position.x / dist2D; const nz = p.position.z / dist2D;
            const dot = p.velocity.x * nx + p.velocity.z * nz;
            if (dot > 0) { p.velocity.x -= 2 * dot * nx; p.velocity.z -= 2 * dot * nz; }
            p.position.x = nx * (radiusLimit - 0.05); p.position.z = nz * (radiusLimit - 0.05);
          }

          if (isLiquid) {
            if (p.position.y > liquidLevel) { p.position.y = liquidLevel; p.velocity.y = -Math.abs(p.velocity.y) * 0.5; }
          } else {
            // Rebote de Gas contra el Pistón Seguro
            if (p.position.y > currentCeiling) { p.position.y = currentCeiling - 0.05; p.velocity.y = -Math.abs(p.velocity.y); }
          }
          
          if (p.position.y < 0.1) { p.position.y = 0.1; p.velocity.y = Math.abs(p.velocity.y) * (isLiquid ? 0.3 : 1); }
        }
      }
      dummy.position.copy(p.position); dummy.scale.setScalar(0.08); dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]}>
      <sphereGeometry args={[1, 12, 12]} />
      <meshStandardMaterial ref={materialRef} roughness={0.1} metalness={0.9} />
    </instancedMesh>
  );
}
