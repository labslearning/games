import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { create } from 'zustand';

// 🟢 CORRECCIÓN CRÍTICA DE RUTA: 2 niveles hacia atrás para llegar a src/store. (Vite lanza error 500 si usa 3)
import { useGameStore } from '../../store/useGameStore'; 

// 🟢 KERNEL 3D: React Three Fiber & Drei (Mobile Optimized & Battery Safe)
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, Grid } from '@react-three/drei';

// 🟢 POSTPROCESADO: Inmersión Visual Ciberpunk de Alto Rendimiento
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (EVOLUCIÓN COGNITIVA)
============================================================ */
const LEXICON = {
  es: {
    title: "NEURAL SEQUENCE", subtitle: "Memoria Visoespacial Cinética",
    level: "FASE", score: "ÍNDICE", streak: "RACHA",
    start: "INICIAR ENLACE NEURAL",
    memorize: "CODIFICANDO SECUENCIA",
    yourTurn: "REPLICA EL PATRÓN",
    reverseAlert: "¡MODO INVERSO ACTIVADO!",
    blindAlert: "¡MODO CIEGO ACTIVADO!",
    rotatedAlert: "¡ROTACIÓN ESPACIAL ACTIVADA!",
    correct: "SINAPSIS ESTABLE", wrong: "RUPTURA SINÁPTICA",
    next: "SIGUIENTE FASE", retry: "RECALIBRAR Y REINTENTAR",
    sysMsg: "Decodifica el patrón direccional. Tu corteza prefrontal se adaptará a las anomalías."
  },
  en: {
    title: "NEURAL SEQUENCE", subtitle: "Kinetic Visuospatial Memory",
    level: "PHASE", score: "INDEX", streak: "STREAK",
    start: "INITIATE NEURAL LINK",
    memorize: "ENCODING SEQUENCE",
    yourTurn: "REPLICATE THE PATTERN",
    reverseAlert: "REVERSE MODE ENGAGED!",
    blindAlert: "BLIND MODE ENGAGED!",
    rotatedAlert: "SPATIAL ROTATION ENGAGED!",
    correct: "SYNAPSE STABLE", wrong: "SYNAPTIC RUPTURE",
    next: "NEXT PHASE", retry: "RECALIBRATE & RETRY",
    sysMsg: "Decode the directional pattern. Your prefrontal cortex will adapt to anomalies."
  }
};
const getLexicon = (langCode) => LEXICON[langCode] || LEXICON['es'];

/* ============================================================
   🎹 MOTOR BINAURAL Y HÁPTICO (ZERO DEPENDENCIES)
============================================================ */
const CyberHaptics = {
  vibrate(pattern) {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      try { window.navigator.vibrate(pattern); } catch (e) {}
    }
  }
};

const CyberAudio = {
  ctx: null,
  droneBase: null,
  droneHarmonic: null,
  gainNode: null,
  isInitialized: false,

  unlock() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isInitialized = true;
  },

  _playOscillator(type, startFreq, endFreq, duration, vol) {
    if (!this.isInitialized || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + duration);
    } catch(e) {}
  },

  playHover() { this._playOscillator('sine', 800, 600, 0.05, 0.02); },
  playClick() { 
    this._playOscillator('square', 1200, 400, 0.1, 0.05); 
    CyberHaptics.vibrate(15); 
  },
  playTargetHit() {
    this._playOscillator('sine', 880, 1760, 0.15, 0.05); 
    CyberHaptics.vibrate(10);
  },
  playSuccess() {
    this._playOscillator('triangle', 523.25, null, 0.3, 0.05); 
    setTimeout(() => this._playOscillator('triangle', 659.25, null, 0.3, 0.05), 50); 
    setTimeout(() => {
      this._playOscillator('triangle', 1046.50, null, 0.5, 0.08); 
      CyberHaptics.vibrate([20, 50, 40]); 
    }, 150); 
  },
  playError() { 
    this._playOscillator('sawtooth', 150, 80, 0.6, 0.1); 
    CyberHaptics.vibrate([50, 50, 100]); 
  },

  startBinaural(type = 'THETA') {
    if (!this.isInitialized || !this.ctx || this.droneBase) return;
    try {
      this.droneBase = this.ctx.createOscillator();
      this.droneHarmonic = this.ctx.createOscillator();
      this.droneBase.type = 'sine';
      this.droneHarmonic.type = 'sine';

      const baseFreq = 200;
      const beatFreq = type === 'THETA' ? 6 : 15; 

      this.droneBase.frequency.setValueAtTime(baseFreq, this.ctx.currentTime); 
      this.droneHarmonic.frequency.setValueAtTime(baseFreq + beatFreq, this.ctx.currentTime);

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + 1);

      this.droneBase.connect(this.gainNode);
      this.droneHarmonic.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
      
      this.droneBase.start();
      this.droneHarmonic.start();
    } catch(e) {}
  },

  stopBinaural() {
    if (this.droneBase && this.ctx && this.gainNode) {
      try {
        this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        this.droneBase.stop(this.ctx.currentTime + 0.5);
        this.droneHarmonic.stop(this.ctx.currentTime + 0.5);
      } catch(e) {}
      this.droneBase = null;
      this.droneHarmonic = null;
    }
  }
};

