import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Edges, Html, Environment, Sparkles, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline, Noise, Glitch, Pixelation } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../../store/useGameStore';
import { GlitchMode, PixelationMode } from 'postprocessing';

/* ============================================================
   🛡️ ESCUDO ANTI-CRASH (Ingeniería Inversa + Logging Avanzado)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMsg: "", errorStack: "" };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMsg: error.toString(),
      errorStack: error.stack || "No stack trace available"
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error("🚨 [Mendeleev Engine Crash]", {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    });
    // Enviar a servicio de logging (opcional)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'crash', {
        'error': error.toString(),
        'stack': error.stack.substring(0, 500)
      });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#001100',
          color: '#0f0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'monospace',
          zIndex: 9999,
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '50px', textShadow: '0 0 20px #0f0', marginBottom: '20px' }}>⚠️ CRITICAL FAILURE</div>
          <div style={{
            background: 'rgba(0,255,0,0.1)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid #0f0',
            maxWidth: '80%',
            overflow: 'auto',
            maxHeight: '300px',
            fontSize: '14px'
          }}>
            <strong>Error:</strong> {this.state.errorMsg}<br /><br />
            <strong>Stack:</strong> {this.state.errorStack}
          </div>
          <div style={{ marginTop: '30px', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                cursor: 'pointer',
                background: '#0f0',
                color: '#000',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                transition: '0.3s',
                boxShadow: '0 0 15px rgba(0,255,0,0.5)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              REBOOT SYSTEM
            </button>
            <button
              onClick={() => window.open('mailto:support@mendeleevgrid.com?subject=Crash Report&body=' + encodeURIComponent(`Error: ${this.state.errorMsg}\nStack: ${this.state.errorStack}\nUser Agent: ${navigator.userAgent}`), '_blank')}
              style={{
                padding: '15px 30px',
                fontSize: '18px',
                cursor: 'pointer',
                background: 'rgba(255,0,0,0.3)',
                color: '#fff',
                border: '1px solid #f00',
                borderRadius: '5px',
                fontWeight: 'bold',
                transition: '0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,0,0,0.5)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,0,0,0.3)'}
            >
              REPORT ISSUE
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🌌 MENDELEEV ENGINE (Base de Datos Científica Completa + Lógica Pedagógica)
============================================================ */
const ELEMENTS_DB = {
  "H":   { z: 1,  g: 1,  p: 1,  sym: "H",  name: { es: "Hidrógeno", en: "Hydrogen", fr: "Hydrogène", de: "Wasserstoff" }, en: 2.20, rad: 53,   ie: 1312, fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 1.008, density: 0.00008988, melt: 14.01, boil: 20.28, discovery: 1766, discoverer: "Henry Cavendish" },
  "He":  { z: 2,  g: 18, p: 1,  sym: "He", name: { es: "Helio", en: "Helium", fr: "Hélium", de: "Helium" }, en: 0,    rad: 31,   ie: 2372, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 4.0026, density: 0.0001785, melt: 0.95, boil: 4.22, discovery: 1868, discoverer: "Pierre Janssen" },
  "Li":  { z: 3,  g: 1,  p: 2,  sym: "Li", name: { es: "Litio", en: "Lithium", fr: "Lithium", de: "Lithium" }, en: 0.98, rad: 167,  ie: 520,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 6.94, density: 0.534, melt: 453.65, boil: 1560, discovery: 1817, discoverer: "Johan August Arfwedson" },
  "Be":  { z: 4,  g: 2,  p: 2,  sym: "Be", name: { es: "Berilio", en: "Beryllium", fr: "Béryllium", de: "Beryllium" }, en: 1.57, rad: 112,  ie: 899,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 9.0122, density: 1.85, melt: 1560, boil: 2742, discovery: 1798, discoverer: "Louis Nicolas Vauquelin" },
  "B":   { z: 5,  g: 13, p: 2,  sym: "B",  name: { es: "Boro", en: "Boron", fr: "Bore", de: "Bor" }, en: 2.04, rad: 87,   ie: 800,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 10.81, density: 2.34, melt: 2349, boil: 4200, discovery: 1808, discoverer: "Louis Joseph Gay-Lussac" },
  "C":   { z: 6,  g: 14, p: 2,  sym: "C",  name: { es: "Carbono", en: "Carbon", fr: "Carbone", de: "Kohlenstoff" }, en: 2.55, rad: 67,   ie: 1086, fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 12.011, density: 2.267, melt: 3800, boil: 4300, discovery: "Antiguidad", discoverer: "Desconocido" },
  "N":   { z: 7,  g: 15, p: 2,  sym: "N",  name: { es: "Nitrógeno", en: "Nitrogen", fr: "Azote", de: "Stickstoff" }, en: 3.04, rad: 56,   ie: 1402, fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 14.007, density: 0.0012506, melt: 63.15, boil: 77.36, discovery: 1772, discoverer: "Daniel Rutherford" },
  "O":   { z: 8,  g: 16, p: 2,  sym: "O",  name: { es: "Oxígeno", en: "Oxygen", fr: "Oxygène", de: "Sauerstoff" }, en: 3.44, rad: 48,   ie: 1313, fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 15.999, density: 0.001429, melt: 54.36, boil: 90.2, discovery: 1774, discoverer: "Joseph Priestley" },
  "F":   { z: 9,  g: 17, p: 2,  sym: "F",  name: { es: "Flúor", en: "Fluorine", fr: "Fluor", de: "Fluor" }, en: 3.98, rad: 42,   ie: 1681, fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 18.998, density: 0.001696, melt: 53.53, boil: 85.03, discovery: 1886, discoverer: "Henri Moissan" },
  "Ne":  { z: 10, g: 18, p: 2,  sym: "Ne", name: { es: "Neón", en: "Neon", fr: "Néon", de: "Neon" }, en: 0,    rad: 38,   ie: 2080, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 20.18, density: 0.0008999, melt: 24.56, boil: 27.07, discovery: 1898, discoverer: "William Ramsay" },
  "Na":  { z: 11, g: 1,  p: 3,  sym: "Na", name: { es: "Sodio", en: "Sodium", fr: "Sodium", de: "Natrium" }, en: 0.93, rad: 190,  ie: 495,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 22.99, density: 0.971, melt: 370.87, boil: 1156, discovery: 1807, discoverer: "Humphry Davy" },
  "Mg":  { z: 12, g: 2,  p: 3,  sym: "Mg", name: { es: "Magnesio", en: "Magnesium", fr: "Magnésium", de: "Magnesium" }, en: 1.31, rad: 145,  ie: 737,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 24.305, density: 1.738, melt: 923, boil: 1363, discovery: 1755, discoverer: "Joseph Black" },
  "Al":  { z: 13, g: 13, p: 3,  sym: "Al", name: { es: "Aluminio", en: "Aluminum", fr: "Aluminium", de: "Aluminium" }, en: 1.61, rad: 118,  ie: 577,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 26.982, density: 2.698, melt: 933.47, boil: 2792, discovery: 1825, discoverer: "Hans Christian Ørsted" },
  "Si":  { z: 14, g: 14, p: 3,  sym: "Si", name: { es: "Silicio", en: "Silicon", fr: "Silicium", de: "Silicium" }, en: 1.90, rad: 111,  ie: 786,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 28.085, density: 2.329, melt: 1687, boil: 3538, discovery: 1824, discoverer: "Jöns Jacob Berzelius" },
  "P":   { z: 15, g: 15, p: 3,  sym: "P",  name: { es: "Fósforo", en: "Phosphorus", fr: "Phosphore", de: "Phosphor" }, en: 2.19, rad: 98,   ie: 1011, fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 30.974, density: 1.82, melt: 317.3, boil: 550, discovery: 1669, discoverer: "Hennig Brand" },
  "S":   { z: 16, g: 16, p: 3,  sym: "S",  name: { es: "Azufre", en: "Sulfur", fr: "Soufre", de: "Schwefel" }, en: 2.58, rad: 88,   ie: 999,  fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 32.06, density: 2.067, melt: 388.36, boil: 717.87, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Cl":  { z: 17, g: 17, p: 3,  sym: "Cl", name: { es: "Cloro", en: "Chlorine", fr: "Chlore", de: "Chlor" }, en: 3.16, rad: 79,   ie: 1251, fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 35.45, density: 0.003214, melt: 171.6, boil: 239.11, discovery: 1774, discoverer: "Carl Wilhelm Scheele" },
  "Ar":  { z: 18, g: 18, p: 3,  sym: "Ar", name: { es: "Argón", en: "Argon", fr: "Argon", de: "Argon" }, en: 0,    rad: 71,   ie: 1520, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 39.948, density: 0.0017837, melt: 83.8, boil: 87.3, discovery: 1894, discoverer: "Lord Rayleigh" },
  "K":   { z: 19, g: 1,  p: 4,  sym: "K",  name: { es: "Potasio", en: "Potassium", fr: "Potassium", de: "Kalium" }, en: 0.82, rad: 243,  ie: 418,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 39.098, density: 0.862, melt: 336.53, boil: 1032, discovery: 1807, discoverer: "Humphry Davy" },
  "Ca":  { z: 20, g: 2,  p: 4,  sym: "Ca", name: { es: "Calcio", en: "Calcium", fr: "Calcium", de: "Calcium" }, en: 1.00, rad: 194,  ie: 589,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 40.078, density: 1.54, melt: 1115, boil: 1757, discovery: 1808, discoverer: "Humphry Davy" },
  "Sc":  { z: 21, g: 3,  p: 4,  sym: "Sc", name: { es: "Escandio", en: "Scandium", fr: "Scandium", de: "Scandium" }, en: 1.36, rad: 184,  ie: 633,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 44.956, density: 2.989, melt: 1814, boil: 3109, discovery: 1879, discoverer: "Lars Fredrik Nilson" },
  "Ti":  { z: 22, g: 4,  p: 4,  sym: "Ti", name: { es: "Titanio", en: "Titanium", fr: "Titane", de: "Titan" }, en: 1.54, rad: 176,  ie: 658,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 47.867, density: 4.506, melt: 1941, boil: 3560, discovery: 1791, discoverer: "William Gregor" },
  "V":   { z: 23, g: 5,  p: 4,  sym: "V",  name: { es: "Vanadio", en: "Vanadium", fr: "Vanadium", de: "Vanadium" }, en: 1.63, rad: 171,  ie: 650,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 50.942, density: 6.11, melt: 2183, boil: 3680, discovery: 1801, discoverer: "Andrés Manuel del Río" },
  "Cr":  { z: 24, g: 6,  p: 4,  sym: "Cr", name: { es: "Cromo", en: "Chromium", fr: "Chrome", de: "Chrom" }, en: 1.66, rad: 166,  ie: 652,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 51.996, density: 7.15, melt: 2180, boil: 2944, discovery: 1797, discoverer: "Louis Nicolas Vauquelin" },
  "Mn":  { z: 25, g: 7,  p: 4,  sym: "Mn", name: { es: "Manganeso", en: "Manganese", fr: "Manganèse", de: "Mangan" }, en: 1.55, rad: 161,  ie: 717,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 54.938, density: 7.47, melt: 1519, boil: 2334, discovery: 1774, discoverer: "Johann Gottlieb Gahn" },
  "Fe":  { z: 26, g: 8,  p: 4,  sym: "Fe", name: { es: "Hierro", en: "Iron", fr: "Fer", de: "Eisen" }, en: 1.83, rad: 156,  ie: 762,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 55.845, density: 7.874, melt: 1811, boil: 3134, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Co":  { z: 27, g: 9,  p: 4,  sym: "Co", name: { es: "Cobalto", en: "Cobalt", fr: "Cobalt", de: "Kobalt" }, en: 1.88, rad: 152,  ie: 760,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 58.933, density: 8.86, melt: 1768, boil: 3200, discovery: 1735, discoverer: "Georg Brandt" },
  "Ni":  { z: 28, g: 10, p: 4,  sym: "Ni", name: { es: "Níquel", en: "Nickel", fr: "Nickel", de: "Nickel" }, en: 1.91, rad: 149,  ie: 737,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 58.693, density: 8.908, melt: 1728, boil: 3186, discovery: 1751, discoverer: "Axel Fredrik Cronstedt" },
  "Cu":  { z: 29, g: 11, p: 4,  sym: "Cu", name: { es: "Cobre", en: "Copper", fr: "Cuivre", de: "Kupfer" }, en: 1.90, rad: 145,  ie: 745,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 63.546, density: 8.96, melt: 1357.77, boil: 2835, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Zn":  { z: 30, g: 12, p: 4,  sym: "Zn", name: { es: "Zinc", en: "Zinc", fr: "Zinc", de: "Zink" }, en: 1.65, rad: 142,  ie: 906,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 65.38, density: 7.14, melt: 692.88, boil: 1180, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Ga":  { z: 31, g: 13, p: 4,  sym: "Ga", name: { es: "Galio", en: "Gallium", fr: "Gallium", de: "Gallium" }, en: 1.81, rad: 135,  ie: 578,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 69.723, density: 5.907, melt: 302.91, boil: 2673, discovery: 1875, discoverer: "Paul Émile Lecoq de Boisbaudran" },
  "Ge":  { z: 32, g: 14, p: 4,  sym: "Ge", name: { es: "Germanio", en: "Germanium", fr: "Germanium", de: "Germanium" }, en: 2.01, rad: 122,  ie: 762,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 72.63, density: 5.323, melt: 1211.4, boil: 3106, discovery: 1886, discoverer: "Clemens Winkler" },
  "As":  { z: 33, g: 15, p: 4,  sym: "As", name: { es: "Arsénico", en: "Arsenic", fr: "Arsenic", de: "Arsen" }, en: 2.18, rad: 119,  ie: 947,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 74.922, density: 5.727, melt: 1090, boil: 887, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Se":  { z: 34, g: 16, p: 4,  sym: "Se", name: { es: "Selenio", en: "Selenium", fr: "Sélénium", de: "Selen" }, en: 2.55, rad: 103,  ie: 941,  fam: { es: "No Metal", en: "Nonmetal", fr: "Non-métal", de: "Nichtmetall" }, mass: 78.971, density: 4.809, melt: 453, boil: 958, discovery: 1817, discoverer: "Jöns Jacob Berzelius" },
  "Br":  { z: 35, g: 17, p: 4,  sym: "Br", name: { es: "Bromo", en: "Bromine", fr: "Brome", de: "Brom" }, en: 2.96, rad: 94,   ie: 1139, fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 79.904, density: 3.1028, melt: 265.8, boil: 332.0, discovery: 1826, discoverer: "Antoine Jérôme Balard" },
  "Kr":  { z: 36, g: 18, p: 4,  sym: "Kr", name: { es: "Kriptón", en: "Krypton", fr: "Krypton", de: "Krypton" }, en: 3.00, rad: 88,   ie: 1350, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 83.798, density: 0.003733, melt: 115.79, boil: 119.93, discovery: 1898, discoverer: "William Ramsay" },
  "Rb":  { z: 37, g: 1,  p: 5,  sym: "Rb", name: { es: "Rubidio", en: "Rubidium", fr: "Rubidium", de: "Rubidium" }, en: 0.82, rad: 265,  ie: 403,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 85.468, density: 1.532, melt: 312.45, boil: 961, discovery: 1861, discoverer: "Robert Bunsen" },
  "Sr":  { z: 38, g: 2,  p: 5,  sym: "Sr", name: { es: "Estroncio", en: "Strontium", fr: "Strontium", de: "Strontium" }, en: 0.95, rad: 219,  ie: 549,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 87.62, density: 2.64, melt: 1050, boil: 1655, discovery: 1790, discoverer: "Adair Crawford" },
  "Y":   { z: 39, g: 3,  p: 5,  sym: "Y",  name: { es: "Itrio", en: "Yttrium", fr: "Yttrium", de: "Yttrium" }, en: 1.22, rad: 212,  ie: 600,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 88.906, density: 4.469, melt: 1799, boil: 3609, discovery: 1794, discoverer: "Johan Gadolin" },
  "Zr":  { z: 40, g: 4,  p: 5,  sym: "Zr", name: { es: "Circonio", en: "Zirconium", fr: "Zirconium", de: "Zirconium" }, en: 1.33, rad: 206,  ie: 640,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 91.224, density: 6.506, melt: 2128, boil: 4682, discovery: 1789, discoverer: "Martin Heinrich Klaproth" },
  "Nb":  { z: 41, g: 5,  p: 5,  sym: "Nb", name: { es: "Niobio", en: "Niobium", fr: "Niobium", de: "Niob" }, en: 1.60, rad: 198,  ie: 652,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 92.906, density: 8.57, melt: 2750, boil: 5017, discovery: 1801, discoverer: "Charles Hatchett" },
  "Mo":  { z: 42, g: 6,  p: 5,  sym: "Mo", name: { es: "Molibdeno", en: "Molybdenum", fr: "Molybdène", de: "Molybdän" }, en: 2.16, rad: 190,  ie: 684,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 95.95, density: 10.22, melt: 2896, boil: 4912, discovery: 1778, discoverer: "Carl Wilhelm Scheele" },
  "Tc":  { z: 43, g: 7,  p: 5,  sym: "Tc", name: { es: "Tecnecio", en: "Technetium", fr: "Technétium", de: "Technetium" }, en: 1.90, rad: 183,  ie: 702,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 98, density: 11.5, melt: 2430, boil: 4538, discovery: 1937, discoverer: "Carlo Perrier" },
  "Ru":  { z: 44, g: 8,  p: 5,  sym: "Ru", name: { es: "Rutenio", en: "Ruthenium", fr: "Ruthénium", de: "Ruthenium" }, en: 2.20, rad: 178,  ie: 710,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 101.07, density: 12.37, melt: 2607, boil: 4423, discovery: 1844, discoverer: "Karl Ernst Claus" },
  "Rh":  { z: 45, g: 9,  p: 5,  sym: "Rh", name: { es: "Rodio", en: "Rhodium", fr: "Rhodium", de: "Rhodium" }, en: 2.28, rad: 173,  ie: 719,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 102.91, density: 12.41, melt: 2237, boil: 3968, discovery: 1803, discoverer: "William Hyde Wollaston" },
  "Pd":  { z: 46, g: 10, p: 5,  sym: "Pd", name: { es: "Paladio", en: "Palladium", fr: "Palladium", de: "Palladium" }, en: 2.20, rad: 169,  ie: 804,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 106.42, density: 12.02, melt: 1828.05, boil: 3236, discovery: 1803, discoverer: "William Hyde Wollaston" },
  "Ag":  { z: 47, g: 11, p: 5,  sym: "Ag", name: { es: "Plata", en: "Silver", fr: "Argent", de: "Silber" }, en: 1.93, rad: 165,  ie: 731,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 107.87, density: 10.49, melt: 1234.93, boil: 2435, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Cd":  { z: 48, g: 12, p: 5,  sym: "Cd", name: { es: "Cadmio", en: "Cadmium", fr: "Cadmium", de: "Cadmium" }, en: 1.69, rad: 161,  ie: 867,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 112.41, density: 8.65, melt: 594.22, boil: 1040, discovery: 1817, discoverer: "Karl Samuel Leberecht Hermann" },
  "In":  { z: 49, g: 13, p: 5,  sym: "In", name: { es: "Indio", en: "Indium", fr: "Indium", de: "Indium" }, en: 1.78, rad: 156,  ie: 558,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 114.82, density: 7.31, melt: 429.75, boil: 2345, discovery: 1863, discoverer: "Ferdinand Reich" },
  "Sn":  { z: 50, g: 14, p: 5,  sym: "Sn", name: { es: "Estaño", en: "Tin", fr: "Étain", de: "Zinn" }, en: 1.96, rad: 145,  ie: 708,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 118.71, density: 7.287, melt: 505.08, boil: 2875, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Sb":  { z: 51, g: 15, p: 5,  sym: "Sb", name: { es: "Antimonio", en: "Antimony", fr: "Antimoine", de: "Antimon" }, en: 2.05, rad: 133,  ie: 834,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 121.76, density: 6.685, melt: 903.78, boil: 1860, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Te":  { z: 52, g: 16, p: 5,  sym: "Te", name: { es: "Telurio", en: "Tellurium", fr: "Tellure", de: "Tellur" }, en: 2.10, rad: 123,  ie: 869,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 127.6, density: 6.232, melt: 722.66, boil: 1261, discovery: 1782, discoverer: "Franz-Joseph Müller von Reichenstein" },
  "I":   { z: 53, g: 17, p: 5,  sym: "I",  name: { es: "Yodo", en: "Iodine", fr: "Iode", de: "Iod" }, en: 2.66, rad: 115,  ie: 1008, fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 126.9, density: 4.93, melt: 386.85, boil: 457.4, discovery: 1811, discoverer: "Bernard Courtois" },
  "Xe":  { z: 54, g: 18, p: 5,  sym: "Xe", name: { es: "Xenón", en: "Xenon", fr: "Xénon", de: "Xenon" }, en: 2.60, rad: 108,  ie: 1170, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 131.29, density: 0.005887, melt: 161.4, boil: 165.03, discovery: 1898, discoverer: "William Ramsay" },
  "Cs":  { z: 55, g: 1,  p: 6,  sym: "Cs", name: { es: "Cesio", en: "Cesium", fr: "Césium", de: "Cäsium" }, en: 0.79, rad: 298,  ie: 375,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 132.91, density: 1.873, melt: 301.59, boil: 944, discovery: 1860, discoverer: "Robert Bunsen" },
  "Ba":  { z: 56, g: 2,  p: 6,  sym: "Ba", name: { es: "Bario", en: "Barium", fr: "Baryum", de: "Barium" }, en: 0.89, rad: 253,  ie: 502,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 137.33, density: 3.594, melt: 1000, boil: 2170, discovery: 1808, discoverer: "Humphry Davy" },
  "La":  { z: 57, g: 3,  p: 6,  sym: "La", name: { es: "Lantano", en: "Lanthanum", fr: "Lanthane", de: "Lanthan" }, en: 1.10, rad: 240,  ie: 538,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 138.91, density: 6.145, melt: 1193, boil: 3737, discovery: 1839, discoverer: "Carl Gustav Mosander" },
  "Ce":  { z: 58, g: 3,  p: 6,  sym: "Ce", name: { es: "Cerio", en: "Cerium", fr: "Cérium", de: "Cer" }, en: 1.12, rad: 235,  ie: 534,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 140.12, density: 6.77, melt: 1068, boil: 3716, discovery: 1803, discoverer: "Martin Heinrich Klaproth" },
  "Pr":  { z: 59, g: 3,  p: 6,  sym: "Pr", name: { es: "Praseodimio", en: "Praseodymium", fr: "Praséodyme", de: "Praseodym" }, en: 1.13, rad: 239,  ie: 527,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 140.91, density: 6.773, melt: 1208, boil: 3793, discovery: 1885, discoverer: "Carl Auer von Welsbach" },
  "Nd":  { z: 60, g: 3,  p: 6,  sym: "Nd", name: { es: "Neodimio", en: "Neodymium", fr: "Néodyme", de: "Neodym" }, en: 1.14, rad: 231,  ie: 533,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 144.24, density: 7.007, melt: 1297, boil: 3347, discovery: 1885, discoverer: "Carl Auer von Welsbach" },
  "Pm":  { z: 61, g: 3,  p: 6,  sym: "Pm", name: { es: "Promecio", en: "Promethium", fr: "Prométhium", de: "Promethium" }, en: 1.13, rad: 229,  ie: 540,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 145, density: 7.26, melt: 1315, boil: 3273, discovery: 1945, discoverer: "Jacob A. Marinsky" },
  "Sm":  { z: 62, g: 3,  p: 6,  sym: "Sm", name: { es: "Samario", en: "Samarium", fr: "Samarium", de: "Samarium" }, en: 1.17, rad: 229,  ie: 544,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 150.36, density: 7.52, melt: 1345, boil: 2067, discovery: 1879, discoverer: "Paul Émile Lecoq de Boisbaudran" },
  "Eu":  { z: 63, g: 3,  p: 6,  sym: "Eu", name: { es: "Europio", en: "Europium", fr: "Europium", de: "Europium" }, en: 1.20, rad: 231,  ie: 547,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 151.96, density: 5.243, melt: 1099, boil: 1802, discovery: 1901, discoverer: "Eugène-Anatole Demarçay" },
  "Gd":  { z: 64, g: 3,  p: 6,  sym: "Gd", name: { es: "Gadolinio", en: "Gadolinium", fr: "Gadolinium", de: "Gadolinium" }, en: 1.20, rad: 233,  ie: 593,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 157.25, density: 7.895, melt: 1585, boil: 3546, discovery: 1880, discoverer: "Jean Charles Galissard de Marignac" },
  "Tb":  { z: 65, g: 3,  p: 6,  sym: "Tb", name: { es: "Terbio", en: "Terbium", fr: "Terbium", de: "Terbium" }, en: 1.20, rad: 225,  ie: 565,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 158.93, density: 8.229, melt: 1629, boil: 3503, discovery: 1843, discoverer: "Carl Gustav Mosander" },
  "Dy":  { z: 66, g: 3,  p: 6,  sym: "Dy", name: { es: "Disprosio", en: "Dysprosium", fr: "Dysprosium", de: "Dysprosium" }, en: 1.22, rad: 228,  ie: 573,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 162.5, density: 8.55, melt: 1680, boil: 2840, discovery: 1886, discoverer: "Paul Émile Lecoq de Boisbaudran" },
  "Ho":  { z: 67, g: 3,  p: 6,  sym: "Ho", name: { es: "Holmio", en: "Holmium", fr: "Holmium", de: "Holmium" }, en: 1.23, rad: 226,  ie: 581,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 164.93, density: 8.795, melt: 1734, boil: 2993, discovery: 1878, discoverer: "Marc Delafontaine" },
  "Er":  { z: 68, g: 3,  p: 6,  sym: "Er", name: { es: "Erbio", en: "Erbium", fr: "Erbium", de: "Erbium" }, en: 1.24, rad: 226,  ie: 589,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 167.26, density: 9.066, melt: 1802, boil: 3141, discovery: 1842, discoverer: "Carl Gustav Mosander" },
  "Tm":  { z: 69, g: 3,  p: 6,  sym: "Tm", name: { es: "Tulio", en: "Thulium", fr: "Thulium", de: "Thulium" }, en: 1.25, rad: 222,  ie: 596,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 168.93, density: 9.321, melt: 1818, boil: 2223, discovery: 1879, discoverer: "Per Teodor Cleve" },
  "Yb":  { z: 70, g: 3,  p: 6,  sym: "Yb", name: { es: "Iterbio", en: "Ytterbium", fr: "Ytterbium", de: "Ytterbium" }, en: 1.10, rad: 222,  ie: 603,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 173.05, density: 6.965, melt: 1097, boil: 1469, discovery: 1878, discoverer: "Jean Charles Galissard de Marignac" },
  "Lu":  { z: 71, g: 3,  p: 6,  sym: "Lu", name: { es: "Lutecio", en: "Lutetium", fr: "Lutétium", de: "Lutetium" }, en: 1.27, rad: 217,  ie: 523,  fam: { es: "Lantánido", en: "Lanthanide", fr: "Lanthanide", de: "Lanthanoid" }, mass: 174.97, density: 9.84, melt: 1925, boil: 3675, discovery: 1907, discoverer: "Georges Urbain" },
  "Hf":  { z: 72, g: 4,  p: 6,  sym: "Hf", name: { es: "Hafnio", en: "Hafnium", fr: "Hafnium", de: "Hafnium" }, en: 1.30, rad: 208,  ie: 658,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 178.49, density: 13.31, melt: 2506, boil: 4876, discovery: 1923, discoverer: "Dirk Coster" },
  "Ta":  { z: 73, g: 5,  p: 6,  sym: "Ta", name: { es: "Tántalo", en: "Tantalum", fr: "Tantale", de: "Tantal" }, en: 1.50, rad: 200,  ie: 761,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 180.95, density: 16.654, melt: 3290, boil: 5731, discovery: 1802, discoverer: "Anders Gustaf Ekeberg" },
  "W":   { z: 74, g: 6,  p: 6,  sym: "W",  name: { es: "Wolframio", en: "Tungsten", fr: "Tungstène", de: "Wolfram" }, en: 2.36, rad: 193,  ie: 770,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 183.84, density: 19.25, melt: 3695, boil: 5828, discovery: 1783, discoverer: "Juan José y Fausto Elhuyar" },
  "Re":  { z: 75, g: 7,  p: 6,  sym: "Re", name: { es: "Renio", en: "Rhenium", fr: "Rhénium", de: "Rhenium" }, en: 1.90, rad: 188,  ie: 760,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 186.21, density: 21.02, melt: 3459, boil: 5869, discovery: 1925, discoverer: "Walter Noddack" },
  "Os":  { z: 76, g: 8,  p: 6,  sym: "Os", name: { es: "Osmio", en: "Osmium", fr: "Osmium", de: "Osmium" }, en: 2.20, rad: 185,  ie: 840,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 190.23, density: 22.587, melt: 3306, boil: 5285, discovery: 1803, discoverer: "Smithson Tennant" },
  "Ir":  { z: 77, g: 9,  p: 6,  sym: "Ir", name: { es: "Iridio", en: "Iridium", fr: "Iridium", de: "Iridium" }, en: 2.20, rad: 180,  ie: 880,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 192.22, density: 22.562, melt: 2719, boil: 4701, discovery: 1803, discoverer: "Smithson Tennant" },
  "Pt":  { z: 78, g: 10, p: 6,  sym: "Pt", name: { es: "Platino", en: "Platinum", fr: "Platine", de: "Platin" }, en: 2.28, rad: 177,  ie: 870,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 195.08, density: 21.46, melt: 2041.4, boil: 4098, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Au":  { z: 79, g: 11, p: 6,  sym: "Au", name: { es: "Oro", en: "Gold", fr: "Or", de: "Gold" }, en: 2.54, rad: 174,  ie: 890,  fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 196.97, density: 19.282, melt: 1337.33, boil: 3129, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Hg":  { z: 80, g: 12, p: 6,  sym: "Hg", name: { es: "Mercurio", en: "Mercury", fr: "Mercure", de: "Quecksilber" }, en: 2.00, rad: 171,  ie: 1007, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 200.59, density: 13.5336, melt: 234.43, boil: 629.88, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Tl":  { z: 81, g: 13, p: 6,  sym: "Tl", name: { es: "Talio", en: "Thallium", fr: "Thallium", de: "Thallium" }, en: 1.62, rad: 156,  ie: 589,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 204.38, density: 11.85, melt: 577, boil: 1746, discovery: 1861, discoverer: "William Crookes" },
  "Pb":  { z: 82, g: 14, p: 6,  sym: "Pb", name: { es: "Plomo", en: "Lead", fr: "Plomb", de: "Blei" }, en: 2.33, rad: 146,  ie: 715,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 207.2, density: 11.342, melt: 600.61, boil: 2022, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Bi":  { z: 83, g: 15, p: 6,  sym: "Bi", name: { es: "Bismuto", en: "Bismuth", fr: "Bismuth", de: "Wismut" }, en: 2.02, rad: 148,  ie: 703,  fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 208.98, density: 9.78, melt: 544.7, boil: 1837, discovery: "Antiguidad", discoverer: "Desconocido" },
  "Po":  { z: 84, g: 16, p: 6,  sym: "Po", name: { es: "Polonio", en: "Polonium", fr: "Polonium", de: "Polonium" }, en: 2.00, rad: 140,  ie: 812,  fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 209, density: 9.196, melt: 527, boil: 1235, discovery: 1898, discoverer: "Marie Curie" },
  "At":  { z: 85, g: 17, p: 6,  sym: "At", name: { es: "Astato", en: "Astatine", fr: "Astate", de: "Astatin" }, en: 2.20, rad: 127,  ie: 920,  fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 210, density: 7, melt: 575, boil: 610, discovery: 1940, discoverer: "Dale R. Corson" },
  "Rn":  { z: 86, g: 18, p: 6,  sym: "Rn", name: { es: "Radón", en: "Radon", fr: "Radon", de: "Radon" }, en: 2.20, rad: 120,  ie: 1037, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 222, density: 0.00973, melt: 202, boil: 211.3, discovery: 1900, discoverer: "Friedrich Ernst Dorn" },
  "Fr":  { z: 87, g: 1,  p: 7,  sym: "Fr", name: { es: "Francio", en: "Francium", fr: "Francium", de: "Francium" }, en: 0.70, rad: 300,  ie: 380,  fam: { es: "Metal Alcalino", en: "Alkali Metal", fr: "Métal Alcalin", de: "Alkalimetall" }, mass: 223, density: 1.87, melt: 300, boil: 950, discovery: 1939, discoverer: "Marguerite Perey" },
  "Ra":  { z: 88, g: 2,  p: 7,  sym: "Ra", name: { es: "Radio", en: "Radium", fr: "Radium", de: "Radium" }, en: 0.90, rad: 283,  ie: 509,  fam: { es: "Alcalinotérreo", en: "Alkaline Earth Metal", fr: "Métal Alcalino-terreux", de: "Erdalkalimetall" }, mass: 226, density: 5.5, melt: 973, boil: 2010, discovery: 1898, discoverer: "Marie Curie" },
  "Ac":  { z: 89, g: 3,  p: 7,  sym: "Ac", name: { es: "Actinio", en: "Actinium", fr: "Actinium", de: "Actinium" }, en: 1.10, rad: 247,  ie: 499,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 227, density: 10.07, melt: 1323, boil: 3471, discovery: 1899, discoverer: "André-Louis Debierne" },
  "Th":  { z: 90, g: 3,  p: 7,  sym: "Th", name: { es: "Torio", en: "Thorium", fr: "Thorium", de: "Thorium" }, en: 1.30, rad: 237,  ie: 587,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 232.04, density: 11.72, melt: 2115, boil: 5061, discovery: 1828, discoverer: "Jöns Jacob Berzelius" },
  "Pa":  { z: 91, g: 3,  p: 7,  sym: "Pa", name: { es: "Protactinio", en: "Protactinium", fr: "Protactinium", de: "Protactinium" }, en: 1.50, rad: 243,  ie: 568,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 231.04, density: 15.37, melt: 1841, boil: 4300, discovery: 1913, discoverer: "Kasimir Fajans" },
  "U":   { z: 92, g: 3,  p: 7,  sym: "U",  name: { es: "Uranio", en: "Uranium", fr: "Uranium", de: "Uran" }, en: 1.38, rad: 240,  ie: 597,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 238.03, density: 19.1, melt: 1405.3, boil: 4404, discovery: 1789, discoverer: "Martin Heinrich Klaproth" },
  "Np":  { z: 93, g: 3,  p: 7,  sym: "Np", name: { es: "Neptunio", en: "Neptunium", fr: "Neptunium", de: "Neptunium" }, en: 1.36, rad: 221,  ie: 604,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 237, density: 20.45, melt: 917, boil: 4273, discovery: 1940, discoverer: "Edwin McMillan" },
  "Pu":  { z: 94, g: 3,  p: 7,  sym: "Pu", name: { es: "Plutonio", en: "Plutonium", fr: "Plutonium", de: "Plutonium" }, en: 1.28, rad: 243,  ie: 584,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 244, density: 19.816, melt: 912.5, boil: 3501, discovery: 1940, discoverer: "Glenn T. Seaborg" },
  "Am":  { z: 95, g: 3,  p: 7,  sym: "Am", name: { es: "Americio", en: "Americium", fr: "Américium", de: "Americium" }, en: 1.30, rad: 244,  ie: 578,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 243, density: 13.69, melt: 1449, boil: 2880, discovery: 1944, discoverer: "Glenn T. Seaborg" },
  "Cm":  { z: 96, g: 3,  p: 7,  sym: "Cm", name: { es: "Curio", en: "Curium", fr: "Curium", de: "Curium" }, en: 1.30, rad: 245,  ie: 581,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 247, density: 13.51, melt: 1613, boil: 3383, discovery: 1944, discoverer: "Glenn T. Seaborg" },
  "Bk":  { z: 97, g: 3,  p: 7,  sym: "Bk", name: { es: "Berkelio", en: "Berkelium", fr: "Berkélium", de: "Berkelium" }, en: 1.30, rad: 244,  ie: 601,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 247, density: 14.79, melt: 1323, boil: 2900, discovery: 1949, discoverer: "Glenn T. Seaborg" },
  "Cf":  { z: 98, g: 3,  p: 7,  sym: "Cf", name: { es: "Californio", en: "Californium", fr: "Californium", de: "Californium" }, en: 1.30, rad: 245,  ie: 608,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 251, density: 15.1, melt: 1173, boil: 1743, discovery: 1950, discoverer: "Glenn T. Seaborg" },
  "Es":  { z: 99, g: 3,  p: 7,  sym: "Es", name: { es: "Einstenio", en: "Einsteinium", fr: "Einsteinium", de: "Einsteinium" }, en: 1.30, rad: 245,  ie: 619,  fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 252, density: 8.84, melt: 1133, boil: 1269, discovery: 1952, discoverer: "Albert Ghiorso" },
  "Fm":  { z: 100, g: 3, p: 7, sym: "Fm", name: { es: "Fermio", en: "Fermium", fr: "Fermium", de: "Fermium" }, en: 1.30, rad: 245, ie: 627, fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 257, density: 9.7, melt: 1800, boil: 1125, discovery: 1952, discoverer: "Albert Ghiorso" },
  "Md":  { z: 101, g: 3, p: 7, sym: "Md", name: { es: "Mendelevio", en: "Mendelevium", fr: "Mendélévium", de: "Mendelevium" }, en: 1.30, rad: 246, ie: 635, fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 258, density: 10.3, melt: 1100, boil: 1400, discovery: 1955, discoverer: "Albert Ghiorso" },
  "No":  { z: 102, g: 3, p: 7, sym: "No", name: { es: "Nobelio", en: "Nobelium", fr: "Nobélium", de: "Nobelium" }, en: 1.30, rad: 246, ie: 642, fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 259, density: 9.9, melt: 1100, boil: 1270, discovery: 1957, discoverer: "Albert Ghiorso" },
  "Lr":  { z: 103, g: 3, p: 7, sym: "Lr", name: { es: "Laurencio", en: "Lawrencium", fr: "Lawrencium", de: "Lawrencium" }, en: 1.30, rad: 246, ie: 470, fam: { es: "Actínido", en: "Actinide", fr: "Actinide", de: "Actinoid" }, mass: 266, density: 15.6, melt: 1900, boil: 2627, discovery: 1961, discoverer: "Albert Ghiorso" },
  "Rf":  { z: 104, g: 4, p: 7, sym: "Rf", name: { es: "Rutherfordio", en: "Rutherfordium", fr: "Rutherfordium", de: "Rutherfordium" }, en: 1.30, rad: 200, ie: 580, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 267, density: 23.2, melt: 2400, boil: 5800, discovery: 1964, discoverer: "Albert Ghiorso" },
  "Db":  { z: 105, g: 5, p: 7, sym: "Db", name: { es: "Dubnio", en: "Dubnium", fr: "Dubnium", de: "Dubnium" }, en: 1.30, rad: 195, ie: 660, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 270, density: 29.3, melt: 2100, boil: 4200, discovery: 1967, discoverer: "Albert Ghiorso" },
  "Sg":  { z: 106, g: 6, p: 7, sym: "Sg", name: { es: "Seaborgio", en: "Seaborgium", fr: "Seaborgium", de: "Seaborgium" }, en: 1.30, rad: 190, ie: 720, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 271, density: 35.0, melt: 2100, boil: 4500, discovery: 1974, discoverer: "Albert Ghiorso" },
  "Bh":  { z: 107, g: 7, p: 7, sym: "Bh", name: { es: "Bohrio", en: "Bohrium", fr: "Bohrium", de: "Bohrium" }, en: 1.30, rad: 185, ie: 740, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 270, density: 37.1, melt: 2100, boil: 4800, discovery: 1976, discoverer: "Albert Ghiorso" },
  "Hs":  { z: 108, g: 8, p: 7, sym: "Hs", name: { es: "Hassio", en: "Hassium", fr: "Hassium", de: "Hassium" }, en: 1.30, rad: 180, ie: 750, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 277, density: 40.7, melt: 2100, boil: 5000, discovery: 1984, discoverer: "Peter Armbruster" },
  "Mt":  { z: 109, g: 9, p: 7, sym: "Mt", name: { es: "Meitnerio", en: "Meitnerium", fr: "Meitnerium", de: "Meitnerium" }, en: 1.30, rad: 175, ie: 760, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 276, density: 37.4, melt: 2100, boil: 4500, discovery: 1982, discoverer: "Peter Armbruster" },
  "Ds":  { z: 110, g: 10, p: 7, sym: "Ds", name: { es: "Darmstatio", en: "Darmstadtium", fr: "Darmstadtium", de: "Darmstadtium" }, en: 1.30, rad: 170, ie: 770, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 281, density: 34.8, melt: 2100, boil: 4500, discovery: 1994, discoverer: "Sigurd Hofmann" },
  "Rg":  { z: 111, g: 11, p: 7, sym: "Rg", name: { es: "Roentgenio", en: "Roentgenium", fr: "Roentgenium", de: "Roentgenium" }, en: 1.30, rad: 165, ie: 780, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 280, density: 28.7, melt: 2100, boil: 4300, discovery: 1994, discoverer: "Sigurd Hofmann" },
  "Cn":  { z: 112, g: 12, p: 7, sym: "Cn", name: { es: "Copernicio", en: "Copernicium", fr: "Copernicium", de: "Copernicium" }, en: 1.30, rad: 160, ie: 840, fam: { es: "Metal de Transición", en: "Transition Metal", fr: "Métal de Transition", de: "Übergangsmetall" }, mass: 285, density: 23.7, melt: 283, boil: 357, discovery: 1996, discoverer: "Sigurd Hofmann" },
  "Nh":  { z: 113, g: 13, p: 7, sym: "Nh", name: { es: "Nihonio", en: "Nihonium", fr: "Nihonium", de: "Nihonium" }, en: 1.30, rad: 170, ie: 700, fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 284, density: 16, melt: 700, boil: 1400, discovery: 2004, discoverer: "Kosuke Morita" },
  "Fl":  { z: 114, g: 14, p: 7, sym: "Fl", name: { es: "Flerovio", en: "Flerovium", fr: "Flerovium", de: "Flerovium" }, en: 1.30, rad: 160, ie: 850, fam: { es: "Metal del Bloque p", en: "Post-transition Metal", fr: "Métal Pauvre", de: "Erdmetall" }, mass: 289, density: 14, melt: 340, boil: 2100, discovery: 1998, discoverer: "Yuri Oganessian" },
  "Mc":  { z: 115, g: 15, p: 7, sym: "Mc", name: { es: "Moscovio", en: "Moscovium", fr: "Moscovium", de: "Moscovium" }, en: 1.30, rad: 150, ie: 530, fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 288, density: 13.5, melt: 700, boil: 1400, discovery: 2003, discoverer: "Yuri Oganessian" },
  "Lv":  { z: 116, g: 16, p: 7, sym: "Lv", name: { es: "Livermorio", en: "Livermorium", fr: "Livermorium", de: "Livermorium" }, en: 1.30, rad: 140, ie: 670, fam: { es: "Metaloide", en: "Metalloid", fr: "Métalloïde", de: "Halbmetall" }, mass: 293, density: 12.9, melt: 709, boil: 1085, discovery: 2000, discoverer: "Yuri Oganessian" },
  "Ts":  { z: 117, g: 17, p: 7, sym: "Ts", name: { es: "Tenesino", en: "Tennessine", fr: "Tennessine", de: "Tenness" }, en: 1.30, rad: 130, ie: 750, fam: { es: "Halógeno", en: "Halogen", fr: "Halogène", de: "Halogen" }, mass: 294, density: 7.2, melt: 723, boil: 883, discovery: 2010, discoverer: "Yuri Oganessian" },
  "Og":  { z: 118, g: 18, p: 7, sym: "Og", name: { es: "Oganesón", en: "Oganesson", fr: "Oganesson", de: "Oganesson" }, en: 1.30, rad: 120, ie: 850, fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" }, mass: 294, density: 5, melt: 325, boil: 350, discovery: 2002, discoverer: "Yuri Oganessian" }
};

class MendeleevEngine {
  constructor() {
    this.clickCount = 0;
    this.maxClicksBeforeAI = 6;
  }

  validateCoord(targetG, targetP, userG, userP) {
    if (userG === targetG && userP === targetP) return { valid: true, err: "NONE" };
    if (userG !== targetG && userP === targetP) return { valid: false, err: "WRONG_GROUP" };
    if (userG === targetG && userP !== targetP) return { valid: false, err: "WRONG_PERIOD" };
    return { valid: false, err: "WRONG_BOTH" };
  }

  validateFamily(targetFam, userSym, lang) {
    const target = ELEMENTS_DB[userSym];
    if (!target) return { valid: false, err: "UNKNOWN_ELEMENT" };
    if (target.fam[lang] === targetFam) return { valid: true, err: "NONE" };
    return { valid: false, err: "WRONG_FAMILY" };
  }

  validateTrend(baseSym, userSym, trend, expected, lang) {
    const base = ELEMENTS_DB[baseSym];
    const target = ELEMENTS_DB[userSym];
    if (!target) return { valid: false, err: "UNKNOWN_ELEMENT" };

    let baseVal = base[trend];
    let targetVal = target[trend];

    // Evitar que elijan gases nobles para electronegatividad
    if (trend === 'en' && targetVal === 0) return { valid: false, err: "NOBLE_GAS_EN" };

    if (expected === "HIGHER") {
      if (targetVal > baseVal) return { valid: true };
      return { valid: false, err: `TREND_LOWER_${trend.toUpperCase()}` };
    } else {
      if (targetVal < baseVal) return { valid: true };
      return { valid: false, err: `TREND_HIGHER_${trend.toUpperCase()}` };
    }
  }

  getMinMaxOfTrend(trend) {
    let min = Infinity;
    let max = -Infinity;
    Object.values(ELEMENTS_DB).forEach(el => {
      if (trend === 'en' && el.en === 0) return; // Ignorar gases nobles en EN
      if (el[trend] < min) min = el[trend];
      if (el[trend] > max) max = el[trend];
    });
    return { min, max };
  }

  getSocraticAI(errorCode, dict, lang) {
    const aiData = dict.aiDB[errorCode] || dict.aiDB["generic"];
    return {
      q: aiData.q,
      o: aiData.o,
      a: aiData.a,
      m: aiData.m,
      lang: lang
    };
  }

  incrementClickCount() {
    this.clickCount++;
    if (this.clickCount >= this.maxClicksBeforeAI) {
      this.clickCount = 0;
      return true; // Activar IA
    }
    return false;
  }
}
const Engine = new MendeleevEngine();

/* ============================================================
   🔊 AUDIO PROCEDURAL (Cyberpunk + Sintetizador Cuántico)
============================================================ */
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.gain = null;
    this.activeOscillators = [];
    this.maxOscillators = 10;
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
        this.gain = this.ctx.createGain();
        this.gain.gain.value = 0.2;
        this.gain.connect(this.ctx.destination);

        // Analizador de frecuencia para visualizaciones
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.gain.connect(this.analyser);

        // Resumir contexto si está suspendido (mobile)
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(e => console.error("Audio resume failed:", e));
        }
      } catch (e) {
        console.error("AudioContext failed:", e);
      }
    }
  }

  _play(type, f1, f2, dur, vol, detune = 0) {
    if (!this.ctx || this.activeOscillators.length >= this.maxOscillators) return;

    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.connect(g);
      g.connect(this.gain);

      osc.type = type;
      osc.frequency.setValueAtTime(f1, this.ctx.currentTime);
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(f2, this.ctx.currentTime + dur);

      g.gain.setValueAtTime(vol, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);

      osc.start();
      osc.stop(this.ctx.currentTime + dur);

      this.activeOscillators.push(osc);
      osc.onended = () => {
        this.activeOscillators = this.activeOscillators.filter(o => o !== osc);
      };
    } catch (e) {
      console.error("Audio playback failed:", e);
    }
  }

  // Efectos de sonido mejorados
  ping() {
    this._play('sine', 1200, 1800, 0.1, 0.2);
    this._play('square', 2400, 3000, 0.08, 0.1, -20);
  }

  error() {
    this._play('sawtooth', 150, 80, 0.4, 0.4);
    this._play('triangle', 80, 40, 0.3, 0.2, 10);
  }

  success() {
    this._play('square', 440, 880, 0.3, 0.3);
    this._play('sine', 880, 1320, 0.4, 0.2, -5);
  }

  scan() {
    this._play('triangle', 2000, 100, 0.5, 0.1);
    this._play('sine', 1500, 200, 0.4, 0.05, 30);
  }

  theoryStart() {
    this._play('sine', 200, 600, 1.0, 0.3);
    this._play('square', 300, 900, 0.8, 0.15, -15);
  }

  heatmap() {
    this._play('sine', 400, 400, 1.2, 0.15);
    this._play('sawtooth', 300, 600, 1.0, 0.1, 20);
  }

  // Nueva función para obtener datos de frecuencia (para visualizaciones)
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }
}
const sfx = new CyberAudio();

const triggerVoice = (text, lang, rate = 1.05) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  setTimeout(() => {
    try {
      const pureText = text.replace(/<[^>]*>?/gm, '');
      const u = new SpeechSynthesisUtterance(pureText);
      u.lang = lang;
      u.rate = rate;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error("TTS failed:", e);
    }
  }, 50);
};

/* ============================================================
   🌍 CURRÍCULO DE MISIONES + DICCIONARIO SOCRÁTICO MULTILINGÜE
============================================================ */
const LEVELS = [
  {
    type: "COORD", sym: "H", name: { es: "Hidrógeno", en: "Hydrogen", fr: "Hydrogène", de: "Wasserstoff" },
    t_g: 1, t_p: 1,
    theory: {
      es: "El Sistema de Coordenadas Periódicas es la base de la química. Las columnas verticales (Eje X) son los GRUPOS, que indican los electrones de valencia. Las filas horizontales (Eje Y) son los PERIODOS, que indican las capas de energía (niveles cuánticos principales).",
      en: "The Periodic Coordinate System is the foundation of chemistry. Vertical columns (X-axis) are GROUPS, indicating valence electrons. Horizontal rows (Y-axis) are PERIODS, indicating energy levels (principal quantum numbers).",
      fr: "Le système de coordonnées périodiques est la base de la chimie. Les colonnes verticales (axe X) sont les GROUPES, indiquant les électrons de valence. Les rangées horizontales (axe Y) sont les PÉRIODES, indiquant les niveaux d'énergie (nombres quantiques principaux).",
      de: "Das Periodische Koordinatensystem ist die Grundlage der Chemie. Die vertikalen Spalten (X-Achse) sind GRUPPEN, die die Valenzelektronen anzeigen. Die horizontalen Reihen (Y-Achse) sind PERIODEN, die die Energieniveaus (Hauptquantenzahlen) anzeigen."
    },
    briefing: {
      es: "Misión 1: Localiza el Hidrógeno (H). Está en el Grupo 1, Periodo 1. Haz clic en ese nodo para continuar.",
      en: "Mission 1: Locate Hydrogen (H). It is in Group 1, Period 1. Click on that node to continue.",
      fr: "Mission 1: Localisez l'Hydrogène (H). Il se trouve dans le Groupe 1, Période 1. Cliquez sur ce nœud pour continuer.",
      de: "Mission 1: Finden Sie Wasserstoff (H). Es befindet sich in Gruppe 1, Periode 1. Klicken Sie auf diesen Knoten, um fortzufahren."
    },
    hint: {
      es: "Pista: El Hidrógeno es el elemento más ligero y abundante en el universo. ¡Busca en la esquina superior izquierda!",
      en: "Hint: Hydrogen is the lightest and most abundant element in the universe. Look at the top-left corner!",
      fr: "Indice: L'hydrogène est l'élément le plus léger et le plus abondant de l'univers. Cherchez dans le coin supérieur gauche!",
      de: "Hinweis: Wasserstoff ist das leichteste und häufigste Element im Universum. Schauen Sie in die obere linke Ecke!"
    }
  },
  {
    type: "FAMILY", sym: "He", name: { es: "Helio", en: "Helium", fr: "Hélium", de: "Helium" },
    t_fam: { es: "Gas Noble", en: "Noble Gas", fr: "Gaz Noble", de: "Edelgas" },
    theory: {
      es: "Las Familias Químicas comparten propiedades debido a su configuración electrónica. Los Gases Nobles (Grupo 18) tienen sus capas de energía completamente llenas (regla del octeto), lo que los hace inertes y no reactivos.",
      en: "Chemical Families share properties due to their electronic configuration. Noble Gases (Group 18) have completely filled energy shells (octet rule), making them inert and non-reactive.",
      fr: "Les familles chimiques partagent des propriétés en raison de leur configuration électronique. Les gaz nobles (groupe 18) ont des couches d'énergie complètement remplies (règle de l'octet), ce qui les rend inertes et non réactifs.",
      de: "Chemische Familien teilen Eigenschaften aufgrund ihrer Elektronenkonfiguration. Edelgase (Gruppe 18) haben vollständig gefüllte Energieschalen (Oktettregel), was sie inert und nicht reaktiv macht."
    },
    briefing: {
      es: "Misión 2: Encuentra CUALQUIER elemento de la familia de los Gases Nobles (Grupo 18).",
      en: "Mission 2: Find ANY element from the Noble Gas family (Group 18).",
      fr: "Mission 2: Trouvez N'IMPORTE QUEL élément de la famille des Gaz Nobles (Groupe 18).",
      de: "Mission 2: Finden Sie IRGENDEIN Element aus der Familie der Edelgase (Gruppe 18)."
    },
    hint: {
      es: "Pista: Los Gases Nobles están en la COLUMNA MÁS A LA DERECHA (Grupo 18). Incluyen Helio, Neón, Argón, etc.",
      en: "Hint: Noble Gases are in the RIGHTMOST COLUMN (Group 18). They include Helium, Neon, Argon, etc.",
      fr: "Indice: Les gaz nobles sont dans la COLONNE LA PLUS À DROITE (Groupe 18). Ils incluent l'Hélium, le Néon, l'Argon, etc.",
      de: "Hinweis: Edelgase befinden sich in der RECHTESTEN SPALTE (Gruppe 18). Dazu gehören Helium, Neon, Argon usw."
    }
  },
  {
    type: "TREND", sym: "F", name: { es: "Flúor", en: "Fluorine", fr: "Fluor", de: "Fluor" },
    base: "O", trend: "en", expected: "HIGHER", rule: "Mismo periodo", t_p: 2,
    theory: {
      es: "TENDENCIA: ELECTRONEGATIVIDAD. Es la capacidad de un átomo para atraer electrones en un enlace químico. Aumenta de IZQUIERDA a DERECHA en un periodo y de ABAJO a ARRIBA en un grupo. Esto se debe a la Carga Nuclear Efectiva (Z_eff).",
      en: "TREND: ELECTRONEGATIVITY. It is the ability of an atom to attract electrons in a chemical bond. It increases from LEFT to RIGHT in a period and from BOTTOM to TOP in a group. This is due to the Effective Nuclear Charge (Z_eff).",
      fr: "TENDANCE: ÉLECTRONÉGATIVITÉ. C'est la capacité d'un atome à attirer des électrons dans une liaison chimique. Elle augmente de GAUCHE à DROITE dans une période et de BAS en HAUT dans un groupe. Cela est dû à la Charge Nucléaire Effective (Z_eff).",
      de: "TREND: ELEKTRONEGATIVITÄT. Sie ist die Fähigkeit eines Atoms, Elektronen in einer chemischen Bindung anzuziehen. Sie nimmt von LINKS nach RECHTS in einer Periode und von UNTEN nach OBEN in einer Gruppe zu. Dies liegt an der effektiven Kernladung (Z_eff)."
    },
    briefing: {
      es: "Misión 3: En el Periodo 2, selecciona un elemento con MAYOR Electronegatividad que el Oxígeno (O).",
      en: "Mission 3: In Period 2, select an element with HIGHER Electronegativity than Oxygen (O).",
      fr: "Mission 3: Dans la Période 2, sélectionnez un élément avec une ÉLECTRONÉGATIVITÉ PLUS ÉLEVÉE que l'Oxygène (O).",
      de: "Mission 3: Wählen Sie in Periode 2 ein Element mit HÖHERER Elektronegativität als Sauerstoff (O)."
    },
    hint: {
      es: "Pista: La Electronegatividad AUMENTA hacia la DERECHA en un periodo. El Flúor (F) es el elemento más electronegativo de todos.",
      en: "Hint: Electronegativity INCREASES to the RIGHT in a period. Fluorine (F) is the most electronegative element of all.",
      fr: "Indice: L'électronégativité AUGMENTE vers la DROITE dans une période. Le Fluor (F) est l'élément le plus électronégatif de tous.",
      de: "Hinweis: Die Elektronegativität NIMMT nach RECHTS in einer Periode zu. Fluor (F) ist das elektronegativste Element von allen."
    }
  },
  {
    type: "TREND", sym: "Cs", name: { es: "Cesio", en: "Cesium", fr: "Césium", de: "Cäsium" },
    base: "Na", trend: "rad", expected: "HIGHER", rule: "Mismo grupo", t_g: 1,
    theory: {
      es: "TENDENCIA: RADIO ATÓMICO. Es la distancia desde el núcleo hasta el electrón más externo. Aumenta de ARRIBA a ABAJO en un grupo porque se añaden capas de electrones (niveles cuánticos). Disminuye de IZQUIERDA a DERECHA en un periodo debido a la mayor Z_eff.",
      en: "TREND: ATOMIC RADIUS. It is the distance from the nucleus to the outermost electron. It increases from TOP to BOTTOM in a group because electron shells are added (quantum levels). It decreases from LEFT to RIGHT in a period due to higher Z_eff.",
      fr: "TENDANCE: RAYON ATOMIQUE. C'est la distance entre le noyau et l'électron le plus externe. Il augmente de HAUT en BAS dans un groupe car des couches d'électrons sont ajoutées (niveaux quantiques). Il diminue de GAUCHE à DROITE dans une période en raison d'une Z_eff plus élevée.",
      de: "TREND: ATOMARER RADIUS. Er ist der Abstand vom Kern zum äußersten Elektron. Er nimmt von OBEN nach UNTEN in einer Gruppe zu, weil Elektronenschalen hinzugefügt werden (Quantenniveaus). Er nimmt von LINKS nach RECHTS in einer Periode ab, aufgrund der höheren Z_eff."
    },
    briefing: {
      es: "Misión 4: En el Grupo 1 (Metales Alcalinos), encuentra un elemento con MAYOR Radio Atómico que el Sodio (Na).",
      en: "Mission 4: In Group 1 (Alkali Metals), find an element with a LARGER Atomic Radius than Sodium (Na).",
      fr: "Mission 4: Dans le Groupe 1 (Métaux Alcalins), trouvez un élément avec un RAYON ATOMIQUE PLUS GRAND que le Sodium (Na).",
      de: "Mission 4: Finden Sie in Gruppe 1 (Alkalimetalle) ein Element mit einem GRÖßEREN Atomradius als Natrium (Na)."
    },
    hint: {
      es: "Pista: El Radio Atómico AUMENTA hacia ABAJO en un grupo. El Cesio (Cs) es el metal alcalino más grande.",
      en: "Hint: Atomic Radius INCREASES downward in a group. Cesium (Cs) is the largest alkali metal.",
      fr: "Indice: Le rayon atomique AUGMENTE vers le BAS dans un groupe. Le Césium (Cs) est le plus grand métal alcalin.",
      de: "Hinweis: Der Atomradius NIMMT nach UNTEN in einer Gruppe zu. Cäsium (Cs) ist das größte Alkalimetall."
    }
  },
  {
    type: "TREND", sym: "He", name: { es: "Helio", en: "Helium", fr: "Hélium", de: "Helium" },
    base: "Ne", trend: "ie", expected: "HIGHER", rule: "Cualquiera",
    theory: {
      es: "TENDENCIA: ENERGÍA DE IONIZACIÓN. Es la energía necesaria para arrancar un electrón de un átomo en estado gaseoso. Aumenta de IZQUIERDA a DERECHA en un periodo y de ABAJO a ARRIBA en un grupo. Los Gases Nobles tienen las energías de ionización más altas.",
      en: "TREND: IONIZATION ENERGY. It is the energy required to remove an electron from an atom in the gaseous state. It increases from LEFT to RIGHT in a period and from BOTTOM to TOP in a group. Noble Gases have the highest ionization energies.",
      fr: "TENDANCE: ÉNERGIE D'IONISATION. C'est l'énergie nécessaire pour arracher un électron à un atome à l'état gazeux. Elle augmente de GAUCHE à DROITE dans une période et de BAS en HAUT dans un groupe. Les Gaz Nobles ont les énergies d'ionisation les plus élevées.",
      de: "TREND: IONISIERUNGSENERGIE. Sie ist die Energie, die benötigt wird, um ein Elektron von einem Atom im gasförmigen Zustand zu entfernen. Sie nimmt von LINKS nach RECHTS in einer Periode und von UNTEN nach OBEN in einer Gruppe zu. Edelgase haben die höchsten Ionisierungsenergien."
    },
    briefing: {
      es: "Misión 5: Encuentra un elemento con MAYOR Energía de Ionización que el Neón (Ne). Usa el Escáner Térmico para ayudarte.",
      en: "Mission 5: Find an element with HIGHER Ionization Energy than Neon (Ne). Use the Thermal Scanner to help you.",
      fr: "Mission 5: Trouvez un élément avec une ÉNERGIE D'IONISATION PLUS ÉLEVÉE que le Néon (Ne). Utilisez le Scanner Thermique pour vous aider.",
      de: "Mission 5: Finden Sie ein Element mit HÖHERER Ionisierungsenergie als Neon (Ne). Verwenden Sie den Thermischen Scanner, um Ihnen zu helfen."
    },
    hint: {
      es: "Pista: La Energía de Ionización AUMENTA hacia la DERECHA y ARRIBA. El Helio (He) tiene la energía de ionización más alta de todos los elementos.",
      en: "Hint: Ionization Energy INCREASES to the RIGHT and UP. Helium (He) has the highest ionization energy of all elements.",
      fr: "Indice: L'énergie d'ionisation AUGMENTE vers la DROITE et en HAUT. L'Hélium (He) a l'énergie d'ionisation la plus élevée de tous les éléments.",
      de: "Hinweis: Die Ionisierungsenergie NIMMT nach RECHTS und OBEN zu. Helium (He) hat die höchste Ionisierungsenergie aller Elemente."
    }
  },
  {
    type: "CHALLENGE", sym: "Og", name: { es: "Oganesón", en: "Oganesson", fr: "Oganesson", de: "Oganesson" },
    theory: {
      es: "🔥 DESAFÍO MAESTRO: Combina todo lo aprendido. Encuentra el Oganesón (Og), el elemento sintético más pesado conocido. Debes usar coordenadas, familias y tendencias para localizarlo. ¡Solo los mejores químicos cuánticos lo lograrán!",
      en: "🔥 MASTER CHALLENGE: Combine everything you've learned. Find Oganesson (Og), the heaviest known synthetic element. You must use coordinates, families, and trends to locate it. Only the best quantum chemists will succeed!",
      fr: "🔥 DÉFI MAÎTRE: Combinez tout ce que vous avez appris. Trouvez l'Oganesson (Og), l'élément synthétique le plus lourd connu. Vous devez utiliser les coordonnées, les familles et les tendances pour le localiser. Seuls les meilleurs chimistes quantiques y parviendront!",
      de: "🔥 MEISTER-HERAUSFORDERUNG: Kombinieren Sie alles, was Sie gelernt haben. Finden Sie Oganesson (Og), das schwerste bekannte synthetische Element. Sie müssen Koordinaten, Familien und Trends verwenden, um es zu lokalisieren. Nur die besten Quantenchemiker werden es schaffen!"
    },
    briefing: {
      es: "Misión Final: Localiza el Oganesón (Og). Pista: Grupo 18, Periodo 7. ¡Usa el Escáner Térmico para confirmar sus propiedades únicas!",
      en: "Final Mission: Locate Oganesson (Og). Hint: Group 18, Period 7. Use the Thermal Scanner to confirm its unique properties!",
      fr: "Mission Finale: Localisez l'Oganesson (Og). Indice: Groupe 18, Période 7. Utilisez le Scanner Thermique pour confirmer ses propriétés uniques!",
      de: "Finale Mission: Lokalisieren Sie Oganesson (Og). Hinweis: Gruppe 18, Periode 7. Verwenden Sie den Thermischen Scanner, um seine einzigartigen Eigenschaften zu bestätigen!"
    },
    hint: {
      es: "Pista: El Oganesón es un Gas Noble SUPERPESADO. Está en el Grupo 18 (como el Helio) pero en el Periodo 7. ¡Es el elemento más pesado de la tabla!",
      en: "Hint: Oganesson is a SUPERHEAVY Noble Gas. It's in Group 18 (like Helium) but in Period 7. It's the heaviest element in the table!",
      fr: "Indice: L'Oganesson est un Gaz Noble SUPERLOURD. Il est dans le Groupe 18 (comme l'Hélium) mais dans la Période 7. C'est l'élément le plus lourd du tableau!",
      de: "Hinweis: Oganesson ist ein SUPERWERES Edelgas. Es befindet sich in Gruppe 18 (wie Helium), aber in Periode 7. Es ist das schwerste Element im Periodensystem!"
    }
  }
];

const DICT = {
  es: {
    ui: {
      start: "INICIAR ACADEMIA",
      title: "MENDELEEV'S GRID",
      subtitle: "EL LABORATORIO CUÁNTICO DEL FUTURO",
      mission: "OBJETIVO TÁCTICO:",
      coord: "BÚSQUEDA POR COORDENADAS",
      trend: "ANÁLISIS DE TENDENCIAS",
      family: "CLASIFICACIÓN POR FAMILIAS",
      analyze: "ANALIZAR ELEMENTO",
      success: "🎉 ¡MISIÓN COMPLETADA! NODO ASEGURADO.",
      aiTitle: "🤖 PROFESOR IA CUÁNTICO",
      btnCont: "CONTINUAR",
      hintBtn: "💡 PISTA",
      aiBtn: "🧠 ASISTENTE IA",
      helpBtn: "❓ TEORÍA",
      scanBtn: "🌡️ ESCÁNER TÉRMICO",
      labBtn: "🔬 LABORATORIO",
      group: "Grupo (X)",
      period: "Periodo (Y)",
      heatmapON: "🔥 VISIÓN TERMODINÁMICA ACTIVADA",
      heatmapOFF: "VISIÓN TERMODINÁMICA DESACTIVADA",
      helpText: "LA MATRIZ PERIÓDICA:\n- Eje X (Columnas) = Grupos (Electrones de valencia)\n- Eje Y (Filas) = Periodos (Capas de energía)\n\n🔹 Grupos: Columnas verticales con propiedades similares.\n🔹 Periodos: Filas horizontales que indican niveles de energía.\n\n💡 Consejos:\n1. Usa el Escáner Térmico para visualizar tendencias.\n2. La IA te guiará si cometes errores.\n3. Completa todas las misiones para desbloquear el Desafío Maestro.",
      elementDetails: "DETALLES DEL ELEMENTO",
      atomicNumber: "Número Atómico",
      atomicMass: "Masa Atómica",
      density: "Densidad",
      meltingPoint: "Punto de Fusión",
      boilingPoint: "Punto de Ebullición",
      discovery: "Descubrimiento",
      discoverer: "Descubridor",
      back: "VOLVER",
      exit: "SALIR",
      nextMission: "SIGUIENTE MISIÓN ➔",
      masterChallenge: "🏆 DESAFÍO MAESTRO",
      selectLanguage: "🌍 SELECCIONA IDIOMA",
      loading: "CARGANDO MATRIZ CUÁNTICA...",
      labTitle: "🧪 LABORATORIO DE SIMULACIÓN",
      labIntro: "Aquí puedes experimentar con las propiedades de los elementos. Selecciona dos elementos para comparar sus tendencias periódicas.",
      compareBtn: "COMPARAR ELEMENTOS",
      propertySelect: "Selecciona una propiedad para comparar:",
      compareResult: "RESULTADO DE LA COMPARACIÓN",
      element1: "Elemento 1",
      element2: "Elemento 2",
      property: "Propiedad",
      value1: "Valor (Elemento 1)",
      value2: "Valor (Elemento 2)",
      difference: "Diferencia",
      trendExplanation: "EXPLICACIÓN DE LA TENDENCIA",
      closeLab: "CERRAR LABORATORIO"
    },
    aiDB: {
      "WRONG_GROUP": {
        q: "¿Qué representan las COLUMNAS (Grupos) en la Tabla Periódica?",
        o: [
          "El número de capas de electrones",
          "El número de electrones de valencia (electrones en la capa más externa)",
          "La masa atómica del elemento",
          "El punto de ebullición del elemento"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: Los GRUPOS (columnas verticales) indican el número de electrones de valencia. Todos los elementos en un grupo comparten propiedades químicas similares. ¡Revisa la coordenada X!"
      },
      "WRONG_PERIOD": {
        q: "¿Qué indican las FILAS (Periodos) en la Tabla Periódica?",
        o: [
          "El número de protones en el núcleo",
          "El número de capas de electrones (niveles de energía)",
          "La electronegatividad del elemento",
          "La reactividad del elemento"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: Los PERIODOS (filas horizontales) representan el número de capas de electrones. Cada periodo corresponde a un nivel de energía principal (n). ¡Corrige la coordenada Y!"
      },
      "WRONG_FAMILY": {
        q: "¿Cómo se organizan las familias químicas en la Tabla Periódica?",
        o: [
          "Por filas horizontales (Periodos)",
          "Por columnas verticales (Grupos)",
          "Por diagonal de izquierda a derecha",
          "Aleatoriamente"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: Las FAMILIAS QUÍMICAS (como Metales Alcalinos, Halógenos, Gases Nobles) se organizan en COLUMNAS VERTICALES (Grupos). Todos los elementos de un grupo comparten propiedades similares. ¡Busca en la columna correcta!"
      },
      "TREND_LOWER_EN": {
        q: "La Electronegatividad es la capacidad de un átomo para atraer electrones. ¿Hacia dónde AUMENTA en la Tabla Periódica?",
        o: [
          "De derecha a izquierda y de arriba abajo",
          "De izquierda a derecha y de abajo arriba",
          "Solo en los metales de transición",
          "No sigue un patrón definido"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: La ELECTRONEGATIVIDAD aumenta de IZQUIERDA a DERECHA en un periodo y de ABAJO a ARRIBA en un grupo. Esto se debe a que la Carga Nuclear Efectiva (Z_eff) es mayor. ¡Elige un elemento con mayor Z_eff!"
      },
      "TREND_HIGHER_RAD": {
        q: "¿Por qué el Radio Atómico AUMENTA hacia ABAJO en un grupo?",
        o: [
          "Porque los átomos ganan más protones y se hacen más grandes",
          "Porque se añaden más capas de electrones (niveles de energía)",
          "Porque la temperatura aumenta",
          "Porque la presión atmosférica disminuye"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: El RADIO ATÓMICO aumenta hacia ABAJO en un grupo porque cada nuevo periodo añade una CAPA DE ELECTRONES adicional. Esto incrementa la distancia entre el núcleo y los electrones más externos. ¡Busca un elemento en un periodo superior!"
      },
      "TREND_LOWER_IE": {
        q: "La Energía de Ionización es la energía necesaria para arrancar un electrón. ¿Dónde es MAYOR?",
        o: [
          "En los elementos con radio atómico grande (abajo a la izquierda)",
          "En los elementos con radio atómico pequeño (arriba a la derecha)",
          "En los metales alcalinos",
          "En los lantánidos"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: La ENERGÍA DE IONIZACIÓN es mayor en elementos con RADIO ATÓMICO PEQUEÑO (arriba a la derecha). Esto se debe a que los electrones están más cerca del núcleo y son atraídos con mayor fuerza (alta Z_eff). ¡Elige un elemento más pequeño y a la derecha!"
      },
      "NOBLE_GAS_EN": {
        q: "¿Por qué los Gases Nobles (Grupo 18) tienen Electronegatividad CERO en la Tabla Periódica?",
        o: [
          "Porque no tienen electrones",
          "Porque ya tienen su capa de valencia completa (regla del octeto) y no necesitan atraer más electrones",
          "Porque son elementos sintéticos",
          "Porque su radio atómico es infinito"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: Los GASES NOBLES (Grupo 18) tienen Electronegatividad CERO porque ya cumplen la REGLA DEL OCTETO: su capa de valencia está completa. ¡No pueden formar enlaces covalentes normales!"
      },
      "UNKNOWN_ELEMENT": {
        q: "¿Qué debes hacer si el elemento seleccionado no existe en la base de datos?",
        o: [
          "Reiniciar el juego",
          "Seleccionar un elemento válido de la Tabla Periódica",
          "Ignorar el error y continuar",
          "Reportar el error al profesor"
        ],
        a: 1,
        m: "⚠️ ERROR CRÍTICO: El elemento seleccionado no existe en la base de datos. Asegúrate de hacer clic en un NODO VÁLIDO de la Tabla Periódica 3D. ¡Todos los elementos están etiquetados con su símbolo!"
      },
      "generic": {
        q: "¿Qué estrategia debes seguir para resolver misiones en Mendeleev's Grid?",
        o: [
          "Adivinar al azar hasta acertar",
          "Usar el Escáner Térmico, analizar las propiedades y aplicar las reglas de las tendencias periódicas",
          "Ignorar las pistas de la IA",
          "Memorizar toda la Tabla Periódica"
        ],
        a: 1,
        m: "💡 CONSEJO DEL PROFESOR IA: Para resolver misiones con éxito, sigue estos pasos:\n1. Lee cuidadosamente el briefing de la misión.\n2. Usa el Escáner Térmico para visualizar tendencias (Radio Atómico, Electronegatividad, etc.).\n3. Analiza las propiedades del elemento seleccionado.\n4. Aplica las reglas de las tendencias periódicas.\n5. Si fallas, la IA te dará una microclase interactiva. ¡Aprende del error!"
      },
      "CHALLENGE_HINT": {
        q: "¿Qué debes hacer para completar el Desafío Maestro?",
        o: [
          "Seleccionar el primer elemento que veas",
          "Usar coordenadas (Grupo/Periodo), familias y tendencias para localizar el Oganesón (Og)",
          "Ignorar las propiedades periódicas",
          "Pedir ayuda a un compañero"
        ],
        a: 1,
        m: "🔥 DESAFÍO MAESTRO: Para encontrar el Oganesón (Og), sigue estos pasos:\n1. Localiza el Grupo 18 (Gases Nobles) en la columna más a la derecha.\n2. Desplázate hacia ABAJO hasta el Periodo 7.\n3. Usa el Escáner Térmico para confirmar que es un Gas Noble con propiedades únicas (¡es el más pesado!).\n4. Haz clic en el nodo y analiza sus detalles. ¡Solo los mejores químicos cuánticos lo lograrán!"
      }
    }
  },
  en: {
    ui: {
      start: "START ACADEMY",
      title: "MENDELEEV'S GRID",
      subtitle: "THE QUANTUM LAB OF THE FUTURE",
      mission: "TACTICAL OBJECTIVE:",
      coord: "COORDINATE SEARCH",
      trend: "TREND ANALYSIS",
      family: "FAMILY CLASSIFICATION",
      analyze: "ANALYZE ELEMENT",
      success: "🎉 MISSION COMPLETE! NODE SECURED.",
      aiTitle: "🤖 QUANTUM AI PROFESSOR",
      btnCont: "CONTINUE",
      hintBtn: "💡 HINT",
      aiBtn: "🧠 AI ASSISTANT",
      helpBtn: "❓ THEORY",
      scanBtn: "🌡️ THERMAL SCANNER",
      labBtn: "🔬 SIMULATION LAB",
      group: "Group (X)",
      period: "Period (Y)",
      heatmapON: "🔥 THERMODYNAMIC VISION ACTIVATED",
      heatmapOFF: "THERMODYNAMIC VISION DEACTIVATED",
      helpText: "THE PERIODIC MATRIX:\n- X-axis (Columns) = Groups (Valence Electrons)\n- Y-axis (Rows) = Periods (Energy Levels)\n\n🔹 Groups: Vertical columns with similar properties.\n🔹 Periods: Horizontal rows indicating energy levels.\n\n💡 Tips:\n1. Use the Thermal Scanner to visualize trends.\n2. The AI will guide you if you make mistakes.\n3. Complete all missions to unlock the Master Challenge.",
      elementDetails: "ELEMENT DETAILS",
      atomicNumber: "Atomic Number",
      atomicMass: "Atomic Mass",
      density: "Density",
      meltingPoint: "Melting Point",
      boilingPoint: "Boiling Point",
      discovery: "Discovery",
      discoverer: "Discoverer",
      back: "BACK",
      exit: "EXIT",
      nextMission: "NEXT MISSION ➔",
      masterChallenge: "🏆 MASTER CHALLENGE",
      selectLanguage: "🌍 SELECT LANGUAGE",
      loading: "LOADING QUANTUM MATRIX...",
      labTitle: "🧪 SIMULATION LABORATORY",
      labIntro: "Here you can experiment with element properties. Select two elements to compare their periodic trends.",
      compareBtn: "COMPARE ELEMENTS",
      propertySelect: "Select a property to compare:",
      compareResult: "COMPARISON RESULT",
      element1: "Element 1",
      element2: "Element 2",
      property: "Property",
      value1: "Value (Element 1)",
      value2: "Value (Element 2)",
      difference: "Difference",
      trendExplanation: "TREND EXPLANATION",
      closeLab: "CLOSE LABORATORY"
    },
    aiDB: {
      "WRONG_GROUP": {
        q: "What do the COLUMNS (Groups) represent in the Periodic Table?",
        o: [
          "The number of electron shells",
          "The number of valence electrons (electrons in the outermost shell)",
          "The atomic mass of the element",
          "The boiling point of the element"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: GROUPS (vertical columns) indicate the number of valence electrons. All elements in a group share similar chemical properties. Check the X-coordinate!"
      },
      "WRONG_PERIOD": {
        q: "What do the ROWS (Periods) indicate in the Periodic Table?",
        o: [
          "The number of protons in the nucleus",
          "The number of electron shells (energy levels)",
          "The electronegativity of the element",
          "The reactivity of the element"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: PERIODS (horizontal rows) represent the number of electron shells. Each period corresponds to a principal energy level (n). Correct the Y-coordinate!"
      },
      "WRONG_FAMILY": {
        q: "How are chemical families organized in the Periodic Table?",
        o: [
          "By horizontal rows (Periods)",
          "By vertical columns (Groups)",
          "By diagonal from left to right",
          "Randomly"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: CHEMICAL FAMILIES (such as Alkali Metals, Halogens, Noble Gases) are organized in VERTICAL COLUMNS (Groups). All elements in a group share similar properties. Look in the correct column!"
      },
      "TREND_LOWER_EN": {
        q: "Electronegativity is the ability of an atom to attract electrons. Where does it INCREASE in the Periodic Table?",
        o: [
          "From right to left and top to bottom",
          "From left to right and bottom to top",
          "Only in transition metals",
          "It does not follow a defined pattern"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: ELECTRONEGATIVITY increases from LEFT to RIGHT in a period and from BOTTOM to TOP in a group. This is because the Effective Nuclear Charge (Z_eff) is higher. Choose an element with higher Z_eff!"
      },
      "TREND_HIGHER_RAD": {
        q: "Why does the Atomic Radius INCREASE downward in a group?",
        o: [
          "Because atoms gain more protons and become larger",
          "Because additional electron shells (energy levels) are added",
          "Because temperature increases",
          "Because atmospheric pressure decreases"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: The ATOMIC RADIUS increases downward in a group because each new period adds an additional ELECTRON SHELL. This increases the distance between the nucleus and the outermost electrons. Look for an element in a higher period!"
      },
      "TREND_LOWER_IE": {
        q: "Ionization Energy is the energy required to remove an electron. Where is it HIGHER?",
        o: [
          "In elements with large atomic radius (bottom left)",
          "In elements with small atomic radius (top right)",
          "In alkali metals",
          "In lanthanides"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: IONIZATION ENERGY is higher in elements with SMALL ATOMIC RADIUS (top right). This is because electrons are closer to the nucleus and are attracted with greater force (high Z_eff). Choose a smaller element to the right!"
      },
      "NOBLE_GAS_EN": {
        q: "Why do Noble Gases (Group 18) have ZERO Electronegativity in the Periodic Table?",
        o: [
          "Because they have no electrons",
          "Because they already have a complete valence shell (octet rule) and do not need to attract more electrons",
          "Because they are synthetic elements",
          "Because their atomic radius is infinite"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: NOBLE GASES (Group 18) have ZERO Electronegativity because they already satisfy the OCTET RULE: their valence shell is complete. They cannot form normal covalent bonds!"
      },
      "UNKNOWN_ELEMENT": {
        q: "What should you do if the selected element does not exist in the database?",
        o: [
          "Restart the game",
          "Select a valid element from the Periodic Table",
          "Ignore the error and continue",
          "Report the error to the teacher"
        ],
        a: 1,
        m: "⚠️ CRITICAL ERROR: The selected element does not exist in the database. Make sure to click on a VALID NODE in the 3D Periodic Table. All elements are labeled with their symbol!"
      },
      "generic": {
        q: "What strategy should you follow to solve missions in Mendeleev's Grid?",
        o: [
          "Guess randomly until you get it right",
          "Use the Thermal Scanner, analyze properties, and apply periodic trend rules",
          "Ignore the AI hints",
          "Memorize the entire Periodic Table"
        ],
        a: 1,
        m: "💡 AI PROFESSOR ADVICE: To successfully solve missions, follow these steps:\n1. Read the mission briefing carefully.\n2. Use the Thermal Scanner to visualize trends (Atomic Radius, Electronegativity, etc.).\n3. Analyze the properties of the selected element.\n4. Apply the rules of periodic trends.\n5. If you fail, the AI will give you an interactive micro-lesson. Learn from the mistake!"
      },
      "CHALLENGE_HINT": {
        q: "What should you do to complete the Master Challenge?",
        o: [
          "Select the first element you see",
          "Use coordinates (Group/Period), families, and trends to locate Oganesson (Og)",
          "Ignore periodic properties",
          "Ask a classmate for help"
        ],
        a: 1,
        m: "🔥 MASTER CHALLENGE: To find Oganesson (Og), follow these steps:\n1. Locate Group 18 (Noble Gases) in the rightmost column.\n2. Scroll DOWN to Period 7.\n3. Use the Thermal Scanner to confirm it is a Noble Gas with unique properties (it's the heaviest!).\n4. Click on the node and analyze its details. Only the best quantum chemists will succeed!"
      }
    }
  },
  fr: {
    ui: {
      start: "DÉMARRER L'ACADÉMIE",
      title: "MENDELEEV'S GRID",
      subtitle: "LE LABORATOIRE QUANTIQUE DU FUTUR",
      mission: "OBJECTIF TACTIQUE :",
      coord: "RECHERCHE PAR COORDONNÉES",
      trend: "ANALYSE DES TENDANCES",
      family: "CLASSIFICATION PAR FAMILLES",
      analyze: "ANALYSER L'ÉLÉMENT",
      success: "🎉 MISSION ACCOMPLIE ! NŒUD SÉCURISÉ.",
      aiTitle: "🤖 PROFESSEUR IA QUANTIQUE",
      btnCont: "CONTINUER",
      hintBtn: "💡 INDICE",
      aiBtn: "🧠 ASSISTANT IA",
      helpBtn: "❓ THÉORIE",
      scanBtn: "🌡️ SCANNER THERMIQUE",
      labBtn: "🔬 LABORATOIRE DE SIMULATION",
      group: "Groupe (X)",
      period: "Période (Y)",
      heatmapON: "🔥 VISION THERMODYNAMIQUE ACTIVÉE",
      heatmapOFF: "VISION THERMODYNAMIQUE DÉSACTIVÉE",
      helpText: "LA MATRICE PÉRIODIQUE :\n- Axe X (Colonnes) = Groupes (Électrons de valence)\n- Axe Y (Lignes) = Périodes (Niveaux d'énergie)\n\n🔹 Groupes : Colonnes verticales avec des propriétés similaires.\n🔹 Périodes : Lignes horizontales indiquant les niveaux d'énergie.\n\n💡 Conseils :\n1. Utilisez le Scanner Thermique pour visualiser les tendances.\n2. L'IA vous guidera si vous faites des erreurs.\n3. Complétez toutes les missions pour débloquer le Défi Maître.",
      elementDetails: "DÉTAILS DE L'ÉLÉMENT",
      atomicNumber: "Numéro Atomique",
      atomicMass: "Masse Atomique",
      density: "Densité",
      meltingPoint: "Point de Fusion",
      boilingPoint: "Point d'Ébullition",
      discovery: "Découverte",
      discoverer: "Découvreur",
      back: "RETOUR",
      exit: "QUITTER",
      nextMission: "MISSION SUIVANTE ➔",
      masterChallenge: "🏆 DÉFI MAÎTRE",
      selectLanguage: "🌍 SÉLECTIONNER LA LANGUE",
      loading: "CHARGEMENT DE LA MATRICE QUANTIQUE...",
      labTitle: "🧪 LABORATOIRE DE SIMULATION",
      labIntro: "Ici, vous pouvez expérimenter avec les propriétés des éléments. Sélectionnez deux éléments pour comparer leurs tendances périodiques.",
      compareBtn: "COMPARER LES ÉLÉMENTS",
      propertySelect: "Sélectionnez une propriété à comparer :",
      compareResult: "RÉSULTAT DE LA COMPARAISON",
      element1: "Élément 1",
      element2: "Élément 2",
      property: "Propriété",
      value1: "Valeur (Élément 1)",
      value2: "Valeur (Élément 2)",
      difference: "Différence",
      trendExplanation: "EXPLICATION DE LA TENDANCE",
      closeLab: "FERMER LE LABORATOIRE"
    },
    aiDB: {
      "WRONG_GROUP": {
        q: "Que représentent les COLONNES (Groupes) dans le Tableau Périodique ?",
        o: [
          "Le nombre de couches d'électrons",
          "Le nombre d'électrons de valence (électrons dans la couche la plus externe)",
          "La masse atomique de l'élément",
          "Le point d'ébullition de l'élément"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : Les GROUPES (colonnes verticales) indiquent le nombre d'électrons de valence. Tous les éléments d'un groupe partagent des propriétés chimiques similaires. Vérifiez la coordonnée X !"
      },
      "WRONG_PERIOD": {
        q: "Que indiquent les LIGNES (Périodes) dans le Tableau Périodique ?",
        o: [
          "Le nombre de protons dans le noyau",
          "Le nombre de couches d'électrons (niveaux d'énergie)",
          "L'électronégativité de l'élément",
          "La réactivité de l'élément"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : Les PÉRIODES (lignes horizontales) représentent le nombre de couches d'électrons. Chaque période correspond à un niveau d'énergie principal (n). Corrigez la coordonnée Y !"
      },
      "WRONG_FAMILY": {
        q: "Comment les familles chimiques sont-elles organisées dans le Tableau Périodique ?",
        o: [
          "Par lignes horizontales (Périodes)",
          "Par colonnes verticales (Groupes)",
          "Par diagonale de gauche à droite",
          "Aléatoirement"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : Les FAMILLES CHIMIQUES (comme les Métaux Alcalins, les Halogènes, les Gaz Nobles) sont organisées en COLONNES VERTICALES (Groupes). Tous les éléments d'un groupe partagent des propriétés similaires. Cherchez dans la bonne colonne !"
      },
      "TREND_LOWER_EN": {
        q: "L'électronégativité est la capacité d'un atome à attirer des électrons. Où AUGMENTE-t-elle dans le Tableau Périodique ?",
        o: [
          "De droite à gauche et de haut en bas",
          "De gauche à droite et de bas en haut",
          "Uniquement dans les métaux de transition",
          "Elle ne suit pas de modèle défini"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : L'ÉLECTRONÉGATIVITÉ augmente de GAUCHE à DROITE dans une période et de BAS en HAUT dans un groupe. Cela est dû à une Charge Nucléaire Effective (Z_eff) plus élevée. Choisissez un élément avec une Z_eff plus élevée !"
      },
      "TREND_HIGHER_RAD": {
        q: "Pourquoi le Rayon Atomique AUGMENTE-t-il vers le bas dans un groupe ?",
        o: [
          "Parce que les atomes gagnent plus de protons et deviennent plus grands",
          "Parce que des couches d'électrons supplémentaires (niveaux d'énergie) sont ajoutées",
          "Parce que la température augmente",
          "Parce que la pression atmosphérique diminue"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : Le RAYON ATOMIQUE augmente vers le BAS dans un groupe parce que chaque nouvelle période ajoute une COUCHE D'ÉLECTRONS supplémentaire. Cela augmente la distance entre le noyau et les électrons les plus externes. Cherchez un élément dans une période supérieure !"
      },
      "TREND_LOWER_IE": {
        q: "L'énergie d'ionisation est l'énergie nécessaire pour arracher un électron. Où est-elle PLUS ÉLEVÉE ?",
        o: [
          "Dans les éléments avec un grand rayon atomique (en bas à gauche)",
          "Dans les éléments avec un petit rayon atomique (en haut à droite)",
          "Dans les métaux alcalins",
          "Dans les lanthanides"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : L'ÉNERGIE D'IONISATION est plus élevée dans les éléments avec un PETIT RAYON ATOMIQUE (en haut à droite). Cela est dû au fait que les électrons sont plus proches du noyau et sont attirés avec une plus grande force (Z_eff élevée). Choisissez un élément plus petit à droite !"
      },
      "NOBLE_GAS_EN": {
        q: "Pourquoi les Gaz Nobles (Groupe 18) ont-ils une ÉLECTRONÉGATIVITÉ de ZÉRO dans le Tableau Périodique ?",
        o: [
          "Parce qu'ils n'ont pas d'électrons",
          "Parce qu'ils ont déjà une couche de valence complète (règle de l'octet) et n'ont pas besoin d'attirer plus d'électrons",
          "Parce que ce sont des éléments synthétiques",
          "Parce que leur rayon atomique est infini"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : Les GAZ NOBLES (Groupe 18) ont une ÉLECTRONÉGATIVITÉ de ZÉRO parce qu'ils satisfont déjà la RÈGLE DE L'OCTET : leur couche de valence est complète. Ils ne peuvent pas former de liaisons covalentes normales !"
      },
      "UNKNOWN_ELEMENT": {
        q: "Que devez-vous faire si l'élément sélectionné n'existe pas dans la base de données ?",
        o: [
          "Redémarrer le jeu",
          "Sélectionner un élément valide du Tableau Périodique",
          "Ignorer l'erreur et continuer",
          "Signaler l'erreur au professeur"
        ],
        a: 1,
        m: "⚠️ ERREUR CRITIQUE : L'élément sélectionné n'existe pas dans la base de données. Assurez-vous de cliquer sur un NŒUD VALIDE dans le Tableau Périodique 3D. Tous les éléments sont étiquetés avec leur symbole !"
      },
      "generic": {
        q: "Quelle stratégie devez-vous suivre pour résoudre les missions dans Mendeleev's Grid ?",
        o: [
          "Deviner au hasard jusqu'à ce que ce soit correct",
          "Utiliser le Scanner Thermique, analyser les propriétés et appliquer les règles des tendances périodiques",
          "Ignorer les indices de l'IA",
          "Mémoriser tout le Tableau Périodique"
        ],
        a: 1,
        m: "💡 CONSEIL DU PROFESSEUR IA : Pour résoudre les missions avec succès, suivez ces étapes :\n1. Lisez attentivement le briefing de la mission.\n2. Utilisez le Scanner Thermique pour visualiser les tendances (Rayon Atomique, Électronégativité, etc.).\n3. Analysez les propriétés de l'élément sélectionné.\n4. Appliquez les règles des tendances périodiques.\n5. Si vous échouez, l'IA vous donnera une micro-leçon interactive. Apprenez de l'erreur !"
      },
      "CHALLENGE_HINT": {
        q: "Que devez-vous faire pour compléter le Défi Maître ?",
        o: [
          "Sélectionner le premier élément que vous voyez",
          "Utiliser les coordonnées (Groupe/Période), les familles et les tendances pour localiser l'Oganesson (Og)",
          "Ignorer les propriétés périodiques",
          "Demander de l'aide à un camarade"
        ],
        a: 1,
        m: "🔥 DÉFI MAÎTRE : Pour trouver l'Oganesson (Og), suivez ces étapes :\n1. Localisez le Groupe 18 (Gaz Nobles) dans la colonne la plus à droite.\n2. Faites défiler vers le BAS jusqu'à la Période 7.\n3. Utilisez le Scanner Thermique pour confirmer qu'il s'agit d'un Gaz Noble avec des propriétés uniques (c'est le plus lourd !).\n4. Cliquez sur le nœud et analysez ses détails. Seuls les meilleurs chimistes quantiques réussiront !"
      }
    }
  },
  de: {
    ui: {
      start: "AKADEMIE STARTEN",
      title: "MENDELEEV'S GRID",
      subtitle: "DAS QUANTENLABOR DER ZUKUNFT",
      mission: "TAKTISCHES ZIEL:",
      coord: "KOORDINATENSUCHE",
      trend: "TRENDANALYSE",
      family: "FAMILIENKLASSIFIZIERUNG",
      analyze: "ELEMENT ANALYSIEREN",
      success: "🎉 MISSION ERFOLGREICH! KNOTEN GESICHERT.",
      aiTitle: "🤖 QUANTEN-KI-PROFESSOR",
      btnCont: "WEITER",
      hintBtn: "💡 HINWEIS",
      aiBtn: "🧠 KI-ASSISTENT",
      helpBtn: "❓ THEORIE",
      scanBtn: "🌡️ THERMISCHER SCANNER",
      labBtn: "🔬 SIMULATIONSLABOR",
      group: "Gruppe (X)",
      period: "Periode (Y)",
      heatmapON: "🔥 THERMODYNAMISCHE SICHT AKTIVIERT",
      heatmapOFF: "THERMODYNAMISCHE SICHT DEAKTIVIERT",
      helpText: "DAS PERIODISCHE MATRIX:\n- X-Achse (Spalten) = Gruppen (Valenzelektronen)\n- Y-Achse (Reihen) = Perioden (Energieniveaus)\n\n🔹 Gruppen: Vertikale Spalten mit ähnlichen Eigenschaften.\n🔹 Perioden: Horizontale Reihen, die Energieniveaus anzeigen.\n\n💡 Tipps:\n1. Verwenden Sie den Thermischen Scanner, um Trends zu visualisieren.\n2. Die KI wird Sie führen, wenn Sie Fehler machen.\n3. Vollenden Sie alle Missionen, um die Meister-Herausforderung freizuschalten.",
      elementDetails: "ELEMENTDETAILS",
      atomicNumber: "Ordnungzahl",
      atomicMass: "Atommasse",
      density: "Dichte",
      meltingPoint: "Schmelzpunkt",
      boilingPoint: "Siedepunkt",
      discovery: "Entdeckung",
      discoverer: "Entdecker",
      back: "ZURÜCK",
      exit: "BEENDEN",
      nextMission: "NÄCHSTE MISSION ➔",
      masterChallenge: "🏆 MEISTER-HERAUSFORDERUNG",
      selectLanguage: "🌍 SPRACHE AUSWÄHLEN",
      loading: "QUANTENMATRIX WIRD GELADEN...",
      labTitle: "🧪 SIMULATIONSLABOR",
      labIntro: "Hier können Sie mit den Eigenschaften der Elemente experimentieren. Wählen Sie zwei Elemente aus, um ihre periodischen Trends zu vergleichen.",
      compareBtn: "ELEMENTE VERGLEICHEN",
      propertySelect: "Wählen Sie eine Eigenschaft zum Vergleichen:",
      compareResult: "VERGLEICHERGEBNIS",
      element1: "Element 1",
      element2: "Element 2",
      property: "Eigenschaft",
      value1: "Wert (Element 1)",
      value2: "Wert (Element 2)",
      difference: "Unterschied",
      trendExplanation: "TREND-ERKLÄRUNG",
      closeLab: "LABOR SCHLIESSEN"
    },
    aiDB: {
      "WRONG_GROUP": {
        q: "Was repräsentieren die SPALTEN (Gruppen) im Periodensystem?",
        o: [
          "Die Anzahl der Elektronenschalen",
          "Die Anzahl der Valenzelektronen (Elektronen in der äußersten Schale)",
          "Die Atommasse des Elements",
          "Den Siedepunkt des Elements"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: GRUPPEN (vertikale Spalten) geben die Anzahl der Valenzelektronen an. Alle Elemente in einer Gruppe teilen ähnliche chemische Eigenschaften. Überprüfen Sie die X-Koordinate!"
      },
      "WRONG_PERIOD": {
        q: "Was zeigen die REIHEN (Perioden) im Periodensystem an?",
        o: [
          "Die Anzahl der Protonen im Kern",
          "Die Anzahl der Elektronenschalen (Energieniveaus)",
          "Die Elektronegativität des Elements",
          "Die Reaktivität des Elements"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: PERIODEN (horizontale Reihen) repräsentieren die Anzahl der Elektronenschalen. Jede Periode entspricht einem Hauptenergieniveau (n). Korrigieren Sie die Y-Koordinate!"
      },
      "WRONG_FAMILY": {
        q: "Wie sind chemische Familien im Periodensystem organisiert?",
        o: [
          "Durch horizontale Reihen (Perioden)",
          "Durch vertikale Spalten (Gruppen)",
          "Durch Diagonale von links nach rechts",
          "Zufällig"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: CHEMISCHE FAMILIEN (wie Alkalimetalle, Halogene, Edelgase) sind in VERTIKALEN SPALTEN (Gruppen) organisiert. Alle Elemente in einer Gruppe teilen ähnliche Eigenschaften. Suchen Sie in der richtigen Spalte!"
      },
      "TREND_LOWER_EN": {
        q: "Elektronegativität ist die Fähigkeit eines Atoms, Elektronen anzuziehen. Wo NIMMT sie im Periodensystem ZU?",
        o: [
          "Von rechts nach links und von oben nach unten",
          "Von links nach rechts und von unten nach oben",
          "Nur in Übergangsmetallen",
          "Es folgt kein definiertes Muster"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: ELEKTRONEGATIVITÄT nimmt von LINKS nach RECHTS in einer Periode und von UNTEN nach OBEN in einer Gruppe zu. Dies liegt an der höheren effektiven Kernladung (Z_eff). Wählen Sie ein Element mit höherer Z_eff!"
      },
      "TREND_HIGHER_RAD": {
        q: "Warum NIMMT der Atomradius nach UNTEN in einer Gruppe ZU?",
        o: [
          "Weil Atome mehr Protonen gewinnen und größer werden",
          "Weil zusätzliche Elektronenschalen (Energieniveaus) hinzugefügt werden",
          "Weil die Temperatur steigt",
          "Weil der atmosphärische Druck abnimmt"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: Der ATOMRADIUS nimmt nach UNTEN in einer Gruppe zu, weil jede neue Periode eine zusätzliche ELEKTRONENSCHALE hinzufügt. Dies erhöht den Abstand zwischen dem Kern und den äußersten Elektronen. Suchen Sie ein Element in einer höheren Periode!"
      },
      "TREND_LOWER_IE": {
        q: "Ionisierungsenergie ist die Energie, die benötigt wird, um ein Elektron zu entfernen. Wo ist sie HÖHER?",
        o: [
          "In Elementen mit großem Atomradius (unten links)",
          "In Elementen mit kleinem Atomradius (oben rechts)",
          "In Alkalimetallen",
          "In Lanthaniden"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: Die IONISIERUNGSENERGIE ist höher in Elementen mit KLEINEM ATOMRADIUS (oben rechts). Dies liegt daran, dass die Elektronen näher am Kern sind und mit größerer Kraft angezogen werden (hohe Z_eff). Wählen Sie ein kleineres Element rechts!"
      },
      "NOBLE_GAS_EN": {
        q: "Warum haben Edelgase (Gruppe 18) eine ELEKTRONEGATIVITÄT von NULL im Periodensystem?",
        o: [
          "Weil sie keine Elektronen haben",
          "Weil sie bereits eine vollständige Valenzschale haben (Oktettregel) und keine weiteren Elektronen anziehen müssen",
          "Weil sie synthetische Elemente sind",
          "Weil ihr Atomradius unendlich ist"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: EDELGASE (Gruppe 18) haben eine ELEKTRONEGATIVITÄT von NULL, weil sie bereits die OKTETTREGEL erfüllen: ihre Valenzschale ist vollständig. Sie können keine normalen kovalenten Bindungen bilden!"
      },
      "UNKNOWN_ELEMENT": {
        q: "Was sollten Sie tun, wenn das ausgewählte Element nicht in der Datenbank existiert?",
        o: [
          "Das Spiel neu starten",
          "Ein gültiges Element aus dem Periodensystem auswählen",
          "Den Fehler ignorieren und weitermachen",
          "Den Fehler dem Lehrer melden"
        ],
        a: 1,
        m: "⚠️ KRITISCHER FEHLER: Das ausgewählte Element existiert nicht in der Datenbank. Stellen Sie sicher, dass Sie auf einen GÜLTIGEN KNOTEN im 3D-Periodensystem klicken. Alle Elemente sind mit ihrem Symbol beschriftet!"
      },
      "generic": {
        q: "Welche Strategie sollten Sie befolgen, um Missionen in Mendeleev's Grid zu lösen?",
        o: [
          "Zufällig raten, bis es richtig ist",
          "Den Thermischen Scanner verwenden, Eigenschaften analysieren und die Regeln der periodischen Trends anwenden",
          "Die KI-Hinweise ignorieren",
          "Das gesamte Periodensystem auswendig lernen"
        ],
        a: 1,
        m: "💡 KI-PROFESSOR-RAT: Um Missionen erfolgreich zu lösen, befolgen Sie diese Schritte:\n1. Lesen Sie den Missionsbriefing sorgfältig.\n2. Verwenden Sie den Thermischen Scanner, um Trends zu visualisieren (Atomradius, Elektronegativität usw.).\n3. Analysieren Sie die Eigenschaften des ausgewählten Elements.\n4. Wenden Sie die Regeln der periodischen Trends an.\n5. Wenn Sie scheitern, gibt Ihnen die KI eine interaktive Mikro-Lektion. Lernen Sie aus dem Fehler!"
      },
      "CHALLENGE_HINT": {
        q: "Was sollten Sie tun, um die Meister-Herausforderung zu vervollständigen?",
        o: [
          "Das erste Element auswählen, das Sie sehen",
          "Koordinaten (Gruppe/Periode), Familien und Trends verwenden, um Oganesson (Og) zu lokalisieren",
          "Periodische Eigenschaften ignorieren",
          "Einen Mitschüler um Hilfe bitten"
        ],
        a: 1,
        m: "🔥 MEISTER-HERAUSFORDERUNG: Um Oganesson (Og) zu finden, befolgen Sie diese Schritte:\n1. Lokalisieren Sie Gruppe 18 (Edelgase) in der ganz rechten Spalte.\n2. Scrollen Sie nach UNTEN bis zur Periode 7.\n3. Verwenden Sie den Thermischen Scanner, um zu bestätigen, dass es sich um ein Edelgas mit einzigartigen Eigenschaften handelt (es ist das schwerste!).\n4. Klicken Sie auf den Knoten und analysieren Sie seine Details. Nur die besten Quantenchemiker werden erfolgreich sein!"
      }
    }
  }
};

const LANG_MAP = {
  es: 'es-ES',
  en: 'en-US',
  fr: 'fr-FR',
  de: 'de-DE'
};

/* ============================================================
   🎥 RENDERIZADOR 3D: THE CYBER GRID (Topología Real + Efectos Cuánticos)
============================================================ */
const Grid3D = ({
  onCellClick,
  currentHighlight,
  isErrorShake,
  heatMode,
  currentTrend,
  selectedLanguage,
  labMode = false
}) => {
  const gridRef = useRef();
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(0));

  // Efecto de audio reactivo
  useEffect(() => {
    const interval = setInterval(() => {
      if (sfx.ctx) {
        setFrequencyData(sfx.getFrequencyData());
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Animación del grid
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      if (isErrorShake) {
        gridRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.2;
        gridRef.current.position.z = Math.cos(state.clock.elapsedTime * 30) * 0.1;
      } else {
        gridRef.current.position.x = 0;
        gridRef.current.position.z = 0;
      }
    }
  });

  const cells = [];
  const startX = -13.5;
  const startY = 6.5;
  const spacingX = 1.05;
  const spacingY = 1.05;
  const boxGeo = useMemo(() => new THREE.BoxGeometry(0.95, 0.95, 0.1), []);

  // Calcular min/max para el Heatmap
  const { min, max } = useMemo(() => {
    if (!currentTrend) return { min: 0, max: 1 };
    return Engine.getMinMaxOfTrend(currentTrend);
  }, [currentTrend]);

  // Ordenar elementos por número atómico
  const sortedElements = useMemo(() => {
    return Object.values(ELEMENTS_DB).sort((a, b) => a.z - b.z);
  }, []);

  sortedElements.forEach(el => {
    const posX = startX + (el.g - 1) * spacingX;
    const posY = startY - (el.p - 1) * spacingY;
    const isTarget = currentHighlight && currentHighlight.g === el.g && currentHighlight.p === el.p;
    const lang = selectedLanguage || 'es';

    // Lógica del Escáner Holográfico (Heatmap)
    let heatColor = "#002244";
    if (heatMode && currentTrend) {
      if (currentTrend === 'en' && el.en === 0) {
        heatColor = "#333333"; // Gases nobles en gris para EN
      } else {
        const val = el[currentTrend];
        const norm = (val - min) / (max - min); // Normalizar entre 0 y 1
        const cLow = new THREE.Color("#00f2ff"); // Azul (bajo)
        const cHigh = new THREE.Color("#ff0055"); // Rojo (alto)
        heatColor = cLow.lerp(cHigh, norm).getStyle();
      }
    }

    // Efecto de audio reactivo (solo si hay frecuencia)
    let audioColor = "#00f2ff";
    if (frequencyData.length > 0 && !heatMode) {
      const avgFreq = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
      const normFreq = avgFreq / 255;
      const c1 = new THREE.Color("#00f2ff");
      const c2 = new THREE.Color("#ff00aa");
      audioColor = c1.lerp(c2, normFreq).getStyle();
    }

    cells.push(
      <group
        key={`${el.sym}-${el.z}`}
        position={[posX, posY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onCellClick(el.g, el.p);
          sfx.ping();
        }}
      >
        {/* Cubo del elemento con efectos visuales */}
        <mesh geometry={boxGeo}>
          <meshPhysicalMaterial
            color={heatMode ? heatColor : (isTarget ? "#0f0" : audioColor)}
            transparent
            opacity={isTarget || heatMode ? 0.9 : 0.6}
            roughness={0.1}
            metalness={0.2}
            transmission={heatMode ? 0.3 : 0.5}
            emissive={isTarget ? "#0f0" : (heatMode ? heatColor : audioColor)}
            emissiveIntensity={isTarget ? 1 : (heatMode ? 0.5 : 0.2)}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            ior={1.5}
          />
          <Edges
            scale={1.05}
            threshold={15}
            color={isTarget ? "#0f0" : (heatMode ? heatColor : audioColor)}
            opacity={0.4}
            transparent
          />
        </mesh>

        {/* Etiqueta con símbolo y número atómico */}
        <Html position={[0, 0, 0.06]} center zIndexRange={[100, 0]} transform>
          <div style={{
            color: heatMode ? '#fff' : '#00f2ff',
            fontSize: '10px',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 'bold',
            pointerEvents: 'none',
            textShadow: '0 0 5px #000',
            textAlign: 'center',
            lineHeight: '1.1'
          }}>
            {el.sym}<br />
            <span style={{ fontSize: '8px', color: '#aaa' }}>{el.z}</span>
          </div>
        </Html>

        {/* Efecto de brillo para elementos seleccionados */}
        {isTarget && (
          <Sparkles
            count={20}
            speed={0.4}
            size={2}
            color="#0f0"
            scale={[1.2, 1.2, 1]}
            position={[0, 0, 0.1]}
          />
        )}
      </group>
    );
  });

  return (
    <>
      <group ref={gridRef}>
        {cells}
        {/* Fondo de estrellas para efecto de espacio */}
        <Stars
          radius={50}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
        />
        {/* Entorno para reflexiones */}
        <Environment preset="city" />
      </group>
    </>
  );
};

/* ============================================================
   🧪 LABORATORIO DE SIMULACIÓN (Comparación de Elementos)
============================================================ */
const SimulationLab = ({ onClose, selectedLanguage }) => {
  const [element1, setElement1] = useState(null);
  const [element2, setElement2] = useState(null);
  const [property, setProperty] = useState('en');
  const [result, setResult] = useState(null);
  const dict = DICT[selectedLanguage]?.ui;

  const properties = [
    { key: 'en', label: { es: "Electronegatividad", en: "Electronegativity", fr: "Électronégativité", de: "Elektronegativität" } },
    { key: 'rad', label: { es: "Radio Atómico (pm)", en: "Atomic Radius (pm)", fr: "Rayon Atomique (pm)", de: "Atomradius (pm)" } },
    { key: 'ie', label: { es: "Energía de Ionización (kJ/mol)", en: "Ionization Energy (kJ/mol)", fr: "Énergie d'Ionisation (kJ/mol)", de: "Ionisierungsenergie (kJ/mol)" } },
    { key: 'mass', label: { es: "Masa Atómica", en: "Atomic Mass", fr: "Masse Atomique", de: "Atommasse" } },
    { key: 'density', label: { es: "Densidad (g/cm³)", en: "Density (g/cm³)", fr: "Densité (g/cm³)", de: "Dichte (g/cm³)" } }
  ];

  const compareElements = () => {
    if (!element1 || !element2 || !property) return;

    const val1 = element1[property];
    const val2 = element2[property];
    const diff = val2 - val1;

    let explanation = "";
    if (selectedLanguage === 'es') {
      explanation = getTrendExplanationES(property, val1, val2, element1, element2);
    } else if (selectedLanguage === 'en') {
      explanation = getTrendExplanationEN(property, val1, val2, element1, element2);
    } else if (selectedLanguage === 'fr') {
      explanation = getTrendExplanationFR(property, val1, val2, element1, element2);
    } else {
      explanation = getTrendExplanationDE(property, val1, val2, element1, element2);
    }

    setResult({
      element1: element1.sym,
      element2: element2.sym,
      property,
      value1: val1,
      value2: val2,
      difference: diff,
      explanation
    });
    sfx.scan();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 10, 20, 0.95)',
      zIndex: 5000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'auto'
    }}>
      <div style={{
        background: 'rgba(0, 20, 40, 0.9)',
        border: '1px solid #00f2ff',
        borderRadius: '10px',
        padding: '30px',
        maxWidth: '900px',
        width: '100%',
        boxShadow: '0 0 30px rgba(0, 242, 255, 0.3)'
      }}>
        <h2 style={{
          color: '#00f2ff',
          textAlign: 'center',
          marginBottom: '20px',
          fontFamily: 'Orbitron, sans-serif'
        }}>
          {dict.labTitle}
        </h2>
        <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '30px' }}>
          {dict.labIntro}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Selector de Elemento 1 */}
          <div style={{ background: 'rgba(0, 30, 60, 0.5)', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#0f0', marginTop: 0 }}>{dict.element1}</h3>
            {element1 ? (
              <div style={{ color: '#fff', fontFamily: 'monospace' }}>
                <strong>{element1.sym}</strong> - {element1.name[selectedLanguage]}<br />
                Grupo: {element1.g}, Periodo: {element1.p}<br />
                Familia: {element1.fam[selectedLanguage]}
              </div>
            ) : (
              <div style={{ color: '#aaa', fontSize: '14px' }}>Selecciona un elemento en el grid 3D</div>
            )}
          </div>

          {/* Selector de Elemento 2 */}
          <div style={{ background: 'rgba(0, 30, 60, 0.5)', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ color: '#0f0', marginTop: 0 }}>{dict.element2}</h3>
            {element2 ? (
              <div style={{ color: '#fff', fontFamily: 'monospace' }}>
                <strong>{element2.sym}</strong> - {element2.name[selectedLanguage]}<br />
                Grupo: {element2.g}, Periodo: {element2.p}<br />
                Familia: {element2.fam[selectedLanguage]}
              </div>
            ) : (
              <div style={{ color: '#aaa', fontSize: '14px' }}>Selecciona un elemento en el grid 3D</div>
            )}
          </div>
        </div>

        {/* Selector de Propiedad */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#0f0', display: 'block', marginBottom: '8px' }}>
            {dict.propertySelect}
          </label>
          <select
            onChange={(e) => setProperty(e.target.value)}
            value={property}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(0, 30, 60, 0.7)',
              color: '#fff',
              border: '1px solid #00f2ff',
              borderRadius: '5px',
              fontFamily: 'Orbitron, sans-serif'
            }}
          >
            {properties.map(prop => (
              <option key={prop.key} value={prop.key}>
                {prop.label[selectedLanguage]}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de Comparar */}
        <button
          onClick={compareElements}
          disabled={!element1 || !element2}
          style={{
            width: '100%',
            padding: '15px',
            background: !element1 || !element2 ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 255, 0, 0.3)',
            color: '#fff',
            border: '2px solid #0f0',
            borderRadius: '8px',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: '16px',
            cursor: !element1 || !element2 ? 'not-allowed' : 'pointer',
            transition: '0.3s',
            marginBottom: '20px'
          }}
          onMouseOver={(e) => {
            if (element1 && element2) {
              e.target.style.background = 'rgba(0, 255, 0, 0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (element1 && element2) {
              e.target.style.background = 'rgba(0, 255, 0, 0.3)';
            }
          }}
        >
          {dict.compareBtn}
        </button>

        {/* Resultados */}
        {result && (
          <div style={{
            background: 'rgba(0, 40, 80, 0.5)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #00f2ff'
          }}>
            <h3 style={{ color: '#0f0', marginTop: 0 }}>{dict.compareResult}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
              <div>
                <strong>{dict.element1}:</strong> {result.element1}<br />
                <strong>{dict.property}:</strong> {properties.find(p => p.key === result.property).label[selectedLanguage]}<br />
                <strong>{dict.value1}:</strong> {result.value1}
              </div>
              <div>
                <strong>{dict.element2}:</strong> {result.element2}<br />
                <strong>{dict.property}:</strong> {properties.find(p => p.key === result.property).label[selectedLanguage]}<br />
                <strong>{dict.value2}:</strong> {result.value2}
              </div>
            </div>
            <div style={{ color: result.difference > 0 ? '#0f0' : result.difference < 0 ? '#ff0055' : '#00f2ff' }}>
              <strong>{dict.difference}:</strong> {result.difference.toFixed(2)}
            </div>
            <div style={{ marginTop: '15px', color: '#ccc', fontSize: '14px' }}>
              <strong>{dict.trendExplanation}:</strong>
              <p style={{ margin: '10px 0 0 0', lineHeight: '1.5' }}>{result.explanation}</p>
            </div>
          </div>
        )}

        {/* Botón para cerrar */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255, 0, 0, 0.2)',
            color: '#fff',
            border: '1px solid #ff0055',
            borderRadius: '5px',
            fontFamily: 'Orbitron, sans-serif',
            cursor: 'pointer',
            transition: '0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.4)'}
          onMouseOut={(e) => e.target.style.background = 'rgba(255, 0, 0, 0.2)'}
        >
          {dict.closeLab}
        </button>
      </div>
    </div>
  );
};

// Funciones para explicaciones de tendencias en diferentes idiomas
const getTrendExplanationES = (property, val1, val2, el1, el2) => {
  const diff = val2 - val1;
  const absDiff = Math.abs(diff);

  switch (property) {
    case 'en':
      if (diff > 0) {
        return `La Electronegatividad de ${el2.sym} (${val2}) es MAYOR que la de ${el1.sym} (${val1}). Esto se debe a que ${el2.sym} está más a la DERECHA y/o ARRIBA en la Tabla Periódica, lo que aumenta su Carga Nuclear Efectiva (Z_eff) y su capacidad para atraer electrones.`;
      } else if (diff < 0) {
        return `La Electronegatividad de ${el2.sym} (${val2}) es MENOR que la de ${el1.sym} (${val1}). Esto ocurre porque ${el2.sym} está más a la IZQUIERDA y/o ABAJO, reduciendo su Z_eff.`;
      } else {
        return `Ambos elementos tienen la MISMA Electronegatividad (${val1}). Esto es raro y suele ocurrir en elementos del mismo grupo o con configuraciones electrónicas muy similares.`;
      }
    case 'rad':
      if (diff > 0) {
        return `El Radio Atómico de ${el2.sym} (${val2} pm) es MAYOR que el de ${el1.sym} (${val1} pm). Esto se debe a que ${el2.sym} está en un PERIODO SUPERIOR (fila más abajo), lo que significa que tiene más capas de electrones.`;
      } else if (diff < 0) {
        return `El Radio Atómico de ${el2.sym} (${val2} pm) es MENOR que el de ${el1.sym} (${val1} pm). Esto ocurre porque ${el2.sym} está en un periodo inferior o más a la derecha, donde la Z_eff contrae el átomo.`;
      } else {
        return `Ambos elementos tienen el MISMO Radio Atómico (${val1} pm). Esto es típico en elementos del mismo periodo y grupo, como los Gases Nobles.`;
      }
    case 'ie':
      if (diff > 0) {
        return `La Energía de Ionización de ${el2.sym} (${val2} kJ/mol) es MAYOR que la de ${el1.sym} (${val1} kJ/mol). Esto indica que los electrones de ${el2.sym} están más fuertemente unidos al núcleo, típicamente porque está más a la DERECHA y/o ARRIBA en la tabla.`;
      } else if (diff < 0) {
        return `La Energía de Ionización de ${el2.sym} (${val2} kJ/mol) es MENOR que la de ${el1.sym} (${val1} kJ/mol). Esto sugiere que ${el2.sym} tiene electrones más fáciles de arrancar, generalmente porque está más a la IZQUIERDA y/o ABAJO.`;
      } else {
        return `Ambos elementos tienen la MISMA Energía de Ionización (${val1} kJ/mol). Esto es inusual y puede deberse a configuraciones electrónicas similares o efectos de pantalla electrónica.`;
      }
    case 'mass':
      return `La Masa Atómica de ${el2.sym} (${val2}) es ${diff > 0 ? 'MAYOR' : 'MENOR'} que la de ${el1.sym} (${val1}). La masa atómica depende del número de protones y neutrones en el núcleo.`;
    case 'density':
      return `La Densidad de ${el2.sym} (${val2} g/cm³) es ${diff > 0 ? 'MAYOR' : 'MENOR'} que la de ${el1.sym} (${val1} g/cm³). La densidad depende de la masa atómica y del empaquetamiento atómico en el estado sólido.`;
    default:
      return "Explicación no disponible para esta propiedad.";
  }
};

const getTrendExplanationEN = (property, val1, val2, el1, el2) => {
  const diff = val2 - val1;

  switch (property) {
    case 'en':
      if (diff > 0) {
        return `The Electronegativity of ${el2.sym} (${val2}) is HIGHER than that of ${el1.sym} (${val1}). This is because ${el2.sym} is further to the RIGHT and/or UP in the Periodic Table, increasing its Effective Nuclear Charge (Z_eff) and ability to attract electrons.`;
      } else if (diff < 0) {
        return `The Electronegativity of ${el2.sym} (${val2}) is LOWER than that of ${el1.sym} (${val1}). This occurs because ${el2.sym} is further to the LEFT and/or DOWN, reducing its Z_eff.`;
      } else {
        return `Both elements have the SAME Electronegativity (${val1}). This is rare and usually occurs in elements of the same group or with very similar electronic configurations.`;
      }
    case 'rad':
      if (diff > 0) {
        return `The Atomic Radius of ${el2.sym} (${val2} pm) is LARGER than that of ${el1.sym} (${val1} pm). This is because ${el2.sym} is in a HIGHER PERIOD (lower row), meaning it has more electron shells.`;
      } else if (diff < 0) {
        return `The Atomic Radius of ${el2.sym} (${val2} pm) is SMALLER than that of ${el1.sym} (${val1} pm). This happens because ${el2.sym} is in a lower period or further to the right, where Z_eff contracts the atom.`;
      } else {
        return `Both elements have the SAME Atomic Radius (${val1} pm). This is typical for elements in the same period and group, such as Noble Gases.`;
      }
    case 'ie':
      if (diff > 0) {
        return `The Ionization Energy of ${el2.sym} (${val2} kJ/mol) is HIGHER than that of ${el1.sym} (${val1} kJ/mol). This indicates that the electrons of ${el2.sym} are more strongly bound to the nucleus, typically because it is further to the RIGHT and/or UP in the table.`;
      } else if (diff < 0) {
        return `The Ionization Energy of ${el2.sym} (${val2} kJ/mol) is LOWER than that of ${el1.sym} (${val1} kJ/mol). This suggests that ${el2.sym} has electrons that are easier to remove, generally because it is further to the LEFT and/or DOWN.`;
      } else {
        return `Both elements have the SAME Ionization Energy (${val1} kJ/mol). This is unusual and may be due to similar electronic configurations or electron shielding effects.`;
      }
    case 'mass':
      return `The Atomic Mass of ${el2.sym} (${val2}) is ${diff > 0 ? 'HIGHER' : 'LOWER'} than that of ${el1.sym} (${val1}). Atomic mass depends on the number of protons and neutrons in the nucleus.`;
    case 'density':
      return `The Density of ${el2.sym} (${val2} g/cm³) is ${diff > 0 ? 'HIGHER' : 'LOWER'} than that of ${el1.sym} (${val1} g/cm³). Density depends on atomic mass and atomic packing in the solid state.`;
    default:
      return "Explanation not available for this property.";
  }
};

const getTrendExplanationFR = (property, val1, val2, el1, el2) => {
  const diff = val2 - val1;

  switch (property) {
    case 'en':
      if (diff > 0) {
        return `L'Électronégativité de ${el2.sym} (${val2}) est PLUS ÉLEVÉE que celle de ${el1.sym} (${val1}). Cela est dû au fait que ${el2.sym} est plus à DROITE et/ou en HAUT dans le Tableau Périodique, ce qui augmente sa Charge Nucléaire Effective (Z_eff) et sa capacité à attirer les électrons.`;
      } else if (diff < 0) {
        return `L'Électronégativité de ${el2.sym} (${val2}) est PLUS FAIBLE que celle de ${el1.sym} (${val1}). Cela se produit parce que ${el2.sym} est plus à GAUCHE et/ou en BAS, réduisant son Z_eff.`;
      } else {
        return `Les deux éléments ont la MÊME Électronégativité (${val1}). Cela est rare et se produit généralement pour des éléments du même groupe ou avec des configurations électroniques très similaires.`;
      }
    case 'rad':
      if (diff > 0) {
        return `Le Rayon Atomique de ${el2.sym} (${val2} pm) est PLUS GRAND que celui de ${el1.sym} (${val1} pm). Cela est dû au fait que ${el2.sym} est dans une PÉRIODE PLUS ÉLEVÉE (rangée plus basse), ce qui signifie qu'il a plus de couches d'électrons.`;
      } else if (diff < 0) {
        return `Le Rayon Atomique de ${el2.sym} (${val2} pm) est PLUS PETIT que celui de ${el1.sym} (${val1} pm). Cela se produit parce que ${el2.sym} est dans une période inférieure ou plus à droite, où le Z_eff contracte l'atome.`;
      } else {
        return `Les deux éléments ont le MÊME Rayon Atomique (${val1} pm). Cela est typique pour les éléments de la même période et groupe, comme les Gaz Nobles.`;
      }
    case 'ie':
      if (diff > 0) {
        return `L'Énergie d'Ionisation de ${el2.sym} (${val2} kJ/mol) est PLUS ÉLEVÉE que celle de ${el1.sym} (${val1} kJ/mol). Cela indique que les électrons de ${el2.sym} sont plus fortement liés au noyau, généralement parce qu'il est plus à DROITE et/ou en HAUT dans le tableau.`;
      } else if (diff < 0) {
        return `L'Énergie d'Ionisation de ${el2.sym} (${val2} kJ/mol) est PLUS FAIBLE que celle de ${el1.sym} (${val1} kJ/mol). Cela suggère que ${el2.sym} a des électrons plus faciles à arracher, généralement parce qu'il est plus à GAUCHE et/ou en BAS.`;
      } else {
        return `Les deux éléments ont la MÊME Énergie d'Ionisation (${val1} kJ/mol). Cela est inhabituel et peut être dû à des configurations électroniques similaires ou à des effets d'écran électronique.`;
      }
    case 'mass':
      return `La Masse Atomique de ${el2.sym} (${val2}) est ${diff > 0 ? 'PLUS ÉLEVÉE' : 'PLUS FAIBLE'} que celle de ${el1.sym} (${val1}). La masse atomique dépend du nombre de protons et de neutrons dans le noyau.`;
    case 'density':
      return `La Densité de ${el2.sym} (${val2} g/cm³) est ${diff > 0 ? 'PLUS ÉLEVÉE' : 'PLUS FAIBLE'} que celle de ${el1.sym} (${val1} g/cm³). La densité dépend de la masse atomique et de l'empilement atomique dans l'état solide.`;
    default:
      return "Explication non disponible pour cette propriété.";
  }
};

const getTrendExplanationDE = (property, val1, val2, el1, el2) => {
  const diff = val2 - val1;

  switch (property) {
    case 'en':
      if (diff > 0) {
        return `Die Elektronegativität von ${el2.sym} (${val2}) ist HÖHER als die von ${el1.sym} (${val1}). Dies liegt daran, dass ${el2.sym} weiter RECHTS und/oder OBEN im Periodensystem steht, was seine effektive Kernladung (Z_eff) und seine Fähigkeit, Elektronen anzuziehen, erhöht.`;
      } else if (diff < 0) {
        return `Die Elektronegativität von ${el2.sym} (${val2}) ist NIEDRIGER als die von ${el1.sym} (${val1}). Dies tritt auf, weil ${el2.sym} weiter LINKS und/oder UNTEN steht, was seine Z_eff verringert.`;
      } else {
        return `Beide Elemente haben die GLEICHE Elektronegativität (${val1}). Dies ist selten und tritt normalerweise bei Elementen der gleichen Gruppe oder mit sehr ähnlichen Elektronenkonfigurationen auf.`;
      }
    case 'rad':
      if (diff > 0) {
        return `Der Atomradius von ${el2.sym} (${val2} pm) ist GRÖßER als der von ${el1.sym} (${val1} pm). Dies liegt daran, dass ${el2.sym} in einer HÖHEREN PERIODE (untere Reihe) steht, was bedeutet, dass es mehr Elektronenschalen hat.`;
      } else if (diff < 0) {
        return `Der Atomradius von ${el2.sym} (${val2} pm) ist KLEINER als der von ${el1.sym} (${val1} pm). Dies geschieht, weil ${el2.sym} in einer niedrigeren Periode oder weiter rechts steht, wo die Z_eff das Atom zusammenzieht.`;
      } else {
        return `Beide Elemente haben den GLEICHEN Atomradius (${val1} pm). Dies ist typisch für Elemente in der gleichen Periode und Gruppe, wie Edelgase.`;
      }
    case 'ie':
      if (diff > 0) {
        return `Die Ionisierungsenergie von ${el2.sym} (${val2} kJ/mol) ist HÖHER als die von ${el1.sym} (${val1} kJ/mol). Dies deutet darauf hin, dass die Elektronen von ${el2.sym} stärker an den Kern gebunden sind, typischerweise weil es weiter RECHTS und/oder OBEN in der Tabelle steht.`;
      } else if (diff < 0) {
        return `Die Ionisierungsenergie von ${el2.sym} (${val2} kJ/mol) ist NIEDRIGER als die von ${el1.sym} (${val1} kJ/mol). Dies deutet darauf hin, dass ${el2.sym} Elektronen hat, die leichter zu entfernen sind, allgemein weil es weiter LINKS und/oder UNTEN steht.`;
      } else {
        return `Beide Elemente haben die GLEICHE Ionisierungsenergie (${val1} kJ/mol). Dies ist ungewöhnlich und kann auf ähnliche Elektronenkonfigurationen oder Abschirmeffekte zurückzuführen sein.`;
      }
    case 'mass':
      return `Die Atommasse von ${el2.sym} (${val2}) ist ${diff > 0 ? 'HÖHER' : 'NIEDRIGER'} als die von ${el1.sym} (${val1}). Die Atommasse hängt von der Anzahl der Protonen und Neutronen im Kern ab.`;
    case 'density':
      return `Die Dichte von ${el2.sym} (${val2} g/cm³) ist ${diff > 0 ? 'HÖHER' : 'NIEDRIGER'} als die von ${el1.sym} (${val1} g/cm³). Die Dichte hängt von der Atommasse und der atomaren Packung im festen Zustand ab.`;
    default:
      return "Erklärung nicht verfügbar für diese Eigenschaft.";
  }
};

/* ============================================================
   🎮 MÁQUINA DE ESTADOS + UI (React App con Lógica Pedagógica Avanzada)
============================================================ */
function GameApp() {
  const store = useGameStore() || { language: "es" };
  const [selectedLanguage, setSelectedLanguage] = useState(store.language || 'es');
  const dict = DICT[selectedLanguage]?.ui || DICT.es.ui; // Fallback seguro
  const lCode = LANG_MAP[selectedLanguage];

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [labMode, setLabMode] = useState(false);
  const [labElement1, setLabElement1] = useState(null);
  const [labElement2, setLabElement2] = useState(null);

  // Estado del juego
  const [selectedCell, setSelectedCell] = useState(null);
  const [activeElement, setActiveElement] = useState(null);
  const [heatMode, setHeatMode] = useState(false);
  const [aiClickTrigger, setAiClickTrigger] = useState(false);

  // IA y Feedback
  const [aiMsg, setAiMsg] = useState("");
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [aiDialog, setAiDialog] = useState(null);
  const [aiState, setAiState] = useState("Q"); // Q = Pregunta, A = Respuesta, M = Microclase
  const [userAnswer, setUserAnswer] = useState(null);
  const [helpActive, setHelpActive] = useState(false);

  const level = useMemo(() => LEVELS[levelIdx] || LEVELS[0], [levelIdx, selectedLanguage]);

  // Inicializar audio al montar
  useEffect(() => {
    sfx.init();
    triggerVoice(dict.loading, lCode, 1.2);
  }, []);

  // Cambiar idioma
  const changeLanguage = (lang) => {
    setSelectedLanguage(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('mendeleevLanguage', lang);
    }
    setShowLanguageSelector(false);
    triggerVoice(DICT[lang].ui.title, LANG_MAP[lang], 1.1);
  };

  // Cargar nivel
  const loadLevel = (idx) => {
    if (idx >= LEVELS.length) {
      setPhase("BOOT");
      return;
    }
    setLevelIdx(idx);
    setSelectedCell(null);
    setActiveElement(null);
    setHeatMode(false);
    setPhase("THEORY");
    sfx.theoryStart();
    triggerVoice(level.theory[selectedLanguage], lCode, 0.95);
  };

  // Iniciar grid 3D
  const startGrid = () => {
    sfx.success();
    setPhase("GAME");
    triggerVoice(level.briefing[selectedLanguage], lCode);
  };

  // Manejar clic en celda
  const handleCellClick = useCallback((g, p) => {
    if (phase !== "GAME" && phase !== "LAB") return;

    sfx.ping();
    const sym = Object.keys(ELEMENTS_DB).find(k => ELEMENTS_DB[k].g === g && ELEMENTS_DB[k].p === p);
    const element = sym ? ELEMENTS_DB[sym] : null;

    if (labMode) {
      if (!labElement1) {
        setLabElement1(element);
        triggerVoice(`Elemento 1 seleccionado: ${element.name[selectedLanguage]}`, lCode);
      } else if (!labElement2) {
        setLabElement2(element);
        triggerVoice(`Elemento 2 seleccionado: ${element.name[selectedLanguage]}`, lCode);
      }
    } else {
      setSelectedCell({ g, p });
      setActiveElement(element);

      // Contador de clics para activar IA
      if (Engine.incrementClickCount()) {
        setAiClickTrigger(true);
        setTimeout(() => setAiClickTrigger(false), 5000);
      }
    }
  }, [phase, labMode, labElement1, labElement2, selectedLanguage, lCode]);

  // Analizar elemento seleccionado
  const analyzeSlot = () => {
    if (!selectedCell || !activeElement) {
      setAiMsg(dict.ui.analyze + " - " + dict.ui.helpText.split('\n')[2]);
      sfx.error();
      return;
    }

    sfx.scan();
    let result;

    if (level.type === "COORD") {
      result = Engine.validateCoord(level.t_g, level.t_p, selectedCell.g, selectedCell.p);
    } else if (level.type === "FAMILY") {
      const userSym = Object.keys(ELEMENTS_DB).find(k => ELEMENTS_DB[k] === activeElement);
      result = Engine.validateFamily(level.t_fam[selectedLanguage], userSym, selectedLanguage);
    } else if (level.type === "TREND" || level.type === "CHALLENGE") {
      const userSym = Object.keys(ELEMENTS_DB).find(k => ELEMENTS_DB[k] === activeElement);
      if (level.rule.includes("periodo") && selectedCell.p !== level.t_p) {
        result = { valid: false, err: "WRONG_PERIOD" };
      } else if (level.rule.includes("grupo") && selectedCell.g !== level.t_g) {
        result = { valid: false, err: "WRONG_GROUP" };
      } else {
        result = Engine.validateTrend(level.base, userSym, level.trend, level.expected, selectedLanguage);
      }
    }

    if (result.valid) {
      sfx.success();
      setPhase("WIN");
      triggerVoice(dict.ui.success, lCode, 1.1);
    } else {
      sfx.error();
      setIsErrorShake(true);
      const aiData = Engine.getSocraticAI(result.err, DICT[selectedLanguage], selectedLanguage);
      setAiDialog(aiData);
      setPhase("AI");
      setAiState("Q"); // Empezar con pregunta
      triggerVoice(aiData.m, lCode);
      setTimeout(() => setIsErrorShake(false), 500);
    }
  };

  // Responder pregunta de la IA
  const handleAIAnswer = (answerIndex) => {
    if (!aiDialog) return;

    setUserAnswer(answerIndex);
    setAiState("A"); // Estado de respuesta

    if (answerIndex === aiDialog.a) {
      sfx.success();
      triggerVoice(DICT[selectedLanguage].aiDB[aiDialog.err].o[answerIndex], lCode);
      setTimeout(() => {
        setPhase("GAME");
        setAiState("Q");
      }, 2000);
    } else {
      sfx.error();
      triggerVoice(`Respuesta incorrecta. ${aiDialog.o[aiDialog.a]} es la correcta.`, lCode);
      setTimeout(() => {
        setAiState("M"); // Microclase
        triggerVoice(aiDialog.m, lCode);
      }, 2000);
    }
  };

  // Alternar heatmap
  const toggleHeatmap = () => {
    sfx.heatmap();
    setHeatMode(!heatMode);
    triggerVoice(!heatMode ? dict.ui.heatmapON : dict.ui.heatmapOFF, lCode);
  };

  // Alternar laboratorio
  const toggleLab = () => {
    setLabMode(!labMode);
    setLabElement1(null);
    setLabElement2(null);
    if (!labMode) {
      triggerVoice(dict.ui.labTitle, lCode);
    }
  };

  // Renderizado condicional
  return (
    <GameErrorBoundary>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');

        body {
          margin: 0;
          padding: 0;
          font-family: 'Orbitron', sans-serif;
          overflow: hidden;
          user-select: none;
        }

        .hud-btn {
          padding: 15px 40px;
          background: rgba(0,255,0,0.1);
          color: #0f0;
          font-weight: 900;
          font-size: clamp(16px, 3vw, 20px);
          cursor: pointer;
          border-radius: 8px;
          border: 2px solid #0f0;
          font-family: 'Orbitron', sans-serif;
          transition: all 0.2s;
          box-shadow: 0 0 15px rgba(0,255,0,0.3);
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
        }
        .hud-btn:active { transform: scale(0.95); }
        .hud-btn:hover {
          background: rgba(0,255,0,0.3);
          box-shadow: 0 0 20px rgba(0,255,0,0.5);
        }
        .hud-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,255,0,0.2), transparent);
          transition: 0.5s;
        }
        .hud-btn:hover::after { left: 100%; }

        .hud-btn-ghost {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid #555;
          color: #fff;
          font-size: clamp(14px, 2.5vw, 16px);
          cursor: pointer;
          border-radius: 5px;
          font-family: 'Orbitron', sans-serif;
          transition: all 0.2s;
          backdrop-filter: blur(5px);
        }
        .hud-btn-ghost:active { transform: scale(0.95); }
        .hud-btn-ghost:hover {
          border-color: #0f0 !important;
          color: #0f0 !important;
          background: rgba(0,255,0,0.1);
          box-shadow: 0 0 10px rgba(0,255,0,0.2);
        }

        .shake-anim { animation: shake 0.4s ease-in-out; }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }

        .glass-panel {
          background: rgba(0,20,40,0.85);
          border: 1px solid #00f2ff;
          backdrop-filter: blur(10px);
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,255,0,0.15);
          padding: 20px;
        }

        .neon-text {
          color: #0f0;
          text-shadow: 0 0 10px rgba(0,255,0,0.5);
          animation: neon-pulse 1.5s infinite alternate;
        }
        @keyframes neon-pulse { from { text-shadow: 0 0 10px rgba(0,255,0,0.5); } to { text-shadow: 0 0 20px rgba(0,255,0,0.8), 0 0 30px rgba(0,255,0,0.3); } }

        .language-selector {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          gap: 10px;
        }
        .language-selector button {
          padding: 8px 15px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: 1px solid #00f2ff;
          border-radius: 5px;
          cursor: pointer;
          transition: 0.3s;
        }
        .language-selector button:hover {
          background: rgba(0,255,0,0.2);
          border-color: #0f0;
        }
        .language-selector button.active {
          background: rgba(0,255,0,0.3);
          border-color: #0f0;
          font-weight: bold;
        }

        .ai-option {
          background: rgba(0,30,60,0.5);
          border: 1px solid #00f2ff;
          color: #fff;
          padding: 12px;
          margin: 8px 0;
          border-radius: 5px;
          cursor: pointer;
          transition: 0.2s;
        }
        .ai-option:hover {
          background: rgba(0,255,0,0.1);
          border-color: #0f0;
        }
        .ai-option.correct {
          background: rgba(0,255,0,0.2);
          border-color: #0f0;
        }
        .ai-option.wrong {
          background: rgba(255,0,0,0.1);
          border-color: #ff0055;
        }

        .element-card {
          background: rgba(0,20,40,0.7);
          border: 1px solid #00f2ff;
          border-radius: 8px;
          padding: 15px;
          margin: 10px 0;
          transition: 0.3s;
        }
        .element-card:hover {
          background: rgba(0,255,0,0.1);
          border-color: #0f0;
          transform: translateY(-5px);
        }

        @media (max-width: 768px) {
          .hud-btn { padding: 12px 25px; font-size: 14px; }
          .hud-btn-ghost { padding: 8px 15px; font-size: 12px; }
        }
      `}</style>

      {/* Selector de idioma (siempre visible) */}
      <div className="language-selector">
        <button
          className={selectedLanguage === 'es' ? 'active' : ''}
          onClick={() => changeLanguage('es')}
        >
          ES
        </button>
        <button
          className={selectedLanguage === 'en' ? 'active' : ''}
          onClick={() => changeLanguage('en')}
        >
          EN
        </button>
        <button
          className={selectedLanguage === 'fr' ? 'active' : ''}
          onClick={() => changeLanguage('fr')}
        >
          FR
        </button>
        <button
          className={selectedLanguage === 'de' ? 'active' : ''}
          onClick={() => changeLanguage('de')}
        >
          DE
        </button>
      </div>

      {/* Contenedor principal */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: '#000500',
        fontFamily: 'Orbitron, sans-serif',
        color: '#fff'
      }}>

        {/* Pantalla de BOOT */}
        {phase === "BOOT" && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3000,
            background: 'radial-gradient(circle at center, rgba(0,10,20,0.95) 0%, rgba(0,0,0,1) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ color: '#00f2ff', fontSize: '20px', letterSpacing: '10px', marginBottom: '20px' }}>
              THE OMNISCIENT ACADEMY V4.0
            </div>
            <h1 className="neon-text" style={{
              fontSize: 'clamp(40px, 8vw, 80px)',
              margin: '0 0 20px 0'
            }}>
              {dict.title}
            </h1>
            <div style={{
              color: '#00f2ff',
              fontSize: '18px',
              marginBottom: '40px',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              {dict.subtitle}<br /><br />
              {dict.helpText.split('\n')[0]}<br />
              {dict.helpText.split('\n')[1]}
            </div>
            <button
              className="hud-btn"
              onClick={() => loadLevel(0)}
              style={{ fontSize: '24px', padding: '20px 50px' }}
            >
              {dict.start}
            </button>
          </div>
        )}

        {/* Briefing Teórico */}
        {phase === "THEORY" && (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at center, rgba(0,30,60,0.95) 0%, rgba(0,5,10,0.98) 100%)',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              padding: 'clamp(20px, 5vw, 40px)',
              textAlign: 'center',
              maxWidth: '800px',
              width: '100%'
            }}>
              <div style={{
                color: '#00f2ff',
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '10px',
                letterSpacing: '2px'
              }}>
                {levelIdx + 1}. MÓDULO TEÓRICO
              </div>
              <h2 style={{
                color: '#0f0',
                fontSize: 'clamp(28px, 5vw, 40px)',
                margin: '0 0 20px 0'
              }}>
                OBJETIVO: {level.name[selectedLanguage]}
              </h2>
              <div style={{
                fontSize: 'clamp(16px, 3vw, 20px)',
                color: '#fff',
                margin: '20px 0',
                lineHeight: '1.6',
                textAlign: 'left',
                background: 'rgba(0,20,40,0.6)',
                padding: '20px',
                borderLeft: '4px solid #0f0',
                borderRadius: '0 8px 8px 0'
              }}>
                {level.theory[selectedLanguage]}
              </div>
              <div style={{
                color: '#00f2ff',
                marginBottom: '30px',
                fontSize: '18px',
                fontWeight: 'bold',
                borderTop: '1px solid rgba(0,242,255,0.3)',
                paddingTop: '15px'
              }}>
                {level.briefing[selectedLanguage]}
              </div>
              <button
                className="hud-btn"
                onClick={startGrid}
                style={{ fontSize: '20px', padding: '15px 40px' }}
              >
                {dict.ui.start}
              </button>
            </div>
          </div>
        )}

        {/* Modo Juego o Laboratorio */}
        {(phase === "GAME" || phase === "LAB") && !labMode && (
          <>
            {/* Canvas 3D */}
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'auto'
            }}>
              <Canvas camera={{ position: [0, 0, 18], fov: 45 }}>
                <color attach="background" args={['#000500']} />
                <OrbitControls
                  enableZoom={true}
                  maxDistance={30}
                  minDistance={10}
                  maxPolarAngle={Math.PI / 2}
                />
                <ambientLight intensity={0.3} color="#00f2ff" />
                <pointLight position={[10, 10, 10]} color="#0f0" intensity={0.8} />
                <Grid3D
                  onCellClick={handleCellClick}
                  currentHighlight={selectedCell}
                  isErrorShake={isErrorShake}
                  heatMode={heatMode}
                  currentTrend={level.trend}
                  selectedLanguage={selectedLanguage}
                  labMode={labMode}
                />
                <EffectComposer>
                  <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} />
                  <Scanline opacity={0.2} density={1.5} />
                  {isErrorShake && (
                    <>
                      <ChromaticAberration offset={[0.01, 0.01]} />
                      <Glitch
                        delay={[0.5, 1.5]}
                        duration={[0.1, 0.3]}
                        strength={[0.05, 0.1]}
                        mode={GlitchMode.SPORADIC}
                      />
                    </>
                  )}
                </EffectComposer>
              </Canvas>
            </div>

            {/* UI Frontend */}
            <div className={isErrorShake ? 'shake-anim' : ''} style={{
              position: 'relative',
              zIndex: 100,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>

              {/* Header de Misión */}
              <div style={{
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                pointerEvents: 'auto',
                flexWrap: 'wrap',
                gap: '15px'
              }}>
                <div className="glass-panel" style={{ padding: '15px 30px', flex: 1 }}>
                  <div style={{ color: '#00f2ff', fontSize: '12px', letterSpacing: '2px' }}>
                    {level.type === 'COORD' ? dict.coord :
                     level.type === 'TREND' ? dict.trend :
                     level.type === 'FAMILY' ? dict.family : dict.masterChallenge}
                  </div>
                  <h2 style={{
                    margin: '5px 0 0 0',
                    color: '#fff',
                    fontSize: 'clamp(16px, 3vw, 20px)'
                  }}>
                    {level.briefing[selectedLanguage]}
                  </h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {level.type === "TREND" && (
                    <button
                      className="hud-btn-ghost"
                      style={{ borderColor: '#ff0055', color: '#ff0055', fontWeight: 'bold' }}
                      onClick={toggleHeatmap}
                    >
                      {heatMode ? dict.heatmapOFF : dict.scanBtn}
                    </button>
                  )}
                  <button
                    className="hud-btn-ghost"
                    onClick={() => setHelpActive(true)}
                  >
                    {dict.helpBtn}
                  </button>
                  <button
                    className="hud-btn-ghost"
                    style={{ borderColor: '#00f2ff', color: '#00f2ff' }}
                    onClick={toggleLab}
                  >
                    {dict.labBtn}
                  </button>
                  <button
                    className="hud-btn-ghost"
                    style={{ borderColor: '#f00', color: '#f00' }}
                    onClick={() => window.location.reload()}
                  >
                    {dict.exit}
                  </button>
                </div>
              </div>

              {/* Panel de Análisis */}
              {phase === "GAME" && (
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'center',
                  pointerEvents: 'auto'
                }}>
                  <div className="glass-panel" style={{
                    padding: '20px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '15px',
                    minWidth: '350px',
                    maxWidth: '500px',
                    width: '100%'
                  }}>

                    {/* Coordenadas */}
                    <div style={{
                      display: 'flex',
                      gap: '30px',
                      color: '#fff',
                      fontSize: '20px',
                      fontFamily: 'monospace',
                      width: '100%',
                      justifyContent: 'center',
                      borderBottom: '1px solid rgba(0,255,0,0.3)',
                      paddingBottom: '10px'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: '#aaa', fontSize: '12px' }}>{dict.group}</span>
                        <span style={{ color: selectedCell ? '#0f0' : '#555', fontSize: '24px' }}>
                          {selectedCell ? selectedCell.g : '--'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ color: '#aaa', fontSize: '12px' }}>{dict.period}</span>
                        <span style={{ color: selectedCell ? '#00f2ff' : '#555', fontSize: '24px' }}>
                          {selectedCell ? selectedCell.p : '--'}
                        </span>
                      </div>
                    </div>

                    {/* Telemetría del elemento */}
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: '#ccc',
                      minHeight: '80px',
                      padding: '10px',
                      background: 'rgba(0,10,20,0.3)',
                      borderRadius: '5px'
                    }}>
                      {activeElement ? (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ textAlign: 'left' }}>
                              <strong style={{ color: '#ffea00', fontSize: '16px' }}>
                                {activeElement.name[selectedLanguage]}
                              </strong><br />
                              <span style={{ color: '#aaa' }}>{dict.atomicNumber}: {activeElement.z}</span><br />
                              <span style={{ color: '#aaa' }}>{dict.family}: {activeElement.fam[selectedLanguage]}</span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ color: '#aaa' }}>{dict.atomicMass}: {activeElement.mass}</span><br />
                              <span style={{ color: '#aaa' }}>{dict.density}: {activeElement.density} g/cm³</span><br />
                              <span style={{ color: '#aaa' }}>{dict.discovery}: {activeElement.discovery}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                            <span style={{ color: '#00f2ff' }}>EN: {activeElement.en}</span>
                            <span style={{ color: '#0f0' }}>Rad: {activeElement.rad} pm</span>
                            <span style={{ color: '#ff0055' }}>IE: {activeElement.ie} kJ</span>
                          </div>
                        </>
                      ) : (
                        <div style={{ paddingTop: '15px', color: '#555' }}>
                          {dict.helpText.split('\n')[2]}
                        </div>
                      )}
                    </div>

                    {/* Botón de análisis */}
                    <button
                      className="hud-btn"
                      style={{ width: '100%' }}
                      disabled={!selectedCell}
                      onClick={analyzeSlot}
                    >
                      {dict.analyze}
                    </button>

                    {/* Indicador de IA si hay muchos clics erróneos */}
                    {aiClickTrigger && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-60px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 200, 0, 0.9)',
                        color: '#000',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 0 15px rgba(255, 200, 0, 0.7)',
                        animation: 'pulse 1.5s infinite'
                      }}>
                        {dict.ui.aiTitle} 💬: ¿Necesitas ayuda? ¡Haz clic en el botón de IA!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal de Ayuda Teórica */}
        {helpActive && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 10, 20, 0.95)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h2 style={{ color: '#0f0', textAlign: 'center', marginBottom: '20px' }}>
                {dict.helpText.split('\n')[0]}
              </h2>
              <div style={{ color: '#ccc', lineHeight: '1.8', marginBottom: '20px' }}>
                {dict.helpText.split('\n').slice(1).map((line, i) => (
                  <p key={i} style={{ margin: '10px 0' }}>{line}</p>
                ))}
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  className="hud-btn"
                  onClick={() => setHelpActive(false)}
                  style={{ marginRight: '10px' }}
                >
                  {dict.back}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de IA Socrática */}
        {phase === "AI" && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 10, 20, 0.95)',
            zIndex: 4000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="glass-panel" style={{
              border: '2px solid #ffea00',
              padding: '40px',
              textAlign: 'center',
              maxWidth: '700px',
              width: '100%'
            }}>
              <h2 style={{ color: '#ffea00', fontSize: '28px', margin: '0 0 20px 0' }}>
                {dict.aiTitle}
              </h2>

              {aiState === "Q" && (
                <>
                  <div style={{
                    fontSize: '20px',
                    color: '#0f0',
                    margin: '20px 0',
                    textAlign: 'left',
                    lineHeight: '1.6',
                    background: 'rgba(0,0,0,0.5)',
                    padding: '20px',
                    borderRadius: '10px'
                  }}>
                    <p style={{ margin: 0 }}>{aiDialog.q}</p>
                  </div>
                  <div style={{ textAlign: 'left', margin: '20px 0' }}>
                    {aiDialog.o.map((option, index) => (
                      <div
                        key={index}
                        className="ai-option"
                        onClick={() => handleAIAnswer(index)}
                      >
                        {String.fromCharCode(65 + index)}. {option}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {aiState === "A" && (
                <div style={{
                  fontSize: '20px',
                  color: userAnswer === aiDialog.a ? '#0f0' : '#ff0055',
                  margin: '20px 0',
                  textAlign: 'center'
                }}>
                  {userAnswer === aiDialog.a ? "✅ ¡Respuesta correcta!" : "❌ Respuesta incorrecta."}
                </div>
              )}

              {aiState === "M" && (
                <div style={{
                  fontSize: '18px',
                  color: '#ffea00',
                  margin: '20px 0',
                  textAlign: 'left',
                  lineHeight: '1.6',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '20px',
                  borderRadius: '10px'
                }}>
                  <p style={{ margin: 0 }}>{aiDialog.m}</p>
                </div>
              )}

              <button
                className="hud-btn"
                style={{ borderColor: '#ffea00', color: '#ffea00', width: '100%', marginTop: '20px' }}
                onClick={() => {
                  if (aiState === "M") {
                    setPhase("GAME");
                    setAiState("Q");
                  } else {
                    setPhase("GAME");
                  }
                }}
              >
                {dict.btnCont}
              </button>
            </div>
          </div>
        )}

        {/* Modal de Victoria */}
        {phase === "WIN" && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, rgba(0,40,80,0.95) 0%, rgba(0,10,20,0.98) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'auto',
            padding: '20px',
            zIndex: 4000
          }}>
            <h1 style={{
              color: '#0f0',
              fontSize: 'clamp(40px, 8vw, 60px)',
              textAlign: 'center',
              textShadow: '0 0 30px #0f0',
              margin: '0 0 30px 0'
            }}>
              {dict.success}
            </h1>
            <div style={{
              fontSize: '24px',
              color: '#fff',
              margin: '20px 0',
              background: 'rgba(0,255,0,0.1)',
              padding: '20px 40px',
              borderRadius: '10px',
              border: '1px solid #0f0',
              maxWidth: '600px',
              textAlign: 'center'
            }}>
              {dict.mission} <strong style={{ color: '#ffea00' }}>{level.name[selectedLanguage]} ({level.sym})</strong>
            </div>

            {/* Detalles del elemento completado */}
            <div className="element-card" style={{ maxWidth: '500px', width: '100%' }}>
              <h3 style={{ color: '#0f0', marginTop: 0 }}>
                {dict.elementDetails}: {level.sym} - {level.name[selectedLanguage]}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '15px 0' }}>
                <div>
                  <strong>{dict.atomicNumber}:</strong> {ELEMENTS_DB[level.sym].z}<br />
                  <strong>{dict.atomicMass}:</strong> {ELEMENTS_DB[level.sym].mass}<br />
                  <strong>{dict.family}:</strong> {ELEMENTS_DB[level.sym].fam[selectedLanguage]}
                </div>
                <div>
                  <strong>{dict.density}:</strong> {ELEMENTS_DB[level.sym].density} g/cm³<br />
                  <strong>{dict.meltingPoint}:</strong> {ELEMENTS_DB[level.sym].melt} K<br />
                  <strong>{dict.boilingPoint}:</strong> {ELEMENTS_DB[level.sym].boil} K
                </div>
              </div>
              <div style={{ color: '#aaa', fontSize: '14px' }}>
                <strong>{dict.discovery}:</strong> {ELEMENTS_DB[level.sym].discovery}<br />
                <strong>{dict.discoverer}:</strong> {ELEMENTS_DB[level.sym].discoverer}
              </div>
            </div>

            {/* Botón de siguiente misión */}
            <button
              className="hud-btn"
              style={{ marginTop: '30px', fontSize: '20px', padding: '15px 40px' }}
              onClick={() => loadLevel(levelIdx + 1)}
            >
              {levelIdx < LEVELS.length - 1 ? dict.nextMission : dict.masterChallenge}
            </button>
          </div>
        )}

        {/* Laboratorio de Simulación */}
        {labMode && (
          <SimulationLab
            onClose={toggleLab}
            selectedLanguage={selectedLanguage}
          />
        )}
      </div>
    </GameErrorBoundary>
  );
}

// Exportar el componente principal
export default function MendeleevGrid() {
  return (
    <GameErrorBoundary>
      <Suspense fallback={<div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Cargando Mendeleev's Grid...</div>}>
        <GameApp />
      </Suspense>
    </GameErrorBoundary>
  );
}
