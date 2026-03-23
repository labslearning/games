import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { create } from 'zustand';
import { useGameStore } from '../../../store/useGameStore'; // Ajuste la ruta según su arquitectura

/* ============================================================
   🌌 KERNEL CONFIG: RED TEAMING AI (DEEPSEEK)
============================================================ */
const DEEPSEEK_API_KEY = "sk-9c7336f2ef7e4630b2bcef83a6994c57";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (COLLIDER KERNEL)
============================================================ */
const BASE_LEXICON = {
  es: {
    title: "COLISIONADOR DE CONCEPTOS", subtitle: "SINGULARIDAD CREATIVA",
    instructions: "El sistema inyectará dos dominios de conocimiento aislados. Tienes 90 segundos para escribir una teoría, analogía o sistema que conecte ambos de forma lógica e innovadora.",
    startBtn: "INICIAR COLISIÓN", submitBtn: "SINTETIZAR ENLACE",
    evaluating: "ANALIZANDO DIVERGENCIA SINÁPTICA...",
    score: "ÍNDICE DE SINGULARIDAD", coherence: "COHERENCIA", originality: "ORIGINALIDAD",
    placeholder: "Establece el enlace conceptual aquí. La genialidad fluye en la velocidad...",
    timeOut: "COLAPSO TEMPORAL. ENVIANDO TELEMETRÍA.",
    aiFeedback: "ANÁLISIS FORENSE DE CREATIVIDAD", nextBtn: "NUEVA COLISIÓN",
    cpmLabel: "VELOCIDAD DE IDEACIÓN (CPM)"
  },
  en: {
    title: "CONCEPT COLLIDER", subtitle: "CREATIVE SINGULARITY",
    instructions: "The system will inject two isolated knowledge domains. You have 90 seconds to write a theory, analogy, or system that logically and innovatively connects them.",
    startBtn: "INITIATE COLLISION", submitBtn: "SYNTHESIZE LINK",
    evaluating: "ANALYZING SYNAPTIC DIVERGENCE...",
    score: "SINGULARITY INDEX", coherence: "COHERENCE", originality: "ORIGINALITY",
    placeholder: "Establish the conceptual link here. Genius flows in velocity...",
    timeOut: "TEMPORAL COLLAPSE. TRANSMITTING TELEMETRY.",
    aiFeedback: "FORENSIC CREATIVITY ANALYSIS", nextBtn: "NEW COLLISION",
    cpmLabel: "IDEATION VELOCITY (CPM)"
  }
};
// Fallback Proxy para soportar todos los idiomas inyectados en el ecosistema
const getLexicon = (lang) => BASE_LEXICON[lang] || BASE_LEXICON.en;

/* ============================================================
   🔊 AUDIO ENGINE: ZERO-LATENCY HAPTICS & SYNTHS
============================================================ */
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

const playColliderAudio = (type) => {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    
    if (type === 'charge') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 2.5);
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 1.5);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.5);
      osc.start(); osc.stop(audioCtx.currentTime + 2.5);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
      osc.start(); osc.stop(audioCtx.currentTime + 0.6);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.start(); osc.stop(audioCtx.currentTime + 0.05);
    }
  } catch (e) {}
};

const playKeystrokeAudio = () => {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'square';
    // Frecuencia variable para dar sensación analógica/mecánica
    osc.frequency.setValueAtTime(120 + Math.random() * 60, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.02);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(); osc.stop(audioCtx.currentTime + 0.02);
  } catch (e) {}
};

