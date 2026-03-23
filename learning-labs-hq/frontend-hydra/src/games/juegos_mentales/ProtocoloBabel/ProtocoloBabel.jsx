import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { create } from 'zustand';
import { useGameStore } from '../../../store/useGameStore'; 

/* ============================================================
   🌌 KERNEL CONFIG: RED TEAMING AI (DEEPSEEK)
============================================================ */
const DEEPSEEK_API_KEY = "sk-9c7336f2ef7e4630b2bcef83a6994c57";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (GLOBAL SCALABILITY)
============================================================ */
const BASE_LEXICON = {
  es: {
    title: "PROTOCOLO BABEL", subtitle: "Hiper-Procesamiento Semántico",
    level: "NIVEL", score: "PUNTOS", streak: "RACHA",
    topicReq: "SELECCIONA UN VECTOR DE DATOS:",
    topics: { physics: "Física Cuántica", neuro: "Neurociencia", cyber: "Ciberseguridad", history: "Historia Militar" },
    start: "INICIAR TRANSFERENCIA", wpmLabel: "WPM OBJETIVO",
    synthesizing: "SINTETIZANDO ENSAYO", analyzing: "Inyectando paradojas lógicas...",
    interruptBtn: "INTERRUMPIR (ANOMALÍA DETECTADA)",
    resultHit: "AMENAZA NEUTRALIZADA", resultFalsePos: "FALSO POSITIVO", resultMiss: "ANOMALÍA OMITIDA",
    aiAnalysis: "Análisis Forense:", next: "SIGUIENTE VECTOR",
    sysMsg: "La IA proyectará texto a alta velocidad. Ocultará UNA falacia lógica o contradicción. Presiona INTERRUMPIR apenas la detectes.",
    modeORP: "O.R.P.", modeBionic: "BIONIC", modeChunk: "BLOQUE"
  },
  en: {
    title: "BABEL PROTOCOL", subtitle: "Semantic Hyper-Processing",
    level: "LEVEL", score: "SCORE", streak: "STREAK",
    topicReq: "SELECT A DATA VECTOR:",
    topics: { physics: "Quantum Physics", neuro: "Neuroscience", cyber: "Cybersecurity", history: "Military History" },
    start: "INITIATE TRANSFER", wpmLabel: "TARGET WPM",
    synthesizing: "SYNTHESIZING ESSAY", analyzing: "Injecting logical paradoxes...",
    interruptBtn: "INTERRUPT (ANOMALY DETECTED)",
    resultHit: "THREAT NEUTRALIZED", resultFalsePos: "FALSE POSITIVE", resultMiss: "ANOMALY MISSED",
    aiAnalysis: "Forensic Analysis:", next: "NEXT VECTOR",
    sysMsg: "The AI will project text at high speed. It will hide ONE logical fallacy or contradiction. Press INTERRUPT the exact moment you detect it.",
    modeORP: "O.R.P.", modeBionic: "BIONIC", modeChunk: "CHUNK"
  },
  fr: {
    title: "PROTOCOLE BABEL", subtitle: "Hyper-Traitement Sémantique",
    level: "NIVEAU", score: "SCORE", streak: "SÉRIE",
    topicReq: "SÉLECTIONNEZ UN VECTEUR:",
    topics: { physics: "Physique Quantique", neuro: "Neurosciences", cyber: "Cybersécurité", history: "Histoire Militaire" },
    start: "LANCER LE TRANSFERT", wpmLabel: "MPM CIBLE",
    synthesizing: "SYNTHÈSE DE L'ESSAI", analyzing: "Injection de paradoxes logiques...",
    interruptBtn: "INTERROMPRE (ANOMALIE DÉTECTÉE)",
    resultHit: "MENACE NEUTRALISÉE", resultFalsePos: "FAUX POSITIF", resultMiss: "ANOMALIE MANQUÉE",
    aiAnalysis: "Analyse Légale:", next: "VECTEUR SUIVANT",
    sysMsg: "L'IA projettera du texte à grande vitesse. Elle cachera UNE erreur logique. Appuyez sur INTERROMPRE dès que vous la détectez.",
    modeORP: "O.R.P.", modeBionic: "BIONIQUE", modeChunk: "BLOC"
  },
  de: {
    title: "BABEL-PROTOKOLL", subtitle: "Semantische Hyperverarbeitung",
    level: "LEVEL", score: "PUNKTE", streak: "SERIE",
    topicReq: "DATENVECTOR AUSWÄHLEN:",
    topics: { physics: "Quantenphysik", neuro: "Neurowissenschaften", cyber: "Cybersicherheit", history: "Militärgeschichte" },
    start: "ÜBERTRAGUNG STARTEN", wpmLabel: "ZIEL-WPM",
    synthesizing: "ESSAY WIRD SYNTHETISIERT", analyzing: "Logische Paradoxien einfügen...",
    interruptBtn: "UNTERBRECHEN (ANOMALIE ERKANNT)",
    resultHit: "BEDROHUNG NEUTRALISIERT", resultFalsePos: "FALSCH POSITIV", resultMiss: "ANOMALIE VERPASST",
    aiAnalysis: "Forensische Analyse:", next: "NÄCHSTER VEKTOR",
    sysMsg: "Die KI projiziert Text in hoher Geschwindigkeit mit EINER versteckten logischen Täuschung. Drücken Sie sofort UNTERBRECHEN, wenn Sie sie erkennen.",
    modeORP: "O.R.P.", modeBionic: "BIONISCH", modeChunk: "BLOCK"
  },
  it: {
    title: "PROTOCOLLO BABEL", subtitle: "Iper-Elaborazione Semantica",
    level: "LIVELLO", score: "PUNTI", streak: "SERIE",
    topicReq: "SELEZIONA UN VETTORE:",
    topics: { physics: "Fisica Quantistica", neuro: "Neuroscienze", cyber: "Sicurezza Informatica", history: "Storia Militare" },
    start: "AVVIA TRASFERIMENTO", wpmLabel: "PPM OBIETTIVO",
    synthesizing: "SINTESI SAGGIO", analyzing: "Iniezione di paradossi logici...",
    interruptBtn: "INTERROMPI (ANOMALIA RILEVATA)",
    resultHit: "MINACCIA NEUTRALIZZATA", resultFalsePos: "FALSO POSITIVO", resultMiss: "ANOMALIA MANCATA",
    aiAnalysis: "Analisi Forense:", next: "VETTORE SUCCESSIVO",
    sysMsg: "L'IA proietterà testo ad alta velocità. Nasconderà UNA fallacia logica. Premi INTERROMPI non appena la rilevi.",
    modeORP: "O.R.P.", modeBionic: "BIONICA", modeChunk: "BLOCCO"
  },
  pt: {
    title: "PROTOCOLO BABEL", subtitle: "Hiperprocessamento Semântico",
    level: "NÍVEL", score: "PONTOS", streak: "SÉRIE",
    topicReq: "SELECIONE UM VETOR DE DADOS:",
    topics: { physics: "Física Quântica", neuro: "Neurociência", cyber: "Cibersegurança", history: "História Militar" },
    start: "INICIAR TRANSFERÊNCIA", wpmLabel: "PPM ALVO",
    synthesizing: "SINTETIZANDO ENSAIO", analyzing: "Injetando paradoxos lógicos...",
    interruptBtn: "INTERROMPER (ANOMALIA DETECTADA)",
    resultHit: "AMEAÇA NEUTRALIZADA", resultFalsePos: "FALSO POSITIVO", resultMiss: "ANOMALIA OMITIDA",
    aiAnalysis: "Análise Forense:", next: "PRÓXIMO VETOR",
    sysMsg: "A IA projetará texto em alta velocidade. Ocultará UMA falácia lógica. Pressione INTERROMPER assim que detectá-la.",
    modeORP: "O.R.P.", modeBionic: "BIÔNICA", modeChunk: "BLOCO"
  }
};
const getLexicon = (lang) => BASE_LEXICON[lang] || BASE_LEXICON.en;

