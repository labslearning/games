import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useGameStore } from '../../../store/useGameStore';

// 🟢 KERNEL 3D: React Three Fiber & Drei
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Line, Float, Sparkles } from '@react-three/drei';

// 🟢 POSTPROCESADO: Efectos Visuales AAA
import { EffectComposer, Bloom, Glitch, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ⚙️ CONFIGURACIÓN DEL WORKER NATIVO
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/* ============================================================
   🌌 KERNEL CONFIG: NEURAL LINK & AI ROUTING
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🎹 MOTOR DE AUDIO SINTETIZADO (WEB AUDIO API - ZERO LATENCY)
============================================================ */
const FREQUENCIES = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33]; // Escala Do Mayor
const SynthEngine = {
  ctx: null,
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playTone(index, type = 'sine', duration = 0.5) {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      // Asignar frecuencia basada en el índice del nodo
      osc.frequency.setValueAtTime(FREQUENCIES[index % FREQUENCIES.length], this.ctx.currentTime);
      
      // Envolvente de volumen (Attack/Decay)
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch(e) {
      console.warn("[Unit 8200] SynthEngine bloqueado por políticas del navegador");
    }
  },
  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.6);
      
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch(e) {}
  },
  playSuccess() {
    this.playTone(0, 'triangle', 0.2);
    setTimeout(() => this.playTone(4, 'triangle', 0.3), 150);
    setTimeout(() => this.playTone(7, 'triangle', 0.5), 300);
  }
};

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON
============================================================ */
const BASE_LEXICON = {
  es: {
    title: "MATRIZ DE SECUENCIA QUANTUM", subtitle: "UNIT 8200: ENTRENAMIENTO DE REPLICACIÓN",
    tutorialBtn: "VER MANUAL TÁCTICO", startBtn: "INICIAR SINCRONIZACIÓN",
    aiTitle: "REPORTE DE RENDIMIENTO COGNITIVO", back: "CERRAR ENLACE", loadingAi: "ANALIZANDO SINAPSIS...",
    level: "NIVEL DE PATRÓN", score: "PUNTAJE TOTAL", rank: "RANGO",
    phaseWatch: "FASE 1: MEMORIZA EL PATRÓN", phasePlay: "FASE 2: REPITE LA SECUENCIA",
    successMsg: "SECUENCIA CORRECTA", failMsg: "ERROR DE SECUENCIA",
    tut1: "SISTEMA DE REPLICACIÓN ESPACIAL", 
    tut2: "La matriz generará un patrón visual y sonoro en los nodos de cristal.",
    tut3: "1. OBSERVA: No toques nada. Memoriza el orden en el que se iluminan.",
    tut4: "2. REPLICA: Cuando el sistema indique 'FASE 2', haz clic en los nodos en el MISMO ORDEN exacto.",
    tut5: "Si te equivocas, la matriz colapsará. Si aciertas, el patrón aumentará su longitud."
  }
};

const LEXICON = new Proxy(BASE_LEXICON, {
  get: (target, prop) => target[prop] || target['es']
});

/* ============================================================
   🎙️ MOTOR DE VOZ IA
============================================================ */
class VoiceEngine {
  constructor() { this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null; }
  speak(text) {
    if (!this.synth) return;
    this.synth.cancel(); 
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = 'es-ES'; utterThis.rate = 1.1; utterThis.pitch = 0.95;
    this.synth.speak(utterThis);
  }
  stop() { if (this.synth) this.synth.cancel(); }
}
const TTS = new VoiceEngine();

/* ============================================================
   🧠 ZUSTAND STORE: LÓGICA DE MEMORIA SECUENCIAL (PATTERN MATCHING)
============================================================ */
const RANKS = ["NOVATO", "CADETE", "OPERATIVO", "ESPECIALISTA", "COMANDANTE", "UNIT 8200 ELITE"];
const COLORS = ['#00f2ff', '#ff0055', '#ffea00', '#8b5cf6', '#00ff88', '#ff8800', '#ff00ff', '#00ffcc', '#ffcc00'];

