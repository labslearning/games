import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { create } from 'zustand';

// 🟢 INTEGRACIÓN KERNEL: Hub Principal
import { useGameStore } from '../../store/useGameStore'; 

// 🟢 KERNEL 3D: React Three Fiber & Drei (High-Performance Engine)
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Html, Text, Stars } from '@react-three/drei';

// 🟢 POSTPROCESADO: Inmersión Visual Ciberpunk
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/* ============================================================
   🌍 I18N: ENCICLOPEDIA CINEMÁTICA MULTI-IDIOMA GOD-TIER
   Español, Inglés, Francés y Alemán (Traducciones Pedagógicas)
============================================================ */
const LEXICON = {
  es: {
    hud: { target: "META", dist: "DISTANCIA", pos: "POS x(t)", vel: "VEL v(t)", acc: "ACC a(t)", time: "TIEMPO", mission: "MISIÓN", score: "PUNTOS", streak: "RACHA", slope: "PENDIENTE", live: "EN VIVO" },
    controls: { accel: "ACELERAR [↑]", decel: "RETENER [←]", brake: "FRENAR [↓]", jump: "SALTAR [ESP]" },
    analysis: { success: "TELEMETRÍA PERFECTA.", failed: "ANÁLISIS FORENSE", retry: "REINICIAR SECUENCIA", next: "SIGUIENTE SALTO", encyclopedia: "📚 REPASAR CONCEPTOS", exit: "SALIR" },
    tutor: {
      title: "TUTOR IA SOCRÁTICO",
      idle: "Sistemas en línea. Gravedad: 9.81 m/s². Calcula tu inercia y fricción. Salta los obstáculos holográficos rojos.",
      accel: "Propulsión máxima. Incrementando rapidez y distancia recorrida exponencialmente.",
      decel: "Desaceleración (Freno de Motor). Útil para control fino en pendientes y evitar deslizamientos.",
      brake: "Frenado magnético. Disipando energía cinética masiva de forma instantánea.",
      jump: "¡Tiro Parabólico! La gravedad (9.81) tira de ti hacia abajo. Al no tocar el suelo, la Normal y Fricción desaparecen.",
      optimal: "¡ZONA CRÍTICA! Mantén la presión de frenado para detener el vehículo exactamente en la coordenada.",
      danger: "¡VELOCIDAD TERMINAL! La inercia supera la fuerza de fricción. Riesgo de impacto inminente.",
      sandbox: "META SUPERADA. Has roto la barrera. El terreno y los obstáculos se generarán infinitamente.",
      stop_good: "Vector velocidad = 0 m/s. Estabilización gravitacional lograda."
    },
    encyclopedia: {
      title: "ENCICLOPEDIA CINEMÁTICA GOD-TIER",
      topics: [
        { id: 'gravedad', name: '🌍 Gravedad (9.81 m/s²)', content: "La gravedad es la aceleración con la que la Tierra tira de todos los objetos hacia su centro. Su valor promedio es de 9.81 m/s².\n\n🧠 Imagina que... tienes una cuerda elástica invisible atada a tu cintura y al centro del planeta. Si saltas, la cuerda te jala de regreso. En una pendiente, esta misma cuerda te hace 'resbalar' hacia abajo." },
        { id: 'velocidad', name: '🚀 Rapidez vs Velocidad', content: "La 'Rapidez' es solo un número (ej. 100 km/h). La 'Velocidad' es un VECTOR: es la rapidez MÁS una dirección.\n\n🧠 Imagina que... le dices a un amigo 'Corre a 20 km/h'. Él te preguntará '¿Hacia dónde?'. La rapidez es el velocímetro. La velocidad es el velocímetro + una brújula. (Flecha Verde)." },
        { id: 'aceleracion', name: '⏩ Aceleración', content: "La aceleración es el ritmo al que cambia tu velocidad. Si tu velocidad no cambia, tu aceleración es CERO.\n\n🧠 Imagina que... la velocidad es tu cuenta bancaria y la aceleración es tu sueldo mensual. Si tienes aceleración positiva, ganas dinero cada segundo (vas más rápido). Si es negativa, gastas dinero." },
        { id: 'friccion', name: '🔥 Fricción y Fuerza Normal', content: "La Fricción es el roce entre las llantas y el suelo. Depende de la Fuerza Normal (qué tan duro el suelo empuja hacia arriba para soportar tu peso).\n\n🧠 Imagina que... intentas deslizar un libro sobre una mesa. Es fácil. Ahora imagina que alguien presiona el libro hacia abajo (Fuerza Normal) e intentas deslizarlo. ¡Es mucho más difícil! Cuando saltas en el juego, la Normal es cero, por lo tanto, ¡no hay fricción en el aire!" },
        { id: 'mrua', name: '📈 M.R.U.A.', content: "Movimiento Rectilíneo Uniformemente Acelerado. Ocurre cuando tu aceleración es constante. \n\nEcuación principal: v = v₀ + a·t\n\n🧠 Imagina que... dejas caer una piedra desde un edificio. Cada segundo que pasa, la gravedad le suma 9.8 m/s a su velocidad. En el segundo 1 va a 9.8, en el segundo 2 va a 19.6... ¡Eso es MRUA puro!" }
      ]
    },
    theory: { t: "ACADEMIA DE CINEMÁTICA", p1_h: "BIENVENIDO AL SIMULADOR", p1_p: "En este entorno, dominarás la física. Tu objetivo es cruzar kilómetros de terreno procedural infinito, saltar obstáculos balísticamente y detenerte EXACTAMENTE sobre la meta azul. Accede a la Enciclopedia para repasar.", btn_start: "INICIAR DESPLIEGUE TÁCTICO" },
    microClasses: { overshoot: { h: "EXCESO DE INERCIA", p: "Frenaste muy tarde. Con g = 9.81 m/s² empujando cuesta abajo, tu distancia de frenado creció drásticamente." }, undershoot: { h: "COLAPSO GRAVITACIONAL", p: "Te detuviste antes. La componente de la gravedad (-g·sin(θ)) te frenó en la pendiente." } }
  },
  en: {
    hud: { target: "TARGET", dist: "DISTANCE", pos: "POS x(t)", vel: "VEL v(t)", acc: "ACC a(t)", time: "TIME", mission: "MISSION", score: "SCORE", streak: "STREAK", slope: "SLOPE", live: "LIVE" },
    controls: { accel: "ACCEL [↑]", decel: "DECEL [←]", brake: "BRAKE [↓]", jump: "JUMP [SPACE]" },
    analysis: { success: "PERFECT TELEMETRY.", failed: "FORENSIC ANALYSIS", retry: "RESTART SEQUENCE", next: "INITIATE NEXT JUMP", encyclopedia: "📚 REVIEW CONCEPTS", exit: "EXIT" },
    tutor: {
      title: "SOCRATIC AI TUTOR",
      idle: "Systems online. Earth gravity: 9.81 m/s². Calculate inertia and friction. Jump over red holographic obstacles.",
      accel: "Maximum propulsion. Exponentially increasing speed and distance traveled.",
      decel: "Engine braking active. Useful for fine control on slopes to prevent backward sliding.",
      brake: "Magnetic braking. Dissipating massive kinetic energy instantly.",
      jump: "Ballistic Jump! Gravity (9.81) pulls you down. Normal Force and Friction are zero in the air.",
      optimal: "CRITICAL ZONE! Maintain braking pressure to stop the vehicle exactly at the coordinate.",
      danger: "TERMINAL VELOCITY! Inertia exceeds friction. Imminent impact risk.",
      sandbox: "TARGET EXCEEDED. Barrier broken. Infinite procedural terrain enabled.",
      stop_good: "Velocity vector = 0 m/s. Gravitational stabilization achieved."
    },
    encyclopedia: {
      title: "GOD-TIER KINEMATICS ENCYCLOPEDIA",
      topics: [
        { id: 'gravedad', name: '🌍 Gravity (9.81 m/s²)', content: "Gravity is the acceleration by which Earth pulls objects. Average is 9.81 m/s².\n\n🧠 Imagine... an invisible bungee cord tied to the planet's core. If you jump, it snaps you back. On a slope, it makes you slide downward." },
        { id: 'velocidad', name: '🚀 Speed vs Velocity', content: "Speed is just a number. Velocity is a VECTOR: speed PLUS direction.\n\n🧠 Imagine... running at 20 mph. Your friend asks 'Where to?'. Speed is the speedometer. Velocity is speedometer + compass." },
        { id: 'aceleracion', name: '⏩ Acceleration', content: "Acceleration is the rate your velocity changes.\n\n🧠 Imagine... velocity is your bank account and acceleration is your salary. Positive acceleration means income every second. Negative means spending." },
        { id: 'friccion', name: '🔥 Friction & Normal Force', content: "Friction depends on Normal Force (how hard the ground pushes up).\n\n🧠 Imagine... sliding a book. Easy. Now press it down (Normal Force) and try. Hard! When you jump, Normal is zero, so friction is zero!" },
        { id: 'mrua', name: '📈 U.A.R.M.', content: "Uniformly Accelerated Rectilinear Motion. Equation: v = v₀ + a·t\n\n🧠 Imagine... dropping a stone. Every second, gravity adds 9.8 m/s to its speed. Second 1: 9.8, Second 2: 19.6... Pure UARM!" }
      ]
    },
    theory: { t: "KINEMATICS ACADEMY", p1_h: "WELCOME TO THE SIMULATOR", p1_p: "Master infinite procedural terrain, clear obstacles via ballistic jumps, and stop EXACTLY on the blue extraction zone.", btn_start: "INITIATE DEPLOYMENT" },
    microClasses: { overshoot: { h: "INERTIA OVERLOAD", p: "Braked too late. With g = 9.81 m/s² pushing downhill, your braking distance spiked." }, undershoot: { h: "GRAVITATIONAL COLLAPSE", p: "Stopped early. Gravity pulled you back. Keep the engine engaged on slopes." } }
  },
  fr: {
    hud: { target: "CIBLE", dist: "DISTANCE", pos: "POS x(t)", vel: "VIT v(t)", acc: "ACC a(t)", time: "TEMPS", mission: "NIVEAU", score: "POINTS", streak: "SÉRIE", slope: "PENTE", live: "EN DIRECT" },
    controls: { accel: "ACCÉLÉRER", decel: "RALENTIR", brake: "FREINER", jump: "SAUTER" },
    analysis: { success: "TÉLÉMÉTRIE PARFAITE.", failed: "ANALYSE LÉGALE", retry: "REDÉMARRER", next: "SAUT SUIVANT", encyclopedia: "📚 RÉVISER LES CONCEPTS", exit: "QUITTER" },
    tutor: {
      title: "TUTEUR IA SOCRATIQUE",
      idle: "Gravité terrestre : 9,81 m/s². Calculez l'inertie et la friction. Sautez les obstacles.",
      accel: "Propulsion maximale. Augmentation exponentielle de la vitesse.",
      decel: "Frein moteur. Utile sur les pentes pour éviter de reculer.",
      brake: "Freinage d'urgence. Dissipation instantanée de l'énergie.",
      jump: "Saut balistique ! La gravité (9.81) vous attire vers le bas. Frottement = 0 dans l'air.",
      optimal: "ZONE CRITIQUE ! Maintenez le freinage pour vous arrêter exactement sur la cible.",
      danger: "VITESSE TERMINALE ! L'inertie dépasse la friction. Impact imminent.",
      sandbox: "CIBLE DÉPASSÉE. Génération de terrain infini activée.",
      stop_good: "Vitesse = 0 m/s. Stabilisation réussie."
    },
    encyclopedia: {
      title: "ENCYCLOPÉDIE DE CINÉMATIQUE",
      topics: [
        { id: 'gravedad', name: '🌍 Gravité (9.81 m/s²)', content: "La gravité attire les corps vers le centre de la Terre.\n\n🧠 Imaginez... une corde élastique vous reliant au centre de la planète. Si vous sautez, elle vous ramène au sol." },
        { id: 'velocidad', name: '🚀 Vitesse (scalaire vs vecteur)', content: "La vitesse scalaire n'a pas de direction. Le vecteur vitesse en a une.\n\n🧠 Imaginez... le compteur de vitesse (scalaire) et une boussole (direction). Ensemble, ils forment le vecteur vitesse (flèche verte)." },
        { id: 'aceleracion', name: '⏩ Accélération', content: "C'est le taux de variation de la vitesse.\n\n🧠 Imaginez... la vitesse est votre compte en banque, l'accélération est votre salaire. Une accélération positive enrichit votre vitesse chaque seconde." },
        { id: 'friccion', name: '🔥 Frottement', content: "Dépend de la force normale (la pression sur le sol).\n\n🧠 Imaginez... glisser un livre tout en appuyant dessus. C'est difficile ! En l'air (saut), la force normale est nulle, donc aucun frottement." },
        { id: 'mrua', name: '📈 M.R.U.A.', content: "Mouvement Rectiligne Uniformément Accéléré.\n\n🧠 Imaginez... une pierre en chute libre gagne 9.8 m/s de vitesse à chaque seconde. C'est le MRUA !" }
      ]
    },
    theory: { t: "ACADÉMIE DE CINÉMATIQUE", p1_h: "BIENVENUE", p1_p: "Maîtrisez la physique. Franchissez des kilomètres de terrain procédural infini et arrêtez-vous sur la cible bleue.", btn_start: "DÉPLOIEMENT TACTIQUE" },
    microClasses: { overshoot: { h: "EXCÈS D'INERTIE", p: "Freinage trop tardif. La gravité a augmenté votre distance de freinage." }, undershoot: { h: "EFFONDREMENT GRAVITATIONNEL", p: "La gravité vous a ralenti sur la pente. Maintenez l'accélération." } }
  },
  de: {
    hud: { target: "ZIEL", dist: "DISTANZ", pos: "POS x(t)", vel: "GESCHW. v(t)", acc: "BESCHL. a(t)", time: "ZEIT", mission: "MISSION", score: "PUNKTE", streak: "SERIE", slope: "NEIGUNG", live: "LIVE" },
    controls: { accel: "BESCHLEUNIGEN", decel: "VERZÖGERN", brake: "BREMSEN", jump: "SPRINGEN" },
    analysis: { success: "PERFEKTE TELEMETRIE.", failed: "FEHLERANALYSE", retry: "NEUSTART", next: "NÄCHSTES LEVEL", encyclopedia: "📚 KONZEPTE ÜBERPRÜFEN", exit: "BEENDEN" },
    tutor: {
      title: "SOKRATISCHE KI",
      idle: "Schwerkraft: 9,81 m/s². Berechne Trägheit und Reibung. Springe über Hindernisse.",
      accel: "Maximale Schubkraft. Die Geschwindigkeit steigt exponentiell.",
      decel: "Motorbremse. Nützlich an Steigungen gegen Zurückrollen.",
      brake: "Magnetbremse. Kinetische Energie wird sofort abgebaut.",
      jump: "Ballistischer Sprung! Die Schwerkraft (9.81) zieht dich nach unten. Keine Reibung in der Luft.",
      optimal: "KRITISCHE ZONE! Bremsdruck aufrechterhalten, um auf der Zielkoordinate zu halten.",
      danger: "ENDGESCHWINDIGKEIT! Trägheit übersteigt Reibung. Aufprall droht.",
      sandbox: "ZIEL VERPASST. Unendliches prozedurales Terrain aktiviert.",
      stop_good: "Geschwindigkeitsvektor = 0. Gravitative Stabilisierung erfolgreich."
    },
    encyclopedia: {
      title: "KINEMATIK ENZYKLOPÄDIE",
      topics: [
        { id: 'gravedad', name: '🌍 Schwerkraft (9.81)', content: "Schwerkraft zieht Objekte ins Erdzentrum.\n\n🧠 Stell dir vor... ein unsichtbares Bungee-Seil ist am Erdkern befestigt. Wenn du springst, zieht es dich gnadenlos zurück." },
        { id: 'velocidad', name: '🚀 Tempo vs Geschwindigkeit', content: "Tempo ist eine Zahl, Geschwindigkeit ist ein VEKTOR (Tempo + Richtung).\n\n🧠 Tempo ist der Tacho im Auto. Geschwindigkeit (grüner Pfeil) ist Tacho plus Kompass." },
        { id: 'aceleracion', name: '⏩ Beschleunigung', content: "Die Rate, mit der sich Geschwindigkeit ändert.\n\n🧠 Stell dir vor... Geschwindigkeit ist dein Bankkonto, Beschleunigung ist dein Gehalt. Positive Beschleunigung bringt dir jede Sekunde mehr Tempo." },
        { id: 'friccion', name: '🔥 Reibung', content: "Reibung hängt von der Normalkraft ab (Druck auf den Boden).\n\n🧠 Stell dir vor... du schiebst ein Buch, während jemand stark von oben drückt. Sehr schwer! Beim Springen ist der Druck null, also null Reibung." },
        { id: 'mrua', name: '📈 Gleichmäßig beschleunigte Bewegung', content: "Wenn Beschleunigung konstant bleibt.\n\n🧠 Ein fallender Stein wird jede Sekunde um 9.8 m/s schneller. Das ist die pure Kinematik!" }
      ]
    },
    theory: { t: "KINEMATIK AKADEMIE", p1_h: "WILLKOMMEN", p1_p: "Meistere die Physik auf unendlichem Terrain. Springe über Hindernisse und halte exakt auf der blauen Zielmarkierung.", btn_start: "MISSION STARTEN" },
    microClasses: { overshoot: { h: "ZU VIEL TRÄGHEIT", p: "Zu spät gebremst. Die Schwerkraft hangabwärts hat den Bremsweg extrem verlängert." }, undershoot: { h: "GRAVITATIONSKOLLAPS", p: "Zu früh gehalten. Die Steigung hat dich zurückgezogen. Motor länger laufen lassen!" } }
  }
};

