import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Trail, Grid, Line, Html, Sparkles, Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🌌 CORE CONFIG: THE NEURAL LINK
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON & PEDAGOGY
============================================================ */
const LEXICON = {
  es: {
    ui: {
      title: "QUANTUM KINEMATICS", target: "ANOMALÍA", telemetry: "TELEMETRÍA EN VIVO",
      control: "SISTEMA DE IGNICIÓN", lockOn: "ESCANEAR Y FIJAR", ignite: "LANZAR SONDA",
      retry: "RECALCULAR", next: "SIGUIENTE FASE", close: "CERRAR",
      theoryBtn: "TEORÍA", aiLogBtn: "IA LOG", success: "IMPACTO CONFIRMADO",
      successDesc: "El cálculo vectorial fue perfecto. La anomalía ha sido destruida.",
      nearMiss: "DESVIACIÓN TÁCTICA", nearMissDesc: "Rozaste el objetivo. Ajusta tus decimales en la ecuación.",
      fail: "COLISIÓN EN EL VACÍO", failDesc: "Los vectores no mienten. Has perdido la sonda.",
      aiTitle: "BLOQUEO COGNITIVO", aiLocked: "SISTEMA BLOQUEADO. RESPONDE PARA REINICIAR:",
      aiTest: "EVALUACIÓN SOCRÁTICA:", aiRestored: "SISTEMA RESTAURADO:", aiError: "CÁLCULO ERRÓNEO:",
      aiContinue: "INICIAR REINICIO", aiWait: "ESPERANDO RESPUESTA...", pdfBtn: "EXPORTAR PDF",
      dist: "Distancia: ", aiClass: "IA CLASE", emptyMem: "No hay registros de IA disponibles.",
      debugPanel: "PANEL DE DEBUG", missionData: "DATOS DE MISIÓN", physicsState: "ESTADO FÍSICO",
      velocity: "VELOCIDAD", acceleration: "ACELERACIÓN", position: "POSICIÓN", time: "TIEMPO"
    },
    voice: {
      init: "Motor físico en línea. Esperando directivas.", success: "Anomalía destruida. Excelente trabajo.",
      fail: "Fallo crítico en la trayectoria.", anomaly: "Bloqueo de seguridad activado. Responda la pregunta para continuar."
    }
  },
  en: {
    ui: {
      title: "QUANTUM KINEMATICS", target: "ANOMALY", telemetry: "LIVE TELEMETRY",
      control: "IGNITION SYSTEM", lockOn: "SCAN & LOCK", ignite: "LAUNCH PROBE",
      retry: "RECALCULATE", next: "NEXT PHASE", close: "CLOSE",
      theoryBtn: "THEORY", aiLogBtn: "AI LOG", success: "IMPACT CONFIRMED",
      successDesc: "Vector calculation was perfect. The anomaly has been destroyed.",
      nearMiss: "TACTICAL DEVIATION", nearMissDesc: "You grazed the target. Adjust your decimals in the equation.",
      fail: "VOID COLLISION", failDesc: "Vectors don't lie. Probe lost.",
      aiTitle: "COGNITIVE LOCK", aiLocked: "SYSTEM LOCKED. ANSWER TO REBOOT:",
      aiTest: "SOCRATIC EVALUATION:", aiRestored: "SYSTEM RESTORED:", aiError: "ERRONEOUS CALCULATION:",
      aiContinue: "INITIATE REBOOT", aiWait: "WAITING FOR ANSWER...", pdfBtn: "EXPORT PDF",
      dist: "Distance: ", aiClass: "AI CLASS", emptyMem: "No AI logs available.",
      debugPanel: "DEBUG PANEL", missionData: "MISSION DATA", physicsState: "PHYSICS STATE",
      velocity: "VELOCITY", acceleration: "ACCELERATION", position: "POSITION", time: "TIME"
    },
    voice: {
      init: "Physics engine online. Awaiting directives.", success: "Anomaly destroyed. Excellent work.",
      fail: "Critical trajectory failure.", anomaly: "Security lock activated. Answer the question to proceed."
    }
  }
};

/* ============================================================
   📚 ADVANCED PHYSICS CONCEPTS DATABASE
============================================================ */
const GLOBAL_DATABANK = {
  es: [
    {
      concept: "VECTORES 3D",
      description: "La física clásica ocurre en 3 dimensiones espaciales (X, Y, Z). Un vector dicta magnitud (cuánto) y dirección (hacia dónde).",
      equation: "r⃗ = xî + yĵ + zk̂",
      example: "Una nave en [5, 3, 2] tiene una posición de 5m en X, 3m en Y y 2m en Z."
    },
    {
      concept: "MRU (VELOCIDAD CONSTANTE)",
      description: "Sin motores activos (aceleración = 0), la nave se desliza infinitamente. Ecuación: Velocidad = Distancia / Tiempo.",
      equation: "v = d/t",
      example: "Si una nave viaja 100m en 10s, su velocidad es 10 m/s."
    },
    {
      concept: "MRUA (ACELERACIÓN)",
      description: "Al encender motores, la velocidad aumenta cada segundo. La posición dibuja una curva parabólica en el tiempo: d = (1/2) * a * t².",
      equation: "d = 1/2 * a * t²",
      example: "Con aceleración de 2 m/s², en 5s la nave recorre 25m."
    },
    {
      concept: "CAÍDA LIBRE",
      description: "En el vacío, todos los objetos caen con la misma aceleración (g = -9.8 m/s²), sin importar su masa. Es una constante universal.",
      equation: "y = 1/2 * g * t²",
      example: "Desde 10m de altura, un objeto tarda 1.43s en caer."
    },
    {
      concept: "TIRO PARABÓLICO",
      description: "Principio de Independencia de Movimientos. La velocidad horizontal (MRU) no afecta a la caída vertical (Gravedad). Así orbitan los planetas.",
      equation: "x = v₀x * t, y = v₀y * t - 1/2 * g * t²",
      example: "Un proyectil lanzado a 30° con 20 m/s tiene componentes v₀x=17.3 m/s y v₀y=10 m/s."
    },
    {
      concept: "CINEMÁTICA 3D ABSOLUTA",
      description: "Combinar propulsión en X, altitud en Y y profundidad en Z mientras luchas contra la gravedad requiere integrar todos los vectores en un sistema unificado.",
      equation: "r⃗(t) = r⃗₀ + v⃗₀t + 1/2 * a⃗t²",
      example: "Una nave con v₀=[5, 0, 3] y a=[0, -9.8, 0] sigue una trayectoria parabólica 3D."
    }
  ],
  en: [
    {
      concept: "3D VECTORS",
      description: "Classical physics occurs in 3 spatial dimensions (X, Y, Z). A vector dictates magnitude (how much) and direction (where to).",
      equation: "r⃗ = xî + yĵ + zk̂",
      example: "A ship at [5, 3, 2] has a position of 5m in X, 3m in Y and 2m in Z."
    },
    {
      concept: "CONSTANT VELOCITY (MRU)",
      description: "Without active engines (acceleration = 0), the ship slides infinitely. Equation: Velocity = Distance / Time.",
      equation: "v = d/t",
      example: "If a ship travels 100m in 10s, its speed is 10 m/s."
    },
    {
      concept: "CONSTANT ACCELERATION (MRUA)",
      description: "When engines are on, speed increases every second. The position draws a parabolic curve over time: d = (1/2) * a * t².",
      equation: "d = 1/2 * a * t²",
      example: "With acceleration of 2 m/s², in 5s the ship travels 25m."
    },
    {
      concept: "FREE FALL",
      description: "In a vacuum, all objects fall with the same acceleration (g = -9.8 m/s²), regardless of mass. It's a universal constant.",
      equation: "y = 1/2 * g * t²",
      example: "From 10m height, an object takes 1.43s to fall."
    },
    {
      concept: "PARABOLIC THROW",
      description: "Principle of Independence of Movements. Horizontal velocity (MRU) doesn't affect vertical fall (Gravity). This is how planets orbit.",
      equation: "x = v₀x * t, y = v₀y * t - 1/2 * g * t²",
      example: "A projectile launched at 30° with 20 m/s has components v₀x=17.3 m/s and v₀y=10 m/s."
    },
    {
      concept: "ABSOLUTE 3D KINEMATICS",
      description: "Combining propulsion in X, altitude in Y and depth in Z while fighting gravity requires integrating all vectors in a unified system.",
      equation: "r⃗(t) = r⃗₀ + v⃗₀t + 1/2 * a⃗t²",
      example: "A ship with v₀=[5, 0, 3] and a=[0, -9.8, 0] follows a 3D parabolic trajectory."
    }
  ]
};

/* ============================================================
   🎙️ 1. MOTOR DE VOZ IA (TTS ENGINE)
   Implementación Singleton para prevenir superposición de audio.
============================================================ */
class VoiceEngine {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.langs = { es: 'es-ES', en: 'en-US' };
    this.voiceCache = {};
  }

  speak(text, langCode = 'es') {
    if (!this.synth) return;

    // Cache voices for better performance
    if (!this.voiceCache[langCode]) {
      const voices = this.synth.getVoices();
      this.voiceCache[langCode] = voices.find(voice => voice.lang === this.langs[langCode]) || null;
    }

    this.synth.cancel();
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = this.langs[langCode] || 'es-ES';
    utterThis.rate = 1.05;
    utterThis.pitch = 0.8;

    // Use cached voice if available
    if (this.voiceCache[langCode]) {
      utterThis.voice = this.voiceCache[langCode];
    }

    this.synth.speak(utterThis);
  }

  stop() {
    if (this.synth) this.synth.cancel();
  }
}
const TTS = new VoiceEngine();

/* ============================================================
   🛡️ 2. KERNEL SHIELD (ERROR BOUNDARY)
   Atrapa fallos de renderizado de WebGL para evitar pantalla en blanco.
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "", errorStack: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMsg: error.toString() };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quantum Core Panic:", error, errorInfo);
    this.setState({ errorStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#000',
          color: '#f00',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          fontFamily: 'monospace',
          padding: '20px',
          boxSizing: 'border-box'
        }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textShadow: '0 0 20px #f00' }}>⚠️ FATAL EXCEPTION</h1>
          <p style={{
            background: 'rgba(255,0,0,0.1)',
            padding: '20px',
            border: '1px solid #f00',
            borderRadius: '8px',
            maxWidth: '80%',
            overflow: 'auto'
          }}>{this.state.errorMsg}</p>
          {this.state.errorStack && (
            <details style={{ color: '#ffaa00', marginTop: '20px', maxWidth: '80%' }}>
              <summary>Technical Details</summary>
              <pre style={{
                background: 'rgba(0,0,0,0.5)',
                padding: '15px',
                borderRadius: '5px',
                overflowX: 'auto'
              }}>{this.state.errorStack}</pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '15px 30px',
              marginTop: '20px',
              cursor: 'pointer',
              background: '#f00',
              color: '#000',
              border: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            SYSTEM REBOOT
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🔊 3. SINTETIZADOR MATEMÁTICO DOPPLER (WEB AUDIO API)
============================================================ */
class QuantumAudio {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.engineOsc = null;
    this.engineGain = null;
    this.effects = {
      click: { type: 'sine', fStart: 1200, fEnd: 800, dur: 0.05, vol: 0.1 },
      slide: { type: 'sine', fStart: 400, fEnd: 600, dur: 0.05, vol: 0.02 },
      success: { type: 'square', fStart: 400, fEnd: 1600, dur: 0.6, vol: 0.2 },
      error: { type: 'sawtooth', fStart: 150, fEnd: 40, dur: 0.8, vol: 0.25 },
      nearMiss: { type: 'sine', fStart: 300, fEnd: 100, dur: 0.4, vol: 0.2 },
      lockOn: { type: 'square', fStart: 800, fEnd: 1200, dur: 0.3, vol: 0.1 },
      engine: { type: 'sawtooth', baseFreq: 40, maxFreq: 1000 }
    };
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.2;
        this.gain.connect(this.ctx.destination);