/* ============================================================
   🗄️ BASE DE DATOS DE CONCEPTOS DISTANTES (UNIT 8200)
============================================================ */
const CONCEPT_PAIRS = [
  { es: ["Termodinámica", "Marketing Digital"], en: ["Thermodynamics", "Digital Marketing"] },
  { es: ["Microbiología Celular", "Criptografía RSA"], en: ["Cellular Microbiology", "RSA Cryptography"] },
  { es: ["Arquitectura Gótica", "Redes Neuronales"], en: ["Gothic Architecture", "Neural Networks"] },
  { es: ["Jazz Improvisado", "Mecánica Cuántica"], en: ["Improvised Jazz", "Quantum Mechanics"] },
  { es: ["Agricultura Sintrópica", "Ingeniería Aeroespacial"], en: ["Syntropic Agriculture", "Aerospace Engineering"] },
  { es: ["Estoicismo", "Sistemas Distribuidos"], en: ["Stoicism", "Distributed Systems"] },
  { es: ["Poesía Haiku", "Programación Orientada a Objetos"], en: ["Haiku Poetry", "Object-Oriented Programming"] },
  { es: ["Placas Tectónicas", "Economía del Comportamiento"], en: ["Tectonic Plates", "Behavioral Economics"] },
  { es: ["Física de Fluidos", "Teoría del Caos"], en: ["Fluid Physics", "Chaos Theory"] },
  { es: ["Evolución Darwiniana", "Desarrollo Ágil de Software"], en: ["Darwinian Evolution", "Agile Software Development"] }
];

/* ============================================================
   🧠 ZUSTAND STORE: MOTOR DE ESTADO CREATIVO (COMPLEJIDAD O(1))
============================================================ */
const useColliderStore = create((set, get) => ({
  gameState: 'IDLE', // IDLE, COLLIDING, WRITING, EVALUATING, RESULT
  concepts: { a: '', b: '' },
  userInput: '',
  timeLeft: 90,
  evaluation: null, 
  cpm: 0, 

  initiateCollision: (lang) => {
    // Desbloqueo forzado de política de Autoplay de Audio
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    playColliderAudio('charge');
    
    // Selección criptográfica aleatoria de conceptos
    const pairIndex = Math.floor(Math.random() * CONCEPT_PAIRS.length);
    const langKey = lang === 'es' ? 'es' : 'en';
    const pair = CONCEPT_PAIRS[pairIndex][langKey];
    
    set({ gameState: 'COLLIDING', concepts: { a: pair[0], b: pair[1] }, userInput: '', evaluation: null, timeLeft: 90, cpm: 0 });
    
    // Transición de estado tras la animación de carga/choque de partículas
    setTimeout(() => {
      set({ gameState: 'WRITING' });
    }, 2500); 
  },

  updateInput: (text) => {
    playKeystrokeAudio();
    set({ userInput: text });
  },
  
  tickTimer: () => set(state => {
    if (state.gameState !== 'WRITING') return state;
    
    // Tensión auditiva en los últimos 15 segundos
    if (state.timeLeft <= 15 && state.timeLeft > 0) playColliderAudio('tick');

    // Muerte Súbita (Time Out)
    if (state.timeLeft <= 1) {
      setTimeout(() => get().submitSynthesis(state.concepts, state.userInput, 'es'), 100);
      return { timeLeft: 0 };
    }
    
    // Cálculo Heurístico de CPM (Caracteres por minuto en tiempo real)
    const timeElapsed = 90 - state.timeLeft;
    const currentCpm = timeElapsed > 0 ? Math.round((state.userInput.length / timeElapsed) * 60) : 0;

    return { timeLeft: state.timeLeft - 1, cpm: currentCpm };
  }),

  submitSynthesis: async (concepts, text, lang) => {
    if (get().gameState === 'EVALUATING') return;
    set({ gameState: 'EVALUATING' });
    const result = await evaluateCreativity(concepts, text, lang);
    playColliderAudio('success');
    set({ gameState: 'RESULT', evaluation: result });
  },

  reset: () => set({ gameState: 'IDLE', userInput: '', evaluation: null, cpm: 0 })
}));

