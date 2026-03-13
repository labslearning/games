import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Sparkles, Center, Grid, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Scanline, Glitch } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

/* ============================================================
  🔊 1. MOTOR DE AUDIO SCI-FI TIER-GOD (MÚLTIPLES CAPAS)
============================================================ */
class ThermoAudio {
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
 click() { this._play('sine', 800, 400, 0.1, 0.1); }
 success() { this._play('sine', 440, 880, 0.5, 0.2); setTimeout(()=>this._play('square', 880, 1760, 0.6, 0.15), 150); }
 error() { this._play('sawtooth', 150, 40, 0.6, 0.3); setTimeout(()=>this._play('square', 100, 30, 0.4, 0.2), 100); }
 valve() { this._play('noise', 1500, 200, 0.15, 0.05); }
 rumble(intensity) { this._play('sawtooth', 60, 40, 0.2, intensity * 0.5); } // Terremoto térmico
}
const sfx = new ThermoAudio();

const triggerVoice = (text, langCode) => {
 if (!('speechSynthesis' in window)) return;
 window.speechSynthesis.cancel();
 setTimeout(() => {
   if (window.location.pathname !== '/' && window.location.pathname !== '') {
       const u = new SpeechSynthesisUtterance(text);
       u.lang = langCode;
       u.rate = 1.05;
       u.pitch = 1.0;
       u.onend = () => { window.speechSynthesis.cancel(); };
       u.onerror = () => { window.speechSynthesis.cancel(); };
       window.speechSynthesis.speak(u);
   }
 }, 50);
};

