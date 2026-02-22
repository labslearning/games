import React, { Suspense, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sphere, Float, MeshDistortMaterial, ContactShadows, Sparkles, Line } from '@react-three/drei';
import { EffectComposer, Bloom, Scanline, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   📱 HOOK DE RESPONSIVIDAD 3D (MOBILE FIRST)
============================================================ */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

/* ============================================================
    1. MOTOR DE AUDIO Y VOZ SEGURO
============================================================ */
const safeSpeak = (text, langCode) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel(); 
  setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }, 50);
};

class SafeAudioEngine {
  constructor() { this.ctx = null; }
  init() { 
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + dur);
      osc.start(); osc.stop(this.ctx.currentTime + dur);
    } catch(e) {} 
  }
  laser() { this._play('square', 1200, 100, 0.3, 0.2); }
  extract() { this._play('sawtooth', 200, 1200, 0.4, 0.2); }
  impact() { this._play('sine', 150, 40, 0.4, 0.5); }
  success() { this._play('sine', 440, 880, 0.4, 0.2); setTimeout(()=>this._play('sine', 880, 1760, 0.5, 0.2), 150); }
  error() { this._play('sawtooth', 150, 50, 0.4, 0.3); }
}
const sfx = new SafeAudioEngine();

/* ============================================================
   🌍 2. DICCIONARIO GLOBAL 100% TRADUCIDO (CERO FALLBACKS)
============================================================ */
const I18N = {
  es: {
    ui: { 
      start: "INICIAR NANO-CORE", title: "NANO-CORE V11", level: "NIVEL", exp: "EXP", target: "META",
      theoryTitle: "TUTORÍA TEÓRICA", theoryBtn: "ENTENDIDO ➔", diagTitle: "ANÁLISIS COGNITIVO", diagQ1: "debe pasar de", diagQ2: "a", diagQ3: "¿Qué debe ocurrir con sus electrones?", 
      btnGain: "GANAR e⁻ (REDUCIR)", btnLose: "PERDER e⁻ (OXIDAR)", diagGalvanic: "En una batería, ¿hacia dónde fluyen los electrones?", 
      btnZnCu: "ZINC ➔ COBRE", btnCuZn: "COBRE ➔ ZINC", btnInject: "INYECTAR e⁻", btnExtract: "EXTRAER e⁻", btnTransfer: "CERRAR CIRCUITO", 
      synthTitle: "APLICACIÓN REAL", btnNext: "SIGUIENTE RETO ➔", winTitle: "🏅 MAESTRÍA ALCANZADA", btnBack: "⬅ SALIR",
      btnAI: "🤖 PREGUNTA IA", microClassTitle: "MICRO-CLASE IA", aiCorrect: "¡Excelente! Comprensión absoluta.", btnContinue: "CONTINUAR"
    },
    ai: { wrongMath: "Incorrecto. Ganar electrones resta carga.", correct: "Correcto. Proceda.", wrongTool: "Herramienta incorrecta.", galvanicError: "Falso. El Zinc cede electrones.", galvanicCorrect: "Circuito correcto.", synth: "Estabilizado. Analizando datos...", start: "Analice el núcleo.", boss: "Construcción de Batería.", aiIntro: "Evaluación activada. Selecciona la respuesta correcta." },
    theory: ["La OXIDACIÓN es PERDER electrones.", "La REDUCCIÓN es GANAR electrones.", "El hierro se oxida al aire, podemos reducirlo.", "El Cobre es un conductor excelente si se reduce.", "Los halógenos como el Cloro aman ganar electrones.", "El Aluminio requiere inmensa energía para reducirse.", "El Magnesio se oxida emitiendo luz blanca.", "El Azufre forma cristales amarillos al oxidarse.", "El Oro es un metal noble, muy difícil de oxidar.", "La Pila Galvánica oxida un metal para dar energía a otro."],
    realWorld: ["El Sodio reacciona violentamente perdiendo 1 electrón.", "Las plantas oxidan el agua liberando Oxígeno.", "La hemoglobina reduce el Hierro para transportar oxígeno.", "El cobre se reduce para hacer cables eléctricos.", "El cloro gana electrones para purificar agua.", "Reciclar aluminio requiere inyectar electrones.", "El magnesio se oxida en los fuegos artificiales.", "El azufre se oxida en los volcanes.", "El oro se oxida para ser disuelto en la minería.", "El Zinc da energía al Cobre. Así funcionan las baterías."],
    elements: ["Sodio", "Oxígeno", "Hierro", "Cobre", "Cloro", "Aluminio", "Magnesio", "Azufre", "Oro", "Batería"],
    questions: [
      { q: "¿Qué ión forma el Sodio al oxidarse?", options: ["Catión (+1)", "Anión (-1)", "Neutro", "Isótopo"], correct: 0, micro: "Al perder un electrón negativo, el Sodio queda con carga positiva, formando un catión." },
      { q: "¿Cuál es el estado de oxidación del Oxígeno puro (O2)?", options: ["0", "-2", "+1", "+2"], correct: 0, micro: "Los elementos en su estado libre siempre tienen un estado de oxidación de cero." },
      { q: "Si el Hierro pasa de +3 a +2, ¿qué proceso ocurrió?", options: ["Reducción", "Oxidation", "Fusión", "Fisión"], correct: 0, micro: "La carga se redujo. Esto significa que ganó una carga negativa (un electrón)." },
      { q: "¿Qué partículas viajan para que el Cobre se reduzca?", options: ["Electrones", "Protones", "Neutrones", "Quarks"], correct: 0, micro: "En las reacciones Redox, las únicas partículas que se transfieren son los electrones." },
      { q: "El Cloro gana electrones fácilmente porque es un...", options: ["Halógeno", "Gas noble", "Metal", "Líquido"], correct: 0, micro: "Los halógenos necesitan ganar solo un electrón para completar su octet." },
      { q: "Reducir Aluminio en las fábricas requiere mucha...", options: ["Electricidad", "Agua", "Presión", "Oxígeno"], correct: 0, micro: "Se necesita electrólisis, un proceso que usa cantidades masivas de electricidad." },
      { q: "La rápida oxidación del Magnesio se conoce como...", options: ["Combustion", "Evaporación", "Sublimación", "Fusión"], correct: 0, micro: "La combustión es una oxidación tan rápida que libera energía en forma de luz y calor." },
      { q: "Si el Azufre pasa de -2 a 0, ¿cuántos electrones pierde?", options: ["2", "1", "4", "0"], correct: 0, micro: "Para subir de -2 a 0, debe deshacerse matemáticamente de 2 cargas negativas." },
      { q: "¿Por qué el Oro apenas se oxida en la naturaleza?", options: ["Es metal noble", "Es un gas", "Es muy ligero", "Es irreal"], correct: 0, micro: "Los metales nobles tienen una estructura muy estable que resiste perder electrones." },
      { q: "En una celda galvánica, la oxidación ocurre en el...", options: ["Ánodo", "Cátodo", "Cable", "Puente salino"], correct: 0, micro: "El Ánodo es siempre el electrodo donde ocurre la oxidación." }
    ]
  },
  en: {
    ui: { 
      start: "START NANO-CORE", title: "NANO-CORE V11", level: "LEVEL", exp: "EXP", target: "TARGET",
      theoryTitle: "THEORETICAL TUTORIAL", theoryBtn: "UNDERSTOOD ➔", diagTitle: "COGNITIVE ANALYSIS", diagQ1: "must go from", diagQ2: "to", diagQ3: "What must happen to its electrons?", 
      btnGain: "GAIN e⁻ (REDUCE)", btnLose: "LOSE e⁻ (OXIDIZE)", diagGalvanic: "In a battery, where do electrons flow?", 
      btnZnCu: "ZINC ➔ COPPER", btnCuZn: "COPPER ➔ ZINC", btnInject: "INJECT e⁻", btnExtract: "EXTRACT e⁻", btnTransfer: "CLOSE CIRCUIT", 
      synthTitle: "REAL APPLICATION", btnNext: "NEXT CHALLENGE ➔", winTitle: "🏅 MASTERY ACHIEVED", btnBack: "⬅ EXIT",
      btnAI: "🤖 AI QUESTION", microClassTitle: "AI MICRO-CLASS", aiCorrect: "Excellent! Absolute comprehension.", btnContinue: "CONTINUE" 
    },
    ai: { wrongMath: "Incorrect. Gaining subtracts charge.", correct: "Correct. Proceed.", wrongTool: "Wrong tool.", galvanicError: "False. Zinc yields electrons.", galvanicCorrect: "Circuit correct.", synth: "Stabilized. Analyzing...", start: "Analyze the core.", boss: "Battery Construction.", aiIntro: "Evaluation active. Select the correct answer." },
    theory: ["OXIDATION is LOSING electrons.", "REDUCTION is GAINING electrons.", "We reduce iron to purify it.", "Copper is a great conductor when reduced.", "Halogens like Chlorine love to gain electrons.", "Aluminum needs immense energy to reduce.", "Magnesium oxidizes emitting white light.", "Sulfur forms yellow crystals.", "Gold is a noble metal, hard to oxidize.", "A Galvanic Cell uses oxidation to send energy."],
    realWorld: ["Sodium reacts by losing 1 electron.", "Plants oxidize water releasing Oxygen.", "Hemoglobin reduces Fe+3 to Fe+2 to transport oxygen.", "Copper is reduced to metal for wires.", "Chlorine gains 1 electron to purify water.", "Recycling aluminum requires injecting 3 electrons.", "Magnesium oxidizes in fireworks.", "Sulfur oxidizes forming volcanic crystals.", "Gold is oxidized to (+3) in mining.", "Zinc gives energy to Copper. This runs batteries."],
    elements: ["Sodium", "Oxygen", "Iron", "Copper", "Chlorine", "Aluminum", "Magnesium", "Sulfur", "Gold", "Battery"],
    questions: [
      { q: "What ion does Sodium form when oxidized?", options: ["Cation (+1)", "Anion (-1)", "Neutral", "Isotope"], correct: 0, micro: "By losing a negative electron, Sodium gets a positive charge, forming a cation." },
      { q: "What is the oxidation state of pure Oxygen (O2)?", options: ["0", "-2", "+1", "+2"], correct: 0, micro: "Elements in their free state always have an oxidation state of zero." },
      { q: "If Iron goes from +3 to +2, what happened?", options: ["Reduction", "Oxidation", "Fusion", "Fission"], correct: 0, micro: "The charge reduced, meaning it gained a negative electron (Reduction)." },
      { q: "What particles travel to reduce Copper?", options: ["Electrons", "Protons", "Neutrons", "Quarks"], correct: 0, micro: "In Redox reactions, only electrons are transferred between atoms." },
      { q: "Chlorine gains electrons easily because it is a...", options: ["Halogen", "Noble gas", "Metal", "Liquid"], correct: 0, micro: "Halogens need just one electron to complete their octet." },
      { q: "Reducing Aluminum in factories requires massive...", options: ["Electricity", "Water", "Pressure", "Oxygen"], correct: 0, micro: "Electrolysis is used, a process requiring massive amounts of electricity." },
      { q: "The rapid oxidation of Magnesium is known as...", options: ["Combustion", "Evaporation", "Sublimation", "Fusion"], correct: 0, micro: "Combustion is rapid oxidation that releases light and heat." },
      { q: "If Sulfur goes from -2 to 0, how many electrons are lost?", options: ["2", "1", "4", "0"], correct: 0, micro: "To rise from -2 to 0, it must get rid of 2 negative charges." },
      { q: "Why does Gold hardly oxidize in nature?", options: ["Noble metal", "Gas", "Lightweight", "Artificial"], correct: 0, micro: "Noble metals have a very stable electronic structure that resists losing electrons." },
      { q: "In a galvanic cell, oxidation occurs at the...", options: ["Anode", "Cathode", "Wire", "Salt Bridge"], correct: 0, micro: "The Anode is always the electrode where oxidation occurs." }
    ]
  },
  fr: {
    ui: { 
      start: "DÉMARRER NANO-CORE", title: "NANO-CORE V11", level: "NIVEAU", exp: "EXP", target: "CIBLE",
      theoryTitle: "TUTORIEL THÉORIQUE", theoryBtn: "COMPRIS ➔", diagTitle: "ANALYSE COGNITIVE", diagQ1: "doit passer de", diagQ2: "à", diagQ3: "Que doit-il arriver à ses électrons?", 
      btnGain: "GAGNER e⁻ (RÉDUIRE)", btnLose: "PERDRE e⁻ (OXYDER)", diagGalvanic: "Dans une pile, où circulent les électrons?", 
      btnZnCu: "ZINC ➔ CUIVRE", btnCuZn: "CUIVRE ➔ ZINC", btnInject: "INJECTER e⁻", btnExtract: "EXTRAIRE e⁻", btnTransfer: "FERMER LE CIRCUIT", 
      synthTitle: "APPLICATION RÉELLE", btnNext: "DÉFI SUIVANT ➔", winTitle: "🏅 MAÎTRISE ATTEINTE", btnBack: "⬅ QUITTER",
      btnAI: "🤖 QUESTION IA", microClassTitle: "MICRO-CLASSE IA", aiCorrect: "Excellent! Compréhension absolue.", btnContinue: "CONTINUER" 
    },
    ai: { wrongMath: "Incorrect. Gagner soustrait la charge.", correct: "Correct. Procédez.", wrongTool: "Mauvais outil.", galvanicError: "Faux. Le Zinc cède des électrons.", galvanicCorrect: "Circuit correct.", synth: "Stabilisé. Analyse...", start: "Analysez le noyau.", boss: "Construction de Batterie.", aiIntro: "Évaluation active. Choisissez la bonne réponse." },
    theory: ["L'OXYDATION c'est PERDRE des électrons.", "La RÉDUCTION c'est GAGNER des électrons.", "Le fer s'oxyde, on le réduit pour le purifier.", "Le Cuivre est un excellent conducteur.", "Les halogènes aiment gagner des électrons.", "L'Aluminium nécessite une énergie immense.", "Le Magnésium s'oxyde en émettant une lumière blanche.", "Le Soufre forme des cristaux jaunes.", "L'Or est un métal noble, difficile à oxyder.", "Une Pile Galvanique oxyde un métal pour donner de l'énergie."],
    realWorld: ["Le Sodium réagit violemment en perdant 1 électron.", "Les plantes libèrent de l'Oxygène pur.", "L'hémoglobine réduit le Fer pour transporter l'oxygène.", "Le Cuivre est réduit pour fabriquer des câbles.", "Le Chlore gagne des électrons pour purifier l'eau.", "Le recyclage nécessite d'injecter des électrons.", "Le Magnésium s'oxyde dans les feux d'artifice.", "Le Soufre s'oxyde dans les volcans.", "L'Or s'oxyde pour être dissous dans les mines.", "Le Zinc donne de l'énergie au Cuivre. Ainsi fonctionnent les batteries."],
    elements: ["Sodium", "Oxygène", "Fer", "Cuivre", "Chlore", "Aluminium", "Magnésium", "Soufre", "Or", "Batterie"],
    questions: [
      { q: "Quel ion forme le Sodium en s'oxydant?", options: ["Cation (+1)", "Anion (-1)", "Neutre", "Isotope"], correct: 0, micro: "En perdant un électron négatif, le Sodium obtient une charge positive (cation)." },
      { q: "Quel est l'état d'oxydation de l'Oxygène pur (O2)?", options: ["0", "-2", "+1", "+2"], correct: 0, micro: "Les éléments à l'état pur ont toujours un état d'oxydation de zéro." },
      { q: "Si le Fer passe de +3 à +2, que s'est-il passé?", options: ["Réduction", "Oxydation", "Fusion", "Fission"], correct: 0, micro: "La charge a diminué, ce qui signifie qu'il a gagné un électron négatif (Réduction)." },
      { q: "Quelles particules voyagent pour réduire le Cuivre?", options: ["Électrons", "Protons", "Neutrons", "Quarks"], correct: 0, micro: "Dans les réactions Redox, seuls les électrons sont transférés." },
      { q: "Le Chlore gagne des électrons car il est un...", options: ["Halogène", "Gaz noble", "Métal", "Liquide"], correct: 0, micro: "Les halogènes ont besoin d'un électron pour compléter leur octet." },
      { q: "Réduire l'Aluminium nécessite beaucoup...", options: ["D'électricité", "D'eau", "De pression", "D'oxygène"], correct: 0, micro: "L'électrolyse est utilisée, nécessitant des quantités massives d'électricité." },
      { q: "L'oxydation rapide du Magnésium s'appelle...", options: ["Combustion", "Évaporation", "Sublimation", "Fusion"], correct: 0, micro: "La combustion est une oxydation rapide libérant lumière et chaleur." },
      { q: "Si le Soufre passe de -2 à 0, combien d'électrons perd-il?", options: ["2", "1", "4", "0"], correct: 0, micro: "Pour passer de -2 à 0, il doit se débarrasser de 2 charges négatives." },
      { q: "Pourquoi l'Or s'oxyde-t-il difficilement?", options: ["Métal noble", "Gaz", "Léger", "Artificiel"], correct: 0, micro: "Les métaux nobles ont une structure électronique très stable." },
      { q: "Dans une pile, l'oxydation se produit à...", options: ["L'anode", "La cathode", "Le câble", "Le pont salin"], correct: 0, micro: "L'anode est toujours l'électrode où se produit l'oxydation." }
    ]
  },
  de: {
    ui: { 
      start: "START NANO-CORE", title: "NANO-CORE V11", level: "LEVEL", exp: "EXP", target: "ZIEL",
      theoryTitle: "THEORETISCHES TUTORIAL", theoryBtn: "VERSTANDEN ➔", diagTitle: "KOGNITIVE ANALYSE", diagQ1: "muss von", diagQ2: "auf", diagQ3: "Was muss mit seinen Elektronen passieren?", 
      btnGain: "GEWINNEN e⁻ (REDUZIEREN)", btnLose: "VERLIEREN e⁻ (OXIDIEREN)", diagGalvanic: "Wohin fließen die Elektronen in einer Batterie?", 
      btnZnCu: "ZINK ➔ KUPFER", btnCuZn: "KUPFER ➔ ZINK", btnInject: "INJIZIEREN e⁻", btnExtract: "EXTRAHIEREN e⁻", btnTransfer: "STROMKREIS SCHLIESSEN", 
      synthTitle: "REALE ANWENDUNG", btnNext: "NÄCHSTE HERAUSFORDERUNG ➔", winTitle: "🏅 MEISTERSCHAFT ERREICHT", btnBack: "⬅ BEENDEN",
      btnAI: "🤖 KI-FRAGE", microClassTitle: "KI MIKRO-KLASSE", aiCorrect: "Ausgezeichnet! Absolutes Verständnis.", btnContinue: "WEITER" 
    },
    ai: { wrongMath: "Falsch. Elektronen gewinnen subtrahiert Ladung.", correct: "Korrekt. Fortfahren.", wrongTool: "Falsches Werkzeug.", galvanicError: "Falsch. Zink gibt Elektronen ab.", galvanicCorrect: "Stromkreis korrekt.", synth: "Stabilisiert. Analysiere...", start: "Analysieren Sie den Kern.", boss: "Batteriebau.", aiIntro: "Auswertung aktiv. Wählen Sie die richtige Antwort." },
    theory: ["OXIDATION ist Elektronen VERLIEREN.", "REDUKTION ist Elektronen GEWINNEN.", "Wir reduzieren Eisen, um es zu reinigen.", "Kupfer ist ein hervorragender Leiter.", "Halogene wie Chlor gewinnen gerne Elektronen.", "Aluminium benötigt enorme Energie zur Reduktion.", "Magnesium oxidiert und sendet weißes Licht aus.", "Schwefel bildet gelbe Kristalle.", "Gold ist ein Edelmetall, schwer zu oxidieren.", "Eine galvanische Zelle nutzt Oxidation zur Energieübertragung."],
    realWorld: ["Natrium reagiert heftig und verliert 1 Elektron.", "Pflanzen oxidieren Wasser und setzen Sauerstoff frei.", "Hämoglobin reduziert Eisen für den Sauerstofftransport.", "Kupfer wird für Stromkabel reduziert.", "Chlor gewinnt Elektronen, um Wasser zu reinigen.", "Aluminiumrecycling erfordert die Injektion von Elektronen.", "Magnesium oxidiert in Feuerwerkskörpern.", "Schwefel oxidiert in Vulkanen.", "Gold wird im Bergbau zur Auflösung oxidiert.", "Zink gibt Kupfer Energie. So funktionieren Batterien."],
    elements: ["Natrium", "Sauerstoff", "Eisen", "Kupfer", "Chlor", "Aluminium", "Magnesium", "Schwefel", "Gold", "Batterie"],
    questions: [
      { q: "Welches Ion bildet Natrium beim Oxidieren?", options: ["Kation (+1)", "Anion (-1)", "Neutral", "Isotop"], correct: 0, micro: "Durch den Verlust eines negativen Elektrons erhält Natrium eine positive Ladung (Kation)." },
      { q: "Was ist die Oxidationsstufe von reinem Sauerstoff (O2)?", options: ["0", "-2", "+1", "+2"], correct: 0, micro: "Elemente im reinen Zustand haben immer eine Oxidationsstufe von Null." },
      { q: "Wenn Eisen von +3 auf +2 geht, was passierte?", options: ["Reduktion", "Oxidation", "Fusion", "Fission"], correct: 0, micro: "Die Ladung wurde reduziert, d.h. es gewann ein negatives Elektron (Reduktion)." },
      { q: "Welche Teilchen reisen, um Kupfer zu reduzieren?", options: ["Elektronen", "Protonen", "Neutronen", "Quarks"], correct: 0, micro: "In Redoxreaktionen werden nur Elektronen übertragen." },
      { q: "Chlor gewinnt Elektronen leicht, weil es ein ... ist", options: ["Halogen", "Edelgas", "Metall", "Flüssigkeit"], correct: 0, micro: "Halogene benötigen nur ein Elektron, um ihr Oktett zu vervollständigen." },
      { q: "Die Reduzierung von Aluminium erfordert massiv...", options: ["Strom", "Wasser", "Druck", "Sauerstoff"], correct: 0, micro: "Es wird Elektrolyse verwendet, die massive Mengen an Strom erfordert." },
      { q: "Die schnelle Oxidation von Magnesium nennt man...", options: ["Verbrennung", "Verdampfung", "Sublimation", "Fusion"], correct: 0, micro: "Verbrennung ist eine schnelle Oxidation, die Licht und Wärme freisetzt." },
      { q: "Wenn Schwefel von -2 auf 0 geht, wie viele Elektronen verliert er?", options: ["2", "1", "4", "0"], correct: 0, micro: "Um von -2 auf 0 zu steigen, muss er 2 negative Ladungen loswerden." },
      { q: "Warum oxidiert Gold in der Natur kaum?", options: ["Edelmetall", "Gas", "Leichtgewicht", "Künstlich"], correct: 0, micro: "Edelmetalle haben eine sehr stabile Elektronenstruktur." },
      { q: "In einer galvanischen Zelle findet die Oxidation statt an der...", options: ["Anode", "Kathode", "Draht", "Salzbrücke"], correct: 0, micro: "Die Anode ist immer die Elektrode, an der die Oxidation stattfindet." }
    ]
  }
};
const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

