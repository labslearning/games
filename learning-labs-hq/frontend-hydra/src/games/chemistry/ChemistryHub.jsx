import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Float, Text, Grid, Center, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Scanline, Vignette, Noise } from '@react-three/postprocessing';
import { useGameStore } from '../../store/useGameStore';
import RedoxLab from './RedoxLab';
import RedoxBalancer from './RedoxBalancer';

/* ============================================================
   🔊 MOTOR DE AUDIO DE INTERFAZ (SONIDOS DE SISTEMA)
============================================================ */
const playSfx = (type) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  
  if (type === 'hover') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
  } else {
    osc.type = 'square'; osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
  }
  osc.start(); osc.stop(ctx.currentTime + 0.3);
};

/* ============================================================
   🌍 DICCIONARIO GLOBAL (MULTILINGÜE 100%)
============================================================ */
const DICT = {
  es: { title: "NEXO QUÍMICO HYDRA", sub: "PROTOCOLOS DE SIMULACIÓN CUÁNTICA", lab: "LABORATORIO NANO-CORE", labD: "Estados de oxidación y misiones de campo.", bal: "BALANCEADOR RÉDOX", balD: "Ajuste cuántico de masa y carga electrónica.", boot: "CARGANDO MÓDULOS...", enter: "ACCEDER" },
  en: { title: "HYDRA CHEMICAL NEXUS", sub: "QUANTUM SIMULATION PROTOCOLS", lab: "NANO-CORE LAB", labD: "Oxidation states and field missions.", bal: "REDOX BALANCER", balD: "Quantum adjustment of mass and charge.", boot: "LOADING MODULES...", enter: "ENTER" },
  fr: { title: "NEXUS CHIMIQUE HYDRA", sub: "PROTOCOLES DE SIMULATION", lab: "LABO NANO-CORE", labD: "États d'oxydation et missions.", bal: "BALANCEUR RÉDOX", balD: "Ajustement de la masse et de la charge.", boot: "CHARGEMENT...", enter: "ENTRER" },
  de: { title: "HYDRA CHEMIE-NEXUS", sub: "QUANTENSIMULATIONSPROTOKOLLE", lab: "NANO-CORE LABOR", labD: "Oxidationsstufen und Missionen.", bal: "REDOX-BALANCER", balD: "Anpassung von Masse und Ladung.", boot: "MODULE LADEN...", enter: "STARTEN" }
};

export default function ChemistryHub() {
  const { language } = useGameStore();
  const [activeGame, setActiveGame] = useState(null);
  const [booting, setBooting] = useState(true);
  
  const lang = DICT[language] ? language : 'es';
  const d = DICT[lang];

  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (activeGame === 'lab') return <RedoxLab onBack={() => setActiveGame(null)} />;
  if (activeGame === 'balancer') return <RedoxBalancer onBack={() => setActiveGame(null)} />;

  return (
    <div style={ui.container}>
      {booting ? (
        <div style={ui.bootScreen}>
          <div style={ui.terminalText}>{d.boot}</div>
          <div style={ui.progressBar}><div style={ui.progressFill} /></div>
        </div>
      ) : (
        <>
          <div style={ui.content}>
            <header style={ui.header}>
              <h1 style={ui.glitchTitle}>{d.title}</h1>
              <p style={ui.subTitle}>{d.sub}</p>
            </header>

            <div style={ui.grid}>
              {/* CARD 1: LAB */}
              <div 
                style={ui.card('#00f2ff')} 
                onMouseEnter={() => playSfx('hover')}
                onClick={() => { playSfx('click'); setActiveGame('lab'); }}
              >
                <div style={ui.icon}>⚛️</div>
                <h3>{d.lab}</h3>
                <p>{d.labD}</p>
                <div style={ui.btn( '#00f2ff')}>{d.enter}</div>
              </div>

              {/* CARD 2: BALANCER */}
              <div 
                style={ui.card('#ff0055')} 
                onMouseEnter={() => playSfx('hover')}
                onClick={() => { playSfx('click'); setActiveGame('balancer'); }}
              >
                <div style={ui.icon}>⚖️</div>
                <h3>{d.bal}</h3>
                <p>{d.balD}</p>
                <div style={ui.btn('#ff0055')}>{d.enter}</div>
              </div>
            </div>
          </div>

          {/* 🌌 MOTOR 3D DE FONDO PARA EL MENÚ */}
          <div style={ui.canvasWrap}>
            <Canvas camera={{ position: [0, 2, 10] }}>
              <color attach="background" args={['#000308']} />
              <Stars count={5000} factor={4} fade speed={2} />
              <Sparkles count={100} scale={10} size={2} color="#00f2ff" />
              <Grid 
                infiniteGrid 
                fadeDistance={30} 
                sectionColor="#001520" 
                cellColor="#002535" 
                sectionSize={3} 
                cellSize={1} 
              />
              <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <mesh rotation={[Math.PI/4, 0, 0]} position={[0,0,-5]}>
                  <torusGeometry args={[8, 0.01, 16, 100]} />
                  <meshBasicMaterial color="#00f2ff" transparent opacity={0.2} />
                </mesh>
              </Float>
              <EffectComposer>
                <Bloom intensity={1.5} luminanceThreshold={0.1} />
                <Noise opacity={0.05} />
                <Vignette darkness={1.2} />
              </EffectComposer>
            </Canvas>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   🎨 ESTILOS "ULTRA-TECH"
============================================================ */
const ui = {
  container: { position: 'absolute', inset: 0, background: '#000', overflow: 'hidden', fontFamily: 'Orbitron, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  canvasWrap: { position: 'absolute', inset: 0, zIndex: 1 },
  content: { position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' },
  header: { textAlign: 'center', marginBottom: '80px' },
  glitchTitle: { color: '#fff', fontSize: '55px', letterSpacing: '12px', margin: 0, textShadow: '0 0 30px rgba(0,242,255,0.5)' },
  subTitle: { color: '#00f2ff', fontSize: '14px', letterSpacing: '5px', marginTop: '15px', opacity: 0.8 },
  grid: { display: 'flex', gap: '50px' },
  card: (color) => ({
    width: '380px', padding: '50px', background: 'rgba(0,10,20,0.7)', border: `1px solid ${color}44`,
    borderRadius: '24px', backdropFilter: 'blur(20px)', cursor: 'pointer', transition: '0.4s',
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)', borderTop: `1px solid ${color}aa`,
    ":hover": { transform: 'translateY(-15px)', borderColor: color, boxShadow: `0 0 60px ${color}33` }
  }),
  icon: { fontSize: '70px', marginBottom: '25px' },
  btn: (color) => ({
    marginTop: '30px', padding: '12px 40px', border: `2px solid ${color}`, color: color,
    fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', borderRadius: '4px'
  }),
  bootScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1000 },
  terminalText: { color: '#00f2ff', fontSize: '18px', letterSpacing: '4px', marginBottom: '20px' },
  progressBar: { width: '300px', height: '2px', background: 'rgba(0,242,255,0.1)' },
  progressFill: { 
    width: '100%', height: '100%', background: '#00f2ff', 
    animation: 'load 2s ease-in-out infinite' 
  }
};

// Inyectamos la animación CSS para el loading
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes load { 0% { width: 0%; } 100% { width: 100%; } }
`;
document.head.appendChild(styleSheet);
