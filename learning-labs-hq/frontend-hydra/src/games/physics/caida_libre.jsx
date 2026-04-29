import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback, memo } from 'react';
import { create } from 'zustand';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Line, Html, Sparkles, Trail, Text, Box } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore'; // HUB Integration

/* ============================================================
   🌍 I18N: GOD TIER MULTILANGUAGE LEXICON & PEDAGOGY
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

const LEXICON = {
  es: {
    ui: {
      title: "PROTOCOLO GALILEO: CAÍDA LIBRE",
      target: "ZONA DE IMPACTO", altitude: "ALTITUD (y)", vel: "VELOCIDAD (v)", acc: "GRAVEDAD (g)", 
      mass: "MASA (m)", time: "TIEMPO (t)", ignite: "INICIAR SECUENCIA DE CAÍDA", 
      explain: "🧠 DCL EN VIVO", theoryBtn: "VER TEORÍA", nextMission: "SIGUIENTE FASE", 
      retry: "RECALIBRAR", close: "INICIAR SIMULACIÓN", telemetry: "TELEMETRÍA VERTICAL",
      mission1: "FASE 1: CÁLCULO DE IMPACTO", mission2: "FASE 2: INGENIERÍA GRAVITACIONAL", mission3: "FASE 3: EL VACÍO DE GALILEO",
      purgeData: "PURGAR DATOS", aiLogBtn: "IA LOG", aiClass: "IA CLASE",
      predictedTime: "TIEMPO PREDICHO (s)", targetGravity: "GRAVEDAD OBJETIVO (m/s²)",
      massA: "MASA OBJETO A (kg)", massB: "MASA OBJETO B (kg)"
    },
    theory: {
      t: "ACADEMIA DE ASTRO-DINÁMICA: CAÍDA LIBRE",
      m1_title: "FASE 1: LA ACELERACIÓN CONSTANTE",
      m1_p: "IMAGÍNATE que estás en la cornisa de un rascacielos ciberpunk. Dejas caer una esfera de tungsteno. La gravedad de la Tierra la jala implacablemente hacia abajo con una aceleración de 9.8 m/s². Esto significa que cada segundo que pasa, su velocidad aumenta en 9.8 m/s. Se vuelve letalmente rápida.\n\nTU MISIÓN: Tenemos una sonda a 120m de altura. Conociendo la gravedad terrestre (9.8 m/s²), usa la ecuación t = √(2h/g) para predecir en cuántos segundos exactos impactará el suelo. Inyecta tu predicción y suelta la sonda.",
      m2_title: "FASE 2: MUNDOS ALIENÍGENAS",
      m2_p: "IMAGÍNATE saltar en la Luna; flotas porque la gravedad es de solo 1.62 m/s² y te jala suavemente. Ahora imagínate en Júpiter: serías aplastado contra el suelo al instante porque su gravedad es de 24.79 m/s².\n\nTU MISIÓN: Estamos en un planeta desconocido. Sabemos que soltando la carga desde 150m de altura, tarda exactamente 5.5 segundos en impactar. Usa la ecuación g = 2h/t² para calcular la gravedad de este planeta, inyéctala en la matriz y verifica tu hipótesis.",
      m3_title: "FASE 3: EL VACÍO DE GALILEO",
      m3_p: "IMAGÍNATE soltar una pluma y un martillo pesado al mismo tiempo. En la Tierra, el aire frena la pluma. Pero imagínate estar en el vacío total del espacio... ambos caen EXACTAMENTE al mismo tiempo. La masa NO importa en la caída libre, porque aunque la masa grande es más pesada, también es más difícil de acelerar (inercia), cancelando el efecto.\n\nTU MISIÓN: Suelta dos objetos. Ajusta la masa del Objeto A a 10,000 kg y la del Objeto B a 1 kg. Observa cómo el universo no discrimina masas en el vacío.",
      btn_start: "ENTENDIDO, APLICAR FÍSICA"
    },
    tutor: {
      m1_idle: "Sonda en posición (120m). La gravedad es -9.8 m/s². Calcula el tiempo de impacto e inyéctalo en la consola antes de soltar.",
      m2_idle: "Altitud: 150m. Tiempo objetivo: 5.5s. Calcula la gravedad requerida para lograr este tiempo de impacto exacto.",
      m3_idle: "Cámaras de vacío selladas. Ajusta masas extremas para los Objetos A y B. Demuestra que g afecta a todos por igual.",
      success: "¡IMPACTO SINCRONIZADO! Las matemáticas rigen el universo.",
      fail: "ERROR DE CÁLCULO. La predicción no coincide con la realidad física."
    },
    microClasses: {
      m1_fail: { h: "ERROR DE PREDICCIÓN", p: "Tu tiempo calculado no coincide con el impacto real. Recuerda la ecuación cinemática: h = 1/2 * g * t². Despejando el tiempo obtenemos t = √(2h/g)." },
      m2_fail: { h: "GRAVEDAD INCORRECTA", p: "La carga no impactó en 5.5 segundos. Despejaste mal la gravedad. Si h = 1/2 * g * t², entonces g = 2h / t². Recalcula y ajusta el slider." },
      m3_fail: { h: "ANOMALÍA DEL VACÍO", p: "Ambos objetos debieron caer al mismo tiempo. ¿Alteraste la gravedad de uno de ellos accidentalmente? La aceleración es la misma para ambos." }
    },
    aiAnalysis: {
      m1: "DCL: La única fuerza actuando sobre la masa de {m}kg es su Peso (P = m*g). Al no haber resistencia del aire (F_drag = 0), la aceleración neta es exactamente la gravedad de -9.8 m/s².",
      m2: "DCL: Has inyectado una gravedad artificial de {g} m/s². El Peso de la carga es P = {m} * {g} = {P}N. Cayendo en caída libre pura.",
      m3: "DCL MULTIPLE: Objeto A ({ma}kg) recibe una Fuerza de {Pa}N. Objeto B ({mb}kg) recibe una Fuerza de {Pb}N. Pero al dividir F/m, AMBOS tienen una aceleración de -9.8 m/s²."
    }
  },
  en: {
    ui: {
      title: "GALILEO PROTOCOL: FREE FALL",
      target: "IMPACT ZONE", altitude: "ALTITUDE (y)", vel: "VELOCITY (v)", acc: "GRAVITY (g)", 
      mass: "MASS (m)", time: "TIME (t)", ignite: "INITIATE DROP SEQUENCE", 
      explain: "🧠 LIVE FBD", theoryBtn: "VIEW THEORY", nextMission: "NEXT PHASE", 
      retry: "RECALIBRATE", close: "START SIMULATION", telemetry: "VERTICAL TELEMETRY",
      mission1: "PHASE 1: IMPACT CALCULATION", mission2: "PHASE 2: GRAVITATIONAL ENGINEERING", mission3: "PHASE 3: GALILEO'S VACUUM",
      purgeData: "PURGE DATA", aiLogBtn: "AI LOG", aiClass: "AI CLASS",
      predictedTime: "PREDICTED TIME (s)", targetGravity: "TARGET GRAVITY (m/s²)",
      massA: "OBJECT A MASS (kg)", massB: "OBJECT B MASS (kg)"
    },
    theory: {
      t: "ASTRO-DYNAMICS ACADEMY: FREE FALL",
      m1_title: "PHASE 1: CONSTANT ACCELERATION",
      m1_p: "IMAGINE standing on the ledge of a cyberpunk skyscraper. You drop a tungsten sphere. Earth's gravity pulls it relentlessly downward at 9.8 m/s². Every passing second, its velocity increases by 9.8 m/s. It becomes lethally fast.\n\nYOUR MISSION: We have a probe at 120m altitude. Knowing Earth's gravity (9.8 m/s²), use t = √(2h/g) to predict exact seconds to impact. Inject your prediction and drop.",
      m2_title: "PHASE 2: ALIEN WORLDS",
      m2_p: "IMAGINE jumping on the Moon; you float because gravity is only 1.62 m/s² pulling you gently. Now imagine Jupiter: you'd be crushed instantly because gravity is 24.79 m/s².\n\nYOUR MISSION: We're on an unknown planet. Dropping a payload from 150m takes exactly 5.5 seconds to impact. Use g = 2h/t² to calculate this planet's gravity, inject it into the matrix, and verify your hypothesis.",
      m3_title: "PHASE 3: GALILEO'S VACUUM",
      m3_p: "IMAGINE dropping a feather and a heavy hammer at the same time. On Earth, air slows the feather. But imagine being in the total vacuum of space... both fall EXACTLY at the same time. Mass DOES NOT matter in free fall, because although large mass is heavier, it's also harder to accelerate (inertia), canceling the effect.\n\nYOUR MISSION: Drop two objects. Set Object A to 10,000 kg and Object B to 1 kg. Watch how the universe doesn't discriminate mass in a vacuum.",
      btn_start: "UNDERSTOOD, APPLY PHYSICS"
    },
    tutor: {
      m1_idle: "Probe at 120m. Gravity is -9.8 m/s². Calculate impact time and inject before dropping.",
      m2_idle: "Altitude: 150m. Target time: 5.5s. Calculate the gravity required to achieve this exact impact time.",
      m3_idle: "Vacuum chambers sealed. Adjust extreme masses for Objects A and B. Prove g affects all equally.",
      success: "SYNCHRONIZED IMPACT! Math rules the universe.",
      fail: "CALCULATION ERROR. Prediction does not match physical reality."
    },
    microClasses: {
      m1_fail: { h: "PREDICTION ERROR", p: "Your calculated time didn't match real impact. Remember kinematics: h = 1/2 * g * t². Solving for time gives t = √(2h/g)." },
      m2_fail: { h: "INCORRECT GRAVITY", p: "Payload didn't hit in 5.5s. You solved gravity incorrectly. If h = 1/2 * g * t², then g = 2h / t². Recalculate and adjust slider." },
      m3_fail: { h: "VACUUM ANOMALY", p: "Both objects should have fallen simultaneously. Did you accidentally alter one's gravity? Acceleration is identical for both." }
    },
    aiAnalysis: {
      m1: "FBD: The only force acting on the {m}kg mass is Weight (W = m*g). With no air resistance (F_drag = 0), net acceleration is exactly -9.8 m/s².",
      m2: "FBD: You injected an artificial gravity of {g} m/s². Payload Weight is W = {m} * {g} = {P}N. Pure free fall.",
      m3: "MULTIPLE FBD: Object A ({ma}kg) feels {Pa}N Force. Object B ({mb}kg) feels {Pb}N Force. But dividing F/m, BOTH have -9.8 m/s² acceleration."
    }
  }
};

const GLOBAL_DATABANK = {
  es: [
    { concept: "CAÍDA LIBRE", description: "Movimiento vertical donde la única fuerza actuando es la gravedad. Se ignora la fricción del aire.", equation: "ΣF_y = -m·g" },
    { concept: "ACELERACIÓN GRAVITACIONAL (g)", description: "Todos los cuerpos caen con la misma aceleración en el vacío, independientemente de su masa. En la Tierra es ~9.8 m/s².", equation: "a_y = -g" },
    { concept: "POSICIÓN (y)", description: "La altura disminuye de forma cuadrática respecto al tiempo formando una parábola invertida.", equation: "y = y_0 + v_0·t - 1/2·g·t²" },
    { concept: "VELOCIDAD (v_y)", description: "La velocidad aumenta linealmente hacia abajo. Cada segundo, la velocidad crece en 9.8 m/s.", equation: "v_y = v_0 - g·t" }
  ],
  en: [
    { concept: "FREE FALL", description: "Vertical motion where gravity is the only force acting. Air friction is ignored.", equation: "ΣF_y = -m·g" },
    { concept: "GRAVITATIONAL ACCELERATION (g)", description: "All bodies fall with the same acceleration in a vacuum, regardless of mass. On Earth it's ~9.8 m/s².", equation: "a_y = -g" },
    { concept: "POSITION (y)", description: "Height decreases quadratically with respect to time, forming an inverted parabola.", equation: "y = y_0 + v_0·t - 1/2·g·t²" },
    { concept: "VELOCITY (v_y)", description: "Velocity increases linearly downwards. Every second, velocity grows by 9.8 m/s.", equation: "v_y = v_0 - g·t" }
  ]
};

/* ============================================================
   🎹 BINAURAL AUDIO KERNEL (NATIVE WEB AUDIO API)
============================================================ */
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.initialized = false;
  }
  unlock() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.initialized = true;
  }
  playOsc(freq, type, dur, vol) {
    if (!this.initialized || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch(e){}
  }
  click() { this.playOsc(800, 'square', 0.05, 0.05); }
  slide() { this.playOsc(400, 'sine', 0.05, 0.02); }
  drop() { 
      this.playOsc(600, 'sine', 0.1, 0.1); 
      setTimeout(() => this.playOsc(300, 'sawtooth', 0.8, 0.05), 100); 
  }
  impact() { 
      this.playOsc(100, 'square', 0.2, 0.2); 
      setTimeout(() => this.playOsc(50, 'sawtooth', 0.3, 0.1), 100); 
  }
  success() { 
    this.playOsc(523.25, 'triangle', 0.3, 0.1); 
    setTimeout(() => this.playOsc(1046.5, 'triangle', 0.4, 0.1), 100); 
  }
  fail() { this.playOsc(110, 'sawtooth', 0.6, 0.15); }
}
const sfx = new CyberAudio();