/* ============================================================
  🌍 2. MATRIZ PEDAGÓGICA TOTAL (4 IDIOMAS - 10 NIVELES)
============================================================ */
const DICT = {
 es: {
   ui: {
     start: "INICIAR INSTRUCCIÓN TERMAL", title: "GAS THEORY: THE GOD TIER", exp: "NIVEL",
     theoryTitle: "TEORÍA FUNDAMENTAL", theoryBtn: "ANALIZAR ➔", diagTitle: "EVALUACIÓN COGNITIVA",
     btnCheck: "VERIFICAR LEY FÍSICA", synthTitle: "APLICACIÓN EN LA REALIDAD", btnNext: "SIGUIENTE LEY ➔", winTitle: "🏅 MAESTRÍA TERMODINÁMICA ALCANZADA", btnBack: "⬅ ABORTAR SIMULACIÓN",
     btnAI: "🤖 ASISTENCIA IA", microTitle: "MICRO-CLASE IA", btnContinue: "RECALIBRAR", targetReached: "¡CONDICIÓN ALCANZADA!", targetMsg: "META ACTIVA: Llevar"
   },
   ai: { intro: "Simulador físico en línea. Analizando teoría termodinámica.", wrongAns: "Disonancia cognitiva detectada. Análisis incorrecto.", correct: "Lógica cuántica estabilizada." },
   levels: [
     { id: "CINETICA", name: "Teoría Cinética", th: "La temperatura mide la energía cinética promedio. Si calientas un gas, sus partículas se agitan violentamente y chocan contra todo.", q: "Si la temperatura de un gas aumenta, ¿qué le pasa a la energía de las partículas?", o: ["Aumenta", "Disminuye", "Se detienen", "Se congelan"], a: 0, m: "El calor es movimiento puro. A mayor temperatura, mayor es la velocidad de los átomos.", rw: "Así funcionan los globos aerostáticos: los quemadores calientan el aire para que las partículas se agiten, se expandan y el globo flote sobre el aire frío.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatura" },
     { id: "BOYLE_1", name: "Ley de Boyle (T Constante)", th: "Robert Boyle descubrió que la Presión y el Volumen son INVERSAMENTE proporcionales. Si aprietas un gas reduciendo su espacio, su presión se dispara.", q: "¿Qué le pasa a la presión si reduces el volumen a la mitad?", o: ["Baja a la mitad", "Se duplica", "No cambia", "Se vuelve cero"], a: 1, m: "Es una relación matemáticamente inversa. Menos espacio significa que las partículas chocan el doble de veces contra las paredes del pistón.", rw: "Esto es exactamente lo que sientes en los oídos al bucear: la presión del agua comprime el volumen de aire dentro de tus tímpanos.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volumen" },
     { id: "CHARLES_1", name: "Ley de Charles (P Constante)", th: "Jacques Charles notó que el Volumen y la Temperatura son DIRECTAMENTE proporcionales. Si enfrías un gas, este se contrae sobre sí mismo.", q: "Si metes un globo inflado en el congelador, ¿qué sucederá?", o: ["Se expande", "Explota", "Se encoge", "Nada"], a: 2, m: "Al perder energía térmica, las moléculas se mueven con mucha lentitud y, por ende, ocupan menos espacio en el vacío.", rw: "Por esta ley fundamental, las llantas de los automóviles parecen desinfladas en las mañanas muy frías de invierno.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperatura" },
     { id: "GAY_LUSSAC_1", name: "Ley de Gay-Lussac (V Constante)", th: "A volumen fijo, la Presión es DIRECTAMENTE proporcional a la Temperatura. Calentar un recipiente de metal cerrado aumenta críticamente su presión interna.", q: "¿Por qué no debes tirar una lata de aerosol vacía al fuego?", o: ["Se derrite", "La presión la hace explotar", "Apaga el fuego", "Cambia de color"], a: 1, m: "El volumen de la lata de metal rígido es fijo. Al subir la temperatura, la presión aumenta exponencialmente hasta reventarla.", rw: "Esta es la física exacta y mortal detrás de las ollas de presión que usamos en la cocina para elevar el punto de ebullición del agua.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperatura" },
     { id: "BOYLE_2", name: "Boyle: Expansión Biológica", th: "Bajo la ley P1·V1 = P2·V2, al expandir artificialmente el volumen de los pulmones, la presión interna debe caer para que el aire exterior sea succionado.", q: "Tengo un gas a 2 atmósferas en 1 Litro. Si lo expando usando fuerza a 2 Litros, ¿cuál es la nueva presión?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Si el volumen se multiplica por dos, la presión debe dividirse por dos para mantener el equilibrio de la constante. El resultado es 1 atmósfera.", rw: "El diafragma baja, expande el volumen total del tórax, la presión interna cae por debajo de 1 atm y el aire entra solo por tu nariz.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volumen" },
     { id: "CHARLES_2", name: "Charles: Dilatación Mecánica", th: "Para calcular la ley de Charles con precisión, la temperatura DEBE estar siempre en escala absoluta (Kelvin). A más calor, más expansión agresiva.", q: "Si un gas está a 0 grados centígrados (273 Kelvin) y lo caliento a 273 grados (546 Kelvin), ¿su volumen...?", o: ["Sube poco", "Se duplica", "Se reduce", "Es cero"], a: 1, m: "La temperatura absoluta en escala Kelvin se duplicó de 273 a 546. En consecuencia, el volumen también debe duplicarse geométricamente.", rw: "El motor de combustión interna de los vehículos calienta gases súbitamente; su rápida y violenta expansión es lo que empuja el pistón.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperatura" },
     { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion Estructural", th: "Basado en P1/T1 = P2/T2. Si enfrías drásticamente un recipiente rígido sellado, la presión interior colapsará hacia el vacío.", q: "Un tanque sellado a 600 Kelvin y 4 atmósferas se enfría de golpe a 300 Kelvin. ¿Cuál es su presión final?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "La temperatura bajó exactamente a la mitad. Por lo tanto, la presión también debe bajar a la mitad, quedando en 2 atmósferas.", rw: "Si lavas un bidón de plástico con agua hirviendo y lo tapas rápidamente, al enfriarse, la presión caerá y la botella se aplastará sola.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperatura" },
     { id: "AVOGADRO", name: "Principio Cuántico de Avogadro", th: "Sorprendentemente, volúmenes iguales de gases distintos bajo las mismas condiciones exactas contienen exactamente el mismo número de moléculas.", q: "Compara 1 Litro de gas Oxígeno pesado versus 1 Litro de gas Hidrógeno súper ligero a la misma presión y temperatura. ¿Quién tiene más moléculas?", o: ["Oxígeno", "Hidrógeno", "Iguales", "Depende"], a: 2, m: "El tamaño individual o la masa del átomo no importa en absoluto. El volumen en el espacio depende de la presión y la temperatura, no de la identidad del elemento.", rw: "Esta genialidad permitió a los científicos del siglo XIX deducir las fórmulas moleculares correctas de nuestro universo, como H2O y CO2.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volumen" },
     { id: "GAS_IDEAL", name: "Ecuación de Estado (PV=nRT)", th: "P multiplicado por V es igual a nRT. Esta es la ecuación maestra. Unifica todas las leyes y demuestra que todo en termodinámica está conectado.", q: "Piensa como un ingeniero: Si la Temperatura y el Volumen de un sistema se duplican simultáneamente, ¿qué le pasa a la Presión?", o: ["Sube", "Baja", "Se queda igual", "Cero"], a: 2, m: "Si la temperatura sube, la presión quiere subir. Si el volumen sube, la presión quiere bajar. Al duplicarse ambos parámetros, el efecto se anula matemáticamente.", rw: "Esta es la ecuación exacta que rige el diseño de los delicados sistemas de soporte vital presurizados en la Estación Espacial Internacional.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatura" },
     { id: "ZERO", name: "El Abismo del Cero Absoluto", th: "El Cero Absoluto (0 Kelvin o -273.15 °C) es el límite inferior teórico del universo. Toda transferencia de calor y movimiento cinético se detiene.", q: "Según la física teórica clásica, ¿qué volumen tiene un gas ideal al llegar exactamente a 0 Kelvin?", o: ["Infinito", "Cero", "Negativo", "Invariable"], a: 1, m: "La gráfica lineal de Charles cruza el origen coordenado. A 0 Kelvin, el volumen matemático es cero. En el mundo real, la materia se licúa o solidifica antes.", rw: "Los misteriosos condensados de Bose-Einstein (materia con propiedades cuánticas a escala macroscópica) ocurren a millonésimas de grado de este límite mortal.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperatura" }
   ]
 },
 en: {
   ui: { start: "INITIALIZE THERMAL SIMULATOR", title: "GAS THEORY: THE GOD TIER", exp: "MODULE", theoryTitle: "PHYSICS BRIEFING", theoryBtn: "ANALYZE DATA ➔", diagTitle: "COGNITIVE EVALUATION", btnCheck: "VERIFY CONDITION", synthTitle: "REAL WORLD APPLICATION", btnNext: "NEXT LAW ➔", winTitle: "🏅 THERMODYNAMICS MASTERED", btnBack: "⬅ ABORT SIMULATION", btnAI: "🤖 AI ASSIST", microTitle: "AI MICRO-CLASS", btnContinue: "RECALIBRATE", targetReached: "TARGET REACHED!", targetMsg: "ACTIVE TARGET: Bring" },
   ai: { intro: "Thermodynamic system online. Processing theory.", wrongAns: "Cognitive dissonance detected. Incorrect analysis.", correct: "Quantum logic stabilized." },
   levels: [
     { id: "CINETICA", name: "Kinetic Theory", th: "Temperature measures average kinetic energy. If you heat a gas, its particles agitate violently and crash into everything.", q: "If gas temperature increases, what happens to particle energy?", o: ["Increases", "Decreases", "Stops", "Freezes"], a: 0, m: "Heat is pure movement. Higher temperature means higher molecular speed.", rw: "This is how hot air balloons work: burners heat the air so particles agitate, expand, and the balloon floats on cold air.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperature" },
     { id: "BOYLE_1", name: "Boyle's Law (Constant T)", th: "Robert Boyle discovered that Pressure and Volume are INVERSELY proportional. If you squeeze a gas reducing its space, pressure spikes.", q: "What happens to pressure if you halve the volume?", o: ["Halves", "Doubles", "No change", "Zero"], a: 1, m: "It's a mathematical inverse relation. Less space means particles hit the piston walls twice as often.", rw: "This is exactly what your ears feel when diving underwater: water pressure compresses the air volume inside your eardrums.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volume" },
     { id: "CHARLES_1", name: "Charles's Law (Constant P)", th: "Jacques Charles noted that Volume and Temperature are DIRECTLY proportional. If you cool a gas, it shrinks upon itself.", q: "If you put an inflated balloon in the freezer, what happens?", o: ["Expands", "Explodes", "Shrinks", "Nothing"], a: 2, m: "Losing thermal energy means molecules move very slowly, thus taking up less space in a vacuum.", rw: "Due to this fundamental law, car tires look deflated on very cold winter mornings.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperature" },
     { id: "GAY_LUSSAC_1", name: "Gay-Lussac's Law (Constant V)", th: "At a fixed volume, Pressure is DIRECTLY proportional to Temperature. Heating a closed metal container critically raises its internal pressure.", q: "Why shouldn't you throw an empty aerosol can into a fire?", o: ["Metal melts", "Pressure makes it explode", "Puts out fire", "Changes color"], a: 1, m: "The rigid metal can's volume is fixed. As temperature rises, pressure increases exponentially until it bursts.", rw: "This is the exact, deadly physics behind pressure cookers we use in the kitchen to raise water's boiling point.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperature" },
     { id: "BOYLE_2", name: "Boyle: Biological Expansion", th: "Under P1·V1 = P2·V2, by artificially expanding lung volume, internal pressure must drop for outside air to be sucked in.", q: "I have a gas at 2 atmospheres in 1 Liter. If I force it to expand to 2 Liters, what is the new pressure?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Pure math: If volume is multiplied by two, pressure must be divided by two to keep the constant. Result is 1 atm.", rw: "Your diaphragm lowers, expands total chest volume, internal pressure drops below 1 atm, and air flows naturally into your nose.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volume" },
     { id: "CHARLES_2", name: "Charles: Mechanical Dilation", th: "To calculate Charles's law accurately, temperature MUST always be in the absolute (Kelvin) scale. More heat, aggressive expansion.", q: "If a gas is at 0 degrees C (273K) and I heat it to 273 degrees C (546K), its volume...?", o: ["Rises slightly", "Doubles", "Reduces", "Is zero"], a: 1, m: "Absolute temperature doubled from 273 to 546. Consequently, volume must also double geometrically.", rw: "Internal combustion engines heat gases suddenly; their rapid, violent expansion is what pushes the piston.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperature" },
     { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Structural Implosion", th: "Based on P1/T1 = P2/T2. If you drastically cool a rigid sealed container, interior pressure collapses into a vacuum.", q: "A sealed tank at 600 Kelvin and 4 atmospheres is suddenly cooled to 300 Kelvin. Final pressure?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "Temperature dropped exactly by half. Therefore, pressure must also drop by half, leaving 2 atmospheres.", rw: "If you wash a plastic jug with boiling water and cap it quickly, as it cools, pressure drops and the bottle crushes itself.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperature" },
     { id: "AVOGADRO", name: "Avogadro's Quantum Principle", th: "Surprisingly, equal volumes of different gases under exact same conditions contain exactly the same number of molecules.", q: "Compare 1L of heavy Oxygen gas versus 1L of super light Hydrogen gas at same P and T. Who has more molecules?", o: ["Oxygen", "Hydrogen", "Equal", "Depends"], a: 2, m: "Individual size or mass of the atom matters absolutely zero. Space volume depends on pressure and temperature, not element identity.", rw: "This brilliance allowed 19th-century scientists to deduce correct molecular formulas of our universe, like H2O and CO2.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volume" },
     { id: "GAS_IDEAL", name: "Equation of State (PV=nRT)", th: "P times V equals nRT. This is the master equation. It unifies all laws and proves everything in thermodynamics is connected.", q: "Think like an engineer: If Temperature and Volume of a system double simultaneously, what happens to Pressure?", o: ["Rises", "Drops", "Stays the same", "Zero"], a: 2, m: "If temperature rises, pressure wants to rise. If volume rises, pressure wants to drop. Doubling both mathematically cancels the effect.", rw: "This is the exact equation governing the design of delicate pressurized life support systems on the International Space Station.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperature" },
     { id: "ZERO", name: "The Abyss of Absolute Zero", th: "Absolute Zero (0 Kelvin or -273.15 °C) is the theoretical lower limit of the universe. All heat transfer and kinetic movement stops.", q: "According to classical theoretical physics, what volume does an ideal gas have at exactly 0 Kelvin?", o: ["Infinite", "Zero", "Negative", "Unchanged"], a: 1, m: "Charles's linear graph crosses the coordinate origin. At 0 Kelvin, mathematical volume is zero. In reality, matter liquefies or solidifies first.", rw: "Mysterious Bose-Einstein condensates (matter with macroscopic quantum properties) occur at millionths of a degree from this deadly limit.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperature" }
   ]
 },
 fr: {
   ui: { start: "INITIALISER LE SIMULATEUR THERMIQUE", title: "GAS THEORY: THE GOD TIER", exp: "MODULE", theoryTitle: "BRIEFING DE PHYSIQUE", theoryBtn: "ANALYSER LES DONNÉES ➔", diagTitle: "ÉVALUATION COGNITIVE", btnCheck: "VÉRIFIER LA CONDITION", synthTitle: "APPLICATION RÉELLE", btnNext: "LOI SUIVANTE ➔", winTitle: "🏅 MAÎTRISE THERMODYNAMIQUE", btnBack: "⬅ ABANDONNER LA SIMULATION", btnAI: "🤖 ASSISTANCE IA", microTitle: "MICRO-CLASSE IA", btnContinue: "RECALIBRER", targetReached: "CIBLE ATTEINTE!", targetMsg: "CIBLE ACTIVE: Amener" },
   ai: { intro: "Système thermodynamique en ligne. Traitement de la théorie.", wrongAns: "Dissonance cognitive détectée. Analyse incorrecte.", correct: "Logique quantique stabilisée." },
   levels: [
     { id: "CINETICA", name: "Théorie Cinétique", th: "La température mesure l'énergie cinétique. Chauffer un gaz rend les collisions moléculaires violentes.", q: "Si la température augmente, qu'arrive-t-il à l'énergie des particules?", o: ["Augmente", "Diminue", "S'arrête", "Gèle"], a: 0, m: "La chaleur est le mouvement pur. Température élevée = grande vitesse.", rw: "C'est le fonctionnement des montgolfières : l'air chaud s'agite et se dilate, faisant flotter le ballon.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Température" },
     { id: "BOYLE_1", name: "Loi de Boyle", th: "Pression et Volume sont INVERSEMENT proportionnels. Réduire l'espace fait monter la pression.", q: "Que devient la pression si vous réduisez le volume de moitié?", o: ["Moitié", "Double", "Aucun", "Zéro"], a: 1, m: "Relation inverse. Moins d'espace signifie que les particules frappent deux fois plus souvent.", rw: "C'est ce que vos oreilles ressentent sous l'eau : la pression de l'eau comprime l'air dans les tympans.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volume" },
     { id: "CHARLES_1", name: "Loi de Charles", th: "Volume et Température sont DIRECTEMENT proportionnels. Refroidir un gaz le contracte.", q: "Mettez un ballon gonflé au congélateur, que se passe-t-il?", o: ["Se dilate", "Explose", "Se contracte", "Rien"], a: 2, m: "Perdre de l'énergie thermique ralentit les molécules, réduisant l'espace occupé.", rw: "C'est pourquoi les pneus de voiture semblent dégonflés par temps froid.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Température" },
     { id: "GAY_LUSSAC_1", name: "Loi de Gay-Lussac", th: "À volume fixe, la Pression est DIRECTEMENT proportionnelle à la Température.", q: "Pourquoi ne pas jeter un aérosol au feu?", o: ["Fond", "Explose sous pression", "Éteint le feu", "Couleur"], a: 1, m: "Le volume de la boîte est fixe. La chaleur augmente exponentiellement la pression jusqu'à rupture.", rw: "C'est la physique exacte et dangereuse des autocuiseurs.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Température" },
     { id: "BOYLE_2", name: "Boyle: Expansion", th: "Selon P1·V1 = P2·V2, étendre les poumons fait chuter la pression pour aspirer l'air.", q: "Gaz à 2 atm dans 1L. Étendu à 2L, quelle est la pression?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Mathématiques pures : si le volume double, la pression est divisée par deux (1 atm).", rw: "Le diaphragme s'abaisse, la pression chute en dessous de 1 atm et l'air entre.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volume" },
     { id: "CHARLES_2", name: "Charles: Dilatation", th: "La température DOIT être en Kelvin. Plus de chaleur, expansion agressive.", q: "Gaz à 0°C (273K) chauffé à 273°C (546K), son volume...?", o: ["Monte peu", "Double", "Réduit", "Zéro"], a: 1, m: "La température absolue ayant doublé, le volume doit doubler géométriquement.", rw: "L'expansion rapide des gaz chauffés pousse les pistons des moteurs.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Température" },
     { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion", th: "En refroidissant un récipient rigide, la pression intérieure s'effondre.", q: "Réservoir à 600K et 4 atm refroidi à 300K. Pression finale?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "La température baisse de moitié, donc la pression baisse de moitié (2 atm).", rw: "Laver une bouteille à l'eau bouillante et la boucher la fera s'écraser en refroidissant.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Température" },
     { id: "AVOGADRO", name: "Principe d'Avogadro", th: "Des volumes égaux de gaz différents dans les mêmes conditions ont le même nombre de molécules.", q: "1L d'Oxygène vs 1L d'Hydrogène (même P et T). Qui a le plus de molécules?", o: ["Oxygène", "Hydrogène", "Égaux", "Dépend"], a: 2, m: "La taille de l'atome n'importe pas. Le volume dépend de P et T, non du gaz.", rw: "Ceci a permis de déduire les formules moléculaires correctes (H2O, CO2).", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volume" },
     { id: "GAS_IDEAL", name: "Gaz Parfait (PV=nRT)", th: "PV = nRT. L'équation maîtresse qui relie toute la thermodynamique.", q: "Si Température et Volume doublent simultanément, qu'arrive-t-il à la Pression?", o: ["Monte", "Baisse", "Stable", "Zéro"], a: 2, m: "T fait monter P, V fait baisser P. Doubler les deux annule l'effet mathématiquement.", rw: "Ceci régit les systèmes de survie pressurisés de la Station Spatiale Internationale.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Température" },
     { id: "ZERO", name: "Zéro Absolu", th: "Le Zéro Absolu (0 Kelvin) est la limite où tout transfert de chaleur s'arrête.", q: "Quel volume théorique a un gaz idéal à 0 Kelvin?", o: ["Infini", "Zéro", "Négatif", "Stable"], a: 1, m: "Le graphique croise l'origine. À 0 Kelvin, le volume mathématique est zéro.", rw: "Les condensats de Bose-Einstein se forment à un millionième de degré de cette limite.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Température" }
   ]
 },
 de: {
   ui: { start: "THERMISCHEN SIMULATOR INITIALISIEREN", title: "GAS THEORY: THE GOD TIER", exp: "MODUL", theoryTitle: "PHYSIK BRIEFING", theoryBtn: "DATEN ANALYSIEREN ➔", diagTitle: "KOGNITIVE BEWERTUNG", btnCheck: "BEDINGUNG ÜBERPRÜFEN", synthTitle: "REALE ANWENDUNG", btnNext: "NÄCHSTES GESETZ ➔", winTitle: "🏅 THERMODYNAMIK GEMEISTERT", btnBack: "⬅ SIMULATION ABBRECHEN", btnAI: "🤖 KI-ASSISTENZ", microTitle: "KI MIKRO-KLASSE", btnContinue: "NEU KALIBRIEREN", targetReached: "ZIEL ERREICHT!", targetMsg: "AKTIVES ZIEL: Bringen" },
   ai: { intro: "Thermodynamisches System online. Verarbeite Theorie.", wrongAns: "Kognitive Dissonanz erkannt. Falsche Analyse.", correct: "Quantenlogik stabilisiert." },
   levels: [
     { id: "CINETICA", name: "Kinetische Theorie", th: "Temperatur misst kinetische Energie. Heißere Gase haben heftigere molekulare Kollisionen.", q: "Wenn die Gastemperatur steigt, was passiert mit der Teilchenenergie?", o: ["Steigt", "Sinkt", "Stoppt", "Gefriert"], a: 0, m: "Wärme ist Bewegung. Höhere Temperatur, höhere Geschwindigkeit.", rw: "Heißluftballons funktionieren so: Erhitzte Luft bewegt sich schneller, dehnt sich aus und schwebt.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatur" },
     { id: "BOYLE_1", name: "Gesetz von Boyle", th: "P und V sind UMGEKEHRT proportional. Verringert man den Raum, steigt der Druck.", q: "Was passiert mit dem Druck, wenn man das Volumen halbiert?", o: ["Halbiert", "Verdoppelt", "Gleich", "Null"], a: 1, m: "Es ist umgekehrt. Weniger Platz bedeutet, die Teilchen treffen doppelt so oft auf die Wände.", rw: "Das spüren deine Ohren beim Tauchen: Der Wasserdruck komprimiert das Luftvolumen im Trommelfell.", targetVar: "v", targetVal: 3, cond: "<=", ctrl: "v", targetText: "Volumen" },
     { id: "CHARLES_1", name: "Gesetz von Charles", th: "Volumen und Temperatur sind DIREKT proportional. Kaltes Gas zieht sich zusammen.", q: "Was passiert mit einem Ballon im Gefrierschrank?", o: ["Dehnt aus", "Explodiert", "Schrumpft", "Nichts"], a: 2, m: "Wärmeverlust bedeutet, dass sich die Moleküle extrem langsam bewegen und weniger Raum beanspruchen.", rw: "Aus diesem Grund sehen Autoreifen an sehr kalten Wintermorgen platt aus.", targetVar: "t", targetVal: 150, cond: "<=", ctrl: "t", targetText: "Temperatur" },
     { id: "GAY_LUSSAC_1", name: "Gesetz von Gay-Lussac", th: "Bei festem Volumen ist der Druck DIREKT proportional zur Temperatur.", q: "Warum keine leere Sprühdose ins Feuer werfen?", o: ["Schmilzt", "Druck sprengt sie", "Löscht", "Farbe"], a: 1, m: "Das Volumen ist fest. Hitze erhöht den Druck exponentiell, bis das Metall platzt.", rw: "Dies ist die genaue, gefährliche Physik hinter Schnellkochtöpfen.", targetVar: "t", targetVal: 800, cond: ">=", ctrl: "t", targetText: "Temperatur" },
     { id: "BOYLE_2", name: "Boyle: Expansion", th: "P1·V1 = P2·V2. Ein künstlich vergrößertes Lungenvolumen senkt den Druck, um Luft anzusaugen.", q: "Gas bei 2 atm in 1L. Auf 2L expandiert, was ist der neue Druck?", o: ["4 atm", "1 atm", "2 atm", "0.5 atm"], a: 1, m: "Reine Mathematik: Wenn sich das Volumen verdoppelt, muss sich der Druck halbieren (1 atm).", rw: "Das Zwerchfell senkt sich, der Druck sinkt unter 1 atm und die Luft strömt von selbst ein.", targetVar: "v", targetVal: 9, cond: ">=", ctrl: "v", targetText: "Volumen" },
     { id: "CHARLES_2", name: "Charles: Ausdehnung", th: "Temperatur MUSS in Kelvin sein. Mehr Hitze, aggressivere Expansion.", q: "Ein Gas bei 0°C (273K) wird auf 273°C (546K) erhitzt, sein Volumen...?", o: ["Steigt", "Verdoppelt", "Reduziert", "Null"], a: 1, m: "Die absolute Temperatur hat sich verdoppelt, also muss sich auch das Volumen geometrisch verdoppeln.", rw: "Die schnelle, gewaltsame Ausdehnung von plötzlich erhitzten Gasen treibt Motorkolben an.", targetVar: "t", targetVal: 900, cond: ">=", ctrl: "t", targetText: "Temperatur" },
     { id: "GAY_LUSSAC_2", name: "Gay-Lussac: Implosion", th: "Kühlt man einen starren Behälter drastisch ab, bricht der Innendruck ins Vakuum zusammen.", q: "Tank bei 600K und 4 atm wird auf 300K gekühlt. Enddruck?", o: ["8 atm", "4 atm", "2 atm", "1 atm"], a: 2, m: "Die Temperatur sank genau auf die Hälfte, also sinkt auch der Druck auf die Hälfte (2 atm).", rw: "Wenn man eine Flasche mit kochendem Wasser wäscht und schnell verschließt, zerdrückt sie sich beim Abkühlen.", targetVar: "t", targetVal: 100, cond: "<=", ctrl: "t", targetText: "Temperatur" },
     { id: "AVOGADRO", name: "Avogadro-Prinzip", th: "Gleiche Volumina verschiedener Gase enthalten unter gleichen Bedingungen die gleiche Anzahl an Molekülen.", q: "1L Sauerstoff vs 1L Wasserstoff (gleiche P, T). Wer hat mehr Moleküle?", o: ["Sauerstoff", "Wasserstoff", "Gleich", "Abhängig"], a: 2, m: "Größe oder Masse spielen keine Rolle. Das Volumen hängt von P und T ab.", rw: "Dies ermöglichte Wissenschaftlern, Molekülformeln wie H2O und CO2 abzuleiten.", targetVar: "v", targetVal: 8, cond: ">=", ctrl: "v", targetText: "Volumen" },
     { id: "GAS_IDEAL", name: "Zustandsgleichung (PV=nRT)", th: "PV = nRT. Die Hauptgleichung. Sie beweist, dass in der Thermodynamik alles zusammenhängt.", q: "Wenn Temperatur und Volumen sich gleichzeitig verdoppeln, was passiert mit dem Druck?", o: ["Steigt", "Sinkt", "Gleich", "Null"], a: 2, m: "T erhöht P, V senkt P. Die Verdoppelung von beidem hebt den Effekt mathematisch auf.", rw: "Diese exakte Gleichung bestimmt das Design von Lebenserhaltungssystemen in der Raumstation.", targetVar: "t", targetVal: 700, cond: ">=", ctrl: "t", targetText: "Temperatur" },
     { id: "ZERO", name: "Absoluter Nullpunkt", th: "Der Absolute Nullpunkt (0 Kelvin) ist die theoretische Untergrenze des Universums.", q: "Welches theoretische Volumen hat ein ideales Gas bei genau 0 Kelvin?", o: ["Unendlich", "Null", "Negativ", "Unverändert"], a: 1, m: "Bei 0 Kelvin ist das mathematische Volumen null. In der Realität verflüssigt sich Materie vorher.", rw: "Bose-Einstein-Kondensate treten bei Millionstel Grad von dieser tödlichen Grenze auf.", targetVar: "t", targetVal: 0, cond: "<=", ctrl: "t", targetText: "Temperatur" }
   ]
 }
};
const LANG_MAP = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE' };

/* ============================================================
  🎥 3. COMPONENTE DE CÁMARA (TERREMOTO TÉRMICO)
============================================================ */
const CameraController = ({ isCritical }) => {
 useFrame((state) => {
   if (isCritical) {
     state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(state.clock.elapsedTime * 60) * 0.1, 0.5);
     state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 2 + Math.cos(state.clock.elapsedTime * 50) * 0.1, 0.5);
   } else {
     // Ajuste responsivo de cámara para celulares (aleja la vista si es angosto)
     const isMob = window.innerWidth < 768;
     state.camera.position.lerp(new THREE.Vector3(0, 2, isMob ? 24 : 16), 0.1);
   }
 });
 return null;
};

