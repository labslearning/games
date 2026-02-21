import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sphere, Float, ContactShadows, Sparkles, Torus, Center, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🔊 1. MOTOR DE AUDIO SCI-FI (TIER GOD)
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + dur);
    osc.start(); osc.stop(this.ctx.currentTime + dur);
  }
  click() { this._play('sine', 800, 400, 0.1, 0.1); }
  verify() { this._play('square', 400, 1200, 0.3, 0.1); }
  success() { this._play('sine', 440, 880, 0.5, 0.2); setTimeout(()=>this._play('sine', 660, 1320, 0.6, 0.2), 100); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.3); }
  aiPop() { this._play('triangle', 200, 600, 0.4, 0.2); }
}
const sfx = new QuantumAudio();

const triggerVoice = (text, lang) => {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang; u.rate = 1.0;
  window.speechSynthesis.speak(u);
};

/* ============================================================
   🌍 2. MATRIZ EDUCATIVA (22 NIVELES + I18N)
============================================================ */
const I18N = {
  es: {
    ui: { start: "INICIAR PROTOCOLO REDOX", title: "NANO-CORE BALANCER V12", theoryTitle: "BRIEFING QUÍMICO", theoryBtn: "CALIBRAR ➔", diagQ: "Equilibra electrones para estabilizar la materia.", btnCheck: "VERIFICAR BALANCE", btnBack: "⬅ SALIR", btnNext: "SIGUIENTE ECUACIÓN", aiTitle: "🤖 EVALUACIÓN IA", microTitle: "MICRO-CLASE IA", btnContinue: "CONTINUAR" },
    ai: { intro: "En Redox, la suma de cargas de los reactivos debe ser igual a la de los productos.", correct: "Felicidades. Has logrado un balance cuántico perfecto.", error: "Disonancia detectada. No has igualado los electrones transferidos.", microIntro: "Dato clave: " },
    levels: [
      { raw: "Zn + Cu²⁺ ➔ Zn²⁺ + Cu", val1: 1, val2: 1, sym1: "Zn", sym2: "Cu", c1: 0, c2: 2, r1: 2, r2: 0, q: "¿Cuántos electrones se transfieren?", opts: ["1", "2", "3", "0"], ans: 1, micro: "Cada átomo de Zinc cede exactamente 2 electrones al Cobre." },
      { raw: "Fe²⁺ + MnO₄⁻ ➔ Fe³⁺ + Mn²⁺", val1: 5, val2: 1, sym1: "Fe", sym2: "Mn", c1: 2, c2: 7, r1: 3, r2: 2, q: "¿Qué átomo se reduce?", opts: ["Fe", "Mn", "O", "Electrón"], ans: 1, micro: "El Manganeso baja su carga de +7 a +2, por lo tanto, se reduce." },
      { raw: "Al + O₂ ➔ Al³⁺ + O²⁻", val1: 4, val2: 3, sym1: "Al", sym2: "O", c1: 0, c2: 0, r1: 3, r2: -2, q: "¿Qué carga final adquiere el Aluminio?", opts: ["+1", "+2", "+3", "-3"], ans: 2, micro: "El Aluminio pierde 3 electrones para estabilizarse como un catión trivalente." },
      { raw: "H₂ + O₂ ➔ H⁺ + O²⁻", val1: 2, val2: 1, sym1: "H", sym2: "O", c1: 0, c2: 0, r1: 1, r2: -2, q: "Es el motor del universo, ¿cuántos e- cede cada H2?", opts: ["1", "2", "3", "4"], ans: 1, micro: "Cada molécula de H2 tiene dos átomos, cada uno cede un electrón, total 2." },
      { raw: "Cu + Ag⁺ ➔ Cu²⁺ + Ag", val1: 1, val2: 2, sym1: "Cu", sym2: "Ag", c1: 0, c2: 1, r1: 2, r2: 0, q: "¿Cuál es el agente oxidante?", opts: ["Cu", "Ag+", "e-", "Ag"], ans: 1, micro: "El Ag+ es el agente oxidante porque se reduce (gana electrones) forzando al Cu a oxidarse." },
      { raw: "Cl₂ + Br⁻ ➔ Cl⁻ + Br₂", val1: 1, val2: 2, sym1: "Cl", sym2: "Br", c1: 0, c2: -1, r1: -1, r2: 0, q: "¿Cuántos electrones gana el Cloro molecular?", opts: ["1", "2", "3", "0"], ans: 1, micro: "El Cl2 gana 2 electrones totales para que cada Cl sea un ion estable Cl-." },
      { raw: "MnO₂ + HCl ➔ Mn²⁺ + Cl₂", val1: 1, val2: 4, sym1: "Mn", sym2: "Cl", c1: 4, c2: -1, r1: 2, r2: 0, q: "¿A qué estado pasa el Manganeso?", opts: ["+4", "+2", "+3", "0"], ans: 1, micro: "El MnO2 (+4) se reduce a Mn+2 liberando cloro gaseoso." },
      { raw: "Pb + PbO₂ ➔ Pb²⁺", val1: 1, val2: 1, sym1: "Pb", sym2: "Pb", c1: 0, c2: 4, r1: 2, r2: 2, q: "Es una batería de coche, ¿cuántos e- viajan?", opts: ["1", "2", "3", "4"], ans: 1, micro: "Se intercambian 2 electrones del plomo metálico al óxido de plomo." },
      { raw: "Mg + HCl ➔ Mg²⁺ + H₂", val1: 1, val2: 2, sym1: "Mg", sym2: "H", c1: 0, c2: 1, r1: 2, r2: 0, q: "¿Qué gas se libera en esta oxidación?", opts: ["H2", "O2", "Cl2", "CO2"], ans: 0, micro: "El magnesio desplaza al hidrógeno del ácido, liberando hidrógeno gaseoso." },
      { raw: "Cr₂O₇²⁻ + Fe²⁺ ➔ Cr³⁺ + Fe³⁺", val1: 1, val2: 6, sym1: "Cr", sym2: "Fe", c1: 6, c2: 2, r1: 3, r2: 3, q: "¿Cuál es el balance del Cromo?", opts: ["3e-", "6e-", "1e-", "2e-"], ans: 1, micro: "Cada Cromo gana 3 electrones, como hay 2 en el dicromato, el total es 6 electrones." },
      { raw: "S + HNO₃ ➔ SO₂ + NO", val1: 3, val2: 4, sym1: "S", sym2: "N", c1: 0, c2: 5, r1: 4, r2: 2, q: "¿Qué elemento se oxida más?", opts: ["Azufre", "Nitrógeno", "Oxígeno", "Hidrógeno"], ans: 0, micro: "El Azufre sube su carga de 0 a +4, oxidándose significativamente." },
      { raw: "I₂ + S₂O₃²⁻ ➔ I⁻ + S₄O₆²⁻", val1: 1, val2: 2, sym1: "I", sym2: "S", c1: 0, c2: 2, r1: -1, r2: 2.5, q: "¿Cuántos e- gana el Yodo?", opts: ["1", "2", "3", "4"], ans: 1, micro: "El I2 capta 2 electrones para separarse en dos aniones yoduro." },
      { raw: "C + H₂SO₄ ➔ CO₂ + SO₂", val1: 1, val2: 2, sym1: "C", sym2: "S", c1: 0, c2: 6, r1: 4, r2: 4, q: "¿Qué sucede con el Carbono?", opts: ["Se reduce", "Se oxida", "No cambia", "Desaparece"], ans: 1, micro: "El Carbono cede 4 electrones, transformándose en dióxido de carbono gaseoso." },
      { raw: "H₂S + Cl₂ ➔ S + Cl⁻", val1: 1, val2: 1, sym1: "S", sym2: "Cl", c1: -2, c2: 0, r1: 0, r2: -1, q: "¿Quién pierde electrones?", opts: ["Azufre", "Cloro", "Hidrógeno", "Agua"], ans: 0, micro: "El Sulfuro (-2) pierde 2 electrones para convertirse en Azufre elemental (0)." },
      { raw: "As₂O₃ + NO₃⁻ ➔ H₃AsO₄ + NO", val1: 3, val2: 4, sym1: "As", sym2: "N", c1: 3, c2: 5, r1: 5, r2: 2, q: "¿Cambio de carga del Arsénico?", opts: ["+1", "+2", "+3", "+5"], ans: 3, micro: "El Arsénico se oxida pasando de +3 a +5 en medio ácido." },
      { raw: "P + HNO₃ ➔ H₃PO₄ + NO₂", val1: 1, val2: 5, sym1: "P", sym2: "N", c1: 0, c2: 5, r1: 5, r2: 4, q: "¿Cuántos electrones cede el Fósforo?", opts: ["2", "3", "5", "1"], ans: 2, micro: "El fósforo elemental es un gran reductor, cediendo 5 electrones al Nitrógeno." },
      { raw: "Cu + HNO₃ ➔ Cu²⁺ + NO", val1: 3, val2: 2, sym1: "Cu", sym2: "N", c1: 0, c2: 5, r1: 2, r2: 2, q: "¿Cúantos cobres balancean al nitrógeno?", opts: ["1", "2", "3", "4"], ans: 2, micro: "Para balancear los 3 electrones que gana el N y los 2 que pierde el Cu, necesitamos 3 Cobres." },
      { raw: "MnO₄⁻ + I⁻ ➔ MnO₂ + I₂", val1: 2, val2: 6, sym1: "Mn", sym2: "I", c1: 7, c2: -1, r1: 4, r2: 0, q: "Medio básico, ¿qué carga tiene el Mn final?", opts: ["+7", "+4", "+2", "0"], ans: 1, micro: "En medio básico, el Permanganato se reduce a Dióxido de Manganeso (+4)." },
      { raw: "Fe + O₂ ➔ Fe₂O₃", val1: 4, val2: 3, sym1: "Fe", sym2: "O", c1: 0, c2: 0, r1: 3, r2: -2, q: "Es la corrosión, ¿cuántos e- cede el Hierro?", opts: ["1", "2", "3", "4"], ans: 2, micro: "Cada hierro pierde 3 electrones para formar el óxido férrico estable." },
      { raw: "CH₄ + O₂ ➔ CO₂ + H₂O", val1: 1, val2: 2, sym1: "C", sym2: "O", c1: -4, c2: 0, r1: 4, r2: -2, q: "¿Carga del Carbono en el metano?", opts: ["-4", "0", "+4", "-2"], ans: 0, micro: "En el metano, el carbono es más electronegativo que el hidrógeno, teniendo carga de -4." },
      { raw: "KMnO₄ + H₂O₂ ➔ Mn²⁺ + O₂", val1: 2, val2: 5, sym1: "Mn", sym2: "O", c1: 7, c2: -1, r1: 2, r2: 0, q: "¿Qué sucede con el agua oxigenada?", opts: ["Se oxida", "Se reduce", "No reacciona", "Se congela"], ans: 0, micro: "El H2O2 actúa como reductor aquí, oxidándose a Oxígeno gaseoso." },
      { raw: "Final Boss: Pila Daniell", val1: 1, val2: 1, sym1: "Zn", sym2: "Cu", c1: 0, c2: 2, r1: 2, r2: 0, q: "¿Dónde ocurre la oxidación?", opts: ["Ánodo (Zn)", "Cátodo (Cu)", "Puente Salino", "Cable"], ans: 0, micro: "La oxidación siempre ocurre en el Ánodo. El Zinc cede los electrones que viajan por el circuito." }
    ]
  },
  en: {
    ui: { start: "START REDOX PROTOCOL", title: "NANO-CORE BALANCER V12", theoryTitle: "CHEMICAL BRIEFING", theoryBtn: "CALIBRATE ➔", diagQ: "Balance electrons to stabilize matter.", btnCheck: "VERIFY BALANCE", btnBack: "⬅ EXIT", btnNext: "NEXT EQUATION", aiTitle: "🤖 AI EVALUATION", microTitle: "AI MICRO-CLASS", btnContinue: "CONTINUE" },
    ai: { intro: "In Redox, the total charge of reactants must equal the products.", correct: "Congratulations. You achieved perfect quantum balance.", error: "Dissonance detected. You haven't matched the transferred electrons.", microIntro: "Key fact: " },
    levels: [
      { raw: "Zn + Cu²⁺ ➔ Zn²⁺ + Cu", val1: 1, val2: 1, sym1: "Zn", sym2: "Cu", c1: 0, c2: 2, r1: 2, r2: 0, q: "How many electrons are transferred?", opts: ["1", "2", "3", "0"], ans: 1, micro: "Each Zinc atom gives exactly 2 electrons to Copper." }
    ]
  }
};