/* ============================================================
   🎙️ MOTOR DE VOZ IA (TTS UNIVERSAL)
============================================================ */
class VoiceEngine {
  constructor() { 
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null; 
      this.langs = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', pt: 'pt-BR' }; 
  }
  speak(text, langCode = 'es') {
    if (!this.synth) return;
    this.synth.cancel(); 
    const utterThis = new SpeechSynthesisUtterance(text);
    utterThis.lang = this.langs[langCode] || 'es-ES';
    utterThis.rate = 1.05; utterThis.pitch = 0.9;
    this.synth.speak(utterThis);
  }
  stop() { if (this.synth) this.synth.cancel(); }
}
const TTS = new VoiceEngine();

/* ============================================================
   🧠 LINGUISTIC ENGINE (O.R.P., TIMING & FUZZY MATCHING)
============================================================ */
const LanguageEngine = {
  tokenize: (text) => text.replace(/\n+/g, ' \n ').replace(/\s{2,}/g, ' ').split(' ').filter(w => w.trim().length > 0),
  getORP: (word) => {
    const len = word.length;
    if (len === 1) return 0;
    if (len >= 2 && len <= 5) return 1;
    if (len >= 6 && len <= 9) return 2;
    if (len >= 10 && len <= 13) return 3;
    return Math.floor(len / 3); 
  },
  getDelayMultiplier: (word) => {
    const lastChar = word.slice(-1);
    if (/[.?!]/.test(lastChar)) return 2.5; 
    if (/[,;:]/.test(lastChar)) return 1.5;
    if (word.length > 12) return 1.3; 
    return 1.0;
  },
  toBionic: (word) => {
    if(word === '\n') return word;
    const cleanWord = word.trim();
    if(cleanWord.length <= 1) return `<b style="font-weight: 900; color: #fff;">${cleanWord}</b>`;
    const pivot = Math.ceil(cleanWord.length / 2);
    return `<b style="font-weight: 900; color: #fff;">${cleanWord.slice(0, pivot)}</b><span style="color: #94a3b8; font-weight: normal;">${cleanWord.slice(pivot)}</span>`;
  },
  getSmartChunk: (tokens, startIndex, requestedSize) => {
    let chunk = [];
    let endIndex = startIndex;
    let actualSize = 0;
    for (let i = 0; i < requestedSize; i++) {
        if (endIndex >= tokens.length) break;
        const word = tokens[endIndex];
        chunk.push(word);
        endIndex++;
        actualSize++;
        if (/[.!?\n]/.test(word)) break;
        if (actualSize >= Math.max(1, requestedSize - 2) && /[,;:]/.test(word)) break;
    }
    return { text: chunk.join(' '), nextIndex: endIndex, words: chunk };
  },
  // 🚀 GOD TIER FEATURE: Fuzzy Token Matcher. Asegura que no colapse por errores de puntuación de la IA.
  fuzzyFindAnomaly: (rawTokens, anomalyTokens) => {
    const cleanWord = (w) => w.toLowerCase().replace(/[.,!?;:()]/g, '');
    const cleanAnomaly = anomalyTokens.map(cleanWord);
    const cleanRaw = rawTokens.map(cleanWord);
    
    let bestMatchIndex = -1;
    let maxMatches = 0;

    for (let i = 0; i <= cleanRaw.length - cleanAnomaly.length; i++) {
        let matches = 0;
        for (let j = 0; j < cleanAnomaly.length; j++) {
            if (cleanRaw[i+j] === cleanAnomaly[j]) matches++;
        }
        if (matches > maxMatches) {
            maxMatches = matches;
            bestMatchIndex = i;
        }
    }
    return bestMatchIndex !== -1 ? bestMatchIndex : Math.floor(rawTokens.length / 2);
  }
};

