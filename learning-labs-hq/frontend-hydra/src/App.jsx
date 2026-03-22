import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import MolecularPhysics from './components/MolecularPhysics';
import { useGameStore, i18n, audioSys } from './store/useGameStore';
import { MATERIALS } from './data/materials';

// ============================================================
// 📦 IMPORTAMOS TUS JUEGOS ACTIVOS ("Cartuchos Cuánticos")
// ============================================================
import GasLaws from './games/chemistry/GasLaws';
import RedoxLab from './games/chemistry/RedoxLab';
import RedoxBalancer from './games/chemistry/RedoxBalancer';
import GasTheory from './games/chemistry/GasTheory';
import MendeleevGrid from './games/chemistry/MendeleevGrid/MendeleevGrid';
import MathLab from './games/mathematics/MathLab'; 
import ScienceLab from './games/science/science_icfes'; 
import ReadingLab from './games/lectura_critica/lectura'; 
import SocialesLab from './games/sociales/sociales_icfes'; 
import PhysicsLab from './games/physics/physics_1'; 
import LecturaQuantica from './games/lectura_critica/LecturaQuantica';

/* ============================================================
   🚀 GOD TIER ARCHITECTURE: REGISTRO DE MÓDULOS O(1)
   Elimina los ternarios anidados. Escalabilidad infinita.
============================================================ */
const GAME_REGISTRY = {
  'PHYSICS_LAB': PhysicsLab,
  'SOCIALES_LAB': SocialesLab,
  'READING_LAB': ReadingLab,
  'QUANTUM_READER': LecturaQuantica,
  'SCIENCE_LAB': ScienceLab,
  'MATH_LAB': MathLab,
  'MENDELEEV_GRID': MendeleevGrid,
  'REDOX_LAB': RedoxLab,
  'REDOX_BALANCER': RedoxBalancer,
  'GAS_THEORY': GasTheory
};

/* ============================================================
   📱 HOOK DE RESPONSIVIDAD (MOBILE FIRST)
============================================================ */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