const CyberHaptics = {
  vibrate(pattern) {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      try { window.navigator.vibrate(pattern); } catch (e) {}
    }
  }
};

class VoiceEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.langs = { es: 'es-ES', en: 'en-US' };
    this.voiceCache = {};
  }
  speak(text, langCode = 'es') {
    if (!this.synth) return;
    if (!this.voiceCache[langCode]) {
      const voices = this.synth.getVoices();
      this.voiceCache[langCode] = voices.find(voice => voice.lang === this.langs[langCode]) || null;
    }
    this.synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = this.langs[langCode] || 'es-ES';
    utterThis.rate = 1.05;
    utterThis.pitch = 0.8;
    if (this.voiceCache[langCode]) utterThis.voice = this.voiceCache[langCode];
    this.synth.speak(utterThis);
  }
  stop() { if (this.synth) this.synth.cancel(); }
}
const TTS = new VoiceEngine();

/* ============================================================
   🛡️ KERNEL SHIELD (ERROR BOUNDARY)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "", errorStack: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("Quantum Core Panic:", error, errorInfo); this.setState({ errorStack: errorInfo.componentStack }); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#000', color: '#f00', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 9999, fontFamily: 'monospace', padding: '20px', boxSizing: 'border-box' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textShadow: '0 0 20px #f00' }}>⚠️ FATAL EXCEPTION</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: '20px', border: '1px solid #f00', borderRadius: '8px', maxWidth: '80%', overflow: 'auto' }}>{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '15px 30px', marginTop: '20px', cursor: 'pointer', background: '#f00', color: '#000', border: 'none', fontWeight: 'bold', fontSize: '16px' }}>SYSTEM REBOOT</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   📊 MISSION TELEMETRY SYSTEM
============================================================ */
class MissionTelemetry {
  constructor() {
    this.missionHistory = [];
    this.currentMission = null;
  }
  startMission(mission) {
    this.currentMission = { ...mission, startTime: Date.now(), completed: false, success: false };
  }
  endMission(success, errorMargin) {
    if (this.currentMission) {
      this.currentMission.completed = true; 
      this.currentMission.success = success; 
      this.currentMission.errorMargin = errorMargin;
      this.currentMission.endTime = Date.now(); 
      this.missionHistory.unshift(this.currentMission);
      if (this.missionHistory.length > 10) this.missionHistory.pop();
      this.currentMission = null;
    }
  }
  getMissionHistory() { return this.missionHistory; }
}
const missionTelemetry = new MissionTelemetry();

