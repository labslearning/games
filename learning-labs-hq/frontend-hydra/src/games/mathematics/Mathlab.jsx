import React, { Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
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
   🧠 2. MOTOR GENERATIVO MATEMÁTICO (FALLBACK ZERO-LATENCY)
============================================================ */
class IcfesEngine {
  
  static getTopicName(topicId, lang) {
      const mockQ = this.generateQuestion(lang, topicId);
      return mockQ.topic || topicId.replace(/_/g, ' ');
  }

  static generateQuestion(lang, forcedTopic = null) {
    const topics = [
      'RAZONAMIENTO_CUANTITATIVO', 'PORCENTAJES_Y_PROPORCIONES', 'ESTADISTICA_DESCRIPTIVA', 'PROBABILIDAD_CLASICA', 
      'GEOMETRIA_PLANA', 'GEOMETRIA_ESPACIAL', 
      'TRIGONOMETRIA', 'ALGEBRA_LINEAL', 'FUNCIONES_Y_GRAFICAS', 'TECNICAS_DE_CONTEO'
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];

    switch (selectedTopic) {
      case 'RAZONAMIENTO_CUANTITATIVO': return this.genQuantitativeQuestion(lang);
      case 'PORCENTAJES_Y_PROPORCIONES': return this.genPercentageQuestion(lang);
      case 'ESTADISTICA_DESCRIPTIVA': return this.genStatisticsQuestion(lang);
      case 'PROBABILIDAD_CLASICA': return this.genProbabilityQuestion(lang);
      case 'GEOMETRIA_PLANA': return this.genPlaneGeometryQuestion(lang);
      case 'GEOMETRIA_ESPACIAL': return this.genSpatialGeometryQuestion(lang);
      case 'TRIGONOMETRIA': return this.genTrigQuestion(lang);
      case 'ALGEBRA_LINEAL': return this.genAlgebraQuestion(lang);
      case 'FUNCIONES_Y_GRAFICAS': return this.genFunctionsQuestion(lang);
      case 'TECNICAS_DE_CONTEO': return this.genCountingQuestion(lang);
      default: return this.genQuantitativeQuestion(lang);
    }
  }

  static generateLocalMasterclass(topic, lang) {
      const q = this.generateQuestion(lang, topic);
      return {
          title: `ENTRENAMIENTO TÁCTICO: ${q.topic}`,
          theory: `[SISTEMA AISLADO DE DEEPSEEK]\n\nEl núcleo teórico de ${q.topic} evalúa tu capacidad para traducir el lenguaje natural a lenguaje algebraico o geométrico. El ICFES no premia al que memoriza más fórmulas, sino al que sabe descartar datos irrelevantes en el enunciado.\n\nLa clave matemática está en identificar el patrón lógico antes de hacer el primer cálculo.`,
          trap: "El ICFES suele emplear distractores visuales o numéricos: resultados parciales de la operación, errores de signo, o respuestas que no contestan la pregunta específica (e.g., calculas 'x' pero pedían '2x').",
          protocol: "1. Lee la pregunta final antes que el contexto.\n2. Extrae solo los datos estrictamente necesarios.\n3. Plantea la ecuación o proporción (siempre escríbela).\n4. Resuelve y verifica si tu resultado responde a la incógnita solicitada.",
          demoQuestion: {
              text: q.text,
              options: q.options,
              correctIdx: q.correctIdx,
              analysis: q.microclass
          }
      };
  }

  static genQuantitativeQuestion(lang) {
    const rate1 = Math.floor(Math.random() * 5) + 3; // hrs
    const rate2 = Math.floor(Math.random() * 6) + 4; // hrs
    const totalTime = (rate1 * rate2) / (rate1 + rate2);
    
    const correctVal = Number(totalTime.toFixed(2));
    const errorAdd = rate1 + rate2; 
    const errorAvg = (rate1 + rate2) / 2;
    const errorDiff = Math.abs(rate1 - rate2);

    const optionsRaw = [correctVal, errorAdd, errorAvg, errorDiff];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Number((Math.random() * 10 + 1).toFixed(2)));
    
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'RAZONAMIENTO CUANTITATIVO', text: `Una bomba A llena un tanque en ${rate1} horas. Una bomba B lo llena en ${rate2} horas. Si se encienden ambas bombas al mismo tiempo, ¿cuántas horas tardarán en llenar el tanque juntas?`, hint: "Suma de tasas de trabajo: 1/T = (1/A) + (1/B).", micro: `Tasa de A: 1/${rate1}. Tasa de B: 1/${rate2}. Juntas: (1/${rate1}) + (1/${rate2}) = (${rate1}+${rate2})/(${rate1}*${rate2}). Tiempo total = inverso de la suma = ${correctVal} horas.`, traps: [null, `Trampa: Sumaste los tiempos directamente.`, `Trampa: Calculaste el promedio de horas.`, `Trampa: Restaste los tiempos.`] },
      en: { topic: 'QUANTITATIVE REASONING', text: `Pump A fills a tank in ${rate1} hours. Pump B fills it in ${rate2} hours. If both are turned on simultaneously, how many hours will it take to fill the tank?`, hint: "Work rate sum: 1/T = (1/A) + (1/B).", micro: `Rate A: 1/${rate1}. Rate B: 1/${rate2}. Combined: (1/${rate1}) + (1/${rate2}). Total time = reciprocal = ${correctVal} hours.`, traps: [null, "Added times.", "Averaged times.", "Subtracted times."] },
      fr: { topic: 'RAISONNEMENT QUANTITATIF', text: `La pompe A remplit un réservoir en ${rate1} heures. La pompe B le remplit en ${rate2} heures. Si les deux sont allumées en même temps, combien d'heures faudra-t-il pour remplir le réservoir ?`, hint: "Somme des taux: 1/T = (1/A) + (1/B).", micro: `Taux A: 1/${rate1}. Taux B: 1/${rate2}. Combiné: (1/${rate1}) + (1/${rate2}). Temps total = inverse = ${correctVal} heures.`, traps: [null, "Temps additionnés.", "Moyenne calculée.", "Temps soustraits."] },
      de: { topic: 'QUANTITATIVES DENKEN', text: `Pumpe A füllt einen Tank in ${rate1} Stunden. Pumpe B füllt ihn in ${rate2} Stunden. Wenn beide gleichzeitig eingeschaltet sind, wie viele Stunden dauert es, den Tank zu füllen?`, hint: "Arbeitsrate Summe: 1/T = (1/A) + (1/B).", micro: `Rate A: 1/${rate1}. Rate B: 1/${rate2}. Kombiniert: (1/${rate1}) + (1/${rate2}). Gesamtzeit = Kehrwert = ${correctVal} Stunden.`, traps: [null, "Zeiten addiert.", "Zeiten gemittelt.", "Zeiten subtrahiert."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'RAZONAMIENTO_CUANTITATIVO', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} h`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genPercentageQuestion(lang) {
    const originalPrice = (Math.floor(Math.random() * 8) + 2) * 10000;
    const discount = Math.floor(Math.random() * 3) * 10 + 10; // 10, 20, 30
    const tax = 19; 
    
    const discountedPrice = originalPrice * (1 - discount/100);
    const finalPrice = discountedPrice * (1 + tax/100);
    
    const correctVal = Math.round(finalPrice);
    const errorLinear = Math.round(originalPrice * (1 - (discount - tax)/100)); // Restar porcentajes
    const errorNoTax = Math.round(discountedPrice);
    const errorInverted = Math.round((originalPrice * (1 + tax/100)) * (1 + discount/100));

    const optionsRaw = [correctVal, errorLinear, errorNoTax, errorInverted];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.round(originalPrice * (Math.random() + 0.5)));
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'PORCENTAJES', text: `Un artículo cuesta $${originalPrice}. Se le aplica un descuento del ${discount}%, y sobre el precio resultante se aplica un IVA del ${tax}%. ¿Cuál es el precio final a pagar?`, hint: "Los porcentajes son multiplicativos, NO se suman ni se restan entre sí.", micro: `1. Descuento: $${originalPrice} * (1 - ${discount/100}) = $${discountedPrice}.\n2. IVA sobre el nuevo valor: $${discountedPrice} * 1.${tax} = $${correctVal}.`, traps: [null, `Trampa: Restaste ${discount}% y sumaste ${tax}% linealmente.`, `Trampa: Olvidaste aplicar el IVA.`, `Trampa: Aplicaste ambos como aumentos.`] },
      en: { topic: 'PERCENTAGES', text: `An item costs $${originalPrice}. A ${discount}% discount is applied, and then a ${tax}% tax is added to the discounted price. What is the final price?`, hint: "Percentages are sequential, do not add or subtract them directly.", micro: `1. Discount: $${originalPrice} * (1 - ${discount/100}) = $${discountedPrice}.\n2. Tax: $${discountedPrice} * 1.${tax} = $${correctVal}.`, traps: [null, "Linear subtraction trap.", "Forgot the tax.", "Applied both as increments."] },
      fr: { topic: 'POURCENTAGES', text: `Un article coûte ${originalPrice} $. Une remise de ${discount}% est appliquée, puis une taxe de ${tax}% est ajoutée. Quel est le prix final ?`, hint: "Les pourcentages sont séquentiels.", micro: `1. Remise: ${originalPrice} $ * (1 - ${discount/100}) = ${discountedPrice} $.\n2. Taxe: ${discountedPrice} $ * 1.${tax} = ${correctVal} $.`, traps: [null, "Soustraction linéaire.", "Oublié la taxe.", "Deux augmentations."] },
      de: { topic: 'PROZENTSÄTZE', text: `Ein Artikel kostet $${originalPrice}. Es wird ein Rabatt von ${discount}% gewährt und dann eine Steuer von ${tax}% hinzugefügt. Wie hoch ist der Endpreis?`, hint: "Prozentsätze sind sequentiell.", micro: `1. Rabatt: $${originalPrice} * (1 - ${discount/100}) = $${discountedPrice}.\n2. Steuer: $${discountedPrice} * 1.${tax} = $${correctVal}.`, traps: [null, "Lineare Subtraktion.", "Steuer vergessen.", "Beide als Erhöhungen."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'PORCENTAJES_Y_PROPORCIONES', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `$${o}`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genStatisticsQuestion(lang) {
    const mean = Math.floor(Math.random() * 10) + 15;
    const n1 = mean - 2;
    const n2 = mean + 5;
    const n3 = mean - 6;
    const totalSum = mean * 4;
    const correctVal = totalSum - (n1 + n2 + n3);
    
    const errorAvg = Math.round((n1 + n2 + n3) / 3);
    const errorMedian = [n1, n2, n3].sort()[1];
    const errorSum = n1 + n2 + n3;

    const optionsRaw = [correctVal, errorAvg, errorMedian, errorSum];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 15) + 10);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'ESTADÍSTICA', text: `El promedio exacto de 4 números enteros es ${mean}. Si tres de esos números son ${n1}, ${n2} y ${n3}, ¿cuál es el cuarto número?`, hint: "Promedio = Suma total / Cantidad de datos. Encuentra la Suma total primero.", micro: `Suma total requerida = Promedio × 4 = ${mean} × 4 = ${totalSum}.\nSuma actual = ${n1} + ${n2} + ${n3} = ${n1+n2+n3}.\nCuarto número = ${totalSum} - ${n1+n2+n3} = ${correctVal}.`, traps: [null, `Trampa: Calculaste el promedio de los 3 números dados.`, `Trampa: Seleccionaste la mediana.`, `Trampa: Sumaste solo los 3 números.`] },
      en: { topic: 'STATISTICS', text: `The exact average of 4 integers is ${mean}. If three of the numbers are ${n1}, ${n2}, and ${n3}, what is the fourth number?`, hint: "Find the total sum first: Average * N.", micro: `Total sum = ${mean} × 4 = ${totalSum}.\nCurrent sum = ${n1} + ${n2} + ${n3} = ${n1+n2+n3}.\nFourth number = ${totalSum} - ${n1+n2+n3} = ${correctVal}.`, traps: [null, "Averaged the 3 numbers.", "Selected the median.", "Summed only the 3 numbers."] },
      fr: { topic: 'STATISTIQUES', text: `La moyenne exacte de 4 entiers est ${mean}. Si trois des nombres sont ${n1}, ${n2} et ${n3}, quel est le quatrième nombre ?`, hint: "Trouvez la somme totale en premier.", micro: `Somme totale = ${mean} × 4 = ${totalSum}.\nSomme actuelle = ${n1} + ${n2} + ${n3} = ${n1+n2+n3}.\nQuatrième nombre = ${totalSum} - ${n1+n2+n3} = ${correctVal}.`, traps: [null, "Moyenne des 3 nombres.", "Médiane sélectionnée.", "Somme des 3 uniquement."] },
      de: { topic: 'STATISTIK', text: `Der exakte Durchschnitt von 4 ganzen Zahlen ist ${mean}. Wenn drei der Zahlen ${n1}, ${n2} und ${n3} sind, wie lautet die vierte Zahl?`, hint: "Finde zuerst die Gesamtsumme.", micro: `Gesamtsumme = ${mean} × 4 = ${totalSum}.\nAktuelle Summe = ${n1} + ${n2} + ${n3} = ${n1+n2+n3}.\nVierte Zahl = ${totalSum} - ${n1+n2+n3} = ${correctVal}.`, traps: [null, "Durchschnitt der 3 Zahlen.", "Median gewählt.", "Nur die 3 Zahlen summiert."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ESTADISTICA_DESCRIPTIVA', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genProbabilityQuestion(lang) {
    const r = Math.floor(Math.random() * 4) + 3;
    const b = Math.floor(Math.random() * 5) + 4;
    const g = Math.floor(Math.random() * 3) + 2;
    const total = r + b + g;
    
    // Simplificar fracción r/total para opciones engañosas
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const div = gcd(r, total);
    const num = r / div;
    const den = total / div;
    
    const correctVal = `${num}/${den}`;
    const error1 = `${r}/${b+g}`; // Favorables / Desfavorables
    const error2 = `${b}/${total}`; // Probabilidad de azul
    const error3 = `${g}/${total}`; // Probabilidad de verde

    const optionsRaw = [correctVal, error1, error2, error3];
    const uniqueOptions = [...new Set(optionsRaw)];
    while(uniqueOptions.length < 4) uniqueOptions.push(`1/${Math.floor(Math.random() * 10) + 2}`);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'PROBABILIDAD', text: `En una urna opaca hay ${r} bolas rojas, ${b} azules y ${g} verdes. Si se extrae una bola al azar, ¿cuál es la probabilidad matemática de que sea roja?`, hint: "Casos Favorables divididos por Casos Totales.", micro: `Total de bolas = ${r} + ${b} + ${g} = ${total}.\nProbabilidad = Favorables / Totales = ${r} / ${total}.\nSimplificando la fracción: ${correctVal}.`, traps: [null, `Trampa: Dividiste favorables entre desfavorables.`, `Trampa: Calculaste la probabilidad de azul.`, `Trampa: Calculaste la probabilidad de verde.`] },
      en: { topic: 'PROBABILITY', text: `An opaque urn contains ${r} red balls, ${b} blue, and ${g} green. If one is drawn at random, what is the mathematical probability it is red?`, hint: "Favorable Cases / Total Cases.", micro: `Total balls = ${r} + ${b} + ${g} = ${total}.\nProbability = Favorable / Total = ${r} / ${total} = ${correctVal}.`, traps: [null, "Favorable / Unfavorable.", "Calculated blue probability.", "Calculated green probability."] },
      fr: { topic: 'PROBABILITÉS', text: `Une urne opaque contient ${r} boules rouges, ${b} bleues et ${g} vertes. Si l'on en tire une au hasard, quelle est la probabilité qu'elle soit rouge ?`, hint: "Cas Favorables / Cas Totaux.", micro: `Total = ${r} + ${b} + ${g} = ${total}.\nProbabilité = ${r} / ${total} = ${correctVal}.`, traps: [null, "Favorables / Défavorables.", "Probabilité pour bleu.", "Probabilité pour vert."] },
      de: { topic: 'WAHRSCHEINLICHKEIT', text: `Eine undurchsichtige Urne enthält ${r} rote, ${b} blaue und ${g} grüne Kugeln. Wie hoch ist die mathematische Wahrscheinlichkeit, eine rote zu ziehen?`, hint: "Günstige Fälle / Gesamtfälle.", micro: `Gesamt = ${r} + ${b} + ${g} = ${total}.\nWahrscheinlichkeit = ${r} / ${total} = ${correctVal}.`, traps: [null, "Günstige / Ungünstige.", "Wahrscheinlichkeit für blau.", "Wahrscheinlichkeit für grün."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'PROBABILIDAD_CLASICA', isAi: false, topic: langData.topic, text: langData.text, options: options, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genPlaneGeometryQuestion(lang) {
    const baseMult = Math.floor(Math.random() * 3) + 2; // base is 2x, 3x, or 4x the height
    const height = Math.floor(Math.random() * 5) + 3;
    const base = height * baseMult;
    const perimeter = 2 * (base + height);
    const correctArea = base * height;

    const errorPerim = perimeter;
    const errorSquare = height * height;
    const errorAdd = base + height;

    const optionsRaw = [correctArea, errorPerim, errorSquare, errorAdd];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 100) + 10);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctArea);

    const texts = {
      es: { topic: 'GEOMETRÍA PLANA', text: `Un terreno rectangular tiene un perímetro de ${perimeter} m. Si se sabe que la base es ${baseMult} veces su altura, ¿cuál es el área del terreno en m²?`, hint: "Plantea la ecuación del perímetro: 2(b + h) = P, sustituyendo b por h.", micro: `Perímetro: 2(b + h) = ${perimeter}. Como b = ${baseMult}h:\n2(${baseMult}h + h) = ${perimeter}\n2(${baseMult + 1}h) = ${perimeter}\n${(baseMult + 1)*2}h = ${perimeter} ➔ h = ${height}, b = ${base}.\nÁrea = b × h = ${base} × ${height} = ${correctArea} m².`, traps: [null, `Trampa: Respondiste el valor del perímetro.`, `Trampa: Asumiste que era un cuadrado.`, `Trampa: Solo sumaste base y altura.`] },
      en: { topic: 'PLANE GEOMETRY', text: `A rectangular plot has a perimeter of ${perimeter} m. The base is ${baseMult} times its height. What is the area in m²?`, hint: "Perimeter equation: 2(b + h) = P. Substitute b.", micro: `2(${baseMult}h + h) = ${perimeter} ➔ h = ${height}, b = ${base}.\nArea = b × h = ${correctArea} m².`, traps: [null, "Selected the perimeter.", "Assumed a square.", "Added base and height."] },
      fr: { topic: 'GÉOMÉTRIE PLANE', text: `Un terrain rectangulaire a un périmètre de ${perimeter} m. La base est ${baseMult} fois sa hauteur. Quelle est la surface en m² ?`, hint: "Équation du périmètre: 2(b + h) = P.", micro: `2(${baseMult}h + h) = ${perimeter} ➔ h = ${height}, b = ${base}.\nSurface = b × h = ${correctArea} m².`, traps: [null, "Périmètre sélectionné.", "Carré supposé.", "Base + hauteur."] },
      de: { topic: 'PLANIMETRIE', text: `Ein rechteckiges Grundstück hat einen Umfang von ${perimeter} m. Die Basis ist ${baseMult}-mal so groß wie die Höhe. Wie groß ist die Fläche in m²?`, hint: "Umfangsgleichung: 2(b + h) = P.", micro: `2(${baseMult}h + h) = ${perimeter} ➔ h = ${height}, b = ${base}.\nFläche = b × h = ${correctArea} m².`, traps: [null, "Umfang gewählt.", "Quadrat angenommen.", "Basis + Höhe addiert."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'GEOMETRIA_PLANA', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `${o} m²`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genSpatialGeometryQuestion(lang) {
    const factor = Math.floor(Math.random() * 2) + 2; // 2 o 3
    const factorSquare = factor * factor;
    
    const correctAns = factorSquare;
    const error1 = factor; // lineal
    const error2 = factor * 2; // suma
    const error3 = factor * factor * factor; // cúbico

    const optionsRaw = [correctAns, error1, error2, error3];
    const uniqueOptions = [...new Set(optionsRaw)];
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 10) + 1);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctAns);

    const texts = {
      es: { topic: 'GEOMETRÍA ESPACIAL', text: `Si el radio de la base de un cilindro recto se multiplica por ${factor} manteniendo su altura constante, ¿por qué factor se multiplica su volumen original?`, hint: "Fórmula del volumen del cilindro: V = π·r²·h. Observa el exponente del radio.", micro: `V₁ = π·r²·h.\nSi R = ${factor}r, entonces V₂ = π·(${factor}r)²·h = π·${factorSquare}r²·h = ${factorSquare}V₁.\nEl volumen crece con el cuadrado del radio.`, traps: [null, `Trampa Lineal: Pensaste que crece en la misma proporción (${factor}).`, `Trampa Aditiva: Duplicaste el factor erróneamente.`, `Trampa Cúbica: Elevaste al cubo en vez de al cuadrado.`] },
      en: { topic: 'SPATIAL GEOMETRY', text: `If the base radius of a right cylinder is multiplied by ${factor} while height is constant, by what factor does the original volume multiply?`, hint: "Volume formula: V = π·r²·h.", micro: `V₁ = π·r²·h.\nIf R = ${factor}r, V₂ = π·(${factor}r)²·h = ${factorSquare}V₁.\nVolume grows with the square of the radius.`, traps: [null, "Linear trap.", "Additive trap.", "Cubic trap."] },
      fr: { topic: 'GÉOMÉTRIE DANS L\'ESPACE', text: `Si le rayon de la base d'un cylindre est multiplié par ${factor} à hauteur constante, par quel facteur le volume est-il multiplié ?`, hint: "Formule: V = π·r²·h.", micro: `V₁ = π·r²·h.\nSi R = ${factor}r, V₂ = π·(${factor}r)²·h = ${factorSquare}V₁.\nCroissance au carré.`, traps: [null, "Piège linéaire.", "Piège additif.", "Piège cubique."] },
      de: { topic: 'RAUMGEOMETRIE', text: `Wenn der Grundradius eines Zylinders mit ${factor} multipliziert wird (Höhe konstant), mit welchem Faktor multipliziert sich das Volumen?`, hint: "Volumenformel: V = π·r²·h.", micro: `V₁ = π·r²·h.\nWenn R = ${factor}r, V₂ = π·(${factor}r)²·h = ${factorSquare}V₁.\nWachstum im Quadrat.`, traps: [null, "Lineare Falle.", "Additive Falle.", "Kubische Falle."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'GEOMETRIA_ESPACIAL', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genTrigQuestion(lang) {
    const angle = [30, 45, 60][Math.floor(Math.random() * 3)];
    const distance = Math.floor(Math.random() * 10) + 10;
    
    let ansStr = "";
    if (angle === 45) ansStr = `${distance}`;
    if (angle === 30) ansStr = `${distance}/√3`;
    if (angle === 60) ansStr = `${distance}√3`;

    const optionsRaw = [`${distance}`, `${distance}√3`, `${distance}/√3`, `${distance*2}`];
    const uniqueOptions = [...new Set(optionsRaw)];
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(ansStr);

    const texts = {
      es: { topic: 'TRIGONOMETRÍA', text: `Una persona observa la cima de un edificio con un ángulo de elevación de ${angle}°. Si se encuentra a ${distance} metros de la base, ¿cuál es la altura exacta del edificio? (Ignora la altura de la persona).`, hint: "Usa la función Tangente = Opuesto / Adyacente.", micro: `Tan(${angle}°) = Altura / ${distance}.\nPor lo tanto, Altura = ${distance} × Tan(${angle}°).\nValores notables: Tan(45)=1, Tan(30)=1/√3, Tan(60)=√3.\nResultado = ${ansStr} metros.`, traps: [null, null, null, null] },
      en: { topic: 'TRIGONOMETRY', text: `A person looks at the top of a building with an elevation angle of ${angle}°. They are ${distance}m from the base. What is the exact height? (Ignore person's height).`, hint: "Use Tangent = Opposite / Adjacent.", micro: `Tan(${angle}°) = Height / ${distance} ➔ Height = ${distance} × Tan(${angle}°).\nResult = ${ansStr} m.`, traps: [null, null, null, null] },
      fr: { topic: 'TRIGONOMÉTRIE', text: `Une personne regarde le sommet d'un bâtiment avec un angle de ${angle}°. Elle est à ${distance}m de la base. Quelle est la hauteur exacte ?`, hint: "Tangente = Opposé / Adjacent.", micro: `Tan(${angle}°) = Hauteur / ${distance} ➔ Hauteur = ${distance} × Tan(${angle}°).\nRésultat = ${ansStr} m.`, traps: [null, null, null, null] },
      de: { topic: 'TRIGONOMETRIE', text: `Eine Person betrachtet die Spitze eines Gebäudes mit einem Winkel von ${angle}°. Sie ist ${distance}m entfernt. Wie hoch ist das Gebäude?`, hint: "Tangens = Gegenkathete / Ankathete.", micro: `Tan(${angle}°) = Höhe / ${distance} ➔ Höhe = ${distance} × Tan(${angle}°).\nErgebnis = ${ansStr} m.`, traps: [null, null, null, null] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'TRIGONOMETRIA', isAi: false, topic: langData.topic, text: langData.text, options: options, correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genAlgebraQuestion(lang) {
    const x = Math.floor(Math.random() * 5) + 2;
    const y = Math.floor(Math.random() * 5) + 1;
    const eq1Res = 2 * x + y;
    const eq2Res = x - y;

    const correctVal = x;
    const error1 = y; // Trampa: respondio y
    const error2 = x + y;
    const error3 = eq1Res;

    const optionsRaw = [correctVal, error1, error2, error3];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 15));
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'ÁLGEBRA LINEAL', text: `Dadas las ecuaciones: \n1) 2x + y = ${eq1Res} \n2) x - y = ${eq2Res} \n¿Cuál es el valor algebraico exacto de 'x'?`, hint: "Suma las dos ecuaciones de forma vertical para eliminar 'y'.", micro: `Sumando (1) + (2):\n(2x + x) + (y - y) = ${eq1Res} + ${eq2Res}\n3x = ${eq1Res + eq2Res}\nx = ${(eq1Res + eq2Res)} / 3 = ${correctVal}.`, traps: [null, `Trampa: Resolviste para 'y' en lugar de 'x'.`, `Suma incorrecta.`, `Valor directo de la ecuación.`] },
      en: { topic: 'LINEAR ALGEBRA', text: `Given equations: \n1) 2x + y = ${eq1Res} \n2) x - y = ${eq2Res} \nWhat is the exact value of 'x'?`, hint: "Add equations vertically to eliminate 'y'.", micro: `Adding (1) + (2):\n3x = ${eq1Res + eq2Res} ➔ x = ${correctVal}.`, traps: [null, "Solved for 'y'.", "Wrong sum.", "Direct value."] },
      fr: { topic: 'ALGÈBRE LINÉAIRE', text: `Équations : \n1) 2x + y = ${eq1Res} \n2) x - y = ${eq2Res} \nQuelle est la valeur exacte de 'x' ?`, hint: "Additionnez pour éliminer 'y'.", micro: `(1) + (2) ➔ 3x = ${eq1Res + eq2Res} ➔ x = ${correctVal}.`, traps: [null, "Résolu pour 'y'.", "Mauvaise somme.", "Valeur directe."] },
      de: { topic: 'LINEARE ALGEBRA', text: `Gegebene Gleichungen: \n1) 2x + y = ${eq1Res} \n2) x - y = ${eq2Res} \nWas ist der exakte Wert von 'x'?`, hint: "Addiere Gleichungen, um 'y' zu eliminieren.", micro: `(1) + (2) ➔ 3x = ${eq1Res + eq2Res} ➔ x = ${correctVal}.`, traps: [null, "Für 'y' gelöst.", "Falsche Summe.", "Direkter Wert."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'ALGEBRA_LINEAL', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genFunctionsQuestion(lang) {
    const fixed = (Math.floor(Math.random() * 5) + 5) * 1000;
    const varCost = (Math.floor(Math.random() * 3) + 2) * 100;
    const items = Math.floor(Math.random() * 10) + 15;
    const correctVal = fixed + (varCost * items);

    const error1 = varCost * items; // Solo costo variable
    const error2 = fixed * items; // Fijo como variable
    const error3 = correctVal + fixed;

    const optionsRaw = [correctVal, error1, error2, error3];
    const uniqueOptions = [...new Set(optionsRaw)].filter(n => !isNaN(n));
    while(uniqueOptions.length < 4) uniqueOptions.push(correctVal + Math.floor(Math.random() * 5000));
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'FUNCIONES Y GRÁFICAS', text: `Una fábrica tiene un costo fijo mensual de $${fixed}. Además, producir cada unidad cuesta $${varCost}. ¿Cuál es el costo total matemático de producir ${items} unidades este mes?`, hint: "Función de Costo: C(x) = Costo Fijo + (Costo Variable × x).", micro: `C(x) = ${fixed} + ${varCost}x.\nC(${items}) = ${fixed} + (${varCost} × ${items})\nC(${items}) = ${fixed} + ${varCost * items} = $${correctVal}.`, traps: [null, `Trampa: Ignoraste el costo fijo.`, `Trampa: Multiplicaste el costo fijo.`, `Suma doble.`] },
      en: { topic: 'FUNCTIONS AND GRAPHS', text: `A factory has a fixed monthly cost of $${fixed} and a variable cost of $${varCost} per unit. Total cost for ${items} units?`, hint: "Cost Function: C(x) = Fixed + (Variable × x).", micro: `C(${items}) = ${fixed} + (${varCost} × ${items}) = $${correctVal}.`, traps: [null, "Ignored fixed cost.", "Multiplied fixed cost.", "Double sum."] },
      fr: { topic: 'FONCTIONS ET GRAPHIQUES', text: `Une usine a un coût fixe de ${fixed} $ et un coût variable de ${varCost} $ par unité. Coût total pour ${items} unités ?`, hint: "Fonction: C(x) = Fixe + (Variable × x).", micro: `C(${items}) = ${fixed} + (${varCost} × ${items}) = ${correctVal} $.`, traps: [null, "Coût fixe ignoré.", "Coût fixe multiplié.", "Double somme."] },
      de: { topic: 'FUNKTIONEN UND GRAPHEN', text: `Eine Fabrik hat Fixkosten von $${fixed} und variable Kosten von $${varCost} pro Einheit. Gesamtkosten für ${items} Einheiten?`, hint: "Funktion: C(x) = Fix + (Variabel × x).", micro: `C(${items}) = ${fixed} + (${varCost} × ${items}) = $${correctVal}.`, traps: [null, "Fixkosten ignoriert.", "Fixkosten multipliziert.", "Doppelte Summe."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'FUNCIONES_Y_GRAFICAS', isAi: false, topic: langData.topic, text: langData.text, options: options.map(o => `$${o}`), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }

  static genCountingQuestion(lang) {
    // Permutación sencilla: ordenar N libros
    const n = Math.floor(Math.random() * 3) + 4; // 4, 5, 6
    let factorial = 1;
    for(let i = 2; i <= n; i++) factorial *= i;
    
    const correctVal = factorial;
    const error1 = n * n; 
    const error2 = n;
    const error3 = factorial / 2;

    const optionsRaw = [correctVal, error1, error2, error3];
    const uniqueOptions = [...new Set(optionsRaw)].filter(num => !isNaN(num));
    while(uniqueOptions.length < 4) uniqueOptions.push(Math.floor(Math.random() * 50) + 10);
    const options = uniqueOptions.sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(correctVal);

    const texts = {
      es: { topic: 'TÉCNICAS DE CONTEO', text: `¿De cuántas formas distintas se pueden ordenar ${n} libros diferentes en un estante?`, hint: "Usa factoriales para permutaciones sin repetición: n!", micro: `Permutación lineal de ${n} elementos.\n${n}! = ${Array.from({length: n}, (_, i) => n - i).join(' × ')} = ${correctVal} formas.`, traps: [null, `Trampa: Calculaste ${n}².`, `Trampa: No permutaste.`, `Dividido a la mitad.`] },
      en: { topic: 'COUNTING TECHNIQUES', text: `In how many different ways can ${n} distinct books be arranged on a shelf?`, hint: "Use factorials for permutations: n!", micro: `Linear permutation of ${n} items.\n${n}! = ${correctVal} ways.`, traps: [null, `Calculated ${n}².`, "No permutation.", "Divided by 2."] },
      fr: { topic: 'TECHNIQUES DE DÉNOMBREMENT', text: `De combien de façons différentes peut-on ranger ${n} livres distincts sur une étagère ?`, hint: "Utilisez les factorielles : n!", micro: `Permutation linéaire de ${n} éléments.\n${n}! = ${correctVal} façons.`, traps: [null, `Calculé ${n}².`, "Pas de permutation.", "Divisé par 2."] },
      de: { topic: 'ZÄHLTECHNIKEN', text: `Auf wie viele verschiedene Arten können ${n} verschiedene Bücher in einem Regal angeordnet werden?`, hint: "Fakultäten verwenden: n!", micro: `Lineare Permutation von ${n} Elementen.\n${n}! = ${correctVal} Arten.`, traps: [null, `Berechnet ${n}².`, "Keine Permutation.", "Durch 2 geteilt."] }
    };
    const langData = texts[lang] || texts['es'];
    return { id: 'TECNICAS_DE_CONTEO', isAi: false, topic: langData.topic, text: langData.text, options: options.map(String), correctIdx: correctIndex, hint: langData.hint, microclass: langData.micro, trapExplanations: langData.traps, texts: texts };
  }
}

/* ============================================================
   🧠 3. MOTOR DEEPSEEK (CONEXIÓN IA SANITIZADA Y PROTEGIDA)
============================================================ */

// MAPEO ESTRICTO DE IDIOMAS PARA LA IA (God Tier Regex Fix)
const LANG_MAP = {
    es: "SPANISH",
    en: "ENGLISH",
    fr: "FRENCH",
    de: "GERMAN"
};

class DeepSeekEngine {
  
  static cleanJSON(raw) {
    try {
      let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }
      
      try {
          return JSON.parse(cleaned);
      } catch (parseError) {
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
    const topics = [
      'RAZONAMIENTO_CUANTITATIVO', 'PORCENTAJES_Y_PROPORCIONES', 'ESTADISTICA_DESCRIPTIVA', 'PROBABILIDAD_CLASICA', 
      'GEOMETRIA_PLANA', 'GEOMETRIA_ESPACIAL', 'TRIGONOMETRIA', 'ALGEBRA_LINEAL', 'FUNCIONES_Y_GRAFICAS', 'TECNICAS_DE_CONTEO'
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    
    const targetLang = LANG_MAP[lang] || "SPANISH";

    const sysPrompt = `
      Eres un experto diseñador de exámenes de Matemáticas para el ICFES de Colombia.
      Genera una pregunta matemática analítica COMPLETAMENTE NUEVA sobre: "${selectedTopic}".
      Language for the output must strictly be: ${targetLang}.
      Inventa valores numéricos aleatorios pero matemáticamente exactos. Provee 4 opciones de respuesta, solo 1 correcta. Las otras 3 deben ser trampas de errores comunes.
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NO USES MARKDOWN ALREDEDOR. Usa comillas simples ('') dentro de los textos si necesitas citar algo.
      {
        "id": "${selectedTopic}",
        "topic": "Nombre del tema",
        "text": "El texto de la pregunta matemática...",
        "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
        "correctIdx": 0,
        "hint": "Pista lógica o fórmula sin dar la respuesta",
        "microclass": "Explicación paso a paso de la resolución correcta",
        "trapExplanations": ["Explicación de la trampa si eligió A", "Trampa B", "Trampa C", "Trampa D"]
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
      Eres un Profesor Top de Matemáticas preparando a un estudiante para el examen ICFES de Colombia.
      Genera una CLASE MAGISTRAL SIGNIFICATIVA Y DIRECTA sobre el tema: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe ser al grano, analítica, mostrando el 'truco' detrás del problema. Máximo 400 palabras en total.

      REGLAS CRÍTICAS DE SISTEMA PARA PREVENIR ERRORES:
      1. RESPONDE SÓLO EN JSON VÁLIDO. NADA DE MARKDOWN FUERA DEL JSON.
      2. ESCAPA TODOS LOS SALTOS DE LÍNEA USANDO \\n DENTRO DE LAS CADENAS DE TEXTO.
      3. USA COMILLAS SIMPLES ('') para citar dentro del texto, NUNCA comillas dobles ("").
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DEL TEMA MATEMÁTICO",
        "theory": "Explicación teórica corta, lógica y fácil de entender. (max 150 palabras)",
        "trap": "La trampa típica matemática del ICFES explicada brevemente.",
        "protocol": "1. Paso uno.\\n2. Paso dos.",
        "demoQuestion": {
           "text": "Problema matemático avanzado generado al azar...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Explicación matemática y paso a paso de la respuesta."
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
   🔊 4. MOTOR DE AUDIO SCI-FI
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
      start: "INICIAR SIMULACIÓN ICFES", title: "LABORATORIO ICFES MATEMÁTICAS", 
      scan: "ESCÁNER LÁSER DE PISTAS", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO", mastery: "Maestría Cuántica", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE MÓDULO ➔",
      btnRetrySame: "REINTENTAR MATRIZ ➔", 
      correctTitle: "¡ANÁLISIS PERFECTO!", wrongTitle: "RUPTURA LÓGICA",
      statsBtn: "TELEMETRÍA", theoryText: "SISTEMA DE GENERACIÓN IA ACTIVO. Este simulador está conectado a DeepSeek Neural Net. Cada ejercicio matemático es único, calculado al instante. Si la IA detecta latencia, se te asignará un reto algorítmico de emergencia sin interrumpir tu flujo.",
      timeout: "¡COLAPSO TÉRMICO (TIEMPO AGOTADO)!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD DE TELEMETRÍA GLOBAL", avgTime: "Tiempo Medio de Resolución",
      btnRetry: "PURGAR CACHÉ", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡RENDIMIENTO PERFECTO! NO HAY DEBILIDADES.",
      aiSelectTopic: "Selecciona el dominio a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME TÁCTICO",
      loadingData: "ESTABLECIENDO CONEXIÓN NEURONAL DEEPSEEK...",
      warmupTitle: "⚡ RETO DE CALENTAMIENTO", warmupSub: "Mientras la IA Cuántica sintetiza tu matriz principal..."
  },
  en: {
      start: "START ICFES SIMULATION", title: "ICFES MATHEMATICS LAB", scan: "LASER INQUIRY SCANNER", aiBtn: "AI TUTOR", time: "CHRONOMETER", mastery: "Quantum Mastery", btnCheck: "SYNTHESIZE ANSWER", btnNext: "NEXT MODULE ➔", btnRetrySame: "RETRY MATRIX ➔", correctTitle: "PERFECT ANALYSIS!", wrongTitle: "LOGICAL RUPTURE", statsBtn: "TELEMETRY", theoryText: "AI GENERATION SYSTEM ACTIVE. This simulator is hooked to DeepSeek Neural Net. Every math exercise is uniquely calculated. If latency is detected, an emergency algorithm will deploy.", timeout: "THERMAL COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL TELEMETRY DASHBOARD", avgTime: "Avg Resolution Time", btnRetry: "PURGE CACHE", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT PERFORMANCE!", aiSelectTopic: "Select the domain to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD TACTICAL REPORT", loadingData: "ESTABLISHING DEEPSEEK NEURAL LINK...", warmupTitle: "⚡ WARM-UP CHALLENGE", warmupSub: "While AI synthesizes your main matrix..."
  },
  fr: {
      start: "DÉMARRER LA SIMULATION", title: "LAB. DE MATHÉMATIQUES ICFES", scan: "SCANNER LASER", aiBtn: "TUTEUR IA", time: "CHRONOMÈTRE", mastery: "Maîtrise Quantique", btnCheck: "SYNTHÉTISER", btnNext: "MODULE SUIVANT ➔", btnRetrySame: "RÉESSAYER ➔", correctTitle: "ANALYSE PARFAITE!", wrongTitle: "RUPTURE LOGIQUE", statsBtn: "TÉLÉMÉTRIE", theoryText: "SYSTÈME IA ACTIF. Ce simulateur génère des exercices mathématiques uniques instantanément.", timeout: "EFFONDREMENT THERMIQUE!", topic: "DOMAINE ACTIF", dashboard: "TABLEAU DE BORD TÉLÉMÉTRIQUE", avgTime: "Temps Moyen de Résolution", btnRetry: "PURGER LE CACHE", aiSocraticBtn: "DEMANDER MASTERCLASS IA", socraticModal: "FAILLES DÉTECTÉES :", aiPraise: "PERFORMANCE PARFAITE !", aiSelectTopic: "Sélectionnez le domaine :", aiClose: "FERMER LA SESSION IA", downloadReport: "TÉLÉCHARGER LE RAPPORT TACTIQUE", loadingData: "ÉTABLISSEMENT DU LIEN NEURONAL...", warmupTitle: "⚡ DÉFI D'ÉCHAUFFEMENT", warmupSub: "Pendant que l'IA synthétise la matrice..."
  },
  de: {
      start: "SIMULATION STARTEN", title: "ICFES MATHEMATIK LABOR", scan: "LASER-SCANNER", aiBtn: "KI-TUTOR", time: "CHRONOMETER", mastery: "Quantenbeherrschung", btnCheck: "ANTWORT SYNTHETISIEREN", btnNext: "NÄCHSTES MODUL ➔", btnRetrySame: "WIEDERHOLEN ➔", correctTitle: "PERFEKTE ANALYSE!", wrongTitle: "LOGISCHER BRUCH", statsBtn: "TELEMETRIE", theoryText: "KI-SYSTEM AKTIV. Diese unendliche generative Engine erlaubt kein Auswendiglernen.", timeout: "THERMISCHER KOLLAPS!", topic: "AKTIVE DOMÄNE", dashboard: "GLOBALE TELEMETRIE", avgTime: "Durchschnittliche Lösungszeit", btnRetry: "CACHE LÖSCHEN", aiSocraticBtn: "KI MASTERCLASS ANFORDERN", socraticModal: "FEHLER ERKANNT IN:", aiPraise: "PERFEKTE LEISTUNG!", aiSelectTopic: "Wählen Sie die Domäne:", aiClose: "KI-SITZUNG SCHLIESSEN", downloadReport: "TAKTIKBERICHT HERUNTERLADEN", loadingData: "AUFBAU DER NEURONALEN VERBINDUNG...", warmupTitle: "⚡ AUFWÄRMHERAUSFORDERUNG", warmupSub: "Während die KI deine Matrix synthetisiert..."
  }
};

// DICCIONARIO ESPECÍFICO PARA EL REPORTE PDF
const DICT_REPORT = {
    es: {
        docTitle: "DOSSIER TÁCTICO ICFES",
        docSub: "SIMULACIÓN CUÁNTICA DE MATEMÁTICAS",
        dateLabel: "Fecha de Extracción",
        kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO",
        kpiAcc: "Precisión Neuronal",
        kpiTime: "Tiempo de Resolución",
        kpiTotal: "Matrices Resueltas",
        aiTitle: "VEREDICTO DEL SISTEMA DE INTELIGENCIA ARTIFICIAL",
        aiVuln: "⚠️ VULNERABILIDADES TÁCTICAS DETECTADAS",
        aiVulnDesc: "El operador muestra deficiencias críticas en los siguientes dominios:",
        aiAction: "PLAN DE ACCIÓN DE IA",
        aiActionDesc: "Es imperativo solicitar el módulo 'Masterclass IA' dentro del simulador para re-entrenar las redes neuronales biológicas en estos temas.",
        aiOpt: "✅ RENDIMIENTO ÓPTIMO ALCANZADO",
        aiOptDesc: "No se detectan vulnerabilidades críticas. El operador está calificado y listo para enfrentar escenarios matemáticos complejos.",
        aiNoData: "Datos biométricos insuficientes. El operador debe completar más simulaciones para emitir un veredicto válido.",
        topicTitle: "DESGLOSE MICRO-ANALÍTICO POR DOMINIO",
        topicNoData: "Aún no se han procesado suficientes dominios lógicos.",
        topicHit: "Aciertos",
        topicMiss: "Fallos",
        footer: "DOCUMENTO CLASIFICADO GENERADO POR LEARNING LABS ENGINE V27.0",
        footerSub: "El conocimiento es la única ventaja táctica inquebrantable."
    },
    en: {
        docTitle: "ICFES TACTICAL DOSSIER",
        docSub: "QUANTUM MATHEMATICS SIMULATION",
        dateLabel: "Extraction Date",
        kpiTitle: "GLOBAL PERFORMANCE METRICS",
        kpiAcc: "Neural Accuracy",
        kpiTime: "Resolution Time",
        kpiTotal: "Matrices Solved",
        aiTitle: "ARTIFICIAL INTELLIGENCE SYSTEM VERDICT",
        aiVuln: "⚠️ TACTICAL VULNERABILITIES DETECTED",
        aiVulnDesc: "The operator shows critical deficiencies in the following domains:",
        aiAction: "AI ACTION PLAN",
        aiActionDesc: "It is imperative to request the 'AI Masterclass' module within the simulator to retrain biological neural networks on these topics.",
        aiOpt: "✅ OPTIMAL PERFORMANCE ACHIEVED",
        aiOptDesc: "No critical vulnerabilities detected. The operator is qualified and ready to face high-complexity math scenarios.",
        aiNoData: "Insufficient biometric data. The operator must complete more simulations to issue a valid verdict.",
        topicTitle: "MICRO-ANALYTICAL DOMAIN BREAKDOWN",
        topicNoData: "Not enough logical domains have been processed yet.",
        topicHit: "Hits",
        topicMiss: "Misses",
        footer: "CLASSIFIED DOCUMENT GENERATED BY LEARNING LABS ENGINE V27.0",
        footerSub: "Knowledge is the only unbreakable tactical advantage."
    },
    fr: {
        docTitle: "DOSSIER TACTIQUE ICFES",
        docSub: "SIMULATION QUANTIQUE DE MATHÉMATIQUES",
        dateLabel: "Date d'extraction",
        kpiTitle: "MÉTRIQUES GLOBALES DE PERFORMANCE",
        kpiAcc: "Précision Neuronale",
        kpiTime: "Temps de Résolution",
        kpiTotal: "Matrices Résolues",
        aiTitle: "VERDICT DU SYSTÈME D'INTELLIGENCE ARTIFICIELLE",
        aiVuln: "⚠️ VULNÉRABILITÉS TACTIQUES DÉTECTÉES",
        aiVulnDesc: "L'opérateur montre des lacunes critiques dans les domaines suivants :",
        aiAction: "PLAN D'ACTION IA",
        aiActionDesc: "Il est impératif de demander le module 'Masterclass IA' dans le simulateur pour réentraîner les réseaux de neurones biologiques sur ces sujets.",
        aiOpt: "✅ PERFORMANCE OPTIMALE ATTEINTE",
        aiOptDesc: "Aucune vulnérabilité critique détectée. L'opérateur est qualifié et prêt à affronter des scénarios mathématiques complexes.",
        aiNoData: "Données biométriques insuffisantes. L'opérateur doit terminer plus de simulations pour émettre un verdict valide.",
        topicTitle: "RÉPARTITION MICRO-ANALYTIQUE PAR DOMAINE",
        topicNoData: "Pas encore assez de domaines logiques traités.",
        topicHit: "Succès",
        topicMiss: "Échecs",
        footer: "DOCUMENT CLASSIFIÉ GÉNÉRÉ PAR LEARNING LABS ENGINE V27.0",
        footerSub: "La connaissance est le seul avantage tactique inébranlable."
    },
    de: {
        docTitle: "ICFES TAKTISCHES DOSSIER",
        docSub: "QUANTENMATHEMATIK-SIMULATION",
        dateLabel: "Extraktionsdatum",
        kpiTitle: "GLOBALE LEISTUNGSKENNZAHLEN",
        kpiAcc: "Neuronale Genauigkeit",
        kpiTime: "Lösungszeit",
        kpiTotal: "Gelöste Matrizen",
        aiTitle: "URTEIL DES KÜNSTLICHEN INTELLIGENZSYSTEMS",
        aiVuln: "⚠️ TAKTISCHE SCHWACHSTELLEN ERKANNT",
        aiVulnDesc: "Der Bediener zeigt kritische Mängel in folgenden Bereichen:",
        aiAction: "KI-AKTIONSPLAN",
        aiActionDesc: "Es ist zwingend erforderlich, das 'KI-Masterclass'-Modul im Simulator anzufordern, um biologische neuronale Netze in diesen Themenbereichen neu zu trainieren.",
        aiOpt: "✅ OPTIMALE LEISTUNG ERREICHT",
        aiOptDesc: "Keine kritischen Schwachstellen erkannt. Der Bediener ist qualifiziert und bereit für hochkomplexe mathematische Szenarien.",
        aiNoData: "Unzureichende biometrische Daten. Der Bediener muss weitere Simulationen abschließen, um ein gültiges Urteil zu fällen.",
        topicTitle: "MIKROANALYTISCHE DOMÄNENAUFSCHLÜSSELUNG",
        topicNoData: "Noch nicht genügend logische Domänen verarbeitet.",
        topicHit: "Treffer",
        topicMiss: "Fehler",
        footer: "KLASSIFIZIERTES DOKUMENT, ERSTELLT VON LEARNING LABS ENGINE V27.0",
        footerSub: "Wissen ist der einzige unzerbrechliche taktische Vorteil."
    }
};

const TIPS_DB = {
  es: [
    "RECUERDA: En el ICFES, el volumen de un cilindro se CUADRUPLICA si duplicas el radio. No asumas que es una relación lineal.",
    "TRUCO ICFES: Si te piden una probabilidad, revisa las opciones. Toda probabilidad DEBE ser un número entre 0 y 1.",
    "OJO: Un descuento del 20% más un IVA del 19% NO te da el precio original. Los porcentajes son multiplicativos, no sumas planas.",
    "ESTRATEGIA: En preguntas de tablas y gráficas, lee SIEMPRE los títulos de los ejes antes de mirar los datos.",
    "CONCEPTO: Si el orden de los elementos importa es Permutación. Si el orden da igual, es Combinación."
  ],
  en: [
    "REMEMBER: The volume of a cylinder QUADRUPLES if you double the radius. Do not assume a linear relationship.",
    "ICFES TRICK: Probability must ALWAYS be between 0 and 1. Check the options carefully.",
    "WATCH OUT: A 20% discount plus a 19% tax does NOT equal the original price. Percentages are multiplicative.",
    "STRATEGY: In graph questions, ALWAYS read the axis titles before looking at the data.",
    "CONCEPT: If order matters, it's a Permutation. If order doesn't matter, it's a Combination."
  ],
  fr: [
    "RAPPEL : Le volume d'un cylindre QUADRUPLE si vous doublez le rayon.",
    "ASTUCE ICFES : La probabilité doit TOUJOURS être comprise entre 0 et 1.",
    "ATTENTION : Une remise de 20 % plus une taxe de 19 % NE DONNE PAS le prix d'origine.",
    "STRATÉGIE : Lisez TOUJOURS les titres des axes avant de regarder les données graphiques.",
    "CONCEPT : Si l'ordre compte, c'est une Permutation. Sinon, c'est une Combinaison."
  ],
  de: [
    "DENKEN SIE DARAN: Das Volumen eines Zylinders VERVIERFACHT sich, wenn Sie den Radius verdoppeln.",
    "ICFES-TRICK: Wahrscheinlichkeiten liegen IMMER zwischen 0 und 1.",
    "VORSICHT: 20% Rabatt plus 19% Steuern ergeben NICHT den ursprünglichen Preis.",
    "STRATEGIE: Lesen Sie bei Diagrammen IMMER zuerst die Achsenbeschriftungen.",
    "KONZEPT: Wenn die Reihenfolge wichtig ist, ist es eine Permutation. Wenn nicht, eine Kombination."
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
   🎥 7. NÚCLEO 3D AVANZADO
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

  const particleSpeed = isExploding ? 0.2 : (isLoading ? 0.1 : 0.02 + (timeRatio * 0.08)); 

  useFrame((state) => {
    if (isExploding || isCritical) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 80) * (isExploding ? 1.5 : 0.2);
      state.camera.position.y = 2 + Math.cos(state.clock.elapsedTime * 90) * (isExploding ? 1.5 : 0.2);
    } else if (isLoading) {
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 2) * 5;
      state.camera.position.z = 25 + Math.cos(state.clock.elapsedTime * 2) * 5;
    } else {
      state.camera.position.lerp(new THREE.Vector3(0, 2, 28), 0.05);
    }
    state.camera.lookAt(0, 0, 0);
    
    if (torusRef.current) {
        torusRef.current.rotation.y += particleSpeed;
        torusRef.current.rotation.x += particleSpeed * 0.5;
        if (isDanger && !isExploding && !isLoading) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 25) * (timeRatio * 0.15);
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
      <Stars count={4000} factor={5} fade speed={isExploding ? 6 : (isLoading ? 4 : 2)} />
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
          'RAZONAMIENTO_CUANTITATIVO': { c: 0, w: 0 },
          'PORCENTAJES_Y_PROPORCIONES': { c: 0, w: 0 },
          'ESTADISTICA_DESCRIPTIVA': { c: 0, w: 0 },
          'PROBABILIDAD_CLASICA': { c: 0, w: 0 },
          'GEOMETRIA_PLANA': { c: 0, w: 0 },
          'GEOMETRIA_ESPACIAL': { c: 0, w: 0 },
          'TRIGONOMETRIA': { c: 0, w: 0 },
          'ALGEBRA_LINEAL': { c: 0, w: 0 },
          'FUNCIONES_Y_GRAFICAS': { c: 0, w: 0 },
          'TECNICAS_DE_CONTEO': { c: 0, w: 0 }
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

      // MANEJO UNIFICADO DE CALIFICACIÓN
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
                  <div className="glass-panel" style={{borderColor:'#f00', maxWidth:'1000px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(255,0,255,0.3)', maxHeight:'90vh', overflowY:'auto'}}>
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
                                          <span>${REPORT_UI.topicHit}: <span style={{color:'#0f0'}}>{t.c}</span></span>
                                          <span>${REPORT_UI.topicMiss}: <span style={{color:'#f00'}}>{t.w}</span></span>
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