// Posiciones exactas en cuadrícula 3x3
const POSITIONS = [
  [-3.2, 3.2, 0],  [0, 3.2, 0],  [3.2, 3.2, 0],
  [-3.2, 0, 0],    [0, 0, 0],    [3.2, 0, 0],
  [-3.2, -3.2, 0], [0, -3.2, 0], [3.2, -3.2, 0]
];

const usePatternStore = create((set, get) => ({
  gameState: 'IDLE', // IDLE, TUTORIAL, SHOWING_PATTERN, AWAITING_INPUT, SUCCESS, FAIL, AI_ANALYSIS
  level: 3, // Longitud inicial del patrón
  score: 0,
  currentRank: 0,
  pattern: [], // Array de índices [0, 5, 2, ...]
  userSequence: [], // Array de índices clickeados
  activeNodeIndex: null, // Nodo iluminado por el sistema
  
  openTutorial: () => set({ gameState: 'TUTORIAL' }),
  closeTutorial: () => set({ gameState: 'IDLE' }),

  startLevel: () => {
    const currentLevel = get().level;
    const newPattern = [];
    let lastNode = -1;
    
    // Generación Procedural O(N): Evita repetir el mismo nodo consecutivamente
    for(let i = 0; i < currentLevel; i++) {
      let nextNode;
      do {
        nextNode = Math.floor(Math.random() * POSITIONS.length);
      } while (nextNode === lastNode && POSITIONS.length > 1);
      lastNode = nextNode;
      newPattern.push(nextNode);
    }
    
    set({ gameState: 'SHOWING_PATTERN', pattern: newPattern, userSequence: [], activeNodeIndex: null });
  },

  startGame: () => {
    set({ score: 0, level: 3, currentRank: 0 });
    get().startLevel();
  },

  setActiveNode: (idx) => set({ activeNodeIndex: idx }),

  handleUserClick: (nodeIndex) => {
    const state = get();
    // Firewall: Solo permite clics cuando es el turno del usuario
    if (state.gameState !== 'AWAITING_INPUT') return;

    SynthEngine.playTone(nodeIndex, 'sine', 0.2); 
    
    const newUserSeq = [...state.userSequence, nodeIndex];
    const currentIndex = newUserSeq.length - 1;

    // Validación O(1) Instantánea
    if (newUserSeq[currentIndex] !== state.pattern[currentIndex]) {
      // ❌ ERROR CRÍTICO
      SynthEngine.playError();
      set({ gameState: 'FAIL', activeNodeIndex: null });
      setTimeout(() => {
        set({ gameState: 'AI_ANALYSIS' });
      }, 1500);
      return;
    }

    // ✅ ACIERTO PARCIAL
    set({ userSequence: newUserSeq });

    // ✅ PATRÓN COMPLETADO
    if (newUserSeq.length === state.pattern.length) {
      SynthEngine.playSuccess();
      const newScore = state.score + (state.level * 150);
      const newLevel = state.level + 1;
      const newRank = Math.min(RANKS.length - 1, Math.floor((newLevel - 3) / 2)); // Progresión de rango
      
      set({ gameState: 'SUCCESS', score: newScore, level: newLevel, currentRank: newRank, activeNodeIndex: null });
      
      // Auto-iniciar siguiente nivel
      setTimeout(() => {
        get().startLevel();
      }, 2000);
    }
  },

  resetToIdle: () => {
    TTS.stop();
    set({ gameState: 'IDLE', pattern: [], userSequence: [], level: 3, score: 0 });
  }
}));

/* ============================================================
   🧊 3D ENGINE: MATRIZ QUANTUM ESTÁTICA Y CLICKABLE
============================================================ */

// Anclaje de cámara para eliminar la rotación indeseada
const CameraRig = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 14); // Distancia calibrada para que los 9 nodos se vean perfectos
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
};

