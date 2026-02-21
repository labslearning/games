import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sparkles, Center, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🔊 1. MOTOR DE AUDIO SCI-FI Y VOZ BLINDADA TIER-GOD
============================================================ */
class ThermoAudio {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }
  click() { this._play('sine', 600, 300, 0.1, 0.1); }
  success() { this._play('sine', 440, 880, 0.5, 0.2); setTimeout(()=>this._play('sine', 880, 1760, 0.5, 0.2), 150); }
  error() { this._play('sawtooth', 150, 40, 0.5, 0.3); }
  valve() { this._play('noise', 1000, 100, 0.2, 0.05); } 
}
const sfx = new ThermoAudio();

// Gestor de Voz Dinámico (Evita audios pegados y respeta idioma local)
const triggerVoice = (text, langCode) => {
  if (!('speechSynthesis' in window)) return;
  
  // 1. Machetazo a cualquier audio previo (Corta colas fantasma)
  window.speechSynthesis.cancel();
  
  // 2. Espera táctica de 50ms para que el navegador libere el canal de audio
  setTimeout(() => {
    // Verificación de seguridad: si justo acaban de salir del juego, no hables.
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
        const u = new SpeechSynthesisUtterance(text);
        
        // 3. Forzar el idioma dinámico que viene del prop
        u.lang = langCode; 
        u.rate = 1.05;
        u.pitch = 1.0;
        
        // 4. Limpieza garbage collector nativa
        u.onend = () => { window.speechSynthesis.cancel(); };
        u.onerror = () => { window.speechSynthesis.cancel(); };
        
        window.speechSynthesis.speak(u);
    }
  }, 50);
};

