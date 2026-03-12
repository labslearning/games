import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Edges, Text, Sphere } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🛡️ 1. ESCUDO ANTI-CRASH (ERROR BOUNDARY DE GRADO MILITAR)
============================================================ */
class GameErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, errorMsg: "" }; }
  static getDerivedStateFromError(error) { return { hasError: true, errorMsg: error.toString() }; }
  componentDidCatch(error, errorInfo) { console.error("Quantum Core Error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ width: '100vw', height: '100vh', background: '#050000', color: '#00f2ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'monospace', padding: '40px', textAlign:'center', zIndex: 9999 }}>
          <h1 style={{ fontSize: 'clamp(30px, 8vw, 60px)', textShadow: '0 0 30px #f00', color: '#ff0033' }}>⚠️ FATAL QUANTUM ERROR</h1>
          <p style={{ background: 'rgba(255,0,0,0.1)', padding: '20px', borderRadius: '10px', border:'1px solid #f00', maxWidth:'800px', fontSize: '18px', color: '#fff' }}>{this.state.errorMsg}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: '30px', padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#ff0033', color: '#fff', border: 'none', borderRadius: '5px', fontWeight:'bold', textTransform: 'uppercase', boxShadow: '0 0 20px #ff0033' }}>Reignite Core</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧬 2. MATRIZ CUÁNTICA DE SEMIRREACCIONES
============================================================ */
const HALF_REACTIONS = {
  reducers: [ 
    { eqLeft: "Zn", eqRight: "Zn²⁺", sym: "Zn", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Fe²⁺", eqRight: "Fe³⁺", sym: "Fe", eTransferred: 1, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Sn²⁺", eqRight: "Sn⁴⁺", sym: "Sn", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "2Cl⁻", eqRight: "Cl₂", sym: "Cl", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Al", eqRight: "Al³⁺", sym: "Al", eTransferred: 3, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "H₂S", eqRight: "S", sym: "S", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 2, hRight: 0 }, 
    { eqLeft: "C₂O₄²⁻", eqRight: "2CO₂", sym: "C", eTransferred: 2, oLeft: 4, oRight: 4, hLeft: 0, hRight: 0 }, 
    { eqLeft: "H₂O₂", eqRight: "O₂", sym: "O", eTransferred: 2, oLeft: 2, oRight: 2, hLeft: 2, hRight: 0 }, 
    { eqLeft: "2I⁻", eqRight: "I₂", sym: "I", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "2Br⁻", eqRight: "Br₂", sym: "Br", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Pb²⁺", eqRight: "Pb⁴⁺", sym: "Pb", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Cu", eqRight: "Cu²⁺", sym: "Cu", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 }
  ],
  oxidizers: [ 
    { eqLeft: "Cu²⁺", eqRight: "Cu", sym: "Cu", eTransferred: 2, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "MnO₄⁻", eqRight: "Mn²⁺", sym: "Mn", eTransferred: 5, oLeft: 4, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Cr₂O₇²⁻", eqRight: "2Cr³⁺", sym: "Cr", eTransferred: 6, oLeft: 7, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "NO₃⁻", eqRight: "NO", sym: "N", eTransferred: 3, oLeft: 3, oRight: 1, hLeft: 0, hRight: 0 },
    { eqLeft: "ClO₃⁻", eqRight: "Cl⁻", sym: "Cl", eTransferred: 6, oLeft: 3, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "SO₄²⁻", eqRight: "SO₂", sym: "S", eTransferred: 2, oLeft: 4, oRight: 2, hLeft: 0, hRight: 0 },
    { eqLeft: "CrO₄²⁻", eqRight: "Cr³⁺", sym: "Cr", eTransferred: 3, oLeft: 4, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "IO₃⁻", eqRight: "I⁻", sym: "I", eTransferred: 6, oLeft: 3, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "MnO₂", eqRight: "Mn²⁺", sym: "Mn", eTransferred: 2, oLeft: 2, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "H₂O₂", eqRight: "2H₂O", sym: "O", eTransferred: 2, oLeft: 2, oRight: 2, hLeft: 2, hRight: 4 },
    { eqLeft: "BrO₃⁻", eqRight: "Br⁻", sym: "Br", eTransferred: 6, oLeft: 3, oRight: 0, hLeft: 0, hRight: 0 },
    { eqLeft: "Ag⁺", eqRight: "Ag", sym: "Ag", eTransferred: 1, oLeft: 0, oRight: 0, hLeft: 0, hRight: 0 }
  ]
};

/* ============================================================
   🧠 3. MOTOR PROCEDURAL Y VALIDACIÓN (FUNCIONES PURAS)
============================================================ */

const calculateMCM = (a, b) => {
  if (!a || !b) return 1; 
  const gcd = (x, y) => (!y ? x : gcd(y, x % y));
  return (a * b) / gcd(a, b);
};

const generateLevelData = () => {
  let env = "Ácido";
  let reducer, oxidizer;
  let targetE, cRed, cOx, totalOLeft, totalORight, reqH2O, totalHLeft, totalHRight, reqH, reqOH;
  let validReactionFound = false;
  let failsafe = 0;

  while (!validReactionFound && failsafe < 300) {
      env = Math.random() > 0.5 ? "Ácido" : "Básico";
      reducer = HALF_REACTIONS.reducers[Math.floor(Math.random() * HALF_REACTIONS.reducers.length)];
      oxidizer = HALF_REACTIONS.oxidizers[Math.floor(Math.random() * HALF_REACTIONS.oxidizers.length)];
      
      if (reducer.sym === oxidizer.sym) { failsafe++; continue; }

      targetE = calculateMCM(reducer.eTransferred, oxidizer.eTransferred);
      cRed = targetE / reducer.eTransferred; 
      cOx  = targetE / oxidizer.eTransferred; 

      totalOLeft = (reducer.oLeft * cRed) + (oxidizer.oLeft * cOx);
      totalORight = (reducer.oRight * cRed) + (oxidizer.oRight * cOx);
      reqH2O = Math.abs(totalOLeft - totalORight);

      totalHLeft = (reducer.hLeft * cRed) + (oxidizer.hLeft * cOx);
      totalHRight = (reducer.hRight * cRed) + (oxidizer.hRight * cOx);
      
      if (totalOLeft > totalORight) totalHRight += (reqH2O * 2);
      else if (totalORight > totalOLeft) totalHLeft += (reqH2O * 2);

      let diffH = Math.abs(totalHLeft - totalHRight);

      // Filtro God Tier: La ecuación debe obligar al uso de masa (agua/iones) y electrones.
      if (reqH2O > 0 && diffH > 0 && (cRed > 1 || cOx > 1)) {
          validReactionFound = true;
      }
      failsafe++;
  }

  if (!validReactionFound) {
      reducer = HALF_REACTIONS.reducers[1]; // Fe2+
      oxidizer = HALF_REACTIONS.oxidizers[2]; // Cr2O7 2-
      env = "Ácido";
  }

  targetE = calculateMCM(reducer.eTransferred, oxidizer.eTransferred);
  cRed = targetE / reducer.eTransferred; 
  cOx  = targetE / oxidizer.eTransferred; 

  totalOLeft = (reducer.oLeft * cRed) + (oxidizer.oLeft * cOx);
  totalORight = (reducer.oRight * cRed) + (oxidizer.oRight * cOx);
  
  reqH2O = 0;
  if (totalOLeft > totalORight) reqH2O = totalOLeft - totalORight; 
  else if (totalORight > totalOLeft) reqH2O = totalORight - totalOLeft; 

  totalHLeft = (reducer.hLeft * cRed) + (oxidizer.hLeft * cOx);
  totalHRight = (reducer.hRight * cRed) + (oxidizer.hRight * cOx);
  
  if (totalOLeft > totalORight) totalHRight += (reqH2O * 2);
  else if (totalORight > totalOLeft) totalHLeft += (reqH2O * 2);

  reqH = 0;
  reqOH = 0;

  if (env === "Ácido") { reqH = Math.abs(totalHLeft - totalHRight); } 
  else { reqOH = Math.abs(totalHLeft - totalHRight); reqH2O += reqOH; }

  return {
    eq: `${reducer.eqLeft} + ${oxidizer.eqLeft} ➔ ${reducer.eqRight} + ${oxidizer.eqRight}`,
    hOx: `${reducer.eqLeft} ➔ ${reducer.eqRight} + ${reducer.eTransferred}e⁻`,
    hRed: `${oxidizer.eqLeft} + ${oxidizer.eTransferred}e⁻ ➔ ${oxidizer.eqRight}`,
    eOx: reducer.eTransferred,
    eRed: oxidizer.eTransferred,
    symOx: reducer.sym,
    symRed: oxidizer.sym,
    cOx: cRed, 
    cRed: cOx, 
    env: env,
    ansH2O: reqH2O,
    ansH: reqH,
    ansOH: reqOH,
    oLeft: totalOLeft,
    oRight: totalORight,
    hLeftInit: totalHLeft,
    hRightInit: totalHRight,
    rawReducer: reducer,
    rawOxidizer: oxidizer
  };
};

const validateRedoxSubmission = (c1, c2, cH2O, cH, cOH, levelData) => {
  if (!levelData) return { isBalanced: false, errorType: "ERROR", hintId: "" };
  
  const eLostTotal = c1 * levelData.eOx;
  const eGainedTotal = c2 * levelData.eRed;
  const isChargeBalanced = eLostTotal === eGainedTotal;
  const isSimplified = c1 === levelData.cOx && c2 === levelData.cRed;

  const isH2OBalanced = cH2O === levelData.ansH2O;
  const isHBalanced = cH === levelData.ansH;
  const isOHBalanced = cOH === levelData.ansOH;
  const isMassBalanced = isH2OBalanced && isHBalanced && isOHBalanced;
  
  const isBalanced = isChargeBalanced && isSimplified && isMassBalanced;

  let errorType = "NONE";
  let hintId = "";
  
  if (!isBalanced) {
      if (!isMassBalanced) {
          errorType = !isH2OBalanced ? "H2O_IMBALANCE" : "ION_IMBALANCE";
          hintId = !isH2OBalanced ? (cH2O < levelData.ansH2O ? "h2oAdd" : "h2oSub") : (levelData.env === "Ácido" ? (cH < levelData.ansH ? "acidAdd" : "acidSub") : (cOH < levelData.ansOH ? "basicAdd" : "basicSub"));
      } else if (eLostTotal !== eGainedTotal) {
          errorType = eLostTotal > eGainedTotal ? "EXCESS_LOST" : "DEFICIT_LOST";
          hintId = eLostTotal > eGainedTotal ? "eLostWhy" : "eGainedWhy";
      } else if (!isSimplified) {
          errorType = "NOT_SIMPLIFIED"; 
          hintId = "simplifyWhy";
      } 
  }

  return { isBalanced, eLostTotal, eGainedTotal, eDiff: Math.abs(eLostTotal - eGainedTotal), errorType, isMassBalanced, hintId };
};

/* ============================================================
   🌍 4. DICCIONARIOS EDUCATIVOS (TODAS LAS FASES GOD TIER)
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR NÚCLEO PROCEDURAL", title: "THE OMNISCIENT BALANCER", rank: "RANGO", xp: "XP", 
      theoryTitle: "BRIEFING TÁCTICO DE LA IA", theoryBtn: "ENTENDIDO. ACCEDER AL SISTEMA ➔", diagTitle: "ANÁLISIS IA EN CURSO", 
      btnCheck: "VERIFICAR MASA Y CARGA", btnBack: "⬅ ABORTAR MISIÓN", btnNext: "GENERAR NUEVA REACCIÓN ➔", 
      btnRetry: "REINICIAR NÚCLEO", aiTitle: "🤖 TUTOR SOCRÁTICO", btnContinue: "ENTENDIDO, CORREGIRÉ", 
      react: "AGENTE REDUCTOR (Se Oxida)", prod: "AGENTE OXIDANTE (Se Reduce)",
      mission: "MISIÓN PROCEDURAL ASIGNADA:", scan: "VISOR DE ESPECTROMETRÍA", status: "ESTADO DEL NÚCLEO:",
      explTitle: "¡COLAPSO ESTRUCTURAL!", explMsg: "La descompensación masiva de electrones provocó una fisión cuántica.",
      statsTitle: "TELEMETRÍA AVANZADA", timeTaken: "Tiempo", clicksUsed: "Ajustes", 
      successTitle: "¡SISTEMA ESTABILIZADO!", successMessage: "La masa y la carga han alcanzado el equilibrio cuántico perfecto.",
      hintBtn: "💡 MANUAL DE TELEMETRÍA", aiBtn: "🆘 ASISTENCIA IA", helpBtn: "❓ AYUDA ALGEBRAICA", 
      guideTitle: "SENTINEL PROTOCOL (CONTABILIDAD ATÓMICA EN VIVO):",
      helpSummary: "MATRIZ DE TELEMETRÍA Y JUSTIFICACIÓN MATEMÁTICA",
      level: "NIVEL", env: "MEDIO DE REACCIÓN", closeHelp: "CERRAR MANUAL DE AYUDA",
      oxidation: "ESPECTRO DE OXIDACIÓN", reduction: "ESPECTRO DE REDUCCIÓN",
      concept: "CONCEPTO QUÍMICO", yourState: "TU CONFIG.", required: "MATRIZ EXIGE", action: "👉 ACCIÓN", why: "🧠 EXPLICACIÓN FÍSICO-QUÍMICA",
      h2o: "Agua (H₂O)", hPlus: "Protones (H⁺)", ohMinus: "Hidroxilos (OH⁻)",
      eLost: "Electrones Cedidos", eGained: "Electrones Recibidos",
      pressPlus: "Ingresa", pressMinus: "Reduce a", times: "unidades", perfect: "Perfecto ✅",
      adjustRed: "Ajusta el Reductor", adjustOx: "Ajusta el Oxidante", eqTo: "Igualar a",
      theoryText: "BIENVENIDO AL NÚCLEO. A partir de este momento, cada nivel es generado por IA. No intentes adivinar; deduce la respuesta leyendo el Sentinel Protocol (Panel Izquierdo). Te enseñará exactamente de dónde proviene cada átomo y electrón en tu ecuación.",
      voiceInit: "Iniciando análisis espectrométrico.", voiceSuccess: "Perfecto. Sistema estabilizado.", voiceFail: "Ecuación inestable. Revisa la telemetría.", closeScan: "DESACTIVAR VISOR",
      hints: {
          h2oAdd: "Falta oxígeno. Revisa tu contabilidad atómica de reactivos vs productos. Usa agua para inyectar oxígeno.",
          h2oSub: "Exceso de oxígeno. Tienes más agua de la que las moléculas base justifican.",
          acidAdd: "El agua introdujo hidrógenos al reactor. Estamos en medio ácido, usa H⁺ para compensar.",
          acidSub: "Has introducido demasiados protones libres (H⁺) y alterado el pH del sistema.",
          basicAdd: "El agua introdujo hidrógenos. En medio básico no hay H⁺. Usa iones Hidroxilo (OH⁻).",
          basicSub: "La solución es peligrosamente alcalina. Reduce los iones OH⁻.",
          eLostWhy: "El reductor no está cediendo suficientes electrones. Multiplica para alcanzar el MCM.",
          eGainedWhy: "El oxidante no está absorbiendo suficientes electrones. Multiplica para alcanzar el MCM.",
          simplifyWhy: "La ecuación está balanceada pero no simplificada. Divide todos los números por su divisor común."
      },
      guide: {
          phase1Add: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[FASE 1: CONSERVACIÓN DE LA MASA (OXÍGENO)]\n\n👨‍🏫 CONTABILIDAD ACTUAL:\n• Reactivos: (${c1}×${red.oLeft} O) + (${c2}×${ox.oLeft} O) = ${totalL} Oxígenos\n• Productos: (${c1}×${red.oRight} O) + (${c2}×${ox.oRight} O) = ${totalR} Oxígenos\n\n📉 ANÁLISIS FÍSICO:\nEcuación de déficit: |${totalL} - ${totalR}| = Faltan ${ansH2O} átomos de Oxígeno.\nTú has ingresado: ${cH2O} H₂O.\nTe faltan inyectar: ${diff} H₂O.\n\n💡 LEY DE LAVOISIER:\nLa materia no se crea ni se destruye. En soluciones acuosas, el Oxígeno proviene exclusivamente de las moléculas de Agua (H₂O).\n\n👉 ACCIÓN TÁCTICA: Inyecta las ${diff} moléculas de H₂O restantes en el panel central.`,
          
          phase1Sub: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[FASE 1: ALERTA DE MASA (OXÍGENO)]\n\n👨‍🏫 CONTABILIDAD ACTUAL:\n• Reactivos exigen: ${totalL} O\n• Productos exigen: ${totalR} O\n• Requerimiento real: ${ansH2O} H₂O.\n\n📉 ANÁLISIS FÍSICO:\nHas introducido ${cH2O} moléculas de agua. Esto es un exceso matemático.\nLos átomos no pueden inventarse.\n\n👉 ACCIÓN TÁCTICA: Reduce ${diff} moléculas de H₂O para no romper la Ley de Lavoisier.`,
          
          phase2AcidAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[FASE 2: EQUILIBRIO PROTÓNICO (ÁCIDO)]\n\n👨‍🏫 EFECTO MARIPOSA EN HIDRÓGENOS:\nAl inyectar ${cH2O} H₂O en la Fase 1, añadiste matemáticamente ${cH2O * 2} átomos de Hidrógeno extras.\n\n🔬 CONTABILIDAD DE HIDRÓGENOS:\n• Lado Reactivos: (${c1}×${red.hLeft}) + (${c2}×${ox.hLeft}) = ${totalL} H\n• Lado Productos (sumando el H₂O actual) = ${totalR} H\n\n📉 ANÁLISIS FÍSICO:\nLa diferencia absoluta requiere ${req} Hidrógenos. Tienes ${cH} H⁺. Faltan ${diff}.\n\n💡 LÓGICA DE BRØNSTED-LOWRY:\nUn medio "Ácido" contiene infinitos protones libres (H⁺). Los usamos como pesas atómicas para restaurar la masa sin afectar la molécula principal.\n\n👉 ACCIÓN TÁCTICA: Inyecta ${diff} ión(es) H⁺ en el panel naranja.`,
          
          phase2AcidSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[FASE 2: ALERTA DE CARGA (ÁCIDO)]\n\n👨‍🏫 SOBRECARGA DETECTADA:\nLa matriz demanda exactamente ${req} Hidrógenos para balancear el agua (${cH2O} H₂O).\nHas introducido ${cH} protones libres (H⁺).\n\n📉 ANÁLISIS FÍSICO:\nExceso de ${diff} protones. Esto acidifica el reactor y provoca una falla térmica.\n\n👉 ACCIÓN TÁCTICA: Reduce ${diff} ión(es) H⁺ en el panel naranja.`,
          
          phase2BasicAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[FASE 2: EQUILIBRIO ALCALINO (BÁSICO)]\n\n👨‍🏫 EFECTO MARIPOSA EN HIDRÓGENOS:\nLa adición de agua ha generado un desfase de ${req} átomos de Hidrógeno.\nTienes ${cOH} OH⁻. Faltan ${diff}.\n\n💡 LÓGICA QUÍMICA AVANZADA:\nEn un medio "Básico", los protones libres (H⁺) se desintegran. Matemáticamente engañamos a la ecuación: forzamos la creación de agua que deja como rastro exactamente la misma cantidad de iones Hidroxilo (OH⁻).\n\n👉 ACCIÓN TÁCTICA: Inyecta ${diff} iones OH⁻ en el panel magenta.`,
          
          phase2BasicSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[FASE 2: ALERTA DE CARGA (BÁSICO)]\n\n👨‍🏫 SOBRECARGA ALCALINA:\nLa matriz requiere ${req} OH⁻, pero has introducido ${cOH}.\n\n📉 ANÁLISIS FÍSICO:\nTienes un exceso inestable de ${diff} Hidroxilos.\n\n👉 ACCIÓN TÁCTICA: Reduce ${diff} iones OH⁻ para estabilizar el pH de la matriz.`,
          
          phase3: (c1, c2, red, ox, eL, eG, mcm, rc1, rc2) => `[FASE 3: FLUJO TERMODINÁMICO DE ENERGÍA (ELECTRONES)]\n\n👨‍🏫 ESTADO ACTUAL DE TRANSFERENCIA:\nLa masa de los átomos ya cuadra. Ahora analicemos la energía invisible (e⁻):\n\n• AGENTE REDUCTOR (Izquierda):\n  Por su naturaleza, esta molécula cede ${red.eTransferred}e⁻ al oxidarse.\n  Cálculo: [Tu Input: ${c1}] molécula(s) × ${red.eTransferred}e⁻ = ${eL}e⁻ cedidos al vacío.\n\n• AGENTE OXIDANTE (Derecha):\n  Esta molécula necesita absorber ${ox.eTransferred}e⁻ para reducirse.\n  Cálculo: [Tu Input: ${c2}] molécula(s) × ${ox.eTransferred}e⁻ = ${eG}e⁻ absorbidos.\n\n📉 ANÁLISIS DE FALLA:\n¡Peligro! Tienes ${eL}e⁻ flotando frente a ${eG}e⁻ requeridos. La Primera Ley de la Termodinámica dicta que la energía no se destruye. Los e⁻ cedidos DEBEN ser exactamente iguales a los e⁻ absorbidos.\n\n💡 LA SOLUCIÓN (MÍNIMO COMÚN MÚLTIPLO):\nNo podemos romper las moléculas, así que multiplicamos su cantidad. Buscamos el MCM entre ${red.eTransferred} y ${ox.eTransferred}, que nos da un puente energético de ${mcm}e⁻ compartidos.\n\n👉 ACCIÓN TÁCTICA:\nCruza los coeficientes multiplicadores para alcanzar el MCM (${mcm}).\nAjusta tu Agente Reductor a ${rc1} y tu Agente Oxidante a ${rc2}.`,
          
          phase4: `[FASE 4: ESTÁNDAR GLOBAL IUPAC]\n\n👨‍🏫 ¡Matemática atómica y termodinámica perfectas!\nSin embargo, la comunidad científica internacional exige que la proporción de las moléculas se exprese en los números enteros más pequeños posibles para su publicación.\n\n👉 ACCIÓN FINAL: Divide TODOS tus números (paneles de reactivos, agua e iones) por su máximo común divisor hasta que la fracción sea irreductible.`,
          
          phase5: `[FASE 5: SISTEMA EN EQUILIBRIO ABSOLUTO]\n\n✅ Excelente. La topografía cuántica de la masa y el flujo de energía termodinámica operan en perfecta armonía matemática.\n\n👉 ACCIÓN FINAL: Presiona el botón verde luminoso "VERIFICAR MASA Y CARGA" en el panel inferior para confirmar la estabilización del reactor.`
      },
      aiQ: {
          h2o_q: "Asistencia Activa: Termodinámicamente, ¿por qué inyectamos agua para balancear el oxígeno?", h2o_o: ["Para diluir la solución", "Porque es la única fuente de masa atómica disponible"], h2o_m: "La materia no desaparece (Ley de Lavoisier). Balanceamos tomando Oxígeno de las moléculas de agua del entorno.",
          acid_q: "Asistencia Activa: El entorno es Ácido. ¿Qué partícula abunda en este líquido?", acid_o: ["Electrones Libres (e⁻)", "Protones Libres (H⁺)"], acid_m: "Según Brønsted-Lowry, un ácido dona protones. Usamos esa abundancia infinita de H⁺ para restaurar la masa matemática.",
          basic_q: "Asistencia Activa: En un reactor Básico, los protones (H⁺) no existen libres. ¿Cómo nivelamos el hidrógeno?", basic_o: ["Usando Hidroxilos (OH⁻) y formando agua", "Añadiendo gas hidrógeno (H₂)"], basic_m: "En medios alcalinos, combinando la inyección de moléculas de agua en un lado y OH⁻ en el otro, logramos balancear sin H⁺.",
          elec_q: (mcm) => `Alerta de Energía: ¿A qué número cuántico de electrones deben converger ambos reactivos?`, elec_o: (mcm) => [`Al Mínimo Común Múltiplo (${mcm}e⁻)`, "A la suma de sus masas"], elec_m: (mcm) => `Los electrones no flotan en el vacío. Tienes que cruzar los multiplicadores hasta alcanzar los ${mcm} electrones compartidos.`,
          simp_q: "El motor rechaza tu ecuación aunque los átomos cuadran. ¿Por qué?", simp_o: ["Falla en la masa atómica", "No está en su proporción más pequeña"], simp_m: "La IUPAC exige siempre fracciones irreductibles. Divide todos tus números por el divisor común."
      }
  },
  en: {
      start: "START PROCEDURAL GENERATOR", title: "THE OMNISCIENT BALANCER", rank: "RANK", xp: "XP", 
      theoryTitle: "TACTICAL MISSION BRIEFING", theoryBtn: "UNDERSTOOD. STABILIZE SYSTEM ➔", diagTitle: "AI ANALYSIS IN PROGRESS", 
      btnCheck: "VERIFY MASS & CHARGE", btnBack: "⬅ ABORT MISSION", btnNext: "GENERATE NEW REACTION ➔", 
      btnRetry: "REBOOT CORE", aiTitle: "🤖 SOCRATIC TUTOR", btnContinue: "UNDERSTOOD, I WILL CORRECT", 
      react: "REDUCING AGENT (Oxidizes)", prod: "OXIDIZING AGENT (Reduces)",
      mission: "PROCEDURAL MISSION ASSIGNED:", scan: "SPECTROMETRY SCANNER", status: "CORE STATUS:",
      explTitle: "STRUCTURAL COLLAPSE!", explMsg: "Massive electron imbalance caused quantum fission.",
      statsTitle: "ADVANCED TELEMETRY", timeTaken: "Elapsed Time", clicksUsed: "Adjustments Made", 
      successTitle: "SYSTEM STABILIZED!", successMessage: "Mass and charge have reached perfect equilibrium.",
      hintBtn: "💡 TELEMETRY MANUAL", aiBtn: "🆘 AI ASSISTANCE", helpBtn: "❓ ALGEBRAIC HELP", 
      guideTitle: "SENTINEL PROTOCOL (LIVE ATOMIC ACCOUNTING):",
      helpSummary: "TELEMETRY MATRIX AND MATHEMATICAL JUSTIFICATION",
      level: "LEVEL", env: "REACTION ENVIRONMENT", closeHelp: "CLOSE TELEMETRY MANUAL",
      oxidation: "OXIDATION SPECTRUM", reduction: "REDUCTION SPECTRUM",
      concept: "CHEMICAL CONCEPT", yourState: "YOUR CONFIG.", required: "MATRIX DEMANDS", action: "👉 ACTION", why: "🧠 PHYSICOCHEMICAL LOGIC",
      h2o: "Water (H₂O)", hPlus: "Protons (H⁺)", ohMinus: "Hydroxyls (OH⁻)",
      eLost: "Yielded Electrons", eGained: "Absorbed Electrons",
      pressPlus: "Enter", pressMinus: "Reduce to", times: "units", perfect: "Perfect ✅",
      adjustRed: "Adjust Reducing Agent", adjustOx: "Adjust Oxidizing Agent", eqTo: "Equalize to",
      theoryText: "WELCOME TO THE CORE. From now on, each level is unique, generated via Procedural AI. Do not guess or memorize; deduce the answer reading the Sentinel Protocol (Left Panel), which breaks down the exact math in real-time.",
      voiceInit: "Initiating spectrometry analysis.", voiceSuccess: "System stabilized.", voiceFail: "Unstable equation. Check telemetry.", closeScan: "DEACTIVATE SCANNER",
      hints: {
          h2oAdd: "Reactants and Products differ in Oxygen. Matter doesn't disappear, compensate by injecting water.",
          h2oSub: "You introduced more water than stoichiometry requires.",
          acidAdd: "Injected water added hydrogens. In an acidic reactor, use abundant free protons (H⁺) to balance.",
          acidSub: "Excess free protons detected. Adjust the variable.",
          basicAdd: "Water altered Hydrogen. In Basic there are no free H⁺. We trick the system by forming water that leaves OH⁻ ions.",
          basicSub: "System is dangerously alkaline. Purge them.",
          eLostWhy: "Thermodynamics: Cross multiply to find the LCM between yielded and gained electrons. None should be lost.",
          eGainedWhy: "Adjust the Oxidizing Agent to ensure it absorbs the exact amount of energy released by the Reducer.",
          simplifyWhy: "You must divide all numbers by their common divisor."
      },
      guide: {
          phase1Add: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: MASS CONSERVATION (OXYGEN)]\n\n👨‍🏫 CURRENT ACCOUNTING:\n• Reactants: (${c1}×${red.oLeft} O) + (${c2}×${ox.oLeft} O) = ${totalL} Oxygens\n• Products: (${c1}×${red.oRight} O) + (${c2}×${ox.oRight} O) = ${totalR} Oxygens\n\n📉 PHYSICAL RESULT:\nEquation: |${totalL} - ${totalR}| = Missing ${ansH2O} Oxygen atoms.\nYou entered: ${cH2O} H₂O.\nMissing to inject: ${diff} H₂O.\n\n💡 LAVOISIER'S LAW:\nMatter is not created from nothing. In aqueous chemistry, Water (H₂O) is the only valid source to extract oxygen.\n\n👉 TACTICAL ACTION: Inject the remaining ${diff} H₂O molecules in the center panel.`,
          
          phase1Sub: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: MASS ALERT (OXYGEN)]\n\n👨‍🏫 CURRENT ACCOUNTING:\n• Reactants require: ${totalL} O\n• Products require: ${totalR} O\n• Real requirement: ${ansH2O} H₂O.\n\n📉 PHYSICAL RESULT:\nYou introduced ${cH2O} water molecules. This is a mathematical excess.\nAtoms cannot be invented.\n\n👉 TACTICAL ACTION: Reduce ${diff} H₂O molecules to not break Lavoisier's Law.`,
          
          phase2AcidAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: PROTONIC EQUILIBRIUM (ACID)]\n\n👨‍🏫 BUTTERFLY EFFECT ON HYDROGEN:\nBy injecting ${cH2O} H₂O in Phase 1, you added ${cH2O * 2} extra Hydrogen atoms.\n\n🔬 HYDROGEN ACCOUNTING:\n• Reactants side: (${c1}×${red.hLeft}) + (${c2}×${ox.hLeft}) = ${totalL} H\n• Products side (adding current water) = ${totalR} H\n\n📉 PHYSICAL RESULT:\nThe absolute difference requires ${req} Hydrogens. You have ${cH} H⁺. Missing ${diff}.\n\n💡 BRØNSTED-LOWRY LOGIC:\nAn "Acidic" medium contains infinite free protons (H⁺). Use them as atomic weights to restore mass without affecting the main molecule.\n\n👉 TACTICAL ACTION: Inject ${diff} H⁺ ion(s) in the orange panel.`,
          
          phase2AcidSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: CHARGE ALERT (ACID)]\n\n👨‍🏫 OVERLOAD DETECTED:\nThe matrix demands exactly ${req} Hydrogens to balance the water (${cH2O} H₂O).\nYou introduced ${cH} free protons (H⁺).\n\n📉 PHYSICAL RESULT:\nExcess of ${diff} protons. This acidifies the reactor and causes thermal failure.\n\n👉 TACTICAL ACTION: Reduce ${diff} H⁺ ion(s) in the orange panel.`,
          
          phase2BasicAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: ALKALINE EQUILIBRIUM (BASIC)]\n\n👨‍🏫 BUTTERFLY EFFECT ON HYDROGEN:\nThe water addition created a shift of ${req} Hydrogen atoms.\nYou have ${cOH} OH⁻. Missing ${diff}.\n\n💡 ADVANCED CHEMISTRY LOGIC:\nIn a "Basic" medium, free protons (H⁺) disintegrate. Mathematically we trick the equation: we force water creation leaving exactly the same amount of Hydroxyl ions (OH⁻).\n\n👉 TACTICAL ACTION: Inject ${diff} OH⁻ ions in the magenta panel.`,
          
          phase2BasicSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: CHARGE ALERT (BASIC)]\n\n👨‍🏫 ALKALINE OVERLOAD:\nThe matrix requires ${req} OH⁻, but you entered ${cOH}.\n\n📉 PHYSICAL RESULT:\nYou have an unstable excess of ${diff} Hydroxyls.\n\n👉 TACTICAL ACTION: Reduce ${diff} OH⁻ ions to stabilize the matrix pH.`,
          
          phase3: (c1, c2, red, ox, eL, eG, mcm, rc1, rc2) => `[PHASE 3: THERMODYNAMIC ENERGY FLOW (ELECTRONS)]\n\n👨‍🏫 CURRENT TRANSFER STATUS:\nAtomic mass is balanced. Now let's analyze the invisible energy (e⁻):\n\n• REDUCING AGENT (Left):\n  By nature, this molecule yields ${red.eTransferred}e⁻ upon oxidation.\n  Math: [Your Input: ${c1}] molecule(s) × ${red.eTransferred}e⁻ = ${eL}e⁻ yielded to vacuum.\n\n• OXIDIZING AGENT (Right):\n  This molecule needs to absorb ${ox.eTransferred}e⁻ to reduce.\n  Math: [Your Input: ${c2}] molecule(s) × ${ox.eTransferred}e⁻ = ${eG}e⁻ absorbed.\n\n📉 FAILURE ANALYSIS:\nDanger! You have ${eL}e⁻ floating vs ${eG}e⁻ required. The First Law of Thermodynamics dictates energy is not destroyed. Yielded e⁻ MUST perfectly equal absorbed e⁻.\n\n💡 THE SOLUTION (LEAST COMMON MULTIPLE):\nWe cannot break molecules, so we multiply their quantity. We find the LCM between ${red.eTransferred} and ${ox.eTransferred}, giving us an energy bridge of ${mcm} shared e⁻.\n\n👉 TACTICAL ACTION:\nCross-multiply coefficients to reach the LCM (${mcm}).\nSet Reducer to ${rc1} and Oxidizer to ${rc2}.`,
          
          phase4: `[PHASE 4: IUPAC GLOBAL STANDARD]\n\n👨‍🏫 Perfect atomic math and energy!\nHowever, the global scientific community demands that molecule ratios be expressed in the lowest possible integers for publication.\n\n👉 FINAL ACTION: Divide ALL your current numbers (reactants, water, ions) by their greatest common divisor until the fraction is irreducible.`,
          
          phase5: `[PHASE 5: ABSOLUTE EQUILIBRIUM SYSTEM]\n\n✅ Excellent. Quantum topography and thermodynamic energy flow operate in perfect mathematical harmony.\n\n👉 FINAL ACTION: Press the glowing green "VERIFY MASS & CHARGE" button in the lower panel to confirm reactor ignition.`
      },
      aiQ: {
          h2o_q: "Active Assist: Thermodynamically, why do we inject water to balance oxygen?", h2o_o: ["To dilute the solution", "Because it is the only valid mass source"], h2o_m: "Matter doesn't disappear (Lavoisier). We balance taking Oxygen from surrounding water molecules.",
          acid_q: "Active Assist: Acidic environment. What particle plagues this liquid?", acid_o: ["Free Electrons (e⁻)", "Free Protons (H⁺)"], acid_m: "Per Brønsted-Lowry, an acid donates protons. We use abundant H⁺ to restore math mass.",
          basic_q: "Active Assist: In a Basic reactor, free H⁺ don't exist. How do we level hydrogen?", basic_o: ["Using Hydroxyls (OH⁻) forming water", "Adding hydrogen gas (H₂)"], basic_m: "In alkaline media, combining water injection on one side and OH⁻ on the other, we balance without H⁺.",
          elec_q: (mcm) => `Energy Alert: To what quantum number of electrons must both reactants converge?`, elec_o: (mcm) => [`To the Least Common Multiple (${mcm}e⁻)`, "To the sum of their masses"], elec_m: (mcm) => `Electrons don't float in vacuum. Cross multipliers to reach ${mcm} shared electrons.`,
          simp_q: "The engine rejects your equation despite atomic balance. Why?", simp_o: ["Atomic mass failure", "Not in its smallest proportion"], simp_m: "IUPAC always demands irreducible fractions. Divide all your numbers by the common divisor."
      }
  },
  fr: {
      start: "DÉMARRER LE NOYAU PROCÉDURAL", title: "L'ÉQUILIBREUR OMNISCIENT", rank: "RANG", xp: "XP", 
      theoryTitle: "BRIEFING TACTIQUE DE L'IA", theoryBtn: "COMPRIS. STABILISER LE SYSTÈME ➔", diagTitle: "ANALYSE DE L'IA EN COURS", 
      btnCheck: "VÉRIFIER LA MASSE ET LA CHARGE", btnBack: "⬅ ABANDONNER LA MISSION", btnNext: "GÉNÉRER UNE NOUVELLE RÉACTION ➔", 
      btnRetry: "REDÉMARRER LE NOYAU", aiTitle: "🤖 TUTEUR SOCRATIQUE", btnContinue: "COMPRIS, JE VAIS CORRIGER", 
      react: "AGENT RÉDUCTEUR (S'oxyde)", prod: "AGENT OXYDANT (Se Réduit)",
      mission: "MISSION PROCÉDURALE ASSIGNÉE :", scan: "SCANNER SPECTROMÉTRIQUE", status: "ÉTAT DU NOYAU :",
      explTitle: "EFFONDREMENT STRUCTUREL !", explMsg: "Le déséquilibre électronique massif a provoqué une fission quantique.",
      statsTitle: "TÉLÉMÉTRIE AVANCÉE", timeTaken: "Temps écoulé", clicksUsed: "Ajustements effectués", 
      successTitle: "SYSTÈME STABILISÉ !", successMessage: "La masse et la charge ont atteint un équilibre quantique parfait.",
      hintBtn: "💡 MANUEL DE TÉLÉMÉTRIE", aiBtn: "🆘 ASSISTANCE IA", helpBtn: "❓ AIDE ALGÉBRIQUE", 
      guideTitle: "PROTOCOLE SENTINELLE (COMPTABILITÉ ATOMIQUE) :",
      helpSummary: "MATRICE DE TÉLÉMÉTRIE ET JUSTIFICATION MATHÉMATIQUE",
      level: "NIVEAU", env: "MILIEU DE RÉACTION", closeHelp: "FERMER LE MANUEL",
      oxidation: "SPECTRE D'OXYDATION", reduction: "SPECTRE DE RÉDUCTION",
      concept: "CONCEPT CHIMIQUE", yourState: "VOTRE CONFIG.", required: "EXIGENCES MATRICE", action: "👉 ACTION", why: "🧠 LOGIQUE PHYSICOCHIMIQUE",
      h2o: "Eau (H₂O)", hPlus: "Protons (H⁺)", ohMinus: "Hydroxyles (OH⁻)",
      eLost: "Électrons Cédés", eGained: "Électrons Absorbés",
      pressPlus: "Entrer", pressMinus: "Réduire à", times: "unités", perfect: "Parfait ✅",
      adjustRed: "Ajuster le Réducteur", adjustOx: "Ajuster l'Oxydant", eqTo: "Égaliser à",
      theoryText: "BIENVENUE DANS LE NOYAU. Chaque niveau est généré par une IA. Déduisez la réponse en lisant le Protocole Sentinelle qui décompose les mathématiques exactes en temps réel.",
      voiceInit: "Lancement de l'analyse spectrométrique.", voiceSuccess: "Équilibre parfait atteint.", voiceFail: "Équation instable. Vérifiez la télémétrie.", closeScan: "DÉSACTIVER LE SCANNER",
      hints: {
          h2oAdd: "Oxygène manquant. L'eau (H₂O) est la source.", h2oSub: "Excès d'eau.", acidAdd: "Utilisez l'abondance de protons (H⁺) pour équilibrer la masse en milieu acide.", acidSub: "Excès de protons libres.", basicAdd: "En milieu basique, nous trompons le système en formant de l'eau qui laisse des ions OH⁻.", basicSub: "Système dangereusement alcalin.", eLostWhy: "Le PPCM des électrons cédés et gagnés doit être atteint.", eGainedWhy: "Ajustez l'oxydant pour qu'il absorbe l'énergie du réducteur.", simplifyWhy: "L'IUPAC exige les fractions irréductibles."
      },
      guide: {
          phase1Add: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: MASSE (OXYGÈNE)]\n👨‍🏫 COMPTABILITÉ:\nRéactifs: ${totalL}O. Produits: ${totalR}O.\nDifférence globale: ${ansH2O} H₂O nécessaires.\nIl vous manque ${diff} H₂O à injecter.\n👉 ACTION: Entrez ${diff} H₂O.`,
          phase1Sub: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: ALERTE DE MASSE]\nExcès de ${diff} molécules d'eau détecté par rapport au besoin mathématique de ${ansH2O}.\n👉 ACTION: Réduisez H₂O.`,
          phase2AcidAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: PROTONS (ACIDE)]\n👨‍🏫 EFFET PAPILLON:\nL'eau a ajouté des hydrogènes. Besoin total: ${req} H⁺. Vous avez ${cH}.\n📉 Manque ${diff} H⁺.\n👉 ACTION: Entrez ${diff} ion(s) H⁺.`,
          phase2AcidSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: ALERTE DE CHARGE]\nSurcharge de protons. Le système n'a besoin que de ${req}.\n👉 ACTION: Réduisez H⁺ de ${diff}.`,
          phase2BasicAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: ALCALIN (BASIQUE)]\n👨‍🏫 COMPTABILITÉ:\nDéséquilibre de ${req} Hydrogènes. Vous avez ${cOH}.\n👉 ACTION: Entrez ${diff} ions OH⁻.`,
          phase2BasicSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: ALERTE DE CHARGE]\nExcès d'ions OH⁻. Le système demande ${req}.\n👉 ACTION: Réduisez les Hydroxyles de ${diff}.`,
          phase3: (c1, c2, red, ox, eL, eG, mcm, rc1, rc2) => `[PHASE 3: ÉNERGIE TERMODYNAMIQUE]\n👨‍🏫 TRANSFERT:\n• Réducteur: [Input: ${c1}] × ${red.eTransferred}e⁻ = ${eL}e⁻ cédés.\n• Oxydant: [Input: ${c2}] × ${ox.eTransferred}e⁻ = ${eG}e⁻ absorbés.\n📉 1ère LOI (PPCM): Atteignez ${mcm}e⁻ partagés.\n👉 ACTION: Fixez Réducteur à ${rc1} et Oxydant à ${rc2}.`,
          phase4: `[PHASE 4: NORME IUPAC]\n👉 ACTION FINALE: Divisez tous vos nombres par leur plus grand commun diviseur.`,
          phase5: `[PHASE 5: SYSTÈME EN ÉQUILIBRE]\n👉 Appuyez sur VÉRIFIER LA MASSE ET LA CHARGE.`
      },
      aiQ: {
          h2o_q: "Pourquoi injectons-nous de l'eau ?", h2o_o: ["Pour noyer la réaction", "C'est la seule source d'O"], h2o_m: "La matière ne disparaît pas (Lavoisier).", acid_q: "En milieu acide, quelle particule abonde ?", acid_o: ["Électrons libres (e⁻)", "Protons (H⁺)"], acid_m: "Un acide donne des protons.", basic_q: "En réacteur basique, comment niveler l'hydrogène ?", basic_o: ["Ions OH⁻ et former l'eau", "Gaz hydrogène"], basic_m: "En combinant l'injection d'eau et de OH⁻, nous trompons le système.", elec_q: (mcm) => `À quel nombre quantique converger ?`, elec_o: (mcm) => [`Au PPCM (${mcm}e⁻)`, "À la somme"], elec_m: (mcm) => `Atteignez le PPCM exact de ${mcm} électrons partagés.`, simp_q: "Pourquoi le moteur rejette l'équation ?", simp_o: ["Masse incorrecte", "Pas la plus petite proportion"], simp_m: "L'IUPAC exige les fractions irréductibles."
      }
  },
  de: {
      start: "PROZEDURALEN KERN STARTEN", title: "DER ALLWISSENDE BALANCER", rank: "RANG", xp: "XP", 
      theoryTitle: "TAKSTISCHES KI-BRIEFING", theoryBtn: "SYSTEM STABILISIEREN ➔", diagTitle: "KI-ANALYSE LÄUFT", 
      btnCheck: "MASSE & LADUNG PRÜFEN", btnBack: "⬅ ABBRUCH", btnNext: "NÄCHSTES LEVEL ➔", 
      btnRetry: "REBOOT KERN", aiTitle: "🤖 SOKRATISCHER TUTOR", btnContinue: "VERSTANDEN", 
      react: "REDUKTIONSMITTEL (Oxidiert)", prod: "OXIDATIONSMITTEL (Reduziert)",
      mission: "PROZEDURALE MISSION:", scan: "SPEKTROMETRIE-SCANNER", status: "KERNSTATUS:",
      explTitle: "STRUKTURELLER KOLLAPS!", explMsg: "Massives Elektronenungleichgewicht.",
      statsTitle: "ERWEITERTE TELEMETRIE", timeTaken: "Verstrichene Zeit", clicksUsed: "Anpassungen", 
      successTitle: "SYSTEM STABILISIERT!", successMessage: "Perfektes Quantengleichgewicht.",
      hintBtn: "💡 TELEMETRIE-HANDBUCH", aiBtn: "🆘 KI-UNTERSTÜTZUNG", helpBtn: "❓ HILFE", 
      guideTitle: "SENTINEL-PROTOKOLL (LIVE-ATOM-BUCHHALTUNG):",
      helpSummary: "TELEMETRIE-MATRIX UND MATHEMATIK",
      level: "LEVEL", env: "UMGEBUNG", closeHelp: "SCHLIESSEN",
      oxidation: "OXIDATIONSSPEKTRUM", reduction: "REDUKTIONSSPEKTRUM",
      concept: "KONZEPT", yourState: "IHRE KONFIG.", required: "ANFORDERUNG", action: "👉 AKTION", why: "🧠 LOGIK",
      h2o: "Wasser (H₂O)", hPlus: "Protonen (H⁺)", ohMinus: "Hydroxyle (OH⁻)",
      eLost: "e⁻ Abgegeben", eGained: "e⁻ Aufgenommen",
      pressPlus: "Eingeben", pressMinus: "Reduzieren auf", times: "Einheiten", perfect: "Perfekt ✅",
      adjustRed: "Reduktionsmittel anpassen", adjustOx: "Oxidationsmittel anpassen", eqTo: "Ausgleichen auf",
      theoryText: "WILLKOMMEN IM KERN. Jedes Level wird prozedural generiert. Lesen Sie das Sentinel-Protokoll für Echtzeit-Mathematik.",
      voiceInit: "Spektrometrie-Analyse gestartet.", voiceSuccess: "System stabilisiert.", voiceFail: "Instabile Gleichung.", closeScan: "SCANNER DEAKTIVIEREN",
      hints: {
          h2oAdd: "Sauerstoff fehlt. Wasser (H₂O) liefert Sauerstoff.", h2oSub: "Überschüssiges Wasser.", acidAdd: "Nutzen Sie in saurer Umgebung die reichlich vorhandenen Protonen (H⁺).", acidSub: "Überschüssige freie Protonen.", basicAdd: "In basischem Milieu bilden wir Wasser, das OH⁻-Ionen hinterlässt.", basicSub: "System zu alkalisch.", eLostWhy: "Finden Sie das KGV zwischen den Elektronen.", eGainedWhy: "Passen Sie das Oxidationsmittel an das Reduktionsmittel an.", simplifyWhy: "IUPAC verlangt die kleinsten ganzen Zahlen."
      },
      guide: {
          phase1Add: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: MASSE]\n👨‍🏫 BUCHHALTUNG:\nReaktanten: ${totalL}O. Produkte: ${totalR}O.\nFormel: ${ansH2O} Wasser benötigt. Es fehlen ${diff}.\n👉 AKTION: ${diff} H₂O eingeben.`,
          phase1Sub: (c1, c2, red, ox, diff, totalL, totalR, ansH2O, cH2O) => `[PHASE 1: ALARM]\nÜberschüssiges Wasser. Nur ${ansH2O} benötigt.\n👉 AKTION: H₂O reduzieren.`,
          phase2AcidAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: PROTONEN (SAUER)]\n👨‍🏫 SCHMETTERLINGSEFFEKT:\nEs fehlen insgesamt ${req} H. Sie haben ${cH}.\n📉 Fehlt ${diff} H.\n👉 AKTION: ${diff} H⁺-Ionen eingeben.`,
          phase2AcidSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cH) => `[PHASE 2: ALARM]\nProtonenüberladung. Maximum ist ${req}.\n👉 AKTION: H⁺ reduzieren.`,
          phase2BasicAdd: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: ALKALISCH (BASISCH)]\n👨‍🏫 BUCHHALTUNG:\nUngleichgewicht von ${req} H. Fehlt ${diff}.\n👉 AKTION: ${diff} OH⁻-Ionen eingeben.`,
          phase2BasicSub: (cH2O, diff, totalL, totalR, c1, c2, red, ox, req, cOH) => `[PHASE 2: ALARM]\nÜberschüssige OH⁻.\n👉 AKTION: Hydroxyle reduzieren.`,
          phase3: (c1, c2, red, ox, eL, eG, mcm, rc1, rc2) => `[PHASE 3: ENERGIE]\n👨‍🏫 TRANSFER:\n• Red: [Input: ${c1}] × ${red.eTransferred}e⁻ = ${eL}e⁻\n• Ox: [Input: ${c2}] × ${ox.eTransferred}e⁻ = ${eG}e⁻\n📉 KGV = ${mcm}e⁻.\n👉 AKTION: Reduktion auf ${rc1}, Oxidation auf ${rc2}.`,
          phase4: `[PHASE 4: IUPAC]\n👉 LETZTE AKTION: Alle Zahlen durch ihren gemeinsamen Teiler teilen.`,
          phase5: `[PHASE 5: SYSTEM IM GLEICHGEWICHT]\n👉 MASSE UND LADUNG PRÜFEN drücken.`
      },
      aiQ: {
          h2o_q: "Warum Wasser injizieren?", h2o_o: ["Reaktion ertränken", "Einzige O-Quelle"], h2o_m: "Lavoisier: Materie verschwindet nicht.", acid_q: "Saures Milieu. Welches Teilchen?", acid_o: ["Freie Elektronen", "Protonen (H⁺)"], acid_m: "Wir nutzen die H⁺-Fülle.", basic_q: "Wie in basischem Milieu ausgleichen?", basic_o: ["OH⁻ injizieren", "Wasserstoffgas"], basic_m: "Wasser + OH⁻ täuscht das System.", elec_q: (mcm) => `Gegen welche Quantenzahl konvergieren?`, elec_o: (mcm) => [`KGV (${mcm}e⁻)`, "Zur Summe"], elec_m: (mcm) => `Erreichen Sie das exakte KGV von ${mcm}.`, simp_q: "Warum lehnt IUPAC ab?", simp_o: ["Massenfehler", "Nicht die kleinste Proportion"], simp_m: "Immer durch den größten gemeinsamen Teiler teilen."
      }
  }
};
const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

// EL NUEVO SENTINEL PROTOCOL V1000: Contabilidad Matemática Profunda
const getDynamicGuideText = (c1, c2, cH2O, cH, cOH, levelData, ui) => {
    if (!levelData) return "";
    const red = levelData.rawReducer;
    const ox = levelData.rawOxidizer;
    
    const totalOLeft = (c1 * red.oLeft) + (c2 * ox.oLeft);
    const totalORight = (c1 * red.oRight) + (c2 * ox.oRight);
    const requiredH2O = Math.abs(totalOLeft - totalORight);

    if (cH2O < requiredH2O) return ui.guide.phase1Add(c1, c2, red, ox, requiredH2O - cH2O, totalOLeft, totalORight, levelData.ansH2O, cH2O);
    if (cH2O > requiredH2O) return ui.guide.phase1Sub(c1, c2, red, ox, cH2O - requiredH2O, totalOLeft, totalORight, levelData.ansH2O, cH2O);

    let totalHLeft = (c1 * red.hLeft) + (c2 * ox.hLeft);
    let totalHRight = (c1 * red.hRight) + (c2 * ox.hRight);
    
    if (totalOLeft > totalORight) totalHRight += (cH2O * 2);
    else if (totalORight > totalOLeft) totalHLeft += (cH2O * 2);

    const requiredH = Math.abs(totalHLeft - totalHRight);

    if (levelData.env === "Ácido") {
        if (cH < requiredH) return ui.guide.phase2AcidAdd(cH2O, requiredH - cH, totalHLeft, totalHRight, c1, c2, red, ox, levelData.ansH, cH);
        if (cH > requiredH) return ui.guide.phase2AcidSub(cH2O, cH - requiredH, totalHLeft, totalHRight, c1, c2, red, ox, levelData.ansH, cH);
    } else {
        if (cOH < requiredH) return ui.guide.phase2BasicAdd(cH2O, requiredH - cOH, totalHLeft, totalHRight, c1, c2, red, ox, levelData.ansOH, cOH);
        if (cOH > requiredH) return ui.guide.phase2BasicSub(cH2O, cOH - requiredH, totalHLeft, totalHRight, c1, c2, red, ox, levelData.ansOH, cOH);
    }

    const eLost = c1 * red.eTransferred;
    const eGained = c2 * ox.eTransferred;
    if (eLost !== eGained) {
        const mcm = calculateMCM(red.eTransferred, ox.eTransferred);
        return ui.guide.phase3(c1, c2, red, ox, eLost, eGained, mcm, mcm / red.eTransferred, mcm / ox.eTransferred);
    }
    if (c1 !== levelData.cOx || c2 !== levelData.cRed) return ui.guide.phase4;
    return ui.guide.phase5;
};

const getSocraticAIQuestion = (c1, c2, cH2O, cH, cOH, levelData, ui) => {
    const eLost = c1 * levelData.eOx;
    const eGained = c2 * levelData.eRed;
    const ai = ui.aiQ;
    if (cH2O !== levelData.ansH2O) return { q: ai.h2o_q, o: ai.h2o_o, a: 1, m: ai.h2o_m };
    if (cH !== levelData.ansH || cOH !== levelData.ansOH) {
        if (levelData.env === "Ácido") return { q: ai.acid_q, o: ai.acid_o, a: 1, m: ai.acid_m };
        else return { q: ai.basic_q, o: ai.basic_o, a: 0, m: ai.basic_m };
    }
    if (eLost !== eGained) {
        const mcm = calculateMCM(levelData.eOx, levelData.eRed);
        return { q: ai.elec_q(mcm), o: ai.elec_o(mcm), a: 0, m: ai.elec_m(mcm) };
    }
    return { q: ai.simp_q, o: ai.simp_o, a: 1, m: ai.simp_m };
};

/* ============================================================
   🔊 5. MOTOR DE AUDIO SCI-FI (EVOLUCIONADO)
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; }
  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.gainNode = this.ctx.createGain();
          this.gainNode.gain.value = 0.15;
          this.gainNode.connect(this.ctx.destination);
        }
      } catch (e) {}
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(()=>{});
  }
  _play(type, fStart, fEnd, dur, vol = 0.1) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.gainNode);
      osc.type = type;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 432, 216, 0.15, 0.1); } 
  verify() { this._play('triangle', 528, 852, 0.4, 0.1); } 
  success() { this._play('square', 432, 864, 0.6, 0.2); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.2); }
  aiPop() { this._play('triangle', 396, 639, 0.4, 0.1); }
  transfer() { this._play('noise', 2000, 100, 1.0, 0.2); }
  explosion() { this._play('sawtooth', 800, 20, 2.0, 0.5); }
  scanSweep() { this._play('triangle', 1200, 400, 0.3, 0.05); } 
  powerUp() { this._play('sine', 200, 600, 0.5, 0.15); } // Efecto de energía termodinámica
}
const sfx = new QuantumAudio();

const triggerVoice = (text, langCode) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); 
  const pureText = text ? text.replace(/<[^>]*>?/gm, '') : ''; 
  setTimeout(() => {
    try {
      const u = new SpeechSynthesisUtterance(pureText);
      u.lang = langCode; u.rate = 1.05; u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }, 50);
};

/* ============================================================
   🎥 6. NÚCLEO 3D AVANZADO CIBERNÉTICO (PARTÍCULAS MULTI-ESTADO)
============================================================ */
const VEC_AB_EXP = new THREE.Vector2(0.02, 0.02);
const VEC_AB_NORM = new THREE.Vector2(0.002, 0.002);
const sphereGeom = new THREE.SphereGeometry(0.6, 32, 32);

const AtomParticles = ({ count, color, speed, radius }) => {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 0.5 + Math.random();
      const x = (Math.random() - 0.5) * radius;
      const y = (Math.random() - 0.5) * radius;
      const z = (Math.random() - 0.5) * radius;
      temp.push({ t, factor, x, y, z });
    }
    return temp;
  }, [count, radius]);

  useFrame(() => {
    if (!mesh.current) return;
    particles.forEach((particle, i) => {
      let { t, factor, x, y, z } = particle;
      t = particle.t += speed * factor;
      const a = Math.cos(t) + Math.sin(t) / 10;
      const b = Math.sin(t) + Math.cos(t) / 10;
      dummy.position.set(x + a, y + b, z);
      dummy.scale.setScalar(0.15);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </instancedMesh>
  );
};

const Core3D = ({ phase, isExploding, isErrorShake, c1, c2, eLost, eGained, langData, pulseIntensity, scannerActive }) => {
  const torusRef = useRef();
  const scanPlaneRef = useRef();
  const isBalancedE = eLost === eGained && eLost > 0;
  const eDelta = Math.abs(eLost - eGained);
  
  // COLOR CUÁNTICO DE LAS PARTÍCULAS
  const particleColor = isExploding || isErrorShake ? "#ff0033" : (isBalancedE ? "#00ff00" : (eDelta > 0 ? "#ffaa00" : "#00f2ff"));
  // VELOCIDAD CAÓTICA PROPORCIONAL AL ERROR
  const particleSpeed = isBalancedE ? 0.02 : 0.05 + (eDelta * 0.01); 

  useFrame((state) => {
    if (isExploding) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 60) * 1.5;
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 70) * 1.5;
    } else if (isErrorShake) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.3;
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, 28), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
    
    if (torusRef.current) {
        // Tensión del núcleo
        torusRef.current.rotation.y += isBalancedE ? 0.01 : 0.02 + (eDelta * 0.005);
        torusRef.current.rotation.x += isBalancedE ? 0.005 : 0.01 + (eDelta * 0.002);
        
        if (!isBalancedE && eDelta > 0) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 10) * 0.05 * eDelta;
            torusRef.current.scale.set(scale, scale, scale);
        } else {
            torusRef.current.scale.set(1, 1, 1);
        }
    }

    if (scannerActive && scanPlaneRef.current) {
        // Movimiento de radar láser de lado a lado
        scanPlaneRef.current.position.x = Math.sin(state.clock.elapsedTime * 3) * 12;
    }
  });

  const safeC1 = Math.max(1, Math.min(Number(c1) || 1, 12));
  const safeC2 = Math.max(1, Math.min(Number(c2) || 1, 12));

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" />
      <Stars count={4000} factor={5} fade speed={2} />
      <AtomParticles count={300} color={particleColor} speed={particleSpeed} radius={18} />
      
      {/* LÁSER DE ESCANEO ACTIVO */}
      {scannerActive && (
         <mesh ref={scanPlaneRef} rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshBasicMaterial color="#0f0" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
         </mesh>
      )}

      <group position={[-7, 0, 0]}>
        {[...Array(safeC1)].map((_, i) => (
           <Float key={`ox-${i}`} speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
             <mesh position={[Math.cos(i) * 2.2, Math.sin(i) * 1.2, 0]} geometry={sphereGeom}>
                <meshPhysicalMaterial color={isExploding || isErrorShake ? "#f00" : "#00f2ff"} emissive={isExploding || isErrorShake ? "#f00" : "#00f2ff"} emissiveIntensity={isBalancedE ? 2 : (4 + pulseIntensity)} roughness={0.1} metalness={0.9} />
                <Edges color="#fff" opacity={0.3} transparent />
             </mesh>
           </Float>
        ))}
      </group>

      <group position={[7, 0, 0]}>
        {[...Array(safeC2)].map((_, i) => (
           <Float key={`red-${i}`} speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
             <mesh position={[Math.cos(i) * 2.2, Math.sin(i) * 1.2, 0]} geometry={sphereGeom}>
                <meshPhysicalMaterial color={isExploding || isErrorShake ? "#f00" : "#ff0055"} emissive={isExploding || isErrorShake ? "#f00" : "#ff0055"} emissiveIntensity={isBalancedE ? 2 : (4 + pulseIntensity)} roughness={0.1} metalness={0.9} />
                <Edges color="#fff" opacity={0.3} transparent />
             </mesh>
           </Float>
        ))}
      </group>

      <group position={[0, 5, 0]}>
         <mesh ref={torusRef}>
            <torusKnotGeometry args={[1.6, 0.3, 120, 20]} />
            <meshStandardMaterial color={isBalancedE ? "#0f0" : (eDelta > 0 ? "#ffaa00" : "#555")} wireframe transparent opacity={0.5} />
         </mesh>
         <mesh position={[0, 0, -0.5]}>
            <boxGeometry args={[14, 2.5, 0.1]} />
            <meshStandardMaterial color="#000" transparent opacity={0.8} />
            <Edges color={isBalancedE ? "#0f0" : "#ffaa00"} />
         </mesh>
         <Text position={[0, 0.6, 0.11]} fontSize={0.6} color={isBalancedE ? "#0f0" : "#ffaa00"} font="monospace" anchorX="center" anchorY="middle">
            {isBalancedE ? `✓ ${langData.successTitle.split('!')[0]}` : `⚠ ${langData.explTitle.split('!')[0]}`}
         </Text>
         <Text position={[0, -0.6, 0.11]} fontSize={0.8} color="#fff" font="monospace" anchorX="center" anchorY="middle">
            {langData.eLost}: {eLost}  |  {langData.eGained}: {eGained}
         </Text>
      </group>

      {phase === 'TRANSFER' && (
        <mesh>
          <tubeGeometry args={[new THREE.QuadraticBezierCurve3(new THREE.Vector3(-7,0,0), new THREE.Vector3(0,5,0), new THREE.Vector3(7,0,0)), 64, 0.5, 8, false]} />
          <meshBasicMaterial color="#0f0" transparent opacity={0.9} />
        </mesh>
      )}

      <EffectComposer>
        <Bloom intensity={phase === 'TRANSFER' ? 8 : (isExploding ? 10 : 3.5)} luminanceThreshold={0.1} mipmapBlur />
        <ChromaticAberration offset={isExploding ? VEC_AB_EXP : VEC_AB_NORM} />
        <Scanline opacity={0.3} density={2.5} />
      </EffectComposer>
    </>
  );
};

