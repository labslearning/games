import React, { useState, useEffect } from 'react';
import { useGameStore, i18n } from '../../store/useGameStore';

export default function QuantumTitration() {
  const { language } = useGameStore();
  const [scanLine, setScanLine] = useState(0);
  const [phValue, setPhValue] = useState(7);

  // Animación del escáner holográfico
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev > 100 ? 0 : prev + 2));
      setPhValue((Math.random() * 14).toFixed(1));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Textos dinámicos simples para la demostración
  const isEs = language === 'es';

  return (
    <div style={styles.container}>
      <div style={styles.vignette} />
      <div style={styles.hexBackground} />

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>🧬 {isEs ? "TITULACIÓN ÁCIDO-BASE" : "ACID-BASE TITRATION"}</h1>
        <div style={styles.badge}>{isEs ? "MÓDULO EN CONSTRUCCIÓN // CALIBRANDO" : "MODULE UNDER CONSTRUCTION // CALIBRATING"}</div>
      </div>

      {/* MAIN GRID */}
      <div style={styles.grid}>
        
        {/* PANEL IZQUIERDO: Teoría Pedagógica */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>// {isEs ? "MARCO TEÓRICO" : "THEORETICAL FRAMEWORK"}</h2>
          <p style={styles.text}>
            {isEs ? "La titulación es un método de análisis químico cuantitativo de laboratorio. Se utiliza para determinar la concentración (Molaridad) de un reactivo (analito) utilizando un reactivo de concentración conocida (titulante)." : "Titration is a laboratory method of quantitative chemical analysis. It is used to determine the concentration (Molarity) of an identified analyte using a titrant of known concentration."}
          </p>
          <div style={styles.theoryBox}>
            <strong style={{color:'#ff0055'}}>{isEs ? "PUNTO DE EQUIVALENCIA" : "EQUIVALENCE POINT"}:</strong><br/>
            {isEs ? "El momento exacto donde los moles de ácido igualan a los moles de base." : "The exact moment when moles of acid equal moles of base."}
          </div>
          <div style={styles.theoryBox}>
            <strong style={{color:'#ffea00'}}>{isEs ? "INDICADOR VISUAL" : "VISUAL INDICATOR"}:</strong><br/>
            {isEs ? "Sustancia (ej. Fenolftaleína) que cambia de color cuando ocurre la neutralización." : "Substance (e.g. Phenolphthalein) that changes color when neutralization occurs."}
          </div>
        </div>

        {/* PANEL CENTRAL: Holograma del futuro simulador */}
        <div style={styles.centerPanel}>
          <div style={styles.scannerContainer}>
            <div style={{...styles.scanLine, top: `${scanLine}%`}} />
            <div style={styles.blueprint}>
              <div style={styles.burette}>
                <div style={styles.liquidDrop} />
              </div>
              <div style={styles.flask} />
            </div>
            <div style={styles.phMeter}>
              PH SENSOR: <span style={{color: phValue < 7 ? '#ff0055' : phValue > 7 ? '#00f2ff' : '#0f0'}}>{phValue}</span>
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Matemáticas y Escala pH */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>// {isEs ? "MODELO MATEMÁTICO" : "MATHEMATICAL MODEL"}</h2>
          
          <div style={styles.mathBox}>
            <span style={{color:'#ff0055'}}>C<sub>a</sub></span> · <span style={{color:'#ffea00'}}>V<sub>a</sub></span> = <span style={{color:'#00f2ff'}}>C<sub>b</sub></span> · <span style={{color:'#0f0'}}>V<sub>b</sub></span>
          </div>
          <ul style={{...styles.text, listStyle:'none', padding:0}}>
            <li><span style={{color:'#ff0055'}}>C<sub>a</sub></span> : {isEs ? "Concentración del Ácido" : "Acid Concentration"}</li>
            <li><span style={{color:'#ffea00'}}>V<sub>a</sub></span> : {isEs ? "Volumen del Ácido" : "Acid Volume"}</li>
            <li><span style={{color:'#00f2ff'}}>C<sub>b</sub></span> : {isEs ? "Concentración de la Base" : "Base Concentration"}</li>
            <li><span style={{color:'#0f0'}}>V<sub>b</sub></span> : {isEs ? "Volumen de la Base" : "Base Volume"}</li>
          </ul>

          <h2 style={{...styles.panelTitle, marginTop:'30px'}}>// {isEs ? "ESPECTRO DE pH" : "pH SPECTRUM"}</h2>
          <div style={styles.phScale}>
            <div style={styles.phGradient} />
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', marginTop:'5px', color:'#aaa'}}>
              <span>0 (ÁCIDO)</span>
              <span>7 (NEUTRO)</span>
              <span>14 (BASE)</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// 🎨 DICCIONARIO DE ESTILOS "TIER GOD"
const styles = {
  container: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#010204', fontFamily: 'Orbitron, sans-serif', overflow: 'hidden', padding: '40px' },
  hexBackground: { position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, rgba(0,242,255,0.03) 0%, transparent 70%)', backgroundSize:'40px 40px', zIndex: 1 },
  vignette: { position:'absolute', inset:0, boxShadow:'inset 0 0 250px rgba(0,0,0,0.95)', zIndex:2 },
  
  header: { zIndex: 10, textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '45px', color: '#ff0055', margin: 0, letterSpacing: '4px', textShadow: '0 0 20px rgba(255,0,85,0.5)', textTransform: 'uppercase' },
  badge: { display: 'inline-block', padding: '8px 20px', backgroundColor: 'rgba(255,234,0,0.1)', border: '1px solid #ffea00', color: '#ffea00', fontSize: '12px', letterSpacing: '2px', marginTop: '10px', animation: 'pulse 2s infinite' },

  grid: { zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', width: '100%', maxWidth: '1200px', height: '60vh' },
  
  panel: { backgroundColor: 'rgba(0,10,20,0.7)', border: '1px solid rgba(0,242,255,0.3)', borderRadius: '8px', padding: '25px', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', boxShadow: '0 0 30px rgba(0,0,0,0.8)' },
  panelTitle: { color: '#00f2ff', fontSize: '14px', letterSpacing: '2px', margin: '0 0 20px 0', borderBottom: '1px solid rgba(0,242,255,0.2)', paddingBottom: '10px' },
  text: { color: '#ccc', fontSize: '14px', lineHeight: '1.6' },
  
  theoryBox: { backgroundColor: 'rgba(255,255,255,0.03)', borderLeft: '3px solid rgba(255,255,255,0.2)', padding: '15px', marginTop: '15px', fontSize: '12px', color: '#ddd' },
  
  mathBox: { backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid #555', padding: '20px', textAlign: 'center', fontSize: '28px', letterSpacing: '3px', borderRadius: '5px', marginBottom: '20px' },
  
  phScale: { width: '100%', marginTop: '10px' },
  phGradient: { height: '20px', width: '100%', background: 'linear-gradient(to right, #ff0000, #ff8800, #ffff00, #00ff00, #00f2ff, #0000ff, #8800ff)', borderRadius: '10px', boxShadow: '0 0 10px rgba(255,255,255,0.2)' },

  centerPanel: { display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  scannerContainer: { width: '80%', height: '80%', border: '2px dashed rgba(0,242,255,0.4)', borderRadius: '10px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(0,242,255,0.02)' },
  scanLine: { position: 'absolute', width: '100%', height: '2px', backgroundColor: '#00f2ff', boxShadow: '0 0 15px 5px rgba(0,242,255,0.5)', zIndex: 20 },
  
  blueprint: { display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.7 },
  burette: { width: '20px', height: '150px', border: '2px solid #00f2ff', borderBottom: 'none', borderTopLeftRadius: '5px', borderTopRightRadius: '5px', position: 'relative' },
  liquidDrop: { width: '6px', height: '10px', backgroundColor: '#ff0055', borderRadius: '50%', position: 'absolute', bottom: '-20px', left: '5px', boxShadow: '0 0 10px #ff0055' },
  flask: { width: '80px', height: '80px', border: '2px solid #ffea00', borderTop: 'none', borderBottomLeftRadius: '40px', borderBottomRightRadius: '40px', marginTop: '30px', position: 'relative', boxShadow: 'inset 0 -20px 20px rgba(255,234,0,0.2)' },
  phMeter: { position: 'absolute', bottom: '20px', backgroundColor: 'rgba(0,0,0,0.8)', padding: '10px 20px', border: '1px solid #555', fontFamily: 'Courier New, monospace', fontSize: '18px', fontWeight: 'bold' }
};

// Insertar keyframes globales en el head para la animación
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse {
      0% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(255,234,0,0.4); }
      50% { opacity: 1; box-shadow: 0 0 10px 5px rgba(255,234,0,0.1); }
      100% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(255,234,0,0); }
    }
  `;
  document.head.appendChild(style);
}