/* ============================================================
   🧠 ZUSTAND STORE: ESTADO DEL SIMULADOR
============================================================ */
const useBabelStore = create((set, get) => ({
  level: 1,
  score: 0,
  streak: 0,
  gameState: 'SETUP', // SETUP, SYNTHESIZING, PREPARING, READING, FEEDBACK
  wpm: 500,
  readMode: 'ORP',
  chunkSize: 3,
  currentTopic: 'physics',
  documentData: null, // { fullText, anomalyPhrase, explanation, startIndex, endIndex }
  tokens: [],
  feedbackState: null, // 'HIT', 'FALSE_POSITIVE', 'MISSED'

  setSetup: (updates) => set((state) => ({ ...state, ...updates })),
  setGameState: (state) => set({ gameState: state }),
  
  loadDocument: (doc, tokens, anomalyBounds) => set({ 
    documentData: { ...doc, ...anomalyBounds }, 
    tokens, 
    gameState: 'PREPARING' 
  }),

  registerInterrupt: (currentIndex) => set((state) => {
    const { startIndex, endIndex } = state.documentData;
    
    // VENTANA COGNITIVA: El cerebro humano tarda ~400ms en reaccionar. 
    // Damos una ventana permisiva (desde 2 palabras antes hasta 12 después).
    const isValidHit = currentIndex >= (Math.max(0, startIndex - 2)) && currentIndex <= (endIndex + 12);
    const feedbackState = isValidHit ? 'HIT' : 'FALSE_POSITIVE';
    
    let newScore = state.score;
    let newStreak = state.streak;
    let newLevel = state.level;

    if (isValidHit) {
      newScore += (state.wpm * state.level); // Más WPM = Más puntos
      newStreak += 1;
      if (newStreak % 3 === 0) newLevel++;
    } else {
      newStreak = 0;
    }

    return { 
      feedbackState, score: newScore, streak: newStreak, level: newLevel, gameState: 'FEEDBACK' 
    };
  }),

  registerMiss: () => set({ feedbackState: 'MISSED', streak: 0, gameState: 'FEEDBACK' }),
  nextRound: () => set({ gameState: 'SYNTHESIZING', feedbackState: null })
}));