        // Create analyzers for visualization
        this.analyzer = this.ctx.createAnalyser();
        this.analyzer.fftSize = 256;
        this.gain.connect(this.analyzer);
      } catch (e) {
        console.error("Audio context creation failed:", e);
      }
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  _play(type, fStart, fEnd, dur, vol = 0.1) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g);
      g.connect(this.gain);

      osc.type = type;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) {
      console.error("Audio playback failed:", e);
    }
  }

  playEffect(name) {
    const effect = this.effects[name];
    if (effect) {
      this._play(effect.type, effect.fStart, effect.fEnd, effect.dur, effect.vol);
    }
  }

  click() { this.playEffect('click'); }
  slide() { this.playEffect('slide'); }
  success() { this.playEffect('success'); }
  error() { this.playEffect('error'); }
  nearMiss() { this.playEffect('nearMiss'); }
  lockOn() { this.playEffect('lockOn'); }

  startEngine() {
    if (!this.ctx) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      this.engineOsc.type = this.effects.engine.type;
      this.engineOsc.frequency.value = this.effects.engine.baseFreq;
      this.engineGain.gain.value = 0;

      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.gain);

      this.engineOsc.start();
      this.engineGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
    } catch(e) {
      console.error("Engine audio failed:", e);
    }
  }

  updateEngine(velocityVector) {
    if(this.engineOsc && this.ctx) {
      // Calculate magnitude: ||V|| = sqrt(x^2 + y^2 + z^2)
      const mag = Math.sqrt(velocityVector[0]**2 + velocityVector[1]**2 + velocityVector[2]**2);
      const targetFreq = Math.min(
        this.effects.engine.baseFreq + (mag * 8),
        this.effects.engine.maxFreq
      );
      this.engineOsc.frequency.linearRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.1);
    }
  }

  stopEngine() {
    if(this.engineGain && this.ctx) {
      this.engineGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if(this.engineOsc) {
          this.engineOsc.stop();
          this.engineOsc.disconnect();
          this.engineOsc = null;
        }
      }, 400);
    }
  }

  getFrequencyData() {
    if (!this.analyzer) return null;
    const bufferLength = this.analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyzer.getByteFrequencyData(dataArray);
    return dataArray;
  }
}
const sfx = new QuantumAudio();

/* ============================================================
   📊 MISSION TELEMETRY AND DEBUGGING SYSTEM
============================================================ */
class MissionTelemetry {
  constructor() {
    this.missionHistory = [];
    this.currentMission = null;
    this.physicsState = [];
    this.maxHistory = 100;
  }

  startMission(mission) {
    this.currentMission = {
      ...mission,
      startTime: Date.now(),
      inputs: {...mission.inputs},
      completed: false,
      success: false,
      distance: 0
    };
    this.physicsState = [];
  }

  updatePhysics(state) {
    if (this.currentMission) {
      const timestamp = Date.now() - this.currentMission.startTime;
      this.physicsState.push({
        time: timestamp / 1000, // in seconds
        position: [...state.p],
        velocity: [...state.v],
        acceleration: [...state.a]
      });

      // Limit history size
      if (this.physicsState.length > this.maxHistory) {
        this.physicsState.shift();
      }
    }
  }

  endMission(success, distance) {
    if (this.currentMission) {
      this.currentMission.completed = true;
      this.currentMission.success = success;
      this.currentMission.distance = distance;
      this.currentMission.endTime = Date.now();
      this.currentMission.duration = (this.currentMission.endTime - this.currentMission.startTime) / 1000;

      // Store in history
      this.missionHistory.unshift(this.currentMission);
      if (this.missionHistory.length > 10) {
        this.missionHistory.pop();
      }

      this.currentMission = null;
    }
  }

  getMissionData() {
    return this.currentMission;
  }

  getPhysicsHistory() {
    return this.physicsState;
  }

  getMissionHistory() {
    return this.missionHistory;
  }

  clear() {
    this.missionHistory = [];
    this.currentMission = null;
    this.physicsState = [];
  }
}
const missionTelemetry = new MissionTelemetry();

/* ============================================================
   📚 PROCEDURAL MISSION GENERATOR (DOMAIN DRIVEN DESIGN)
   Asegura que siempre existan propiedades requeridas, previniendo undefined.
============================================================ */
const generateKinematicMission = (level, langCode) => {
  // Mission configuration constants
  const MISSION_CONFIG = {
    baseTime: 4, // Base time in seconds
    timeVariation: 3, // Random variation in seconds
    positionRange: { x: { min: 10, max: 30 }, y: { min: 5, max: 20 }, z: { min: -10, max: 10 } },
    velocityRange: { min: -10, max: 20 },
    accelerationRange: { min: -5, max: 15 },
    gravity: -9.8,
    simplifiedGravity: -10
  };

  let tPos = [0, 0, 0];
  let limitTime = Math.floor(Math.random() * MISSION_CONFIG.timeVariation) + MISSION_CONFIG.baseTime;
  let baseEquation = "";
  let desc = "";
  let logic = "";
  let topic = "";
  let inputsRequired = [];
  let initCond = { p: [0, 0, 0], v: [0, 0, 0], a: [0, 0, 0] };
  let tolerance = 2.5;
  const isEn = langCode === 'en';

  // Common functions for mission generation
  const generatePosition = () => [
    Math.floor(Math.random() * (MISSION_CONFIG.positionRange.x.max - MISSION_CONFIG.positionRange.x.min + 1)) + MISSION_CONFIG.positionRange.x.min,
    Math.floor(Math.random() * (MISSION_CONFIG.positionRange.y.max - MISSION_CONFIG.positionRange.y.min + 1)) + MISSION_CONFIG.positionRange.y.min,
    Math.floor(Math.random() * (MISSION_CONFIG.positionRange.z.max - MISSION_CONFIG.positionRange.z.min + 1)) + MISSION_CONFIG.positionRange.z.min
  ];

  const generateVelocity = () => Math.floor(Math.random() * (MISSION_CONFIG.velocityRange.max - MISSION_CONFIG.velocityRange.min + 1)) + MISSION_CONFIG.velocityRange.min;

  const generateAcceleration = () => Math.floor(Math.random() * (MISSION_CONFIG.accelerationRange.max - MISSION_CONFIG.accelerationRange.min + 1)) + MISSION_CONFIG.accelerationRange.min;

  // Level-specific mission generation
  switch (level) {
    case 1: // 3D TELEPORT
      tPos = generatePosition();
      logic = "teleport";
      topic = isEn ? "3D VECTORS" : "VECTORES 3D";
      desc = isEn ?
        `Move core to [X=${tPos[0]}, Y=${tPos[1]}, Z=${tPos[2]}].` :
        `Traslada la nave a [X=${tPos[0]}, Y=${tPos[1]}, Z=${tPos[2]}].`;
      inputsRequired = [
        { id: "posX", label: "X (m)", min: -20, max: 40, step: 1, def: 0 },
        { id: "posY", label: "Y (m)", min: 0, max: 30, step: 1, def: 0 },
        { id: "posZ", label: "Z (m)", min: -20, max: 20, step: 1, def: 0 }
      ];
      baseEquation = `\\vec{r} = X\\hat{i} + Y\\hat{j} + Z\\hat{k}`;
      tolerance = 1.0;
      break;

    case 2: // 2D MRU - Improved with better parameter ranges
      {
        const vX = generateVelocity();
        const vZ = generateVelocity() - 2; // Center around 0
        tPos = [vX * limitTime, 0, vZ * limitTime];
        logic = "mru";
        topic = isEn ? "CONSTANT VELOCITY (MRU)" : "VELOCIDAD CONSTANTE (MRU)";
        desc = isEn ?
          `Intercept anomaly at X=${tPos[0]}, Z=${tPos[2]} in ${limitTime}s. Acceleration = 0.` :
          `Destruye la anomalía en X=${tPos[0]}, Z=${tPos[2]} en EXACTAMENTE ${limitTime}s. Aceleración = 0.`;
        inputsRequired = [
          {
            id: "velX", label: isEn ? "Velocity X" : "Velocidad X",
            min: -10, max: 20, step: 0.1, def: vX,
            hint: isEn ? "X velocity component" : "Componente X de velocidad"
          },
          {
            id: "velZ", label: isEn ? "Velocity Z" : "Velocidad Z",
            min: -10, max: 10, step: 0.1, def: vZ,
            hint: isEn ? "Z velocity component" : "Componente Z de velocidad"
          }
        ];
        baseEquation = `v_x = \\frac{${tPos[0]}m}{${limitTime}s}, \\quad v_z = \\frac{${tPos[2]}m}{${limitTime}s}`;
        tolerance = 1.5;
      }
      break;

    case 3: // 1D MRUA - Improved with better parameter ranges
      {
        const aX = generateAcceleration();
        tPos = [0.5 * aX * Math.pow(limitTime, 2), 0, 0];
        logic = "mrua";
        topic = isEn ? "CONSTANT ACCELERATION (MRUA)" : "ACELERACIÓN CONSTANTE (MRUA)";
        desc = isEn ?
          `Impact anomaly at X=${tPos[0]}m from rest in ${limitTime}s. Use main engine.` :
          `Impacta la anomalía a X=${tPos[0]}m partiendo del reposo en ${limitTime}s. Usa el motor principal.`;
        inputsRequired = [{
          id: "accX", label: isEn ? "Acceleration X" : "Aceleración X",
          min: -5, max: 15, step: 0.1, def: aX,
          hint: isEn ? "X acceleration component" : "Componente X de aceleración"
        }];
        baseEquation = `d = \\frac{1}{2}at^2 \\Rightarrow a = \\frac{2(${tPos[0]})}{${limitTime}^2}`;
      }
      break;

    case 4: // FREE FALL - Improved with better height calculation
      {
        const gravity = MISSION_CONFIG.gravity;
        limitTime = Math.floor(Math.random() * 2) + 3;
        const height = Math.abs(0.5 * gravity * Math.pow(limitTime, 2));
        tPos = [0, 0, 0];
        initCond.p = [0, height, 0];
        initCond.a = [0, gravity, 0];
        logic = "freefall";
        topic = isEn ? "FREE FALL" : "CAÍDA LIBRE";
        desc = isEn ?
          `Drone at ${height.toFixed(1)}m. Gravity = ${Math.abs(gravity)} m/s². Calculate seconds to impact.` :
          `Nave a ${height.toFixed(1)}m de altura. Motores apagados. Gravedad = ${Math.abs(gravity)} m/s². Calcula segundos para el impacto (Y=0).`;
        inputsRequired = [{
          id: "time", label: isEn ? "Time (s)" : "Tiempo (s)",
          min: 1, max: 10, step: 0.01, def: Math.sqrt(2 * height / Math.abs(gravity)),
          hint: isEn ? "Time to reach ground" : "Tiempo para alcanzar el suelo"
        }];
        baseEquation = `t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${height.toFixed(1)})}{|${gravity}|}}`;
        tolerance = 0.1;
      }
      break;

    case 5: // PROJECTILE MOTION - Improved with better parameter ranges
      {
        const v0x = Math.floor(Math.random() * 5) + 5;
        const timeFlight = Math.floor(Math.random() * 2) + 4;
        const gravity = MISSION_CONFIG.simplifiedGravity;
        const v0y = Math.abs((gravity * timeFlight) / 2);
        tPos = [v0x * timeFlight, 0, 0];
        initCond.a = [0, gravity, 0];
        logic = "projectile";
        limitTime = timeFlight;
        topic = isEn ? "PROJECTILE MOTION" : "TIRO PARABÓLICO";
        desc = isEn ?
          `Impact target at X=${tPos[0]}m. Gravity = ${gravity}m/s². Flight time: ${limitTime}s. Calculate initial velocity components.` :
          `Impacta el objetivo en X=${tPos[0]}m. Gravedad = ${gravity}m/s². Tiempo de vuelo: ${limitTime}s. Calcula los componentes iniciales de velocidad.`;
        inputsRequired = [
          {
            id: "velX", label: isEn ? "Velocity X" : "Velocidad X",
            min: 0, max: 20, step: 0.1, def: v0x,
            hint: isEn ? "Horizontal velocity component" : "Componente horizontal de velocidad"
          },
          {
            id: "velY", label: isEn ? "Velocity Y" : "Velocidad Y",
            min: 0, max: 30, step: 0.1, def: v0y,
            hint: isEn ? "Initial vertical velocity" : "Velocidad vertical inicial"
          }
        ];
        baseEquation = `v_x = \\frac{${tPos[0]}m}{${limitTime}s}, \\quad v_{0y} = \\frac{|g| \\cdot ${limitTime}s}{2} = \\frac{${Math.abs(gravity)} \\cdot ${limitTime}}{2} m/s`;
      }
      break;

    case 6: // 3D FULL KINEMATICS - Improved with better parameter ranges
      {
        const v0x = Math.floor(Math.random() * 4) + 3;
        const v0z = Math.floor(Math.random() * 4) - 2;
        const timeFlight = Math.floor(Math.random() * 2) + 4;
        const gravity = MISSION_CONFIG.simplifiedGravity;
        const v0y = Math.abs((gravity * timeFlight) / 2);
        tPos = [v0x * timeFlight, 0, v0z * timeFlight];
        initCond.a = [0, gravity, 0];
        logic = "projectile3d";
        limitTime = timeFlight;
        topic = isEn ? "ABSOLUTE 3D KINEMATICS" : "CINEMÁTICA 3D ABSOLUTA";
        desc = isEn ?
          `Hit anomaly at [X=${tPos[0]}, Z=${tPos[2]}]. Gravity = ${gravity}m/s². Flight time = ${limitTime}s. Combine all velocity vectors.` :
          `Destruye la anomalía en [X=${tPos[0]}, Z=${tPos[2]}]. Gravedad = ${gravity}m/s². Tiempo de vuelo = ${limitTime}s. Calcula todos los componentes de velocidad.`;
        inputsRequired = [
          {
            id: "velX", label: "Vel X",
            min: -10, max: 30, step: 0.1, def: v0x,
            hint: isEn ? "X velocity component" : "Componente X de velocidad"
          },
          {
            id: "velY", label: "Vel Y",
            min: 0, max: 40, step: 0.1, def: v0y,
            hint: isEn ? "Y velocity component" : "Componente Y de velocidad"
          },
          {
            id: "velZ", label: "Vel Z",
            min: -15, max: 15, step: 0.1, def: v0z,
            hint: isEn ? "Z velocity component" : "Componente Z de velocidad"
          }
        ];
        baseEquation = `v_x = \\frac{${tPos[0]}m}{${limitTime}s}, \\quad v_y = \\frac{|g| \\cdot ${limitTime}s}{2}, \\quad v_z = \\frac{${tPos[2]}m}{${limitTime}s}`;
      }
      break;

    default:
      // Default to teleport mission if level is invalid
      return generateKinematicMission(1, langCode);
  }

  // Add mission metadata
  return {
    id: level,
    logic,
    topic,
    initial: initCond,
    target: tPos,
    limitTime,
    desc,
    equation: baseEquation,
    inputs: inputsRequired,
    tolerance,
    difficulty: level,
    gravity: mission.logic.includes('projectile') || mission.logic === 'freefall' ?
      MISSION_CONFIG.simplifiedGravity : 0
  };
};

