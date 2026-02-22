import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🛡️ ESCUDO ANTI-CRASH (ERROR BOUNDARY)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("Critical Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#110000', color: '#ff4444', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace' }}>
          <h1 style={{ fontSize: '40px' }}>⚠️ FATAL SYSTEM ERROR</h1>
          <p style={{ background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '10px' }}>{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '5px' }}>REBOOT SYSTEM</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 1. MOTOR QUÍMICO PURO (ESTEQUIOMETRÍA COMPLETA)
============================================================ */
class RedoxEngine {
  static validate(userCoef1, userCoef2, userH2O, userH, userOH, levelData) {
    if (!levelData) return { isBalanced: false, errorType: "ERROR" };
    
    // 1. Balance de Electrones
    const eLostTotal = userCoef1 * (levelData.eOx || 1);
    const eGainedTotal = userCoef2 * (levelData.eRed || 1);
    const isChargeBalanced = eLostTotal === eGainedTotal;
    const isSimplified = userCoef1 === levelData.cOx && userCoef2 === levelData.cRed;

    // 2. Balance de Masas (Agua y Protones/Hidroxilos)
    const expectedH2O = levelData.ansH2O || 0;
    const expectedH = levelData.ansH || 0;
    const expectedOH = levelData.ansOH || 0;
    const isMassBalanced = (userH2O === expectedH2O) && (userH === expectedH) && (userOH === expectedOH);
    
    const isBalanced = isChargeBalanced && isSimplified && isMassBalanced;

    let errorType = "NONE";
    let aiQuestion = "";
    let aiOptions = [];
    let aiAnswer = 0;
    let aiReason = "";

    // LÓGICA SOCRÁTICA CONTEXTUAL
    if (!isBalanced) {
      if (eLostTotal !== eGainedTotal) {
        errorType = eLostTotal > eGainedTotal ? "EXCESS_LOST" : "DEFICIT_LOST";
        aiQuestion = "Los electrones no cuadran. ¿Cuál es el Mínimo Común Múltiplo entre los electrones cedidos y absorbidos?";
        const mcm = this.getMCM(levelData.eOx, levelData.eRed);
        aiOptions = [`${mcm} electrones`, `${mcm * 2} electrones`];
        aiAnswer = 0;
        aiReason = `Debes multiplicar la oxidación por ${mcm / levelData.eOx} y la reducción por ${mcm / levelData.eRed}.`;
      } 
      else if (!isSimplified) {
        errorType = "NOT_SIMPLIFIED"; 
        aiQuestion = "Están igualados, pero no en su mínima expresión. ¿Qué debes hacer?";
        aiOptions = ["Simplificar los coeficientes", "Añadir más agua"];
        aiAnswer = 0;
        aiReason = "La estequiometría siempre exige la relación entera más pequeña posible.";
      } 
      else if (userH2O !== expectedH2O) {
        errorType = "H2O_IMBALANCE";
        aiQuestion = "Falta balancear el Oxígeno. ¿Qué molécula aporta átomos de oxígeno en medio acuoso?";
        aiOptions = ["H₂O (Agua)", "O₂ (Gas)"];
        aiAnswer = 0;
        aiReason = `Necesitas añadir exactamente ${expectedH2O} moléculas de H₂O para compensar los oxígenos.`;
      } 
      else if (userH !== expectedH || userOH !== expectedOH) {
        errorType = "ION_IMBALANCE";
        aiQuestion = `Para balancear los hidrógenos en un medio ${levelData.env}, ¿qué ión debes utilizar?`;
        aiOptions = levelData.env === "Ácido" ? ["Iones H⁺", "Iones OH⁻"] : ["Iones OH⁻", "Iones H⁺"];
        aiAnswer = 0;
        aiReason = levelData.env === "Ácido" ? `Añade ${expectedH} H⁺ para balancear los hidrógenos del agua.` : `Usa el método del agua y compensa con ${expectedOH} OH⁻.`;
      }
    }

    return { 
      isBalanced, 
      eLostTotal, 
      eGainedTotal, 
      eDiff: Math.abs(eLostTotal - eGainedTotal), 
      errorType,
      socraticData: { q: aiQuestion, o: aiOptions, a: aiAnswer, m: aiReason }
    };
  }

