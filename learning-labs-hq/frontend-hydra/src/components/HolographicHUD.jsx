import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import { useGameStore } from '../store/useGameStore';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * TIER GOD HUD: Holograma con Analítica de Datos
 * Características: Gráfico de tendencia, Glitch reactivo y Billboarding.
 */
export default function HolographicHUD() {
  const { temp, pressure, isCritical } = useGameStore();
  const [history, setHistory] = useState([]);

  // TIER GOD: Guardamos el historial de presión para el gráfico de ondas
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => [...prev.slice(-20), pressure]);
    }, 100);
    return () => clearInterval(interval);
  }, [pressure]);

  const pressurePercent = Math.min((pressure / 5000) * 100, 100);

  return (
    <group position={[0, 4.8, 0]}>
      <Html 
        center 
        distanceFactor={8} 
        transform // Tier God: Hace que la UI se comporte como un objeto 3D real
        occlude="blending" // Se oculta detrás de objetos pero con blending suave
      >
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.container(isCritical)}
        >
          {/* Efecto de Ruido Estático */}
          <div style={styles.noise} />
          <div style={styles.scanline} />

          <div style={styles.header}>
            <span>LAB_DEVICE_01</span>
            <span style={styles.dot(isCritical)} />
          </div>

          <div style={styles.mainDisplay}>
            <div style={styles.dataGroup}>
              <span style={styles.label}>CORE_TEMP</span>
              <span style={styles.bigValue}>{temp.toFixed(0)}<small>K</small></span>
            </div>
            
            {/* GRÁFICO DE ONDAS (Sparkline SVG) */}
            <svg viewBox="0 0 100 30" style={styles.svg}>
              <polyline
                fill="none"
                stroke={isCritical ? "#ff3333" : "#00f2ff"}
                strokeWidth="1"
                points={history.map((p, i) => `${(i / 20) * 100},${30 - (p / 5000) * 30}`).join(' ')}
              />
            </svg>
          </div>

          <div style={styles.footer}>
            <div style={styles.barLabel}>
              <span>PRESSURE_PSI</span>
              <span>{pressure.toFixed(1)}</span>
            </div>
            <div style={styles.barContainer}>
              <motion.div 
                animate={{ width: `${pressurePercent}%` }}
                style={styles.barFill(isCritical)} 
              />
            </div>
          </div>

          <AnimatePresence>
            {isCritical && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.2 }}
                style={styles.glitchOverlay}
              >
                CRITICAL_ERROR
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </Html>
    </group>
  );
}

const styles = {
  container: (isCritical) => ({
    fontFamily: "'Orbitron', sans-serif",
    background: isCritical ? 'rgba(40, 0, 0, 0.9)' : 'rgba(0, 15, 25, 0.85)',
    border: `1px solid ${isCritical ? '#ff3333' : '#00f2ff'}`,
    padding: '15px',
    borderRadius: '2px',
    color: '#00f2ff',
    width: '200px',
    backdropFilter: 'blur(10px)',
    boxShadow: `0 0 30px ${isCritical ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 242, 255, 0.2)'}`,
    position: 'relative',
    transform: 'perspective(1000px) rotateX(10deg)', // Inclinación diegética
  }),
  noise: {
    position: 'absolute',
    inset: 0,
    backgroundImage: 'url("https://media.giphy.com/media/oEI9uWUic9V3S/giphy.gif")', // Textura de ruido sutil
    opacity: 0.03,
    pointerEvents: 'none'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '8px',
    letterSpacing: '3px',
    borderBottom: '1px solid rgba(0, 242, 255, 0.2)',
    paddingBottom: '5px',
    marginBottom: '10px'
  },
  dot: (isCritical) => ({
    width: '6px', height: '6px',
    borderRadius: '50%',
    background: isCritical ? '#ff3333' : '#00f2ff',
    boxShadow: `0 0 10px ${isCritical ? '#ff3333' : '#00f2ff'}`
  }),
  mainDisplay: { display: 'flex', flexDirection: 'column', gap: '5px' },
  bigValue: { fontSize: '24px', fontWeight: '900', display: 'block' },
  label: { fontSize: '9px', opacity: 0.6 },
  svg: { width: '100%', height: '40px', marginTop: '5px', filter: 'drop-shadow(0 0 5px rgba(0, 242, 255, 0.5))' },
  footer: { marginTop: '10px' },
  barLabel: { display: 'flex', justifyContent: 'space-between', fontSize: '9px', marginBottom: '4px' },
  barContainer: { height: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  barFill: (isCritical) => ({
    height: '100%',
    background: isCritical ? '#ff3333' : '#00f2ff',
    boxShadow: `0 0 15px ${isCritical ? '#ff3333' : '#00f2ff'}`
  }),
  glitchOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(255, 0, 0, 0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: 'bold', color: 'white',
    letterSpacing: '5px', zIndex: 10
  }
};