const Node = React.memo(({ position, index }) => {
  const { gameState, activeNodeIndex, handleUserClick } = usePatternStore();
  const meshRef = useRef();
  
  // Geometría instanciada para performance extremo (0 Memory Leaks)
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.9, 1), []);
  const wireGeometry = useMemo(() => new THREE.BoxGeometry(2.0, 2.0, 2.0), []);

  const [hovered, setHovered] = useState(false);
  const [clickFlash, setClickFlash] = useState(false);
  
  // Lógica de Iluminación
  const isSystemFlashing = activeNodeIndex === index;
  const isUserFlashing = gameState === 'AWAITING_INPUT' && clickFlash;
  const isFlashing = isSystemFlashing || isUserFlashing;

  const targetColor = COLORS[index % COLORS.length];

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Crecimiento elástico
      const targetScale = isFlashing ? 1.4 : 0.6;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 15);
      
      // Rotación individual del nodo holográfico
      meshRef.current.rotation.x += delta * 0.4;
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Eventos de Raycaster optimizados para Web y Móvil
  const onPointerOver = useCallback((e) => { 
    if (gameState === 'AWAITING_INPUT') { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }
  }, [gameState]);
  
  const onPointerOut = useCallback((e) => { 
    if (gameState === 'AWAITING_INPUT') { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'default'; }
  }, [gameState]);
  
  const onPointerDown = useCallback((e) => { 
    if (gameState === 'AWAITING_INPUT') {
      e.stopPropagation(); 
      handleUserClick(index); 
      // Efecto visual de pulsación corta
      setClickFlash(true);
      setTimeout(() => setClickFlash(false), 250);
    }
  }, [gameState, index, handleUserClick]);

  return (
    <group position={position}>
      {/* Box exterior fijo (Guía visual perimetral) */}
      <mesh geometry={wireGeometry}>
        <meshBasicMaterial color="#005577" wireframe transparent opacity={0.15} />
      </mesh>
      
      {/* Nodo de Cristal Interactivo */}
      <mesh 
        ref={meshRef} 
        geometry={geometry}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown} 
      >
        <meshStandardMaterial 
          color={targetColor} 
          emissive={targetColor} 
          emissiveIntensity={isFlashing ? 5.0 : (hovered ? 0.8 : 0.1)} 
          roughness={0.1} metalness={0.9} transparent 
          opacity={isFlashing ? 1 : (hovered ? 0.6 : 0.3)}
        />
      </mesh>

      {/* Explosión de Partículas al Iluminarse */}
      {isFlashing && (
        <Sparkles count={25} scale={2.5} size={5} speed={0.8} opacity={0.9} color={targetColor} />
      )}
    </group>
  );
});

