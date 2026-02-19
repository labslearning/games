import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MATERIALS } from '../data/materials';

export const audioSys = {
  playUI: () => { try { const a = new Audio('data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTEAAAAA'); a.volume=0.2; a.play(); } catch(e){} },
  playCrash: (i) => { try { const a = document.getElementById('snd-crash'); if(a){ a.volume = Math.min(i, 1.0); a.currentTime = 0; a.play().catch(()=>{}); } } catch(e){} },
  playError: () => { try { const a = document.getElementById('snd-error'); if(a){ a.currentTime = 0; a.play().catch(()=>{}); } } catch(e){} },
  playSuccess: () => { try { const a = document.getElementById('snd-success'); if(a){ a.currentTime = 0; a.play().catch(()=>{}); } } catch(e){} },
  playQuiz: () => { try { const a = document.getElementById('snd-quiz'); if(a){ a.currentTime = 0; a.play().catch(()=>{}); } } catch(e){} }
};

export const i18n = {
  es: { 
    ui: { lang: "ESPAÑOL", title: "SISTEMA OMEGA", selectGame: "SIMULADORES", gameChem: "🧪 QUÍMICA", reset: "⚙️ REINICIAR", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESIÓN (PSI)", modeFree: "LIBRE", modeBoyle: "L. BOYLE", modeCharles: "L. CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 PREGUNTAR A LA IA", labTitle: "🔬 LAB DE EJEMPLOS", startLab: "MISIÓN", exitLab: "SALIR", stepDone: "COMPLETADO", mass: "Masa Molar", type: "Tipo", atomicNum: "Z (Protones)", eConfig: "Config. e-", density: "Densidad", search: "Buscar elemento/fórmula...", filterAll: "TODOS", filterElem: "ELEMENTOS", filterComp: "COMPUESTOS", correct: "✅ EXCELENTE:", error: "❌ ANÁLISIS INCORRECTO:", tryAgain: "🔄 VOLVER A INTENTAR", continue: "CONTINUAR SIMULACIÓN", classHeader: "👩‍🏫 CLASE MAGISTRAL DE LA IA:" },
    lessons: { FREE: { title: "Termodinámica", goal: "Manipular variables.", idea: "La Ecuación se balancea." }, BOYLE: { title: "Ley de Boyle", goal: "P1·V1 = P2·V2.", idea: "T constante. Menos volumen = más presión." }, CHARLES: { title: "Ley de Charles", goal: "V1/T1 = V2/T2.", idea: "P constante. Más calor = más volumen." }, GAY_LUSSAC: { title: "Ley de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "V constante. Más calor = más presión." } },
    examples: { BOYLE: [ { title: "Jeringa Isotérmica", prompt: "Comprime O₂ al 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Baja volumen a 50%"] } ], CHARLES: [ { title: "Globo Aerostático", prompt: "Sube T a 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Sube Temperatura a 600K"] } ], GAY_LUSSAC: [ { title: "Olla a Presión", prompt: "Sube T del H₂O a 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Calienta a 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "¿Qué sucede con la materia a más de 8000K?", options: [ { text: "Se vuelve Plasma", correct: true, explanation: "¡Correcto! Los electrones se separan." }, { text: "Se vuelve sólida", correct: false, explanation: "Falso." }, { text: "Desaparece", correct: false, explanation: "Falso." }, { text: "Se congela", correct: false, explanation: "Falso." } ], miniClass: "El estado de la materia depende de la energía térmica. El calor extremo rompe enlaces, funde sólidos, evapora líquidos e incluso arranca los electrones de sus núcleos, convirtiendo el gas en un mar ionizado conocido como PLASMA." } ],
      BOYLE: [ { question: "EJERCICIO: Si P1=15 PSI y V1=100%. ¿Cuál es P2 si V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "¡Correcto! (15 * 100 / 50 = 30)." }, { text: "7.5 PSI", correct: false, explanation: "Recuerda: a menor espacio, MAYOR presión." }, { text: "15 PSI", correct: false, explanation: "La presión DEBE cambiar." }, { text: "50 PSI", correct: false, explanation: "Error de cálculo." } ], miniClass: "La Ley de Boyle establece que a Temperatura Constante, el Volumen y la Presión son inversamente proporcionales (P₁·V₁ = P₂·V₂). Si reduces el espacio a la mitad, las partículas se aglomeran y chocan el doble de veces contra las paredes, duplicando la presión." } ],
      CHARLES: [ { question: "EJERCICIO: Si T1=300K y V1=100%. Al calentar a T2=600K, ¿qué le pasa a V2?", options: [ { text: "Sube a 200%", correct: true, explanation: "¡Correcto! V1/T1 = V2/T2." }, { text: "Baja a 50%", correct: false, explanation: "El calor expande, no contrae." }, { text: "Se queda en 100%", correct: false, explanation: "La presión explotaría." }, { text: "Sube a 600%", correct: false, explanation: "La T se duplicó, el volumen también." } ], miniClass: "La Ley de Charles dicta que a Presión Constante, el Volumen y la Temperatura son directamente proporcionales (V₁/T₁ = V₂/T₂). Al inyectar calor, las partículas se aceleran agresivamente; necesitan expandirse a un volumen mayor para no aumentar su tasa de impactos." } ],
      GAY_LUSSAC: [ { question: "Volumen bloqueado. Si subes la temperatura drásticamente...", options: [ { text: "Presión aumenta", correct: true, explanation: "¡Correcto! Golpean más fuerte." }, { text: "Presión disminuye", correct: false, explanation: "El calor añade energía." }, { text: "Átomos frenan", correct: false, explanation: "El calor acelera." }, { text: "Pierde masa", correct: false, explanation: "No se pierde materia." } ], miniClass: "La Ley de Gay-Lussac nos enseña que a Volumen Constante, la Presión y la Temperatura son directamente proporcionales (P₁/T₁ = P₂/T₂). En un contenedor rígido, calentar el gas hace que las partículas reboten a velocidades extremas, disparando la presión inmensamente." } ]
    }
  },
  en: { 
    ui: { lang: "ENGLISH", title: "OMEGA SYSTEM", selectGame: "SIMULATORS", gameChem: "🧪 CHEMISTRY", reset: "⚙️ REBOOT", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESS (PSI)", modeFree: "FREE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 ASK AI QUESTION", labTitle: "🔬 LAB EXAMPLES", startLab: "MISSION", exitLab: "EXIT", stepDone: "COMPLETED", mass: "Molar Mass", type: "Type", atomicNum: "Z (Protons)", eConfig: "e- Config", density: "Density", search: "Search element/formula...", filterAll: "ALL", filterElem: "ELEMENTS", filterComp: "COMPOUNDS", correct: "✅ CORRECT:", error: "❌ INCORRECT ANALYSIS:", tryAgain: "🔄 TRY AGAIN", continue: "CONTINUE SIMULATION", classHeader: "👩‍🏫 AI MASTERCLASS:" },
    lessons: { FREE: { title: "Thermodynamics", goal: "Manipulate variables.", idea: "The equation balances." }, BOYLE: { title: "Boyle's Law", goal: "P1·V1 = P2·V2.", idea: "Constant T. Less volume = more pressure." }, CHARLES: { title: "Charles's Law", goal: "V1/T1 = V2/T2.", idea: "Constant P. More heat = more volume." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Constant V. More heat = more pressure." } },
    examples: { BOYLE: [ { title: "Isothermal Syringe", prompt: "Compress to 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Lower volume to 50%"] } ], CHARLES: [ { title: "Hot Air Balloon", prompt: "Raise T to 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Heat to 600K"] } ], GAY_LUSSAC: [ { title: "Pressure Cooker", prompt: "Heat to 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Heat to 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "What happens to matter above 8000K?", options: [ { text: "Becomes Plasma", correct: true, explanation: "Correct!" }, { text: "Becomes solid", correct: false, explanation: "False." }, { text: "Disappears", correct: false, explanation: "False." }, { text: "Freezes", correct: false, explanation: "False." } ], miniClass: "State of matter depends on thermal energy. Extreme heat breaks molecular bonds, melts solids, evaporates liquids, and eventually tears electrons from their nuclei, turning gas into an ionized sea called PLASMA." } ],
      BOYLE: [ { question: "MATH: If P1=15 PSI and V1=100%. What is P2 if V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Correct!" }, { text: "7.5 PSI", correct: false, explanation: "False." }, { text: "15 PSI", correct: false, explanation: "False." }, { text: "50 PSI", correct: false, explanation: "False." } ], miniClass: "Boyle's Law states that at Constant Temperature, Volume and Pressure are inversely proportional (P₁·V₁ = P₂·V₂). If you halve the space, particles crowd together and hit the walls twice as often, doubling the pressure." } ],
      CHARLES: [ { question: "MATH: If T1=300K and V1=100%. Heat to T2=600K, what is V2?", options: [ { text: "Rises to 200%", correct: true, explanation: "Correct!" }, { text: "Drops to 50%", correct: false, explanation: "False." }, { text: "Stays 100%", correct: false, explanation: "False." }, { text: "Rises to 600%", correct: false, explanation: "False." } ], miniClass: "Charles's Law dictates that at Constant Pressure, Volume and Temperature are directly proportional (V₁/T₁ = V₂/T₂). Adding heat accelerates the particles; they need more room to expand so the collision rate doesn't skyrocket." } ],
      GAY_LUSSAC: [ { question: "Locked volume. If you raise temperature...", options: [ { text: "Pressure rises", correct: true, explanation: "Correct!" }, { text: "Pressure drops", correct: false, explanation: "False." }, { text: "Atoms stop", correct: false, explanation: "False." }, { text: "Loses mass", correct: false, explanation: "False." } ], miniClass: "Gay-Lussac's Law teaches us that at Constant Volume, Pressure and Temperature are directly proportional (P₁/T₁ = P₂/T₂). In a rigid container, heating the gas causes particles to bounce at extreme speeds, massively spiking internal pressure." } ]
    }
  },
  fr: { 
    ui: { lang: "FRANÇAIS", title: "SYSTÈME OMEGA", selectGame: "SIMULATEURS", gameChem: "🧪 CHIMIE", reset: "⚙️ RÉINITIALISER", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESSION (PSI)", modeFree: "LIBRE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 DEMANDER À L'IA", labTitle: "🔬 LABO D'EXEMPLES", startLab: "MISSION", exitLab: "QUITTER", stepDone: "TERMINÉ", mass: "Masse Molaire", type: "Type", atomicNum: "Z (Protons)", eConfig: "Config e-", density: "Densité", search: "Rechercher...", filterAll: "TOUT", filterElem: "ÉLÉMENTS", filterComp: "COMPOSÉS", correct: "✅ EXCELLENT:", error: "❌ ERREUR D'ANALYSE:", tryAgain: "🔄 RÉESSAYER", continue: "CONTINUER", classHeader: "👩‍🏫 CLASSE DE MAÎTRE IA :" },
    lessons: { FREE: { title: "Thermodynamique", goal: "Manipuler variables.", idea: "L'équation s'équilibre." }, BOYLE: { title: "Loi de Boyle", goal: "P1·V1 = P2·V2.", idea: "Moins de volume = plus de pression." }, CHARLES: { title: "Loi de Charles", goal: "V1/T1 = V2/T2.", idea: "Plus de chaleur = plus de volume." }, GAY_LUSSAC: { title: "Loi de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Plus de chaleur = plus de pression." } },
    examples: { BOYLE: [ { title: "Seringue isotherme", prompt: "Comprimez à 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volume à 50%"] } ], CHARLES: [ { title: "Montgolfière", prompt: "Augmentez T à 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Chauffer à 600K"] } ], GAY_LUSSAC: [ { title: "Autocuiseur", prompt: "Chauffez à 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Chauffer à 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "Que se passe-t-il au-dessus de 8000K?", options: [ { text: "Devient Plasma", correct: true, explanation: "Correct!" }, { text: "Devient solide", correct: false, explanation: "Faux." }, { text: "Disparaît", correct: false, explanation: "Faux." }, { text: "Gèle", correct: false, explanation: "Faux." } ], miniClass: "L'état de la matière dépend de l'énergie thermique. Une chaleur extrême brise les liaisons, fait fondre les solides et arrache les électrons, créant une soupe ionisée appelée PLASMA." } ],
      BOYLE: [ { question: "MATH: Si P1=15 PSI et V1=100%. Quelle est P2 si V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Correct!" }, { text: "7.5 PSI", correct: false, explanation: "Faux." }, { text: "15 PSI", correct: false, explanation: "Faux." }, { text: "50 PSI", correct: false, explanation: "Faux." } ], miniClass: "La loi de Boyle stipule qu'à température constante, le volume et la pression sont inversement proportionnels. Réduire l'espace de moitié double la fréquence des collisions, doublant la pression." } ],
      CHARLES: [ { question: "MATH: Si T1=300K et V1=100%. À T2=600K, que devient V2?", options: [ { text: "Monte à 200%", correct: true, explanation: "Correct!" }, { text: "Baisse à 50%", correct: false, explanation: "Faux." }, { text: "Reste à 100%", correct: false, explanation: "Faux." }, { text: "Monte à 600%", correct: false, explanation: "Faux." } ], miniClass: "La loi de Charles indique qu'à pression constante, volume et température sont directement proportionnels. La chaleur accélère les atomes, ils ont besoin de plus d'espace pour maintenir la pression d'origine." } ],
      GAY_LUSSAC: [ { question: "Volume fixe. Si vous augmentez la température...", options: [ { text: "Pression augmente", correct: true, explanation: "Correct!" }, { text: "Pression diminue", correct: false, explanation: "Faux." }, { text: "Atomes arrêtent", correct: false, explanation: "Faux." }, { text: "Perd masse", correct: false, explanation: "Faux." } ], miniClass: "Dans un réservoir rigide, la loi de Gay-Lussac prouve que la chaleur multiplie la vitesse des particules. Ces impacts violents sur des murs inamovibles font exploser la pression interne." } ]
    }
  },
  de: { 
    ui: { lang: "DEUTSCH", title: "OMEGA-SYSTEM", selectGame: "SIMULATOREN", gameChem: "🧪 CHEMIE", reset: "⚙️ NEUSTART", temp: "TEMP (K)", vol: "VOL (%)", press: "DRUCK (PSI)", modeFree: "FREI", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 KI FRAGEN", labTitle: "🔬 BEISPIELE", startLab: "MISSION", exitLab: "BEENDEN", stepDone: "ABGESCHLOSSEN", mass: "Molare Masse", type: "Typ", atomicNum: "Z (Protonen)", eConfig: "e- Konfig", density: "Dichte", search: "Suchen...", filterAll: "ALLE", filterElem: "ELEMENTE", filterComp: "VERBINDUNGEN", correct: "✅ RICHTIG:", error: "❌ FEHLERHAFTE ANALYSE:", tryAgain: "🔄 ERNEUT VERSUCHEN", continue: "FORTFAHREN", classHeader: "👩‍🏫 KI-MEISTERKLASSE:" },
    lessons: { FREE: { title: "Thermodynamik", goal: "Variablen manipulieren.", idea: "Gleichung gleicht sich aus." }, BOYLE: { title: "Boyle-Mariotte", goal: "P1·V1 = P2·V2.", idea: "Weniger Volumen = mehr Druck." }, CHARLES: { title: "Gesetz von Charles", goal: "V1/T1 = V2/T2.", idea: "Mehr Hitze = mehr Volumen." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Mehr Hitze = mehr Druck." } },
    examples: { BOYLE: [ { title: "Isotherme Spritze", prompt: "Auf 50% komprimieren.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volumen auf 50%"] } ], CHARLES: [ { title: "Heißluftballon", prompt: "T auf 600K erhöhen.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Auf 600K erhitzen"] } ], GAY_LUSSAC: [ { title: "Schnellkochtopf", prompt: "Auf 450K erhitzen.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Auf 450K erhitzen"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "Was passiert über 8000K?", options: [ { text: "Wird Plasma", correct: true, explanation: "Richtig!" }, { text: "Wird fest", correct: false, explanation: "Falsch." }, { text: "Verschwindet", correct: false, explanation: "Falsch." }, { text: "Gefriert", correct: false, explanation: "Falsch." } ], miniClass: "Wärmeenergie bestimmt den Zustand. Extreme Hitze zerreißt Bindungen und löst Elektronen ab, wodurch Gas in ein ionisiertes PLASMA verwandelt wird." } ],
      BOYLE: [ { question: "MATH: Wenn P1=15 PSI, V1=100%. Was ist P2 bei V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Richtig!" }, { text: "7.5 PSI", correct: false, explanation: "Falsch." }, { text: "15 PSI", correct: false, explanation: "Falsch." }, { text: "50 PSI", correct: false, explanation: "Falsch." } ], miniClass: "Das Boyle-Mariotte-Gesetz besagt, dass bei konstanter T Volumen und Druck umgekehrt proportional sind. Halber Raum bedeutet doppelte Wandkollisionen und doppelten Druck." } ],
      CHARLES: [ { question: "MATH: T1=300K, V1=100%. Bei T2=600K, was ist V2?", options: [ { text: "Steigt auf 200%", correct: true, explanation: "Richtig!" }, { text: "Fällt auf 50%", correct: false, explanation: "Falsch." }, { text: "Bleibt bei 100%", correct: false, explanation: "Falsch." }, { text: "Steigt auf 600%", correct: false, explanation: "Falsch." } ], miniClass: "Das Gesetz von Charles besagt: Bei konstantem Druck wächst das Volumen direkt mit der Temperatur. Hitze beschleunigt Teilchen; sie brauchen mehr Platz." } ],
      GAY_LUSSAC: [ { question: "Festes Volumen. T steigt...", options: [ { text: "Druck steigt", correct: true, explanation: "Richtig!" }, { text: "Druck fällt", correct: false, explanation: "Falsch." }, { text: "Atome stoppen", correct: false, explanation: "Falsch." }, { text: "Verliert Masse", correct: false, explanation: "Falsch." } ], miniClass: "Das Gesetz von Gay-Lussac besagt, dass in einem starren Behälter die Hitze die Teilchen extrem beschleunigt, was zu viel härteren Einschlägen und enormem Druck führt." } ]
    }
  }
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const getPhase = (t, mat) => { if (t > 8000) return 'plasma'; if (t <= mat.mp) return 'solid'; if (t < mat.bp) return mat.mp === mat.bp ? 'gas' : 'liquid'; return 'gas'; };
const calculatePressure = (t, v, phase) => { if (phase === 'plasma') return (300 * t) / (v / 100); if (phase === 'gas') return (150 * t) / (v / 100); if (phase === 'liquid') return 14.7 + (t * 0.05); return 14.7; };

export const useGameStore = create(
  persist(
    (set, get) => ({
      appState: 'LANG_SELECT', language: 'es', activeMaterial: 'H2O', activeMode: 'FREE',
      temp: 300, volume: 100, pressure: 14.7, phaseID: 'liquid', isCritical: false, inventory: [],
      score: 0, interactionCount: 0, activeQuiz: null, quizFeedback: null, exampleSession: null,
      searchTerm: '', filterCategory: 'All',

      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilterCategory: (cat) => { audioSys.playUI(); set({ filterCategory: cat }); },
      setLanguage: (lang) => { audioSys.playUI(); set({ language: lang, appState: 'GAME_SELECT' }); },
      startGame: () => { audioSys.playUI(); set({ appState: 'PLAYING', activeMode: 'FREE', score: 0, interactionCount: 0, exampleSession: null }); },
      
      // 🔥 RESET COMPLETAMENTE REPARADO
      resetProgress: () => { 
        set({ appState: 'LANG_SELECT', temp: 300, volume: 100, pressure: 14.7, activeMode: 'FREE', activeQuiz: null, quizFeedback: null, exampleSession: null, interactionCount: 0, score: 0, searchTerm: '', filterCategory: 'All' }); 
      },
      
      setMaterial: (matId) => { 
        audioSys.playUI(); const mat = MATERIALS[matId] || MATERIALS['H2O']; const p = getPhase(300, mat);
        set({ activeMaterial: matId, temp: 300, volume: 100, pressure: calculatePressure(300, 100, p), phaseID: p, activeMode: 'FREE', activeQuiz: null, quizFeedback: null, exampleSession: null, interactionCount: 0 }); 
      },
      setMode: (mode) => { 
        const state = get(); const mat = MATERIALS[state.activeMaterial] || MATERIALS['H2O']; audioSys.playUI(); 
        if (state.temp < mat.bp && mode !== 'FREE') {
           const safeT = mat.bp + 50; set({ activeMode: mode, temp: safeT, volume: 100, pressure: (0.049 * safeT) / 1, phaseID: 'gas', exampleSession: null, interactionCount: 0 });
        } else { set({ activeMode: mode, exampleSession: null, interactionCount: 0 }); }
      },
      loadExampleScenario: (mode, index) => {
        const state = get(); const ex = i18n[state.language].examples[mode][index];
        if (!ex) return;
        audioSys.playUI(); const mat = MATERIALS[ex.setup.mat] || MATERIALS['H2O']; const p = getPhase(ex.setup.t, mat);
        set({ activeMode: mode, activeMaterial: ex.setup.mat, temp: ex.setup.t, volume: ex.setup.v, pressure: calculatePressure(ex.setup.t, ex.setup.v, p), phaseID: p, exampleSession: { ...ex, completed: false } });
      },
      exitExample: () => { audioSys.playUI(); set({ exampleSession: null }); },

      triggerExercise: () => {
        const state = get(); 
        const dict = i18n[state.language].quizzes[state.activeMode] || i18n[state.language].quizzes['FREE'];
        if (dict && dict.length > 0) {
          const randomQ = dict[Math.floor(Math.random() * dict.length)];
          const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
          // Incluimos miniClass en el estado del quiz
          set({ activeQuiz: { title: "IA SENSOR", question: randomQ.question, options: shuffledOptions, miniClass: randomQ.miniClass }, quizFeedback: null });
          audioSys.playQuiz();
        }
      },

      updatePhysics: (action, amount) => {
        if(get().activeQuiz) return;
        const state = get(); let t = state.temp; let v = state.volume; let p = state.pressure;
        const MIN_VOL = 35; const MAX_VOL = 100; const k = 0.049; const MAX_TEMP = 15000;

        if (state.activeMode === 'FREE') {
          if (action === 'TEMP') { t = clamp(t + amount, 1, MAX_TEMP); p = (k*t)/(v/100); }
          if (action === 'VOL') { v = clamp(v + amount, MIN_VOL, MAX_VOL); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); let calcV = Math.round((k * t / p) * 100); if (calcV < MIN_VOL || calcV > MAX_VOL) return audioSys.playError(); v = calcV; }
        } else if (state.activeMode === 'BOYLE') {
          if (action === 'TEMP') return audioSys.playError();
          if (action === 'VOL') { v = clamp(v + amount, MIN_VOL, MAX_VOL); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); let calcV = Math.round((k * t / p) * 100); if (calcV < MIN_VOL || calcV > MAX_VOL) return audioSys.playError(); v = calcV; }
        } else if (state.activeMode === 'CHARLES') {
          if (action === 'PRESS' || action === 'VOL') return audioSys.playError();
          if (action === 'TEMP') { let newT = clamp(t + amount, 1, MAX_TEMP); let expectedV = Math.round((k * newT / p) * 100); if (expectedV > MAX_VOL || expectedV < MIN_VOL) return audioSys.playError(); t = newT; v = expectedV; }
        } else if (state.activeMode === 'GAY_LUSSAC') {
          if (action === 'VOL') return audioSys.playError();
          if (action === 'TEMP') { t = clamp(t + amount, 1, MAX_TEMP); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); t = Math.round((p * (v/100)) / k); }
        }

        if ((action === 'VOL' && amount < 0) || (action === 'PRESS' && amount > 0)) audioSys.playCrash(0.4); 

        const mat = MATERIALS[state.activeMaterial] || MATERIALS['H2O']; const newPhase = getPhase(t, mat);
        let exSession = state.exampleSession;
        if (exSession && !exSession.completed) {
           const tgt = exSession.target; let currentVal = tgt.var === 'v' ? v : (tgt.var === 't' ? t : p);
           if (Math.abs(currentVal - tgt.val) <= tgt.tol) { exSession = { ...exSession, completed: true }; audioSys.playSuccess(); set((s) => ({ score: s.score + 200 })); }
        }

        let newCount = state.interactionCount + 1;
        set({ temp: t, volume: v, pressure: p, phaseID: newPhase, isCritical: p >= 1500, exampleSession: exSession, interactionCount: newCount });
        if (newCount % 4 === 0 && !exSession) get().triggerExercise();
      },

      answerQuizQuestion: (opt) => {
        if (opt.correct) { 
          audioSys.playSuccess(); 
          set((state) => ({ score: state.score + 100, quizFeedback: { type: 'success', text: opt.explanation } })); 
        } else { 
          audioSys.playError(); 
          set((state) => ({ score: Math.max(0, state.score - 50), quizFeedback: { type: 'error', text: opt.explanation } })); 
        }
      },
      clearFeedback: () => { audioSys.playUI(); set({ quizFeedback: null }); },
      closeQuiz: () => { audioSys.playUI(); set({ activeQuiz: null, quizFeedback: null }); }
    }), { name: 'll-omega-master-v1' }
  )
);