/* ============================================================
   🎮 7. LA REVOLUCIÓN (MÁQUINA DE ESTADOS Y UI INPUT)
============================================================ */
function GameApp() {
  const { language, resetProgress } = useGameStore() || { language: "es", resetProgress: () => {} };
  const safeLang = (language === 'es' || language === 'en' || language === 'fr' || language === 'de') ? language : 'es';
  const ui = DICT_UI[safeLang];
  const lCode = LANG_MAP[safeLang];

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [levelData, setLevelData] = useState(null); 
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  
  // Reactivos y Masas - INPUTS
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [cH2O, setCH2O] = useState(0);
  const [cH, setCH] = useState(0);
  const [cOH, setCOH] = useState(0);

  const [clicks, setClicks] = useState(0);
  const [actionCount, setActionCount] = useState(0); 
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(0);
  
  const [aiState, setAiState] = useState("Q"); 
  const [aiDialog, setAiDialog] = useState(null); 
  const [isErrorShake, setIsErrorShake] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [helpActive, setHelpActive] = useState(false);

  // Monitor de estado para SFX de PowerUp Termodinámico
  const prevELost = useRef(0);
  const prevEGained = useRef(0);

  const currentRank = useMemo(() => {
    const ranks = safeLang === 'es' 
      ? [ { name: "NEÓFITO", xp: 0, color: "#888" }, { name: "ALQUIMISTA", xp: 1500, color: "#2196F3" }, { name: "ARQUITECTO CUÁNTICO", xp: 5000, color: "#0f0" }, { name: "DIOS DE LA QUÍMICA", xp: 10000, color: "#ff00ff" } ]
      : [ { name: "NEOPHYTE", xp: 0, color: "#888" }, { name: "ALCHEMIST", xp: 1500, color: "#2196F3" }, { name: "QUANTUM ARCHITECT", xp: 5000, color: "#0f0" }, { name: "CHEMISTRY GOD", xp: 10000, color: "#ff00ff" } ];
    let r = ranks[0];
    for (let i = ranks.length - 1; i >= 0; i--) if (xp >= ranks[i].xp) { r = ranks[i]; break; }
    return r;
  }, [xp, safeLang]);
  
  const eLost = levelData ? c1 * levelData.rawReducer.eTransferred : 0;
  const eGained = levelData ? c2 * levelData.rawOxidizer.eTransferred : 0;
  
  // PowerUp FX (Termodinámica Perfecta)
  useEffect(() => {
      if (eLost === eGained && eLost > 0 && (prevELost.current !== eLost || prevEGained.current !== eGained)) {
          sfx.powerUp();
      }
      prevELost.current = eLost;
      prevEGained.current = eGained;
  }, [eLost, eGained]);

  const liveGuideText = useMemo(() => {
     if (!levelData) return "";
     return getDynamicGuideText(c1, c2, cH2O, cH, cOH, levelData, ui);
  }, [c1, c2, cH2O, cH, cOH, levelData, ui]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    sfx.init();
    if (phase === "BOOT" && !levelData) {
        const initialLevel = generateLevelData();
        setLevelData(initialLevel);
    }
    return () => { 
      isMounted.current = false;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel(); 
    };
  }, [phase, levelData]);

  useEffect(() => {
    let interval = null;
    if (timerActive) interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive]);

  const triggerVisualPulse = () => {
      setPulseIntensity(5);
      setTimeout(() => { if(isMounted.current) setPulseIntensity(0) }, 300);
  };

  const loadLevel = (idx) => {
    sfx.click();
    if (!levelData) return; 
    
    setLevelIdx(idx); 
    setC1(1); setC2(1); setCH2O(0); setCH(0); setCOH(0); 
    setIsErrorShake(false); setIsExploding(false); setHelpActive(false); setScannerActive(false);
    setTime(0); setTimerActive(false); setClicks(0); setMistakes(0); setActionCount(0);
    
    setPhase("THEORY");
    triggerVoice(ui.theoryText, lCode);
  };

  const handleInputChange = (side, val) => {
      sfx.click();
      triggerVisualPulse();
      let num = parseInt(val, 10);
      if (isNaN(num) || num < 0) num = 0;
      if ((side === 'c1' || side === 'c2') && num < 1) num = 1;

      if (side === 'c1') setC1(num);
      if (side === 'c2') setC2(num);
      if (side === 'h2o') setCH2O(num);
      if (side === 'h') setCH(num);
      if (side === 'oh') setCOH(num);
      
      setClicks(p => p + 1);
  };

  const updateCoef = (side, delta) => {
      sfx.click();
      triggerVisualPulse();
      if (side === 'c1') setC1(p => Math.max(1, p + delta));
      if (side === 'c2') setC2(p => Math.max(1, p + delta));
      if (side === 'h2o') setCH2O(p => Math.max(0, p + delta));
      if (side === 'h') setCH(p => Math.max(0, p + delta));
      if (side === 'oh') setCOH(p => Math.max(0, p + delta));
      
      setClicks(p => p + 1);
      
      setActionCount(prev => {
          const next = prev + 1;
          if (next >= 5) { 
              const result = validateRedoxSubmission(
                  side === 'c1' ? c1 + delta : c1, 
                  side === 'c2' ? c2 + delta : c2, 
                  side === 'h2o' ? cH2O + delta : cH2O, 
                  side === 'h' ? cH + delta : cH, 
                  side === 'oh' ? cOH + delta : cOH, 
                  levelData
              );
              if (!result.isBalanced) {
                  const aiData = getSocraticAIQuestion(
                      side === 'c1' ? c1 + delta : c1, side === 'c2' ? c2 + delta : c2, 
                      side === 'h2o' ? cH2O + delta : cH2O, side === 'h' ? cH + delta : cH, side === 'oh' ? cOH + delta : cOH, 
                      levelData, ui
                  );
                  setAiDialog(aiData); setPhase("AI"); setAiState("Q"); sfx.aiPop();
                  triggerVoice(aiData.q, lCode);
                  return 0; 
              }
          }
          return next;
      });
  };

  const verify = () => {
    setTimerActive(false); setActionCount(0);
    const result = validateRedoxSubmission(c1, c2, cH2O, cH, cOH, levelData);

    if (result.isBalanced) {
      sfx.transfer(); setPhase("TRANSFER");
      setStreak(s => s + 1); setXp(p => p + 500 + (streak * 100)); 
      setTimeout(() => { 
          if(isMounted.current) { 
              const newLevel = generateLevelData(); 
              setLevelData(newLevel);
              sfx.success(); setPhase("WIN"); triggerVoice(ui.successMessage, lCode); 
          } 
      }, 2500);
    } else {
      setMistakes(m => m + 1); setStreak(0);
      sfx.error(); setIsErrorShake(true); 

      if (result.eDiff > 12) {
        setIsExploding(true); triggerVoice(ui.explMsg, lCode);
        setTimeout(() => { if(isMounted.current) setPhase("GAMEOVER"); }, 3500);
      } else {
        if (mistakes >= 1 && !helpActive) {
            triggerVoice(ui.voiceFail, lCode);
            setHelpActive(true);
            setXp(p => Math.max(0, p - 50)); 
        } else {
            triggerVoice(ui.voiceFail, lCode);
        }
        setTimeout(() => { if(isMounted.current) setIsErrorShake(false); }, 1000);
      }
    }
  };

  const toggleScanner = () => { 
      sfx.scanSweep(); 
      setScannerActive(!scannerActive); 
  };
  
  const toggleHelp = () => { 
      sfx.aiPop(); 
      setHelpActive(!helpActive); 
      if (!helpActive) triggerVoice(ui.voiceInit, lCode); 
  };

  const invokeAI = () => {
    sfx.aiPop();
    const result = validateRedoxSubmission(c1, c2, cH2O, cH, cOH, levelData);
    if (!result.isBalanced) {
        setAiDialog({
            q: safeLang === 'es' || safeLang === 'fr' ? "Análisis de Asistencia Directa:" : "Direct Assistance Analysis:",
            m: ui.hints[result.hintId],
            o: []
        });
        setPhase("AI"); setAiState("MICROCLASS");
        triggerVoice(ui.hints[result.hintId], lCode);
    } else {
        const aiData = getSocraticAIQuestion(c1, c2, cH2O, cH, cOH, levelData, ui);
        setAiDialog(aiData); setPhase("AI"); setAiState("Q");
        triggerVoice(aiData.q, lCode);
    }
  };

  const handleAiAns = (idx) => {
    if (idx === aiDialog.a) {
      sfx.success(); setPhase("GAME"); setTimerActive(true); triggerVoice(safeLang === 'es' ? "Excelente deducción matemática." : "Excellent mathematical deduction.", lCode);
    } else {
      sfx.error(); setAiState("MICROCLASS"); triggerVoice(aiDialog.m, lCode);
    }
  };

  return (
    <>
      <style>{`
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.02); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        .hud-pulse { animation: pulse 1s infinite; }
        .hud-btn { padding: clamp(15px, 2vw, 20px) clamp(20px, 4vw, 50px); background: #00f2ff; color: #000; font-weight: 900; font-size: clamp(16px, 3vw, 22px); cursor: pointer; border-radius: 8px; border: none; font-family: 'Orbitron', sans-serif; transition: 0.2s; box-shadow: 0 0 20px rgba(0,242,255,0.4); text-transform: uppercase; letter-spacing:1px; }
        .hud-btn:active { transform: scale(0.95); }
        .hud-btn:disabled { background: #555; cursor: not-allowed; box-shadow: none; color:#888; }
        .hud-btn-ghost { padding: clamp(10px, 2vw, 15px) clamp(15px, 3vw, 25px); background: rgba(255,255,255,0.05); border: 2px solid #555; color: #fff; font-size: clamp(14px, 2.5vw, 18px); cursor: pointer; border-radius: 8px; font-family: 'Orbitron', sans-serif; transition: 0.2s; white-space: nowrap; font-weight:bold; }
        .hud-btn-ghost:active { transform: scale(0.95); }
        .hud-btn-ghost:hover { border-color: #00f2ff !important; color: #00f2ff !important; background: rgba(0,242,255,0.1); }
        .glass-panel { background: rgba(0,10,30,0.85); border: 2px solid #00f2ff; backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 0 40px rgba(0,242,255,0.15); }
        
        .glass-scroll { overflow-y: auto; max-height: 400px; padding-right: 15px; }
        .glass-scroll::-webkit-scrollbar { width: 8px; }
        .glass-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 5px; }
        .glass-scroll::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 5px; }
        
        .counter-group { display: flex; flex-direction: column; align-items: center; justify-content: center; gap:8px; }
        .counter-box { display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8); padding: 5px; border-radius: 10px; border: 2px solid #444; width:100%; box-sizing:border-box; }
        .counter-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: clamp(24px, 5vw, 36px); padding: 0 10px; font-weight:bold; transition: 0.2s; }
        .counter-btn:active { transform: scale(0.8); color: #ffea00; }
        
        .counter-input { font-size: clamp(20px, 4vw, 30px); font-weight: 900; color: #fff; width: 70px; text-align: center; font-family:monospace; background: transparent; border: none; outline: none; transition: border-bottom 0.2s; }
        .counter-input:focus { border-bottom: 2px solid #ffea00; }
        .counter-input::-webkit-inner-spin-button, .counter-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .counter-input[type=number] { -moz-appearance: textfield; }

        .shake-anim { animation: shake 0.4s ease-in-out; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 50% { transform: translateX(10px); } 75% { transform: translateX(-10px); } }
        
        .tel-table { width: 100%; border-collapse: collapse; margin-top:20px; font-family:monospace; font-size: clamp(12px, 1.3vw, 16px); }
        .tel-table th { color:#ffea00; border-bottom: 2px solid #ffea00; padding:15px; text-align:center; }
        .tel-table td { padding:15px 10px; border-bottom: 1px solid #333; color:#fff; text-align:center; vertical-align: middle; }
      `}</style>
      
      <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif' }}>
        
        {/* PANTALLA DE INICIO */}
        {phase === "BOOT" && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
            <div style={{color:'#00f2ff', fontSize:'24px', letterSpacing:'10px', marginBottom:'10px', textAlign:'center'}}>THE SINGULARITY ENGINE V1000</div>
            <h1 style={{color:'#00f2ff', fontSize:'clamp(40px, 8vw, 80px)', textShadow:'0 0 50px #00f2ff', textAlign:'center', margin: '0 0 40px 0'}}>{ui.title}</h1>
            <button className="hud-btn" onClick={() => loadLevel(0)} disabled={!levelData}>{levelData ? ui.start : 'INITIALIZING QUANTUM CORE...'}</button>
          </div>
        )}

        {/* PANTALLA DE FISIÓN CUÁNTICA (GAME OVER) */}
        {phase === "GAMEOVER" && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#300', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
            <h1 style={{color:'#f00', fontSize:'clamp(40px, 8vw, 80px)', textShadow:'0 0 50px #f00', textAlign: 'center'}}>{ui.explTitle}</h1>
            <p style={{color:'#fff', fontSize:'24px', margin:'20px 0', textAlign:'center'}}>{ui.explMsg}</p>
            <button className="hud-btn" style={{background:'#f00', color:'#fff', boxShadow:'0 0 30px #f00', marginTop:'30px'}} onClick={() => loadLevel(levelIdx)}>{ui.btnRetry}</button>
          </div>
        )}

        {/* INTERFAZ PRINCIPAL */}
        {phase !== "BOOT" && phase !== "GAMEOVER" && levelData && (
          <>
            {/* CANVAS 3D INTERACTIVO Y EXPLICATIVO */}
            <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
              <Suspense fallback={null}>
                <Canvas camera={{position:[0, 2, 28], fov:45}}>
                  <Core3D phase={phase} isExploding={isExploding} isErrorShake={isErrorShake} c1={c1} c2={c2} eLost={eLost} eGained={eGained} langData={ui} pulseIntensity={pulseIntensity} scannerActive={scannerActive} />
                </Canvas>
              </Suspense>
            </div>

            {/* HEADER INTERACTIVO */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 500, flexWrap:'wrap', gap:'15px', pointerEvents:'auto' }}>
              <button className="hud-btn-ghost" onClick={() => { window.speechSynthesis.cancel(); window.location.reload(); }}>{ui.btnBack}</button>
              {(phase === "GAME") && !isExploding && (
                <div style={{display:'flex', gap:'15px', flexWrap:'wrap'}}>
                   <button className="hud-btn-ghost" style={{borderColor: scannerActive ? '#0f0' : '#00f2ff', color: scannerActive ? '#0f0' : '#00f2ff', boxShadow: scannerActive ? '0 0 15px #0f0' : 'none'}} onClick={toggleScanner}>👁️ {ui.scan}</button>
                   <button className="hud-btn-ghost" style={{borderColor:'#ff00ff', color:'#ff00ff'}} onClick={invokeAI}>{ui.aiBtn}</button>
                   <button className="hud-btn-ghost" style={{borderColor:'#ffea00', color:'#ffea00'}} onClick={toggleHelp}>❓ {ui.helpBtn}</button>
                </div>
              )}
            </div>

            {/* PANEL CENTRAL: ECUACIÓN Y XP */}
            <div style={{ position:'absolute', top:'90px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:100, padding:'0 20px', pointerEvents:'none' }}>
              <div className="glass-panel" style={{ padding:'20px 40px', textAlign:'center', width:'100%', maxWidth:'1000px' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width: '100%', borderBottom:'2px solid #00f2ff', paddingBottom:'10px'}}>
                  <div style={{ background:'#ff0055', color:'#fff', padding:'5px 20px', borderRadius:'5px', fontWeight:'900', letterSpacing:'1px', fontSize:'18px' }}>{ui.level} {levelIdx + 1}</div>
                  <div style={{color:currentRank.color, fontWeight:'bold', fontSize:'20px'}}>{ui.rank}: {currentRank.name} | {ui.xp}: {xp}</div>
                </div>
                <div style={{ color: '#aaa', fontSize: '14px', letterSpacing:'2px', marginTop:'10px' }}>{ui.mission}</div>
                <div style={{ fontSize:'clamp(24px, 5vw, 50px)', fontWeight:'900', color:'#fff', marginTop:'10px', textShadow:'0 0 10px #fff' }}>{levelData.eq}</div>
                <div style={{ color: '#00f2ff', fontSize: '18px', fontWeight:'bold', marginTop:'15px', letterSpacing:'3px' }}>{ui.env}: {levelData.env.toUpperCase()}</div>
              </div>
            </div>

            {/* 🧑‍🏫 EL SENTINEL (GUÍA MATEMÁTICA CON SCROLL) */}
            {phase === "GAME" && (
              <div style={{ position: 'absolute', top: '280px', left: '20px', zIndex: 100, maxWidth: '500px', pointerEvents:'auto' }}>
                 <div className="glass-panel" style={{ padding: '30px', borderLeft: '8px solid #0f0', background:'rgba(0,30,10,0.9)' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#0f0', fontSize: '18px', letterSpacing: '2px' }}>{ui.guideTitle}</h3>
                    <div className="glass-scroll">
                        <div style={{ color: '#fff', fontSize: '18px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{liveGuideText}</div>
                    </div>
                 </div>
              </div>
            )}

            {/* VISOR DE ESPECTROMETRÍA (MODAL FLOTANTE SCI-FI) */}
            {scannerActive && phase === "GAME" && (
              <div className="glass-panel" style={{ position:'absolute', top:'280px', right:'20px', zIndex:100, padding:'30px', maxWidth: '450px', pointerEvents:'auto', border:'2px solid #0f0', boxShadow:'0 0 30px rgba(0,255,0,0.2)' }}>
                <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #0f0', paddingBottom:'10px'}}>
                  <h3 style={{color:'#0f0', margin:0, letterSpacing:'2px'}}>🛰️ {ui.scan}</h3>
                  <button onClick={toggleScanner} style={{background:'none', border:'none', color:'#f00', cursor:'pointer', fontSize:'20px', fontWeight:'bold'}}>{ui.closeScan}</button>
                </div>
                
                <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'14px', letterSpacing:'1px', marginTop:'20px', background:'rgba(0,242,255,0.1)', padding:'15px', borderRadius:'10px'}}>
                   {ui.oxidation} (PIERDE ENERGÍA):<br/>
                   <span style={{fontSize:'22px', color:'#fff', display:'block', marginTop:'10px', fontFamily:'monospace'}}>{c1} × [{levelData.hOx}]</span>
                   <span style={{color:'#aaa', display:'block', marginTop:'5px'}}>⚡ Transfiere: {levelData.rawReducer.eTransferred}e⁻ por molécula base</span>
                   <span style={{color:'#00f2ff', display:'block', marginTop:'5px'}}>⚡ Total Actual: {c1 * levelData.rawReducer.eTransferred}e⁻</span>
                </div>

                <div style={{color:'#ff0055', fontWeight:'bold', marginTop:'20px', fontSize:'14px', letterSpacing:'1px', background:'rgba(255,0,85,0.1)', padding:'15px', borderRadius:'10px'}}>
                   {ui.reduction} (GANA ENERGÍA):<br/>
                   <span style={{fontSize:'22px', color:'#fff', display:'block', marginTop:'10px', fontFamily:'monospace'}}>{c2} × [{levelData.hRed}]</span>
                   <span style={{color:'#aaa', display:'block', marginTop:'5px'}}>🧲 Absorbe: {levelData.rawOxidizer.eTransferred}e⁻ por molécula base</span>
                   <span style={{color:'#ff0055', display:'block', marginTop:'5px'}}>🧲 Total Actual: {c2 * levelData.rawOxidizer.eTransferred}e⁻</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* OVERLAY: BRIEFING TEÓRICO INICIAL */}
        {phase === "THEORY" && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,5,15,0.95)', padding: '20px', pointerEvents:'auto' }}>
            <div className="glass-panel" style={{ padding:'clamp(20px, 5vw, 60px)', textAlign:'center', maxWidth:'900px', width:'100%' }}>
              <h2 style={{color: '#ffea00', fontSize:'clamp(24px, 4vw, 40px)', margin:0}}>{ui.theoryTitle}</h2>
              <div style={{fontSize:'clamp(18px, 3vw, 24px)', color: '#fff', margin:'40px 0', lineHeight: '1.8', textAlign: 'left', background: 'rgba(0,0,0,0.6)', padding: '30px', borderLeft: '5px solid #ffea00', borderRadius: '0 10px 10px 0'}}>
                 {ui.theoryText}
              </div>
              <button className="hud-btn" style={{width:'100%', background:'#ffea00', color:'#000', fontSize:'24px', padding:'25px'}} onClick={() => { setPhase("GAME"); setTimerActive(true); triggerVoice(ui.voiceInit, lCode); }}>{ui.theoryBtn}</button>
            </div>
          </div>
        )}

        {/* OVERLAY: IA SOCRÁTICA */}
        {phase === "AI" && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(20,0,20,0.98)', padding: '20px', pointerEvents:'auto' }}>
            <div className="glass-panel" style={{ border:'2px solid #ff00ff', padding:'clamp(20px, 4vw, 60px)', textAlign:'center', maxWidth:'900px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
              <h2 style={{color:'#ff00ff', fontSize:'clamp(24px, 4vw, 40px)', margin:0}}>{ui.aiTitle}</h2>
              {aiState === "Q" && aiDialog ? (
                 <div style={{marginTop:'40px'}}>
                   <p style={{fontSize:'clamp(20px, 3vw, 28px)', color: '#fff', lineHeight:'1.6'}}>{aiDialog.q}</p>
                   <div style={{display:'flex', flexDirection:'column', gap:'25px', marginTop:'40px'}}>
                     {aiDialog.o?.map((opt, i) => (
                       <button key={i} className="hud-btn-ghost" style={{borderColor:'#ff00ff', padding:'25px', fontSize:'22px', whiteSpace:'normal'}} onClick={() => handleAiAns(i)}>{opt}</button>
                     ))}
                   </div>
                 </div>
              ) : (
                 <div style={{fontSize:'clamp(18px, 3vw, 24px)', color:'#00f2ff', marginTop:'40px', textAlign:'left', lineHeight:'1.7', background:'rgba(0,0,0,0.5)', padding:'40px', borderRadius:'15px', borderLeft:'6px solid #ff00ff'}}>
                    <p style={{margin:0, whiteSpace:'pre-wrap'}}>{aiDialog?.m}</p>
                 </div>
              )}
              {aiState !== "Q" && <div style={{marginTop:'50px'}}><button className="hud-btn" style={{background:'#ff00ff', color:'#fff', width:'100%', height:'70px', fontSize:'24px'}} onClick={()=>{setPhase("GAME"); setTimerActive(true); window.speechSynthesis.cancel();}}>{ui.btnContinue}</button></div>}
            </div>
          </div>
        )}

        {/* OVERLAY: TELEMETRÍA EDUCATIVA */}
        {helpActive && levelData && (
          <div style={{ position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent: 'center', background:'rgba(0,20,40,0.98)', padding: '20px', pointerEvents:'auto' }}>
             <div className="glass-panel glass-scroll" style={{ border:'3px solid #ffea00', padding:'clamp(20px, 4vw, 60px)', textAlign:'center', maxWidth: '1400px', width:'100%' }}>
               <h2 style={{color:'#ffea00', fontSize:'clamp(28px, 5vw, 40px)', margin:0}}>{ui.helpSummary}</h2>
               
               <table className="tel-table">
                 <thead>
                   <tr>
                     <th>{ui.concept}</th>
                     <th>{ui.yourState}</th>
                     <th>{ui.required}</th>
                     <th>{ui.action}</th>
                     <th style={{color:'#ff00ff', maxWidth:'450px'}}>{ui.why}</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td style={{color:'#00f2ff', fontWeight:'bold', fontSize:'18px'}}>{ui.h2o}</td>
                     <td style={{fontSize:'24px', fontWeight:'bold'}}>{cH2O}</td>
                     <td style={{color:'#0f0', fontSize:'24px', fontWeight:'bold'}}>{levelData.ansH2O}</td>
                     <td style={{color: cH2O < levelData.ansH2O ? '#ffea00' : (cH2O > levelData.ansH2O ? '#ff0055' : '#0f0'), fontSize:'18px', fontWeight:'bold'}}>
                       {cH2O < levelData.ansH2O ? `${ui.pressPlus} ${levelData.ansH2O}` : (cH2O > levelData.ansH2O ? `${ui.pressMinus} ${levelData.ansH2O}` : ui.perfect)}
                     </td>
                     <td style={{color:'#ddd', textAlign:'left', fontSize:'14px', lineHeight:'1.5'}}>
                        {ui.hints.h2oAdd}
                     </td>
                   </tr>
                   {levelData.env === "Ácido" && <tr>
                     <td style={{color:'#ffaa00', fontWeight:'bold', fontSize:'18px'}}>{ui.hPlus}</td>
                     <td style={{fontSize:'24px', fontWeight:'bold'}}>{cH}</td>
                     <td style={{color:'#0f0', fontSize:'24px', fontWeight:'bold'}}>{levelData.ansH}</td>
                     <td style={{color: cH < levelData.ansH ? '#ffea00' : (cH > levelData.ansH ? '#ff0055' : '#0f0'), fontSize:'18px', fontWeight:'bold'}}>
                       {cH < levelData.ansH ? `${ui.pressPlus} ${levelData.ansH}` : (cH > levelData.ansH ? `${ui.pressMinus} ${levelData.ansH}` : ui.perfect)}
                     </td>
                     <td style={{color:'#ddd', textAlign:'left', fontSize:'14px', lineHeight:'1.5'}}>
                        {ui.hints.acidAdd}
                     </td>
                   </tr>}
                   {levelData.env === "Básico" && <tr>
                     <td style={{color:'#ff00aa', fontWeight:'bold', fontSize:'18px'}}>{ui.ohMinus}</td>
                     <td style={{fontSize:'24px', fontWeight:'bold'}}>{cOH}</td>
                     <td style={{color:'#0f0', fontSize:'24px', fontWeight:'bold'}}>{levelData.ansOH}</td>
                     <td style={{color: cOH < levelData.ansOH ? '#ffea00' : (cOH > levelData.ansOH ? '#ff0055' : '#0f0'), fontSize:'18px', fontWeight:'bold'}}>
                       {cOH < levelData.ansOH ? `${ui.pressPlus} ${levelData.ansOH}` : (cOH > levelData.ansOH ? `${ui.pressMinus} ${levelData.ansOH}` : ui.perfect)}
                     </td>
                     <td style={{color:'#ddd', textAlign:'left', fontSize:'14px', lineHeight:'1.5'}}>
                        {ui.hints.basicAdd}
                     </td>
                   </tr>}
                   <tr>
                     <td style={{color:'#00f2ff', fontWeight:'bold', fontSize:'18px'}}>{ui.eLost}</td>
                     <td style={{fontSize:'24px'}}>{eLost} e⁻</td>
                     <td style={{color:'#0f0', fontSize:'24px'}}>{ui.eqTo} {calculateMCM(levelData.eOx, levelData.eRed)} e⁻</td>
                     <td style={{color: eLost < (levelData.cOx * levelData.eOx) ? '#ffea00' : (eLost > (levelData.cOx * levelData.eOx) ? '#ff0055' : '#0f0'), fontSize:'18px', fontWeight:'bold'}}>
                        {ui.adjustRed}
                     </td>
                     <td style={{color:'#ddd', textAlign:'left', fontSize:'14px', lineHeight:'1.5'}}>
                        {ui.hints.eLostWhy}
                     </td>
                   </tr>
                   <tr>
                     <td style={{color:'#ff0055', fontWeight:'bold', fontSize:'18px'}}>{ui.eGained}</td>
                     <td style={{fontSize:'24px'}}>{eGained} e⁻</td>
                     <td style={{color:'#0f0', fontSize:'24px'}}>{ui.eqTo} {calculateMCM(levelData.eOx, levelData.eRed)} e⁻</td>
                     <td style={{color: eGained < (levelData.cRed * levelData.eRed) ? '#ffea00' : (eGained > (levelData.cRed * levelData.eRed) ? '#ff0055' : '#0f0'), fontSize:'18px', fontWeight:'bold'}}>
                        {ui.adjustOx}
                     </td>
                     <td style={{color:'#ddd', textAlign:'left', fontSize:'14px', lineHeight:'1.5'}}>
                        {ui.hints.eGainedWhy}
                     </td>
                   </tr>
                 </tbody>
               </table>

               <button className="hud-btn" style={{background:'#ffea00', color:'#000', width:'100%', marginTop:'40px', height:'70px', fontSize:'24px'}} onClick={() => { setHelpActive(false); window.speechSynthesis.cancel(); }}>{ui.closeHelp}</button>
             </div>
          </div>
        )}

        {/* OVERLAY: VICTORIA */}
        {phase === "WIN" && (
          <div className={isErrorShake ? 'shake-anim' : ''} style={{ position: 'absolute', inset: 0, zIndex: 2000, background: 'radial-gradient(circle at center, rgba(0,60,0,0.98) 0%, #000 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', pointerEvents:'auto', padding:'20px' }}>
             <h1 style={{ color: '#0f0', fontSize: 'clamp(50px, 10vw, 100px)', textShadow: '0 0 50px #0f0', textAlign:'center', margin:0 }}>{ui.successTitle}</h1>
             <div style={{ background: 'rgba(0,255,0,0.1)', padding: '40px', borderRadius: '30px', border:'2px solid #0f0', textAlign: 'center', marginTop: '30px', width:'100%', maxWidth:'800px' }}>
                <p style={{ color: '#fff', fontSize: '28px', margin:0 }}>{ui.successMessage}</p>
                <div style={{display:'flex', justifyContent:'space-around', marginTop:'30px', fontSize:'22px', color:'#aaa'}}>
                   <span>⏱️ {ui.timeTaken}: {time}s</span>
                   <span>⚙️ {ui.clicksUsed}: {clicks}</span>
                </div>
             </div>
             <button className="hud-btn" style={{ marginTop: '50px', background:'#0f0', color:'#000', fontSize:'26px', padding:'20px 60px' }} onClick={() => loadLevel(levelIdx + 1)}>{ui.btnNext}</button>
          </div>
        )}

        {/* DOCK INFERIOR (CONTROLES DE INYECCIÓN DE MASAS CON INPUT DIRECTO) */}
        {(phase === "GAME" || phase === "TRANSFER" || isExploding) && !helpActive && levelData && (
          <div style={{ position:'absolute', bottom:'20px', left:'0', width: '100%', display: 'flex', justifyContent: 'center', zIndex:150, padding:'0 10px', pointerEvents:'auto' }}>
            <div className="glass-panel" style={{ display:'flex', gap:'clamp(15px, 2vw, 30px)', alignItems:'center', padding:'25px', borderRadius:'30px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '1400px', width: '100%', background:'rgba(0,10,25,0.98)' }}>
              
              {/* REDUCTOR */}
              <div className="counter-group" style={{ flex:'1 1 250px' }}>
                <div style={{color:'#00f2ff', fontWeight:'bold', fontSize:'14px', textAlign:'center', letterSpacing:'1px'}}>{ui.react} <br/><span style={{fontSize:'22px', color:'#fff'}}>[{levelData.symOx}]</span></div>
                <div className="counter-box" style={{borderColor:'#00f2ff'}}>
                  <button className="counter-btn" onClick={()=>updateCoef('c1', -1)} disabled={phase==='TRANSFER'}>-</button>
                  <input type="number" min="1" className="counter-input" style={{color:'#00f2ff'}} value={c1} onChange={(e) => handleInputChange('c1', e.target.value)} disabled={phase==='TRANSFER'} />
                  <button className="counter-btn" onClick={()=>updateCoef('c1', 1)} disabled={phase==='TRANSFER'}>+</button>
                </div>
              </div>
              
              {/* MASAS ALGEBRAICAS */}
              <div style={{display:'flex', flexWrap:'wrap', gap:'20px', borderLeft:'3px solid #333', borderRight:'3px solid #333', padding:'0 30px', justifyContent:'center', flex:'2 1 auto'}}>
                
                {/* AGUA */}
                <div className="counter-group">
                   <div style={{color:'#fff', fontWeight:'bold', fontSize:'16px', textAlign:'center'}}>{ui.h2o}</div>
                   <div className="counter-box">
                     <button className="counter-btn" onClick={()=>updateCoef('h2o', -1)} disabled={phase==='TRANSFER'}>-</button>
                     <input type="number" min="0" className="counter-input" style={{color:'#fff'}} value={cH2O} onChange={(e) => handleInputChange('h2o', e.target.value)} disabled={phase==='TRANSFER'} />
                     <button className="counter-btn" onClick={()=>updateCoef('h2o', 1)} disabled={phase==='TRANSFER'}>+</button>
                   </div>
                </div>

                {/* ÁCIDO: IONES H+ */}
                {levelData.env === "Ácido" && (
                  <div className="counter-group">
                     <div style={{color:'#ffaa00', fontWeight:'bold', fontSize:'16px', textAlign:'center'}}>{ui.hPlus}</div>
                     <div className="counter-box" style={{borderColor:'#ffaa00'}}>
                       <button className="counter-btn" style={{color:'#ffaa00'}} onClick={()=>updateCoef('h', -1)} disabled={phase==='TRANSFER'}>-</button>
                       <input type="number" min="0" className="counter-input" style={{color:'#ffaa00'}} value={cH} onChange={(e) => handleInputChange('h', e.target.value)} disabled={phase==='TRANSFER'} />
                       <button className="counter-btn" style={{color:'#ffaa00'}} onClick={()=>updateCoef('h', 1)} disabled={phase==='TRANSFER'}>+</button>
                     </div>
                  </div>
                )}

                {/* BÁSICO: IONES OH- */}
                {levelData.env === "Básico" && (
                  <div className="counter-group">
                     <div style={{color:'#ff00aa', fontWeight:'bold', fontSize:'16px', textAlign:'center'}}>{ui.ohMinus}</div>
                     <div className="counter-box" style={{borderColor:'#ff00aa'}}>
                       <button className="counter-btn" style={{color:'#ff00aa'}} onClick={()=>updateCoef('oh', -1)} disabled={phase==='TRANSFER'}>-</button>
                       <input type="number" min="0" className="counter-input" style={{color:'#ff00aa'}} value={cOH} onChange={(e) => handleInputChange('oh', e.target.value)} disabled={phase==='TRANSFER'} />
                       <button className="counter-btn" style={{color:'#ff00aa'}} onClick={()=>updateCoef('oh', 1)} disabled={phase==='TRANSFER'}>+</button>
                     </div>
                  </div>
                )}
              </div>

              {/* OXIDANTE */}
              <div className="counter-group" style={{ flex:'1 1 250px' }}>
                <div style={{color:'#ff0055', fontWeight:'bold', fontSize:'14px', textAlign:'center', letterSpacing:'1px'}}>{ui.prod} <br/><span style={{fontSize:'22px', color:'#fff'}}>[{levelData.symRed}]</span></div>
                <div className="counter-box" style={{borderColor:'#ff0055'}}>
                  <button className="counter-btn" onClick={()=>updateCoef('c2', -1)} disabled={phase==='TRANSFER'}>-</button>
                  <input type="number" min="1" className="counter-input" style={{color:'#ff0055'}} value={c2} onChange={(e) => handleInputChange('c2', e.target.value)} disabled={phase==='TRANSFER'} />
                  <button className="counter-btn" onClick={()=>updateCoef('c2', 1)} disabled={phase==='TRANSFER'}>+</button>
                </div>
              </div>

              {/* BOTÓN VERIFICAR */}
              <div style={{display:'flex', justifyContent:'center', width:'100%', marginTop:'20px'}}>
                <button className="hud-btn" style={{width:'100%', maxWidth:'800px', height:'80px', fontSize:'26px'}} onClick={verify} disabled={phase==='TRANSFER' || isExploding}>{ui.btnCheck}</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

// 🛡️ EXPORT Y WRAPPER DE SEGURIDAD
export default function RedoxLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}