/* ============================================================
   🎹 KERNEL DE AUDIO MATEMÁTICO AVANZADO
============================================================ */
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
  play(freq, type, dur, vol, sweep = 0) {
    if (!this.initialized || !this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type; 
      
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (sweep !== 0) { // Frequency modulation para efecto orgánico (ej. salto)
          osc.frequency.exponentialRampToValueAtTime(freq * sweep, this.ctx.currentTime + dur);
      }

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  },
  click() { this.play(880, 'square', 0.1, 0.05); },
  // Salto matemático: Sube la frecuencia bruscamente para dar sensación de despegue
  jump() { this.play(250, 'sine', 0.5, 0.2, 3.0); }, 
  // Crash matemático: Ruido grave diente de sierra cayendo
  crash() { this.play(120, 'sawtooth', 0.6, 0.4, 0.5); },
  success() { this.play(523.25, 'triangle', 0.4, 0.1); setTimeout(() => this.play(1046.5, 'triangle', 0.5, 0.1), 100); setTimeout(() => this.play(2093, 'triangle', 0.6, 0.1), 200); },
  warn() { this.play(300, 'square', 0.3, 0.05); }
};

/* ============================================================
   🧠 ESTADO FÍSICO Y GENERACIÓN PROCEDURAL TIPO T-REX (INFINITO)
============================================================ */
const MAX_HISTORY = 400; 
const TARGET_MARGIN = 8.0; 
const ENGINE_FORCE = 80.0;  // Hiper Aceleración para misiones de kilómetros
const DECEL_FORCE = -20.0;  // Retención
const BRAKE_FORCE = -120.0; // Freno magnético
// 🟢 FIX GOD-TIER: Salto 20% > 3m (Obstáculo). h = v^2/2g -> 3.6 = v^2/19.62 -> v = 8.4
const JUMP_IMPULSE = 8.40;  
const DRAG = 0.01;          
const GRAVITY = 9.81;       
const MU_K = 0.4;           

