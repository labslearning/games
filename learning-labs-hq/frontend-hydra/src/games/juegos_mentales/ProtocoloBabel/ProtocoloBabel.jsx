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
const DEEPSEEK_API_KEY = "sk-9c7336f2ef7e4630b2bcef83a6994c57"; 
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (VECTORES EXPANDIDOS GOD TIER)
============================================================ */
const LEXICON = {
  es: {
    title: "PROTOCOLO BABEL", subtitle: "Hiper-Procesamiento Semántico",
    level: "NIVEL", score: "PUNTOS", streak: "RACHA",
    topicReq: "SELECCIONA UN VECTOR NEURAL:",
    topics: { 
      physics: "Física Cuántica", neuro: "Neurociencia", cyber: "Criptografía", 
      history: "Estrategia Militar", astro: "Astrofísica", bio: "Biología Sintética",
      philosophy: "Filosofía del Absurdo", econ: "Economía Global" 
    },
    start: "INICIAR TRANSFERENCIA", wpmLabel: "VELOCIDAD NEURAL (WPM)",
    synthesizing: "SINTETIZANDO ENSAYO", analyzing: "Inyectando paradojas lógicas...",
    interruptBtn: "¡INTERRUMPIR ANOMALÍA!",
    resultHit: "AMENAZA NEUTRALIZADA", resultFalsePos: "FALSO POSITIVO", resultMiss: "ANOMALÍA OMITIDA",
    aiAnalysis: "Análisis Forense:", next: "SIGUIENTE VECTOR",
    sysMsg: "La IA proyectará texto a alta velocidad ocultando UNA falacia lógica o contradicción. Presiona INTERRUMPIR en el instante exacto que la detectes.",
    modeORP: "O.R.P.", modeBionic: "BIONIC", modeChunk: "BLOQUES"
  },
  en: {
    title: "BABEL PROTOCOL", subtitle: "Semantic Hyper-Processing",
    level: "LEVEL", score: "SCORE", streak: "STREAK",
    topicReq: "SELECT A DATA VECTOR:",
    topics: { 
      physics: "Quantum Physics", neuro: "Neuroscience", cyber: "Cryptography", 
      history: "Military Strategy", astro: "Astrophysics", bio: "Synthetic Biology",
      philosophy: "Philosophy of the Absurd", econ: "Global Economy" 
    },
    start: "INITIATE TRANSFER", wpmLabel: "NEURAL SPEED (WPM)",
    synthesizing: "SYNTHESIZING ESSAY", analyzing: "Injecting logical paradoxes...",
    interruptBtn: "INTERRUPT ANOMALY!",
    resultHit: "THREAT NEUTRALIZED", resultFalsePos: "FALSE POSITIVE", resultMiss: "ANOMALY MISSED",
    aiAnalysis: "Forensic Analysis:", next: "NEXT VECTOR",
    sysMsg: "The AI will project text at high speed hiding ONE logical fallacy or contradiction. Press INTERRUPT the exact moment you detect it.",
    modeORP: "O.R.P.", modeBionic: "BIONIC", modeChunk: "CHUNKS"
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
  playHover() { this._playOscillator('sine', 600, 400, 0.1, 0.02); }, 
  playClick() { this._playOscillator('sine', 1200, 800, 0.1, 0.05); }, 
  playSuccess() {
    this._playOscillator('sine', 523.25, null, 0.4, 0.1); 
    setTimeout(() => this._playOscillator('sine', 659.25, null, 0.4, 0.1), 50); 
    setTimeout(() => this._playOscillator('sine', 783.99, null, 0.6, 0.1), 100); 
  },
  playError() { 
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
      this.droneGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3); 
      
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
   🎙️ MOTOR DE VOZ IA (TTS UNIVERSAL)
============================================================ */
class VoiceEngine {
  constructor() { 
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null; 
      this.langs = { es: 'es-ES', en: 'en-US' }; 
  }
  speak(text, langCode = 'es') {
    if (!this.synth) return;
    this.synth.cancel(); 
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = this.langs[langCode] || 'es-ES';
    utterThis.rate = 1.1; utterThis.pitch = 0.95;
    this.synth.speak(utterThis);
  }
  stop() { if (this.synth) this.synth.cancel(); }
}
const TTS = new VoiceEngine();

/* ============================================================
   🧠 LINGUISTIC ENGINE (O.R.P., TIMING & FUZZY MATCHING GOD TIER)
============================================================ */
const LanguageEngine = {
  tokenize: (text) => text.replace(/\n+/g, ' \n ').replace(/\s{2,}/g, ' ').split(' ').filter(w => w.trim().length > 0),
  
  getORP: (word) => {
    const len = word.length;
    if (len === 1) return 0;
    if (len >= 2 && len <= 5) return 1;
    if (len >= 6 && len <= 9) return 2;
    if (len >= 10 && len <= 13) return 3;
    return Math.floor(len / 3); 
  },
  
  getDelayMultiplier: (word) => {
    const lastChar = word.slice(-1);
    if (/[.?!]/.test(lastChar)) return 2.5; 
    if (/[,;:]/.test(lastChar)) return 1.5;
    if (word.length > 12) return 1.3; 
    return 1.0;
  },
  
  toBionic: (word) => {
    if(word === '\n') return word;
    const cleanWord = word.trim();
    if(cleanWord.length <= 1) return `<b style="font-weight: 900; color: #fff;">${cleanWord}</b>`;
    const pivot = Math.ceil(cleanWord.length / 2);
    return `<b style="font-weight: 900; color: #fff;">${cleanWord.slice(0, pivot)}</b><span style="color: #94a3b8; font-weight: normal;">${cleanWord.slice(pivot)}</span>`;
  },
  
  getSmartChunk: (tokens, startIndex, requestedSize) => {
    let chunk = [];
    let endIndex = startIndex;
    let actualSize = 0;
    for (let i = 0; i < requestedSize; i++) {
        if (endIndex >= tokens.length) break;
        const word = tokens[endIndex];
        chunk.push(word);
        endIndex++;
        actualSize++;
        if (/[.!?\n]/.test(word)) break;
        if (actualSize >= Math.max(1, requestedSize - 2) && /[,;:]/.test(word)) break;
    }
    return { text: chunk.join(' '), nextIndex: endIndex, words: chunk };
  },
  
  fuzzyFindAnomaly: (rawTokens, anomalyTokens) => {
    const cleanWord = (w) => w.toLowerCase().replace(/[.,!?;:()]/g, '');
    const cleanAnomaly = anomalyTokens.map(cleanWord);
    const cleanRaw = rawTokens.map(cleanWord);
    
    let bestMatchIndex = -1;
    let maxMatches = 0;

    for (let i = 0; i <= cleanRaw.length - cleanAnomaly.length; i++) {
        let matches = 0;
        for (let j = 0; j < cleanAnomaly.length; j++) {
            if (cleanRaw[i+j] === cleanAnomaly[j]) matches++;
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchIndex = i;
        }
    }
    return bestMatchIndex !== -1 ? bestMatchIndex : Math.floor(rawTokens.length / 2);
  }
};

/* ============================================================
   🧠 ZUSTAND STORE: ESTADO DEL SIMULADOR
============================================================ */
const useBabelStore = create((set, get) => ({
  level: 1,
  score: 0,
  streak: 0,
  gameState: 'SETUP', // SETUP, SYNTHESIZING, PREPARING, READING, FEEDBACK
  wpm: 500,
  readMode: 'ORP',
  chunkSize: 3,
  currentTopic: 'physics',
  documentData: null, 
  tokens: [],
  feedbackState: null, 

  setSetup: (updates) => set((state) => ({ ...state, ...updates })),
  setGameState: (state) => set({ gameState: state }),
  
  loadDocument: (doc, tokens, anomalyBounds) => set({ 
    documentData: { ...doc, ...anomalyBounds }, 
    tokens, 
    gameState: 'PREPARING' 
  }),

  registerInterrupt: (currentIndex) => set((state) => {
    const { startIndex, endIndex } = state.documentData;
    
    // VENTANA COGNITIVA TÁCTICA: Permite un margen de error humano de reacción visual.
    const isValidHit = currentIndex >= (Math.max(0, startIndex - 2)) && currentIndex <= (endIndex + 12);
    const feedbackState = isValidHit ? 'HIT' : 'FALSE_POSITIVE';
    
    let newScore = state.score;
    let newStreak = state.streak;
    let newLevel = state.level;

    if (isValidHit) {
      newScore += Math.floor(state.wpm * state.level * 1.5); 
      newStreak += 1;
      if (newStreak % 3 === 0) newLevel++;
    } else {
      newStreak = 0;
      newLevel = Math.max(1, newLevel - 1);
    }

    return { 
      feedbackState, score: newScore, streak: newStreak, level: newLevel, gameState: 'FEEDBACK' 
    };
  }),

  registerMiss: () => set((state) => ({ 
    feedbackState: 'MISSED', streak: 0, level: Math.max(1, state.level - 1), gameState: 'FEEDBACK' 
  })),
  
  nextRound: () => set({ gameState: 'SYNTHESIZING', feedbackState: null })
}));

/* ============================================================
   🤖 KERNEL AI: GENERADOR DE PARADOJAS (RED TEAMING)
============================================================ */
const generateBabelDocument = async (level, topic, langCode) => {
  const sysPrompt = `
    Eres 'Babel', un motor de Red Teaming Cognitivo. Genera un texto técnico avanzado sobre: "${topic}".
    Idioma: ${langCode}. Longitud: Entre 120 y 160 palabras.
    Dificultad técnica: Nivel ${level}/10 (Usa jerga técnica real y convincente).
    
    MECÁNICA CLAVE: Inyecta EXACTAMENTE UNA (1) falacia lógica, contradicción científica grave o anacronismo evidente, muy sutilmente camuflado. El resto del texto debe ser 100% verídico.
    
    RESPONDE ÚNICAMENTE CON JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA:
    {
      "fullText": "El texto completo generado aquí...",
      "anomalyPhrase": "La frase exacta de la contradicción (subcadena exacta, entre 5 y 15 palabras).",
      "explanation": "Explicación de por qué es una paradoja o error."
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.8 })
    });
    const data = await res.json();
    const rawText = data.choices[0].message.content;
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON no encontrado");
    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.warn("Babel Engine API Fallback activado:", error);
    // OFFLINE FALLBACK 100% SEGURO
    return {
      fullText: "La computación cuántica promete revolucionar el procesamiento de información utilizando qubits. A diferencia de los bits clásicos que operan en estados de 0 o 1, los qubits aprovechan el principio de superposición. Esto les permite explorar múltiples vías de cálculo simultáneamente, resolviendo problemas matemáticos intrazables. Para mantener la coherencia cuántica, los procesadores superconductores deben enfriarse a temperaturas extremas. Sin embargo, los nuevos diseños de IBM han demostrado que el entrelazamiento cuántico funciona de manera más eficiente si el procesador se sumerge en agua hirviendo a nivel del mar. Los algoritmos de corrección de errores se benefician de esta reducción de ruido térmico artificial.",
      anomalyPhrase: "funciona de manera más eficiente si el procesador se sumerge en agua hirviendo",
      explanation: "El calor extremo destruye instantáneamente la coherencia cuántica (decoherencia térmica). Los procesadores cuánticos superconductores requieren temperaturas criogénicas cercanas al cero absoluto, no agua hirviendo."
    };
  }
};

/* ============================================================
   🧊 KERNEL 3D: CÁMARA CON PARALAJE & ENTORNO CUÁNTICO
============================================================ */
const BackgroundEngine = () => {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1, pointerEvents: 'none' }}>
      <Canvas dpr={[1, 1.5]} gl={{ powerPreference: "high-performance", antialias: false }}>
        <color attach="background" args={['#010204']} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
        
        <Suspense fallback={null}>
           <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
              <mesh position={[0,0,-20]}>
                <icosahedronGeometry args={[12, 1]} />
                <meshBasicMaterial color="#005577" wireframe opacity={0.05} transparent />
              </mesh>
           </Float>
        </Suspense>

        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.2} />
          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
};


/* ============================================================
   🎮 MAIN INTERFACE: PROTOCOLO BABEL (MOBILE FIRST TIER)
============================================================ */
export default function ProtocoloBabel() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = BASE_LEXICON[language] ? language : 'es';
  const UI = getLexicon(safeLang);

  const { 
    level, score, streak, gameState, wpm, readMode, chunkSize, currentTopic, documentData, tokens, feedbackState,
    setSetup, setGameState, loadDocument, registerInterrupt, registerMiss, nextRound 
  } = useBabelStore();

  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const wpmRef = useRef(wpm);
  const indexRef = useRef(0);
  const requestRef = useRef(null);
  const delayAccumulator = useRef(0);
  const lastFrameTime = useRef(0);

  useEffect(() => { wpmRef.current = wpm; }, [wpm]);

  // 🤖 FLUJO DE GENERACIÓN
  const startMission = useCallback(async () => {
    setGameState('SYNTHESIZING');
    CyberAudio.playHover();
    CyberAudio.startZenDrone();
    const doc = await generateBabelDocument(level, UI.topics[currentTopic], safeLang);
    
    const rawTokens = LanguageEngine.tokenize(doc.fullText);
    const anomalyTokens = LanguageEngine.tokenize(doc.anomalyPhrase);
    
    const startIndex = LanguageEngine.fuzzyFindAnomaly(rawTokens, anomalyTokens);
    const endIndex = startIndex + anomalyTokens.length - 1;

    loadDocument(doc, rawTokens, { startIndex, endIndex });
  }, [level, currentTopic, safeLang, setGameState, loadDocument, UI.topics]);

  // ⏱️ COUNTDOWN INICIAL
  useEffect(() => {
    if (gameState === 'PREPARING') {
      setCurrentIndex(0);
      indexRef.current = 0;
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('READING');
            lastFrameTime.current = performance.now();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, setGameState]);

  // 👁️ RSVP ENGINE (NÚCLEO DE RENDERIZADO VISUAL A ALTA VELOCIDAD)
  const rsvpLoop = useCallback((time) => {
    if (useBabelStore.getState().gameState !== 'READING') return;

    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;
    delayAccumulator.current += deltaTime;

    if (indexRef.current >= tokens.length - 1) {
      registerMiss();
      return;
    }

    let wordsAdvance = 1;
    let multiplier = 1.0;

    if (readMode === 'CHUNK') {
        const chunkData = LanguageEngine.getSmartChunk(tokens, indexRef.current, chunkSize);
        wordsAdvance = chunkData.nextIndex - indexRef.current;
        multiplier = LanguageEngine.getDelayMultiplier(tokens[chunkData.nextIndex - 1] || '');
    } else {
        multiplier = LanguageEngine.getDelayMultiplier(tokens[indexRef.current]);
    }

    const baseDelay = ((60 / wpmRef.current) * 1000) * wordsAdvance * multiplier;

    if (delayAccumulator.current >= baseDelay) {
      delayAccumulator.current = 0;
      indexRef.current = Math.min(indexRef.current + wordsAdvance, tokens.length - 1);
      setCurrentIndex(indexRef.current);
    }
    requestRef.current = requestAnimationFrame(rsvpLoop);
  }, [tokens, readMode, chunkSize, registerMiss]);

  useEffect(() => {
    if (gameState === 'READING') {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(rsvpLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, rsvpLoop]);

  // ⚡ ACCIÓN: INTERRUPCIÓN TÁCTICA
  const handleInterrupt = useCallback(() => {
    if (gameState !== 'READING') return;
    CyberAudio.stopZenDrone();
    registerInterrupt(currentIndex);
  }, [gameState, currentIndex, registerInterrupt]);

  // 🗣️ AUDIO-FEEDBACK AUTOMÁTICO
  useEffect(() => {
    if (gameState === 'FEEDBACK' && documentData) {
       if(feedbackState === 'HIT') {
         CyberAudio.playSuccess();
       } else {
         CyberAudio.playError();
       }
       TTS.speak((feedbackState === 'HIT' ? 'Correcto. ' : 'Fallo. ') + documentData.explanation, safeLang);
    }
  }, [gameState, feedbackState, documentData, safeLang]);

  /* ============================================================
     🎨 RENDERIZADORES DE LECTURA (MOBILE SCALABLE)
  ============================================================ */
  const renderReadingContent = () => {
    if (tokens.length === 0 || currentIndex >= tokens.length) return null;

    if (readMode === 'ORP') {
      const word = tokens[currentIndex];
      const cleanWord = word.trim();
      const orpIndex = LanguageEngine.getORP(cleanWord);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%', wordBreak: 'break-word' }}>
          <span style={{ color: '#64748b', textAlign: 'right', whiteSpace: 'pre', overflow: 'hidden' }}>{cleanWord.substring(0, orpIndex)}</span>
          <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.2em', textShadow: '0 0 20px rgba(0,242,255,0.8)' }}>{cleanWord.charAt(orpIndex)}</span>
          <span style={{ color: '#64748b', textAlign: 'left', whiteSpace: 'pre', overflow: 'hidden' }}>{cleanWord.substring(orpIndex + 1)}</span>
        </div>
      );
    } 
    
    if (readMode === 'BIONIC') {
      const word = tokens[currentIndex];
      return <span dangerouslySetInnerHTML={{ __html: LanguageEngine.toBionic(word) }} style={{ color: '#e2e8f0', letterSpacing: '1px', wordBreak: 'break-word' }} />;
    }

    if (readMode === 'CHUNK') {
      const chunkData = LanguageEngine.getSmartChunk(tokens, currentIndex, chunkSize);
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 'clamp(5px, 2vw, 15px)', lineHeight: '1.2' }}>
              {chunkData.words.map((w, i) => ( <span key={i} style={{ color: '#e2e8f0' }}>{w}</span> ))}
          </div>
      );
    }
  };

  const renderFeedbackText = () => {
    if (!documentData) return null;
    const { fullText, startIndex, endIndex } = documentData;
    const words = LanguageEngine.tokenize(fullText);

    return (
      <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', lineHeight: '1.8', textAlign: 'justify', padding: 'clamp(10px, 3vw, 20px)', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
        {words.map((w, i) => {
          const isAnomaly = i >= startIndex && i <= endIndex;
          const isPlayerStop = i === currentIndex; 

          return (
            <span key={i}>
              <span style={{ 
                color: isAnomaly ? '#ff0055' : 'inherit', 
                background: isAnomaly ? 'rgba(255,0,85,0.15)' : 'transparent',
                borderBottom: isPlayerStop ? '3px solid #00f2ff' : 'none',
                fontWeight: isAnomaly ? 'bold' : 'normal',
                padding: '2px', borderRadius: '4px',
                transition: '0.3s'
              }}>
                {w}
              </span>{' '}
            </span>
          );
        })}
      </p>
    );
  };

  /* ============================================================
     DOM MOUNT (ESTRICTAMENTE MOBILE-FIRST LAYOUT)
  ============================================================ */
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Orbitron', system-ui, sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        
        /* Mobile First Buttons */
        .cyber-button { background: #00f2ff; color: #000; font-weight: 900; border: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; touch-action: manipulation; -webkit-tap-highlight-color: transparent;}
        .cyber-button:active:not(:disabled) { transform: scale(0.95); box-shadow: 0 0 20px rgba(0,242,255,0.8); }
        .cyber-button:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; }
        
        .mode-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid #334155; padding: clamp(12px, 3vw, 15px); border-radius: 12px; cursor: pointer; transition: 0.2s; font-weight: bold; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
        .mode-btn.active { background: rgba(0,242,255,0.2); color: #00f2ff; border-color: #00f2ff; box-shadow: inset 0 0 15px rgba(0,242,255,0.2); }
        
        /* Custom Mobile Range Slider */
        input[type=range] { -webkit-appearance: none; background: rgba(255,255,255,0.1); border-radius: 5px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 24px; width: 24px; border-radius: 50%; background: #00f2ff; cursor: pointer; box-shadow: 0 0 15px #00f2ff; }
        
        .glitch-anim { animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
        
        .countdown-anim { animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        
        .tension-bar { height: 100%; background: #ff0055; transition: width 0.1s linear; box-shadow: 0 0 15px #ff0055; }
      `}</style>
      
      {/* 🚀 KERNEL 3D BACKGROUND */}
      <BackgroundEngine />

      {/* 🚀 HEADER GLOBAL (Optimizado para Notch) */}
      <div className="glass-panel" style={{ padding: 'clamp(10px, 2vh, 20px) clamp(15px, 4vw, 30px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,242,255,0.15)', zIndex: 10, paddingTop: 'calc(10px + env(safe-area-inset-top))' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 10px rgba(0,242,255,0.5)' }}>
            <i className="fas fa-bolt me-2"></i>BABEL
          </h1>
          <div style={{ color: '#94a3b8', fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', marginTop: '4px', display: 'flex', gap: '10px', fontWeight: 'bold' }}>
            <span style={{background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px'}}>{UI.level}: <span style={{color:'#fff'}}>{level}</span></span>
            <span style={{background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px'}}>{UI.streak}: <span style={{color:'#ffea00'}}>{streak}</span></span>
          </div>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.5)', padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(0,242,255,0.2)' }}>
          <div style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: '900', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.4)', lineHeight: '1' }}>{score}</div>
          <div style={{ color: '#00f2ff', fontSize: '0.65rem', letterSpacing: '1px' }}>{UI.score}</div>
        </div>
      </div>

      {/* 🚀 FASE 0: SETUP (UI TÁCTIL) */}
      {gameState === 'SETUP' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '15px', overflowY: 'auto' }}>
          <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', borderRadius: '24px', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
             <h2 style={{ color: '#00f2ff', margin: '0 0 10px 0', letterSpacing: '2px', fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>{UI.subtitle}</h2>
             <p style={{ color: '#94a3b8', fontSize: 'clamp(0.85rem, 3vw, 1rem)', lineHeight: '1.6', marginBottom: '25px', padding: '0 10px' }}>{UI.sysMsg}</p>
             
             {/* SELECTOR DE TEMAS GRID (MASIVO) */}
             <div style={{ marginBottom: '25px', textAlign: 'left' }}>
                <label style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>{UI.topicReq}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
                   {Object.entries(UI.topics).map(([key, label]) => (
                     <button key={key} className={`mode-btn ${currentTopic === key ? 'active' : ''}`} onClick={() => {CyberAudio.playHover(); setSetup({ currentTopic: key })}}>
                       {label}
                     </button>
                   ))}
                </div>
             </div>

             {/* MODO DE LECTURA (APEX ADDITION) */}
             <div style={{ marginBottom: '25px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} style={{flex:1}} onClick={() => {CyberAudio.playHover(); setSetup({ readMode: 'ORP' })}}>{UI.modeORP}</button>
                <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} style={{flex:1}} onClick={() => {CyberAudio.playHover(); setSetup({ readMode: 'BIONIC' })}}>{UI.modeBionic}</button>
                <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} style={{flex:1}} onClick={() => {CyberAudio.playHover(); setSetup({ readMode: 'CHUNK' })}}>{UI.modeChunk}</button>
             </div>

             {/* VELOCIDAD WPM (THUMB-FRIENDLY SLIDER) */}
             <div style={{ marginBottom: '40px', textAlign: 'left', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <label style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{UI.wpmLabel}</span>
                  <span style={{color: '#00f2ff', fontSize: '1.4rem', fontWeight: '900', textShadow: '0 0 10px rgba(0,242,255,0.5)'}}>{wpm}</span>
                </label>
                <input type="range" min="300" max="1500" step="50" value={wpm} onChange={(e) => setSetup({ wpm: Number(e.target.value) })} style={{ width: '100%', height: '8px', marginTop: '15px' }} />
             </div>

             <button onClick={() => {CyberAudio.playClick(); startMission();}} className="cyber-button" style={{ width: '100%', padding: '22px', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', borderRadius: '16px', boxShadow: '0 10px 20px rgba(0,242,255,0.2)' }}>
                {UI.start} <i className="fas fa-space-shuttle ms-2"></i>
             </button>
          </div>
        </div>
      )}

      {/* 🚀 FASE 1: SYNTHESIZING (GLITCH EFFECT) */}
      {gameState === 'SYNTHESIZING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="glitch-anim" style={{ textAlign: 'center', color: '#00f2ff' }}>
            <i className="fas fa-network-wired fa-4x mb-4" style={{ filter: 'drop-shadow(0 0 20px #00f2ff)' }}></i>
            <h2 style={{ letterSpacing: 'clamp(2px, 4vw, 5px)', fontWeight: '900', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>{UI.synthesizing}</h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{UI.analyzing}</p>
          </div>
        </div>
      )}

      {/* 🚀 FASE 2: PREPARANDO LECTURA (COUNTDOWN) */}
      {gameState === 'PREPARING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           <div className="countdown-anim" style={{ fontSize: 'clamp(120px, 25vw, 200px)', fontWeight: '900', color: '#00f2ff', textShadow: '0 0 60px rgba(0,242,255,0.8)' }}>
             {countdown}
           </div>
        </div>
      )}

      {/* 🚀 FASE 3: LECTURA DE COMBATE (RSVP ACTIVO) */}
      {gameState === 'READING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* BARRA DE PROGRESO DE TEXTO */}
          <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)' }}>
             <div className="tension-bar" style={{ width: `${(currentIndex / tokens.length) * 100}%` }}></div>
          </div>

          {/* INDICADOR DE TÓPICO Y PROGRESO NUMÉRICO */}
          <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 'clamp(0.8rem, 3vw, 1rem)' }}>
            <span style={{ fontWeight: 'bold' }}><i className="fas fa-book-open me-2"></i>{UI.topics[currentTopic]}</span>
            <span style={{ color: '#00f2ff', fontFamily: 'monospace', fontWeight: 'bold' }}>{currentIndex} / {tokens.length}</span>
          </div>

          {/* ÁREA DE PROYECCIÓN DE TEXTO (SCALABLE PARA MÓVILES) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* Guías visuales para el modo ORP */}
            {readMode === 'ORP' && (
               <>
                 <div style={{ position: 'absolute', top: '50%', left: '5vw', right: '5vw', height: '1px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>
                 <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: '50%', width: '1px', background: 'rgba(0,242,255,0.1)', pointerEvents: 'none' }}></div>
               </>
            )}
            
            <div style={{ 
              fontSize: readMode === 'CHUNK' ? 'clamp(2rem, 6vw, 4rem)' : 'clamp(2.5rem, 8vw, 6rem)', 
              fontFamily: "'Lora', 'Georgia', serif", width: '100%', maxWidth: '1200px', padding: '0 10px', textAlign: 'center',
              lineHeight: '1.2'
            }}>
              {renderReadingContent()}
            </div>
          </div>

          {/* BOTÓN MASIVO DE INTERRUPCIÓN (THUMB ZONE - MOBILE FIRST) */}
          <div style={{ padding: '15px', paddingBottom: 'calc(15px + env(safe-area-inset-bottom))', zIndex: 10, background: 'linear-gradient(to top, rgba(2,6,23,1), transparent)' }}>
            <button 
              onClick={(e) => { e.preventDefault(); handleInterrupt(); }}
              style={{ 
                width: '100%', height: 'clamp(100px, 18vh, 160px)', background: 'rgba(255,0,85,0.15)', 
                border: '3px solid #ff0055', color: '#ff0055', borderRadius: '24px', fontSize: 'clamp(1.3rem, 5vw, 2rem)', 
                fontWeight: '900', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 10px 30px rgba(255,0,85,0.3), inset 0 0 20px rgba(255,0,85,0.2)', textTransform: 'uppercase', letterSpacing: '2px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}
              onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.96)'; e.currentTarget.style.background = '#ff0055'; e.currentTarget.style.color = '#fff'; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,0,85,0.15)'; e.currentTarget.style.color = '#ff0055'; }}
            >
              <i className="fas fa-hand-paper fa-2x"></i>
              <span>{UI.interruptBtn}</span>
            </button>
          </div>
        </div>
      )}

      {/* 🚀 FASE 4: FEEDBACK POST-MORTEM (ANÁLISIS FORENSE) */}
      {gameState === 'FEEDBACK' && documentData && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(15px, 4vh, 40px) clamp(10px, 4vw, 30px)', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          
          <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', borderRadius: '24px', borderTop: `5px solid ${feedbackState === 'HIT' ? '#00ff88' : '#ff0055'}`, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
             
             <h2 style={{ color: feedbackState === 'HIT' ? '#00ff88' : '#ff0055', margin: '0 0 25px 0', fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', textAlign: 'center', textShadow: `0 0 20px ${feedbackState === 'HIT' ? '#00ff88' : '#ff0055'}`, fontWeight: '900' }}>
                {feedbackState === 'HIT' && <><i className="fas fa-shield-check me-3"></i>{UI.resultHit}</>}
                {feedbackState === 'FALSE_POSITIVE' && <><i className="fas fa-exclamation-triangle me-3"></i>{UI.resultFalsePos}</>}
                {feedbackState === 'MISSED' && <><i className="fas fa-eye-slash me-3"></i>{UI.resultMiss}</>}
             </h2>

             {/* TEXTO CON LA ANOMALÍA SUBRAYADA */}
             {renderFeedbackText()}

             {/* EXPLICACIÓN DE LA IA */}
             <div style={{ marginTop: '30px', background: 'rgba(0,0,0,0.6)', borderLeft: '4px solid #00f2ff', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#00f2ff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}><i className="fas fa-robot me-2"></i>{UI.aiAnalysis}</h4>
                <p style={{ color: '#e2e8f0', lineHeight: '1.7', margin: 0, fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>{documentData.explanation}</p>
             </div>

             {/* CONTROLES DE NAVEGACIÓN MOBILE FIRST */}
             <div style={{ display: 'flex', gap: '15px', marginTop: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { CyberAudio.playClick(); TTS.stop(); setGameState('SETUP'); }} className="mode-btn" style={{ flex: '1 1 140px', padding: '18px', fontSize: '1rem', background: 'rgba(0,0,0,0.5)' }}>
                  <i className="fas fa-cog me-2"></i> AJUSTAR WPM
                </button>
                <button onClick={() => { CyberAudio.playClick(); TTS.stop(); nextRound(); }} className="cyber-button" style={{ flex: '2 1 200px', padding: '18px', borderRadius: '14px', fontSize: '1.1rem' }}>
                  {UI.next} <i className="fas fa-arrow-right ms-3"></i>
                </button>
             </div>

          </div>
        </div>
      )}

    </div>
  );
}