import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore'; 

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (NEXUS KERNEL)
============================================================ */
const BASE_LEXICON = {
  es: {
    title: "NEXUS OS", subtitle: "CENTRO DE MANDO COGNITIVO",
    radarStats: "HUELLA SINÁPTICA", totalScore: "CAPACIDAD TOTAL",
    axisMemory: "MEMORIA VISOESPACIAL", axisLogic: "RAZONAMIENTO FLUIDO", axisSemantic: "HIPER-PROCESAMIENTO",
    launchBtn: "INICIAR PROTOCOLO",
    protocols: {
      nback: { name: "QUANTUM N-BACK", desc: "Entrenamiento de memoria de trabajo bajo estrés dinámico 3D.", stat: "Nivel" },
      raven: { name: "RAVEN OS", desc: "Auditoría de lógica fluida y resolución de problemas.", stat: "Lvl. Máx" },
      babel: { name: "PROTOCOLO BABEL", desc: "Análisis semántico a alta velocidad (RSVP).", stat: "WPM" }
    }
  },
  en: {
    title: "NEXUS OS", subtitle: "COGNITIVE COMMAND CENTER",
    radarStats: "SYNAPTIC FOOTPRINT", totalScore: "TOTAL CAPACITY",
    axisMemory: "VISUOSPATIAL MEMORY", axisLogic: "FLUID REASONING", axisSemantic: "HYPER-PROCESSING",
    launchBtn: "INITIATE PROTOCOL",
    protocols: {
      nback: { name: "QUANTUM N-BACK", desc: "Working memory training under 3D dynamic stress.", stat: "Level" },
      raven: { name: "RAVEN OS", desc: "Fluid logic audit and complex problem solving.", stat: "Max Lvl" },
      babel: { name: "BABEL PROTOCOL", desc: "High-speed semantic analysis (RSVP).", stat: "WPM" }
    }
  }
};
// Fallback Proxy para soportar todos los idiomas inyectados en el ecosistema
const getLexicon = (lang) => BASE_LEXICON[lang] || BASE_LEXICON.en;

/* ============================================================
   🔊 AUDIO ENGINE: UI SOUNDS (ZERO-LATENCY BEEP)
============================================================ */
const playHoverSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // Tono agudo cibernético
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volumen muy bajo
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Silencio si el navegador bloquea el AudioContext sin interacción previa
  }
};

/* ============================================================
   ✨ BACKGROUND ENGINE: SINAPTIC PARTICLES (CANVAS)
============================================================ */
const SynapticBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 1.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 242, 255, 0.3)';
        ctx.fill();
      }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      // Dibujar conexiones
      ctx.strokeStyle = 'rgba(0, 242, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

