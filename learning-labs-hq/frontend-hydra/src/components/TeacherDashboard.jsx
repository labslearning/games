import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ComposedChart, Line, Bar, Radar, 
  RadarChart, PolarGrid, PolarAngleAxis, ScatterChart, Scatter
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * TIER GOD DASHBOARD: THE COMMAND CENTER
 * - Correlación PV=nRT en tiempo real.
 * - Mapa de Radar de Competencias (Learning Labs Standard).
 * - Telemetría de Impactos Críticos.
 */
export default function TeacherDashboard({ telemetryData, sessionStats }) {
  
  // 1. Procesamiento de datos para Radar de Competencias
  const skillsData = [
    { subject: 'Ley de Boyle', A: 120, fullMark: 150 },
    { subject: 'Ley de Charles', A: 98, fullMark: 150 },
    { subject: 'Entropía', A: 86, fullMark: 150 },
    { subject: 'Cinética', A: 99, fullMark: 150 },
    { subject: 'Presión', A: 85, fullMark: 150 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.container}
    >
      {/* HEADER INDUSTRIAL */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.glitchTitle}>ANALÍTICA: FORJA MOLECULAR</h1>
          <p style={styles.subtitle}>SISTEMA DE MONITOREO DE APRENDIZAJE ACTIVO</p>
        </div>
        <div style={styles.liveIndicator}>
          <span style={styles.blinkDot} /> LIVE_TELEMETRY_FEED
        </div>
      </header>

      <div style={styles.dashboardGrid}>
        
        {/* COLUMNA IZQUIERDA: TELEMETRÍA FÍSICA */}
        <div style={styles.mainColumn}>
          <div style={styles.chartCard}>
            <h3 style={styles.cardTitle}>CORRELACIÓN TERMODINÁMICA (P/T)</h3>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={telemetryData}>
                <defs>
                  <linearGradient id="colorPress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="timestamp" hide />
                <YAxis yAxisId="left" stroke="#00f2ff" fontSize={10} tickFormatter={(v) => `${v}atm`} />
                <YAxis yAxisId="right" orientation="right" stroke="#ff0055" fontSize={10} tickFormatter={(v) => `${v}K`} />
                <Tooltip 
                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid #00f2ff', borderRadius: '4px' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area yAxisId="left" type="monotone" dataKey="pressure" fill="url(#colorPress)" stroke="#00f2ff" strokeWidth={2} />
                <Line yAxisId="right" type="stepAfter" dataKey="temp" stroke="#ff0055" dot={false} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.secondaryGrid}>
            <div style={styles.smallCard}>
              <h4 style={styles.cardTitle}>DISTRIBUCIÓN DE IMPACTOS</h4>
              <ResponsiveContainer width="100%" height={150}>
                <ScatterChart>
                  <CartesianGrid stroke="#222" />
                  <XAxis type="number" dataKey="x" hide />
                  <YAxis type="number" dataKey="force" stroke="#00ff00" fontSize={8} />
                  <Scatter name="Impactos" data={telemetryData} fill="#00ff00" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PERFIL DEL ESTUDIANTE */}
        <aside style={styles.sideColumn}>
          <div style={styles.chartCard}>
            <h3 style={styles.cardTitle}>MAPA DE COMPETENCIAS</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                <PolarGrid stroke="#333" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#aaa', fontSize: 10 }} />
                <Radar name="Alumno" dataKey="A" stroke="#00f2ff" fill="#00f2ff" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.statsCard}>
            <h3 style={styles.cardTitle}>ESTADÍSTICAS DE SESIÓN</h3>
            {Object.entries(sessionStats).map(([key, value]) => (
              <div key={key} style={styles.statRow}>
                <span style={styles.statKey}>{key.toUpperCase()}</span>
                <span style={styles.statValue}>{value}</span>
              </div>
            ))}
          </div>
        </aside>

      </div>
    </motion.div>
  );
}

const styles = {
  container: {
    background: '#020205',
    minHeight: '100vh',
    padding: '30px',
    color: '#fff',
    fontFamily: "'Orbitron', sans-serif"
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    borderBottom: '1px solid #111',
    paddingBottom: '20px'
  },
  glitchTitle: {
    fontSize: '28px',
    letterSpacing: '5px',
    color: '#00f2ff',
    margin: 0,
    textShadow: '0 0 10px rgba(0, 242, 255, 0.5)'
  },
  subtitle: { fontSize: '10px', color: '#555', letterSpacing: '2px' },
  liveIndicator: {
    fontSize: '10px',
    color: '#00ff00',
    background: 'rgba(0, 255, 0, 0.1)',
    padding: '8px 15px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  blinkDot: {
    width: '8px', height: '8px', background: '#00ff00', borderRadius: '50%',
    boxShadow: '0 0 8px #00ff00'
  },
  dashboardGrid: { display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px' },
  mainColumn: { display: 'flex', flexDirection: 'column', gap: '25px' },
  sideColumn: { display: 'flex', flexDirection: 'column', gap: '25px' },
  chartCard: {
    background: 'rgba(10, 10, 15, 0.8)',
    border: '1px solid #222',
    padding: '20px',
    borderRadius: '4px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
  },
  cardTitle: { fontSize: '12px', letterSpacing: '2px', color: '#888', marginBottom: '20px' },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #111'
  },
  statKey: { fontSize: '10px', color: '#555' },
  statValue: { fontSize: '14px', color: '#00f2ff', fontWeight: 'bold' }
};
