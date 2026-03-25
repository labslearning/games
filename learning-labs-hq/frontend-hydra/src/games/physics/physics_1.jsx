import React, { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import { create } from 'zustand';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Line, Html, Sparkles, Trail, Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON & PEDAGOGY
=============================================== */
const LEXICON = {
  es: {
    ui: {
      title: "PROTOCOLO NEWTON: ASTRO-DINÁMICA",
      target: "OBJETIVO", dist: "DISTANCIA", vel: "VEL (v)", acc: "ACC (a)", mass: "MASA (m)", force: "FUERZA (F)",
      ignite: "APLICAR FUERZA", brake: "PROPULSIÓN INVERSA", explain: "🧠 ANÁLISIS IA",
      nextMission: "SIGUIENTE LEY", retry: "RECALIBRAR", close: "CERRAR",
      mission1: "LEY 1: INERCIA", mission2: "LEY 2: F = m·a", mission3: "LEY 3: ACCIÓN/REACCIÓN",
      telemetry: "TELEMETRÍA VECTORIAL", fmaGraph: "RELACIÓN F-m-a"
    },
    theory: {
      intro_title: "ACADEMIA HOLOGRÁFICA: FÍSICA NEWTONIANA",
      intro_p: "Bienvenido, Comandante. Antes de iniciar, tu IA Socrática te impartirá la teoría base. Las Leyes de Newton no son memorización, son **experiencia**. Cada simulación es un laboratorio donde el universo te mostrará las reglas por ti mismo.",
      m1_title: "PRIMERA LEY: LA INERCIA",
      m1_p: "IMAGÍNATE que flotas en el vacío del espacio profundo y lanzas tu teléfono. No hay aire, no hay gravedad. Ese teléfono viajará en línea recta a esa misma velocidad por toda la eternidad hasta chocar con una estrella. Eso es la Inercia. Los objetos son 'perezosos': si están quietos, quieren seguir quietos; si se mueven, quieren seguir moviéndose. **No necesitas fuerza para mantener la velocidad, necesitas fuerza para cambiarla.**",
      m2_title: "SEGUNDA LEY: F = m · a",
      m2_p: "IMAGÍNATE que pateas un balón de fútbol. Vuela a gran velocidad. Ahora imagínate patear una bola de acero sólido con la misma fuerza. Te rompes el pie y la bola apenas se mueve. El universo tiene una regla estricta: **a mayor Masa (m), más Fuerza (F) debes invertir para lograr la misma Aceleración (a).**",
      m3_title: "TERCERA LEY: ACCIÓN Y REACCIÓN",
      m3_p: "IMAGÍNATE en una pista de hielo con patines. Tienes una caja pesada y la empujas con fuerza hacia adelante. ¿Qué pasa contigo? Sales disparado hacia atrás. **Por cada Fuerza que aplicas, el universo te devuelve una Fuerza exacta, pero en dirección contraria.**",
      btn_start: "ENTENDIDO, INICIAR MISIÓN"
    },
    tutor: {
      m1_idle: "Nave a la deriva. Sin fuerza externa, la Inercia nos mantendrá a velocidad constante. Usa propulsión inversa para detenerte.",
      m2_idle: "Asteroide detectado. Ajusta la Masa (m) y la Fuerza (F) para alcanzar la aceleración objetivo y evitar el impacto.",
      m3_idle: "Sin combustible. Usa la 3ra Ley: Eyecta la carga útil hacia atrás para generar una fuerza de reacción hacia adelante.",
      analyzing: "Congelación Táctica. Analizando vectores...",
      success: "¡PRECISIÓN ORBITAL! Los cálculos son correctos.",
      fail: "FALLO DE CONTENCIÓN. Iniciando análisis forense."
    },
    microClasses: {
      m1_fail: { h: "EXCESO DE INERCIA", p: "Creíste que la nave se detendría sola al soltar el propulsor. En el vacío, ΣF=0 significa velocidad constante. **Debes aplicar Fuerza opuesta sostenida para detenerte.**" },
      m2_fail: { h: "ECUACIÓN DESBALANCEADA", p: "Recuerda: a = F / m. Si aumentas mucho la masa, la aceleración cae. Si la masa es baja, un exceso de fuerza causa una aceleración incontrolable." },
      m3_fail: { h: "VECTORES OPUESTOS", p: "Si lanzas la masa hacia la derecha, la reacción te empuja a la izquierda. **Debes alinear tus vectores de acción y reacción correctamente.**" }
    },
    aiAnalysis: {
      m1: "LEY 1: Motor inactivo (F=0). Velocidad constante: {v} m/s. Aplica propulsión inversa sostenida para detenerte.",
      m2: "LEY 2: Fuerza = {F}N sobre {m}kg. Aceleración = {a} m/s². La relación F-m-a se cumple: a = F/m.",
      m3: "LEY 3: Eyectaste {m}kg con {F}N. Reacción: {F}N en dirección opuesta. La nave acelera {a} m/s² hacia la base."
    }
  },
  en: {
    ui: {
      title: "NEWTON PROTOCOL: ASTRO-DYNAMICS",
      target: "TARGET", dist: "DISTANCE", vel: "VEL (v)", acc: "ACC (a)", mass: "MASS (m)", force: "FORCE (F)",
      ignite: "APPLY FORCE", brake: "REVERSE THRUST", explain: "🧠 AI ANALYSIS",
      nextMission: "NEXT LAW", retry: "RECALIBRATE", close: "CLOSE",
      mission1: "LAW 1: INERTIA", mission2: "LAW 2: F = m·a", mission3: "LAW 3: ACTION/REACTION",
      telemetry: "VECTOR TELEMETRY", fmaGraph: "F-m-a RELATIONSHIP"
    },
    theory: {
      intro_title: "HOLOGRAPHIC ACADEMY: NEWTONIAN PHYSICS",
      intro_p: "Welcome, Commander. Before starting, your Socratic AI will teach you the fundamentals. Newton's Laws aren't memorization—they're **experience**. Each simulation is a lab where the universe reveals the rules to you.",
      m1_title: "FIRST LAW: INERTIA",
      m1_p: "IMAGINE floating in deep space and throwing your phone. No air, no gravity. That phone will travel in a straight line forever until it hits a star. That's Inertia. Objects are 'lazy': still means stay still; moving means keep moving. **You don't need force to maintain velocity—you need force to change it.**",
      m2_title: "SECOND LAW: F = m · a",
      m2_p: "IMAGINE kicking a soccer ball. It flies fast. Now kick a solid steel ball with the same force. You break your foot, and the ball barely moves. The universe has a strict rule: **greater Mass (m) requires more Force (F) for the same Acceleration (a).**",
      m3_title: "THIRD LAW: ACTION & REACTION",
      m3_p: "IMAGINE on an ice rink with skates. You push a heavy box forward with all your strength. What happens to you? You slide backward. **For every Force you apply, the universe applies an equal opposite Force to you.**",
      btn_start: "GOT IT, START MISSION"
    },
    tutor: {
      m1_idle: "Ship drifting. Without external force, Inertia keeps velocity constant. Use reverse thrust to stop.",
      m2_idle: "Asteroid detected. Adjust Mass (m) and Force (F) to reach target acceleration.",
      m3_idle: "Out of fuel. Use 3rd Law: Eject payload backward to generate forward reaction force.",
      analyzing: "Tactical Freeze. Analyzing vectors...",
      success: "ORBITAL PRECISION! Calculations are correct.",
      fail: "CONTAINMENT FAILURE. Initiating forensic analysis."
    },
    microClasses: {
      m1_fail: { h: "EXCESS INERTIA", p: "You thought the ship would stop when you released the thruster. In vacuum, ΣF=0 means constant velocity. **Apply sustained opposite Force to stop.**" },
      m2_fail: { h: "UNBALANCED EQUATION", p: "Remember: a = F / m. High mass kills acceleration. Low mass + high force causes uncontrollable acceleration." },
      m3_fail: { h: "OPPOSITE VECTORS", p: "If you throw mass right, the reaction pushes you left. **Align your action/reaction vectors correctly.**" }
    },
    aiAnalysis: {
      m1: "LAW 1: Engine off (F=0). Constant velocity: {v} m/s. Apply sustained reverse thrust to stop.",
      m2: "LAW 2: Force = {F}N on {m}kg. Acceleration = {a} m/s². The F-m-a relationship holds: a = F/m.",
      m3: "LAW 3: Ejected {m}kg with {F}N. Reaction: {F}N opposite direction. Ship accelerates {a} m/s² toward base."
    }
  }
};

/* ============================================================
   🎹 BINAURAL AUDIO KERNEL
=============================================== */
const CyberAudio = {
  ctx: null, initialized: false,
  unlock() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    this.initialized = true;
  },
  playOsc(freq, type, dur, vol) {
    if (!this.initialized || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch(e){}
  },
  click() { this.playOsc(800, 'square', 0.1, 0.05); },
  thrust() { this.playOsc(150, 'sawtooth', 0.3, 0.1); },
  brake() { this.playOsc(400, 'square', 0.3, 0.08); },
  success() { this.playOsc(523, 'triangle', 0.4, 0.1); setTimeout(() => this.playOsc(1046, 'triangle', 0.5, 0.1), 100); },
  fail() { this.playOsc(110, 'sawtooth', 0.8, 0.15); },
  eject() { this.playOsc(200, 'square', 0.2, 0.1); setTimeout(() => this.playOsc(100, 'sine', 0.4, 0.2), 100); }
};

/* ============================================================
   🧠 PHYSICS ENGINE & MISSION CONTROLLER (ZUSTAND O(1))
=============================================== */
const MAX_HISTORY = 300;

const usePhysicsStore = create((set, get) => ({
  missionId: 0,
  gameState: 'THEORY_INTRO',
  simTime: 0,
  language: 'es',

  ship: { pos: 0, vel: 0, acc: 0, mass: 1000 },
  asteroid: { pos: 30, vel: 0, acc: 0, mass: 5000 },
  payload: { pos: 0, vel: 0, active: false, mass: 100 },
  appliedForce: 0,
  history: { pos: new Float32Array(MAX_HISTORY), vel: new Float32Array(MAX_HISTORY), acc: new Float32Array(MAX_HISTORY), ptr: 0 },
  tutorMsg: "",
  microClassData: null,

  initTheoryIntro: (langUI) => {
    CyberAudio.unlock();
    set({
      missionId: 0,
      gameState: 'THEORY_INTRO',
      simTime: 0,
      tutorMsg: langUI.theory.intro_p,
      microClassData: null
    });
  },

  initMission: (id, langUI) => {
    CyberAudio.unlock();
    let initialShip = { pos: 0, vel: 0, acc: 0, mass: 1000 };
    let initialAsteroid = { pos: 30, vel: 0, acc: 0, mass: 5000 };
    let initialPayload = { pos: 0, vel: 0, active: false, mass: 100 };
    let msg = "";

    if (id === 1) {
      initialShip.vel = 20;
      msg = langUI.tutor.m1_idle;
    } else if (id === 2) {
      msg = langUI.tutor.m2_idle;
    } else if (id === 3) {
      msg = langUI.tutor.m3_idle;
    }

    set({
      missionId: id,
      gameState: 'PLAYING',
      simTime: 0,
      appliedForce: 0,
      tutorMsg: msg,
      microClassData: null,
      ship: initialShip,
      asteroid: initialAsteroid,
      payload: initialPayload,
      history: { pos: new Float32Array(MAX_HISTORY), vel: new Float32Array(MAX_HISTORY), acc: new Float32Array(MAX_HISTORY), ptr: 0 }
    });
  },

  setForce: (f) => set({ appliedForce: f }),
  setAsteroidMass: (m) => set(state => ({ asteroid: { ...state.asteroid, mass: m } })),
  setPayloadMass: (m) => set(state => ({ payload: { ...state.payload, mass: m } })),

  ejectPayload: () => {
    const state = get();
    if (state.missionId !== 3 || state.payload.active) return;
    CyberAudio.eject();
    const force = state.appliedForce;
    const payloadMass = state.payload.mass;
    const shipMass = state.ship.mass;

    const payloadAcc = -force / payloadMass;
    const shipAcc = force / shipMass;

    set(s => ({
      payload: { ...s.payload, active: true, acc: payloadAcc, pos: s.ship.pos },
      ship: { ...s.ship, acc: shipAcc }
    }));

    setTimeout(() => {
      set(s => ({
        payload: { ...s.payload, acc: 0 },
        ship: { ...s.ship, acc: 0 }
      }));
    }, 1000);
  },

  triggerAI: () => set({ gameState: 'AI_PAUSE' }),
  resumeGame: () => set({ gameState: 'PLAYING' }),

  step: (dt, langUI) => set(state => {
    if (state.gameState !== 'PLAYING') return state;

    let { ship, asteroid, payload, appliedForce, missionId, history, simTime } = state;
    let nextState = 'PLAYING';
    let microClass = null;

    // --- PHYSICS INTEGRATION ---
    if (missionId === 1) {
      ship.acc = appliedForce / ship.mass;
      ship.vel += ship.acc * dt;
      ship.pos += ship.vel * dt;

      if (Math.abs(ship.vel) <= 0.1) {
        ship.vel = 0; ship.acc = 0;
        nextState = 'SUCCESS'; CyberAudio.success();
      } else if (ship.pos > 1000 || ship.pos < -1000) {
        nextState = 'MICRO_CLASS'; CyberAudio.fail();
        microClass = langUI.microClasses.m1_fail;
      }
    }
    else if (missionId === 2) {
      asteroid.acc = appliedForce / asteroid.mass;
      asteroid.vel += asteroid.acc * dt;
      asteroid.pos += asteroid.vel * dt;

      const targetAcc = 5.0;
      if (Math.abs(asteroid.acc - targetAcc) < 0.2 && simTime > 1) {
        nextState = 'SUCCESS'; CyberAudio.success();
      } else if (simTime > 10) {
        nextState = 'MICRO_CLASS'; CyberAudio.fail();
        microClass = langUI.microClasses.m2_fail;
      }
    }
    else if (missionId === 3) {
      if (payload.active) {
        payload.vel += payload.acc * dt;
        payload.pos += payload.vel * dt;

        ship.vel += ship.acc * dt;
        ship.pos += ship.vel * dt;

        if (ship.pos >= 50 && ship.vel > 0) {
          nextState = 'SUCCESS'; CyberAudio.success();
        } else if (simTime > 10) {
          nextState = 'MICRO_CLASS'; CyberAudio.fail();
          microClass = langUI.microClasses.m3_fail;
        }
      }
    }

    // --- TELEMETRY BUFFER ---
    const ptr = history.ptr;
    const targetEntity = missionId === 2 ? asteroid : ship;
    history.pos[ptr] = targetEntity.pos;
    history.vel[ptr] = targetEntity.vel;
    history.acc[ptr] = targetEntity.acc;

    return {
      simTime: simTime + dt,
      ship: { ...ship },
      asteroid: { ...asteroid },
      payload: { ...payload },
      gameState: nextState,
      microClassData: microClass,
      history: { ...history, ptr: (ptr + 1) % MAX_HISTORY }
    };
  })
}));

/* ============================================================
   🧊 3D KERNEL (REACT THREE FIBER)
=============================================== */
function PhysicsEngine({ langUI }) {
  const step = usePhysicsStore(s => s.step);
  useFrame((_, dt) => step(Math.min(dt, 0.1), langUI));
  return null;
}

const VectorArrow = ({ from, to, color, label, visible = true }) => {
  const ref = useRef();
  const vecFrom = useMemo(() => new THREE.Vector3(), []);
  const vecTo = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!ref.current || !visible) { ref.current.visible = false; return; }
    vecFrom.set(...from);
    vecTo.set(...to);
    const length = vecFrom.distanceTo(vecTo);
    if (length < 0.1) { ref.current.visible = false; return; }

    ref.current.visible = true;
    dir.subVectors(vecTo, vecFrom).normalize();
    const shaft = ref.current.children[0];
    const head = ref.current.children[1];
    shaft.position.set(0, 0, length / 2);
    shaft.scale.set(1, length, 1);
    head.position.set(0, 0, length);
    head.rotation.set(0, 0, Math.atan2(dir.y, dir.x));
    ref.current.position.copy(vecFrom);
  });

  return (
    <group ref={ref}>
      <mesh><cylinderGeometry args={[0.1, 0.1, 1, 8]} /><meshBasicMaterial color={color} /></mesh>
      <mesh><coneGeometry args={[0.3, 0.8, 8]} /><meshBasicMaterial color={color} /></mesh>
      <Html position={[0, 0.8, 0]} center><div style={{ color, fontWeight: 'bold', textShadow: '0 0 5px #000', fontSize: '10px' }}>{label}</div></Html>
    </group>
  );
};