// Generar FR y DE dinámicamente como placeholders pedagógicos
I18N.fr = { ...I18N.en, ui: { ...I18N.en.ui, title: "BALANCEUR REDOX V12", start: "DÉMARRER" } };
I18N.de = { ...I18N.en, ui: { ...I18N.en.ui, title: "REDOX-GLEICHGEWICHT V12", start: "STARTEN" } };

const LANG_CODES = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

/* ============================================================
   ⚛️ 3. SIMULACIÓN ATÓMICA 3D PROFESIONAL
============================================================ */
const QuantumAtom = ({ symbol, charge, color, count, position, active }) => {
  const group = useRef();
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.01;
      group.current.position.y += Math.sin(state.clock.elapsedTime) * 0.002;
    }
  });

  return (
    <group ref={group} position={position}>
      <Center>
        {[...Array(Math.min(count, 8))].map((_, i) => (
          <group key={i} position={[Math.sin(i) * 1.5, Math.cos(i) * 0.5, i * 0.2]}>
            {/* Núcleo */}
            <Sphere args={[0.7, 32, 32]}>
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 15 : 2} metalness={1} roughness={0} />
            </Sphere>
            {/* Nube Cuántica */}
            <Torus args={[1.3, 0.01, 16, 100]} rotation={[i, 1, 0]}>
              <meshBasicMaterial color={active ? "#0f0" : color} transparent opacity={0.2} />
            </Torus>
            <Sparkles count={40} scale={2} size={3} color={color} speed={active ? 4 : 1} />
          </group>
        ))}
        <Text position={[0, -2.5, 0]} fontSize={0.8} color="#fff" font="https://fonts.gstatic.com/s/orbitron/v25/yYK5cRXep8lBoySMYNenOweb.woff">
          {count > 1 ? count : ''}{symbol} {charge !== 0 ? (charge > 0 ? `+${charge}` : charge) : '0'}
        </Text>
      </Center>
    </group>
  );
};