  static getMCM(a, b) {
    if (!a || !b) return 1; 
    const gcd = (x, y) => (!y ? x : gcd(y, x % y));
    return (a * b) / gcd(a, b);
  }
}

/* ============================================================
   🔊 2. MOTOR DE AUDIO SCI-FI Y VOZ
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; }
  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.gainNode = this.ctx.createGain();
          this.gainNode.gain.value = 0.3;
          this.gainNode.connect(this.ctx.destination);
        }
      } catch (e) { console.warn("Audio API bloqueada por el navegador."); }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
  }
  _play(type, fStart, fEnd, dur, vol) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.gainNode);
      osc.type = type;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 800, 400, 0.1, 0.1); }
  verify() { this._play('triangle', 400, 1200, 0.4, 0.1); }
  success() { this._play('sine', 440, 880, 0.5, 0.2); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.2); }
  aiPop() { this._play('triangle', 200, 800, 0.4, 0.1); }
  transfer() { this._play('noise', 2000, 100, 1.0, 0.2); }
  explosion() { this._play('sawtooth', 800, 20, 1.5, 0.5); }
}
const sfx = new QuantumAudio();

const triggerVoice = (text, langCode) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const pureText = text ? text.replace(/<[^>]*>?/gm, '') : ''; 
  setTimeout(() => {
    try {
      const u = new SpeechSynthesisUtterance(pureText);
      u.lang = langCode; u.rate = 1.05; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }, 50);
};

/* ============================================================
   🌍 3. BASE DE DATOS QUÍMICA INTEGRAL (CON REACCIONES COMPLETAS)
============================================================ */
const CHEM_DB = [
  { eq: "Zn + Cu²⁺ ➔ Zn²⁺ + Cu", hOx: "Zn ➔ Zn²⁺ + 2e⁻", hRed: "Cu²⁺ + 2e⁻ ➔ Cu", eOx: 2, eRed: 2, symOx: "Zn", symRed: "Cu", cOx: 1, cRed: 1, env: "Neutral", ansH2O: 0, ansH: 0, ansOH: 0 },
  { eq: "Al + 3H⁺ ➔ Al³⁺ + 1.5H₂", hOx: "Al ➔ Al³⁺ + 3e⁻", hRed: "2H⁺ + 2e⁻ ➔ H₂", eOx: 3, eRed: 2, symOx: "Al", symRed: "H", cOx: 2, cRed: 3, env: "Ácido", ansH2O: 0, ansH: 6, ansOH: 0 },
  { eq: "MnO₄⁻ + 5Fe²⁺ + 8H⁺ ➔ Mn²⁺ + 5Fe³⁺ + 4H₂O", hOx: "Fe²⁺ ➔ Fe³⁺ + 1e⁻", hRed: "MnO₄⁻ + 8H⁺ + 5e⁻ ➔ Mn²⁺ + 4H₂O", eOx: 1, eRed: 5, symOx: "Fe", symRed: "Mn", cOx: 5, cRed: 1, env: "Ácido", ansH2O: 4, ansH: 8, ansOH: 0 },
  { eq: "Cr₂O₇²⁻ + 6Cl⁻ + 14H⁺ ➔ 2Cr³⁺ + 3Cl₂ + 7H₂O", hOx: "2Cl⁻ ➔ Cl₂ + 2e⁻", hRed: "Cr₂O₇²⁻ + 14H⁺ + 6e⁻ ➔ 2Cr³⁺ + 7H₂O", eOx: 2, eRed: 6, symOx: "Cl", symRed: "Cr", cOx: 3, cRed: 1, env: "Ácido", ansH2O: 7, ansH: 14, ansOH: 0 },
  { eq: "3Cl₂ + 6OH⁻ ➔ 5Cl⁻ + ClO₃⁻ + 3H₂O", hOx: "Cl₂ + 12OH⁻ ➔ 2ClO₃⁻ + 6H₂O + 10e⁻", hRed: "Cl₂ + 2e⁻ ➔ 2Cl⁻", eOx: 10, eRed: 2, symOx: "Cl", symRed: "Cl", cOx: 1, cRed: 5, env: "Básico", ansH2O: 6, ansH: 0, ansOH: 12 },
  { eq: "Cu + H₂SO₄ ➔ CuSO₄ + SO₂", hOx: "Cu ➔ Cu²⁺ + 2e⁻", hRed: "SO₄²⁻ + 4H⁺ + 2e⁻ ➔ SO₂ + 2H₂O", eOx: 2, eRed: 2, symOx: "Cu", symRed: "S", cOx: 1, cRed: 1, env: "Ácido", ansH2O: 2, ansH: 4, ansOH: 0 },
  { eq: "P₄ + NaOH ➔ PH₃ + NaH₂PO₂", hOx: "P₄ + 8OH⁻ ➔ 4H₂PO₂⁻ + 4e⁻", hRed: "P₄ + 12H₂O + 12e⁻ ➔ 4PH₃ + 12OH⁻", eOx: 4, eRed: 12, symOx: "P", symRed: "P", cOx: 3, cRed: 1, env: "Básico", ansH2O: 12, ansH: 0, ansOH: 24 }
];