/* ============================================================
  ⚛️ 4. SIMULADOR 3D FÍSICO: EL PISTÓN CUÁNTICO TIER-GOD
============================================================ */
const QuantumPiston = ({ temp, volume, pressure, isCritical }) => {
 const isHot = temp > 500;
 const isCold = temp < 200;
  // Físicas dinámicas calculadas en tiempo real
 const particleSpeed = Math.max(0.1, temp / 100);
 const particleColor = isCritical ? "#ff0000" : (isHot ? "#ff0055" : (isCold ? "#00f2ff" : "#00ff88"));
  // Núcleo de Fusión (Brilla rojo incandescente con calor)
 const coreEmissive = new THREE.Color(temp / 1000, 0, (1000 - temp) / 2000);
 const coreIntensity = temp / 100;

 // Animación suave mecánica del pistón con resistencia de lerp
 const pistonRef = useRef();
 useFrame((state) => {
   if (pistonRef.current) {
     let targetY = volume;
     // Añadir micro-vibración al pistón si la presión es extrema
     if (isCritical) targetY += Math.sin(state.clock.elapsedTime * 80) * 0.05;
     pistonRef.current.position.y = THREE.MathUtils.lerp(pistonRef.current.position.y, targetY, 0.1);
   }
 });

 const isMobile = window.innerWidth < 768;

 return (
   <group position={[0, -4, 0]}>
     {/* 🔹 Vaso de Cristal Refractivo (Physical Material Realista) */}
     <mesh position={[0, 5, 0]}>
       <cylinderGeometry args={[2.8, 2.8, 10, 64]} />
       <meshPhysicalMaterial
         transmission={0.95}
         opacity={1}
         transparent
         roughness={0.02}
         ior={1.52}
         thickness={1.5}
         clearcoat={1}
         color="#ddeeZm"
         side={THREE.DoubleSide}
       />
     </mesh>
    
     {/* 🔹 Núcleo de Fusión Termodinámica */}
     <mesh position={[0, 0.2, 0]}>
       <cylinderGeometry args={[2.5, 2.5, 0.2, 64]} />
       <meshStandardMaterial color={coreEmissive} emissive={coreEmissive} emissiveIntensity={coreIntensity} />
     </mesh>
    
     {/* 🔹 Base Sólida Industrial */}
     <mesh position={[0, -0.2, 0]}>
       <cylinderGeometry args={[3.2, 3.2, 0.6, 64]} />
       <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.3} />
     </mesh>
    
     {/* 🔹 Conjunto Dinámico del Pistón */}
     <group ref={pistonRef}>
       {/* Sello de Goma del Pistón */}
       <mesh position={[0, 0, 0]}>
         <cylinderGeometry args={[2.75, 2.75, 0.5, 64]} />
         <meshStandardMaterial color="#111" metalness={0.8} roughness={0.5} />
       </mesh>
       {/* Anillo de Presión O-Ring */}
       <mesh position={[0, 0.15, 0]}>
         <torusGeometry args={[2.75, 0.05, 16, 64]} />
         <meshStandardMaterial color="#000" roughness={0.9} />
       </mesh>
       {/* Barra Metálica de Transmisión */}
       <mesh position={[0, 5, 0]}>
         <cylinderGeometry args={[0.4, 0.4, 10, 32]} />
         <meshStandardMaterial color="#ccc" metalness={1} roughness={0.1} />
       </mesh>
     </group>
    
     {/* 🔹 Nube de Gas Cuántico (Múltiples capas para profundidad) */}
     <Sparkles count={isMobile ? 120 : 250} scale={[4.8, volume, 4.8]} position={[0, volume / 2, 0]} size={isMobile ? 15 : 10} speed={particleSpeed} color={particleColor} />
     <Sparkles count={isMobile ? 80 : 150} scale={[4.0, volume - 0.5, 4.0]} position={[0, volume / 2, 0]} size={isMobile ? 6 : 4} speed={particleSpeed * 1.5} color="#ffffff" opacity={0.5} />
    
     {/* 🔹 Telemetría Holográfica (HTML dentro del WebGL) */}
     {/* Posición ajustada para móviles: Arriba del cilindro si es angosto */}
     <Html position={[isMobile ? 0 : 3.8, isMobile ? 10.5 : 5, 0]} center zIndexRange={[100, 0]}>
       <div style={{
         background: isCritical ? 'rgba(255,0,0,0.2)' : 'rgba(0,10,25,0.85)',
         border: `1px solid ${isCritical ? '#ff0000' : '#00f2ff55'}`,
         borderLeft: `4px solid ${particleColor}`,
         padding: 'clamp(10px, 3vw, 20px)', borderRadius: '12px', color: '#fff', fontFamily: 'Orbitron',
         width: 'clamp(150px, 40vw, 260px)', backdropFilter: 'blur(15px)',
         boxShadow: `0 0 40px ${particleColor}44`,
         transition: 'all 0.1s ease',
         animation: isCritical ? 'glitch-anim 0.2s infinite' : 'none',
         textAlign: 'center'
       }}>
         <div style={{ fontSize: 'clamp(8px, 1.5vw, 10px)', color: '#aaa', letterSpacing: '2px', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '10px', fontWeight:'bold' }}>
           {isCritical ? '⚠️ RIESGO ESTRUCTURAL' : 'SISTEMA NOMINAL'}
         </div>
         <div style={{ fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: '900', color: isHot ? '#ff0055' : '#0f0', textShadow:'0 0 10px currentColor' }}>
           T: {temp.toFixed(0)}<span style={{fontSize:'clamp(10px, 2vw, 14px)', color:'#aaa'}}> K</span>
         </div>
         <div style={{ fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: '900', color: '#00f2ff', textShadow:'0 0 10px currentColor' }}>
           V: {volume.toFixed(1)}<span style={{fontSize:'clamp(10px, 2vw, 14px)', color:'#aaa'}}> L</span>
         </div>
         <div style={{ fontSize: 'clamp(18px, 4vw, 30px)', fontWeight: '900', color: isCritical ? '#ff0000' : '#ffea00', textShadow:'0 0 10px currentColor' }}>
           P: {pressure.toFixed(2)}<span style={{fontSize:'clamp(10px, 2vw, 14px)', color:'#aaa'}}> atm</span>
         </div>
         <div style={{ display: isMobile ? 'none' : 'block', marginTop: '15px', fontSize: '12px', color: isCritical ? '#ff0000' : '#00f2ff', textAlign: 'center', background: isCritical ? 'rgba(255,0,0,0.1)' : 'rgba(0,242,255,0.1)', padding: '8px', borderRadius: '6px', fontWeight:'bold', letterSpacing:'2px' }}>
           PV = nRT ENGINE
         </div>
       </div>
     </Html>
   </group>
 );
};

