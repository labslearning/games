import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Trail, Grid, Line, Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';

/* ============================================================
   🌌 API DEEPSEEK (THE NEURAL LINK)
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🛡️ 1. KERNEL SHIELD (ERROR BOUNDARY)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("Kinematic Core Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#050010', color: '#0f0', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', padding: '40px', textAlign:'center', zIndex: 9999 }}>
          <h1 style={{ fontSize: 'clamp(30px, 8vw, 60px)', textShadow: '0 0 30px #f00', color: '#ff0033' }}>⚠️ KINEMATIC MATRIX COLLAPSE</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: '20px', borderRadius: '10px', border:'1px solid #f00', maxWidth:'800px', fontSize: '18px', color: '#fff' }}>{this.state.errorMsg}</p>
          <button onClick={() => { window.localStorage.removeItem('icfes_physics_history_v1'); window.location.reload(); }} style={{ marginTop: '30px', padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#00f2ff', color: '#000', border: 'none', borderRadius: '5px', fontWeight:'bold' }}>Reboot Physics Engine</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🔊 2. MOTOR DE AUDIO HÁPTICO (GAME FEEL)
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gain = null; }
  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.15;
        this.gain.connect(this.ctx.destination);
      } catch (e) {}
    }
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol = 0.1) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(); const g = this.ctx.createGain();
      osc.connect(g); g.connect(this.gain);
      osc.type = type; osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 1200, 800, 0.1, 0.1); } 
  success() { this._play('square', 400, 1600, 0.5, 0.2); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.2); }
  aiPop() { this._play('triangle', 2000, 2500, 0.4, 0.1); }
  engineStart() { this._play('square', 50, 200, 1.5, 0.3); } 
  nearMiss() { this._play('sine', 300, 100, 0.4, 0.2); }
}
const sfx = new QuantumAudio();

/* ============================================================
   📚 3. ARQUITECTURA DE MISIONES PROCEDURALES
============================================================ */
// 🔴 CORE FIX: Aseguramos que la generación siempre devuelve datos válidos
const generateMissions = () => {
    const distM1 = Math.floor(Math.random() * 10) + 15;
    const distM2 = Math.floor(Math.random() * 20) + 20;
    const timeM2 = 5;
    const distM3 = Math.floor(Math.random() * 30) + 30;
    const timeM3 = 4;
    
    return [
      { 
        id: 1, topic: "POSICIÓN Y DESPLAZAMIENTO", 
        desc: `Transporta el núcleo al objetivo en la coordenada X=${distM1}, Z=-10. Ajusta la telemetría posicional.`, 
        logic: "teleport", initial: { p:[0,0,0], v:[0,0,0], a:[0,0,0] }, target: [distM1, 0, -10], 
        inputs: ["posX", "posZ"], tolerance: 1.5, limitTime: 1, 
        equation: `Δx = x_f - x_i` 
      },
      { 
        id: 2, topic: "VELOCIDAD CONSTANTE (MRU)", 
        desc: `El dron solo viaja a velocidad constante. Intercepta el objetivo a X=${distM2}m en EXACTAMENTE ${timeM2} segundos.`, 
        logic: "mru", initial: { p:[0,0,0], v:[0,0,0], a:[0,0,0] }, target: [distM2, 0, 0], 
        inputs: ["velX"], tolerance: 2, limitTime: timeM2, 
        equation: `v = d / t = ${distM2} / ${timeM2}` 
      },
      { 
        id: 3, topic: "ACELERACIÓN CONSTANTE (MRUA)", 
        desc: `El dron parte del reposo (v0=0). Configura la aceleración (eje X) para alcanzar el objetivo a ${distM3}m en exactamente ${timeM3} segundos.`, 
        logic: "mrua", initial: { p:[0,0,0], v:[0,0,0], a:[0,0,0] }, target: [distM3, 0, 0], 
        inputs: ["accX"], tolerance: 2.5, limitTime: timeM3, 
        equation: `d = 0.5 * a * t² ➔ a = (2*${distM3}) / ${timeM3}²` 
      }
    ];
};

const DATABANK = {
  es: [
    "POSICIÓN Y DESPLAZAMIENTO: La posición es una coordenada en el espacio (X, Z). El desplazamiento es el vector línea recta entre tu posición inicial y final.",
    "VELOCIDAD (MRU): En el Movimiento Rectilíneo Uniforme, la aceleración es CERO. La velocidad es constante a lo largo de todo el recorrido. La fórmula maestra de supervivencia es Velocidad = Distancia / Tiempo.",
    "ACELERACIÓN (MRUA): Representa el cambio de velocidad en el tiempo. Si aceleras, tu dron irá cada vez más rápido. Partiendo del reposo (v0=0), la distancia que recorres crece de forma cuadrática con el tiempo (t²)."
  ]
};

const DICT_UI = {
  es: { title: "THE MOTION LAB", btnExec: "INICIAR SECUENCIA", target: "TARGET", aiTitle: "ANOMALÍA DETECTADA", history: "ARCHIVOS", pdfBtn: "PDF", back: "VOLVER", retry: "RECALCULAR TRAYECTORIA", next: "SIGUIENTE NIVEL", guide: "DATABANK", nearMiss: "IMPACTO CERCANO (Revisa decimales)" }
};