/* ============================================================
   🌍 4. DICCIONARIO TRADUCIDO Y LÓGICA
============================================================ */
const DICT = {
  es: {
    ui: { 
      start: "INICIAR CAMPAÑA", title: "REDOX BALANCER", rank: "RANGO", xp: "XP", 
      theoryTitle: "BRIEFING TÁCTICO", theoryBtn: "ESTABILIZAR SISTEMA ➔", diagTitle: "ANÁLISIS IA", 
      btnCheck: "VERIFICAR", btnBack: "⬅ ABORTAR", btnNext: "SIGUIENTE ➔", 
      btnRetry: "REINTENTAR", aiTitle: "🤖 TUTOR IA SOCRÁTICO", btnContinue: "ENTENDIDO", 
      react: "AGENTE REDUCTOR", prod: "AGENTE OXIDANTE",
      mission: "MISIÓN", scan: "ABRIR DESGLOSE", eLost: "e- Cedidos", eGained: "e- Absorbidos", status: "ESTADO:",
      explTitle: "¡COLAPSO ESTRUCTURAL!", explMsg: "La descompensación provocó una fisión masiva.",
      statsTitle: "TELEMETRÍA AVANZADA", timeTaken: "Tiempo", clicksUsed: "Ajustes", 
      successTitle: "¡ESTABILIZADO!", successMessage: "Masa y carga en equilibrio perfecto.",
      helpBtn: "🤖 AYUDA TÁCTICA", helpText: "Paso 1: Balancea el elemento principal.\nPaso 2: Usa H₂O para balancear Oxígenos.\nPaso 3: Usa H⁺ o OH⁻ para balancear Hidrógenos.\nPaso 4: Iguala los electrones de ambas semirreacciones.", aiBtn: "🧠 CONSULTAR IA"
    },
    ai: { intro: "Protocolo activado. Revisa la ecuación.", correct: "Perfecto.", explosion: "¡Ruptura crítica!" }
  }
};
DICT.en = DICT.es; 
const LANG_MAP = { es: 'es-ES', en: 'en-US' };

const getRank = (xp) => {
  const safeXp = Number(xp) || 0;
  const RANKS = [ { name: "NEÓFITO", xp: 0, color: "#888" }, { name: "ALQUIMISTA", xp: 1500, color: "#2196F3" }, { name: "ARQUITECTO", xp: 5000, color: "#FFD700" } ];
  for (let i = RANKS.length - 1; i >= 0; i--) if (safeXp >= RANKS[i].xp) return RANKS[i];
  return RANKS[0];
};

/* ============================================================
   🎥 5. NÚCLEO 3D (MEMOIZADO EXTREMO)
============================================================ */
const VEC_AB_EXP = new THREE.Vector2(0.015, 0.015);
const VEC_AB_NORM = new THREE.Vector2(0.002, 0.002);
const BEAM_START = new THREE.Vector3(-6, 0, 0);
const BEAM_MID = new THREE.Vector3(0, 6, 0);
const BEAM_END = new THREE.Vector3(6, 0, 0);

