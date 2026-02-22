import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Html, Line, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   📱 HOOK DE RESPONSIVIDAD 3D (MOBILE FIRST)
============================================================ */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

/* ============================================================
   🛡️ 1. ESCUDO ANTI-CRASH (ERROR BOUNDARY)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("GameErrorBoundary:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#200', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', zIndex: 9999 }}>
          <h1 style={{ color: '#f00', fontSize: '40px', textAlign: 'center' }}>⚠️ ERROR CRÍTICO DEL SISTEMA</h1>
          <p style={{ fontSize: '20px', maxWidth: '80%', textAlign: 'center', margin: '20px 0' }}>{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '15px 30px', fontSize: '20px', background: '#f00', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '10px' }}>REINICIAR MÓDULO</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR QUÍMICO PURO (MASAS Y CARGAS SEPARADAS)
============================================================ */
class RedoxEngine {
  static validateMass(userH2O, userH, userOH, levelData) {
    if (!levelData) return false;
    const expectedH2O = levelData.ansH2O || 0;
    const expectedH = levelData.ansH || 0;
    const expectedOH = levelData.ansOH || 0;
    return (userH2O === expectedH2O) && (userH === expectedH) && (userOH === expectedOH);
  }

  static validateCharge(userCoef1, userCoef2, levelData) {
    if (!levelData) return { isBalanced: false, errorType: "ERROR" };
    
    const eLostTotal = userCoef1 * (levelData.eOx || 1);
    const eGainedTotal = userCoef2 * (levelData.eRed || 1);
    const isChargeBalanced = eLostTotal === eGainedTotal;
    
    const targetMCM = this.getMCM(levelData.eOx, levelData.eRed);
    const expectedCoef1 = targetMCM / (levelData.eOx || 1);
    const expectedCoef2 = targetMCM / (levelData.eRed || 1);
    
    const isSimplified = userCoef1 === expectedCoef1 && userCoef2 === expectedCoef2;
    const isBalanced = isChargeBalanced && isSimplified;

    let errorType = "NONE";
    if (!isBalanced) {
      if (eLostTotal !== eGainedTotal) {
          errorType = eLostTotal > eGainedTotal ? "EXCESS_LOST" : "DEFICIT_LOST";
      } else if (!isSimplified) {
          errorType = "NOT_SIMPLIFIED"; 
      }
    }
    return { isBalanced, eLostTotal, eGainedTotal, eDiff: Math.abs(eLostTotal - eGainedTotal), errorType };
  }

  static getMCM(a, b) {
    if (!a || !b) return 1;
    const gcd = (x, y) => (!y ? x : gcd(y, x % y));
    return (a * b) / gcd(a, b);
  }

  static getMassBalanceGuide(env, langDict) {
    if (env === "Ácido") return langDict?.guideAcid || "Medio Ácido: \n1. Iguala O con H₂O.\n2. Iguala H con H⁺.";
    if (env === "Básico") return langDict?.guideBasic || "Medio Básico: \n1. Iguala O con H₂O.\n2. Iguala H con H₂O y añade OH⁻.";
    return langDict?.guideNeutral || "Medio Neutro: \nLos átomos ya están balanceados en este nivel.";
  }

  static parseMolecule(formula) {
    if (!formula) return [];
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    const atoms = [];
    while ((match = regex.exec(formula)) !== null) {
      atoms.push({ symbol: match[1], count: parseInt(match[2] || "1") });
    }
    return atoms;
  }

  static getAtomColor(symbol) {
    const CPK = { O: '#ff0000', H: '#ffffff', C: '#444444', N: '#0000ff', S: '#ffff00', Cl: '#00ff00', Mn: '#8a2be2', Cr: '#ff8800', Cu: '#d2691e', Fe: '#ffa500', Zn: '#708090', Ag: '#c0c0c0', Pb: '#404040', P: '#ff00ff', Bi: '#98fb98', I: '#9400d3' };
    return CPK[symbol] || '#00f2ff';
  }
}

/* ============================================================
   🔊 3. MOTOR DE AUDIO SCI-FI Y VOZ
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; }
  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.gain.value = 0.4;
        this.gainNode.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol, type2 = 'sine', detune = 0) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(); const osc2 = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.connect(gain); osc2.connect(gain); gain.connect(this.gainNode);
      osc.type = type; osc2.type = type2;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      osc2.frequency.setValueAtTime(fStart * 1.5, this.ctx.currentTime); osc.detune.setValueAtTime(detune, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc2.start(); osc.stop(this.ctx.currentTime + dur); osc2.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 800, 400, 0.1, 0.15, 'triangle', -100); }
  verify() { this._play('triangle', 400, 1200, 0.4, 0.2, 'sawtooth', 200); }
  success() { this._play('sine', 440, 880, 0.5, 0.25, 'square', 100); setTimeout(() => this._play('square', 880, 1760, 0.6, 0.2, 'sine', -200), 100); }
  error() { this._play('sawtooth', 150, 40, 0.8, 0.4, 'noise', 300); }
  aiPop() { this._play('triangle', 200, 800, 0.4, 0.2, 'sine', 150); }
  transfer() { this._play('noise', 2000, 100, 1.8, 0.35, 'sawtooth', -400); }
  levelUp() { this._play('sine', 400, 2000, 1.2, 0.4, 'triangle', 250); }
  explosion() { this._play('sawtooth', 800, 20, 1.0, 0.6, 'noise', 500); }
  scan() { this._play('square', 1000, 2000, 0.3, 0.1, 'sine'); }
}
const sfx = new QuantumAudio();

let globalUtterance = null;
const triggerVoice = (text, langCode) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); 
  if (!text) return;
  const pureText = text.replace(/<[^>]*>?/gm, ''); 
  setTimeout(() => {
    try {
      globalUtterance = new SpeechSynthesisUtterance(pureText);
      globalUtterance.lang = langCode || 'es-ES'; 
      globalUtterance.rate = 1.05; 
      globalUtterance.pitch = 1.0;
      globalUtterance.onend = () => { globalUtterance = null; };
      globalUtterance.onerror = () => { window.speechSynthesis.cancel(); globalUtterance = null; };
      window.speechSynthesis.speak(globalUtterance);
    } catch (e) { }
  }, 50);
};

/* ============================================================
   🌍 4. BASE DE DATOS QUÍMICA INTEGRAL (20 NIVELES GLOBALES)
============================================================ */
const CHEM_DB = [
  { eq: "Zn + Cu²⁺ ➔ Zn²⁺ + Cu", hOx: "Zn ➔ Zn²⁺ + 2e⁻", hRed: "Cu²⁺ + 2e⁻ ➔ Cu", eOx: 2, eRed: 2, symOx: "Zn", symRed: "Cu", formulaOx: "Zn", formulaRed: "Cu", cOx: 1, cRed: 1, env: "Neutral", ansH2O: 0, ansH: 0, ansOH: 0 },
  { eq: "Mg + Ag⁺ ➔ Mg²⁺ + Ag", hOx: "Mg ➔ Mg²⁺ + 2e⁻", hRed: "Ag⁺ + 1e⁻ ➔ Ag", eOx: 2, eRed: 1, symOx: "Mg", symRed: "Ag", formulaOx: "Mg", formulaRed: "Ag", cOx: 1, cRed: 2, env: "Neutral", ansH2O: 0, ansH: 0, ansOH: 0 },
  { eq: "Al + 3H⁺ ➔ Al³⁺ + 1.5H₂", hOx: "Al ➔ Al³⁺ + 3e⁻", hRed: "2H⁺ + 2e⁻ ➔ H₂", eOx: 3, eRed: 2, symOx: "Al", symRed: "H", formulaOx: "Al", formulaRed: "H", cOx: 2, cRed: 3, env: "Ácido", ansH2O: 0, ansH: 6, ansOH: 0 },
  { eq: "Fe + O₂ ➔ Fe₂O₃", hOx: "Fe ➔ Fe³⁺ + 3e⁻", hRed: "O₂ + 4e⁻ ➔ 2O²⁻", eOx: 3, eRed: 4, symOx: "Fe", symRed: "O", formulaOx: "Fe", formulaRed: "O2", cOx: 4, cRed: 3, env: "Neutral", ansH2O: 0, ansH: 0, ansOH: 0 },
  { eq: "Pb + PbO₂ + 4H⁺ ➔ 2Pb²⁺ + 2H₂O", hOx: "Pb ➔ Pb²⁺ + 2e⁻", hRed: "PbO₂ + 4H⁺ + 2e⁻ ➔ Pb²⁺ + 2H₂O", eOx: 2, eRed: 2, symOx: "Pb", symRed: "Pb", formulaOx: "Pb", formulaRed: "PbO2", cOx: 1, cRed: 1, env: "Ácido", ansH2O: 2, ansH: 4, ansOH: 0 },
  { eq: "MnO₄⁻ + 5Fe²⁺ + 8H⁺ ➔ Mn²⁺ + 5Fe³⁺ + 4H₂O", hOx: "Fe²⁺ ➔ Fe³⁺ + 1e⁻", hRed: "MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O", eOx: 1, eRed: 5, symOx: "Fe", symRed: "Mn", formulaOx: "Fe", formulaRed: "MnO4", cOx: 5, cRed: 1, env: "Ácido", ansH2O: 4, ansH: 8, ansOH: 0 },
  { eq: "Cr₂O₇²⁻ + 6Cl⁻ + 14H⁺ ➔ 2Cr³⁺ + 3Cl₂ + 7H₂O", hOx: "2Cl⁻ ➔ Cl₂ + 2e⁻", hRed: "Cr₂O₇²⁻ + 14H⁺ + 6e⁻ ➔ 2Cr³⁺ + 7H₂O", eOx: 2, eRed: 6, symOx: "Cl", symRed: "Cr", formulaOx: "Cl", formulaRed: "Cr2O7", cOx: 3, cRed: 1, env: "Ácido", ansH2O: 7, ansH: 14, ansOH: 0 },
  { eq: "3Cu + 2HNO₃ + 6H⁺ ➔ 3Cu²⁺ + 2NO + 4H₂O", hOx: "Cu ➔ Cu²⁺ + 2e⁻", hRed: "NO₃⁻ + 4H⁺ + 3e⁻ ➔ NO + 2H₂O", eOx: 2, eRed: 3, symOx: "Cu", symRed: "N", formulaOx: "Cu", formulaRed: "NO3", cOx: 3, cRed: 2, env: "Ácido", ansH2O: 4, ansH: 8, ansOH: 0 },
  { eq: "5H₂O₂ + 2MnO₄⁻ + 6H⁺ ➔ 5O₂ + 2Mn²⁺ + 8H₂O", hOx: "H₂O₂ ➔ O₂ + 2H⁺ + 2e⁻", hRed: "MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O", eOx: 2, eRed: 5, symOx: "O", symRed: "Mn", formulaOx: "H2O2", formulaRed: "MnO4", cOx: 5, cRed: 2, env: "Ácido", ansH2O: 8, ansH: 6, ansOH: 0 },
  { eq: "3Cl₂ + 6OH⁻ ➔ 5Cl⁻ + ClO₃⁻ + 3H₂O", hOx: "Cl₂ + 12OH⁻ ➔ 2ClO₃⁻ + 6H₂O + 10e⁻", hRed: "Cl₂ + 2e⁻ ➔ 2Cl⁻", eOx: 10, eRed: 2, symOx: "Cl", symRed: "Cl", formulaOx: "Cl2", formulaRed: "Cl2", cOx: 1, cRed: 5, env: "Básico", ansH2O: 6, ansH: 0, ansOH: 12 },
  { eq: "S + HNO₃ ➔ SO₂ + NO", hOx: "S + 2H₂O ➔ SO₂ + 4H⁺ + 4e⁻", hRed: "NO₃⁻ + 4H⁺ + 3e⁻ ➔ NO + 2H₂O", eOx: 4, eRed: 3, symOx: "S", symRed: "N", formulaOx: "S", formulaRed: "NO3", cOx: 3, cRed: 4, env: "Ácido", ansH2O: 2, ansH: 4, ansOH: 0 },
  { eq: "Zn + NO₃⁻ ➔ Zn²⁺ + NH₄⁺", hOx: "Zn ➔ Zn²⁺ + 2e⁻", hRed: "NO₃⁻ + 10H⁺ + 8e⁻ ➔ NH₄⁺ + 3H₂O", eOx: 2, eRed: 8, symOx: "Zn", symRed: "N", formulaOx: "Zn", formulaRed: "NO3", cOx: 4, cRed: 1, env: "Básico", ansH2O: 3, ansH: 10, ansOH: 0 },
  { eq: "I₂ + S₂O₃²⁻ ➔ I⁻ + S₄O₆²⁻", hOx: "2S₂O₃²⁻ ➔ S₄O₆²⁻ + 2e⁻", hRed: "I₂ + 2e⁻ ➔ 2I⁻", eOx: 2, eRed: 2, symOx: "S", symRed: "I", formulaOx: "S2O3", formulaRed: "I2", cOx: 1, cRed: 1, env: "Neutral", ansH2O: 0, ansH: 0, ansOH: 0 },
  { eq: "CH₄ + O₂ ➔ CO₂ + H₂O", hOx: "CH₄ + 2H₂O ➔ CO₂ + 8H⁺ + 8e⁻", hRed: "O₂ + 4H⁺ + 4e⁻ ➔ 2H₂O", eOx: 8, eRed: 4, symOx: "C", symRed: "O", formulaOx: "CH4", formulaRed: "O2", cOx: 1, cRed: 2, env: "Neutral", ansH2O: 2, ansH: 8, ansOH: 0 },
  { eq: "Ca + H₂O ➔ Ca(OH)₂ + H₂", hOx: "Ca ➔ Ca²⁺ + 2e⁻", hRed: "2H₂O + 2e⁻ ➔ H₂ + 2OH⁻", eOx: 2, eRed: 2, symOx: "Ca", symRed: "H", formulaOx: "Ca", formulaRed: "H2O", cOx: 1, cRed: 1, env: "Neutral", ansH2O: 2, ansH: 0, ansOH: 2 },
  { eq: "KMnO₄ + HCl ➔ MnCl₂ + Cl₂", hOx: "2Cl⁻ ➔ Cl₂ + 2e⁻", hRed: "MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O", eOx: 2, eRed: 5, symOx: "Cl", symRed: "Mn", formulaOx: "Cl", formulaRed: "MnO4", cOx: 5, cRed: 2, env: "Ácido", ansH2O: 4, ansH: 8, ansOH: 0 }, 
  { eq: "P₄ + NaOH ➔ PH₃ + NaH₂PO₂", hOx: "P₄ + 8OH⁻ ➔ 4H₂PO₂⁻ + 4e⁻", hRed: "P₄ + 12H₂O + 12e⁻ ➔ 4PH₃ + 12OH⁻", eOx: 4, eRed: 12, symOx: "P", symRed: "P", formulaOx: "P4", formulaRed: "P4", cOx: 3, cRed: 1, env: "Básico", ansH2O: 12, ansH: 0, ansOH: 24 },
  { eq: "Cu + H₂SO₄ ➔ CuSO₄ + SO₂", hOx: "Cu ➔ Cu²⁺ + 2e⁻", hRed: "SO₄²⁻ + 4H⁺ + 2e⁻ ➔ SO₂ + 2H₂O", eOx: 2, eRed: 2, symOx: "Cu", symRed: "S", formulaOx: "Cu", formulaRed: "SO4", cOx: 1, cRed: 1, env: "Ácido", ansH2O: 2, ansH: 4, ansOH: 0 },
  { eq: "Cr(OH)₃ + IO₃⁻ ➔ CrO₄²⁻ + I⁻", hOx: "Cr(OH)₃ + 5OH⁻ ➔ CrO₄²⁻ + 4H₂O + 3e⁻", hRed: "IO₃⁻ + 3H₂O + 6e⁻ ➔ I⁻ + 6OH⁻", eOx: 3, eRed: 6, symOx: "Cr", symRed: "I", formulaOx: "CrO3H3", formulaRed: "IO3", cOx: 2, cRed: 1, env: "Básico", ansH2O: 11, ansH: 0, ansOH: 16 },
  { eq: "Bi₂S₃ + HNO₃ ➔ Bi³⁺ + S + NO", hOx: "S²⁻ ➔ S + 2e⁻", hRed: "NO₃⁻ + 4H⁺ + 3e⁻ ➔ NO + 2H₂O", eOx: 2, eRed: 3, symOx: "S", symRed: "N", formulaOx: "Bi2S3", formulaRed: "NO3", cOx: 3, cRed: 2, env: "Ácido", ansH2O: 4, ansH: 8, ansOH: 0 }
];