/* ============================================================
   🌍 TRADUCCIONES DEL NEXUS Y CATÁLOGO
============================================================ */
const CATALOG = {
  es: { 
    titleNexus: "NEXUS DE ASIGNATURAS", subNexus: "SELECCIONE EL DOMINIO DE ENTRENAMIENTO",
    titleCatalog: "CATÁLOGO DE SIMULADORES",
    backLang: "⬅ IDIOMA", backNexus: "⬅ ASIGNATURAS", new: "NUEVA MISIÓN",
    subjects: {
      chem: { t: "QUÍMICA", d: "Termodinámica, Reacciones, Enlaces y Estructura." },
      math: { t: "MATEMÁTICAS", d: "Álgebra, Geometría, Estadística y Lógica." },
      phys: { t: "FÍSICA", d: "Mecánica, Fluidos, Ondas y Electromagnetismo." },
      nat:  { t: "CIENCIAS NATURALES", d: "Biología, Entorno Físico, Químico y CTS." },
      read: { t: "LECTURA CRÍTICA", d: "Niveles literal, inferencial y crítico. Análisis de textos." },
      soc:  { t: "SOCIALES Y CIUDADANAS", d: "Historia, Geografía, Constitución y Competencias Ciudadanas." }
    },
    games: { 
      gasLaws: { t: "🧪 LEYES DE GASES", d: "Termodinámica interactiva: Plasma, Presión y Temperatura." }, 
      gasTheory: { t: "📚 GAS THEORY MASTER", d: "Campaña Guiada: Cinética de partículas y leyes clásicas." }, 
      redoxLab: { t: "⚡ QUÍMICA REDOX LAB", d: "Mecánicas de balanceo y transferencia de electrones en 3D." }, 
      redoxBalancer: { t: "⚖️ LAB. ICFES QUÍMICA", d: "Motor generativo avanzado con micro-clases Socráticas." },
      mendeleevGrid: { t: "🛰️ MENDELEEV'S GRID", d: "Malla Periódica: Navega y deduce Radio y Electronegatividad." },
      mathLab: { t: "📐 MATEMÁTICAS ICFES", d: "Simulación Cuántica: Álgebra, Geometría, Probabilidad con IA." },
      scienceLab: { t: "🧬 CIENCIAS ICFES", d: "Simulador Integral: Biología, Química y Física en entorno real." },
      readingLab: { t: "📖 LECTURA CRÍTICA ICFES", d: "Simulador Cognitivo: Análisis semántico y pragmático con IA." },
      quantumReader: { t: "⚡ ACELERADOR RSVP", d: "Motor de lectura rápida O.R.P. Supera los 1000+ WPM." },
      socialesLab: { t: "⚖️ SOCIALES ICFES", d: "Simulador Cartográfico: Constitución, Historia y Multiperspectivismo." },
      physicsLab: { t: "🚀 THE MOTION LAB", d: "Simulador Cinemático: Vectores, MRU y MRUA con IA." }
    } 
  },
  en: { 
    titleNexus: "SUBJECT NEXUS", subNexus: "SELECT TRAINING DOMAIN",
    titleCatalog: "SIMULATION CATALOG",
    backLang: "⬅ LANGUAGE", backNexus: "⬅ SUBJECTS", new: "NEW MISSION",
    subjects: {
      chem: { t: "CHEMISTRY", d: "Thermodynamics, Reactions, Bonds, and Structure." },
      math: { t: "MATHEMATICS", d: "Algebra, Geometry, Statistics, and Logic." },
      phys: { t: "PHYSICS", d: "Mechanics, Fluids, Waves, and Electromagnetism." },
      nat:  { t: "NATURAL SCIENCES", d: "Biology, Physical Environment, Chemistry & STS." },
      read: { t: "CRITICAL READING", d: "Literal, inferential, and critical levels. Text analysis." },
      soc:  { t: "SOCIAL SCIENCES", d: "History, Geography, Constitution, and Citizen Competencies." }
    },
    games: { 
      gasLaws: { t: "🧪 GAS LAWS", d: "Interactive thermodynamics: Plasma, Pressure, and Temp." }, 
      gasTheory: { t: "📚 GAS THEORY MASTER", d: "Guided Campaign: Particle kinetics and classic laws." }, 
      redoxLab: { t: "⚡ REDOX CHEMISTRY LAB", d: "Balancing mechanics and 3D electron transfer." }, 
      redoxBalancer: { t: "⚖️ ICFES CHEMISTRY LAB", d: "Advanced generative engine with Socratic micro-classes." },
      mendeleevGrid: { t: "🛰️ MENDELEEV'S GRID", d: "Periodic Grid: Navigate and deduce Radius and EN." },
      mathLab: { t: "📐 ICFES MATH LAB", d: "Quantum Simulation: Algebra, Geometry, Probability with AI." },
      scienceLab: { t: "🧬 ICFES SCIENCE LAB", d: "Integral Simulator: Biology, Chemistry & Physics in real-time." },
      readingLab: { t: "📖 ICFES CRITICAL READING", d: "Cognitive Simulator: Semantic and pragmatic analysis with AI." },
      quantumReader: { t: "⚡ RSVP ACCELERATOR", d: "Fast reading O.R.P. engine. Exceed 1000+ WPM." },
      socialesLab: { t: "⚖️ ICFES SOCIAL SCIENCES", d: "Cartographic Simulator: Constitution, History, and Multiperspectivism." },
      physicsLab: { t: "🚀 THE MOTION LAB", d: "Kinematic Simulator: Vectors, MRU, and MRUA with AI." }
    } 
  },
  fr: { 
    titleNexus: "NEXUS DES MATIÈRES", subNexus: "SÉLECTIONNEZ LE DOMAINE D'ENTRAÎNEMENT",
    titleCatalog: "CATALOGUE DE SIMULATEURS",
    backLang: "⬅ LANGUE", backNexus: "⬅ MATIÈRES", new: "NOUVEAU",
    subjects: {
      chem: { t: "CHIMIE", d: "Thermodynamique, Réactions, Liaisons." },
      math: { t: "MATHÉMATIQUES", d: "Algèbre, Géométrie, Statistiques et Logique." },
      phys: { t: "PHYSIQUE", d: "Mécanique, Fluides, Ondes." },
      nat:  { t: "SCIENCES NATURELLES", d: "Biologie, Chimie, Physique et Environnement." },
      read: { t: "LECTURE CRITIQUE", d: "Niveaux littéral, inférentiel et critique. Analyse de textes." },
      soc:  { t: "SCIENCES SOCIALES", d: "Histoire, Géographie, Constitution et Compétences Citoyennes." }
    },
    games: { 
      gasLaws: { t: "🧪 LOIS DES GAZ", d: "Thermodynamique, 150 éléments, Plasma et Pression." }, 
      gasTheory: { t: "📚 GAS THEORY MASTER", d: "Campagne Guidée : Cinétique, Boyle et Charles." }, 
      redoxLab: { t: "⚡ LABO CHIMIE REDOX", d: "Mécaniques d'équilibrage et transfert d'électrons." }, 
      redoxBalancer: { t: "⚖️ LAB. DE CHIMIE ICFES", d: "Moteur génératif avec micro-cours socratiques." },
      mendeleevGrid: { t: "🛰️ GRILLE DE MENDELEÏEV", d: "Naviguez dans la grille et déduisez les tendances." },
      mathLab: { t: "📐 LABO MATHS ICFES", d: "Simulation Quantique : Algèbre, Géométrie, Probabilités IA." },
      scienceLab: { t: "🧬 LABO SCIENCES ICFES", d: "Simulateur Intégral : Biologie, Chimie et Physique en direct." },
      readingLab: { t: "📖 LECTURE CRITIQUE ICFES", d: "Simulateur Cognitif: Analyse sémantique et pragmatique avec IA." },
      quantumReader: { t: "⚡ ACCÉLÉRATEUR RSVP", d: "Moteur de lecture rapide O.R.P. Dépassez les 1000+ MPM." },
      socialesLab: { t: "⚖️ SCIENCES SOCIALES ICFES", d: "Simulateur Cartographique : Constitution, Histoire et Multiperspectivisme." },
      physicsLab: { t: "🚀 THE MOTION LAB", d: "Simulateur Cinématique : Vecteurs, MRU et MRUA avec IA." }
    } 
  },
  de: { 
    titleNexus: "FÄCHER-NEXUS", subNexus: "WÄHLEN SIE DEN TRAININGSBEREICH",
    titleCatalog: "SIMULATORKATALOG",
    backLang: "⬅ SPRACHE", backNexus: "⬅ FÄCHERN", new: "NEU",
    subjects: {
      chem: { t: "CHEMIE", d: "Thermodynamik, Reaktionen, Bindungen." },
      math: { t: "MATHEMATIK", d: "Algebra, Geometrie, Statistik." },
      phys: { t: "PHYSIK", d: "Mechanik, Flüssigkeiten, Wellen." },
      nat:  { t: "NATURWISSENSCHAFTEN", d: "Biologie, Physik, Chemie und Umwelt." },
      read: { t: "KRITISCHES LESEN", d: "Wörtliche, schlussfolgernde und kritische Ebenen. Textanalyse." },
      soc:  { t: "SOZIALWISSENSCHAFTEN", d: "Geschichte, Geographie, Verfassung und Bürgerkompetenzen." }
    },
    games: { 
      gasLaws: { t: "🧪 GASGESETZE", d: "Thermodynamik, 150 Elemente, Plasma und Druck." }, 
      gasTheory: { t: "📚 GAS THEORY MASTER", d: "Geführte Kampagne: Kinetik, Boyle und Charles." }, 
      redoxLab: { t: "⚡ REDOX-CHEMIE-LABOR", d: "Ausgleichsmechanik und Elektronentransfer." }, 
      redoxBalancer: { t: "⚖️ ICFES CHEMIE LABOR", d: "Erweiterte generative Engine mit sokratischen Mikro-Klassen." },
      mendeleevGrid: { t: "🛰️ MENDELEJEW-GITTER", d: "Navigieren Sie im Gitter und leiten Sie Trends ab." },
      mathLab: { t: "📐 ICFES MATH LABOR", d: "Quantensimulation: Algebra, Geometrie, Wahrscheinlichkeit KI." },
      scienceLab: { t: "🧬 ICFES WISSENSCHAFTEN", d: "Integraler Simulator: Biologie, Chemie und Physik mit KI." },
      readingLab: { t: "📖 ICFES KRITISCHES LESEN", d: "Kognitiver Simulator: Semantische und pragmatische Analyse mit KI." },
      quantumReader: { t: "⚡ RSVP BESCHLEUNIGER", d: "O.R.P. Schnelllesemaschine. Über 1000+ WPM." },
      socialesLab: { t: "⚖️ ICFES SOZIALWISSENSCHAFTEN", d: "Kartographischer Simulator: Verfassung, Geschichte und Multiperspectivismus." },
      physicsLab: { t: "🚀 THE MOTION LAB", d: "Kinematischer Simulator: Vektoren, MRU und MRUA mit KI." }
    } 
  }
};