/* ============================================================
   🤖 PURE FUNCTIONS: NEURAL ASYNC FUNCTIONS
============================================================ */
const cleanJSONResponse = (raw) => {
  if (!raw) return null;
  try {
    // Remove markdown code blocks if present
    let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
    // Extract JSON from between curly braces if needed
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON parsing failed:", e);
    return null;
  }
};

/* ============================================================
   🧠 AI LEARNING SYSTEM - ADVANCED PHYSICS TUTOR
============================================================ */
const fetchAILesson = async (topicLogic, lang) => {
  const targetLang = lang === 'en' ? "ENGLISH" : "SPANISH";

  // Enhanced system prompt with more context and requirements
  const sysPrompt = `
    You are an Advanced Physics Tutor from MIT with expertise in kinematics and physics education.
    Generate a comprehensive lesson about the kinematic topic: "${topicLogic}".
    Language required: ${targetLang}.

    The lesson should include:
    1. Clear conceptual explanation (max 150 words)
    2. Mathematical equations with explanations
    3. Practical example with real-world numbers
    4. Visualization description for student understanding
    5. Common misconceptions and how to avoid them
    6. Real-world applications

    Use this JSON format strictly:
    {
      "title": "Lesson: [Topic]",
      "concept": "Clear conceptual explanation (max 150 words)",
      "equations": [
        {"equation": "equation text", "description": "explanation"}
      ],
      "example": {
        "situation": "Real-world scenario",
        "calculation": "Step-by-step calculation",
        "result": "Final result with units"
      },
      "visualization": "Description of visualization for student",
      "misconceptions": ["Common mistake 1", "Common mistake 2"],
      "applications": "Real-world applications (max 50 words)"
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: sysPrompt }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    const parsed = cleanJSONResponse(data.choices[0].message.content);

    // Validate the response structure
    if (parsed && parsed.title && parsed.concept) {
      return parsed;
    }

    // If response is invalid, throw error to use fallback
    throw new Error("Invalid response structure");

  } catch (error) {
    console.error("AI Lesson Error:", error);

    // Enhanced fallback lesson based on topic
    const fallbackLessons = {
      '3D VECTORS': {
        title: "Lesson: 3D Vectors",
        concept: "In classical physics, motion occurs in 3 spatial dimensions (X, Y, Z). A vector has both magnitude (size) and direction. The position vector r⃗ = xî + yĵ + zk̂ describes an object's location in 3D space.",
        equations: [
          { equation: "r⃗ = xî + yĵ + zk̂", description: "Position vector in 3D space" },
          { equation: "|r⃗| = √(x² + y² + z²)", description: "Magnitude of position vector" }
        ],
        example: {
          situation: "A drone at position [3, 4, 0] meters",
          calculation: "Magnitude = √(3² + 4² + 0²) = √(9 + 16) = √25 = 5 meters",
          result: "The drone is 5 meters from origin"
        },
        visualization: "Imagine three perpendicular axes (X, Y, Z) with the vector as an arrow from origin to the point",
        misconceptions: [
          "Vectors are just distances (they also have direction)",
          "3D coordinates are harder than 2D (they follow the same principles)"
        ],
        applications: "Used in GPS navigation, robotics, and computer graphics"
      },
      'CONSTANT VELOCITY (MRU)': {
        title: "Lesson: Constant Velocity (MRU)",
        concept: "When acceleration is zero, velocity remains constant. The object moves at a steady speed in a straight line. The relationship between distance, velocity, and time is linear.",
        equations: [
          { equation: "v = d/t", description: "Velocity equals distance over time" },
          { equation: "d = v * t", description: "Distance equals velocity times time" }
        ],
        example: {
          situation: "A car travels 120 km in 2 hours",
          calculation: "v = 120 km / 2 h = 60 km/h",
          result: "The car's velocity is 60 km/h"
        },
        visualization: "Imagine a straight line on a distance-time graph with constant slope",
        misconceptions: [
          "Constant velocity means zero motion (it means constant speed in a direction)",
          "Velocity and speed are the same (velocity includes direction)"
        ],
        applications: "Cruise control in cars, conveyor belts"
      },
      // Add more fallback lessons as needed...
    };

    return fallbackLessons[topicLogic] || {
      title: `Lesson: ${topicLogic}`,
      concept: "In physics, motion is described using vectors. A vector has magnitude and direction. Position is where an object is, velocity is how position changes, and acceleration is how velocity changes.",
      equations: [
        { equation: "v = d/t", description: "Velocity equation" },
        { equation: "a = Δv/Δt", description: "Acceleration equation" }
      ],
      example: {
        situation: "A ball rolls 10 meters in 2 seconds",
        calculation: "v = 10 m / 2 s = 5 m/s",
        result: "The ball's velocity is 5 m/s"
      },
      visualization: "Imagine an arrow showing direction and length for velocity",
      misconceptions: [
        "Speed and velocity are identical",
        "Acceleration only means speeding up"
      ],
      applications: "Used in sports analytics, transportation systems"
    };
  }
};

const fetchDilemmaFromAI = async (topicLogic, lang) => {
  const targetLang = lang === 'en' ? "ENGLISH" : "SPANISH";

  const sysPrompt = `
    You are an Advanced Physics Tutor from MIT specializing in Socratic teaching methods.
    Generate a deep analytical multiple-choice dilemma about the kinematic topic: "${topicLogic}".
    Language required: ${targetLang}.

    Use this strict JSON format:
    {
      "title": "COGNITIVE ANOMALY",
      "theory": "Masterful explanation of the underlying physics (max 100 words)",
      "demoQuestion": {
        "text": "Tactical physics problem requiring logical inference, not just math...",
        "options": [
          {"text": "Correct Answer", "explanation": "Why this is correct"},
          {"text": "Visual Trap", "explanation": "Why this is wrong"},
          {"text": "Math Trap", "explanation": "Why this is wrong"},
          {"text": "Concept Trap", "explanation": "Why this is wrong"}
        ],
        "correctIdx": 0,
        "analysis": "Deep justification of the correct answer based on Newton's laws or energy conservation (max 150 words)"
      },
      "hint": "Socratic hint to guide thinking (max 50 words)"
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: sysPrompt }],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await res.json();
    const parsed = cleanJSONResponse(data.choices[0].message.content);

    if (parsed && parsed.demoQuestion) {
      // Shuffle options while keeping track of correct index
      const options = [...parsed.demoQuestion.options];
      const correctText = options[parsed.demoQuestion.correctIdx].text;

      // Fisher-Yates shuffle algorithm
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      // Find new correct index
      const newCorrectIdx = options.findIndex(opt => opt.text === correctText);

      return {
        ...parsed,
        demoQuestion: {
          ...parsed.demoQuestion,
          options: options.map(opt => opt.text),
          correctIdx: newCorrectIdx,
          explanations: options.map(opt => opt.explanation)
        }
      };
    }

    throw new Error("Invalid response structure");

  } catch (error) {
    console.error("AI Dilemma Error:", error);

    // Enhanced fallback dilemma
    return {
      title: "OFFLINE SYSTEM: EMERGENCY PROTOCOL",
      theory: "Earth's gravity (g) is a constant acceleration downward (-9.8 m/s²). It only affects the Y-component of velocity. Mass doesn't affect free-fall time in a vacuum.",
      demoQuestion: {
        text: "You fire a cannon horizontally from 10m height and drop a cannonball from the same height at the same time. Which hits the ground first?",
        options: [
          "The dropped ball - it has less initial energy",
          "The fired ball - it has horizontal motion",
          "Both hit at the same time - vertical motion is independent of horizontal",
          "The heavier object - gravity affects mass"
        ],
        correctIdx: 2,
        analysis: "Galileo's Principle of Independence: horizontal motion (cannon) doesn't affect vertical fall time. Both objects fall 10m under identical gravity, so they hit simultaneously.",
        explanations: [
          "Energy isn't relevant here - both have same potential energy",
          "Horizontal motion doesn't affect vertical fall time",
          "Correct! Vertical and horizontal motions are independent",
          "Mass doesn't affect free-fall time in a vacuum"
        ]
      },
      hint: "Consider what happens if you drop the ball while the cannon is firing"
    };
  }
};