function DCL({ missionId }) {
  const { ship, asteroid, payload, appliedForce } = usePhysicsStore();
  const { camera } = useThree();

  useFrame(() => {
    if (missionId === 1) {
      camera.lookAt(ship.pos, 0, 0);
    } else if (missionId === 2) {
      camera.lookAt(asteroid.pos, 0, 0);
    } else if (missionId === 3) {
      camera.lookAt(ship.pos, 0, 0);
    }
  });

  if (missionId === 1) {
    return (
      <>
        <VectorArrow from={[0, 0, 0]} to={[ship.vel * 0.5, 0, 0]} color="#00ff88" label="v" />
        <VectorArrow from={[0, 0, 0]} to={[ship.acc * 0.5, 0, 0]} color="#ff0055" label="a" />
        <VectorArrow from={[0, 0, 0]} to={[appliedForce / 1000, 0, 0]} color="#ff00ff" label="F" />
      </>
    );
  } else if (missionId === 2) {
    return (
      <>
        <VectorArrow from={[asteroid.pos, 0, 0]} to={[asteroid.pos + asteroid.vel * 0.5, 0, 0]} color="#00ff88" label="v" />
        <VectorArrow from={[asteroid.pos, 0, 0]} to={[asteroid.pos + asteroid.acc * 0.5, 0, 0]} color="#ff0055" label="a" />
        <VectorArrow from={[asteroid.pos, 0, 0]} to={[asteroid.pos + appliedForce / 1000, 0, 0]} color="#ff00ff" label="F" />
      </>
    );
  } else if (missionId === 3) {
    return (
      <>
        <VectorArrow from={[ship.pos, 0, 0]} to={[ship.pos + ship.vel * 0.5, 0, 0]} color="#00ff88" label="v" />
        <VectorArrow from={[ship.pos, 0, 0]} to={[ship.pos + ship.acc * 0.5, 0, 0]} color="#ff0055" label="a" />
        {payload.active && (
          <>
            <VectorArrow from={[ship.pos, 0, 0]} to={[ship.pos + payload.vel * 0.5, 0, 0]} color="#ffff00" label="v_payload" />
            <VectorArrow from={[ship.pos, 0, 0]} to={[ship.pos - appliedForce / 500, 0, 0]} color="#0055ff" label="F_reaction" />
          </>
        )}
      </>
    );
  }
  return null;
}