/* ============================================================
   🤖 KERNEL AI: EVALUADOR ASÍNCRONO CON ABORT CONTROLLER Y FALLBACK
============================================================ */
const evaluateCreativity = async (concepts, userText, langCode) => {
  // Filtro rápido de baja densidad
  if (userText.trim().length < 40) {
    return { 
      score: 15, coherence: 10, originality: 20, 
      feedback: langCode === 'es' ? "Fallo catastrófico de enlace. No hay suficiente densidad semántica para establecer un modelo lógico. El concepto requiere mayor profundidad exploratoria." : "Catastrophic link failure. Not enough semantic density to establish a logical model." 
    };
  }

  const sysPrompt = `
    Eres 'Singularity', un Evaluador de Pensamiento Divergente de nivel Unit 8200.
    El usuario debe conectar dos conceptos inconexos de forma lógica e innovadora.
    Concepto A: "${concepts.a}"
    Concepto B: "${concepts.b}"
    Texto del usuario: "${userText}"
    Idioma de respuesta: ${langCode}.

    Evalúa rigurosamente (escala 0-100):
    1. coherence: ¿Tiene sentido lógico la analogía o el sistema propuesto? ¿Es técnicamente viable o solo palabrería?
    2. originality: ¿Es una idea brillante, lateral e inesperada?
    3. score: Promedio ponderado (Originalidad 60%, Coherencia 40%).

    RESPONDE ESTRICTAMENTE EN ESTE FORMATO JSON EXACTO (SIN ETIQUETAS MARKDOWN):
    {
      "score": 85,
      "coherence": 80,
      "originality": 90,
      "feedback": "Análisis forense de la conexión. Sé directo, frío y constructivo. Máximo 3 oraciones."
    }
  `;

  // GOD TIER: Prevención de Web Hanging mediante AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s Máximo de espera

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7 })
    });
    clearTimeout(timeoutId);
    
    const data = await res.json();
    const jsonMatch = data.choices[0].message.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON Parse Fail");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    clearTimeout(timeoutId);
    // 🛡️ FALLBACK DETERMINISTA: Si la API de IA falla o el usuario no tiene internet, 
    // calculamos un score matemático basado en la densidad y variedad léxica para no romper la UX.
    const words = userText.trim().split(/\s+/);
    const uniqueWords = new Set(words).size;
    const lexicalRichness = (uniqueWords / words.length) * 100;
    const baseScore = Math.min(Math.floor(userText.length / 6) + (lexicalRichness * 0.3), 88); 
    
    return { 
      score: Math.round(baseScore), coherence: Math.round(baseScore - 5), originality: Math.round(baseScore + 8), 
      feedback: langCode === 'es' ? "Enlace cuántico inestable. Conexión al servidor principal perdida. Evaluación local heurística aplicada basada en densidad léxica y entropía de caracteres." : "Quantum link unstable. Local heuristic evaluation applied based on lexical density." 
    };
  }
};

