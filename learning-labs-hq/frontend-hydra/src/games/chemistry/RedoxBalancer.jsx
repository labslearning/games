import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { create } from 'zustand';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles, Html, Line, Sphere, Float, Edges, Text } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🌌 CONSTANTES GLOBALES BLINDADAS
============================================================ */
const VECTOR_EXP = new THREE.Vector2(0.02, 0.02);
const VECTOR_NORM = new THREE.Vector2(0.002, 0.002);
const SPHERE_GEOM = new THREE.SphereGeometry(0.6, 32, 32);

// API KEY DEEPSEEK (GOD TIER INTEGRATION)
const DEEPSEEK_API_KEY = "sk-00d037be16824fbb8bf780bb635c3370";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

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
          <button onClick={() => { window.localStorage.removeItem('icfes_telemetry_v7'); window.location.reload(); }} style={{ marginTop: '30px', padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#ff0033', color: '#fff', border: 'none', borderRadius: '5px', fontWeight:'bold', textTransform: 'uppercase' }}>Reignite Core (Clear Cache)</button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ============================================================
   🧠 2. MOTOR GENERATIVO ALGORÍTMICO (GOD TIER UPGRADE)
   Incluye algoritmo Anti-Repetición para garantizar variedad ICFES
============================================================ */
class IcfesEngine {
  static get ELECTRONEGATIVITIES() { return { F: 4.0, O: 3.5, Cl: 3.1, N: 3.0, C: 2.5, H: 2.1, Na: 0.9, K: 0.8, Mg: 1.2, Ca: 1.0 }; }
  
  // Memoria estática para evitar que el estudiante repita temas seguidos
  static lastTopics = [];

  static getTopicName(topicId, lang) {
      const mockQ = this.generateQuestion(lang, topicId);
      return mockQ.topic || topicId.replace(/_/g, ' ');
  }

  static generateQuestion(lang, forcedTopic = null) {
    const allTopics = [
      'GASES_IDEALES', 'ESTEQUIOMETRIA', 'DENSIDAD', 'PH', 
      'ENLACES_QUIMICOS', 'CONFIGURACION_ELECTRONICA', 
      'SOLUCIONES', 'BALANCEO_ECUACIONES', 'ISOTOPOS_Y_ESTRUCTURA', 'CINETICA_QUIMICA'
    ];

    // Algoritmo de Criba: Filtramos los temas que salieron en las últimas 6 preguntas
    let availableTopics = allTopics.filter(t => !this.lastTopics.includes(t));
    if (availableTopics.length === 0) {
        this.lastTopics = []; // Reiniciamos el ciclo si ya vio todos
        availableTopics = allTopics;
    }

    const selectedTopic = forcedTopic || availableTopics[Math.floor(Math.random() * availableTopics.length)];

    // Registrar en memoria solo si es aleatorio
    if (!forcedTopic) {
        this.lastTopics.push(selectedTopic);
        if (this.lastTopics.length > 6) this.lastTopics.shift();
    }

    switch (selectedTopic) {
      case 'GASES_IDEALES': return this.genGasQuestion(lang);
      case 'ESTEQUIOMETRIA': return this.genStoichQuestion(lang);
      case 'DENSIDAD': return this.genDensityQuestion(lang);
      case 'PH': return this.genPhQuestion(lang);
      case 'ENLACES_QUIMICOS': return this.genBondQuestion(lang);
      case 'CONFIGURACION_ELECTRONICA': return this.genElectronConfigQuestion(lang);
      case 'SOLUCIONES': return this.genSolutionsQuestion(lang);
      case 'BALANCEO_ECUACIONES': return this.genBalanceQuestion(lang);
      case 'ISOTOPOS_Y_ESTRUCTURA': return this.genIsotopeQuestion(lang);
      case 'CINETICA_QUIMICA': return this.genKineticsQuestion(lang);
      default: return this.genStoichQuestion(lang);
    }
  }

  static generateLocalMasterclass(topic, lang) {
      const q = this.generateQuestion(lang, topic);
      return {
          title: `ENTRENAMIENTO TÁCTICO: ${q.topic}`,
          theory: `[SISTEMA AISLADO DE DEEPSEEK]\n\nEl núcleo teórico de ${q.topic} se basa en las relaciones fisicoquímicas que el ICFES evalúa para medir tu capacidad analítica. No requieres memoria fotográfica, sino entendimiento lógico del fenómeno.\n\nLa clave está en comprender cómo interactúan las variables sin memorizar ciegamente la fórmula.`,
          trap: "El ICFES suele emplear distractores matemáticos: conversiones de unidades faltantes (ej. Celsius a Kelvin, mL a L) o proporciones inversas. Revisa siempre la magnitud esperada y sus unidades.",
          protocol: "1. Lee la matriz de datos e identifica la variable incógnita.\n2. Ejecuta la conversión de unidades ANTES de operar.\n3. Aplica la relación matemática con cuidado.\n4. Verifica que la respuesta final tenga sentido físico.",
          demoQuestion: {
              text: q.text,
              options: q.options,
              correctIdx: q.correctIdx,
              analysis: q.microclass
          }
      };
  }

  // --- MÓDULOS DE PREGUNTAS MEJORADOS ---

  static genGasQuestion(lang) {
    const isIsochoric = Math.random() > 0.5; // True = Boyle/Gay-Lussac, False = Charles
    const T1_C = Math.floor(Math.random() * 40) + 10;
    const T1_K = T1_C + 273.15;
    const var1 = Math.floor(Math.random() * 5) + 2; // Presión o Volumen
    const T2_C = T1_C + Math.floor(Math.random() * 80) + 40;
    const T2_K = T2_C + 273.15;
    
    // Ley combinada / Gay-Lussac / Charles: P1/T1 = P2/T2 o V1/T1 = V2/T2
    const correctVal = Number(((var1 * T2_K) / T1_K).toFixed(2));
    const errorCelsius = Number(((var1 * T2_C) / T1_C).toFixed(2)); 
    const errorInverted = Number(((var1 * T1_K) / T2_K).toFixed(2)); 
    const errorLinear = Number((var1 + (T2_C - T1_C) * 0.1).toFixed(2)); 

    const optionsRaw = [correctVal, errorCelsius, errorInverted, errorLinear];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 10 + 1).toFixed(2)));
    
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);
    const unit = isIsochoric ? 'atm' : 'L';
    const varNameES = isIsochoric ? 'presión' : 'volumen';
    const varNameEN = isIsochoric ? 'pressure' : 'volume';

    const texts = {
      es: { topic: 'TERMODINÁMICA DE GASES', text: `Un gas ideal ocupa ${var1} ${unit} a una temperatura de ${T1_C}°C. Si se calienta el sistema hasta los ${T2_C}°C manteniendo constante el ${isIsochoric ? 'volumen' : 'presión'}, ¿cuál será la nueva ${varNameES} en ${unit}?`, hint: "REGLA DE ORO ICFES: En termodinámica, la temperatura SIEMPRE opera en grados Kelvin (+273.15).", micro: `[EXPLICACIÓN DE FENÓMENOS - GASES]\n1. Conversión obligatoria:\n   T₁ = ${T1_C} + 273.15 = ${T1_K}K\n   T₂ = ${T2_C} + 273.15 = ${T2_K}K.\n2. Relación directamente proporcional (Ley de ${isIsochoric ? 'Gay-Lussac' : 'Charles'}).\n3. Matemática exacta: (${var1} × ${T2_K}) / ${T1_K} = ${correctVal} ${unit}.`, traps: [null, `Trampa Cognitiva: Operaste con grados Celsius directos.`, `Trampa Cognitiva: Invertiste la relación matemática.`, `Trampa Cognitiva: Sumaste en lugar de usar proporciones.`] },
      en: { topic: 'GAS THERMODYNAMICS', text: `An ideal gas is confined at ${var1} ${unit} and ${T1_C}°C. If heated to ${T2_C}°C keeping ${isIsochoric ? 'volume' : 'pressure'} constant, what is the new ${varNameEN} in ${unit}?`, hint: "GOLDEN RULE: Use Kelvin.", micro: `Convert: T₁=${T1_K}K, T₂=${T2_K}K. Math: (${var1} × ${T2_K}) / ${T1_K} = ${correctVal} ${unit}.`, traps: [null, "Used Celsius directly.", "Inverted ratio.", "Linear addition used."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'GASES_IDEALES', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} ${unit}`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genStoichQuestion(lang) {
    const reactions = [
      { name: {es: "Metano", en: "Methane"}, f: "CH₄", c: 1, h: 4, mass: 16, prod: "CO₂", prodMass: 44, mRatio: 1 },
      { name: {es: "Etano", en: "Ethane"}, f: "C₂H₆", c: 2, h: 6, mass: 30, prod: "CO₂", prodMass: 44, mRatio: 2 },
      { name: {es: "Propano", en: "Propane"}, f: "C₃H₈", c: 3, h: 8, mass: 44, prod: "CO₂", prodMass: 44, mRatio: 3 },
      { name: {es: "Glucosa", en: "Glucose"}, f: "C₆H₁₂O₆", c: 6, h: 12, mass: 180, prod: "CO₂", prodMass: 44, mRatio: 6 }
    ];
    const react = reactions[Math.floor(Math.random() * reactions.length)];
    const inputMoles = Math.floor(Math.random() * 3) + 1; 
    const inputGrams = inputMoles * react.mass;
    
    // Gramos reales de producto
    const correctGrams = inputMoles * react.mRatio * react.prodMass; 
    const errorNoRatio = inputMoles * react.prodMass; 
    const errorInverted = Number(((inputMoles / react.mRatio) * react.prodMass).toFixed(1)); 
    const errorNoMass = inputMoles * react.mRatio; 

    const optionsRaw = [correctGrams, errorNoRatio, errorNoMass, errorInverted];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n) && n > 0);
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 300) + 50);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctGrams);

    const texts = {
      es: { topic: 'ESTEQUIOMETRÍA AVANZADA', text: `En la combustión del ${react.name.es} (${react.f}), si reaccionan ${inputGrams}g del compuesto con oxígeno en exceso, ¿cuántos gramos de ${react.prod} se emiten? (Masa Molar: ${react.f}=${react.mass}g/mol, ${react.prod}=${react.prodMass}g/mol).`, hint: "1. Gramos a moles. 2. Aplica la relación estequiométrica (Balance). 3. Moles a gramos.", micro: `Reacción balanceada indica que 1 mol de ${react.f} produce ${react.mRatio} moles de ${react.prod}.\n1. Tienes ${inputGrams}g / ${react.mass}g/mol = ${inputMoles} moles de ${react.f}.\n2. Relación: ${inputMoles} × ${react.mRatio} = ${inputMoles * react.mRatio} moles de ${react.prod}.\n3. Convertir a gramos: ${inputMoles * react.mRatio} moles × ${react.prodMass}g/mol = ${correctGrams}g.`, traps: [null, `Trampa: Olvidaste el coeficiente estequiométrico (${errorNoRatio}g).`, `Trampa: Te detuviste en moles.`, `Trampa: Dividiste la relación en vez de multiplicar.`] },
      en: { topic: 'ADVANCED STOICHIOMETRY', text: `In the combustion of ${react.name.en} (${react.f}), if ${inputGrams}g react with excess oxygen, how many grams of ${react.prod} are emitted? (Molar Mass: ${react.f}=${react.mass}g/mol, ${react.prod}=${react.prodMass}g/mol).`, hint: "Grams -> Moles -> Ratio -> Grams.", micro: `Balanced reaction: 1 mol ${react.f} yields ${react.mRatio} mol ${react.prod}.\n1. ${inputGrams}g / ${react.mass}g/mol = ${inputMoles} moles.\n2. Ratio: ${inputMoles * react.mRatio} moles ${react.prod}.\n3. To grams: ${inputMoles * react.mRatio} × ${react.prodMass} = ${correctGrams}g.`, traps: [null, "Trap: Forgot stoichiometric coefficient.", "Trap: Stopped at moles.", "Trap: Inverted the ratio."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ESTEQUIOMETRIA', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genDensityQuestion(lang) {
    // Variación para densidad para evitar repetición
    const types = ['archimedes', 'alloy'];
    const type = types[Math.floor(Math.random() * types.length)];

    if (type === 'archimedes') {
        const volume = Math.floor(Math.random() * 40) + 15; 
        const mass = Math.floor(Math.random() * 150) + 80; 
        const correctDensity = Number((mass / volume).toFixed(2));
        const initialVol = Math.floor(Math.random() * 30) + 30; 
        const finalVol = initialVol + volume;
        const errorFinalVol = Number((mass / finalVol).toFixed(2)); 
        const errorInverted = Number((volume / mass).toFixed(2)); 
        const errorRest = Number((mass / (finalVol + initialVol)).toFixed(2)); 

        const optionsRaw = [correctDensity, errorFinalVol, errorInverted, errorRest];
        const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
        while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 8 + 1).toFixed(2)));
        const options = uniqueOptions.sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctDensity);

        const texts = {
          es: { topic: 'PROPIEDADES INTENSIVAS', text: `Una probeta contiene ${initialVol} mL de agua. Al introducir una pieza metálica de ${mass} g, el nivel del agua asciende a ${finalVol} mL. ¿Cuál es la densidad exacta del metal?`, hint: "El volumen del objeto es igual al volumen de agua desplazada.", micro: `Volumen desplazado: ${finalVol}mL - ${initialVol}mL = ${volume}mL.\nCálculo de densidad: d = m/v = ${mass}g / ${volume}mL = ${correctDensity} g/mL.`, traps: [null, `Trampa: Dividiste la masa entre el volumen final total.`, `Trampa: Dividiste volumen entre masa (eso es volumen específico).`, `Trampa: Sumaste los volúmenes sin sentido físico.`] },
          en: { topic: 'INTENSIVE PROPERTIES', text: `A cylinder has ${initialVol} mL of water. A metal piece of ${mass} g is added, raising water to ${finalVol} mL. Exact density?`, hint: "Object volume = displaced water volume.", micro: `Displaced volume: ${finalVol}mL - ${initialVol}mL = ${volume}mL.\nDensity: ${mass}g / ${volume}mL = ${correctDensity} g/mL.`, traps: [null, "Trap: Used total final volume.", "Trap: Inverted formula (v/m).", "Trap: Added volumes improperly."] },
        };
        const langData = texts[lang] || texts['es'];
        return { id: 'DENSIDAD', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g/mL`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
    } else {
        const mass1 = Math.floor(Math.random() * 50) + 50; const vol1 = 10;
        const mass2 = Math.floor(Math.random() * 50) + 50; const vol2 = 20;
        const d1 = mass1/vol1; const d2 = mass2/vol2;
        const correctDensity = Number(((mass1+mass2)/(vol1+vol2)).toFixed(2));
        const errorAvg = Number(((d1+d2)/2).toFixed(2)); // Trampa común: promediar densidades
        const errorSum = Number((d1+d2).toFixed(2));

        const optionsRaw = [correctDensity, errorAvg, errorSum, Number((correctDensity*1.5).toFixed(2))];
        const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
        while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 8 + 1).toFixed(2)));
        const options = uniqueOptions.sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctDensity);

        const texts = {
          es: { topic: 'MEZCLAS Y DENSIDAD', text: `Se funden dos metales: el Metal A (${mass1}g, volumen ${vol1}mL) y el Metal B (${mass2}g, volumen ${vol2}mL). Asumiendo volúmenes aditivos, ¿cuál es la densidad de la aleación resultante?`, hint: "La densidad de una mezcla NO es el promedio de las densidades. Es Masa Total / Volumen Total.", micro: `Masa Total = ${mass1} + ${mass2} = ${mass1+mass2}g.\nVolumen Total = ${vol1} + ${vol2} = ${vol1+vol2}mL.\nDensidad Aleación = ${mass1+mass2} / ${vol1+vol2} = ${correctDensity} g/mL.`, traps: [null, `Trampa ICFES: Promediaste las densidades de los metales. La densidad es intensiva, no se promedia linealmente así.`, `Trampa: Sumaste las densidades.`, `Error de cálculo.`] },
          en: { topic: 'MIXTURES & DENSITY', text: `Two metals are melted together: Metal A (${mass1}g, ${vol1}mL) and Metal B (${mass2}g, ${vol2}mL). Assuming additive volumes, what is the density of the alloy?`, hint: "Density is NOT the average. Use Total Mass / Total Volume.", micro: `Total Mass = ${mass1+mass2}g.\nTotal Vol = ${vol1+vol2}mL.\nAlloy Density = ${mass1+mass2} / ${vol1+vol2} = ${correctDensity} g/mL.`, traps: [null, "ICFES Trap: Averaged the densities.", "Trap: Summed densities.", "Math error."] },
        };
        const langData = texts[lang] || texts['es'];
        return { id: 'DENSIDAD', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g/mL`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
    }
  }

  static genPhQuestion(lang) {
    const isOH = Math.random() > 0.5; // Variante: pedir pH desde [OH-]
    const concExponent = Math.floor(Math.random() * 10) + 2; 
    const coef = Math.floor(Math.random() * 8) + 1; 
    
    const pIon = Number((concExponent - Math.log10(coef)).toFixed(2)); 
    const pH = isOH ? Number((14 - pIon).toFixed(2)) : pIon;
    const pOH = isOH ? pIon : Number((14 - pH).toFixed(2));

    const optionsRaw = [pH, pOH, concExponent, Number((14 - concExponent).toFixed(2))];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 14).toFixed(2)));
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(pH);

    const ionStr = isOH ? "Hidróxido [OH⁻]" : "Hidronio [H⁺]";
    const ionStrEn = isOH ? "Hydroxide [OH⁻]" : "Hydronium [H⁺]";

    const texts = {
      es: { topic: 'EQUILIBRIO ÁCIDO-BASE', text: `En una solución acuosa a 25°C, la concentración de iones ${ionStr} es de ${coef}.0 × 10⁻${concExponent} M. Según las propiedades logarítmicas, ¿cuál es el pH de la solución?`, hint: isOH ? "Ojo: Te dieron OH⁻. Calcula el pOH primero, y luego usa pH + pOH = 14." : "Aplica la propiedad: -log(A × 10⁻ᴮ) = B - log(A).", micro: isOH ? `1. pOH = -log(${coef} × 10⁻${concExponent}) = ${pOH}.\n2. Como pH + pOH = 14, entonces pH = 14 - ${pOH} = ${pH}.` : `Cálculo directo: pH = -log([H⁺]) = -log(${coef} × 10⁻${concExponent}) = ${concExponent} - log(${coef}) = ${pH}.`, traps: [null, isOH ? `Trampa: Calculaste el pOH pero olvidaste restarlo de 14 para hallar el pH.` : `Trampa: Respondiste el pOH en lugar del pH.`, `Trampa: Tomaste solo el exponente, ignorando el coeficiente.`, `Trampa: Operación matemática invertida.`] },
      en: { topic: 'ACID-BASE EQUILIBRIUM', text: `In a 25°C solution, the ${ionStrEn} concentration is ${coef}.0 × 10⁻${concExponent} M. What is the pH?`, hint: isOH ? "Careful: You have OH⁻. Find pOH first, then pH = 14 - pOH." : "-log(A × 10⁻ᴮ) = B - log(A).", micro: isOH ? `1. pOH = ${pOH}.\n2. pH = 14 - ${pOH} = ${pH}.` : `pH = -log(${coef} × 10⁻${concExponent}) = ${pH}.`, traps: [null, isOH ? "Calculated pOH instead of pH." : "Answered pOH.", "Ignored coefficient.", "Math error."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'PH', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `pH ${o}`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genBondQuestion(lang) {
    const metals = ['Na', 'K', 'Mg', 'Ca', 'Li']; const nonMetals = ['F', 'O', 'Cl', 'N', 'Br'];
    const el1 = Math.random() > 0.5 ? metals[Math.floor(Math.random()*metals.length)] : nonMetals[Math.floor(Math.random()*nonMetals.length)]; 
    const el2 = nonMetals[Math.floor(Math.random()*nonMetals.length)];
    const en1 = this.ELECTRONEGATIVITIES[el1] || 1.0; const en2 = this.ELECTRONEGATIVITIES[el2] || 3.0;
    const diff = Number(Math.abs(en1 - en2).toFixed(1));
    
    let bondTypeES = diff > 1.7 ? "Iónico" : (diff > 0.4 ? "Covalente Polar" : "Covalente Apolar");
    let bondTypeEN = diff > 1.7 ? "Ionic" : (diff > 0.4 ? "Polar Covalent" : "Non-polar Covalent");

    const optionsKeys = ['ionic', 'polar', 'apolar', 'metal'].sort(() => Math.random() - 0.5);
    const correctType = diff > 1.7 ? 'ionic' : (diff > 0.4 ? 'polar' : 'apolar');
    const correctIndex = optionsKeys.indexOf(correctType);

    const texts = {
      es: { topic: 'ENLACES QUÍMICOS', text: `Un investigador analiza una molécula diatómica formada por Átomo A (EN=${en1}) y Átomo B (EN=${en2}). Basado estrictamente en la escala de electronegatividad, ¿qué tipo de enlace rige esta molécula?`, hint: "Escala de Pauling: > 1.7 (Iónico), entre 0.4 y 1.7 (Polar), < 0.4 (Apolar).", micro: `Diferencia matemática: |${en1} - ${en2}| = ${diff}.\nSegún la escala empírica de Pauling, una diferencia de ${diff} clasifica el enlace como ${bondTypeES}.`, opts: { ionic: "Enlace Iónico", polar: "Covalente Polar", apolar: "Covalente Apolar", metal: "Enlace Metálico" }, traps: [null, null, null, null] },
      en: { topic: 'CHEMICAL BONDS', text: `Molecule formed by Atom A (EN=${en1}) and Atom B (EN=${en2}). Based on electronegativity, what is the bond type?`, hint: "> 1.7 (Ionic), 0.4 - 1.7 (Polar), < 0.4 (Apolar).", micro: `Diff: |${en1} - ${en2}| = ${diff}. Pauling scale ➔ ${bondTypeEN}.`, opts: { ionic: "Ionic Bond", polar: "Polar Covalent", apolar: "Non-polar Covalent", metal: "Metallic Bond" }, traps: [null, null, null, null] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ENLACES_QUIMICOS', isAi: false, topic: langData.topic, text: langData.text, options: optionsKeys.map(k => langData.opts[k]), optionsKeys: optionsKeys, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genElectronConfigQuestion(lang) {
    const atoms = [
      { name: {es:"Fósforo", en:"Phosphorus"}, z: 15, config: "[Ne] 3s² 3p³", period: 3, group: "VA" },
      { name: {es:"Potasio", en:"Potassium"}, z: 19, config: "[Ar] 4s¹", period: 4, group: "IA" },
      { name: {es:"Aluminio", en:"Aluminum"}, z: 13, config: "[Ne] 3s² 3p¹", period: 3, group: "IIIA" }
    ];
    const atom = atoms[Math.floor(Math.random() * atoms.length)];
    const correctAns = `Periodo ${atom.period}, Grupo ${atom.group}`; 
    const error1 = `Periodo ${atom.period - 1}, Grupo ${atom.group}`; 
    const error2 = `Periodo ${atom.period}, Grupo ${atom.group.replace('A', 'B')}`; 
    const error3 = `Periodo 2, Grupo VIIIA`;
    
    const optionsRaw = [correctAns, error1, error2, error3]; 
    const options = optionsRaw.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAns);

    const texts = {
      es: { topic: 'TABLA PERIÓDICA', text: `La configuración electrónica de un átomo neutro de ${atom.name.es} termina en ${atom.config}. Con base en esto, determina su ubicación exacta en la tabla periódica.`, hint: "El nivel de energía más alto (el número grande) es el periodo. Los electrones sumados en ese nivel te dan el grupo.", micro: `Configuración: ${atom.config}.\n1. El coeficiente más alto es ${atom.period}, por lo tanto está en el Periodo ${atom.period}.\n2. Al sumar los electrones de ese nivel de valencia obtenemos el Grupo ${atom.group}.`, traps: [null, "Confundiste el nivel de energía anterior.", "Asignaste un grupo de metales de transición (B).", "Respuesta aleatoria."] },
      en: { topic: 'PERIODIC TABLE', text: `Neutral ${atom.name.en} atom config ends in ${atom.config}. Period and group?`, hint: "Highest level = period. Valence e- = group.", micro: `Config: ${atom.config}.\nHighest n=${atom.period} (Period). Valence e- give Group ${atom.group}.`, traps: [null, "Wrong period.", "Transition metal group (B).", "Random trap."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'CONFIGURACION_ELECTRONICA', isAi: false, topic: langData.topic, text: langData.text, options: options, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genSolutionsQuestion(lang) {
    const massSolute = Math.floor(Math.random() * 80) + 20; 
    const mmSolute = Math.floor(Math.random() * 60) + 40; 
    const volumeLiters = (Math.floor(Math.random() * 4) + 1) * 0.5; 
    
    const moles = massSolute / mmSolute; 
    const molarity = Number((moles / volumeLiters).toFixed(2));
    const error1 = Number((massSolute / volumeLiters).toFixed(2)); // Trampa g/L
    const error2 = Number(((moles / (volumeLiters * 1000))).toFixed(4)); // Trampa mL
    const error3 = Number((volumeLiters / moles).toFixed(2)); 
    
    const optionsRaw = [molarity, error1, error2, error3]; 
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 5).toFixed(2)));
    const options = uniqueOptions.sort(() => Math.random() - 0.5); 
    const correctIndex = options.indexOf(molarity);

    const texts = {
      es: { topic: 'SOLUCIONES QUÍMICAS', text: `En un laboratorio se prepara una solución disolviendo ${massSolute} g de soluto (Masa molar = ${mmSolute} g/mol) en agua hasta alcanzar un volumen exacto de ${volumeLiters} Litros. ¿Cuál es la Molaridad (M) de la solución?`, hint: "Fórmula de Molaridad: M = Moles de soluto / Volumen de solución en Litros.", micro: `Paso 1: Hallar moles. ${massSolute}g / ${mmSolute}g/mol = ${moles.toFixed(3)} moles.\nPaso 2: Hallar Molaridad. M = ${moles.toFixed(3)} mol / ${volumeLiters} L = ${molarity} M.`, traps: [null, "Trampa: Calculaste concentración en gramos por litro (g/L), no Molaridad.", "Trampa: Fallo de unidades de volumen.", "Trampa: Invertiste la fórmula (L / moles)."] },
      en: { topic: 'CHEMICAL SOLUTIONS', text: `A solution is prepared by dissolving ${massSolute} g of solute (Molar Mass = ${mmSolute} g/mol) to a volume of ${volumeLiters} Liters. What is the Molarity (M)?`, hint: "M = Moles / Liters.", micro: `Moles = ${massSolute}g / ${mmSolute}g/mol = ${moles.toFixed(3)} moles. M = ${moles.toFixed(3)} / ${volumeLiters} L = ${molarity} M.`, traps: [null, "Trap: Grams / Liters calculated.", "Trap: Unit conversion error.", "Trap: Inverted formula."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'SOLUCIONES', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} M`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genBalanceQuestion(lang) {
      const eqTypes = [
          { eq: "C₃H₈ + X O₂ ➔ 3CO₂ + 4H₂O", x: 5, es:"Oxígeno", en:"Oxygen" },
          { eq: "2Al + X HCl ➔ 2AlCl₃ + 3H₂", x: 6, es:"Cloro", en:"Chlorine" }
      ];
      const selected = eqTypes[Math.floor(Math.random() * eqTypes.length)]; 
      const correctAns = selected.x;
      const optionsRaw = [correctAns, correctAns + 1, correctAns - 1, correctAns * 2].filter(n => n > 0);
      const uniqueOptions = [...new Set(optionsRaw)]; while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 5) + 5);
      const options = uniqueOptions.sort(() => Math.random() - 0.5); const correctIndex = options.indexOf(correctAns);

      const texts = {
        es: { topic: 'BALANCEO DE ECUACIONES', text: `Dada la siguiente ecuación química: \n${selected.eq} \nAplicando la Ley de Conservación de la Masa, ¿cuál debe ser el valor exacto del coeficiente estequiométrico X?`, hint: `Haz un conteo de los átomos de ${selected.es} en los productos y los reactivos.`, micro: `Para cumplir la conservación de masa, los átomos entran y salen en igual cantidad. El coeficiente X que equilibra los átomos es ${correctAns}.`, traps: [null, null, null, null] },
        en: { topic: 'EQUATION BALANCING', text: `Equation: \n${selected.eq} \nFor Mass Conservation, what is the exact value of X?`, hint: `Count ${selected.en} atoms.`, micro: `Atoms must balance. X = ${correctAns}.`, traps: [null, null, null, null] },
      };
      const langData = texts[lang] || texts['es'];
      return { id: 'BALANCEO_ECUACIONES', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genIsotopeQuestion(lang) {
      const isos = [
          { name: "Uranio-235", z: 92, a: 235 },
          { name: "Cobalto-60", z: 27, a: 60 },
          { name: "Yodo-131", z: 53, a: 131 }
      ];
      const iso = isos[Math.floor(Math.random() * isos.length)];
      const neutrons = iso.a - iso.z;
      const correctAns = neutrons; 
      const error1 = iso.a; const error2 = iso.z; const error3 = iso.a + iso.z;
      const optionsRaw = [correctAns, error1, error2, error3]; const options = optionsRaw.sort(() => Math.random() - 0.5); const correctIndex = options.indexOf(correctAns);

      const texts = {
        es: { topic: 'ESTRUCTURA ATÓMICA E ISÓTOPOS', text: `El isótopo radiactivo ${iso.name} tiene un número atómico (Z) de ${iso.z} y un número másico (A) de ${iso.a}. ¿Cuántos neutrones posee en su núcleo?`, hint: "El número másico (A) es la suma de protones y neutrones.", micro: `Fórmula: A = Z + Neutrones.\nDespejando: N = A - Z = ${iso.a} - ${iso.z} = ${correctAns} neutrones en el núcleo.`, traps: [null, "Elegiste el número másico (A), que incluye protones.", "Elegiste el número atómico (Z), que son solo los protones.", "Sumaste A y Z sin ningún sentido físico."] },
        en: { topic: 'ATOMIC STRUCTURE', text: `The isotope ${iso.name} has atomic number Z=${iso.z} and mass number A=${iso.a}. How many neutrons in the nucleus?`, hint: "Mass number (A) = protons + neutrons.", micro: `N = A - Z = ${iso.a} - ${iso.z} = ${correctAns} neutrons.`, traps: [null, "Chose mass number.", "Chose atomic number.", "Added values illogically."] },
      };
      const langData = texts[lang] || texts['es'];
      return { id: 'ISOTOPOS_Y_ESTRUCTURA', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genKineticsQuestion(lang) {
      const type = Math.random() > 0.5 ? 'temp' : 'catalyst';
      let correctType, text, hint, micro, opts, traps;

      if (type === 'temp') {
          correctType = 'ans';
          opts = { ans: "Incrementa la energía cinética y las colisiones efectivas", err1: "Disminuye la presión de activación", err2: "Altera la estequiometría de los productos", err3: "Reduce la energía del sistema" };
          text = `En termodinámica y cinética, ¿cuál es la justificación física de por qué un aumento de temperatura acelera exponencialmente una reacción química?`;
          hint = "Piensa en el movimiento molecular a nivel cuántico.";
          micro = "El calor es energía. Al aumentar la temperatura, las moléculas se mueven más rápido (mayor energía cinética), chocando entre sí con más frecuencia y con fuerza suficiente para superar la energía de activación.";
          traps = [null, "Trampa: La temperatura no afecta la 'presión de activación', afecta la energía.", "Trampa: La estequiometría (los productos) no cambian por calentar más rápido.", "Trampa: Calentar aporta energía, no la reduce."];
      } else {
          correctType = 'ans';
          opts = { ans: "Reduce la energía de activación requerida", err1: "Aumenta la temperatura interna del reactor", err2: "Se consume durante la reacción", err3: "Aumenta la cantidad de productos generados" };
          text = `¿Cuál es el mecanismo exacto por el cual un catalizador logra acelerar una reacción química sin alterar el equilibrio termodinámico?`;
          hint = "El catalizador crea un 'atajo' más fácil para que la reacción ocurra.";
          micro = "Un catalizador proporciona una ruta de reacción alternativa que requiere una menor Energía de Activación, permitiendo que más partículas reaccionen a la misma temperatura.";
          traps = [null, "Trampa: Los catalizadores no inyectan calor.", "Trampa ICFES típica: Los catalizadores NO se consumen en la reacción.", "Trampa: El catalizador acelera, pero no cambia el límite teórico de producto."];
      }

      const optionsKeys = ['ans', 'err1', 'err2', 'err3'].sort(() => Math.random() - 0.5);
      const correctIndex = optionsKeys.indexOf(correctType);
      
      const langData = { topic: 'CINÉTICA QUÍMICA', text, opts, hint, micro, traps }; // English ommitted for brevity in this sub-node, defaulting to ES
      return { id: 'CINETICA_QUIMICA', isAi: false, topic: langData.topic, text: langData.text, optionsKeys: optionsKeys, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: {es: langData} };
  }
}

/* ============================================================
   🧠 3. MOTOR DEEPSEEK (CONEXIÓN IA SANITIZADA Y PROTEGIDA)
============================================================ */
const LANG_MAP = { es: "SPANISH", en: "ENGLISH" };

class DeepSeekEngine {
  static cleanJSON(raw) {
    try {
      let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }
      try { return JSON.parse(cleaned); } catch (parseError) {
          cleaned = cleaned.replace(/(?<!\\)\n/g, '\\n').replace(/(?<!\\)\r/g, '');
          return JSON.parse(cleaned);
      }
    } catch (error) {
      console.error("DeepSeek Critical Parse Error:", error);
      throw new Error("JSON_PARSE_ERROR");
    }
  }

  static async fetchWithTimeout(url, options, timeout = 25000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          clearTimeout(id);
          return response;
      } catch (e) {
          clearTimeout(id);
          throw e;
      }
  }

  static async generateQuestion(lang, forcedTopic = null, retries = 1) {
    const topics = [ 'GASES_IDEALES', 'ESTEQUIOMETRIA', 'DENSIDAD', 'PH', 'ENLACES_QUIMICOS', 'CONFIGURACION_ELECTRONICA', 'SOLUCIONES', 'BALANCEO_ECUACIONES', 'ISOTOPOS_Y_ESTRUCTURA', 'CINETICA_QUIMICA' ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    const targetLang = LANG_MAP[lang] || "SPANISH";

    const sysPrompt = `
      Eres un experto diseñador de exámenes de Química para el ICFES.
      Genera una pregunta matemática COMPLETAMENTE NUEVA sobre: "${selectedTopic}".
      Language for the output must strictly be: ${targetLang}.
      Inventa valores aleatorios válidos. Provee 4 opciones, solo 1 correcta. Las otras 3 deben ser trampas de errores comunes.
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NO USES MARKDOWN ALREDEDOR. Usa comillas simples ('') dentro de los textos si necesitas citar algo.
      {
        "id": "${selectedTopic}",
        "topic": "Nombre del tema",
        "text": "El texto de la pregunta...",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correctIdx": 0,
        "hint": "Pista breve sin dar la respuesta",
        "microclass": "Explicación detallada de por qué es la correcta",
        "trapExplanations": ["Explicación de trampa si eligió A", "Trampa B", "Trampa C", "Trampa D"]
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7, max_tokens: 800, response_format: { type: "json_object" } })
      }, 20000);
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      parsed.isAi = true; 
      return parsed;
    } catch (error) {
      if (retries > 0) return this.generateQuestion(lang, forcedTopic, retries - 1);
      throw error;
    }
  }

  static async generateMasterclass(topic, lang, retries = 2) {
    const targetLang = LANG_MAP[lang] || "SPANISH";
    const sysPrompt = `
      Eres un Profesor Top de Química preparando a un estudiante para el ICFES.
      Genera una CLASE MAGISTRAL SIGNIFICATIVA Y DIRECTA sobre el tema: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe ser al grano, profesional y dar un ejemplo clarísimo. Máximo 400 palabras en total.

      REGLAS CRÍTICAS DE SISTEMA PARA PREVENIR ERRORES:
      1. RESPONDE SÓLO EN JSON VÁLIDO. NADA DE MARKDOWN FUERA DEL JSON.
      2. ESCAPA TODOS LOS SALTOS DE LÍNEA USANDO \\n DENTRO DE LAS CADENAS DE TEXTO.
      3. USA COMILLAS SIMPLES ('') para citar dentro del texto, NUNCA comillas dobles ("").
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DEL TEMA",
        "theory": "Explicación teórica corta, al grano y fácil de entender. (max 150 palabras)",
        "trap": "La trampa típica del ICFES explicada brevemente.",
        "protocol": "1. Paso uno.\\n2. Paso dos.",
        "demoQuestion": {
           "text": "Problema directo generado al azar...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Explicación de la respuesta."
        }
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.2, max_tokens: 1000, response_format: { type: "json_object" } })
      }, 30000); 
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      return this.cleanJSON(data.choices[0].message.content);
    } catch (error) {
      if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 500)); 
          return this.generateMasterclass(topic, lang, retries - 1);
      }
      throw error;
    }
  }
}