/* ============================================================
   🧠 PHYSICS ENGINE & MISSION CONTROLLER (ZUSTAND O(1))
============================================================ */
const MAX_HISTORY = 200;

const usePhysicsStore = create((set, get) => ({
  missionId: 1, 
  gameState: 'THEORY', // THEORY, PLAYING, MICRO_CLASS, SUCCESS
  simTime: 0,
  
  // Entities: A = Primary Object, B = Secondary Object (for Galileo drop)
  objA: { y: 120, v: 0, a: -9.8, mass: 1000 },
  objB: { y: 120, v: 0, a: -9.8, mass: 1 }, 
  
  // Mission Params
  startHeight: 120,
  targetGravity: -9.8,
  predictedTime: 0,
  targetTime: 0,
  
  // O(1) Telemetry Array Buffers for Graphing y(t) and v(t)
  history: { 
    y: new Float32Array(MAX_HISTORY), 
    v: new Float32Array(MAX_HISTORY), 
    ptr: 0 
  },
  
  tutorMsg: "",
  microClassData: null,

  initMission: (id, langUI) => {
    sfx.unlock();
    
    let objAInit = { y: 120, v: 0, a: -9.8, mass: 1000 };
    let objBInit = { y: 120, v: 0, a: -9.8, mass: 1 };
    let msg = "";
    let sHeight = 120;
    let tGravity = -9.8;
    let tTime = 0;
    let pTime = 4.95; // Default prediction for UI

    if (id === 1) {
      // Tierra: Calcular tiempo
      sHeight = 120; tGravity = -9.8;
      objAInit = { y: sHeight, v: 0, a: tGravity, mass: 1000 };
      msg = langUI.tutor.m1_idle;
      tTime = Math.sqrt((2 * sHeight) / Math.abs(tGravity));
    } else if (id === 2) {
      // Planeta Alien: Calcular Gravedad basada en tiempo (5.5s) y altura (150m)
      sHeight = 150; tTime = 5.5;
      tGravity = -(2 * sHeight) / (tTime * tTime); // g = 2h/t^2 => -9.917
      objAInit = { y: sHeight, v: 0, a: tGravity, mass: 1000 };
      msg = langUI.tutor.m2_idle;
    } else if (id === 3) {
      // Galileo: Misma altura, masas extremas
      sHeight = 100; tGravity = -9.8;
      objAInit = { y: sHeight, v: 0, a: tGravity, mass: 10000 };
      objBInit = { y: sHeight, v: 0, a: tGravity, mass: 1 };
      msg = langUI.tutor.m3_idle;
    }

    set({
      missionId: id,
      gameState: 'PLAYING',
      simTime: 0,
      tutorMsg: msg,
      microClassData: null,
      startHeight: sHeight,
      targetGravity: tGravity,
      targetTime: tTime,
      predictedTime: pTime,
      objA: objAInit,
      objB: objBInit,
      history: { y: new Float32Array(MAX_HISTORY).fill(0), v: new Float32Array(MAX_HISTORY).fill(0), ptr: 0 }
    });
  },

  setUserGravity: (g) => set(s => ({ objA: { ...s.objA, a: -Math.abs(g) } })),
  setPredictedTime: (t) => set({ predictedTime: t }),
  setMassA: (m) => set(s => ({ objA: { ...s.objA, mass: m } })),
  setMassB: (m) => set(s => ({ objB: { ...s.objB, mass: m } })),

  triggerDrop: () => {
    sfx.drop();
    missionTelemetry.startMission({ id: get().missionId, height: get().startHeight });
    set({ simTime: 0.001 }); // Starts simulation loop
  },

  triggerAI: () => set({ gameState: 'AI_PAUSE' }),
  resumeGame: () => set({ gameState: 'PLAYING' }),

  step: (dt, langUI) => set(state => {
    if (state.gameState !== 'PLAYING' || state.simTime === 0) return state;

    let { objA, objB, missionId, history, simTime, predictedTime, targetTime, targetGravity, startHeight } = state;
    let nextState = 'PLAYING';
    let microClass = null;

    // --- INTEGRACIÓN FÍSICA PURA (Caída Libre 1D en Y) ---
    // Objeto A
    objA.v += objA.a * dt;
    objA.y += objA.v * dt;
    
    // Objeto B (Solo activo visualmente en Misión 3)
    if (missionId === 3) {
      objB.v += objB.a * dt;
      objB.y += objB.v * dt;
    }

    // Comprobación de impacto (Suelo y = 0)
    if (objA.y <= 0) {
      objA.y = 0; objA.v = 0; objA.a = 0;
      if (missionId === 3) { objB.y = 0; objB.v = 0; objB.a = 0; }
      
      sfx.impact();
      CyberHaptics.vibrate([200, 100, 200]);

      // Evaluación del éxito
      if (missionId === 1) {
        // Comparar tiempo real vs tiempo predicho por usuario
        const realTime = simTime;
        const error = Math.abs(realTime - predictedTime);
        if (error <= 0.25) {
          nextState = 'SUCCESS'; sfx.success();
        } else {
          nextState = 'MICRO_CLASS'; sfx.fail(); microClass = langUI.microClasses.m1_fail;
        }
        missionTelemetry.endMission(nextState === 'SUCCESS', error);
      } 
      else if (missionId === 2) {
        // Comparar tiempo de impacto con tiempo objetivo (5.5s)
        const error = Math.abs(simTime - targetTime);
        if (error <= 0.25) {
          nextState = 'SUCCESS'; sfx.success();
        } else {
          nextState = 'MICRO_CLASS'; sfx.fail(); microClass = langUI.microClasses.m2_fail;
        }
        missionTelemetry.endMission(nextState === 'SUCCESS', error);
      }
      else if (missionId === 3) {
        // En el vacío, SIEMPRE tienen éxito si caen al mismo tiempo (que lo hacen por física pura)
        nextState = 'SUCCESS'; sfx.success();
        missionTelemetry.endMission(true, 0);
      }
    }

    // Telemetría Circular O(1)
    const ptr = history.ptr;
    history.y[ptr] = objA.y;
    history.v[ptr] = objA.v;

    return {
      simTime: simTime + dt,
      objA: { ...objA },
      objB: { ...objB },
      gameState: nextState,
      microClassData: microClass,
      history: { ...history, ptr: (ptr + 1) % MAX_HISTORY }
    };
  })
}));

/* ============================================================
   🧊 MOTOR GRÁFICO 3D (REACT THREE FIBER)
============================================================ */
function PhysicsEngine({ langUI }) {
  const step = usePhysicsStore(state => state.step);
  useFrame((_, dt) => step(Math.min(dt, 0.1), langUI));
  return null;
}

// DCL Flotante HTML en 3D
const LiveDCL = memo(({ entity, label, showMass = true }) => {
  return (
    <Html position={[2, 0, 0]} center zIndexRange={[100, 0]}>
      <div style={{ background: 'rgba(0,10,20,0.85)', border: '1px solid #00f2ff', padding: '10px', borderRadius: '8px', color: '#fff', fontFamily: 'monospace', width: '220px', boxShadow: '0 0 15px rgba(0,242,255,0.3)', pointerEvents: 'none' }}>
         <div style={{ color: '#00f2ff', textAlign: 'center', marginBottom: '8px', fontWeight: 'bold' }}>{label}</div>
         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>a:</span> <span style={{color: '#ff0055'}}>{entity.a.toFixed(2)} m/s²</span></div>
         <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>v:</span> <span style={{color: '#00ff88'}}>{entity.v.toFixed(1)} m/s</span></div>
         {showMass && (
           <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', marginTop: '5px', paddingTop: '5px' }}>
             <span>P = m*g:</span> <span style={{color: '#ffaa00'}}>{Math.abs(entity.mass * entity.a).toFixed(0)} N</span>
           </div>
         )}
      </div>
    </Html>
  );
});

