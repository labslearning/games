import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Html, Line, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

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
          <h1 style={{ color: '#f00', fontSize: '40px' }}>⚠️ ERROR CRÍTICO DEL SISTEMA</h1>
          <p style={{ fontSize: '20px', maxWidth: '80%', textAlign: 'center', margin: '20px 0' }}>{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '15px 30px', fontSize: '20px', background: '#f00', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '10px' }}>REINICIAR MÓDULO</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR QUÍMICO PURO (MASAS Y CARGAS)
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

  static getMassBalanceGuide(env) {
    if (env === "Ácido") return "Medio Ácido: \n1. Iguala O con H₂O.\n2. Iguala H con H⁺.";
    if (env === "Básico") return "Medio Básico: \n1. Iguala O con H₂O.\n2. Iguala H con H₂O y añade OH⁻.";
    return "Medio Neutro: \nLos átomos ya están balanceados en este nivel.";
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
      window.speechSynthesis.speak(globalUtterance);
    } catch (e) { }
  }, 100);
};

/* ============================================================
   🌍 4. BASE DE DATOS QUÍMICA INTEGRAL (20 NIVELES)
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
   🌍 5. DICCIONARIO TRADUCIDO Y LÓGICA SOCRÁTICA
============================================================ */
const DICT = {
  es: {
    ui: { 
      start: "INICIAR CAMPAÑA", title: "REDOX BALANCER: GOD TIER", rank: "RANGO", xp: "XP", 
      theoryTitle: "BRIEFING TÁCTICO", theoryBtn: "ENTRAR AL NÚCLEO ➔", diagTitle: "ANÁLISIS COGNITIVO IA", 
      btnCheck: "SINTETIZAR Y VERIFICAR", btnBack: "⬅ ABORTAR", btnNext: "SIGUIENTE CRISIS ➔", 
      btnRetry: "REINTENTAR", aiTitle: "🤖 TUTOR IA SOCRÁTICO", btnContinue: "ENTENDIDO, IA", 
      react: "MULTIPLICADOR OXIDACIÓN", prod: "MULTIPLICADOR REDUCCIÓN",
      mission: "NIVEL", scan: "ESCANEAR ÁTOMOS", eLost: "e- Liberados", eGained: "e- Absorbidos", status: "ESTADO:",
      explTitle: "¡COLAPSO ESTRUCTURAL!", explMsg: "La descompensación provocó una fisión masiva en el reactor.",
      statsTitle: "SEPARACIÓN DE SEMIRREACCIONES", timeTaken: "Tiempo", clicksUsed: "Ajustes", 
      successTitle: "¡SISTEMA ESTABILIZADO!", successMessage: "Masa y carga en equilibrio perfecto.",
      helpBtn: "🤖 AYUDA", aiBtn: "🧠 CONSULTAR IA",
      step1Title: "FASE 1: IDENTIFICACIÓN SOCRÁTICA", step2Title: "FASE 2: BALANCE DE MASAS ATÓMICAS", step3Title: "FASE 3: BALANCE DE CARGAS Y CRUCE",
      microClassTitle: "📚 MICRO-CLASE DE REFUERZO"
    },
    hints: { 
      NOT_SIMPLIFIED: "Los electrones coinciden, pero debes usar la mínima expresión entera.", 
      EXCESS_LOST: "Estás liberando demasiados electrones. Aumenta la Reducción.", 
      DEFICIT_LOST: "Faltan electrones. Aumenta la Oxidación.", 
      GENERIC: "Fallo en la transferencia. Revisa el MCM de los electrones." 
    },
    interrupts: [
      { q: "¿Para qué sirve balancear la masa antes que la carga?", o: ["Para que los átomos no desaparezcan (Ley de Lavoisier)", "Para que se vea bonito"], a: 0, m: "La materia no se crea ni se destruye. Debes igualar los átomos de O y H antes de mover los electrones." },
      { q: "Si estás en medio ÁCIDO y te faltan Oxígenos, ¿qué agregas?", o: ["Agrego iones OH⁻", "Agrego moléculas de H₂O"], a: 1, m: "En medio ácido NUNCA agregas OH⁻. Usas el Agua (H₂O) para los Oxígenos." },
      { q: "Si la Oxidación libera 2e- y la Reducción absorbe 3e-, ¿Cuál es su MCM?", o: ["6 electrones", "5 electrones"], a: 0, m: "El Mínimo Común Múltiplo entre 2 y 3 es 6. Debes cruzar multiplicadores para llegar a 6." }
    ],
    levels: [
      { t: "Pila de Daniell. El Zinc se disuelve y el Cobre absorbe su energía.", q: "Fase 1: Identifica la oxidación (pierde e-)", o: ["El Cobre (Cu)", "El Zinc (Zn)"], a: 1, m: "¡Correcto! El Zinc pasa de 0 a +2. Perder electrones es oxidarse." },
      { t: "El Magnesio reacciona violentamente con iones de Plata.", q: "Identifica la reducción: ¿Cuántos e- necesita Ag⁺ para ser Plata neutra?", o: ["1 electrón", "2 electrones"], a: 0, m: "¡Bien! Absorbe 1 electrón." },
      { t: "Aluminio disolviéndose en medio ácido, liberando gas hidrógeno.", q: "El Aluminio pierde 3e- y el Hidrógeno gana 1e-. ¿Cuál es el MCM?", o: ["3 electrones", "6 electrones"], a: 0, m: "¡Exacto! El MCM es 3." },
      { t: "Corrosión masiva del hierro estructural en contacto con oxígeno.", q: "Al dividir la reacción: ¿qué rol juega el oxígeno gaseoso (O₂)?", o: ["Reductor", "Oxidante"], a: 1, m: "Correcto, el Oxígeno gana electrones, oxidando al Hierro." },
      { t: "Acumulador de plomo desestabilizado. Riesgo de explosión ácida.", q: "El Plomo está en dos estados. ¿El PbO₂ actúa como...?", o: ["Oxidante", "Reductor"], a: 0, m: "Exacto, el PbO₂ se reduce." },
      { t: "Permanganato altamente reactivo oxidando hierro en ácido.", q: "El Manganeso pasa de +7 en el MnO₄⁻ a +2. ¿Cuántos e- gana?", o: ["5 electrones", "7 electrones"], a: 0, m: "Gana 5e-. Luego balancearás oxígenos con agua." },
      { t: "Dicromato generando cloro gas venenoso.", q: "La molécula de Cr₂O₇²⁻ tiene DOS Cromos. Si cada uno gana 3e-, ¿el total es?", o: ["3 electrones", "6 electrones"], a: 1, m: "¡Excelente! 2 átomos x 3e- = 6e-." },
      { t: "Ácido Nítrico atacando el cableado de cobre principal.", q: "El Nitrato (NO₃⁻) pasa a (NO). ¿Qué pierde en el proceso?", o: ["Oxígenos", "Hidrógenos"], a: 0, m: "Pierde 2 oxígenos. Usa H₂O para compensar en Fase 2." },
      { t: "Peróxido inestable frente a Permanganato. Fuego inminente.", q: "¿Qué hace el Peróxido (H₂O₂) aquí?", o: ["Reduce al Permanganato", "Oxida al Permanganato"], a: 0, m: "Actúa como reductor, forzando al Manganeso a reducirse." },
      { t: "Cloro reaccionando consigo mismo (Dismutación en medio Básico).", q: "¿Qué es una dismutación?", o: ["Se oxida y reduce a la vez", "No cambia de estado"], a: 0, m: "¡Brillante! El Cl₂ se divide en Cl⁻ y ClO₃⁻." },
      { t: "Azufre ardiendo en ácido nítrico, nublando la visión.", q: "El Azufre puro (0) pasa a SO₂. ¿Cuál es su estado final?", o: ["+4", "-2"], a: 0, m: "El Oxígeno aporta -4, por lo que el Azufre debe ser +4." },
      { t: "Zinc en alcalino forzando a los nitratos a formar gas amonio.", q: "El Nitrógeno cae de +5 (NO₃⁻) a -3 (NH₄⁺). ¿Cuántos e- absorbe?", o: ["8 electrones", "2 electrones"], a: 0, m: "Salto masivo de 8 electrones." },
      { t: "Yodo y Tiosulfato desbalanceados. Falla en el sistema de vida.", q: "Oxidación: 2S₂O₃²⁻ a S₄O₆²⁻. ¿Cuántos e- se liberan en total?", o: ["1 electrón", "2 electrones"], a: 1, m: "Se liberan 2 electrones en total para la reacción." },
      { t: "Metano ardiendo sin control en los motores principales.", q: "En el Metano (CH₄), ¿quién atrae la nube de electrones?", o: ["El Carbono", "El Hidrógeno"], a: 0, m: "El Carbono atrae los electrones, dándole estado de -4." },
      { t: "Calcio sumergido generando gas hidrógeno explosivo.", q: "El Calcio dona electrones al agua. ¿Qué se produce en la reducción?", o: ["Gas H₂ y iones OH⁻", "Oxígeno O₂"], a: 0, m: "El agua se rompe liberando H₂ y OH⁻." },
      { t: "Generación letal de cloro gas usando Permanganato y HCl.", q: "Los iones Cl⁻ se unen para formar gas Cl₂. ¿Esto es...?", o: ["Oxidación", "Reducción"], a: 0, m: "Pasan de -1 a 0, perdiendo electrones." },
      { t: "Fósforo blanco generando Fosfina tóxica en base fuerte.", q: "Dismutación del P₄ a (PH₃) y (H₂PO₂⁻). ¿Cuál es la reducción?", o: ["Formación de PH₃ (-3)", "Formación de H₂PO₂⁻ (+1)"], a: 0, m: "Bajar a -3 requiere absorber electrones." },
      { t: "Cobre atacado por Ácido Sulfúrico caliente.", q: "El Sulfato (SO₄²⁻) pasa a SO₂. ¿Cuántos electrones absorbe el Azufre?", o: ["2 electrones", "4 electrones"], a: 0, m: "Absorbe 2 electrones." },
      { t: "Cromo oxidándose con Yodato. Toxicidad alcalina extrema.", q: "En medio Básico. ¿Cómo balancearás los Hidrógenos en la Fase 2?", o: ["Usando H₂O y OH⁻", "Añadiendo H⁺"], a: 0, m: "Correcto, en medio básico jamás se usan protones libres (H⁺)." },
      { t: "Ataque de ácido nítrico sobre Sulfuro de Bismuto.", q: "El Sulfuro (S²⁻) se oxida a Azufre elemental (S). ¿Pierde o gana energía?", o: ["Pierde 2 electrones", "Gana 2 electrones"], a: 0, m: "Al subir de -2 a 0, cede 2 electrones." }
    ],
    genExplanation: (lvl) => {
      if (!lvl) return "Error de carga.";
      const mcm = RedoxEngine.getMCM(lvl.eOx || 1, lvl.eRed || 1);
      return `<strong style="color:#00f2ff; font-size: 24px;">🔬 CÓDICE REDOX</strong><br/><br/>
      <span style="color:#00f2ff">Semirreacción de Oxidación:</span><br/>${lvl.hOx}<br/><br/>
      <span style="color:#ff0055">Semirreacción de Reducción:</span><br/>${lvl.hRed}<br/><br/>
      💡 <em>En la Fase 3, multiplica cada bloque para llegar al MCM de <strong style="color:#ffea00">${mcm}e⁻</strong>.</em>`;
    }
  },
  en: {
    ui: { 
      start: "START CAMPAIGN", title: "REDOX BALANCER: GOD TIER", rank: "RANK", xp: "XP", 
      theoryTitle: "TACTICAL BRIEFING", theoryBtn: "ENTER CORE ➔", diagTitle: "AI ANALYSIS", 
      btnCheck: "SYNTHESIZE & VERIFY", btnBack: "⬅ ABORT", btnNext: "NEXT CRISIS ➔", 
      btnRetry: "RETRY", aiTitle: "🤖 SOCRATIC AI", btnContinue: "UNDERSTOOD, AI", 
      react: "OXIDATION MULTIPLIER", prod: "REDUCTION MULTIPLIER",
      mission: "MISSION", scan: "SCAN ATOMS", eLost: "e- Lost", eGained: "e- Gained", status: "STATUS:",
      explTitle: "STRUCTURAL COLLAPSE!", explMsg: "Massive electron imbalance caused a core fission.",
      statsTitle: "HALF-REACTION SPLIT", timeTaken: "Time", clicksUsed: "Clicks", 
      successTitle: "SYSTEM STABILIZED!", successMessage: "Perfect mass and charge equilibrium.",
      helpBtn: "🤖 HELP", aiBtn: "🧠 ASK AI",
      step1Title: "PHASE 1: AI IDENTIFICATION", step2Title: "PHASE 2: ATOMIC MASS BALANCE", step3Title: "PHASE 3: CHARGE BALANCE & CROSSING",
      microClassTitle: "📚 REINFORCEMENT MICRO-CLASS"
    },
    hints: { 
      NOT_SIMPLIFIED: "Electrons match, but coefficients are not in the simplest integer ratio.", 
      EXCESS_LOST: "Releasing too many electrons. Increase the Reduction multiplier.", 
      DEFICIT_LOST: "Missing electrons. Increase the Oxidation multiplier.", 
      GENERIC: "Energy transfer failed. Check the Least Common Multiple (LCM)." 
    },
    interrupts: [
      { q: "Why balance mass before charge?", o: ["So atoms don't disappear (Conservation of Mass)", "To make it look pretty"], a: 0, m: "Matter cannot be created or destroyed. You must balance O and H before moving electrons." },
      { q: "In an ACIDIC medium, missing Oxygens are balanced with?", o: ["OH⁻ ions", "H₂O molecules"], a: 1, m: "In an acidic medium, you NEVER use OH⁻. You use Water (H₂O) for Oxygens." },
      { q: "If Oxidation loses 2e- and Reduction gains 3e-, what is the LCM?", o: ["6 electrons", "5 electrons"], a: 0, m: "The Least Common Multiple between 2 and 3 is 6. Cross-multiply to reach 6." }
    ],
    levels: Array(20).fill({ t: "Chemical reaction detected.", q: "What happens to the elements?", o: ["Oxidation", "Reduction"], a: 0, m: "Correct." }),
    genExplanation: (lvl) => `<strong style="color:#00f2ff; font-size: 24px;">🔬 REDOX ANALYSIS</strong><br/>Use the Least Common Multiple to balance electrons.`
  }
};
DICT.fr = { ...DICT.en, ui: { ...DICT.en.ui, title: "ÉQUILIBRE QUANTIQUE" } };
DICT.de = { ...DICT.en, ui: { ...DICT.en.ui, title: "QUANTEN-BALANCE" } };
const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

