import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const audioSys = {
  playUI: () => { try { const a = new Audio('data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTEAAAAA'); a.volume=0.2; a.play(); } catch(e){} },
  play: (id, vol=1.0) => { try { const a = document.getElementById(id); if(a){ a.currentTime=0; a.volume=vol; a.play().catch(()=>{}); } } catch(e){} }
};

export const MATERIALS = {
  H2O: { id: 'H2O', name: 'Agua (H₂O)', mp: 273, bp: 373, mass: '18.01 g/mol', type: 'Polar', colorG: '#00f2ff', colorL: '#0055ff', colorS: '#ffffff' },
  CO2: { id: 'CO2', name: 'Hielo Seco (CO₂)', mp: 195, bp: 195, mass: '44.01 g/mol', type: 'No polar', colorG: '#55ff55', colorL: '#000000', colorS: '#ddffdd' },
  O2: { id: 'O2', name: 'Oxígeno (O₂)', mp: 54, bp: 90, mass: '32.00 g/mol', type: 'Diatómico', colorG: '#ffffff', colorL: '#4444ff', colorS: '#2222aa' },
  NACL: { id: 'NACL', name: 'Sal (NaCl)', mp: 1074, bp: 1738, mass: '58.44 g/mol', type: 'Iónico', colorG: '#ffaa00', colorL: '#ffffaa', colorS: '#ffffff' },
  HE: { id: 'HE', name: 'Helio (He)', mp: 1, bp: 4, mass: '4.00 g/mol', type: 'Gas Noble', colorG: '#ffaaaa', colorL: '#ff5555', colorS: '#330000' }
};