/* ============================================================
   ⚙️ 3. CONFIGURACIÓN FÍSICA (10 NIVELES)
============================================================ */
const MISSIONS_CONFIG = [
  { id: 1, cores: [{ symbol: "Na", start: 0, target: 1, type: "oxidize", color: "#ffff00", geom: "sphere" }] },
  { id: 2, cores: [{ symbol: "O", start: -2, target: 0, type: "oxidize", color: "#ff00ff", geom: "octahedron" }] },
  { id: 3, cores: [{ symbol: "Fe", start: 3, target: 2, type: "reduce", color: "#ff4400", geom: "octahedron" }] },
  { id: 4, cores: [{ symbol: "Cu", start: 2, target: 0, type: "reduce", color: "#00f2ff", geom: "dodecahedron" }] },
  { id: 5, cores: [{ symbol: "Cl", start: 0, target: -1, type: "reduce", color: "#00ff88", geom: "icosahedron" }] },
  { id: 6, cores: [{ symbol: "Al", start: 3, target: 0, type: "reduce", color: "#aaaaaa", geom: "octahedron" }] },
  { id: 7, cores: [{ symbol: "Mg", start: 0, target: 2, type: "oxidize", color: "#ffffff", geom: "sphere" }] },
  { id: 8, cores: [{ symbol: "S", start: -2, target: 0, type: "oxidize", color: "#ffee00", geom: "icosahedron" }] },
  { id: 9, cores: [{ symbol: "Au", start: 0, target: 3, type: "oxidize", color: "#ffd700", geom: "dodecahedron" }] },
  { id: 10, isGalvanic: true, cores: [
      { symbol: "Zn", start: 0, target: 2, type: "oxidize", color: "#aaaaaa", geom: "sphere", pos: [-4, 0, 0] },
      { symbol: "Cu", start: 2, target: 0, type: "reduce", color: "#00f2ff", geom: "dodecahedron", pos: [4, 0, 0] }
  ]}
];

