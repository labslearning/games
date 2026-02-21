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

// 🌍 DICCIONARIO MULTILINGÜE COMPLETO
export const i18n = {
  es: { 
    ui: { lang: "ESPAÑOL", title: "SISTEMA OMEGA", selectGame: "SIMULADORES", gameChem: "🧪 QUÍMICA", reset: "⚙️ REINICIAR", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESIÓN (PSI)", modeFree: "LIBRE", modeBoyle: "L. BOYLE", modeCharles: "L. CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 PREGUNTAR A LA IA", loadingAI: "⏳ CONSULTANDO RED NEURAL...", labTitle: "🔬 LAB DE EJEMPLOS", startLab: "MISIÓN", exitLab: "SALIR", stepDone: "COMPLETADO", mass: "Masa Molar", type: "Tipo", atomicNum: "Z (Protones)", eConfig: "Config. e-", density: "Densidad", search: "Buscar elemento/fórmula...", filterAll: "TODOS", filterElem: "ELEMENTOS", filterComp: "COMPUESTOS", correct: "✅ EXCELENTE:", error: "❌ ANÁLISIS INCORRECTO:", tryAgain: "🔄 VOLVER A INTENTAR", continue: "CONTINUAR SIMULACIÓN", classHeader: "👩‍🏫 CLASE MAGISTRAL DE LA IA:" },
    lessons: { FREE: { title: "Termodinámica", goal: "Manipular variables.", idea: "La Ecuación se balancea." }, BOYLE: { title: "Ley de Boyle", goal: "P1·V1 = P2·V2.", idea: "T constante. Menos volumen = más presión." }, CHARLES: { title: "Ley de Charles", goal: "V1/T1 = V2/T2.", idea: "P constante. Más calor = más volumen." }, GAY_LUSSAC: { title: "Ley de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "V constante. Más calor = más presión." } },
    examples: { BOYLE: [ { title: "Jeringa Isotérmica", prompt: "Comprime O₂ al 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Baja volumen a 50%"] } ], CHARLES: [ { title: "Globo Aerostático", prompt: "Sube T a 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Sube Temperatura a 600K"] } ], GAY_LUSSAC: [ { title: "Olla a Presión", prompt: "Sube T del H₂O a 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Calienta a 450K"] } ], FREE: [] }
  },
  en: { 
    ui: { lang: "ENGLISH", title: "OMEGA SYSTEM", selectGame: "SIMULATORS", gameChem: "🧪 CHEMISTRY", reset: "⚙️ REBOOT", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESS (PSI)", modeFree: "FREE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 ASK AI QUESTION", loadingAI: "⏳ CONNECTING TO NEURAL NET...", labTitle: "🔬 LAB EXAMPLES", startLab: "MISSION", exitLab: "EXIT", stepDone: "COMPLETED", mass: "Molar Mass", type: "Type", atomicNum: "Z (Protons)", eConfig: "e- Config", density: "Density", search: "Search element...", filterAll: "ALL", filterElem: "ELEMENTS", filterComp: "COMPOUNDS", correct: "✅ CORRECT:", error: "❌ INCORRECT ANALYSIS:", tryAgain: "🔄 TRY AGAIN", continue: "CONTINUE SIMULATION", classHeader: "👩‍🏫 AI MASTERCLASS:" },
    lessons: { FREE: { title: "Thermodynamics", goal: "Manipulate variables.", idea: "The equation balances." }, BOYLE: { title: "Boyle's Law", goal: "P1·V1 = P2·V2.", idea: "Constant T. Less volume = more pressure." }, CHARLES: { title: "Charles's Law", goal: "V1/T1 = V2/T2.", idea: "Constant P. More heat = more volume." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Constant V. More heat = more pressure." } },
    examples: { BOYLE: [ { title: "Isothermal Syringe", prompt: "Compress to 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Lower volume to 50%"] } ], CHARLES: [ { title: "Hot Air Balloon", prompt: "Raise T to 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Heat to 600K"] } ], GAY_LUSSAC: [ { title: "Pressure Cooker", prompt: "Heat to 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Heat to 450K"] } ], FREE: [] }
  },
  fr: { 
    ui: { lang: "FRANÇAIS", title: "SYSTÈME OMEGA", selectGame: "SIMULATEURS", gameChem: "🧪 CHIMIE", reset: "⚙️ RÉINITIALISER", temp: "TEMP (K)", vol: "VOL (%)", press: "PRESSION (PSI)", modeFree: "LIBRE", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 DEMANDER À L'IA", loadingAI: "⏳ CONNEXION IA...", labTitle: "🔬 LABO D'EXEMPLES", startLab: "MISSION", exitLab: "QUITTER", stepDone: "TERMINÉ", mass: "Masse Molaire", type: "Type", atomicNum: "Z (Protons)", eConfig: "Config e-", density: "Densité", search: "Rechercher...", filterAll: "TOUT", filterElem: "ÉLÉMENTS", filterComp: "COMPOSÉS", correct: "✅ EXCELLENT:", error: "❌ ERREUR D'ANALYSE:", tryAgain: "🔄 RÉESSAYER", continue: "CONTINUER", classHeader: "👩‍🏫 CLASSE DE MAÎTRE IA:" },
    lessons: { FREE: { title: "Thermodynamique", goal: "Manipuler variables.", idea: "L'équation s'équilibre." }, BOYLE: { title: "Loi de Boyle", goal: "P1·V1 = P2·V2.", idea: "Moins de volume = plus de pression." }, CHARLES: { title: "Loi de Charles", goal: "V1/T1 = V2/T2.", idea: "Plus de chaleur = plus de volume." }, GAY_LUSSAC: { title: "Loi de Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Plus de chaleur = plus de pression." } },
    examples: { BOYLE: [ { title: "Seringue isotherme", prompt: "Comprimez à 50%.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volume à 50%"] } ], CHARLES: [ { title: "Montgolfière", prompt: "Augmentez T à 600K.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Chauffer à 600K"] } ], GAY_LUSSAC: [ { title: "Autocuiseur", prompt: "Chauffez à 450K.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Chauffer à 450K"] } ], FREE: [] }
  },
  de: { 
    ui: { lang: "DEUTSCH", title: "OMEGA-SYSTEM", selectGame: "SIMULATOREN", gameChem: "🧪 CHEMIE", reset: "⚙️ NEUSTART", temp: "TEMP (K)", vol: "VOL (%)", press: "DRUCK (PSI)", modeFree: "FREI", modeBoyle: "BOYLE", modeCharles: "CHARLES", modeGayLussac: "GAY-LUSSAC", generate: "🧠 KI FRAGEN", loadingAI: "⏳ KI VERBINDUNG...", labTitle: "🔬 BEISPIELE", startLab: "MISSION", exitLab: "BEENDEN", stepDone: "ABGESCHLOSSEN", mass: "Molare Masse", type: "Typ", atomicNum: "Z (Protonen)", eConfig: "e- Konfig", density: "Dichte", search: "Suchen...", filterAll: "ALLE", filterElem: "ELEMENTE", filterComp: "VERBINDUNGEN", correct: "✅ RICHTIG:", error: "❌ FEHLERHAFTE ANALYSE:", tryAgain: "🔄 ERNEUT VERSUCHEN", continue: "FORTFAHREN", classHeader: "👩‍🏫 KI-MEISTERKLASSE:" },
    lessons: { FREE: { title: "Thermodynamik", goal: "Variablen manipulieren.", idea: "Gleichung gleicht sich aus." }, BOYLE: { title: "Boyle-Mariotte", goal: "P1·V1 = P2·V2.", idea: "Weniger Volumen = mehr Druck." }, CHARLES: { title: "Gesetz von Charles", goal: "V1/T1 = V2/T2.", idea: "Mehr Hitze = mehr Volumen." }, GAY_LUSSAC: { title: "Gay-Lussac", goal: "P1/T1 = P2/T2.", idea: "Mehr Hitze = mehr Druck." } },
    examples: { BOYLE: [ { title: "Isotherme Spritze", prompt: "Auf 50% komprimieren.", setup: { t: 300, v: 100, mat: 'O2' }, target: { var: 'v', val: 50, tol: 2 }, steps: ["Volumen auf 50%"] } ], CHARLES: [ { title: "Heißluftballon", prompt: "T auf 600K erhöhen.", setup: { t: 300, v: 50, mat: 'CO2' }, target: { var: 't', val: 600, tol: 10 }, steps: ["Auf 600K erhitzen"] } ], GAY_LUSSAC: [ { title: "Schnellkochtopf", prompt: "Auf 450K erhitzen.", setup: { t: 375, v: 100, mat: 'H2O' }, target: { var: 't', val: 450, tol: 10 }, steps: ["Auf 450K erhitzen"] } ], FREE: [] }
  }
};