function SceneEntities({ missionId }) {
  const { ship, asteroid, payload, appliedForce } = usePhysicsStore();
  const shipRef = useRef();
  const asteroidRef = useRef();
  const payloadRef = useRef();

  useFrame(() => {
    if (shipRef.current) shipRef.current.position.x = ship.pos;
    if (asteroidRef.current) asteroidRef.current.position.x = asteroid.pos;
    if (payloadRef.current) payloadRef.current.position.x = payload.pos;
  });

  return (
    <group>
      {/* Ship */}
      {(missionId === 1 || missionId === 3) && (
        <group ref={shipRef} position={[0, 0, 0]}>
          <mesh><boxGeometry args={[2, 1, 1]} /><meshStandardMaterial color="#0f172a" metalness={0.8} /></mesh>
          <mesh position={[0, 0.7, 0]}><boxGeometry args={[1, 0.3, 0.8]} /><meshStandardMaterial color="#00f2ff" transparent opacity={0.7} /></mesh>
          {appliedForce !== 0 && missionId === 1 && (
            <Sparkles position={[Math.sign(appliedForce) * 1.5, 0, 0]} count={30} color="#ff0055" scale={1.5} speed={3} />
          )}
        </group>
      )}

      {/* Asteroid */}
      {missionId === 2 && (
        <group ref={asteroidRef} position={[30, 0, 0]}>
          <mesh><icosahedronGeometry args={[1 + (asteroid.mass/8000), 2]} /><meshStandardMaterial color="#555" roughness={0.9} /></mesh>
        </group>
      )}

      {/* Payload */}
      {missionId === 3 && payload.active && (
        <group ref={payloadRef} position={[ship.pos, 0, 0]}>
          <mesh><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#ffaa00" /></mesh>
        </group>
      )}

      <DCL missionId={missionId} />
    </group>
  );
}