const MarkdownParser = ({ text }) => {
  const htmlContent = useMemo(() => {
    if (!text) return { __html: "" };

    let parsed = text
      .replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:15px;">$1</h3>')
      .replace(/## (.*)/g, '<h2 style="color:#ffaa00; margin-top:15px;">$1</h2>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f0;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color:#aaa;">$1</em>')
      .replace(/```([^`]+)```/g, '<pre style="background:#111; padding:10px; border-radius:5px; overflow-x:auto;">$1</pre>')
      .replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');

    return { __html: parsed };
  }, [text]);

  return <div dangerouslySetInnerHTML={htmlContent} style={{
    color: '#fff',
    fontSize: '16px',
    lineHeight: '1.6'
  }} />;
};

// 🔴 GENERADOR DE PDF ACADÉMICO
const downloadPDF = (classData, langCode) => {
  sfx.playEffect('click');
  const date = new Date().toLocaleString();

  // Create a detailed PDF document
  const printWindow = window.open('', '', 'height=900,width=850');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="${langCode}">
      <head>
        <title>Physics Masterclass - Quantum Engine</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #fff;
            color: #111;
            padding: 40px;
            line-height: 1.6;
            max-width: 800px;
            margin: auto;
          }
          .header {
            border-bottom: 4px solid #0055ff;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            color: #000;
            text-transform: uppercase;
            font-size: 28px;
            margin-bottom: 5px;
            letter-spacing: 2px;
          }
          .date {
            color: #666;
            font-size: 12px;
            font-weight: bold;
            background: #eee;
            display: inline-block;
            padding: 5px 10px;
            border-radius: 4px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 900;
            color: #0055ff;
            text-transform: uppercase;
            margin-top: 30px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
          }
          .content-box {
            background: #f8fafc;
            border-left: 4px solid #0055ff;
            padding: 20px;
            margin-bottom: 20px;
            font-size: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          .equation {
            background: #f0f8ff;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #0055ff;
            font-family: monospace;
            font-size: 18px;
            text-align: center;
          }
          .sim-box {
            border: 2px solid #10b981;
            border-radius: 8px;
            padding: 25px;
            margin-top: 30px;
            background: #fafafa;
          }
          .correct-opt {
            border-color: #10b981;
            background: #ecfdf5;
            color: #065f46;
            font-weight: bold;
            padding: 12px;
            border: 2px solid #10b981;
            margin-bottom: 8px;
            border-radius: 6px;
          }
          .option {
            padding: 12px;
            border: 1px solid #cbd5e1;
            margin-bottom: 8px;
            border-radius: 6px;
            background: #fff;
          }
          .math-equation {
            font-family: 'Cambria Math', 'Latin Modern Math', 'Times New Roman', serif;
            font-size: 18px;
            text-align: center;
            margin: 15px 0;
          }
          .diagram {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            font-size: 11px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>QUANTUM PHYSICS: ${classData.title}</h1>
          <div class="date">Generated: ${date}</div>
        </div>

        <div class="section-title">ADVANCED THEORETICAL EXPLANATION</div>
        <div class="content-box">
          ${classData.theory ? classData.theory.replace(/\n/g, '<br/>') : 'No theory provided'}
        </div>

        ${classData.equations ? `
        <div class="section-title">KEY EQUATIONS</div>
        ${classData.equations.map(eq => `
          <div class="equation">
            ${eq.equation}
            <div style="font-size: 14px; color: #555; margin-top: 5px;">${eq.description}</div>
          </div>
        `).join('')}
        ` : ''}

        ${classData.demoQuestion ? `
        <div class="sim-box">
          <h3 style="margin-top:0; color:#065f46;">SOCRATIC ASSESSMENT</h3>
          <div style="font-style:italic; font-size:18px; margin-bottom:20px; color:#333;">
            ${classData.demoQuestion.text}
          </div>

          <div style="margin-bottom: 20px;">
            ${classData.demoQuestion.options.map((opt, i) => `
              <div class="${i === classData.demoQuestion.correctIdx ? 'correct-opt' : 'option'}">
                ${String.fromCharCode(65 + i)}. ${opt}
                ${i === classData.demoQuestion.correctIdx ? ' ✓' : ''}
              </div>
            `).join('')}
          </div>

          <div style="background:#f0fdfa; border-left:4px solid #10b981; padding:20px; border-radius:5px;">
            <strong>MATHEMATICAL ANALYSIS:</strong>
            <div style="margin-top: 10px;">${classData.demoQuestion.analysis.replace(/\n/g, '<br/>')}</div>
          </div>
        </div>
        ` : ''}

        ${classData.example ? `
        <div class="section-title">PRACTICAL EXAMPLE</div>
        <div class="content-box">
          <strong>Situation:</strong> ${classData.example.situation}<br/><br/>
          <strong>Calculation:</strong><br/>
          ${classData.example.calculation.replace(/\n/g, '<br/>')}<br/><br/>
          <strong>Result:</strong> ${classData.example.result}
        </div>
        ` : ''}

        <div class="footer">
          QUANTUM KINEMATICS LEARNING SYSTEM V9000<br/>
          Revolutionary embodied cognition in physics education
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
};

/* ============================================================
   🎥 GPU-ACCELERATED PHYSICS ENGINE (WEBGL USEFRAME)
============================================================ */
const HologramText = ({ position, text, color, bg = 'rgba(0,10,20,0.8)', size = '12px' }) => (
  <Html position={position} center distanceFactor={30} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
    <div style={{
      color: color,
      fontFamily: 'monospace',
      fontWeight: 'bold',
      fontSize: size,
      background: bg,
      padding: '4px 10px',
      border: `1px solid ${color}`,
      borderRadius: '6px',
      textShadow: `0 0 8px ${color}`,
      whiteSpace: 'nowrap',
      textTransform: 'uppercase',
      backdropFilter: 'blur(5px)'
    }}>
      {text}
    </div>
  </Html>
);

const VectorArrow = ({ from = [0, 0, 0], to = [1, 0, 0], color = '#00f2ff', width = 2, headSize = 0.5 }) => {
  const arrowRef = useRef();

  // Calculate arrow direction and length
  const direction = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(new THREE.Vector3(...to), new THREE.Vector3(...from));
    return dir.normalize();
  }, [from, to]);

  // Calculate arrow length
  const length = useMemo(() => {
    return new THREE.Vector3(...to).distanceTo(new THREE.Vector3(...from));
  }, [from, to]);

  return (
    <group ref={arrowRef} position={from}>
      {/* Arrow shaft */}
      <mesh position={[0, 0, length/2]}>
        <cylinderGeometry args={[width/2, width/2, length, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0, 0, length]} rotation={[0, 0, Math.atan2(direction.y, direction.x)]}>
        <coneGeometry args={[headSize, headSize * 2, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
};

const PhysicsWorld = ({ mission, inputs, simStatus, isLocked, onMissionEnd, updateTelemetry }) => {
  const targetRef = useRef();
  const droneGroup = useRef();
  const vectorGroup = useRef();

  // Physics state with enhanced debug information
  const physState = useRef({
    p: new THREE.Vector3(),
    v: new THREE.Vector3(),
    a: new THREE.Vector3(),
    t: 0,
    debug: {
      maxHeight: 0,
      groundCollisions: 0,
      targetDistance: 0
    }
  }).current;

  // Calculate ghost trajectory for prediction
  const ghostTrajectory = useMemo(() => {
    const points = [];
    const tLimit = mission.limitTime;
    const steps = 100; // Higher resolution for smoother curve
    let maxY = 0;

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tLimit;
      let gx = mission.initial.p[0];
      let gy = mission.initial.p[1];
      let gz = mission.initial.p[2];

      // Apply mission-specific physics
      if (mission.logic === 'teleport') {
        gx = parseFloat(inputs.posX) || 0;
        gy = parseFloat(inputs.posY) || 0;
        gz = parseFloat(inputs.posZ) || 0;
      } else if (mission.logic === 'freefall') {
        gy += 0.5 * mission.gravity * t * t;
      } else {
        const vx = parseFloat(inputs.velX) || 0;
        const vy = parseFloat(inputs.velY) || 0;
        const vz = parseFloat(inputs.velZ) || 0;
        const ax = parseFloat(inputs.accX) || 0;
        const ay = mission.logic.includes('projectile') ? mission.gravity : 0;

        // Kinematic equations: p = p0 + v0*t + 0.5*a*t²
        gx += (vx * t) + (0.5 * ax * t * t);
        gy += (vy * t) + (0.5 * ay * t * t);
        gz += (vz * t);
      }

      // Ground collision
      if (gy < 0) {
        gy = 0;
        physState.debug.groundCollisions++;
      }

      // Track max height for debug
      if (gy > maxY) maxY = gy;

      points.push(new THREE.Vector3(gx, gy, gz));
    }

    // Calculate initial distance to target for debug
    const initialDistance = new THREE.Vector3(...mission.initial.p).distanceTo(new THREE.Vector3(...mission.target));
    physState.debug.initialDistance = initialDistance;

    return {
      finalPos: [points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].z],
      path: points,
      maxHeight: maxY,
      initialDistance
    };
  }, [inputs, mission]);

  // Main physics simulation loop
  useFrame((state, delta) => {
    // Update target animation
    if (targetRef.current) {
      targetRef.current.rotation.y += isLocked ? delta * 6 : delta;
      targetRef.current.rotation.x += delta * 0.8;
    }

    // Reset physics state when IDLE
    if (simStatus === 'IDLE') {
      physState.p.set(...mission.initial.p);
      physState.v.set(0, 0, 0);
      physState.a.set(0, 0, 0);
      physState.t = 0;
      physState.debug = {
        maxHeight: 0,
        groundCollisions: 0,
        targetDistance: 0,
        initialDistance: 0
      };

      if (droneGroup.current) {
        droneGroup.current.position.copy(physState.p);
        droneGroup.current.rotation.set(0, 0, 0);
      }

      // Camera positioning
      const zOffset = isLocked ? 30 : 60;
      state.camera.position.lerp(
        new THREE.Vector3(mission.target[0] / 2, mission.initial.p[1] + 15, zOffset),
        0.05
      );
      state.camera.lookAt(mission.target[0] / 2, mission.initial.p[1] / 2, 0);
    }

    // Run physics simulation
    if (simStatus === 'RUNNING') {
      // Initialize physics state at t=0
      if (physState.t === 0) {
        missionTelemetry.startMission(mission);

        if (mission.logic === 'mru') {
          physState.v.set(parseFloat(inputs.velX) || 0, 0, parseFloat(inputs.velZ) || 0);
        } else if (mission.logic === 'mrua') {
          physState.a.set(parseFloat(inputs.accX) || 0, 0, 0);
        } else if (mission.logic === 'projectile') {
          physState.v.set(parseFloat(inputs.velX) || 0, parseFloat(inputs.velY) || 0, 0);
          physState.a.set(0, mission.gravity, 0);
        } else if (mission.logic === 'projectile3d') {
          physState.v.set(parseFloat(inputs.velX) || 0, parseFloat(inputs.velY) || 0, parseFloat(inputs.velZ) || 0);
          physState.a.set(0, mission.gravity, 0);
        } else if (mission.logic === 'freefall') {
          physState.a.set(0, mission.gravity, 0);
        } else if (mission.logic === 'teleport') {
          physState.p.set(parseFloat(inputs.posX) || 0, parseFloat(inputs.posY) || 0, parseFloat(inputs.posZ) || 0);
        }
      }

      // Skip physics for teleport mission
      if (mission.logic !== 'teleport') {
        // Update velocity: v = v0 + a*t (Euler integration)
        physState.v.addScaledVector(physState.a, delta);

        // Update position: p = p0 + v*t (Euler integration)
        physState.p.addScaledVector(physState.v, delta);

        // Ground collision detection
        if (physState.p.y < 0) {
          physState.p.y = 0;
          physState.v.set(0, 0, 0);
          physState.a.set(0, 0, 0);
          physState.debug.groundCollisions++;
        }

        // Track maximum height for debug
        if (physState.p.y > physState.debug.maxHeight) {
          physState.debug.maxHeight = physState.p.y;
        }
      }

      // Update simulation time
      physState.t += delta;

      // Update drone visualization
      if (droneGroup.current) {
        const mag = physState.v.length();

        // Add subtle vibration based on velocity magnitude
        droneGroup.current.position.copy(physState.p).add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 0.015 * mag,
            (Math.random() - 0.5) * 0.015 * mag,
            0
          )
        );

        // Make drone point in direction of motion if moving
        if (mag > 0.1) {
          droneGroup.current.lookAt(physState.p.clone().add(physState.v));
        }
      }

      // Update camera to follow drone
      state.camera.position.lerp(
        new THREE.Vector3(physState.p.x - 12, physState.p.y + 8, physState.p.z + 20),
        0.1
      );
      state.camera.lookAt(physState.p);

      // Send telemetry updates periodically
      if (Math.floor(physState.t * 60) % 6 === 0) {
        updateTelemetry(physState.t, [physState.p.x, physState.p.y, physState.p.z], [physState.v.x, physState.v.y, physState.v.z]);
        missionTelemetry.updatePhysics(physState);
      }

      // Check mission completion conditions
      const maxTime = mission.logic === 'freefall' ? parseFloat(inputs.time) || 0 : mission.limitTime;
      if (physState.t >= maxTime || (physState.p.y <= 0 && mission.logic !== 'teleport' && physState.t > 0.5)) {
        // Calculate Euclidean distance to target
        const dist = new THREE.Vector3(...physState.p).distanceTo(new THREE.Vector3(...mission.target));
        physState.debug.targetDistance = dist;

        // Determine mission result based on distance
        if (dist <= mission.tolerance) {
          onMissionEnd('SUCCESS', dist);
        } else if (dist <= mission.tolerance * 3.5) {
          onMissionEnd('NEARMISS', dist);
        } else {
          onMissionEnd('FAIL', dist);
        }
      }
    }
  });

  return (
    <>
      {/* Lighting setup */}
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[10, 30, 20]}
        intensity={3}
        color="#00f2ff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Space environment */}
      <Stars count={3000} factor={4} fade speed={0.1} />
      <fog color="#000510" near={50} far={200} />

      {/* 3D Mathematical Space */}
      <Grid
        infiniteGrid
        fadeDistance={400}
        sectionColor="#004488"
        cellColor="#001133"
        position={[0, -0.1, 0]}
        cellSize={2}
        sectionSize={10}
      />
      <Grid
        infiniteGrid
        fadeDistance={400}
        sectionColor="#004488"
        cellColor="#001133"
        position={[0, 0, -50]}
        rotation={[Math.PI / 2, 0, 0]}
        cellSize={2}
        sectionSize={10}
        opacity={0.15}
        transparent
      />

      {/* Cartesian Reference Axes */}
      <Line
        points={[[-100, 0, 0], [200, 0, 0]]}
        color="#ff0055"
        lineWidth={3}
        opacity={0.6}
        transparent
      />
      <Text
        position={[20, 0.5, 0]}
        color="#ff0055"
        fontSize={2}
        outlineWidth={0.1}
        outlineColor="#000"
      >
        X
      </Text>

      <Line
        points={[[0, -10, 0], [0, 100, 0]]}
        color="#00ff00"
        lineWidth={3}
        opacity={0.6}
        transparent
      />
      <Text
        position={[0, 20, 0]}
        color="#00ff00"
        fontSize={2}
        outlineWidth={0.1}
        outlineColor="#000"
      >
        Y
      </Text>

      <Line
        points={[[0, 0, -100], [0, 0, 100]]}
        color="#0055ff"
        lineWidth={3}
        opacity={0.6}
        transparent
      />
      <Text
        position={[0, 0.5, 20]}
        color="#0055ff"
        fontSize={2}
        outlineWidth={0.1}
        outlineColor="#000"
      >
        Z
      </Text>

      {/* Origin Marker */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 32]} />
        <meshStandardMaterial
          color="#222"
          metalness={0.9}
          roughness={0.1}
          emissive="#444"
          emissiveIntensity={0.3}
        />
        <HologramText position={[0, 2, 0]} text="ORIGIN [0,0,0]" color="#aaa" />
      </mesh>

      {/* Target (Anomaly) */}
      <mesh ref={targetRef} position={mission.target}>
        <icosahedronGeometry args={[mission.tolerance, 1]} />
        <meshStandardMaterial
          color={isLocked ? "#f00" : "#ffea00"}
          emissive={isLocked ? "#f00" : "#ffea00"}
          emissiveIntensity={2.5}
          wireframe
        />
        <HologramText
          position={[0, mission.tolerance + 2, 0]}
          text={`TARGET [X:${mission.target[0].toFixed(1)}, Y:${mission.target[1].toFixed(1)}, Z:${mission.target[2].toFixed(1)}]`}
          color={isLocked ? "#f00" : "#ffea00"}
          size="14px"
        />
      </mesh>

      {/* Ghost Trajectory Prediction */}
      {simStatus === 'IDLE' && isLocked && (
        <group>
          <mesh position={ghostTrajectory.finalPos}>
            <sphereGeometry args={[mission.tolerance * 0.8, 16, 16]} />
            <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.6} />
            <HologramText
              position={[0, 2.5, 0]}
              text={`PREDICTED POSITION (${ghostTrajectory.initialDistance.toFixed(1)}m)`}
              color="#00f2ff"
              bg="rgba(0,242,255,0.15)"
            />
          </mesh>
          <Line
            points={ghostTrajectory.path}
            color="#00f2ff"
            lineWidth={3}
            dashed
            dashScale={4}
            dashSize={1}
            opacity={0.7}
            transparent
          />
        </group>
      )}

      {/* Physics Drone */}
      <group ref={droneGroup}>
        {/* Drone body */}
        <mesh>
          <coneGeometry args={[1.8, 5, 5]} />
          <meshStandardMaterial
            color={simStatus === 'FAIL' ? '#f00' : '#0f0'}
            emissive={simStatus === 'FAIL' ? '#800' : '#024005'}
            emissiveIntensity={0.8}
            wireframe
          />
        </mesh>

        {/* Drone base */}
        <mesh position={[0, -2, 0]}>
          <cylinderGeometry args={[0.6, 1.2, 1.5, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>

        {/* Vector Visualization System */}
        {simStatus === 'RUNNING' && (
          <group ref={vectorGroup}>
            {/* Velocity Vector (Cyan) */}
            <VectorArrow
              from={[0, 0, 0]}
              to={[physState.v.x, physState.v.y, physState.v.z]}
              color="#00f2ff"
              width={0.3}
              headSize={0.5}
            />

            {/* Acceleration/Gravity Vector (Magenta) */}
            {(mission.logic.includes('projectile') || mission.logic === 'freefall') && (
              <VectorArrow
                from={[0, 0, 0]}
                to={[0, mission.gravity, 0]}
                color="#ff00ff"
                width={0.2}
                headSize={0.4}
              />
            )}

            {mission.logic === 'mrua' && (
              <VectorArrow
                from={[0, 0, 0]}
                to={[parseFloat(inputs.accX) || 0, 0, 0]}
                color="#ff00ff"
                width={0.2}
                headSize={0.4}
              />
            )}
          </group>
        )}

        {/* Engine Effects */}
        {simStatus === 'RUNNING' && (
          <>
            <Trail
              width={2}
              length={80}
              color="#0f0"
              attenuation={(t) => t * t}
            />
            <Sparkles
              position={[0, -2.5, 0]}
              count={150}
              scale={4}
              size={25}
              speed={6}
              color="#ffaa00"
            />
          </>
        )}
      </group>

      {/* Success Explosion */}
      {simStatus === 'SUCCESS' && (
        <Sparkles
          position={mission.target}
          count={800}
          scale={25}
          size={35}
          speed={7}
          color="#0f0"
        />
      )}

      {/* Post-processing Effects */}
      <EffectComposer>
        <Bloom
          intensity={simStatus === 'SUCCESS' ? 4 : 2.5}
          luminanceThreshold={0.1}
          mipmapBlur
        />
        {simStatus === 'FAIL' && (
          <>
            <ChromaticAberration offset={new THREE.Vector2(0.1, 0.1)} />
            <Noise opacity={0.7} />
          </>
        )}
        <Scanline opacity={0.25} density={2.5} />
        <Vignette eskil={false} offset={0.1} darkness={1.2} />
      </EffectComposer>
    </>
  );
};

/* ============================================================
   🎮 MAIN APPLICATION (THE QUANTUM SANDBOX V9000)
============================================================ */
function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = LEXICON[language] ? language : 'es';
  const UI = LEXICON[safeLang].ui;

  // Mission state
  const [level, setLevel] = useState(1);
  const [mission, setMission] = useState(() => generateKinematicMission(1, safeLang));
  const [inputs, setInputs] = useState(() => {
    const init = {};
    mission.inputs.forEach(i => init[i.id] = i.def);
    return init;
  });

  // Simulation state
  const [simStatus, setSimStatus] = useState('IDLE');
  const [isLocked, setIsLocked] = useState(false);
  const [telemetry, setTelemetry] = useState({ t: 0, p: [...mission.initial.p], v: [...mission.initial.v] });
  const [finalDist, setFinalDist] = useState(0);

  // UI state
  const [showDatabank, setShowDatabank] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [preloadedDilemma, setPreloadedDilemma] = useState(null);
  const [showAILesson, setShowAILesson] = useState(false);
  const [aiLesson, setAILesson] = useState(null);
  const [selectedAiOption, setSelectedAiOption] = useState(null);
  const [aiSolved, setAiSolved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Mission history
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('icfes_physics_history_v3');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Initialize AI systems
  useEffect(() => {
    let isMounted = true;
    sfx.init();
    TTS.speak(LEXICON[safeLang].voice.init, safeLang);

    // Preload AI content
    fetchDilemmaFromAI(mission.topic, safeLang).then(data => {
      if (isMounted) setPreloadedDilemma(data);
    });

    // Cleanup
    return () => {
      isMounted = false;
      TTS.stop();
    };
  }, [mission, safeLang]);

  // Save mission history
  const saveToHistory = useCallback((topic, data) => {
    setHistory(prev => {
      const updated = [
        {
          id: Date.now(),
          date: new Date().toLocaleString(),
          topic,
          classData: data,
          missionData: missionTelemetry.getMissionData()
        },
        ...prev
      ];

      // Persist to localStorage
      window.localStorage.setItem('icfes_physics_history_v3', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Event handlers
  const handleControlClick = (e) => {
    if (e) e.stopPropagation();
    sfx.playEffect('click');
  };

  const handleSliderChange = (e) => {
    sfx.playEffect('slide');
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const lockTarget = (e) => {
    e.stopPropagation();
    sfx.playEffect('lockOn');
    setIsLocked(true);
  };

  const executePhysics = (e) => {
    e.stopPropagation();
    sfx.playEffect('click');

    // Validate inputs
    let hasValidData = true;
    mission.inputs.forEach(i => {
      const value = inputs[i.id];
      if (value === '' || isNaN(parseFloat(value))) {
        hasValidData = false;
      }
    });

    if (!hasValidData) {
      sfx.playEffect('error');
      return;
    }

    // Reset telemetry
    setTelemetry({ t: 0, p: [...mission.initial.p], v: [...mission.initial.v] });
    sfx.startEngine();
    setSimStatus('RUNNING');
  };

  const handleMissionEnd = useCallback((status, distance) => {
    setSimStatus(status);
    setFinalDist(distance);
    sfx.stopEngine();
    missionTelemetry.endMission(status === 'SUCCESS', distance);

    // Provide appropriate feedback
    if (status === 'SUCCESS') {
      TTS.speak(UI.successDesc, safeLang);
    } else if (status === 'NEARMISS') {
      TTS.speak(UI.nearMissDesc, safeLang);
    } else {
      TTS.speak(UI.failDesc, safeLang);
      if (preloadedDilemma) {
        setTimeout(() => {
          setShowAiModal(true);
          TTS.speak(UI.aiLocked, safeLang);
        }, 2500);
      }
    }
  }, [preloadedDilemma, safeLang, UI]);

  const updateTelemetry = useCallback((t, p, v) => {
    setTelemetry({ t, p, v });
  }, []);

  const resetSim = (e) => {
    if (e) e.stopPropagation();
    sfx.playEffect('click');
    sfx.stopEngine();
    setSimStatus('IDLE');
    setIsLocked(false);
    setTelemetry({ t: 0, p: [...mission.initial.p], v: [...mission.initial.v] });
  };

  const nextLevel = (e) => {
    e.stopPropagation();
    sfx.playEffect('success');
    const nextLvl = level === 6 ? 1 : level + 1;
    const newMiss = generateKinematicMission(nextLvl, safeLang);

    setLevel(nextLvl);
    setMission(newMiss);

    // Initialize inputs for new mission
    const newInputs = {};
    newMiss.inputs.forEach(i => newInputs[i.id] = i.def);
    setInputs(newInputs);

    // Reset simulation
    setSimStatus('IDLE');
    setIsLocked(false);
    setTelemetry({ t: 0, p: [...newMiss.initial.p], v: [...newMiss.initial.v] });
  };

  const handleAiAnswer = (index) => {
    sfx.playEffect('click');
    setSelectedAiOption(index);

    if (index === preloadedDilemma.demoQuestion.correctIdx) {
      sfx.playEffect('success');
      setAiSolved(true);
      saveToHistory(mission.topic, preloadedDilemma);
      TTS.speak(UI.aiRestored, safeLang);
    } else {
      sfx.playEffect('error');
      TTS.speak(UI.aiError, safeLang);
      // Provide explanation for wrong answer
      TTS.speak(preloadedDilemma.demoQuestion.explanations[index], safeLang);
    }
  };

  // AI Lesson System
  const requestAILesson = async () => {
    sfx.playEffect('click');
    try {
      const lesson = await fetchAILesson(mission.topic, safeLang);
      setAILesson(lesson);
      setShowAILesson(true);
      TTS.speak(lesson.concept, safeLang);
    } catch (error) {
      console.error("Error fetching AI lesson:", error);
      sfx.playEffect('error');
    }
  };

  // Energy calculation for telemetry
  const energy = useMemo(() => {
    const mass = 1000; // kg
    const vMag = Math.sqrt(telemetry.v[0]**2 + telemetry.v[1]**2 + telemetry.v[2]**2);
    const K = 0.5 * mass * (vMag**2); // Kinetic energy in Joules
    const U = mass * 9.8 * Math.max(0, telemetry.p[1]); // Potential energy in Joules
    return {
      K: (K / 1000).toFixed(1), // kJ
      U: (U / 1000).toFixed(1), // kJ
      Total: ((K + U) / 1000).toFixed(1) // kJ
    };
  }, [telemetry]);

  // Render live equation based on mission type
  const renderLiveEquation = () => {
    switch (mission.logic) {
      case 'mru':
        return `V_x = ${inputs.velX || 0} m/s, V_z = ${inputs.velZ || 0} m/s`;
      case 'mrua':
        return `A_x = ${inputs.accX || 0} m/s²`;
      case 'projectile':
      case 'projectile3d':
        return `V_x = ${inputs.velX || 0} m/s, V_y = ${inputs.velY || 0} m/s${mission.logic === 'projectile3d' ? `, V_z = ${inputs.velZ || 0} m/s` : ''}`;
      case 'freefall':
        return `T = ${inputs.time || 0} s`;
      default:
        return mission.equation;
    }
  };

  // Render mission debug information
  const renderDebugInfo = () => {
    if (!showDebugPanel) return null;

    const currentData = missionTelemetry.getMissionData();
    const physicsHistory = missionTelemetry.getPhysicsHistory();

    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.8)',
        border: '1px solid #00f2ff',
        borderRadius: '8px',
        padding: '15px',
        maxWidth: '350px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#00f2ff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <strong>{UI.debugPanel}</strong>
          <button
            onClick={() => setShowDebugPanel(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ✕
          </button>
        </div>

        {currentData && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <strong>{UI.missionData}</strong>
              <div>Type: {currentData.topic}</div>
              <div>Level: {currentData.difficulty}</div>
              <div>Target: [{currentData.target.join(', ')}]</div>
              <div>Time Limit: {currentData.limitTime}s</div>
              <div>Status: {simStatus}</div>
              {currentData.completed && (
                <>
                  <div>Result: {currentData.success ? 'SUCCESS' : 'FAIL'}</div>
                  <div>Distance: {currentData.distance.toFixed(2)}m</div>
                </>
              )}
            </div>

            <div>
              <strong>{UI.physicsState}</strong>
              <div>{UI.time}: {telemetry.t.toFixed(2)}s</div>
              <div>{UI.position}: [{telemetry.p.map(v => v.toFixed(1)).join(', ')}]m</div>
              <div>{UI.velocity}: [{telemetry.v.map(v => v.toFixed(1)).join(', ')}]m/s</div>
              <div>{UI.acceleration}: [{physState.a.x.toFixed(1)}, {physState.a.y.toFixed(1)}, {physState.a.z.toFixed(1)}]m/s²</div>

              {physicsHistory.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong>History:</strong>
                  <div>Max Height: {physState.debug.maxHeight.toFixed(1)}m</div>
                  <div>Initial Distance: {physState.debug.initialDistance.toFixed(1)}m</div>
                  <div>Final Distance: {physState.debug.targetDistance.toFixed(1)}m</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#000510',
      fontFamily: 'Orbitron, sans-serif',
      overflow: 'hidden',
      userSelect: 'none',
      touchAction: 'none'
    }}>
      {/* Global styles */}
      <style>{`
        html, body, #root {
          margin: 0;
          padding: 0;
          overflow: hidden;
          touch-action: none;
          width: 100%;
          height: 100%;
        }

        .sci-btn {
          padding: 12px 20px;
          background: rgba(0, 242, 255, 0.1);
          color: #00f2ff;
          font-weight: bold;
          font-size: clamp(12px, 3vw, 16px);
          cursor: pointer;
          border: 1px solid #00f2ff;
          text-transform: uppercase;
          transition: all 0.3s;
          clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%);
          position: relative;
          overflow: hidden;
        }

        .sci-btn:hover, .sci-btn:active {
          background: #00f2ff;
          color: #000;
          box-shadow: 0 0 20px #00f2ff;
        }

        .sci-btn:before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: 0.5s;
        }

        .sci-btn:hover:before {
          left: 100%;
        }

        .action-btn {
          padding: 15px 35px;
          background: #ffaa00;
          color: #000;
          font-weight: 900;
          font-size: clamp(18px, 4vw, 24px);
          cursor: pointer;
          border: none;
          text-transform: uppercase;
          clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%);
          transition: all 0.2s;
          box-shadow: 0 0 20px rgba(255,170,0,0.5);
          position: relative;
        }

        .action-btn:active {
          transform: scale(0.95);
        }

        .hud-panel {
          background: rgba(0, 10, 20, 0.85);
          border-left: 3px solid #00f2ff;
          backdrop-filter: blur(15px);
          padding: clamp(15px, 3vw, 25px);
          box-shadow: 10px 0 30px rgba(0,0,0,0.8);
          border-radius: 0 8px 8px 0;
        }

        .sci-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 8px;
          background: #222;
          border-radius: 4px;
          outline: none;
          border: 1px solid #444;
          margin: 10px 0;
          position: relative;
        }

        .sci-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #00f2ff;
          cursor: pointer;
          box-shadow: 0 0 15px #00f2ff;
          transition: all 0.1s;
          border: 2px solid #fff;
        }

        .sci-slider::-webkit-slider-thumb:active {
          transform: scale(1.3);
          background: #ffaa00;
          box-shadow: 0 0 25px #ffaa00;
          border-color: #ffaa00;
        }

        .ai-btn {
          padding: 15px;
          text-align: left;
          font-size: 16px;
          cursor: pointer;
          font-weight: bold;
          border-radius: 8px;
          transition: all 0.2s;
          margin-bottom: 10px;
          border: 1px solid #444;
          background: rgba(255,255,255,0.05);
          color: #aaa;
          position: relative;
          overflow: hidden;
        }

        .ai-btn:hover {
          background: rgba(255,255,255,0.1);
          transform: translateX(5px);
        }

        .ai-btn.selected-correct {
          background: rgba(0,255,0,0.2) !important;
          border-color: #0f0 !important;
          color: #0f0 !important;
          box-shadow: 0 0 20px rgba(0,255,0,0.3);
          animation: pulse 1s infinite;
        }

        .ai-btn.selected-wrong {
          background: rgba(255,0,0,0.2) !important;
          border-color: #f00 !important;
          color: #f00 !important;
          animation: shake 0.3s;
        }

        .hud-pulse {
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; text-shadow: 0 0 20px; }
          50% { opacity: 0.7; text-shadow: 0 0 10px; }
          100% { opacity: 1; text-shadow: 0 0 20px; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .input-group {
          display: flex;
          justifyContent: 'space-between';
          alignItems: 'center';
          margin-bottom: 10px;
        }

        .input-label {
          color: #aaa;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 5px;
        }

        .input-value {
          font-size: 18px;
          color: #fff;
          font-family: monospace;
        }

        .input-hint {
          font-size: 10px;
          color: #666;
          font-style: italic;
          margin-top: 3px;
        }

        .debug-toggle {
          position: absolute;
          top: 20px;
          right: 20px;
          zIndex: 100;
          background: rgba(255, 0, 0, 0.7);
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        }

        .debug-toggle:hover {
          background: rgba(255, 0, 0, 0.9);
        }
      `}</style>

      {/* 3D Physics Canvas */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <Suspense fallback={null}>
          <Canvas camera={{ position: [0, 30, 50], fov: 50 }}>
            <PhysicsWorld
              mission={mission}
              inputs={inputs}
              simStatus={simStatus}
              isLocked={isLocked}
              onMissionEnd={handleMissionEnd}
              updateTelemetry={updateTelemetry}
            />
            <OrbitControls
              enableZoom={true}
              maxPolarAngle={Math.PI / 2 - 0.05}
              minPolarAngle={0.1}
              autoRotate={simStatus === 'IDLE' && !isLocked}
              autoRotateSpeed={0.5}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Debug Panel Toggle */}
      <button
        className="debug-toggle"
        onClick={() => setShowDebugPanel(!showDebugPanel)}
      >
        {showDebugPanel ? 'HIDE DEBUG' : 'SHOW DEBUG'}
      </button>

      {/* Debug Information Panel */}
      {renderDebugInfo()}

      {/* Mission Display */}
      <div
        className="hud-panel"
        style={{
          position: 'absolute',
          top: '20px',
          left: '0',
          zIndex: 10,
          maxWidth: '400px',
          clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
          pointerEvents: 'none'
        }}
      >
        <div style={{ fontSize: '12px', color: '#00f2ff', letterSpacing: '3px' }}>
          MISSION.LVL // {level}
        </div>
        <h2 style={{
          margin: '5px 0',
          color: '#fff',
          fontSize: 'clamp(16px, 4vw, 20px)',
          textTransform: 'uppercase'
        }}>
          {mission.topic}
        </h2>
        <p style={{
          fontSize: 'clamp(11px, 3vw, 13px)',
          color: '#aaa',
          margin: '10px 0',
          lineHeight: '1.5'
        }}>
          {mission.desc}
        </p>

        {isLocked && (
          <div style={{
            background: 'rgba(255,170,0,0.15)',
            borderLeft: '4px solid #ffaa00',
            padding: '12px',
            fontFamily: 'monospace',
            color: '#ffaa00',
            fontSize: '12px',
            animation: 'pulse 2s infinite'
          }}>
            LIVE MATH ENGINE:<br />
            <div style={{
              fontSize: '16px',
              marginTop: '5px',
              color: '#fff',
              textShadow: '0 0 10px #ffaa00'
            }} dangerouslySetInnerHTML={{ __html: renderLiveEquation() }}></div>
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 10,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          className="sci-btn"
          onClick={(e) => {
            e.stopPropagation();
            sfx.playEffect('click');
            setShowDatabank(true);
            TTS.speak(GLOBAL_DATABANK[safeLang][Math.min(level - 1, 5)].description, safeLang);
          }}
        >
          {UI.theoryBtn}
        </button>
        <button
          className="sci-btn"
          onClick={(e) => {
            e.stopPropagation();
            sfx.playEffect('click');
            setShowHistory(true);
          }}
        >
          {UI.aiLogBtn}
        </button>
        <button
          className="sci-btn"
          onClick={requestAILesson}
        >
          {UI.aiClass}
        </button>
      </div>

      {/* Telemetry Display */}
      <div
        className="hud-panel"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '0',
          zIndex: 10,
          borderLeft: '4px solid #ff0055',
          clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)'
        }}
      >
        <div style={{ fontSize: '12px', color: '#ff0055', letterSpacing: '2px' }}>
          {UI.telemetry}
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
          <div>
            <div style={{ fontSize: '24px', color: '#fff', fontFamily: 'monospace' }}>
              T: <span style={{ color: telemetry.t >= mission.limitTime ? '#f00' : '#0f0' }}>
                {telemetry.t.toFixed(2)}s
              </span>
            </div>
            <div style={{ fontSize: '14px', color: '#aaa', fontFamily: 'monospace', marginTop: '5px' }}>
              X: {telemetry.p[0].toFixed(1)}m<br />
              Y: {telemetry.p[1].toFixed(1)}m<br />
              Z: {telemetry.p[2].toFixed(1)}m
            </div>
          </div>
          <div style={{ borderLeft: '1px solid #444', paddingLeft: '20px' }}>
            <div style={{ fontSize: '10px', color: '#ffaa00' }}>ENERGY (kJ)</div>
            <div style={{ fontSize: '14px', color: '#0f0', fontFamily: 'monospace' }}>
              K: {energy.K}
            </div>
            <div style={{ fontSize: '14px', color: '#00f2ff', fontFamily: 'monospace' }}>
              U: {energy.U}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#fff',
              fontFamily: 'monospace',
              fontWeight: 'bold',
              borderTop: '1px solid #444',
              marginTop: '5px'
            }}>
              TOT: {energy.Total}
            </div>
          </div>
        </div>
      </div>

      {/* Mission Control Interface */}
      {simStatus === 'IDLE' && !isLocked && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10
        }} onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn"
            style={{
              background: '#f00',
              color: '#fff',
              padding: '20px 40px',
              boxShadow: '0 0 30px #f00'
            }}
            onClick={lockTarget}
          >
            🎯 {UI.lockOn}
          </button>
        </div>
      )}

      {simStatus === 'IDLE' && isLocked && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          width: '95%',
          maxWidth: '800px'
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{
            background: 'rgba(0,10,20,0.95)',
            borderTop: '4px solid #00f2ff',
            padding: 'clamp(15px, 4vw, 30px)',
            borderRadius: '15px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
            border: '1px solid #333'
          }}>
            <h3 style={{
              color: '#00f2ff',
              textAlign: 'center',
              marginTop: 0,
              fontSize: '16px',
              letterSpacing: '3px'
            }}>
              {UI.control}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {mission.inputs.map(inp => (
                <div key={inp.id} style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '15px',
                  borderRadius: '10px'
                }}>
                  <div className="input-group">
                    <div>
                      <div className="input-label">{inp.label}</div>
                      {inp.hint && <div className="input-hint">{inp.hint}</div>}
                    </div>
                    <div className="input-value">
                      {inputs[inp.id] || 0} {inp.units || ''}
                    </div>
                  </div>
                  <input
                    type="range"
                    name={inp.id}
                    min={inp.min}
                    max={inp.max}
                    step={inp.step}
                    value={inputs[inp.id] || 0}
                    onChange={handleSliderChange}
                    className="sci-slider"
                    style={{
                      borderColor: inp.id.includes('acc') ? '#ff0055' : '#00f2ff'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    <span>{inp.min}</span>
                    <span>{inp.max}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <button
                className="action-btn"
                style={{ width: '100%', maxWidth: '400px' }}
                onClick={executePhysics}
              >
                🔥 {UI.ignite}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Screens */}
      {simStatus === 'SUCCESS' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          background: 'rgba(0,50,15,0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: '18px', color: '#0f0', letterSpacing: '8px', marginBottom: '15px' }}>
            . // EXECUTION_SUCCESS // .
          </div>
          <h1 className="hud-pulse" style={{
            color: '#fff',
            textShadow: '0 0 50px #0f0',
            fontSize: 'clamp(40px, 8vw, 80px)',
            margin: 0,
            textAlign: 'center'
          }}>
            {UI.success}
          </h1>
          <p style={{
            color: '#aaa',
            fontSize: '22px',
            maxWidth: '600px',
            textAlign: 'center',
            margin: '30px 0 50px 0'
          }}>
            {UI.successDesc}
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              className="sci-btn"
              style={{ borderColor: '#0f0', color: '#0f0' }}
              onClick={resetSim}
            >
              {UI.retry}
            </button>
            <button
              className="action-btn"
              style={{ background: '#0f0' }}
              onClick={nextLevel}
            >
              {UI.next}
            </button>
          </div>
        </div>
      )}

      {simStatus === 'NEARMISS' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          background: 'rgba(50,25,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }} onClick={e => e.stopPropagation()}>
          <h1 className="hud-pulse" style={{
            color: '#fff',
            textShadow: '0 0 50px #ffaa00',
            fontSize: 'clamp(40px, 8vw, 80px)',
            margin: 0,
            textAlign: 'center'
          }}>
            {UI.nearMiss}
          </h1>
          <p style={{
            color: '#ffddaa',
            fontSize: '18px',
            maxWidth: '600px',
            textAlign: 'center',
            margin: '20px 0 40px 0'
          }}>
            {UI.dist} {finalDist.toFixed(1)}m. <br />{UI.nearMissDesc}
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              className="action-btn"
              style={{ background: '#ffaa00', color: '#000' }}
              onClick={resetSim}
            >
              {UI.retry}
            </button>
          </div>
        </div>
      )}

      {simStatus === 'FAIL' && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 20,
          background: 'rgba(50,0,0,0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }} onClick={e => e.stopPropagation()}>
          <h1 className="hud-pulse" style={{
            color: '#fff',
            textShadow: '0 0 50px #f00',
            fontSize: 'clamp(40px, 8vw, 80px)',
            margin: 0,
            textAlign: 'center'
          }}>
            {UI.fail}
          </h1>
          <p style={{
            color: '#ffaaaa',
            fontSize: '18px',
            maxWidth: '600px',
            textAlign: 'center',
            margin: '20px 0 40px 0'
          }}>
            {UI.dist} {finalDist.toFixed(1)}m. <br />{UI.failDesc}
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button
              className="action-btn"
              style={{ background: '#f00', color: '#fff' }}
              onClick={resetSim}
            >
              {UI.retry}
            </button>
          </div>
        </div>
      )}

      {/* AI Lesson Modal */}
      {showAILesson && aiLesson && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 999,
          background: 'rgba(0,0,20,0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(15px)'
        }} onClick={e => e.stopPropagation()}>
          <div className="hud-panel" style={{
            borderColor: '#00f2ff',
            maxWidth: '800px',
            width: '100%',
            boxShadow: '0 0 100px rgba(0,242,255,0.3)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #00f2ff', paddingBottom: '20px' }}>
              <h1 style={{
                color: '#00f2ff',
                margin: 0,
                fontSize: 'clamp(24px, 5vw, 36px)',
                textTransform: 'uppercase'
              }}>
                {aiLesson.title}
              </h1>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div style={{
                background: 'rgba(0,242,255,0.05)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <MarkdownParser text={aiLesson.concept} />
              </div>

              {aiLesson.equations && aiLesson.equations.length > 0 && (
                <div style={{ marginTop: '25px' }}>
                  <strong style={{ color: '#ffaa00', fontSize: '16px' }}>KEY EQUATIONS:</strong>
                  <div style={{
                    background: 'rgba(0,10,20,0.5)',
                    padding: '15px',
                    borderRadius: '8px',
                    marginTop: '10px'
                  }}>
                    {aiLesson.equations.map((eq, i) => (
                      <div key={i} style={{ marginBottom: '10px' }}>
                        <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontSize: '18px' }}>
                          {eq.equation}
                        </div>
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
                    <div style={{ color: '#0f0', fontFamily: 'monospace', paddingLeft: '20px' }}>
                      {aiLesson.example.calculation}
                    </div>
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
              <button
                className="action-btn"
                style={{ width: '100%', background: '#00f2ff', color: '#000' }}
                onClick={() => setShowAILesson(false)}
              >
                CLOSE LESSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Dilemma Modal */}
      {showAiModal && preloadedDilemma && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 999,
          background: 'rgba(40,0,0,0.98)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(20px)'
        }} onClick={e => e.stopPropagation()}>
          <div className="hud-panel" style={{
            borderColor: '#f00',
            borderLeft: '4px solid #f00',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '95vh',
            overflowY: 'auto',
            boxShadow: '0 0 100px rgba(255,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', borderBottom: '1px solid #f00', paddingBottom: '20px' }}>
              <h1 className="hud-pulse" style={{
                color: '#f00',
                margin: 0,
                fontSize: 'clamp(30px, 5vw, 50px)',
                textTransform: 'uppercase'
              }}>
                {UI.aiTitle}
              </h1>
              <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '10px 0 0 0' }}>
                {UI.aiLocked}
              </p>
            </div>

            <div style={{ marginTop: '30px' }}>
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #333'
              }}>
                <MarkdownParser text={preloadedDilemma.theory} />
              </div>

              <div style={{ marginTop: '30px' }}>
                <strong style={{ color: '#00f2ff', fontSize: '18px' }}>{UI.aiTest}</strong>
                <p style={{ color: '#fff', fontSize: '18px', margin: '15px 0' }}>
                  {preloadedDilemma.demoQuestion.text}
                </p>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {preloadedDilemma.demoQuestion.options.map((opt, i) => (
                    <button
                      key={i}
                      className={`ai-btn ${selectedAiOption === i ?
                        (i === preloadedDilemma.demoQuestion.correctIdx ? 'selected-correct' : 'selected-wrong') : ''}`}
                      onClick={() => handleAiAnswer(i)}
                      disabled={aiSolved}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  ))}
                </div>

                {selectedAiOption !== null && (
                  <div style={{
                    marginTop: '25px',
                    background: aiSolved ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                    color: aiSolved ? '#0f0' : '#f00',
                    padding: '20px',
                    borderLeft: `4px solid ${aiSolved ? '#0f0' : '#f00'}`,
                    borderRadius: '5px'
                  }}>
                    <strong style={{ fontSize: '18px' }}>
                      {aiSolved ? UI.aiRestored : UI.aiError}
                    </strong>
                    <br /><br />
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
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: 'rgba(0, 100, 200, 0.2)',
                  borderRadius: '5px',
                  fontStyle: 'italic'
                }}>
                  <strong>Hint:</strong> {preloadedDilemma.hint}
                </div>
              )}

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center' }}>
                <button
                  className="action-btn"
                  style={{
                    width: '100%',
                    background: aiSolved ? '#0f0' : '#555',
                    color: aiSolved ? '#000' : '#888',
                    pointerEvents: aiSolved ? 'auto' : 'none',
                    boxShadow: aiSolved ? '0 0 30px #0f0' : 'none'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAiModal(false);
                    resetSim(e);
                  }}
                >
                  {aiSolved ? UI.aiContinue : UI.aiWait}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theory Modal */}
      {showDatabank && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,10,20,0.95)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(15px)'
        }}>
          <div className="hud-panel" style={{
            borderLeft: '3px solid #ffaa00',
            maxWidth: '800px',
            width: '100%'
          }}>
            <h2 style={{
              color: '#ffaa00',
              borderBottom: '1px solid #ffaa00',
              paddingBottom: '10px',
              marginTop: 0
            }}>
              📖 {UI.theoryBtn}: {mission.topic}
            </h2>
            <div style={{
              color: '#fff',
              fontSize: 'clamp(14px, 4vw, 18px)',
              lineHeight: '1.7',
              padding: '20px 0'
            }}>
              {GLOBAL_DATABANK[safeLang][Math.min(level - 1, 5)].description}
            </div>

            {GLOBAL_DATABANK[safeLang][Math.min(level - 1, 5)].equation && (
              <div style={{
                background: 'rgba(255, 170, 0, 0.1)',
                padding: '15px',
                borderRadius: '5px',
                margin: '20px 0',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '18px'
              }}>
                {GLOBAL_DATABANK[safeLang][Math.min(level - 1, 5)].equation}
              </div>
            )}

            <button
              className="sci-btn"
              style={{ width: '100%', marginTop: '20px', borderColor: '#ffaa00', color: '#ffaa00' }}
              onClick={(e) => {
                TTS.stop();
                handleControlClick(e);
                setShowDatabank(false);
              }}
            >
              {UI.close}
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          background: 'rgba(0,10,30,0.98)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px',
          backdropFilter: 'blur(15px)'
        }} onClick={(e) => e.stopPropagation()}>
          <div className="hud-panel" style={{
            borderColor: '#00f2ff',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '95vh',
            overflowY: 'auto'
          }}>
            <h2 style={{
              color: '#00f2ff',
              textAlign: 'center',
              fontSize: 'clamp(24px, 5vw, 30px)',
              borderBottom: '2px solid #00f2ff',
              paddingBottom: '10px',
              marginTop: 0
            }}>
              📚 {UI.aiLogBtn}
            </h2>

            {history.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', fontSize: '18px', padding: '40px 0' }}>
                {UI.emptyMem}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {history.map((h) => (
                  <div key={h.id} style={{
                    background: 'rgba(0,242,255,0.05)',
                    border: '1px solid #00f2ff',
                    padding: '15px',
                    borderRadius: '5px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '16px' }}>
                        {h.classData.title || h.topic}
                      </div>
                      <div style={{ color: '#00f2ff', fontSize: '12px', marginTop: '5px' }}>
                        🕒 {h.date}
                      </div>
                      {h.missionData && (
                        <div style={{ color: '#aaa', fontSize: '11px', marginTop: '3px' }}>
                          {h.missionData.success ? '✓ Success' : '✗ Fail'} | {h.missionData.distance.toFixed(1)}m
                        </div>
                      )}
                    </div>
                    <button
                      className="sci-btn"
                      style={{ margin: 0, width: '100%', maxWidth: '150px' }}
                      onClick={() => downloadPDF(h.classData, safeLang)}
                    >
                      📄 PDF
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '20px', marginTop: '30px', flexWrap: 'wrap' }}>
              <button
                className="sci-btn"
                style={{ flex: 1, borderColor: '#fff', color: '#fff' }}
                onClick={(e) => { handleControlClick(e); setShowHistory(false); }}
              >
                {UI.close}
              </button>
              {history.length > 0 && (
                <button
                  className="sci-btn"
                  style={{ flex: 1, borderColor: '#f00', color: '#f00' }}
                  onClick={() => {
                    sfx.playEffect('error');
                    setHistory([]);
                    window.localStorage.removeItem('icfes_physics_history_v3');
                  }}
                >
                  🗑️ {UI.purgeData || 'PURGE DATA'}
                </button>
              )}
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