/* ============================================================
  🎮 5. MÁQUINA DE ESTADOS PRINCIPAL (EL CEREBRO FSM)
============================================================ */
export default function GasTheory() {
 const { language, resetProgress } = useGameStore();
  // Resolución Nativa de Idioma a Prueba de Fallos
 const safeLang = DICT[language] ? language : 'es';
 const d = DICT[safeLang];
 const lCode = LANG_MAP[safeLang] || 'es-ES';

 const [phase, setPhase] = useState("BOOT");
 const [levelIdx, setLevelIdx] = useState(0);
 const [microClassActive, setMicroClassActive] = useState(false);
  // Físicas (K de Gases Ideales ajustada a 10 para balance visual)
 const K = 10;
 const [temp, setTemp] = useState(300);
 const [vol, setVol] = useState(5);    
 const pressure = (K * temp) / (vol * 100);
 const isCritical = pressure > 18;

 const lvl = d.levels[levelIdx] || d.levels[0];

 // 🛑 PROTECCIÓN DE MEMORIA Y CORTADOR DE AUDIO DESTRUCTOR
 const isMounted = useRef(true);
 useEffect(() => {
   isMounted.current = true;
   return () => {
     isMounted.current = false;
     if ('speechSynthesis' in window) window.speechSynthesis.cancel();
   };
 }, []);

 // Control de Alarmas Críticas Continuas
 useEffect(() => {
   if (isCritical && phase === "EXECUTION") {
     const interval = setInterval(() => sfx.rumble(pressure / 20), 500);
     return () => clearInterval(interval);
   }
 }, [isCritical, pressure, phase]);

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

 // ==========================================
 // 🖥️ UI RENDERIZADO REACT
 // ==========================================
 if (phase === "BOOT") return (
   <div style={ui.overlayFull}>
     <div style={ui.glitchText}>PROTOCOLO NANO-CORE V16</div>
     <h1 style={ui.titleGlow}>{d.ui.title}</h1>
     <button style={ui.btnHex('#00f2ff')} onClick={() => { sfx.init(); loadLevel(0); }}>{d.ui.start}</button>
     <button style={ui.btnGhost} onClick={handleBack}>{d.ui.btnBack}</button>
   </div>
 );

 if (phase === "END") return (
   <div style={ui.overlayFull}>
     <h1 style={{color: '#0f0', fontSize: 'clamp(30px, 8vw, 70px)', textShadow: '0 0 50px #0f0', letterSpacing: 'clamp(2px, 1vw, 10px)', textAlign:'center', margin:'0 20px'}}>{d.ui.winTitle}</h1>
     <button style={{...ui.btnHex('#0f0'), marginTop: 'clamp(30px, 5vh, 50px)'}} onClick={handleBack}>{d.ui.btnBack}</button>
   </div>
 );

 return (
   <div style={ui.screen}>
     <button style={ui.backBtn} onClick={handleBack}>{d.ui.btnBack}</button>

     {/* TOP HUD CIBERNÉTICO */}
     <div style={ui.topHud}>
       <div style={ui.badge}>{d.ui.exp} {levelIdx + 1} / {d.levels.length}</div>
       <h2 style={{color:'#00f2ff', margin:'10px 0', fontSize:'clamp(18px, 5vw, 40px)', letterSpacing:'clamp(2px, 1vw, 6px)', textShadow:'0 0 20px rgba(0,242,255,0.8)'}}>{lvl.name}</h2>
       {phase === "EXECUTION" && (
         <div style={{background: 'rgba(255,234,0,0.15)', border: '2px solid #ffea00', padding: 'clamp(6px, 2vw, 12px) clamp(10px, 3vw, 30px)', borderRadius: '10px', color:'#ffea00', fontWeight: '900', display:'inline-block', fontSize:'clamp(10px, 2.5vw, 18px)', letterSpacing:'1px', boxShadow:'0 0 20px rgba(255,234,0,0.4)'}}>
           ⚡ {d.ui.targetMsg} {lvl.targetText} a {lvl.cond} {lvl.targetVal}
         </div>
       )}
     </div>

     {/* MODAL TEORÍA */}
     {phase === "THEORY" && (
       <div style={ui.modalBg}>
         <div style={ui.glassModal('#00f2ff')}>
           <h2 style={{color: '#00f2ff', letterSpacing:'clamp(2px, 1vw, 6px)', borderBottom: '2px solid #00f2ff55', paddingBottom: '15px', fontSize:'clamp(18px, 5vw, 35px)', margin: 0}}>{d.ui.theoryTitle}</h2>
           <p style={{fontSize:'clamp(14px, 4vw, 28px)', lineHeight:'1.5', margin:'clamp(20px, 5vh, 50px) 0', color: '#fff'}}>{lvl.th}</p>
           <button style={ui.btnSolid('#00f2ff')} onClick={() => { setPhase("AI"); triggerVoice(d.ai.intro, lCode); }}>{d.ui.theoryBtn}</button>
         </div>
       </div>
     )}

     {/* MODAL IA SOCRÁTICA */}
     {phase === "AI" && (
       <div style={ui.modalBg}>
         <div style={ui.glassModal('#ff00ff')}>
           <h2 style={{color:'#ff00ff', letterSpacing:'clamp(2px, 1vw, 6px)', borderBottom: '2px solid #ff00ff55', paddingBottom: '15px', fontSize:'clamp(18px, 5vw, 35px)', margin: 0}}>
             {microClassActive ? d.ui.microTitle : d.ui.diagTitle}
           </h2>
           {!microClassActive ? (
             <>
               <p style={{fontSize:'clamp(16px, 4.5vw, 32px)', margin:'clamp(20px, 5vh, 50px) 0', color: '#fff', fontWeight: '900', lineHeight: 1.3}}>{lvl.q}</p>
               <div style={ui.grid}>
                 {lvl.o.map((opt, i) => <button key={i} style={ui.btnOpt} onClick={() => handleAnswer(i)}>{opt}</button>)}
               </div>
             </>
           ) : (
             <>
               <p style={{color:'#ffea00', fontSize:'clamp(14px, 4vw, 30px)', lineHeight:'1.5', margin:'clamp(20px, 5vh, 50px) 0', fontWeight:'bold'}}>{lvl.m}</p>
               <button style={ui.btnSolid('#ff00ff')} onClick={() => { setPhase("AI"); setMicroClassActive(false); window.speechSynthesis.cancel(); }}>{d.ui.btnContinue}</button>
             </>
           )}
         </div>
       </div>
     )}

     {/* DOCK DE CONTROLES FÍSICOS (EXECUTION) */}
     {phase === "EXECUTION" && (
       <div style={ui.dockPanel}>
         {lvl.ctrl === 't' ? (
           <div style={ui.sliderContainer}>
             <div style={{color:'#ff0055', marginBottom:'15px', fontWeight:'900', letterSpacing:'1px', fontSize:'clamp(14px, 3.5vw, 22px)', textShadow:'0 0 10px #ff0055'}}>🔥 INYECCIÓN TÉRMICA (K)</div>
             <input type="range" min="0" max="1000" value={temp} onChange={(e) => {
               setTemp(Number(e.target.value));
               if(Number(e.target.value) > 800) sfx.valve();
             }} style={ui.cyberSlider('#ff0055')} />
           </div>
         ) : (
           <div style={ui.sliderContainer}>
             <div style={{color:'#00f2ff', marginBottom:'15px', fontWeight:'900', letterSpacing:'1px', fontSize:'clamp(14px, 3.5vw, 22px)', textShadow:'0 0 10px #00f2ff'}}>⚙️ PRENSA HIDRÁULICA (L)</div>
             <input type="range" min="1" max="10" step="0.1" value={vol} onChange={(e) => {
               setVol(Number(e.target.value));
               if(Number(e.target.value) < 2) sfx.valve();
             }} style={ui.cyberSlider('#00f2ff')} />
           </div>
         )}
         <button style={ui.checkBtn} onClick={verifyPhysicalState}>{d.ui.btnCheck}</button>
       </div>
     )}

     {/* MODAL DE SÍNTESIS DEL MUNDO REAL */}
     {phase === "SYNTHESIS" && (
       <div style={ui.modalBg}>
         <div style={ui.glassModal('#0f0')}>
           <h2 style={{color:'#0f0', letterSpacing:'clamp(2px, 1vw, 6px)', borderBottom: '2px solid #0f05', paddingBottom: '15px', fontSize:'clamp(18px, 5vw, 35px)', margin: 0}}>{d.ui.synthTitle}</h2>
           <p style={{fontSize:'clamp(14px, 4vw, 32px)', lineHeight:'1.5', margin:'clamp(20px, 5vh, 50px) 0', color: '#fff', fontWeight:'bold'}}>{lvl.rw}</p>
           <button style={ui.btnSolid('#0f0')} onClick={() => loadLevel(levelIdx + 1)}>{d.ui.btnNext}</button>
         </div>
       </div>
     )}

     {/* 🌌 MOTOR DE RENDERIZADO THREE.JS PROFESIONAL */}
     <div style={{position:'absolute', inset:0, zIndex:1, pointerEvents:'none'}}>
       <Canvas camera={{position:[0, 2, 16], fov:45}}>
         <color attach="background" args={['#000103']} />
         <ambientLight intensity={1.5} />
         <directionalLight position={[10, 10, 5]} intensity={2.5} color="#ffffff" />
         <directionalLight position={[-10, -10, -5]} intensity={1} color="#00f2ff" />
         <Stars count={8000} factor={6} fade speed={1.5} />
         <Grid infiniteGrid position={[0, -4.2, 0]} sectionColor="#00f2ff" cellColor="#001122" sectionSize={4} fadeDistance={40} />
        
         <Suspense fallback={null}>
           <CameraController isCritical={isCritical} />
           <QuantumPiston temp={temp} volume={vol} pressure={pressure} isCritical={isCritical} />
         </Suspense>
        
         <EffectComposer>
           <Bloom intensity={isCritical ? 5 : 2.5} luminanceThreshold={0.1} mipmapBlur />
           <ChromaticAberration offset={isCritical ? new THREE.Vector2(0.008, 0.008) : new THREE.Vector2(0.002, 0.002)} />
           <Scanline opacity={0.2} density={1.5} />
           <Vignette darkness={1.4} offset={0.1} />
         </EffectComposer>
         <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.7} minPolarAngle={Math.PI / 4} minDistance={10} maxDistance={25} />
       </Canvas>
     </div>
    
     {/* Alerta Visual Extrema Oculta (Flash Rojo en Crítico) */}
     {isCritical && phase === "EXECUTION" && <div style={{position:'absolute', inset:0, background:'rgba(255,0,0,0.15)', pointerEvents:'none', zIndex:99, mixBlendMode:'overlay'}} />}
   </div>
 );
}