/* ============================================================
   🎮 4. COMPONENTE PRINCIPAL (FSM)
============================================================ */
export default function RedoxBalancer() {
  const { language } = useGameStore();
  const lang = I18N[language] ? language : 'es';
  const dict = I18N[lang];
  const lCode = LANG_CODES[lang];

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [aiState, setAiState] = useState("Q");
  const [balanced, setBalanced] = useState(false);

  const level = dict.levels[levelIdx] || dict.levels[0];

  const handleBack = () => {
    window.speechSynthesis?.cancel();
    window.location.href = '/';
  };

  const handleStart = () => {
    sfx.init();
    sfx.success();
    setPhase("THEORY");
    triggerVoice(dict.ai.intro, lCode);
  };

  const updateCoef = (side, delta) => {
    sfx.click();
    if (side === 1) setC1(Math.max(1, c1 + delta));
    else setC2(Math.max(1, c2 + delta));

    const totalClicks = clicks + 1;
    setClicks(totalClicks);
    if (totalClicks % 6 === 0) {
      sfx.aiPop();
      setPhase("AI");
      setAiState("Q");
    }
  };

  const verify = () => {
    sfx.verify();
    if (c1 === level.v1 && c2 === level.v2) {
      setBalanced(true);
      sfx.success();
      setTimeout(() => {
        setPhase("WIN");
        triggerVoice(dict.ai.correct, lCode);
      }, 800);
    } else {
      sfx.error();
      triggerVoice(dict.ai.error, lCode);
    }
  };

  const handleAiAns = (idx) => {
    if (idx === level.ans) {
      sfx.success();
      setPhase("GAME");
    } else {
      sfx.error();
      setAiState("MICRO");
      triggerVoice(dict.ai.microIntro + level.micro, lCode);
    }
  };

  if (phase === "BOOT") return (
    <div style={ui.overlayFull}>
      <h1 style={ui.titleGlow}>{dict.ui.title}</h1>
      <p style={{color:'#00f2ff', letterSpacing:'5px', fontSize:'12px'}}>Nivel 1-22: Dominio de la Transferencia de Carga</p>
      <button style={ui.btnHex} onClick={handleStart}>{dict.ui.start}</button>
    </div>
  );

  return (
    <div style={ui.screen}>
      <button style={ui.backBtn} onClick={handleBack}>{dict.ui.back}</button>

      {/* HUD HOLOGRÁFICO */}
      <div style={ui.hud}>
        <div style={ui.glassPanel}>
          <div style={ui.levelBadge}>{dict.ui.level} {levelIdx + 1} / 22</div>
          <div style={ui.formula}>
            <span style={{color:'#ffea00'}}>{c1 > 1 ? c1 : ''}</span>{level.raw.split('➔')[0]}
            <span style={{color:'#0f0'}}> ➔ </span>
            <span style={{color:'#ffea00'}}>{c2 > 1 ? c2 : ''}</span>{level.raw.split('➔')[1]}
          </div>
        </div>
      </div>

      {/* MODALES */}
      {phase === "THEORY" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#00f2ff')}>
            <h2>{dict.ui.theoryTitle}</h2>
            <p style={{fontSize:'22px', lineHeight:'1.4'}}>{level.micro}</p>
            <button style={ui.btnSolid} onClick={()=>setPhase("GAME")}>{dict.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {phase === "AI" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#ff00ff')}>
            <h2>{aiState === "Q" ? dict.ui.ai : dict.ui.micro}</h2>
            {aiState === "Q" ? (
              <>
                <p style={{fontSize:'24px'}}>{level.q}</p>
                <div style={ui.grid}>
                  {level.opts.map((o, i) => <button key={i} style={ui.btnOpt} onClick={()=>handleAiAns(i)}>{o}</button>)}
                </div>
              </>
            ) : (
              <>
                <p style={{color:'#ffea00', fontSize:'20px', lineHeight:'1.5'}}>{level.micro}</p>
                <button style={ui.btnSolid} onClick={()=>setPhase("GAME")}>{dict.ui.retry}</button>
              </>
            )}
          </div>
        </div>
      )}

      {phase === "WIN" && (
        <div style={ui.modalBg}>
          <div style={ui.modal('#0f0')}>
            <h2 style={{color:'#0f0'}}>SYSTEM STABILIZED</h2>
            <p style={{fontSize:'22px'}}>{dict.ai.correct}</p>
            <button style={ui.btnSolid} onClick={()=>{
              if(levelIdx === 21) { setPhase("BOOT"); setLevelIdx(0); }
              else { setLevelIdx(levelIdx + 1); setC1(1); setC2(1); setBalanced(false); setPhase("THEORY"); }
            }}>{dict.ui.next}</button>
          </div>
        </div>
      )}

      {/* CONTROLES */}
      <div style={ui.dock}>
        <div style={ui.controlGroup}><button style={ui.roundBtn} onClick={()=>updateCoef(1, 1)}>+</button><div style={ui.val}>{c1}</div><button style={ui.roundBtn} onClick={()=>updateCoef(1, -1)}>-</button></div>
        <button style={ui.mainCheck} onClick={verify}>{dict.ui.check}</button>
        <div style={ui.controlGroup}><button style={ui.roundBtn} onClick={()=>updateCoef(2, 1)}>+</button><div style={ui.val}>{c2}</div><button style={ui.roundBtn} onClick={()=>updateCoef(2, -1)}>-</button></div>
      </div>

      <div style={{position:'absolute', inset:0, zIndex:1}}>
        <Canvas camera={{position:[0, 2, 12], fov:45}}>
          <color attach="background" args={['#00050a']} />
          <Stars count={8000} factor={4} fade speed={2} />
          <Grid infiniteGrid position={[0, -4, 0]} sectionColor="#001520" cellColor="#002535" sectionSize={3} cellSize={1} />
          <Suspense fallback={null}>
            <QuantumAtom symbol={level.sym1} charge={level.c1} color="#00f2ff" count={c1} position={[-5, 0, 0]} active={balanced} />
            <QuantumAtom symbol={level.sym2} charge={level.c2} color="#ff0055" count={c2} position={[5, 0, 0]} active={balanced} />
          </Suspense>
          <EffectComposer>
            <Bloom intensity={balanced ? 6 : 2} luminanceThreshold={0.1} />
            <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} />
            <Scanline opacity={0.1} />
            <Vignette darkness={1.2} />
          </EffectComposer>
        </Canvas>
      </div>
    </div>
  );
}