const VectorArrow = ({ from, to, color, label }) => {
  const ref = useRef();
  const dirVec = useMemo(() => new THREE.Vector3(), []);
  const fromVec = useMemo(() => new THREE.Vector3(), []);
  const toVec = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!ref.current) return;
    fromVec.set(...from); toVec.set(...to);
    
    const length = toVec.distanceTo(fromVec);
    if (length < 0.1) { ref.current.visible = false; return; }
    
    ref.current.visible = true;
    dirVec.subVectors(toVec, fromVec).normalize();
    
    const shaft = ref.current.children[0];
    const head = ref.current.children[1];
    
    shaft.position.set(0, length / 2, 0); // Y-axis aligned
    shaft.scale.set(1, length, 1);
    head.position.set(0, length, 0);
    // Orient downwards or upwards depending on direction
    const signY = Math.sign(dirVec.y) || -1;
    head.rotation.set(signY === -1 ? Math.PI : 0, 0, 0); 
    ref.current.position.copy(fromVec);
  });

  return (
    <group ref={ref}>
      <mesh><cylinderGeometry args={[0.2, 0.2, 1, 8]} /><meshBasicMaterial color={color} /></mesh>
      <mesh><coneGeometry args={[0.5, 1, 8]} /><meshBasicMaterial color={color} /></mesh>
      <Html position={[0.8, -2, 0]} center>
          <div style={{ color, fontWeight: 'bold', textShadow: '0 0 5px #000', fontSize: '14px', background: 'rgba(0,0,0,0.5)', padding: '2px 5px', borderRadius: '4px' }}>{label}</div>
      </Html>
    </group>
  );
};

function SceneEntities({ missionId }) {
  const { objA, objB, simTime } = usePhysicsStore();
  const aRef = useRef();
  const bRef = useRef();

  useFrame(() => {
    if (aRef.current) aRef.current.position.y = objA.y;
    if (bRef.current && missionId === 3) bRef.current.position.y = objB.y;
  });

  const scaleA = missionId === 3 ? 0.5 + (objA.mass/2000) : 2; // Dinámico en M3
  const scaleB = missionId === 3 ? 0.5 + (objB.mass/2000) : 1;

  return (
    <group>
      {/* ESTRUCTURA (TORRE) */}
      <group position={[-8, 0, -5]}>
        <mesh position={[0, 75, 0]}><cylinderGeometry args={[2, 2, 150, 8]} /><meshStandardMaterial color="#222" metalness={0.8} /></mesh>
        {/* Altitudes Markers */}
        {[0, 50, 100, 150].map(y => (
          <group key={`m-${y}`} position={[0, y, 0]}>
            <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[3, 0.2, 16, 32]} /><meshBasicMaterial color="#00f2ff" /></mesh>
            <Html position={[-4, 0, 0]} center><div style={{color:'#00f2ff', fontFamily:'monospace', fontSize:'14px'}}>{y}m</div></Html>
          </group>
        ))}
      </group>

      {/* OBJETO PRINCIPAL A */}
      <group ref={aRef} position={[0, 0, 0]}>
        <mesh scale={[scaleA, scaleA, scaleA]}><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} /></mesh>
        
        {simTime > 0 && (
          <group>
            {/* Vector Velocidad (Verde, crece) */}
            <VectorArrow from={[0, -scaleA, 0]} to={[0, -scaleA + objA.v*0.1, 0]} color="#00ff88" label="v" />
            {/* Vector Aceleración (Rojo, constante) */}
            <VectorArrow from={[0, scaleA, 0]} to={[0, scaleA + objA.a*0.2, 0]} color="#ff0055" label="g" />
            <LiveDCL entity={objA} label="DCL: OBJETO A" />
            <Trail width={2} length={40} color="#00f2ff" attenuation={(t) => t * t} />
          </group>
        )}
      </group>

      {/* OBJETO B (Solo Misión 3) */}
      {missionId === 3 && (
        <group ref={bRef} position={[5, 0, 0]}>
          <mesh scale={[scaleB, scaleB, scaleB]}><boxGeometry args={[1, 1, 1]} /><meshStandardMaterial color="#ffaa00" roughness={0.3} metalness={0.5} /></mesh>
          {simTime > 0 && (
            <group>
              <VectorArrow from={[0, -scaleB, 0]} to={[0, -scaleB + objB.v*0.1, 0]} color="#00ff88" label="v" />
              <VectorArrow from={[0, scaleB, 0]} to={[0, scaleB + objB.a*0.2, 0]} color="#ff0055" label="g" />
              <LiveDCL entity={objB} label="DCL: OBJETO B" />
              <Trail width={2} length={40} color="#ffaa00" attenuation={(t) => t * t} />
            </group>
          )}
        </group>
      )}

      {/* SUELO (ZONA DE IMPACTO) */}
      <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.5, 0]}>
         <planeGeometry args={[100, 100]} />
         <meshStandardMaterial color="#001133" metalness={0.8} />
         <Grid args={[100, 100]} cellColor="#00f2ff" sectionColor="#00f2ff" sectionThickness={1.5} />
      </mesh>
    </group>
  );
}

function CinematicCamera() {
  const { objA, simTime } = usePhysicsStore();
  const { camera } = useThree();

  useFrame(() => {
    // Si no ha empezado, vista general de la torre. Si cae, lo sigue.
    let targetY = 75;
    let targetZ = 80;
    
    if (simTime > 0) {
      targetY = Math.max(0, objA.y);
      targetZ = 40 + Math.abs(objA.v) * 0.2; // Efecto vértigo
    }

    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 15, 0.05);
    camera.lookAt(0, Math.max(0, objA.y - 10), 0);
  });
  return null;
}

/* ============================================================
   📊 HUD HTML5: GRÁFICAS DE TELEMETRÍA O(1)
============================================================ */
const TelemetryGraph = memo(({ label, type, color, maxVal, isVelocity=false }) => {
  const canvasRef = useRef();
  const { history } = usePhysicsStore();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const w = 250; const h = 60;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    
    const ptr = history.ptr;
    const data = history[type];
    
    for (let i = 0; i < MAX_HISTORY; i++) {
      const val = data[(ptr + i) % MAX_HISTORY];
      const x = (i / MAX_HISTORY) * w;
      // Posición y = 0 al fondo, Velocidad = empieza en 0 y va negativo
      let yCoord = 0;
      if (isVelocity) {
        // Velocidad (negativa) se dibuja desde el top (0) hacia abajo
        yCoord = Math.min((Math.abs(val) / maxVal) * h, h);
      } else {
        // Posición (positiva) se dibuja desde bottom (0) hacia arriba (h)
        yCoord = h - Math.min((val / maxVal) * h, h);
      }
      
      if (i === 0) ctx.moveTo(x, yCoord); else ctx.lineTo(x, yCoord);
    }
    ctx.stroke();
  }, [history.ptr, type, color, maxVal, isVelocity]);

  return (
    <div style={{ flex: 1, background: 'rgba(2, 6, 23, 0.95)', padding: '15px', borderRadius: '12px', border: `1px solid ${color}60`, boxShadow: '0 5px 20px rgba(0,0,0,0.5)' }}>
      <div style={{ fontSize: '11px', color, fontWeight: 'bold', letterSpacing: '1px' }}>{label}</div>
      <canvas ref={canvasRef} width={250} height={60} style={{ width: '100%', marginTop: '5px' }} />
    </div>
  );
});

/* ============================================================
   🤖 NEURAL ASYNC & PDF 
============================================================ */
const cleanJSONResponse = (raw) => {
  if (!raw) return null;
  try {
    let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
    return JSON.parse(cleaned);
  } catch (e) { return null; }
};