/* ============================================================
   🌍 2. MATRIZ PEDAGÓGICA (10 NIVELES: DE BOYLE A AVOGADRO)
============================================================ */
const DICT = {
  es: {
    ui: { 
      start: "INICIAR INSTRUCCIÓN TERMAL", title: "GAS THEORY: MASTER CLASS", 
      theoryTitle: "TEORÍA FUNDAMENTAL", theoryBtn: "ANALIZAR ➔", diagTitle: "EVALUACIÓN COGNITIVA", 
      btnCheck: "VERIFICAR LEY", synthTitle: "APLICACIÓN REAL", btnNext: "SIGUIENTE LEY ➔", winTitle: "🏅 TERMODINÁMICA DOMINADA", btnBack: "⬅ VOLVER",
      btnAI: "🤖 ASISTENCIA IA", microTitle: "MICRO-CLASE IA", btnContinue: "REINTENTAR", targetReached: "¡CONDICIÓN ALCANZADA!"
    },
    ai: { wrongAns: "Análisis incorrecto.", correct: "Lógica estabilizada.", intro: "Evaluación teórica activada." },
    levels: [
      { id: "CINETICA", name: "Teoría Cinética", th: "La temperatura mide la energía cinética promedio. Si calientas un gas, sus partículas se agitan violentamente.", q: "Si la temperatura de un gas aumenta, ¿qué le pasa a la energía de las partículas?", o: ["Aumenta", "Disminuye", "Se detienen", "Se congelan"], a: 0, m: "El calor es movimiento. A mayor temperatura, mayor velocidad molecular.", rw: "Así funcionan los globos aerostáticos: calientan el aire para que las partículas se agiten, se expandan y el globo flote.", targetVar: "t", targetVal: 600, cond: ">=", ctrl: "t" },
      { id: "BOYLE_1", name: "Ley de Boyle (T Constante)", th: "Robert Boyle descubrió que la Presión y el Volumen son INVERSAMENTE proporcionales. Si aprietas un gas, su presión sube.", q: "¿Qué le pasa a la presión si reduces el volumen a la mitad?", o: ["Baja a la mitad", "Se duplica", "No cambia", "Se vuelve cero"], a: 1, m: "Es una relación inversa. Menos espacio significa que las partículas chocan el doble de veces contra las paredes.", rw: "Esto es lo que sientes en los oídos al bucear: la presión del agua comprime el volumen de aire en tus tímpanos.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v" },
      { id: "CHARLES_1", name: "Ley de Charles (P Constante)", th: "Jacques Charles notó que el Volumen y la Temperatura son DIRECTAMENTE proporcionales. Si enfrías un gas, se contrae.", q: "Si metes un globo inflado en el congelador, ¿qué sucederá?", o: ["Se expande", "Explota", "Se encoge", "Nada"], a: 2, m: "Al perder energía térmica, las moléculas se mueven menos y ocupan menos espacio.", rw: "Por esta ley, las llantas de los autos parecen desinfladas en las mañanas frías de invierno.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t" },
      { id: "GAY_LUSSAC_1", name: "Ley de Gay-Lussac (V Constante)", th: "A volumen fijo, la Presión es DIRECTAMENTE proporcional a la Temperatura. Calentar un recipiente cerrado aumenta su presión interna.", q: "¿Por qué no debes tirar una lata de aerosol al fuego?", o: ["Se derrite", "La presión la hace explotar", "Apaga el fuego", "Cambia de color"], a: 1, m: "El volumen de la lata de metal es fijo. Al subir la temperatura, la presión aumenta hasta reventarla.", rw: "Esta es la física exacta detrás de las ollas de presión que usamos en la cocina para cocinar más rápido.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t" },
      { id: "BOYLE_2", name: "Boyle: Expansión", th: "Si P1 por V1 = P2 por V2, al expandir el volumen de los pulmones, la presión interna debe caer para que el aire entre.", q: "Tengo un gas a 2 atmósferas en 1 Litro. Si lo expando a 2 Litros, ¿cuál es la nueva presión?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Si el volumen se duplica, la presión debe caer a la mitad, es decir a 1 atmósfera.", rw: "El diafragma baja, expande el volumen del tórax, la presión cae y el aire entra solo.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v" },
      { id: "CHARLES_2", name: "Charles: Dilatación", th: "Para usar Charles, la temperatura DEBE estar en Kelvin. A más calor, más expansión.", q: "Si un gas está a 0 grados centígrados (273 Kelvin) y lo caliento a 273 grados (546 Kelvin), ¿su volumen...?", o: ["Sube poco", "Se duplica", "Se reduce", "Es cero"], a: 1, m: "La temperatura absoluta se duplicó, así que el volumen también debe duplicarse.", rw: "El motor de combustión calienta gases súbitamente; su rápida expansión empuja el pistón.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t" },
      { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosión", th: "Si enfrías drásticamente un recipiente rígido, la presión colapsará.", q: "Un tanque a 600 Kelvin y 4 atmósferas se enfría a 300 Kelvin. ¿Cuál es su presión final?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "La temperatura bajó a la mitad, la presión también baja a la mitad, quedando en 2.", rw: "Si lavas una botella con agua muy caliente y la tapas rápido, al enfriarse, la botella se aplastará sola.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t" },
      { id: "AVOGADRO", name: "Principio de Avogadro", th: "Volúmenes iguales de gases distintos bajo las mismas condiciones contienen el mismo número de moléculas.", q: "1 Litro de Oxígeno versus 1 Litro de Hidrógeno a la misma presión y temperatura. ¿Quién tiene más moléculas?", o: ["Oxígeno", "Hidrógeno", "Iguales", "Depende"], a: 2, m: "El tamaño del átomo no importa. El volumen depende de la presión y la temperatura, no de la identidad del gas.", rw: "Esto permitió a los científicos deducir las fórmulas moleculares correctas como H2O y CO2.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v" },
      { id: "GAS_IDEAL", name: "Gas Ideal (PV=nRT)", th: "P por V es igual a nRT. Esto unifica todas las leyes y muestra cómo todas las variables están interconectadas.", q: "Si Temperatura y Volumen se duplican simultáneamente, ¿qué le pasa a la Presión?", o: ["Sube", "Baja", "Se queda igual", "Cero"], a: 2, m: "Si la temperatura sube, la presión quiere subir. Si el volumen sube, la presión quiere bajar. Al duplicarse ambos, se anulan.", rw: "Esta ecuación rige el diseño de sistemas de soporte vital en la Estación Espacial Internacional.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t" },
      { id: "ZERO", name: "El Cero Absoluto", th: "El Cero Absoluto (0 Kelvin) es el límite teórico donde todo movimiento cinético se detiene por completo.", q: "¿Qué volumen teórico tiene un gas ideal a 0 Kelvin?", o: ["Infinito", "Cero", "Negativo", "Invariable"], a: 1, m: "La gráfica de Charles cruza el origen. A 0 Kelvin, el volumen es cero. En la realidad, la materia se licúa antes.", rw: "Los condensados de Bose-Einstein ocurren a fracciones de grado de este límite.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t" }
    ]
  },
  en: {
    ui: { start: "START THERMAL SIMULATION", title: "GAS THEORY MASTER", theoryTitle: "FUNDAMENTAL THEORY", theoryBtn: "ANALYZE ➔", diagTitle: "COGNITIVE EVALUATION", btnCheck: "VERIFY LAW", synthTitle: "REAL APPLICATION", btnNext: "NEXT LAW ➔", winTitle: "🏅 THERMODYNAMICS MASTERED", btnBack: "⬅ BACK", btnAI: "🤖 AI ASSIST", microTitle: "AI MICRO-CLASS", btnContinue: "RETRY", targetReached: "CONDITION REACHED!" },
    ai: { wrongAns: "Incorrect analysis.", correct: "Logic stabilized.", intro: "Theoretical evaluation active." },
    levels: [
      { id: "BOYLE_1", name: "Boyle's Law", th: "Pressure and Volume are inversely proportional.", q: "If you halve the volume, what happens to pressure?", o: ["Halves", "Doubles", "Stays same", "Zero"], a: 1, m: "Less space means twice the collisions.", rw: "This explains ear popping when diving underwater.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v" }
    ]
  }
};
const LANG_MAP = { es: 'es-ES', en: 'en-US' };