// 👩‍🏫 GENERADOR DE CLASES MAGISTRALES SOCRÁTICAS (Si la IA no manda una o si falla el internet)
const getMasterclass = (mode, lang) => {
  const dict = {
    es: { FREE: "La materia cambia de estado (Sólido, Líquido, Gas, Plasma) dependiendo de la energía térmica y la presión. El calor extremo rompe enlaces y convierte el gas en Plasma ionizado.", BOYLE: "LEY DE BOYLE: A Temperatura Constante, Volumen y Presión son inversamente proporcionales (P1·V1 = P2·V2). Menos espacio = Más choques de partículas = Más Presión.", CHARLES: "LEY DE CHARLES: A Presión Constante, Volumen y Temperatura son directamente proporcionales (V1/T1 = V2/T2). El calor acelera las partículas, forzando al volumen a expandirse.", GAY_LUSSAC: "LEY DE GAY-LUSSAC: A Volumen Constante, Presión y Temperatura son directamente proporcionales. Partículas más calientes rebotan más fuerte contra las paredes rígidas." },
    en: { FREE: "Matter states depend on thermal energy and pressure. Extreme heat breaks bonds and ionizes gas into Plasma.", BOYLE: "BOYLE'S LAW: At Constant Temp, Volume and Pressure are inversely proportional. Less space = More particle collisions = More Pressure.", CHARLES: "CHARLES'S LAW: At Constant Pressure, Volume and Temp are directly proportional. Heat accelerates particles, forcing expansion.", GAY_LUSSAC: "GAY-LUSSAC'S LAW: At Constant Volume, Pressure and Temp are directly proportional. Hotter particles bounce harder against rigid walls." },
    fr: { FREE: "L'état de la matière dépend de la température. La chaleur extrême ionise le gaz en Plasma.", BOYLE: "LOI DE BOYLE: À T constante, Volume et Pression sont inversement proportionnels. Moins d'espace = Plus de pression.", CHARLES: "LOI DE CHARLES: À P constante, Volume et T sont proportionnels. La chaleur force l'expansion.", GAY_LUSSAC: "LOI DE GAY-LUSSAC: À V constant, Pression et T sont proportionnels. La chaleur augmente les impacts." },
    de: { FREE: "Der Zustand der Materie hängt von der Wärme ab. Extreme Hitze ionisiert Gas zu Plasma.", BOYLE: "BOYLE-MARIOTTE: Bei konstanter T sind Volumen und Druck umgekehrt proportional. Weniger Platz = Mehr Druck.", CHARLES: "GESETZ VON CHARLES: Bei konstantem P sind Volumen und T direkt proportional. Hitze erzwingt Ausdehnung.", GAY_LUSSAC: "GAY-LUSSAC: Bei konstantem V sind Druck und T proportional. Hitze erhöht die Aufprallkraft." }
  };
  return dict[lang]?.[mode] || dict.es[mode];
};