const fetchAILesson = async (topicLogic, lang) => {
  const targetLang = lang === 'en' ? "ENGLISH" : "SPANISH";
  const sysPrompt = `You are an Advanced Physics Tutor. Generate a lesson about: "${topicLogic}". Language: ${targetLang}. JSON format: {"title":"...", "concept":"...", "equations":[{"equation":"...", "description":"..."}], "example":{"situation":"...", "calculation":"...", "result":"..."}, "visualization":"...", "misconceptions":["..."], "applications":"..."}`;
  try {
    const res = await fetch(DEEPSEEK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7 }) });
    const data = await res.json();
    return cleanJSONResponse(data.choices[0].message.content);
  } catch (error) {
    return { title: `Lesson: ${topicLogic}`, concept: "Physics concepts mapped.", equations: [{ equation: "y=1/2gt^2", description: "Free Fall" }], example: { situation: "Space", calculation: "1+1", result: "2" }, visualization: "Vectors", misconceptions: ["Mass affects speed in vacuum"], applications: "Space Travel" };
  }
};

const fetchDilemmaFromAI = async (topicLogic, lang) => {
  const targetLang = lang === 'en' ? "ENGLISH" : "SPANISH";
  const sysPrompt = `Generate a multiple-choice dilemma about: "${topicLogic}". Language: ${targetLang}. JSON format: {"title":"...", "theory":"...", "demoQuestion":{"text":"...", "options":[{"text":"...","explanation":"..."}], "correctIdx":0, "analysis":"..."}, "hint":"..."}`;
  try {
    const res = await fetch(DEEPSEEK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` }, body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.8, response_format: { type: "json_object" } }) });
    const data = await res.json();
    const parsed = cleanJSONResponse(data.choices[0].message.content);
    if (parsed && parsed.demoQuestion) {
      const options = [...parsed.demoQuestion.options];
      const correctText = options[parsed.demoQuestion.correctIdx].text;
      for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
      const newCorrectIdx = options.findIndex(opt => opt.text === correctText);
      return { ...parsed, demoQuestion: { ...parsed.demoQuestion, options: options.map(opt => opt.text), correctIdx: newCorrectIdx, explanations: options.map(opt => opt.explanation) } };
    }
    throw new Error("Invalid structure");
  } catch (error) {
    return { title: "EMERGENCY PROTOCOL", theory: "Gravity is constant in vacuum.", demoQuestion: { text: "Drop 10kg and 1kg in vacuum. Which hits first?", options: ["10kg", "1kg", "Both same time", "Depends on height"], correctIdx: 2, analysis: "Mass cancels out.", explanations: ["","","Correct",""] }, hint: "Vacuum removes drag." };
  }
};

const MarkdownParser = ({ text }) => {
  const htmlContent = useMemo(() => {
    if (!text) return { __html: "" };
    let parsed = text.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:15px;">$1</h3>').replace(/## (.*)/g, '<h2 style="color:#ffaa00; margin-top:15px;">$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f0;">$1</strong>').replace(/\*(.*?)\*/g, '<em style="color:#aaa;">$1</em>').replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
    return { __html: parsed };
  }, [text]);
  return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#fff', fontSize: '16px', lineHeight: '1.6' }} />;
};

const downloadPDF = (classData, langCode) => {
  sfx.click(); const date = new Date().toLocaleString();
  const printWindow = window.open('', '', 'height=900,width=850');
  printWindow.document.write(`<html><body style="font-family: sans-serif; padding: 40px;"><h1>${classData.title || 'LOG'}</h1><p>${classData.theory || classData.concept || ''}</p><p>Generated: ${date}</p></body></html>`);
  printWindow.document.close(); setTimeout(() => { printWindow.focus(); printWindow.print(); }, 1000);
};

/* ============================================================
   🎮 MAIN APPLICATION (GALILEO PROTOCOL)
============================================================ */
function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = LEXICON[language] ? language : 'es';
  const UI = LEXICON[safeLang].ui;
  const THEORY = LEXICON[safeLang].theory;

  const store = usePhysicsStore();
  const { missionId, gameState, simTime, tutorMsg, microClassData, objA, objB, predictedTime, startHeight, targetTime, targetGravity, history } = store;
  const resetApp = useGameStore(s => s.resetProgress);

  // Inputs para los sliders
  const [inputs, setInputs] = useState({ pTime: 4.95, gravity: -9.8, massA: 10000, massB: 1 });

  // Modals & IA State
  const [showDatabank, setShowDatabank] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [preloadedDilemma, setPreloadedDilemma] = useState(null);
  const [showAILesson, setShowAILesson] = useState(false);
  const [aiLesson, setAILesson] = useState(null);
  const [aiSolved, setAiSolved] = useState(false);
  const [selectedAiOption, setSelectedAiOption] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLog, setHistoryLog] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('icfes_physics_freefall');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Init
  useEffect(() => {
    let isMounted = true;
    sfx.unlock();
    TTS.speak(LEXICON[safeLang].voice.init, safeLang);
    usePhysicsStore.getState().initMission(1, LEXICON[safeLang], safeLang);
    return () => { isMounted = false; TTS.stop(); };
  }, [safeLang]);

  // Dilemma pre-fetch
  useEffect(() => {
    if(missionId) {
      const topic = missionId === 1 ? "FREE FALL EQUATIONS" : missionId === 2 ? "GRAVITY DIFFERENCES" : "GALILEOS VACUUM";
      fetchDilemmaFromAI(topic, safeLang).then(data => setPreloadedDilemma(data));
    }
  }, [missionId, safeLang]);

  const handleSlider = (e) => {
    sfx.slide();
    const { name, value } = e.target;
    const num = Number(value);
    setInputs(prev => ({ ...prev, [name]: num }));
    
    if(name === 'pTime') store.setPredictedTime(num);
    if(name === 'gravity') store.setUserGravity(num);
    if(name === 'massA') store.setMassA(num);
    if(name === 'massB') store.setMassB(num);
  };

  const handleDrop = (e) => {
    e.stopPropagation();
    store.triggerDrop();
  };

  const resetSim = (e) => {
    if (e) e.stopPropagation(); sfx.click();
    store.initMission(missionId, LEXICON[safeLang], safeLang);
  };

  const nextLevel = (e) => {
    e.stopPropagation(); sfx.success();
    const nextLvl = missionId === 3 ? 1 : missionId + 1;
    store.initMission(nextLvl, LEXICON[safeLang], safeLang);
  };

  const handleAiAnswer = (index) => {
    sfx.click(); setSelectedAiOption(index);
    if (index === preloadedDilemma.demoQuestion.correctIdx) {
      sfx.success(); setAiSolved(true); TTS.speak(UI.aiRestored, safeLang);
      const newLog = [{ id: Date.now(), date: new Date().toLocaleString(), topic: preloadedDilemma.title, classData: preloadedDilemma }, ...historyLog];
      setHistoryLog(newLog); window.localStorage.setItem('icfes_physics_freefall', JSON.stringify(newLog));
    } else {
      sfx.error(); TTS.speak(UI.aiError, safeLang);
    }
  };

  const requestAILesson = async () => {
    sfx.click();
    const topicStr = missionId === 1 ? "FREE FALL" : missionId === 2 ? "GRAVITATIONAL ACCELERATION" : "GALILEO EXPERIMENT";
    const lesson = await fetchAILesson(topicStr, safeLang);
    setAILesson(lesson); setShowAILesson(true); TTS.speak(lesson.concept, safeLang);
  };

  // DCL Modal
  const AnalysisModal = () => {
    let eq = ""; let exp = "";
    if (missionId === 1) {
        eq = `t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${startHeight})}{9.8}}`;
        exp = LEXICON[safeLang].aiAnalysis.m1.replace('{m}', objA.mass);
    } else if (missionId === 2) {
        eq = `g = \\frac{2h}{t^2} = \\frac{2(${startHeight})}{${targetTime}^2}`;
        const gVal = inputs.gravity || 9.8;
        exp = LEXICON[safeLang].aiAnalysis.m2.replace('{g}', gVal).replace('{m}', objA.mass).replace('{P}', Math.abs(objA.mass * gVal).toFixed(0));
    } else {
        eq = `a_A = \\frac{P_A}{m_A} = -g \\quad \\quad a_B = \\frac{P_B}{m_B} = -g`;
        exp = LEXICON[safeLang].aiAnalysis.m3.replace('{ma}', objA.mass).replace('{Pa}', Math.abs(objA.mass*9.8).toFixed(0)).replace('{mb}', objB.mass).replace('{Pb}', Math.abs(objB.mass*9.8).toFixed(0));
    }

    return (
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ maxWidth: '650px', background: '#020617', padding: '40px', borderRadius: '24px', border: `2px solid #00f2ff`, textAlign: 'center', boxShadow: '0 0 80px rgba(0,242,255,0.2)' }}>
              <i className="fas fa-brain fa-4x" style={{ color: '#00f2ff', marginBottom: '20px' }}></i>
              <h2 style={{ color: '#00f2ff', fontSize: '1.8rem', marginBottom: '20px', letterSpacing: '2px' }}>{UI.explain}</h2>
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '25px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '1.4rem', color: '#ffea00', marginBottom: '20px', border: '1px solid #333' }}>
                  {eq}
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '1.2rem', lineHeight: '1.7', marginBottom: '35px' }}>{exp}</p>
              <button onClick={() => { sfx.click(); store.resumeGame(); }} style={{ width: '100%', padding: '20px', background: '#00f2ff', color: '#000', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem', letterSpacing: '1px' }}>
                  CERRAR ANÁLISIS
              </button>
          </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010205', color: '#fff', fontFamily: "'Orbitron', sans-serif", userSelect: 'none', touchAction: 'none' }}>
      <style>{`
        html, body, #root { margin: 0; padding: 0; overflow: hidden; touch-action: none; width: 100%; height: 100%; }
        .sci-btn { padding: 12px 20px; background: rgba(0, 242, 255, 0.1); color: #00f2ff; font-weight: bold; font-size: 14px; cursor: pointer; border: 1px solid #00f2ff; text-transform: uppercase; transition: all 0.3s; clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%); }
        .sci-btn:hover { background: #00f2ff; color: #000; box-shadow: 0 0 20px #00f2ff; }
        .action-btn { padding: 15px 35px; background: #ffaa00; color: #000; font-weight: 900; font-size: 20px; cursor: pointer; border: none; text-transform: uppercase; clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%); transition: all 0.2s; box-shadow: 0 0 20px rgba(255,170,0,0.5); }
        .action-btn:active { transform: scale(0.95); }
        .hud-panel { background: rgba(0, 10, 20, 0.85); border-left: 3px solid #00f2ff; backdrop-filter: blur(15px); padding: 20px; box-shadow: 10px 0 30px rgba(0,0,0,0.8); border-radius: 0 8px 8px 0; }
        .sci-slider { -webkit-appearance: none; width: 100%; height: 8px; background: #222; border-radius: 4px; outline: none; border: 1px solid #444; margin: 10px 0; }
        .sci-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 25px; height: 25px; border-radius: 50%; background: #00f2ff; cursor: pointer; box-shadow: 0 0 15px #00f2ff; }
        .ai-btn { padding: 15px; text-align: left; font-size: 16px; cursor: pointer; font-weight: bold; border-radius: 8px; border: 1px solid #444; background: rgba(255,255,255,0.05); color: #aaa; }
        .ai-btn.selected-correct { background: rgba(0,255,0,0.2) !important; border-color: #0f0 !important; color: #0f0 !important; box-shadow: 0 0 20px rgba(0,255,0,0.3); }
        .ai-btn.selected-wrong { background: rgba(255,0,0,0.2) !important; border-color: #f00 !important; color: #f00 !important; }
      `}</style>
      
      {/* --- CANVAS 3D --- */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 30, 80], fov: 45 }}>
            <PhysicsEngine langUI={LEXICON[safeLang]} />
            <CinematicCamera />
            <SceneEntities missionId={missionId} />
            <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} />
            <ambientLight intensity={1.0} />
            <directionalLight position={[10, 30, 20]} intensity={2} color="#00f2ff" />
            <Stars count={3000} factor={4} fade />
            <EffectComposer disableNormalPass><Bloom luminanceThreshold={0.3} intensity={1.5} /><Vignette darkness={0.7} /></EffectComposer>
          </Canvas>
        </Suspense>
      </div>

      {/* --- THEORY CLASS MODAL --- */}
      {gameState === 'THEORY' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ maxWidth: '700px', width: '100%', padding: '50px', border: '1px solid #00f2ff', borderRadius: '24px', background: 'radial-gradient(circle at top, #0f172a, #020617)', textAlign: 'center', boxShadow: '0 20px 80px rgba(0,242,255,0.2)' }}>
            <div style={{ color: '#00f2ff', fontSize: '14px', fontWeight: '900', letterSpacing: '3px', marginBottom: '20px' }}><i className="fas fa-satellite-dish me-2"></i>{THEORY.t}</div>
            <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '25px', letterSpacing: '2px' }}>{THEORY[`m${missionId}_title`]}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.9', fontSize: '1.2rem', marginBottom: '40px', whiteSpace: 'pre-line' }}>{THEORY[`m${missionId}_p`]}</p>
            <button onClick={() => { sfx.click(); store.resumeGame(); }} style={{ width: '100%', padding: '22px', background: '#00f2ff', color: '#000', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '1.3rem', letterSpacing: '1px' }}>
              {THEORY.btn_start} <i className="fas fa-rocket ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* --- HUD DE JUEGO --- */}
      {(gameState === 'PLAYING' || gameState === 'AI_PAUSE') && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', padding: 'clamp(15px, 2vw, 30px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 10 }}>
          
          {/* TOP HUD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div className="hud-panel" style={{ display: 'flex', gap: '20px', borderLeft: '4px solid #00f2ff', borderRadius: '12px', padding: '15px' }}>
                 <div><div style={{ fontSize: '10px', color: '#00f2ff' }}>FASE</div><div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>{missionId}</div></div>
                 <div><div style={{ fontSize: '10px', color: '#00f2ff' }}>TIEMPO TRANSCURRIDO</div><div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>{simTime.toFixed(2)}s</div></div>
                 <div><div style={{ fontSize: '10px', color: '#00f2ff' }}>ALTITUD ACTUAL</div><div style={{ fontSize: '18px', color: '#fff', fontWeight: 'bold' }}>{objA.y.toFixed(1)}m</div></div>
              </div>
              <div style={{ pointerEvents: 'auto', display: 'flex', gap: '15px' }}>
                  <button onClick={() => usePhysicsStore.setState({ gameState: 'THEORY' })} style={{ background: 'rgba(0,242,255,0.1)', border: '2px solid #00f2ff', color: '#00f2ff', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' }}>{UI.theoryBtn}</button>
                  <button onClick={resetApp} style={{ background: 'rgba(255,0,85,0.1)', border: '2px solid #ff0055', color: '#ff0055', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' }}><i className="fas fa-sign-out-alt"></i></button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', maxWidth: '800px' }}>
              <TelemetryGraph label={UI.altitude} data={history} color="#8b5cf6" maxVal={startHeight} type="y" />
              <TelemetryGraph label={UI.vel} data={history} color="#00ff88" maxVal={50} type="v" isVelocity={true} />
            </div>

            <div style={{ margin: '15px 0', background: 'rgba(15, 23, 42, 0.95)', borderLeft: '5px solid #ffea00', padding: '15px', borderRadius: '12px', maxWidth: '600px' }}>
              <div style={{ color: '#ffea00', fontSize: '11px', fontWeight: '900', marginBottom: '5px' }}><i className="fas fa-robot me-2"></i>TUTOR IA</div>
              <div style={{ color: '#fff', fontSize: '13px' }}>{tutorMsg}</div>
            </div>
          </div>

          {/* CONTROLES INFERIORES */}
          <div style={{ pointerEvents: 'auto', background: 'rgba(2,6,23,0.95)', padding: '25px', borderRadius: '20px', border: '1px solid #333', maxWidth: '650px', margin: '0 auto', width: '100%', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            
            {missionId === 1 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff0055', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}><span>{UI.predictedTime}</span><span>{inputs.pTime} s</span></div>
                      <input type="range" name="pTime" min="2" max="8" step="0.05" value={inputs.pTime} onChange={handleSlider} style={{ width: '100%', accentColor: '#ff0055' }} />
                  </div>
                  <button onClick={handleDrop} disabled={simTime > 0} style={{ width: '100%', padding: '25px', background: simTime > 0 ? '#333' : 'linear-gradient(180deg, #ff005540, #990033)', border: '2px solid #ff0055', color: '#fff', fontSize: '1.2rem', fontWeight: '900', borderRadius: '16px', cursor: simTime > 0 ? 'not-allowed' : 'pointer' }}>
                      <i className="fas fa-arrow-down me-2"></i> {UI.ignite}
                  </button>
               </div>
            )}

            {missionId === 2 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00f2ff', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}><span>{UI.targetGravity}</span><span>{inputs.gravity} m/s²</span></div>
                    <input type="range" name="gravity" min="1.0" max="25.0" step="0.1" value={inputs.gravity} onChange={handleSlider} className="sci-slider" style={{ borderColor: '#00f2ff' }} />
                  </div>
                  <button onClick={handleDrop} disabled={simTime > 0} style={{ width: '100%', padding: '25px', background: simTime > 0 ? '#333' : 'linear-gradient(45deg, #0055ff, #00f2ff)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.2rem', cursor: simTime > 0 ? 'not-allowed' : 'pointer' }}>
                      <i className="fas fa-arrow-down me-2"></i> {UI.ignite}
                  </button>
               </div>
            )}

            {missionId === 3 && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffaa00', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}><span>{UI.massA}</span><span>{inputs.massA} kg</span></div>
                    <input type="range" name="massA" min="1" max="10000" step="100" value={inputs.massA} onChange={handleSlider} className="sci-slider" />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0055ff', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}><span>{UI.massB}</span><span>{inputs.massB} kg</span></div>
                    <input type="range" name="massB" min="1" max="10000" step="100" value={inputs.massB} onChange={handleSlider} className="sci-slider" />
                  </div>
                  <button onClick={handleDrop} disabled={simTime > 0} style={{ padding: '25px', background: simTime > 0 ? '#333' : 'linear-gradient(45deg, #0055ff, #00f2ff)', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.2rem', cursor: simTime > 0 ? 'not-allowed' : 'pointer' }}>
                      <i className="fas fa-arrow-down me-2"></i> {UI.ignite}
                  </button>
               </div>
            )}

            <button onClick={store.triggerAI} style={{ width: '100%', padding: '15px', marginTop: '15px', background: 'rgba(255,234,0,0.1)', border: '2px solid #ffea00', color: '#ffea00', borderRadius: '12px', cursor: 'pointer', fontWeight: '900' }}>
                {UI.explain}
            </button>
          </div>
        </div>
      )}

      {/* --- AI ANALYSIS MODAL --- */}
      {gameState === 'AI_PAUSE' && <AnalysisModal />}

      {/* --- MICRO-CLASE (AL FALLAR) --- */}
      {gameState === 'MICRO_CLASS' && microClassData && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ padding: '50px', border: `3px solid #ff0055`, borderRadius: '28px', background: '#0f172a', maxWidth: '650px', width: '100%', boxShadow: `0 0 100px rgba(255,0,85,0.3)` }}>
            <div style={{ color: '#ffea00', fontSize: '16px', fontWeight: '900', letterSpacing: '2px', marginBottom: '25px', textAlign: 'center' }}><i className="fas fa-chalkboard-teacher me-2"></i> ANÁLISIS FORENSE</div>
            <h2 style={{ color: '#ff0055', fontSize: '2.2rem', margin: '0 0 25px 0', textAlign: 'center' }}>{microClassData.h}</h2>
            <div style={{ background: 'rgba(255,0,85,0.1)', padding: '25px', borderRadius: '16px', borderLeft: '6px solid #ff0055', marginBottom: '35px' }}>
                <p style={{ fontSize: '1.3rem', margin: 0, color: '#fff', lineHeight: '1.7' }}>{microClassData.p}</p>
            </div>
            <button onClick={resetSim} style={{ width: '100%', padding: '25px', background: '#ff0055', color: '#fff', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '1.3rem' }}>
                {UI.retry} <i className="fas fa-redo ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* --- VICTORIA --- */}
      {gameState === 'SUCCESS' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ padding: '60px', border: `3px solid #00ff88`, borderRadius: '28px', textAlign: 'center', background: '#0f172a', maxWidth: '600px', width: '100%', boxShadow: `0 0 100px #00ff8840` }}>
            <i className="fas fa-check-circle fa-6x" style={{ color: '#00ff88', marginBottom: '30px' }}></i>
            <h2 style={{ color: '#00ff88', fontSize: '2.5rem', margin: '0 0 30px 0', letterSpacing: '2px' }}>{UI.success}</h2>
            <button onClick={nextLevel} style={{ width: '100%', padding: '25px', background: `#00ff88`, color: '#000', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '1.3rem', textTransform: 'uppercase' }}>
                {missionId < 3 ? UI.nextMission : "REINICIAR ENTRENAMIENTO"} <i className="fas fa-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      )}

      {/* --- MENÚS SUPERIORES --- */}
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
        <button className="sci-btn" onClick={(e) => { e.stopPropagation(); sfx.click(); setShowDatabank(true); }}>{UI.theoryBtn}</button>
        <button className="sci-btn" onClick={(e) => { e.stopPropagation(); sfx.click(); setShowHistory(true); }}>{UI.aiLogBtn}</button>
        <button className="sci-btn" onClick={requestAILesson}>{UI.aiClass}</button>
      </div>

      {/* DATABANK MODAL */}
      {showDatabank && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,10,20,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(15px)' }}>
          <div className="hud-panel" style={{ borderLeft: '3px solid #ffaa00', maxWidth: '800px', width: '100%' }}>
            <h2 style={{ color: '#ffaa00', borderBottom: '1px solid #ffaa00', paddingBottom: '10px', marginTop: 0 }}>📖 CONCEPTOS FÍSICOS</h2>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {GLOBAL_DATABANK[safeLang].map((data, i) => (
                <div key={i} style={{ marginBottom: '30px' }}>
                  <h3 style={{ color: '#00f2ff' }}>{data.concept}</h3>
                  <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.6' }}>{data.description}</p>
                  <div style={{ background: 'rgba(255, 170, 0, 0.1)', padding: '15px', borderRadius: '5px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1.2rem', color: '#ffaa00' }}>{data.equation}</div>
                </div>
              ))}
            </div>
            <button className="sci-btn" style={{ width: '100%', marginTop: '20px', borderColor: '#ffaa00', color: '#ffaa00' }} onClick={(e) => { TTS.stop(); sfx.click(); setShowDatabank(false); }}>{UI.close}</button>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {showHistory && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'rgba(0,10,30,0.98)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(15px)' }} onClick={(e) => e.stopPropagation()}>
          <div className="hud-panel" style={{ borderColor: '#00f2ff', maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#00f2ff', textAlign: 'center', fontSize: 'clamp(24px, 5vw, 30px)', borderBottom: '2px solid #00f2ff', paddingBottom: '10px', marginTop: 0 }}>📚 {UI.aiLogBtn}</h2>
            {historyLog.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', fontSize: '18px', padding: '40px 0' }}>{UI.emptyMem}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {historyLog.map((h) => (
                  <div key={h.id} style={{ background: 'rgba(0,242,255,0.05)', border: '1px solid #00f2ff', padding: '15px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>{h.classData?.title || h.topic}</div>
                      <div style={{ color: '#00f2ff', fontSize: '12px', marginTop: '5px' }}>🕒 {h.date}</div>
                    </div>
                    <button className="sci-btn" style={{ margin: 0, width: '100%', maxWidth: '150px' }} onClick={() => downloadPDF(h.classData, safeLang)}>📄 PDF</button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button className="sci-btn" style={{ flex: 1, borderColor: '#fff', color: '#fff' }} onClick={(e) => { sfx.click(); setShowHistory(false); }}>{UI.close}</button>
              {historyLog.length > 0 && (
                <button className="sci-btn" style={{ flex: 1, borderColor: '#f00', color: '#f00' }} onClick={() => { sfx.error(); setHistoryLog([]); window.localStorage.removeItem('icfes_physics_freefall'); }}>🗑️ {UI.purgeData}</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI LESSON MODAL */}
      {showAILesson && aiLesson && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(0,0,20,0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(15px)' }} onClick={e => e.stopPropagation()}>
          <div className="hud-panel" style={{ borderColor: '#00f2ff', maxWidth: '800px', width: '100%', boxShadow: '0 0 100px rgba(0,242,255,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #00f2ff', paddingBottom: '20px' }}><h1 style={{ color: '#00f2ff', margin: 0, fontSize: 'clamp(24px, 5vw, 36px)', textTransform: 'uppercase' }}>{aiLesson.title}</h1></div>
            <div style={{ marginTop: '30px' }}>
              <div style={{ background: 'rgba(0,242,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}><MarkdownParser text={aiLesson.concept} /></div>
              {aiLesson.equations && aiLesson.equations.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                  <strong style={{ color: '#ffaa00', fontSize: '16px' }}>KEY EQUATIONS:</strong>
                  <div style={{ background: 'rgba(0,10,20,0.5)', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                    {aiLesson.equations.map((eq, i) => (
                      <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '18px' }}>{eq.equation}</div>
                        <div style={{ color: '#aaa', fontSize: '14px' }}>{eq.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {aiLesson.example && (
                <div style={{ marginTop: '25px', background: 'rgba(0,10,20,0.5)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ffaa00' }}>
                  <strong style={{ color: '#ffaa00', fontSize: '16px' }}>PRACTICAL EXAMPLE:</strong>
                  <div style={{ color: '#fff', margin: '10px 0' }}>
                    <div style={{ marginBottom: '5px' }}><strong>Situation:</strong> {aiLesson.example.situation}</div>
                    <div style={{ marginBottom: '5px' }}><strong>Calculation:</strong></div>
                    <div style={{ color: '#0f0', fontFamily: 'monospace', paddingLeft: '20px' }}>{aiLesson.example.calculation}</div>
                    <div style={{ marginTop: '5px' }}><strong>Result:</strong> {aiLesson.example.result}</div>
                  </div>
                </div>
              )}
              {aiLesson.visualization && (
                <div style={{ marginTop: '25px', background: 'rgba(0,10,20,0.5)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #00f2ff' }}>
                  <strong style={{ color: '#00f2ff', fontSize: '16px' }}>VISUALIZATION:</strong>
                  <p style={{ color: '#fff', margin: '10px 0' }}>{aiLesson.visualization}</p>
                </div>
              )}
              {aiLesson.misconceptions && aiLesson.misconceptions.length > 0 && (
                <div style={{ marginTop: '25px', background: 'rgba(0,10,20,0.5)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #f00' }}>
                  <strong style={{ color: '#f00', fontSize: '16px' }}>COMMON MISCONCEPTIONS:</strong>
                  <ul style={{ color: '#fff', margin: '10px 0 0 20px', padding: 0 }}>
                    {aiLesson.misconceptions.map((mis, i) => (
                      <li key={i} style={{ marginBottom: '5px' }}>{mis}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiLesson.applications && (
                <div style={{ marginTop: '25px', background: 'rgba(0,10,20,0.5)', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #0f0' }}>
                  <strong style={{ color: '#0f0', fontSize: '16px' }}>REAL-WORLD APPLICATIONS:</strong>
                  <p style={{ color: '#fff', margin: '10px 0' }}>{aiLesson.applications}</p>
                </div>
              )}
            </div>
            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
              <button className="action-btn" style={{ width: '100%', background: '#00f2ff', color: '#000' }} onClick={() => setShowAILesson(false)}>CLOSE LESSON</button>
            </div>
          </div>
        </div>
      )}

      {/* AI DILEMMA MODAL */}
      {showAiModal && preloadedDilemma && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 999, background: 'rgba(40,0,0,0.98)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backdropFilter: 'blur(20px)' }} onClick={e => e.stopPropagation()}>
          <div className="hud-panel" style={{ borderColor: '#f00', borderLeft: '4px solid #f00', maxWidth: '900px', width: '100%', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 0 100px rgba(255,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #f00', paddingBottom: '20px' }}>
              <h1 className="hud-pulse" style={{ color: '#f00', margin: 0, fontSize: 'clamp(30px, 5vw, 50px)', textTransform: 'uppercase' }}>{UI.aiTitle}</h1>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '10px 0 0 0' }}>{UI.aiLocked}</p>
            </div>
            <div style={{ marginTop: '30px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}><MarkdownParser text={preloadedDilemma.theory} /></div>
              <div style={{ marginTop: '30px' }}>
                <strong style={{ color: '#00f2ff', fontSize: '18px' }}>{UI.aiTest}</strong>
                <p style={{ color: '#fff', fontSize: '18px', margin: '15px 0' }}>{preloadedDilemma.demoQuestion.text}</p>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {preloadedDilemma.demoQuestion.options.map((opt, i) => (
                    <button key={i} className={`ai-btn ${selectedAiOption === i ? (i === preloadedDilemma.demoQuestion.correctIdx ? 'selected-correct' : 'selected-wrong') : ''}`} onClick={() => handleAiAnswer(i)} disabled={aiSolved}>
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  ))}
                </div>
                {selectedAiOption !== null && (
                  <div style={{ marginTop: '25px', background: aiSolved ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', color: aiSolved ? '#0f0' : '#f00', padding: '20px', borderLeft: `4px solid ${aiSolved ? '#0f0' : '#f00'}`, borderRadius: '5px' }}>
                    <strong style={{ fontSize: '18px' }}>{aiSolved ? UI.aiRestored : UI.aiError}</strong><br /><br />
                    <MarkdownParser text={preloadedDilemma.demoQuestion.analysis} />
                    {!aiSolved && preloadedDilemma.demoQuestion.explanations && (
                      <>
                        <br />
                        <strong>Explanation:</strong>
                        <p>{preloadedDilemma.demoQuestion.explanations[selectedAiOption]}</p>
                      </>
                    )}
                  </div>
                )}
              </div>
              {preloadedDilemma.hint && (
                <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 100, 200, 0.2)', borderRadius: '5px', fontStyle: 'italic' }}>
                  <strong>Hint:</strong> {preloadedDilemma.hint}
                </div>
              )}
              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <button className="action-btn" style={{ width: '100%', background: aiSolved ? '#0f0' : '#555', color: aiSolved ? '#000' : '#888', pointerEvents: aiSolved ? 'auto' : 'none', boxShadow: aiSolved ? '0 0 30px #0f0' : 'none' }} onClick={(e) => { e.stopPropagation(); setShowAiModal(false); resetSim(e); }}>
                  {aiSolved ? UI.aiContinue : UI.aiWait}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PhysicsLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}