const getTopology = (level) => ({ 
    A: 10 + (level * 5) + Math.random() * 20, 
    B: 60 + Math.random() * 40                
});

// Función inicial para poblar los primeros obstáculos
const getInitialObstacles = (targetPos) => {
    const obs = [];
    let currentX = 150;
    while (currentX < targetPos + 1000) { 
        obs.push(currentX);
        currentX += 120 + Math.random() * 150; 
    }
    return obs;
};

const usePhysicsStore = create((set, get) => ({
  missionLevel: 1, score: 0, streak: 0,
  gameState: 'THEORY', 
  
  targetPos: 400, targetMargin: TARGET_MARGIN,
  topology: { A: 10, B: 60 },
  obstacles: [],
  sandboxMode: false,

  simTime: 0, tutorHint: "Sistemas en línea...", analysisData: null, microClassData: null,
  car: { pos: 0, vel: 0, acc: 0, y: 0, theta: 0, totalAcc: 0, gravityAcc: 0, normalForce: 0, frictionForce: 0, maxVel: 0, velY: 0, jumpY: 0, isJumping: false },
  
  historyPos: new Float32Array(MAX_HISTORY),
  historyVel: new Float32Array(MAX_HISTORY),
  historyAcc: new Float32Array(MAX_HISTORY),
  historyPtr: 0,

  setGameState: (s) => set({ gameState: s }),
  
  initLevel: (isRetry = false) => {
    CyberAudio.unlock();
    set((state) => {
      const newLevel = isRetry ? state.missionLevel : state.missionLevel + 1;
      const newStreak = isRetry ? 0 : state.streak;
      const newTarget = 400 + (newLevel * 250) + Math.floor(Math.random() * 200); 
      
      state.historyPos.fill(0); state.historyVel.fill(0); state.historyAcc.fill(0);

      return {
        gameState: 'PLAYING', simTime: 0, targetPos: newTarget, topology: getTopology(newLevel), obstacles: getInitialObstacles(newTarget),
        missionLevel: newLevel, streak: newStreak, sandboxMode: false, analysisData: null, microClassData: null,
        car: { pos: 0, vel: 0, acc: 0, y: 0, theta: 0, totalAcc: 0, gravityAcc: 0, normalForce: 0, frictionForce: 0, maxVel: 0, velY: 0, jumpY: 0, isJumping: false }, historyPtr: 0
      };
    });
  },

  updateInput: (aX) => set((state) => ({ car: { ...state.car, acc: aX } })),
  
  triggerJump: () => {
      set((state) => {
          if (state.car.isJumping || state.gameState !== 'PLAYING') return state;
          CyberAudio.jump();
          return { car: { ...state.car, isJumping: true, velY: JUMP_IMPULSE } };
      });
  },

  step: (rawDt, langUI) => set((state) => {
    if (state.gameState !== 'PLAYING') return state;

    const dt = Math.min(rawDt, 0.05); 
    const { pos, vel, acc, maxVel, isJumping, velY, jumpY } = state.car;
    const { targetPos, targetMargin, topology, sandboxMode, obstacles } = state;
    
    // Topología
    const trackY = topology.A * Math.sin(pos / topology.B);
    const dy_dx = (topology.A / topology.B) * Math.cos(pos / topology.B);
    const theta = Math.atan(dy_dx); 

    // FÍSICA EJE Y (TIRO PARABÓLICO) - Gravedad actúa constantemente hacia abajo
    let nextVelY = velY;
    let nextJumpY = jumpY;
    let currentlyJumping = isJumping;

    if (currentlyJumping) {
        nextVelY -= GRAVITY * dt;
        nextJumpY += nextVelY * dt;
        
        if (nextJumpY <= 0) {
            nextJumpY = 0;
            nextVelY = 0;
            currentlyJumping = false;
        }
    }

    // FÍSICA EJE X
    const gravityForce = -GRAVITY * Math.sin(theta);
    const dragForce = -DRAG * vel * Math.abs(vel); 
    
    let kineticFriction = 0;
    let normalF = 0;
    let totalAcc = acc + dragForce; 

    // Al saltar, NO hay Normal, por lo tanto NO hay fricción con el piso
    if (!currentlyJumping) {
        normalF = GRAVITY * Math.cos(theta);
        kineticFriction = vel !== 0 ? -Math.sign(vel) * MU_K * normalF : 0;
        totalAcc += gravityForce + kineticFriction;

        if (acc === 0 && Math.abs(vel) < 0.5 && Math.abs(gravityForce) < (MU_K * normalF)) {
            totalAcc = -vel / dt; 
        }
    } else {
        totalAcc += gravityForce * 0.15; 
    }

    let nextVel = vel + (totalAcc * dt);
    let nextPos = pos + (nextVel * dt); 

    // 🟢 ALGORITMO TIPO DINOSAURIO (Generación Infinita y Limpieza de Memoria O(1))
    let activeObstacles = [...obstacles];
    // Borrar obstáculos que ya pasamos por más de 50 metros para no saturar RAM
    activeObstacles = activeObstacles.filter(obsX => obsX > pos - 50 && obsX !== -1000);
    
    // Si el último obstáculo está muy cerca, generamos más hacia el infinito
    let lastObs = activeObstacles.length > 0 ? Math.max(...activeObstacles) : pos;
    while (lastObs < pos + 1500) {
        lastObs += 100 + Math.random() * 200;
        activeObstacles.push(lastObs);
    }

    // COLISIONES
    for (let i = 0; i < activeObstacles.length; i++) {
        const obsX = activeObstacles[i];
        if (pos < obsX && nextPos >= obsX) { 
            // El obstáculo mide 3 metros físicos de alto
            if (nextJumpY < 3.0) { 
                nextVel = nextVel * 0.2; // Pierde el 80% de su momento lineal
                CyberAudio.crash();
                activeObstacles[i] = -1000; 
            }
        }
    }

    const currentMaxVel = Math.max(maxVel, nextVel);
    if (nextPos < 0) { nextPos = 0; nextVel = 0; } 

    // Telemetría
    const ptr = state.historyPtr;
    state.historyPos[ptr] = nextPos;
    state.historyVel[ptr] = nextVel;
    state.historyAcc[ptr] = totalAcc;

    let hint = state.tutorHint;
    let isSandbox = sandboxMode;

    if (!isSandbox && nextPos > targetPos + targetMargin + 10) {
        isSandbox = true; 
        hint = langUI.tutor.sandbox;
        CyberAudio.warn();
    } else if (!isSandbox) {
        const stopDist = (nextVel * nextVel) / (2 * Math.abs(BRAKE_FORCE)); 
        
        if (currentlyJumping) {
            hint = langUI.tutor.jump;
        } else if (nextVel > 1) {
           if (nextPos + stopDist > targetPos + targetMargin) hint = langUI.tutor.danger;
           else if (nextPos + stopDist > targetPos - targetMargin) hint = langUI.tutor.optimal;
           else if (acc === ENGINE_FORCE) hint = langUI.tutor.accel;
           else if (acc === DECEL_FORCE) hint = langUI.tutor.decel;
        } else if (acc === BRAKE_FORCE && nextVel > 0.1) {
            hint = langUI.tutor.brake;
        } else if (nextVel < 0.1 && nextPos > 0) {
            hint = (Math.abs(nextPos - targetPos) <= targetMargin) ? langUI.tutor.stop_good : langUI.tutor.idle;
        }
    }

    let nextState = 'PLAYING';
    let analysis = null;
    let microClass = null;
    let newScore = state.score;
    let newStreak = state.streak;
    
    if (Math.abs(nextVel) < 0.1 && state.simTime > 1.0 && acc <= 0 && !isSandbox) {
        const errorDist = nextPos - targetPos;
        
        if(Math.abs(errorDist) < 40 || nextPos > targetPos + targetMargin) {
             const isSuccess = Math.abs(errorDist) <= targetMargin;
             if (isSuccess) {
                 nextState = 'RESULT'; 
                 newScore += 2500 + (newStreak * 500);
                 newStreak += 1;
                 
                 const avgSpeed = nextPos / state.simTime;
                 analysis = { 
                     message: langUI.analysis.success,
                     dist: nextPos.toFixed(1),
                     time: state.simTime.toFixed(1),
                     avgVel: avgSpeed.toFixed(1),
                     maxVel: currentMaxVel.toFixed(1),
                     explanation: `${langUI.tutor.stop_good} V_prom: ${avgSpeed.toFixed(1)}m/s. G = 9.81m/s².`
                 };
                 CyberAudio.success();
             } else {
                 nextState = 'MICRO_CLASS';
                 newStreak = 0;
                 const type = errorDist > 0 ? 'overshoot' : 'undershoot';
                 microClass = { type, data: langUI.microClasses[type], errorDist: Math.abs(errorDist).toFixed(2) };
                 CyberAudio.error();
             }
        }
    }

    return {
      simTime: state.simTime + dt, tutorHint: hint, gameState: nextState, analysisData: analysis, microClassData: microClass,
      score: newScore, streak: newStreak, sandboxMode: isSandbox, obstacles: activeObstacles,
      car: { pos: nextPos, vel: nextVel, acc, y: trackY, theta, totalAcc, gravityAcc: gravityForce, normalForce: normalF, frictionForce: kineticFriction, maxVel: currentMaxVel, isJumping: currentlyJumping, velY: nextVelY, jumpY: nextJumpY },
      historyPtr: (ptr + 1) % MAX_HISTORY
    };
  })
}));