/* ============================================================
   ⚛️ 4. RENDERIZADOR 3D PROFUNDO (NUBES CUÁNTICAS Y ECUACIONES)
============================================================ */
const HolographicEquation = ({ core, isStable }) => {
  let eq = "";
  if (isStable) eq = "EQUILIBRIO ESTABLE";
  else if (core.type === 'reduce') eq = `${core.symbol}${core.start > 0 ? '+'+core.start : core.start} + ${Math.abs(core.start - core.target)}e⁻ ➔ ${core.symbol}${core.target > 0 ? '+'+core.target : core.target}`;
  else eq = `${core.symbol}${core.start > 0 ? '+'+core.start : core.start} ➔ ${core.symbol}${core.target > 0 ? '+'+core.target : core.target} + ${Math.abs(core.target - core.start)}e⁻`;

  return (
    <Text position={[0, 3.5, 0]} fontSize={0.6} color={isStable ? "#0f0" : "#00f2ff"} font="https://fonts.gstatic.com/s/orbitron/v25/yYK5cRXep8lBoySMYNenOweb.woff" outlineWidth={0.02} outlineColor="#000">
      {eq}
    </Text>
  );
};

const AtomicCore = React.memo(({ core, hitPulse }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  const isStable = core.currentCharge === core.target;
  const visualElectrons = Math.max(0, Math.abs(core.currentCharge));
  const initPos = useMemo(() => new THREE.Vector3(...(core.pos || [0,0,0])), [core.pos]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;
    groupRef.current.rotation.y += delta * (isStable ? 0.3 : 1.2);
    groupRef.current.rotation.x += delta * 0.4;
    groupRef.current.position.y = initPos.y + Math.sin(state.clock.elapsedTime * 2.5) * 0.15;

    if (hitPulse) {
      groupRef.current.scale.setScalar(1.2);
      meshRef.current.material.emissiveIntensity = 8;
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      meshRef.current.material.emissiveIntensity = isStable ? 1 : 3;
    }
  });

  const geometry = useMemo(() => {
    if (core.geom === "octahedron") return <octahedronGeometry args={[2.2, isStable ? 0 : 2]} />;
    if (core.geom === "icosahedron") return <icosahedronGeometry args={[2.2, isStable ? 0 : 2]} />;
    if (core.geom === "dodecahedron") return <dodecahedronGeometry args={[2.2, isStable ? 0 : 2]} />;
    return <sphereGeometry args={[2.2, 32, 32]} />;
  }, [core.geom, isStable]);

  return (
    <group ref={groupRef} position={initPos}>
      <Sparkles count={isStable ? 200 : 60} scale={6} size={4} speed={2} color={isStable ? "#00f2ff" : core.color} opacity={0.5} />
      
      <mesh ref={meshRef}>
        {geometry}
        <meshStandardMaterial color={isStable ? "#00ff88" : core.color} emissive={isStable ? "#00ff88" : core.color} wireframe={!isStable} roughness={0.1} metalness={0.9} />
      </mesh>
      
      <HolographicEquation core={core} isStable={isStable} />

      {[...Array(visualElectrons)].map((_, i) => {
        const angle = (i / (visualElectrons || 1)) * Math.PI * 2;
        return (
          <group key={i} rotation={[Math.PI / 4, angle, 0]}>
            <mesh position={[3.5, 0, 0]}><sphereGeometry args={[0.2, 16, 16]} /><meshBasicMaterial color="#ffea00" /></mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}><ringGeometry args={[3.5, 3.55, 64]} /><meshBasicMaterial color="rgba(255,255,255,0.1)" transparent side={THREE.DoubleSide} /></mesh>
          </group>
        )
      })}
    </group>
  );
});