const getRank = (xp) => {
  const RANKS = [ { name: "NEÓFITO", xp: 0, color: "#888" }, { name: "TÉCNICO", xp: 500, color: "#4CAF50" }, { name: "ALQUIMISTA", xp: 1500, color: "#2196F3" }, { name: "LORD CUÁNTICO", xp: 3000, color: "#9C27B0" }, { name: "ARQUITECTO", xp: 5000, color: "#FFD700" } ];
  for (let i = RANKS.length - 1; i >= 0; i--) if (xp >= RANKS[i].xp) return RANKS[i];
  return RANKS[0];
};

/* ============================================================
   🎥 6. NÚCLEO 3D (CÁMARA Y MODELOS INTELIGENTES)
============================================================ */
const CameraRig = ({ phase, isExploding, isErrorShake }) => {
  useFrame((state) => {
    if (isExploding) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 60) * 1.0;
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 70) * 1.0;
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 20, 0.1);
    } else if (isErrorShake) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 40) * 0.2;
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 50) * 0.2;
    } else if (phase === 'TRANSFER' || phase === 'WIN') {
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(state.clock.elapsedTime * 60) * 0.4, 0.5);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 2 + Math.cos(state.clock.elapsedTime * 70) * 0.4, 0.5);
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, 16), 0.05);
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