/* ============================================================
   📈 KERNEL MATEMÁTICO: RADAR CHART (VECTOR ENGINE)
============================================================ */
const CognitiveRadar = ({ stats, labels }) => {
  const size = 300;
  const center = size / 2;
  const radius = (size / 2) - 50; 
  
  // Constantes de normalización (Para que los valores dispares se vean bien en el radar 0-100)
  // Ej: 1500 WPM es el 100% de Semántica. 10-Back es el 100% de Memoria.
  const nBackMax = 10;
  const ravenMax = 15;
  const wpmMax = 1500;

  const normalizedStats = useMemo(() => ({
    memory: Math.min((stats.memory / nBackMax) * 100, 100) || 10, // Mínimo 10 para que el radar no colapse a 0
    logic: Math.min((stats.logic / ravenMax) * 100, 100) || 10,
    semantic: Math.min((stats.semantic / wpmMax) * 100, 100) || 10
  }), [stats]);

  const getCoordinates = (value, index, totalPoints) => {
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    const distance = (value / 100) * radius;
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle)
    };
  };

  const points = useMemo(() => {
    return [
      getCoordinates(normalizedStats.memory, 0, 3),
      getCoordinates(normalizedStats.logic, 1, 3),
      getCoordinates(normalizedStats.semantic, 2, 3)
    ];
  }, [normalizedStats]);

  const polygonPath = useMemo(() => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ') + ' Z';
  }, [points]);

  const axes = [0, 1, 2].map((i) => getCoordinates(100, i, 3));

  // Calcular el "Área Total" del triángulo cognitivo (Fórmula de Herón simplificada por coordenadas)
  const calculateArea = () => {
    const [{x:x1, y:y1}, {x:x2, y:y2}, {x:x3, y:y3}] = points;
    const area = 0.5 * Math.abs(x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2));
    // Max área posible ~= 23382 (Con radius = 100)
    return Math.round((area / ((3 * Math.sqrt(3) / 4) * radius * radius)) * 100);
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: `${size}px`, margin: '0 auto', aspectRatio: '1', zIndex: 10 }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Telaraña Base */}
        {[0.33, 0.66, 1].map((scale, i) => (
          <polygon 
            key={`grid-${i}`}
            points={`
              ${center},${center - (radius * scale)} 
              ${center + (radius * scale * Math.cos(Math.PI/6))},${center + (radius * scale * Math.sin(Math.PI/6))} 
              ${center - (radius * scale * Math.cos(Math.PI/6))},${center + (radius * scale * Math.sin(Math.PI/6))}
            `}
            fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1"
          />
        ))}

        {/* Ejes */}
        {axes.map((axis, i) => (
          <line key={`axis-${i}`} x1={center} y1={center} x2={axis.x} y2={axis.y} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* Polígono del Jugador */}
        <polygon 
          points={polygonPath} 
          fill="rgba(0, 242, 255, 0.15)" 
          stroke="#00f2ff" 
          strokeWidth="2"
          filter="url(#neonGlow)"
          style={{ transition: 'all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} 
        />

        {/* Nodos */}
        {points.map((p, i) => (
          <circle key={`node-${i}`} cx={p.x} cy={p.y} r="4" fill="#fff" style={{ transition: 'all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
        ))}
      </svg>

      {/* Porcentaje Central */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -20%)', textAlign: 'center', pointerEvents: 'none' }}>
         <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', textShadow: '0 0 15px rgba(0,242,255,0.8)' }}>{calculateArea()}%</div>
      </div>

      {/* Etiquetas Flotantes */}
      <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', color: '#00f2ff', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'center', width: '120px' }}>
        <i className="fas fa-cube mb-1 d-block" style={{fontSize:'1.2rem', textShadow:'0 0 10px #00f2ff'}}></i>{labels.memory}
      </div>
      <div style={{ position: 'absolute', bottom: '15px', right: '-20px', color: '#ffea00', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'right', width: '100px' }}>
        {labels.logic} <i className="fas fa-brain ms-1 d-block" style={{fontSize:'1.2rem', textShadow:'0 0 10px #ffea00'}}></i>
      </div>
      <div style={{ position: 'absolute', bottom: '15px', left: '-20px', color: '#ff0055', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'left', width: '100px' }}>
        <i className="fas fa-bolt me-1 d-block" style={{fontSize:'1.2rem', textShadow:'0 0 10px #ff0055'}}></i>{labels.semantic}
      </div>
    </div>
  );
};

/* ============================================================
   🎮 MAIN INTERFACE: NEXUS OS (UNIT 8200 HUB)
============================================================ */
export default function MenuJuegosMentales({ onLaunchProtocol = (id) => console.log(`Launching ${id}`) }) {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = BASE_LEXICON[language] ? language : 'es';
  const UI = getLexicon(safeLang);

  // 📦 ESTADO COGNITIVO GLOBAL 
  // Iniciamos en 0 para el efecto de "Booting", luego cargamos los reales.
  const [globalStats, setGlobalStats] = useState({ memory: 0, logic: 0, semantic: 0 });
  const [realStats, setRealStats] = useState({ memory: 0, logic: 0, semantic: 0 });

  // Efecto de inicialización y lectura del LocalStorage
  useEffect(() => {
    const loadRealData = () => {
      // Intentamos leer datos guardados por los juegos individuales.
      // Si no existen, mostramos un nivel base introductorio.
      const savedMem = parseInt(localStorage.getItem('nexus_nback_max')) || 1; 
      const savedLog = parseInt(localStorage.getItem('nexus_raven_max')) || 1;
      const savedSem = parseInt(localStorage.getItem('nexus_babel_wpm')) || 300;

      setRealStats({ memory: savedMem, logic: savedLog, semantic: savedSem });
      
      // Animación de entrada de la Matriz (Delay táctico)
      setTimeout(() => {
        setGlobalStats({ memory: savedMem, logic: savedLog, semantic: savedSem });
      }, 600);
    };

    loadRealData();
  }, []);

  return (
    <div style={{ 
      position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Orbitron', system-ui, sans-serif", 
      color: '#fff', overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column',
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' 
    }}>
      
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(25px); border: 1px solid rgba(255,255,255,0.05); }
        
        .protocol-card { background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(0, 242, 255, 0.1); border-radius: 16px; padding: clamp(20px, 4vw, 30px); transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); cursor: pointer; position: relative; overflow: hidden; z-index: 10;}
        .protocol-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #00f2ff; transition: 0.4s; }
        .protocol-card:hover, .protocol-card:active { background: rgba(0, 242, 255, 0.05); border-color: rgba(0, 242, 255, 0.3); transform: translateX(8px); box-shadow: 0 15px 35px rgba(0, 242, 255, 0.1); }
        .protocol-card:hover::before, .protocol-card:active::before { width: 8px; box-shadow: 0 0 20px #00f2ff; }
        
        /* Variaciones Tácticas */
        .card-raven::before { background: #ffea00; }
        .card-raven:hover, .card-raven:active { border-color: rgba(255, 234, 0, 0.3); background: rgba(255, 234, 0, 0.05); box-shadow: 0 15px 35px rgba(255, 234, 0, 0.1); }
        .card-raven:hover::before, .card-raven:active::before { box-shadow: 0 0 20px #ffea00; }

        .card-babel::before { background: #ff0055; }
        .card-babel:hover, .card-babel:active { border-color: rgba(255, 0, 85, 0.3); background: rgba(255, 0, 85, 0.05); box-shadow: 0 15px 35px rgba(255, 0, 85, 0.1); }
        .card-babel:hover::before, .card-babel:active::before { box-shadow: 0 0 20px #ff0055; }

        .cyber-button { background: transparent; color: #fff; font-weight: 800; border: 1px solid rgba(255,255,255,0.2); transition: all 0.3s; text-transform: uppercase; font-size: clamp(0.75rem, 3vw, 0.9rem); padding: clamp(10px, 3vw, 15px) clamp(15px, 4vw, 25px); border-radius: 8px;}
        .protocol-card:hover .cyber-button { background: #00f2ff; color: #000; border-color: #00f2ff; box-shadow: 0 0 20px rgba(0,242,255,0.5); }
        .card-raven:hover .cyber-button { background: #ffea00; color: #000; border-color: #ffea00; box-shadow: 0 0 20px rgba(255,234,0,0.5); }
        .card-babel:hover .cyber-button { background: #ff0055; color: #fff; border-color: #ff0055; box-shadow: 0 0 20px rgba(255,0,85,0.5); }

        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
      
      {/* Fondo Animado Canvas */}
      <SynapticBackground />

      {/* 🚀 HEADER DEL HUB */}
      <div className="glass-panel" style={{ padding: 'clamp(20px, 4vh, 30px)', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: '1px solid rgba(0,242,255,0.2)', zIndex: 20, position: 'sticky', top: 0 }}>
        <h1 style={{ margin: 0, fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', color: '#fff', fontWeight: '900', letterSpacing: '4px', textShadow: '0 0 20px rgba(0,242,255,0.6)' }}>
          {UI.title}
        </h1>
        <div style={{ color: '#00f2ff', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', marginTop: '5px', letterSpacing: '2px', fontWeight: 'bold' }}>
          <i className="fas fa-satellite-dish me-2"></i>{UI.subtitle}
        </div>
      </div>

      {/* 🚀 ZONA CENTRAL: TELEMETRÍA GLOBAL (RADAR) */}
      <div style={{ padding: 'clamp(30px, 5vh, 50px) 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
         <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '30px', background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <i className="fas fa-fingerprint me-2"></i>{UI.radarStats}
         </div>
         
         <div style={{ width: '100%', maxWidth: '450px', display: 'flex', justifyContent: 'center' }}>
            <CognitiveRadar 
              stats={globalStats} 
              labels={{ memory: UI.axisMemory, logic: UI.axisLogic, semantic: UI.axisSemantic }} 
            />
         </div>
         
         <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>
            {UI.totalScore}
         </div>
      </div>

      {/* 🚀 ARSENAL DE PROTOCOLOS (LOS 3 JUEGOS MENTALES) */}
      <div style={{ padding: '0 clamp(15px, 5vw, 40px) 40px clamp(15px, 5vw, 40px)', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 10, flex: 1, maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
         
         {/* PILAR 1: N-BACK */}
         <div className="protocol-card card-nback" onClick={() => onLaunchProtocol('nback')} onMouseEnter={playHoverSound} onTouchStart={playHoverSound}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <div>
                 <h2 style={{ color: '#00f2ff', margin: '0 0 5px 0', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '900', letterSpacing: '1px' }}>{UI.protocols.nback.name}</h2>
                 <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)' }}><i className="fas fa-cube me-2" style={{color: '#00f2ff'}}></i>{UI.axisMemory}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '900', color: '#fff' }}>{realStats.memory}</div>
                 <div style={{ fontSize: '0.65rem', color: '#00f2ff', textTransform: 'uppercase', letterSpacing: '1px' }}>{UI.protocols.nback.stat}</div>
               </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', lineHeight: '1.6', margin: '0 0 25px 0' }}>{UI.protocols.nback.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button className="cyber-button">{UI.launchBtn} <i className="fas fa-play ms-2"></i></button>
            </div>
         </div>

         {/* PILAR 2: RAVEN OS */}
         <div className="protocol-card card-raven" onClick={() => onLaunchProtocol('raven')} onMouseEnter={playHoverSound} onTouchStart={playHoverSound}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <div>
                 <h2 style={{ color: '#ffea00', margin: '0 0 5px 0', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '900', letterSpacing: '1px' }}>{UI.protocols.raven.name}</h2>
                 <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)' }}><i className="fas fa-brain me-2" style={{color: '#ffea00'}}></i>{UI.axisLogic}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '900', color: '#fff' }}>{realStats.logic}</div>
                 <div style={{ fontSize: '0.65rem', color: '#ffea00', textTransform: 'uppercase', letterSpacing: '1px' }}>{UI.protocols.raven.stat}</div>
               </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', lineHeight: '1.6', margin: '0 0 25px 0' }}>{UI.protocols.raven.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button className="cyber-button">{UI.launchBtn} <i className="fas fa-play ms-2"></i></button>
            </div>
         </div>

         {/* PILAR 3: PROTOCOLO BABEL */}
         <div className="protocol-card card-babel" onClick={() => onLaunchProtocol('babel')} onMouseEnter={playHoverSound} onTouchStart={playHoverSound}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
               <div>
                 <h2 style={{ color: '#ff0055', margin: '0 0 5px 0', fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: '900', letterSpacing: '1px' }}>{UI.protocols.babel.name}</h2>
                 <div style={{ color: '#94a3b8', fontSize: 'clamp(0.75rem, 3vw, 0.9rem)' }}><i className="fas fa-bolt me-2" style={{color: '#ff0055'}}></i>{UI.axisSemantic}</div>
               </div>
               <div style={{ textAlign: 'right' }}>
                 <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: '900', color: '#fff' }}>{realStats.semantic}</div>
                 <div style={{ fontSize: '0.65rem', color: '#ff0055', textTransform: 'uppercase', letterSpacing: '1px' }}>{UI.protocols.babel.stat}</div>
               </div>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: 'clamp(0.85rem, 3.5vw, 1rem)', lineHeight: '1.6', margin: '0 0 25px 0' }}>{UI.protocols.babel.desc}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <button className="cyber-button">{UI.launchBtn} <i className="fas fa-play ms-2"></i></button>
            </div>
         </div>

      </div>
    </div>
  );
}