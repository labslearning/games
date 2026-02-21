import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import GasSimulator from '../games/physics/GasSimulator'; // Ejemplo
import RedoxLab from '../games/chemistry/RedoxLab';
import RedoxBalancer from '../games/chemistry/RedoxBalancer';

/* ============================================================
   🌍 DICCIONARIO DEL CATÁLOGO (TIER GOD I18N)
============================================================ */
const CATALOG_I18N = {
  es: {
    header: "CATÁLOGO DE SIMULADORES",
    sub: "INTERFAZ DE ACCESO A PROTOCOLO HYDRA",
    gas: { t: "LEYES DE GASES", d: "Termodinámica, 150 elementos, Plasma y Presión." },
    lab: { t: "QUÍMICA REDOX LAB", d: "Misiones de campo: Identificación de estados y reactividad." },
    bal: { t: "REDOX BALANCER", d: "Simulación 3D: Balanceo de masa y carga nivel avanzado." },
    btn: "INICIAR SIMULACIÓN ➔"
  },
  en: {
    header: "SIMULATOR CATALOG",
    sub: "HYDRA PROTOCOL ACCESS INTERFACE",
    gas: { t: "GAS LAWS", d: "Thermodynamics, 150 elements, Plasma and Pressure." },
    lab: { t: "REDOX CHEMISTRY LAB", d: "Field missions: State identification and reactivity." },
    bal: { t: "REDOX BALANCER", d: "3D Simulation: Advanced mass and charge balancing." },
    btn: "START SIMULATION ➔"
  },
  fr: {
    header: "CATALOGUE DE SIMULATEURS",
    sub: "INTERFACE D'ACCÈS PROTOCOLE HYDRA",
    gas: { t: "LOIS DES GAZ", d: "Thermodynamique, 150 éléments, Plasma et Pression." },
    lab: { t: "LABO RÉDOX", d: "Missions de terrain: États et réactivité." },
    bal: { t: "BALANCEUR RÉDOX", d: "Simulation 3D: Équilibrage de masse et charge." },
    btn: "DÉMARRER ➔"
  },
  de: {
    header: "SIMULATORKATALOG",
    sub: "HYDRA-PROTOKOLL ZUGRIFFSSCHNITTSTELLE",
    gas: { t: "GASGESETZE", d: "Thermodynamik, 150 Elemente, Plasma und Druck." },
    lab: { t: "REDOX-LABOR", d: "Feldmissionen: Identifizierung und Reaktivität." },
    bal: { t: "REDOX-BALANCER", d: "3D-Simulation: Masse- und Ladungsausgleich." },
    btn: "STARTEN ➔"
  }
};

export default function SimulatorCatalog() {
  const { language } = useGameStore();
  const [view, setView] = useState('menu'); // 'menu' | 'gas' | 'lab' | 'bal'

  const dict = CATALOG_I18N[language] || CATALOG_I18N.es;

  // RENDERIZADO DINÁMICO DE LOS SIMULADORES
  if (view === 'gas') return <GasSimulator onBack={() => setView('menu')} />;
  if (view === 'lab') return <RedoxLab onBack={() => setView('menu')} />;
  if (view === 'bal') return <RedoxBalancer onBack={() => setView('menu')} />;

  return (
    <div style={st.container}>
      <header style={st.header}>
        <h1 style={st.mainTitle}>{dict.header}</h1>
        <p style={st.subTitle}>{dict.sub}</p>
      </header>

      <div style={st.grid}>
        {/* 1. LEYES DE GASES */}
        <div style={st.card('#00ff88')} onClick={() => setView('gas')}>
          <div style={st.icon}>🧪</div>
          <h2 style={st.cardTitle}>{dict.gas.t}</h2>
          <p style={st.cardDesc}>{dict.gas.d}</p>
          <button style={st.cardBtn('#00ff88')}>{dict.btn}</button>
        </div>

        {/* 2. REDOX LAB */}
        <div style={st.card('#00f2ff')} onClick={() => setView('lab')}>
          <div style={st.icon}>⚡</div>
          <h2 style={st.cardTitle}>{dict.lab.t}</h2>
          <p style={st.cardDesc}>{dict.lab.d}</p>
          <button style={st.cardBtn('#00f2ff')}>{dict.btn}</button>
        </div>

        {/* 3. NUEVO: REDOX BALANCER (REVOLUCIÓN) */}
        <div style={st.card('#ff0055')} onClick={() => setView('bal')}>
          <div style={st.icon}>⚖️</div>
          <h2 style={st.cardTitle}>{dict.bal.t}</h2>
          <p style={st.cardDesc}>{dict.bal.d}</p>
          <button style={st.cardBtn('#ff0055')}>{dict.btn}</button>
        </div>
      </div>
    </div>
  );
}

const st = {
  container: {
    position: 'absolute', inset: 0,
    background: '#000', color: '#fff',
    fontFamily: 'Orbitron, sans-serif',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    overflowY: 'auto', padding: '40px'
  },
  header: { textAlign: 'center', marginBottom: '60px' },
  mainTitle: { fontSize: '45px', letterSpacing: '10px', textShadow: '0 0 30px rgba(255,255,255,0.2)' },
  subTitle: { color: '#00f2ff', letterSpacing: '5px', fontSize: '14px' },
  grid: { 
    display: 'flex', flexWrap: 'wrap', gap: '30px', 
    justifyContent: 'center', maxWidth: '1200px' 
  },
  card: (color) => ({
    width: '320px', padding: '40px',
    background: 'rgba(255,255,255,0.02)',
    border: `1px solid ${color}44`,
    borderRadius: '20px',
    cursor: 'pointer',
    transition: '0.4s',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', textAlign: 'center',
    backdropFilter: 'blur(10px)',
    ":hover": {
      transform: 'translateY(-15px)',
      borderColor: color,
      boxShadow: `0 0 40px ${color}33`
    }
  }),
  icon: { fontSize: '50px', marginBottom: '20px' },
  cardTitle: { fontSize: '20px', margin: '10px 0', fontWeight: 'bold' },
  cardDesc: { fontSize: '13px', color: '#aaa', lineHeight: '1.5', height: '60px' },
  cardBtn: (color) => ({
    marginTop: '20px', padding: '12px 30px',
    background: 'transparent', border: `2px solid ${color}`,
    color: color, fontWeight: 'bold', fontFamily: 'Orbitron',
    borderRadius: '5px', cursor: 'pointer'
  })
};