// ============================================================
// 📐 ECUACIÓN EN VIVO
// ============================================================
const LiveEquation = React.memo(({ mode, p, v, t }) => {
  const cP = "#ff0055"; const cV = "#ffea00"; const cT = "#00f2ff"; 
  const val = (n, c) => <span style={{ color: c, fontWeight: 'bold' }}>{Number(n).toFixed(1)}</span>;
  const Var = ({ char, sub, color }) => (<span style={{ color, margin: '0 5px', textShadow:`0 0 8px ${color}` }}>{char}<sub>{sub}</sub></span>);
  const Fraction = ({ top, bottom }) => (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 5px' }}>
      <div style={{ borderBottom: '2px solid rgba(255,255,255,0.4)', padding: '0 2px' }}>{top}</div>
      <div style={{ padding: '0 2px' }}>{bottom}</div>
    </div>
  );
  if (mode === 'FREE') return (<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}><div><Var char="P" color={cP}/> · <Var char="V" color={cV}/> = nR · <Var char="T" color={cT}/></div><div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = k · {val(t, cT)}</div></div>);
  if (mode === 'BOYLE') return (<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}><div><Var char="P" sub="1" color={cP}/> · <Var char="V" sub="1" color={cV}/> = <Var char="P" sub="2" color={cP}/> · <Var char="V" sub="2" color={cV}/></div><div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = {(p * v).toFixed(0)} (k)</div></div>);
  if (mode === 'CHARLES') return (<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}><div><Fraction top={<Var char="V" sub="1" color={cV}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="V" sub="2" color={cV}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div><div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}><Fraction top={val(v, cV)} bottom={val(t, cT)} /> = {(v/t).toFixed(3)} (k)</div></div>);
  if (mode === 'GAY_LUSSAC') return (<div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}><div><Fraction top={<Var char="P" sub="1" color={cP}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="P" sub="2" color={cP}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div><div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}><Fraction top={val(p, cP)} bottom={val(t, cT)} /> = {(p/t).toFixed(3)} (k)</div></div>);
  return null;
});

// ============================================================
// 🧩 SUB-COMPONENTE: TARJETA APP (Manejo Táctil Nivel Dios)
// ============================================================
const GameCard = React.memo(({ uiColor, icon, title, desc, badge, badgeColor, onClick }) => {
  const [isActive, setIsActive] = useState(false);
  const handleInteractionStart = useCallback(() => setIsActive(true), []);
  const handleInteractionEnd = useCallback(() => setIsActive(false), []);

  return (
    <article 
      role="button" tabIndex={0} onClick={onClick}
      onMouseEnter={handleInteractionStart} onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart} onTouchEnd={handleInteractionEnd}
      style={{
        ...ui.gameCard, 
        borderColor: isActive ? uiColor : `${uiColor}55`,
        background: isActive ? `rgba(0,15,30,0.95)` : 'rgba(0,10,20,0.7)',
        transform: isActive ? 'translateY(-4px) scale(1.01)' : 'none',
        boxShadow: isActive ? `0 8px 25px ${uiColor}44` : '0 4px 10px rgba(0,0,0,0.5)',
      }}
    >
      {badge && (
        <span style={{ position:'absolute', top:'-10px', right:'-10px', background:badgeColor, color:'#000', padding:'4px 10px', fontSize:'11px', fontWeight:'900', borderRadius:'6px', boxShadow: `0 0 10px ${badgeColor}`, animation: 'pulseBadge 2s infinite' }}>
          {badge}
        </span>
      )}
      <div style={{fontSize: 'clamp(40px, 10vw, 55px)', marginBottom: '10px', filter: `drop-shadow(0 0 10px ${isActive ? uiColor : 'transparent'})`, transition: '0.3s'}}>{icon}</div>
      <h2 style={{color: uiColor, margin: '0 0 8px 0', fontSize: 'clamp(16px, 4.5vw, 22px)', fontWeight: '900', letterSpacing: '1px'}}>{title}</h2>
      <p style={{color: '#aaa', fontSize: 'clamp(12px, 3.5vw, 14px)', margin: 0, lineHeight: '1.4'}}>{desc}</p>
    </article>
  );
});