const ui = {
  screen: { position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif' },
  overlayFull: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000', zIndex:1000, position:'relative' },
  titleGlow: { color:'#00f2ff', fontSize:'50px', letterSpacing:'15px', textShadow:'0 0 40px #00f2ff', margin:0 },
  btnHex: { marginTop:'40px', padding:'25px 60px', background:'transparent', border:'2px solid #00f2ff', color:'#00f2ff', fontSize:'22px', fontWeight:'bold', cursor:'pointer', borderRadius:'10px' },
  backBtn: { position:'absolute', top:'30px', right:'30px', zIndex:500, padding:'12px 25px', background:'rgba(255,0,85,0.1)', border:'1px solid #ff0055', color:'#ff0055', cursor:'pointer', borderRadius:'5px' },
  hud: { position:'absolute', top:'40px', left:'40px', zIndex:100, pointerEvents:'none' },
  glassPanel: { background:'rgba(0,25,45,0.85)', border:'1px solid #00f2ff44', padding:'35px', borderRadius: '20px', minWidth:'550px' },
  levelBadge: { background:'#ff0055', padding:'5px 15px', borderRadius:'5px', display:'inline-block', fontSize:'12px' },
  formula: { fontSize:'45px', marginTop:'20px', fontWeight:'900', letterSpacing:'4px', color:'#fff' },
  dock: { position:'absolute', bottom:'50px', left:'50%', transform:'translateX(-50%)', zIndex:150, display:'flex', gap:'60px', alignItems:'center', background:'rgba(0,0,0,0.95)', padding:'30px 60px', borderRadius:'100px', border:'2px solid #00f2ff33' },
  controlGroup: { display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' },
  roundBtn: { width:'50px', height:'50px', borderRadius:'50%', border:'1px solid #00f2ff66', background:'#111', color:'#00f2ff', fontSize:'24px', cursor:'pointer' },
  val: { fontSize:'38px', fontWeight:'900', color:'#ffea00' },
  mainCheck: { padding:'20px 50px', background:'#00f2ff', border:'none', color:'#000', fontWeight:'900', fontSize:'20px', cursor:'pointer', borderRadius:'15px' },
  modalBg: { position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,5,10,0.95)', backdropFilter:'blur(20px)' },
  modal: (c) => ({ border:`3px solid ${c}`, background:'#000', padding:'60px', borderRadius:'30px', textAlign:'center', maxWidth:'850px' }),
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'25px', marginTop:'40px' },
  btnOpt: { padding:'20px', background:'rgba(255,255,255,0.03)', border:'1px solid #333', color:'#fff', borderRadius:'12px', fontSize:'20px', cursor:'pointer' },
  btnSolid: { marginTop:'40px', padding:'20px 60px', background:'#00f2ff', color:'#000', fontWeight:'bold', fontSize:'20px', borderRadius:'10px', border:'none' }
};
