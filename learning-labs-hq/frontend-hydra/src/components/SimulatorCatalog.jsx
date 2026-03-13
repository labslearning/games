import React, { useState, Suspense, lazy, useEffect, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

// ============================================================
// 🚨 SISTEMA DE TELEMETRÍA Y DEFENSA DE RUTAS
// ============================================================
console.log("%c [SYS] PROTOCOLO OMEGA V99 ACTIVO - CORE EN LÍNEA ", "background: #00f2ff; color: #000; font-size: 14px; font-weight: 900; border-radius: 4px; padding: 4px;");

const FallbackError = ({ name }) => (
  <main style={{ width: '100vw', height: '100vh', background: '#0a0005', color: '#ff0055', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', zIndex: 9999 }}>
    <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', textAlign: 'center', textShadow: '0 0 20px #ff0055' }}>⚠️ ERROR CUÁNTICO</h1>
    <p style={{ fontSize: '18px', color: '#fff' }}>Desincronización en el módulo: <strong style={{ color: '#ffea00' }}>{name}</strong></p>
    <button 
      onClick={() => window.location.reload()} 
      style={{ padding: '15px 30px', background: '#ff0055', color: '#fff', border: 'none', cursor: 'pointer', marginTop: '20px', borderRadius: '8px', fontWeight: 'bold', fontFamily: 'Orbitron', textTransform: 'uppercase', boxShadow: '0 0 20px rgba(255,0,85,0.5)' }}
    >
      REINICIAR INTERFAZ
    </button>
  </main>
);

// ============================================================
// 🔴 IMPORTACIONES DINÁMICAS (LAZY LOADING ESTRICTO)
// ============================================================
const GasSimulator = lazy(() => import('../games/physics/GasSimulator').catch(() => ({ default: () => <FallbackError name="GasSimulator" /> })));
const RedoxLab = lazy(() => import('../games/chemistry/RedoxLab').catch(() => ({ default: () => <FallbackError name="RedoxLab" /> })));
const RedoxBalancer = lazy(() => import('../games/chemistry/RedoxBalancer').catch(() => ({ default: () => <FallbackError name="RedoxBalancer" /> })));
// 👇 CONEXIÓN EXACTA DEL NUEVO LAB DE MATEMÁTICAS 👇
const MathLab = lazy(() => import('../games/mathematics/MathLab').catch(() => ({ default: () => <FallbackError name="MathLab" /> })));

// ============================================================
// 🌍 DICCIONARIO INTERNACIONAL (I18N)
// ============================================================
const CATALOG_I18N = {
  es: {
    nexusTitle: "NEXUS DE ASIGNATURAS", nexusSub: "SELECCIONE EL DOMINIO DE ENTRENAMIENTO",
    subjChem: "QUÍMICA", subjChemDesc: "Termodinámica, Reacciones, Enlaces y Estructura.",
    subjMath: "MATEMÁTICAS", subjMathDesc: "Álgebra, Geometría, Estadística y Lógica.",
    subjPhys: "FÍSICA", subjPhysDesc: "Mecánica, Fluidos, Ondas y Electromagnetismo.",
    header: "CATÁLOGO DE SIMULADORES", sub: "INTERFAZ DE ACCESO A PROTOCOLO HYDRA", backBtn: "⬅ VOLVER",
    gas: { t: "LEYES DE GASES", d: "Termodinámica, 150 elementos, Plasma y Presión." },
    lab: { t: "QUÍMICA REDOX LAB", d: "Misiones de campo: Identificación de estados y reactividad." },
    bal: { t: "LABORATORIO ICFES QUÍMICA", d: "Simulación 3D: Entrenamiento intensivo Saber 11." },
    math: { t: "LABORATORIO ICFES MATEMÁTICAS", d: "Simulación Cuántica con Inteligencia Artificial." },
    btn: "INICIAR SIMULACIÓN ➔"
  },
  en: {
    nexusTitle: "SUBJECT NEXUS", nexusSub: "SELECT TRAINING DOMAIN",
    subjChem: "CHEMISTRY", subjChemDesc: "Thermodynamics, Reactions, Bonds, and Structure.",
    subjMath: "MATHEMATICS", subjMathDesc: "Algebra, Geometry, Statistics, and Logic.",
    subjPhys: "PHYSICS", subjPhysDesc: "Mechanics, Fluids, Waves, and Electromagnetism.",
    header: "SIMULATOR CATALOG", sub: "HYDRA PROTOCOL ACCESS INTERFACE", backBtn: "⬅ BACK",
    gas: { t: "GAS LAWS", d: "Thermodynamics, 150 elements, Plasma and Pressure." },
    lab: { t: "REDOX CHEMISTRY LAB", d: "Field missions: State identification and reactivity." },
    bal: { t: "ICFES CHEMISTRY LAB", d: "3D Simulation: Intensive training for Saber 11." },
    math: { t: "ICFES MATH LAB", d: "Quantum AI Simulation." },
    btn: "START SIMULATION ➔"
  },
  fr: {
    nexusTitle: "NEXUS DES MATIÈRES", nexusSub: "SÉLECTIONNEZ LE DOMAINE D'ENTRAÎNEMENT",
    subjChem: "CHIMIE", subjChemDesc: "Thermodynamique, Réactions, Liaisons.",
    subjMath: "MATHÉMATIQUES", subjMathDesc: "Algèbre, Géométrie, Statistiques et Logique.",
    subjPhys: "PHYSIQUE", subjPhysDesc: "Mécanique, Fluides, Ondes.",
    header: "CATALOGUE DE SIMULATEURS", sub: "INTERFACE PROTOCOLE HYDRA", backBtn: "⬅ RETOUR",
    gas: { t: "LOIS DES GAZ", d: "Thermodynamique et Pression." },
    lab: { t: "LABO RÉDOX", d: "Missions de terrain." },
    bal: { t: "LABO CHIMIE ICFES", d: "Entraînement intensif." },
    math: { t: "LABO MATHS ICFES", d: "Simulation Quantique avec IA." },
    btn: "DÉMARRER ➔"
  },
  de: {
    nexusTitle: "FÄCHER-NEXUS", nexusSub: "WÄHLEN SIE DEN TRAININGSBEREICH",
    subjChem: "CHEMIE", subjChemDesc: "Thermodynamik, Reaktionen, Bindungen.",
    subjMath: "MATHEMATIK", subjMathDesc: "Algebra, Geometrie, Statistik.",
    subjPhys: "PHYSIK", subjPhysDesc: "Mechanik, Flüssigkeiten, Wellen.",
    header: "SIMULATORKATALOG", sub: "HYDRA-PROTOKOLL ZUGRIFF", backBtn: "⬅ ZURÜCK",
    gas: { t: "GASGESETZE", d: "Thermodynamik und Druck." },
    lab: { t: "REDOX-LABOR", d: "Identifizierung und Reaktivität." },
    bal: { t: "ICFES CHEMIE LABOR", d: "Intensives Training." },
    math: { t: "ICFES MATH LABOR", d: "KI-Simulation." },
    btn: "STARTEN ➔"
  }
};

// ============================================================
// ⚙️ COMPONENTE PRINCIPAL (ARQUITECTURA L8)
// ============================================================
export default function SimulatorCatalog() {
  const { language, setLanguage } = useGameStore();
  const [view, setView] = useState('nexus'); 

  // Memoización para evitar cálculos innecesarios por re-renders
  const dict = useMemo(() => CATALOG_I18N[language] || CATALOG_I18N.es, [language]);
  const isGameRunning = useMemo(() => ['gas', 'lab', 'bal', 'math'].includes(view), [view]);

  // Handler Optimizado de Interacciones UI (Rendimiento 120fps)
  const handleInteraction = useCallback((targetView) => {
    setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // UX Touch
  }, []);

  const handleKeydown = useCallback((e, targetView) => {
    if (e.key === 'Enter' || e.key === ' ') handleInteraction(targetView);
  }, [handleInteraction]);

  // Efecto ambiental de montaje
  useEffect(() => {
    document.body.style.background = "radial-gradient(circle at center, #0a1128 0%, #000000 100%)";
    return () => { document.body.style.background = "#000"; };
  }, []);

  // ---------------------------------------------------------
  // 🎮 NIVEL 3: RENDERIZADO DEL SIMULADOR 
  // ---------------------------------------------------------
  if (isGameRunning) {
    return (
      <Suspense fallback={
        <main style={{ position: 'absolute', inset: 0, background: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <div style={{ width: '50px', height: '50px', border: '5px solid #00f2ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <h1 style={{ color: '#00f2ff', fontFamily: 'Orbitron', marginTop: '20px', letterSpacing: '3px' }}>INICIALIZANDO MOTOR...</h1>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </main>
      }>
        {view === 'gas' && <GasSimulator onBack={() => setView('cat_phys')} />}
        {view === 'lab' && <RedoxLab onBack={() => setView('cat_chem')} />}
        {view === 'bal' && <RedoxBalancer onBack={() => setView('cat_chem')} />}
        {view === 'math' && <MathLab onBack={() => setView('cat_math')} />}
      </Suspense>
    );
  }

  // ---------------------------------------------------------
  // 🖥️ NIVEL 1 & 2: RENDERIZADO DE INTERFAZ NEXUS Y CATÁLOGOS
  // ---------------------------------------------------------
  return (
    <main style={st.container}>
      
      {/* 🌐 NAV BAR LÍQUIDA (ACCESIBILIDAD MÓVIL ALTA) */}
      <nav style={st.topBar} aria-label="Navegación y Configuración">
        {view !== 'nexus' ? (
          <button 
            onClick={() => handleInteraction('nexus')} 
            style={st.backBtn}
            aria-label="Volver a la selección de asignaturas"
          >
            {dict.backBtn}
          </button>
        ) : <div style={{ width: '1px' }} aria-hidden="true" />} 

        <div style={st.langPanel} role="group" aria-label="Selección de Idioma">
          {['es', 'en', 'fr', 'de'].map((lng) => (
            <button 
              key={lng} 
              onClick={() => setLanguage(lng)} 
              style={language === lng ? st.langBtnActive : st.langBtn}
              aria-pressed={language === lng}
            >
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      {/* 🏷️ CABECERA DINÁMICA */}
      <header style={st.header}>
        <h1 style={st.mainTitle}>{view === 'nexus' ? dict.nexusTitle : dict.header}</h1>
        <p style={st.subTitle}>
          {view === 'nexus' ? dict.nexusSub : view === 'cat_chem' ? dict.subjChem : view === 'cat_math' ? dict.subjMath : dict.subjPhys}
        </p>
      </header>

      {/* 🗂️ GRID DE TARJETAS (FLEXBOX AVANZADO) */}
      <section style={st.grid} role="region" aria-label="Tarjetas de Selección">
        
        {/* === VISTA 1: NEXUS DE MATERIAS === */}
        {view === 'nexus' && (
          <>
            <Card uiColor="#00ff88" icon="⚛️" title={dict.subjPhys} desc={dict.subjPhysDesc} onClick={() => handleInteraction('cat_phys')} onKey={(e) => handleKeydown(e, 'cat_phys')} />
            <Card uiColor="#ff0055" icon="🧪" title={dict.subjChem} desc={dict.subjChemDesc} onClick={() => handleInteraction('cat_chem')} onKey={(e) => handleKeydown(e, 'cat_chem')} />
            <Card uiColor="#ffea00" icon="📐" title={dict.subjMath} desc={dict.subjMathDesc} onClick={() => handleInteraction('cat_math')} onKey={(e) => handleKeydown(e, 'cat_math')} />
          </>
        )}

        {/* === VISTA 2: CATÁLOGO FÍSICA === */}
        {view === 'cat_phys' && (
          <Card uiColor="#00ff88" icon="🌡️" title={dict.gas.t} desc={dict.gas.d} btnText={dict.btn} onClick={() => handleInteraction('gas')} onKey={(e) => handleKeydown(e, 'gas')} isGame />
        )}

        {/* === VISTA 2: CATÁLOGO QUÍMICA === */}
        {view === 'cat_chem' && (
          <>
            <Card uiColor="#00f2ff" icon="⚡" title={dict.lab.t} desc={dict.lab.d} btnText={dict.btn} onClick={() => handleInteraction('lab')} onKey={(e) => handleKeydown(e, 'lab')} isGame />
            <Card uiColor="#ff0055" icon="⚖️" title={dict.bal.t} desc={dict.bal.d} btnText={dict.btn} onClick={() => handleInteraction('bal')} onKey={(e) => handleKeydown(e, 'bal')} isGame />
          </>
        )}

        {/* === VISTA 2: CATÁLOGO MATEMÁTICAS (LA CONEXIÓN PERFECTA) === */}
        {view === 'cat_math' && (
          <Card uiColor="#ffea00" icon="📐" title={dict.math.t} desc={dict.math.d} btnText={dict.btn} onClick={() => handleInteraction('math')} onKey={(e) => handleKeydown(e, 'math')} isGame />
        )}

      </section>
    </main>
  );
}

// ============================================================
// 🧩 SUB-COMPONENTE OPTIMIZADO: TARJETA DE INTERFAZ
// ============================================================
// Al crear un componente separado, el motor de React limpia los eventos de Hover,
// mejorando el rendimiento brutalmente en móviles y reduciendo el código repetido.
const Card = React.memo(({ uiColor, icon, title, desc, btnText, onClick, onKey, isGame }) => {
  const [isHover, setIsHover] = useState(false);
  return (
    <article 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKey}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onFocus={() => setIsHover(true)}
      onBlur={() => setIsHover(false)}
      style={{
        width: '100%', maxWidth: isGame ? '320px' : '350px', boxSizing: 'border-box', 
        padding: 'clamp(20px, 6vw, 40px)', background: isHover ? 'rgba(255,255,255,0.08)' : (isGame ? 'rgba(0,10,20,0.8)' : 'rgba(255,255,255,0.03)'), 
        border: `2px solid ${isHover ? uiColor : `${uiColor}66`}`, borderRadius: '20px', 
        cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', 
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', 
        backdropFilter: 'blur(10px)',
        transform: isHover ? 'translateY(-10px) scale(1.02)' : 'none',
        boxShadow: isHover ? `0 15px 40px ${uiColor}44` : '0 5px 15px rgba(0,0,0,0.5)',
        outline: 'none' // Manejado por isHover vía focus
      }}
    >
      <div style={{ fontSize: 'clamp(40px, 10vw, 60px)', marginBottom: '15px', filter: `drop-shadow(0 0 15px ${isHover ? uiColor : 'rgba(255,255,255,0.2)'})`, transition: '0.3s' }}>{icon}</div>
      <h2 style={{ fontSize: 'clamp(18px, 4.5vw, 22px)', margin: '10px 0', fontWeight: '900', letterSpacing: '1px', color: isHover ? '#fff' : '#eaeaea', transition: '0.3s' }}>{title}</h2>
      <p style={{ fontSize: 'clamp(12px, 3vw, 14px)', color: '#aaa', lineHeight: '1.6', height: 'clamp(40px, 10vw, 60px)', margin: 0 }}>{desc}</p>
      {btnText && (
        <button tabIndex={-1} style={{ marginTop: '20px', padding: '12px 25px', background: isHover ? uiColor : 'transparent', border: `2px solid ${uiColor}`, color: isHover ? '#000' : uiColor, fontWeight: '900', fontFamily: 'Orbitron', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', width: '100%', transition: 'all 0.3s ease', textTransform: 'uppercase' }}>
          {btnText}
        </button>
      )}
    </article>
  );
});

// ============================================================
// 🎨 ESTILOS BASE "ANDROID FIRST" (FLUIDOS Y ROBUSTOS)
// ============================================================
const st = {
  container: { 
    position: 'absolute', inset: 0, color: '#fff', fontFamily: 'Orbitron, sans-serif', 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    overflowY: 'auto', overflowX: 'hidden', padding: 'clamp(15px, 4vw, 40px)', 
    boxSizing: 'border-box', width: '100vw'
  },
  topBar: {
    width: '100%', maxWidth: '1400px', display: 'flex', justifyContent: 'space-between', 
    alignItems: 'center', marginBottom: 'clamp(20px, 5vw, 40px)', flexWrap: 'wrap-reverse', 
    gap: '15px', zIndex: 1000
  },
  langPanel: { 
    display: 'flex', gap: 'clamp(5px, 1.5vw, 10px)', background: 'rgba(0,15,30,0.8)', 
    padding: 'clamp(5px, 2vw, 10px)', borderRadius: '12px', border: '1px solid #00f2ff',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
  },
  langBtn: { 
    background: 'transparent', border: 'none', color: '#aaa', 
    padding: '8px 12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: 'clamp(11px, 2.5vw, 13px)', 
    fontWeight: 'bold', borderRadius: '6px', transition: 'all 0.2s ease' 
  },
  langBtnActive: { 
    background: '#00f2ff', border: 'none', color: '#000', 
    padding: '8px 12px', cursor: 'pointer', fontFamily: 'Orbitron', fontSize: 'clamp(11px, 2.5vw, 13px)', 
    fontWeight: '900', borderRadius: '6px', boxShadow: '0 0 15px rgba(0, 242, 255, 0.6)' 
  },
  header: { textAlign: 'center', marginBottom: 'clamp(30px, 6vw, 50px)', width: '100%' },
  mainTitle: { 
    fontSize: 'clamp(24px, 6vw, 50px)', letterSpacing: 'clamp(2px, 1vw, 12px)', 
    textShadow: '0 0 40px rgba(255,255,255,0.15)', lineHeight: '1.2', margin: '0 0 15px 0',
    fontWeight: '900'
  },
  subTitle: { 
    color: '#00f2ff', letterSpacing: 'clamp(2px, 1vw, 6px)', fontSize: 'clamp(12px, 3vw, 18px)', 
    fontWeight: 'bold', textTransform: 'uppercase', margin: 0, opacity: 0.9
  },
  backBtn: { 
    background: 'rgba(0, 242, 255, 0.05)', border: '1px solid #00f2ff', color: '#00f2ff', 
    padding: '10px 20px', cursor: 'pointer', fontFamily: 'Orbitron', borderRadius: '8px', 
    transition: 'all 0.3s ease', fontWeight: 'bold', fontSize: 'clamp(12px, 2.5vw, 14px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
  },
  grid: { 
    display: 'flex', flexWrap: 'wrap', gap: 'clamp(20px, 5vw, 40px)', 
    justifyContent: 'center', maxWidth: '1400px', width: '100%', paddingBottom: '60px'
  }
};