const Core3D = ({ phase, isExploding, isErrorShake, c1, c2, activeTransfer }) => {
  useFrame((state) => {
    if (isExploding) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 60) * 1.0;
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 70) * 1.0;
    } else if (isErrorShake) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 40) * 0.2;
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, 16), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
  });

  const safeC1 = Math.max(1, Math.min(Number(c1) || 1, 10));
  const safeC2 = Math.max(1, Math.min(Number(c2) || 1, 10));
  
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.6, 16, 16), []);
  const beamCurve = useMemo(() => new THREE.QuadraticBezierCurve3(BEAM_START, BEAM_MID, BEAM_END), []);

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" />
      <Stars count={1000} factor={3} fade />
      
      <group position={[-6, 0, 0]}>
        {[...Array(safeC1)].map((_, i) => (
           <mesh key={`ox-${i}`} position={[Math.cos(i) * 1.5, Math.sin(i) * 0.5, 0]} geometry={sphereGeo}>
              <meshPhysicalMaterial color={isExploding || isErrorShake ? "#f00" : "#00f2ff"} emissive={isExploding || isErrorShake ? "#f00" : "#00f2ff"} emissiveIntensity={2} />
           </mesh>
        ))}
      </group>

      <group position={[6, 0, 0]}>
        {[...Array(safeC2)].map((_, i) => (
           <mesh key={`red-${i}`} position={[Math.cos(i) * 1.5, Math.sin(i) * 0.5, 0]} geometry={sphereGeo}>
              <meshPhysicalMaterial color={isExploding || isErrorShake ? "#f00" : "#ff0055"} emissive={isExploding || isErrorShake ? "#f00" : "#ff0055"} emissiveIntensity={2} />
           </mesh>
        ))}
      </group>

      {activeTransfer && (
        <mesh>
          <tubeGeometry args={[beamCurve, 64, 0.3, 8, false]} />
          <meshBasicMaterial color="#00f2ff" transparent opacity={0.9} />
        </mesh>
      )}

      <EffectComposer>
        <Bloom intensity={activeTransfer ? 6 : (isExploding ? 8 : 2)} luminanceThreshold={0.2} />
        <ChromaticAberration offset={isExploding ? VEC_AB_EXP : VEC_AB_NORM} />
        <Scanline opacity={0.15} density={1.5} />
      </EffectComposer>
    </>
  );
};