/* ============================================================
   🤖 4. RED NEURONAL DEEPSEEK
============================================================ */
class PhysicsAIEngine {
  static cleanJSON(raw) {
    if (!raw) throw new Error("EMPTY");
    try {
      let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{'); const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) cleaned = cleaned.substring(start, end + 1);
      try { return JSON.parse(cleaned); } 
      catch (e) {
          cleaned = cleaned.replace(/(?<!\\)\n/g, ' ').replace(/(?<!\\)\r/g, '').replace(/\\"/g, "'");
          return JSON.parse(cleaned);
      }
    } catch (e) { return null; }
  }

  static async generatePhysicsMasterclass(topic, lang) {
    const sysPrompt = `
      Eres el Tutor IA Socrático de un laboratorio de física cuántica.
      Genera un dilema analítico de opción múltiple sobre: "${topic}".
      Idioma de salida: SPANISH.
      
      ESTRUCTURA JSON ESTRICTA:
      {
        "title": "CONCEPTO: TEMA",
        "theory": "Explicación teórica profunda y concisa de cómo funciona este fenómeno (Max 100 palabras).",
        "trap": "Error mental típico o trampa en la que caen los estudiantes del ICFES al calcular esto.",
        "protocol": "1. Primer paso para evitar el error.\\n2. Segundo paso para resolver.",
        "demoQuestion": {
           "text": "Plantea un problema físico o conceptual avanzado...",
           "options": ["Respuesta Correcta", "Trampa 1", "Trampa 2", "Trampa 3"],
           "correctIdx": 0,
           "analysis": "Explica matemáticamente o conceptualmente por qué la opción correcta es la única posible."
        }
      }
    `;

    try {
      const res = await fetch(DEEPSEEK_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7, response_format: { type: "json_object" } })
      });
      const data = await res.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      
      if(parsed && parsed.demoQuestion) {
          const items = parsed.demoQuestion.options.map((opt, i) => ({ text: opt, isCorrect: i === parsed.demoQuestion.correctIdx }));
          items.sort(() => Math.random() - 0.5);
          parsed.demoQuestion.correctIdx = items.findIndex(i => i.isCorrect);
          parsed.demoQuestion.options = items.map(i => i.text);
      }
      return parsed;

    } catch (error) {
      return {
        title: `SISTEMA OFFLINE: ${topic}`,
        theory: "La cinemática exige diferenciar entre velocidad y aceleración. Si la velocidad es constante, la aceleración es obligatoriamente 0.",
        trap: "Creer que ir rápido significa tener una alta aceleración. Un tren bala a 300km/h tiene aceleración CERO si su velocidad no cambia.",
        protocol: "1. Lee el enunciado. 2. Si dice 'velocidad constante', elimina la aceleración de tus ecuaciones.",
        demoQuestion: { text: "Un objeto frena hasta detenerse. ¿Su aceleración es?", options: ["Positiva", "Negativa (vector opuesto a la velocidad)", "Cero", "Infinita"], correctIdx: 1, analysis: "Para reducir la velocidad de un objeto, el vector aceleración debe actuar en sentido contrario al movimiento (fricción, frenos)." }
      };
    }
  }
}

const MarkdownParser = ({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:15px;">$1</h3>')
                         .replace(/## (.*)/g, '<h2 style="color:#ffaa00; margin-top:15px;">$1</h2>')
                         .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#0f0;">$1</strong>')
                         .replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
        return { __html: parsed };
    }, [text]);
    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#fff', fontSize: '15px', lineHeight: '1.5' }} />;
};