// 🎨 ESTILOS "MOBILE FIRST GOD TIER" (Clamp + Flex Wrap)
const ui = {
 screen: { position:'absolute', inset:0, overflow:'hidden', background:'#000', fontFamily:'Orbitron, sans-serif', color:'#fff', WebkitTapHighlightColor: 'transparent', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' },
 overlayFull: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100dvh', background:'radial-gradient(circle at center, #001122 0%, #000 100%)', zIndex:1000, position:'relative', padding: 'clamp(20px, 5vw, 40px)', boxSizing: 'border-box' },
 glitchText: { color: '#00f2ff', fontSize: 'clamp(14px, 3vw, 24px)', letterSpacing: 'clamp(5px, 2vw, 25px)', marginBottom: '10px', fontWeight: 'bold', textAlign: 'center' },
 titleGlow: { color:'#00f2ff', fontSize:'clamp(32px, 8vw, 80px)', letterSpacing:'clamp(4px, 2vw, 15px)', textShadow:'0 0 40px rgba(0, 242, 255, 0.8)', margin:'0 0 30px 0', textAlign: 'center', fontWeight: '900', lineHeight: 1.1 },
 btnHex: (c) => ({ padding:'clamp(15px, 4vw, 30px) clamp(30px, 8vw, 80px)', background:`linear-gradient(45deg, rgba(0,0,0,0.9), ${c}33)`, border:`3px solid ${c}`, color:c, fontSize:'clamp(16px, 4vw, 26px)', fontWeight:'900', cursor:'pointer', borderRadius:'15px', fontFamily:'Orbitron', transition:'all 0.3s ease', boxShadow: `0 0 30px ${c}55`, letterSpacing: '2px', width: '100%', maxWidth: '400px' }),
 btnGhost: { marginTop:'clamp(20px, 4vw, 30px)', padding:'clamp(10px, 3vw, 15px) clamp(20px, 5vw, 50px)', background:'transparent', border:'2px solid #555', color:'#aaa', fontSize:'clamp(12px, 3vw, 18px)', cursor:'pointer', borderRadius:'10px', fontFamily:'Orbitron', transition:'0.3s', fontWeight: 'bold', letterSpacing: '2px' },
 
 backBtn: { position:'absolute', top:'max(15px, env(safe-area-inset-top))', left:'clamp(15px, 4vw, 40px)', zIndex:500, padding:'clamp(10px, 2.5vw, 15px) clamp(15px, 4vw, 35px)', background:'rgba(255,0,85,0.15)', border:'2px solid #ff0055', color:'#ff0055', cursor:'pointer', borderRadius:'10px', fontFamily:'Orbitron', fontWeight:'900', backdropFilter: 'blur(8px)', letterSpacing: '2px', boxShadow: '0 0 20px rgba(255,0,85,0.3)', fontSize: 'clamp(10px, 2.5vw, 16px)' },
 topHud: { position:'absolute', top:'calc(max(15px, env(safe-area-inset-top)) + 60px)', left:'50%', transform: 'translateX(-50%)', zIndex:100, textAlign: 'center', width: '95%', maxWidth: '800px', pointerEvents:'none' },
 badge: { background:'#00f2ff', color:'#000', padding:'clamp(6px, 2vw, 10px) clamp(15px, 4vw, 25px)', borderRadius:'8px', display:'inline-block', fontSize:'clamp(12px, 3vw, 18px)', fontWeight:'900', letterSpacing: '3px', boxShadow: '0 0 20px #00f2ff' },
 
 dockPanel: { position:'absolute', bottom:'max(20px, env(safe-area-inset-bottom))', left:'50%', transform:'translateX(-50%)', zIndex:150, background:'rgba(0,15,30,0.9)', padding:'clamp(20px, 5vw, 50px) clamp(20px, 5vw, 80px)', borderRadius:'30px', border:'2px solid #00f2ff', textAlign:'center', display:'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems:'center', gap:'clamp(20px, 4vh, 80px)', pointerEvents:'auto', backdropFilter: 'blur(25px)', boxShadow: '0 30px 60px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,242,255,0.1)', width: '95%', maxWidth: '900px', boxSizing: 'border-box' },
 sliderContainer: { display:'flex', flexDirection:'column', alignItems:'center', width:'100%', maxWidth: '500px' },
 cyberSlider: (c) => ({ width:'100%', cursor:'pointer', accentColor: c, height: 'clamp(12px, 3vw, 16px)', borderRadius: '8px', outline: 'none', background: 'rgba(255,255,255,0.15)', boxShadow: `0 0 15px ${c}66` }),
 checkBtn: { padding:'clamp(15px, 4vw, 30px) clamp(20px, 5vw, 60px)', background:'#00f2ff', border:'none', color:'#000', fontWeight:'900', fontSize:'clamp(16px, 4vw, 24px)', borderRadius:'15px', cursor:'pointer', fontFamily:'Orbitron', boxShadow:'0 0 40px rgba(0, 242, 255, 0.8)', letterSpacing: '1px', width: '100%', maxWidth: '300px' },
 
 modalBg: { position:'absolute', inset:0, zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,5,15,0.92)', backdropFilter:'blur(30px)', pointerEvents:'auto', padding: 'clamp(15px, 4vw, 30px)', boxSizing: 'border-box' },
 glassModal: (c) => ({ border:`3px solid ${c}`, background:'rgba(0, 15, 30, 0.85)', padding:'clamp(30px, 6vw, 80px) clamp(20px, 5vw, 80px)', borderRadius:'35px', textAlign:'center', maxWidth:'1200px', width:'100%', maxHeight: '90dvh', overflowY: 'auto', boxShadow:`0 0 100px ${c}55`, backdropFilter: 'blur(15px)', boxSizing: 'border-box' }),
 grid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(clamp(130px, 30vw, 200px), 1fr))', gap:'clamp(15px, 3vw, 35px)', marginTop:'clamp(25px, 5vh, 50px)', width: '100%' },
 btnOpt: { padding:'clamp(15px, 4vw, 30px)', background:'rgba(255,255,255,0.03)', border:'2px solid #555', color:'#fff', borderRadius:'15px', fontSize:'clamp(14px, 4vw, 24px)', cursor:'pointer', fontFamily:'Orbitron', transition:'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
 btnSolid: (c) => ({ marginTop:'clamp(30px, 6vh, 60px)', padding:'clamp(15px, 4vw, 30px) clamp(30px, 6vw, 90px)', background:c, color:'#000', fontWeight:'900', fontSize:'clamp(16px, 4vw, 26px)', borderRadius:'15px', border:'none', cursor:'pointer', fontFamily:'Orbitron', letterSpacing: '2px', boxShadow: `0 0 50px ${c}88`, width: '100%' })
};

// Necesario inyectar estilos globales sutiles para el input range y animaciones glitch
if (typeof document !== 'undefined' && !document.getElementById("gas-theory-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "gas-theory-styles";
  styleSheet.innerText = `
    * { -webkit-tap-highlight-color: transparent; }
    @keyframes glitch-anim {
      0% { transform: translate(0) }
      20% { transform: translate(-2px, 2px) }
      40% { transform: translate(-2px, -2px) }
      60% { transform: translate(2px, 2px) }
      80% { transform: translate(2px, -2px) }
      100% { transform: translate(0) }
    }
    input[type=range] {
      -webkit-appearance: none;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 25px;
      width: 25px;
      border-radius: 50%;
      background: currentColor;
      cursor: pointer;
      box-shadow: 0 0 10px currentColor;
    }
  `;
  document.head.appendChild(styleSheet);
}