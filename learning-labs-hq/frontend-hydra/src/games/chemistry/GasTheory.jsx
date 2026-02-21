import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sparkles, Html, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
   🔊 1. MOTOR DE AUDIO CUÁNTICO MULTICANAL
============================================================ */
class ThermoAudio {
  constructor() { this.ctx = null; }
  init() {
    if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  _play(type, fStart, fEnd, dur, vol, type2 = 'sine') {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain); osc2.connect(gain); gain.connect(this.ctx.destination);
      osc.type = type; osc2.type = type2;
      osc.frequency.setValueAtTime(fStart, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(fEnd, this.ctx.currentTime + dur);
      osc2.frequency.setValueAtTime(fStart * 1.5, this.ctx.currentTime);
      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + dur);
      osc.start(); osc2.start();
      osc.stop(this.ctx.currentTime + dur); osc2.stop(this.ctx.currentTime + dur);
    } catch(e) {}
  }
  click() { this._play('sine', 800, 300, 0.1, 0.1); }
  success() { this._play('sine', 440, 880, 0.4, 0.2); setTimeout(()=>this._play('square', 880, 1760, 0.6, 0.15), 150); }
  error() { this._play('sawtooth', 150, 40, 0.5, 0.3, 'square'); }
  valve() { this._play('noise', 1200, 100, 0.15, 0.05); } 
  critical() { this._play('sawtooth', 100, 50, 0.2, 0.2); }
}
const sfx = new ThermoAudio();

// Gestor de Voz Dinámico de Precisión
const triggerVoice = (text, langCode) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  setTimeout(() => {
    if (window.location.pathname !== '/' && window.location.pathname !== '') {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = langCode; 
        u.rate = 1.05; u.pitch = 1.0;
        u.onend = () => { window.speechSynthesis.cancel(); };
        u.onerror = () => { window.speechSynthesis.cancel(); };
        window.speechSynthesis.speak(u);
    }
  }, 50);
};

