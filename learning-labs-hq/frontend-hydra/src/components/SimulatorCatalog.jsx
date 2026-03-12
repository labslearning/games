import React, { useState, Suspense, lazy, useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

// 🚨 DEBUG CANARY: Si ves esto en la consola (F12), el código nuevo entró.
console.log("%c >>> PROTOCOLO OMEGA V40 ACTIVADO <<< ", "background: #ff0000; color: #ffffff; font-size: 20px; font-weight: bold;");

const FallbackError = ({ name }) => (
  <div style={{ width: '100vw', height: '100vh', background: '#300', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', zIndex: 9999 }}>
    <h1 style={{ fontSize: '40px' }}>⚠️ ERROR CRÍTICO DE RUTA</h1>
    <p>No se encontró el módulo: <strong>{name}</strong></p>
    <button onClick={() => window.location.reload()} style={{ padding: '15px', background: '#f00', color: '#fff', border: 'none', cursor: 'pointer' }}>REVENTAR CACHÉ Y REINTENTAR</button>
  </div>
);

// IMPORTACIONES DINÁMICAS (ESTRICTAMENTE VERIFICADAS)
const GasSimulator = lazy(() => import('../games/physics/GasSimulator').catch(() => ({ default: () => <FallbackError name="GasSimulator" /> })));
const RedoxLab = lazy(() => import('../games/chemistry/RedoxLab').catch(() => ({ default: () => <FallbackError name="RedoxLab" /> })));
const RedoxBalancer = lazy(() => import('../games/chemistry/RedoxBalancer').catch(() => ({ default: () => <FallbackError name="RedoxBalancer" /> })));
const MathLab = lazy(() => import('../games/mathematics/MathLab').catch(() => ({ default: () => <FallbackError name="MathLab" /> })));

const CATALOG_I18N = {
  es: {
    nexusTitle: "NEXUS DE ASIGNATURAS",
    nexusSub: "SELECCIONE EL DOMINIO DE ENTRENAMIENTO",
    subjChem: "QUÍMICA",
    subjChemDesc: "Termodinámica, Reacciones, Enlaces y Estructura.",
    subjMath: "MATEMÁTICAS",
    subjMathDesc: "Álgebra, Geometría, Estadística y Lógica.",
    subjPhys: "FÍSICA",
    subjPhysDesc: "Mecánica, Fluidos, Ondas y Electromagnetismo.",
    header: "CATÁLOGO DE SIMULADORES",
    sub: "INTERFAZ DE ACCESO A PROTOCOLO HYDRA",
    backBtn: "⬅ VOLVER A ASIGNATURAS",
    gas: { t: "LEYES DE GASES", d: "Termodinámica, 150 elementos, Plasma y Presión." },
    lab: { t: "QUÍMICA REDOX LAB", d: "Misiones de campo: Identificación de estados y reactividad." },
    bal: { t: "LABORATORIO ICFES QUÍMICA", d: "Simulación 3D: Entrenamiento intensivo para la prueba Saber 11." },
    math: { t: "LABORATORIO ICFES MATEMÁTICAS", d: "Simulación Cuántica con IA." },
    btn: "INICIAR SIMULACIÓN ➔"
  },
  en: {
    nexusTitle: "SUBJECT NEXUS",
    nexusSub: "SELECT TRAINING DOMAIN",
    subjChem: "CHEMISTRY",
    subjChemDesc: "Thermodynamics, Reactions, Bonds.",
    subjMath: "MATHEMATICS",
    subjMathDesc: "Algebra, Geometry, Statistics.",
    subjPhys: "PHYSICS",
    subjPhysDesc: "Mechanics, Fluids, Waves.",
    header: "SIMULATOR CATALOG",
    sub: "HYDRA PROTOCOL ACCESS INTERFACE",
    backBtn: "⬅ BACK TO SUBJECTS",
    gas: { t: "GAS LAWS", d: "Thermodynamics and Pressure." },
    lab: { t: "REDOX CHEMISTRY LAB", d: "Field missions." },
    bal: { t: "ICFES CHEMISTRY LAB", d: "Intensive training." },
    math: { t: "ICFES MATH LAB", d: "Quantum AI Simulation." },
    btn: "START SIMULATION ➔"
  },
  fr: {
    nexusTitle: "NEXUS DES MATIÈRES",
    nexusSub: "SÉLECTIONNEZ LE DOMAINE",
    subjChem: "CHIMIE",
    subjChemDesc: "Thermodynamique, Réactions.",
    subjMath: "MATHÉMATIQUES",
    subjMathDesc: "Algèbre, Géométrie.",
    subjPhys: "PHYSIQUE",
    subjPhysDesc: "Mécanique, Fluides.",
    header: "CATALOGUE DE SIMULATEURS",
    sub: "INTERFACE PROTOCOLE HYDRA",
    backBtn: "⬅ RETOUR",
    gas: { t: "LOIS DES GAZ", d: "Thermodynamique." },
    lab: { t: "LABO RÉDOX", d: "Missions." },
    bal: { t: "LABO CHIMIE ICFES", d: "Simulation." },
    math: { t: "LABO MATHS ICFES", d: "IA Simulation." },
    btn: "DÉMARRER ➔"
  },
  de: {
    nexusTitle: "FÄCHER-NEXUS",
    nexusSub: "WÄHLEN SIE DEN TRAININGSBEREICH",
    subjChem: "CHEMIE",
    subjChemDesc: "Thermodynamik, Reaktionen.",
    subjMath: "MATHEMATIK",
    subjMathDesc: "Algebra, Geometrie.",
    subjPhys: "PHYSIK",
    subjPhysDesc: "Mechanik, Wellen.",
    header: "SIMULATORKATALOG",
    sub: "HYDRA-PROTOKOLL ZUGRIFF",
    backBtn: "⬅ ZURÜCK",
    gas: { t: "GASGESETZE", d: "Thermodynamik." },
    lab: { t: "REDOX-LABOR", d: "Identifizierung." },
    bal: { t: "ICFES CHEMIE LABOR", d: "3D-Simulation." },
    math: { t: "ICFES MATH LABOR", d: "KI-Simulation." },
    btn: "STARTEN ➔"
  }
};

export default function SimulatorCatalog() {
  const { language, setLanguage } = useGameStore();
  const [view, setView] = useState('nexus'); 

  const dict = CATALOG_I18N[language] || CATALOG_I18N.es;

  // EFECTO DE CHOQUE: Cambia el fondo del body para saber si el código cargó
  useEffect(() => {
    document.body.style.background = "#02040a";
    return () => { document.body.style.background = "#000"; };
  }, []);

  const isGameRunning = ['gas', 'lab', 'bal', 'math'].includes(view);
  if (isGameRunning) {
    return (
      <Suspense fallback={
        <div style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={{ color: '#00f2ff', fontFamily: 'Orbitron', animation: 'pulse 1s infinite' }}>CARGANDO...</h1>
        </div>
      }>
        {view === 'gas' && <GasSimulator onBack={() => setView('cat_phys')} />}
        {view === 'lab' && <RedoxLab onBack={() => setView('cat_chem')} />}
        {view === 'bal' && <RedoxBalancer onBack={() => setView('cat_chem')} />}
        {view === 'math' && <MathLab onBack={() => setView('cat_math')} />}
      </Suspense>
    );
  }

  return (
    <div style={st.container}>
      
      {/* 🌐 HUD SELECTOR DE IDIOMAS */}
      <div style={st.langPanel}>
        {['es', 'en', 'fr', 'de'].map((lng) => (
          <button key={lng} onClick={() => setLanguage(lng)} style={language === lng ? st.langBtnActive : st.langBtn}>
            {lng.toUpperCase()}
          </button>
        ))}
      </div>

      {view !== 'nexus' && (
        <button onClick={() => setView('nexus')} style={st.backBtn}>{dict.backBtn}</button>
      )}

      <header style={st.header}>
        <h1 style={st.mainTitle}>{view === 'nexus' ? dict.nexusTitle : dict.header}</h1>
        <p style={st.subTitle}>
          {view === 'nexus' ? dict.nexusSub : view === 'cat_chem' ? dict.subjChem : view === 'cat_math' ? dict.subjMath : dict.subjPhys}
        </p>
      </header>

      <div style={st.grid}>
        {view === 'nexus' && (
          <>
            <div style={st.cardSubject('#00ff88')} onClick={() => setView('cat_phys')} onMouseEnter={st.hoverOn('#00ff88')} onMouseLeave={st.hoverOff('#00ff88')}>
              <div style={st.icon}>⚛️</div>
              <h2 style={st.cardTitle}>{dict.subjPhys}</h2>
              <p style={st.cardDesc}>{dict.subjPhysDesc}</p>
            </div>
            <div style={st.cardSubject('#ff0055')} onClick={() => setView('cat_chem')} onMouseEnter={st.hoverOn('#ff0055')} onMouseLeave={st.hoverOff('#ff0055')}>
              <div style={st.icon}>🧪</div>
              <h2 style={st.cardTitle}>{dict.subjChem}</h2>
              <p style={st.cardDesc}>{dict.subjChemDesc}</p>
            </div>
            <div style={st.cardSubject('#ffea00')} onClick={() => setView('cat_math')} onMouseEnter={st.hoverOn('#ffea00')} onMouseLeave={st.hoverOff('#ffea00')}>
              <div style={st.icon}>📐</div>
              <h2 style={st.cardTitle}>{dict.subjMath}</h2>
              <p style={st.cardDesc}>{dict.subjMathDesc}</p>
            </div>
          </>
        )}

        {view === 'cat_phys' && (
          <div style={st.cardGame('#00ff88')} onClick={() => setView('gas')} onMouseEnter={st.hoverOn('#00ff88')} onMouseLeave={st.hoverOff('#00ff88')}>
            <div style={st.icon}>🌡️</div>
            <h2 style={st.cardTitle}>{dict.gas.t}</h2>
            <p style={st.cardDesc}>{dict.gas.d}</p>
            <button style={st.cardBtn('#00ff88')}>{dict.btn}</button>
          </div>
        )}

        {view === 'cat_chem' && (
          <>
            <div style={st.cardGame('#00f2ff')} onClick={() => setView('lab')} onMouseEnter={st.hoverOn('#00f2ff')} onMouseLeave={st.hoverOff('#00f2ff')}>
              <div style={st.icon}>⚡</div>
              <h2 style={st.cardTitle}>{dict.lab.t}</h2>
              <p style={st.cardDesc}>{dict.lab.d}</p>
              <button style={st.cardBtn('#00f2ff')}>{dict.btn}</button>
            </div>
            <div style={st.cardGame('#ff0055')} onClick={() => setView('bal')} onMouseEnter={st.hoverOn('#ff0055')} onMouseLeave={st.hoverOff('#ff0055')}>
              <div style={st.icon}>⚖️</div>
              <h2 style={st.cardTitle}>{dict.bal.t}</h2>
              <p style={st.cardDesc}>{dict.bal.d}</p>
              <button style={st.cardBtn('#ff0055')}>{dict.btn}</button>
            </div>
          </>
        )}

        {view === 'cat_math' && (
          <div style={st.cardGame('#ffea00')} onClick={() => setView('math')} onMouseEnter={st.hoverOn('#ffea00')} onMouseLeave={st.hoverOff('#ffea00')}>
            <div style={st.icon}>📐</div>
            <h2 style={st.cardTitle}>{dict.math.t}</h2>
            <p style={st.cardDesc}>{dict.math.d}</p>
            <button style={st.cardBtn('#ffea00')}>{dict.btn}</button>
          </div>
        )}
      </div>
    </div>
  );
}

const st = {
  container: { position: 'absolute', inset: 0, background: '#000', color: '#fff', fontFamily: 'Orbitron, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflowY: 'auto', padding: '40px' },
  langPanel: { position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', background: 'rgba(0,10,20,0.8)', padding: '10px', borderRadius: '12px', border: '1px solid #00f2ff', zIndex: 1000 },
  langBtn: { background: 'transparent', border: 'none', color: '#fff', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', transition: '0.3s' },
  langBtnActive: { background: '#00f2ff', border: 'none', color: '#000', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: '12px', fontWeight: 'bold', borderRadius: '6px', boxShadow: '0 0 15px #00f2ff' },
  header: { textAlign: 'center', marginBottom: '40px' },
  mainTitle: { fontSize: 'clamp(24px, 4vw, 45px)', letterSpacing: '10px', textShadow: '0 0 30px rgba(255,255,255,0.2)' },
  subTitle: { color: '#00f2ff', letterSpacing: '5px', fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase' },
  backBtn: { position: 'absolute', top: '20px', left: '20px', background: 'transparent', border: '1px solid #00f2ff', color: '#00f2ff', padding: '10px 20px', cursor: 'pointer', fontFamily: 'Orbitron', borderRadius: '5px', transition: '0.3s', zIndex: 1000, fontWeight: 'bold' },
  grid: { display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center', maxWidth: '1400px', width: '100%' },
  cardSubject: (color) => ({ width: '350px', padding: '50px 30px', background: 'rgba(255,255,255,0.03)', border: `2px solid ${color}66`, borderRadius: '25px', cursor: 'pointer', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backdropFilter: 'blur(10px)' }),
  cardGame: (color) => ({ width: '320px', padding: '40px', background: 'rgba(0,10,20,0.8)', border: `1px solid ${color}44`, borderRadius: '20px', cursor: 'pointer', transition: 'all 0.4s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backdropFilter: 'blur(10px)' }),
  icon: { fontSize: '60px', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))' },
  cardTitle: { fontSize: '22px', margin: '10px 0', fontWeight: '900', letterSpacing: '2px' },
  cardDesc: { fontSize: '14px', color: '#aaa', lineHeight: '1.6', height: '60px' },
  cardBtn: (color) => ({ marginTop: '20px', padding: '12px 30px', background: 'transparent', border: `2px solid ${color}`, color: color, fontWeight: 'bold', fontFamily: 'Orbitron', borderRadius: '5px', cursor: 'pointer' }),
  hoverOn: (color) => (e) => { e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)'; e.currentTarget.style.borderColor = color; e.currentTarget.style.boxShadow = `0 0 50px ${color}44`; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; },
  hoverOff: (color) => (e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = `${color}66`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }
};