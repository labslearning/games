import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { create } from 'zustand';
import { useGameStore } from '../../../store/useGameStore'; 

/* ============================================================
   🌌 KERNEL CONFIG: RED TEAMING AI (DEEPSEEK)
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360"; // Asegure su API Key
const DEEPSEEK_URL = "[https://api.deepseek.com/chat/completions](https://api.deepseek.com/chat/completions)";

/* ============================================================
   🎹 MOTOR DE AUDIO TÁCTICO (WEB AUDIO API - ZERO LATENCY)
============================================================ */
const CyberAudio = {
  ctx: null,
  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  },
  playClick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.1);
    } catch(e) {}
  },
  playSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        setTimeout(() => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
          osc.connect(gain); gain.connect(this.ctx.destination);
          osc.start(); osc.stop(this.ctx.currentTime + 0.3);
        }, i * 100);
      });
    } catch(e) {}
  },
  playError() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.5);
    } catch(e) {}
  },
  playAlarm() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + 0.3);
    } catch(e) {}
  }
};

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (GLOBAL SCALABILITY)
============================================================ */
const BASE_LEXICON = {
  es: {
    title: "RAVEN OS", subtitle: "Auditoría de Lógica Fluida",
    level: "NIVEL", streak: "RACHA", score: "PUNTOS",
    synthesizing: "ENCRIPTANDO MATRIZ", analyzing: "Forzando protocolo de seguridad...",
    correct: "BLOQUE DESENCRIPTADO", wrong: "INTRUSIÓN RECHAZADA", timeout: "COLAPSO TEMPORAL",
    analysis: "Análisis Estructural:", next: "Siguiente Matriz",
    vuln: "VULNERABILIDADES", spatial: "Espacial", math: "Matemática", logic: "Lógica Pura",
    timeWarning: "DEGRADACIÓN DE SEÑAL",
    sysMsg: "Encuentra el patrón antes del colapso. Selecciona la celda faltante para estabilizar la matriz."
  },
  en: {
    title: "RAVEN OS", subtitle: "Fluid Logic Audit",
    level: "LEVEL", streak: "STREAK", score: "SCORE",
    synthesizing: "ENCRYPTING MATRIX", analyzing: "Forcing security protocol...",
    correct: "BLOCK DECRYPTED", wrong: "INTRUSION REJECTED", timeout: "TIME COLLAPSE",
    analysis: "Structural Analysis:", next: "Next Matrix",
    vuln: "VULNERABILITIES", spatial: "Spatial", math: "Mathematical", logic: "Pure Logic",
    timeWarning: "SIGNAL DEGRADATION",
    sysMsg: "Find the logical pattern before collapse. Select the missing cell to stabilize the matrix."
  }
};
const getLexicon = (lang) => LEXICON[lang] || LEXICON.en || LEXICON.es;