/* ============================================================
   🔊 4. MOTOR DE AUDIO SCI-FI (WEB AUDIO API NATIVA)
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; this.setupUnlock(); }

  setupUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.init();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
  }

  init() {
    if (typeof window !== 'undefined' && !this.ctx) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          this.ctx = new AudioContext();
          this.gainNode = this.ctx.createGain();
          this.gainNode.gain.value = 0.2;
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
      osc.type = type; osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch (e) {}
  }
  click() { this._play('sine', 432, 216, 0.15, 0.1); } 
  success() { this._play('square', 432, 864, 0.6, 0.2); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.2); }
  scanSweep() { this._play('sine', 1200, 400, 0.5, 0.05); } 
  aiPop() { this._play('triangle', 600, 800, 0.3, 0.1); }
}
const sfx = new QuantumAudio();

/* ============================================================
   🌍 5. DICCIONARIOS UI Y CONSEJOS 
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR SIMULACIÓN ICFES", title: "LABORATORIO ICFES QUÍMICA", 
      scan: "ESCÁNER LÁSER DE PISTAS", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO", mastery: "Maestría Cuántica", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE MÓDULO ➔",
      btnRetrySame: "REINTENTAR MATRIZ ➔", 
      correctTitle: "¡ANÁLISIS PERFECTO!", wrongTitle: "RUPTURA COGNITIVA",
      statsBtn: "TELEMETRÍA", theoryText: "SISTEMA DE GENERACIÓN IA ACTIVO. Este simulador está conectado a DeepSeek Neural Net. Cada ejercicio es único, calculado al instante. Se ha inyectado un algoritmo Anti-Repetición para garantizar cobertura total de los temas del ICFES.",
      timeout: "¡COLAPSO TÉRMICO (TIEMPO AGOTADO)!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD DE TELEMETRÍA GLOBAL", avgTime: "Tiempo Medio de Reacción",
      btnRetry: "PURGAR CACHÉ", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡RENDIMIENTO PERFECTO! NO HAY DEBILIDADES.",
      aiSelectTopic: "Selecciona el dominio a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME TÁCTICO",
      loadingData: "ESTABLECIENDO CONEXIÓN NEURONAL DEEPSEEK...",
      warmupTitle: "⚡ RETO DE CALENTAMIENTO", warmupSub: "Mientras la IA Cuántica sintetiza tu matriz principal..."
  },
  en: {
      start: "START ICFES SIMULATION", title: "ICFES CHEMISTRY LAB", scan: "LASER INQUIRY SCANNER", aiBtn: "AI TUTOR", time: "CHRONOMETER", mastery: "Quantum Mastery", btnCheck: "SYNTHESIZE ANSWER", btnNext: "NEXT MODULE ➔", btnRetrySame: "RETRY MATRIX ➔", correctTitle: "PERFECT ANALYSIS!", wrongTitle: "COGNITIVE RUPTURE", statsBtn: "TELEMETRY", theoryText: "AI GENERATION SYSTEM ACTIVE. This simulator is hooked to DeepSeek. Every exercise is uniquely calculated. Anti-Repetition algorithm engaged for total ICFES coverage.", timeout: "THERMAL COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL TELEMETRY DASHBOARD", avgTime: "Avg Reaction Time", btnRetry: "PURGE CACHE", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT PERFORMANCE!", aiSelectTopic: "Select the domain to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD TACTICAL REPORT", loadingData: "ESTABLISHING DEEPSEEK NEURAL LINK...", warmupTitle: "⚡ WARM-UP CHALLENGE", warmupSub: "While AI synthesizes your main matrix..."
  }
};

const DICT_REPORT = {
    es: {
        docTitle: "DOSSIER TÁCTICO ICFES", docSub: "SIMULACIÓN CUÁNTICA DE QUÍMICA",
        dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO",
        kpiAcc: "Precisión Neuronal", kpiTime: "Tiempo de Reacción", kpiTotal: "Matrices Resueltas",
        aiTitle: "VEREDICTO DEL SISTEMA DE INTELIGENCIA ARTIFICIAL",
        aiVuln: "⚠️ VULNERABILIDADES TÁCTICAS DETECTADAS",
        aiVulnDesc: "El operador muestra deficiencias críticas en los siguientes dominios:",
        aiAction: "PLAN DE ACCIÓN DE IA",
        aiActionDesc: "Es imperativo solicitar el módulo 'Masterclass IA' dentro del simulador para re-entrenar las redes neuronales biológicas en estos temas.",
        aiOpt: "✅ RENDIMIENTO ÓPTIMO ALCANZADO",
        aiOptDesc: "No se detectan vulnerabilidades críticas. El operador está calificado y listo para enfrentar escenarios ICFES de alta complejidad.",
        aiNoData: "Datos biométricos insuficientes. El operador debe completar más simulaciones para emitir un veredicto válido.",
        topicTitle: "DESGLOSE MICRO-ANALÍTICO POR DOMINIO", topicNoData: "Aún no se han procesado suficientes dominios químicos.",
        topicHit: "Aciertos", topicMiss: "Fallos",
        footer: "DOCUMENTO CLASIFICADO GENERADO POR LEARNING LABS ENGINE V26.0", footerSub: "El conocimiento es la única ventaja táctica inquebrantable."
    },
    en: {
        docTitle: "ICFES TACTICAL DOSSIER", docSub: "QUANTUM CHEMISTRY SIMULATION",
        dateLabel: "Extraction Date", kpiTitle: "GLOBAL PERFORMANCE METRICS",
        kpiAcc: "Neural Accuracy", kpiTime: "Reaction Time", kpiTotal: "Matrices Solved",
        aiTitle: "ARTIFICIAL INTELLIGENCE SYSTEM VERDICT",
        aiVuln: "⚠️ TACTICAL VULNERABILITIES DETECTED",
        aiVulnDesc: "The operator shows critical deficiencies in the following domains:",
        aiAction: "AI ACTION PLAN",
        aiActionDesc: "It is imperative to request the 'AI Masterclass' module within the simulator to retrain biological neural networks on these topics.",
        aiOpt: "✅ OPTIMAL PERFORMANCE ACHIEVED",
        aiOptDesc: "No critical vulnerabilities detected. The operator is qualified and ready to face high-complexity ICFES scenarios.",
        aiNoData: "Insufficient biometric data. The operator must complete more simulations to issue a valid verdict.",
        topicTitle: "MICRO-ANALYTICAL DOMAIN BREAKDOWN", topicNoData: "Not enough chemical domains have been processed yet.",
        topicHit: "Hits", topicMiss: "Misses",
        footer: "CLASSIFIED DOCUMENT GENERATED BY LEARNING LABS ENGINE V26.0", footerSub: "Knowledge is the only unbreakable tactical advantage."
    }
};

const TIPS_DB = {
  es: [
    "RECUERDA: La Molaridad siempre exige MOLES y LITROS. Jamás uses gramos directamente.",
    "TRUCO ICFES: Si el volumen de un gas se duplica a presión constante, la temperatura en Kelvin también lo hizo.",
    "OJO: El pH y el pOH siempre sumarán 14. Lee bien lo que pide la pregunta.",
    "ESTRATEGIA: Balancea siempre la ecuación antes de hacer cualquier cálculo estequiométrico.",
    "CONCEPTO: El enlace covalente apolar ocurre cuando la diferencia de electronegatividad es casi cero."
  ],
  en: [
    "REMEMBER: Molarity requires MOLES and LITERS. Never use grams directly.",
    "ICFES TRICK: Gas volume doubles = absolute temperature doubles.",
    "WATCH OUT: pH + pOH = 14. Read what they ask carefully.",
    "STRATEGY: Always balance the equation first.",
    "CONCEPT: Non-polar = electronegativity difference near zero."
  ]
};

/* ============================================================
   🎥 6. COMPONENTE DE CARGA HOLOGRÁFICA (INTERMISSION)
============================================================ */
const QuantumIntermission = ({ lang, loadingText }) => {
    const tips = TIPS_DB[lang] || TIPS_DB['es'];
    const [tipIdx, setTipIdx] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setTipIdx(prev => (prev + 1) % tips.length);
        }, 8000); 
        return () => clearInterval(interval);
    }, [tips.length]);

    return (
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px', textAlign: 'center' }}>
            <div className="loader-ring" style={{ width: '80px', height: '80px', border: '5px solid #333', borderTop: '5px solid #00f2ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '30px' }}></div>
            <h1 className="hud-pulse" style={{color:'#00f2ff', fontSize:'clamp(20px, 4vw, 40px)', textShadow:'0 0 30px #00f2ff', margin: '0 0 30px 0', letterSpacing: '2px'}}>{loadingText}</h1>
            
            <div style={{ background: 'rgba(255, 170, 0, 0.1)', borderLeft: '4px solid #ffaa00', padding: '30px', maxWidth: '800px', width: '100%', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ color: '#ffaa00', fontSize: '16px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase' }}>💡 ICFES SURVIVAL TIP</div>
                <div style={{ color: '#fff', fontSize: 'clamp(18px, 4vw, 24px)', minHeight: '80px', transition: 'opacity 0.5s ease', lineHeight: '1.5' }}>
                    {tips[tipIdx]}
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, height: '4px', background: '#ffaa00', width: '100%', animation: 'shrink 8s linear infinite'}}></div>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes shrink { 0% { width: 100%; } 100% { width: 0%; } }
            `}</style>
        </div>
    );
};

/* ============================================================
   🎥 7. NÚCLEO 3D AVANZADO DE ESTADO DE FLUJO (ESTÁTICO)
============================================================ */
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
      // STATIC RENDER FOR DEEP FOCUS - Eliminada la acumulación de t (particle.t += speed)
      let { t, factor, x, y, z } = particle; 
      
      // Si hay explosión de error, las partículas vibran caóticamente
      if (speed > 0.1) {
          x += (Math.random() - 0.5) * 0.5;
          y += (Math.random() - 0.5) * 0.5;
      }
      
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
      <primitive object={SPHERE_GEOM} attach="geometry" />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
    </instancedMesh>
  );
};

const Core3D = ({ isExploding, scannerActive, timeRatio, isLoading }) => {
  const torusRef = useRef();
  const scanPlaneRef = useRef();
  
  const isDanger = timeRatio > 0.83; 
  const isCritical = timeRatio > 0.94; 
  
  let particleColor = "#00f2ff"; 
  if (isLoading) particleColor = "#ff00ff";
  else if (isDanger) particleColor = "#ffaa00"; 
  else if (isCritical || isExploding) particleColor = "#ff0033"; 

  // Speed is only > 0 if exploding or loading. During normal test, speed is 0 for Focus.
  const particleSpeed = isExploding ? 0.5 : (isLoading ? 0.1 : 0); 

  useFrame((state) => {
    // Camera remains completely static for Deep Focus, unless there's an explosion (fail)
    if (isExploding || isCritical) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 80) * (isExploding ? 1.5 : 0.2);
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 90) * (isExploding ? 1.5 : 0.2);
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, 28), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
    
    // Torus remains static unless exploding or loading
    if (torusRef.current) {
        if (isExploding || isLoading) {
            torusRef.current.rotation.y += particleSpeed;
            torusRef.current.rotation.x += particleSpeed * 0.5;
        }
        if (isDanger && !isExploding && !isLoading) {
            // Latido sutil si queda poco tiempo
            const scale = 1 + Math.sin(state.clock.elapsedTime * 25) * (timeRatio * 0.05);
            torusRef.current.scale.set(scale, scale, scale);
        } else {
            torusRef.current.scale.set(1, 1, 1);
        }
    }

    if (scannerActive && scanPlaneRef.current) {
        scanPlaneRef.current.position.x = Math.sin(state.clock.elapsedTime * 3) * 12;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={3} color="#ffffff" />
      {/* Stars are completely static (speed=0) for pure focus */}
      <Stars count={4000} factor={5} fade speed={isExploding ? 6 : 0} />
      
      <AtomParticles count={350} color={particleColor} speed={particleSpeed} radius={18} />
      
      {scannerActive && (
         <mesh ref={scanPlaneRef} rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[30, 30]} />
            <meshBasicMaterial color="#0f0" transparent opacity={0.2} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
         </mesh>
      )}
      
      <group position={[0, 3, 0]}>
         <mesh ref={torusRef}>
            <torusKnotGeometry args={[2.5, 0.5, 120, 20]} />
            <meshStandardMaterial color={particleColor} wireframe transparent opacity={0.6} />
         </mesh>
      </group>
      
      <EffectComposer>
        <Bloom intensity={isExploding ? 10 : (isLoading ? 8 : (isDanger ? 6 : 3))} luminanceThreshold={0.1} mipmapBlur />
        <ChromaticAberration offset={isExploding ? VECTOR_EXP : VECTOR_NORM} />
        <Scanline opacity={0.3} density={2.5} />
      </EffectComposer>
    </>
  );
};


/* ============================================================
   🤖 8. COMPONENTE MASTERCLASS DEEPSEEK (UX GOD TIER EXPANDIDO)
============================================================ */
const MarkdownParser = ({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text;
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:30px; border-bottom:1px solid #00f2ff; padding-bottom:5px; font-size: 26px;">$1</h3>');
        parsed = parsed.replace(/## (.*)/g, '<h2 style="color:#ffea00; margin-top:25px; font-size: 30px;">$1</h2>');
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ff00ff;">$1</strong>');
        parsed = parsed.replace(/\\n/g, '<br/>'); 
        parsed = parsed.replace(/\n/g, '<br/>'); 
        return { __html: parsed };
    }, [text]);

    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#fff', fontSize: 'clamp(18px, 3.5vw, 22px)', lineHeight: '1.8', fontFamily: 'sans-serif' }} />;
};

const SocraticMasterclass = ({ topic, lang, onBack, onClose, UI }) => {
    const [classData, setClassData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [loadText, setLoadText] = useState("> ESTABLECIENDO CONEXIÓN CUÁNTICA DEEPSEEK...");
    
    const loadClass = useCallback(async () => {
        let isMounted = true;
        setIsGenerating(true);

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO VULNERABILIDADES DEL ESTUDIANTE EN: " + topic.replace(/_/g, ' ')); }, 3000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO NÚCLEO TEÓRICO AVANZADO..."); }, 6000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> GENERANDO MATRIZ DE SIMULACIÓN (ESPERE)..."); }, 10000);
        const t4 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO DATOS PEDAGÓGICOS (ÚLTIMA FASE)..."); }, 15000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
            }
        } catch (err) {
            console.error("DeepSeek Colapso Total. Activando Defensa Algorítmica.", err);
            if (isMounted) {
                const fallbackClass = IcfesEngine.generateLocalMasterclass(topic, lang);
                setClassData(fallbackClass);
                setIsGenerating(false);
                sfx.success();
            }
        }
            
        return () => { 
            isMounted = false; 
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
        };
    }, [topic, lang]);

    useEffect(() => {
        const cleanup = loadClass();
        return () => { if (cleanup && cleanup.then) cleanup.then(c => { if (c) c() }); };
    }, [loadClass]);

    if (isGenerating) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 'clamp(18px, 4vw, 24px)', lineHeight: '2' }}>
                    <p className="hud-pulse" style={{marginBottom: '20px', color: '#ff00ff', fontSize: '30px', fontWeight: 'bold'}}>{loadText}</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Operación: Socratic Overdrive</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Destino: Neural Net DeepSeek-Chat</p>
                    <p style={{color: '#aaa', opacity: 0.8}}>_ Status: Aguardando carga útil (Payload)...</p>
                </div>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)' }}>
           <h2 style={{color:'#ff00ff', fontSize:'clamp(28px, 5vw, 45px)', textAlign:'center', borderBottom:'3px solid #ff00ff', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase'}}>🎓 {classData.title || topic.replace(/_/g, ' ')}</h2>
           
           <div style={{ display: 'grid', gap: '30px', marginTop: '40px' }}>
              <div style={{ borderLeft: '6px solid #00f2ff', padding: '30px', background: 'rgba(0,242,255,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#00f2ff', marginTop: 0, fontSize: '26px', display: 'flex', alignItems: 'center', gap:'10px'}}>📚 NÚCLEO TEÓRICO Y ANÁLISIS</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '6px solid #f00', padding: '30px', background: 'rgba(255,0,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#f00', marginTop: 0, fontSize: '26px', display: 'flex', alignItems: 'center', gap:'10px'}}>⚠️ TRAMPA COGNITIVA ICFES</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '6px solid #ffea00', padding: '30px', background: 'rgba(255,234,0,0.05)', borderRadius: '0 15px 15px 0' }}>
                 <h3 style={{color: '#ffea00', marginTop: 0, fontSize: '26px', display: 'flex', alignItems: 'center', gap:'10px'}}>⚙️ PROTOCOLO DE RESOLUCIÓN INFALIBLE</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {/* EJEMPLO GENERADO VIVO POR LA IA O FALLBACK */}
           {classData.demoQuestion && (
               <div style={{ marginTop: '50px', border: '3px solid #0f0', borderRadius: '15px', padding: 'clamp(20px, 4vw, 40px)', background: 'rgba(0,20,5,0.95)', boxShadow: '0 0 40px rgba(0,255,0,0.15)' }}>
                   <h3 style={{color: '#0f0', textAlign: 'center', marginTop: 0, fontSize: '28px'}}>🧪 SIMULACIÓN PRÁCTICA GENERADA</h3>
                   <p style={{color: '#aaa', fontSize: '16px', textAlign: 'center', fontStyle: 'italic', marginBottom:'30px'}}>Esta matriz matemática acaba de ser calculada en tiempo real. Jamás se repetirá.</p>
                   
                   <div style={{ color: '#fff', fontSize: 'clamp(20px, 4vw, 24px)', lineHeight: '1.6', background: 'rgba(255,255,255,0.05)', padding: '30px', borderRadius: '10px' }}>
                       {classData.demoQuestion.text}
                   </div>
                   
                   <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      {classData.demoQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === classData.demoQuestion.correctIdx;
                          return (
                              <div key={idx} style={{ padding: '25px', border: isCorrect ? '3px solid #0f0' : '2px solid #333', background: isCorrect ? 'rgba(0,255,0,0.1)' : 'transparent', color: isCorrect ? '#0f0' : '#aaa', borderRadius: '10px', fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: isCorrect ? 'bold' : 'normal' }}>
                                  {String.fromCharCode(65 + idx)}. {opt} {isCorrect && " ➔ (Respuesta Correcta)"}
                              </div>
                          );
                      })}
                   </div>
                   
                   <div style={{ marginTop: '30px', padding: '30px', background: 'rgba(0,255,0,0.05)', color: '#0f0', borderRadius: '10px', borderLeft: '6px solid #0f0', fontSize: 'clamp(18px, 3.5vw, 22px)', lineHeight: '1.8' }}>
                       <strong style={{fontSize: '24px'}}>ANÁLISIS DEL RESULTADO:</strong><br/><br/>
                       <MarkdownParser text={classData.demoQuestion.analysis} />
                   </div>
               </div>
           )}

           <div style={{display:'flex', gap:'20px', marginTop:'60px', flexWrap: 'wrap'}}>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'#555', color:'#fff', boxShadow: 'none', fontSize: '22px', padding: '25px'}} onClick={onBack}>VOLVER A TEMAS</button>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'#ff00ff', color:'#fff', boxShadow: '0 0 30px rgba(255,0,255,0.5)', fontSize: '22px', padding: '25px'}} onClick={onClose}>{UI.aiClose}</button>
           </div>
        </div>
    )
}

/* ============================================================
   🎮 9. APLICACIÓN PRINCIPAL (PHANTOM QUEUE Y CICLO CONTINUO)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('icfes_telemetry_v7'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0,
      correctQ: 0,
      totalTime: 0,
      topics: {
          'GASES_IDEALES': { c: 0, w: 0 },
          'ESTEQUIOMETRIA': { c: 0, w: 0 },
          'DENSIDAD': { c: 0, w: 0 },
          'PH': { c: 0, w: 0 },
          'ENLACES_QUIMICOS': { c: 0, w: 0 },
          'CONFIGURACION_ELECTRONICA': { c: 0, w: 0 },
          'SOLUCIONES': { c: 0, w: 0 },
          'BALANCEO_ECUACIONES': { c: 0, w: 0 },
          'ISOTOPOS_Y_ESTRUCTURA': { c: 0, w: 0 },
          'CINETICA_QUIMICA': { c: 0, w: 0 }
      },
      needsReview: [] 
  };
};

function GameApp() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = DICT_UI[language] ? language : 'es';
  const UI = DICT_UI[safeLang];
  const REPORT_UI = DICT_REPORT[safeLang] || DICT_REPORT['es'];

  const MAX_TIME = 180; 
  const WARMUP_TIME = 60; 

  const [phase, setPhase] = useState("BOOT"); 
  const [currentQData, setCurrentQData] = useState(null); 
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [xp, setXp] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  
  // PHANTOM QUEUE STATE
  const [pendingAIQ, setPendingAIQ] = useState(null);
  const isFetchingAI = useRef(false); 

  // MODAL IA Y ESTADO DE CLASE
  const [showAiModal, setShowAiModal] = useState(false); 
  const [activeAiTopic, setActiveAiTopic] = useState(null); 

  const [previousPhase, setPreviousPhase] = useState("BOOT"); 
  const [savedTime, setSavedTime] = useState(MAX_TIME);
  
  const [stats, setStats] = useState(getInitialStats);

  const failedTopics = useMemo(() => {
      return Object.keys(stats.topics).filter(topicId => stats.topics[topicId].w > 0);
  }, [stats]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('icfes_telemetry_v7', JSON.stringify(stats));
    }
  }, [stats]);

  // PROCESADOR MIXTO (Algorítmico o IA)
  const currentQ = useMemo(() => {
      if (!currentQData) return null;
      if (currentQData.texts) {
          const d = currentQData.texts[safeLang] || currentQData.texts['es'];
          let displayOptions = currentQData.options;
          if (currentQData.optionsKeys) displayOptions = currentQData.optionsKeys.map(k => d.opts[k]);
          return { ...currentQData, topic: d.topic, text: d.text, options: displayOptions, hint: d.hint, microclass: d.micro, trapExplanations: d.traps };
      }
      return currentQData; 
  }, [currentQData, safeLang]);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    sfx.init();
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
        interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && (phase === "GAME" || phase === "WARMUP")) {
        handleFailTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase]);

  // SI LA IA CARGA MIENTRAS ESTAMOS EN LA PANTALLA LOADING
  useEffect(() => {
      if (phase === "LOADING" && pendingAIQ) {
          setCurrentQData(pendingAIQ);
          setSelectedOpt(null);
          setTimeLeft(MAX_TIME);
          setPhase("GAME");
          setTimerActive(true);
          setPendingAIQ(null);
      }
  }, [phase, pendingAIQ]);

  // LLAMADA FANTASMA A DEEPSEEK
  const fetchAIQuestionBackground = useCallback(async (forcedTopic) => {
      if (isFetchingAI.current) return;
      isFetchingAI.current = true;
      try {
          const q = await DeepSeekEngine.generateQuestion(safeLang, forcedTopic);
          if (isMounted.current) setPendingAIQ(q);
      } catch (e) {
          console.warn("AI Fallback: Generando pregunta de respaldo algorítmica.");
          if (isMounted.current) setPendingAIQ(IcfesEngine.generateQuestion(safeLang, forcedTopic));
      } finally {
          if (isMounted.current) isFetchingAI.current = false;
      }
  }, [safeLang]);


  const generateNew = useCallback(() => {
      sfx.click();
      let forcedTopic = stats.needsReview.length > 0 ? stats.needsReview[0] : null;
      
      if (pendingAIQ) {
          setCurrentQData(pendingAIQ);
          setSelectedOpt(null);
          setTimeLeft(MAX_TIME);
          setScannerActive(false);
          setHintUsed(false);
          setPhase("GAME");
          setTimerActive(true);
          setShowAiModal(false);
          setActiveAiTopic(null);
          setPendingAIQ(null);
          
          fetchAIQuestionBackground(forcedTopic); 
          return;
      }

      const warmupQ = IcfesEngine.generateQuestion(safeLang, forcedTopic);
      setCurrentQData(warmupQ);
      setSelectedOpt(null);
      setTimeLeft(WARMUP_TIME);
      setScannerActive(false);
      setHintUsed(false);
      setPhase("WARMUP");
      setTimerActive(true);
      setShowAiModal(false);
      setActiveAiTopic(null);
      
      fetchAIQuestionBackground(forcedTopic);

  }, [safeLang, stats.needsReview, pendingAIQ, fetchAIQuestionBackground]);

  const retrySameQuestion = useCallback(() => {
      sfx.click();
      setSelectedOpt(null);
      const isWarmup = currentQData && currentQData.isAi === false;
      setTimeLeft(isWarmup ? WARMUP_TIME : MAX_TIME); 
      setPhase(isWarmup ? "WARMUP" : "GAME"); 
      setTimerActive(true); 
  }, [currentQData]);

  const handleFailTimeout = useCallback(() => {
      setTimerActive(false);
      sfx.error();
      if (phase === "GAME") {
          updateStats(false, MAX_TIME);
      }
      setPhase("MICROCLASS");
  }, [phase]);

  const submitAnswer = () => {
      if (selectedOpt === null) return;
      setTimerActive(false);
      sfx.click();

      const isCorrect = selectedOpt === currentQ.correctIdx;

      if (phase === "GAME") {
          const timeTaken = MAX_TIME - timeLeft;
          updateStats(isCorrect, timeTaken);
      }

      if (isCorrect) {
          sfx.success();
          setXp(p => p + (phase === "WARMUP" ? 50 : (hintUsed ? 50 : 200))); 
          setPhase("CORRECT");
          fetchAIQuestionBackground(stats.needsReview.length > 0 ? stats.needsReview[0] : null);
      } else {
          sfx.error();
          setPhase("MICROCLASS");
          fetchAIQuestionBackground(stats.needsReview.length > 0 ? stats.needsReview[0] : null);
      }
  };

  const updateStats = (isCorrect, timeTaken) => {
      setStats(prev => {
          const newTopics = { ...prev.topics };
          const internalId = currentQData?.id; 
          
          if (internalId && newTopics[internalId]) {
              newTopics[internalId].c += (isCorrect ? 1 : 0);
              newTopics[internalId].w += (isCorrect ? 0 : 1);
          } else if (internalId && !newTopics[internalId]) {
              newTopics[internalId] = { c: isCorrect ? 1 : 0, w: isCorrect ? 0 : 1 };
          }

          let newReview = [...prev.needsReview];
          if (internalId) {
             if (!isCorrect && !newReview.includes(internalId)) {
                 newReview.push(internalId); 
             } else if (isCorrect) {
                 newReview = newReview.filter(t => t !== internalId); 
             }
          }

          return {
              totalQ: prev.totalQ + 1,
              correctQ: prev.correctQ + (isCorrect ? 1 : 0),
              totalTime: prev.totalTime + timeTaken,
              topics: newTopics,
              needsReview: newReview
          };
      });
  };

  const toggleScanner = () => { 
      sfx.scanSweep(); 
      setScannerActive(true); 
      setHintUsed(true);
  };

  const openTelemetry = () => {
      sfx.aiPop();
      setPreviousPhase(phase);
      if (phase === "GAME" || phase === "WARMUP") {
          setSavedTime(timeLeft);
          setTimerActive(false);
      }
      setPhase("STATS");
  };

  const closeTelemetry = () => {
      sfx.click();
      setPhase(previousPhase);
      if (previousPhase === "GAME" || previousPhase === "WARMUP") {
          setTimeLeft(savedTime);
          setTimerActive(true); 
      }
  };

  const handleNextPhase = () => {
      if (phase === "CORRECT") {
          if (currentQData.isAi === false && !pendingAIQ) {
              setPhase("LOADING");
          } else {
              generateNew(); 
          }
      } else if (phase === "MICROCLASS") {
          retrySameQuestion(); 
      }
  };

  // =========================================================
  // SISTEMA DE IMPRESIÓN/DESCARGA DEL DOSSIER MAPPING LOCALIZATION
  // =========================================================
  const downloadReport = useCallback(() => {
      sfx.scanSweep();
      const date = new Date().toLocaleString();
      
      const acc = stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0;
      const avgT = stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0;
      
      const strong = [];
      const weak = [];
      
      let topicsHtml = '';
      Object.keys(stats.topics).forEach(topicId => {
          const t = stats.topics[topicId];
          const total = t.c + t.w;
          if (total > 0) {
              const pct = Math.round((t.c / total) * 100);
              // Recuperamos el nombre traducido del tópico
              const translatedName = IcfesEngine.getTopicName(topicId, safeLang);
              topicsHtml += `
                <div style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 16px; color: #0f172a;">${translatedName}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">${REPORT_UI.topicHit}: <span style="color:#10b981; font-weight:bold;">${t.c}</span> | ${REPORT_UI.topicMiss}: <span style="color:#ef4444; font-weight:bold;">${t.w}</span></div>
                    </div>
                    <div style="font-size: 20px; font-weight: 900; color: ${pct >= 60 ? '#10b981' : '#ef4444'};">${pct}%</div>
                </div>
              `;
              if (pct >= 60) strong.push(translatedName);
              else weak.push(translatedName);
          }
      });

      let aiVeredict = '';
      if (weak.length > 0) {
          aiVeredict = `
            <div style="background-color: #fef2f2; border-left: 6px solid #ef4444; padding: 20px; border-radius: 4px;">
                <div style="color: #b91c1c; font-weight: 900; font-size: 18px; margin-bottom: 10px;">${REPORT_UI.aiVuln}</div>
                <p style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 14px;">${REPORT_UI.aiVulnDesc}</p>
                <ul style="color: #991b1b; margin: 0 0 15px 0; font-weight: bold;">
                    ${weak.map(w => `<li style="margin-bottom: 5px;">${w}</li>`).join('')}
                </ul>
                <div style="background-color: #fee2e2; padding: 10px; border-radius: 4px; border: 1px dashed #fca5a5;">
                    <strong style="color: #991b1b;">${REPORT_UI.aiAction}:</strong> ${REPORT_UI.aiActionDesc}
                </div>
            </div>`;
      } else if (strong.length > 0) {
          aiVeredict = `
            <div style="background-color: #f0fdf4; border-left: 6px solid #10b981; padding: 20px; border-radius: 4px;">
                <div style="color: #047857; font-weight: 900; font-size: 18px; margin-bottom: 10px;">${REPORT_UI.aiOpt}</div>
                <p style="color: #065f46; margin: 0;">${REPORT_UI.aiOptDesc}</p>
            </div>`;
      } else {
          aiVeredict = `<div style="color: #64748b; font-style: italic; padding: 20px; background: #f8fafc; border-radius: 4px;">${REPORT_UI.aiNoData}</div>`;
      }

      const printWindow = window.open('', '', 'height=900,width=850');
      printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${safeLang}">
              <head>
                  <title>Learning Labs - Tactical Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      
                      body { 
                          font-family: 'Inter', sans-serif; 
                          background-color: #ffffff; 
                          color: #0f172a; 
                          margin: 0; 
                          padding: 0;
                          -webkit-print-color-adjust: exact; 
                          print-color-adjust: exact;
                      }
                      
                      .container {
                          max-width: 800px;
                          margin: 0 auto;
                          padding: 40px;
                      }
                      
                      .header { 
                          display: flex; 
                          align-items: center; 
                          border-bottom: 4px solid #00f2ff; 
                          padding-bottom: 30px; 
                          margin-bottom: 40px; 
                      }
                      
                      .logo { 
                          width: 140px; 
                          height: auto; 
                          margin-right: 30px; 
                          border-radius: 12px;
                          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                      }
                      
                      .title h1 { 
                          margin: 0 0 5px 0; 
                          color: #0f172a; 
                          font-size: 32px; 
                          font-weight: 900;
                          letter-spacing: -0.5px;
                          text-transform: uppercase; 
                      }
                      
                      .title p { 
                          margin: 0; 
                          color: #64748b; 
                          font-size: 15px; 
                          font-weight: 700;
                          text-transform: uppercase;
                          letter-spacing: 1px;
                      }

                      .timestamp {
                          margin-top: 10px;
                          display: inline-block;
                          background: #f1f5f9;
                          padding: 5px 10px;
                          border-radius: 4px;
                          font-size: 12px;
                          color: #475569;
                          font-weight: bold;
                      }
                      
                      .section-title {
                          font-size: 20px;
                          font-weight: 900;
                          color: #0f172a;
                          text-transform: uppercase;
                          margin-bottom: 20px;
                          display: flex;
                          align-items: center;
                      }
                      
                      .section-title::before {
                          content: '';
                          display: inline-block;
                          width: 12px;
                          height: 12px;
                          background-color: #00f2ff;
                          margin-right: 10px;
                          border-radius: 2px;
                      }
                      
                      .kpi-grid { 
                          display: grid;
                          grid-template-columns: repeat(3, 1fr);
                          gap: 20px;
                          margin-bottom: 40px; 
                      }
                      
                      .kpi-card { 
                          background: #f8fafc; 
                          border: 1px solid #e2e8f0;
                          border-radius: 12px; 
                          padding: 25px 20px; 
                          text-align: center; 
                      }
                      
                      .kpi-val { 
                          font-size: 42px; 
                          font-weight: 900; 
                          color: #0f172a;
                          line-height: 1;
                          margin-bottom: 5px;
                      }
                      
                      .kpi-label { 
                          font-size: 13px; 
                          color: #64748b; 
                          font-weight: 700;
                          text-transform: uppercase; 
                          letter-spacing: 0.5px;
                      }

                      .topics-container {
                          background: #f8fafc;
                          border: 1px solid #e2e8f0;
                          border-radius: 12px;
                          padding: 30px;
                          margin-bottom: 40px;
                      }

                      .footer { 
                          text-align: center; 
                          margin-top: 60px; 
                          font-size: 12px; 
                          color: #94a3b8; 
                          border-top: 1px solid #e2e8f0; 
                          padding-top: 20px; 
                          font-weight: bold;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          <img src="https://res.cloudinary.com/dukiyxfvn/image/upload/v1768668244/WhatsApp_Image_2026-01-11_at_4.25.52_PM_p8aicp.jpg" class="logo" alt="Learning Labs" />
                          <div class="title">
                              <h1>${REPORT_UI.docTitle}</h1>
                              <p>${REPORT_UI.docSub}</p>
                              <div class="timestamp">${REPORT_UI.dateLabel}: ${date}</div>
                          </div>
                      </div>

                      <div class="section-title">${REPORT_UI.kpiTitle}</div>
                      <div class="kpi-grid">
                          <div class="kpi-card">
                              <div class="kpi-val" style="color: ${acc >= 60 ? '#10b981' : '#ef4444'}">${acc}%</div>
                              <div class="kpi-label">${REPORT_UI.kpiAcc}</div>
                          </div>
                          <div class="kpi-card">
                              <div class="kpi-val">${avgT}s</div>
                              <div class="kpi-label">${REPORT_UI.kpiTime}</div>
                          </div>
                          <div class="kpi-card">
                              <div class="kpi-val">${stats.totalQ}</div>
                              <div class="kpi-label">${REPORT_UI.kpiTotal}</div>
                          </div>
                      </div>

                      <div class="section-title">${REPORT_UI.aiTitle}</div>
                      <div style="margin-bottom: 40px;">
                          ${aiVeredict}
                      </div>

                      <div class="section-title">${REPORT_UI.topicTitle}</div>
                      <div class="topics-container">
                          ${topicsHtml || `<p style="color: #64748b; text-align: center; font-style: italic;">${REPORT_UI.topicNoData}</p>`}
                      </div>

                      <div class="footer">
                          ${REPORT_UI.footer}<br/>
                          ${REPORT_UI.footerSub}
                      </div>
                  </div>
              </body>
          </html>
      `);
      printWindow.document.close();
      
      setTimeout(() => {
          printWindow.focus();
          printWindow.print();
      }, 750);
  }, [stats, safeLang, REPORT_UI]);

  return (
    <>
      <style>{`
        .hud-btn { padding: clamp(15px, 2vw, 20px) clamp(20px, 4vw, 40px); background: #00f2ff; color: #000; font-weight: 900; font-size: clamp(16px, 3vw, 24px); cursor: pointer; border-radius: 8px; border: none; font-family: 'Orbitron', monospace; transition: 0.2s; box-shadow: 0 0 20px rgba(0,242,255,0.4); text-transform: uppercase; }
        .hud-btn:hover { transform: scale(1.05); }
        .hud-btn:disabled { background: #555; color:#888; box-shadow: none; cursor:not-allowed; transform: none; }
        .opt-btn { display: block; width: 100%; margin: 15px 0; padding: clamp(15px, 3vw, 25px); background: rgba(0,20,40,0.8); border: 2px solid #555; color: #fff; font-size: clamp(16px, 3vw, 22px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.3s; font-family: 'Orbitron'; line-height: 1.4; }
        .opt-btn:hover { background: rgba(255,255,255,0.1); border-color: #aaa; }
        .opt-btn.selected { border-color: #ffea00; background: rgba(255,234,0,0.2); box-shadow: 0 0 20px rgba(255,234,0,0.4); color: #ffea00; }
        .glass-panel { background: rgba(0,10,20,0.85); border: 2px solid #00f2ff; backdrop-filter: blur(20px); border-radius: 15px; box-shadow: 0 0 40px rgba(0,242,255,0.15); padding: clamp(20px, 4vw, 40px); }
        .hud-pulse { animation: pulse 1s infinite; }
        @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
        
        .timer-danger { background: #ffaa00 !important; }
        .timer-critical { background: #f00 !important; animation: shake 0.5s infinite; }
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
      `}</style>
      
      <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif' }}>
        
        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#000510', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
            <h1 style={{color:'#00f2ff', fontSize:'clamp(40px, 8vw, 80px)', textShadow:'0 0 50px #00f2ff', textAlign:'center', margin: '0 0 20px 0'}}>{UI.title}</h1>
            {phase === "THEORY" && <p style={{color:'#fff', fontSize:'clamp(16px, 3vw, 24px)', maxWidth:'800px', textAlign:'center', marginBottom:'40px', lineHeight:'1.6', borderLeft: '4px solid #ffea00', paddingLeft: '20px'}}>{UI.theoryText}</p>}
            
            <div style={{display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
                <button className="hud-btn" onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>{phase === "BOOT" ? UI.start : "EMPEZAR EVALUACIÓN"}</button>
                <button className="hud-btn" style={{background:'rgba(30,30,30,0.8)', color:'#00f2ff', border:'2px solid #00f2ff'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
            </div>
          </div>
        )}

        {/* NÚCLEO 3D DE FONDO */}
        {phase !== "BOOT" && phase !== "THEORY" && (
          <>
            <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
              <Suspense fallback={null}>
                <Canvas camera={{position:[0, 2, 28], fov:45}}>
                  <Core3D isExploding={phase === "MICROCLASS"} scannerActive={scannerActive} timeRatio={(MAX_TIME - timeLeft)/MAX_TIME} isLoading={phase === "LOADING"} />
                </Canvas>
              </Suspense>
            </div>

            {/* HEADER ESTADÍSTICAS Y TELEMETRÍA */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 500, flexWrap:'wrap', gap:'10px' }}>
              <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                  {currentQData && (phase === "GAME" || phase === "WARMUP") && (
                     <div className={stats.needsReview.includes(currentQData?.id) ? 'hud-pulse' : ''} style={{background: stats.needsReview.includes(currentQData?.id) ? '#ffea00' : '#ff0055', color: stats.needsReview.includes(currentQData?.id) ? '#000' : '#fff', padding:'10px 20px', borderRadius:'10px', fontWeight:'bold', fontSize:'clamp(12px, 3vw, 16px)'}}>
                         {UI.topic}: {currentQData?.topic} {stats.needsReview.includes(currentQData?.id) ? ' ⚠️' : ''}
                     </div>
                  )}
                  {phase === "WARMUP" && (
                      <div className="hud-pulse" style={{background: '#ffaa00', color: '#000', padding:'10px 20px', borderRadius:'10px', fontWeight:'bold', fontSize:'clamp(12px, 3vw, 16px)'}}>
                          {UI.warmupTitle}
                      </div>
                  )}
                  <div style={{color:'#0f0', fontWeight:'bold', fontSize:'clamp(16px, 3vw, 20px)'}}>XP: {xp}</div>
              </div>
              {phase !== "STATS" && phase !== "LOADING" && (
                 <button className="hud-btn" style={{background:'rgba(30,30,30,0.8)', color:'#00f2ff', border:'2px solid #00f2ff', padding:'10px 20px', fontSize:'14px', boxShadow:'none'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
              )}
            </div>

            {/* SEÑALADOR DE DEEPSEEK NEURAL MATRIX */}
            {phase === "GAME" && (
               <div style={{position: 'absolute', bottom: '15px', right: '15px', color: currentQData?.isAi ? '#ff00ff' : '#00f2ff', fontSize: '12px', fontWeight: 'bold', zIndex: 100, textShadow: currentQData?.isAi ? '0 0 10px #ff00ff' : 'none', letterSpacing: '1px'}}>
                  {currentQData?.isAi ? "🧠 DEEPSEEK NEURAL MATRIX ACTIVE" : "⚙️ ALGORITHMIC FALLBACK ACTIVE"}
               </div>
            )}

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {(phase === "GAME" || phase === "WARMUP") && (
                <div style={{position:'absolute', top:'80px', left:'50%', transform:'translateX(-50%)', width:'90%', maxWidth:'800px', zIndex:100, display:'flex', flexDirection:'column', alignItems:'center'}}>
                    {phase === "WARMUP" && <div style={{color: '#ffaa00', fontSize: '14px', marginBottom: '5px'}}>{UI.warmupSub}</div>}
                    <div style={{color: timeLeft > 30 ? '#00f2ff' : (timeLeft > 15 ? '#ffaa00' : '#f00'), fontSize:'clamp(20px, 4vw, 28px)', fontWeight:'bold', marginBottom:'10px', textShadow: timeLeft <= 15 ? '0 0 10px #f00' : 'none'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {UI.time}: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '100%', height:'15px', background:'rgba(255,255,255,0.1)', borderRadius:'10px', overflow:'hidden', border: '1px solid #444'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/(phase === "WARMUP" ? WARMUP_TIME : MAX_TIME))*100}%`, height:'100%', background: phase === "WARMUP" ? '#ffaa00' : '#00f2ff', borderRadius:'10px', transition:'width 1s linear, background 0.5s'}} />
                    </div>
                    
                    {!scannerActive && phase === "GAME" && (
                        <button className="hud-btn" style={{background:'rgba(0,255,0,0.1)', border:'2px solid #0f0', color:'#0f0', marginTop:'20px', fontSize:'clamp(12px, 3vw, 16px)', padding:'10px 20px', backdropFilter:'blur(10px)'}} onClick={toggleScanner}>
                            👁️ {UI.scan} (-50 XP)
                        </button>
                    )}
                </div>
            )}

            {/* PREGUNTA Y OPCIONES */}
            {(phase === "GAME" || phase === "WARMUP") && currentQ && (
              <div style={{ position:'absolute', top:'clamp(160px, 25vh, 200px)', left:'50%', transform:'translateX(-50%)', width: '95%', maxWidth:'1000px', zIndex:100 }}>
                <div className="glass-panel" style={{maxHeight:'65vh', overflowY:'auto', borderColor: phase === "WARMUP" ? '#ffaa00' : '#00f2ff'}}>
                  <h2 style={{color:'#fff', fontSize:'clamp(18px, 4vw, 26px)', lineHeight:'1.6', fontWeight:'normal', margin:0}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div className="hud-pulse" style={{background:'rgba(0,242,255,0.1)', borderLeft:'5px solid #00f2ff', padding:'15px', margin:'20px 0', color:'#00f2ff', fontSize:'clamp(16px, 3.5vw, 20px)', fontWeight:'bold'}}>
                          🤖 {UI.aiBtn}: {currentQ.hint}
                      </div>
                  )}

                  <div style={{marginTop:'30px'}}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'bold', marginRight:'15px', color: selectedOpt === i ? '#ffea00' : '#00f2ff'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'center', marginTop:'40px'}}>
                      <button className="hud-btn" style={{width:'100%', height:'clamp(60px, 8vw, 80px)', fontSize:'clamp(18px, 4vw, 28px)', background: phase === "WARMUP" ? '#ffaa00' : '#00f2ff'}} disabled={selectedOpt === null} onClick={submitAnswer}>{UI.btnCheck}</button>
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY: RESPUESTA CORRECTA */}
            {phase === "CORRECT" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,40,0,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', backdropFilter:'blur(10px)', padding:'20px', textAlign:'center' }}>
                  <h1 className="hud-pulse" style={{color:'#0f0', fontSize:'clamp(40px, 8vw, 80px)', textShadow:'0 0 50px #0f0', margin:0}}>{UI.correctTitle}</h1>
                  <p style={{color:'#fff', fontSize:'clamp(20px, 4vw, 30px)', marginTop:'20px'}}>XP: <span style={{color:'#0f0', fontWeight:'bold'}}>+{hintUsed ? '50' : '200'}</span></p>
                  <p style={{color:'#aaa', fontSize:'clamp(14px, 3vw, 20px)'}}>{UI.time}: {MAX_TIME - timeLeft}s</p>
                  <button className="hud-btn" style={{marginTop:'50px', background:'#0f0', color:'#000'}} onClick={handleNextPhase}>{UI.btnNext}</button>
              </div>
            )}

            {/* OVERLAY: MICRO-CLASE SOCRÁTICA */}
            {phase === "MICROCLASS" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(40,0,0,0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px', backdropFilter:'blur(10px)' }}>
                  <div className="glass-panel" style={{borderColor:'#f00', maxWidth:'1000px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,0,0.3)', maxHeight:'90vh', overflowY:'auto'}}>
                      <h1 style={{color:'#f00', fontSize:'clamp(28px, 6vw, 50px)', marginBottom:'20px', textAlign:'center', borderBottom:'2px solid #f00', paddingBottom:'10px'}}>
                          ⚠️ {timeLeft === 0 ? UI.timeout : UI.wrongTitle}
                      </h1>
                      
                      {currentQData?.trapExplanations && currentQData.trapExplanations[selectedOpt] && (
                          <div style={{color:'#ffaa00', fontSize:'clamp(16px, 3.5vw, 22px)', marginTop:'15px', padding:'20px', background:'rgba(255,170,0,0.1)', borderLeft:'5px solid #ffaa00', fontWeight:'bold'}}>
                              {currentQData.trapExplanations[selectedOpt]}
                          </div>
                      )}

                      <div style={{color:'#fff', fontSize:'clamp(16px, 3.5vw, 24px)', lineHeight:'1.8', background:'rgba(0,0,0,0.6)', padding:'clamp(15px, 4vw, 30px)', borderRadius:'10px', whiteSpace:'pre-wrap', borderLeft:'5px solid #00f2ff', marginTop:'20px'}}>
                          <MarkdownParser text={currentQData?.microclass} />
                      </div>
                      
                      <div style={{display:'flex', justifyContent:'center'}}>
                          <button className="hud-btn" style={{marginTop:'40px', background:'#ffea00', color:'#000', width:'100%', height:'clamp(60px, 8vw, 80px)', fontSize:'clamp(18px, 4vw, 24px)'}} onClick={handleNextPhase}>{UI.btnRetrySame}</button>
                      </div>
                  </div>
              </div>
            )}

            {/* DASHBOARD TELEMETRÍA */}
            {phase === "STATS" && !showAiModal && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(0,10,30,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                  <div className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
                      <h2 style={{color:'#00f2ff', textAlign:'center', fontSize:'clamp(24px, 5vw, 40px)', borderBottom:'2px solid #00f2ff', paddingBottom:'15px', margin:0}}>{UI.dashboard}</h2>
                      
                      {/* KPIs */}
                      <div style={{display:'flex', justifyContent:'space-around', flexWrap:'wrap', margin:'40px 0', gap:'20px'}}>
                          <div style={{textAlign:'center', color:'#fff', background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px', flex:'1 1 200px'}}>
                              <div style={{fontSize:'clamp(40px, 8vw, 60px)', fontWeight:'bold', color: stats.totalQ === 0 ? '#aaa' : (stats.correctQ/stats.totalQ > 0.6 ? '#0f0' : '#ff0055')}}>
                                  {stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0}%
                              </div>
                              <div style={{fontSize:'clamp(14px, 3vw, 18px)', letterSpacing:'1px', color:'#aaa'}}>{UI.mastery}</div>
                          </div>
                          <div style={{textAlign:'center', color:'#fff', background:'rgba(255,255,255,0.05)', padding:'20px', borderRadius:'15px', flex:'1 1 200px'}}>
                              <div style={{fontSize:'clamp(40px, 8vw, 60px)', fontWeight:'bold', color:'#ffea00'}}>
                                  {stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0}s
                              </div>
                              <div style={{fontSize:'clamp(14px, 3vw, 18px)', letterSpacing:'1px', color:'#aaa'}}>{UI.avgTime}</div>
                          </div>
                      </div>

                      {/* BOTÓN IA SOCRÁTICO */}
                      <div style={{display:'flex', justifyContent:'center', marginBottom:'30px'}}>
                         <button 
                            className="hud-btn" 
                            style={{background: failedTopics.length > 0 ? '#ff00ff' : '#0f0', color: failedTopics.length > 0 ? '#fff' : '#000', width: '100%', maxWidth: '600px', boxShadow: failedTopics.length > 0 ? '0 0 30px #ff00ff' : '0 0 30px #0f0'}} 
                            onClick={() => { sfx.aiPop(); setShowAiModal(true); }}
                         >
                            🧠 {UI.aiSocraticBtn}
                         </button>
                      </div>

                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'20px'}}>
                          {Object.keys(stats.topics).map(topicId => {
                              const t = stats.topics[topicId];
                              const total = t.c + t.w;
                              if (total === 0) return null; 
                              const pct = total > 0 ? Math.round((t.c/total)*100) : 0;
                              const isFailed = t.w > 0;
                              
                              const displayName = IcfesEngine.getTopicName(topicId, safeLang);

                              return (
                                  <div key={topicId} className={isFailed ? 'hud-pulse' : ''} style={{background:'rgba(0,0,0,0.5)', padding:'20px', borderRadius:'10px', border: isFailed ? '2px solid #f00' : '1px solid #333'}}>
                                      <div style={{color: isFailed ? '#f00' : '#00f2ff', fontWeight:'bold', marginBottom:'15px', fontSize:'clamp(12px, 3vw, 16px)'}}>
                                          {displayName} {isFailed ? ' ⚠️' : ''}
                                      </div>
                                      <div style={{width:'100%', height:'15px', background:'#222', borderRadius:'5px', overflow:'hidden'}}>
                                          <div style={{width:`${pct}%`, height:'100%', background: pct >= 60 ? '#0f0' : (pct > 0 ? '#ffea00' : '#ff0055')}}></div>
                                      </div>
                                      <div style={{color:'#aaa', fontSize:'14px', marginTop:'10px', display:'flex', justifyContent:'space-between'}}>
                                          <span>{REPORT_UI.topicHit}: <span style={{color:'#0f0'}}>{t.c}</span></span>
                                          <span>{REPORT_UI.topicMiss}: <span style={{color:'#f00'}}>{t.w}</span></span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* BOTONES DE ACCIÓN: INCLUYE EL DOSSIER PDF */}
                      <div style={{display:'flex', justifyContent:'center', marginTop:'50px', gap:'20px', flexWrap:'wrap'}}>
                          <button className="hud-btn" style={{flex:'1 1 250px', background:'transparent', border:'2px solid #00f2ff', color:'#00f2ff'}} onClick={downloadReport}>📄 {UI.downloadReport}</button>
                          <button className="hud-btn" style={{flex:'1 1 250px'}} onClick={closeTelemetry}>VOLVER A LA MISIÓN</button>
                          <button className="hud-btn" style={{flex:'1 1 250px', background:'transparent', border:'2px solid #f00', color:'#f00'}} onClick={() => { window.localStorage.removeItem('icfes_telemetry_v7'); window.location.reload(); }}>{UI.btnRetry}</button>
                      </div>
                  </div>
              </div>
            )}

            {/* MODAL IA INTERACTIVA */}
            {showAiModal && phase === "STATS" && (
               <div style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(20,0,20,0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)', backdropFilter:'blur(10px)' }}>
                   <div className="glass-panel" style={{borderColor:'#ff00ff', maxWidth:'1200px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,255,0.3)', maxHeight:'95vh', minHeight:'80vh', overflowY:'auto'}}>
                       
                       {failedTopics.length > 0 ? (
                           <>
                               {!activeAiTopic ? (
                                   <>
                                       <h2 style={{color:'#ff00ff', fontSize:'clamp(24px, 5vw, 40px)', textAlign:'center', marginBottom:'30px'}}>{UI.aiSelectTopic}</h2>
                                       <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                           {failedTopics.map((topicId, i) => (
                                               <button key={i} className="opt-btn" style={{borderColor:'#ff00ff', color:'#fff', fontSize: '20px', padding: '20px'}} onClick={() => { sfx.click(); setActiveAiTopic(topicId); }}>
                                                   🔬 INICIAR MASTERCLASS IA: {IcfesEngine.getTopicName(topicId, safeLang)}
                                               </button>
                                           ))}
                                       </div>
                                       <button className="hud-btn" style={{width:'100%', marginTop:'40px', background:'#555', color:'#fff'}} onClick={() => setShowAiModal(false)}>{UI.aiClose}</button>
                                   </>
                               ) : (
                                   <SocraticMasterclass 
                                      topic={activeAiTopic} 
                                      lang={safeLang} 
                                      onBack={() => { sfx.click(); setActiveAiTopic(null); }} 
                                      onClose={() => { sfx.click(); setShowAiModal(false); }} 
                                      UI={UI} 
                                   />
                               )}
                           </>
                       ) : (
                           <>
                             <h2 style={{color:'#0f0', fontSize:'clamp(20px, 4vw, 32px)', textAlign:'center', margin:'30px 0'}}>{UI.aiPraise}</h2>
                             <button className="hud-btn" style={{width:'100%', background:'#0f0', color:'#000'}} onClick={() => setShowAiModal(false)}>CERRAR IA</button>
                           </>
                       )}
                   </div>
               </div>
            )}

          </>
        )}
      </div>
    </>
  );
}

export default function IcfesLab() {
  return (
    <GameErrorBoundary>
      <GameApp />
    </GameErrorBoundary>
  );
}