/* ============================================================
   🌍 2. BASE DE DATOS GLOBAL 100% TRADUCIDA (TIER GOD)
============================================================ */
const DICT = {
  es: {
    ui: { start: "INICIAR INSTRUCCIÓN TERMAL", title: "GAS THEORY: THE GOD TIER", exp: "NIVEL", theoryTitle: "BRIEFING FÍSICO", theoryBtn: "ANALIZAR ➔", diagTitle: "EVALUACIÓN COGNITIVA", btnCheck: "VERIFICAR LEY", synthTitle: "APLICACIÓN REAL", btnNext: "SIGUIENTE LEY ➔", winTitle: "🏅 MAESTRÍA TERMODINÁMICA", btnBack: "⬅ ABORTAR", btnAI: "🤖 ASISTENCIA IA", microTitle: "MICRO-CLASE IA", btnContinue: "RECALIBRAR", targetReached: "¡CONDICIÓN ALCANZADA!", targetMsg: "META ACTIVA: LLevar" },
    ai: { intro: "Sistema en línea. Procesando teoría.", wrongAns: "Disonancia detectada.", correct: "Lógica estabilizada." },
    levels: [
      { id: "CINETICA", name: "Teoría Cinética", th: "La temperatura mide la energía cinética promedio. Si calientas un gas, sus partículas se agitan violentamente.", q: "Si la temperatura de un gas aumenta, ¿qué le pasa a la energía de las partículas?", o: ["Aumenta", "Disminuye", "Se detienen", "Se congelan"], a: 0, m: "El calor es movimiento. A mayor temperatura, mayor velocidad molecular.", rw: "Así funcionan los globos aerostáticos: calientan el aire para que las partículas se expandan y el globo flote.", targetVar: "t", targetVal: 600, cond: ">=", ctrl: "t", targetText: "Temperatura" },
      { id: "BOYLE_1", name: "Ley de Boyle (T Constante)", th: "Robert Boyle descubrió que la Presión y el Volumen son INVERSAMENTE proporcionales. Si aprietas un gas, su presión sube.", q: "¿Qué le pasa a la presión si reduces el volumen a la mitad?", o: ["Baja a la mitad", "Se duplica", "No cambia", "Se vuelve cero"], a: 1, m: "Relación inversa. Menos espacio significa que las partículas chocan el doble de veces contra las paredes.", rw: "Esto es lo que sientes en los oídos al bucear: la presión del agua comprime el aire en tus tímpanos.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volumen" },
      { id: "CHARLES_1", name: "Ley de Charles (P Constante)", th: "Jacques Charles notó que el Volumen y la Temperatura son DIRECTAMENTE proporcionales. Si enfrías un gas, se contrae.", q: "Si metes un globo inflado en el congelador, ¿qué sucederá?", o: ["Se expande", "Explota", "Se encoge", "Nada"], a: 2, m: "Al perder energía térmica, las moléculas se mueven menos y ocupan menos espacio.", rw: "Por esta ley, las llantas de los autos parecen desinfladas en las mañanas frías de invierno.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperatura" },
      { id: "GAY_LUSSAC_1", name: "Ley de Gay-Lussac (V Constante)", th: "A volumen fijo, la Presión es DIRECTAMENTE proporcional a la Temperatura. Calentar un recipiente cerrado aumenta su presión interna.", q: "¿Por qué no debes tirar una lata de aerosol al fuego?", o: ["Se derrite", "La presión la hace explotar", "Apaga el fuego", "Cambia de color"], a: 1, m: "El volumen de la lata es fijo. Al subir la temperatura, la presión aumenta hasta reventarla.", rw: "Esta es la física exacta detrás de las ollas de presión que usamos en la cocina.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperatura" },
      { id: "BOYLE_2", name: "Boyle: Expansión", th: "Si P1·V1 = P2·V2, al expandir el volumen de los pulmones, la presión interna debe caer para que el aire entre.", q: "Tengo un gas a 2 atm en 1L. Si lo expando a 2L, ¿cuál es la nueva presión?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Si el volumen se duplica, la presión debe caer a la mitad, es decir a 1 atmósfera.", rw: "El diafragma baja, expande el volumen del tórax, la presión cae y el aire entra solo.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volumen" },
      { id: "CHARLES_2", name: "Charles: Dilatación", th: "Para usar Charles, la temperatura DEBE estar en Kelvin. A más calor, más expansión.", q: "Si un gas está a 0°C (273K) y lo caliento a 273°C (546K), ¿su volumen...?", o: ["Sube poco", "Se duplica", "Se reduce", "Es cero"], a: 1, m: "La temperatura absoluta se duplicó, así que el volumen también debe duplicarse.", rw: "El motor de combustión calienta gases súbitamente; su rápida expansión empuja el pistón.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperatura" },
      { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosión", th: "Si enfrías drásticamente un recipiente rígido, la presión colapsará.", q: "Un tanque a 600K y 4 atm se enfría a 300K. Presión final:", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "La temperatura bajó a la mitad, la presión también baja a la mitad, quedando en 2.", rw: "Si lavas una botella con agua muy caliente y la tapas rápido, al enfriarse, la botella se aplastará sola.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperatura" },
      { id: "AVOGADRO", name: "Principio de Avogadro", th: "Volúmenes iguales de gases distintos bajo las mismas condiciones contienen el mismo número de moléculas.", q: "1L de Oxígeno vs 1L de Hidrógeno a la misma P y T. ¿Quién tiene más moléculas?", o: ["Oxígeno", "Hidrógeno", "Iguales", "Depende"], a: 2, m: "El tamaño del átomo no importa. El volumen depende de la presión y la temperatura.", rw: "Esto permitió a los científicos deducir las fórmulas moleculares correctas como H2O y CO2.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volumen" },
      { id: "GAS_IDEAL", name: "Gas Ideal (PV=nRT)", th: "PV = nRT unifica todas las leyes y muestra cómo todas las variables están interconectadas.", q: "Si Temperatura y Volumen se duplican simultáneamente, ¿qué le pasa a la Presión?", o: ["Sube", "Baja", "Se queda igual", "Cero"], a: 2, m: "Si T sube, P quiere subir. Si V sube, P quiere bajar. Al duplicarse ambos, se anulan.", rw: "Esta ecuación rige el diseño de sistemas de soporte vital en la Estación Espacial Internacional.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatura" },
      { id: "ZERO", name: "El Cero Absoluto", th: "El Cero Absoluto (0 Kelvin) es el límite teórico donde todo movimiento cinético se detiene por completo.", q: "¿Qué volumen teórico tiene un gas ideal a 0 Kelvin?", o: ["Infinito", "Cero", "Negativo", "Invariable"], a: 1, m: "La gráfica de Charles cruza el origen. A 0 Kelvin, el volumen es cero.", rw: "Los condensados de Bose-Einstein ocurren a fracciones de grado de este límite.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperatura" }
    ]
  },
  en: {
    ui: { start: "START THERMAL SIMULATION", title: "GAS THEORY: THE GOD TIER", exp: "MODULE", theoryTitle: "PHYSICS BRIEFING", theoryBtn: "ANALYZE DATA ➔", diagTitle: "COGNITIVE EVALUATION", btnCheck: "VERIFY CONDITION", synthTitle: "REAL WORLD APPLICATION", btnNext: "NEXT LAW ➔", winTitle: "🏅 THERMODYNAMICS MASTERED", btnBack: "⬅ ABORT", btnAI: "🤖 AI ASSIST", microTitle: "AI MICRO-CLASS", btnContinue: "RECALIBRATE", targetReached: "TARGET REACHED!", targetMsg: "ACTIVE TARGET: Bring" },
    ai: { intro: "Thermodynamic system online.", wrongAns: "Cognitive dissonance detected.", correct: "Logic stabilized." },
    levels: [
      { id: "CINETICA", name: "Kinetic Theory", th: "Temperature measures kinetic energy. Higher heat means more violent molecular collisions.", q: "If gas temperature increases, what happens to particle energy?", o: ["Increases", "Decreases", "Stops", "Freezes"], a: 0, m: "Heat is movement. Higher temperature, higher molecular speed.", rw: "This is how hot air balloons work: heating air makes particles agitate, expand, and float.", targetVar: "t", targetVal: 600, cond: ">=", ctrl: "t", targetText: "Temperature" },
      { id: "BOYLE_1", name: "Boyle's Law", th: "P and V are INVERSELY proportional. Squeeze the volume, pressure spikes.", q: "What happens to pressure if you halve the volume?", o: ["Halves", "Doubles", "No change", "Zero"], a: 1, m: "Inverse relation. Less space means particles hit walls twice as often.", rw: "This is what your ears feel when diving underwater.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volume" },
      { id: "CHARLES_1", name: "Charles's Law", th: "Volume and Temperature are DIRECTLY proportional. Cool a gas, it shrinks.", q: "If you put an inflated balloon in the freezer, what happens?", o: ["Expands", "Explodes", "Shrinks", "Nothing"], a: 2, m: "Losing thermal energy means molecules move less and take up less space.", rw: "Car tires look deflated on cold winter mornings due to this.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperature" },
      { id: "GAY_LUSSAC_1", name: "Gay-Lussac's Law", th: "At a fixed volume, Pressure is DIRECTLY proportional to Temperature. Heating a closed container raises internal pressure.", q: "Why shouldn't you throw an aerosol can into a fire?", o: ["It melts", "Pressure makes it explode", "Puts out fire", "Changes color"], a: 1, m: "The metal can's volume is fixed. As temperature rises, pressure increases until it bursts.", rw: "This is the exact physics behind pressure cookers.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperature" },
      { id: "BOYLE_2", name: "Boyle: Expansion", th: "If P1·V1 = P2·V2, expanding lung volume must drop internal pressure for air to enter.", q: "I have gas at 2 atm in 1L. If expanded to 2L, what's the new pressure?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "If volume doubles, pressure must drop to half (1 atm).", rw: "The diaphragm lowers, expanding chest volume, pressure drops, and air flows in naturally.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volume" },
      { id: "CHARLES_2", name: "Charles: Dilation", th: "To use Charles's law, temperature MUST be in Kelvin. More heat, more expansion.", q: "If a gas is at 0°C (273K) and heated to 273°C (546K), its volume...?", o: ["Rises slightly", "Doubles", "Reduces", "Is zero"], a: 1, m: "Absolute temperature doubled, so volume must also double.", rw: "Combustion engines heat gases suddenly; their rapid expansion pushes the piston.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperature" },
      { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion", th: "If you drastically cool a rigid container, pressure will collapse.", q: "A tank at 600K and 4 atm is cooled to 300K. Final pressure?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "Temperature halved, so pressure also halves, dropping to 2.", rw: "If you wash a bottle with very hot water and cap it quickly, as it cools, the bottle crushes itself.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperature" },
      { id: "AVOGADRO", name: "Avogadro's Principle", th: "Equal volumes of different gases under the same conditions contain the same number of molecules.", q: "1L of Oxygen versus 1L of Hydrogen at equal P and T. Who has more molecules?", o: ["Oxygen", "Hydrogen", "Equal", "Depends"], a: 2, m: "Atom size doesn't matter. Volume depends on P and T, not gas identity.", rw: "This allowed scientists to deduce correct molecular formulas like H2O and CO2.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volume" },
      { id: "GAS_IDEAL", name: "Ideal Gas (PV=nRT)", th: "P times V equals nRT. This unifies all laws and shows how all variables connect.", q: "If Temperature and Volume double simultaneously, what happens to Pressure?", o: ["Rises", "Drops", "Stays the same", "Zero"], a: 2, m: "Doubling both cancels out the effect on Pressure.", rw: "This equation governs life support system designs on the International Space Station.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperature" },
      { id: "ZERO", name: "Absolute Zero", th: "Absolute Zero (0 Kelvin) is the theoretical limit where all kinetic movement completely stops.", q: "What theoretical volume does an ideal gas have at 0 Kelvin?", o: ["Infinite", "Zero", "Negative", "Unchanged"], a: 1, m: "At 0 Kelvin, the theoretical volume is zero. In reality, matter liquefies first.", rw: "Bose-Einstein condensates happen at fractions of a degree from this limit.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperature" }
    ]
  },
  fr: {
    ui: { start: "DÉMARRER LA SIMULATION THERMIQUE", title: "GAS THEORY: THE GOD TIER", exp: "MODULE", theoryTitle: "THÉORIE FONDAMENTALE", theoryBtn: "ANALYSER ➔", diagTitle: "ÉVALUATION COGNITIVE", btnCheck: "VÉRIFIER LA CONDITION", synthTitle: "APPLICATION RÉELLE", btnNext: "LOI SUIVANTE ➔", winTitle: "🏅 THERMODYNAMIQUE MAÎTRISÉE", btnBack: "⬅ ABANDONNER", btnAI: "🤖 ASSISTANCE IA", microTitle: "MICRO-CLASSE IA", btnContinue: "RECALIBRER", targetReached: "CIBLE ATTEINTE!", targetMsg: "CIBLE ACTIVE: Amener" },
    ai: { intro: "Système thermodynamique en ligne.", wrongAns: "Dissonance cognitive détectée.", correct: "Logique stabilisée." },
    levels: [
      { id: "CINETICA", name: "Théorie Cinétique", th: "La température mesure l'énergie cinétique. Plus de chaleur signifie des collisions moléculaires plus violentes.", q: "Si la température d'un gaz augmente, qu'arrive-t-il à l'énergie des particules?", o: ["Augmente", "Diminue", "S'arrête", "Gèle"], a: 0, m: "La chaleur est le mouvement. Température plus élevée, vitesse plus élevée.", rw: "C'est ainsi que fonctionnent les montgolfières.", targetVar: "t", targetVal: 600, cond: ">=", ctrl: "t", targetText: "Température" },
      { id: "BOYLE_1", name: "Loi de Boyle", th: "P et V sont INVERSEMENT proportionnels. Compressez le volume, la pression monte.", q: "Qu'arrive-t-il à la pression si vous réduisez le volume de moitié?", o: ["Diminue de moitié", "Double", "Aucun changement", "Zéro"], a: 1, m: "Relation inverse. Moins d'espace signifie que les particules frappent les murs deux fois plus souvent.", rw: "C'est ce que vos oreilles ressentent en plongeant.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volume" },
      { id: "CHARLES_1", name: "Loi de Charles", th: "Le Volume et la Température sont DIRECTEMENT proportionnels. Refroidissez un gaz, il se contracte.", q: "Si vous mettez un ballon gonflé dans le congélateur, que se passe-t-il?", o: ["Se dilate", "Explose", "Se contracte", "Rien"], a: 2, m: "Perdre de l'énergie thermique signifie que les molécules prennent moins de place.", rw: "Les pneus de voiture semblent dégonflés les matins froids d'hiver.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Température" },
      { id: "GAY_LUSSAC_1", name: "Loi de Gay-Lussac", th: "À volume fixe, la Pression est proportionnelle à la Température.", q: "Pourquoi ne faut-il pas jeter une bombe aérosol au feu?", o: ["Elle fond", "La pression la fait exploser", "Éteint le feu", "Rien"], a: 1, m: "Le volume est fixe. La chaleur augmente la pression jusqu'à ce qu'elle éclate.", rw: "C'est la physique exacte derrière les autocuiseurs.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Température" },
      { id: "BOYLE_2", name: "Boyle: Expansion", th: "Si P1·V1 = P2·V2, étendre le volume des poumons doit faire chuter la pression interne.", q: "J'ai un gaz à 2 atm dans 1L. Si je l'étends à 2L, quelle est la nouvelle pression?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Si le volume double, la pression doit baisser de moitié.", rw: "Le diaphragme s'abaisse, augmentant le volume, la pression baisse et l'air entre.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volume" },
      { id: "CHARLES_2", name: "Charles: Dilatation", th: "La température DOIT être en Kelvin. Plus de chaleur, plus d'expansion.", q: "Un gaz est à 0°C (273K) et chauffé à 273°C (546K), son volume...?", o: ["Monte un peu", "Double", "Réduit", "Est zéro"], a: 1, m: "La température absolue a doublé, donc le volume doit aussi doubler.", rw: "Les moteurs à combustion chauffent les gaz soudainement ; leur expansion pousse le piston.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Température" },
      { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion", th: "Si vous refroidissez un récipient rigide, la pression s'effondrera.", q: "Un réservoir à 600K et 4 atm est refroidi à 300K. Pression finale?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "La température a diminué de moitié, donc la pression diminue aussi de moitié.", rw: "Si vous lavez une bouteille avec de l'eau très chaude et la bouchez, elle s'écrase.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Température" },
      { id: "AVOGADRO", name: "Principe d'Avogadro", th: "Des volumes égaux de gaz dans les mêmes conditions contiennent le même nombre de molécules.", q: "1L d'Oxygène contre 1L d'Hydrogène. Qui a le plus de molécules?", o: ["Oxygène", "Hydrogène", "Égal", "Dépend"], a: 2, m: "La taille de l'atome n'a pas d'importance. Le volume dépend de P et T.", rw: "Cela a permis aux scientifiques de déduire des formules moléculaires comme H2O.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volume" },
      { id: "GAS_IDEAL", name: "Gaz Parfait (PV=nRT)", th: "P fois V égale nRT. Cela unifie toutes les lois.", q: "Si Température et Volume doublent, qu'arrive-t-il à la Pression?", o: ["Monte", "Baisse", "Reste la même", "Zéro"], a: 2, m: "Doubler les deux s'annule mathématiquement.", rw: "Cette équation régit les systèmes de survie dans la Station spatiale internationale.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Température" },
      { id: "ZERO", name: "Zéro Absolu", th: "Le Zéro Absolu (0 K) est la limite où tout mouvement s'arrête.", q: "Quel volume théorique a un gaz parfait à 0 Kelvin?", o: ["Infini", "Zéro", "Négatif", "Inchangé"], a: 1, m: "À 0 Kelvin, le volume théorique est nul.", rw: "Les condensats de Bose-Einstein se produisent près de cette limite.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Température" }
    ]
  },
  de: {
    ui: { start: "THERMISCHE SIMULATION STARTEN", title: "GAS THEORY: THE GOD TIER", exp: "MODUL", theoryTitle: "PHYSIK BRIEFING", theoryBtn: "DATEN ANALYSIEREN ➔", diagTitle: "KOGNITIVE BEWERTUNG", btnCheck: "BEDINGUNG ÜBERPRÜFEN", synthTitle: "REALE ANWENDUNG", btnNext: "NÄCHSTES GESETZ ➔", winTitle: "🏅 THERMODYNAMIK GEMEISTERT", btnBack: "⬅ ABBRECHEN", btnAI: "🤖 KI-ASSISTENZ", microTitle: "KI MIKRO-KLASSE", btnContinue: "NEU KALIBRIEREN", targetReached: "ZIEL ERREICHT!", targetMsg: "AKTIVES ZIEL: Bringen" },
    ai: { intro: "Thermodynamisches System online.", wrongAns: "Kognitive Dissonanz erkannt.", correct: "Logik stabilisiert." },
    levels: [
      { id: "CINETICA", name: "Kinetische Theorie", th: "Die Temperatur misst die kinetische Energie. Mehr Wärme bedeutet heftigere Kollisionen.", q: "Wenn die Gastemperatur steigt, was passiert mit der Teilchenenergie?", o: ["Steigt", "Sinkt", "Stoppt", "Gefriert"], a: 0, m: "Wärme ist Bewegung. Höhere Temperatur, höhere Geschwindigkeit.", rw: "So funktionieren Heißluftballons.", targetVar: "t", targetVal: 600, cond: ">=", ctrl: "t", targetText: "Temperatur" },
      { id: "BOYLE_1", name: "Gesetz von Boyle", th: "P und V sind UMGEKEHRT proportional. Drückt man das Volumen, steigt der Druck.", q: "Was passiert mit dem Druck, wenn man das Volumen halbiert?", o: ["Halbiert sich", "Verdoppelt sich", "Keine Änderung", "Null"], a: 1, m: "Umgekehrtes Verhältnis. Weniger Raum bedeutet doppelt so viele Kollisionen.", rw: "Das spürt man beim Tauchen in den Ohren.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volumen" },
      { id: "CHARLES_1", name: "Gesetz von Charles", th: "Volumen und Temperatur sind DIREKT proportional. Kühlt man ein Gas, schrumpft es.", q: "Wenn man einen Ballon in den Gefrierschrank legt, was passiert?", o: ["Dehnt sich aus", "Explodiert", "Schrumpft", "Nichts"], a: 2, m: "Weniger thermische Energie bedeutet, dass Moleküle weniger Platz beanspruchen.", rw: "Daher sehen Autoreifen an kalten Morgen platt aus.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperatur" },
      { id: "GAY_LUSSAC_1", name: "Gesetz von Gay-Lussac", th: "Bei festem Volumen ist der Druck DIREKT proportional zur Temperatur.", q: "Warum sollte man eine Aerosoldose nicht ins Feuer werfen?", o: ["Schmilzt", "Druck lässt sie explodieren", "Feuer geht aus", "Nichts"], a: 1, m: "Das Volumen ist fest. Hitze erhöht den Druck, bis sie platzt.", rw: "Dies ist die Physik hinter Schnellkochtöpfen.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperatur" },
      { id: "BOYLE_2", name: "Boyle: Expansion", th: "Wenn P1·V1 = P2·V2, muss das Erweitern des Lungenvolumens den Innendruck senken.", q: "Ich habe Gas bei 2 atm in 1L. Wenn auf 2L expandiert, was ist der neue Druck?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Wenn sich das Volumen verdoppelt, muss der Druck auf die Hälfte sinken.", rw: "Das Zwerchfell senkt sich, der Brustkorb dehnt sich aus, Luft strömt ein.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volumen" },
      { id: "CHARLES_2", name: "Charles: Ausdehnung", th: "Die Temperatur MUSS in Kelvin sein. Mehr Wärme, mehr Expansion.", q: "Ein Gas bei 0°C (273K) wird auf 273°C (546K) erhitzt, sein Volumen...?", o: ["Steigt leicht", "Verdoppelt sich", "Reduziert sich", "Ist null"], a: 1, m: "Die absolute Temperatur hat sich verdoppelt, also auch das Volumen.", rw: "Verbrennungsmotoren erhitzen Gase plötzlich; die Ausdehnung drückt den Kolben.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperatur" },
      { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion", th: "Wenn man einen starren Behälter abkühlt, bricht der Druck zusammen.", q: "Ein Tank bei 600K und 4 atm wird auf 300K abgekühlt. Enddruck?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "Die Temperatur hat sich halbiert, also halbiert sich auch der Druck.", rw: "Wenn man eine Flasche mit heißem Wasser wäscht und verschließt, zerdrückt sie sich.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperatur" },
      { id: "AVOGADRO", name: "Avogadro-Prinzip", th: "Gleiche Volumina verschiedener Gase enthalten die gleiche Anzahl an Molekülen.", q: "1L Sauerstoff gegen 1L Wasserstoff. Wer hat mehr Moleküle?", o: ["Sauerstoff", "Wasserstoff", "Gleich", "Abhängig"], a: 2, m: "Die Größe des Atoms spielt keine Rolle. Das Volumen hängt von P und T ab.", rw: "Dies ermöglichte Wissenschaftlern, korrekte molekulare Formeln abzuleiten.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volumen" },
      { id: "GAS_IDEAL", name: "Ideales Gas (PV=nRT)", th: "P mal V ist gleich nRT. Dies vereint alle Gesetze.", q: "Wenn Temperatur und Volumen sich verdoppeln, was passiert mit dem Druck?", o: ["Steigt", "Sinkt", "Bleibt gleich", "Null"], a: 2, m: "Die Verdoppelung beider hebt die Wirkung auf den Druck auf.", rw: "Diese Gleichung bestimmt das Design von Lebenserhaltungssystemen in der ISS.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatur" },
      { id: "ZERO", name: "Absoluter Nullpunkt", th: "Der absolute Nullpunkt (0 K) ist die theoretische Grenze, an der alle Bewegung aufhört.", q: "Welches Volumen hat ein ideales Gas bei 0 Kelvin?", o: ["Unendlich", "Null", "Negativ", "Unverändert"], a: 1, m: "Bei 0 Kelvin ist das theoretische Volumen null.", rw: "Bose-Einstein-Kondensate treten bei Bruchteilen eines Grades von dieser Grenze auf.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperatur" }
    ]
  }
};

const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

/* ============================================================
   ⚛️ 3. RENDERIZADOR 3D FÍSICO Y HOLOGRÁFICO (GOD TIER)
============================================================ */
const QuantumPiston = ({ temp, volume, pressure }) => {
  const isCritical = pressure > 15;
  const isHot = temp > 500;
  const isCold = temp < 150;
  
  // Físicas Matemáticas Dinámicas
  const particleSpeed = Math.max(0.1, temp / 100);
  const particleColor = isCritical ? "#ff0000" : (isHot ? "#ff0055" : (isCold ? "#00f2ff" : "#00ff88"));
  
  // Core de Fusión (Brilla con la temperatura)
  const coreEmissive = new THREE.Color(temp / 1000, 0, (1000 - temp) / 1000);
  const coreIntensity = temp / 150;

  const pistonRef = useRef();
  useFrame((state) => {
    if (pistonRef.current) {
      // Lerp físico realista con vibración crítica
      let targetY = volume;
      if (isCritical) targetY += Math.sin(state.clock.elapsedTime * 50) * 0.05;
      pistonRef.current.position.y = THREE.MathUtils.lerp(pistonRef.current.position.y, targetY, 0.15);
    }
  });

  return (
    <group position={[0, -4, 0]}>
      {/* 🔹 Vaso de Cristal Refractivo (High-End Material) */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[2.8, 2.8, 10, 64]} />
        <meshPhysicalMaterial 
          transmission={0.95} 
          opacity={1} 
          transparent 
          roughness={0.05} 
          ior={1.52} 
          thickness={0.5} 
          color="#aaddff" 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* 🔹 Núcleo de Fusión Termodinámica */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[2.5, 2.5, 0.2, 64]} />
        <meshStandardMaterial color={coreEmissive} emissive={coreEmissive} emissiveIntensity={coreIntensity} />
      </mesh>
      
      {/* 🔹 Base Sólida Cyberpunk */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[3.2, 3.2, 0.6, 64]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* 🔹 Pistón Dinámico y Sellado */}
      <group ref={pistonRef}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[2.75, 2.75, 0.5, 64]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 10, 32]} />
          <meshStandardMaterial color="#ccc" metalness={1} roughness={0.1} />
        </mesh>
      </group>
      
      {/* 🔹 Gas Cuántico */}
      <Sparkles count={400} scale={[4.8, volume, 4.8]} position={[0, volume / 2, 0]} size={8} speed={particleSpeed} color={particleColor} />
      
      {/* 🔹 Telemetría Holográfica (R3F HTML) */}
      <Html position={[3.8, 5, 0]} center>
        <div style={{
          background: isCritical ? 'rgba(255,0,0,0.2)' : 'rgba(0,10,20,0.85)', 
          borderLeft: `4px solid ${particleColor}`, 
          padding: '20px', borderRadius: '12px', color: '#fff', fontFamily: 'Orbitron',
          width: '240px', backdropFilter: 'blur(12px)', 
          boxShadow: `0 0 40px ${particleColor}44`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{ fontSize: '10px', color: '#aaa', letterSpacing: '2px', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px' }}>
            {isCritical ? '⚠️ CRITICAL ALERT' : 'LIVE TELEMETRY'}
          </div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: temp > 500 ? '#ff0055' : '#0f0' }}>T: {temp.toFixed(0)}<span style={{fontSize:'14px'}}>K</span></div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00f2ff' }}>V: {volume.toFixed(1)}<span style={{fontSize:'14px'}}>L</span></div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: isCritical ? '#ff0000' : '#ffea00' }}>P: {pressure.toFixed(2)}<span style={{fontSize:'14px'}}>atm</span></div>
        </div>
      </Html>
    </group>
  );
};

/* ============================================================
   🎮 4. MÁQUINA DE ESTADOS PRINCIPAL (EL CEREBRO)
============================================================ */
export default function GasTheory() {
  const { language, resetProgress } = useGameStore(); 
  
  // Resolución de Idioma
  const safeLang = DICT[language] ? language : 'es';
  const d = DICT[safeLang];
  const lCode = LANG_MAP[safeLang] || 'es-ES';

  const [phase, setPhase] = useState("BOOT");
  const [levelIdx, setLevelIdx] = useState(0);
  const [microClassActive, setMicroClassActive] = useState(false);
  
  // Físicas
  const K = 10;
  const [temp, setTemp] = useState(300); 
  const [vol, setVol] = useState(5);     
  const pressure = (K * temp) / (vol * 100); 

  const lvl = d.levels[levelIdx] || d.levels[0];

  // 🛑 PROTECCIÓN DE MEMORIA Y AUDIO (MEMORY LEAK FIX)
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel(); 
    };
  }, []);

  const handleBack = () => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    resetProgress();
  };

  const loadLevel = (idx) => {
    if (!isMounted.current) return;
    if (idx >= d.levels.length) { 
      setPhase("END"); 
      triggerVoice(d.ui.winTitle, lCode);
      return; 
    }
    setLevelIdx(idx);
    setTemp(300); setVol(5); 
    setPhase("THEORY");
    triggerVoice(d.levels[idx].th, lCode);
  };

  const handleAnswer = (idx) => {
    if (idx === lvl.a) {
      sfx.success(); 
      triggerVoice(d.ui.aiCorrect, lCode);
      setTimeout(() => setPhase("EXECUTION"), 1500);
    } else {
      sfx.error(); 
      setMicroClassActive(true); 
      triggerVoice(lvl.m, lCode);
    }
  };

  const verifyPhysicalState = () => {
    let currentVal = lvl.targetVar === 't' ? temp : vol;
    let isDone = false;

    if (lvl.cond === '>=') isDone = currentVal >= lvl.targetVal;
    if (lvl.cond === '<=') isDone = currentVal <= lvl.targetVal;

    if (isDone) {
      sfx.success();
      setPhase("SYNTHESIS");
      triggerVoice(lvl.rw, lCode);
    } else {
      sfx.error();
    }
  };

  // Vistas Renderizadas
  if (phase === "BOOT") return (
    <div style={ui.overlayFull}>
      <div style={ui.glitchText}>NANO-CORE V16</div>
      <h1 style={ui.titleGlow}>{d.ui.title}</h1>
      <button style={ui.btnHex('#00f2ff')} onClick={() => { sfx.init(); loadLevel(0); }}>{d.ui.start}</button>
      <button style={ui.btnGhost} onClick={handleBack}>{d.ui.btnBack}</button>
    </div>
  );

  if (phase === "END") return (
    <div style={ui.overlayFull}>
      <h1 style={{color: '#0f0', fontSize: '70px', textShadow: '0 0 50px #0f0', letterSpacing: '10px'}}>{d.ui.winTitle}</h1>
      <button style={ui.btnHex('#0f0')} onClick={handleBack}>{d.ui.btnBack}</button>
    </div>
  );

  return (
    <div style={ui.screen}>
      <button style={ui.backBtn} onClick={handleBack}>{d.ui.btnBack}</button>

      {/* TOP HUD */}
      <div style={ui.topHud}>
        <div style={ui.badge}>{d.ui.exp} {levelIdx + 1} / {d.levels.length}</div>
        <h2 style={{color:'#00f2ff', margin:'10px 0', fontSize:'35px', letterSpacing:'4px', textShadow:'0 0 20px #00f2ff'}}>{lvl.name}</h2>
        {phase === "EXECUTION" && (
          <div style={{background: 'rgba(255,234,0,0.1)', border: '1px solid #ffea00', padding: '10px 20px', borderRadius: '8px', color:'#ffea00', fontWeight: 'bold', display:'inline-block'}}>
            ⚡ {d.ui.targetMsg} {lvl.targetText} a {lvl.cond} {lvl.targetVal}
          </div>
        )}
      </div>

      {/* FSM: THEORIA */}
      {phase === "THEORY" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#00f2ff')}>
            <h2 style={{color: '#00f2ff', letterSpacing:'4px', borderBottom: '1px solid #00f2ff55', paddingBottom: '10px'}}>{d.ui.theoryTitle}</h2>
            <p style={{fontSize:'26px', lineHeight:'1.6', margin:'40px 0', color: '#fff'}}>{lvl.th}</p>
            <button style={ui.btnSolid('#00f2ff')} onClick={() => { setPhase("AI"); triggerVoice(d.ai.intro, lCode); }}>{d.ui.theoryBtn}</button>
          </div>
        </div>
      )}

      {/* FSM: AI QUESTION */}
      {phase === "AI" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#ff00ff')}>
            <h2 style={{color:'#ff00ff', letterSpacing:'4px', borderBottom: '1px solid #ff00ff55', paddingBottom: '10px'}}>
              {microClassActive ? d.ui.microTitle : d.ui.diagTitle}
            </h2>
            {!microClassActive ? (
              <>
                <p style={{fontSize:'28px', margin:'40px 0', color: '#fff', fontWeight: 'bold'}}>{lvl.q}</p>
                <div style={ui.grid}>
                  {lvl.o.map((opt, i) => <button key={i} style={ui.btnOpt} onClick={() => handleAnswer(i)}>{opt}</button>)}
                </div>
              </>
            ) : (
              <>
                <p style={{color:'#ffea00', fontSize:'26px', lineHeight:'1.6', margin:'40px 0'}}>{lvl.m}</p>
                <button style={ui.btnSolid('#ff00ff')} onClick={() => { setPhase("AI"); setMicroClassActive(false); window.speechSynthesis.cancel(); }}>{d.ui.btnContinue}</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FSM: EJECUCIÓN FÍSICA */}
      {phase === "EXECUTION" && (
        <div style={ui.dockPanel}>
          {lvl.ctrl === 't' ? (
            <div style={ui.sliderContainer}>
              <div style={{color:'#ff0055', marginBottom:'15px', fontWeight:'bold', letterSpacing:'2px', fontSize:'18px'}}>🔥 TERMO-INYECCIÓN (K)</div>
              <input type="range" min="0" max="1000" value={temp} onChange={(e) => { 
                setTemp(Number(e.target.value)); 
                if(Number(e.target.value) > 800) sfx.critical(); else sfx.valve(); 
              }} style={ui.cyberSlider('#ff0055')} />
            </div>
          ) : (
            <div style={ui.sliderContainer}>
              <div style={{color:'#00f2ff', marginBottom:'15px', fontWeight:'bold', letterSpacing:'2px', fontSize:'18px'}}>⚙️ COMPRESIÓN HIDRÁULICA (L)</div>
              <input type="range" min="1" max="10" step="0.1" value={vol} onChange={(e) => { 
                setVol(Number(e.target.value)); 
                if(Number(e.target.value) < 2) sfx.critical(); else sfx.valve(); 
              }} style={ui.cyberSlider('#00f2ff')} />
            </div>
          )}
          <button style={ui.checkBtn} onClick={verifyPhysicalState}>{d.ui.btnCheck}</button>
        </div>
      )}

      {/* FSM: SÍNTESIS */}
      {phase === "SYNTHESIS" && (
        <div style={ui.modalBg}>
          <div style={ui.glassModal('#0f0')}>
            <h2 style={{color:'#0f0', letterSpacing:'4px', borderBottom: '1px solid #0f05', paddingBottom: '10px'}}>{d.ui.synthTitle}</h2>
            <p style={{fontSize:'28px', lineHeight:'1.6', margin:'40px 0', color: '#fff'}}>{lvl.rw}</p>
            <button style={ui.btnSolid('#0f0')} onClick={() => loadLevel(levelIdx + 1)}>{d.ui.btnNext}</button>
          </div>
        </div>
      )}

      {/* 🌌 MOTOR DE RENDERIZADO THREE.JS PROFESIONAL */}
      <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
        <Canvas camera={{position:[0, 2, 16], fov:45}}>
          <color attach="background" args={['#000205']} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2.5} color="#ffffff" />
          <directionalLight position={[-5, -10, -5]} intensity={1} color="#00f2ff" />
          <Stars count={8000} factor={5} fade speed={1.5} />
          <Grid infiniteGrid position={[0, -4, 0]} sectionColor="#00f2ff" cellColor="#001122" sectionSize={4} fadeDistance={40} />
          
          <Suspense fallback={null}>
            <QuantumPiston temp={temp} volume={vol} pressure={pressure} />
          </Suspense>
          
          <EffectComposer>
            <Bloom intensity={pressure > 15 ? 4 : 2.5} luminanceThreshold={0.15} mipmapBlur />
            <ChromaticAberration offset={pressure > 15 ? new THREE.Vector2(0.005, 0.005) : new THREE.Vector2(0.002, 0.002)} />
            <Scanline opacity={0.15} density={1.5} />
            <Vignette darkness={1.3} offset={0.1} />
          </EffectComposer>
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.8} minPolarAngle={Math.PI / 3} />
        </Canvas>
      </div>
    </div>
  );
}