function CinematicCamera({ missionId }) {
  const { ship, asteroid } = usePhysicsStore();
  useFrame(({ camera }) => {
    const targetX = missionId === 2 ? asteroid.pos : ship.pos;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX + 10, 0.05);
    camera.lookAt(targetX, 0, 0);
  });
  return null;
}

/* ============================================================
   📊 HUD & UI GRAPHICS
=============================================== */
function FmaGraph({ color }) {
  const canvasRef = useRef();
  const { appliedForce, asteroid } = usePhysicsStore();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,200,100);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;

    // Draw F=ma curve
    ctx.beginPath();
    for(let f=0; f<=20000; f+=500) {
      const a = f / asteroid.mass;
      const x = (f / 20000) * 200;
      const y = 100 - (a / 10) * 100;
      if(f===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();

    // Current point
    const currA = appliedForce / asteroid.mass;
    const px = (appliedForce / 20000) * 200;
    const py = 100 - (currA / 10) * 100;

    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(px, py, 6, 0, Math.PI*2);
    ctx.fill();

    // Target line
    const targetY = 100 - (5 / 10) * 100;
    ctx.beginPath();
    ctx.strokeStyle = '#0f0';
    ctx.setLineDash([5,5]);
    ctx.moveTo(0, targetY);
    ctx.lineTo(200, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [appliedForce, asteroid.mass, color]);

  return (
    <div style={{ background: 'rgba(2,6,23,0.9)', padding: '10px', borderRadius: '12px', border: `1px solid ${color}40`, width: '200px' }}>
      <div style={{ fontSize: '10px', color, fontWeight: 'bold' }}>F-m-a (Meta: a=5m/s²)</div>
      <canvas ref={canvasRef} width={200} height={100} style={{ width: '100%' }} />
    </div>
  );
}

function TelemetryGraph({ label, type, color, maxVal }) {
  const canvasRef = useRef();
  const { history } = usePhysicsStore();

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,200,50);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const ptr = history.ptr;
    const data = history[type];

    for (let i = 0; i < MAX_HISTORY; i++) {
      const val = data[(ptr + i) % MAX_HISTORY];
      const x = (i / MAX_HISTORY) * 200;
      const bounded = Math.max(-maxVal, Math.min(val, maxVal));
      const y = 25 - (bounded / maxVal) * 25;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [history.ptr, type, color, maxVal]);

  return (
    <div style={{ background: 'rgba(2,6,23,0.9)', padding: '10px', borderRadius: '12px', border: `1px solid ${color}40`, width: '200px' }}>
      <div style={{ fontSize: '10px', color, fontWeight: 'bold' }}>{label}</div>
      <canvas ref={canvasRef} width={200} height={50} style={{ width: '100%' }} />
    </div>
  );
}