// GENERADOR DE PDF AVANZADO
const downloadPDF = (classData, lang) => {
    sfx.scanSweep();
    const date = new Date().toLocaleString();
    const printWindow = window.open('', '', 'height=900,width=850');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <title>Physics Masterclass - Learning Labs</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@400;700&display=swap');
                    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #1e293b; padding: 40px; line-height: 1.6; max-width: 800px; margin: auto; }
                    .header { border-bottom: 4px solid #0055ff; padding-bottom: 20px; margin-bottom: 30px; }
                    h1 { font-family: 'Orbitron', sans-serif; color: #000; text-transform: uppercase; font-size: 28px; margin-bottom: 5px; }
                    .date { color: #666; font-size: 12px; font-weight: bold; background: #eee; display: inline-block; padding: 5px 10px; border-radius: 4px; }
                    .section-title { font-size: 18px; font-weight: 900; color: #0055ff; text-transform: uppercase; margin-top: 30px; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }
                    .content-box { background: #f8fafc; border-left: 4px solid #0055ff; padding: 15px 20px; margin-bottom: 20px; font-size: 15px; }
                    .trap-title { color: #ef4444; border-bottom-color: #ef4444; }
                    .trap-box { border-left-color: #ef4444; background: #fef2f2; }
                    .sim-box { border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin-top: 30px; page-break-inside: avoid; }
                    .sim-title { text-align: center; color: #065f46; font-size: 18px; margin-top: 0; text-transform: uppercase; }
                    .question { font-style: italic; margin-bottom: 20px; background: #f1f5f9; padding: 15px; border-radius: 5px; }
                    .option { padding: 10px; border: 1px solid #cbd5e1; margin-bottom: 8px; border-radius: 5px; }
                    .correct-opt { border-color: #10b981; background: #ecfdf5; color: #065f46; font-weight: bold; }
                    .analysis { background: #f0fdfa; border-left: 4px solid #10b981; padding: 15px 20px; margin-top: 20px; font-size: 15px; color: #064e3b; }
                    .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>MOTION PROTOCOL: ${classData.title}</h1>
                    <div class="date">Extraction: ${date}</div>
                </div>
                <div class="section-title">TEORÍA FÍSICA</div>
                <div class="content-box">${classData.theory.replace(/\n/g, '<br/>')}</div>
                <div class="section-title trap-title">TRAMPA ICFES DETECTADA</div>
                <div class="content-box trap-box">${classData.trap.replace(/\n/g, '<br/>')}</div>
                <div class="section-title">PROTOCOLO DE RESOLUCIÓN</div>
                <div class="content-box">${classData.protocol.replace(/\n/g, '<br/>')}</div>
                ${classData.demoQuestion ? `
                <div class="sim-box">
                    <h3 class="sim-title">ESCENARIO TÁCTICO</h3>
                    <div class="question">${classData.demoQuestion.text}</div>
                    ${classData.demoQuestion.options.map((opt, i) => `
                        <div class="option ${i === classData.demoQuestion.correctIdx ? 'correct-opt' : ''}">
                            ${String.fromCharCode(65 + i)}. ${opt} ${i === classData.demoQuestion.correctIdx ? '✓ (Respuesta Correcta)' : ''}
                        </div>
                    `).join('')}
                    <div class="analysis"><strong>ANÁLISIS MATEMÁTICO:</strong><br/>${classData.demoQuestion.analysis.replace(/\n/g, '<br/>')}</div>
                </div>
                ` : ''}
                <div class="footer">LEARNING LABS K-ENGINE V1000.1<br/>La cognición encarnada es el futuro del aprendizaje.</div>
            </body>
        </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.focus(); printWindow.print(); }, 750);
};

/* ============================================================
   🎥 5. MOTOR FÍSICO 3D (EMBODIED COGNITION ENGINE)
============================================================ */
const HolographicMarker = ({ position, text, color }) => (
    <Html position={position} center distanceFactor={25} zIndexRange={[100, 0]}>
        <div style={{ color: color, fontFamily: 'monospace', fontWeight: 'bold', fontSize: '10px', background: 'rgba(0,0,0,0.6)', padding: '2px 6px', border: `1px solid ${color}`, borderRadius: '4px', textShadow: `0 0 5px ${color}`, pointerEvents: 'none', whiteSpace:'nowrap', textTransform:'uppercase' }}>
            {text}
        </div>
    </Html>
);

const PhysicsWorld = ({ mission, inputs, simStatus, currentPos }) => {
  const targetRef = useRef();
  
  // 🔴 CORE FIX: Protección contra inputs 'undefined' al calcular el Ghost Drone
  const ghostPos = useMemo(() => {
      let gx = mission.initial.p[0];
      let gz = mission.initial.p[2];
      const t = mission.limitTime;
      if (mission.logic === 'teleport') {
          gx = parseFloat(inputs.posX) || 0; 
          gz = parseFloat(inputs.posZ) || 0;
      } else if (mission.logic === 'mru') {
          gx += (parseFloat(inputs.velX) || 0) * t; 
          gz += (parseFloat(inputs.velZ) || 0) * t; // En Misión 2 velZ puede no existir, fallbacks a 0
      } else if (mission.logic === 'mrua') {
          gx += 0.5 * (parseFloat(inputs.accX) || 0) * t * t;
      }
      return [gx, 0, gz];
  }, [inputs, mission]);

  useFrame((state) => {
      if(targetRef.current) { targetRef.current.rotation.y += 0.02; targetRef.current.rotation.x += 0.01; }
      if (simStatus === 'RUNNING') {
          state.camera.position.lerp(new THREE.Vector3(currentPos[0] - 15, 20, currentPos[2] + 30), 0.05);
          state.camera.lookAt(currentPos[0], 0, currentPos[2]);
      } else {
          state.camera.position.lerp(new THREE.Vector3(-10, 35, 45), 0.05);
          state.camera.lookAt(10, 0, 0);
      }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[5, 20, 5]} intensity={3} color="#00f2ff" />
      <Stars count={1000} factor={2} fade speed={0} />
      
      <Grid infiniteGrid fadeDistance={200} sectionColor="#004488" cellColor="#001133" position={[0, -0.5, 0]} cellSize={5} sectionSize={25} />
      
      <Line points={[[-100, -0.4, 0], [100, -0.4, 0]]} color="#ff0055" lineWidth={2} opacity={0.5} transparent /> 
      <Line points={[[0, -0.4, -100], [0, -0.4, 100]]} color="#0055ff" lineWidth={2} opacity={0.5} transparent /> 

      <mesh position={[0, -0.2, 0]}>
         <cylinderGeometry args={[2, 2, 0.5, 32]} />
         <meshBasicMaterial color="#333" />
         <HolographicMarker position={[0, 1.5, 0]} text="ORIGIN [0,0]" color="#aaa" />
      </mesh>

      <mesh ref={targetRef} position={mission.target}>
        <octahedronGeometry args={[mission.tolerance * 1.5, 0]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} wireframe />
        <HolographicMarker position={[0, 3, 0]} text={`TARGET [X:${mission.target[0]}, Z:${mission.target[2]}]`} color="#ffaa00" />
      </mesh>

      {/* GHOST DRONE */}
      {simStatus === 'IDLE' && (
         <mesh position={ghostPos}>
             <boxGeometry args={[1.5, 1, 2]} />
             <meshBasicMaterial color="#00f2ff" wireframe transparent opacity={0.3} />
             <HolographicMarker position={[0, 2, 0]} text="PREDICCIÓN" color="#00f2ff" />
         </mesh>
      )}

      {/* DRON FÍSICO REAL */}
      <mesh position={currentPos}>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#0f0" emissive="#0f0" emissiveIntensity={0.8} />
        
        {simStatus === 'RUNNING' && <Trail width={0.8} length={40} color="#0f0" attenuation={(t) => t * t} />}
        
        {simStatus === 'RUNNING' && mission.logic === 'mru' && (
             <Line points={[[0,0,0], [(parseFloat(inputs.velX)||0)*1.5, 0, (parseFloat(inputs.velZ)||0)*1.5]]} color="#00f2ff" lineWidth={5} />
        )}
        {simStatus === 'RUNNING' && mission.logic === 'mrua' && (
             <Line points={[[0,0,0], [(parseFloat(inputs.accX)||0)*3, 0, 0]]} color="#ff0055" lineWidth={5} />
        )}
      </mesh>

      {simStatus === 'SUCCESS' && (
          <Sparkles position={mission.target} count={200} scale={12} size={10} speed={2} color="#0f0" />
      )}

      <EffectComposer>
        <Bloom intensity={simStatus === 'SUCCESS' ? 3 : 1.5} luminanceThreshold={0.2} mipmapBlur />
        {simStatus === 'FAIL' && <ChromaticAberration offset={new THREE.Vector2(0.03, 0.03)} />}
        <Scanline opacity={0.15} density={2.5} />
      </EffectComposer>
    </>
  );
};

/* ============================================================
   🎮 6. APLICACIÓN PRINCIPAL (THE MOTION LAB)
============================================================ */
function GameApp() {
  const [missionsList] = useState(() => generateMissions());
  const [missionIdx, setMissionIdx] = useState(0);
  const mission = missionsList[missionIdx];
  const dbText = DATABANK['es'] ? DATABANK['es'][missionIdx] : DATABANK['es'][0];

  // 🔴 CORE FIX: Inicializamos los inputs explícitamente con propiedades vacías pero definidas para evitar el undefined
  const [inputs, setInputs] = useState({ posX:'', posZ:'', velX:'', velZ:'', accX:'' });
  
  const [simStatus, setSimStatus] = useState('IDLE'); // IDLE, RUNNING, SUCCESS, FAIL, NEARMISS
  const [currentPos, setCurrentPos] = useState([...mission.initial.p]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const [showDatabank, setShowDatabank] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiClass, setAiClass] = useState(null);
  const [selectedAiOption, setSelectedAiOption] = useState(null); 
  const [clicks, setClicks] = useState(0);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = window.localStorage.getItem('icfes_physics_history_v1');
          if (saved) return JSON.parse(saved);
      }
      return [];
  });

  const saveToHistory = useCallback((topic, data) => {
      setHistory(prev => {
          const updated = [{ id: Date.now(), date: new Date().toLocaleString(), topic, classData: data }, ...prev];
          window.localStorage.setItem('icfes_physics_history_v1', JSON.stringify(updated));
          return updated;
      });
  }, []);

  const handleControlClick = (e) => {
      if(e) e.stopPropagation(); 
      sfx.click();
      setClicks(c => {
          const newC = c + 1;
          if (newC > 0 && newC % 8 === 0) {
              sfx.aiPop();
              triggerAI();
          }
          return newC;
      });
  };

  const triggerAI = async () => {
      setShowAiModal(true);
      setAiClass(null);
      setSelectedAiOption(null);
      const data = await PhysicsAIEngine.generatePhysicsMasterclass(mission.topic, "es");
      setAiClass(data);
      saveToHistory(mission.topic, data); 
  };

  // 🔴 CORE FIX: Actualizamos el estado preservando las demás propiedades (evita undefined reading posX)
  const handleInput = (e) => {
      const { name, value } = e.target;
      setInputs(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
      if (simStatus !== 'RUNNING') return;

      let t = 0;
      const dt = 0.05;
      let p = [...mission.initial.p];
      
      const vX = parseFloat(inputs.velX) || 0;
      const vZ = parseFloat(inputs.velZ) || 0;
      const aX = parseFloat(inputs.accX) || 0;

      const interval = setInterval(() => {
          t += dt;
          setTimeElapsed(t);
          
          if (mission.logic === 'teleport') {
             p = [parseFloat(inputs.posX)||0, 0, parseFloat(inputs.posZ)||0];
          } else if (mission.logic === 'mru') {
             p[0] += vX * dt;
             p[2] += vZ * dt;
          } else if (mission.logic === 'mrua') {
             p[0] = 0.5 * aX * t * t; 
          }

          setCurrentPos([...p]);

          if (t >= mission.limitTime || mission.logic === 'teleport') {
              clearInterval(interval);
              const dist = Math.sqrt(Math.pow(p[0] - mission.target[0], 2) + Math.pow(p[2] - mission.target[2], 2));
              
              if (dist <= mission.tolerance) {
                  sfx.success();
                  setSimStatus('SUCCESS');
              } else if (dist <= mission.tolerance * 3) {
                  sfx.nearMiss();
                  setSimStatus('NEARMISS');
              } else {
                  sfx.error();
                  setSimStatus('FAIL');
              }
          }
      }, dt * 1000);

      return () => clearInterval(interval);
  }, [simStatus, mission, inputs]);

  const executePhysics = (e) => {
      handleControlClick(e);
      let hasData = false;
      // Validamos que al menos uno de los inputs esperados tenga un valor numérico
      mission.inputs.forEach(i => { if(inputs[i] !== '' && !isNaN(parseFloat(inputs[i]))) hasData = true; });
      if (!hasData) return;

      setCurrentPos([...mission.initial.p]);
      setTimeElapsed(0);
      sfx.engineStart();
      setSimStatus('RUNNING');
  };

  const resetSim = (e) => {
      handleControlClick(e);
      setSimStatus('IDLE');
      setCurrentPos([...mission.initial.p]);
      setTimeElapsed(0);
  };

  const handleNextMission = (e) => {
      handleControlClick(e);
      setInputs({ posX:'', posZ:'', velX:'', velZ:'', accX:'' });
      setSimStatus('IDLE');
      setTimeElapsed(0);
      if (missionIdx < missionsList.length - 1) {
          setCurrentPos([...missionsList[missionIdx+1].initial.p]);
          setMissionIdx(i => i + 1);
      } else {
          window.location.reload(); 
      }
  };

  return (
    <div style={{ position:'absolute', inset:0, background:'#000510', fontFamily:'Orbitron, sans-serif', overflow:'hidden', userSelect:'none' }} onClick={() => setClicks(c=>c+1)}>
      <style>{`
        .sci-btn { padding: 12px 25px; background: rgba(0, 242, 255, 0.1); color: #00f2ff; font-weight: 900; font-size: 14px; cursor: pointer; border: 1px solid #00f2ff; text-transform: uppercase; transition: 0.3s; box-shadow: inset 0 0 10px rgba(0,242,255,0.2); clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); }
        .sci-btn:hover { background: #00f2ff; color: #000; box-shadow: 0 0 20px #00f2ff; transform: scale(1.05); }
        
        .action-btn { padding: 15px 30px; background: #ffaa00; color: #000; font-weight: 900; font-size: 18px; cursor: pointer; border: none; text-transform: uppercase; clip-path: polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%); transition: 0.2s; box-shadow: 0 0 20px rgba(255,170,0,0.5); }
        .action-btn:hover { transform: scale(1.05) translateX(5px); }

        .hud-panel { background: rgba(0, 15, 30, 0.85); border-left: 3px solid #00f2ff; border-right: 1px solid #333; backdrop-filter: blur(10px); padding: 20px; box-shadow: 10px 0 30px rgba(0,0,0,0.8); }
        
        .sci-input { background: rgba(0,0,0,0.8); border: 1px solid #444; border-bottom: 2px solid #00f2ff; color: #00f2ff; padding: 10px; width: 100px; font-family: 'Orbitron', monospace; font-size: 20px; text-align: center; outline: none; transition: 0.3s; }
        .sci-input:focus { border-bottom-color: #ffaa00; color: #ffaa00; box-shadow: 0 10px 20px -10px #ffaa00; }
        
        .hud-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { opacity: 1; text-shadow: 0 0 20px; } 50% { opacity: 0.7; text-shadow: 0 0 10px; } 100% { opacity: 1; text-shadow: 0 0 20px; } }
      `}</style>
      
      <div style={{position:'absolute', inset:0, zIndex:1}}>
        <Suspense fallback={null}>
          <Canvas camera={{ position: [-30, 25, 40], fov: 50 }}>
            <PhysicsWorld mission={mission} inputs={inputs} simStatus={simStatus} currentPos={currentPos} timeElapsed={timeElapsed} />
            <OrbitControls enableZoom={true} maxPolarAngle={Math.PI/2 - 0.05} autoRotate={simStatus==='IDLE'} autoRotateSpeed={0.5} />
          </Canvas>
        </Suspense>
      </div>

      <div className="hud-panel" style={{ position: 'absolute', top: '20px', left: '0', zIndex: 10, maxWidth: '450px', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}>
          <div style={{fontSize:'10px', color:'#00f2ff', letterSpacing:'2px'}}>SYSTEM.MISSION_ID // {mission.id}</div>
          <h2 style={{margin:'5px 0', color:'#fff', fontSize:'20px', textTransform:'uppercase'}}>{mission.topic}</h2>
          <p style={{fontSize:'13px', color:'#ccc', margin:'10px 0', lineHeight:'1.5'}}>{mission.desc}</p>
          <div style={{background:'rgba(255,170,0,0.1)', borderLeft:'3px solid #ffaa00', padding:'10px', fontFamily:'monospace', color:'#ffaa00', fontSize:'12px', marginTop:'15px'}}>
              FÓRMULA REQUERIDA:<br/><span style={{fontSize:'16px'}}>{mission.equation}</span>
          </div>
      </div>

      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '15px' }}>
          <button className="sci-btn" onClick={(e) => { handleControlClick(e); setShowDatabank(true); }}>DATABANK</button>
          <button className="sci-btn" onClick={(e) => { handleControlClick(e); setShowHistory(true); }}>ARCHIVOS IA</button>
      </div>

      <div className="hud-panel" style={{ position: 'absolute', bottom: '20px', left: '0', zIndex: 10, borderLeft: '3px solid #ffaa00', clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)' }}>
          <div style={{fontSize:'10px', color:'#ffaa00', letterSpacing:'2px'}}>LIVE_TELEMETRY</div>
          <div style={{fontSize:'24px', color:'#fff', fontFamily:'monospace', margin:'10px 0'}}>
              T: <span style={{color: timeElapsed >= mission.limitTime ? '#f00' : '#0f0'}}>{timeElapsed.toFixed(2)}s</span> / {mission.limitTime}s
          </div>
          <div style={{fontSize:'16px', color:'#aaa', fontFamily:'monospace'}}>
              X: {currentPos[0].toFixed(1)}m | Z: {currentPos[2].toFixed(1)}m
          </div>
      </div>

      {simStatus === 'IDLE' && (
        <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display:'flex', flexDirection:'column', alignItems:'center' }} onClick={(e) => e.stopPropagation()}>
           <div style={{background:'rgba(0,0,0,0.8)', borderTop:'2px solid #00f2ff', padding:'15px 30px', borderRadius:'10px 10px 0 0', display:'flex', gap:'25px', alignItems:'flex-end', boxShadow:'0 -10px 30px rgba(0,242,255,0.1)'}}>
              {mission.inputs.map(inp => (
                 <div key={inp} style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                    <label style={{marginBottom:'8px', color:'#00f2ff', fontSize:'12px', fontWeight:'bold', letterSpacing:'1px'}}>{inp.toUpperCase()}</label>
                    <input type="number" name={inp} value={inputs[inp]} onChange={handleInput} onClick={handleControlClick} className="sci-input" placeholder="?" autoComplete="off" />
                 </div>
              ))}
              <button className="action-btn" style={{marginLeft:'20px'}} onClick={executePhysics}>EJECUTAR VECTORES</button>
           </div>
        </div>
      )}

      {simStatus === 'SUCCESS' && (
          <div style={{ position:'absolute', inset:0, zIndex:20, background:'rgba(0,40,10,0.85)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(8px)' }} onClick={e => e.stopPropagation()}>
              <div style={{fontSize:'16px', color:'#0f0', letterSpacing:'5px', marginBottom:'10px'}}>. // EXECUTION_SUCCESS // .</div>
              <h1 className="hud-pulse" style={{color:'#fff', textShadow:'0 0 30px #0f0', fontSize:'clamp(40px, 6vw, 70px)', margin:0, textTransform:'uppercase'}}>OBJETIVO ALCANZADO</h1>
              <p style={{color:'#aaa', fontSize:'18px', maxWidth:'600px', textAlign:'center', margin:'20px 0 40px 0'}}>
                  La matemática es el lenguaje del universo. Has demostrado dominio sobre la variable cinética.
              </p>
              <div style={{display:'flex', gap:'20px'}}>
                  <button className="sci-btn" style={{borderColor:'#0f0', color:'#0f0'}} onClick={resetSim}>RECALCULAR</button>
                  <button className="action-btn" style={{background:'#0f0'}} onClick={handleNextMission}>SIGUIENTE FASE</button>
              </div>
          </div>
      )}

      {simStatus === 'NEARMISS' && (
          <div style={{ position:'absolute', inset:0, zIndex:20, background:'rgba(40,20,0,0.85)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(8px)' }} onClick={e => e.stopPropagation()}>
              <div style={{fontSize:'16px', color:'#ffaa00', letterSpacing:'5px', marginBottom:'10px'}}>. // MARGIN_OF_ERROR // .</div>
              <h1 className="hud-pulse" style={{color:'#fff', textShadow:'0 0 30px #ffaa00', fontSize:'clamp(40px, 6vw, 70px)', margin:0, textTransform:'uppercase'}}>IMPACTO CERCANO</h1>
              <p style={{color:'#ffddaa', fontSize:'18px', maxWidth:'600px', textAlign:'center', margin:'20px 0 40px 0'}}>
                  ¡Estuviste muy cerca! La distancia final fue X={currentPos[0].toFixed(2)}. Revisa tus decimales o el despeje de la fórmula.
              </p>
              <div style={{display:'flex', gap:'20px'}}>
                  <button className="action-btn" style={{background:'#ffaa00', color:'#000'}} onClick={resetSim}>RECALCULAR</button>
                  <button className="sci-btn" style={{borderColor:'#ffaa00', color:'#ffaa00'}} onClick={(e) => { handleControlClick(e); setShowDatabank(true); }}>DATABANK</button>
              </div>
          </div>
      )}

      {simStatus === 'FAIL' && (
          <div style={{ position:'absolute', inset:0, zIndex:20, background:'rgba(40,0,0,0.85)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(8px)' }} onClick={e => e.stopPropagation()}>
              <div style={{fontSize:'16px', color:'#f00', letterSpacing:'5px', marginBottom:'10px'}}>. // CRITICAL_FAILURE // .</div>
              <h1 className="hud-pulse" style={{color:'#fff', textShadow:'0 0 30px #f00', fontSize:'clamp(40px, 6vw, 70px)', margin:0, textTransform:'uppercase'}}>COLISIÓN EN EL VACÍO</h1>
              <p style={{color:'#ffaaaa', fontSize:'18px', maxWidth:'600px', textAlign:'center', margin:'20px 0 40px 0'}}>
                  El vector resultante no interceptó la coordenada objetivo. Distancia final: X={currentPos[0].toFixed(1)}. Los vectores no mienten.
              </p>
              <div style={{display:'flex', gap:'20px'}}>
                  <button className="action-btn" style={{background:'#f00', color:'#fff'}} onClick={resetSim}>RECALCULAR</button>
                  <button className="sci-btn" style={{borderColor:'#ffaa00', color:'#ffaa00'}} onClick={(e) => { handleControlClick(e); setShowDatabank(true); }}>DATABANK</button>
              </div>
          </div>
      )}

      {showDatabank && (
          <div style={{ position:'absolute', inset:0, zIndex:40, background:'rgba(0,10,20,0.95)', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px', backdropFilter:'blur(15px)' }}>
              <div className="hud-panel" style={{borderLeft:'3px solid #ffaa00', maxWidth:'800px', width:'100%'}}>
                  <h2 style={{color:'#ffaa00', borderBottom:'1px solid #ffaa00', paddingBottom:'10px', marginTop:0}}>📖 ARCHIVO: {mission.topic}</h2>
                  <div style={{color:'#fff', fontSize:'18px', lineHeight:'1.7', padding:'20px 0', fontFamily:'serif'}}>
                      {dbText}
                  </div>
                  <button className="sci-btn" style={{width:'100%', marginTop:'20px', borderColor:'#ffaa00', color:'#ffaa00'}} onClick={(e) => { handleControlClick(e); setShowDatabank(false); }}>VOLVER</button>
              </div>
          </div>
      )}

      {showAiModal && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(10,0,20,0.98)', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px', backdropFilter:'blur(20px)' }} onClick={e => e.stopPropagation()}>
              <div className="hud-panel" style={{borderLeft:'3px solid #ff00ff', maxWidth:'900px', width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'15px', borderBottom:'1px solid #ff00ff', paddingBottom:'15px'}}>
                      <div className="loader-ring" style={{ width:'30px', height:'30px', border:'3px solid #333', borderTop:'3px solid #ff00ff', borderRadius:'50%', animation:'spin 1s linear infinite' }}></div>
                      <h2 style={{color:'#ff00ff', margin:0, letterSpacing:'2px'}}>ANOMALÍA DETECTADA</h2>
                  </div>
                  
                  {!aiClass ? (
                      <div style={{padding:'60px 0', textAlign:'center'}}>
                          <p className="hud-pulse" style={{color:'#ff00ff', fontSize:'18px', fontFamily:'monospace'}}>Extrayendo dilema cuántico de la red neuronal...</p>
                      </div>
                  ) : (
                      <div style={{marginTop:'20px'}}>
                         <h3 style={{color:'#fff', fontSize:'22px'}}>{aiClass.title}</h3>
                         <div style={{background:'rgba(255,255,255,0.05)', padding:'15px', borderRadius:'5px', marginTop:'15px', border:'1px solid #333'}}>
                            <MarkdownParser text={aiClass.theory} />
                         </div>
                         <div style={{background:'rgba(255,0,0,0.1)', borderLeft:'3px solid #f00', padding:'15px', marginTop:'15px'}}>
                             <strong style={{color:'#f00'}}>TRAMPA CONCEPTUAL:</strong> <span style={{color:'#ccc', fontSize:'14px'}}>{aiClass.trap}</span>
                         </div>
                         {aiClass.demoQuestion && (
                             <div style={{marginTop:'25px'}}>
                                 <strong style={{color:'#00f2ff', fontSize:'16px'}}>PRUEBA TÁCTICA (Haz clic en la respuesta):</strong>
                                 <p style={{color:'#fff', fontSize:'16px', margin:'10px 0'}}>{aiClass.demoQuestion.text}</p>
                                 <div style={{display:'grid', gap:'10px'}}>
                                     {aiClass.demoQuestion.options.map((opt, i) => (
                                         <button 
                                            key={i} 
                                            style={{
                                                padding:'12px', textAlign:'left', fontSize:'15px', cursor:'pointer',
                                                background: selectedAiOption === i ? (i === aiClass.demoQuestion.correctIdx ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)') : 'rgba(255,255,255,0.05)', 
                                                border: `1px solid ${selectedAiOption === i ? (i === aiClass.demoQuestion.correctIdx ? '#0f0' : '#f00') : '#444'}`, 
                                                color: selectedAiOption === i ? (i === aiClass.demoQuestion.correctIdx ? '#0f0' : '#f00') : '#aaa', 
                                                borderRadius:'5px'
                                            }} 
                                            onClick={() => { sfx.click(); setSelectedAiOption(i); }}
                                            disabled={selectedAiOption !== null}
                                         >
                                             {String.fromCharCode(65+i)}. {opt} {selectedAiOption === i && (i === aiClass.demoQuestion.correctIdx ? " ✓" : " ✗")}
                                         </button>
                                     ))}
                                 </div>
                                 {selectedAiOption !== null && (
                                     <div style={{marginTop:'20px', color: selectedAiOption === aiClass.demoQuestion.correctIdx ? '#0f0' : '#ffaa00', fontSize:'14px', paddingTop:'15px', borderTop:'1px dashed #333'}}>
                                        <strong>ANÁLISIS DE LA IA:</strong> {aiClass.demoQuestion.analysis}
                                     </div>
                                 )}
                             </div>
                         )}
                         <div style={{marginTop:'30px', display:'flex', gap:'15px'}}>
                             <button className="sci-btn" style={{flex:1, borderColor:'#0f0', color:'#0f0'}} onClick={() => downloadPDF(aiClass, 'es')}>📄 DESCARGAR PDF</button>
                             <button className="action-btn" style={{flex:1, background:'#ff00ff', color:'#fff', boxShadow:'0 0 15px rgba(255,0,255,0.3)'}} onClick={() => setShowAiModal(false)}>VOLVER A LA MISIÓN</button>
                         </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {showHistory && (
          <div style={{ position:'absolute', inset:0, zIndex:50, background:'rgba(0,10,30,0.98)', display:'flex', justifyContent:'center', alignItems:'center', padding:'20px', backdropFilter:'blur(15px)' }} onClick={(e) => e.stopPropagation()}>
              <div className="hud-panel" style={{borderColor:'#00f2ff', maxWidth:'900px', width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
                  <h2 style={{color:'#00f2ff', textAlign:'center', fontSize:'30px', borderBottom:'2px solid #00f2ff', paddingBottom:'10px', marginTop:0}}>📚 ARCHIVOS AKÁSHICOS</h2>
                  
                  {history.length === 0 ? (
                      <p style={{color:'#aaa', textAlign:'center', fontSize:'18px', padding:'40px 0'}}>La matriz de memoria está vacía. Resuelve misiones para generar datos.</p>
                  ) : (
                      <div style={{display:'flex', flexDirection:'column', gap:'15px', marginTop:'20px'}}>
                          {history.map((h) => (
                              <div key={h.id} style={{background:'rgba(0,242,255,0.05)', border:'1px solid #00f2ff', padding:'15px', borderRadius:'5px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                  <div>
                                      <div style={{color:'#fff', fontWeight:'bold', fontSize:'16px'}}>{h.classData.title || h.topic}</div>
                                      <div style={{color:'#00f2ff', fontSize:'12px', marginTop:'5px'}}>🕒 {h.date}</div>
                                  </div>
                                  <button className="sci-btn" style={{margin:0}} onClick={() => downloadPDF(h.classData, 'es')}>📄 PDF</button>
                              </div>
                          ))}
                      </div>
                  )}
                  
                  <div style={{display:'flex', gap:'20px', marginTop:'30px'}}>
                      <button className="sci-btn" style={{flex:1, borderColor:'#fff', color:'#fff'}} onClick={(e) => { handleControlClick(e); setShowHistory(false); }}>VOLVER</button>
                      {history.length > 0 && (
                          <button className="sci-btn" style={{flex:1, borderColor:'#f00', color:'#f00'}} onClick={() => { sfx.error(); setHistory([]); window.localStorage.removeItem('icfes_physics_history_v1'); }}>🗑️ PURGAR DATOS</button>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

export default function TheMotionLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}