/* ============================================================
   🎙️ MOTOR DE VOZ IA (TTS)
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
   🧠 ZUSTAND STORE: PERFIL DE VULNERABILIDADES Y LÓGICA CORE
============================================================ */
const useRavenStore = create((set, get) => ({
  level: 1,
  score: 0,
  streak: 0,
  gameState: 'BOOT', // BOOT, SYNTHESIZING, PLAYING, FEEDBACK, TIMEOUT
  weaknessProfile: { spatial: 10, mathematical: 10, logic: 10 },
  currentPuzzle: null,
  feedbackData: null, 

  updateWeakness: (type, isCorrect) => set((state) => {
    const profile = { ...state.weaknessProfile };
    const safeType = type || 'logic';
    
    // Castigo/Premio Algorítmico
    if (!isCorrect) {
      profile[safeType] = Math.min(100, profile[safeType] + 25);
    } else {
      profile[safeType] = Math.max(0, profile[safeType] - 15);
    }
    return { weaknessProfile: profile };
  }),

  setGameState: (state) => set({ gameState: state }),
  setPuzzle: (puzzle) => set({ currentPuzzle: puzzle, gameState: 'PLAYING' }),
  
  registerAnswer: (isCorrect, explanation, type, isTimeout = false, timeRemaining = 0) => set((state) => {
    if (isTimeout) {
      const profile = { ...state.weaknessProfile };
      profile.spatial = Math.min(100, profile.spatial + 10); 
      profile.mathematical = Math.min(100, profile.mathematical + 10); 
      profile.logic = Math.min(100, profile.logic + 10);
      set({ weaknessProfile: profile });
    } else {
      get().updateWeakness(type, isCorrect);
    }
    
    let newScore = state.score;
    let newLevel = state.level;
    let newStreak = state.streak;

    if (isCorrect && !isTimeout) {
      // Puntuación = Nivel * 100 + Bono de tiempo
      const timeBonus = Math.floor(timeRemaining * 5);
      newScore += (100 * state.level) + timeBonus;
      newStreak += 1;
      if (newStreak % 3 === 0) newLevel++;
    } else {
      newStreak = 0;
      // Baja de nivel si falla, para adaptar la dificultad
      newLevel = Math.max(1, newLevel - 1);
    }

    return { 
      score: newScore, 
      level: newLevel, 
      streak: newStreak, 
      feedbackData: { isCorrect, explanation, isTimeout },
      gameState: isTimeout ? 'TIMEOUT' : 'FEEDBACK'
    };
  })
}));

/* ============================================================
   🤖 ALGORITMO PROCEDIMENTAL (LLM TO JSON GOD TIER PARSER)
============================================================ */
// 5 Matrices de Fallback Extremo offline para asegurar 100% de Uptime
const FALLBACK_PUZZLES = [
  {
    ruleType: "spatial",
    matrix: [ [{"s":"■","c":"#00f2ff","n":1}, {"s":"●","c":"#00f2ff","n":1}, {"s":"▲","c":"#00f2ff","n":1}], [{"s":"■","c":"#ff0055","n":2}, {"s":"●","c":"#ff0055","n":2}, {"s":"▲","c":"#ff0055","n":2}], [{"s":"■","c":"#ffea00","n":3}, {"s":"●","c":"#ffea00","n":3}, null] ],
    options: [ {"s":"▲","c":"#ffea00","n":3}, {"s":"●","c":"#ffea00","n":2}, {"s":"■","c":"#ffea00","n":4}, {"s":"▲","c":"#00f2ff","n":3} ],
    correctIndex: 0,
    explanation: "Sistema Local: Las columnas definen la forma (Cuadrado, Círculo, Triángulo). Las filas definen el color y la cantidad."
  },
  {
    ruleType: "mathematical",
    matrix: [ [{"s":"●","c":"#ffffff","n":1}, {"s":"●","c":"#ffffff","n":2}, {"s":"●","c":"#ffffff","n":3}], [{"s":"●","c":"#00f2ff","n":2}, {"s":"●","c":"#00f2ff","n":3}, {"s":"●","c":"#00f2ff","n":5}], [{"s":"●","c":"#ff0055","n":3}, {"s":"●","c":"#ff0055","n":4}, null] ],
    options: [ {"s":"●","c":"#ff0055","n":7}, {"s":"●","c":"#ffea00","n":7}, {"s":"■","c":"#ff0055","n":6}, {"s":"●","c":"#00f2ff","n":7} ],
    correctIndex: 0,
    explanation: "Sistema Local: Matemáticas. Columna 1 + Columna 2 = Columna 3. El color se mantiene por fila."
  },
  {
    ruleType: "logic",
    matrix: [ [{"s":"✖","c":"#8b5cf6","n":2}, {"s":"◆","c":"#8b5cf6","n":2}, {"s":"★","c":"#8b5cf6","n":2}], [{"s":"✖","c":"#00ff88","n":3}, {"s":"◆","c":"#00ff88","n":3}, {"s":"★","c":"#00ff88","n":3}], [{"s":"✖","c":"#ffea00","n":4}, {"s":"◆","c":"#ffea00","n":4}, null] ],
    options: [ {"s":"★","c":"#ffea00","n":4}, {"s":"★","c":"#ffea00","n":5}, {"s":"◆","c":"#00ff88","n":4}, {"s":"✖","c":"#ffffff","n":4} ],
    correctIndex: 0,
    explanation: "Sistema Local: Secuencia horizontal de formas (Cruz, Rombo, Estrella). Cantidad y color son idénticos en la misma fila."
  }
];

