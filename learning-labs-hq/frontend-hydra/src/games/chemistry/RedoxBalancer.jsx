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
   🧠 2. MOTOR GENERATIVO ALGORÍTMICO (ESCUDO DE LATENCIA GOD TIER)
   Genera preguntas nivel ICFES instantáneas mientras DeepSeek procesa
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
      es: { topic: 'TERMODINÁMICA DE GASES', text: `Un investigador introduce un gas ideal en un recipiente de paredes rígidas indeformables. La presión inicial es de ${var1} atm a ${T1_C}°C. Si el reactor falla y se sobrecalienta hasta ${T2_C}°C, ¿qué presión soportará el contenedor?`, hint: "El recipiente rígido implica volumen constante. Aplica Ley de Gay-Lussac en Kelvin.", micro: `[EXPLICACIÓN DE FENÓMENOS - GASES]\n1. Al ser un recipiente rígido, el volumen es constante.\n2. Conversión obligatoria:\n   T₁ = ${T1_C} + 273.15 = ${T1_K}K\n   T₂ = ${T2_C} + 273.15 = ${T2_K}K.\n3. Mayor temperatura = mayor energía cinética = mayor presión (P1/T1 = P2/T2).\n4. (${var1} × ${T2_K}) / ${T1_K} = ${correctVal} atm.`, traps: [null, `Trampa Cognitiva: Operaste con grados Celsius directos.`, `Trampa Cognitiva: Invertiste la relación matemática.`, `Trampa Cognitiva: Sumaste en lugar de usar proporciones.`] },
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
      es: { topic: 'ESTEQUIOMETRÍA AVANZADA', text: `Durante el análisis de emisiones de un motor, se queman exactamente ${inputGrams}g de ${react.name.es} (${react.f}) con oxígeno ilimitado. La ecuación sin balancear es: ${react.f} + O₂ ➔ CO₂ + H₂O. ¿Cuántos gramos exactos de dióxido de carbono (CO₂) se emitirán a la atmósfera? (Masas Molares: ${react.f}=${react.mass}g/mol, CO₂=${react.prodMass}g/mol).`, hint: "¡Cuidado! El ICFES a menudo te da la ecuación desbalanceada. 1. Balancea los Carbonos. 2. Pasa gramos a moles. 3. Aplica la relación molar. 4. Pasa a gramos de CO2.", micro: `1. Ecuación balanceada en Carbonos: 1 mol de ${react.f} produce ${react.mRatio} moles de CO₂.\n2. Moles iniciales: ${inputGrams}g / ${react.mass}g/mol = ${inputMoles} moles de ${react.f}.\n3. Relación estequiométrica: ${inputMoles} × ${react.mRatio} = ${inputMoles * react.mRatio} moles de CO₂.\n4. Conversión final: ${inputMoles * react.mRatio} moles × ${react.prodMass}g/mol = ${correctGrams}g.`, traps: [null, `Trampa Clásica ICFES: Operaste directamente 1 a 1 sin balancear la ecuación química (${errorNoRatio}g).`, `Trampa: El resultado quedó expresado en moles, no en gramos.`, `Trampa: Invertiste la relación estequiométrica al dividir en lugar de multiplicar.`] },
      en: { topic: 'ADVANCED STOICHIOMETRY', text: `In the combustion of ${react.name.en} (${react.f}), if ${inputGrams}g react with excess oxygen, how many grams of ${react.prod} are emitted? (Molar Mass: ${react.f}=${react.mass}g/mol, ${react.prod}=${react.prodMass}g/mol).`, hint: "Grams -> Moles -> Ratio -> Grams.", micro: `Balanced reaction: 1 mol ${react.f} yields ${react.mRatio} mol ${react.prod}.\n1. ${inputGrams}g / ${react.mass}g/mol = ${inputMoles} moles.\n2. Ratio: ${inputMoles * react.mRatio} moles ${react.prod}.\n3. To grams: ${inputMoles * react.mRatio} × ${react.prodMass} = ${correctGrams}g.`, traps: [null, "Trap: Forgot stoichiometric coefficient.", "Trap: Stopped at moles.", "Trap: Inverted the ratio."] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ESTEQUIOMETRIA', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genDensityQuestion(lang) {
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
          es: { topic: 'PROPIEDADES INTENSIVAS', text: `Un mineral desconocido de forma irregular pesa ${mass} g. Un geólogo lo sumerge en una probeta con ${initialVol} mL de agua. El volumen se desplaza hasta los ${finalVol} mL. Sabiendo que la densidad es una propiedad intensiva, ¿cuál es su valor exacto?`, hint: "Arquímedes: El volumen del sólido es exactamente igual al volumen de agua desplazada (Volumen Final - Volumen Inicial).", micro: `1. Volumen desplazado por el mineral: ${finalVol}mL - ${initialVol}mL = ${volume}mL.\n2. Ecuación de densidad: d = m/V = ${mass}g / ${volume}mL = ${correctDensity} g/mL.\nEl ICFES busca que identifiques el principio de desplazamiento de líquidos.`, traps: [null, `Trampa ICFES: Usaste el volumen total de la probeta (${finalVol}mL) ignorando que ahí también hay agua.`, `Trampa: Usaste la fórmula al revés (Volumen / Masa). Eso es volumen específico, no densidad.`, `Trampa sin sentido físico: Sumaste el volumen inicial con el final.`] },
          en: { topic: 'INTENSIVE PROPERTIES', text: `A cylinder has ${initialVol} mL of water. A metal piece of ${mass} g is added, raising water to ${finalVol} mL. Exact density?`, hint: "Object volume = displaced water volume.", micro: `Displaced volume: ${finalVol}mL - ${initialVol}mL = ${volume}mL.\nDensity: ${mass}g / ${volume}mL = ${correctDensity} g/mL.`, traps: [null, "Trap: Used total final volume.", "Trap: Inverted formula (v/m).", "Trap: Added volumes improperly."] },
        };
        const langData = texts[lang] || texts['es'];
        return { id: 'DENSIDAD', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g/mL`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
    } else {
        const mass1 = Math.floor(Math.random() * 50) + 50; const vol1 = 10;
        const mass2 = Math.floor(Math.random() * 50) + 50; const vol2 = 20;
        const d1 = mass1/vol1; const d2 = mass2/vol2;
        const correctDensity = Number(((mass1+mass2)/(vol1+vol2)).toFixed(2));
        const errorAvg = Number(((d1+d2)/2).toFixed(2)); 
        const errorSum = Number((d1+d2).toFixed(2));

        const optionsRaw = [correctDensity, errorAvg, errorSum, Number((correctDensity*1.5).toFixed(2))];
        const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
        while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 8 + 1).toFixed(2)));
        const options = uniqueOptions.sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(correctDensity);

        const texts = {
          es: { topic: 'DENSIDAD DE ALEACIONES', text: `Para fabricar el blindaje de un dron, se funden ${mass1}g del Metal A (volumen = ${vol1}mL) con ${mass2}g del Metal B (volumen = ${vol2}mL). Asumiendo que los volúmenes son aditivos y la temperatura es constante, ¿cuál será la densidad teórica de la nueva aleación?`, hint: "¡ATENCIÓN! La densidad NO se puede promediar ni sumar. Debes sumar las masas totales y dividirlas entre el volumen total.", micro: `La densidad es una propiedad intensiva (no depende de la cantidad de materia), por ende no se promedia linealmente.\n1. Masa Total = ${mass1} + ${mass2} = ${mass1+mass2}g.\n2. Volumen Total = ${vol1} + ${vol2} = ${vol1+vol2}mL.\n3. Densidad Final = ${mass1+mass2} / ${vol1+vol2} = ${correctDensity} g/mL.`, traps: [null, `Trampa ICFES típica: Promediaste las densidades de cada metal. La densidad no es aditiva ni promediable así.`, `Trampa: Sumaste las densidades de manera directa.`, `Error matemático en el cociente.`] },
          en: { topic: 'MIXTURES & DENSITY', text: `Two metals are melted together: Metal A (${mass1}g, ${vol1}mL) and Metal B (${mass2}g, ${vol2}mL). Assuming additive volumes, what is the density of the alloy?`, hint: "Density is NOT the average. Use Total Mass / Total Volume.", micro: `Total Mass = ${mass1+mass2}g.\nTotal Vol = ${vol1+vol2}mL.\nAlloy Density = ${mass1+mass2} / ${vol1+vol2} = ${correctDensity} g/mL.`, traps: [null, "ICFES Trap: Averaged the densities.", "Trap: Summed densities.", "Math error."] },
        };
        const langData = texts[lang] || texts['es'];
        return { id: 'DENSIDAD', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} g/mL`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
    }
  }

  static genPhQuestion(lang) {
    const isOH = Math.random() > 0.5; 
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

    const ionStr = isOH ? "iones hidroxilo [OH⁻]" : "iones hidronio [H⁺]";
    const bodyFluid = isOH ? "fluidos intestinales" : "jugos gástricos";
    const ionStrEn = isOH ? "Hydroxide [OH⁻]" : "Hydronium [H⁺]";

    const texts = {
      es: { topic: 'EQUILIBRIO ÁCIDO-BASE', text: `Un gastroenterólogo analiza una muestra de ${bodyFluid} de un paciente a 25°C. Determina que la concentración de ${ionStr} es de ${coef}.0 × 10⁻${concExponent} M. Según las propiedades logarítmicas de las disoluciones acuosas, ¿cuál es el pH de la muestra del paciente?`, hint: isOH ? "¡ALERTA ICFES! La concentración dada es de OH⁻. Si sacas el logaritmo negativo obtendrás el pOH. Para el pH, recuerda que pH + pOH = 14." : "Aplica la propiedad rápida de logaritmos: -log(A × 10⁻ᴮ) = B - log(A).", micro: isOH ? `1. Como te dieron concentración básica, calculamos pOH: -log(${coef} × 10⁻${concExponent}) = ${pOH}.\n2. La constante disociación del agua a 25°C dicta que pH + pOH = 14.\n3. Por lo tanto, pH = 14 - ${pOH} = ${pH}.` : `Cálculo analítico directo: pH = -log([H⁺]) = -log(${coef} × 10⁻${concExponent}) = ${concExponent} - log(${coef}) = ${pH}.`, traps: [null, isOH ? `Trampa ICFES Clásica: Calculaste el pOH y marcaste ese número, olvidando restarlo de 14 para hallar el pH solicitado.` : `Trampa: Marcaste el pOH asumiendo que la ecuación da el pH inverso.`, `Trampa: Tomaste solo el exponente, ignorando el peso del coeficiente numérico.`, `Trampa: Restaste el exponente de 14 directamente sin aplicar el logaritmo.`] },
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
    let explES = diff > 1.7 ? "transferencia total de electrones" : (diff > 0.4 ? "compartición desigual de electrones formando polos" : "compartición equitativa de electrones");

    const optionsKeys = ['ionic', 'polar', 'apolar', 'metal'].sort(() => Math.random() - 0.5);
    const correctType = diff > 1.7 ? 'ionic' : (diff > 0.4 ? 'polar' : 'apolar');
    const correctIndex = optionsKeys.indexOf(correctType);

    const texts = {
      es: { topic: 'ENLACES QUÍMICOS Y POLARIDAD', text: `Un equipo de químicos sintetiza un nuevo compuesto diatómico. Los análisis espectroscópicos muestran que el Átomo A tiene una electronegatividad de ${en1} y el Átomo B de ${en2}. ¿Qué tipo de enlace rige la molécula y qué fenómeno electrónico ocurre en ella?`, hint: "Aplica la Escala de Pauling (ΔEN): > 1.7 (Iónico), entre 0.4 y 1.7 (Covalente Polar), < 0.4 (Apolar).", micro: `La diferencia matemática de electronegatividades es: |${en1} - ${en2}| = ${diff}.\nSegún Pauling, un diferencial de ${diff} indica un enlace ${bondTypeES}, lo que se traduce físicamente en una ${explES}.`, opts: { ionic: "Enlace Iónico (Transferencia electrónica)", polar: "Covalente Polar (Dipolos parciales)", apolar: "Covalente Apolar (Nube electrónica simétrica)", metal: "Enlace Metálico (Mar de electrones)" }, traps: [null, null, null, null] },
      en: { topic: 'CHEMICAL BONDS', text: `Molecule formed by Atom A (EN=${en1}) and Atom B (EN=${en2}). Based on electronegativity, what is the bond type?`, hint: "> 1.7 (Ionic), 0.4 - 1.7 (Polar), < 0.4 (Apolar).", micro: `Diff: |${en1} - ${en2}| = ${diff}.`, opts: { ionic: "Ionic Bond", polar: "Polar Covalent", apolar: "Non-polar Covalent", metal: "Metallic Bond" }, traps: [null, null, null, null] },
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ENLACES_QUIMICOS', isAi: false, topic: langData.topic, text: langData.text, options: optionsKeys.map(k => langData.opts[k]), optionsKeys: optionsKeys, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genElectronConfigQuestion(lang) {
    const atoms = [
      { name: {es:"Fósforo", en:"Phosphorus"}, z: 15, config: "[Ne] 3s² 3p³", period: 3, group: "VA", type: "No metal" },
      { name: {es:"Potasio", en:"Potassium"}, z: 19, config: "[Ar] 4s¹", period: 4, group: "IA", type: "Metal Alcalino" },
      { name: {es:"Azufre", en:"Sulfur"}, z: 16, config: "[Ne] 3s² 3p⁴", period: 3, group: "VIA", type: "No metal" }
    ];
    const atom = atoms[Math.floor(Math.random() * atoms.length)];
    const correctAns = `Periodo ${atom.period}, Grupo ${atom.group} (${atom.type})`; 
    const error1 = `Periodo ${atom.period - 1}, Grupo ${atom.group}`; 
    const error2 = `Periodo ${atom.period}, Grupo ${atom.group.replace('A', 'B')} (Transición)`; 
    const error3 = `Periodo 2, Grupo VIIIA (Gas Noble)`;
    
    const optionsRaw = [correctAns, error1, error2, error3]; 
    const options = optionsRaw.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAns);

    const texts = {
      es: { topic: 'ESTRUCTURA Y TABLA PERIÓDICA', text: `Durante una prueba de espectrometría, se descubre que la configuración electrónica de valencia de un átomo neutro de ${atom.name.es} termina en ${atom.config}. Basándose en esta información microscópica, ¿cuál es su ubicación macroscópica y clasificación en la tabla periódica?`, hint: "El número cuántico principal mayor (el número grande antes de la letra) define el Periodo. Los electrones de valencia (superíndices en ese nivel) definen el Grupo.", micro: `Configuración: ${atom.config}.\n1. El coeficiente más alto es ${atom.period}, lo que define sus capas de energía (Periodo ${atom.period}).\n2. Al sumar los electrones de ese nivel de valencia obtenemos el Grupo ${atom.group}.\n3. Por su ubicación a la derecha/izquierda de la escalera periódica, es un ${atom.type}.`, traps: [null, "Trampa: Tomaste el número cuántico interior en lugar de la capa de valencia externa.", "Trampa ICFES: Confundiste los grupos representativos (A) con los metales de transición (B).", "Respuesta aleatoria para evaluar descarte."] },
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
      es: { topic: 'SOLUCIONES QUÍMICAS Y CONCENTRACIÓN', text: `Un analista de calidad debe preparar suero fisiológico simulado. Disuelve ${massSolute} g de una sal clorurada (cuya masa molar es ${mmSolute} g/mol) en un aforo exacto hasta completar ${volumeLiters} Litros de solución. ¿Qué concentración molar (M) reportará en su bitácora?`, hint: "La Molaridad requiere estandarización a la cantidad de partículas. M = Moles / Litros. Nunca operes con gramos directamente.", micro: `El ICFES penaliza a quienes confunden gramos por litro (g/L) con Molaridad (mol/L).\nPaso 1: Convertir masa a moles para saber la cantidad de partículas reales. ${massSolute}g / ${mmSolute}g/mol = ${moles.toFixed(3)} moles.\nPaso 2: Relacionar con el volumen. M = ${moles.toFixed(3)} mol / ${volumeLiters} L = ${molarity} M.`, traps: [null, "Trampa Mortal ICFES: Dividiste los gramos directamente por los litros. Esa es la concentración másica, no la Molaridad.", "Trampa: Multiplicaste o dividiste mal los mililitros creyendo que el dato estaba en otra unidad.", "Trampa: Invertiste la fórmula (Litros sobre moles)."] },
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
        es: { topic: 'CONSERVACIÓN DE LA MASA', text: `Antoine Lavoisier estableció que la materia no se crea ni se destruye. En el pizarrón del laboratorio está escrita la siguiente reacción incompleta: \n\n${selected.eq} \n\n¿Qué valor exacto debe tomar el coeficiente X para que la ecuación no viole el principio de conservación de la masa?`, hint: `El átomo de ${selected.es} está desbalanceado. Cuenta cuántos hay en los productos y asegúrate de que entren los mismos en los reactivos.`, micro: `Las leyes termodinámicas exigen simetría atómica.\nEn los productos hay una cantidad determinada de átomos de ${selected.es}. Para que la balanza estequiométrica se cierre a la izquierda, el coeficiente multiplicador del reactivo (X) debe ser obligatoriamente ${correctAns}.`, traps: [null, "Contaste mal los subíndices de los productos.", "No multiplicaste el coeficiente de los productos por el subíndice atómico.", "Duplicaste el requerimiento estequiométrico innecesariamente."] },
        en: { topic: 'EQUATION BALANCING', text: `Equation: \n${selected.eq} \nFor Mass Conservation, what is the exact value of X?`, hint: `Count ${selected.en} atoms.`, micro: `Atoms must balance. X = ${correctAns}.`, traps: [null, null, null, null] },
      };
      const langData = texts[lang] || texts['es'];
      return { id: 'BALANCEO_ECUACIONES', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genIsotopeQuestion(lang) {
      const isos = [
          { name: "Cobalto-60", z: 27, a: 60, desc: "usado en radioterapia oncológica" },
          { name: "Yodo-131", z: 53, a: 131, desc: "usado como trazador de la glándula tiroides" }
      ];
      const iso = isos[Math.floor(Math.random() * isos.length)];
      const neutrons = iso.a - iso.z;
      const correctAns = neutrons; 
      const error1 = iso.a; const error2 = iso.z; const error3 = iso.a + iso.z;
      const optionsRaw = [correctAns, error1, error2, error3]; const options = optionsRaw.sort(() => Math.random() - 0.5); const correctIndex = options.indexOf(correctAns);

      const texts = {
        es: { topic: 'ESTRUCTURA NUCLEAR E ISÓTOPOS', text: `En un hospital de alta complejidad se administra el isótopo ${iso.name} (${iso.desc}). La ficha técnica indica un número atómico (Z) de ${iso.z} y un número másico (A) de ${iso.a}. Para comprender su nivel de radiación intrínseca, el radiólogo necesita saber: ¿Cuántos neutrones alberga exactamente su núcleo atómico?`, hint: "El núcleo alberga protones (Z) y neutrones. Juntos suman el número másico (A). Despeja los neutrones.", micro: `Un isótopo difiere en sus neutrones.\nSabemos que la Masa atómica (A) es la sumatoria de partículas del núcleo: Protones (Z) + Neutrones.\nPara despejar Neutrones: N = A - Z.\nCálculo: N = ${iso.a} - ${iso.z} = ${correctAns} neutrones pesados en el núcleo.`, traps: [null, "Trampa Visual: Elegiste la Masa Atómica (A) entera. Ahí estás sumando también los protones.", "Elegiste el número atómico (Z), que representa exclusivamente la nube de protones.", "Anotación matemática absurda: Sumaste protones y masa general."] },
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
          opts = { ans: "Incrementa la energía cinética de las moléculas, aumentando los choques efectivos", err1: "Disminuye la presión de activación del recipiente", err2: "Altera la estequiometría de los productos generados", err3: "Reduce la energía intrínseca de los enlaces covalentes" };
          text = `En la síntesis industrial del amoníaco, los ingenieros químicos elevan drásticamente la temperatura del reactor. ¿Cuál es el fenómeno microscópico que justifica por qué este aumento térmico acelera la velocidad de la reacción?`;
          hint = "Piensa en el Teoría de Colisiones. El calor es movimiento (energía cinética).";
          micro = "El calor es transferencia de energía térmica. Al aumentar la temperatura, las moléculas absorben esa energía como Energía Cinética, moviéndose caóticamente más rápido. Esto incrementa la frecuencia y la violencia de las colisiones moleculares, superando con mayor facilidad la barrera de activación.";
          traps = [null, "Trampa Conceptual: La temperatura no afecta la 'presión de activación', ese término no rige la cinética así.", "Trampa ICFES Clásica: La termodinámica cinética acelera el proceso, pero NUNCA cambia la estequiometría ni la naturaleza de los productos.", "Trampa Absurda: Calentar un sistema le inyecta energía, no la reduce."];
      } else {
          correctType = 'ans';
          opts = { ans: "Genera una ruta alterna que requiere una menor Energía de Activación", err1: "Inyecta calor directo a las moléculas reactivas", err2: "Se consume lentamente para potenciar los reactivos", err3: "Aumenta el rendimiento teórico máximo de producto" };
          text = `Al intentar descomponer peróxido de hidrógeno (agua oxigenada), la reacción es demasiado lenta. Sin embargo, al añadir unas gotas de yoduro de potasio (actuando como catalizador), la mezcla ebulle y genera oxígeno rápidamente. ¿Qué mecanismo alteró el catalizador para lograr esto?`;
          hint = "Los catalizadores NO inyectan energía ni cambian los reactivos. Ellos abren un 'atajo' en la barrera termodinámica.";
          micro = "Un catalizador funciona como un atajo topográfico. No inyecta energía ni se consume; simplemente provee una ruta molecular alterna que posee una colina termodinámica más baja (menor Energía de Activación). Así, a temperatura ambiente, más moléculas logran cruzar la barrera.";
          traps = [null, "Trampa Térmica: Los catalizadores no calientan el reactor, alteran los requerimientos del umbral.", "Trampa ICFES Tramposa: POR DEFINICIÓN, un verdadero catalizador NO se consume en la reacción. Entra y sale intacto.", "Trampa Termodinámica: Un catalizador hace que llegues al final más rápido, pero NUNCA altera la cantidad final de producto (rendimiento teórico)."];
      }

      const optionsKeys = ['ans', 'err1', 'err2', 'err3'].sort(() => Math.random() - 0.5);
      const correctIndex = optionsKeys.indexOf(correctType);
      
      const langData = { topic: 'CINÉTICA QUÍMICA', text, opts, hint, micro, traps };
      return { id: 'CINETICA_QUIMICA', isAi: false, topic: langData.topic, text: langData.text, optionsKeys: optionsKeys, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: {es: langData} };
  }
}

/* ============================================================
   🔊 3. MOTOR DE AUDIO SCI-FI (WEB AUDIO API NATIVA)
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
          this.gainNode.gain.value = 0.15; // Volumen balanceado
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
  click() { this._play('sine', 432, 216, 0.1, 0.05); } 
  success() { this._play('square', 432, 864, 0.5, 0.1); }
  error() { this._play('sawtooth', 150, 40, 0.6, 0.15); }
  scanSweep() { this._play('sine', 1200, 400, 0.4, 0.05); } 
  aiPop() { this._play('triangle', 600, 800, 0.3, 0.05); }
}
const sfx = new QuantumAudio();

/* ============================================================
   🌍 4. DICCIONARIOS UI Y CONSEJOS 
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR EVALUACIÓN ICFES", title: "LABORATORIO ICFES QUÍMICA", 
      scan: "ESCÁNER DE ANÁLISIS", aiBtn: "TUTORÍA IA",
      time: "TIEMPO REACCIÓN", mastery: "Maestría ICFES", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE ESCENARIO ➔",
      btnRetrySame: "REINTENTAR MATRIZ ➔", 
      correctTitle: "¡ANÁLISIS PERFECTO!", wrongTitle: "RUPTURA COGNITIVA",
      statsBtn: "TELEMETRÍA", theoryText: "ENTORNO DE CONCENTRACIÓN PROFUNDA (DEEP FOCUS) ACTIVADO. No hay distracciones visuales. El 100% de los escenarios son generados proceduralmente e integrados con IA, calibrados a las competencias del ICFES: Indagación, Uso de conceptos y Explicación de fenómenos.",
      timeout: "¡COLAPSO TÉRMICO (TIEMPO AGOTADO)!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD DE TELEMETRÍA GLOBAL", avgTime: "Tiempo Medio de Reacción",
      btnRetry: "PURGAR CACHÉ", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡RENDIMIENTO PERFECTO! NO HAY DEBILIDADES.",
      aiSelectTopic: "Selecciona el dominio a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME TÁCTICO",
      loadingData: "SINTETIZANDO MATRIZ ICFES VÍA DEEPSEEK...",
  },
  en: {
      start: "START ICFES EVALUATION", title: "ICFES CHEMISTRY LAB", scan: "INQUIRY SCANNER", aiBtn: "AI TUTOR", time: "REACTION TIME", mastery: "ICFES Mastery", btnCheck: "SYNTHESIZE ANSWER", btnNext: "NEXT SCENARIO ➔", btnRetrySame: "RETRY MATRIX ➔", correctTitle: "PERFECT ANALYSIS!", wrongTitle: "COGNITIVE RUPTURE", statsBtn: "TELEMETRY", theoryText: "DEEP FOCUS ENVIRONMENT ACTIVATED. No visual distractions. 100% of scenarios are generated by AI calibrated to ICFES competencies: Inquiry, Use of concepts, and Explanation of phenomena.", timeout: "THERMAL COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL TELEMETRY DASHBOARD", avgTime: "Avg Reaction Time", btnRetry: "PURGE CACHE", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT PERFORMANCE!", aiSelectTopic: "Select the domain to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD TACTICAL REPORT", loadingData: "SYNTHESIZING ICFES MATRIX VIA DEEPSEEK...",
  }
};

const DICT_REPORT = {
    es: {
        docTitle: "DOSSIER TÁCTICO ICFES", docSub: "SIMULACIÓN CUÁNTICA DE QUÍMICA",
        dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO",
        kpiAcc: "Precisión Neuronal", kpiTime: "Tiempo de Reacción", kpiTotal: "Matrices Resueltas",
        aiTitle: "VEREDICTO DEL SISTEMA DE INTELIGENCIA ARTIFICIAL",
        aiVuln: "⚠️ VULNERABILIDADES TÁCTICAS DETECTADAS",
        aiVulnDesc: "El operador muestra deficiencias críticas en las siguientes competencias químicas:",
        aiAction: "PLAN DE ACCIÓN DE IA",
        aiActionDesc: "Es imperativo solicitar el módulo 'Masterclass IA' dentro del simulador para re-entrenar el análisis de fenómenos en estos temas.",
        aiOpt: "✅ RENDIMIENTO ÓPTIMO ALCANZADO",
        aiOptDesc: "No se detectan vulnerabilidades críticas. El operador está calificado y listo para enfrentar escenarios ICFES de alta complejidad.",
        aiNoData: "Datos biométricos insuficientes. El operador debe completar más simulaciones.",
        topicTitle: "DESGLOSE MICRO-ANALÍTICO POR DOMINIO", topicNoData: "Aún no se han procesado suficientes dominios químicos.",
        topicHit: "Aciertos", topicMiss: "Fallos",
        footer: "DOCUMENTO CLASIFICADO GENERADO POR LEARNING LABS ENGINE V31.0", footerSub: "Entorno Deep Focus: El conocimiento es la única ventaja táctica inquebrantable."
    },
    en: {
        docTitle: "ICFES TACTICAL DOSSIER", docSub: "QUANTUM CHEMISTRY SIMULATION",
        dateLabel: "Extraction Date", kpiTitle: "GLOBAL PERFORMANCE METRICS",
        kpiAcc: "Neural Accuracy", kpiTime: "Reaction Time", kpiTotal: "Matrices Solved",
        aiTitle: "ARTIFICIAL INTELLIGENCE SYSTEM VERDICT",
        aiVuln: "⚠️ TACTICAL VULNERABILITIES DETECTED",
        aiVulnDesc: "The operator shows critical deficiencies in the following chemical competencies:",
        aiAction: "AI ACTION PLAN",
        aiActionDesc: "It is imperative to request the 'AI Masterclass' module within the simulator to retrain phenomena analysis on these topics.",
        aiOpt: "✅ OPTIMAL PERFORMANCE ACHIEVED",
        aiOptDesc: "No critical vulnerabilities detected. The operator is qualified and ready to face high-complexity ICFES scenarios.",
        aiNoData: "Insufficient biometric data. Complete more simulations.",
        topicTitle: "MICRO-ANALYTICAL DOMAIN BREAKDOWN", topicNoData: "Not enough chemical domains processed yet.",
        topicHit: "Hits", topicMiss: "Misses",
        footer: "CLASSIFIED DOCUMENT GENERATED BY LEARNING LABS ENGINE V31.0", footerSub: "Deep Focus Environment: Knowledge is the only unbreakable tactical advantage."
    }
};

const TIPS_DB = {
  es: [
    "COMPETENCIA ICFES: En preguntas de Indagación, fíjate en las variables de las gráficas. La respuesta siempre está en la relación entre el Eje X y el Eje Y.",
    "TRUCO ICFES: Cuando te hablen de reactivo limitante, no importa cuál pesa más en gramos, sino cuál se acaba primero según los coeficientes molares.",
    "OJO: Las propiedades intensivas (como densidad o punto de ebullición) NO cambian sin importar si tienes 1 gramo o 1 tonelada de la sustancia.",
    "ESTRATEGIA: En termodinámica, las moléculas no desaparecen al enfriarse, solo se mueven más lento (menor energía cinética).",
    "CONCEPTO: Si te preguntan por un cambio de fase (ej. hielo a agua), recuerda que la temperatura NO aumenta mientras el hielo se está derritiendo."
  ],
  en: [
    "ICFES COMPETENCY: In Inquiry questions, look at the graph variables. The answer is always in the relationship between the X and Y axes.",
    "ICFES TRICK: Limiting reactant isn't about which weighs more in grams, but which runs out first based on molar coefficients.",
    "WATCH OUT: Intensive properties (like density) DO NOT change whether you have 1 gram or 1 ton of the substance.",
    "STRATEGY: In thermodynamics, molecules don't disappear when cooled, they just move slower (lower kinetic energy).",
    "CONCEPT: During a phase change (e.g., ice to water), temperature DOES NOT increase while the ice is melting."
  ]
};

/* ============================================================
   🎥 5. COMPONENTE DE CARGA (INTERMISSION) CSS PURO (DEEP FOCUS)
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
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#020617', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px', textAlign: 'center' }}>
            {/* CSS Spinner Minimalista y Elegante */}
            <div style={{ width: '60px', height: '60px', border: '4px solid rgba(0, 242, 255, 0.1)', borderTop: '4px solid #00f2ff', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite', marginBottom: '40px', boxShadow: '0 0 15px rgba(0,242,255,0.2)' }}></div>
            
            <h1 className="hud-pulse" style={{color:'#00f2ff', fontSize:'clamp(16px, 3vw, 24px)', textShadow:'0 0 10px rgba(0,242,255,0.3)', margin: '0 0 50px 0', letterSpacing: '3px', fontWeight: 'bold', textTransform: 'uppercase'}}>
                {loadingText}
            </h1>
            
            <div style={{ background: 'rgba(255, 170, 0, 0.05)', borderLeft: '4px solid #f59e0b', padding: '30px', maxWidth: '800px', width: '100%', borderRadius: '0 12px 12px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ color: '#f59e0b', fontSize: '13px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 ICFES SURVIVAL TIP</div>
                <div style={{ color: '#e2e8f0', fontSize: 'clamp(16px, 3vw, 20px)', minHeight: '80px', transition: 'opacity 0.5s ease', lineHeight: '1.6' }}>
                    {tips[tipIdx]}
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, height: '3px', background: '#f59e0b', width: '100%', animation: 'shrink 8s linear infinite'}}></div>
            </div>
            
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes shrink { 0% { width: 100%; } 100% { width: 0%; } }
            `}</style>
        </div>
    );
};

/* ============================================================
   🤖 6. COMPONENTE MASTERCLASS DEEPSEEK (UX GOD TIER)
============================================================ */
const MarkdownParser = ({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text;
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:30px; border-bottom:1px solid rgba(0,242,255,0.3); padding-bottom:5px; font-size: 24px;">$1</h3>');
        parsed = parsed.replace(/## (.*)/g, '<h2 style="color:#f59e0b; margin-top:25px; font-size: 26px;">$1</h2>');
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffaa00;">$1</strong>');
        parsed = parsed.replace(/\\n/g, '<br/>'); 
        parsed = parsed.replace(/\n/g, '<br/>'); 
        return { __html: parsed };
    }, [text]);

    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#cbd5e1', fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.8', fontFamily: 'Inter, sans-serif' }} />;
};

const SocraticMasterclass = ({ topic, lang, onBack, onClose, UI }) => {
    const [classData, setClassData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [loadText, setLoadText] = useState("> ESTABLECIENDO CONEXIÓN CUÁNTICA DEEPSEEK...");
    const [errorObj, setErrorObj] = useState(false);
    
    const loadClass = useCallback(async () => {
        let isMounted = true;
        setIsGenerating(true);
        setErrorObj(false);

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO COMPETENCIAS ICFES PARA: " + getTopicName(topic)); }, 2000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO NÚCLEO TEÓRICO ANALÍTICO..."); }, 6000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO DATOS PEDAGÓGICOS..."); }, 12000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
            }
        } catch (err) {
            console.error("DeepSeek Error en Masterclass.", err);
            if (isMounted) {
                setErrorObj(true);
                setIsGenerating(false);
                sfx.error();
            }
        }
            
        return () => { 
            isMounted = false; 
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        };
    }, [topic, lang]);

    useEffect(() => {
        const cleanup = loadClass();
        return () => { if (cleanup && cleanup.then) cleanup.then(c => { if (c) c() }); };
    }, [loadClass]);

    if (isGenerating) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div className="loader-ring" style={{ width: '50px', height: '50px', border: '3px solid rgba(217, 70, 239, 0.1)', borderTop: '3px solid #d946ef', borderRadius: '50%', animation: 'spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite', marginBottom: '30px' }}></div>
                <div style={{ color: '#d946ef', fontFamily: 'monospace', fontSize: 'clamp(14px, 3vw, 18px)', lineHeight: '2', textAlign:'center' }}>
                    <p className="hud-pulse" style={{marginBottom: '20px', fontWeight: 'bold'}}>{loadText}</p>
                    <p style={{color: '#64748b'}}>_ Conexión segura. Encriptación 256-bit.</p>
                </div>
            </div>
        );
    }

    if (errorObj) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{color: '#ef4444'}}>ENLACE PERDIDO</h2>
                <p style={{color: '#94a3b8'}}>No se pudo establecer conexión con la red neuronal de Masterclass de DeepSeek. El firewall escolar puede estar bloqueando la señal o los servidores están saturados.</p>
                <button className="hud-btn" style={{marginTop: '30px'}} onClick={onBack}>VOLVER AL PANEL DE DOMINIOS</button>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)' }}>
           <h2 style={{color:'#d946ef', fontSize:'clamp(22px, 4vw, 32px)', textAlign:'center', borderBottom:'2px solid rgba(217, 70, 239, 0.3)', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px'}}>🎓 {classData.title || getTopicName(topic)}</h2>
           
           <div style={{ display: 'grid', gap: '25px', marginTop: '30px' }}>
              <div style={{ borderLeft: '4px solid #00f2ff', padding: '25px', background: 'rgba(0,242,255,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#00f2ff', marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap:'10px', textTransform:'uppercase'}}>📚 ANÁLISIS CONCEPTUAL ICFES</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '4px solid #ef4444', padding: '25px', background: 'rgba(239,68,68,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#ef4444', marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap:'10px', textTransform:'uppercase'}}>⚠️ TRAMPA COGNITIVA COMÚN</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '4px solid #f59e0b', padding: '25px', background: 'rgba(245,158,11,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#f59e0b', marginTop: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap:'10px', textTransform:'uppercase'}}>⚙️ PROTOCOLO TÁCTICO DE RESOLUCIÓN</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {classData.demoQuestion && (
               <div style={{ marginTop: '50px', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: 'clamp(20px, 4vw, 30px)', background: 'rgba(2, 6, 23, 0.8)' }}>
                   <h3 style={{color: '#10b981', textAlign: 'center', marginTop: 0, fontSize: '20px', textTransform:'uppercase'}}>🧪 SIMULACIÓN DE CASO (ALTO NIVEL)</h3>
                   <p style={{color: '#64748b', fontSize: '13px', textAlign: 'center', fontStyle: 'italic', marginBottom:'25px'}}>Problema generado de forma procedural y única.</p>
                   
                   <div style={{ color: '#f8fafc', fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                       {classData.demoQuestion.text}
                   </div>
                   
                   <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {classData.demoQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === classData.demoQuestion.correctIdx;
                          return (
                              <div key={idx} style={{ padding: '15px 20px', border: isCorrect ? '2px solid #10b981' : '1px solid #1e293b', background: isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'transparent', color: isCorrect ? '#10b981' : '#94a3b8', borderRadius: '8px', fontSize: 'clamp(15px, 2.5vw, 16px)', fontWeight: isCorrect ? 'bold' : 'normal' }}>
                                  {String.fromCharCode(65 + idx)}. {opt} {isCorrect && " ➔ (Respuesta Correcta)"}
                              </div>
                          );
                      })}
                   </div>
                   
                   <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                       <strong style={{fontSize: '18px', display:'block', marginBottom:'10px', textTransform:'uppercase'}}>EXPLICACIÓN FORENSE DEL ICFES:</strong>
                       <MarkdownParser text={classData.demoQuestion.analysis} />
                   </div>
               </div>
           )}

           <div style={{display:'flex', gap:'15px', marginTop:'50px', flexWrap: 'wrap'}}>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'transparent', borderColor:'#475569', color:'#94a3b8', padding: '15px'}} onClick={onBack}>VOLVER A DOMINIOS</button>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'transparent', border: '1px solid #d946ef', color:'#d946ef', padding: '15px'}} onClick={onClose}>{UI.aiClose}</button>
           </div>
        </div>
    )
}

/* ============================================================
   🎮 7. APLICACIÓN PRINCIPAL (PHANTOM QUEUE Y DEEP FOCUS)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('icfes_telemetry_quimica_v9'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0,
      correctQ: 0,
      totalTime: 0,
      topics: {
          'TERMODINÁMICA_Y_GASES_IDEALES': { c: 0, w: 0 },
          'ESTEQUIOMETRÍA_Y_CONSERVACIÓN_DE_MASA': { c: 0, w: 0 },
          'SEPARACIÓN_DE_MEZCLAS': { c: 0, w: 0 },
          'EQUILIBRIO_ÁCIDO_BASE_Y_PH': { c: 0, w: 0 },
          'ENLACES_QUÍMICOS_Y_PROPIEDADES': { c: 0, w: 0 },
          'QUÍMICA_ORGÁNICA_Y_GRUPOS_FUNCIONALES': { c: 0, w: 0 },
          'SOLUCIONES_Y_CONCENTRACIÓN': { c: 0, w: 0 },
          'CINETICA_QUÍMICA_Y_CATALIZADORES': { c: 0, w: 0 },
          'OXIDACIÓN_REDUCCIÓN_Y_ELECTROQUÍMICA': { c: 0, w: 0 }
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

  const [phase, setPhase] = useState("BOOT"); 
  const [currentQData, setCurrentQData] = useState(null); 
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [xp, setXp] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  
  // PHANTOM QUEUE STATE
  const [pendingAIQ, setPendingAIQ] = useState(null);
  const isFetchingAI = useRef(false); 

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
      window.localStorage.setItem('icfes_telemetry_quimica_v9', JSON.stringify(stats));
    }
  }, [stats]);

  const currentQ = useMemo(() => {
      if (!currentQData) return null;
      if (currentQData.texts) {
          // Si es del fallback local (raro ahora), resolvemos el idioma
          const d = currentQData.texts[safeLang] || currentQData.texts['es'];
          let displayOptions = currentQData.options;
          if (currentQData.optionsKeys) displayOptions = currentQData.optionsKeys.map(k => d.opts[k]);
          return { ...currentQData, topic: d.topic, text: d.text, options: displayOptions, hint: d.hint, microclass: d.micro, trapExplanations: d.traps };
      }
      // Si es de IA (DeepSeek), ya viene listo en el idioma solicitado
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
    } else if (timeLeft === 0 && phase === "GAME") {
        handleFailTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase]);

  // Transición suave de LOADING a GAME cuando la IA devuelve la pregunta
  useEffect(() => {
      if (phase === "LOADING" && pendingAIQ) {
          setCurrentQData(pendingAIQ);
          setSelectedOpt(null);
          setTimeLeft(MAX_TIME);
          setPhase("GAME");
          setTimerActive(true);
          setPendingAIQ(null);
          setConnectionError(false);
      }
  }, [phase, pendingAIQ]);

  // Fetch asíncrono a DeepSeek (ESCUDO DE LATENCIA MEJORADO)
  const fetchAIQuestionBackground = useCallback(async (forcedTopic) => {
      if (isFetchingAI.current) return;
      isFetchingAI.current = true;
      try {
          const q = await DeepSeekEngine.generateQuestion(safeLang, forcedTopic);
          if (isMounted.current) {
              setPendingAIQ(q);
              setConnectionError(false);
          }
      } catch (e) {
          console.error("DeepSeek TimeOut. Inyectando Redundancia Local.");
          if (isMounted.current) {
              // Si falla la red localmente, inyectamos el Fallback que diseñamos en IcfesEngine para que la experiencia NO colapse
              setPendingAIQ(IcfesEngine.generateQuestion(safeLang, forcedTopic));
              setConnectionError(false); // Falsa sensación de éxito para no estresar al alumno
          }
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
          setConnectionError(false);
          
          fetchAIQuestionBackground(forcedTopic); 
          return;
      }

      setPhase("LOADING");
      setScannerActive(false);
      setHintUsed(false);
      setShowAiModal(false);
      setActiveAiTopic(null);
      setConnectionError(false);
      
      fetchAIQuestionBackground(forcedTopic);

  }, [stats.needsReview, pendingAIQ, fetchAIQuestionBackground]);

  const retrySameQuestion = useCallback(() => {
      sfx.click();
      setSelectedOpt(null);
      setTimeLeft(MAX_TIME); 
      setPhase("GAME"); 
      setTimerActive(true); 
  }, []);

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

      const isCorrect = selectedOpt === currentQData.correctIdx;

      if (phase === "GAME") {
          const timeTaken = MAX_TIME - timeLeft;
          updateStats(isCorrect, timeTaken);
      }

      if (isCorrect) {
          sfx.success();
          setXp(p => p + (hintUsed ? 100 : 200)); 
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
      if (phase === "GAME") {
          setSavedTime(timeLeft);
          setTimerActive(false);
      }
      setPhase("STATS");
  };

  const closeTelemetry = () => {
      sfx.click();
      setPhase(previousPhase);
      if (previousPhase === "GAME") {
          setTimeLeft(savedTime);
          setTimerActive(true); 
      }
  };

  const handleNextPhase = () => {
      if (phase === "CORRECT") {
          if (!pendingAIQ) {
              setPhase("LOADING");
          } else {
              generateNew(); 
          }
      } else if (phase === "MICROCLASS") {
          retrySameQuestion(); 
      }
  };

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
              const translatedName = getTopicName(topicId);
              topicsHtml += `
                <div style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${translatedName}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${REPORT_UI.topicHit}: <span style="color:#10b981; font-weight:bold;">${t.c}</span> | ${REPORT_UI.topicMiss}: <span style="color:#ef4444; font-weight:bold;">${t.w}</span></div>
                    </div>
                    <div style="font-size: 18px; font-weight: 900; color: ${pct >= 60 ? '#10b981' : '#ef4444'};">${pct}%</div>
                </div>
              `;
              if (pct >= 60) strong.push(translatedName);
              else weak.push(translatedName);
          }
      });

      let aiVeredict = '';
      if (weak.length > 0) {
          aiVeredict = `
            <div style="background-color: #fef2f2; border-left: 5px solid #ef4444; padding: 15px; border-radius: 4px;">
                <div style="color: #b91c1c; font-weight: 900; font-size: 16px; margin-bottom: 8px;">${REPORT_UI.aiVuln}</div>
                <p style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 13px;">${REPORT_UI.aiVulnDesc}</p>
                <ul style="color: #991b1b; margin: 0 0 15px 0; font-weight: bold; font-size: 13px;">
                    ${weak.map(w => `<li style="margin-bottom: 4px;">${w}</li>`).join('')}
                </ul>
                <div style="background-color: #fee2e2; padding: 10px; border-radius: 4px; border: 1px dashed #fca5a5; font-size: 13px;">
                    <strong style="color: #991b1b;">${REPORT_UI.aiAction}:</strong> ${REPORT_UI.aiActionDesc}
                </div>
            </div>`;
      } else if (strong.length > 0) {
          aiVeredict = `
            <div style="background-color: #f0fdf4; border-left: 5px solid #10b981; padding: 15px; border-radius: 4px;">
                <div style="color: #047857; font-weight: 900; font-size: 16px; margin-bottom: 8px;">${REPORT_UI.aiOpt}</div>
                <p style="color: #065f46; margin: 0; font-size: 13px;">${REPORT_UI.aiOptDesc}</p>
            </div>`;
      } else {
          aiVeredict = `<div style="color: #64748b; font-style: italic; padding: 15px; background: #f8fafc; border-radius: 4px; font-size: 13px;">${REPORT_UI.aiNoData}</div>`;
      }

      const printWindow = window.open('', '', 'height=900,width=850');
      printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${safeLang}">
              <head>
                  <title>Learning Labs - Tactical Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                      .header { display: flex; align-items: center; border-bottom: 3px solid #00f2ff; padding-bottom: 20px; margin-bottom: 30px; }
                      .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 24px; font-weight: 900; text-transform: uppercase; }
                      .title p { margin: 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                      .timestamp { margin-top: 10px; display: inline-block; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #475569; font-weight: bold; }
                      .section-title { font-size: 16px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 15px; display: flex; align-items: center; }
                      .section-title::before { content: ''; display: inline-block; width: 10px; height: 10px; background-color: #00f2ff; margin-right: 8px; border-radius: 2px; }
                      .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
                      .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 15px; text-align: center; }
                      .kpi-val { font-size: 32px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 5px; }
                      .kpi-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                      .topics-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
                      .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; font-weight: bold; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
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
                      <div style="margin-bottom: 30px;">${aiVeredict}</div>
                      <div class="section-title">${REPORT_UI.topicTitle}</div>
                      <div class="topics-container">
                          ${topicsHtml || `<p style="color: #64748b; text-align: center; font-style: italic;">${REPORT_UI.topicNoData}</p>`}
                      </div>
                      <div class="footer">${REPORT_UI.footer}<br/>${REPORT_UI.footerSub}</div>
                  </div>
              </body>
          </html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.focus(); printWindow.print(); }, 750);
  }, [stats, safeLang, REPORT_UI]);

  return (
    <>
      <style>{`
        /* DEEP FOCUS CSS ARCHITECTURE - NO WEBGL/CANVAS REQUIRED */
        .cyber-bg {
            position: absolute;
            inset: 0;
            background-color: #020617; /* Very dark slate blue */
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 50% 100%, rgba(255, 0, 85, 0.03) 0%, transparent 50%);
            z-index: 0;
            overflow: hidden;
        }
        
        .cyber-grid {
            position: absolute;
            inset: -50%;
            background-image: 
                linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
            pointer-events: none;
        }

        .hud-btn { padding: clamp(12px, 2vw, 15px) clamp(20px, 4vw, 30px); background: transparent; color: #00f2ff; font-weight: 700; font-size: clamp(14px, 2vw, 18px); cursor: pointer; border-radius: 8px; border: 1px solid #00f2ff; font-family: 'Inter', sans-serif; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
        .hud-btn:hover { background: rgba(0,242,255,0.1); box-shadow: 0 0 15px rgba(0,242,255,0.3); transform: translateY(-2px); }
        .hud-btn:disabled { background: transparent; border-color: #334155; color:#64748b; box-shadow: none; cursor:not-allowed; transform: none; }
        
        .opt-btn { display: block; width: 100%; margin: 12px 0; padding: clamp(15px, 2vw, 20px); background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; color: #cbd5e1; font-size: clamp(16px, 2.5vw, 18px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-family: 'Inter', sans-serif; line-height: 1.5; backdrop-filter: blur(10px); }
        .opt-btn:hover { background: rgba(30, 41, 59, 0.8); border-color: #64748b; color: #f8fafc; }
        .opt-btn.selected { border-color: #00f2ff; background: rgba(0, 242, 255, 0.05); box-shadow: inset 0 0 20px rgba(0,242,255,0.1); color: #00f2ff; }
        
        .glass-panel { background: rgba(2, 6, 23, 0.7); border: 1px solid #1e293b; backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: clamp(20px, 4vw, 40px); }
        
        .hud-pulse { animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        
        .timer-danger { background: #f59e0b !important; }
        .timer-critical { background: #ef4444 !important; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#020617', fontFamily:'Inter, sans-serif' }}>
        
        {/* FONDO CSS (DEEP FOCUS) */}
        <div className="cyber-bg"><div className="cyber-grid"></div></div>

        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={connectionError ? "CONEXIÓN DE RED DÉBIL. ENRUTANDO..." : UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
            <h1 style={{color:'#f8fafc', fontSize:'clamp(30px, 6vw, 60px)', textAlign:'center', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-1px'}}>{UI.title}</h1>
            <p style={{color:'#00f2ff', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '40px'}}>DEEP FOCUS LEARNING ENGINE</p>
            
            {phase === "THEORY" && (
                <div className="glass-panel" style={{maxWidth: '800px', marginBottom: '40px', borderTop: '4px solid #ffaa00'}}>
                    <h3 style={{color: '#ffaa00', marginTop: 0}}>SISTEMA ICFES ACTIVO</h3>
                    <p style={{color:'#cbd5e1', fontSize:'clamp(16px, 2.5vw, 18px)', lineHeight:'1.7', margin: 0}}>{UI.theoryText}</p>
                </div>
            )}
            
            <div style={{display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
                <button className="hud-btn" style={{background: 'rgba(0,242,255,0.1)', padding: '20px 40px'}} onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>
                    {phase === "BOOT" ? UI.start : "EMPEZAR SIMULACIÓN"}
                </button>
                <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', padding: '20px 40px'}} onClick={openTelemetry}>
                    📊 {UI.statsBtn}
                </button>
            </div>
          </div>
        )}

        {/* INTERFAZ PRINCIPAL DE JUEGO */}
        {phase !== "BOOT" && phase !== "THEORY" && phase !== "LOADING" && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            
            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(2, 6, 23, 0.8)', borderBottom: '1px solid #1e293b', backdropFilter: 'blur(10px)' }}>
              <div style={{display:'flex', gap:'30px', alignItems:'center'}}>
                  {currentQData && phase === "GAME" && (
                     <div style={{color: stats.needsReview.includes(currentQData?.id) ? '#f59e0b' : '#94a3b8', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>
                         DOMINIO: <span style={{color: '#f8fafc'}}>{currentQData?.topic}</span> {stats.needsReview.includes(currentQData?.id) ? ' ⚠️ REPASO' : ''}
                     </div>
                  )}
                  <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>XP: {xp}</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="hud-btn" style={{padding:'8px 16px', fontSize:'12px', borderColor: '#475569', color: '#94a3b8'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
                  <button className="hud-btn" style={{padding:'8px 16px', fontSize:'12px', borderColor: '#ef4444', color: '#ef4444'}} onClick={resetApp}>SALIR</button>
              </div>
            </div>

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {phase === "GAME" && (
                <div style={{ width:'100%', padding: '20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{color: timeLeft > 30 ? '#00f2ff' : (timeLeft > 15 ? '#f59e0b' : '#ef4444'), fontSize:'24px', fontWeight:'900', marginBottom:'10px', fontVariantNumeric: 'tabular-nums'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '90%', maxWidth: '800px', height:'6px', background:'#1e293b', borderRadius:'3px', overflow:'hidden'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/MAX_TIME)*100}%`, height:'100%', background: '#00f2ff', transition:'width 1s linear, background 0.5s'}} />
                    </div>
                </div>
            )}

            {/* CONTENEDOR CENTRAL: PREGUNTA */}
            {phase === "GAME" && currentQ && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', borderTop: currentQData?.isAi ? '4px solid #d946ef' : '4px solid #00f2ff' }}>
                  
                  {/* Etiqueta de Origen de la Pregunta */}
                  <div style={{ display: 'inline-block', background: currentQData?.isAi ? 'rgba(217, 70, 239, 0.1)' : 'rgba(0, 242, 255, 0.1)', color: currentQData?.isAi ? '#d946ef' : '#00f2ff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
                      {currentQData?.isAi ? "GENERADO POR DEEPSEEK IA" : "SISTEMA LOCAL ACTIVO"}
                  </div>

                  <h2 style={{color:'#f8fafc', fontSize:'clamp(18px, 3vw, 24px)', lineHeight:'1.7', fontWeight:'400', margin: '0 0 30px 0'}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div style={{background:'rgba(0,242,255,0.05)', borderLeft:'4px solid #00f2ff', padding:'15px', margin:'0 0 30px 0', color:'#00f2ff', fontSize:'15px', fontWeight:'600'}}>
                          💡 PISTA: {currentQ.hint}
                      </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'900', marginRight:'15px', color: selectedOpt === i ? '#00f2ff' : '#64748b'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginTop:'40px'}}>
                      {!scannerActive ? (
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', fontSize: '14px', padding: '10px 20px'}} onClick={toggleScanner}>
                              👁️ USAR PISTA (-50 XP)
                          </button>
                      ) : <div></div>}
                      
                      <button className="hud-btn" style={{background: selectedOpt !== null ? '#00f2ff' : 'transparent', color: selectedOpt !== null ? '#000' : '#00f2ff'}} disabled={selectedOpt === null} onClick={submitAnswer}>
                          {UI.btnCheck}
                      </button>
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY: RESPUESTA CORRECTA */}
            {phase === "CORRECT" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px', textAlign:'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h1 style={{color:'#f8fafc', fontSize:'clamp(30px, 6vw, 60px)', margin:0, fontWeight: '900', letterSpacing: '-1px'}}>ANÁLISIS PERFECTO</h1>
                  <p style={{color:'#94a3b8', fontSize:'18px', marginTop:'20px'}}>Recompensa táctica: <span style={{color:'#10b981', fontWeight:'bold'}}>+{hintUsed ? '50' : '200'} XP</span></p>
                  
                  <button className="hud-btn" style={{marginTop:'50px', background:'#10b981', borderColor: '#10b981', color:'#020617', padding: '20px 60px'}} onClick={handleNextPhase}>
                      SIGUIENTE PREGUNTA
                  </button>
              </div>
            )}

            {/* OVERLAY: MICRO-CLASE SOCRÁTICA (FALLO) */}
            {phase === "MICROCLASS" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                  <div className="glass-panel" style={{borderColor:'#ef4444', maxWidth:'900px', width:'100%', textAlign:'left', maxHeight:'90vh', overflowY:'auto'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          </div>
                          <div>
                              <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>RUPTURA COGNITIVA DETECTADA</div>
                              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }}>{timeLeft === 0 ? "Tiempo Agotado" : "Análisis Forense Requerido"}</div>
                          </div>
                      </div>
                      
                      {currentQData?.trapExplanations && currentQData.trapExplanations[selectedOpt] && (
                          <div style={{color:'#f8fafc', fontSize:'16px', padding:'20px', background:'rgba(245, 158, 11, 0.1)', borderLeft:'4px solid #f59e0b', borderRadius: '4px', marginBottom: '30px', lineHeight: '1.6'}}>
                              <strong style={{color: '#f59e0b'}}>TRAMPA IDENTIFICADA: </strong>
                              {currentQData.trapExplanations[selectedOpt]}
                          </div>
                      )}

                      <div style={{color:'#cbd5e1', fontSize:'16px', lineHeight:'1.8', background:'rgba(15, 23, 42, 0.5)', padding:'30px', borderRadius:'8px', borderLeft:'4px solid #00f2ff'}}>
                          <strong style={{color: '#00f2ff', display: 'block', marginBottom: '15px'}}>RESOLUCIÓN CORRECTA:</strong>
                          <MarkdownParser text={currentQData?.microclass} />
                      </div>
                      
                      <div style={{display:'flex', justifyContent:'flex-end', marginTop:'40px'}}>
                          <button className="hud-btn" style={{background:'#f8fafc', color:'#0f172a', borderColor: '#f8fafc'}} onClick={handleNextPhase}>
                              CONTINUAR SIMULACIÓN
                          </button>
                      </div>
                  </div>
              </div>
            )}

            {/* DASHBOARD TELEMETRÍA */}
            {phase === "STATS" && !showAiModal && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                  <div className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                          <div>
                              <h2 style={{color:'#f8fafc', fontSize:'28px', margin:0, fontWeight: '900'}}>PANEL DE MANDO</h2>
                              <div style={{color:'#64748b', fontSize:'14px', marginTop:'5px'}}>Telemetría Global del Operador</div>
                          </div>
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', padding: '10px'}} onClick={closeTelemetry}>✕ CERRAR</button>
                      </div>
                      
                      {/* KPIs */}
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'40px'}}>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>PRECISIÓN NEURONAL</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color: stats.totalQ === 0 ? '#475569' : (stats.correctQ/stats.totalQ > 0.6 ? '#10b981' : '#ef4444')}}>
                                  {stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0}%
                              </div>
                          </div>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>TIEMPO MEDIO REACCIÓN</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color:'#f59e0b'}}>
                                  {stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0}s
                              </div>
                          </div>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>MATRICES RESUELTAS</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color:'#f8fafc'}}>
                                  {stats.totalQ}
                              </div>
                          </div>
                      </div>

                      {/* BOTÓN IA SOCRÁTICO */}
                      <div style={{ marginBottom:'40px'}}>
                         <button 
                            className="hud-btn" 
                            style={{background: failedTopics.length > 0 ? 'rgba(217, 70, 239, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: failedTopics.length > 0 ? '#d946ef' : '#10b981', color: failedTopics.length > 0 ? '#d946ef' : '#10b981', width: '100%', padding: '25px'}} 
                            onClick={() => { sfx.aiPop(); setShowAiModal(true); }}
                         >
                            {failedTopics.length > 0 ? "⚠️ DETECTADAS VULNERABILIDADES - SOLICITAR IA TUTOR" : "✅ RENDIMIENTO ÓPTIMO - HABLAR CON IA"}
                         </button>
                      </div>

                      <div style={{ fontSize:'14px', color:'#94a3b8', fontWeight:'bold', letterSpacing:'1px', marginBottom:'15px', borderBottom:'1px solid #1e293b', paddingBottom:'10px' }}>DESGLOSE POR DOMINIO ICFES</div>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px'}}>
                          {Object.keys(stats.topics).map(topicId => {
                              const t = stats.topics[topicId];
                              const total = t.c + t.w;
                              if (total === 0) return null; 
                              const pct = total > 0 ? Math.round((t.c/total)*100) : 0;
                              const isFailed = t.w > 0;
                              const displayName = getTopicName(topicId);

                              return (
                                  <div key={topicId} style={{background:'rgba(15, 23, 42, 0.3)', padding:'20px', borderRadius:'8px', border: isFailed ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1e293b'}}>
                                      <div style={{color: isFailed ? '#ef4444' : '#f8fafc', fontWeight:'bold', marginBottom:'15px', fontSize:'14px', height: '40px'}}>
                                          {displayName}
                                      </div>
                                      <div style={{width:'100%', height:'6px', background:'#0f172a', borderRadius:'3px', overflow:'hidden'}}>
                                          <div style={{width:`${pct}%`, height:'100%', background: pct >= 60 ? '#10b981' : (pct > 0 ? '#f59e0b' : '#ef4444')}}></div>
                                      </div>
                                      <div style={{color:'#64748b', fontSize:'12px', marginTop:'10px', display:'flex', justifyContent:'space-between'}}>
                                          <span>Aciertos: <span style={{color:'#10b981'}}>{t.c}</span></span>
                                          <span>Fallos: <span style={{color:'#ef4444'}}>{t.w}</span></span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* BOTONES DE ACCIÓN: INCLUYE EL DOSSIER PDF */}
                      <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', paddingTop: '20px', borderTop: '1px solid #1e293b', flexWrap:'wrap', gap: '15px'}}>
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8'}} onClick={() => { window.localStorage.removeItem('icfes_telemetry_quimica_v9'); window.location.reload(); }}>PURGAR CACHÉ</button>
                          <button className="hud-btn" style={{background:'#f8fafc', color:'#0f172a', borderColor: '#f8fafc'}} onClick={downloadReport}>📄 DESCARGAR REPORTE TÁCTICO PDF</button>
                      </div>
                  </div>
              </div>
            )}

            {/* MODAL IA INTERACTIVA */}
            {showAiModal && phase === "STATS" && (
               <div style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)' }}>
                   <div className="glass-panel" style={{borderColor:'#d946ef', maxWidth:'1000px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(217, 70, 239, 0.1)', maxHeight:'95vh', minHeight:'80vh', overflowY:'auto'}}>
                       
                       {failedTopics.length > 0 ? (
                           <>
                               {!activeAiTopic ? (
                                   <>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                                          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(217, 70, 239, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                          </div>
                                          <div>
                                              <div style={{ color: '#d946ef', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>SISTEMA TUTOR DEEPSEEK</div>
                                              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }}>Selecciona un dominio a re-entrenar</div>
                                          </div>
                                      </div>

                                       <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                           {failedTopics.map((topicId, i) => (
                                               <button key={i} className="opt-btn" style={{borderColor:'#1e293b', color:'#f8fafc', fontSize: '16px', padding: '20px'}} onClick={() => { sfx.click(); setActiveAiTopic(topicId); }}>
                                                   <span style={{color: '#d946ef', marginRight: '10px'}}>+</span> {getTopicName(topicId)}
                                               </button>
                                           ))}
                                       </div>
                                       
                                       <div style={{display:'flex', justifyContent:'flex-end', marginTop:'40px'}}>
                                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8'}} onClick={() => setShowAiModal(false)}>CERRAR ENLACE IA</button>
                                       </div>
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
                           <div style={{textAlign: 'center', padding: '60px 20px'}}>
                             <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 30px auto' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                             </div>
                             <h2 style={{color:'#f8fafc', fontSize:'28px', marginBottom:'15px'}}>RENDIMIENTO PERFECTO</h2>
                             <p style={{color: '#94a3b8', marginBottom: '40px'}}>No hay vulnerabilidades tácticas detectadas en tu matriz cognitiva.</p>
                             <button className="hud-btn" style={{background:'#10b981', color:'#020617', borderColor: '#10b981'}} onClick={() => setShowAiModal(false)}>CERRAR SESIÓN</button>
                           </div>
                       )}
                   </div>
               </div>
            )}

          </div>
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