/* ============================================================
   🎯 VECTORES DIRECCIONALES Y D-PAD GEOMETRY
============================================================ */
const DIRS = {
  UP: { id: 'UP', icon: 'M12 4l-8 8h6v8h4v-8h6z', color: '#00f2ff' },
  DOWN: { id: 'DOWN', icon: 'M12 20l8-8h-6V4h-4v8H4z', color: '#ff0055' },
  LEFT: { id: 'LEFT', icon: 'M4 12l8 8v-6h8v-4h-8V4z', color: '#ffea00' },
  RIGHT: { id: 'RIGHT', icon: 'M20 12l-8-8v6H4v4h8v6z', color: '#00ff88' },
  NW: { id: 'NW', icon: 'M4 4v10.5l4-4 6 6 3-3-6-6 4-4z', color: '#8b5cf6' },
  NE: { id: 'NE', icon: 'M20 4H9.5l4 4-6 6 3 3 6-6 4 4z', color: '#ff00ff' },
  SW: { id: 'SW', icon: 'M4 20h10.5l-4-4 6-6-3-3-6 6-4-4z', color: '#ff8800' },
  SE: { id: 'SE', icon: 'M20 20v-10.5l-4 4-6-6-3 3 6 6-4 4z', color: '#00ccff' }
};

const BASIC_DIRS = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
const ALL_DIRS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'NW', 'NE', 'SW', 'SE'];