const ElectronBeam = ({ start, end, active }) => {
  const lineRef = useRef();
  useFrame((state) => {
    if (lineRef.current && active) {
      lineRef.current.material.dashOffset -= 0.15;
      lineRef.current.material.opacity = Math.sin(state.clock.elapsedTime * 40) * 0.5 + 0.5;
    }
  });

  if (!active) return null;
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(...start), new THREE.Vector3(0, 6, 0), new THREE.Vector3(...end));
  const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.3, 8, false);

  return (
    <mesh ref={lineRef} geometry={tubeGeom}>
      <meshBasicMaterial color="#00f2ff" transparent opacity={0.9} />
      <Sparkles count={400} scale={[20, 10, 3]} position={[0,3,0]} size={12} speed={25} color="#00f2ff" />
      <pointLight position={[0,4,0]} intensity={10} color="#00f2ff" distance={20} />
    </mesh>
  );
};

/* ============================================================
   🎮 7. MÁQUINA DE ESTADOS PRINCIPAL (SISTEMA GOD TIER)
============================================================ */
function RedoxBalancer() {
  // Manejo de variables del store de forma segura y directa
  const language = useGameStore(state => state.language) || "es";
  const resetProgress = useGameStore(state => state.resetProgress) || (() => window.location.reload());

  const safeLang = DICT[language] ? language : 'es';
  const dict = DICT[safeLang];
  const lCode = LANG_MAP[safeLang];

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  
  // Fases de la Misión (1=IA, 2=Masas, 3=Cargas)
  const [step, setStep] = useState(1);
  const [actionCount, setActionCount] = useState(0); 
  const [interruptQuiz, setInterruptQuiz] = useState(null); 
  
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  // Estados Químicos (Masas y Cargas)
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [cH2O, setCH2O] = useState(0);
  const [cH, setCH] = useState(0);
  const [cOH, setCOH] = useState(0);

  const [clicks, setClicks] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  const [aiState, setAiState] = useState("Q");
  const [errorMath, setErrorMath] = useState("");
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [helpActive, setHelpActive] = useState(false);

  // Data del Nivel actual
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

  // Lógica de botones y contador para la IA Socrática
  const handleUpdateCoef = useCallback((side, delta) => {
    sfx.click();
    
    setActionCount(prev => {
      const next = prev + 1;
      if (next >= 6) {
        const randomQ = dict.interrupts[Math.floor(Math.random() * dict.interrupts.length)];
        setInterruptQuiz(randomQ);
        setPhase("INTERRUPT");
        setAiState("Q_INTERRUPT");
        triggerVoice("Atención. Interrupción de rutina. Vamos a evaluar tu progreso.", lCode);
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

  // Validación de Respuestas IA (Paso 1 o Interrupción de 6 clics)
  const handleAiAns = useCallback((idx, isInterrupt = false) => {
    const activeQuiz = isInterrupt ? interruptQuiz : combinedLevel;
    
    if (idx === activeQuiz.a) {
      sfx.success(); 
      setAiState("FEEDBACK");
      triggerVoice(activeQuiz.m, lCode);
      
      setTimeout(() => { 
        if (!isMounted.current) return; 
        setPhase("GAME"); 
        if (!isInterrupt && step === 1) setStep(2); 
        setTimerActive(true); 
      }, 4000);
    } else {
      sfx.error(); 
      setIsErrorShake(true);
      setAiState("MICRO_CLASS");
      triggerVoice("Fallo detectado. Iniciando micro-clase de refuerzo.", lCode); 
      setTimeout(() => setIsErrorShake(false), 1000);
    }
  }, [combinedLevel, interruptQuiz, step, lCode]);

  // Validación de Masas (Agua, Protones, Hidroxilos)
  const handleVerifyMass = () => {
    if (combinedLevel.env === "Neutral") {
        sfx.levelUp(); 
        setStep(3); 
        setErrorMath(""); 
        triggerVoice("Medio Neutro. Avanzando a balance de cargas.", lCode);
        return;
    }

    const isMassOk = RedoxEngine.validateMass(cH2O, cH, cOH, combinedLevel);
    if (isMassOk) {
      sfx.levelUp(); 
      setStep(3); 
      setErrorMath(""); 
      triggerVoice("Masa atómica estabilizada. Iguala ahora la transferencia electrónica.", lCode);
    } else {
      sfx.error(); 
      setIsErrorShake(true); 
      setErrorMath(dict.hints.H2O_IMBALANCE);
      triggerVoice(dict.hints.H2O_IMBALANCE, lCode);
      setTimeout(() => setIsErrorShake(false), 1000);
    }
  };

  // Validación de Cargas (Electrones Finales)
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
    triggerVoice("Desplegando análisis estequiométrico.", lCode);
  }, [lCode]);

  const toggleHelp = useCallback(() => {
    sfx.aiPop(); setHelpActive(true); 
    triggerVoice("Desplegando guía táctica de balanceo.", lCode);
  }, [lCode]);

  const toggleScanner = useCallback(() => { sfx.scan(); }, []);

  /* ================= VISTAS UI ================= */
  if (phase === "BOOT") return (
    <div style={ui.overlayFull}>
      <div className="hud-glitch-text" style={ui.glitchText}>PROTOCOLO NANO-CORE V28</div>
      <h1 className="hud-glow" style={ui.titleGlow}>{dict.ui.title}</h1>
      <p style={{color:'#ffea00', letterSpacing:'5px', fontSize:'22px', marginBottom:'50px', fontWeight:'bold'}}>
        CAMPAÑA IÓN-ELECTRÓN: {totalLevels} MISIONES
      </p>
      <button className="hud-btn" style={ui.btnHex('#00f2ff')} onClick={() => { sfx.click(); loadLevel(0); }}>{dict.ui.start}</button>
    </div>
  );

  if (phase === "GAMEOVER") return (
    <div style={{...ui.overlayFull, background:'radial-gradient(circle at center, #550000 0%, #000 100%)', zIndex: 3000}}>
      <h1 className="hud-glow" style={{...ui.titleGlow, color: '#ff0000', textShadow: '0 0 50px #ff0000'}}>{dict.ui.explTitle}</h1>
      <p style={{fontSize:'30px', color:'#fff', margin:'30px 0'}}>{dict.ui.explMsg}</p>
      <button className="hud-btn" style={ui.btnHex('#ff0000')} onClick={() => loadLevel(levelIdx)}>{dict.ui.btnRetry}</button>
      <button className="hud-btn-ghost" style={{...ui.btnGhost, marginTop:'30px'}} onClick={() => window.location.reload()}>{dict.ui.btnBack}</button>
    </div>
  );

  return (
    <div style={ui.screen}>
      {/* HEADER DE NAVEGACIÓN Y AYUDA */}
      <div style={ui.topControls}>
        <button className="hud-btn-ghost" style={ui.backBtn} onClick={() => window.location.reload()}>{dict.ui.btnBack}</button>
        {(phase === "GAME") && step > 1 && !isExploding && (
          <div style={{display:'flex', gap:'15px'}}>
            <button className="hud-btn-ghost" style={ui.aiBtn} onClick={invokeAI}>🧠 {dict.ui.aiBtn}</button>
            <button className="hud-btn-ghost" style={ui.helpBtn} onClick={toggleHelp}>{dict.ui.helpBtn}</button>
          </div>
        )}
      </div>

      {/* HUD SUPERIOR: FÓRMULA Y RANGO */}
      <div style={ui.topHud}>
        <div style={ui.glassPanel}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width: '100%', marginBottom:'10px', borderBottom:'1px solid #444', paddingBottom:'15px'}}>
            <div style={ui.levelBadge}>{dict.ui.mission} {levelIdx + 1} / {totalLevels}</div>
            {streak > 1 && (
              <div className="hud-pulse" style={{color:'#ffea00', fontSize:'24px', fontWeight:'bold'}}>
                🔥 COMBO x{streak}
              </div>
            )}
            <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end'}}>
              <div style={{color:currentRank.color, fontWeight:'bold', fontSize:'20px', letterSpacing:'2px'}}>{dict.ui.rank}: {currentRank.name} ({xp} {dict.ui.xp})</div>
              <div style={{width:'200px', height:'10px', background:'#222', borderRadius:'5px', marginTop:'5px', overflow:'hidden'}}>
                <div style={{width:`${(xp%500)/500 * 100}%`, height:'100%', background:currentRank.color, transition:'width 0.5s'}}/>
              </div>
            </div>
          </div>
          <div style={ui.formula}>{combinedLevel.eq}</div>
          
          <div className="hud-pulse" style={{color:'#ffea00', marginTop:'15px', fontWeight:'bold', fontSize:'22px', letterSpacing:'2px'}}>
            {step === 1 ? dict.ui.step1Title : step === 2 ? dict.ui.step2Title : dict.ui.step3Title}
          </div>
        </div>
      </div>

      {/* 🔬 PANEL LATERAL CON SEMIRREACCIONES DIVIDIDAS (SOLO EN FASE 2 Y 3) */}
      {(phase === "GAME" || phase === "TRANSFER" || phase === "AI" || phase === "INTERRUPT") && step >= 2 && (
        <div style={ui.liveStatsPanel}>
          <h3 style={{margin:'0 0 15px 0', color:'#fff', letterSpacing:'2px', fontSize:'18px', borderBottom:'1px solid #555', paddingBottom:'10px'}}>{dict.ui.statsTitle}</h3>
          <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'16px'}}>Oxidación (Cede e-):</div>
          <div style={{color:'#fff', fontSize:'14px', marginBottom:'15px'}}>{combinedLevel.hOx}</div>
          <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'16px'}}>Reducción (Absorbe e-):</div>
          <div style={{color:'#fff', fontSize:'14px'}}>{combinedLevel.hRed}</div>
          
          {step === 3 && (
            <div style={{marginTop:'20px', borderTop:'1px solid #555', paddingTop:'15px'}}>
              <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'18px'}}>Liberados: {eLost}</div>
              <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'18px', marginTop:'5px'}}>Absorbidos: {eGained}</div>
            </div>
          )}
        </div>
      )}

      {/* MODALES TEORÍA / WIN */}
      {phase === "THEORY" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#00f2ff')}>
            <h2 style={{color: '#00f2ff', letterSpacing:'6px', borderBottom: '2px solid #00f2ff55', paddingBottom: '20px', fontSize:'45px', margin:0}}>{dict.ui.theoryTitle}</h2>
            <p style={{fontSize:'34px', lineHeight:'1.6', margin:'30px 0', color: '#fff'}}>{combinedLevel?.t}</p>
            <button className="hud-btn" style={ui.btnSolid('#00f2ff')} onClick={() => { setPhase("GAME"); setTimerActive(true); }}>{dict.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {/* 🔥 MODAL DE LA IA (Fase 1 e Interrupciones) */}
      {(phase === "AI" || phase === "INTERRUPT") && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#ff00ff')}>
            <h2 style={{color:'#ff00ff', letterSpacing:'6px', borderBottom: '2px solid #ff00ff55', paddingBottom: '20px', fontSize:'45px', margin:0}}>{dict.ui.aiTitle}</h2>
            <div style={{flex:1, overflowY:'auto', width:'100%', padding:'20px'}}>
              
              {/* Pregunta IA */}
              {(aiState === "Q" || aiState === "Q_INTERRUPT") ? (
                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                  <p style={{fontSize:'32px', margin:'20px 0', color: '#fff', fontWeight:'900'}}>
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
                  <p style={{fontSize:'40px', color:'#0f0', margin:'40px 0', fontWeight:'bold'}}>{phase === "INTERRUPT" ? interruptQuiz?.m : combinedLevel.m}</p>
                  <p className="hud-pulse" style={{color:'#aaa', fontSize:'24px', marginTop:'20px'}}>Reanudando Sistemas...</p>
                </div>
              ) : aiState === "MICRO_CLASS" ? (
                <div style={{marginTop:'20px'}}>
                   <h3 style={{color: '#f00', fontSize: '32px'}}>{dict.ui.microClassTitle}</h3>
                   <p style={{color: '#fff', fontSize: '26px', lineHeight:'1.5'}}>{phase === "INTERRUPT" ? interruptQuiz?.m : combinedLevel.m}</p>
                   <button className="hud-btn" style={{...ui.btnSolid('#ff00ff'), marginTop:'40px'}} onClick={() => setAiState(phase === "INTERRUPT" ? "Q_INTERRUPT" : "Q")}>REINTENTAR RESPUESTA</button>
                </div>
              ) : (
                <div style={{fontSize:'24px', color:'#fff', lineHeight:'1.8', textAlign:'left', background:'rgba(0,0,0,0.4)', padding:'30px', borderRadius:'15px'}} dangerouslySetInnerHTML={{__html: dict.genExplanation(combinedLevel)}}></div>
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
            <h2 style={{color:'#ffea00', fontSize:'45px', borderBottom: '2px solid #ffea0055', paddingBottom: '20px', margin:0}}>{dict.ui.helpBtn}</h2>
            <div style={{flex:1, display:'flex', alignItems:'center', justifyContent: 'center'}}>
              <p style={{fontSize:'28px', color:'#fff', lineHeight:'1.6', textAlign: 'left', background: 'rgba(0,0,0,0.5)', padding: '30px', borderRadius: '15px', whiteSpace:'pre-wrap'}}>{RedoxEngine.getMassBalanceGuide(combinedLevel.env, dict)}</p>
            </div>
            <button className="hud-btn" style={ui.btnSolid('#ffea00')} onClick={() => { setHelpActive(false); if (typeof window !== 'undefined') window.speechSynthesis.cancel(); }}>{dict.ui.btnContinue}</button>
          </div>
        </div>
      )}

      {phase === "WIN" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#0f0')}>
            <h2 className="hud-glow" style={{color:'#0f0', letterSpacing:'10px', fontSize:'70px', textShadow:'0 0 60px #0f0', margin:0}}>{dict.ui.successTitle}</h2>
            <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
              <p style={{fontSize:'36px', color:'#fff', margin:'30px 0', fontWeight:'bold'}}>{dict.ui.successMessage}</p>
              <div style={{background:'rgba(0,30,0,0.6)', padding:'40px', borderRadius:'20px', display:'inline-block', textAlign:'left', border:'2px solid #0f0'}}>
                <div style={{fontSize:'28px', color:'#ccc', margin:'15px 0'}}>{dict.ui.timeTaken} <span style={{color:'#fff', fontWeight:'bold'}}>{time}s</span></div>
                <div style={{fontSize:'28px', color:'#ccc', margin:'15px 0'}}>{dict.ui.clicksUsed} <span style={{color:'#fff', fontWeight:'bold'}}>{clicks}</span></div>
              </div>
            </div>
            <button className="hud-btn" style={ui.btnSolid('#0f0')} onClick={() => loadLevel(levelIdx + 1)}>{dict.ui.btnNext}</button>
          </div>
        </div>
      )}

      {/* 🔥 DOCK DE CONTROLES INFERIORES DINÁMICO POR FASES (FLEX-WRAP ACTIVADO) 🔥 */}
      {(phase === "GAME" || phase === "TRANSFER" || isExploding) && !helpActive && (
        <div style={ui.dockContainer}>
          <div style={ui.dock}>

            {/* FASE 1: BLOQUEO HASTA USAR IA */}
            {step === 1 && (
              <div style={{textAlign:'center', width:'100%'}}>
                 <h2 style={{color:'#ff00ff', fontSize:'32px', marginBottom:'15px', textShadow: '0 0 10px #ff00ff'}}>PASO 1: IDENTIFICACIÓN</h2>
                 <p style={{color:'#fff', fontSize:'24px', marginBottom:'30px'}}>⚠️ <em>Debes consultar al Tutor IA para analizar la ecuación antes de poder balancearla.</em></p>
                 <button className="hud-btn" style={ui.mainCheck('#ff00ff')} onClick={() => { setPhase("AI"); setAiState("Q"); triggerVoiceSafe(combinedLevel.q); }}>
                    🧠 INICIAR ANÁLISIS IA
                 </button>
              </div>
            )}

            {/* FASE 2: HABILITA MASAS (AGUA, H+, OH-) */}
            {step === 2 && (
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
                 {/* Si el medio es Neutro, un botón para saltar de fase */}
                 {combinedLevel.env === "Neutral" ? (
                   <div style={{textAlign: 'center'}}>
                     <p style={{fontSize:'24px', color:'#ffea00', marginBottom:'20px'}}>Este es un Medio Neutro. No se requiere balancear átomos de Oxígeno ni Hidrógeno libres.</p>
                     <button className="hud-btn" style={ui.mainCheck('#ffea00')} onClick={handleVerifyMass}>AVANZAR A FASE DE CARGAS</button>
                   </div>
                 ) : (
                   <>
                     {/* Ajuste: flexWrap para que no se pisen en pantallas angostas */}
                     <div style={{display:'flex', gap:'40px', flexWrap: 'wrap', justifyContent: 'center'}}>
                       
                       {/* Botón H2O */}
                       <div style={ui.controlGroup}>
                          <span style={{color:'#fff', fontSize:'24px', fontWeight:'bold'}}>H₂O (Agua)</span>
                          <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                             <button className="hud-btn-ghost" style={ui.microBtn('#fff')} onClick={()=>handleUpdateCoef('h2o', -1)}>-</button>
                             <span style={ui.val('#fff', '36px')}>{cH2O}</span>
                             <button className="hud-btn-ghost" style={ui.microBtn('#fff')} onClick={()=>handleUpdateCoef('h2o', 1)}>+</button>
                          </div>
                       </div>
                       
                       {/* Botón H+ */}
                       {combinedLevel.env === "Ácido" && (
                         <div style={ui.controlGroup}>
                            <span style={{color:'#ffaa00', fontSize:'24px', fontWeight:'bold'}}>H⁺ (Protones)</span>
                            <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ffaa00')} onClick={()=>handleUpdateCoef('h', -1)}>-</button>
                               <span style={ui.val('#ffaa00', '36px')}>{cH}</span>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ffaa00')} onClick={()=>handleUpdateCoef('h', 1)}>+</button>
                            </div>
                         </div>
                       )}

                       {/* Botón OH- */}
                       {combinedLevel.env === "Básico" && (
                         <div style={ui.controlGroup}>
                            <span style={{color:'#ff00aa', fontSize:'24px', fontWeight:'bold'}}>OH⁻ (Hidroxilos)</span>
                            <div style={{display:'flex', gap:'15px', marginTop:'10px'}}>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ff00aa')} onClick={()=>handleUpdateCoef('oh', -1)}>-</button>
                               <span style={ui.val('#ff00aa', '36px')}>{cOH}</span>
                               <button className="hud-btn-ghost" style={ui.microBtn('#ff00aa')} onClick={()=>handleUpdateCoef('oh', 1)}>+</button>
                            </div>
                         </div>
                       )}
                     </div>
                     {errorMath && <div style={{color:'#f00', marginTop:'20px', fontWeight:'bold', fontSize:'18px'}}>{errorMath}</div>}
                     <button className="hud-btn" style={{...ui.mainCheck('#ffea00'), marginTop:'30px'}} onClick={handleVerifyMass}>VERIFICAR BALANCE DE MASA</button>
                   </>
                 )}
              </div>
            )}

            {/* FASE 3: HABILITA CARGAS (MULTIPLICADORES) */}
            {step === 3 && (
              <div style={{display:'flex', gap:'40px', flexWrap: 'wrap', justifyContent: 'center', width: '100%'}}>
                <div style={ui.controlGroup}>
                  <div style={{color:'#00f2ff', fontSize:'18px', fontWeight:'900', letterSpacing:'2px', marginBottom:'15px', textShadow:'0 0 10px #00f2ff'}}>{dict.ui.react}</div>
                  <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#00f2ff')} onClick={()=>handleUpdateCoef('c1', -1)} disabled={phase==='TRANSFER' || isExploding}>-</button>
                    <div style={ui.val('#00f2ff')}>{c1}</div>
                    <button className="hud-btn-ghost" style={ui.roundBtnSm('#00f2ff')} onClick={()=>handleUpdateCoef('c1', 1)} disabled={phase==='TRANSFER' || isExploding}>+</button>
                  </div>
                </div>

                <div style={{display:'flex', flexDirection:'column', gap:'15px', alignItems:'center', justifyContent: 'center'}}>
                  <button className="hud-btn" style={ui.mainCheck('#00f2ff')} onClick={handleVerifyCharge} disabled={phase==='TRANSFER' || isExploding}>{dict.ui.btnCheck}</button>
                  {errorMath && phase === "GAME" && (
                    <div className="hud-pulse" style={{color:'#ff0000', fontWeight:'bold', fontSize:'16px', background:'rgba(255,0,0,0.15)', border:'2px solid #ff0000', padding:'10px 20px', borderRadius:'8px', maxWidth: '300px', textAlign: 'center'}}>
                      {errorMath}
                    </div>
                  )}
                </div>

                <div style={ui.controlGroup}>
                  <div style={{color:'#ff0055', fontSize:'18px', fontWeight:'900', letterSpacing:'2px', marginBottom:'15px', textShadow:'0 0 10px #ff0055'}}>{dict.ui.prod}</div>
                  <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
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
            <CameraRig phase={phase} isExploding={isExploding} isErrorShake={isErrorShake} />
            
            {combinedLevel.formulaOx && step > 1 ? (
              <SmartMolecule formula={combinedLevel.formulaOx} position={[-10, 0, 0]} count={step === 3 ? c1 : 1} active={phase === 'TRANSFER' || phase === 'WIN'} isExploding={isExploding} />
            ) : (
              <AtomCluster symbol={combinedLevel.symOx} color="#00f2ff" count={step === 3 ? c1 : 1} basePosition={[-10, 0, 0]} active={phase === 'TRANSFER' || phase === 'WIN'} isError={isErrorShake} isExploding={isExploding} />
            )}

            {combinedLevel.formulaRed && step > 1 ? (
              <SmartMolecule formula={combinedLevel.formulaRed} position={[10, 0, 0]} count={step === 3 ? c2 : 1} active={phase === 'TRANSFER' || phase === 'WIN'} isExploding={isExploding} />
            ) : (
              <AtomCluster symbol={combinedLevel.symRed} color="#ff0055" count={step === 3 ? c2 : 1} basePosition={[10, 0, 0]} active={phase === 'TRANSFER' || phase === 'WIN'} isError={isErrorShake} isExploding={isExploding} />
            )}

            <ElectronBeam start={[-8, 0, 0]} end={[8, 0, 0]} active={phase === 'TRANSFER'} />
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

// 🎨 ESTILOS "GOD TIER UI" MEJORADOS (FLEX-WRAP PARA EVITAR OVERLAP)
const ui = {
  screen: { position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif' },
  overlayFull: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'radial-gradient(circle at center, #001122 0%, #000 100%)', zIndex:3000, position:'relative' },
  glitchText: { color: '#00f2ff', fontSize: '28px', letterSpacing: '20px', marginBottom: '10px', fontWeight: '900' },
  titleGlow: { color:'#00f2ff', fontSize:'80px', letterSpacing:'10px', textShadow:'0 0 50px rgba(0, 242, 255, 0.8)', margin:'0 0 20px 0', textAlign: 'center', fontWeight: '900' },
  btnHex: (c) => ({ padding:'25px 60px', background:`linear-gradient(45deg, rgba(0,0,0,0.9), ${c}44)`, border:`3px solid ${c}`, color:c, fontSize:'28px', fontWeight:'900', cursor:'pointer', borderRadius:'15px', fontFamily:'Orbitron', transition:'all 0.3s ease', boxShadow: `0 0 40px ${c}66`, letterSpacing: '3px' }),
  btnGhost: { padding:'15px 40px', background:'transparent', border:'2px solid #555', color:'#aaa', fontSize:'20px', cursor:'pointer', borderRadius:'15px', fontFamily:'Orbitron', transition:'0.3s', fontWeight: 'bold', letterSpacing: '2px' },
  topControls: { position: 'absolute', top: '30px', left: '30px', right: '30px', display: 'flex', justifyContent: 'space-between', zIndex: 500, pointerEvents: 'none' },
  backBtn: { padding:'10px 20px', background:'rgba(255,0,85,0.15)', border:'2px solid #ff0055', color:'#ff0055', cursor:'pointer', borderRadius:'10px', fontFamily:'Orbitron', fontWeight:'900', backdropFilter: 'blur(10px)', letterSpacing: '2px', transition: '0.3s', boxShadow: '0 0 20px rgba(255,0,85,0.4)', pointerEvents: 'auto' },
  helpBtn: { padding:'10px 20px', background:'rgba(255,234,0,0.15)', border:'2px solid #ffea00', color:'#ffea00', cursor:'pointer', borderRadius:'10px', fontFamily:'Orbitron', fontWeight:'900', backdropFilter: 'blur(10px)', letterSpacing: '2px', transition: '0.3s', boxShadow: '0 0 20px rgba(255,234,0,0.4)', pointerEvents: 'auto' },
  aiBtn: { padding:'10px 20px', background:'rgba(255,0,255,0.15)', border:'2px solid #ff00ff', color:'#ff00ff', cursor:'pointer', borderRadius:'10px', fontFamily:'Orbitron', fontWeight:'900', backdropFilter: 'blur(10px)', letterSpacing: '2px', transition: '0.3s', boxShadow: '0 0 20px rgba(255,0,255,0.4)', pointerEvents: 'auto' },
  topHud: { position:'absolute', top:'90px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:100, pointerEvents:'none' },
  glassPanel: { background:'rgba(0,15,30,0.85)', border:'2px solid #00f2ff', padding:'30px 60px', borderRadius:'25px', textAlign:'center', backdropFilter:'blur(20px)', boxShadow:'0 0 60px rgba(0,242,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  levelBadge: { background:'#ff0055', color:'#fff', padding:'8px 20px', borderRadius:'8px', display:'inline-block', fontSize:'18px', fontWeight:'900', letterSpacing:'2px' },
  formula: { fontSize:'50px', fontWeight:'900', letterSpacing:'4px', display: 'flex', alignItems: 'center', marginTop:'10px', color:'#fff' },
  liveStatsPanel: { position:'absolute', top:'350px', right:'40px', zIndex:100, background:'rgba(0,15,30,0.9)', border:'2px solid #ffea00', borderLeft:'6px solid #ffea00', padding:'25px', borderRadius:'15px', backdropFilter:'blur(20px)', fontFamily:'Orbitron', fontSize:'18px', boxShadow:'0 0 30px rgba(255,234,0,0.2)', maxWidth:'350px' },
  dockContainer: { position:'absolute', bottom:'40px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:150, pointerEvents: 'none' },
  dock: { display:'flex', flexWrap: 'wrap', gap:'40px', alignItems:'center', background:'rgba(0,10,20,0.95)', padding:'30px 60px', borderRadius:'40px', border:'2px solid #333', boxShadow: '0 30px 80px rgba(0,0,0,0.95)', backdropFilter: 'blur(30px)', pointerEvents: 'auto', position: 'relative', minWidth:'60%', maxWidth: '90%', justifyContent:'center' },
  controlGroup: { display:'flex', flexDirection:'column', alignItems:'center' },
  roundBtnSm: (c) => ({ width:'70px', height:'70px', borderRadius:'50%', border:`3px solid ${c}88`, background:'#111', color:c, fontSize:'45px', cursor:'pointer', fontFamily:'Orbitron', transition:'0.2s', boxShadow: `0 0 20px ${c}44`, display:'flex', alignItems:'center', justifyContent:'center', paddingBottom:'5px', pointerEvents:'auto' }),
  microBtn: (c) => ({ width:'50px', height:'50px', borderRadius:'50%', border:`2px solid ${c}88`, background:'#111', color:c, fontSize:'30px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', paddingBottom:'5px', pointerEvents:'auto' }),
  val: (c, size='70px') => ({ fontSize:size, fontWeight:'900', color:c, width:'80px', textAlign:'center', textShadow:`0 0 30px ${c}` }),
  mainCheck: (c='#00f2ff') => ({ padding:'25px 60px', background:c, border:'none', color:'#000', fontWeight:'900', fontSize:'24px', cursor:'pointer', borderRadius:'20px', fontFamily:'Orbitron', boxShadow:`0 0 60px ${c}88`, letterSpacing: '4px', transition:'0.3s', pointerEvents:'auto' }),
  scanBtn: { padding:'12px', background:'rgba(255,234,0,0.1)', border:'2px solid #ffea00', color:'#ffea00', fontWeight:'bold', fontSize:'14px', borderRadius:'8px', cursor:'pointer', fontFamily:'Orbitron', transition:'0.3s', boxShadow: '0 0 10px rgba(255,234,0,0.3)', pointerEvents:'auto' },
  modalBg: { position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,5,15,0.95)', backdropFilter:'blur(40px)', pointerEvents:'auto' },
  glassModal: (c) => ({ border:`2px solid ${c}`, background:'rgba(0,15,30,0.85)', padding:'50px 80px', borderRadius:'40px', textAlign:'center', maxWidth:'1200px', maxHeight:'90vh', width:'90%', boxShadow:`0 0 100px ${c}66`, backdropFilter:'blur(20px)', display: 'flex', flexDirection: 'column', alignItems: 'center' }),
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginTop:'40px', width:'100%' },
  btnOpt: { padding:'30px', background:'rgba(255,255,255,0.03)', border:'2px solid #555', color:'#fff', borderRadius:'15px', fontSize:'24px', cursor:'pointer', fontFamily:'Orbitron', transition:'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' },
  btnSolid: (c) => ({ marginTop:'30px', padding:'30px 80px', background:c, color:'#000', fontWeight:'900', fontSize:'28px', borderRadius:'20px', border:'none', cursor:'pointer', fontFamily:'Orbitron', letterSpacing: '4px', boxShadow: `0 0 60px ${c}99` })
};

// ANIMACIONES CSS Y EVENTOS
if (typeof document !== 'undefined' && !document.getElementById("redox-styles-v35")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "redox-styles-v35";
  styleSheet.innerText = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px #ff0000; }
      50% { transform: scale(1.02); opacity: 0.8; box-shadow: 0 0 60px #ff0000; }
      100% { transform: scale(1); opacity: 1; box-shadow: 0 0 20px #ff0000; }
    }
    .hud-pulse { animation: pulse 1s infinite; }
    .hud-btn:active { transform: scale(0.95); }
    .hud-btn-ghost:active { transform: scale(0.95); }
    .hud-btn-ghost:hover { border-color: #00f2ff !important; background: rgba(0,242,255,0.1) !important; color: #fff !important; }
  `;
  document.head.appendChild(styleSheet);
}