/* ============================================================
   ⚛️ 3. SIMULADOR 3D FÍSICO: EL PISTÓN CUÁNTICO
============================================================ */
const PistonChamber = ({ temp, volume, pressure }) => {
  const isHot = temp > 500;
  const isCold = temp < 150;
  const particleSpeed = Math.max(0.1, temp / 100);
  const particleColor = isHot ? "#ff0055" : (isCold ? "#00f2ff" : "#00ff88");
  
  const pistonRef = useRef();
  useFrame(() => {
    if (pistonRef.current) {
      pistonRef.current.position.y = THREE.MathUtils.lerp(pistonRef.current.position.y, volume, 0.1);
    }
  });

  return (
    <group position={[0, -3, 0]}>
      {/* Contenedor principal de vidrio */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 10, 32]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.1} roughness={0.1} metalness={0.9} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Base Sólida */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.4, 32]} />
        <meshStandardMaterial color={isHot ? "#550000" : (isCold ? "#002255" : "#222")} metalness={0.8} />
      </mesh>
      
      {/* Sistema del Pistón */}
      <group ref={pistonRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2.4, 2.4, 0.4, 32]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 10, 16]} />
          <meshStandardMaterial color="#888" metalness={1} />
        </mesh>
      </group>
      
      {/* Gas (Sparkles) */}
      <Sparkles count={300} scale={[4.5, volume, 4.5]} position={[0, volume / 2, 0]} size={6} speed={particleSpeed} color={particleColor} />
      
      {/* Telemetría Integrada (Holograma Lateral) */}
      <Text position={[4, 5, 0]} fontSize={0.6} color={particleColor} font="https://fonts.gstatic.com/s/orbitron/v25/yYK5cRXep8lBoySMYNenOweb.woff">
        {`T: ${temp.toFixed(0)} K\nV: ${volume.toFixed(1)} L\nP: ${pressure.toFixed(2)} atm`}
      </Text>
    </group>
  );
};