/* ============================================================
   🧠 ZUSTAND STORE: MOTOR COGNITIVO
============================================================ */
const useSequenceStore = create((set, get) => ({
  level: 1,
  score: 0,
  streak: 0,
  combo: 1.0,
  gameState: 'BOOT', 
  sequence: [],
  userSequence: [],
  activeNode: null, 
  feedbackState: null, 
  modifier: 'NORMAL', 
  activeModifiers: [], 
  rotationAngle: 0, 
  hasFailedCurrent: false,

  setGameState: (state) => set({ gameState: state }),
  setActiveNode: (nodeId) => set({ activeNode: nodeId }),
  
  generateNextSequence: () => {
    const { level, hasFailedCurrent } = get();
    // Progresión logarítmica de la longitud para aprendizaje fluido
    const seqLength = Math.floor(3 + (level * 0.6)); 
    const availableDirs = level >= 5 ? ALL_DIRS : BASIC_DIRS;
    
    let newSequence = [];
    let lastDir = null;

    // Generar patrón estocástico evitando monotonía extrema
    for(let i = 0; i < seqLength; i++) {
      let nextDir;
      do {
        nextDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
      } while (nextDir === lastDir && Math.random() > 0.15); 
      newSequence.push(nextDir);
      lastDir = nextDir;
    }

    // 🧠 MUTACIONES COGNITIVAS (Sobrecarga Escalonada)
    let newModifiers = [];
    let newRotation = 0;

    // Solo aplicamos modificadores si el usuario no falló el nivel anterior (Andamiaje Positivo)
    if (!hasFailedCurrent) {
      if (level >= 4 && Math.random() > 0.5) newModifiers.push('REVERSE');
      if (level >= 8 && Math.random() > 0.6) newModifiers.push('BLIND');
      if (level >= 12 && Math.random() > 0.7) {
        newModifiers.push('ROTATED');
        newRotation = [90, 180, 270][Math.floor(Math.random() * 3)];
      }
      // Forzar al menos un modificador en niveles muy altos
      if (level > 20 && newModifiers.length === 0) {
         newModifiers.push('ROTATED');
         newRotation = 180;
      }
    }

    const primaryModifier = newModifiers.length > 0 ? newModifiers[newModifiers.length -1] : 'NORMAL';

    set({ 
      sequence: newSequence, 
      userSequence: [], 
      gameState: 'SHOWING', 
      modifier: primaryModifier,
      activeModifiers: newModifiers,
      rotationAngle: newRotation,
      hasFailedCurrent: false,
      feedbackState: null
    });
  },

  handleInput: (nodeId) => {
    const state = get();
    if (state.gameState !== 'PLAYING') return;

    CyberAudio.playTargetHit(); 

    const newUserSeq = [...state.userSequence, nodeId];
    const currentIndex = newUserSeq.length - 1;
    
    // Lógica de Validación $O(1)$ aplicando modificador REVERSE
    let expectedNode = state.sequence[currentIndex];
    if (state.activeModifiers.includes('REVERSE')) {
      expectedNode = state.sequence[state.sequence.length - 1 - currentIndex];
    }
    
    set({ userSequence: newUserSeq, activeNode: nodeId });
    
    // Feedback visual táctil efímero
    setTimeout(() => {
        if(get().gameState === 'PLAYING') set({ activeNode: null });
    }, 120); 

    // Validación Instantánea $O(1)$
    if (nodeId !== expectedNode) {
      get().resolveRound(false);
      return;
    }

    // Comprobación de Victoria
    if (newUserSeq.length === state.sequence.length) {
      setTimeout(() => get().resolveRound(true), 250);
    }
  },

  resolveRound: (isCorrect) => set((state) => {
    let newScore = state.score;
    let newLevel = state.level;
    let newStreak = state.streak;
    let newCombo = state.combo;
    let failedCurrent = state.hasFailedCurrent;

    CyberAudio.stopBinaural();

    if (isCorrect) {
      const modifierBonus = 1.0 + (state.activeModifiers.length * 0.8);
      if (!failedCurrent) {
        newScore += Math.floor(100 * state.level * state.combo * modifierBonus);
        newStreak += 1;
        newCombo = Math.min(6.0, newCombo + 0.2); // Cap de Combo subido a 6x para God Tier
      } else {
        newScore += Math.floor(30 * state.level); // Puntos de consolación (Andamiaje positivo)
      }
      newLevel++;
      CyberAudio.playSuccess();
    } else {
      newStreak = 0;
      newCombo = 1.0;
      failedCurrent = true;
      CyberAudio.playError();
    }

    return {
      score: newScore,
      level: newLevel,
      streak: newStreak,
      combo: newCombo,
      hasFailedCurrent: failedCurrent,
      feedbackState: isCorrect ? 'CORRECT' : 'WRONG',
      gameState: 'FEEDBACK',
      activeNode: null
    };
  }),

  retrySequence: () => set({ gameState: 'SHOWING', userSequence: [], feedbackState: null, activeNode: null }),
  startGame: () => { 
    CyberAudio.unlock(); // Desbloqueo forzado del AudioContext en el primer click real del usuario
    set({ level: 1, score: 0, streak: 0, combo: 1.0, hasFailedCurrent: false }); 
    get().generateNextSequence(); 
  }
}));

/* ============================================================
   🧊 KERNEL 3D: FONDO ESTÁTICO DE CONCENTRACIÓN
============================================================ */
const StaticNeuralCore = ({ gameState }) => {
  const isError = gameState === 'FEEDBACK' && useSequenceStore.getState().feedbackState === 'WRONG';
  const coreColor = isError ? '#ff0055' : '#005577';

  // Geometría y materiales ultra optimizados, cero dependencias dinámicas
  return (
    <group>
      <Grid 
        position={[0, -5, -20]} 
        args={[50, 50]} 
        cellSize={2} 
        cellThickness={1} 
        cellColor="#00f2ff" 
        sectionSize={10} 
        sectionThickness={1.5} 
        sectionColor="#8b5cf6" 
        fadeDistance={40} 
        fadeStrength={2} 
      />
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <mesh position={[0, 2, -15]}>
          <octahedronGeometry args={[5, 0]} />
          <meshBasicMaterial color={coreColor} wireframe transparent opacity={0.15} />
        </mesh>
      </Float>
      <Sparkles count={100} scale={30} size={3} speed={0.2} opacity={0.2} color={coreColor} />
    </group>
  );
};