/* ============================================================
   ⌨️ CONTROLADOR HARDWARE HÍBRIDO (Input Manager Hook)
============================================================ */
function useHardwareInputs() {
    const updateInput = usePhysicsStore(state => state.updateInput);
    const triggerJump = usePhysicsStore(state => state.triggerJump);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') updateInput(ENGINE_FORCE);
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') updateInput(BRAKE_FORCE);
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') updateInput(DECEL_FORCE);
            if (e.key === ' ') { e.preventDefault(); triggerJump(); }
        };
        const handleKeyUp = (e) => {
            if (['ArrowUp', 'w', 'W', 'ArrowDown', 's', 'S', 'ArrowLeft', 'a', 'A'].includes(e.key)) updateInput(0);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [updateInput, triggerJump]);
}

/* ============================================================
   🧊 KERNEL 3D: RENDERIZADO VECTORIAL Y COMPONENTES
============================================================ */

function PhysicsEngine({ langUI }) {
    const step = usePhysicsStore(state => state.step);
    useHardwareInputs(); 
    useFrame((_, dt) => step(dt, langUI));
    return null;
}

function VictoryParticles() {
    const gameState = usePhysicsStore(s => s.gameState);
    const { pos, y } = usePhysicsStore(s => s.car);
    const particlesRef = useRef();

    useFrame((state, dt) => {
        if (gameState === 'RESULT' && particlesRef.current) {
            particlesRef.current.position.y += 5 * dt;
            particlesRef.current.rotation.y += 2 * dt;
        }
    });

    if (gameState !== 'RESULT') return null;

    return (
        <group ref={particlesRef} position={[pos, y + 2, 0]}>
            <Sparkles count={500} scale={20} size={8} speed={0.4} color="#ffea00" />
            <Sparkles count={300} scale={15} size={15} speed={0.8} color="#00ff88" />
        </group>
    );
}

function VictoryShockwave() {
    const gameState = usePhysicsStore(s => s.gameState);
    const { pos, y } = usePhysicsStore(s => s.car);
    const waveRef = useRef();

    useFrame(() => {
        if (gameState === 'RESULT' && waveRef.current) {
            waveRef.current.scale.x += 4;
            waveRef.current.scale.y += 4;
            waveRef.current.material.opacity = Math.max(0, waveRef.current.material.opacity - 0.015);
        }
    });

    if (gameState !== 'RESULT') return null;

    return (
        <mesh ref={waveRef} position={[pos, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0, 20, 64]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.8} side={THREE.DoubleSide} blending={THREE.AdditiveBlending}/>
        </mesh>
    );
}

function ObstaclesRenderer() {
    const obstacles = usePhysicsStore(s => s.obstacles);
    const topology = usePhysicsStore(s => s.topology);

    return (
        <group>
            {obstacles.map((obsX, i) => {
                if (obsX < 0) return null; 
                const obsY = topology.A * Math.sin(obsX / topology.B);
                const theta = Math.atan((topology.A / topology.B) * Math.cos(obsX / topology.B));
                return (
                    <group key={i} position={[obsX, obsY, 0]} rotation={[0, 0, theta]}>
                        <mesh position={[0, 1.5, 0]}>
                            {/* Obstáculos de 3 metros exactos */}
                            <boxGeometry args={[1, 3.0, 5]} />
                            <meshBasicMaterial color="#ff0055" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
                        </mesh>
                        <mesh position={[0, 1.5, 0]}>
                            <boxGeometry args={[1.1, 3.1, 5.1]} />
                            <meshBasicMaterial color="#ff0055" wireframe />
                        </mesh>
                    </group>
                );
            })}
        </group>
    );
}