/* ============================================================
   🤖 KERNEL AI: GENERADOR DE PARADOJAS (RED TEAMING)
============================================================ */
const generateBabelDocument = async (level, topic, langCode) => {
  const sysPrompt = `
    Eres 'Babel', un motor de Red Teaming Cognitivo. Genera un texto técnico avanzado sobre el tema: "${topic}".
    Idioma: ${langCode}.
    Longitud: Entre 120 y 160 palabras.
    Dificultad técnica: Nivel ${level}/10 (Usa jerga técnica real y convincente).
    
    MECÁNICA CLAVE: Debes inyectar EXACTAMENTE UNA (1) falacia lógica, una contradicción científica grave o un anacronismo evidente, pero sutilmente camuflado en medio del texto. El resto del texto debe ser 100% verídico y coherente.
    
    RESPONDE ÚNICAMENTE CON UN JSON VÁLIDO CON ESTA ESTRUCTURA EXACTA (SIN MARKDOWN O ETIQUETAS):
    {
      "fullText": "El texto completo generado aquí...",
      "anomalyPhrase": "La frase exacta que contiene la contradicción (debe ser una subcadena exacta, entre 5 y 15 palabras).",
      "explanation": "Breve explicación de por qué esa frase es una paradoja o un error factual."
    }
  `;

  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.8 })
    });
    const data = await res.json();
    const rawText = data.choices[0].message.content;
    
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON no encontrado");
    return JSON.parse(jsonMatch[0]);

  } catch (error) {
    console.error("Babel Engine Fallback activado:", error);
    // OFFLINE FALLBACK SEGURO
    return {
      fullText: "La computación cuántica promete revolucionar el procesamiento de información utilizando qubits. A diferencia de los bits clásicos que operan en estados de 0 o 1, los qubits aprovechan el principio de superposición. Esto les permite explorar múltiples vías de cálculo simultáneamente. Para mantener la coherencia cuántica, los procesadores deben enfriarse a temperaturas cercanas al cero absoluto. Sin embargo, los nuevos diseños han demostrado que el entrelazamiento cuántico funciona mejor si el procesador se sumerge en agua hirviendo a nivel del mar. Los algoritmos se benefician de esta reducción de ruido térmico, permitiendo la factorización en tiempo polinómico.",
      anomalyPhrase: "funciona mejor si el procesador se sumerge en agua hirviendo",
      explanation: "El calor extremo destruye la coherencia cuántica (decoherencia). Los procesadores cuánticos requieren temperaturas criogénicas (cero absoluto), no agua hirviendo."
    };
  }
};