/* ============================================================
   🎮 6. MÁQUINA DE ESTADOS PRINCIPAL
============================================================ */
function GameApp() {
  const store = useGameStore();
  const language = store?.language || "es";
  const resetProgress = store?.resetProgress || (() => {});
  
  const safeLang = DICT[language] ? language : 'es';
  const dict = DICT[safeLang] || DICT.es;
  const lCode = LANG_MAP[safeLang] || 'es-ES';

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [cH2O, setCH2O] = useState(0);
  const [cH, setCH] = useState(0);
  const [cOH, setCOH] = useState(0);

  const [clicks, setClicks] = useState(0);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  
  const [aiState, setAiState] = useState("Q");
  const [aiDialog, setAiDialog] = useState(null);

  const [errorMath, setErrorMath] = useState("");
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [helpActive, setHelpActive] = useState(false);

  const level = useMemo(() => CHEM_DB[levelIdx] || CHEM_DB[0], [levelIdx]);
  const currentRank = getRank(xp);
  
  const eLost = c1 * (level.eOx || 1);
  const eGained = c2 * (level.eRed || 1);
  const eDiff = Math.abs(eLost - eGained);

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
    return () => clearInterval(interval);
  }, [timerActive]);

  const updateCoef = (side, delta) => {
    sfx.click();
    if (side === 'c1') setC1(p => Math.max(1, p + delta));
    if (side === 'c2') setC2(p => Math.max(1, p + delta));
    if (side === 'h2o') setCH2O(p => Math.max(0, p + delta));
    if (side === 'h') setCH(p => Math.max(0, p + delta));
    if (side === 'oh') setCOH(p => Math.max(0, p + delta));
    setClicks(p => p + 1);
  };

  const verify = () => {
    setTimerActive(false);
    const result = RedoxEngine.validate(c1, c2, cH2O, cH, cOH, level);

    if (result.isBalanced) {
      sfx.transfer();
      setPhase("TRANSFER");
      setStreak(s => s + 1);
      setXp(p => p + 150 + (streak * 50));
      setTimeout(() => { if(isMounted.current) { sfx.success(); setPhase("WIN"); triggerVoice(dict.ui.successMessage, lCode); } }, 2000);
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
      sfx.error(); 
      setIsErrorShake(true); 

      // Guardamos la información socrática basada en el error para que la IA la lea
      setAiDialog(result.socraticData);
      setErrorMath(dict.hints[result.errorType]);
      
      if (result.eDiff > 12) {
        setIsExploding(true);
        triggerVoice(dict.ai.explosion, lCode);
        setTimeout(() => { if(isMounted.current) setPhase("GAMEOVER"); }, 3000);
      } else {
        if (mistakes >= 1) {
            setPhase("AI"); 
            setAiState("Q");
            triggerVoice(result.socraticData.q, lCode);
        } else {
            triggerVoice(dict.hints[result.errorType], lCode);
        }
        setTimeout(() => { if(isMounted.current) setIsErrorShake(false); }, 1000);
      }
    }
  };

  const loadLevel = (idx) => {
    if (!isMounted.current) return;
    if (idx >= CHEM_DB.length) { setPhase("BOOT"); setLevelIdx(0); setXp(0); return; }
    setLevelIdx(idx); 
    setC1(1); setC2(1); setCH2O(0); setCH(0); setCOH(0); 
    setErrorMath(""); setIsErrorShake(false); setIsExploding(false); setHelpActive(false); setScannerActive(false);
    setTime(0); setTimerActive(false); setClicks(0); setMistakes(0);
    setPhase("THEORY");
  };

  const invokeAI = () => {
    sfx.aiPop();
    const genericDialog = {
        q: `¿Cuál es el Mínimo Común Múltiplo entre los electrones de ${level.symOx} y ${level.symRed}?`,
        o: [`${RedoxEngine.getMCM(level.eOx, level.eRed)}`, "No lo sé"],
        m: `El MCM es ${RedoxEngine.getMCM(level.eOx, level.eRed)}. Multiplica para igualarlos.`
    };
    setAiDialog(aiDialog || genericDialog);
    setPhase("AI");
    setAiState("Q");
    triggerVoice(aiDialog?.q || genericDialog.q, lCode);
  };

  /* ================= VISTAS UI ================= */
  return (
    <>
      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .hud-pulse { animation: pulse 1s infinite; }
        .hud-btn { padding: 15px 40px; background: #00f2ff; color: #000; font-weight: 900; font-size: 20px; cursor: pointer; border-radius: 10px; border: none; font-family: 'Orbitron', sans-serif; transition: 0.2s; box-shadow: 0 0 30px rgba(0,242,255,0.5); }
        .hud-btn:active { transform: scale(0.95); }
        .hud-btn-ghost { padding: 10px 20px; background: rgba(255,255,255,0.05); border: 2px solid #555; color: #fff; font-size: 18px; cursor: pointer; border-radius: 10px; font-family: 'Orbitron', sans-serif; transition: 0.2s; }
        .hud-btn-ghost:active { transform: scale(0.95); }
        .hud-btn-ghost:hover { border-color: #00f2ff !important; background: rgba(0,242,255,0.1) !important; color: #fff !important; }
        
        /* Mobile-First CSS */
        @media (max-width: 768px) {
          .dock-container { flex-direction: column !important; bottom: 0 !important; width: 100% !important; padding: 10px !important; border-radius: 0 !important; gap: 10px !important; }
          .hud-title { font-size: 40px !important; }
          .side-panel { top: 70px !important; left: 10px !important; right: 10px !important; width: auto !important; max-width: none !important; display: flex !important; flex-wrap: wrap !important; gap: 10px !important; font-size: 14px !important; }
        }
      `}</style>
      
      <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif' }}>
        
        {phase === "BOOT" && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#001122', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
            <div style={{color:'#00f2ff', fontSize:'20px', letterSpacing:'10px', marginBottom:'10px'}}>PROTOCOLO V31</div>
            <h1 className="hud-title hud-glow" style={{color:'#00f2ff', fontSize:'80px', textShadow:'0 0 40px #00f2ff', textAlign:'center', margin: '0 20px'}}>{dict.ui.title}</h1>
            <div style={{marginTop:'40px'}}><button className="hud-btn" onClick={() => { sfx.init(); loadLevel(0); }}>{dict.ui.start}</button></div>
          </div>
        )}

        {phase === "GAMEOVER" && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#300', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
            <h1 className="hud-title hud-glow" style={{color:'#f00', fontSize:'80px', textShadow:'0 0 40px #f00', textAlign: 'center'}}>{dict.ui.explTitle}</h1>
            <button className="hud-btn" style={{background:'#f00', boxShadow:'0 0 30px #f00'}} onClick={() => loadLevel(levelIdx)}>{dict.ui.btnRetry}</button>
          </div>
        )}

        {phase !== "BOOT" && phase !== "GAMEOVER" && (
          <>
            {/* Header */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 500 }}>
              <button className="hud-btn-ghost" onClick={() => window.location.reload()}>⬅ SALIR</button>
              {(phase === "GAME") && !isExploding && (
                <div style={{display:'flex', gap:'10px'}}>
                   <button className="hud-btn-ghost" style={{borderColor:'#ff00ff', color:'#ff00ff'}} onClick={invokeAI}>🧠 IA</button>
                   <button className="hud-btn-ghost" style={{borderColor:'#ffea00', color:'#ffea00'}} onClick={() => setHelpActive(true)}>❓</button>
                </div>
              )}
            </div>

            {/* HUD Central Superior */}
            <div style={{ position:'absolute', top:'80px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:100 }}>
              <div style={{ background:'rgba(0,15,30,0.85)', border:'2px solid #00f2ff', padding:'10px 20px', borderRadius:'15px', textAlign:'center' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width: '100%', borderBottom:'1px solid #444', paddingBottom:'5px'}}>
                  <div style={{ background:'#ff0055', color:'#fff', padding:'2px 10px', borderRadius:'5px', fontWeight:'900' }}>NIVEL {levelIdx + 1}</div>
                  <div style={{color:currentRank.color, fontWeight:'bold', fontSize:'16px'}}>XP: {xp}</div>
                </div>
                <div style={{ fontSize:'clamp(20px, 4vw, 40px)', fontWeight:'900', color:'#fff', marginTop:'10px' }}>{level.eq}</div>
              </div>
            </div>

            {/* Panel de Desglose (Semirreacciones) */}
            {scannerActive && (
              <div className="side-panel" style={{ position:'absolute', top:'200px', right:'20px', zIndex:100, background:'rgba(0,15,30,0.95)', border:'2px solid #00f2ff', padding:'15px', borderRadius:'10px', maxWidth: '350px' }}>
                <div style={{color:'#00f2ff', fontWeight:'bold'}}>Oxidación:<br/><span>{c1} × [{level.hOx}]</span></div>
                <div style={{color:'#ff0055', fontWeight:'bold', marginTop:'10px'}}>Reducción:<br/><span>{c2} × [{level.hRed}]</span></div>
              </div>
            )}
          </>
        )}

        {/* MODALES OVERLAY */}
        {phase === "THEORY" && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,0,0,0.9)', padding: '20px' }}>
            <div style={{ border:'2px solid #00f2ff', background:'rgba(0,15,30,0.9)', padding:'30px', borderRadius:'20px', textAlign:'center', maxWidth:'600px' }}>
              <h2 style={{color: '#00f2ff', fontSize:'30px', margin:0}}>{dict.ui.theoryTitle}</h2>
              <p style={{fontSize:'20px', color: '#fff', margin:'20px 0'}}>Balancea la reacción teniendo en cuenta el medio ({level.env}).</p>
              <button className="hud-btn" onClick={() => { setPhase("GAME"); setTimerActive(true); }}>INICIAR REACTOR</button>
            </div>
          </div>
        )}

        {/* IA SOCRÁTICA DINÁMICA */}
        {phase === "AI" && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,0,0,0.9)', padding: '20px' }}>
            <div style={{ border:'2px solid #ff00ff', background:'rgba(0,15,30,0.9)', padding:'30px', borderRadius:'20px', textAlign:'center', maxWidth:'600px' }}>
              <h2 style={{color:'#ff00ff', fontSize:'30px', margin:0}}>TUTOR IA</h2>
              {aiState === "Q" && aiDialog ? (
                 <div style={{marginTop:'20px'}}>
                   <p style={{fontSize:'22px', color: '#fff'}}>{aiDialog.q}</p>
                   <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
                     {aiDialog.o?.map((opt, i) => (
                       <button key={i} className="hud-btn-ghost" onClick={() => { sfx.aiPop(); setAiState("MICRO"); triggerVoice(aiDialog.m, lCode); }}>{opt}</button>
                     ))}
                   </div>
                 </div>
              ) : (
                 <div style={{fontSize:'20px', color:'#ffea00', marginTop:'20px', textAlign:'left'}}>
                    <p>{aiDialog?.m}</p>
                 </div>
              )}
              {aiState !== "Q" && <div style={{marginTop:'20px'}}><button className="hud-btn" style={{background:'#ff00ff'}} onClick={()=>{setPhase("GAME"); setTimerActive(true); window.speechSynthesis.cancel();}}>{dict.ui.btnContinue}</button></div>}
            </div>
          </div>
        )}

        {helpActive && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,0,0,0.9)', padding: '20px' }}>
             <div style={{ border:'2px solid #ffea00', background:'rgba(0,15,30,0.9)', padding:'30px', borderRadius:'20px', textAlign:'center', maxWidth: '600px' }}>
               <h2 style={{color:'#ffea00', fontSize:'30px'}}>{dict.ui.helpBtn}</h2>
               <p style={{fontSize:'18px', color:'#fff', whiteSpace:'pre-wrap', textAlign:'left', margin:'20px 0'}}>{dict.ui.helpText}</p>
               <button className="hud-btn" style={{background:'#ffea00', color:'#000'}} onClick={() => { setHelpActive(false); window.speechSynthesis.cancel(); }}>CERRAR</button>
             </div>
          </div>
        )}

        {phase === "WIN" && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,0,0,0.9)', padding: '20px' }}>
            <div style={{ border:'2px solid #0f0', background:'rgba(0,30,0,0.9)', padding:'30px', borderRadius:'20px', textAlign:'center' }}>
              <h2 className="hud-glow" style={{color:'#0f0', fontSize:'50px', margin:0}}>{dict.ui.successTitle}</h2>
              <div style={{ margin:'20px 0', fontSize:'20px', color:'#fff' }}>
                <p>Tiempo: {time}s | Ajustes: {clicks}</p>
              </div>
              <button className="hud-btn" style={{background:'#0f0'}} onClick={() => loadLevel(levelIdx + 1)}>{dict.ui.btnNext}</button>
            </div>
          </div>
        )}

        {/* DOCK INFERIOR RESPONSIVO */}
        {(phase === "GAME" || phase === "TRANSFER" || isExploding) && !helpActive && (
          <div style={{ position:'absolute', bottom:'10px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:150 }}>
            <div className="dock-container" style={{ display:'flex', gap:'15px', alignItems:'center', background:'rgba(0,10,20,0.95)', padding:'15px', borderRadius:'25px', border:'2px solid #333', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '800px', width: '95%' }}>
              
              {/* OXIDANTE */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'12px', marginBottom:'5px'}}>REDUCTOR</div>
                <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                  <button className="hud-btn-ghost" style={{width:'35px', height:'35px', borderRadius:'50%', fontSize:'20px', padding:0}} onClick={()=>updateCoef('c1', -1)} disabled={phase==='TRANSFER'}>-</button>
                  <div style={{fontSize:'24px', fontWeight:'bold', color:'#00f2ff', width:'30px', textAlign:'center'}}>{c1}</div>
                  <button className="hud-btn-ghost" style={{width:'35px', height:'35px', borderRadius:'50%', fontSize:'20px', padding:0}} onClick={()=>updateCoef('c1', 1)} disabled={phase==='TRANSFER'}>+</button>
                </div>
              </div>
              
              {/* MASAS (H2O, H+, OH-) */}
              <div style={{display:'flex', flexDirection:'column', gap:'5px', borderLeft:'1px solid #555', borderRight:'1px solid #555', padding:'0 10px'}}>
                <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                   <span style={{color:'#fff', width:'30px', fontSize: '14px'}}>H₂O</span>
                   <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('h2o', -1)}>-</button>
                   <span style={{color:'#fff', width:'25px', textAlign:'center', fontSize:'16px'}}>{cH2O}</span>
                   <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('h2o', 1)}>+</button>
                </div>
                {level.env === "Ácido" && (
                  <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                     <span style={{color:'#ffaa00', width:'30px', fontSize: '14px'}}>H⁺</span>
                     <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('h', -1)}>-</button>
                     <span style={{color:'#ffaa00', width:'25px', textAlign:'center', fontSize:'16px'}}>{cH}</span>
                     <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('h', 1)}>+</button>
                  </div>
                )}
                {level.env === "Básico" && (
                  <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                     <span style={{color:'#ff00aa', width:'30px', fontSize: '14px'}}>OH⁻</span>
                     <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('oh', -1)}>-</button>
                     <span style={{color:'#ff00aa', width:'25px', textAlign:'center', fontSize:'16px'}}>{cOH}</span>
                     <button className="hud-btn-ghost" style={{width:'25px', height:'25px', borderRadius:'50%', padding:0, fontSize:'14px'}} onClick={()=>updateCoef('oh', 1)}>+</button>
                  </div>
                )}
              </div>

              {/* VERIFY */}
              <div style={{display:'flex', flexDirection:'column', gap:'10px', alignItems:'center', position: 'relative'}}>
                <button className="hud-btn" style={{padding: '10px 20px', fontSize: '16px'}} onClick={verify} disabled={phase==='TRANSFER' || isExploding}>{dict.ui.btnCheck}</button>
                <button className="hud-btn-ghost" style={{padding: '5px 10px', fontSize: '12px'}} onClick={toggleScanner} disabled={phase==='TRANSFER' || isExploding}>👁️ {dict.ui.scan}</button>
                {errorMath && phase === "GAME" && <div className="hud-pulse" style={{position:'absolute', top:'-50px', color:'#f00', fontWeight:'bold', background:'rgba(50,0,0,0.9)', padding:'5px', borderRadius:'5px', border:'1px solid #f00', fontSize:'12px', whiteSpace:'nowrap'}}>{errorMath}</div>}
              </div>

              {/* REDUCTOR */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'12px', marginBottom:'5px'}}>OXIDANTE</div>
                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                  <button className="hud-btn-ghost" style={{width:'35px', height:'35px', borderRadius:'50%', fontSize:'20px', padding:0}} onClick={()=>updateCoef('c2', -1)} disabled={phase==='TRANSFER'}>-</button>
                  <div style={{fontSize:'24px', fontWeight:'bold', color:'#ff0055', width:'30px', textAlign:'center'}}>{c2}</div>
                  <button className="hud-btn-ghost" style={{width:'35px', height:'35px', borderRadius:'50%', fontSize:'20px', padding:0}} onClick={()=>updateCoef('c2', 1)} disabled={phase==='TRANSFER'}>+</button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 🌌 CANVAS AISLADO SEGURO */}
        <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
          <Suspense fallback={null}>
            <Canvas camera={{position:[0, 2, 22], fov:45}}>
              <Core3D phase={phase} isExploding={isExploding} isErrorShake={isErrorShake} c1={c1} c2={c2} activeTransfer={phase === 'TRANSFER'} />
            </Canvas>
          </Suspense>
        </div>
      </div>
    </>
  );
}

// 🛡️ EXPORT Y WRAPPER DE SEGURIDAD FINAL
export default function RedoxLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}