function InfiniteTopology() {
    const geometry = useMemo(() => new THREE.BufferGeometry(), []);
    const maxPoints = 600; // Resolución ampliada para lookahead
    const positions = useMemo(() => new Float32Array(maxPoints * 3), []);

    useFrame(() => {
        const { pos } = usePhysicsStore.getState().car;
        const { A, B } = usePhysicsStore.getState().topology;
        
        // Ventana deslizante: renderiza desde -150m hasta +1000m adelante
        const startX = pos - 150; 
        const step = 1150 / maxPoints; 

        for (let i = 0; i < maxPoints; i++) {
            const x = startX + (i * step);
            const y = A * Math.sin(x / B);
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = 0;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.attributes.position.needsUpdate = true;
    });

    return (
        <group>
            <line geometry={geometry}>
                <lineBasicMaterial color="#8b5cf6" linewidth={8} />
            </line>
            <line geometry={geometry} position={[0, -20, 0]}>
                 <lineBasicMaterial color="#00f2ff" transparent opacity={0.15} />
            </line>
        </group>
    );
}

// 🧠 VEHÍCULO CON DIAGRAMA DE CUERPO LIBRE DINÁMICO E INSTRUCCIÓN
function PedagogicalVehicle({ langUI }) {
  const { pos, y, theta, totalAcc, vel, jumpY, isJumping } = usePhysicsStore(state => state.car);
  const inputAcc = usePhysicsStore(state => state.car.acc);
  
  const carGroup = useRef();
  const chassisMat = useRef();
  const plasmaExhaust = useRef();
  
  const netAccArrow = useRef();
  const gravArrow = useRef();
  const velArrow = useRef(); 
  const normalArrow = useRef(); 
  const frictionArrow = useRef(); 
  const textRef = useRef();

  const vecUp = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const vecDown = useMemo(() => new THREE.Vector3(0, -1, 0), []);
  const vecRight = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const vecLeft = useMemo(() => new THREE.Vector3(-1, 0, 0), []);
  
  const baseColor = useMemo(() => new THREE.Color('#020617'), []);
  const accelColor = useMemo(() => new THREE.Color('#00f2ff'), []);
  const decelColor = useMemo(() => new THREE.Color('#ffea00'), []);
  const brakeColor = useMemo(() => new THREE.Color('#ff0055'), []);

  useFrame(() => {
    if (!carGroup.current || !chassisMat.current) return;
    
    // Elevación por salto balístico + posición del terreno
    carGroup.current.position.set(pos, y + 0.8 + jumpY, 0);
    // Orientación balística en el aire vs Suelo
    carGroup.current.rotation.z = isJumping ? THREE.MathUtils.lerp(carGroup.current.rotation.z, 0, 0.05) : theta;

    let targetColor = baseColor;
    if (inputAcc === ENGINE_FORCE) targetColor = accelColor;
    else if (inputAcc === DECEL_FORCE) targetColor = decelColor;
    else if (inputAcc === BRAKE_FORCE) targetColor = brakeColor;

    chassisMat.current.emissive.lerp(targetColor, 0.2);
    chassisMat.current.emissiveIntensity = Math.abs(inputAcc) * 0.05 + 0.5;

    if(plasmaExhaust.current) {
        plasmaExhaust.current.scale.y = THREE.MathUtils.lerp(plasmaExhaust.current.scale.y, inputAcc === ENGINE_FORCE ? (vel * 0.05 + 3) : 0, 0.3);
        plasmaExhaust.current.material.color = targetColor;
        plasmaExhaust.current.position.x = -2.5 - (plasmaExhaust.current.scale.y * 0.5);
    }

    // 1. Gravedad
    if (gravArrow.current) {
        gravArrow.current.setDirection(vecDown);
        gravArrow.current.setLength(2.0, 0.8, 0.5); 
        gravArrow.current.rotation.z = -carGroup.current.rotation.z; 
    }

    // 2. Normal
    if (normalArrow.current) {
        normalArrow.current.visible = !isJumping;
        if (!isJumping) {
            normalArrow.current.setDirection(vecUp);
            normalArrow.current.setLength(2.0 * Math.cos(theta), 0.8, 0.5);
            normalArrow.current.rotation.z = 0; 
        }
    }

    // 3. Fricción
    if (frictionArrow.current) {
        frictionArrow.current.visible = !isJumping && Math.abs(vel) > 0.1;
        if (!isJumping && Math.abs(vel) > 0.1) {
            frictionArrow.current.setDirection(vel > 0 ? vecLeft : vecRight);
            frictionArrow.current.setLength(1.5, 0.5, 0.3);
        }
    }

    // 4. Aceleración Neta
    if (netAccArrow.current) {
        netAccArrow.current.setDirection(totalAcc >= 0 ? vecRight : vecLeft);
        netAccArrow.current.setLength(Math.abs(totalAcc) * 0.1 + 0.5, 0.8, 0.5);
        netAccArrow.current.visible = Math.abs(totalAcc) > 0.5;
    }
    
    // 5. Velocidad
    if (velArrow.current) {
        velArrow.current.setDirection(vel >= 0 ? vecRight : vecLeft);
        velArrow.current.setLength(Math.abs(vel) * 0.05 + 1.0, 0.8, 0.5);
        velArrow.current.visible = Math.abs(vel) > 0.1;
    }
    
    if(textRef.current) {
        textRef.current.rotation.z = -carGroup.current.rotation.z;
    }
  });

  return (
    <group ref={carGroup}>
        {/* Chasis Cyberpunk */}
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[5, 1.2, 2.5]} />
            <meshStandardMaterial ref={chassisMat} color="#0f172a" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0]}>
            <boxGeometry args={[5.05, 1.25, 2.55]} />
            <meshBasicMaterial color="#00f2ff" wireframe />
        </mesh>

        <mesh ref={plasmaExhaust} position={[-2.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[1.2, 1, 16]} />
            <meshBasicMaterial color="#00f2ff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </mesh>
        
        <group ref={textRef} position={[0, 6, 0]}>
             {/* Textos tipográficos nativos = 0% Crash de Suspense */}
             <Text position={[0, 4, 0]} fontSize={0.8} color="#ffffff" anchorX="center" anchorY="middle">
                 {isJumping ? langUI.hud.state_jump : langUI.hud.state_ground}
             </Text>
             {Math.abs(vel) > 0.1 && (
                 <Text position={[0, 2.8, 0]} fontSize={0.9} color="#00ff88" anchorX="center" anchorY="middle">
                     V: {vel.toFixed(1)} m/s
                 </Text>
             )}
             {Math.abs(totalAcc) > 0.5 && (
                 <Text position={[0, 1.8, 0]} fontSize={0.7} color="#ff0055" anchorX="center" anchorY="middle">
                     Aneta: {totalAcc.toFixed(1)}
                 </Text>
             )}
        </group>

        <primitive object={new THREE.ArrowHelper(vecRight, new THREE.Vector3(0, 0, 1.5), 1, 0xff0055)} ref={netAccArrow} /> 
        <primitive object={new THREE.ArrowHelper(vecDown, new THREE.Vector3(0, 0, 0), 1, 0xffa500)} ref={gravArrow} /> 
        <primitive object={new THREE.ArrowHelper(vecUp, new THREE.Vector3(0, 0, 0), 1, 0xff00ff)} ref={normalArrow} /> 
        <primitive object={new THREE.ArrowHelper(vecLeft, new THREE.Vector3(0, -0.6, 0), 1, 0xffff00)} ref={frictionArrow} /> 
        <primitive object={new THREE.ArrowHelper(vecRight, new THREE.Vector3(0, 4, 0), 1, 0x00ff88)} ref={velArrow} /> 
    </group>
  );
}

function DynamicCamera() {
    useFrame(({ camera }) => {
        const { pos, y, vel, totalAcc, jumpY } = usePhysicsStore.getState().car;
        const targetZ = 60 + Math.abs(vel) * 0.5; 
        
        const targetFov = 45 + Math.abs(vel) * 0.25;
        camera.fov = THREE.MathUtils.lerp(camera.fov, Math.min(targetFov, 100), 0.1);
        camera.updateProjectionMatrix();

        const shakeForce = Math.min(Math.abs(totalAcc) * 0.02, 1.5);
        const shakeX = (Math.random() - 0.5) * shakeForce;
        const shakeY = (Math.random() - 0.5) * shakeForce;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, pos + 15 + shakeX, 0.08);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, y + 12 + jumpY + shakeY, 0.08);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08);
        camera.lookAt(camera.position.x - 15, camera.position.y - 12, 0);
    });
    return null;
}