const totalLevels = CHEM_DB.length;

/* ============================================================
   🌍 5. DICCIONARIOS INDEPENDIENTES Y COMPLETOS (CON PISTAS)
============================================================ */
const DICT = {
  es: {
    ui: { 
      start: "INICIAR CAMPAÑA", title: "REDOX BALANCER", rank: "RANGO", xp: "XP", 
      theoryTitle: "BRIEFING TÁCTICO", theoryBtn: "ENTRAR AL NÚCLEO ➔", diagTitle: "ANÁLISIS COGNITIVO IA", 
      btnCheck: "SINTETIZAR Y VERIFICAR", btnBack: "⬅ ABORTAR", btnNext: "SIGUIENTE CRISIS ➔", 
      btnRetry: "REINTENTAR", aiTitle: "🤖 TUTOR IA SOCRÁTICO", btnContinue: "ENTENDIDO", 
      react: "MULTIPLICADOR DE LA OXIDACIÓN", prod: "MULTIPLICADOR DE LA REDUCCIÓN",
      mission: "NIVEL", scan: "ESCANEAR ÁTOMOS", eLost: "e- Liberados", eGained: "e- Absorbidos", status: "ESTADO:",
      explTitle: "¡COLAPSO ESTRUCTURAL!", explMsg: "La descompensación provocó una fisión masiva en el reactor.",
      statsTitle: "SEPARACIÓN DE SEMIRREACCIONES", timeTaken: "Tiempo", clicksUsed: "Ajustes", 
      successTitle: "¡SISTEMA ESTABILIZADO!", successMessage: "Masa y carga en equilibrio perfecto.",
      helpBtn: "🤖 AYUDA", aiBtn: "🧠 CONSULTAR IA",
      step1Title: "FASE 1: IDENTIFICACIÓN SOCRÁTICA", step2Title: "FASE 2: BALANCE DE MASAS ATÓMICAS", step3Title: "FASE 3: BALANCE DE CARGAS Y CRUCE",
      microClassTitle: "📚 MICRO-CLASE DE REFUERZO",
      neutralTitle: "MEDIO NEUTRO", neutralDesc: "Este sistema no requiere H₂O ni Iones.", btnSkip: "AVANZAR A CARGAS"
    },
    guideAcid: "💡 Guía Ácida:\n1. Iguala Oxígenos añadiendo H₂O.\n2. Balancea Hidrógenos añadiendo H⁺.",
    guideBasic: "💡 Guía Básica:\n1. Iguala Oxígenos añadiendo H₂O.\n2. Balancea Hidrógenos añadiendo H₂O y añade OH⁻ al lado opuesto.",
    guideNeutral: "💡 Guía Neutral:\nLos átomos base están estables. Solo debes enfocarte en igualar los electrones en la Fase 3.",
    ai: { intro: "Protocolo activado. Analiza la ecuación.", correct: "Análisis perfecto.", explosion: "¡Ruptura crítica de contención!" },
    hints: { 
      NOT_SIMPLIFIED: "Los electrones coinciden, pero debes usar la mínima expresión entera.", 
      EXCESS_LOST: "Estás liberando demasiados electrones. Aumenta el multiplicador de la Reducción.", 
      DEFICIT_LOST: "Faltan electrones. Aumenta el multiplicador de la Oxidación.", 
      GENERIC: "Fallo en la transferencia de energía. Revisa el MCM de los electrones.",
      H2O_IMBALANCE: "Error en el balance atómico. Revisa cuidadosamente el H₂O y los iones."
    },
    interrupts: [
      { q: "¿Por qué se balancea la masa antes que la carga?", o: ["Conservación de la Materia", "Por estética"], a: 0, m: "Ley de Lavoisier: La materia no se crea ni se destruye. Debes igualar los átomos antes de mover la energía (electrones)." },
      { q: "En medio ÁCIDO, si te faltan Oxígenos, ¿qué agregas?", o: ["Iones OH⁻", "Moléculas de H₂O"], a: 1, m: "En medio ácido NUNCA se usan hidroxilos (OH⁻). Siempre usas H₂O para compensar el Oxígeno faltante." },
      { q: "Si la Oxidación libera 2e- y la Reducción absorbe 3e-, ¿Cuál es su MCM?", o: ["6 electrones", "5 electrones"], a: 0, m: "El Mínimo Común Múltiplo entre 2 y 3 es 6. Debes multiplicar cada semirreacción por el coeficiente necesario para llegar a 6." }
    ],
    levels: [
      { t: "Pila de Daniell. El Zinc se disuelve y el Cobre absorbe su energía.", q: "Fase 1: Identifica la oxidación (pierde e-)", o: ["El Cobre (Cu)", "El Zinc (Zn)"], a: 1, m: "¡Correcto! El Zinc pasa de 0 a +2. Perder electrones es oxidarse.", step2Hint: "Añade H₂O y H⁺ para igualar masas.", step3Hint: "Encuentra un multiplicador común para ambos lados." },
      { t: "El Magnesio reacciona violentamente con iones de Plata.", q: "Identifica la reducción: ¿Cuántos e- necesita la Plata (Ag⁺) para neutralizarse?", o: ["1 electrón", "2 electrones"], a: 0, m: "¡Bien! Absorbe 1 electrón.", step2Hint: "Este medio es neutro. No necesitas agua.", step3Hint: "Cruza los multiplicadores para igualar electrones." },
      { t: "Aluminio disolviéndose en medio ácido, liberando gas hidrógeno.", q: "El Aluminio pierde 3e- y el Hidrógeno gana 1e-. ¿Cuál es el Mínimo Común Múltiplo (MCM)?", o: ["3 electrones", "6 electrones"], a: 0, m: "¡Exacto! El MCM es 3. Tendrás que multiplicar el Hidrógeno por 3 en la Fase 3.", step2Hint: "Agrega H⁺ al lado de los reactivos para igualar el H₂.", step3Hint: "El LCM es 3. Ajusta los multiplicadores." },
      { t: "Corrosión masiva del hierro estructural en contacto con oxígeno.", q: "Al dividir la reacción: ¿qué rol juega el oxígeno gaseoso (O₂)?", o: ["Reductor", "Oxidante"], a: 1, m: "Correcto, el Oxígeno gana electrones, oxidando al Hierro.", step2Hint: "Iguala masas usando coeficientes.", step3Hint: "Cruza multiplicadores para equilibrar cargas." },
      { t: "Acumulador de plomo desestabilizado. Riesgo de explosión ácida.", q: "El Plomo está en dos estados. ¿El PbO₂ actúa como...?", o: ["Oxidante", "Reductor"], a: 0, m: "Exacto, el PbO₂ se reduce absorbiendo electrones.", step2Hint: "Añade H₂O para oxígenos y H⁺ para hidrógenos.", step3Hint: "Busca un LCM para equilibrar electrones." },
      { t: "Permanganato altamente reactivo oxidando hierro en ácido.", q: "El Manganeso pasa de +7 en el MnO₄⁻ a +2. ¿Cuántos e- gana?", o: ["5 electrones", "7 electrones"], a: 0, m: "Gana 5e-. Luego balancearás los oxígenos con agua.", step2Hint: "Agrega H₂O y H⁺ para equilibrar masas.", step3Hint: "Ajusta multiplicadores según LCM." },
      { t: "Dicromato generando cloro gas venenoso.", q: "La molécula de Cr₂O₇²⁻ tiene DOS Cromos. Si cada uno gana 3e-, ¿el total es?", o: ["3 electrones", "6 electrones"], a: 1, m: "¡Excelente! 2 átomos x 3e- = 6e- totales.", step2Hint: "Añade agua y protones para igualar masas.", step3Hint: "Multiplica las semi-reacciones para que coincidan." },
      { t: "Ácido Nítrico atacando el cableado de cobre principal.", q: "El Nitrato (NO₃⁻) pasa a Monóxido de Nitrógeno (NO). ¿Qué pierde?", o: ["Oxígenos", "Hidrógenos"], a: 0, m: "Pierde 2 oxígenos. Usa H₂O para compensar en Fase 2.", step2Hint: "Usa H₂O y H⁺ para balancear la ecuación.", step3Hint: "Multiplicadores para igualar los electrones perdidos/ganados." },
      { t: "Peróxido inestable frente a Permanganato. Fuego inminente.", q: "¿Qué hace el Peróxido (H₂O₂) aquí?", o: ["Reduce al Permanganato", "Oxida al Permanganato"], a: 0, m: "Actúa como reductor atípico, forzando al Manganeso a reducirse.", step2Hint: "Añade H₂O y H⁺ según sea necesario.", step3Hint: "Verifica que el intercambio de electrones sea igual." },
      { t: "Cloro reaccionando consigo mismo (Dismutación en medio Básico).", q: "¿Qué es una reacción de dismutación?", o: ["Se oxida y reduce a la vez", "No cambia de estado"], a: 0, m: "¡Brillante! El Cl₂ se divide asumiendo ambos roles.", step2Hint: "Añade H₂O y OH⁻ para equilibrar en medio básico.", step3Hint: "Igualar los electrones transferidos." },
      { t: "Azufre ardiendo en ácido nítrico, nublando la visión.", q: "El Azufre puro (0) pasa a SO₂. ¿Cuál es su estado final?", o: ["+4", "-2"], a: 0, m: "El Oxígeno aporta -4 en total, por lo que el Azufre debe ser +4.", step2Hint: "Iguala O con H₂O y H con H⁺.", step3Hint: "Cruza los coeficientes para alcanzar el LCM." },
      { t: "Zinc en alcalino forzando a los nitratos a formar gas amonio.", q: "El Nitrógeno cae de +5 a -3. ¿Cuántos e- absorbe?", o: ["8 electrones", "2 electrones"], a: 0, m: "Un salto masivo de 8 electrones.", step2Hint: "Añade H₂O y OH⁻ para balancear la masa.", step3Hint: "El LCM es grande, ajusta los multiplicadores." },
      { t: "Yodo y Tiosulfato desbalanceados. Falla en el sistema de vida.", q: "Oxidación: 2S₂O₃²⁻ a S₄O₆²⁻. ¿Cuántos e- se liberan en total?", o: ["1 electrón", "2 electrones"], a: 1, m: "Se liberan 2 electrones en total para la reacción.", step2Hint: "Ajusta las masas si es necesario.", step3Hint: "Encuentra el LCM y multiplica." },
      { t: "Metano ardiendo sin control en los motores principales.", q: "En el Metano (CH₄), ¿quién atrae la nube de electrones?", o: ["El Carbono", "El Hidrógeno"], a: 0, m: "El Carbono es más electronegativo, atrayendo densidad de electrones.", step2Hint: "Usa H₂O y H⁺ para balancear.", step3Hint: "Iguala la transferencia electrónica." },
      { t: "Calcio sumergido generando gas hidrógeno explosivo.", q: "El Calcio dona electrones al agua. ¿Qué se produce en la reducción?", o: ["Gas H₂ y iones OH⁻", "Oxígeno O₂"], a: 0, m: "El agua se rompe liberando H₂ y OH⁻.", step2Hint: "Añade OH⁻ y H₂O para balancear.", step3Hint: "Cruza los multiplicadores de carga." },
      { t: "Generación letal de cloro gas usando Permanganato y HCl.", q: "Los iones Cl⁻ se unen para formar gas Cl₂. ¿Esto es una...?", o: ["Oxidación", "Reducción"], a: 0, m: "Pasan de -1 a 0, perdiendo electrones. Es una oxidación pura.", step2Hint: "Añade H₂O y H⁺.", step3Hint: "Encuentra el MCM de los electrones transferidos." },
      { t: "Fósforo blanco generando Fosfina tóxica en base fuerte.", q: "Dismutación del Fósforo P₄. Pasa a Fosfina (PH₃) y Fosfito (H₂PO₂⁻). ¿Cuál representa la reducción?", o: ["Formación de PH₃ (-3)", "Formación de H₂PO₂⁻ (+1)"], a: 0, m: "Bajar a -3 requiere absorber electrones. Esa es la semirreacción de reducción.", step2Hint: "Añade OH⁻ y H₂O para balancear.", step3Hint: "Multiplica las semirreacciones para equilibrar e-." },
      { t: "Cobre atacado por Ácido Sulfúrico caliente.", q: "El Sulfato (SO₄²⁻) pasa a SO₂. ¿Cuántos electrones absorbe el Azufre (pasa de +6 a +4)?", o: ["2 electrones", "4 electrones"], a: 0, m: "Absorbe 2 electrones, empatando perfectamente con los 2 que pierde el Cobre.", step2Hint: "Añade H₂O y H⁺.", step3Hint: "Igualar los electrones." },
      { t: "Cromo oxidándose con Yodato. Toxicidad alcalina extrema.", q: "Estamos en medio Básico. ¿Cómo balancearás los Hidrógenos en la Fase 2?", o: ["Usando H₂O y OH⁻", "Añadiendo H⁺"], a: 0, m: "Correcto, en medio básico jamás se usan protones libres (H⁺).", step2Hint: "Añade H₂O y OH⁻.", step3Hint: "Multiplica para llegar al LCM de electrones." },
      { t: "Ataque de ácido nítrico sobre Sulfuro de Bismuto.", q: "El Sulfuro (S²⁻) se separa y se oxida a Azufre elemental (S). ¿Pierde o gana energía?", o: ["Pierde 2 electrones", "Gana 2 electrones"], a: 0, m: "Al subir de -2 a 0, está cediendo 2 electrones al sistema.", step2Hint: "Añade H₂O y H⁺ para balancear.", step3Hint: "Ajusta multiplicadores de electrones." }
    ],
    genExplanation: (lvl) => {
      if (!lvl) return "Error de carga.";
      const mcm = RedoxEngine.getMCM(lvl.eOx || 1, lvl.eRed || 1);
      return `<strong style="color:#00f2ff; font-size: 24px;">🔬 CÓDICE REDOX</strong><br/><br/>
      <span style="color:#00f2ff">Semirreacción de Oxidación:</span><br/>${lvl.hOx}<br/><br/>
      <span style="color:#ff0055">Semirreacción de Reducción:</span><br/>${lvl.hRed}<br/><br/>
      💡 <em>En la Fase 3, encuentra el MCM de los electrones (<strong style="color:#ffea00">${mcm}e⁻</strong>) y multiplica las ecuaciones para igualarlo.</em>`;
    }
  },
  en: {
    ui: { 
      start: "START CAMPAIGN", title: "REDOX BALANCER", rank: "RANK", xp: "XP", 
      theoryTitle: "TACTICAL BRIEFING", theoryBtn: "ENTER CORE ➔", diagTitle: "AI ANALYSIS", 
      btnCheck: "SYNTHESIZE & VERIFY", btnBack: "⬅ ABORT", btnNext: "NEXT CRISIS ➔", 
      btnRetry: "RETRY", aiTitle: "🤖 SOCRATIC AI", btnContinue: "UNDERSTOOD", 
      react: "OXIDATION MULTIPLIER", prod: "REDUCTION MULTIPLIER",
      mission: "MISSION", scan: "SCAN ATOMS", eLost: "e- Lost", eGained: "e- Gained", status: "STATUS:",
      explTitle: "STRUCTURAL COLLAPSE!", explMsg: "Massive electron imbalance caused a core fission.",
      statsTitle: "HALF-REACTION SPLIT", timeTaken: "Time", clicksUsed: "Clicks", 
      successTitle: "SYSTEM STABILIZED!", successMessage: "Perfect mass and charge equilibrium.",
      helpBtn: "🤖 HELP", aiBtn: "🧠 ASK AI",
      step1Title: "PHASE 1: AI IDENTIFICATION", step2Title: "PHASE 2: ATOMIC MASS BALANCE", step3Title: "PHASE 3: CHARGE BALANCE & CROSSING",
      microClassTitle: "📚 REINFORCEMENT MICRO-CLASS",
      neutralTitle: "NEUTRAL MEDIUM", neutralDesc: "This system does not require H₂O or Ions.", btnSkip: "PROCEED TO CHARGES"
    },
    guideAcid: "💡 Acidic Guide:\n1. Balance O with H₂O.\n2. Balance H with H⁺.",
    guideBasic: "💡 Basic Guide:\n1. Balance O with H₂O.\n2. Balance H with H₂O and add OH⁻ to the opposite side.",
    guideNeutral: "💡 Neutral Guide:\nBase atoms are stable. Skip to Phase 3.",
    ai: { intro: "Protocol active. Analyze equation.", correct: "Perfect analysis.", explosion: "Critical containment breach!" },
    hints: { 
      NOT_SIMPLIFIED: "Electrons match, but coefficients are not in the simplest integer ratio.", 
      EXCESS_LOST: "Releasing too many electrons. Increase the Reduction multiplier.", 
      DEFICIT_LOST: "Missing electrons. Increase the Oxidation multiplier.", 
      GENERIC: "Energy transfer failed. Check the Least Common Multiple (LCM).",
      H2O_IMBALANCE: "Atomic balance error. Check H₂O and ions carefully."
    },
    interrupts: [
      { q: "Why balance mass before charge?", o: ["Conservation of Mass", "To make it look pretty"], a: 0, m: "Matter cannot be created or destroyed. You must balance O and H before moving electrons." },
      { q: "In an ACIDIC medium, missing Oxygens are balanced with?", o: ["OH⁻ ions", "H₂O molecules"], a: 1, m: "In an acidic medium, you NEVER use OH⁻. You use Water (H₂O) for Oxygens." },
      { q: "If Oxidation loses 2e- and Reduction gains 3e-, what is the LCM?", o: ["6 electrons", "5 electrons"], a: 0, m: "The Least Common Multiple between 2 and 3 is 6. Cross-multiply to reach 6." }
    ],
    levels: [
      { t: "Daniell Cell. Zinc dissolves and Copper absorbs its energy.", q: "Phase 1: Split the equation. Which element oxidizes (loses electrons)?", o: ["Copper (Cu)", "Zinc (Zn)"], a: 1, m: "Correct! Zinc goes from 0 to +2. Losing electrons is oxidation.", step2Hint: "Add H₂O and H⁺ to balance mass.", step3Hint: "Find a common multiplier for both sides." },
      { t: "Magnesium reacts violently with Silver ions.", q: "Identify the reduction: How many electrons does ONE Ag⁺ molecule need to become neutral Silver?", o: ["1 electron", "2 electrons"], a: 0, m: "Good! It absorbs 1 electron.", step2Hint: "This is a neutral medium. No water needed.", step3Hint: "Cross the multipliers to balance electrons." },
      { t: "Aluminum dissolving in acid, releasing hydrogen gas.", q: "Aluminum loses 3e- and Hydrogen gains 1e-. What is the Least Common Multiple (LCM)?", o: ["3 electrons", "6 electrons"], a: 0, m: "Exactly! The LCM is 3. You'll multiply Hydrogen by 3 in Phase 3.", step2Hint: "Add H⁺ to reactants side to balance H₂.", step3Hint: "LCM is 3. Adjust multipliers." },
      { t: "Massive corrosion of structural iron in contact with oxygen.", q: "Splitting the reaction: what role does oxygen gas (O₂) play?", o: ["Reducing Agent", "Oxidizing Agent"], a: 1, m: "Correct, Oxygen gains electrons, oxidizing the Iron.", step2Hint: "Balance masses using coefficients.", step3Hint: "Cross multipliers to balance charges." },
      { t: "Destabilized lead accumulator. Acid explosion risk.", q: "Attention: Lead is in two different states. PbO₂ acts as...?", o: ["Oxidizer", "Reducer"], a: 0, m: "Exact, PbO₂ is reduced, absorbing electrons.", step2Hint: "Add H₂O for oxygens and H⁺ for hydrogens.", step3Hint: "Find an LCM to balance electrons." },
      { t: "Highly reactive Permanganate oxidizing iron in acid.", q: "Manganese goes from +7 in MnO₄⁻ to +2. How many e- does it gain?", o: ["5 electrons", "7 electrons"], a: 0, m: "Gains 5e-. In the next phase you'll balance its oxygens with water.", step2Hint: "Add H₂O and H⁺ to balance masses.", step3Hint: "Adjust multipliers based on LCM." },
      { t: "Dichromate generating poisonous chlorine gas.", q: "The Cr₂O₇²⁻ molecule has TWO Chromium atoms. If each gains 3e-, the total absorbed is?", o: ["3 electrons", "6 electrons"], a: 1, m: "Excellent! Being two atoms, the entire molecule demands 6 electrons.", step2Hint: "Add water and protons to balance masses.", step3Hint: "Multiply half-reactions to match." },
      { t: "Nitric Acid attacking main copper wiring.", q: "Nitrate (NO₃⁻) becomes Nitrogen Monoxide (NO). What does it lose in the process?", o: ["Oxygens", "Hydrogens"], a: 0, m: "Loses 2 oxygens. In Phase 2 you must compensate by adding H₂O.", step2Hint: "Use H₂O and H⁺ to balance the equation.", step3Hint: "Multipliers to match electrons lost/gained." },
      { t: "Unstable Peroxide facing Permanganate. Imminent fire.", q: "Who forces whom? What does Peroxide (H₂O₂) do here?", o: ["Reduces Permanganate", "Oxidizes Permanganate"], a: 0, m: "Acts as an atypical reducing agent, forcing Manganese to reduce.", step2Hint: "Add H₂O and H⁺ as needed.", step3Hint: "Verify electron exchange is equal." },
      { t: "Chlorine reacting with itself (Disproportionation in Basic medium).", q: "What does disproportionation mean?", o: ["Oxidizes and reduces simultaneously", "Does not change state"], a: 0, m: "Brilliant! One part of Cl₂ becomes Cl⁻ and another ClO₃⁻.", step2Hint: "Add H₂O and OH⁻ to balance in basic medium.", step3Hint: "Balance the electrons transferred." },
      { t: "Sulfur burning in nitric acid, clouding vision.", q: "Pure Sulfur (0) goes to SO₂. What is its final oxidation state?", o: ["+4", "-2"], a: 0, m: "Oxygen brings -4 in total, so Sulfur must be +4.", step2Hint: "Balance O with H₂O and H with H⁺.", step3Hint: "Cross coefficients to reach LCM." },
      { t: "Zinc in alkaline forcing nitrates to form ammonia gas.", q: "Nitrogen drops drastically from +5 to -3. How many electrons are absorbed?", o: ["8 electrons", "2 electrons"], a: 0, m: "A massive jump of 8 electrons.", step2Hint: "Add H₂O and OH⁻ to balance mass.", step3Hint: "LCM is large, adjust multipliers." },
      { t: "Unbalanced Iodine and Thiosulfate. Life support failing.", q: "Observe oxidation: 2S₂O₃²⁻ becomes S₄O₆²⁻. How many e- are released in total?", o: ["1 electron", "2 electrons"], a: 1, m: "Releases 2 electrons total for the reaction.", step2Hint: "Adjust masses if necessary.", step3Hint: "Find the LCM and multiply." },
      { t: "Methane burning out of control in main engines.", q: "In Methane (CH₄), who attracts the electron cloud?", o: ["Carbon", "Hydrogen"], a: 0, m: "Carbon is more electronegative, attracting electron density.", step2Hint: "Use H₂O and H⁺ to balance.", step3Hint: "Balance the electronic transfer." },
      { t: "Submerged calcium generating explosive hydrogen gas.", q: "Calcium donates electrons to water. What is produced in the reduction?", o: ["H₂ gas and OH⁻ ions", "O₂ Oxygen"], a: 0, m: "Water breaks releasing hydrogen gas and alkalizing the medium.", step2Hint: "Add OH⁻ and H₂O to balance.", step3Hint: "Cross the charge multipliers." },
      { t: "Lethal chlorine gas generation using Permanganate and HCl.", q: "Cl⁻ ions join to form Cl₂ gas. This is an...?", o: ["Oxidation", "Reduction"], a: 0, m: "Going from -1 to 0, losing electrons. Pure oxidation.", step2Hint: "Add H₂O and H⁺.", step3Hint: "Find the LCM of transferred electrons." },
      { t: "White phosphorus generating toxic Phosphine in strong base.", q: "Disproportionation of P₄. Becomes (PH₃) and (H₂PO₂⁻). Which represents reduction?", o: ["Formation of PH₃ (-3)", "Formation of H₂PO₂⁻ (+1)"], a: 0, m: "Dropping to -3 requires absorbing electrons.", step2Hint: "Add OH⁻ and H₂O to balance.", step3Hint: "Multiply half-reactions to balance e-." },
      { t: "Copper attacked by hot Sulfuric Acid.", q: "Sulfate (SO₄²⁻) goes to SO₂. How many electrons does Sulfur absorb?", o: ["2 electrons", "4 electrons"], a: 0, m: "Absorbs 2 electrons, perfectly matching the 2 Copper loses.", step2Hint: "Add H₂O and H⁺.", step3Hint: "Balance the electrons." },
      { t: "Chromium oxidizing with Iodate. Extreme alkaline toxicity.", q: "We are in a Basic medium. How will you balance Hydrogens in Phase 2?", o: ["Using H₂O and OH⁻", "Adding H⁺"], a: 0, m: "Correct, in basic mediums free protons (H⁺) are never used.", step2Hint: "Add H₂O and OH⁻.", step3Hint: "Multiply to reach electron LCM." },
      { t: "Nitric acid attack on Bismuth Sulfide.", q: "Sulfide (S²⁻) oxidizes to elemental Sulfur (S). Lose or gain energy?", o: ["Loses 2 electrons", "Gains 2 electrons"], a: 0, m: "Going up from -2 to 0, it yields 2 electrons.", step2Hint: "Add H₂O and H⁺ to balance.", step3Hint: "Adjust electron multipliers." }
    ],
    genExplanation: (lvl) => {
      if (!lvl) return "Loading Error.";
      const mcm = RedoxEngine.getMCM(lvl.eOx || 1, lvl.eRed || 1);
      return `<strong style="color:#00f2ff; font-size: 24px;">🔬 REDOX ANALYSIS</strong><br/><br/>
      <span style="color:#00f2ff">Oxidation Half-Reaction:</span><br/>${lvl.hOx}<br/><br/>
      <span style="color:#ff0055">Reduction Half-Reaction:</span><br/>${lvl.hRed}<br/><br/>
      💡 <em>In Phase 3, find the LCM of electrons (<strong style="color:#ffea00">${mcm}e⁻</strong>) and multiply equations to match it.</em>`;
    }
  },
  fr: {
    ui: { 
      start: "LANCER LA CAMPAGNE", title: "REDOX BALANCER", rank: "RANG", xp: "XP", 
      theoryTitle: "BRIEFING TACTIQUE", theoryBtn: "ENTRER DANS LE NOYAU ➔", diagTitle: "ANALYSE DE L'IA", 
      btnCheck: "SYNTHÉTISER & VÉRIFIER", btnBack: "⬅ ABANDONNER", btnNext: "CRISE SUIVANTE ➔", 
      btnRetry: "RÉESSAYER", aiTitle: "🤖 IA SOCRATIQUE", btnContinue: "COMPRIS", 
      react: "MULTIPLICATEUR D'OXYDATION", prod: "MULTIPLICATEUR DE RÉDUCTION",
      mission: "MISSION", scan: "SCANNER", eLost: "e- Perdus", eGained: "e- Gagnés", status: "STATUT:",
      explTitle: "EFFONDREMENT STRUCTUREL!", explMsg: "Le déséquilibre électronique a provoqué une fission du noyau.",
      statsTitle: "SÉPARATION DES DEMI-RÉACTIONS", timeTaken: "Temps", clicksUsed: "Clics", 
      successTitle: "SYSTÈME STABILISÉ!", successMessage: "Équilibre parfait de la masse et de la charge.",
      helpBtn: "🤖 AIDE", aiBtn: "🧠 IA",
      step1Title: "PHASE 1: IDENTIFICATION", step2Title: "PHASE 2: BILAN DE MASSE", step3Title: "PHASE 3: BILAN DE CHARGE",
      microClassTitle: "📚 MICRO-COURS DE RENFORCEMENT",
      neutralTitle: "MILIEU NEUTRE", neutralDesc: "Ce système ne nécessite pas d'H₂O ou d'Ions.", btnSkip: "PASSER AUX CHARGES"
    },
    guideAcid: "💡 Guide Acide:\n1. Équilibrer O avec H₂O.\n2. Équilibrer H avec H⁺.",
    guideBasic: "💡 Guide Basique:\n1. Équilibrer O avec H₂O.\n2. Équilibrer H avec H₂O et ajouter OH⁻ du côté opposé.",
    guideNeutral: "💡 Guide Neutre:\nLes atomes de base sont stables. Passez à la Phase 3.",
    ai: { intro: "Protocole actif. Analysez l'équation.", correct: "Analyse parfaite.", explosion: "Rupture critique!" },
    hints: { 
      NOT_SIMPLIFIED: "Les électrons correspondent, mais réduisez les coefficients.", 
      EXCESS_LOST: "Trop d'électrons libérés. Augmentez le réducteur.", 
      DEFICIT_LOST: "Manque d'électrons. Augmentez l'oxydant.", 
      GENERIC: "Échec du transfert. Vérifiez le PPCM des électrons.",
      H2O_IMBALANCE: "Erreur de masse. Vérifiez soigneusement H₂O et les ions."
    },
    interrupts: [
      { q: "Pourquoi équilibrer la masse avant la charge?", o: ["Conservation de la masse", "Pour l'esthétique"], a: 0, m: "Rien ne se perd, rien ne se crée. Équilibrez O et H avant les électrons." },
      { q: "En milieu ACIDE, comment équilibrer l'Oxygène?", o: ["Ions OH⁻", "Molécules d'H₂O"], a: 1, m: "En milieu acide, on n'utilise JAMAIS OH⁻. Utilisez l'eau (H₂O)." },
      { q: "Si l'Oxydation perd 2e- et la Réduction gagne 3e-, quel est le PPCM?", o: ["6 électrons", "5 électrons"], a: 0, m: "Le PPCM entre 2 et 3 est 6." }
    ],
    levels: [
      { t: "Pile Daniell. Le Zinc se dissout et le Cuivre absorbe son énergie.", q: "Phase 1 : Quel élément s'oxyde (perd des électrons) ?", o: ["Cuivre (Cu)", "Zinc (Zn)"], a: 1, m: "Correct ! Le Zinc passe de 0 à +2.", step2Hint: "Ajoutez H₂O et H⁺ pour équilibrer.", step3Hint: "Trouvez un multiplicateur commun." },
      { t: "Le Magnésium réagit violemment avec les ions Argent.", q: "Identifier la réduction : Combien d'électrons pour l'Ag⁺ ?", o: ["1 électron", "2 électrons"], a: 0, m: "Bien ! Il absorbe 1 électron.", step2Hint: "Milieu neutre. Pas besoin d'eau.", step3Hint: "Croisez les multiplicateurs." },
      { t: "Aluminium se dissolvant dans l'acide, libérant du gaz dihydrogène.", q: "Al perd 3e- et H gagne 1e-. Quel est le PPCM ?", o: ["3 électrons", "6 électrons"], a: 0, m: "Exactement ! Le PPCM est 3.", step2Hint: "Ajoutez H⁺ pour équilibrer le H₂.", step3Hint: "Le PPCM est 3. Ajustez." },
      { t: "Corrosion massive du fer au contact de l'oxygène.", q: "Quel rôle joue l'oxygène gazeux (O₂) ?", o: ["Réducteur", "Oxydant"], a: 1, m: "Correct, l'Oxygène gagne des électrons.", step2Hint: "Équilibrez les masses.", step3Hint: "Croisez pour équilibrer les charges." },
      { t: "Accumulateur au plomb déstabilisé. Risque d'explosion acide.", q: "Le Plomb a deux états. PbO₂ agit comme... ?", o: ["Oxydant", "Réducteur"], a: 0, m: "Exact, PbO₂ est réduit.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Trouvez un PPCM." },
      { t: "Permanganate hautement réactif oxydant le fer.", q: "Le Manganèse passe de +7 à +2. Combien de e- gagne-t-il ?", o: ["5 électrons", "7 électrons"], a: 0, m: "Gagne 5e-.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Ajustez les multiplicateurs (PPCM)." },
      { t: "Dichromate générant du gaz chlore toxique.", q: "La molécule Cr₂O₇²⁻ a DEUX atomes de Chrome. Total absorbé ?", o: ["3 électrons", "6 électrons"], a: 1, m: "Excellent ! La molécule entière demande 6 électrons.", step2Hint: "Ajoutez de l'eau et des protons.", step3Hint: "Multipliez pour faire correspondre." },
      { t: "Acide nitrique attaquant le câblage principal en cuivre.", q: "Le Nitrate (NO₃⁻) devient (NO). Que perd-il ?", o: ["Oxygènes", "Hydrogènes"], a: 0, m: "Perd 2 oxygènes. Utilisez H₂O dans la Phase 2.", step2Hint: "Utilisez H₂O et H⁺.", step3Hint: "Multiplicateurs pour égaliser les électrons." },
      { t: "Peroxyde instable face au Permanganate.", q: "Que fait le Peroxyde (H₂O₂) ici ?", o: ["Réduit le Permanganate", "Oxyde le Permanganate"], a: 0, m: "Agit comme agent réducteur atypique.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Vérifiez l'échange d'électrons." },
      { t: "Chlore réagissant avec lui-même (Dismutation).", q: "Qu'est-ce qu'une dismutation ?", o: ["S'oxyde et se réduit à la fois", "Ne change pas d'état"], a: 0, m: "Brillant ! Une partie devient Cl⁻ et une autre ClO₃⁻.", step2Hint: "Ajoutez H₂O et OH⁻.", step3Hint: "Équilibrez les électrons transférés." },
      { t: "Soufre brûlant dans l'acide nitrique.", q: "Le Soufre (0) passe à SO₂. Quel est son état final ?", o: ["+4", "-2"], a: 0, m: "L'Oxygène apporte -4, donc le Soufre doit être +4.", step2Hint: "Équilibrez O avec H₂O et H avec H⁺.", step3Hint: "Croisez les coefficients (PPCM)." },
      { t: "Zinc en milieu alcalin forçant les nitrates à former de l'ammoniac.", q: "L'Azote passe de +5 à -3. Combien d'e- ?", o: ["8 électrons", "2 électrons"], a: 0, m: "Un saut massif de 8 électrons.", step2Hint: "Ajoutez H₂O et OH⁻.", step3Hint: "Le PPCM est grand, ajustez." },
      { t: "Iode et Thiosulfate déséquilibrés.", q: "2S₂O₃²⁻ devient S₄O₆²⁻. Combien d'e- libérés au total ?", o: ["1 électron", "2 électrons"], a: 1, m: "Libère 2 électrons au total.", step2Hint: "Ajustez les masses si nécessaire.", step3Hint: "Trouvez le PPCM et multipliez." },
      { t: "Méthane brûlant hors de contrôle.", q: "Dans le Méthane (CH₄), qui attire les électrons ?", o: ["Carbone", "Hydrogène"], a: 0, m: "Le Carbone attire les électrons, état apparent de -4.", step2Hint: "Utilisez H₂O et H⁺.", step3Hint: "Équilibrez le transfert électronique." },
      { t: "Calcium submergé générant du gaz hydrogène.", q: "Que produit la demi-réaction de réduction ?", o: ["Gaz H₂ et ions OH⁻", "Oxygène O₂"], a: 0, m: "L'eau se brise en libérant H₂ et OH⁻.", step2Hint: "Ajoutez OH⁻ et H₂O.", step3Hint: "Croisez les multiplicateurs de charge." },
      { t: "Génération de gaz chlore létal.", q: "Les ions Cl⁻ se rejoignent pour former Cl₂. C'est une... ?", o: ["Oxydation", "Réduction"], a: 0, m: "Passe de -1 à 0, oxydation pure.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Trouvez le PPCM des électrons." },
      { t: "Phosphore blanc générant de la Phosphine toxique.", q: "Lequel représente la réduction ?", o: ["Formation de PH₃ (-3)", "Formation de H₂PO₂⁻ (+1)"], a: 0, m: "Descendre à -3 requiert l'absorption d'électrons.", step2Hint: "Ajoutez OH⁻ et H₂O.", step3Hint: "Multipliez les demi-réactions." },
      { t: "Cuivre attaqué par l'Acide Sulfurique chaud.", q: "Sulfate (SO₄²⁻) passe à SO₂. Combien de e- absorbe le Soufre ?", o: ["2 électrons", "4 électrons"], a: 0, m: "Absorbe 2 électrons.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Équilibrez les électrons." },
      { t: "Chrome s'oxydant avec de l'Iodate.", q: "En milieu Basique. Comment équilibrer les Hydrogènes ?", o: ["En utilisant H₂O et OH⁻", "En ajoutant H⁺"], a: 0, m: "Correct, jamais de H⁺ en milieu basique.", step2Hint: "Ajoutez H₂O et OH⁻.", step3Hint: "Multipliez pour le PPCM d'électrons." },
      { t: "Attaque d'acide nitrique sur Sulfure de Bismuth.", q: "Le Sulfure (S²⁻) s'oxyde en Soufre (S).", o: ["Perd 2 électrons", "Gagne 2 électrons"], a: 0, m: "En passant de -2 à 0, il cède 2 électrons.", step2Hint: "Ajoutez H₂O et H⁺.", step3Hint: "Ajustez les multiplicateurs d'électrons." }
    ],
    genExplanation: (lvl) => {
      if (!lvl) return "Erreur.";
      const mcm = RedoxEngine.getMCM(lvl.eOx || 1, lvl.eRed || 1);
      return `<strong style="color:#00f2ff; font-size: 24px;">🔬 ANALYSE REDOX</strong><br/><br/>
      <span style="color:#00f2ff">Oxydation:</span><br/>${lvl.hOx}<br/><br/>
      <span style="color:#ff0055">Réduction:</span><br/>${lvl.hRed}<br/><br/>
      💡 <em>En Phase 3, utilisez le PPCM de <strong style="color:#ffea00">${mcm}e⁻</strong>.</em>`;
    }
  },
  de: {
    ui: { 
      start: "KAMPAGNE STARTEN", title: "REDOX BALANCER", rank: "RANG", xp: "XP", 
      theoryTitle: "TAKTISCHES BRIEFING", theoryBtn: "KERN BETRETEN ➔", diagTitle: "KI-ANALYSE", 
      btnCheck: "PRÜFEN", btnBack: "⬅ ABBRECHEN", btnNext: "NÄCHSTE KRISE ➔", 
      btnRetry: "WIEDERHOLEN", aiTitle: "🤖 SOKRATISCHE KI", btnContinue: "VERSTANDEN", 
      react: "OXIDATIONSMULTIPLIKATOR", prod: "REDUKTIONSMULTIPLIKATOR",
      mission: "MISSION", scan: "ATOME SCANNEN", eLost: "e- Verloren", eGained: "e- Gewonnen", status: "STATUS:",
      explTitle: "STRUKTURELLER KOLLAPS!", explMsg: "Massives Elektronenungleichgewicht verursachte Kernspaltung.",
      statsTitle: "HALBREAKTIONSTEILUNG", timeTaken: "Zeit", clicksUsed: "Klicks", 
      successTitle: "SYSTEM STABILISIERT!", successMessage: "Perfektes Masse- und Ladungsgleichgewicht.",
      helpBtn: "🤖 HILFE", aiBtn: "🧠 KI FRAGEN",
      step1Title: "PHASE 1: KI-IDENTIFIKATION", step2Title: "PHASE 2: ATOMMASSENBILANZ", step3Title: "PHASE 3: LADUNGSBILANZ & KREUZUNG",
      microClassTitle: "📚 VERSTÄRKUNGS-MIKROKLASSE",
      neutralTitle: "NEUTRALES MEDIUM", neutralDesc: "Dieses System erfordert kein H₂O oder Ionen.", btnSkip: "WEITER"
    },
    guideAcid: "💡 Saure Anleitung:\n1. O mit H₂O ausgleichen.\n2. H mit H⁺ ausgleichen.",
    guideBasic: "💡 Basische Anleitung:\n1. O mit H₂O ausgleichen.\n2. H mit H₂O ausgleichen und OH⁻ auf die gegenüberliegende Seite geben.",
    guideNeutral: "💡 Neutrale Anleitung:\nBasisatome sind stabil. Springen Sie zu Phase 3.",
    ai: { intro: "Protokoll aktiv. Analysiere Gleichung.", correct: "Perfekte Analyse.", explosion: "Kritischer Sicherheitsbruch!" },
    hints: { 
      NOT_SIMPLIFIED: "Elektronen stimmen überein, aber vereinfachen Sie die Koeffizienten.", 
      EXCESS_LOST: "Zu viele Elektronen freigesetzt. Erhöhen Sie die Reduktion.", 
      DEFICIT_LOST: "Fehlende Elektronen. Erhöhen Sie die Oxidation.", 
      GENERIC: "Energieübertragung fehlgeschlagen. Überprüfen Sie das KGV.",
      H2O_IMBALANCE: "Fehler beim Atomausgleich. Überprüfen Sie H₂O und Ionen."
    },
    interrupts: [
      { q: "Warum Masse vor Ladung ausgleichen?", o: ["Massenerhaltung", "Damit es hübsch aussieht"], a: 0, m: "Materie kann weder erzeugt noch vernichtet werden." },
      { q: "Womit werden fehlende Sauerstoffe in saurem Medium ausgeglichen?", o: ["OH⁻ Ionen", "H₂O Moleküle"], a: 1, m: "In saurem Medium verwenden Sie NIEMALS OH⁻." },
      { q: "Wenn Oxidation 2e- verliert und Reduktion 3e- gewinnt, was ist das KGV?", o: ["6 Elektronen", "5 Elektronen"], a: 0, m: "Das kleinste gemeinsame Vielfache ist 6." }
    ],
    levels: [
      { t: "Daniell-Element. Zink löst sich auf und Kupfer absorbiert Energie.", q: "Phase 1: Welches Element oxidiert (verliert Elektronen)?", o: ["Kupfer (Cu)", "Zink (Zn)"], a: 1, m: "Korrekt! Zink geht von 0 auf +2.", step2Hint: "Fügen Sie H₂O und H⁺ hinzu.", step3Hint: "Finden Sie einen gemeinsamen Multiplikator." },
      { t: "Magnesium reagiert heftig mit Silberionen.", q: "Reduktion identifizieren: Wie viele Elektronen braucht Ag⁺?", o: ["1 Elektron", "2 Elektronen"], a: 0, m: "Gut! Es absorbiert 1 Elektron.", step2Hint: "Neutrales Medium. Kein Wasser nötig.", step3Hint: "Kreuzen Sie die Multiplikatoren." },
      { t: "Aluminium löst sich in Säure auf.", q: "Al verliert 3e- und H gewinnt 1e-. Was ist das KGV?", o: ["3 Elektronen", "6 Elektronen"], a: 0, m: "Exakt! Das KGV ist 3.", step2Hint: "H⁺ hinzufügen, um H₂ auszugleichen.", step3Hint: "KGV ist 3. Anpassen." },
      { t: "Massive Korrosion von Eisen.", q: "Welche Rolle spielt Sauerstoff (O₂)?", o: ["Reduktionsmittel", "Oxidationsmittel"], a: 1, m: "Korrekt, Sauerstoff gewinnt Elektronen.", step2Hint: "Massen mit Koeffizienten ausgleichen.", step3Hint: "Kreuzen zur Ladungsausgleich." },
      { t: "Destabilisierter Bleiakkumulator.", q: "Blei ist in zwei Zuständen. PbO₂ wirkt als...?", o: ["Oxidationsmittel", "Reduktionsmittel"], a: 0, m: "Exakt, PbO₂ wird reduziert.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "Finden Sie ein KGV." },
      { t: "Permanganate oxidiert Eisen in Säure.", q: "Mangan geht von +7 auf +2. Wie viele e- gewinnt es?", o: ["5 Elektronen", "7 Elektronen"], a: 0, m: "Gewinnt 5e-.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "Multiplikatoren anpassen (KGV)." },
      { t: "Dichromat erzeugt Chlorgas.", q: "Cr₂O₇²⁻ hat ZWEI Chromatome. Total absorbiert?", o: ["3 Elektronen", "6 Elektronen"], a: 1, m: "Exzellent! 6 Elektronen.", step2Hint: "Wasser und Protonen hinzufügen.", step3Hint: "Halbreaktionen multiplizieren." },
      { t: "Salpetersäure greift Kupfer an.", q: "Nitrat (NO₃⁻) wird zu (NO). Was verliert es?", o: ["Sauerstoff", "Wasserstoff"], a: 0, m: "Verliert 2 Sauerstoffatome.", step2Hint: "H₂O und H⁺ verwenden.", step3Hint: "Multiplikatoren, um e- auszugleichen." },
      { t: "Instabiles Peroxid.", q: "Was macht Peroxid (H₂O₂) hier?", o: ["Reduziert Permanganat", "Oxidiert Permanganat"], a: 0, m: "Wirkt als Reduktionsmittel.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "Elektronenaustausch überprüfen." },
      { t: "Chlor reagiert mit sich selbst.", q: "Was bedeutet Disproportionierung?", o: ["Oxidiert und reduziert gleichzeitig", "Keine Änderung"], a: 0, m: "Brillant!", step2Hint: "H₂O und OH⁻ in basischem Medium.", step3Hint: "Elektronen ausgleichen." },
      { t: "Schwefel brennt in Salpetersäure.", q: "Purer Schwefel (0) wird zu SO₂. Endzustand?", o: ["+4", "-2"], a: 0, m: "Sauerstoff bringt -4, Schwefel muss +4 sein.", step2Hint: "O mit H₂O, H mit H⁺.", step3Hint: "Koeffizienten kreuzen (KGV)." },
      { t: "Zink in alkalischem Medium.", q: "Stickstoff fällt von +5 auf -3. Wie viele e-?", o: ["8 Elektronen", "2 Elektronen"], a: 0, m: "Massiver Sprung von 8 Elektronen.", step2Hint: "H₂O und OH⁻ hinzufügen.", step3Hint: "Das KGV ist groß, anpassen." },
      { t: "Jod und Thiosulfat.", q: "2S₂O₃²⁻ wird S₄O₆²⁻. Wie viele e- insgesamt?", o: ["1 Elektron", "2 Elektronen"], a: 1, m: "Gibt insgesamt 2 Elektronen ab.", step2Hint: "Massen bei Bedarf anpassen.", step3Hint: "KGV finden und multiplizieren." },
      { t: "Methan brennt.", q: "Wer zieht im Methan (CH₄) Elektronen an?", o: ["Kohlenstoff", "Wasserstoff"], a: 0, m: "Kohlenstoff zieht an (-4).", step2Hint: "H₂O und H⁺ verwenden.", step3Hint: "Elektronentransfer ausgleichen." },
      { t: "Calcium unter Wasser.", q: "Was entsteht bei der Reduktion?", o: ["H₂ Gas und OH⁻ Ionen", "O₂ Sauerstoff"], a: 0, m: "Wasser zerfällt in H₂ und OH⁻.", step2Hint: "OH⁻ und H₂O hinzufügen.", step3Hint: "Ladungsmultiplikatoren kreuzen." },
      { t: "Chlorgaserzeugung.", q: "Cl⁻ Ionen bilden Cl₂ Gas. Das ist eine...?", o: ["Oxidation", "Reduktion"], a: 0, m: "Verliert Elektronen. Oxidation.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "KGV der Elektronen finden." },
      { t: "Weißer Phosphor.", q: "Welches ist die Reduktion?", o: ["Bildung von PH₃ (-3)", "Bildung von H₂PO₂⁻ (+1)"], a: 0, m: "Sinkt auf -3 (Reduktion).", step2Hint: "OH⁻ und H₂O hinzufügen.", step3Hint: "Halbreaktionen multiplizieren." },
      { t: "Kupfer und Schwefelsäure.", q: "Sulfat (SO₄²⁻) zu SO₂. Wie viele e- absorbiert Schwefel?", o: ["2 Elektronen", "4 Elektronen"], a: 0, m: "Absorbiert 2 Elektronen.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "Elektronen ausgleichen." },
      { t: "Chrom oxidiert.", q: "Basisches Medium. Wie Wasserstoff ausgleichen?", o: ["Mit H₂O und OH⁻", "Mit H⁺"], a: 0, m: "Korrekt, niemals H⁺ in basischem Medium.", step2Hint: "H₂O und OH⁻ hinzufügen.", step3Hint: "Multiplizieren für KGV." },
      { t: "Salpetersäure auf Bismutsulfid.", q: "Sulfid (S²⁻) oxidiert zu Schwefel (S).", o: ["Verliert 2 Elektronen", "Gewinnt 2 Elektronen"], a: 0, m: "Verliert 2 Elektronen.", step2Hint: "H₂O und H⁺ hinzufügen.", step3Hint: "Elektronenmultiplikatoren anpassen." }
    ],
    genExplanation: (lvl) => {
      if (!lvl) return "Fehler.";
      const mcm = RedoxEngine.getMCM(lvl.eOx || 1, lvl.eRed || 1);
      return `<strong style="color:#00f2ff; font-size: 24px;">🔬 REDOX-ANALYSE</strong><br/><br/>
      <span style="color:#00f2ff">Oxidation:</span><br/>${lvl.hOx}<br/><br/>
      <span style="color:#ff0055">Reduktion:</span><br/>${lvl.hRed}<br/><br/>
      💡 <em>Verwenden Sie das KGV (<strong style="color:#ffea00">${mcm}e⁻</strong>).</em>`;
    }
  }
};

const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

const getRank = (xp) => {
  const RANKS = [ { name: "NEÓFITO", xp: 0, color: "#888" }, { name: "TÉCNICO", xp: 500, color: "#4CAF50" }, { name: "ALQUIMISTA", xp: 1500, color: "#2196F3" }, { name: "LORD CUÁNTICO", xp: 3000, color: "#9C27B0" }, { name: "ARQUITECTO", xp: 5000, color: "#FFD700" } ];
  for (let i = RANKS.length - 1; i >= 0; i--) if (xp >= RANKS[i].xp) return RANKS[i];
  return RANKS[0];
};

/* ============================================================
   🎥 6. NÚCLEO 3D (CÁMARA INTELIGENTE PARA MÓVILES)
============================================================ */
const CameraRig = ({ phase, isExploding, isErrorShake, isMobile }) => {
  useFrame((state) => {
    const baseZ = isMobile ? 35 : 25; // Zoom dinámico para móviles
    if (isExploding) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 100) * 2;
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 120) * 1.5;
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, baseZ + 5, 0.2);
    } else if (isErrorShake) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.3;
      state.camera.position.y = (isMobile ? 0 : 2) + Math.cos(state.clock.elapsedTime * 60) * 0.3;
    } else if (phase === 'TRANSFER' || phase === 'WIN') {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(state.clock.elapsedTime * 60) * 0.4, 0.5);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, (isMobile ? 0 : 2) + Math.cos(state.clock.elapsedTime * 70) * 0.4, 0.5);
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, isMobile ? 0 : 2, baseZ), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const AtomCluster = ({ symbol, color, count, basePosition, active, isError, isExploding }) => {
  const group = useRef();
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * (isExploding ? 15 : active ? 4 : (isError ? 8 : 0.5));
      group.current.position.y = basePosition[1] + Math.sin(state.clock.elapsedTime * 3 + basePosition[0]) * (active ? 0.8 : 0.2);
      if(isExploding) group.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 30)*0.5);
    }
  });

  const safeCount = Math.max(1, Math.min(count || 1, 15));
  return (
    <group position={basePosition}>
      <group ref={group}>
        {[...Array(safeCount)].map((_, i) => {
          const radius = safeCount > 1 ? 1.5 + (safeCount * 0.15) : 0;
          const angle = (i / safeCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <group key={i} position={[x, 0, z]}>
              <mesh>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshPhysicalMaterial color={isExploding ? "#ff4400" : isError ? "#ff0000" : color} emissive={isExploding ? "#ff8800" : isError ? "#ff0000" : color} emissiveIntensity={isExploding ? 20 : active ? 10 : (isError ? 5 : 2)} metalness={0.9} roughness={0.1} clearcoat={1} transmission={0.2} ior={1.5} />
              </mesh>
              <mesh rotation={[Math.PI/2, 0, 0]}>
                <torusGeometry args={[1.4, 0.05, 16, 64]} />
                <meshBasicMaterial color={isExploding ? "#ff0000" : isError ? "#ff0000" : (active ? "#fff" : color)} transparent opacity={0.5} />
              </mesh>
              <Sparkles count={40} scale={3} size={6} color={isExploding ? "#ff4400" : isError ? "#ff0000" : color} speed={active || isError ? 10 : 2} />
            </group>
          );
        })}
      </group>
      <Html position={[0, -4.5, 0]} center zIndexRange={[100,0]}>
        <div className={isExploding || isError ? 'hud-pulse' : ''} style={{ background: isExploding ? 'rgba(255,0,0,0.9)' : isError ? 'rgba(255,0,0,0.8)' : `rgba(0,10,20,0.9)`, border: `2px solid ${isExploding || isError ? '#ff0000' : color}`, padding: '10px 30px', borderRadius: '10px', color: '#fff', fontFamily: 'Orbitron', fontWeight: '900', fontSize: '28px', boxShadow: `0 0 30px ${isExploding || isError ? '#ff0000' : color}88`, whiteSpace:'nowrap' }}>
          {safeCount}{symbol}
        </div>
      </Html>
    </group>
  );
};