// 🎨 ESTILOS "GOD TIER GLASSMORPHISM"
const ui = {
  screen: { position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', color:'#fff' },
  overlayFull: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', background:'radial-gradient(circle at center, #001122 0%, #000 100%)', zIndex:1000, position:'relative' },
  glitchText: { color: '#444', fontSize: '20px', letterSpacing: '20px', marginBottom: '-10px' },
  titleGlow: { color:'#00f2ff', fontSize:'70px', letterSpacing:'12px', textShadow:'0 0 50px rgba(0, 242, 255, 0.6)', margin:'0 0 20px 0', textAlign: 'center', fontWeight: '900' },
  
  btnHex: (c) => ({ padding:'25px 60px', background:`linear-gradient(45deg, rgba(0,0,0,0.8), ${c}22)`, border:`2px solid ${c}`, color:c, fontSize:'22px', fontWeight:'bold', cursor:'pointer', borderRadius:'12px', fontFamily:'Orbitron', transition:'all 0.3s ease', boxShadow: `0 0 20px ${c}44`, letterSpacing: '2px' }),
  btnGhost: { marginTop:'25px', padding:'15px 40px', background:'transparent', border:'1px solid #555', color:'#aaa', fontSize:'16px', cursor:'pointer', borderRadius:'8px', fontFamily:'Orbitron', transition:'0.3s', ":hover": { borderColor: '#ff0055', color: '#ff0055' } },
  
  backBtn: { position:'absolute', top:'40px', left:'40px', zIndex:500, padding:'15px 30px', background:'rgba(255,0,85,0.1)', border:'1px solid #ff0055', color:'#ff0055', cursor:'pointer', borderRadius:'8px', fontFamily:'Orbitron', fontWeight:'bold', backdropFilter: 'blur(5px)', transition: '0.3s' },
  
  topHud: { position:'absolute', top:'40px', left:'50%', transform: 'translateX(-50%)', zIndex:100, textAlign: 'center', width: '100%', pointerEvents:'none' },
  badge: { background:'#00f2ff', color:'#000', padding:'8px 20px', borderRadius:'6px', display:'inline-block', fontSize:'16px', fontWeight:'bold', letterSpacing: '2px' },
  
  dockPanel: { position:'absolute', bottom:'50px', left:'50%', transform:'translateX(-50%)', zIndex:150, background:'rgba(0,15,30,0.85)', padding:'40px 60px', borderRadius:'25px', border:'1px solid #00f2ff', textAlign:'center', display:'flex', alignItems:'center', gap:'60px', pointerEvents:'auto', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' },
  sliderContainer: { display:'flex', flexDirection:'column', alignItems:'center', width:'400px' },
  cyberSlider: (c) => ({ width:'100%', cursor:'pointer', accentColor: c, height: '12px', borderRadius: '6px', outline: 'none', background: 'rgba(255,255,255,0.1)' }),
  checkBtn: { padding:'25px 50px', background:'#00f2ff', border:'none', color:'#000', fontWeight:'900', fontSize:'20px', borderRadius:'12px', cursor:'pointer', fontFamily:'Orbitron', boxShadow:'0 0 30px rgba(0, 242, 255, 0.6)', letterSpacing: '2px', transition: '0.2s' },
  
  modalBg: { position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,5,15,0.9)', backdropFilter:'blur(25px)', pointerEvents:'auto' },
  glassModal: (c) => ({ border:`2px solid ${c}`, background:'rgba(0, 10, 20, 0.8)', padding:'80px', borderRadius:'30px', textAlign:'center', maxWidth:'1100px', width:'90%', boxShadow:`0 0 80px ${c}33`, backdropFilter: 'blur(10px)' }),
  
  grid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px', marginTop:'40px' },
  btnOpt: { padding:'25px', background:'rgba(255,255,255,0.03)', border:'1px solid #555', color:'#fff', borderRadius:'12px', fontSize:'22px', cursor:'pointer', fontFamily:'Orbitron', transition:'0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', ":hover":{borderColor:'#00f2ff', background:'rgba(0,242,255,0.1)'} },
  btnSolid: (c) => ({ marginTop:'50px', padding:'25px 70px', background:c, color:'#000', fontWeight:'900', fontSize:'24px', borderRadius:'12px', border:'none', cursor:'pointer', fontFamily:'Orbitron', letterSpacing: '3px', boxShadow: `0 0 40px ${c}66` })
};