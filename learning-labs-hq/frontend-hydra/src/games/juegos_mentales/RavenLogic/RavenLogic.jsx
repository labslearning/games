import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { create } from 'zustand';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useGameStore } from '../../../store/useGameStore'; 

// 🟢 KERNEL 3D: React Three Fiber & Drei
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float, Sparkles } from '@react-three/drei';

// 🟢 POSTPROCESADO: Efectos Visuales AAA
import { EffectComposer, Bloom, Glitch, ChromaticAberration, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ============================================================
   🌌 KERNEL CONFIG: RED TEAMING AI (DEEPSEEK)
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360"; 
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (GLOBAL SCALABILITY)
============================================================ */
const LEXICON = {
  es: {
    title: "RAVEN OS", subtitle: "Auditoría de Lógica Fluida",
    level: "NIVEL", streak: "RACHA", score: "PUNTOS",
    synthesizing: "SINTETIZANDO MATRIZ", analyzing: "Generando topología cognitiva...",
    correct: "SINAPSIS ESTABLE", wrong: "FALLO LÓGICO", timeout: "TIEMPO AGOTADO",
    analysis: "Análisis Estructural:", next: "SIGUIENTE MATRIZ", retry: "REINTENTAR MATRIZ",
    vuln: "VULNERABILIDADES", spatial: "Espacial", math: "Matemática", logic: "Lógica Pura",
    timeWarning: "DEGRADACIÓN DE SEÑAL", focusLost: "FUGA DE CONCENTRACIÓN DETECTADA",
    sysMsg: "Decodifica el patrón estructural. Encuentra la lógica oculta antes del colapso temporal."
  },
  en: {
    title: "RAVEN OS", subtitle: "Fluid Logic Audit",
    level: "LEVEL", streak: "STREAK", score: "SCORE",
    synthesizing: "SYNTHESIZING MATRIX", analyzing: "Generating cognitive topology...",
    correct: "SYNAPSE STABLE", wrong: "LOGIC FAILURE", timeout: "TIME DEPLETED",
    analysis: "Structural Analysis:", next: "NEXT MATRIX", retry: "RETRY MATRIX",
    vuln: "VULNERABILITIES", spatial: "Spatial", math: "Mathematical", logic: "Pure Logic",
    timeWarning: "SIGNAL DEGRADATION", focusLost: "FOCUS LEAK DETECTED",
    sysMsg: "Decode the structural pattern. Find the hidden logic before time collapses."
  }
};
const getLexicon = (langCode) => LEXICON[langCode] || LEXICON['es'];

/* ============================================================
   🎹 MOTOR DE AUDIO ZEN (BINAURAL HARMONY - ZERO LATENCY)
   Frecuencias armónicas para inducir concentración (Ondas Theta).
============================================================ */
const CyberAudio = {
  ctx: null,
  droneOsc1: null,
  droneOsc2: null,
  droneGain: null,
  filter: null,
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  _playOscillator(type, startFreq, endFreq, duration, vol) {
    try {
      this.init();
      if (!this.ctx) return;
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
  playHover() { this._playOscillator('sine', 600, 400, 0.1, 0.02); }, // Sonido suave
  playClick() { this._playOscillator('sine', 1200, 800, 0.1, 0.05); }, // Click armonioso
  playSuccess() {
    // Acorde Mayor Cristalino
    this._playOscillator('sine', 523.25, null, 0.4, 0.1); // C5
    setTimeout(() => this._playOscillator('sine', 659.25, null, 0.4, 0.1), 50); // E5
    setTimeout(() => this._playOscillator('sine', 783.99, null, 0.6, 0.1), 100); // G5
  },
  playError() { 
    // Tono grave disonante pero suave
    this._playOscillator('triangle', 150, 140, 0.6, 0.1); 
  },
  
  startZenDrone() {
    try {
      this.init();
      if (!this.ctx || this.droneOsc1) return;
      
      // Oscilador 1: Base (216 Hz - Mitad de 432Hz)
      this.droneOsc1 = this.ctx.createOscillator();
      this.droneOsc1.type = 'sine';
      this.droneOsc1.frequency.setValueAtTime(216, this.ctx.currentTime); 
      
      // Oscilador 2: Armónico (324 Hz - Quinta perfecta)
      this.droneOsc2 = this.ctx.createOscillator();
      this.droneOsc2.type = 'sine';
      this.droneOsc2.frequency.setValueAtTime(324, this.ctx.currentTime);

      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.droneGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3); // Fade in suave de 3s
      
      // Filtro LowPass para quitar frecuencias altas y hacer el sonido más cálido ("Underwater effect")
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 800;

      this.droneOsc1.connect(this.droneGain);
      this.droneOsc2.connect(this.droneGain);
      this.droneGain.connect(this.filter);
      this.filter.connect(this.ctx.destination);
      
      this.droneOsc1.start();
      this.droneOsc2.start();
    } catch(e) {}
  },
  
  stopZenDrone() {
    if (this.droneOsc1 && this.ctx) {
      this.droneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
      this.droneOsc1.stop(this.ctx.currentTime + 1.5);
      this.droneOsc2.stop(this.ctx.currentTime + 1.5);
      this.droneOsc1 = null;
      this.droneOsc2 = null;
    }
  }
};

/* ============================================================
   🧠 ZUSTAND STORE: LÓGICA DE CORRECCIÓN DE ERRORES (GOD TIER)
============================================================ */
const RANKS = ["CADETE", "OPERATIVO", "ESPECIALISTA", "ANALISTA", "COMANDANTE", "UNIT 8200 ELITE"];

const useRavenStore = create((set, get) => ({
  level: 1,
  score: 0,
  streak: 0,
  combo: 1.0, 
  currentRank: 0,
  gameState: 'BOOT', // BOOT, SYNTHESIZING, PLAYING, FEEDBACK, TIMEOUT
  weaknessProfile: { spatial: 10, mathematical: 10, logic: 10 },
  currentPuzzle: null,
  feedbackData: null, 
  hasFailedCurrentPuzzle: false, // Variable táctica: rastrea si el jugador ya falló en esta ronda

  updateWeakness: (type, isCorrect) => set((state) => {
    const profile = { ...state.weaknessProfile };
    const safeType = type || 'logic';
    if (!isCorrect) profile[safeType] = Math.min(100, profile[safeType] + 25);
    else profile[safeType] = Math.max(0, profile[safeType] - 12);
    return { weaknessProfile: profile };
  }),

  setGameState: (state) => set({ gameState: state }),
  setPuzzle: (puzzle) => set({ currentPuzzle: puzzle, gameState: 'PLAYING', hasFailedCurrentPuzzle: false }),
  
  registerAnswer: (isCorrect, explanation, type, isTimeout = false, timeRemaining = 0) => set((state) => {
    if (isTimeout) {
      const profile = { ...state.weaknessProfile };
      profile.spatial = Math.min(100, profile.spatial + 15); 
      profile.mathematical = Math.min(100, profile.mathematical + 15); 
      profile.logic = Math.min(100, profile.logic + 15);
      set({ weaknessProfile: profile });
    } else {
      get().updateWeakness(type, isCorrect);
    }
    
    let newScore = state.score;
    let newLevel = state.level;
    let newStreak = state.streak;
    let newCombo = state.combo;
    let newRank = state.currentRank;
    let failedCurrent = state.hasFailedCurrentPuzzle;

    if (isCorrect && !isTimeout) {
      // Si acierta a la primera, se lleva el bono. Si es un reintento, se lleva puntos base reducidos.
      if (!failedCurrent) {
        const timeBonus = Math.floor(timeRemaining * 10);
        newScore += Math.floor((100 * state.level) * state.combo) + timeBonus;
        newStreak += 1;
        newCombo = Math.min(5.0, newCombo + 0.5); 
      } else {
        newScore += Math.floor(25 * state.level); // Puntuación de consolación por corregir
      }
      
      if (newStreak % 3 === 0 && newStreak !== 0) {
        newLevel++;
        newRank = Math.min(RANKS.length - 1, Math.floor(newLevel / 3));
      }
    } else {
      // Fallo: Rompe la racha, rompe el combo, marca como fallado.
      newStreak = 0;
      newCombo = 1.0; 
      failedCurrent = true;
      // No bajamos el nivel inmediatamente para permitirle reintentar sin sentirse castigado en la UI
    }

    return { 
      score: newScore, 
      level: newLevel, 
      streak: newStreak, 
      combo: newCombo,
      currentRank: newRank,
      hasFailedCurrentPuzzle: failedCurrent,
      feedbackData: { isCorrect, explanation, isTimeout },
      gameState: isTimeout ? 'TIMEOUT' : 'FEEDBACK'
    };
  }),

  // Nuevo Método God Tier: Vuelve a intentar la misma matriz sin recargar la IA
  retryPuzzle: () => set((state) => ({
    gameState: 'PLAYING'
  })),

  penalizeFocusLoss: () => set((state) => {
    if (state.gameState !== 'PLAYING') return state;
    return {
      score: Math.max(0, state.score - 500),
      combo: 1.0,
      streak: 0
    };
  }),

  resetToIdle: () => {
    CyberAudio.stopZenDrone();
    set({ gameState: 'BOOT', level: 1, score: 0, streak: 0, combo: 1.0, currentRank: 0, hasFailedCurrentPuzzle: false });
  }
}));

/* ============================================================
   🧬 GENERADOR PROCEDIMENTAL INFINITO (OFFLINE GOD TIER)
   Algoritmo C++ style portado a JS para crear matrices perfectas.
============================================================ */
const SHAPES = ["■", "▲", "●", "◆", "✖", "★"];
const COLORS = ["#00f2ff", "#ff0055", "#ffea00", "#8b5cf6", "#00ff88", "#ffffff"];

const generateProceduralMatrix = (level, weaknessType) => {
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  
  const selectedShapes = shuffle(SHAPES).slice(0, 3);
  const selectedColors = shuffle(COLORS).slice(0, 3);
  
  let matrix = [];
  let explanation = "";
  let targetRule = weaknessType || "logic";

  if (targetRule === "mathematical") {
    // Progresión Aritmética Dinámica
    const step = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < 3; i++) {
      const s = selectedShapes[i];
      const c = selectedColors[i];
      const startN = Math.floor(Math.random() * 2) + 1;
      matrix.push([ 
        {s, c, n: startN}, 
        {s, c, n: startN + step}, 
        {s, c, n: startN + (step * 2)} 
      ]);
    }
    explanation = `Algoritmo Matemático: Progresión aritmética (+${step}) en el eje X. Forma y color se anclan en el eje Y.`;
  } 
  else if (targetRule === "spatial") {
    // Rotación de Matriz (Shift Array)
    const baseRow = [
      {s: selectedShapes[0], c: selectedColors[0], n: 1},
      {s: selectedShapes[1], c: selectedColors[1], n: 2},
      {s: selectedShapes[2], c: selectedColors[2], n: 3}
    ];
    matrix.push([...baseRow]);
    matrix.push([baseRow[2], baseRow[0], baseRow[1]]); // Shift Right 1
    matrix.push([baseRow[1], baseRow[2], baseRow[0]]); // Shift Right 2
    explanation = "Topología Espacial: Desplazamiento lateral cíclico (Shift Right) preservando propiedades intrínsecas de cada nodo.";
  } 
  else {
    // Lógica XOR Visual (A + B = C cancelando duplicados, simplificado para UI)
    for (let i = 0; i < 3; i++) {
      matrix.push([
        {s: selectedShapes[0], c: selectedColors[i], n: i+1},
        {s: selectedShapes[1], c: selectedColors[(i+1)%3], n: i+1},
        {s: selectedShapes[2], c: selectedColors[(i+2)%3], n: i+1}
      ]);
    }
    explanation = "Matriz Lógica: Distribución mutuamente excluyente de formas y colores sin repetición en filas ni columnas (Sudoku Lógico).";
  }

  // Extraer respuesta
  const correctAnswer = matrix[2][2];
  matrix[2][2] = null; 

  // Generar Distractores (Inteligentes, cerca de la respuesta real)
  let options = [correctAnswer];
  while(options.length < 4) {
    const fakeOption = {
      s: pickRandom(selectedShapes),
      c: pickRandom(selectedColors),
      n: Math.floor(Math.random() * 6) + 1
    };
    if (!options.find(o => o.s === fakeOption.s && o.c === fakeOption.c && o.n === fakeOption.n)) {
      options.push(fakeOption);
    }
  }

  options = shuffle(options);
  const correctIndex = options.findIndex(o => o.s === correctAnswer.s && o.c === correctAnswer.c && o.n === correctAnswer.n);

  return { ruleType: targetRule, matrix, options, correctIndex, explanation };
};

/* ============================================================
   🤖 ORQUESTADOR DE RED NEURAL (API + PROCEDURAL FALLBACK)
============================================================ */
const fetchNextMatrix = async (level, weaknessProfile) => {
  const primaryWeakness = Object.keys(weaknessProfile).reduce((a, b) => weaknessProfile[a] > weaknessProfile[b] ? a : b);

  const sysPrompt = `
    Eres la IA de evaluación Unit 8200. Genera un test de Matrices de Raven (3x3).
    Dificultad: Nivel ${level}. Vulnerabilidad a explotar: ${primaryWeakness}.
    
    Reglas UI: Formas(s): "■","▲","●","◆","✖","★" | Colores(c): "#00f2ff","#ff0055","#ffea00","#8b5cf6","#00ff88","#ffffff" | Cantidad(n): 1 a 6.
    
    Estructura la lógica de forma compleja. La celda matriz[2][2] DEBE ser 'null'.
    DEVUELVE SÓLO UN JSON VÁLIDO. FORMATO EXACTO:
    {
      "ruleType": "${primaryWeakness}",
      "matrix": [ [{"s":"■","c":"#ffffff","n":1}, {"s":"■","c":"#ffffff","n":1}, {"s":"■","c":"#ffffff","n":1}], [{"s":"■","c":"#ffffff","n":1}, {"s":"■","c":"#ffffff","n":1}, {"s":"■","c":"#ffffff","n":1}], [{"s":"■","c":"#ffffff","n":1}, {"s":"■","c":"#ffffff","n":1}, null] ],
      "options": [ {"s":"■","c":"#ffffff","n":1}, {"s":"▲","c":"#ff0055","n":2}, {"s":"●","c":"#00f2ff","n":3}, {"s":"◆","c":"#ffea00","n":4} ],
      "correctIndex": 0,
      "explanation": "Explicación táctica."
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.9 })
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const data = await res.json();
    const rawText = data.choices[0].message.content;
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON Ausente en payload");
    
    let parsedData = JSON.parse(jsonMatch[0]);
    
    // Fisher-Yates local shuffle
    const correctOpt = parsedData.options[parsedData.correctIndex];
    for (let i = parsedData.options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [parsedData.options[i], parsedData.options[j]] = [parsedData.options[j], parsedData.options[i]];
    }
    parsedData.correctIndex = parsedData.options.findIndex(opt => opt.s === correctOpt.s && opt.c === correctOpt.c && opt.n === correctOpt.n);
    if(parsedData.correctIndex === -1) parsedData.correctIndex = 0;

    return parsedData;
  } catch (error) {
    // Si la API falla, usamos el motor offline perfecto
    return generateProceduralMatrix(level, primaryWeakness);
  }
};

/* ============================================================
   🧊 KERNEL 3D: CÁMARA CON PARALAJE & NÚCLEO NEURAL
============================================================ */
const ParallaxCamera = () => {
  const { camera } = useThree();
  const target = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useFrame(() => {
    camera.position.x += (mouse.current.x * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouse.current.y * 2 - camera.position.y) * 0.05;
    camera.position.z = 10;
    camera.lookAt(target);
  });
  return null;
};

const NeuralCore = ({ stressLevel }) => {
  const coreRef = useRef();
  const ringRef = useRef();
  
  const icosahedronGeo = useMemo(() => new THREE.IcosahedronGeometry(7, 1), []);
  const torusGeo = useMemo(() => new THREE.TorusGeometry(9, 0.2, 16, 100), []);
  
  const isCritical = stressLevel > 70;
  const coreColor = isCritical ? '#ff0055' : '#005577';
  
  useFrame((state, delta) => {
    if (coreRef.current && ringRef.current) {
      const rotSpeed = isCritical ? 1.5 : 0.2;
      coreRef.current.rotation.x += delta * rotSpeed;
      coreRef.current.rotation.y += delta * (rotSpeed * 1.5);
      
      ringRef.current.rotation.z -= delta * (rotSpeed * 0.5);
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime) * 0.2;
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * (isCritical ? 8 : 2)) * 0.05;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, 0, -15]}>
      <mesh ref={coreRef} geometry={icosahedronGeo}>
        <meshBasicMaterial color={coreColor} wireframe transparent opacity={isCritical ? 0.6 : 0.15} />
      </mesh>
      <mesh ref={ringRef} geometry={torusGeo}>
        <meshBasicMaterial color={coreColor} wireframe transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

/* ============================================================
   🎨 RENDERIZADOR HOLOGRÁFICO (DECRYPTION EFECTO O(1))
============================================================ */
const SymbolHologram = ({ data, isUnknown, delay = 0, level }) => {
  const [displayData, setDisplayData] = useState(null);
  const [decrypting, setDecrypting] = useState(true);

  useEffect(() => {
    if (isUnknown || !data) return;
    setDecrypting(true);
    
    const chars = "ΔΘΩΦΣΠΨΞΓ10101#@%";
    let iterations = 0;
    const maxIterations = 15; 
    
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (iterations >= maxIterations) {
          clearInterval(interval);
          setDisplayData(data);
          setDecrypting(false);
        } else {
          setDisplayData({
            s: chars[Math.floor(Math.random() * chars.length)],
            c: data.c,
            n: data.n
          });
          iterations++;
        }
      }, 35);
      return () => clearInterval(interval);
    }, delay); 

    return () => clearTimeout(timeout);
  }, [data, isUnknown, delay]);

  if (isUnknown || !data) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,242,255,0.02)', border: '2px dashed rgba(0,242,255,0.4)', borderRadius: '16px' }}>
        <span className="pulse-text" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#00f2ff', textShadow: '0 0 25px rgba(0,242,255,0.8)' }}>?</span>
      </div>
    );
  }

  const renderData = decrypting && displayData ? displayData : data;
  const numSymbols = Math.min(renderData.n || 1, 9); 
  const cols = numSymbols === 1 ? 1 : numSymbols <= 4 ? 2 : 3;

  return (
    <div className="hologram-cell" style={{ 
      width: '100%', height: '100%', display: 'grid', 
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      alignItems: 'center', justifyItems: 'center', gap: '2px',
      background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(2,6,23,0.95))', 
      border: `1px solid ${renderData.c}60`, borderRadius: '16px', padding: 'clamp(5px, 2vw, 15px)',
      boxShadow: `inset 0 0 30px ${renderData.c}20, 0 8px 16px rgba(0,0,0,0.5)`,
      position: 'relative'
    }}>
      {Array.from({ length: numSymbols }).map((_, i) => (
        <span key={i} style={{ 
          color: renderData.c, 
          textShadow: `0 0 15px ${renderData.c}`, 
          fontSize: decrypting ? 'clamp(1.2rem, 3.5vw, 2.2rem)' : 'clamp(1.5rem, 4.5vw, 3rem)', 
          lineHeight: '1',
          opacity: decrypting ? 0.5 : 1,
          fontFamily: decrypting ? 'monospace' : 'inherit',
          transition: 'all 0.1s ease'
        }}>
          {renderData.s}
        </span>
      ))}
    </div>
  );
};

/* ============================================================
   🎮 MAIN INTERFACE: RAVEN OS LÓGICA FLUIDA (GOD TIER UX)
============================================================ */
export default function RavenLogic() {
  const gameStore = useGameStore();
  const language = gameStore?.language || 'es';
  const UI = getLexicon(language);

  const { level, score, streak, combo, currentRank, gameState, weaknessProfile, currentPuzzle, feedbackData, setGameState, setPuzzle, registerAnswer, penalizeFocusLoss, retryPuzzle } = useRavenStore();

  const [timeLeft, setTimeLeft] = useState(100);
  const [focusWarning, setFocusWarning] = useState(false);
  const requestRef = useRef();
  const startTimeRef = useRef();
  
  const stressLevel = 100 - timeLeft;

  // 🛡️ ANTI-CHEAT: Rastreador de Foco de Pestaña
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && useRavenStore.getState().gameState === 'PLAYING') {
        penalizeFocusLoss();
        setFocusWarning(true);
        setTimeout(() => setFocusWarning(false), 3000);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [penalizeFocusLoss]);

  // ⏱️ Neuro-Timer
  const startTimer = useCallback(() => {
    setTimeLeft(100);
    cancelAnimationFrame(requestRef.current);
    
    // Tiempo de resolución exigente pero justo
    const durationMs = Math.max(15000, 50000 - (level * 2000)); 

    const animate = (time) => {
      if (useRavenStore.getState().gameState !== 'PLAYING') return; 
      
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.max(0, 100 - ((elapsed / durationMs) * 100));
      
      setTimeLeft(progress);

      if (progress > 0) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // TIMEOUT
        CyberAudio.playError();
        registerAnswer(false, "Sistema comprometido por latencia. Velocidad sináptica insuficiente.", currentPuzzle?.ruleType || 'logic', true, 0);
      }
    };
    
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  }, [level, currentPuzzle, registerAnswer]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(requestRef.current);
      CyberAudio.stopZenDrone();
    };
  }, []);

  const generateMission = useCallback(async () => {
    cancelAnimationFrame(requestRef.current);
    setGameState('SYNTHESIZING');
    CyberAudio.playHover();
    CyberAudio.startZenDrone(); // Inicia el dron de concentración pura
    
    const puzzle = await fetchNextMatrix(level, weaknessProfile);
    setPuzzle(puzzle);
    
    setTimeout(() => {
      startTimeRef.current = null; 
      startTimer();
    }, 1500); 
  }, [level, weaknessProfile, setGameState, setPuzzle, startTimer]);

  // Manejador del botón "REINTENTAR MATRIZ"
  const handleRetryRound = useCallback(() => {
    setGameState('PLAYING');
    CyberAudio.playClick();
    setTimeout(() => {
      startTimeRef.current = null;
      startTimer();
    }, 500);
  }, [setGameState, startTimer]);

  useEffect(() => {
    if (gameState === 'BOOT') {
      // Retraso ligero para no golpear la API de inmediato en boot
      setTimeout(() => generateMission(), 1000);
    }
  }, [gameState, generateMission]);

  const handleOptionSelect = useCallback((index) => {
    if (gameState !== 'PLAYING') return;
    cancelAnimationFrame(requestRef.current);
    CyberAudio.playClick();
    
    const isCorrect = index === currentPuzzle.correctIndex;
    const timeMultiplier = timeLeft / 100;
    registerAnswer(isCorrect, currentPuzzle.explanation, currentPuzzle.ruleType, false, timeMultiplier);
    
    if(isCorrect) {
      CyberAudio.playSuccess();
    } else {
      CyberAudio.playError();
    }
  }, [gameState, currentPuzzle, registerAnswer, timeLeft]);

  const handleNextRound = () => {
    CyberAudio.playClick();
    generateMission();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010308', fontFamily: "'Orbitron', sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', WebkitUserSelect: 'none', userSelect: 'none' }}>
      
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(25px); border: 1px solid rgba(0,242,255,0.15); box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .cyber-btn { background: rgba(0,242,255,0.1); color: #00f2ff; border: 2px solid #00f2ff; padding: 25px; border-radius: 16px; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: clamp(1.1rem, 3.5vw, 1.5rem); box-shadow: 0 6px 0 rgba(0,0,0,0.6); touch-action: manipulation; }
        .cyber-btn:active { transform: translateY(6px); box-shadow: 0 0 0 rgba(0,0,0,0.6); filter: brightness(1.3); background: #00f2ff; color: #000; }
        
        .matrix-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(10px, 2vw, 16px); width: 100%; max-width: 600px; margin: 0 auto; aspect-ratio: 1; padding: clamp(12px, 3vw, 25px); background: rgba(0,0,0,0.6); border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); box-shadow: inset 0 0 30px rgba(0,0,0,0.9), 0 15px 30px rgba(0,0,0,0.5); }
        .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(15px, 3vw, 24px); width: 100%; max-width: 600px; margin: 0 auto; }
        @media (min-width: 768px) { .options-grid { grid-template-columns: repeat(4, 1fr); } }
        
        .pulse-text { animation: pulse 1s infinite alternate; }
        @keyframes pulse { from { opacity: 0.3; transform: scale(0.95); } to { opacity: 1; transform: scale(1.05); } }
        
        .glitch-anim { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-4px, 4px) } 40% { transform: translate(-4px, -4px) } 60% { transform: translate(4px, 4px) } 80% { transform: translate(4px, -4px) } 100% { transform: translate(0) } }
        
        .progress-bar-container { width: 100%; height: 8px; background: rgba(0,0,0,0.9); position: absolute; top: 0; left: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .progress-bar { height: 100%; transition: width 0.1s linear, background-color 0.3s ease; box-shadow: 0 0 25px currentColor; }
        
        .hologram-cell { transition: transform 0.1s ease, filter 0.1s ease; position: relative; overflow: hidden; cursor: pointer; touch-action: manipulation; }
        .hologram-cell::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%); opacity: 0; transition: 0.3s; transform: scale(0.5); pointer-events: none;}
        @media (hover: hover) {
          .hologram-cell:hover { transform: scale(1.04); filter: brightness(1.3); z-index: 10; border-color: #00f2ff; }
          .hologram-cell:hover::before { opacity: 1; transform: scale(1); }
        }
        .hologram-cell:active { transform: scale(0.96); filter: brightness(1.5); }

        .scanline { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,242,255,0.04) 51%, transparent 51%); background-size: 100% 4px; pointer-events: none; z-index: 1; mix-blend-mode: screen; }
      `}</style>

      <div className="scanline"></div>

      {/* 🚀 KERNEL 3D ENVIRONMENT (React Three Fiber Memory-Safe) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Canvas gl={{ powerPreference: "high-performance", antialias: false, preserveDrawingBuffer: true }} dpr={[1, 2]}>
          <color attach="background" args={['#010308']} />
          <ambientLight intensity={0.5} />
          
          <Stars radius={100} depth={50} count={6000} factor={4} saturation={1} fade speed={level * 0.5} />
          
          <Suspense fallback={null}>
            <ParallaxCamera />
            <NeuralCore stressLevel={stressLevel} />
          </Suspense>

          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
            <Vignette eskil={false} offset={0.1} darkness={1.1 + (stressLevel * 0.015)} />
            
            {/* Solo activamos Glitch/Aberration en el Error, manteniendo el flujo relajado el resto del tiempo */}
            {(gameState === 'FAIL' || gameState === 'TIMEOUT' || focusWarning) && <ChromaticAberration offset={[0.06, 0.06]} />}
            {(gameState === 'FAIL' || gameState === 'TIMEOUT' || focusWarning) && <Glitch delay={[0, 0]} duration={[0.2, 0.6]} strength={[0.8, 1.2]} active />}
          </EffectComposer>
        </Canvas>
      </div>

      {/* 🚀 ALERTA ANTI-CHEAT */}
      {focusWarning && (
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,0,85,0.9)', padding: '15px 30px', borderRadius: '12px', zIndex: 9999, fontWeight: '900', letterSpacing: '2px', boxShadow: '0 0 30px #ff0055', textAlign: 'center', width: '90%', maxWidth: '500px' }}>
          <i className="fas fa-exclamation-triangle me-2"></i> {UI.focusLost} (-500 PTS)
        </div>
      )}

      {/* 🚀 NEURO-STRESS TIMER */}
      {(gameState === 'PLAYING') && (
         <div className="progress-bar-container">
            <div className="progress-bar" style={{ 
              width: `${timeLeft}%`, 
              background: timeLeft > 40 ? '#00f2ff' : timeLeft > 20 ? '#ffea00' : '#ff0055',
              color: timeLeft > 40 ? '#00f2ff' : timeLeft > 20 ? '#ffea00' : '#ff0055' 
            }}></div>
         </div>
      )}

      {/* 🚀 HEADER Y HUD TÁCTICO */}
      <div className="glass-panel" style={{ padding: 'clamp(15px, 3vh, 25px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,242,255,0.3)', zIndex: 10, position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.4rem, 4vw, 2.2rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '3px', textShadow: '0 0 20px rgba(0,242,255,0.7)' }}>
            <i className="fas fa-brain me-3"></i>{UI.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '10px', display: 'flex', gap: '15px', flexWrap: 'wrap', fontWeight: 'bold' }}>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>{UI.level}: <strong style={{color:'#fff', fontSize: '1.2rem'}}>{level}</strong></span>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>{UI.streak}: <strong style={{color:'#ffea00', fontSize: '1.2rem'}}>{streak} <i className="fas fa-fire ms-1"></i></strong></span>
            {combo > 1.0 && (
              <span style={{background: 'rgba(255,234,0,0.1)', color: '#ffea00', padding: '5px 15px', borderRadius: '8px', border: '1px solid #ffea00', animation: 'pulse 1s infinite alternate', textShadow: '0 0 10px #ffea00'}}>x{combo.toFixed(1)} COMBO</span>
            )}
          </div>
        </div>
        
        {/* THREAT MAP (DASHBOARD LATERAL PC) */}
        <div className="d-none d-lg-flex" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '280px', margin: '0 30px', background: 'rgba(0,0,0,0.6)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(0,242,255,0.15)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textAlign: 'center', letterSpacing: '3px', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              <i className="fas fa-shield-virus me-2"></i>{UI.vuln}
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#00f2ff', fontWeight: 'bold', textAlign: 'right'}}>{UI.spatial}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.spatial}%`, height:'100%', background: weaknessProfile.spatial > 70 ? '#ff0055' : '#00f2ff', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#ffea00', fontWeight: 'bold', textAlign: 'right'}}>{UI.math}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.mathematical}%`, height:'100%', background: weaknessProfile.mathematical > 70 ? '#ff0055' : '#ffea00', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#8b5cf6', fontWeight: 'bold', textAlign: 'right'}}>{UI.logic}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.logic}%`, height:'100%', background: weaknessProfile.logic > 70 ? '#ff0055' : '#8b5cf6', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.7)', padding: '12px 25px', borderRadius: '16px', border: '1px solid rgba(0,242,255,0.3)', boxShadow: '0 8px 20px rgba(0,0,0,0.6)' }}>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(0,242,255,0.6)', lineHeight: '1' }}>{score}</div>
          <div style={{ color: '#00f2ff', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 'bold' }}>{UI.score}</div>
        </div>
      </div>

      {/* 🚀 ZONA CENTRAL: MATRIZ Y HACKEO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(15px, 4vw, 30px)', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {gameState === 'SYNTHESIZING' && (
          <div className="glitch-anim" style={{ textAlign: 'center', color: '#00f2ff' }}>
            <i className="fas fa-satellite-dish fa-5x mb-4" style={{ filter: 'drop-shadow(0 0 30px #00f2ff)' }}></i>
            <h2 style={{ letterSpacing: 'clamp(4px, 5vw, 8px)', fontWeight: '900', fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', textShadow: '0 0 25px currentColor' }}>{UI.synthesizing}</h2>
            <p style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 3.5vw, 1.4rem)', fontWeight: 'bold' }}>{UI.analyzing}</p>
          </div>
        )}

        {(gameState === 'PLAYING' || gameState === 'FEEDBACK' || gameState === 'TIMEOUT') && currentPuzzle && (
          <div style={{ animation: 'fadeIn 0.4s ease-out', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             
             {/* CONEXIÓN COGNITIVA */}
             <div style={{ background: 'rgba(0,0,0,0.7)', padding: '12px 25px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontSize: 'clamp(0.9rem, 2.5vw, 1.2rem)', textAlign: 'center', maxWidth: '750px', marginBottom: 'clamp(20px, 4vh, 35px)', fontWeight: '600', lineHeight: '1.6', boxShadow: '0 10px 20px rgba(0,0,0,0.5)' }}>
                <i className="fas fa-eye me-2" style={{color: '#ffea00'}}></i> {UI.sysMsg}
             </div>

             {/* LA MATRIZ 3x3 */}
             <div className="matrix-grid mb-5">
                {currentPuzzle.matrix.flat().map((cellData, index) => (
                   <div key={`matrix-${index}`} style={{ width: '100%', height: '100%', minHeight: '85px' }}>
                     <SymbolHologram data={cellData} isUnknown={cellData === null} delay={index * 60} level={level} />
                   </div>
                ))}
             </div>

             {/* OPCIONES DEL JUGADOR */}
             {gameState === 'PLAYING' ? (
               <div className="options-grid">
                  {currentPuzzle.options.map((opt, i) => (
                     <button 
                        key={`opt-${i}`} 
                        onClick={(e) => { e.preventDefault(); handleOptionSelect(i); }}
                        onPointerEnter={() => CyberAudio.playHover()}
                        style={{ background: 'transparent', border: 'none', padding: 0, height: 'clamp(95px, 16vh, 140px)', width: '100%', outline: 'none', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                     >
                        <SymbolHologram data={opt} delay={0} level={level} />
                     </button>
                  ))}
               </div>
             ) : (
               <div className="glass-panel" style={{ padding: 'clamp(30px, 6vw, 45px)', borderRadius: '28px', borderTop: `5px solid ${feedbackData.isCorrect ? '#00ff88' : '#ff0055'}`, width: '100%', maxWidth: '800px', textAlign: 'center', marginTop: '10px', boxShadow: `0 25px 60px rgba(0,0,0,0.9)` }}>
                  <i className={`fas ${feedbackData.isCorrect ? 'fa-unlock-alt' : 'fa-shield-virus'} fa-5x mb-4`} style={{ color: feedbackData.isCorrect ? '#00ff88' : '#ff0055', filter: 'drop-shadow(0 0 25px currentColor)' }}></i>
                  
                  <h2 style={{ color: feedbackData.isCorrect ? '#00ff88' : '#ff0055', margin: '0 0 25px 0', fontSize: 'clamp(1.8rem, 6vw, 3rem)', fontWeight: '900', letterSpacing: '3px', textShadow: `0 0 25px currentColor` }}>
                     {feedbackData.isTimeout ? UI.timeout : (feedbackData.isCorrect ? UI.correct : UI.wrong)}
                  </h2>
                  
                  <div style={{ color: '#f8fafc', fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)', lineHeight: '1.9', marginBottom: '40px', textAlign: 'left', background: 'rgba(0,0,0,0.8)', padding: '30px', borderRadius: '20px', borderLeft: `6px solid ${feedbackData.isCorrect ? '#00ff88' : '#ff0055'}`, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)' }}>
                    <strong style={{color: '#00f2ff', display: 'block', marginBottom: '15px', fontSize: '1.3rem', letterSpacing: '2px'}}><i className="fas fa-terminal me-3"></i>{UI.analysis}</strong>
                    <div style={{fontWeight: '500'}}>{feedbackData.explanation}</div>
                  </div>
                  
                  {/* Lógica God Tier: Botón dinámico. Si fallas, REINTENTAS LA MATRIZ. Si aciertas, SIGUIENTE MATRIZ. */}
                  <button className="cyber-btn" onClick={feedbackData.isCorrect ? handleNextRound : () => useRavenStore.getState().retryPuzzle()} onPointerEnter={() => CyberAudio.playHover()} style={{ width: '100%', padding: '30px', borderRadius: '20px' }}>
                     {feedbackData.isCorrect ? UI.next : UI.retry} <i className={`fas ${feedbackData.isCorrect ? 'fa-forward' : 'fa-redo'} ms-3`}></i>
                  </button>
               </div>
             )}

          </div>
        )}
      </div>

    </div>
  );
}