/* ============================================================
   🎮 5. MÁQUINA DE ESTADOS PRINCIPAL
============================================================ */
export default function RedoxLab() {
  const isMobile = useMobile(); // 🔥 Inyección del Hook
  const { language } = useGameStore();
  
  const safeLang = I18N[language] ? language : 'es';
  const dict = I18N[safeLang];
  const langCode = LANG_MAP[safeLang];

  const [phase, setPhase] = useState("BOOT"); 
  const [missionIdx, setMissionIdx] = useState(0);
  const [cores, setCores] = useState([]);
  const [laserActive, setLaserActive] = useState(false);
  const [laserColor, setLaserColor] = useState('#fff');
  const [hitPulse, setHitPulse] = useState(false);
  const [mastery, setMastery] = useState(0);
  const [microClassActive, setMicroClassActive] = useState(false);

  const config = MISSIONS_CONFIG[missionIdx];
  const qData = dict.questions[missionIdx];

  const handleBack = () => {
    window.speechSynthesis?.cancel();
    window.location.href = '/'; 
  };

  const handleStartBoot = () => {
    sfx.init();
    sfx.success();
    loadMission(0);
  };

  const loadMission = (idx) => {
    const nextConfig = MISSIONS_CONFIG[idx];
    if (!nextConfig) { 
      setPhase("END"); 
      safeSpeak(dict.ui.winTitle, langCode);
      return; 
    }
    setMissionIdx(idx);
    setCores(nextConfig.cores.map(c => ({ ...c, currentCharge: c.start })));
    setPhase("THEORY");
    safeSpeak(dict.theory[idx], langCode);
  };

  const isStable = useMemo(() => cores.length > 0 && cores.every(c => c.currentCharge === c.target), [cores]);

  const handlePrediction = (action) => {
    if (config.isGalvanic) {
      if (action !== 'zn_cu') { sfx.error(); safeSpeak(dict.ai.galvanicError, langCode); return; }
    } else {
      if (action !== config.cores[0].type) { sfx.error(); safeSpeak(dict.ai.wrongMath, langCode); return; }
    }
    sfx.success(); safeSpeak(dict.ai.correct, langCode); setPhase("EXECUTION");
  };

  const handleFire = (tool) => {
    if (isStable || laserActive) return;

    if (!config.isGalvanic && tool !== cores[0].type) {
      sfx.error(); safeSpeak(dict.ai.wrongTool, langCode); return;
    }

    setLaserColor(config.isGalvanic ? "#ffea00" : (tool === 'reduce' ? "#00f2ff" : "#ff0055"));
    setLaserActive(true);
    tool === 'reduce' ? sfx.laser() : sfx.extract();

    setTimeout(() => {
      setLaserActive(false);
      setHitPulse(true);
      sfx.impact();
      setCores(prev => prev.map((c, i) => {
        if (config.isGalvanic) return i === 0 ? { ...c, currentCharge: c.currentCharge + 1 } : { ...c, currentCharge: c.currentCharge - 1 };
        return { ...c, currentCharge: c.currentCharge + (c.type === "reduce" ? -1 : 1) };
      }));
      setTimeout(() => setHitPulse(false), 200);
    }, 400); 
  };

  const handleAIQuestion = () => {
    setPhase("AI_QUESTION");
    setMicroClassActive(false);
    safeSpeak(dict.ai.aiIntro, langCode);
  };

  const handleAnswer = (idx) => {
    if (idx === qData.correct) {
      sfx.success();
      safeSpeak(dict.ui.aiCorrect, langCode);
      setMastery(m => m + 50);
      setTimeout(() => setPhase("EXECUTION"), 2000);
    } else {
      sfx.error();
      setMicroClassActive(true);
      safeSpeak(qData.micro, langCode);
    }
  };

  useEffect(() => {
    if (isStable && phase === "EXECUTION") {
      setPhase("SYNTHESIS");
      setMastery(m => m + (config.isGalvanic ? 500 : 150));
      setTimeout(() => sfx.success(), 400);
      safeSpeak(dict.ai.synth, langCode);
      setTimeout(() => safeSpeak(dict.realWorld[missionIdx], langCode), 3000);
    }
  }, [isStable, phase, config, dict, missionIdx, langCode]);

  const aberrationOffset = useMemo(() => new THREE.Vector2(hitPulse ? 0.02 : 0.002, hitPulse ? 0.02 : 0.002), [hitPulse]);

  // Pantalla de inicio
  if (phase === "BOOT") return (
    <div style={ui.centerScreen}>
      <h1 className="nano-title" style={ui.titleGlow}>{dict.ui.title}</h1>
      <button style={ui.btnHex('#00f2ff')} onClick={handleStartBoot}>{dict.ui.start}</button>
    </div>
  );

  // Pantalla de victoria
  if (phase === "END") return (
    <div style={ui.centerScreen}>
      <h1 className="nano-title" style={ui.titleComplete}>{dict.ui.winTitle}</h1>
      <p style={{color:'#fff', fontSize:'clamp(20px, 5vw, 30px)', fontFamily:'Orbitron', margin:'30px 0'}}>{dict.ui.exp}: {mastery}</p>
      <button style={ui.btnHex('#0f0')} onClick={handleBack}>{dict.ui.btnBack}</button>
    </div>
  );

  return (
    <div style={ui.container}>
      {/* HEADER DE NAVEGACIÓN Y AYUDA */}
      <div style={ui.topControls}>
        <button style={ui.backBtn} onClick={handleBack}>{dict.ui.btnBack}</button>
        {phase === "EXECUTION" && !isStable && (
          <button style={ui.aiBtn} onClick={handleAIQuestion}>{dict.ui.btnAI}</button>
        )}
      </div>

      {/* 🖥️ HUD CENTRALIZADO Y RESPONSIVO */}
      <div className="nano-hud" style={ui.hud}>
        <div className="nano-glass" style={ui.glassCard}>
          <h1 className="nano-glass-title" style={ui.title}>{dict.ui.title}</h1>
          <div style={ui.badge}>{dict.ui.level} {config.id} / 10 {config.isGalvanic && " (BOSS)"}</div>
          <div style={{color:'#ffea00', fontSize:'clamp(14px, 3vw, 18px)', marginTop:'10px', fontWeight:'bold'}}>{dict.ui.exp}: {mastery}</div>
          <div className="nano-stats" style={ui.statsContainer}>
            {cores.map((c, i) => (
              <div key={i} className="nano-stat-box" style={ui.statBox(c.color)}>
                <div style={{color:c.color, fontSize:'clamp(14px, 3vw, 18px)', fontWeight:'bold'}}>{config.isGalvanic ? c.symbol : dict.elements[missionIdx]}</div>
                <div style={{color:'#aaa', fontSize:'clamp(10px, 2vw, 12px)'}}>{dict.ui.target}: {c.target}</div>
                <div style={ui.statNumber(c.color)}>{c.currentCharge > 0 ? `+${c.currentCharge}` : c.currentCharge}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 📖 FASE 0: TEORÍA */}
      {phase === "THEORY" && (
        <div style={ui.overlay}>
          <div style={ui.dialogBox('#00f2ff')}>
            <h2 style={{color: '#00f2ff', letterSpacing:'3px', marginBottom:'20px', fontSize:'clamp(20px, 5vw, 35px)'}}>{dict.ui.theoryTitle}</h2>
            <p style={{color:'#fff', fontSize:'clamp(16px, 3.5vw, 22px)', lineHeight:'1.5', padding:'clamp(10px, 2vw, 20px)'}}>{dict.theory[missionIdx]}</p>
            <button style={ui.actionBtn('#00f2ff')} onClick={() => { setPhase("DIAGNOSIS"); safeSpeak(config.isGalvanic ? dict.ai.boss : dict.ai.start, langCode); }}>{dict.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {/* 🧠 FASE 1: DIAGNÓSTICO */}
      {phase === "DIAGNOSIS" && (
        <div style={ui.overlay}>
          <div style={ui.dialogBox(config.isGalvanic ? '#ff0055' : '#ffea00')}>
            <h2 style={{color: config.isGalvanic ? '#ff0055' : '#ffea00', letterSpacing:'3px', fontSize:'clamp(20px, 5vw, 35px)'}}>{dict.ui.diagTitle}</h2>
            {!config.isGalvanic ? (
              <>
                <p style={{color:'#fff', fontSize:'clamp(16px, 3.5vw, 22px)'}}>{dict.elements[missionIdx]} {dict.ui.diagQ1} <b style={{color:'#ffea00'}}>{cores[0]?.start}</b> {dict.ui.diagQ2} <b style={{color:'#0f0'}}>{cores[0]?.target}</b>.</p>
                <p style={{color:'#aaa', fontSize:'clamp(14px, 3vw, 18px)'}}>{dict.ui.diagQ3}</p>
                <div className="nano-btn-group" style={ui.btnGroup}>
                  <button style={ui.actionBtn('#00f2ff')} onClick={() => handlePrediction("reduce")}>{dict.ui.btnGain}</button>
                  <button style={ui.actionBtn('#ff0055')} onClick={() => handlePrediction("oxidize")}>{dict.ui.btnLose}</button>
                </div>
              </>
            ) : (
              <>
                <p style={{color:'#fff', fontSize:'clamp(16px, 3.5vw, 22px)'}}>{dict.ui.diagGalvanic}</p>
                <div className="nano-btn-group" style={ui.btnGroup}>
                  <button style={ui.actionBtn('#00ff88')} onClick={() => handlePrediction("zn_cu")}>{dict.ui.btnZnCu}</button>
                  <button style={ui.actionBtn('#ff0055')} onClick={() => handlePrediction("cu_zn")}>{dict.ui.btnCuZn}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🤖 NUEVO: FASE IA QUESTION */}
      {phase === "AI_QUESTION" && (
        <div style={ui.overlay}>
          <div style={ui.dialogBox('#ff00ff')}>
            <h2 style={{color:'#ff00ff', letterSpacing:'3px', fontSize:'clamp(20px, 5vw, 35px)'}}>{microClassActive ? dict.ui.microClassTitle : dict.ui.btnAI}</h2>
            {!microClassActive ? (
              <>
                <p style={{color:'#fff', fontSize:'clamp(16px, 3.5vw, 22px)'}}>{qData.q}</p>
                <div className="nano-grid" style={ui.grid}>
                  {qData.options.map((opt, i) => (
                    <button key={i} style={ui.actionBtn('#ff00ff')} onClick={() => handleAnswer(i)}>{opt}</button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p style={{color:'#ffea00', fontSize:'clamp(16px, 3.5vw, 20px)', lineHeight:'1.5'}}>{qData.micro}</p>
                <button style={ui.nextBtn} onClick={() => { setPhase("EXECUTION"); setMicroClassActive(false); }}>{dict.ui.btnContinue}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 🎯 FASE 2: EJECUCIÓN */}
      {phase === "EXECUTION" && !isStable && (
        <div style={ui.bottomCenter}>
          {!config.isGalvanic ? (
            <div className="nano-btn-group" style={ui.btnGroup}>
              <button style={ui.fireBtn('#00f2ff')} onClick={() => handleFire("reduce")} disabled={laserActive}>{dict.ui.btnInject}</button>
              <button style={ui.fireBtn('#ff0055')} onClick={() => handleFire("oxidize")} disabled={laserActive}>{dict.ui.btnExtract}</button>
            </div>
          ) : (
            <button style={ui.fireBtn('#ffea00')} onClick={() => handleFire("transfer")} disabled={laserActive}>{dict.ui.btnTransfer}</button>
          )}
        </div>
      )}

      {/* 🎓 FASE 3: SÍNTESIS */}
      {phase === "SYNTHESIS" && (
        <div style={ui.overlay}>
          <div style={ui.dialogBox('#0f0')}>
            <h2 style={{color:'#0f0', letterSpacing:'3px', fontSize:'clamp(20px, 5vw, 35px)'}}>{dict.ui.synthTitle}</h2>
            <p style={{fontSize:'clamp(16px, 3.5vw, 24px)', lineHeight:'1.5', color:'#fff'}}>{dict.realWorld[missionIdx]}</p>
            <button style={ui.nextBtn} onClick={() => loadMission(missionIdx + 1)}>{dict.ui.btnNext}</button>
          </div>
        </div>
      )}

      {/* 🌌 MOTOR 3D PROFUNDO (CÁMARA Y VECTORES DINÁMICOS) */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
        <Canvas camera={{position:[0,0, isMobile ? 22 : 15], fov:45}}>
          <color attach="background" args={['#000308']} />
          <Stars count={5000} factor={4} fade />
          <ambientLight intensity={0.8} />
          
          <Suspense fallback={null}>
            {cores.map((c, i) => {
              // Si es Batería (Jefe) y es Celular, apilamos los núcleos verticalmente
              let pos = c.pos || [0, 0, 0];
              if (config.isGalvanic && isMobile) {
                pos = i === 0 ? [0, 4, 0] : [0, -4, 0];
              }
              return <AtomicCore key={i} core={{...c, pos}} hitPulse={hitPulse}/>
            })}
            
            {/* Láser Vertical en Móvil, Horizontal en PC */}
            {laserActive && (
              <mesh rotation={[0, 0, (config.isGalvanic && isMobile) ? 0 : Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, (config.isGalvanic && isMobile) ? 8 : 20, 8]} />
                <meshBasicMaterial color={laserColor} transparent opacity={0.6} />
              </mesh>
            )}
            
            {/* Cable de Batería Vertical en Móvil, Horizontal en PC */}
            {config.isGalvanic && (
              <mesh rotation={[0, 0, isMobile ? 0 : Math.PI / 2]}>
                 <cylinderGeometry args={[0.08, 0.08, isMobile ? 8 : 9, 16]} />
                 <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
               </mesh>
            )}
          </Suspense>

          <EffectComposer>
            <Bloom luminanceThreshold={0.1} intensity={hitPulse || laserActive ? 6 : 2}/>
            <Scanline opacity={0.1}/>
            <ChromaticAberration offset={aberrationOffset}/>
            <Vignette eskil={false} offset={0.1} darkness={1.2}/>
          </EffectComposer>
        </Canvas>
      </div>
      
      {hitPulse && <div style={ui.flash} />}
    </div>
  );
}

// 🎨 ESTILOS UI (MOBILE-FIRST ABSOLUTO CON CLAMP Y FLEX)
const ui = {
  container: { position: 'absolute', inset: 0, overflow: 'hidden', background: '#000', fontFamily: 'Orbitron, sans-serif', width: '100vw', height: '100dvh' },
  
  // 🔥 FIX PARA PANTALLAS DE INICIO Y VICTORIA
  centerScreen: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', background: 'radial-gradient(circle at center, #001122 0%, #000 100%)', zIndex: 1000, position: 'relative', padding: '20px', boxSizing: 'border-box', textAlign: 'center' },
  
  titleComplete: { color: '#0f0', fontSize: 'clamp(30px, 6vw, 60px)', letterSpacing: 'clamp(2px, 1vw, 8px)', textShadow: '0 0 40px #0f0', margin: 0, textAlign: 'center' },
  
  // Header Adaptable
  topControls: { position: 'absolute', top: 'clamp(10px, 2vh, 30px)', left: '0', width: '100%', padding: '0 clamp(10px, 2vw, 30px)', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', zIndex: 500, pointerEvents: 'none', flexWrap: 'wrap', gap: '10px' },
  backBtn: { padding: 'clamp(10px, 1.5vw, 15px) clamp(15px, 3vw, 30px)', background: 'rgba(255,0,85,0.15)', border: 'clamp(1px, 0.5vw, 2px) solid #ff0055', color: '#ff0055', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 10px)', fontFamily: 'Orbitron', fontWeight: '900', backdropFilter: 'blur(10px)', letterSpacing: '1px', transition: '0.3s', pointerEvents: 'auto', fontSize: 'clamp(12px, 2.5vw, 16px)' },
  aiBtn: { padding: 'clamp(10px, 1.5vw, 15px) clamp(15px, 3vw, 30px)', background: 'rgba(255,0,255,0.15)', border: 'clamp(1px, 0.5vw, 2px) solid #ff00ff', color: '#ff00ff', cursor: 'pointer', borderRadius: 'clamp(8px, 1.5vw, 10px)', fontFamily: 'Orbitron', fontWeight: '900', backdropFilter: 'blur(10px)', letterSpacing: '1px', transition: '0.3s', pointerEvents: 'auto', fontSize: 'clamp(12px, 2.5vw, 16px)' },

  // HUD
  hud: { position: 'absolute', top: 'clamp(60px, 10vh, 90px)', left: '50%', transform: 'translateX(-50%)', zIndex: 100, width: '100%', padding: '0 clamp(15px, 3vw, 20px)', boxSizing: 'border-box', display: 'flex', justifyContent: 'center', pointerEvents: 'none' },
  glassCard: { background: 'rgba(0,10,25,0.85)', border: '2px solid #00f2ff', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '15px', backdropFilter: 'blur(15px)', boxShadow: '0 0 40px rgba(0,242,255,0.2)', width: '100%', maxWidth: '600px', textAlign: 'center' },
  title: { color: '#fff', margin: 0, fontSize: 'clamp(20px, 4vw, 28px)', letterSpacing: '3px' },
  badge: { display: 'inline-block', marginTop: '10px', padding: 'clamp(5px, 1vw, 8px) clamp(10px, 2vw, 20px)', background: '#ff0055', color: '#fff', fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 'bold', borderRadius: '5px' },
  statsContainer: { display: 'flex', gap: 'clamp(10px, 2vw, 15px)', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' },
  statBox: (c) => ({ flex: '1 1 min-content', minWidth: '120px', padding: '15px', background: 'rgba(0,0,0,0.6)', border: `2px solid ${c}`, borderRadius: '8px' }),
  statNumber: (c) => ({ fontSize: 'clamp(30px, 6vw, 55px)', fontWeight: '900', color: c, textShadow: `0 0 20px ${c}`, marginTop: '10px' }),

  // Modales
  overlay: { position: 'absolute', inset: 0, background: 'rgba(0,5,15,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', pointerEvents: 'auto', padding: '15px', boxSizing: 'border-box' },
  dialogBox: (c) => ({ border: `clamp(1px, 0.5vw, 3px) solid ${c}`, background: 'rgba(0,0,0,0.95)', padding: 'clamp(25px, 5vw, 60px)', borderRadius: '20px', textAlign: 'center', width: '100%', maxWidth: '700px', boxShadow: `0 0 100px ${c}66`, maxHeight: '85dvh', overflowY: 'auto' }),
  
  // Botones de Acción
  btnGroup: { display: 'flex', flexWrap: 'wrap', gap: 'clamp(15px, 3vw, 30px)', justifyContent: 'center', marginTop: 'clamp(20px, 4vw, 40px)', width: '100%' },
  actionBtn: (c) => ({ padding: 'clamp(15px, 3vw, 20px) clamp(20px, 4vw, 40px)', background: 'rgba(0,0,0,0.8)', border: `2px solid ${c}`, color: c, fontSize: 'clamp(14px, 3vw, 20px)', fontWeight: 'bold', fontFamily: 'Orbitron', cursor: 'pointer', transition: '0.2s', borderRadius: '8px', minHeight: '50px', flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
  nextBtn: { marginTop: 'clamp(20px, 4vw, 40px)', padding: 'clamp(15px, 3vw, 25px) clamp(40px, 8vw, 80px)', background: '#0f0', border: 'none', color: '#000', fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', fontFamily: 'Orbitron', cursor: 'pointer', borderRadius: '8px', boxShadow: '0 0 40px #0f0', minHeight: '50px' },
  
  bottomCenter: { position: 'absolute', bottom: 'clamp(20px, 5vh, 60px)', left: '50%', transform: 'translateX(-50%)', zIndex: 150, pointerEvents: 'auto', width: '100%', display: 'flex', justifyContent: 'center', padding: '0 clamp(15px, 3vw, 20px)', boxSizing: 'border-box' },
  fireBtn: (c) => ({ padding: 'clamp(15px, 3vw, 30px) clamp(30px, 6vw, 80px)', background: 'rgba(0,0,0,0.95)', border: `clamp(2px, 0.5vw, 4px) solid ${c}`, color: c, fontSize: 'clamp(16px, 4vw, 28px)', fontWeight: '900', fontFamily: 'Orbitron', cursor: 'pointer', borderRadius: '50px', boxShadow: `0 0 clamp(30px, 6vw, 60px) ${c}88`, letterSpacing: 'clamp(2px, 0.5vw, 4px)', whiteSpace: 'nowrap', minHeight: '60px', width: '100%', maxWidth: '350px' }),
  
  titleGlow: { color:'#00f2ff', fontSize:'clamp(40px, 8vw, 80px)', letterSpacing:'clamp(5px, 2vw, 15px)', textShadow:'0 0 60px rgba(0, 242, 255, 0.8)', margin:'0 0 30px 0', textAlign: 'center', fontWeight: '900' },
  glitchText: { color: '#00f2ff', fontSize: 'clamp(14px, 3vw, 24px)', letterSpacing: 'clamp(10px, 2vw, 25px)', marginBottom: '0px', fontWeight: 'bold', textAlign: 'center' },
  btnHex: (c) => ({ padding:'clamp(20px, 4vw, 30px) clamp(40px, 8vw, 80px)', background:`linear-gradient(45deg, rgba(0,0,0,0.9), ${c}33)`, border:`3px solid ${c}`, color:c, fontSize:'clamp(18px, 4vw, 26px)', fontWeight:'900', cursor:'pointer', borderRadius:'15px', fontFamily:'Orbitron', transition:'all 0.3s ease', boxShadow: `0 0 30px ${c}55`, letterSpacing: '4px', minHeight: '60px' }),
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'clamp(15px, 3vw, 35px)', marginTop:'clamp(30px, 6vw, 50px)', width: '100%' },
  flash: { position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.3)', pointerEvents: 'none', zIndex: 999 }
};

// Parches globales y Reglas Media Queries puras para móviles
if (typeof document !== 'undefined' && !document.getElementById("nano-styles-mobile")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "nano-styles-mobile";
  styleSheet.innerText = `
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); }
    ::-webkit-scrollbar-thumb { background: #00f2ff55; border-radius: 10px; }
    
    @media (max-width: 768px) {
      .nano-btn-group { flex-direction: column !important; }
      .nano-btn-group button { width: 100% !important; }
      .nano-stats { gap: 10px !important; }
      .nano-stat-box { min-width: 45% !important; flex: 1 1 45% !important; padding: 10px !important; }
      .nano-glass { padding: 20px 15px !important; }
      .nano-glass-title { font-size: 22px !important; }
      .nano-grid { grid-template-columns: 1fr !important; }
      .nano-title { font-size: 32px !important; padding: 0 10px; }
    }
  `;
  document.head.appendChild(styleSheet);
}