// ============================================================
// 🎯 COMPONENTE PRINCIPAL APP
// ============================================================
export default function App() {
  const isMobile = useMobile();
  const { 
    appState, activeGame, temp, volume, pressure, phaseID, isCritical, 
    activeMaterial, setMaterial, activeMode, setMode, updatePhysics, 
    language, setLanguage, startGame, resetProgress, activeQuiz, 
    answerQuizQuestion, quizFeedback, clearFeedback, closeQuiz, score, 
    triggerExercise, exampleSession, loadExampleScenario, exitExample, 
    searchTerm, setSearchTerm, filterCategory, setFilterCategory, isGeneratingQuiz 
  } = useGameStore();
  
  // 🔴 ESTADO DEL ENRUTADOR NEXUS ('nexus' | 'cat_chem' | 'cat_math' | 'cat_phys' | 'cat_nat' | 'cat_read' | 'cat_soc')
  const [menuView, setMenuView] = useState('nexus');

  // Optimizaciones de referencias constantes
  const mat = MATERIALS[activeMaterial] || MATERIALS['H2O'];
  const t_i18n = useMemo(() => i18n[language] || i18n.es, [language]);
  const cat = useMemo(() => CATALOG[language] || CATALOG.es, [language]); 
  const t = t_i18n.ui;
  const lesson = t_i18n.lessons[activeMode];
  const examples = t_i18n.examples[activeMode];
  const droneRef = useRef(null);

  // 🚀 Prevención robusta de errores Autoplay de DOM
  useEffect(() => {
    if (droneRef.current) {
      if (appState === 'PLAYING' && !activeQuiz && (!activeGame || activeGame === 'GAS_LAWS')) {
        const playPromise = droneRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Silencia el error común de navegadores que bloquean Autoplay sin interacción
                console.warn("Autoplay Audio Blocked by Browser Context", error);
            });
        }
        droneRef.current.playbackRate = Math.max(0.5, temp / 5000);
        droneRef.current.volume = isCritical ? 0.8 : 0.2;
      } else {
        droneRef.current.pause();
      }
    }
  }, [appState, temp, isCritical, activeQuiz, activeGame]);

  // 🚀 Memoización Algorítmica del Filtro de Búsqueda (Evita recalcular 150 items en cada render frame)
  const filteredMaterials = useMemo(() => {
    return Object.values(MATERIALS).filter(m => {
      const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategory === 'All' || m.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [searchTerm, filterCategory]);

  // Resolución O(1) del Componente Activo
  const ActiveGameComponent = GAME_REGISTRY[activeGame];

  return (
    <>
      <audio ref={droneRef} src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav" loop />
      <audio id="snd-crash" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/crash_ebp5po.wav" />
      <audio id="snd-error" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/error.wav" />
      <audio id="snd-success" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/success.wav" />
      <audio id="snd-quiz" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/quiz.wav" />

      {/* ==============================================
          PANTALLA 1: SELECCIÓN DE IDIOMA
      ============================================== */}
      {appState === 'LANG_SELECT' && (
        <main style={ui.screenGame}>
          <div style={ui.vignette} /><div style={ui.hexBackground} />
          <section style={ui.centerBoxGame}>
            <h1 style={ui.titleGame}>LEARNING <span style={{color:'#fff'}}>LABS</span></h1>
            <div style={ui.btnGridGame}>
              {[{ id:'es', flag:'🇪🇸' }, { id:'en', flag:'🇬🇧' }, { id:'fr', flag:'🇫🇷' }, { id:'de', flag:'🇩🇪' }].map(l => (
                <button key={l.id} onClick={()=>{ setLanguage(l.id); setMenuView('nexus'); }} style={ui.cyberBtn}>
                  <span style={{marginRight:'8px', fontSize:'18px'}}>{l.flag}</span> {i18n[l.id].ui.lang}
                </button>
              ))}
            </div>
          </section>
        </main>
      )}

      {/* ==============================================
          PANTALLA 2: NEXUS (ASIGNATURAS) Y CATÁLOGOS
      ============================================== */}
      {appState === 'GAME_SELECT' && (
        <main style={ui.screenGame} className="nexus-screen">
          <div style={ui.hexBackground} />
          
          <nav style={ui.mobileNav}>
            <button 
              onClick={() => { if (menuView === 'nexus') useGameStore.setState({ appState: 'LANG_SELECT' }); else setMenuView('nexus'); }} 
              style={ui.navBackBtn} aria-label="Volver"
            >
              {menuView === 'nexus' ? cat.backLang : cat.backNexus}
            </button>
          </nav>

          <section style={{...ui.centerBoxGame, width: '100%', maxWidth: '1200px', border: 'none', background: 'transparent', boxShadow: 'none', paddingTop: isMobile ? '80px' : '40px'}}>
            <header style={{textAlign: 'center', marginBottom: 'clamp(20px, 6vw, 40px)', width: '100%'}}>
              <h1 style={ui.titleGame}>{menuView === 'nexus' ? cat.titleNexus : cat.titleCatalog}</h1>
              {menuView === 'nexus' && <p style={{color: '#00f2ff', letterSpacing: 'clamp(1px, 1vw, 3px)', margin: 0, fontSize: 'clamp(12px, 3vw, 16px)', fontWeight: 'bold'}}>{cat.subNexus}</p>}
              
              {/* INDICADOR DINÁMICO DE MATERIA */}
              {menuView !== 'nexus' && (
                <p style={{color: '#00f2ff', letterSpacing: 'clamp(1px, 1vw, 3px)', margin: 0, fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 'bold'}}>
                  // {
                    menuView === 'cat_chem' ? cat.subjects.chem.t : 
                    menuView === 'cat_math' ? cat.subjects.math.t : 
                    menuView === 'cat_nat' ? cat.subjects.nat.t : 
                    menuView === 'cat_read' ? cat.subjects.read.t : 
                    menuView === 'cat_soc' ? cat.subjects.soc.t : 
                    cat.subjects.phys.t
                  }
                </p>
              )}
            </header>

            <div style={ui.gameGrid}>
              
              {/* === VISTA 1: EL NEXUS DE MATERIAS === */}
              {menuView === 'nexus' && (
                <>
                  <GameCard uiColor="#00ff88" icon="⚛️" title={cat.subjects.phys.t} desc={cat.subjects.phys.d} onClick={() => setMenuView('cat_phys')} />
                  <GameCard uiColor="#ff0055" icon="🧪" title={cat.subjects.chem.t} desc={cat.subjects.chem.d} onClick={() => setMenuView('cat_chem')} />
                  <GameCard uiColor="#0f0" icon="🧬" title={cat.subjects.nat.t} desc={cat.subjects.nat.d} onClick={() => setMenuView('cat_nat')} />
                  <GameCard uiColor="#ffea00" icon="📐" title={cat.subjects.math.t} desc={cat.subjects.math.d} onClick={() => setMenuView('cat_math')} />
                  <GameCard uiColor="#00f2ff" icon="📖" title={cat.subjects.read.t} desc={cat.subjects.read.d} onClick={() => setMenuView('cat_read')} />
                  <GameCard uiColor="#ffaa00" icon="🌍" title={cat.subjects.soc.t} desc={cat.subjects.soc.d} onClick={() => setMenuView('cat_soc')} />
                </>
              )}

              {/* === VISTA 2: JUEGOS DE QUÍMICA === */}
              {menuView === 'cat_chem' && (
                <>
                  <GameCard uiColor="#00f2ff" icon="🌡️" title={cat.games.gasLaws.t} desc={cat.games.gasLaws.d} onClick={() => startGame('GAS_LAWS')} />
                  <GameCard uiColor="#00ff88" icon="📚" title={cat.games.gasTheory.t} desc={cat.games.gasTheory.d} onClick={() => startGame('GAS_THEORY')} />
                  <GameCard uiColor="#ff0055" icon="⚡" title={cat.games.redoxLab.t} desc={cat.games.redoxLab.d} onClick={() => startGame('REDOX_LAB')} />
                  <GameCard uiColor="#ffea00" icon="⚖️" title={cat.games.redoxBalancer.t} desc={cat.games.redoxBalancer.d} onClick={() => startGame('REDOX_BALANCER')} />
                  <GameCard uiColor="#00ff00" icon="🛰️" title={cat.games.mendeleevGrid.t} desc={cat.games.mendeleevGrid.d} badge={cat.new} badgeColor="#00ff00" onClick={() => startGame('MENDELEEV_GRID')} />
                </>
              )}

              {/* === VISTA 3: JUEGOS DE MATEMÁTICAS === */}
              {menuView === 'cat_math' && (
                <GameCard uiColor="#ffea00" icon="📐" title={cat.games.mathLab.t} desc={cat.games.mathLab.d} badge="NEXUS" badgeColor="#ffea00" onClick={() => startGame('MATH_LAB')} />
              )}

              {/* === VISTA 4: JUEGOS DE FÍSICA === */}
              {menuView === 'cat_phys' && (
                <>
                  <GameCard uiColor="#ff00ff" icon="🚀" title={cat.games.physicsLab.t} desc={cat.games.physicsLab.d} badge="NEXUS" badgeColor="#ff00ff" onClick={() => startGame('PHYSICS_LAB')} />
                  <GameCard uiColor="#00f2ff" icon="🌡️" title={cat.games.gasLaws.t} desc={cat.games.gasLaws.d} onClick={() => startGame('GAS_LAWS')} />
                </>
              )}

              {/* === VISTA 5: JUEGOS DE CIENCIAS NATURALES === */}
              {menuView === 'cat_nat' && (
                <>
                  <GameCard uiColor="#0f0" icon="🧬" title={cat.games.scienceLab.t} desc={cat.games.scienceLab.d} badge="NEXUS" badgeColor="#0f0" onClick={() => startGame('SCIENCE_LAB')} />
                  <GameCard uiColor="#ff0055" icon="⚖️" title={cat.games.redoxBalancer.t} desc={cat.games.redoxBalancer.d} onClick={() => startGame('REDOX_BALANCER')} />
                </>
              )}

              {/* === VISTA 6: JUEGOS DE LECTURA CRÍTICA === */}
              {menuView === 'cat_read' && (
                <>
                  <GameCard uiColor="#00f2ff" icon="📖" title={cat.games.readingLab.t} desc={cat.games.readingLab.d} badge="NEXUS" badgeColor="#00f2ff" onClick={() => startGame('READING_LAB')} />
                  {/* 🟣 CARTUCHO INYECTADO: ACELERADOR RSVP */}
                  <GameCard uiColor="#8b5cf6" icon="⚡" title={cat.games.quantumReader.t} desc={cat.games.quantumReader.d} badge="PRO" badgeColor="#ffea00" onClick={() => startGame('QUANTUM_READER')} />
                </>
              )}

              {/* === VISTA 7: JUEGOS DE SOCIALES === */}
              {menuView === 'cat_soc' && (
                <>
                  <GameCard uiColor="#ffaa00" icon="⚖️" title={cat.games.socialesLab.t} desc={cat.games.socialesLab.d} badge="NEXUS" badgeColor="#ffaa00" onClick={() => startGame('SOCIALES_LAB')} />
                </>
              )}

            </div>
          </section>
        </main>
      )}

      {/* ==============================================
          PANTALLA 3: ENRUTADOR DEL JUEGO (Visor 3D)
      ============================================== */}
      {appState === 'PLAYING' && (
        <div style={ui.screen}>
          <div style={{...ui.criticalOverlay, opacity: isCritical ? 1 : 0}} />
          
          <nav style={ui.mobileNavPlay}>
            <button onClick={resetProgress} style={ui.navBackBtn}>{t.reset}</button>
          </nav>

          {/* QUIZ SYSTEM GENÉRICO */}
          {activeQuiz && (
            <div style={ui.quizOverlay}>
              <div style={ui.quizBox}>
                <h2 style={{color:'#00f2ff', margin:0, letterSpacing:'1px', fontSize: 'clamp(18px, 5vw, 28px)'}}>{activeQuiz.title}</h2>
                <p style={{fontSize:'clamp(15px, 4vw, 22px)', margin:'clamp(15px, 4vh, 30px) 0', lineHeight:'1.4'}}>{activeQuiz.question}</p>
                
                {!quizFeedback && (
                  <div style={ui.quizGrid}>
                    {activeQuiz.options.map((opt, i) => (
                      <button key={i} onClick={() => answerQuizQuestion(opt)} style={ui.quizBtn}>{opt.text}</button>
                    ))}
                  </div>
                )}

                {quizFeedback && (
                  <div style={{ padding: 'clamp(15px, 4vw, 30px)', background: quizFeedback.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,85,0.1)', border: `2px solid ${quizFeedback.type === 'success' ? '#0f0' : '#ff0055'}`, color: quizFeedback.type === 'success' ? '#0f0' : '#ff0055', borderRadius: '12px', textAlign: 'left' }}>
                    <h3 style={{marginTop: 0, fontSize: 'clamp(16px, 4.5vw, 24px)', textAlign: 'center'}}>{quizFeedback.type === 'success' ? t.correct : t.error}</h3>
                    <p style={{color: '#fff', fontSize: 'clamp(14px, 4vw, 20px)', textAlign: 'center', margin: '15px 0'}}>{quizFeedback.text}</p>
                    
                    {quizFeedback.type === 'error' && activeQuiz.miniClass && (
                      <div style={{marginTop: '15px', padding: 'clamp(10px, 3vw, 15px)', background: 'rgba(0,242,255,0.05)', borderLeft: '4px solid #00f2ff', borderRadius: '6px'}}>
                        <h4 style={{margin: '0 0 8px 0', color: '#00f2ff', fontSize: 'clamp(13px, 3vw, 16px)'}}>{t.classHeader}</h4>
                        <p style={{margin: 0, color: '#ddd', fontSize: 'clamp(13px, 3.5vw, 16px)', lineHeight: '1.5'}}>{activeQuiz.miniClass}</p>
                      </div>
                    )}

                    <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                      {quizFeedback.type === 'success' ? (
                        <button onClick={closeQuiz} style={{...ui.solidCyberBtn, width: '100%'}}>{t.continue}</button>
                      ) : (
                        <button onClick={clearFeedback} style={{...ui.cyberBtn, width: '100%', borderColor: '#ff0055', color: '#ff0055'}}>{t.tryAgain}</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 🚀 ENRUTADOR DINÁMICO O(1) 🚀 */}
          {ActiveGameComponent ? (
             <ActiveGameComponent />
          ) : (
             <>
                {/* EL MOTOR BASE ORIGINAL (GAS LAWS) SE MANTIENE INTACTO COMO FALLBACK */}
                <div className="game-panel-left" style={ui.leftPanel(isMobile)}>
                  <div className="material-selector-box" style={{...ui.sectionBox, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, pointerEvents: 'auto'}}>
                    <div className="search-filter-wrap" style={{display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', alignItems: 'center'}}>
                      <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={ui.searchInput(isMobile)} />
                      <div className="filter-buttons" style={{display:'flex', gap:'5px', flexShrink: 0, overflowX: 'auto', width: isMobile ? 'auto' : '100%', paddingBottom: isMobile ? '5px' : '0'}}>
                        <button onClick={()=>setFilterCategory('All')} style={filterCategory==='All'?ui.pillA:ui.pill}>{t.filterAll}</button>
                        <button onClick={()=>setFilterCategory('Elemento')} style={filterCategory==='Elemento'?ui.pillA:ui.pill}>{t.filterComp}</button>
                        <button onClick={()=>setFilterCategory('Compuesto')} style={filterCategory==='Compuesto'?ui.pillA:ui.pill}>{t.filterComp}</button>
                      </div>
                    </div>
                    <div className="materials-list" style={{flex: 1, overflowY: isMobile ? 'hidden' : 'auto', overflowX: isMobile ? 'auto' : 'hidden', marginTop: '10px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', paddingBottom: isMobile ? '10px' : '0'}}>
                      {filteredMaterials.map(m => (
                        <button key={m.id} className="mat-btn-item" onClick={() => setMaterial(m.id)} style={activeMaterial === m.id ? ui.matBtnActive(isMobile) : ui.matBtn(isMobile)}>
                          <span style={{fontWeight:'bold', width: isMobile ? 'auto' : '40px', display:'inline-block', marginRight: isMobile ? '0' : '5px', fontSize: isMobile ? '16px' : 'inherit'}}>{m.symbol}</span> 
                          {!isMobile && m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {!isMobile && (
                    <div className="element-stats-box" style={{...ui.sectionBox, background:'rgba(0,15,30,0.8)', borderLeft:'3px solid #00f2ff', flexShrink: 0, pointerEvents: 'auto'}}>
                      <h3 style={ui.panelTitle}>// {mat.symbol} ({t[phaseID]?.toUpperCase() || phaseID.toUpperCase()})</h3>
                      <div className="stats-row-group" style={{display: 'flex', flexDirection: 'column'}}>
                          <div style={ui.dataRow(isMobile)}><span>{t.atomicNum}</span><span style={{color:'#ffea00'}}>{mat.atomicNum}</span></div>
                          <div style={ui.dataRow(isMobile)}><span>{t.mass}</span><span style={{color:'#ffea00'}}>{mat.mass}</span></div>
                          <div style={ui.dataRow(isMobile)}><span>{t.eConfig}</span><span style={{color:'#00f2ff', fontSize:'9px'}}>{mat.eConfig}</span></div>
                          <div style={ui.dataRow(isMobile)}><span>{t.density}</span><span style={{color:'#00f2ff'}}>{mat.density}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="game-panel-right" style={ui.rightPanel(isMobile)}>
                  <div className="score-box" style={{...ui.sectionBox, borderLeft:'4px solid #ffea00', background:'rgba(50,40,0,0.8)', flexShrink: 0, pointerEvents: 'auto'}}>
                    <h3 style={{...ui.panelTitle, color:'#ffea00', fontSize:'clamp(11px, 2.5vw, 14px)', margin:0}}>🏆 SCORE: {score} PTS</h3>
                  </div>
                  <div className="mode-selector-box" style={{...ui.sectionBox, flexShrink: 0, pointerEvents: 'auto'}}>
                    <h3 style={ui.panelTitle}>// {t.classMode || "LEYES"}</h3>
                    <div style={ui.modeGrid(isMobile)}>
                      {['FREE', 'BOYLE', 'CHARLES', 'GAY_LUSSAC'].map(m => <button key={m} onClick={()=>setMode(m)} style={activeMode===m ? ui.modeBtnA : ui.modeBtn}>{t[`mode${m.charAt(0)+m.slice(1).toLowerCase().replace('_l','L')}`] || m}</button>)}
                    </div>
                    {!isMobile && (
                      <div style={{marginTop:'15px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}><strong style={{color:'#00f2ff'}}>{lesson.title}</strong><br/><span style={{color:'#ffea00'}}>{t.goal}:</span> {lesson.goal}<br/><span style={{color:'#00f2ff'}}>{t.idea}:</span> {lesson.idea}</div>
                    )}
                  </div>
                  {activeMode !== 'FREE' && !isMobile && (
                    <div style={{...ui.sectionBox, borderLeft:'3px solid #ff0055', background:'rgba(30,0,10,0.8)', flexShrink: 0, maxHeight: '25vh', overflowY: 'auto', pointerEvents: 'auto'}}>
                      <h3 style={{...ui.panelTitle, color:'#ff0055'}}>{t.labTitle}</h3>
                      {!exampleSession && examples?.map((ex, idx) => (
                        <button key={idx} onClick={() => loadExampleScenario(activeMode, idx)} style={{...ui.solidCyberBtn, width:'100%', fontSize:'12px', padding:'10px', marginTop:'5px', background:'linear-gradient(45deg, #ff0055, #880022)'}}>{t.startLab}: {ex.title}</button>
                      ))}
                      {exampleSession && (
                        <div style={{marginTop:'10px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}>
                          <strong style={{color:'#ff0055'}}>{exampleSession.title}</strong><p style={{margin:'5px 0', color:'#fff'}}>{exampleSession.prompt}</p>
                          <ul style={{paddingLeft:'15px', color:'#ffea00'}}>{exampleSession.steps.map((step, i) => <li key={i}>{step}</li>)}</ul>
                          {exampleSession.completed ? (<div style={{padding:'10px', background:'rgba(0,255,0,0.2)', color:'#0f0', border:'1px solid #0f0', textAlign:'center', marginTop:'10px'}}>✅ {t.stepDone} (+200 PTS)</div>) : (<div style={{padding:'5px', textAlign:'center', color:'#ff0055'}}>...</div>)}
                          <button onClick={exitExample} style={{...ui.cyberBtn, padding:'5px', fontSize:'10px', width:'100%', marginTop:'10px'}}>{t.exitLab}</button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="equation-box" style={{...ui.sectionBox, textAlign:'center', flexShrink: 0, pointerEvents: 'auto'}}>
                    <LiveEquation mode={activeMode} p={pressure} v={volume} t={temp} />
                  </div>
                  <button className="generate-quiz-btn" onClick={triggerExercise} disabled={isGeneratingQuiz} style={{...ui.iaButton, opacity: isGeneratingQuiz ? 0.5 : 1, flexShrink: 0, pointerEvents: 'auto'}}>
                    {isGeneratingQuiz ? t.loadingAI : t.generate}
                  </button>
                </div>

                {/* VISOR 3D ORIGINAL */}
                <Canvas style={{position: 'absolute', inset: 0, zIndex: 1}} camera={{ position: [0, 4, isMobile ? 26 : 15], fov: 45 }}>
                  <color attach="background" args={['#010204']} /><Environment preset="night" /><ambientLight intensity={0.2} /><pointLight position={[0, 5, 0]} intensity={phaseID==='plasma'?10:3} color={phaseID==='plasma'?'#ffffff':'#00f2ff'} /><Stars count={6000} factor={5} fade speed={1} />
                  <Suspense fallback={null}>
                    <group position={[0, isMobile ? 1 : -2, 0]}>
                      <mesh position={[0, 2, 0]}><cylinderGeometry args={[2.5, 2.5, 4, 64]} /><meshPhysicalMaterial transparent opacity={0.15} color="#00f2ff" metalness={1} roughness={0} side={2}/></mesh>
                      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[2.6, 2.8, 0.4, 64]} /><meshStandardMaterial color="#050505" /></mesh>
                      <MolecularPhysics count={isMobile ? 120 : 250} />
                    </group>
                  </Suspense>
                  <EffectComposer><Bloom luminanceThreshold={phaseID==='plasma'?0.5:1} mipmapBlur intensity={phaseID==='plasma'?3.0:2.0} />{isCritical && <ChromaticAberration offset={[0.01, 0.01]} />}</EffectComposer>
                  <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
                </Canvas>

                {/* PANEL DE CONTROLES INFERIOR */}
                <div className="main-controls-dock" style={ui.controlPanel(isMobile)}>
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='BOYLE')?0.2:1, pointerEvents: (activeMode==='BOYLE')?'none':'auto'}}>
                     <div style={ui.controlLabel('#00f2ff')}>{t.temp}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('TEMP', 500)} style={ui.actionBtn('#ff0055')}>+500</button>
                       <button onClick={() => updatePhysics('TEMP', 50)} style={ui.actionBtn('#ff0055')}>+50</button>
                       <button onClick={() => updatePhysics('TEMP', -500)} style={ui.actionBtn('#00f2ff')}>-500</button>
                     </div>
                   </div>
                   
                   <div className="hud-readout-center" style={ui.hudControl(isCritical, phaseID, isMobile)}>
                      <div style={ui.hudVal(false, phaseID==='plasma'?'#fff':'#00f2ff', isMobile)}>{temp}K</div>
                      <div style={ui.hudVal(isCritical, '#ff0055', isMobile)}>{pressure.toFixed(1)} PSI</div>
                      <div style={ui.hudVal(false, '#ffea00', isMobile)}>{volume}%</div>
                   </div>
                   
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='CHARLES')?0.2:1, pointerEvents: (activeMode==='CHARLES')?'none':'auto'}}>
                     <div style={ui.controlLabel('#ffea00')}>{t.vol}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('VOL', 10)} style={ui.actionBtn('#ffea00')}>+10</button>
                       <button onClick={() => updatePhysics('VOL', -10)} style={ui.actionBtn('#ffea00')}>-10</button>
                     </div>
                   </div>
                   
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?0.2:1, pointerEvents: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?'none':'auto'}}>
                     <div style={ui.controlLabel('#ff0055')}>{t.press}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('PRESS', 10)} style={ui.actionBtn('#ff0055')}>+10</button>
                       <button onClick={() => updatePhysics('PRESS', -10)} style={ui.actionBtn('#ff0055')}>-10</button>
                     </div>
                   </div>
                </div>
             </>
          )}
        </div>
      )}
    </>
  );
}

// ============================================================
// 🎨 DICCIONARIO DE ESTILOS MOBILE-FIRST (INALTERADO)
// ============================================================
const ui = {
  screenGame: { 
    width:'100vw', height:'100dvh', backgroundColor:'#010204', display:'flex', flexDirection:'column', 
    alignItems:'center', justifyContent:'center', fontFamily:'Orbitron, sans-serif', position:'relative', 
    overflowY:'auto', overflowX:'hidden', WebkitTapHighlightColor: 'transparent',
    padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' 
  },
  hexBackground: { position:'fixed', inset:0, backgroundImage:'radial-gradient(circle at center, rgba(0,242,255,0.03) 0%, transparent 70%)', backgroundSize:'30px 30px', zIndex: 1, pointerEvents:'none' },
  vignette: { position:'fixed', inset:0, boxShadow:'inset 0 0 250px rgba(0,0,0,0.95)', zIndex:2, pointerEvents:'none' },
  
  mobileNav: {
    position: 'absolute', top: 'env(safe-area-inset-top)', left: 0, right: 0, 
    padding: 'clamp(10px, 4vw, 20px)', zIndex: 100, display: 'flex', justifyContent: 'flex-start'
  },
  mobileNavPlay: {
    position: 'absolute', top: 'env(safe-area-inset-top)', left: 0, right: 0, 
    padding: 'clamp(10px, 4vw, 20px)', zIndex: 1000, display: 'flex', justifyContent: 'flex-start', pointerEvents: 'none'
  },
  navBackBtn: { 
    background:'rgba(0,10,20,0.8)', border:'1px solid rgba(0,242,255,0.5)', color:'#00f2ff', 
    padding:'clamp(10px, 3vw, 15px) clamp(15px, 4vw, 25px)', cursor:'pointer', fontFamily:'Orbitron', 
    fontSize: 'clamp(12px, 3.5vw, 14px)', borderRadius: '8px', fontWeight: 'bold', backdropFilter:'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.5)', pointerEvents: 'auto'
  },

  centerBoxGame: { 
    zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', backdropFilter:'blur(12px)', 
    padding:'clamp(20px, 5vw, 40px)', background:'rgba(0,5,15,0.6)', border:'1px solid rgba(0,242,255,0.1)', 
    borderRadius:'20px', boxShadow:'0 10px 40px rgba(0,0,0,0.8)', boxSizing: 'border-box', width: '90%', maxWidth: '600px' 
  },
  titleGame: { 
    color:'#00f2ff', fontSize:'clamp(24px, 7vw, 55px)', letterSpacing:'clamp(1px, 1vw, 6px)', 
    textAlign:'center', margin:'0 0 20px 0', textShadow:'0 0 20px rgba(0,242,255,0.4)', fontWeight:900, lineHeight: 1.2 
  },
  
  btnGridGame: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'15px', width:'100%' },
  gameGrid: { 
    display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(clamp(260px, 40vw, 320px), 1fr))', 
    gap:'clamp(15px, 4vw, 30px)', width:'100%', paddingBottom: 'clamp(20px, 5vw, 40px)' 
  },
  gameCard: { 
    border: '1px solid rgba(0,242,255,0.3)', padding: 'clamp(20px, 5vw, 30px)', borderRadius: '16px', 
    textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', 
    minHeight: '140px', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(8px)',
    userSelect: 'none'
  },
  
  cyberBtn: { padding:'clamp(14px, 4vw, 18px)', background:'rgba(0,10,20,0.8)', border:'1px solid #005577', color:'#00f2ff', cursor:'pointer', fontSize:'clamp(14px, 3.5vw, 16px)', fontFamily:'Orbitron', fontWeight:'bold', borderRadius: '10px', minHeight: '48px' },
  solidCyberBtn: { padding:'clamp(14px, 4vw, 18px)', background:'linear-gradient(45deg, rgba(0,242,255,0.2), rgba(0,0,0,0.9))', borderLeft:'4px solid #00f2ff', color:'#fff', cursor:'pointer', fontSize:'clamp(14px, 3.5vw, 16px)', fontFamily:'Orbitron', fontWeight:'bold', borderRadius: '10px', minHeight: '48px' },
  
  screen: { width:'100vw', height:'100dvh', background:'#010204', fontFamily:'Orbitron', overflow:'hidden', position:'relative', pointerEvents: 'auto' },
  criticalOverlay: { position:'absolute', inset:0, boxShadow:'inset 0 0 150px rgba(255,0,85,0.3)', pointerEvents:'none', zIndex:99, transition:'0.3s' },
  
  leftPanel: (isMobile) => ({ position:'absolute', top: isMobile ? 'max(70px, calc(env(safe-area-inset-top) + 60px))' : '80px', left: isMobile ? '10px' : '30px', right: isMobile ? '10px' : 'auto', zIndex:50, display: 'flex', flexDirection: 'column', gap:'10px', width: isMobile ? 'auto' : 'clamp(200px, 25vw, 280px)', height: isMobile ? 'auto' : 'calc(100vh - 180px)', pointerEvents: 'none' }),
  rightPanel: (isMobile) => ({ position:'absolute', top: isMobile ? 'auto' : '80px', bottom: isMobile ? 'calc(clamp(90px, 15vh, 120px) + env(safe-area-inset-bottom))' : 'auto', right: isMobile ? '10px' : '30px', left: isMobile ? '10px' : 'auto', zIndex:50, display: 'flex', flexDirection: isMobile ? 'row' : 'column', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'space-around', gap:'10px', width: isMobile ? 'auto' : 'clamp(220px, 28vw, 300px)', maxHeight: isMobile ? 'auto' : 'calc(100vh - 180px)', pointerEvents: 'none' }),
  
  sectionBox: { background:'rgba(0,10,20,0.85)', border:'1px solid rgba(0,85,119,0.5)', padding:'clamp(10px, 3vw, 15px)', backdropFilter:'blur(12px)', borderRadius: '12px' },
  panelTitle: { color:'#4488aa', margin:'0 0 10px 0', fontSize:'clamp(11px, 2.5vw, 13px)', letterSpacing:'1px' },
  searchInput: (isMobile) => ({ width: isMobile ? 'auto' : '100%', flex: isMobile ? '1' : 'none', padding:'12px', background:'rgba(0,0,0,0.6)', border:'1px solid #00f2ff', color:'#fff', fontFamily:'Orbitron', fontSize:'14px', outline:'none', boxSizing:'border-box', borderRadius: '8px' }),
  pill: { flex:1, padding:'10px 6px', fontSize:'clamp(10px, 2.5vw, 12px)', background:'rgba(0,0,0,0.5)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', borderRadius: '6px', whiteSpace: 'nowrap' },
  pillA: { flex:1, padding:'10px 6px', fontSize:'clamp(10px, 2.5vw, 12px)', background:'rgba(0,242,255,0.15)', color:'#fff', border:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', borderRadius: '6px', whiteSpace: 'nowrap' },
  matBtn: (isMobile) => ({ padding:'14px 10px', background:'rgba(0,0,0,0.6)', color:'#00f2ff', border:'1px solid #005577', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3vw, 15px)', textAlign:'center', borderRadius: '8px', minWidth: isMobile ? '75px' : '100%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  matBtnActive: (isMobile) => ({ padding:'14px 10px', background:'rgba(0,242,255,0.2)', color:'#fff', border:'2px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3vw, 15px)', fontWeight:'bold', textAlign:'center', borderRadius: '8px', minWidth: isMobile ? '75px' : '100%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  
  dataRow: (isMobile) => ({ display:'flex', justifyContent:'space-between', alignItems: 'center', gap: '5px', fontSize:'clamp(11px, 2.5vw, 13px)', marginBottom: isMobile ? '0' : '8px', color:'#fff', borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', paddingBottom: isMobile ? '0' : '4px', whiteSpace: 'nowrap', padding: isMobile ? '6px 12px' : '0', background: isMobile ? 'rgba(0,0,0,0.5)' : 'transparent', borderRadius: isMobile ? '6px' : '0' }),

  modeGrid: (isMobile) => ({ display:'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : '1fr 1fr', gap:'8px' }),
  modeBtn: { padding:'14px 4px', background:'rgba(0,0,0,0.6)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(10px, 2.5vw, 12px)', borderRadius: '8px' },
  modeBtnA: { padding:'14px 4px', background:'rgba(255,234,0,0.15)', color:'#ffea00', border:'1px solid #ffea00', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(10px, 2.5vw, 12px)', fontWeight:'bold', borderRadius: '8px' },
  
  iaButton: { width:'100%', padding:'clamp(14px, 3.5vw, 18px)', background:'linear-gradient(45deg, #7b2cbf, #b5179e)', border:'2px solid #f72585', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3.5vw, 16px)', fontWeight:'bold', marginTop:'5px', boxShadow:'0 0 15px rgba(247, 37, 133, 0.4)', borderRadius: '10px', minHeight: '50px' },
  
  controlPanel: (isMobile) => ({ position:'absolute', bottom: 'max(15px, env(safe-area-inset-bottom))', left:'50%', transform:'translateX(-50%)', zIndex:150, display:'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems:'center', gap:'clamp(10px, 2vw, 20px)', background:'rgba(0,5,15,0.9)', padding:'clamp(12px, 3vw, 20px)', borderRadius:'18px', border:'1px solid rgba(0,242,255,0.3)', boxShadow:'0 10px 30px rgba(0,0,0,0.8)', backdropFilter:'blur(15px)', width: '95%', maxWidth: '900px', boxSizing: 'border-box', pointerEvents: 'auto' }),
  
  controlGroup: { display:'flex', flexDirection:'column', gap:'8px', alignItems: 'center' },
  controlLabel: (color) => ({ fontSize: 'clamp(11px, 2.5vw, 13px)', color: color, letterSpacing: '1px', textAlign: 'center', margin: 0, textShadow: `0 0 5px ${color}`, fontWeight: 'bold' }),
  actionBtn: (color) => ({ padding:'clamp(12px, 3vw, 15px) clamp(15px, 3.5vw, 20px)', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.15)`, border:`1px solid ${color}`, color:color, cursor:'pointer', fontWeight:'bold', fontFamily:'Orbitron', borderRadius: '8px', fontSize: 'clamp(13px, 3vw, 16px)', minHeight: '44px', userSelect: 'none' }),
  
  hudControl: (isCrit, phase, isMobile) => ({ background:'rgba(0,0,0,0.7)', padding:'clamp(10px, 3vw, 15px) clamp(15px, 4vw, 30px)', border:`1px solid ${phase==='plasma'?'#fff':(isCrit?'#ff0055':'#00f2ff')}`, textAlign:'center', minWidth:'clamp(140px, 35vw, 180px)', borderRadius:'12px', boxShadow: phase==='plasma'?'0 0 30px rgba(255,255,255,0.3)':'', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '15px' : '5px', alignItems: 'center', justifyContent: 'center' }),
  hudVal: (isCrit, baseColor, isMobile) => ({ fontSize: isMobile ? 'clamp(15px, 4vw, 18px)' : 'clamp(20px, 4.5vw, 26px)', fontWeight:'bold', color: isCrit ? '#ff0055' : baseColor, margin: 0, textShadow:`0 0 8px ${baseColor}` }),
  
  quizOverlay: { position:'absolute', inset:0, background:'rgba(0,5,10,0.95)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(20px)', padding: 'clamp(15px, 4vw, 30px)', boxSizing: 'border-box', pointerEvents: 'auto' },
  quizBox: { background:'rgba(0,10,20,0.95)', border:'1px solid #00f2ff', padding:'clamp(20px, 6vw, 40px)', maxWidth:'800px', width:'100%', maxHeight:'85dvh', overflowY:'auto', textAlign:'center', boxShadow:'0 20px 60px rgba(0,0,0,0.8)', borderRadius: '24px', boxSizing: 'border-box' },
  quizGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'clamp(12px, 3vw, 20px)', marginBottom:'20px', width: '100%' },
  quizBtn: { padding:'clamp(15px, 4vw, 20px)', background:'rgba(255,255,255,0.05)', border:'1px solid #444', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3.5vw, 16px)', textAlign:'center', borderRadius: '12px', minHeight: '60px', fontWeight: 'bold' }
};

if (typeof document !== 'undefined' && !document.getElementById("app-styles-mobile")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "app-styles-mobile";
  styleSheet.innerText = `
    * { -webkit-tap-highlight-color: transparent; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,242,255,0.4); border-radius: 10px; }
    
    @keyframes pulseBadge { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }

    @media (max-width: 768px) {
       .game-panel-left { background: rgba(0,5,15,0.9); backdrop-filter: blur(15px); padding: 12px; border-radius: 16px; border: 1px solid rgba(0,85,119,0.5); }
       .game-panel-right { padding-bottom: 5px; }
       .material-selector-box { flex-direction: row !important; align-items: center; padding: 12px !important; }
       .filter-buttons { margin-top: 0 !important; }
       .element-stats-box { display: none !important; }
       
       .score-box { padding: 10px 15px !important; flex: 1 1 100% !important; margin-bottom: 5px; }
       .mode-selector-box { padding: 10px !important; flex: 1 1 45% !important; min-width: 140px; }
       .equation-box { padding: 10px !important; flex: 1 1 45% !important; min-width: 140px; }
       .generate-quiz-btn { padding: 14px !important; flex: 1 1 100% !important; margin-top: 8px !important; }
       
       .main-controls-dock { gap: 12px !important; padding: 15px 12px !important; }
       .control-column { flex-direction: row !important; align-items: center; width: 100%; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 10px; }
       .control-column:last-child { border-bottom: none; padding-bottom: 0; }
       .hud-readout-center { width: 100%; justify-content: space-around !important; padding: 12px 0 !important; margin-bottom: 8px; border: none !important; background: transparent !important; box-shadow: none !important; }
    }
  `;
  document.head.appendChild(styleSheet);
}