/* ============================================================
   🎮 MAIN INTERFACE: PROTOCOLO BABEL (UNIT 8200 TIER)
============================================================ */
export default function ProtocoloBabel() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = BASE_LEXICON[language] ? language : 'es';
  const UI = getLexicon(safeLang);

  const { 
    level, score, streak, gameState, wpm, readMode, chunkSize, currentTopic, documentData, tokens, feedbackState,
    setSetup, setGameState, loadDocument, registerInterrupt, registerMiss, nextRound 
  } = useBabelStore();

  const [countdown, setCountdown] = useState(3);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const wpmRef = useRef(wpm);
  const indexRef = useRef(0);
  const requestRef = useRef(null);
  const delayAccumulator = useRef(0);
  const lastFrameTime = useRef(0);

  useEffect(() => { wpmRef.current = wpm; }, [wpm]);

  // 🤖 FLUJO DE GENERACIÓN Y SLIDING WINDOW (FUZZY MATCH)
  const startMission = useCallback(async () => {
    setGameState('SYNTHESIZING');
    const doc = await generateBabelDocument(level, UI.topics[currentTopic], safeLang);
    
    const rawTokens = LanguageEngine.tokenize(doc.fullText);
    const anomalyTokens = LanguageEngine.tokenize(doc.anomalyPhrase);
    
    // 🚀 GOD TIER: Fuzzy Matching para evitar crasheos si el LLM falla en puntuación
    const startIndex = LanguageEngine.fuzzyFindAnomaly(rawTokens, anomalyTokens);
    const endIndex = startIndex + anomalyTokens.length - 1;

    loadDocument(doc, rawTokens, { startIndex, endIndex });
  }, [level, currentTopic, safeLang, setGameState, loadDocument, UI.topics]);

  // ⏱️ COUNTDOWN
  useEffect(() => {
    if (gameState === 'PREPARING') {
      setCurrentIndex(0);
      indexRef.current = 0;
      setCountdown(3);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState('READING');
            lastFrameTime.current = performance.now();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, setGameState]);

  // 👁️ RSVP ENGINE (MÚLTIPLES MODOS DE LECTURA BAJO ESTRÉS)
  const rsvpLoop = useCallback((time) => {
    if (useBabelStore.getState().gameState !== 'READING') return;

    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;
    delayAccumulator.current += deltaTime;

    if (indexRef.current >= tokens.length - 1) {
      registerMiss();
      return;
    }

    let wordsAdvance = 1;
    let multiplier = 1.0;

    if (readMode === 'CHUNK') {
        const chunkData = LanguageEngine.getSmartChunk(tokens, indexRef.current, chunkSize);
        wordsAdvance = chunkData.nextIndex - indexRef.current;
        multiplier = LanguageEngine.getDelayMultiplier(tokens[chunkData.nextIndex - 1] || '');
    } else {
        multiplier = LanguageEngine.getDelayMultiplier(tokens[indexRef.current]);
    }

    const baseDelay = ((60 / wpmRef.current) * 1000) * wordsAdvance * multiplier;

    if (delayAccumulator.current >= baseDelay) {
      delayAccumulator.current = 0;
      indexRef.current = Math.min(indexRef.current + wordsAdvance, tokens.length - 1);
      setCurrentIndex(indexRef.current);
    }
    requestRef.current = requestAnimationFrame(rsvpLoop);
  }, [tokens, readMode, chunkSize, registerMiss]);

  useEffect(() => {
    if (gameState === 'READING') {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(rsvpLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState, rsvpLoop]);

  // ⚡ ACCIÓN: INTERRUPCIÓN TÁCTICA
  const handleInterrupt = useCallback(() => {
    if (gameState !== 'READING') return;
    registerInterrupt(currentIndex);
  }, [gameState, currentIndex, registerInterrupt]);

  // 🗣️ AUDIO-FEEDBACK AUTOMÁTICO
  useEffect(() => {
    if (gameState === 'FEEDBACK' && documentData) {
       TTS.speak((feedbackState === 'HIT' ? 'Correcto. ' : 'Fallo. ') + documentData.explanation, safeLang);
    }
  }, [gameState, feedbackState, documentData, safeLang]);

  // ⌨️ KEYBINDS
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && gameState === 'READING') {
        e.preventDefault();
        handleInterrupt();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInterrupt, gameState]);

  /* ============================================================
     🎨 RENDERIZADORES HOLOGRÁFICOS
  ============================================================ */
  const renderReadingContent = () => {
    if (tokens.length === 0 || currentIndex >= tokens.length) return null;

    if (readMode === 'ORP') {
      const word = tokens[currentIndex];
      const cleanWord = word.trim();
      const orpIndex = LanguageEngine.getORP(cleanWord);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
          <span style={{ color: '#64748b', textAlign: 'right', whiteSpace: 'pre', overflow: 'hidden' }}>{cleanWord.substring(0, orpIndex)}</span>
          <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.2em', textShadow: '0 0 25px rgba(0,242,255,0.7)' }}>{cleanWord.charAt(orpIndex)}</span>
          <span style={{ color: '#64748b', textAlign: 'left', whiteSpace: 'pre', overflow: 'hidden' }}>{cleanWord.substring(orpIndex + 1)}</span>
        </div>
      );
    } 
    
    if (readMode === 'BIONIC') {
      const word = tokens[currentIndex];
      return <span dangerouslySetInnerHTML={{ __html: LanguageEngine.toBionic(word) }} style={{ color: '#e2e8f0', letterSpacing: '1px' }} />;
    }

    if (readMode === 'CHUNK') {
      const chunkData = LanguageEngine.getSmartChunk(tokens, currentIndex, chunkSize);
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', lineHeight: '1.3' }}>
              {chunkData.words.map((w, i) => ( <span key={i} style={{ color: '#e2e8f0' }}>{w}</span> ))}
          </div>
      );
    }
  };

  const renderFeedbackText = () => {
    if (!documentData) return null;
    const { fullText, startIndex, endIndex } = documentData;
    const words = LanguageEngine.tokenize(fullText);

    return (
      <p style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 3vw, 1.2rem)', lineHeight: '1.8', textAlign: 'justify', padding: '20px', background: 'rgba(0,0,0,0.4)', borderRadius: '12px' }}>
        {words.map((w, i) => {
          const isAnomaly = i >= startIndex && i <= endIndex;
          const isPlayerStop = i === currentIndex; 

          return (
            <span key={i}>
              <span style={{ 
                color: isAnomaly ? '#ff0055' : 'inherit', 
                background: isAnomaly ? 'rgba(255,0,85,0.2)' : 'transparent',
                borderBottom: isPlayerStop ? '3px solid #00f2ff' : 'none',
                fontWeight: isAnomaly ? 'bold' : 'normal',
                padding: '2px', borderRadius: '4px'
              }}>
                {w}
              </span>{' '}
            </span>
          );
        })}
      </p>
    );
  };

  /* ============================================================
     DOM MOUNT
  ============================================================ */
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Orbitron', system-ui, sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.05); }
        .cyber-button { background: #00f2ff; color: #000; font-weight: 800; border: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;}
        .cyber-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,242,255,0.4); }
        .cyber-button:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; }
        
        .mode-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid #334155; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold;}
        .mode-btn.active { background: rgba(0,242,255,0.2); color: #00f2ff; border-color: #00f2ff; }
        
        .glitch-anim { animation: glitch 0.2s cubic-bezier(.25, .46, .45, .94) both infinite; }
        @keyframes glitch { 0% { transform: translate(0) } 20% { transform: translate(-2px, 2px) } 40% { transform: translate(-2px, -2px) } 60% { transform: translate(2px, 2px) } 80% { transform: translate(2px, -2px) } 100% { transform: translate(0) } }
        
        .countdown-anim { animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        
        .tension-bar { height: 4px; background: #ff0055; transition: width 0.1s linear; box-shadow: 0 0 10px #ff0055; }
      `}</style>
      
      {/* 🚀 HEADER GLOBAL */}
      <div className="glass-panel" style={{ padding: 'clamp(15px, 3vh, 25px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,242,255,0.2)', zIndex: 10, paddingTop: 'env(safe-area-inset-top)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', color: '#00f2ff', fontWeight: '900', letterSpacing: '2px' }}>
            <i className="fas fa-bolt me-2"></i>BABEL OS
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '5px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <span>{UI.level}: <strong style={{color:'#fff'}}>{level}</strong></span>
            <span>{UI.streak}: <strong style={{color:'#ffea00'}}>{streak}</strong></span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '900', color: '#fff', textShadow: '0 0 15px rgba(255,255,255,0.5)' }}>{score}</div>
          <div style={{ color: '#ff0055', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Pts</div>
        </div>
      </div>

      {/* 🚀 FASE 0: SETUP (SELECCIÓN Y CONFIGURACIÓN) */}
      {gameState === 'SETUP' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', borderRadius: '16px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
             <h2 style={{ color: '#00f2ff', marginBottom: '10px', letterSpacing: '2px' }}>{UI.subtitle}</h2>
             <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '30px' }}>{UI.sysMsg}</p>
             
             {/* TEMAS */}
             <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>{UI.topicReq}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '10px' }}>
                   {Object.entries(UI.topics).map(([key, label]) => (
                     <button key={key} className={`mode-btn ${currentTopic === key ? 'active' : ''}`} onClick={() => setSetup({ currentTopic: key })}>
                       {label}
                     </button>
                   ))}
                </div>
             </div>

             {/* MODO DE LECTURA (APEX ADDITION) */}
             <div style={{ marginBottom: '20px', display: 'flex', gap: '5px', justifyContent: 'center' }}>
                <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} style={{flex:1}} onClick={() => setSetup({ readMode: 'ORP' })}>{UI.modeORP}</button>
                <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} style={{flex:1}} onClick={() => setSetup({ readMode: 'BIONIC' })}>{UI.modeBionic}</button>
                <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} style={{flex:1}} onClick={() => setSetup({ readMode: 'CHUNK' })}>{UI.modeChunk}</button>
             </div>

             {/* VELOCIDAD WPM */}
             <div style={{ marginBottom: '40px', textAlign: 'left' }}>
                <label style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{UI.wpmLabel}</span>
                  <span style={{color: '#fff', fontSize: '1.2rem'}}>{wpm} WPM</span>
                </label>
                <input type="range" min="300" max="1500" step="50" value={wpm} onChange={(e) => setSetup({ wpm: Number(e.target.value) })} style={{ width: '100%', accentColor: '#00f2ff', height: '6px', marginTop: '15px' }} />
             </div>

             <button onClick={startMission} className="cyber-button" style={{ width: '100%', padding: '20px', fontSize: '1.2rem', borderRadius: '12px' }}>
                {UI.start} <i className="fas fa-space-shuttle ms-2"></i>
             </button>
          </div>
        </div>
      )}

      {/* 🚀 FASE 1: SYNTHESIZING (GLITCH EFFECT) */}
      {gameState === 'SYNTHESIZING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div className="glitch-anim" style={{ textAlign: 'center', color: '#00f2ff' }}>
            <i className="fas fa-network-wired fa-4x mb-4"></i>
            <h2 style={{ letterSpacing: 'clamp(2px, 4vw, 5px)', fontWeight: '900', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)' }}>{UI.synthesizing}</h2>
            <p style={{ color: '#94a3b8', fontSize: 'clamp(0.9rem, 3vw, 1.2rem)' }}>{UI.analyzing}</p>
          </div>
        </div>
      )}

      {/* 🚀 FASE 2: PREPARANDO LECTURA (COUNTDOWN) */}
      {gameState === 'PREPARING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           <div className="countdown-anim" style={{ fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: '900', color: '#00f2ff', textShadow: '0 0 50px rgba(0,242,255,0.8)' }}>
             {countdown}
           </div>
        </div>
      )}

      {/* 🚀 FASE 3: LECTURA DE COMBATE (RSVP ACTIVO) */}
      {gameState === 'READING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* BARRA DE TENSIÓN (PROGRESS BAR) */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,0,85,0.1)' }}>
             <div className="tension-bar" style={{ width: `${(currentIndex / tokens.length) * 100}%` }}></div>
          </div>

          <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span><i className="fas fa-book-open me-2"></i>{UI.topics[currentTopic]}</span>
            <span style={{ color: '#00f2ff', fontFamily: 'monospace', fontWeight: 'bold' }}>{currentIndex} / {tokens.length}</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {readMode === 'ORP' && (
               <>
                 <div style={{ position: 'absolute', top: '50%', left: '5vw', right: '5vw', height: '1px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>
                 <div style={{ position: 'absolute', top: '30%', bottom: '30%', left: '50%', width: '1px', background: 'rgba(0,242,255,0.05)', pointerEvents: 'none' }}></div>
               </>
            )}
            
            <div style={{ fontSize: readMode === 'CHUNK' ? 'clamp(30px, 5vw, 60px)' : 'clamp(40px, 8vw, 120px)', fontFamily: "'Lora', 'Georgia', serif", width: '100%', maxWidth: '1400px', padding: '0 15px', textAlign: 'center' }}>
              {renderReadingContent()}
            </div>
          </div>

          {/* BOTÓN MASIVO DE INTERRUPCIÓN (THUMB ZONE - MOBILE FIRST) */}
          <div style={{ padding: '20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', zIndex: 10 }}>
            <button 
              onClick={(e) => { e.preventDefault(); handleInterrupt(); }}
              style={{ 
                width: '100%', height: 'clamp(100px, 20vh, 150px)', background: 'rgba(255,0,85,0.1)', 
                border: '2px solid #ff0055', color: '#ff0055', borderRadius: '16px', fontSize: 'clamp(1.2rem, 5vw, 2rem)', 
                fontWeight: '900', cursor: 'pointer', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent',
                boxShadow: '0 0 30px rgba(255,0,85,0.3)', textTransform: 'uppercase', letterSpacing: '2px'
              }}
              onPointerDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onPointerUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <i className="fas fa-hand-paper me-3"></i> {UI.interruptBtn}
            </button>
          </div>
        </div>
      )}

      {/* 🚀 FASE 4: FEEDBACK POST-MORTEM (ANÁLISIS FORENSE) */}
      {gameState === 'FEEDBACK' && documentData && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(20px, 5vh, 40px) clamp(15px, 5vw, 40px)', maxWidth: '1000px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          
          <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', borderRadius: '16px', borderTop: `4px solid ${feedbackState === 'HIT' ? '#0f0' : '#ff0055'}` }}>
             
             <h2 style={{ color: feedbackState === 'HIT' ? '#0f0' : '#ff0055', margin: '0 0 20px 0', fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', textAlign: 'center', textShadow: `0 0 20px ${feedbackState === 'HIT' ? '#0f0' : '#ff0055'}` }}>
                {feedbackState === 'HIT' && <><i className="fas fa-check-circle me-3"></i>{UI.resultHit}</>}
                {feedbackState === 'FALSE_POSITIVE' && <><i className="fas fa-times-circle me-3"></i>{UI.resultFalsePos}</>}
                {feedbackState === 'MISSED' && <><i className="fas fa-eye-slash me-3"></i>{UI.resultMiss}</>}
             </h2>

             {renderFeedbackText()}

             <div style={{ marginTop: '30px', background: 'rgba(0,242,255,0.05)', border: '1px solid rgba(0,242,255,0.2)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ color: '#00f2ff', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px' }}><i className="fas fa-robot me-2"></i>{UI.aiAnalysis}</h4>
                <p style={{ color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>{documentData.explanation}</p>
             </div>

             <div style={{ display: 'flex', gap: '20px', marginTop: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { TTS.stop(); setGameState('SETUP'); }} className="mode-btn" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                  <i className="fas fa-cog me-2"></i> AJUSTAR WPM
                </button>
                <button onClick={() => { TTS.stop(); nextRound(); }} className="cyber-button" style={{ padding: '15px 40px', borderRadius: '8px', fontSize: '1.2rem' }}>
                  {UI.next} <i className="fas fa-arrow-right ms-2"></i>
                </button>
             </div>

          </div>
        </div>
      )}

    </div>
  );
}