const fetchNextMatrix = async (level, weaknessProfile) => {
  // Identificar la vulnerabilidad crítica
  const primaryWeakness = Object.keys(weaknessProfile).reduce((a, b) => weaknessProfile[a] > weaknessProfile[b] ? a : b);

  const sysPrompt = `
    Eres la IA Core Unit 8200. Genera un test de Matrices de Raven (3x3).
    Dificultad: ${level} (1-10). Vulnerabilidad a explotar: ${primaryWeakness}.
    
    Reglas de UI:
    - Formas "s": "■", "▲", "●", "◆", "✖", "★"
    - Colores Hex "c": "#00f2ff", "#ff0055", "#ffea00", "#8b5cf6", "#00ff88", "#ffffff"
    - Cantidad "n": 1 a 5.
    
    Estructura la lógica de forma compleja (Rotación espacial, Suma/Resta matemática de formas, XoR lógico).
    La celda matriz[2][2] debe ser 'null'. Genera 4 opciones donde una es la correcta.
    
    DEVUELVE SÓLO JSON VÁLIDO. SIN TEXTO EXTRA. FORMATO EXACTO:
    {
      "ruleType": "${primaryWeakness}",
      "matrix": [
        [{"s": "■", "c": "#ffffff", "n": 1}, {"s": "■", "c": "#ffffff", "n": 1}, {"s": "■", "c": "#ffffff", "n": 1}],
        [{"s": "■", "c": "#ffffff", "n": 1}, {"s": "■", "c": "#ffffff", "n": 1}, {"s": "■", "c": "#ffffff", "n": 1}],
        [{"s": "■", "c": "#ffffff", "n": 1}, {"s": "■", "c": "#ffffff", "n": 1}, null]
      ],
      "options": [
        {"s": "■", "c": "#ffffff", "n": 1},
        {"s": "▲", "c": "#ff0055", "n": 2},
        {"s": "●", "c": "#00f2ff", "n": 3},
        {"s": "◆", "c": "#ffea00", "n": 4}
      ],
      "correctIndex": 0,
      "explanation": "Explicación directa y táctica."
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.85 })
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const data = await res.json();
    const rawText = data.choices[0].message.content;
    
    // Extractor Robusto (Atraviesa bloque de código Markdown)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON Inválido o Ausente");
    
    let parsedData = JSON.parse(jsonMatch[0]);
    
    // Shuffle Options (Seguridad contra sesgos de posición de LLMs)
    const originalCorrect = parsedData.options[parsedData.correctIndex];
    parsedData.options.sort(() => Math.random() - 0.5);
    parsedData.correctIndex = parsedData.options.findIndex(opt => 
      opt.s === originalCorrect.s && opt.c === originalCorrect.c && opt.n === originalCorrect.n
    );
    if(parsedData.correctIndex === -1) parsedData.correctIndex = 0;

    return parsedData;

  } catch (error) {
    console.error("[UNIT 8200] Falla en Generación LLM. Desplegando Fallback Local.", error);
    // Recupera un puzzle estático aleatorio
    const fallbackBase = FALLBACK_PUZZLES[Math.floor(Math.random() * FALLBACK_PUZZLES.length)];
    const puzzle = JSON.parse(JSON.stringify(fallbackBase)); // Clon profundo
    
    // Barajar opciones localmente
    const correctOpt = puzzle.options[puzzle.correctIndex];
    puzzle.options.sort(() => Math.random() - 0.5);
    puzzle.correctIndex = puzzle.options.findIndex(opt => opt.s === correctOpt.s && opt.c === correctOpt.c && opt.n === correctOpt.n);
    if(puzzle.correctIndex === -1) puzzle.correctIndex = 0;
    
    return puzzle;
  }
};

/* ============================================================
   🎨 RENDERIZADOR HOLOGRÁFICO (DECRYPTION EFFECT)
============================================================ */
const SymbolHologram = ({ data, isUnknown, delay = 0 }) => {
  const [displayData, setDisplayData] = useState(null);
  const [decrypting, setDecrypting] = useState(true);

  // Efecto de Ciber-Desencriptación visual
  useEffect(() => {
    if (isUnknown || !data) return;
    setDecrypting(true);
    
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
    let iterations = 0;
    const maxIterations = 10;
    
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
      }, 40);
      return () => clearInterval(interval);
    }, delay); // Delay en cascada para revelar celdas en orden

    return () => clearTimeout(timeout);
  }, [data, isUnknown, delay]);

  if (isUnknown || !data) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,242,255,0.02)', border: '2px dashed rgba(0,242,255,0.3)', borderRadius: '12px' }}>
        <span className="pulse-text" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', color: '#00f2ff', textShadow: '0 0 20px rgba(0,242,255,0.8)' }}>?</span>
      </div>
    );
  }

  const renderData = decrypting && displayData ? displayData : data;

  const symbols = Array.from({ length: Math.min(renderData.n || 1, 9) }).map((_, i) => (
    <span key={i} style={{ 
      color: renderData.c, 
      textShadow: `0 0 15px ${renderData.c}`, 
      fontSize: decrypting ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(1.8rem, 4.5vw, 3rem)', 
      lineHeight: '1', margin: '2px',
      opacity: decrypting ? 0.7 : 1,
      fontFamily: decrypting ? 'monospace' : 'inherit'
    }}>
      {renderData.s}
    </span>
  ));

  return (
    <div className="hologram-cell" style={{ 
      width: '100%', height: '100%', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', alignContent: 'center',
      background: 'linear-gradient(135deg, rgba(15,23,42,0.8), rgba(2,6,23,0.9))', 
      border: `1px solid ${renderData.c}50`, borderRadius: '12px', padding: '10px',
      boxShadow: `inset 0 0 25px ${renderData.c}15, 0 8px 16px rgba(0,0,0,0.4)`
    }}>
      {symbols}
    </div>
  );
};

/* ============================================================
   🎮 MAIN INTERFACE: RAVEN OS LÓGICA FLUIDA (UNIT 8200 TIER)
============================================================ */
export default function RavenLogic() {
  const gameStore = useGameStore();
  const language = gameStore?.language || 'es';
  const UI = getLexicon(language);

  const { level, score, streak, gameState, weaknessProfile, currentPuzzle, feedbackData, setGameState, setPuzzle, registerAnswer } = useRavenStore();

  // ⏱️ Motor de Tiempo de Alta Precisión
  const [timeLeft, setTimeLeft] = useState(100);
  const requestRef = useRef();
  const startTimeRef = useRef();

  const startTimer = useCallback(() => {
    setTimeLeft(100);
    cancelAnimationFrame(requestRef.current);
    
    const durationMs = Math.max(10000, 35000 - (level * 1500)); // Tiempo base 35s, disminuye con nivel
    
    const animate = (time) => {
      if (useRavenStore.getState().gameState !== 'PLAYING') return; 
      
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.max(0, 100 - ((elapsed / durationMs) * 100));
      
      setTimeLeft(progress);

      // Efecto de alarma
      if (progress > 0 && progress < 20) {
         if (Math.random() > 0.95) CyberAudio.playAlarm(); // Sonido cardíaco errático
      }

      if (progress > 0) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        // TIMEOUT
        CyberAudio.playError();
        registerAnswer(false, "Sistema comprometido. Tiempo de resolución excedido.", currentPuzzle?.ruleType || 'logic', true, 0);
        TTS.speak(UI.timeout, language);
      }
    };
    
    startTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(animate);
  }, [level, currentPuzzle, registerAnswer, UI, language]);

  // Bucle Principal
  const generateMission = useCallback(async () => {
    cancelAnimationFrame(requestRef.current);
    setGameState('SYNTHESIZING');
    CyberAudio.playHover();
    const puzzle = await fetchNextMatrix(level, weaknessProfile);
    setPuzzle(puzzle);
    setTimeout(startTimer, 1000); // 1s para ver la animación de carga antes de que el timer baje
  }, [level, weaknessProfile, setGameState, setPuzzle, startTimer]);

  useEffect(() => {
    if (gameState === 'BOOT') generateMission();
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, generateMission]);

  // Interacción de Usuario
  const handleOptionSelect = (index) => {
    if (gameState !== 'PLAYING') return;
    cancelAnimationFrame(requestRef.current);
    CyberAudio.playClick();
    
    const isCorrect = index === currentPuzzle.correctIndex;
    registerAnswer(isCorrect, currentPuzzle.explanation, currentPuzzle.ruleType, false, timeLeft);
    
    if(isCorrect) {
      CyberAudio.playSuccess();
      TTS.speak(UI.correct, language);
    } else {
      CyberAudio.playError();
      TTS.speak(UI.wrong, language);
    }
  };

  const handleNextRound = () => {
    TTS.stop();
    CyberAudio.playClick();
    generateMission();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Orbitron', sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)', WebkitUserSelect: 'none', userSelect: 'none' }}>
      
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(0,242,255,0.15); box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
        .cyber-btn { background: rgba(0,242,255,0.1); color: #00f2ff; border: 2px solid #00f2ff; padding: 20px; border-radius: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); font-weight: 900; letter-spacing: 2px; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 12px; font-size: clamp(1.1rem, 3vw, 1.3rem); box-shadow: 0 5px 0 rgba(0,0,0,0.4); }
        .cyber-btn:active { transform: translateY(5px); box-shadow: 0 0 0 rgba(0,0,0,0.4); filter: brightness(1.3); background: #00f2ff; color: #000; }
        
        .matrix-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(8px, 2vw, 15px); width: 100%; max-width: 600px; margin: 0 auto; aspect-ratio: 1; padding: 15px; background: rgba(0,0,0,0.5); border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(12px, 3vw, 20px); width: 100%; max-width: 600px; margin: 0 auto; }
        @media (min-width: 768px) { .options-grid { grid-template-columns: repeat(4, 1fr); } }
        
        .pulse-text { animation: pulse 1s infinite alternate; }
        @keyframes pulse { from { opacity: 0.3; transform: scale(0.9); } to { opacity: 1; transform: scale(1.1); } }
        
        .glitch-anim { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-3px, 3px) } 40% { transform: translate(-3px, -3px) } 60% { transform: translate(3px, 3px) } 80% { transform: translate(3px, -3px) } 100% { transform: translate(0) } }
        
        .progress-bar-container { width: 100%; height: 8px; background: rgba(0,0,0,0.8); position: absolute; top: 0; left: 0; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .progress-bar { height: 100%; transition: width 0.1s linear; box-shadow: 0 0 20px currentColor; }
        
        .hologram-cell { transition: transform 0.2s, filter 0.2s; cursor: pointer; position: relative; overflow: hidden; }
        .hologram-cell::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 60%); opacity: 0; transition: 0.3s; transform: scale(0.5); pointer-events: none;}
        .hologram-cell:hover { transform: scale(1.05); filter: brightness(1.2); }
        .hologram-cell:hover::before { opacity: 1; transform: scale(1); }
        .hologram-cell:active { transform: scale(0.95); }

        .scanline { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,242,255,0.03) 51%, transparent 51%); background-size: 100% 4px; pointer-events: none; z-index: 1; }
      `}</style>

      <div className="scanline"></div>

      {/* 🚀 NEURO-STRESS TIMER (Barra superior reactiva) */}
      {(gameState === 'PLAYING') && (
         <div className="progress-bar-container">
            <div className="progress-bar" style={{ 
              width: `${timeLeft}%`, 
              background: timeLeft > 40 ? '#00f2ff' : timeLeft > 15 ? '#ffea00' : '#ff0055',
              color: timeLeft > 40 ? '#00f2ff' : timeLeft > 15 ? '#ffea00' : '#ff0055' 
            }}></div>
         </div>
      )}

      {/* 🚀 HEADER Y HUD TÁCTICO */}
      <div className="glass-panel" style={{ padding: 'clamp(15px, 3vh, 25px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,242,255,0.3)', zIndex: 10, position: 'relative' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.3rem, 4vw, 2rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '3px', textShadow: '0 0 15px rgba(0,242,255,0.5)' }}>
            <i className="fas fa-network-wired me-3"></i>{UI.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px', display: 'flex', gap: '15px', flexWrap: 'wrap', fontWeight: 'bold' }}>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '8px', border: '1px solid #334155'}}>{UI.level}: <strong style={{color:'#fff', fontSize: '1.1rem'}}>{level}</strong></span>
            <span style={{background: 'rgba(0,0,0,0.6)', padding: '5px 15px', borderRadius: '8px', border: '1px solid #334155'}}>{UI.streak}: <strong style={{color:'#ffea00', fontSize: '1.1rem'}}>{streak} <i className="fas fa-fire ms-1"></i></strong></span>
          </div>
        </div>
        
        {/* THREAT MAP (Vulnerabilidades Cognitivas Ocultas) */}
        <div className="d-none d-lg-flex" style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, maxWidth: '280px', margin: '0 30px', background: 'rgba(0,0,0,0.5)', padding: '12px 20px', borderRadius: '16px', border: '1px solid rgba(0,242,255,0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', textAlign: 'center', letterSpacing: '3px', fontWeight: '900', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' }}>
              <i className="fas fa-shield-alt me-2"></i>{UI.vuln}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#00f2ff', fontWeight: 'bold', textAlign: 'right'}}>{UI.spatial}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.spatial}%`, height:'100%', background: weaknessProfile.spatial > 50 ? '#ff0055' : '#00f2ff', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#ffea00', fontWeight: 'bold', textAlign: 'right'}}>{UI.math}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.mathematical}%`, height:'100%', background: weaknessProfile.mathematical > 50 ? '#ff0055' : '#ffea00', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{width: '75px', fontSize:'0.75rem', color:'#8b5cf6', fontWeight: 'bold', textAlign: 'right'}}>{UI.logic}</span>
              <div style={{flex:1, height:'6px', background:'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden'}}>
                <div style={{width:`${weaknessProfile.logic}%`, height:'100%', background: weaknessProfile.logic > 50 ? '#ff0055' : '#8b5cf6', transition:'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'}}></div>
              </div>
            </div>
        </div>

        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.6)', padding: '12px 25px', borderRadius: '16px', border: '1px solid rgba(0,242,255,0.2)', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 'clamp(1.6rem, 5vw, 2.5rem)', fontWeight: '900', color: '#fff', textShadow: '0 0 20px rgba(0,242,255,0.5)', lineHeight: '1' }}>{score}</div>
          <div style={{ color: '#00f2ff', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold' }}>{UI.score}</div>
        </div>
      </div>

      {/* 🚀 ZONA CENTRAL: MATRIZ Y HACKEO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(15px, 4vw, 30px)', overflowY: 'auto', position: 'relative', zIndex: 10 }}>
        
        {gameState === 'SYNTHESIZING' && (
          <div className="glitch-anim" style={{ textAlign: 'center', color: '#00f2ff' }}>
            <i className="fas fa-satellite-dish fa-5x mb-4" style={{ filter: 'drop-shadow(0 0 25px #00f2ff)' }}></i>
            <h2 style={{ letterSpacing: 'clamp(3px, 5vw, 8px)', fontWeight: '900', fontSize: 'clamp(1.5rem, 5vw, 2.8rem)', textShadow: '0 0 20px currentColor' }}>{UI.synthesizing}</h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontWeight: 'bold' }}>{UI.analyzing}</p>
          </div>
        )}

        {(gameState === 'PLAYING' || gameState === 'FEEDBACK' || gameState === 'TIMEOUT') && currentPuzzle && (
          <div style={{ animation: 'fadeIn 0.5s ease-out', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             
             {/* CONEXIÓN LECTURA RÁPIDA (Explicación Psicológica) */}
             <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '20px', border: '1px solid #334155', color: '#cbd5e1', fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)', textAlign: 'center', maxWidth: '700px', marginBottom: 'clamp(20px, 4vh, 35px)', fontWeight: '500', lineHeight: '1.6' }}>
                <i className="fas fa-eye me-2" style={{color: '#ffea00'}}></i> {UI.sysMsg}
             </div>

             {/* LA MATRIZ 3x3 */}
             <div className="matrix-grid mb-5">
                {currentPuzzle.matrix.flat().map((cellData, index) => (
                   <div key={`matrix-${index}`} style={{ width: '100%', height: '100%', minHeight: '80px' }}>
                     {/* Delay en cascada (index * 50ms) para el efecto de desencriptación */}
                     <SymbolHologram data={cellData} isUnknown={cellData === null} delay={index * 50} />
                   </div>
                ))}
             </div>

             {/* OPCIONES DEL JUGADOR O FEEDBACK DE LA IA */}
             {gameState === 'PLAYING' ? (
               <div className="options-grid">
                  {currentPuzzle.options.map((opt, i) => (
                     <button 
                        key={`opt-${i}`} 
                        onClick={(e) => { e.preventDefault(); handleOptionSelect(i); }}
                        onPointerEnter={() => CyberAudio.playHover()}
                        style={{ background: 'transparent', border: 'none', padding: 0, height: 'clamp(90px, 16vh, 130px)', width: '100%', outline: 'none' }}
                     >
                        {/* Sin delay para las opciones, aparecen de golpe */}
                        <SymbolHologram data={opt} delay={0} />
                     </button>
                  ))}
               </div>
             ) : (
               <div className="glass-panel" style={{ padding: 'clamp(30px, 5vw, 40px)', borderRadius: '24px', borderTop: `5px solid ${feedbackData.isCorrect ? '#00ff88' : '#ff0055'}`, width: '100%', maxWidth: '750px', textAlign: 'center', marginTop: '10px', boxShadow: `0 20px 50px rgba(0,0,0,0.9)` }}>
                  <i className={`fas ${feedbackData.isCorrect ? 'fa-unlock-alt' : 'fa-shield-virus'} fa-4x mb-4`} style={{ color: feedbackData.isCorrect ? '#00ff88' : '#ff0055', filter: 'drop-shadow(0 0 20px currentColor)' }}></i>
                  
                  <h2 style={{ color: feedbackData.isCorrect ? '#00ff88' : '#ff0055', margin: '0 0 25px 0', fontSize: 'clamp(1.6rem, 5vw, 2.6rem)', fontWeight: '900', letterSpacing: '3px', textShadow: `0 0 20px currentColor` }}>
                     {feedbackData.isTimeout ? UI.timeout : (feedbackData.isCorrect ? UI.correct : UI.wrong)}
                  </h2>
                  
                  <div style={{ color: '#f8fafc', fontSize: 'clamp(1.1rem, 3.5vw, 1.3rem)', lineHeight: '1.8', marginBottom: '35px', textAlign: 'left', background: 'rgba(0,0,0,0.7)', padding: '25px', borderRadius: '16px', borderLeft: `6px solid ${feedbackData.isCorrect ? '#00ff88' : '#ff0055'}`, boxShadow: 'inset 0 0 15px rgba(0,0,0,0.5)' }}>
                    <strong style={{color: '#00f2ff', display: 'block', marginBottom: '15px', fontSize: '1.2rem', letterSpacing: '2px'}}><i className="fas fa-terminal me-3"></i>{UI.analysis}</strong>
                    <div style={{fontWeight: '500'}}>{feedbackData.explanation}</div>
                  </div>
                  
                  <button className="cyber-btn" onClick={handleNextRound} onPointerEnter={() => CyberAudio.playHover()} style={{ width: '100%', padding: '25px', borderRadius: '16px' }}>
                     {UI.next} <i className="fas fa-forward ms-3"></i>
                  </button>
               </div>
             )}

          </div>
        )}
      </div>

    </div>
  );
}