/* ============================================================
   🎮 4. MÁQUINA DE ESTADOS PRINCIPAL
============================================================ */
export default function GasTheory() {
  const { language, resetProgress } = useGameStore(); 
  
  // Resolución dinámica de idioma a prueba de fallos
  const safeLang = DICT[language] ? language : 'es';
  const d = DICT[safeLang];
  const lCode = LANG_MAP[safeLang] || 'es-ES';

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [microClassActive, setMicroClassActive] = useState(false);
  
  // Variables Físicas (PV=nRT -> k = 10)
  const k = 10;
  const [temp, setTemp] = useState(300); 
  const [vol, setVol] = useState(5);     
  const pressure = (k * temp) / (vol * 100); 

  const lvl = d.levels[levelIdx] || d.levels[0];

  // ==========================================
  // 🛑 SAFETY HOOK: CORTAR AUDIO AL DESMONTAR
  // ==========================================
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleBack = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    resetProgress();
  };

  const loadLevel = (idx) => {
    if (idx >= d.levels.length) { 
      setPhase("END"); 
      triggerVoice(d.ui.winTitle, lCode);
      return; 
    }
    setLevelIdx(idx);
    setTemp(300); setVol(5); // Resetear a estado base (300K, 5L)
    setPhase("THEORY");
    triggerVoice(d.levels[idx].th, lCode);
  };

  const handleAnswer = (idx) => {
    if (idx === lvl.a) {
      sfx.success(); 
      triggerVoice(d.ui.aiCorrect, lCode);
      setTimeout(() => setPhase("EXECUTION"), 1500);
    } else {
      sfx.error(); 
      setMicroClassActive(true); 
      triggerVoice(lvl.m, lCode);
    }
  };

  const verifyPhysicalState = () => {
    let currentVal = lvl.targetVar === 't' ? temp : vol;
    let isDone = false;

    if (lvl.cond === '>=') isDone = currentVal >= lvl.targetVal;
    if (lvl.cond === '<=') isDone = currentVal <= lvl.targetVal;

    if (isDone) {
      sfx.success();
      setPhase("SYNTHESIS");
      triggerVoice(lvl.rw, lCode);
    } else {
      sfx.error();
    }
  };

  if (phase === "BOOT") return (
    <div style={ui.overlayFull}>
      <h1 style={ui.titleGlow}>{d.ui.title}</h1>
      <p style={{color:'#00ff88', letterSpacing:'5px', marginBottom:'40px', fontSize: '14px'}}>CAMPAÑA GUIADA: 10 NIVELES DE TERMODINÁMICA</p>
      <button style={ui.btnHex('#00ff88')} onClick={() => { sfx.init(); loadLevel(0); }}>{d.ui.start}</button>
      <button style={{...ui.btnHex('#ff0055'), marginTop: '20px', border: '1px solid #ff0055'}} onClick={handleBack}>{d.ui.btnBack}</button>
    </div>
  );

  if (phase === "END") return (
    <div style={ui.overlayFull}>
      <h1 style={{color: '#0f0', fontSize: '60px', textShadow: '0 0 30px #0f0', letterSpacing: '5px'}}>{d.ui.winTitle}</h1>
      <p style={{color:'#aaa', marginBottom:'40px', fontSize: '20px'}}>Has completado el entrenamiento avanzado de Gas Theory.</p>
      <button style={ui.btnHex('#0f0')} onClick={handleBack}>{d.ui.btnBack}</button>
    </div>
  );

  return (
    <div style={ui.screen}>
      <button style={ui.backBtn} onClick={handleBack}>{d.ui.btnBack}</button>

      <div style={ui.hud}>
        <div style={ui.glassPanel}>
          <div style={ui.badge}>NIVEL {levelIdx + 1} / {d.levels.length}</div>
          <h2 style={{color:'#00ff88', margin:'10px 0', letterSpacing:'2px'}}>{lvl.name}</h2>
          {phase === "EXECUTION" && (
            <div style={{color:'#ffea00', fontSize:'14px', marginTop:'10px'}}>
              OBJETIVO: LLevar {lvl.targetVar === 't' ? 'Temperatura' : 'Volumen'} a {lvl.cond} {lvl.targetVal}
            </div>
          )}
        </div>
      </div>

      {phase === "THEORY" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#00ff88')}>
            <h2 style={{color: '#00ff88', letterSpacing:'3px'}}>{d.ui.theoryTitle}</h2>
            <p style={{fontSize:'22px', lineHeight:'1.6', margin:'30px 0', color: '#fff'}}>{lvl.th}</p>
            <button style={ui.btnSolid('#00ff88')} onClick={() => { setPhase("AI"); triggerVoice(d.ai.intro, lCode); }}>{d.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {phase === "AI" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#00f2ff')}>
            <h2 style={{color:'#00f2ff', letterSpacing:'3px'}}>{microClassActive ? d.ui.microTitle : d.ui.diagTitle}</h2>
            {!microClassActive ? (
              <>
                <p style={{fontSize:'24px', margin:'30px 0', color: '#fff'}}>{lvl.q}</p>
                <div style={ui.grid}>
                  {lvl.o.map((opt, i) => <button key={i} style={ui.btnOpt} onClick={() => handleAnswer(i)}>{opt}</button>)}
                </div>
              </>
            ) : (
              <>
                <p style={{color:'#ffea00', fontSize:'22px', lineHeight:'1.5', margin:'30px 0'}}>{lvl.m}</p>
                <button style={ui.btnSolid('#00f2ff')} onClick={() => { setPhase("AI"); setMicroClassActive(false); window.speechSynthesis.cancel(); }}>{d.ui.btnContinue}</button>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "EXECUTION" && (
        <div style={ui.dock}>
          {lvl.ctrl === 't' ? (
            <div style={ui.ctrlBox}>
              <div style={{color:'#ff0055', marginBottom:'10px', fontWeight:'bold', letterSpacing: '2px'}}>CONTROL TÉRMICO (K)</div>
              <input type="range" min="0" max="1000" value={temp} onChange={(e) => { setTemp(Number(e.target.value)); sfx.valve(); }} style={ui.slider('#ff0055')} />
            </div>
          ) : (
            <div style={ui.ctrlBox}>
              <div style={{color:'#00f2ff', marginBottom:'10px', fontWeight:'bold', letterSpacing: '2px'}}>CONTROL DE VOLUMEN (L)</div>
              <input type="range" min="1" max="10" step="0.1" value={vol} onChange={(e) => { setVol(Number(e.target.value)); sfx.valve(); }} style={ui.slider('#00f2ff')} />
            </div>
          )}
          <button style={ui.mainCheck} onClick={verifyPhysicalState}>{d.ui.btnCheck}</button>
        </div>
      )}

      {phase === "SYNTHESIS" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#0f0')}>
            <h2 style={{color:'#0f0', letterSpacing:'3px'}}>{d.ui.synthTitle}</h2>
            <p style={{fontSize:'24px', lineHeight:'1.5', margin:'30px 0', color: '#fff'}}>{lvl.rw}</p>
            <button style={ui.btnSolid('#0f0')} onClick={() => loadLevel(levelIdx + 1)}>{d.ui.btnNext}</button>
          </div>
        </div>
      )}

      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
        <Canvas camera={{position:[0, 2, 16], fov:45}}>
          <color attach="background" args={['#000308']} />
          <Stars count={5000} factor={4} fade />
          <Grid infiniteGrid position={[0, -3, 0]} sectionColor="#001520" cellColor="#002535" sectionSize={3} />
          <Suspense fallback={null}>
            <PistonChamber temp={temp} volume={vol} pressure={pressure} />
          </Suspense>
          <EffectComposer>
            <Bloom intensity={2} luminanceThreshold={0.1} />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
            <Scanline opacity={0.1} />
            <Vignette darkness={1.2} />
          </EffectComposer>
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} />
        </Canvas>
      </div>
    </div>
  );
}

// 🎨 ESTILOS "GOD TIER"
const ui = {
  screen: { position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', color:'#fff' },
  overlayFull: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000', zIndex:1000, position:'relative' },
  titleGlow: { color:'#00ff88', fontSize:'60px', letterSpacing:'10px', textShadow:'0 0 40px #00ff88', margin:'0 0 10px 0', textAlign: 'center' },
  btnHex: (c) => ({ padding:'20px 50px', background:'transparent', border:`2px solid ${c}`, color:c, fontSize:'20px', fontWeight:'bold', cursor:'pointer', borderRadius:'8px', fontFamily:'Orbitron', transition:'0.3s' }),
  backBtn: { position:'absolute', top:'30px', left:'30px', zIndex:500, padding:'12px 25px', background:'rgba(255,0,85,0.1)', border:'1px solid #ff0055', color:'#ff0055', cursor:'pointer', borderRadius:'5px', fontFamily:'Orbitron', fontWeight:'bold', transition: '0.2s' },
  hud: { position:'absolute', top:'30px', right:'30px', zIndex:100 },
  glassPanel: { background:'rgba(0,15,30,0.85)', border:'1px solid #00ff88', padding:'25px', borderRadius:'15px', textAlign:'right', backdropFilter:'blur(15px)', boxShadow:'0 0 30px rgba(0,255,136,0.2)' },
  badge: { background:'#00ff88', color:'#000', padding:'5px 15px', borderRadius:'5px', display:'inline-block', fontSize:'14px', fontWeight:'bold' },
  dock: { position:'absolute', bottom:'50px', left:'50%', transform:'translateX(-50%)', zIndex:150, background:'rgba(0,10,20,0.95)', padding:'30px 50px', borderRadius:'20px', border:'2px solid #00f2ff', textAlign:'center', display:'flex', alignItems:'center', gap:'40px', pointerEvents:'auto' },
  ctrlBox: { display:'flex', flexDirection:'column', alignItems:'center', width:'300px' },
  slider: (c) => ({ width:'100%', cursor:'pointer', accentColor: c, height: '10px' }),
  mainCheck: { padding:'20px 40px', background:'#00ff88', border:'none', color:'#000', fontWeight:'bold', fontSize:'18px', borderRadius:'10px', cursor:'pointer', fontFamily:'Orbitron', boxShadow:'0 0 20px #00ff88' },
  modalBg: { position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,5,10,0.95)', backdropFilter:'blur(20px)', pointerEvents:'auto' },
  modal: (c) => ({ border:`3px solid ${c}`, background:'#000', padding:'60px', borderRadius:'20px', textAlign:'center', maxWidth:'900px', width:'90%', boxShadow:`0 0 80px ${c}44` }),
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginTop:'30px' },
  btnOpt: { padding:'20px', background:'rgba(255,255,255,0.05)', border:'1px solid #444', color:'#fff', borderRadius:'10px', fontSize:'18px', cursor:'pointer', fontFamily:'Orbitron', transition:'0.2s', ":hover":{borderColor:'#00f2ff'} },
  btnSolid: (c) => ({ marginTop:'30px', padding:'20px 60px', background:c, color:'#000', fontWeight:'bold', fontSize:'20px', borderRadius:'10px', border:'none', cursor:'pointer', fontFamily:'Orbitron' })
};