/* ============================================================
   🎮 MAIN APPLICATION
=============================================== */
export default function CinematicaViz() {
  const language = useGameStore(s => s.language) || 'es';
  const t = useMemo(() => LEXICON[language] || LEXICON['es'], [language]);
  const store = usePhysicsStore();
  const { missionId, gameState, simTime, tutorMsg, microClassData, ship, asteroid, payload, appliedForce } = store;
  const resetApp = useGameStore(s => s.resetProgress);

  // Keyboard controls
  useEffect(() => {
    const down = (e) => {
      if(gameState !== 'PLAYING') return;
      if(missionId === 1 && e.code === 'Space') { store.setForce(-5000); CyberAudio.brake(); }
    };
    const up = (e) => { if(e.code === 'Space') store.setForce(0); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); }
  }, [gameState, missionId, store]);

  const AnalysisModal = () => {
    let eq = ""; let exp = "";
    const m = missionId === 1 ? ship : missionId === 2 ? asteroid : store.payload;
    const a = missionId === 1 ? ship.acc : missionId === 2 ? asteroid.acc : ship.acc;

    if (missionId === 1) {
      eq = `F_{freno} = ${appliedForce}N \\Rightarrow a = ${a.toFixed(2)} m/s²`;
      exp = t.aiAnalysis.m1.replace('{v}', ship.vel.toFixed(1));
    } else if (missionId === 2) {
      eq = `a = \\frac{F}{m} = \\frac{${appliedForce}N}{${asteroid.mass}kg} = ${a.toFixed(2)} m/s²`;
      exp = t.aiAnalysis.m2.replace('{F}', appliedForce).replace('{m}', asteroid.mass).replace('{a}', a.toFixed(2));
    } else {
      eq = `F_{accion} = -F_{reaccion} \\Rightarrow m_1 a_1 = -m_2 a_2`;
      exp = t.aiAnalysis.m3.replace('{F}', appliedForce).replace('{m}', payload.mass).replace('{a}', a.toFixed(2));
    }

    return (
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
        <div style={{ maxWidth: '600px', background: '#020617', padding: '40px', borderRadius: '24px', border: `2px solid #00f2ff`, textAlign: 'center' }}>
          <i className="fas fa-brain fa-4x" style={{ color: '#00f2ff', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#00f2ff', fontSize: '1.5rem', marginBottom: '20px' }}>DIAGRAMA DE CUERPO LIBRE</h2>
          <div style={{ background: '#111', padding: '20px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '1.2rem', color: '#ffea00', marginBottom: '20px' }}>
            {eq}
          </div>
          <p style={{ color: '#fff', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>{exp}</p>
          <button onClick={() => { CyberAudio.click(); store.resumeGame(); }} style={{ width: '100%', padding: '20px', background: '#00f2ff', color: '#000', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
            VOLVER A LA SIMULACIÓN
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010205', color: '#fff', fontFamily: "'Orbitron', sans-serif", userSelect: 'none', touchAction: 'none' }}>
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 5, 30], fov: 45 }}>
        <Suspense fallback={null}>
          <PhysicsEngine langUI={t} />
          <CinematicCamera missionId={missionId} />
          <SceneEntities missionId={missionId} />
          <Grid args={[500, 500]} sectionColor="#8b5cf6" cellColor="#00f2ff" infiniteGrid fadeDistance={100} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 15, 10]} intensity={2} color="#fff" />
          <Stars count={2000} />
        </Suspense>
        <EffectComposer disableNormalPass><Bloom intensity={1.5} /><Vignette darkness={0.6} /></EffectComposer>
      </Canvas>

      {/* Theory Intro */}
      {gameState === 'THEORY_INTRO' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ maxWidth: '600px', width: '100%', padding: '40px', border: '1px solid #00f2ff', borderRadius: '24px', background: '#020617', textAlign: 'center' }}>
            <h2 style={{ color: '#00f2ff', fontSize: '1.8rem', marginBottom: '20px' }}>{t.theory.intro_title}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.8', fontSize: '1.1rem', marginBottom: '30px' }}>{t.theory.intro_p}</p>
            <button onClick={() => { CyberAudio.click(); store.initMission(1, t); }} style={{ width: '100%', padding: '20px', background: '#00f2ff', color: '#000', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
              {t.theory.btn_start}
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Modal */}
      {gameState === 'AI_PAUSE' && <AnalysisModal />}

      {/* HUD */}
      {(gameState === 'PLAYING' || gameState === 'AI_PAUSE') && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(15,23,42,0.9)', padding: '15px', borderRadius: '12px', border: '1px solid #00f2ff', display: 'flex', gap: '20px' }}>
              <div><div style={{ fontSize: '10px', color: '#00f2ff' }}>MISIÓN</div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>LEY {missionId}</div></div>
              <div><div style={{ fontSize: '10px', color: '#00f2ff' }}>TIEMPO</div><div style={{ fontSize: '16px', fontWeight: 'bold' }}>{simTime.toFixed(1)}s</div></div>
            </div>
          </div>

          {/* Telemetry Graphs */}
          <div style={{ display: 'flex', gap: '10px', maxWidth: '600px', alignSelf: 'flex-start' }}>
            <TelemetryGraph label={t.ui.vel} type="vel" color="#00ff88" maxVal={30} />
            <TelemetryGraph label={t.ui.acc} type="acc" color="#ff0055" maxVal={10} />
            {missionId === 2 && <FmaGraph color="#ffaa00" />}
          </div>

          {/* Controls */}
          <div style={{ pointerEvents: 'auto', background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '16px', border: '1px solid #333', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ color: '#ffea00', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}><i className="fas fa-robot me-2"></i>{tutorMsg}</div>

            {missionId === 1 && (
              <button onPointerDown={() => { store.setForce(-5000); CyberAudio.brake(); }} onPointerUp={() => store.setForce(0)} onPointerLeave={() => store.setForce(0)} style={{ width: '100%', padding: '30px', background: 'linear-gradient(180deg, #ff005540, #990033)', border: '2px solid #ff0055', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold', borderRadius: '12px', touchAction: 'none' }}>
                {t.ui.brake} (Mantener)
              </button>
            )}

            {missionId === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00f2ff', fontSize: '12px' }}><span>{t.ui.mass}</span><span>{asteroid.mass} kg</span></div>
                  <input type="range" min="500" max="10000" step="500" value={asteroid.mass} onChange={(e) => store.setAsteroidMass(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff0055', fontSize: '12px' }}><span>{t.ui.force}</span><span>{appliedForce} N</span></div>
                  <input type="range" min="0" max="20000" step="1000" value={appliedForce} onChange={(e) => store.setForce(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
              </div>
            )}

            {missionId === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ffaa00', fontSize: '12px' }}><span>MASA DEL LASTRE</span><span>{payload.mass} kg</span></div>
                  <input type="range" min="10" max="500" step="10" value={payload.mass} onChange={(e) => store.setPayloadMass(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0055ff', fontSize: '12px' }}><span>FUERZA DE EYECCIÓN</span><span>{appliedForce} N</span></div>
                  <input type="range" min="1000" max="20000" step="1000" value={appliedForce} onChange={(e) => store.setForce(Number(e.target.value))} style={{ width: '100%' }} />
                </div>
                <button onClick={store.ejectPayload} disabled={payload.active} style={{ padding: '20px', background: payload.active ? '#333' : '#0055ff', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>EYECTAR CARGA</button>
              </div>
            )}

            <button onClick={store.triggerAI} style={{ width: '100%', padding: '15px', marginTop: '15px', background: 'rgba(255,234,0,0.1)', border: '1px solid #ffea00', color: '#ffea00', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {t.ui.explain}
            </button>
            <button onClick={() => store.initMission(missionId < 3 ? missionId + 1 : 1, t)} style={{ width: '100%', padding: '15px', marginTop: '10px', background: 'rgba(0,242,255,0.1)', border: '1px solid #00f2ff', color: '#00f2ff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {missionId < 3 ? t.ui.nextMission : "REINICIAR"}
            </button>
            <button onClick={resetApp} style={{ width: '100%', padding: '15px', marginTop: '10px', background: 'rgba(255,0,85,0.1)', border: '1px solid #ff0055', color: '#ff0055', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              SALIR
            </button>
          </div>
        </div>
      )}

      {/* Micro-Class */}
      {gameState === 'MICRO_CLASS' && microClassData && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ padding: '40px', border: `2px solid #ff0055`, borderRadius: '24px', background: '#0f172a', maxWidth: '600px', width: '100%' }}>
            <div style={{ color: '#ffea00', fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '20px', textAlign: 'center' }}><i className="fas fa-chalkboard-teacher me-2"></i> ANÁLISIS FORENSE</div>
            <h2 style={{ color: '#ff0055', fontSize: '1.8rem', margin: '0 0 20px 0', textAlign: 'center' }}>{microClassData.h}</h2>
            <div style={{ background: 'rgba(255,0,85,0.1)', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ff0055', marginBottom: '25px' }}>
              <p style={{ fontSize: '1.2rem', margin: 0, color: '#fff', lineHeight: '1.6' }}>{microClassData.p}</p>
            </div>
            <button onClick={() => store.initMission(missionId, t)} style={{ width: '100%', padding: '20px', background: '#ff0055', color: '#fff', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' }}>
              {t.ui.retry}
            </button>
          </div>
        </div>
      )}

      {/* Success */}
      {gameState === 'SUCCESS' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ padding: '50px', border: `2px solid #00ff88`, borderRadius: '24px', textAlign: 'center', background: '#0f172a', maxWidth: '500px', width: '100%', boxShadow: `0 0 80px #00ff8840` }}>
            <i className="fas fa-check-circle fa-5x" style={{ color: '#00ff88', marginBottom: '25px' }}></i>
            <h2 style={{ color: '#00ff88', fontSize: '2rem', margin: '0 0 20px 0' }}>{t.tutor.success}</h2>
            <button onClick={() => store.initMission(missionId < 3 ? missionId + 1 : 1, t)} style={{ width: '100%', padding: '20px', background: `#00ff88`, color: '#000', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' }}>
              {missionId < 3 ? t.ui.nextMission : "REINICIAR ENTRENAMIENTO"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}