const SmartMolecule = ({ formula, position, scale = 1, active, isExploding, count }) => {
  const group = useRef();
  const atomsData = useMemo(() => RedoxEngine.parseMolecule(formula), [formula]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * (isExploding ? 10 : active ? 2 : 0.5);
      group.current.rotation.z += delta * (isExploding ? 5 : active ? 1 : 0.2);
    }
  });

  if (!atomsData.length) return null;
  const core = atomsData[0];
  const satellites = atomsData.slice(1);
  const coreColor = RedoxEngine.getAtomColor(core.symbol);

  const safeCount = Math.max(1, Math.min(count || 1, 10));
  
  return (
    <group position={position}>
      {[...Array(safeCount)].map((_, cIdx) => {
        const globalRadius = safeCount > 1 ? 2.5 + (safeCount * 0.2) : 0;
        const globalAngle = (cIdx / safeCount) * Math.PI * 2;
        const gx = Math.cos(globalAngle) * globalRadius;
        const gz = Math.sin(globalAngle) * globalRadius;

        return (
          <group key={`mol-${cIdx}`} position={[gx, 0, gz]} scale={scale} ref={cIdx === 0 ? group : null}>
            <Sphere args={[1, 32, 32]}>
              <meshPhysicalMaterial color={isExploding ? '#ff0000' : coreColor} emissive={coreColor} emissiveIntensity={active ? 2 : 0.5} roughness={0.1} metalness={0.8} clearcoat={1} />
            </Sphere>
            {satellites.map((sat, sIdx) => {
              const satColor = RedoxEngine.getAtomColor(sat.symbol);
              return [...Array(sat.count)].map((_, i) => {
                const angle = (i / sat.count) * Math.PI * 2;
                const radius = 1.8 + (sIdx * 0.8);
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                return (
                  <group key={`sat-${sIdx}-${i}`}>
                    <Line points={[[0,0,0], [x,y,0]]} color="#ffffff" transparent opacity={0.3} lineWidth={2} />
                    <Sphere args={[0.5, 16, 16]} position={[x, y, 0]}>
                      <meshPhysicalMaterial color={isExploding ? '#ff0000' : satColor} emissive={satColor} emissiveIntensity={active ? 1.5 : 0.5} roughness={0.2} metalness={0.5} />
                    </Sphere>
                  </group>
                );
              });
            })}
            {active && <Sparkles count={50} scale={4} size={4} speed={4} color={coreColor} />}
          </group>
        );
      })}
      <Html position={[0, -5.5, 0]} center zIndexRange={[100,0]}>
        <div className={isExploding ? 'hud-pulse' : ''} style={{ background: isExploding ? 'rgba(255,0,0,0.9)' : `rgba(0,10,20,0.9)`, border: `2px solid ${isExploding ? '#ff0000' : coreColor}`, padding: '10px 30px', borderRadius: '10px', color: '#fff', fontFamily: 'Orbitron', fontWeight: '900', fontSize: '28px', boxShadow: `0 0 30px ${isExploding ? '#ff0000' : coreColor}88`, whiteSpace:'nowrap' }}>
          {safeCount}{formula}
        </div>
      </Html>
    </group>
  );
};