/* ============================================================
   ✨ MOTOR FÍSICO 4K: GRAVEDAD, PARTÍCULAS Y METABALLS (CANVAS)
============================================================ */
const ParticleAccelerator = ({ gameState, concepts, timeLeft }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animId;
    let particles = [];

    // GOD TIER: Retina Display Scaling (Evita bordes borrosos en móviles/MacBooks)
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', resize);
    resize();

    // Clase constructora de polvo orbital
    class Dust {
      constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        this.vx = (Math.random() - 0.5) * 2.5; 
        this.vy = (Math.random() - 0.5) * 2.5;
        this.life = 1; 
        this.decay = Math.random() * 0.02 + 0.015;
      }
      update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
      draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 1.5, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
    const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
    let cx = logicalWidth / 2;
    let cy = logicalHeight / 2;
    let angle = 0;
    
    // Físicas de Órbita
    let distance = gameState === 'IDLE' ? 120 : (gameState === 'COLLIDING' ? 120 : 0);
    let pulsePhase = 0;

    const animate = () => {
      // Blur trail effect para simular persistencia retiniana / velocidad
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)';
      ctx.fillRect(0, 0, logicalWidth, logicalHeight);

      // Máquina de estados físicos
      if (gameState === 'COLLIDING') {
        distance = Math.max(0, distance - 0.9); // Decaimiento orbital hacia el centro
        angle += 0.15; // Aceleración centrípeta
      } else if (gameState === 'WRITING' || gameState === 'EVALUATING') {
        distance = 0; // Singularidad central
        angle += 0.05; // Rotación remanente
        pulsePhase += (timeLeft < 15 ? 0.25 : 0.08); // Latido de presión temporal
      } else {
        angle += 0.015; // Órbita de reposo
      }

      const pulseScale = gameState === 'WRITING' ? 1 + Math.sin(pulsePhase) * 0.12 : 1;
      const x1 = cx + Math.cos(angle) * distance;
      const y1 = cy + Math.sin(angle) * distance;
      const x2 = cx + Math.cos(angle + Math.PI) * distance;
      const y2 = cy + Math.sin(angle + Math.PI) * distance;

      // Inyección de Partículas (Polvo de disco de acreción)
      if (gameState !== 'WRITING' && gameState !== 'EVALUATING') {
        if (Math.random() > 0.4) particles.push(new Dust(x1, y1, '#00f2ff'));
        if (Math.random() > 0.4) particles.push(new Dust(x2, y2, '#ff0055'));
      }
      
      particles = particles.filter(p => p.life > 0);
      particles.forEach(p => { p.update(); p.draw(ctx); });

      // GOD TIER: Efecto Metaball (Screen Blending + Radial Gradients)
      ctx.globalCompositeOperation = 'screen';

      const drawNode = (x, y, coreRadius, glowRadius, colorCenter, colorEdge) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius * pulseScale);
        grad.addColorStop(0, colorCenter); 
        grad.addColorStop(0.3, colorEdge); 
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(x, y, glowRadius * pulseScale, 0, Math.PI * 2); ctx.fill();
        
        ctx.fillStyle = '#ffffff'; // Núcleo caliente incandescente
        ctx.beginPath(); ctx.arc(x, y, coreRadius, 0, Math.PI * 2); ctx.fill();
      };

      drawNode(x1, y1, gameState==='WRITING'?5:3, gameState==='WRITING'?110:70, 'rgba(0, 242, 255, 1)', 'rgba(0, 242, 255, 0.3)');
      drawNode(x2, y2, gameState==='WRITING'?5:3, gameState==='WRITING'?110:70, 'rgba(255, 0, 85, 1)', 'rgba(255, 0, 85, 0.3)');

      ctx.globalCompositeOperation = 'source-over';

      // Vector de enlace cuántico (Conexión visible en Idle/Colliding)
      if (gameState === 'IDLE' || gameState === 'COLLIDING') {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0.1, distance / 120 * 0.4)})`;
        ctx.lineWidth = 1; ctx.stroke();
      }

      // Proyección de Etiquetas Tipográficas en Canvas
      if (gameState !== 'WRITING' && gameState !== 'EVALUATING' && concepts.a) {
        ctx.font = "800 13px 'Orbitron', system-ui, sans-serif"; 
        ctx.fillStyle = "#ffffff"; 
        ctx.textAlign = "center";
        ctx.fillText(concepts.a.toUpperCase(), x1, y1 - 40);
        ctx.fillText(concepts.b.toUpperCase(), x2, y2 + 50);
      }

      animId = requestAnimationFrame(animate);
    };

    animate();
    
    // Garbage Collection Strict
    return () => { 
      window.removeEventListener('resize', resize); 
      cancelAnimationFrame(animId); 
    };
  }, [gameState, concepts, timeLeft]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }} />;
};

/* ============================================================
   🎮 MAIN INTERFACE: COLISIONADOR OS (NUCLEUS COMPONENT)
============================================================ */
export default function ColisionadorConceptos() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = BASE_LEXICON[language] ? language : 'es';
  const UI = getLexicon(safeLang);

  const { gameState, concepts, userInput, timeLeft, evaluation, cpm, initiateCollision, updateInput, tickTimer, submitSynthesis, reset } = useColliderStore();
  const timerRef = useRef(null);

  // ⏱️ TIMER LOOP PROTEGIDO
  useEffect(() => {
    if (gameState === 'WRITING') {
      timerRef.current = setInterval(() => tickTimer(), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, tickTimer]);

  const handleStart = () => initiateCollision(safeLang);
  const handleSubmit = () => submitSynthesis(concepts, userInput, safeLang);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Orbitron', system-ui, sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.05); }
        .cyber-button { background: #00f2ff; color: #000; font-weight: 900; border: none; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-transform: uppercase; font-size: clamp(1rem, 3vw, 1.2rem); padding: 20px; border-radius: 12px; cursor: pointer; width: 100%; touch-action: manipulation; -webkit-tap-highlight-color: transparent;}
        .cyber-button:hover:not(:disabled), .cyber-button:active:not(:disabled) { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,242,255,0.6); }
        .cyber-button:disabled { background: rgba(255,255,255,0.05); color: #64748b; cursor: not-allowed; border: 1px solid rgba(255,255,255,0.1); }
        
        .concept-tag { padding: 10px 20px; border-radius: 8px; font-weight: 900; font-size: clamp(0.85rem, 2.5vw, 1.1rem); letter-spacing: 1px; text-transform: uppercase; text-shadow: 0 0 10px currentColor;}
        .tag-a { background: rgba(0,242,255,0.08); border: 1px solid rgba(0,242,255,0.6); color: #00f2ff; box-shadow: 0 0 20px rgba(0,242,255,0.15); }
        .tag-b { background: rgba(255,0,85,0.08); border: 1px solid rgba(255,0,85,0.6); color: #ff0055; box-shadow: 0 0 20px rgba(255,0,85,0.15); }

        .neon-input { width: 100%; height: 100%; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 20px; color: #e2e8f0; font-family: 'Lora', Georgia, serif; font-size: clamp(1.1rem, 4vw, 1.4rem); line-height: 1.7; resize: none; outline: none; transition: all 0.3s ease; box-shadow: inset 0 0 25px rgba(0,0,0,0.8); }
        .neon-input:focus { border-color: rgba(255,234,0,0.6); box-shadow: inset 0 0 25px rgba(0,0,0,0.8), 0 0 20px rgba(255,234,0,0.15); }
        
        .glitch-anim { animation: glitch 0.3s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-3px, 3px) } 40% { transform: translate(-3px, -3px) } 60% { transform: translate(3px, 3px) } 80% { transform: translate(3px, -3px) } 100% { transform: translate(0) } }
        
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,242,255,0.3); border-radius: 10px; }
      `}</style>
      
      {/* 🚀 HEADER GLOBAL (HUD TÁCTICO) */}
      <div className="glass-panel" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, borderBottom: '1px solid rgba(0,242,255,0.2)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 15px rgba(0,242,255,0.5)' }}>
            <i className="fas fa-atom me-2"></i>{UI.title}
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '5px', letterSpacing: '1px', fontWeight: 'bold' }}>{UI.subtitle}</div>
        </div>
        {(gameState === 'WRITING' || gameState === 'EVALUATING') && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', fontWeight: '900', color: timeLeft < 15 ? '#ff0055' : '#fff', animation: timeLeft < 15 ? 'pulse 1s infinite' : 'none', textShadow: timeLeft < 15 ? '0 0 20px #ff0055' : '0 0 10px rgba(255,255,255,0.3)' }}>
              00:{timeLeft.toString().padStart(2, '0')}
            </div>
            <div style={{ color: '#ffea00', fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>TIMELINE</div>
          </div>
        )}
      </div>

      {/* 🚀 ACELERADOR DE PARTÍCULAS (PHYSICS BACKGROUND) */}
      <div style={{ position: 'relative', width: '100%', height: gameState === 'IDLE' ? '100%' : '25vh', transition: 'height 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)', borderBottom: gameState !== 'IDLE' ? '1px solid rgba(255,255,255,0.08)' : 'none', boxShadow: gameState !== 'IDLE' ? '0 10px 30px rgba(0,0,0,0.5)' : 'none' }}>
        <ParticleAccelerator gameState={gameState} concepts={concepts} timeLeft={timeLeft} />
        
        {/* PANTALLA DE INICIO - IDLE */}
        {gameState === 'IDLE' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, padding: '20px' }}>
            <div className="glass-panel" style={{ padding: 'clamp(30px, 5vw, 50px)', borderRadius: '24px', maxWidth: '600px', width: '100%', textAlign: 'center', boxShadow: '0 0 50px rgba(0,242,255,0.1)' }}>
              <i className="fas fa-brain fa-4x mb-4" style={{ color: '#ffea00', textShadow: '0 0 30px rgba(255,234,0,0.5)' }}></i>
              <h2 style={{ color: '#ffea00', marginBottom: '20px', letterSpacing: '2px', fontWeight: '900', fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}>PENSAMIENTO DIVERGENTE</h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '40px' }}>{UI.instructions}</p>
              <button onClick={handleStart} className="cyber-button">{UI.startBtn} <i className="fas fa-bolt ms-2"></i></button>
            </div>
          </div>
        )}

        {/* METRICS HUD - VELOCIDAD DE IDEACIÓN (WRITING) */}
        {gameState === 'WRITING' && (
           <div style={{ position: 'absolute', bottom: '15px', right: '20px', textAlign: 'right', zIndex: 20 }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', letterSpacing: '1.5px', fontWeight: 'bold' }}>{UI.cpmLabel}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '900', color: cpm > 200 ? '#00f2ff' : (cpm > 100 ? '#ffea00' : '#ff0055'), textShadow: `0 0 15px ${cpm > 200 ? '#00f2ff' : (cpm > 100 ? '#ffea00' : '#ff0055')}`, transition: 'color 0.3s' }}>{cpm}</div>
           </div>
        )}
      </div>

      {/* 🚀 ÁREA DE CONEXIÓN NEURONAL (ESCRITURA Y FUSIÓN) */}
      {(gameState === 'WRITING' || gameState === 'EVALUATING') && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(15px, 4vw, 30px)', zIndex: 10, animation: 'fadeIn 1s', background: 'radial-gradient(circle at center, transparent 0%, rgba(2,6,23,0.9) 100%)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
            <div className="concept-tag tag-a">{concepts.a}</div>
            <i className="fas fa-link" style={{ color: '#ffea00', fontSize: '1.2rem', opacity: 0.8, textShadow: '0 0 10px #ffea00' }}></i>
            <div className="concept-tag tag-b">{concepts.b}</div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {gameState === 'EVALUATING' ? (
               <div className="glass-panel" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderRadius: '16px', border: '2px solid rgba(0,242,255,0.4)', boxShadow: 'inset 0 0 50px rgba(0,242,255,0.1)' }}>
                 <i className="fas fa-network-wired fa-4x mb-4 glitch-anim" style={{ color: '#00f2ff', textShadow: '0 0 20px #00f2ff' }}></i>
                 <h2 className="glitch-anim" style={{ color: '#00f2ff', letterSpacing: '4px', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', textAlign: 'center', padding: '0 20px', fontWeight: '900' }}>{UI.evaluating}</h2>
               </div>
            ) : (
               <textarea 
                 className="neon-input" 
                 placeholder={UI.placeholder}
                 value={userInput}
                 onChange={(e) => updateInput(e.target.value)}
                 autoFocus
                 disabled={gameState !== 'WRITING'}
               />
            )}
          </div>
          
          {gameState === 'WRITING' && (
            <div style={{ marginTop: '25px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                 <div style={{ height: '100%', width: `${Math.min((userInput.length / 80) * 100, 100)}%`, background: userInput.length < 80 ? '#ff0055' : '#00f2ff', transition: 'width 0.2s linear', boxShadow: `0 0 15px ${userInput.length < 80 ? '#ff0055' : '#00f2ff'}` }}></div>
              </div>
              <button 
                onClick={handleSubmit} 
                className="cyber-button" 
                disabled={userInput.length < 80} 
                style={{ width: 'auto', background: userInput.length < 80 ? 'rgba(255,255,255,0.05)' : '#ffea00', color: userInput.length < 80 ? '#64748b' : '#000', boxShadow: userInput.length >= 80 ? '0 0 30px rgba(255,234,0,0.5)' : 'none', padding: '18px 40px' }}
              >
                {UI.submitBtn} <i className="fas fa-paper-plane ms-2"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🚀 FEEDBACK POST-MORTEM (EVALUACIÓN IA / JSON RESULT) */}
      {gameState === 'RESULT' && evaluation && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(15px, 4vw, 30px)', zIndex: 10, overflowY: 'auto' }}>
          <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 50px)', borderRadius: '24px', maxWidth: '800px', margin: '0 auto', width: '100%', borderTop: '4px solid #00f2ff', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            
            <h2 style={{ color: '#ffea00', textAlign: 'center', marginBottom: '35px', letterSpacing: '3px', fontWeight: '900', textShadow: '0 0 15px rgba(255,234,0,0.3)' }}>
              <i className="fas fa-poll me-3"></i>{UI.aiFeedback}
            </h2>

            {/* METRICS DASHBOARD */}
            <div style={{ display: 'flex', gap: '25px', marginBottom: '40px', flexWrap: 'wrap' }}>
               <div style={{ flex: 1, background: 'rgba(0,0,0,0.7)', padding: '25px', borderRadius: '16px', textAlign: 'center', border: '1px solid rgba(0,242,255,0.3)', boxShadow: 'inset 0 0 30px rgba(0,242,255,0.1)' }}>
                 <div style={{ color: '#00f2ff', fontSize: '0.85rem', letterSpacing: '2px', marginBottom: '15px', fontWeight: 'bold' }}>{UI.score}</div>
                 <div style={{ fontSize: '4rem', fontWeight: '900', color: '#fff', textShadow: '0 0 25px #00f2ff' }}>{evaluation.score}</div>
               </div>
               
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}><span><i className="fas fa-link me-2" style={{color:'#00f2ff'}}></i>{UI.coherence}</span> <span>{evaluation.coherence}%</span></div>
                   <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${evaluation.coherence}%`, height: '100%', background: '#00f2ff', boxShadow: '0 0 15px #00f2ff' }}></div></div>
                 </div>
                 <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}><span><i className="fas fa-lightbulb me-2" style={{color:'#ff0055'}}></i>{UI.originality}</span> <span>{evaluation.originality}%</span></div>
                   <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${evaluation.originality}%`, height: '100%', background: '#ff0055', boxShadow: '0 0 15px #ff0055' }}></div></div>
                 </div>
               </div>
            </div>

            {/* IA FEEDBACK TEXT */}
            <div style={{ background: 'rgba(0,242,255,0.05)', padding: '30px', borderRadius: '16px', borderLeft: '6px solid #00f2ff', color: '#e2e8f0', fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: '1.8', marginBottom: '40px', boxShadow: 'inset 0 0 20px rgba(0,242,255,0.05)' }}>
               {evaluation.feedback}
            </div>

            <button onClick={reset} className="cyber-button" style={{ background: 'transparent', border: '2px solid #00f2ff', color: '#00f2ff' }}>
               {UI.nextBtn} <i className="fas fa-redo ms-2"></i>
            </button>

          </div>
        </div>
      )}

    </div>
  );
}