const BackgroundEngine = ({ gameState }) => {
  const isError = gameState === 'FEEDBACK' && useSequenceStore.getState().feedbackState === 'WRONG';
  
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      {/* 🟢 Mobile Optimization: frameloop 'demand' extremo para cero lag y cero consumo de batería */}
      <Canvas 
        dpr={[1, 1.5]} 
        gl={{ powerPreference: "high-performance", antialias: false, depth: false, stencil: false, alpha: false }} 
        camera={{ position: [0, 0, 5] }} 
        frameloop="demand"
      >
        <color attach="background" args={['#010205']} />
        <ambientLight intensity={0.5} />
        
        <Suspense fallback={null}>
           <StaticNeuralCore gameState={gameState} />
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={isError ? 2.5 : 1.0} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
          {/* Alertas visuales estroboscópicas solo al fallar */}
          {isError && <ChromaticAberration offset={[0.08, 0.08]} />}
          {isError && <Glitch delay={[0, 0]} duration={[0.2, 0.4]} strength={[0.8, 1.2]} active />}
        </EffectComposer>
      </Canvas>
    </div>
  );
};

/* ============================================================
   🎯 COMPONENTE D-PAD: MOBILE FIRST PERFECTO
============================================================ */
const DirectionalPad = ({ availableDirs, onInput, activeNode, disabled, blindMode, rotationAngle }) => {
  const gridCells = [
    { id: 'NW' }, { id: 'UP' }, { id: 'NE' },
    { id: 'LEFT' }, { id: 'CENTER' }, { id: 'RIGHT' },
    { id: 'SW' }, { id: 'DOWN' }, { id: 'SE' }
  ];

  return (
    <div style={{ 
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      gap: 'clamp(8px, 2vw, 15px)', width: '100%', maxWidth: '420px', aspectRatio: '1', margin: '0 auto',
      padding: '10px',
      // 🧠 Rotación Mental Forzada: Gira físicamente todo el grid en CSS
      transform: `rotate(${rotationAngle}deg)`,
      transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      {gridCells.map((cell) => {
        if (cell.id === 'CENTER') {
          return (
            <div key="center" style={{ 
               background: 'radial-gradient(circle, rgba(0,242,255,0.15) 0%, transparent 70%)', 
               borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
               // Contrarrotar para que el icono central mantenga el norte visual
               transform: `rotate(-${rotationAngle}deg)`
            }}>
              {rotationAngle > 0 && <i className="fas fa-sync-alt pulse-alert" style={{ color: '#ffea00', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', opacity: 0.6 }}></i>}
            </div>
          );
        }
        
        const dirData = DIRS[cell.id];
        const isAvailable = availableDirs.includes(cell.id);
        const isActive = activeNode === cell.id;
        
        if (!isAvailable) return <div key={cell.id} />; 

        return (
          <button
            key={cell.id}
            onPointerDown={(e) => { 
              e.preventDefault(); 
              if(!disabled) {
                // Leyes de Fitts: Transformación visual instantánea antes del renderizado del estado
                e.currentTarget.style.transform = 'scale(0.85)';
                onInput(cell.id);
              }
            }}
            onPointerUp={(e) => { if(!disabled) e.currentTarget.style.transform = 'scale(1)'; }}
            onPointerLeave={(e) => { if(!disabled) e.currentTarget.style.transform = 'scale(1)'; }}
            disabled={disabled}
            style={{
              background: isActive ? dirData.color : 'rgba(15, 23, 42, 0.85)',
              border: `2px solid ${isActive ? '#fff' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '24px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: isActive ? `0 0 35px ${dirData.color}, inset 0 0 15px rgba(255,255,255,0.5)` : 'inset 0 0 25px rgba(0,0,0,0.9), 0 6px 15px rgba(0,0,0,0.6)',
              transform: isActive ? 'scale(0.9)' : 'scale(1)',
              transition: 'transform 0.1s, background 0.15s, box-shadow 0.15s',
              cursor: disabled ? 'default' : 'pointer',
              outline: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
              userSelect: 'none'
            }}
          >
            {/* Modo Ciego: Oculta el SVG a menos que la IA lo encienda (isActive) */}
            {(!blindMode || isActive) && (
              <svg viewBox="0 0 24 24" width="clamp(35px, 8vw, 55px)" height="clamp(35px, 8vw, 55px)" fill={isActive ? '#000' : dirData.color} style={{ 
                filter: isActive ? 'none' : `drop-shadow(0 0 12px ${dirData.color})`,
                // Contrarrotar el icono para que SIEMPRE apunte a su dirección visual local
                transform: `rotate(-${rotationAngle}deg)`,
                transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}>
                <path d={dirData.icon} />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ============================================================
   🎮 MAIN INTERFACE: NEURAL SEQUENCE (APEX MOBILE FIRST)
============================================================ */
export default function NeuralSequence() {
  const gameStore = useGameStore();
  const language = gameStore?.language || 'es';
  const UI = getLexicon(language);

  const { 
    level, score, streak, combo, gameState, sequence, userSequence, activeNode, activeModifiers, rotationAngle, hasFailedCurrent,
    feedbackState, setGameState, setActiveNode, handleInput, generateNextSequence, retrySequence, startGame 
  } = useSequenceStore();

  const [progress, setProgress] = useState(0);

  // 🤖 REPRODUCTOR DE LA SECUENCIA TÁCTICA (CON ANDAMIAJE ZDP)
  useEffect(() => {
    let timeouts = [];
    if (gameState === 'SHOWING') {
      setProgress(0);
      CyberAudio.startBinaural('THETA'); 
      
      let delay = 800; // Respiro inicial mayor
      
      // 🧠 Scaffolding Pedagógico: Si el jugador falló, ralentizamos el patrón para que lo asimile (+25% tiempo)
      let speedMultiplier = hasFailedCurrent ? 1.25 : Math.max(0.35, 1 - (level * 0.05));
      const flashDuration = 450 * speedMultiplier; 
      const gapDuration = 200 * speedMultiplier;

      sequence.forEach((nodeId, index) => {
        timeouts.push(setTimeout(() => {
          setActiveNode(nodeId);
          CyberAudio.playHover(); 
          setProgress(((index + 1) / sequence.length) * 100);
        }, delay));
        
        delay += flashDuration;
        
        timeouts.push(setTimeout(() => {
          setActiveNode(null);
        }, delay));

        delay += gapDuration;
      });

      // Transición de Ondas Cerebrales: De Memorización (Theta) a Acción (Beta)
      timeouts.push(setTimeout(() => {
        CyberAudio.stopBinaural();
        CyberAudio.startBinaural('BETA'); 
        setGameState('PLAYING');
      }, delay + 250));
    }

    return () => {
      timeouts.forEach(clearTimeout);
      if (gameState !== 'PLAYING' && gameState !== 'SHOWING') {
         CyberAudio.stopBinaural();
      }
    };
  }, [gameState, sequence, level, hasFailedCurrent, setActiveNode, setGameState]);

  const activeDirs = level >= 5 ? ALL_DIRS : BASIC_DIRS;
  
  // UI Booleans
  const isReverse = activeModifiers.includes('REVERSE');
  const isBlind = activeModifiers.includes('BLIND');
  const isRotated = activeModifiers.includes('ROTATED');

  // Prevenir zoom y scrolling en móviles (Rubber-banding en iOS)
  useEffect(() => {
    const preventBehavior = (e) => { e.preventDefault(); };
    document.addEventListener('touchmove', preventBehavior, { passive: false });
    return () => { document.removeEventListener('touchmove', preventBehavior); };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010205', color: '#fff', fontFamily: "'Orbitron', sans-serif", display: 'flex', flexDirection: 'column', touchAction: 'none', WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none' }}>
      
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); }
        .cyber-btn { background: rgba(0,242,255,0.1); color: #00f2ff; border: 2px solid #00f2ff; padding: 25px; border-radius: 16px; cursor: pointer; transition: all 0.15s; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: clamp(1.1rem, 3.5vw, 1.5rem); box-shadow: 0 6px 0 rgba(0,0,0,0.6); touch-action: manipulation; -webkit-tap-highlight-color: transparent;}
        .cyber-btn:active { transform: translateY(6px); box-shadow: 0 0 0 rgba(0,0,0,0); filter: brightness(1.3); background: #00f2ff; color: #000; }
        
        .pulse-alert { animation: alertPulse 1s infinite alternate; }
        @keyframes alertPulse { from { opacity: 0.5; transform: scale(0.98); } to { opacity: 1; transform: scale(1.02); } }
        
        .fade-in { animation: fi 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes fi { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .progress-bar-container { width: 100%; height: 6px; background: rgba(255,255,255,0.05); position: absolute; top: 0; left: 0; z-index: 100; }
        .progress-bar { height: 100%; transition: width 0.1s linear; background: #00f2ff; box-shadow: 0 0 15px #00f2ff; }
      `}</style>

      {/* 🚀 KERNEL 3D BACKGROUND (SILENCIOSO) */}
      <BackgroundEngine gameState={gameState} />

      {/* 🚀 PROGRESS BAR DE MEMORIZACIÓN */}
      {gameState === 'SHOWING' && (
         <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
         </div>
      )}

      {/* 🚀 HEADER TÁCTICO (DATA HUD) */}
      <div className="glass-panel" style={{ padding: 'clamp(12px, 2vh, 20px) clamp(15px, 4vw, 30px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,242,255,0.15)', zIndex: 10, paddingTop: 'calc(12px + env(safe-area-inset-top))', background: 'linear-gradient(to bottom, rgba(2,6,23,0.95), transparent)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 15px rgba(0,242,255,0.5)' }}>
            <i className="fas fa-sitemap me-2"></i>{UI.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 2.5vw, 0.9rem)', marginTop: '6px', display: 'flex', gap: '10px', fontWeight: 'bold' }}>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)'}}>{UI.level}: <span style={{color:'#fff'}}>{level}</span></span>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)'}}>{UI.streak}: <span style={{color:'#ffea00'}}>{streak}</span></span>
            {combo > 1.0 && <span style={{color:'#00ff88', textShadow:'0 0 10px #00ff88', alignSelf: 'center'}}>x{combo.toFixed(1)}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.7)', padding: '8px 15px', borderRadius: '12px', border: '1px solid rgba(0,242,255,0.2)' }}>
          <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(255,255,255,0.5)', lineHeight: '1' }}>{score}</div>
          <div style={{ color: '#00f2ff', fontSize: '0.7rem', letterSpacing: '1px', marginTop: '3px' }}>{UI.score}</div>
        </div>
      </div>

      {/* 🚀 HUD CENTRAL (ESTADO COGNITIVO) */}
      <div style={{ padding: 'clamp(10px, 2vh, 20px)', textAlign: 'center', zIndex: 10, minHeight: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        
        {gameState === 'SHOWING' && (
          <div className="fade-in">
            <h2 style={{ color: '#00f2ff', letterSpacing: '3px', fontWeight: '900', fontSize: 'clamp(1.3rem, 4vw, 2rem)', textShadow: '0 0 20px #00f2ff', margin: 0 }}>
              <i className="fas fa-eye me-2"></i> {UI.memorize}
            </h2>
          </div>
        )}
        
        {gameState === 'PLAYING' && (
          <div className="fade-in">
            <h2 style={{ color: '#ffea00', letterSpacing: '3px', fontWeight: '900', fontSize: 'clamp(1.3rem, 4vw, 2rem)', textShadow: '0 0 20px #ffea00', margin: 0 }}>
              <i className="fas fa-keyboard me-2"></i> {UI.yourTurn}
            </h2>
            
            {/* Visualizador Paginado del Input del Usuario */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
              {sequence.map((_, i) => (
                <div key={i} style={{ 
                  width: 'clamp(15px, 4vw, 30px)', height: '8px', borderRadius: '4px',
                  background: i < userSequence.length ? '#ffea00' : 'rgba(255,255,255,0.1)',
                  boxShadow: i < userSequence.length ? '0 0 15px #ffea00' : 'none',
                  transition: 'background 0.2s, box-shadow 0.2s'
                }} />
              ))}
            </div>
          </div>
        )}

        {/* 🚀 MÚLTIPLES ALERTAS DE SOBRECARGA COGNITIVA */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '15px' }}>
          {isReverse && (gameState === 'SHOWING' || gameState === 'PLAYING') && (
            <div className="pulse-alert" style={{ color: '#ff0055', fontWeight: '900', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', background: 'rgba(255,0,85,0.2)', padding: '6px 15px', borderRadius: '8px', border: '1px solid #ff0055' }}>
               <i className="fas fa-backward me-2"></i> {UI.reverseAlert}
            </div>
          )}
          {isBlind && (gameState === 'SHOWING' || gameState === 'PLAYING') && (
            <div className="pulse-alert" style={{ color: '#8b5cf6', fontWeight: '900', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', background: 'rgba(139,92,246,0.2)', padding: '6px 15px', borderRadius: '8px', border: '1px solid #8b5cf6' }}>
               <i className="fas fa-eye-slash me-2"></i> {UI.blindAlert}
            </div>
          )}
          {isRotated && (gameState === 'SHOWING' || gameState === 'PLAYING') && (
            <div className="pulse-alert" style={{ color: '#ffea00', fontWeight: '900', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)', background: 'rgba(255,234,0,0.2)', padding: '6px 15px', borderRadius: '8px', border: '1px solid #ffea00' }}>
               <i className="fas fa-sync me-2"></i> {UI.rotatedAlert}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 ZONA TÁCTIL PRINCIPAL (D-PAD Y PANELES) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '10px', zIndex: 10 }}>
        
        {gameState === 'BOOT' && (
          <div className="glass-panel fade-in" style={{ padding: 'clamp(30px, 6vw, 50px)', borderRadius: '28px', textAlign: 'center', maxWidth: '550px', width: '100%', borderTop: '5px solid #00f2ff', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
            <i className="fas fa-project-diagram fa-5x mb-4" style={{ color: '#00f2ff', filter: 'drop-shadow(0 0 30px #00f2ff)' }}></i>
            <h2 style={{ color: '#fff', margin: '0 0 20px 0', letterSpacing: '4px', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: '900', textShadow: '0 0 20px rgba(255,255,255,0.4)' }}>
              {UI.title}
            </h2>
            <p style={{color: '#cbd5e1', marginBottom: '40px', fontSize: 'clamp(1rem, 3.5vw, 1.2rem)', lineHeight: '1.7'}}>{UI.sysMsg}</p>
            
            <button className="cyber-btn" onClick={() => { CyberAudio.playClick(); startGame(); }} style={{ width: '100%', padding: '25px', borderRadius: '20px' }}>
              {UI.start} <i className="fas fa-bolt ms-3"></i>
            </button>
          </div>
        )}

        {(gameState === 'SHOWING' || gameState === 'PLAYING') && (
          <div className="fade-in" style={{ width: '100%', maxWidth: '600px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
             <DirectionalPad 
                availableDirs={activeDirs} 
                activeNode={activeNode} 
                onInput={handleInput} 
                disabled={gameState === 'SHOWING'}
                blindMode={isBlind && gameState === 'PLAYING'} 
                rotationAngle={gameState === 'PLAYING' ? rotationAngle : 0} 
             />
          </div>
        )}

        {/* 🚀 FEEDBACK / REINTENTO (SCAFFOLDING PEDAGÓGICO) */}
        {gameState === 'FEEDBACK' && (
          <div className="glass-panel fade-in" style={{ padding: 'clamp(30px, 6vw, 45px)', borderRadius: '28px', borderTop: `5px solid ${feedbackState === 'CORRECT' ? '#00ff88' : '#ff0055'}`, width: '100%', maxWidth: '550px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
             <i className={`fas ${feedbackState === 'CORRECT' ? 'fa-check-circle' : 'fa-times-circle'} fa-5x mb-4`} style={{ color: feedbackState === 'CORRECT' ? '#00ff88' : '#ff0055', filter: 'drop-shadow(0 0 25px currentColor)' }}></i>
             
             <h2 style={{ color: feedbackState === 'CORRECT' ? '#00ff88' : '#ff0055', margin: '0 0 35px 0', fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 20px currentColor' }}>
                {feedbackState === 'CORRECT' ? UI.correct : UI.wrong}
             </h2>
             
             <button 
               className="cyber-btn" 
               onClick={() => { CyberAudio.playClick(); feedbackState === 'CORRECT' ? generateNextSequence() : retrySequence(); }} 
               style={{ width: '100%', borderColor: feedbackState === 'CORRECT' ? '#00ff88' : '#ffea00', color: feedbackState === 'CORRECT' ? '#00ff88' : '#ffea00', padding: '25px', borderRadius: '20px' }}
             >
                {feedbackState === 'CORRECT' ? UI.next : UI.retry} <i className={`fas ${feedbackState === 'CORRECT' ? 'fa-forward' : 'fa-redo'} ms-3`}></i>
             </button>
          </div>
        )}
      </div>

    </div>
  );
}