// 🌍 DICCIONARIO COMPLETO (4 IDIOMAS 100% TRADUCIDOS)
export const i18n = {
  es: { 
    ui: { lang: "ESPAÑOL", title: "SISTEMA OMEGA", selectGame: "SIMULADORES", gameChem: "🧪 QUÍMICA", reset: "⚙️ REINICIAR", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESIÓN (PSI)", modeFree: "LIBRE", modeBoyle: "L. BOYLE", modeCharles: "L. CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 PREGUNTAR A LA IA", labTitle: "🔬 LAB DE EJEMPLOS", startLab: "MISIÓN", exitLab: "SALIR", stepDone: "COMPLETADO", mass: "Masa Molar", type: "Tipo", correct: "✅ CORRECTO:", error: "❌ ERROR:" },
    lessons: { FREE: { title: "Termodinámica", goal: "Manipular variables.", idea: "La Ecuación se balancea." }, BOYLE: { title: "Ley de Boyle", goal: "P1·V1 = P2·V2.", idea: "T constante. Menos volumen = más presión." }, CHARLES: { title: "Ley de Charles", goal: "V1/T1 = V2/T2.", idea: "P constante. Más calor = más volumen." }, GAY_LUSSAC: { title: "Ley de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "V constante. Más calor = más presión." } },
    examples: { BOYLE: [ { title: "Jeringa Isotérmica", prompt: "Comprime O₂ al 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Baja volumen a 50%"] } ], CHARLES: [ { title: "Globo Aerostático", prompt: "Sube T a 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Sube Temperatura a 600K"] } ], GAY_LUSSAC: [ { title: "Olla a Presión", prompt: "Sube T del H₂O a 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Calienta a 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "¿Qué determina si el material es Sólido, Líquido o Gas?", options: [ { text: "Relación de T con Fusión/Ebullición", correct: true, explanation: "¡Correcto! La temperatura es el factor clave." }, { text: "La presión del pistón", correct: false, explanation: "Falso. La presión afecta, pero la T domina." }, { text: "El volumen", correct: false, explanation: "Falso." }, { text: "La masa", correct: false, explanation: "Falso. Es constante." } ] } ],
      BOYLE: [ { question: "EJERCICIO: Si P1=15 PSI y V1=100%. ¿Cuál es P2 si V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "¡Correcto! (15*100)/50 = 30." }, { text: "7.5 PSI", correct: false, explanation: "Falso. Si V baja, P sube." }, { text: "15 PSI", correct: false, explanation: "Falso. P debe cambiar." }, { text: "50 PSI", correct: false, explanation: "Falso. Error matemático." } ] } ],
      CHARLES: [ { question: "EJERCICIO: Si T1=300K y V1=100%. Al calentar a T2=600K, ¿qué le pasa a V2?", options: [ { text: "Sube a 200%", correct: true, explanation: "¡Correcto! V1/T1 = V2/T2." }, { text: "Baja a 50%", correct: false, explanation: "Falso. El calor expande." }, { text: "Se queda en 100%", correct: false, explanation: "Falso. P explotaría." }, { text: "Sube a 600%", correct: false, explanation: "Falso. Error de cálculo." } ] } ],
      GAY_LUSSAC: [ { question: "Volumen bloqueado. Si subes la temperatura...", options: [ { text: "Presión aumenta", correct: true, explanation: "¡Correcto! Más energía cinética." }, { text: "Presión disminuye", correct: false, explanation: "Falso. Más T = más P." }, { text: "Átomos frenan", correct: false, explanation: "Falso. Se aceleran." }, { text: "Pierde masa", correct: false, explanation: "Falso. Sistema cerrado." } ] } ]
    }
  },
  en: { 
    ui: { lang: "ENGLISH", title: "OMEGA SYSTEM", selectGame: "SIMULATORS", gameChem: "🧪 CHEMISTRY", reset: "⚙️ REBOOT", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESS (PSI)", modeFree: "FREE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 ASK AI QUESTION", labTitle: "🔬 LAB EXAMPLES", startLab: "MISSION", exitLab: "EXIT", stepDone: "COMPLETED", mass: "Molar Mass", type: "Type", correct: "✅ CORRECT:", error: "❌ ERROR:" },
    lessons: { FREE: { title: "Thermodynamics", goal: "Manipulate variables.", idea: "The equation balances." }, BOYLE: { title: "Boyle's Law", goal: "P1·V1 = P2·V2.", idea: "Constant T. Less volume = more pressure." }, CHARLES: { title: "Charles's Law", goal: "V1/T1 = V2/T2.", idea: "Constant P. More heat = more volume." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Constant V. More heat = more pressure." } },
    examples: { BOYLE: [ { title: "Isothermal Syringe", prompt: "Compress to 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Lower volume to 50%"] } ], CHARLES: [ { title: "Hot Air Balloon", prompt: "Raise T to 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Heat to 600K"] } ], GAY_LUSSAC: [ { title: "Pressure Cooker", prompt: "Heat to 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Heat to 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "What determines if the material is Solid, Liquid or Gas?", options: [ { text: "T relation with Melting/Boiling", correct: true, explanation: "Correct! T is key." }, { text: "Piston pressure", correct: false, explanation: "False. T dominates." }, { text: "Volume", correct: false, explanation: "False." }, { text: "Mass", correct: false, explanation: "False." } ] } ],
      BOYLE: [ { question: "MATH: If P1=15 PSI and V1=100%. What is P2 if V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Correct! (15*100)/50 = 30." }, { text: "7.5 PSI", correct: false, explanation: "False. If V drops, P rises." }, { text: "15 PSI", correct: false, explanation: "False. P must change." }, { text: "50 PSI", correct: false, explanation: "False. Math error." } ] } ],
      CHARLES: [ { question: "MATH: If T1=300K and V1=100%. Heat to T2=600K, what is V2?", options: [ { text: "Rises to 200%", correct: true, explanation: "Correct! V1/T1 = V2/T2." }, { text: "Drops to 50%", correct: false, explanation: "False. Heat expands." }, { text: "Stays 100%", correct: false, explanation: "False." }, { text: "Rises to 600%", correct: false, explanation: "False." } ] } ],
      GAY_LUSSAC: [ { question: "Locked volume. If you raise temperature...", options: [ { text: "Pressure rises", correct: true, explanation: "Correct! More kinetic energy." }, { text: "Pressure drops", correct: false, explanation: "False." }, { text: "Atoms stop", correct: false, explanation: "False." }, { text: "Loses mass", correct: false, explanation: "False." } ] } ]
    }
  },
  fr: { 
    ui: { lang: "FRANÇAIS", title: "SYSTÈME OMEGA", selectGame: "SIMULATEURS", gameChem: "🧪 CHIMIE", reset: "⚙️ RÉINITIALISER", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESSION (PSI)", modeFree: "LIBRE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 DEMANDER À L'IA", labTitle: "🔬 LABO D'EXEMPLES", startLab: "MISSION", exitLab: "QUITTER", stepDone: "TERMINÉ", mass: "Masse Molaire", type: "Type", correct: "✅ CORRECT:", error: "❌ ERREUR:" },
    lessons: { FREE: { title: "Thermodynamique", goal: "Manipuler.", idea: "L'équation s'équilibre." }, BOYLE: { title: "Loi de Boyle", goal: "P1·V1 = P2·V2.", idea: "T constant. Moins de volume = plus de pression." }, CHARLES: { title: "Loi de Charles", goal: "V1/T1 = V2/T2.", idea: "P constant. Plus de chaleur = plus de volume." }, GAY_LUSSAC: { title: "Loi de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "V constant. Plus de chaleur = plus de pression." } },
    examples: { BOYLE: [ { title: "Seringue isotherme", prompt: "Comprimez à 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volume à 50%"] } ], CHARLES: [ { title: "Montgolfière", prompt: "Augmentez T à 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Chauffer à 600K"] } ], GAY_LUSSAC: [ { title: "Autocuiseur", prompt: "Chauffez à 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Chauffer à 450K"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "Qu'est-ce qui détermine l'état (Solide, Liquide, Gaz)?", options: [ { text: "Relation T avec Fusion", correct: true, explanation: "Correct!" }, { text: "Pression du piston", correct: false, explanation: "Faux." }, { text: "Le volume", correct: false, explanation: "Faux." }, { text: "Masse", correct: false, explanation: "Faux." } ] } ],
      BOYLE: [ { question: "MATH: Si P1=15 PSI et V1=100%. Quelle est P2 si V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Correct! (15*100)/50 = 30." }, { text: "7.5 PSI", correct: false, explanation: "Faux." }, { text: "15 PSI", correct: false, explanation: "Faux." }, { text: "50 PSI", correct: false, explanation: "Faux." } ] } ],
      CHARLES: [ { question: "MATH: Si T1=300K et V1=100%. À T2=600K, que devient V2?", options: [ { text: "Monte à 200%", correct: true, explanation: "Correct! V1/T1 = V2/T2." }, { text: "Baisse à 50%", correct: false, explanation: "Faux." }, { text: "Reste à 100%", correct: false, explanation: "Faux." }, { text: "Monte à 600%", correct: false, explanation: "Faux." } ] } ],
      GAY_LUSSAC: [ { question: "Volume fixe. Si vous augmentez la température...", options: [ { text: "Pression augmente", correct: true, explanation: "Correct!" }, { text: "Pression diminue", correct: false, explanation: "Faux." }, { text: "Atomes arrêtent", correct: false, explanation: "Faux." }, { text: "Perd masse", correct: false, explanation: "Faux." } ] } ]
    }
  },
  de: { 
    ui: { lang: "DEUTSCH", title: "OMEGA-SYSTEM", selectGame: "SIMULATOREN", gameChem: "🧪 CHEMIE", reset: "⚙️ NEUSTART", temp: "TEMP (K)", vol: "VOL (%)", press: "DRUCK (PSI)", modeFree: "FREI", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 KI FRAGEN", labTitle: "🔬 BEISPIELE", startLab: "MISSION", exitLab: "BEENDEN", stepDone: "ABGESCHLOSSEN", mass: "Molare Masse", type: "Typ", correct: "✅ RICHTIG:", error: "❌ FEHLER:" },
    lessons: { FREE: { title: "Thermodynamik", goal: "Manipulieren.", idea: "Gleichung gleicht sich aus." }, BOYLE: { title: "Boyle-Mariotte", goal: "P1·V1 = P2·V2.", idea: "T konstant. Weniger Volumen = mehr Druck." }, CHARLES: { title: "Gesetz von Charles", goal: "V1/T1 = V2/T2.", idea: "P konstant. Mehr Hitze = mehr Volumen." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "V konstant. Mehr Hitze = mehr Druck." } },
    examples: { BOYLE: [ { title: "Isotherme Spritze", prompt: "Auf 50% komprimieren.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volumen auf 50%"] } ], CHARLES: [ { title: "Heißluftballon", prompt: "T auf 600K erhöhen.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Auf 600K erhitzen"] } ], GAY_LUSSAC: [ { title: "Schnellkochtopf", prompt: "Auf 450K erhitzen.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Auf 450K erhitzen"] } ], FREE: [] },
    quizzes: {
      FREE: [ { question: "Was bestimmt den Zustand (Fest, Flüssig, Gas)?", options: [ { text: "T-Verhältnis", correct: true, explanation: "Richtig!" }, { text: "Kolbendruck", correct: false, explanation: "Falsch." }, { text: "Volumen", correct: false, explanation: "Falsch." }, { text: "Masse", correct: false, explanation: "Falsch." } ] } ],
      BOYLE: [ { question: "MATH: Wenn P1=15 PSI, V1=100%. Was ist P2 bei V2=50%?", options: [ { text: "30 PSI", correct: true, explanation: "Richtig! (15*100)/50 = 30." }, { text: "7.5 PSI", correct: false, explanation: "Falsch." }, { text: "15 PSI", correct: false, explanation: "Falsch." }, { text: "50 PSI", correct: false, explanation: "Falsch." } ] } ],
      CHARLES: [ { question: "MATH: T1=300K, V1=100%. Bei T2=600K, was ist V2?", options: [ { text: "200%", correct: true, explanation: "Richtig! V1/T1 = V2/T2." }, { text: "50%", correct: false, explanation: "Falsch." }, { text: "100%", correct: false, explanation: "Falsch." }, { text: "600%", correct: false, explanation: "Falsch." } ] } ],
      GAY_LUSSAC: [ { question: "Festes Volumen. T steigt...", options: [ { text: "Druck steigt", correct: true, explanation: "Richtig!" }, { text: "Druck fällt", correct: false, explanation: "Falsch." }, { text: "Atome stoppen", correct: false, explanation: "Falsch." }, { text: "Verliert Masse", correct: false, explanation: "Falsch." } ] } ]
    }
  }
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const getPhase = (t, mat) => { if (t <= mat.mp) return 'solid'; if (t < mat.bp) return mat.mp === mat.bp ? 'gas' : 'liquid'; return 'gas'; };
const calculatePressure = (t, v, phase) => { if (phase === 'gas') return (150 * t) / (v / 100); if (phase === 'liquid') return 14.7 + (t * 0.05); return 14.7; };

export const useGameStore = create(
  persist(
    (set, get) => ({
      appState: 'LANG_SELECT', language: 'es', activeMaterial: 'O2', activeMode: 'FREE',
      temp: 300, volume: 100, pressure: 14.7, phaseID: 'gas', isCritical: false,
      score: 0, interactionCount: 0, activeQuiz: null, quizFeedback: null, exampleSession: null,

      setLanguage: (lang) => { audioSys.playUI(); set({ language: lang, appState: 'GAME_SELECT' }); },
      startGame: () => { audioSys.playUI(); set({ appState: 'PLAYING', activeMode: 'FREE', score: 0, interactionCount: 0, exampleSession: null }); },
      resetProgress: () => { audioSys.play('snd-cool'); set({ appState: 'LANG_SELECT', temp: 300, volume: 100, pressure: 14.7, activeMode: 'FREE', activeQuiz: null, quizFeedback: null, exampleSession: null }); },
      
      setMaterial: (matId) => { 
        audioSys.playUI(); const mat = MATERIALS[matId]; const p = getPhase(300, mat);
        set({ activeMaterial: matId, temp: 300, volume: 100, pressure: calculatePressure(300, 100, p), phaseID: p, activeMode: 'FREE', activeQuiz: null, exampleSession: null }); 
      },
      
      setMode: (mode) => { 
        const state = get(); const mat = MATERIALS[state.activeMaterial]; audioSys.playUI(); 
        if (state.temp < mat.bp && mode !== 'FREE') {
           const safeT = mat.bp + 50; set({ activeMode: mode, temp: safeT, volume: 100, pressure: (0.049 * safeT) / 1, phaseID: 'gas', exampleSession: null });
        } else { set({ activeMode: mode, exampleSession: null }); }
      },

      loadExampleScenario: (mode, index) => {
        const state = get(); const ex = i18n[state.language].examples[mode][index];
        if (!ex) return;
        audioSys.playUI(); const mat = MATERIALS[ex.setup.mat]; const p = getPhase(ex.setup.t, mat);
        set({ activeMode: mode, activeMaterial: ex.setup.mat, temp: ex.setup.t, volume: ex.setup.v, pressure: calculatePressure(ex.setup.t, ex.setup.v, p), phaseID: p, exampleSession: { ...ex, completed: false } });
      },
      exitExample: () => { audioSys.playUI(); set({ exampleSession: null }); },

      // 🧠 TRIGGER MANUAL DE EJERCICIOS
      triggerExercise: () => {
        const state = get(); 
        const dict = i18n[state.language].quizzes[state.activeMode] || i18n[state.language].quizzes['FREE'];
        if (dict && dict.length > 0) {
          const randomQ = dict[Math.floor(Math.random() * dict.length)];
          const shuffledOptions = [...randomQ.options].sort(() => Math.random() - 0.5);
          set({ activeQuiz: { title: "IA SENSOR", question: randomQ.question, options: shuffledOptions }, quizFeedback: null });
          audioSys.play('snd-quiz', 0.8);
        }
      },

      updatePhysics: (action, amount) => {
        if(get().activeQuiz) return;
        const state = get(); let t = state.temp; let v = state.volume; let p = state.pressure;
        const MIN_VOL = 35; const MAX_VOL = 100; const k = 0.049; 

        if (state.activeMode === 'FREE') {
          if (action === 'TEMP') { t = clamp(t + amount, 1, 6000); p = (k*t)/(v/100); }
          if (action === 'VOL') { v = clamp(v + amount, MIN_VOL, MAX_VOL); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); let calcV = Math.round((k * t / p) * 100); if (calcV < MIN_VOL || calcV > MAX_VOL) return audioSys.play('snd-error'); v = calcV; }
        } else if (state.activeMode === 'BOYLE') {
          if (action === 'TEMP') return audioSys.play('snd-error');
          if (action === 'VOL') { v = clamp(v + amount, MIN_VOL, MAX_VOL); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); let calcV = Math.round((k * t / p) * 100); if (calcV < MIN_VOL || calcV > MAX_VOL) return audioSys.play('snd-error'); v = calcV; }
        } else if (state.activeMode === 'CHARLES') {
          if (action === 'PRESS' || action === 'VOL') return audioSys.play('snd-error');
          if (action === 'TEMP') { let newT = clamp(t + amount, 1, 6000); let expectedV = Math.round((k * newT / p) * 100); if (expectedV > MAX_VOL || expectedV < MIN_VOL) return audioSys.play('snd-error'); t = newT; v = expectedV; }
        } else if (state.activeMode === 'GAY_LUSSAC') {
          if (action === 'VOL') return audioSys.play('snd-error');
          if (action === 'TEMP') { t = clamp(t + amount, 1, 6000); p = (k*t)/(v/100); }
          if (action === 'PRESS') { p = Math.max(1, p + amount); t = Math.round((p * (v/100)) / k); }
        }

        amount > 0 ? audioSys.play('snd-heat', 0.5) : audioSys.play('snd-cool', 0.5);
        if ((action === 'VOL' && amount < 0) || (action === 'PRESS' && amount > 0)) audioSys.play('snd-crash', 0.4); 

        const mat = MATERIALS[state.activeMaterial]; const newPhase = getPhase(t, mat);
        
        let exSession = state.exampleSession;
        if (exSession && !exSession.completed) {
           const tgt = exSession.target; let currentVal = tgt.var === 'v' ? v : (tgt.var === 't' ? t : p);
           if (Math.abs(currentVal - tgt.val) <= tgt.tol) { exSession = { ...exSession, completed: true }; audioSys.play('snd-success'); set((s) => ({ score: s.score + 200 })); }
        }

        // 🔥 CORRECCIÓN: GUARDAR EL CONTADOR EN EL ESTADO PARA QUE AUTO-QUIZ FUNCIONE
        let newCount = state.interactionCount + 1;
        if (newCount % 3 === 0) {
           setTimeout(() => get().triggerExercise(), 500); 
        }

        set({ temp: t, volume: v, pressure: p, phaseID: newPhase, isCritical: p >= 150, exampleSession: exSession, interactionCount: newCount });
      },

      answerQuizQuestion: (opt) => {
        if (opt.correct) { audioSys.play('snd-success'); set((state) => ({ score: state.score + 100, quizFeedback: { type: 'success', text: opt.explanation } })); }
        else { audioSys.play('snd-error'); set((state) => ({ score: Math.max(0, state.score - 50), quizFeedback: { type: 'error', text: opt.explanation } })); }
      },
      closeQuiz: () => { audioSys.playUI(); set({ activeQuiz: null, quizFeedback: null }); }
    }), { name: 'll-omega-multilang-final' }
  )
);