function ExtractionZone({ t }) {
    const targetPos = usePhysicsStore(s => s.targetPos);
    const targetMargin = usePhysicsStore(s => s.targetMargin);
    const topology = usePhysicsStore(s => s.topology);
    
    const targetY = topology.A * Math.sin(targetPos / topology.B);
    const theta = Math.atan((topology.A / topology.B) * Math.cos(targetPos / topology.B));

    return (
        <group position={[targetPos, targetY, 0]} rotation={[0, 0, theta]}>
             <mesh rotation={[-Math.PI / 2, 0, 0]}>
                 <planeGeometry args={[targetMargin*2, 50]} />
                 <meshBasicMaterial color="#00f2ff" transparent opacity={0.4} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
             </mesh>
             <Html position={[0, 5, 0]} center zIndexRange={[0, 0]}>
                  <div style={{ color: '#00f2ff', background: 'rgba(0,0,0,0.9)', padding: '15px 30px', borderRadius: '8px', border: `3px solid #00f2ff`, fontWeight: '900', boxShadow: `0 0 50px #00f2ff`, textTransform: 'uppercase', letterSpacing: '4px', fontSize: '1.2rem' }}>
                      {t.target}: {targetPos}m
                  </div>
              </Html>
        </group>
    );
}

/* ============================================================
   📊 HUD HTML5: DIAGRAMA DE CUERPO LIBRE SEPARADO Y GRÁFICAS
============================================================ */