// Enlaces Neurales (Caminos entre Nodos)
const QuantumLinks = () => {
  return (
    <group>
      <Line points={[POSITIONS[0], POSITIONS[2]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
      <Line points={[POSITIONS[3], POSITIONS[5]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
      <Line points={[POSITIONS[6], POSITIONS[8]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
      <Line points={[POSITIONS[0], POSITIONS[6]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
      <Line points={[POSITIONS[1], POSITIONS[7]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
      <Line points={[POSITIONS[2], POSITIONS[8]]} color="#005577" opacity={0.2} transparent lineWidth={2} />
    </group>
  );
};

const QuantumGrid = () => {
  return (
    // Float envuelve a la matriz entera. Le da un ligero balanceo de "respiración", 
    // pero no gira sobre los ejes X/Y, por lo que los nodos no cambian de lugar.
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.3}>
      <group position={[0, 0, 0]}>
        <QuantumLinks />
        {POSITIONS.map((pos, idx) => (
          <Node key={idx} index={idx} position={pos} />
        ))}
      </group>
    </Float>
  );
};

/* ============================================================
   🤖 KERNEL: ANALISTA IA DE DEEPSEEK
============================================================ */
const analyzeTelemetryWithAI = async (level, score, rank, abortSignal) => {
  const sysPrompt = `
    Eres la IA de Mando de la Unit 8200. El cadete finalizó el entrenamiento de Memoria de Secuencia Espacial.
    Llegó al Nivel: ${level} (nodos). Rango actual: ${RANKS[rank]}. Puntaje: ${score}.
    
    Da un reporte militar directo en Español. 
    Si superó el nivel 7, felicítalo por su "hipocampo y retención espacial excepcional".
    Si perdió antes del nivel 5, indícale que su "corteza visual sufrió un colapso prematuro".
    Máximo 40 palabras.
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      signal: abortSignal,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7 })
    });
    if (!res.ok) throw new Error("API Failure");
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (e) {
    if (e.name === 'AbortError') return "TRANSMISIÓN CANCELADA.";
    return level > 6 
      ? `SISTEMA TÁCTICO APROBADO. Has retenido con éxito un patrón de ${level} nodos. Tu córtex visual opera dentro de los estándares de élite.` 
      : `FALLO DE SINCRONIZACIÓN. Has perdido el patrón en la fase ${level}. Necesitas calibrar tu memoria a corto plazo urgentemente.`;
  }
};

/* ============================================================
   🎮 MAIN INTERFACE: THE ACCELERATOR (UI PARA PATRONES ESPACIALES)
============================================================ */
export default function QuantumNBack() {
  const gameStore = useGameStore();
  const language = gameStore?.language || 'es';
  const UI = LEXICON[language] || LEXICON['es'];

  const { gameState, level, score, currentRank, pattern, userSequence, startGame, resetToIdle, openTutorial, closeTutorial, setActiveNode } = usePatternStore();
  
  const [aiReport, setAiReport] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortControllerRef = useRef(null);

  // ⏱️ GESTOR DE LA FASE DE OBSERVACIÓN (IA REPRODUCIENDO EL PATRÓN)
  useEffect(() => {
    if (gameState === 'SHOWING_PATTERN') {
      let isCancelled = false;
      
      const playPattern = async () => {
        // Pausa de cortesía para que el usuario preste atención
        await new Promise(r => setTimeout(r, 1200));
        
        for (let i = 0; i < pattern.length; i++) {
          if (isCancelled) break;
          const nodeIndex = pattern[i];
          
          // Encender nodo y reproducir sonido
          setActiveNode(nodeIndex);
          SynthEngine.playTone(nodeIndex, 'sine', 0.4);
          
          // Duración del destello (Acelera un poco en niveles altísimos)
          const flashDuration = Math.max(300, 700 - (level * 15));
          await new Promise(r => setTimeout(r, flashDuration));
          
          // Apagar nodo
          setActiveNode(null);
          
          // Pausa entre destellos (Gap)
          const gapDuration = Math.max(150, 350 - (level * 10));
          await new Promise(r => setTimeout(r, gapDuration));
        }
        
        if (!isCancelled) {
          // Termina de mostrar, cede el control al jugador
          usePatternStore.setState({ gameState: 'AWAITING_INPUT' });
        }
      };

      playPattern();
      return () => { isCancelled = true; setActiveNode(null); };
    }
  }, [gameState, pattern, level, setActiveNode]);

  // 🤖 DISPARADOR DE ANÁLISIS LLM POST-JUEGO
  useEffect(() => {
    if (gameState === 'AI_ANALYSIS') {
      setIsAnalyzing(true);
      abortControllerRef.current = new AbortController();
      analyzeTelemetryWithAI(level, score, currentRank, abortControllerRef.current.signal)
        .then(report => {
          setAiReport(report);
          setIsAnalyzing(false);
          TTS.speak(report);
        });
    }
    return () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };
  }, [gameState, level, score, currentRank]);

  // 🎨 CÁLCULOS UI
  // Barra de progreso basada en el nivel actual
  const progressPercent = gameState === 'AWAITING_INPUT' ? (userSequence.length / pattern.length) * 100 : 0;

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: '#010308', fontFamily: "'Orbitron', system-ui, sans-serif", 
      color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
      touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none'
    }}>
      
      {/* ⚡ CIBER-ESTILOS CSS INYECTADOS */}
      <style>{`
        @keyframes pulseAlert { 0%, 100% { box-shadow: inset 0 0 10px currentColor; } 50% { box-shadow: inset 0 0 35px currentColor; transform: scale(1.02); } }
        @keyframes slideInUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .cyber-glass { background: rgba(2,6,23,0.85); backdrop-filter: blur(25px); border: 1px solid rgba(0,242,255,0.2); box-shadow: inset 0 0 20px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.8); }
        .scan-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,242,255,0.03) 51%, transparent 51%); background-size: 100% 4px; pointer-events: none; z-index: 5; opacity: 0.6; mix-blend-mode: screen;}
        
        .btn-matrix {
          position: relative; overflow: hidden; font-weight: 900; letter-spacing: 2px; text-transform: uppercase;
          transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275); touch-action: manipulation; cursor: pointer;
          box-shadow: 0 6px 0 rgba(0,0,0,0.6), 0 15px 25px rgba(0,0,0,0.5);
        }
        .btn-matrix:active { transform: translateY(6px); box-shadow: 0 0 0 rgba(0,0,0,0.6), 0 5px 10px rgba(0,0,0,0.5); filter: brightness(1.3); }
        
        .rank-badge { padding: 8px 20px; background: linear-gradient(90deg, #ff0055, #880022); border-radius: 8px; font-size: 0.9rem; letter-spacing: 4px; font-weight: 900; text-shadow: 0 0 10px #ff0055; box-shadow: 0 0 20px rgba(255,0,85,0.5); border: 1px solid #ff0055; display: inline-block;}
      `}</style>

      <div className="scan-overlay"></div>

      {/* 🌌 3D KERNEL ENVIRONMENT - LA MATRIZ DE MEMORIA */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Canvas dpr={[1, 2]}>
          <CameraRig />
          <color attach="background" args={['#010308']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={3} color="#00f2ff" />
          <pointLight position={[-10, -10, -10]} intensity={2} color="#ff0055" />
          {gameState !== 'AI_ANALYSIS' && <Stars radius={100} depth={50} count={6000} factor={4} saturation={1} fade speed={0.5} />}
          
          <Suspense fallback={null}>
            <QuantumGrid />
          </Suspense>
          
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.8} height={300} intensity={2.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.2} />
            {gameState === 'FAIL' && <ChromaticAberration offset={[0.08, 0.08]} />}
            {gameState === 'FAIL' && <Glitch delay={[0, 0]} duration={[0.3, 0.6]} strength={[0.8, 1.0]} active />}
          </EffectComposer>
        </Canvas>
      </div>

      {/* 🚀 OVERLAYS UI (Z-INDEX 10) */}
      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
        
        {/* TOP HUD: ESTADO EN VIVO */}
        {(gameState === 'SHOWING_PATTERN' || gameState === 'AWAITING_INPUT' || gameState === 'SUCCESS' || gameState === 'FAIL') && (
          <header style={{ padding: 'clamp(15px, 3vh, 25px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', maxWidth: '900px' }}>
              <div className="cyber-glass" style={{ padding: '15px 25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '8px', pointerEvents: 'auto' }}>
                <div className="rank-badge">{RANKS[currentRank]}</div>
                <div style={{ color: '#00f2ff', fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: '900', letterSpacing: '4px', textShadow: '0 0 25px rgba(0,242,255,0.8)' }}>
                  NIVEL {level}
                </div>
              </div>
              <div className="cyber-glass" style={{ padding: '15px 25px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '2px', fontWeight: 'bold' }}>PUNTAJE TOTAL</div>
                <div style={{ color: '#ffea00', fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', fontWeight: '900', textShadow: '0 0 20px rgba(255,234,0,0.6)' }}>
                  <i className="fas fa-trophy me-2" style={{fontSize: '1rem'}}></i>{score}
                </div>
              </div>
            </div>

            {/* INDICADOR DE FASE GIGANTE Y PARPADEANTE */}
            <div style={{ 
              background: gameState === 'SHOWING_PATTERN' ? 'rgba(0,242,255,0.15)' : gameState === 'SUCCESS' ? 'rgba(0,255,136,0.15)' : gameState === 'FAIL' ? 'rgba(255,0,85,0.15)' : 'rgba(255,234,0,0.15)', 
              border: `2px solid ${gameState === 'SHOWING_PATTERN' ? '#00f2ff' : gameState === 'SUCCESS' ? '#00ff88' : gameState === 'FAIL' ? '#ff0055' : '#ffea00'}`,
              color: gameState === 'SHOWING_PATTERN' ? '#00f2ff' : gameState === 'SUCCESS' ? '#00ff88' : gameState === 'FAIL' ? '#ff0055' : '#ffea00',
              padding: '15px 35px', borderRadius: '16px', backdropFilter: 'blur(15px)',
              animation: gameState === 'AWAITING_INPUT' ? 'pulseAlert 1.5s infinite' : 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 2rem)', fontWeight: '900', textShadow: '0 0 15px currentColor', letterSpacing: '2px' }}>
                {gameState === 'SHOWING_PATTERN' ? (
                  <><i className="fas fa-eye me-3"></i> {UI.phaseWatch}</>
                ) : gameState === 'AWAITING_INPUT' ? (
                  <><i className="fas fa-hand-pointer me-3"></i> {UI.phasePlay}</>
                ) : gameState === 'SUCCESS' ? (
                  <><i className="fas fa-check-circle me-3"></i> {UI.successMsg}</>
                ) : (
                  <><i className="fas fa-skull-crossbones me-3"></i> {UI.failMsg}</>
                )}
              </h2>
              
              {/* Barra de progreso de clics del usuario */}
              {gameState === 'AWAITING_INPUT' && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ textAlign: 'center', fontSize: '1rem', color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>
                    NODOS CONFIRMADOS: <span style={{color: '#ffea00', fontSize: '1.4rem'}}>{userSequence.length}</span> / {pattern.length}
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: '#ffea00', transition: 'width 0.2s', boxShadow: '0 0 10px #ffea00' }}></div>
                  </div>
                </div>
              )}
            </div>
          </header>
        )}

        {/* BOTTOM CONTROLS & ONBOARDING */}
        <footer style={{ padding: 'clamp(20px, 5vw, 40px)', display: 'flex', flexDirection: 'column', gap: '20px', background: gameState === 'IDLE' || gameState === 'TUTORIAL' || gameState === 'AI_ANALYSIS' ? 'linear-gradient(transparent, rgba(2,6,23,1) 85%)' : 'none', marginTop: 'auto', pointerEvents: 'auto' }}>
          
          {gameState === 'IDLE' && (
            <div className="cyber-glass" style={{ padding: 'clamp(35px, 6vw, 55px)', borderRadius: '32px', textAlign: 'center', maxWidth: '800px', margin: '0 auto', width: '100%', borderTop: '5px solid #00f2ff' }}>
              <i className="fas fa-microchip fa-4x mb-4" style={{ color: '#00f2ff', filter: 'drop-shadow(0 0 25px #00f2ff)' }}></i>
              <h2 style={{ color: '#fff', margin: '0 0 20px 0', letterSpacing: '6px', fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '900', textShadow: '0 0 35px rgba(255,255,255,0.7)' }}>
                {UI.title}
              </h2>
              <p style={{color: '#00f2ff', marginBottom: '35px', fontWeight: 'bold', letterSpacing: '3px', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)'}}>{UI.subtitle}</p>
              
              <button className="btn-matrix" onClick={openTutorial} style={{ background: 'rgba(255,234,0,0.1)', color: '#ffea00', border: '2px solid #ffea00', padding: '18px 30px', borderRadius: '16px', fontSize: '1.2rem', marginBottom: '30px', width: '100%' }}>
                <i className="fas fa-book-open me-3"></i>{UI.tutorialBtn}
              </button>

              <button className="btn-matrix" onClick={startGame} style={{ width: '100%', background: 'linear-gradient(135deg, #00f2ff, #0088ff)', color: '#000', border: 'none', padding: '30px', borderRadius: '20px', fontSize: 'clamp(1.4rem, 4vw, 2rem)', boxShadow: '0 0 50px rgba(0,242,255,0.6)' }}>
                {UI.startBtn} <i className="fas fa-power-off ms-3"></i>
              </button>
            </div>
          )}

          {gameState === 'TUTORIAL' && (
            <div className="cyber-glass" style={{ padding: 'clamp(30px, 5vw, 45px)', borderRadius: '24px', maxWidth: '800px', margin: '0 auto', width: '100%', borderLeft: '6px solid #00f2ff', animation: 'slideInUp 0.4s ease-out' }}>
               <h3 style={{ color: '#00f2ff', margin: '0 0 25px 0', fontWeight: '900', fontSize: 'clamp(1.4rem, 4vw, 2rem)', letterSpacing: '2px' }}><i className="fas fa-chalkboard-teacher me-3"></i> {UI.tut1}</h3>
               <p style={{ color: '#f8fafc', lineHeight: '1.8', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)' }}>{UI.tut2}</p>
               
               <div style={{ background: 'rgba(0,0,0,0.7)', padding: '30px', borderRadius: '16px', margin: '30px 0', border: '1px solid rgba(255,255,255,0.15)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)' }}>
                  <p style={{ margin: '0 0 20px 0', color: '#ffea00', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-eye fa-lg"></i> <strong>{UI.tut3}</strong>
                  </p>
                  <p style={{ margin: 0, color: '#00ff88', fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-hand-pointer fa-lg"></i> <strong>{UI.tut4}</strong>
                  </p>
               </div>
               
               <p style={{ color: '#ff0055', fontStyle: 'italic', fontSize: '1.2rem', fontWeight: 'bold' }}>{UI.tut5}</p>
               
               <button className="btn-matrix" onClick={closeTutorial} style={{ width: '100%', background: '#00f2ff', color: '#000', border: 'none', padding: '25px', borderRadius: '16px', marginTop: '20px', fontSize: '1.4rem' }}>
                 ENTENDIDO <i className="fas fa-check-double ms-3"></i>
               </button>
            </div>
          )}

          {gameState === 'AI_ANALYSIS' && (
            <div className="cyber-glass" style={{ padding: 'clamp(35px, 6vw, 60px)', borderRadius: '28px', textAlign: 'center', maxWidth: '900px', margin: '0 auto', width: '100%', maxHeight: '80vh', overflowY: 'auto', borderTop: '4px solid #ffea00' }}>
              <h2 style={{ color: '#ffea00', margin: '0 0 35px 0', letterSpacing: '5px', fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '900', textShadow: '0 0 25px rgba(255,234,0,0.6)' }}>
                <i className="fas fa-satellite-dish me-3"></i>{UI.aiTitle}
              </h2>
              
              {isAnalyzing ? (
                <div style={{ padding: '80px 0', color: '#00f2ff' }}>
                   <i className="fas fa-cog fa-spin fa-5x mb-4" style={{ filter: 'drop-shadow(0 0 25px #00f2ff)' }}></i>
                   <p style={{ letterSpacing: '6px', fontWeight: '900', fontSize: '1.3rem', margin: 0 }}>{UI.loadingAi}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
                     <div style={{ background: 'rgba(0,0,0,0.7)', padding: '25px 35px', borderRadius: '20px', border: '1px solid #334155', flex: 1, minWidth: '200px' }}>
                       <div style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '3px', fontWeight: 'bold' }}>NIVEL SUPERADO</div>
                       <div style={{ color: '#00f2ff', fontSize: '3rem', fontWeight: '900', textShadow: '0 0 20px #00f2ff' }}>{level - 1}</div>
                     </div>
                     <div style={{ background: 'rgba(0,0,0,0.7)', padding: '25px 35px', borderRadius: '20px', border: '1px solid #334155', flex: 1, minWidth: '200px' }}>
                       <div style={{ color: '#94a3b8', fontSize: '1rem', letterSpacing: '3px', fontWeight: 'bold' }}>PUNTAJE FINAL</div>
                       <div style={{ color: '#ffea00', fontSize: '3rem', fontWeight: '900', textShadow: '0 0 20px #ffea00' }}>{score}</div>
                     </div>
                  </div>

                  <div style={{ textAlign: 'left', color: '#f8fafc', fontSize: 'clamp(1.3rem, 3.5vw, 1.6rem)', lineHeight: '1.9', borderLeft: '6px solid #ffea00', paddingLeft: '30px', marginBottom: '50px', background: 'linear-gradient(90deg, rgba(255,234,0,0.15), transparent)', padding: '35px', borderRadius: '0 20px 20px 0' }}>
                     <i className="fas fa-quote-left me-3" style={{color: '#ffea00', opacity: 0.5}}></i>
                     {aiReport}
                  </div>
                  
                  <button className="btn-matrix" onClick={resetToIdle} style={{ width: '100%', background: 'transparent', color: '#ffea00', border: '3px solid #ffea00', padding: '30px', borderRadius: '20px', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>
                    <i className="fas fa-power-off me-3"></i> {UI.back}
                  </button>
                </>
              )}
            </div>
          )}

        </footer>
      </div>
    </div>
  );
}