const ElectronBeam = ({ start, end, active, isMobile }) => {
  const lineRef = useRef();
  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.dashOffset -= 0.15;
      lineRef.current.material.opacity = Math.sin(state.clock.elapsedTime * 40) * 0.5 + 0.5;
    }
  });

  if (!active) return null;
  // Curva Inteligente adaptada a móviles
  const midPoint = isMobile ? new THREE.Vector3(6, 0, 0) : new THREE.Vector3(0, 6, 0);
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start), 
    midPoint, 
    new THREE.Vector3(...end)
  );
  
  const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);

  return (
    <mesh ref={lineRef} geometry={tubeGeom}>
      <meshBasicMaterial color="#00f2ff" transparent opacity={0.9} />
      <Sparkles count={400} scale={[isMobile? 5 : 20, isMobile? 20 : 10, 3]} position={midPoint.toArray()} size={12} speed={25} color="#00f2ff" />
      <pointLight position={midPoint.toArray()} intensity={10} color="#00f2ff" distance={20} />
    </mesh>
  );
};

/* ============================================================
   🎮 7. MÁQUINA DE ESTADOS PRINCIPAL (SISTEMA GOD TIER)
============================================================ */
function RedoxBalancer() {
  const isMobile = useMobile(); // 🔥 Inyectado
  const storeLanguage = useGameStore(state => state.language);
  const language = storeLanguage || "es";
  const resetProgress = useGameStore(state => state.resetProgress) || (() => window.location.reload());

  const safeLang = DICT[language] ? language : 'es';
  const dict = DICT[safeLang];
  const lCode = LANG_MAP[safeLang];

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  
  const [step, setStep] = useState(1); 
  const [actionCount, setActionCount] = useState(0); 
  const [interruptQuiz, setInterruptQuiz] = useState(null); 
  
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [clicks, setClicks] = useState(0);

  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [cH2O, setCH2O] = useState(0);
  const [cH, setCH] = useState(0);
  const [cOH, setCOH] = useState(0);

  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [aiState, setAiState] = useState("Q");
  const [errorMath, setErrorMath] = useState("");
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [helpActive, setHelpActive] = useState(false);

  const rawLevel = CHEM_DB[levelIdx] || CHEM_DB[0];
  const aiLevelData = dict.levels[levelIdx] || dict.levels[0];
  const combinedLevel = { ...rawLevel, ...aiLevelData };

  const currentRank = getRank(xp);
  const eLost = c1 * (combinedLevel.eOx || 1);
  const eGained = c2 * (combinedLevel.eRed || 1);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    sfx.init();
    return () => {
      isMounted.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive) interval = setInterval(() => setTime(t => t + 1), 1000);
    else if (interval) clearInterval(interval);
    return () => { if(interval) clearInterval(interval); }
  }, [timerActive]);

  const handleUpdateCoef = useCallback((side, delta) => {
    sfx.click();
    
    setActionCount(prev => {
      const next = prev + 1;
      if (next >= 6) {
        const randomQ = dict.interrupts[Math.floor(Math.random() * dict.interrupts.length)];
        setInterruptQuiz(randomQ);
        setPhase("INTERRUPT");
        setAiState("Q_INTERRUPT");
        triggerVoice(randomQ.q, lCode); 
        return 0; 
      }
      return next;
    });

    if (side === 'c1') setC1(prev => Math.max(1, prev + delta));
    if (side === 'c2') setC2(prev => Math.max(1, prev + delta));
    if (side === 'h2o') setCH2O(p => Math.max(0, p + delta));
    if (side === 'h') setCH(p => Math.max(0, p + delta));
    if (side === 'oh') setCOH(p => Math.max(0, p + delta));
    setClicks(prev => prev + 1);
  }, [dict.interrupts, lCode]);

  const handleAiAns = useCallback((idx, isInterrupt = false) => {
    const activeQuiz = isInterrupt ? interruptQuiz : combinedLevel;
    
    if (idx === activeQuiz.a) {
      sfx.success(); 
      setAiState("FEEDBACK");
      triggerVoice(activeQuiz.m, lCode);
      
      setTimeout(() => { 
        if (!isMounted.current) return; 
        setPhase("GAME"); 
        if (!isInterrupt && step === 1) {
          setStep(2); 
          triggerVoice(combinedLevel.step2Hint || dict.ui.step2Title, lCode);
        }
        setTimerActive(true); 
      }, 3500);
    } else {
      sfx.error(); 
      setIsErrorShake(true);
      setAiState("MICRO_CLASS");
      triggerVoice(dict.ui.microClassTitle, lCode); 
      setTimeout(() => setIsErrorShake(false), 1000);
    }
  }, [combinedLevel, interruptQuiz, step, lCode, dict.ui.microClassTitle, dict.ui.step2Title]);

  const handleVerifyMass = () => {
    if (combinedLevel.env === "Neutral") {
        sfx.levelUp(); 
        setStep(3); 
        setErrorMath(""); 
        triggerVoice(combinedLevel.step3Hint || dict.ui.step3Title, lCode);
        return;
    }

    const isMassOk = RedoxEngine.validateMass(cH2O, cH, cOH, combinedLevel);
    if (isMassOk) {
      sfx.levelUp(); 
      setStep(3); 
      setErrorMath(""); 
      triggerVoice(combinedLevel.step3Hint || dict.ui.step3Title, lCode);
    } else {
      sfx.error(); 
      setIsErrorShake(true); 
      setErrorMath(dict.hints.H2O_IMBALANCE);
      triggerVoice(dict.hints.H2O_IMBALANCE, lCode);
      setTimeout(() => setIsErrorShake(false), 1000);
    }
  };

  const handleVerifyCharge = () => {
    setTimerActive(false);
    const result = RedoxEngine.validateCharge(c1, c2, combinedLevel);

    if (result.isBalanced) {
      sfx.transfer();
      setPhase("TRANSFER");
      setStreak(s => s + 1);
      setXp(p => p + 150 + (streak * 50));
      setTimeout(() => {
        if (!isMounted.current) return;
        sfx.success();
        setPhase("WIN");
        triggerVoice(dict.ui.successMessage, lCode);
      }, 2000);
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
      sfx.error(); 
      setIsErrorShake(true); 

      let feedback = dict.hints.GENERIC;
      if(result.errorType === "NOT_SIMPLIFIED") feedback = dict.hints.NOT_SIMPLIFIED;
      else if(result.errorType === "EXCESS_LOST") feedback = dict.hints.EXCESS_LOST;
      else if(result.errorType === "DEFICIT_LOST") feedback = dict.hints.DEFICIT_LOST;

      setErrorMath(feedback);
      triggerVoice(feedback, lCode);
      
      if (result.eDiff > 12) {
        sfx.explosion(); setIsExploding(true);
        setTimeout(() => { if(isMounted.current) setPhase("GAMEOVER"); }, 3000);
      } else {
        setTimeout(() => { if(isMounted.current) setIsErrorShake(false); }, 1000);
      }
    }
  };

  const loadLevel = (idx) => {
    if (!isMounted.current) return;
    if (idx >= totalLevels) { setPhase("BOOT"); setLevelIdx(0); setXp(0); return; }
    setLevelIdx(idx); 
    setStep(1); 
    setActionCount(0);
    setC1(1); setC2(1); setCH2O(0); setCH(0); setCOH(0); 
    setErrorMath(""); setIsErrorShake(false); setIsExploding(false); setHelpActive(false);
    setTime(0); setTimerActive(false); setMistakes(0); setClicks(0);
    setPhase("THEORY");
    triggerVoice(dict.ai.intro, lCode);
  };

  const invokeAI = useCallback(() => {
    sfx.aiPop(); setPhase("AI"); setAiState("INFO"); 
    triggerVoice(dict.ui.aiTitle, lCode);
  }, [lCode, dict.ui.aiTitle]);

  const toggleHelp = useCallback(() => {
    sfx.aiPop(); setHelpActive(true); 
    triggerVoice(RedoxEngine.getMassBalanceGuide(combinedLevel.env, dict), lCode);
  }, [combinedLevel.env, dict, lCode]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    resetProgress();
    window.location.reload(); 
  };

  /* ================= VISTAS UI ================= */
  if (phase === "BOOT") return (
    <div style={ui.overlayFull}>
      <div className="hud-glitch-text" style={ui.glitchText}>PROTOCOLO NANO-CORE V28</div>
      <h1 className="hud-glow" style={ui.titleGlow}>{dict.ui.title}</h1>
      <p style={{color:'#ffea00', letterSpacing:'5px', fontSize:'clamp(16px, 3vw, 22px)', marginBottom:'50px', fontWeight:'bold', textAlign:'center'}}>
        {totalLevels} {dict.ui.mission}S
      </p>
      <button className="hud-btn" style={ui.btnHex('#00f2ff')} onClick={() => { sfx.click(); loadLevel(0); }}>{dict.ui.start}</button>
    </div>
  );

  if (phase === "GAMEOVER") return (
    <div style={{...ui.overlayFull, background:'radial-gradient(circle at center, #550000 0%, #000 100%)', zIndex: 3000}}>
      <h1 className="hud-glow" style={{...ui.titleGlow, color: '#ff0000', textShadow: '0 0 50px #ff0000'}}>{dict.ui.explTitle}</h1>
      <p style={{fontSize:'clamp(18px, 4vw, 30px)', color:'#fff', margin:'30px 0'}}>{dict.ui.explMsg}</p>
      <button className="hud-btn" style={ui.btnHex('#ff0000')} onClick={() => loadLevel(levelIdx)}>{dict.ui.btnRetry}</button>
      <button className="hud-btn-ghost" style={{...ui.btnGhost, marginTop:'30px'}} onClick={handleBack}>{dict.ui.btnBack}</button>
    </div>
  );

  return (
    <div style={ui.screen}>
      {/* HEADER DE NAVEGACIÓN Y AYUDA */}
      <div style={ui.topControls}>
        <button className="hud-btn-ghost" style={ui.backBtn} onClick={handleBack}>{dict.ui.btnBack}</button>
        {(phase === "GAME") && step > 1 && !isExploding && (
          <div style={{display:'flex', gap:'10px'}}>
            <button className="hud-btn-ghost" style={ui.aiBtn} onClick={invokeAI}>🧠 {dict.ui.aiBtn}</button>
            <button className="hud-btn-ghost" style={ui.helpBtn} onClick={toggleHelp}>{dict.ui.helpBtn}</button>
          </div>
        )}
      </div>

      {/* HUD SUPERIOR: FÓRMULA, RANGO Y GUÍA TÁCTICA */}
      <div style={ui.topHudWrapper}>
        <div style={ui.glassPanel}>
          <div style={{display:'flex', flexWrap: 'wrap', justifyContent:'space-between', alignItems:'center', width: '100%', marginBottom:'10px', borderBottom:'1px solid #444', paddingBottom:'15px', gap: '10px'}}>
            <div style={ui.levelBadge}>{dict.ui.mission} {levelIdx + 1} / {totalLevels}</div>
            {streak > 1 && (
              <div className="hud-pulse" style={{color:'#ffea00', fontSize:'clamp(16px, 3vw, 24px)', fontWeight:'bold'}}>
                🔥 COMBO x{streak}
              </div>
            )}
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
              <div style={{color:currentRank.color, fontWeight:'bold', fontSize:'clamp(14px, 2.5vw, 20px)', letterSpacing:'2px'}}>{dict.ui.rank}: {currentRank.name} ({xp} {dict.ui.xp})</div>
              <div style={{width:'clamp(100px, 20vw, 200px)', height:'10px', background:'#222', borderRadius:'5px', marginTop:'5px', overflow:'hidden'}}>
                <div style={{width:`${(xp%500)/500 * 100}%`, height:'100%', background:currentRank.color, transition:'width 0.5s'}}/>
              </div>
            </div>
          </div>
          <div style={ui.formula}>{combinedLevel.eq}</div>
          
          <div className="hud-pulse" style={{color:'#ffea00', marginTop:'15px', fontWeight:'bold', fontSize:'clamp(16px, 3.5vw, 22px)', letterSpacing:'2px', textAlign:'center'}}>
            {step === 1 ? dict.ui.step1Title : step === 2 ? dict.ui.step2Title : dict.ui.step3Title}
          </div>
          {/* 🔥 GUÍA TÁCTICA (HINTS ACTIVOS) EN EL HUD 🔥 */}
          {step === 2 && combinedLevel.step2Hint && (
             <div style={{marginTop:'10px', color:'#00f2ff', fontSize:'clamp(14px, 2.5vw, 18px)', fontWeight:'bold', background:'rgba(0,242,255,0.1)', padding:'10px 20px', borderRadius:'10px'}}>
               <span style={{color:'#fff'}}>🤖 IA:</span> {combinedLevel.step2Hint}
             </div>
          )}
          {step === 3 && combinedLevel.step3Hint && (
             <div style={{marginTop:'10px', color:'#ff00ff', fontSize:'clamp(14px, 2.5vw, 18px)', fontWeight:'bold', background:'rgba(255,0,255,0.1)', padding:'10px 20px', borderRadius:'10px'}}>
               <span style={{color:'#fff'}}>🤖 IA:</span> {combinedLevel.step3Hint}
             </div>
          )}
        </div>
      </div>

      {/* 🔬 PANEL LATERAL (Oculto en celular para dar espacio al 3D) */}
      {(phase === "GAME" || phase === "TRANSFER" || phase === "AI" || phase === "INTERRUPT") && step >= 2 && !isMobile && (
        <div style={ui.liveStatsPanel}>
          <h3 style={{margin:'0 0 15px 0', color:'#fff', letterSpacing:'2px', fontSize:'clamp(14px, 2vw, 18px)', borderBottom:'1px solid #555', paddingBottom:'10px'}}>{dict.ui.statsTitle}</h3>
          
          <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'16px'}}>Oxidación (Cede e-):</div>
          <div style={{color:'#fff', fontSize:'14px', marginBottom:'15px'}}>{combinedLevel.hOx}</div>
          
          <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'16px'}}>Reducción (Absorbe e-):</div>
          <div style={{color:'#fff', fontSize:'14px'}}>{combinedLevel.hRed}</div>
          
          {step === 3 && (
            <div style={{marginTop:'20px', borderTop:'1px solid #555', paddingTop:'15px'}}>
              <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'18px'}}>{dict.ui.eLost}: {eLost}</div>
              <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>{dict.ui.eGained}: {eGained}</div>
            </div>
          )}
        </div>
      )}

      {/* MODALES TEORÍA / WIN */}
      {phase === "THEORY" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#00f2ff')}>
            <h2 style={{color: '#00f2ff', letterSpacing:'6px', borderBottom: '2px solid #00f2ff55', paddingBottom: '20px', fontSize:'clamp(24px, 6vw, 45px)', margin:0}}>{dict.ui.theoryTitle}</h2>
            <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center'}}>
              <p style={{fontSize:'clamp(18px, 4vw, 34px)', lineHeight:'1.6', margin:'30px 0', color: '#fff'}}>{combinedLevel?.t}</p>
            </div>
            <button className="hud-btn" style={ui.btnSolid('#00f2ff')} onClick={() => { setPhase("GAME"); setTimerActive(true); }}>{dict.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {/* 🔥 MODAL DE LA IA */}
      {(phase === "AI" || phase === "INTERRUPT") && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#ff00ff')}>
            <h2 style={{color:'#ff00ff', letterSpacing:'6px', borderBottom: '2px solid #ff00ff55', paddingBottom: '20px', fontSize:'clamp(24px, 6vw, 45px)', margin:0}}>{dict.ui.aiTitle}</h2>
            <div style={{flex:1, overflowY:'auto', width:'100%', padding:'20px'}}>
              
              {(aiState === "Q" || aiState === "Q_INTERRUPT") ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <p style={{fontSize:'clamp(18px, 4vw, 32px)', margin:'20px 0', color: '#fff', fontWeight:'900'}}>
                    {aiState === "Q" ? combinedLevel.q : interruptQuiz?.q}
                  </p>
                  <div style={ui.grid}>
                    {(aiState === "Q" ? combinedLevel.o : interruptQuiz?.o)?.map((opt, i) => (
                      <button key={i} className="hud-btn-ghost" style={ui.btnOpt} onClick={() => handleAiAns(i, aiState === "Q_INTERRUPT")}>{opt}</button>
                    ))}
                  </div>
                </div>
              ) : aiState === "FEEDBACK" ? (
                <div style={{marginTop:'20px'}}>
                  <p style={{fontSize:'clamp(20px, 5vw, 40px)', color:'#0f0', margin:'40px 0', fontWeight:'bold'}}>{phase === "INTERRUPT" ? interruptQuiz?.m : combinedLevel.m}</p>
                </div>
              ) : aiState === "MICRO_CLASS" ? (
                <div style={{marginTop:'20px'}}>
                   <h3 style={{color: '#f00', fontSize: 'clamp(20px, 4vw, 32px)'}}>{dict.ui.microClassTitle}</h3>
                   <p style={{color: '#fff', fontSize: 'clamp(16px, 3.5vw, 26px)', lineHeight:'1.5'}}>{phase === "INTERRUPT" ? interruptQuiz?.m : combinedLevel.m}</p>
                   <button className="hud-btn" style={{...ui.btnSolid('#ff00ff'), marginTop:'40px'}} onClick={() => setAiState(phase === "INTERRUPT" ? "Q_INTERRUPT" : "Q")}>{dict.ui.btnRetry}</button>
                </div>
              ) : (
                <div style={{fontSize:'clamp(16px, 3vw, 28px)', color:'#fff', lineHeight:'1.8', textAlign:'left', background:'rgba(0,0,0,0.4)', padding:'30px', borderRadius:'15px'}} dangerouslySetInnerHTML={{__html: dict.genExplanation(combinedLevel)}}></div>
              )}
            </div>
            
            {aiState === "INFO" && (
              <button className="hud-btn" style={ui.btnSolid('#ff00ff')} onClick={()=>{setPhase("GAME"); setTimerActive(true); if (typeof window !== 'undefined') window.speechSynthesis.cancel();}}>{dict.ui.btnContinue}</button>
            )}
          </div>
        </div>
      )}

      {helpActive && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#ffea00')}>
            <h2 style={{color:'#ffea00', fontSize:'clamp(24px, 6vw, 45px)', borderBottom: '2px solid #ffea0055', paddingBottom: '20px', margin:0}}>{dict.ui.helpBtn}</h2>
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent: 'center'}}>
              <p style={{fontSize:'clamp(16px, 3.5vw, 28px)', color:'#fff', lineHeight:'1.6', textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '30px', borderRadius: '15px', whiteSpace:'pre-wrap'}}>{RedoxEngine.getMassBalanceGuide(combinedLevel.env, dict)}</p>
            </div>
            <button className="hud-btn" style={ui.btnSolid('#ffea00')} onClick={() => { setHelpActive(false); if (typeof window !== 'undefined') window.speechSynthesis.cancel(); }}>{dict.ui.btnContinue}</button>
          </div>
        </div>
      )}

      {phase === "WIN" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#0f0')}>
            <h2 className="hud-glow" style={{color:'#0f0', letterSpacing:'10px', fontSize:'clamp(30px, 8vw, 70px)', textShadow:'0 0 60px #0f0', margin:0}}>{dict.ui.successTitle}</h2>
            <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
              <p style={{fontSize:'clamp(18px, 4vw, 36px)', color:'#fff', margin:'30px 0', fontWeight:'bold'}}>{dict.ui.successMessage}</p>
              <div style={{background:'rgba(0,30,0,0.6)', padding:'clamp(20px, 4vw, 40px)', borderRadius:'20px', display:'inline-block', textAlign:'left', border:'2px solid #0f0', width: '100%'}}>
                <div style={{fontSize:'clamp(16px, 3.5vw, 28px)', color:'#ccc', margin:'15px 0'}}>{dict.ui.timeTaken} <span style={{color:'#fff', fontWeight:'bold'}}>{time}s</span></div>
                <div style={{fontSize:'clamp(16px, 3.5vw, 28px)', color:'#ccc', margin:'15px 0'}}>{dict.ui.clicksUsed} <span style={{color:'#fff', fontWeight:'bold'}}>{clicks}</span></div>
              </div>
            </div>
            <button className="hud-btn" style={ui.btnSolid('#0f0')} onClick={() => loadLevel(levelIdx + 1)}>{dict.ui.btnNext}</button>
          </div>
        </div>
      )}

      {/* 🔥 DOCK DE CONTROLES INFERIORES DINÁMICO POR FASES */}
      {(phase === "GAME" || phase === "TRANSFER" || isExploding) && !helpActive && (
        <div style={ui.dockContainer}>
          <div style={ui.dock}>

            {step === 1 && (
              <div style={{textAlign:'center', width:'100%'}}>
                 <h2 style={{color:'#ff00ff', fontSize:'clamp(20px, 4vw, 32px)', marginBottom:'15px', textShadow: '0 0 10px #ff00ff'}}>{dict.ui.step1Title}</h2>
                 <button className="hud-btn" style={ui.mainCheck('#ff00ff')} onClick={() => { setPhase("AI"); setAiState("Q"); triggerVoice(combinedLevel.q, lCode); }}>
                    {dict.ui.aiBtn}
                 </button>
              </div>
            )}

            {step === 2 && (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
                 {combinedLevel.env === "Neutral" ? (
                   <div style={{textAlign: 'center'}}>
                     <h2 style={{color:'#ffea00', fontSize:'clamp(20px, 4vw, 32px)', marginBottom:'15px', textShadow: '0 0 10px #ffea00'}}>{dict.ui.neutralTitle}</h2>
                     <p style={{fontSize:'clamp(16px, 3vw, 24px)', color:'#fff', marginBottom:'20px'}}>{dict.ui.neutralDesc}</p>
                     <button className="hud-btn" style={ui.mainCheck('#ffea00')} onClick={handleVerifyMass}>{dict.ui.btnSkip}</button>
                   </div>
                 ) : (
                   <>
                     <div style={{display:'flex', gap:'clamp(15px, 4vw, 40px)', flexWrap: 'wrap', justifyContent: 'center'}}>
                       
                       <div style={ui.controlGroup}>
                          <span style={{color:'#fff', fontSize:'clamp(16px, 3vw, 24px)', fontWeight:'bold'}}>H₂O</span>
                          <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                             <button className="hud-btn-ghost" style={ui.microBtn('#fff')} onClick={()=>handleUpdateCoef('h2o', -1)}>-</button>
                             <span style={ui.val('#fff')}>{cH2O}</span>
                             <button className="hud-btn-ghost" style={ui.microBtn('#fff')} onClick={()=>handleUpdateCoef('h2o', 1)}>+</button>
                          </div>
                       </div>
                       
                       {combinedLevel.env === "Ácido" && (
                         <div style={ui.controlGroup}>
                            <span style={{color:'#ffaa00', fontSize:'clamp(16px, 3vw, 24px)', fontWeight:'bold'}}>H⁺</span>
                            <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ffaa00')} onClick={()=>handleUpdateCoef('h', -1)}>-</button>
                               <span style={ui.val('#ffaa00')}>{cH}</span>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ffaa00')} onClick={()=>handleUpdateCoef('h', 1)}>+</button>
                            </div>
                         </div>
                       )}

                       {combinedLevel.env === "Básico" && (
                         <div style={ui.controlGroup}>
                            <span style={{color:'#ff00aa', fontSize:'clamp(16px, 3vw, 24px)', fontWeight:'bold'}}>OH⁻</span>
                            <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ff00aa')} onClick={()=>handleUpdateCoef('oh', -1)}>-</button>
                               <span style={ui.val('#ff00aa')}>{cOH}</span>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ff00aa')} onClick={()=>handleUpdateCoef('oh', 1)}>+</button>
                            </div>
                         </div>
                       )}
                     </div>
                     {errorMath && <div style={{color:'#f00', marginTop:'20px', fontWeight:'bold', fontSize:'clamp(14px, 3vw, 18px)'}}>{errorMath}</div>}
                     <button className="hud-btn" style={{...ui.mainCheck('#ffea00'), marginTop:'30px'}} onClick={handleVerifyMass}>{dict.ui.step2Title}</button>
                   </>
                 )}
              </div>
            )}

            {step === 3 && (
              <div style={{display:'flex', gap:'clamp(20px, 4vw, 40px)', flexWrap: 'wrap', justifyContent: 'center', width: '100%'}}>
                <div style={ui.controlGroup}>
                  <div style={{color:'#00f2ff', fontSize:'clamp(14px, 2.5vw, 18px)', fontWeight:'900', letterSpacing:'2px', marginBottom:'15px', textShadow:'0 0 10px #00f2ff'}}>{dict.ui.react}</div>
                  <div style={{display:'flex', gap:'clamp(10px, 2vw, 20px)', alignItems:'center'}}>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#00f2ff')} onClick={()=>handleUpdateCoef('c1', -1)} disabled={phase==='TRANSFER' || isExploding}>-</button>
                    <div style={ui.val('#00f2ff')}>{c1}</div>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#00f2ff')} onClick={()=>handleUpdateCoef('c1', 1)} disabled={phase==='TRANSFER' || isExploding}>+</button>
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'15px', alignItems:'center', justifyContent: 'center'}}>
                  <button className="hud-btn" style={ui.mainCheck('#00f2ff')} onClick={handleVerifyCharge} disabled={phase==='TRANSFER' || isExploding}>{dict.ui.btnCheck}</button>
                </div>

                <div style={ui.controlGroup}>
                  <div style={{color:'#ff0055', fontSize:'clamp(14px, 2.5vw, 18px)', fontWeight:'900', letterSpacing:'2px', marginBottom:'15px', textShadow:'0 0 10px #ff0055'}}>{dict.ui.prod}</div>
                  <div style={{display:'flex', gap:'clamp(10px, 2vw, 20px)', alignItems:'center'}}>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#ff0055')} onClick={()=>handleUpdateCoef('c2', -1)} disabled={phase==='TRANSFER' || isExploding}>-</button>
                    <div style={ui.val('#ff0055')}>{c2}</div>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#ff0055')} onClick={()=>handleUpdateCoef('c2', 1)} disabled={phase==='TRANSFER' || isExploding}>+</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* MOTOR DE RENDERIZADO THREE.JS */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
        <Canvas camera={{position:[0, 2, 25], fov:45}}>
          <color attach="background" args={['#000103']} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" />
          <directionalLight position={[-10, -10, -10]} intensity={1} color="#ff00ff" />
          <Stars count={5000} factor={6} fade speed={isExploding ? 15 : 1.5} />

          <Suspense fallback={null}>
            {/* Cámara Inteligente Inyectada */}
            <CameraRig phase={phase} isExploding={isExploding} isErrorShake={isErrorShake} isMobile={isMobile} />
            
            {/* Reposicionamiento Vectorial Condicional para Móvil */}
            {combinedLevel.formulaOx && step > 1 ? (
              <SmartMolecule formula={combinedLevel.formulaOx} position={isMobile ? [0, 8, 0] : [-10, 0, 0]} count={step === 3 ? c1 : 1} active={phase === 'TRANSFER' || phase === 'WIN'} isExploding={isExploding} />
            ) : (
              <AtomCluster symbol={combinedLevel.symOx} color="#00f2ff" count={step === 3 ? c1 : 1} basePosition={isMobile ? [0, 8, 0] : [-10, 0, 0]} active={phase === 'TRANSFER' || phase === 'WIN'} isError={isErrorShake} isExploding={isExploding} />
            )}

            {combinedLevel.formulaRed && step > 1 ? (
              <SmartMolecule formula={combinedLevel.formulaRed} position={isMobile ? [0, -6, 0] : [10, 0, 0]} count={step === 3 ? c2 : 1} active={phase === 'TRANSFER' || phase === 'WIN'} isExploding={isExploding} />
            ) : (
              <AtomCluster symbol={combinedLevel.symRed} color="#ff0055" count={step === 3 ? c2 : 1} basePosition={isMobile ? [0, -6, 0] : [10, 0, 0]} active={phase === 'TRANSFER' || phase === 'WIN'} isError={isErrorShake} isExploding={isExploding} />
            )}

            {/* Rayo Láser Inteligente Condicional */}
            <ElectronBeam start={isMobile ? [0, 6, 0] : [-8, 0, 0]} end={isMobile ? [0, -4, 0] : [8, 0, 0]} active={phase === 'TRANSFER'} isMobile={isMobile} />
          </Suspense>

          <EffectComposer>
            <Bloom intensity={phase === 'TRANSFER' ? 8 : (isExploding ? 10 : 3)} luminanceThreshold={0.1} />
            <ChromaticAberration offset={isExploding ? new THREE.Vector2(0.015, 0.015) : new THREE.Vector2(0.002, 0.002)} />
            <Scanline opacity={0.15} density={1.5} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}

// 🛡️ EXPORT FINAL
export default function SafeRedoxBalancer() {
  return (
    <GameErrorBoundary>
      <RedoxBalancer />
    </GameErrorBoundary>
  );
}

// 🎨 ESTILOS "GOD TIER UI" - ARQUITECTURA MOBILE-FIRST (FLUID TYPOGRAPHY & FLEX)
const ui = {
  screen: { 
    position: 'absolute', inset: 0, overflow: 'hidden', background: '#000', fontFamily: 'Orbitron, sans-serif',
    paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)'
  },
  
  overlayFull: { 
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh', 
    background: 'radial-gradient(circle at center, #001122 0%, #000 100%)', zIndex: 3000, position: 'relative',
    padding: 'clamp(15px, 4vw, 40px)', boxSizing: 'border-box', textAlign: 'center'
  },
  
  glitchText: { 
    color: '#00f2ff', fontSize: 'clamp(14px, 3vw, 32px)', letterSpacing: 'clamp(5px, 2vw, 20px)', 
    marginBottom: '10px', fontWeight: '900' 
  },
  
  titleGlow: { 
    color: '#00f2ff', fontSize: 'clamp(40px, 8vw, 110px)', letterSpacing: 'clamp(5px, 2vw, 15px)', 
    textShadow: '0 0 clamp(15px, 4vw, 40px) rgba(0, 242, 255, 0.8)', margin: '0 0 20px 0', textAlign: 'center', 
    fontWeight: '900', lineHeight: '1.1' 
  },
  
  btnHex: (c) => ({ 
    padding: 'clamp(15px, 3vw, 25px) clamp(30px, 6vw, 60px)', background: `linear-gradient(45deg, rgba(0,0,0,0.9), ${c}44)`, 
    border: `clamp(1px, 0.5vw, 3px) solid ${c}`, color: c, fontSize: 'clamp(16px, 4vw, 32px)', fontWeight: '900', 
    cursor: 'pointer', borderRadius: 'clamp(10px, 2vw, 20px)', fontFamily: 'Orbitron', transition: 'all 0.3s ease', 
    boxShadow: `0 0 clamp(20px, 4vw, 50px) ${c}66`, letterSpacing: 'clamp(2px, 1vw, 4px)' 
  }),
  
  btnGhost: { 
    padding: 'clamp(10px, 2vw, 15px) clamp(20px, 4vw, 40px)', background: 'transparent', border: 'clamp(1px, 0.5vw, 2px) solid #555', 
    color: '#aaa', fontSize: 'clamp(12px, 3vw, 18px)', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 10px)', 
    fontFamily: 'Orbitron', transition: '0.3s', fontWeight: 'bold', letterSpacing: 'clamp(1px, 0.5vw, 3px)' 
  },
  
  topControls: { 
    position: 'absolute', top: 'clamp(10px, 3vh, 40px)', left: 'clamp(10px, 3vw, 40px)', right: 'clamp(10px, 3vw, 40px)', 
    display: 'flex', justifyContent: 'space-between', zIndex: 500, pointerEvents: 'none', flexWrap: 'wrap', gap: '10px' 
  },
  
  backBtn: { 
    padding: 'clamp(8px, 1.5vw, 15px) clamp(15px, 3vw, 30px)', background: 'rgba(255,0,85,0.15)', border: 'clamp(1px, 0.5vw, 2px) solid #ff0055', 
    color: '#ff0055', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 15px)', fontFamily: 'Orbitron', fontWeight: '900', 
    backdropFilter: 'blur(10px)', letterSpacing: '1px', transition: '0.3s', boxShadow: '0 0 clamp(10px, 2vw, 30px) rgba(255,0,85,0.4)', 
    pointerEvents: 'auto', fontSize: 'clamp(10px, 2.5vw, 18px)' 
  },
  
  helpBtn: { 
    padding: 'clamp(8px, 1.5vw, 15px) clamp(15px, 3vw, 30px)', background: 'rgba(255,234,0,0.15)', border: 'clamp(1px, 0.5vw, 2px) solid #ffea00', 
    color: '#ffea00', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 15px)', fontFamily: 'Orbitron', fontWeight: '900', 
    backdropFilter: 'blur(10px)', letterSpacing: '1px', transition: '0.3s', boxShadow: '0 0 clamp(10px, 2vw, 30px) rgba(255,234,0,0.4)', 
    pointerEvents: 'auto', fontSize: 'clamp(10px, 2.5vw, 18px)' 
  },
  
  aiBtn: { 
    padding: 'clamp(8px, 1.5vw, 15px) clamp(15px, 3vw, 30px)', background: 'rgba(255,0,255,0.15)', border: 'clamp(1px, 0.5vw, 2px) solid #ff00ff', 
    color: '#ff00ff', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 15px)', fontFamily: 'Orbitron', fontWeight: '900', 
    backdropFilter: 'blur(10px)', letterSpacing: '1px', transition: '0.3s', boxShadow: '0 0 clamp(10px, 2vw, 30px) rgba(255,0,255,0.4)', 
    pointerEvents: 'auto', fontSize: 'clamp(10px, 2.5vw, 18px)' 
  },
  
  topHudWrapper: { 
    position: 'absolute', top: 'clamp(70px, 12vh, 130px)', left: '0', width: '100%', display: 'flex', 
    justifyContent: 'center', zIndex: 100, pointerEvents: 'none', padding: '0 clamp(10px, 2vw, 40px)', boxSizing: 'border-box' 
  },
  
  glassPanel: { 
    background: 'rgba(0,15,30,0.85)', border: 'clamp(1px, 0.5vw, 3px) solid #00f2ff', padding: 'clamp(15px, 3vw, 40px) clamp(20px, 5vw, 80px)', 
    borderRadius: 'clamp(15px, 3vw, 30px)', textAlign: 'center', backdropFilter: 'blur(20px)', boxShadow: '0 0 clamp(30px, 6vw, 80px) rgba(0,242,255,0.3)', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '800px', boxSizing: 'border-box' 
  },
  
  levelBadge: { 
    background: '#ff0055', color: '#fff', padding: 'clamp(4px, 1vw, 10px) clamp(10px, 2vw, 30px)', 
    borderRadius: 'clamp(4px, 1vw, 10px)', display: 'inline-block', fontSize: 'clamp(12px, 3vw, 22px)', fontWeight: '900', letterSpacing: 'clamp(1px, 0.5vw, 4px)' 
  },
  
  formula: { 
    fontSize: 'clamp(24px, 5.5vw, 75px)', fontWeight: '900', letterSpacing: 'clamp(1px, 0.5vw, 6px)', display: 'flex', 
    alignItems: 'center', marginTop: 'clamp(5px, 1.5vh, 15px)', flexWrap: 'wrap', justifyContent: 'center', color: '#fff' 
  },
  
  liveStatsPanel: { 
    position: 'absolute', top: 'clamp(200px, 35vh, 380px)', right: 'clamp(10px, 2vw, 50px)', zIndex: 100, background: 'rgba(0,15,30,0.9)', 
    border: 'clamp(1px, 0.5vw, 2px) solid #ffea00', padding: 'clamp(15px, 3vw, 30px)', borderRadius: 'clamp(8px, 1.5vw, 15px)', 
    backdropFilter: 'blur(20px)', fontFamily: 'Orbitron', fontSize: 'clamp(12px, 2.5vw, 20px)', boxShadow: '0 0 clamp(15px, 3vw, 40px) rgba(255,234,0,0.2)', 
    maxWidth: 'clamp(150px, 40vw, 350px)' 
  },
  
  dockContainer: { 
    position: 'absolute', bottom: 'clamp(10px, 3vh, 60px)', left: '0', width: '100%', display: 'flex', 
    justifyContent: 'center', zIndex: 150, pointerEvents: 'none', padding: '0 clamp(5px, 1vw, 20px)', boxSizing: 'border-box' 
  },
  
  dock: { 
    display: 'flex', gap: 'clamp(15px, 3vw, 80px)', alignItems: 'center', background: 'rgba(0,10,20,0.95)', 
    padding: 'clamp(15px, 3vw, 30px) clamp(15px, 4vw, 60px)', borderRadius: 'clamp(20px, 4vw, 50px)', border: 'clamp(1px, 0.5vw, 3px) solid #333', 
    boxShadow: '0 clamp(15px, 3vw, 40px) rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)', 
    pointerEvents: 'auto', position: 'relative', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1200px'
  },
  
  controlGroup: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  
  roundBtnSm: (c) => ({ 
    width: 'clamp(40px, 10vw, 80px)', height: 'clamp(40px, 10vw, 80px)', borderRadius: '50%', border: `clamp(1px, 0.5vw, 4px) solid ${c}88`, 
    background: '#111', color: c, fontSize: 'clamp(20px, 6vw, 45px)', cursor: 'pointer', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', paddingBottom: 'clamp(2px, 0.5vw, 10px)', pointerEvents: 'auto', transition: 'transform 0.2s', flexShrink: 0, boxShadow: `0 0 clamp(10px, 2vw, 20px) ${c}44`
  }),
  
  microBtn: (c) => ({ 
    width: 'clamp(30px, 8vw, 50px)', height: 'clamp(30px, 8vw, 50px)', borderRadius: '50%', border: `1px solid ${c}88`, 
    background: '#111', color: c, fontSize: 'clamp(16px, 5vw, 30px)', cursor: 'pointer', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', paddingBottom: 'clamp(2px, 0.5vw, 5px)', pointerEvents: 'auto', flexShrink: 0
  }),
  
  val: (c) => ({ fontSize: 'clamp(30px, 8vw, 70px)', fontWeight: '900', color: c, width: 'clamp(40px, 10vw, 80px)', textAlign: 'center', textShadow: `0 0 clamp(10px, 2vw, 30px) ${c}` }),
  
  mainCheck: (c='#00f2ff') => ({ 
    padding: 'clamp(15px, 3vw, 25px) clamp(30px, 6vw, 60px)', background: c, border: 'none', color: '#000', 
    fontWeight: '900', fontSize: 'clamp(16px, 4vw, 24px)', cursor: 'pointer', borderRadius: 'clamp(10px, 2vw, 20px)', 
    fontFamily: 'Orbitron', boxShadow: `0 0 clamp(30px, 6vw, 60px) ${c}88`, letterSpacing: 'clamp(2px, 0.5vw, 4px)', 
    transition: '0.3s', pointerEvents: 'auto', width: '100%' 
  }),
  
  modalBg: { position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,5,15,0.95)', backdropFilter:'blur(40px)', pointerEvents: 'auto', padding: 'clamp(10px, 3vw, 40px)' },
  
  glassModal: (c) => ({ 
    border: `clamp(1px, 0.5vw, 3px) solid ${c}`, background: 'rgba(0,15,30,0.85)', padding: 'clamp(20px, 5vw, 50px) clamp(20px, 6vw, 80px)', 
    borderRadius: 'clamp(20px, 4vw, 40px)', textAlign: 'center', maxWidth: '1200px', maxHeight: '90dvh', overflowY: 'auto', 
    width: '100%', boxShadow: `0 0 clamp(50px, 10vw, 100px) ${c}66`, backdropFilter: 'blur(20px)', display: 'flex', 
    flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' 
  }),
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 30vw, 250px), 1fr))', gap: 'clamp(15px, 3vw, 30px)', marginTop: 'clamp(20px, 4vw, 40px)', width: '100%' },
  
  btnOpt: { 
    padding: 'clamp(15px, 3vw, 30px)', background: 'rgba(255,255,255,0.03)', border: 'clamp(1px, 0.5vw, 2px) solid #555', 
    color: '#fff', borderRadius: 'clamp(10px, 2vw, 15px)', fontSize: 'clamp(16px, 4vw, 24px)', cursor: 'pointer', 
    fontFamily: 'Orbitron', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' 
  },
  
  btnSolid: (c) => ({ 
    marginTop: 'clamp(20px, 4vw, 30px)', padding: 'clamp(15px, 3vw, 30px) clamp(40px, 8vw, 80px)', background: c, 
    color: '#000', fontWeight: '900', fontSize: 'clamp(18px, 4vw, 28px)', borderRadius: 'clamp(15px, 3vw, 20px)', 
    border: 'none', cursor: 'pointer', fontFamily: 'Orbitron', letterSpacing: 'clamp(2px, 0.5vw, 4px)', boxShadow: `0 0 clamp(30px, 6vw, 60px) ${c}99` 
  })
};

// ANIMACIONES CSS Y EVENTOS
if (typeof document !== 'undefined' && !document.getElementById("redox-styles-v36")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "redox-styles-v36";
  styleSheet.innerText = `
    @keyframes pulse { 0% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px #ff0000; } 50% { transform: scale(1.02); opacity: 0.8; box-shadow: 0 0 60px #ff0000; } 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px #ff0000; } }
    .hud-pulse { animation: pulse 1s infinite; }
    .hud-btn:active { transform: scale(0.95); }
    .hud-btn-ghost:active { transform: scale(0.95); }
    .hud-btn-ghost:hover { border-color: #00f2ff !important; background: rgba(0,242,255,0.1) !important; color: #fff !important; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: #00f2ff55; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #00f2ff; }
  `;
  document.head.appendChild(styleSheet);
}