// 🧠 DIAGRAMA DE CUERPO LIBRE AISLADO (2D Canvas)
function FreeBodyDiagramHUD() {
    const canvasRef = useRef();

    useEffect(() => {
        let animationId;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const render = () => {
            const { theta, totalAcc, isJumping, vel, normalForce, frictionForce } = usePhysicsStore.getState().car;
            
            // Ref Fallbacks for fast unmount cycles
            const safeNormalForce = normalForce || 0;
            const safeFrictionForce = frictionForce || 0;

            const w = canvas.width; const h = canvas.height;
            const cx = w / 2; const cy = h / 2;

            ctx.clearRect(0, 0, w, h);
            
            if (!isJumping) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(-theta); 
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
                ctx.lineWidth = 4;
                ctx.beginPath(); ctx.moveTo(-w, 20); ctx.lineTo(w, 20); ctx.stroke();
                ctx.restore();
            }

            const drawVector = (mag, angle, color, label, isFixedY = false) => {
                if (Math.abs(mag) < 0.1) return;
                const length = Math.min(Math.abs(mag) * 2, 80); 
                const dir = Math.sign(mag);
                
                ctx.save();
                ctx.translate(cx, cy);
                if (isFixedY) {
                     ctx.rotate(angle);
                } else {
                     ctx.rotate(-theta + angle);
                }

                ctx.strokeStyle = color;
                ctx.fillStyle = color;
                ctx.lineWidth = 3;
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(length * dir, 0);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(length * dir, 0);
                ctx.lineTo((length - 8) * dir, -5);
                ctx.lineTo((length - 8) * dir, 5);
                ctx.fill();

                ctx.font = 'bold 12px sans-serif';
                ctx.fillText(label, (length + 10) * dir, 5);
                ctx.restore();
            };

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-theta);
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#00f2ff';
            ctx.lineWidth = 2;
            ctx.fillRect(-15, -15, 30, 30);
            ctx.strokeRect(-15, -15, 30, 30);
            ctx.restore();

            // Fuerza gravitacional constante 9.81
            drawVector(9.81, Math.PI / 2, '#ffa500', 'W (mg)', true);
            
            if (!isJumping) {
                drawVector(safeNormalForce, -Math.PI / 2, '#ff00ff', 'N', false);
                if (Math.abs(vel) > 0.1) {
                    drawVector(safeFrictionForce, 0, '#ffff00', 'fk', false);
                }
            }

            drawVector(totalAcc, 0, '#ff0055', 'A_neta', false);

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, []);

    return (
        <div style={{ width: '200px', background: 'rgba(2, 6, 23, 0.95)', padding: '10px', borderRadius: '12px', border: `1px solid rgba(255,255,255,0.2)`, boxShadow: `0 10px 40px rgba(0,0,0,0.8)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: '#fff', fontWeight: '900', marginBottom: '5px', letterSpacing: '1px' }}>D.C.L. LIVE</div>
            <canvas ref={canvasRef} width={180} height={180} style={{ display: 'block', background: 'transparent' }} />
        </div>
    );
}

function FastTelemetryGraph({ label, dataKey, color }) {
    const canvasRef = useRef();

    useEffect(() => {
        let animationId;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false }); 
        
        const render = () => {
            const state = usePhysicsStore.getState();
            const data = state[dataKey]; 
            const ptr = state.historyPtr;
            const w = canvas.width; const h = canvas.height;

            const currentVal = data[(ptr - 1 + MAX_HISTORY) % MAX_HISTORY] || 0;

            let min = Infinity; let max = -Infinity;
            for (let i = 0; i < MAX_HISTORY; i++) {
                const val = data[i] || 0;
                if (val < min) min = val;
                if (val > max) max = val;
            }
            
            const targetRange = max - min === 0 ? 1 : max - min;
            const range = targetRange * 1.2; 
            const offsetMax = max + (targetRange * 0.1);
            const offsetMin = min - (targetRange * 0.1);

            ctx.fillStyle = '#020617'; 
            ctx.fillRect(0, 0, w, h);
            
            ctx.strokeStyle = 'rgba(255,255,255,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for(let step = 0; step <= h; step += h/4) { ctx.moveTo(0, step); ctx.lineTo(w, step); }
            for(let step = 0; step <= w; step += w/10) { ctx.moveTo(step, 0); ctx.lineTo(step, h); }
            ctx.stroke();

            ctx.beginPath();
            for (let i = 0; i < MAX_HISTORY; i++) {
                const idx = (ptr + i) % MAX_HISTORY;
                const val = data[idx] || 0;
                const x = (i / MAX_HISTORY) * w;
                const y = h - (((val - offsetMin) / range) * h); 
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.5;
            ctx.lineJoin = 'round';
            ctx.stroke();

            ctx.lineTo(w, h);
            ctx.lineTo(0, h);
            ctx.closePath();
            
            const gradient = ctx.createLinearGradient(0, 0, 0, h);
            gradient.addColorStop(0, `${color}80`); 
            gradient.addColorStop(1, `${color}00`); 
            ctx.fillStyle = gradient;
            ctx.fill();

            const currentX = ((MAX_HISTORY - 1) / MAX_HISTORY) * w;
            const currentY = h - (((currentVal - offsetMin) / range) * h);
            
            ctx.beginPath();
            ctx.moveTo(currentX, 0);
            ctx.lineTo(currentX, h);
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.setLineDash([2, 2]);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.beginPath();
            ctx.arc(currentX, currentY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.fill();
            ctx.shadowBlur = 0; 

            if (offsetMin < 0 && offsetMax > 0) {
                const zeroY = h - (((0 - offsetMin) / range) * h);
                ctx.strokeStyle = 'rgba(255,255,255,0.8)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, zeroY); ctx.lineTo(w, zeroY); ctx.stroke();
            }

            ctx.fillStyle = color; ctx.font = 'bold 10px monospace';
            ctx.fillText(`▲ ${max.toFixed(1)}`, 5, 14);
            ctx.fillText(`▼ ${min.toFixed(1)}`, 5, h - 6);

            ctx.font = '900 18px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${currentVal.toFixed(1)}`, w - 10, 22);
            ctx.textAlign = 'left'; 

            animationId = requestAnimationFrame(render);
        };
        render();
        return () => cancelAnimationFrame(animationId);
    }, [dataKey, color]);

    return (
        <div style={{ flex: 1, maxWidth: '400px', minWidth: '250px', padding: '10px', borderRadius: '12px', border: `1px solid ${color}50`, boxShadow: `0 10px 40px rgba(0,0,0,0.8)`, background: 'rgba(2, 6, 23, 0.95)' }}>
            <div style={{ fontSize: '11px', color, fontWeight: '900', marginBottom: '8px', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', textTransform: 'uppercase' }}>
                <span>{label}</span>
                <span style={{ color: '#00f2ff', fontSize: '9px', animation: 'pulse 1s infinite' }}>● LIVE SENSOR</span>
            </div>
            <canvas ref={canvasRef} width={400} height={120} style={{ width: '100%', height: '120px', display: 'block', borderRadius: '6px' }} />
        </div>
    );
}

function LiveFormulaBoard({ t }) {
    const { totalAcc, gravityAcc, acc, isJumping } = usePhysicsStore(s => s.car);
    
    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(15px)', padding: '10px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', gap: '20px', alignItems: 'center', boxShadow: '0 15px 40px rgba(0,0,0,0.6)', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' }}>M.R.U.A EQUATION</div>
                    <div style={{ fontSize: '16px', fontFamily: 'monospace', color: '#fff', fontWeight: 'bold' }}>v(t) = v₀ + a<span style={{fontSize: '10px'}}>neta</span>·t</div>
                </div>
                <div style={{ width: '2px', height: '30px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '900', letterSpacing: '1px' }}>{isJumping ? 'BALLISTIC VECTORS' : 'GROUND VECTORS'} (g = 9.81)</div>
                    <div style={{ fontSize: '15px', fontFamily: 'monospace', fontWeight: '900', display: 'flex', gap: '8px' }}>
                        <span style={{ color: '#00f2ff' }}>{acc.toFixed(1)}</span> + 
                        <span style={{ color: '#ffa500' }}>{isJumping ? '-9.81' : gravityAcc.toFixed(1)}</span> = 
                        <span style={{ color: '#ff0055' }}>{totalAcc.toFixed(1)} m/s²</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function NumericalDashboard({ t }) {
    const { pos, vel, totalAcc, theta } = usePhysicsStore(s => s.car);
    const { simTime, targetPos, missionLevel, score, streak } = usePhysicsStore();
    const slopeDeg = (theta * 180 / Math.PI).toFixed(1);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '8px', background: 'rgba(15,23,42,0.95)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 15px 40px rgba(0,0,0,0.8)', pointerEvents: 'none', width: '100%' }}>
            <div style={{ textAlign: 'center' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.mission}</div><div style={{ color: '#ffea00', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{missionLevel}</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.score}</div><div style={{ color: '#fff', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{score}</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.streak}</div><div style={{ color: '#00f2ff', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>x{streak}</div></div>
            
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.time}</div><div style={{ color: '#fff', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{simTime.toFixed(1)}s</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.slope}</div><div style={{ color: '#ffa500', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{slopeDeg}°</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.target}</div><div style={{ color: '#00f2ff', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{targetPos}m</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.pos}</div><div style={{ color: '#8b5cf6', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{pos.toFixed(1)}m</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.vel}</div><div style={{ color: '#00ff88', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{vel.toFixed(1)}</div></div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><div style={{ color: '#94a3b8', fontSize: '9px', fontWeight: 'bold' }}>{t.acc}</div><div style={{ color: '#ff0055', fontSize: 'clamp(12px, 2vw, 15px)', fontWeight: '900' }}>{totalAcc.toFixed(1)}</div></div>
        </div>
    );
}

// 🧠 ENCICLOPEDIA COMPONENTE INTERACTIVO
function EncyclopediaModal({ t, onClose }) {
    const [activeTopic, setActiveTopic] = useState(0);
    const topics = t.encyclopedia.topics;

    return (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', pointerEvents: 'auto' }}>
            <div style={{ width: '900px', maxWidth: '100%', height: '80vh', background: '#020617', borderRadius: '24px', border: '2px solid #8b5cf6', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)' }}>
                <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ margin: 0, color: '#00f2ff' }}>{t.encyclopedia.title}</h2>
                    <button onClick={() => { CyberAudio.click(); onClose(); }} style={{ background: 'transparent', border: 'none', color: '#ff0055', fontSize: '24px', cursor: 'pointer' }}>✖</button>
                </div>
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div style={{ width: '30%', background: 'rgba(255,255,255,0.05)', padding: '20px', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
                        {topics.map((topic, idx) => (
                            <button key={topic.id} onClick={() => { CyberAudio.click(); setActiveTopic(idx); }} style={{ width: '100%', textAlign: 'left', padding: '15px', background: activeTopic === idx ? '#8b5cf6' : 'transparent', color: activeTopic === idx ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', fontWeight: 'bold', transition: '0.2s' }}>
                                {topic.name}
                            </button>
                        ))}
                    </div>
                    {/* Content */}
                    <div style={{ width: '70%', padding: '40px', overflowY: 'auto' }}>
                        <h2 style={{ color: '#00f2ff', fontSize: '2rem', marginBottom: '30px' }}>{topics[activeTopic].name}</h2>
                        <p style={{ color: '#cbd5e1', fontSize: '1.2rem', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>{topics[activeTopic].content}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ============================================================
   🎮 CORE UI: MAESTRO DE RUTEO Y ESTADOS
============================================================ */
export default function CinematicaViz() {
  const language = useGameStore(s => s.language) || 'es';
  // Si el lenguaje en tu store no existe en LEXICON, hace fallback a inglés.
  const t = useMemo(() => LEXICON[language] || LEXICON['en'], [language]);

  const { gameState, initLevel, updateInput, triggerJump, tutorHint, sandboxMode, microClassData, analysisData, setGameState } = usePhysicsStore();
  const resetApp = useGameStore(state => state.resetProgress);

  // Prevención de scroll nativo en móviles
  useEffect(() => {
    const p = (e) => { if(e.target.tagName !== 'BUTTON') e.preventDefault(); };
    document.addEventListener('touchmove', p, { passive: false });
    return () => document.removeEventListener('touchmove', p);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#010205', color: '#fff', fontFamily: "'Orbitron', sans-serif", touchAction: 'none' }}>
      
      <Canvas camera={{ position: [0, 12, 30], fov: 45 }}>
        <Suspense fallback={null}>
          <PhysicsEngine langUI={t} />
          
          <DynamicCamera />
          <PedagogicalVehicle langUI={t} />
          <InfiniteTopology />
          <ObstaclesRenderer />
          <ExtractionZone t={t.hud} />
          <VictoryShockwave />
          <VictoryParticles />
          
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 15, 10]} intensity={2.5} color="#ffffff" />
          
          <Stars radius={200} depth={50} count={8000} factor={6} saturation={0} fade speed={3} />
        </Suspense>
        
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} intensity={2.0} mipmapBlur />
          <Noise opacity={0.03} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} />
          <Vignette darkness={0.8} offset={0.1} />
        </EffectComposer>
      </Canvas>

      {/* --- ESTADO 1: BRIEFING INICIAL --- */}
      {gameState === 'THEORY' && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ maxWidth: '650px', width: '100%', padding: '40px', border: '1px solid #00f2ff', borderRadius: '24px', background: '#0f172a', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,242,255,0.15)' }}>
            <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '20px', fontWeight: '900' }}>{t.theory.t}</h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '1.1rem', marginBottom: '30px' }}>{t.theory.p1_p}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <button onClick={() => { CyberAudio.click(); setGameState('ENCYCLOPEDIA'); }} style={{ width: '100%', padding: '20px', background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', fontWeight: '900', border: '2px solid #8b5cf6', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' }}>
                  {t.analysis.encyclopedia}
                </button>
                <button onClick={() => { CyberAudio.click(); initLevel(false); }} style={{ width: '100%', padding: '20px', background: '#00f2ff', color: '#000', fontWeight: '900', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '1.2rem' }}>
                  {t.theory.btn_start}
                </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ESTADO ENCICLOPEDIA --- */}
      {gameState === 'ENCYCLOPEDIA' && (
         <EncyclopediaModal t={t} onClose={() => setGameState('THEORY')} />
      )}

      {/* --- ESTADO 2: HUD IN-GAME MOBILE FIRST --- */}
      {gameState === 'PLAYING' && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', padding: 'clamp(10px, 2vw, 20px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            <div>
                <LiveFormulaBoard t={t} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ flex: 1, maxWidth: '100%' }}><NumericalDashboard t={t.hud} /></div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        
                        {/* D.C.L. AISLADO */}
                        <FreeBodyDiagramHUD />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button onClick={() => { CyberAudio.click(); setGameState('ENCYCLOPEDIA'); }} style={{ pointerEvents: 'auto', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8b5cf6', color: '#8b5cf6', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', backdropFilter: 'blur(10px)', marginLeft: '10px' }}>📚</button>
                            <button onClick={resetApp} style={{ pointerEvents: 'auto', background: 'rgba(255,0,85,0.2)', border: '1px solid #ff0055', color: '#ff0055', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>{t.analysis.exit || 'SALIR'}</button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '40vh' }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      <FastTelemetryGraph label={t.hud.vel} dataKey="historyVel" color="#00ff88" />
                      <FastTelemetryGraph label={t.hud.acc} dataKey="historyAcc" color="#ff0055" />
                    </div>
                    
                    <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderLeft: `5px solid ${sandboxMode ? '#ff0055' : '#ffea00'}`, padding: '15px', borderRadius: '12px', maxWidth: '600px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
                        <div style={{ color: sandboxMode ? '#ff0055' : '#ffea00', fontSize: '12px', fontWeight: '900', marginBottom: '5px', letterSpacing: '1px' }}>{t.tutor.title}</div>
                        <div style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.5', fontWeight: 'bold' }}>{tutorHint}</div>
                    </div>
                </div>
            </div>

            {/* CONTROLES TÁCTICOS MÚLTIPLES */}
            <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', flexWrap: 'wrap' }}>
                <button 
                  onPointerDown={(e) => { e.preventDefault(); updateInput(BRAKE_FORCE); }} 
                  onPointerUp={(e) => { e.preventDefault(); updateInput(0); }} 
                  onPointerLeave={() => updateInput(0)}
                  style={{ flex: 1, padding: 'clamp(15px, 4vh, 25px)', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(255,0,85,0.3) 0%, rgba(200,0,50,0.9) 100%)', border: '2px solid #ff0055', color: '#fff', fontWeight: '900', fontSize: 'clamp(0.8rem, 2vw, 1.1rem)', cursor: 'pointer', touchAction: 'none' }}>
                  {t.controls.brake}
                </button>
                <button 
                  onPointerDown={(e) => { e.preventDefault(); updateInput(DECEL_FORCE); }} 
                  onPointerUp={(e) => { e.preventDefault(); updateInput(0); }} 
                  onPointerLeave={() => updateInput(0)}
                  style={{ flex: 1, padding: 'clamp(15px, 4vh, 25px)', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(255,234,0,0.3) 0%, rgba(200,180,0,0.9) 100%)', border: '2px solid #ffea00', color: '#fff', fontWeight: '900', fontSize: 'clamp(0.8rem, 2vw, 1.1rem)', cursor: 'pointer', touchAction: 'none' }}>
                  {t.controls.decel}
                </button>
                <button 
                  onPointerDown={(e) => { e.preventDefault(); triggerJump(); }} 
                  style={{ flex: 1, padding: 'clamp(15px, 4vh, 25px)', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(139,92,246,0.3) 0%, rgba(100,50,200,0.9) 100%)', border: '2px solid #8b5cf6', color: '#fff', fontWeight: '900', fontSize: 'clamp(0.8rem, 2vw, 1.1rem)', cursor: 'pointer', touchAction: 'none' }}>
                  {t.controls.jump}
                </button>
                <button 
                  onPointerDown={(e) => { e.preventDefault(); updateInput(ENGINE_FORCE); }} 
                  onPointerUp={(e) => { e.preventDefault(); updateInput(0); }} 
                  onPointerLeave={() => updateInput(0)}
                  style={{ flex: 1.5, padding: 'clamp(15px, 4vh, 25px)', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(0,242,255,0.3) 0%, rgba(0,150,180,0.9) 100%)', border: '2px solid #00f2ff', color: '#fff', fontWeight: '900', fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)', cursor: 'pointer', touchAction: 'none' }}>
                  {t.controls.accel}
                </button>
            </div>
        </div>
      )}

      {/* --- ESTADO 3 Y 4 --- */}
      {gameState === 'MICRO_CLASS' && microClassData && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', pointerEvents: 'auto' }}>
          <div style={{ padding: 'clamp(30px, 6vw, 50px)', border: `2px solid #ff0055`, borderRadius: '24px', background: '#0f172a', maxWidth: '650px', width: '100%', boxShadow: `0 0 100px rgba(255,0,85,0.3)` }}>
            <div style={{ color: '#ffea00', fontSize: '14px', fontWeight: '900', letterSpacing: '2px', marginBottom: '20px', textAlign: 'center' }}>MICRO-CLASE REACTIVA</div>
            <h2 style={{ color: '#ff0055', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', margin: '0 0 20px 0', textAlign: 'center', fontWeight: '900' }}>
                {microClassData.data.h}
            </h2>
            <div style={{ background: 'rgba(255,0,85,0.1)', padding: '25px', borderRadius: '12px', borderLeft: '4px solid #ff0055', marginBottom: '30px' }}>
                <p style={{ fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', margin: 0, color: '#fff', lineHeight: '1.6' }}>{microClassData.data.p}</p>
                <div style={{ marginTop: '20px', fontSize: '1.1rem', color: '#ffea00', fontWeight: 'bold' }}>Margen de error matemático: {microClassData.errorDist}m</div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
                <button onClick={() => setGameState('ENCYCLOPEDIA')} style={{ flex: 1, padding: '22px', background: 'transparent', color: '#8b5cf6', fontWeight: '900', border: '2px solid #8b5cf6', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {t.analysis.encyclopedia}
                </button>
                <button onClick={() => initLevel(true)} style={{ flex: 1, padding: '22px', background: '#ff0055', color: '#fff', fontWeight: '900', border: 'none', borderRadius: '16px', cursor: 'pointer', fontSize: '1.2rem' }}>
                    {t.analysis.retry}
                </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'RESULT' && analysisData && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto', padding: '20px' }}>
          <div style={{ padding: 'clamp(40px, 6vw, 60px)', border: `2px solid #00ff88`, borderRadius: '24px', background: '#0f172a', textAlign: 'center', maxWidth: '650px', width: '100%', boxShadow: `0 0 100px #00ff8840` }}>
            <h2 style={{ color: '#00ff88', fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '20px', textShadow: '0 0 20px rgba(0,255,136,0.5)', fontWeight: '900' }}>{analysisData.message}</h2>
            
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '16px', marginBottom: '25px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                <div><div style={{color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'}}>Distancia ($\Delta x$):</div><div style={{fontSize: '24px', fontWeight: '900', color: '#00f2ff'}}>{analysisData.dist} m</div></div>
                <div><div style={{color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'}}>Tiempo ($t$):</div><div style={{fontSize: '24px', fontWeight: '900', color: '#ffea00'}}>{analysisData.time} s</div></div>
                <div><div style={{color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'}}>Vel. Máxima ($v_{max}$):</div><div style={{fontSize: '24px', fontWeight: '900', color: '#ff0055'}}>{analysisData.maxVel} m/s</div></div>
                <div><div style={{color: '#94a3b8', fontSize: '12px', fontWeight: 'bold'}}>Vel. Promedio ($\bar{v}$):</div><div style={{fontSize: '24px', fontWeight: '900', color: '#00ff88'}}>{analysisData.avgVel} m/s</div></div>
            </div>

            <div style={{ background: 'rgba(0, 242, 255, 0.1)', padding: '25px', borderRadius: '16px', borderLeft: '4px solid #00f2ff', marginBottom: '35px', textAlign: 'left' }}>
                <div style={{ fontSize: '12px', color: '#00f2ff', fontWeight: '900', marginBottom: '10px', letterSpacing: '1px' }}>ANÁLISIS KINEMÁTICO:</div>
                <p style={{ fontSize: '1.1rem', margin: 0, color: '#e2e8f0', lineHeight: '1.6' }}>{analysisData.explanation}</p>
            </div>

            <button onClick={() => initLevel(false)} style={{ width: '100%', padding: '25px 40px', background: `#00ff8820`, color: '#00ff88', fontWeight: '900', border: `2px solid #00ff88`, borderRadius: '16px', cursor: 'pointer', fontSize: '1.4rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                {t.analysis.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}