const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
const getPhase = (t, mat) => { if (t > 8000) return 'plasma'; if (t <= mat.mp) return 'solid'; if (t < mat.bp) return mat.mp === mat.bp ? 'gas' : 'liquid'; return 'gas'; };
const calculatePressure = (t, v, phase) => { if (phase === 'plasma') return (300 * t) / (v / 100); if (phase === 'gas') return (150 * t) / (v / 100); if (phase === 'liquid') return 14.7 + (t * 0.05); return 14.7; };

export const useGameStore = create(
  persist(
    (set, get) => ({
      appState: 'LANG_SELECT', language: 'es', activeGame: null, activeMaterial: 'O2', activeMode: 'FREE',
      temp: 300, volume: 100, pressure: 14.7, phaseID: 'gas', isCritical: false,
      score: 0, interactionCount: 0, activeQuiz: null, quizFeedback: null, exampleSession: null,
      searchTerm: '', filterCategory: 'All', isGeneratingQuiz: false,

      setSearchTerm: (term) => set({ searchTerm: term }),
      setFilterCategory: (cat) => { audioSys.playUI(); set({ filterCategory: cat }); },
      setLanguage: (lang) => { audioSys.playUI(); set({ language: lang, appState: 'GAME_SELECT' }); },
      
      // 🔥 FIX CIRUJANO: Ahora guarda en estado a qué juego entraste (Ej: 'GAS_LAWS' o 'REDOX_LAB')
      startGame: (gameId) => { 
        audioSys.playUI(); 
        set({ appState: 'PLAYING', activeGame: gameId, activeMode: 'FREE', score: 0, interactionCount: 0, exampleSession: null }); 
      },
      
      // 🔥 FIX CIRUJANO: Ahora limpia 'activeGame' para devolverte al menú de forma segura
      resetProgress: () => { 
        set({ appState: 'GAME_SELECT', activeGame: null, temp: 300, volume: 100, pressure: 14.7, activeMode: 'FREE', activeQuiz: null, quizFeedback: null, exampleSession: null, interactionCount: 0, score: 0, searchTerm: '', filterCategory: 'All', isGeneratingQuiz: false }); 
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

      // 🧠 LLAMADA REAL A LA API DE LA IA (LLM)
      triggerExercise: async () => {
        const state = get(); 
        if (state.isGeneratingQuiz) return;
        
        set({ isGeneratingQuiz: true });
        audioSys.playUI();

        const lang = state.language;
        const mode = state.activeMode;
        
        try {
          // 🌐 PETICIÓN A TU BACKEND REAL (FastAPI/OpenAI)
          const payload = { 
            topic: mode, language: lang, p: state.pressure, v: state.volume, t: state.temp, 
            mat: MATERIALS[state.activeMaterial]?.name || state.activeMaterial 
          };
          
          const res = await fetch('http://localhost:8000/api/generate-quiz', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
          });
          
          if (!res.ok) throw new Error("API Fallback");
          
          const aiQuiz = await res.json();
          // Aseguramos de tener una clase magistral aunque la IA no la mande
          const finalClass = aiQuiz.miniClass || getMasterclass(mode, lang);
          const shuffledOptions = [...aiQuiz.options].sort(() => Math.random() - 0.5);
          
          set({ activeQuiz: { ...aiQuiz, options: shuffledOptions, miniClass: finalClass }, quizFeedback: null, isGeneratingQuiz: false });
          audioSys.playQuiz();

        } catch (error) {
          // ⚙️ MOTOR DE RESPALDO (Por si el backend falla, nunca se rompe)
          console.warn("Backend down. Generating procedural quiz...");
          const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
          const v1 = rand(50, 100); const p1 = rand(10, 50); const t1 = rand(200, 500);
          let qTitle, qText, correctAns, dist1, dist2, dist3, explanation;

          if (mode === 'BOYLE' || mode === 'FREE') {
             const v2 = rand(10, 40); const p2 = ((p1 * v1) / v2).toFixed(1);
             qTitle = "AI SENSOR";
             qText = lang === 'es' ? `Si P1=${p1} PSI a V1=${v1}%. ¿Cuál es P2 si comprimes a V2=${v2}%?` : `If P1=${p1} PSI and V1=${v1}%. What is P2 if V2=${v2}%?`;
             correctAns = `${p2} PSI`; dist1 = `${(p2/2).toFixed(1)} PSI`; dist2 = `${(p1).toFixed(1)} PSI`; dist3 = `${(p2*1.5).toFixed(1)} PSI`;
             explanation = `P1·V1 = P2·V2. (${p1} * ${v1}) / ${v2} = ${p2}.`;
          } else if (mode === 'CHARLES') {
             const t2 = t1 + rand(100, 300); const v2 = ((v1 * t2) / t1).toFixed(1);
             qTitle = "AI SENSOR";
             qText = lang === 'es' ? `Gas a ${t1}K y V1=${v1}%. Si calientas a ${t2}K, ¿cuál es V2?` : `Gas at ${t1}K and V1=${v1}%. If heated to ${t2}K, what is V2?`;
             correctAns = `${v2}%`; dist1 = `${(v1/2).toFixed(1)}%`; dist2 = `${v1}%`; dist3 = `${(v2*2).toFixed(1)}%`;
             explanation = `V1/T1 = V2/T2. (${v1} * ${t2}) / ${t1} = ${v2}.`;
          } else {
             const t2 = t1 + rand(100, 300); const p2 = ((p1 * t2) / t1).toFixed(1);
             qTitle = "AI SENSOR";
             qText = lang === 'es' ? `Presión ${p1} PSI a ${t1}K. Si calientas a ${t2}K, ¿cuál es P2?` : `Pressure ${p1} PSI at ${t1}K. If heated to ${t2}K, what is P2?`;
             correctAns = `${p2} PSI`; dist1 = `${(p1/2).toFixed(1)} PSI`; dist2 = `${(p2*2).toFixed(1)} PSI`; dist3 = `${p1} PSI`;
             explanation = `P1/T1 = P2/T2. (${p1} * ${t2}) / ${t1} = ${p2}.`;
          }

          const fallbackQuiz = {
            title: qTitle, question: qText, miniClass: getMasterclass(mode, lang),
            options: [
              { text: correctAns, correct: true, explanation: explanation },
              { text: dist1, correct: false, explanation: "Error." },
              { text: dist2, correct: false, explanation: "Error." },
              { text: dist3, correct: false, explanation: "Error." }
            ]
          };

          setTimeout(() => {
            const shuffledOptions = [...fallbackQuiz.options].sort(() => Math.random() - 0.5);
            set({ activeQuiz: { ...fallbackQuiz, options: shuffledOptions }, quizFeedback: null, isGeneratingQuiz: false });
            audioSys.playQuiz();
          }, 800);
        }
      },

      updatePhysics: (action, amount) => {
        if(get().activeQuiz || get().isGeneratingQuiz) return;
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

        const mat = MATERIALS[state.activeMaterial] || MATERIALS['H2O']; 
        const newPhase = getPhase(t, mat);
        
        let exSession = state.exampleSession;
        if (exSession && !exSession.completed) {
           const tgt = exSession.target; let currentVal = tgt.var === 'v' ? v : (tgt.var === 't' ? t : p);
           if (Math.abs(currentVal - tgt.val) <= tgt.tol) { exSession = { ...exSession, completed: true }; audioSys.playSuccess(); set((s) => ({ score: s.score + 200 })); }
        }

        let newCount = state.interactionCount + 1;
        set({ temp: t, volume: v, pressure: p, phaseID: newPhase, isCritical: p >= 1500, exampleSession: exSession, interactionCount: newCount });

        // 🧠 IA A LOS 6 CLICS (INTACTO)
        if (newCount % 6 === 0 && !exSession) {
           get().triggerExercise();
        }
      },

      answerQuizQuestion: (opt) => {
        if (opt.correct) { 
          audioSys.playSuccess(); 
          set((state) => ({ score: state.score + 100, quizFeedback: { type: 'success', text: opt.explanation } })); 
        } else { 
          audioSys.playError(); 
          // Ocultamos las opciones mostrando el error y la clase magistral
          set((state) => ({ score: Math.max(0, state.score - 50), quizFeedback: { type: 'error', text: opt.explanation } })); 
        }
      },

      clearFeedback: () => { audioSys.playUI(); set({ quizFeedback: null }); },
      closeQuiz: () => { audioSys.playUI(); set({ activeQuiz: null, quizFeedback: null }); }
    }), 
    // Mantenemos el nombre de persistencia para limpiar cualquier viejo caché corrompido
    { name: 'll-omega-master-limpio-v2' }
  )
);
