import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useGameStore } from '../../store/useGameStore';

// ⚙️ CONFIGURACIÓN DEL WORKER NATIVO (ZERO LATENCY)
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

/* ============================================================
   🌌 KERNEL CONFIG: NEURAL LINK & AI ROUTING
============================================================ */
const DEEPSEEK_API_KEY = "sk-2a7f2964d1e34ebe90f176a986367360";
const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

/* ============================================================
   💽 SISTEMA DE PERSISTENCIA (INDEXED DB WRAPPER - O(1))
============================================================ */
const DB_NAME = "QuantumReaderDB";
const STORE_NAME = "Library";

const StorageEngine = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 2);
      request.onerror = () => reject("Database Error");
      request.onsuccess = (e) => resolve(e.target.result);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  },
  async saveBook(book) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(book);
      req.onsuccess = () => resolve(book.id);
      req.onerror = () => reject("Save Failed");
    });
  },
  async getBooks() {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject("Load Failed");
    });
  },
  async deleteBook(id) {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject("Delete Failed");
    });
  }
};

/* ============================================================
   🌍 I18N: MULTILANGUAGE LEXICON (GLOBAL SCALABILITY)
============================================================ */
const LEXICON = {
  es: {
    title: "SISTEMA OPERATIVO DE LECTURA", upload: "NUEVO DOCUMENTO (PDF/TXT)", paste: "O PEGA TEXTO AQUÍ...",
    start: "PREPARAR INMERSIÓN", speed: "VELOCIDAD:", wpm: "WPM", pause: "PAUSA COGNITIVA",
    parsing: "Decodificando matrices...", empty: "Memoria vacía. Carga un documento.",
    back: "VOLVER", aiClassBtn: "TUTOR IA", aiTitle: "ANÁLISIS SOCRÁTICO",
    ask: "CONSULTAR IA", closing: "REANUDAR LECTURA", loadingAi: "Sintetizando respuesta...",
    statsTitle: "TELEMETRÍA COGNITIVA", statsWPM: "WPM Promedio", statsWPH: "Palabras/Hora",
    statsTime: "Tiempo Enfocado", statsWords: "Palabras Leídas", 
    modeORP: "O.R.P. (Focal)", modeBionic: "Bionic", modeChunk: "Bloque Semántico",
    timeLeft: "Tiempo Restante:", library: "BIBLIOTECA NEURONAL", resume: "RETOMAR", delete: "PURGAR",
    progress: "Progreso", contextPreview: "MAPA DE CONTEXTO ACTUAL:", restart: "REINICIAR", chunkLabel: "Palabras"
  },
  en: {
    title: "READING OPERATING SYSTEM", upload: "NEW DOCUMENT (PDF/TXT)", paste: "OR PASTE TEXT HERE...",
    start: "PREPARE IMMERSION", speed: "SPEED:", wpm: "WPM", pause: "COGNITIVE PAUSE",
    parsing: "Decoding matrices...", empty: "Memory empty. Load a document.",
    back: "BACK", aiClassBtn: "AI TUTOR", aiTitle: "SOCRATIC ANALYSIS",
    ask: "QUERY AI", closing: "RESUME READING", loadingAi: "Synthesizing response...",
    statsTitle: "COGNITIVE TELEMETRY", statsWPM: "Average WPM", statsWPH: "Words/Hour",
    statsTime: "Focused Time", statsWords: "Words Read",
    modeORP: "O.R.P. (Focal)", modeBionic: "Bionic", modeChunk: "Semantic Block",
    timeLeft: "Time Left:", library: "NEURAL LIBRARY", resume: "RESUME", delete: "PURGE",
    progress: "Progress", contextPreview: "CURRENT CONTEXT MAP:", restart: "RESTART", chunkLabel: "Words"
  },
  fr: {
    title: "SYSTÈME D'EXPLOITATION DE LECTURE", upload: "NOUVEAU DOCUMENT (PDF/TXT)", paste: "OU COLLEZ TEXTE ICI...",
    start: "PRÉPARER IMMERSION", speed: "VITESSE:", wpm: "MPM", pause: "PAUSE COGNITIVE",
    parsing: "Décodage des matrices...", empty: "Mémoire vide. Chargez un document.",
    back: "RETOUR", aiClassBtn: "TUTEUR IA", aiTitle: "ANALYSE SOCRATIQUE",
    ask: "CONSULTER L'IA", closing: "REPRENDRE LECTURE", loadingAi: "Synthèse de la réponse...",
    statsTitle: "TÉLÉMÉTRIE COGNITIVE", statsWPM: "MPM Moyen", statsWPH: "Mots/Heure",
    statsTime: "Temps Concentré", statsWords: "Mots Lus", 
    modeORP: "O.R.P. (Focal)", modeBionic: "Bionique", modeChunk: "Bloc Sémantique",
    timeLeft: "Temps Restant:", library: "BIBLIOTHÈQUE NEURONALE", resume: "REPRENDRE", delete: "PURGER",
    progress: "Progrès", contextPreview: "CARTE DE CONTEXTE ACTUELLE:", restart: "REDÉMARRER", chunkLabel: "Mots"
  },
  de: {
    title: "LESE-BETRIEBSSYSTEM", upload: "NEUES DOKUMENT (PDF/TXT)", paste: "ODER TEXT HIER EINFÜGEN...",
    start: "IMMERSION VORBEREITEN", speed: "GESCHWINDIGKEIT:", wpm: "WPM", pause: "KOGNITIVE PAUSE",
    parsing: "Matrizen werden dekodiert...", empty: "Speicher leer. Dokument laden.",
    back: "ZURÜCK", aiClassBtn: "KI-TUTOR", aiTitle: "SOKRATISCHE ANALYSE",
    ask: "KI FRAGEN", closing: "WEITERLESEN", loadingAi: "Antwort wird synthetisiert...",
    statsTitle: "KOGNITIVE TELEMETRIE", statsWPM: "Ø WPM", statsWPH: "Wörter/Stunde",
    statsTime: "Fokuszeit", statsWords: "Gelesene Wörter", 
    modeORP: "O.R.P. (Fokal)", modeBionic: "Bionisch", modeChunk: "Semantischer Block",
    timeLeft: "Verbleibende Zeit:", library: "NEURONALE BIBLIOTHEK", resume: "FORTSETZEN", delete: "LÖSCHEN",
    progress: "Fortschritt", contextPreview: "AKTUELLE KONTEXTKARTE:", restart: "NEUSTART", chunkLabel: "Wörter"
  },
  it: {
    title: "SISTEMA OPERATIVO DI LETTURA", upload: "NUOVO DOCUMENTO (PDF/TXT)", paste: "O INCOLLA TESTO QUI...",
    start: "PREPARA IMMERSIONE", speed: "VELOCITÀ:", wpm: "PPM", pause: "PAUSA COGNITIVA",
    parsing: "Decodifica matrici...", empty: "Memoria vuota. Carica un documento.",
    back: "INDIETRO", aiClassBtn: "TUTOR IA", aiTitle: "ANALISI SOCRATICA",
    ask: "CONSULTA IA", closing: "RIPRENDI LETTURA", loadingAi: "Sintetizzando risposta...",
    statsTitle: "TELEMETRIA COGNITIVA", statsWPM: "PPM Medio", statsWPH: "Parole/Ora",
    statsTime: "Tempo Concentrato", statsWords: "Parole Lette", 
    modeORP: "O.R.P. (Focale)", modeBionic: "Bionica", modeChunk: "Blocco Semantico",
    timeLeft: "Tempo Rimasto:", library: "BIBLIOTECA NEURALE", resume: "RIPRENDI", delete: "ELIMINA",
    progress: "Progresso", contextPreview: "MAPPA CONTESTO ATTUALE:", restart: "RIAVVIA", chunkLabel: "Parole"
  },
  pt: {
    title: "SISTEMA OPERACIONAL DE LEITURA", upload: "NOVO DOCUMENTO (PDF/TXT)", paste: "OU COLE O TEXTO AQUI...",
    start: "PREPARAR IMERSÃO", speed: "VELOCIDADE:", wpm: "PPM", pause: "PAUSA COGNITIVA",
    parsing: "Decodificando matrizes...", empty: "Memória vazia. Carregue um documento.",
    back: "VOLTAR", aiClassBtn: "TUTOR IA", aiTitle: "ANÁLISE SOCRÁTICA",
    ask: "CONSULTAR IA", closing: "RETOMAR LEITURA", loadingAi: "Sintetizando resposta...",
    statsTitle: "TELEMETRIA COGNITIVA", statsWPM: "PPM Médio", statsWPH: "Palavras/Hora",
    statsTime: "Tempo Focado", statsWords: "Palavras Lidas", 
    modeORP: "O.R.P. (Focal)", modeBionic: "Biônica", modeChunk: "Bloco Semântico",
    timeLeft: "Tempo Restante:", library: "BIBLIOTECA NEURONAL", resume: "RETOMAR", delete: "PURGAR",
    progress: "Progresso", contextPreview: "MAPA DE CONTEXTO ATUAL:", restart: "REINICIAR", chunkLabel: "Palavras"
  }
};

/* ============================================================
   🎙️ MOTOR DE VOZ IA (TTS) ACTUALIZADO
============================================================ */
class VoiceEngine {
  constructor() { 
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null; 
      // Soporte expandido a los 6 idiomas principales
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
   🧠 LINGUISTIC ENGINE (MÉTODOS SEMÁNTICOS ALTO RENDIMIENTO)
============================================================ */
const LanguageEngine = {
  tokenize: (text) => text.replace(/\n+/g, ' \n ').replace(/\s{2,}/g, ' ').split(' ').filter(word => word.trim().length > 0),
  
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
    if (/[.?!]/.test(lastChar)) return 2.8; 
    if (/[,;:]/.test(lastChar)) return 1.8;
    if (word === '\n') return 3.5; 
    if (word.length > 12) return 1.5; 
    if (word.length > 8) return 1.2; 
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
        
        if (/[.!?\n]/.test(word)) { break; }
        if (actualSize >= Math.max(1, requestedSize - 2) && /[,;:]/.test(word)) { break; }
    }
    return { words: chunk, nextIndex: endIndex };
  }
};

/* ============================================================
   🤖 MOTOR SOCRÁTICO ASÍNCRONO
============================================================ */
const fetchAIClass = async (contextText, userQuery, targetLang, signal) => {
  const sysPrompt = `Eres un Tutor Socrático de Lectura de Élite. El estudiante está leyendo esto: "${contextText}". Su duda es: "${userQuery}". Responde en: ${targetLang}. Explica de forma brillante, profunda pero concisa (método Feynman). Máximo 150 palabras.`;
  try {
    const res = await fetch(DEEPSEEK_URL, {
      method: 'POST', signal: signal,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.7 })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error.name === 'AbortError') return "";
    return "Error de conexión en el enlace neuronal.";
  }
};

const MarkdownParser = React.memo(({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00f2ff;">$1</strong>').replace(/\\n/g, '<br/>').replace(/\n/g, '<br/>');
        return { __html: parsed };
    }, [text]);
    return <div dangerouslySetInnerHTML={htmlContent} style={{ fontSize: '1.1rem', lineHeight: '1.7', color: '#e2e8f0' }} />;
});

/* ============================================================
   🎮 EL ACELERADOR COGNITIVO V12 (UNIT 8200 TIER - MOBILE FIRST)
============================================================ */
export default function LecturaQuantica() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = LEXICON[language] ? language : 'es';
  const UI = LEXICON[safeLang];

  // 📦 STATE MACHINE
  const [appState, setAppState] = useState('LIBRARY'); 
  const [library, setLibrary] = useState([]);
  const [currentBookId, setCurrentBookId] = useState(null);
  
  const [rawText, setRawText] = useState('');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [tokens, setTokens] = useState([]);
  
  // ⚙️ TELEMETRÍA Y CONTROL
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wpm, setWpm] = useState(400);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [countdown, setCountdown] = useState(3);
  
  // 🚀 MÉTODOS DE LECTURA 
  const [readMode, setReadMode] = useState('ORP'); 
  const [chunkSize, setChunkSize] = useState(3); 
  const [zenMode, setZenMode] = useState(false); 

  // 📊 ESTADÍSTICAS
  const [totalReadingTime, setTotalReadingTime] = useState(0); 

  // 🤖 ESTADO IA
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 🛡️ REFS DE ALTO RENDIMIENTO
  const wpmRef = useRef(wpm);
  const indexRef = useRef(currentIndex);
  const tokensRef = useRef(tokens);
  const isPlayingRef = useRef(isPlaying);
  const requestRef = useRef(null);
  const lastFrameTime = useRef(performance.now());
  const delayAccumulator = useRef(0);
  const aiAbortController = useRef(null);
  const sessionTimeRef = useRef(0); 

  // Sincronización
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Modo Zen Optimizado
  useEffect(() => {
    let timeout;
    const handleInteraction = () => {
      if(isPlaying) {
        setZenMode(false);
        clearTimeout(timeout);
        timeout = setTimeout(() => setZenMode(true), 2000); 
      }
    };
    if (isPlaying) {
        setZenMode(true); 
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('touchstart', handleInteraction); 
    } else {
        setZenMode(false); 
    }
    return () => { 
        window.removeEventListener('mousemove', handleInteraction); 
        window.removeEventListener('touchstart', handleInteraction);
        clearTimeout(timeout); 
    };
  }, [isPlaying]);

  /* ============================================================
     💽 BIBLIOTECA & PERSISTENCIA
  ============================================================ */
  const loadLibrary = async () => {
    try { const books = await StorageEngine.getBooks(); setLibrary(books || []); } 
    catch (e) { console.error("DB Load Error", e); }
  };

  useEffect(() => { loadLibrary(); }, []);

  const saveCurrentProgress = async (idx = indexRef.current) => {
      if(currentBookId && tokensRef.current.length > 0) {
          const b = library.find(x => x.id === currentBookId);
          if(b) { 
              b.progressIndex = idx; 
              b.lastRead = Date.now();
              await StorageEngine.saveBook(b); 
              loadLibrary(); 
          }
      }
  };

  useEffect(() => {
    if (appState === 'READING' && currentBookId && tokens.length > 0) {
      const interval = setInterval(saveCurrentProgress, 5000); 
      return () => clearInterval(interval);
    }
  }, [appState, currentBookId, library, tokens.length]);

  const handleDeleteBook = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("¿Purgar este manuscrito de la memoria neuronal?")) {
        await StorageEngine.deleteBook(id);
        loadLibrary();
    }
  };

  const handleResumeBook = (book) => {
    setTokens(book.tokens);
    setCurrentIndex(book.progressIndex);
    setCurrentBookId(book.id);
    setNewBookTitle(book.title);
    setAppState('PREPARING');
    setCountdown(3);
  };

  const handleRestartReading = async (e) => {
      if(e) e.stopPropagation();
      if(window.confirm("¿Deseas reiniciar la lectura de este documento desde el principio?")) {
          setIsPlaying(false);
          setCurrentIndex(0);
          indexRef.current = 0; 
          await saveCurrentProgress(0); 
          setAppState('PREPARING');
          setCountdown(3);
      }
  };

  /* ============================================================
     📄 INGESTOR DE ARCHIVOS
  ============================================================ */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsParsing(true); setRawText(''); 
    setNewBookTitle(file.name.replace(/\.[^/.]+$/, "")); 
    
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + ' \n ';
        }
        setRawText(fullText);
      } else {
        const text = await file.text();
        setRawText(text);
      }
    } catch (err) { alert(UI.sysError); } finally { setIsParsing(false); e.target.value = null; }
  };

  const prepareImmersionNew = async () => {
    if (isParsing || !rawText.trim()) return;
    const _tokens = LanguageEngine.tokenize(rawText);
    if (_tokens.length === 0) return;
    
    const newBook = {
        id: Date.now().toString(),
        title: newBookTitle || "Documento Analizado " + new Date().toLocaleDateString(),
        tokens: _tokens, progressIndex: 0, lastRead: Date.now()
    };
    await StorageEngine.saveBook(newBook);
    await loadLibrary();
    
    setCurrentBookId(newBook.id); setTokens(_tokens); setCurrentIndex(0);
    setTotalReadingTime(0); sessionTimeRef.current = 0;
    
    setAppState('PREPARING'); setCountdown(3);
  };

  /* ============================================================
     ⏱️ ENGINE RAF (NÚCLEO RSVP)
  ============================================================ */
  useEffect(() => {
    if (appState === 'PREPARING') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setAppState('READING'); setIsPlaying(true);
      }
    }
  }, [appState, countdown]);

  const rsvpLoop = useCallback((time) => {
    if (!isPlayingRef.current) return;

    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;
    delayAccumulator.current += deltaTime;
    sessionTimeRef.current += deltaTime; 

    if (indexRef.current >= tokensRef.current.length - 1) {
      setIsPlaying(false);
      setTotalReadingTime(sessionTimeRef.current);
      setAppState('STATS'); 
      return;
    }

    let wordsAdvance = 1;
    let multiplier = 1.0;

    if (readMode === 'CHUNK') {
        const chunkData = LanguageEngine.getSmartChunk(tokensRef.current, indexRef.current, chunkSize);
        wordsAdvance = chunkData.nextIndex - indexRef.current;
        multiplier = LanguageEngine.getDelayMultiplier(tokensRef.current[chunkData.nextIndex - 1] || '');
    } else {
        multiplier = LanguageEngine.getDelayMultiplier(tokensRef.current[indexRef.current]);
    }

    const baseDelay = ((60 / wpmRef.current) * 1000) * wordsAdvance * multiplier;

    if (delayAccumulator.current >= baseDelay) {
        delayAccumulator.current = 0;
        setCurrentIndex(prev => Math.min(prev + wordsAdvance, tokensRef.current.length - 1));
    }
    requestRef.current = requestAnimationFrame(rsvpLoop);
  }, [readMode, chunkSize]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(rsvpLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
      saveCurrentProgress(); 
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, rsvpLoop]);

  /* ============================================================
     👆 CONTROLES Y NAVEGACIÓN RÁPIDA (PRO)
  ============================================================ */
  const togglePlay = (e) => {
    if(e && e.target.closest('.controls-layer')) return; 
    setIsPlaying(prev => !prev);
  };

  const skipForward = () => {
      const jump = Math.max(15, Math.floor(tokens.length * 0.05));
      setCurrentIndex(prev => Math.min(prev + jump, tokens.length - 1));
  };
  const skipBackward = () => {
      const jump = Math.max(15, Math.floor(tokens.length * 0.05));
      setCurrentIndex(prev => Math.max(prev - jump, 0));
  };

  useEffect(() => {
    if (appState !== 'READING') return;
    const handleKeyDown = (e) => {
      if(e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') { e.preventDefault(); togglePlay(); } 
      else if (e.code === 'ArrowRight') { e.preventDefault(); skipForward(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); skipBackward(); }
      else if (e.code === 'ArrowUp') { e.preventDefault(); setWpm(p => Math.min(p + 20, 2000)); } 
      else if (e.code === 'ArrowDown') { e.preventDefault(); setWpm(p => Math.max(p - 20, 100)); }
      else if (e.key === '+') { e.preventDefault(); setChunkSize(p => Math.min(p + 1, 10)); } 
      else if (e.key === '-') { e.preventDefault(); setChunkSize(p => Math.max(p - 1, 1)); }
      else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); handleRestartReading(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState]);

  const queryAI = async (e) => {
    e.preventDefault();
    if(!aiQuery.trim()) return;
    setIsAiThinking(true);
    if (aiAbortController.current) aiAbortController.current.abort();
    aiAbortController.current = new AbortController();
    const contextText = tokens.slice(Math.max(0, currentIndex - 100), currentIndex + 20).join(' ');
    const response = await fetchAIClass(contextText, aiQuery, safeLang, aiAbortController.current.signal);
    if (response) { setAiResponse(response); TTS.speak(response, safeLang); }
    setIsAiThinking(false);
  };

  /* ============================================================
     🎨 RENDERIZADORES HOLOGRÁFICOS (MOBILE FIRST)
  ============================================================ */
  const renderReadingContent = () => {
    if (!tokens.length || currentIndex >= tokens.length) return null;

    if (readMode === 'ORP') {
      const word = tokens[currentIndex];
      if (word === '\n') return <span style={{ opacity: 0.1, color: '#00f2ff' }}>¶</span>;
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
      if (word === '\n') return <span style={{ opacity: 0.1 }}>¶</span>;
      return <span dangerouslySetInnerHTML={{ __html: LanguageEngine.toBionic(word) }} style={{ color: '#e2e8f0', letterSpacing: '1px' }} />;
    }

    if (readMode === 'CHUNK') {
      const chunkData = LanguageEngine.getSmartChunk(tokens, currentIndex, chunkSize);
      // Flex-wrap con un gap controlado facilita la lectura periférica sin desbordar el móvil
      return (
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', lineHeight: '1.4' }}>
              {chunkData.words.map((w, i) => (
                  <span key={i} style={{ color: '#e2e8f0' }}>{w}</span>
              ))}
          </div>
      );
    }
  };

  const renderContextHologram = () => {
      if (currentIndex === 0) return null;
      const start = Math.max(0, currentIndex - 40);
      const end = Math.min(tokens.length, currentIndex + 40);
      
      const prevText = tokens.slice(start, currentIndex).join(' ');
      const currentWord = tokens[currentIndex] || '';
      const nextText = tokens.slice(currentIndex + 1, end).join(' ');

      // Barra indicadora de la posición del foco actual en el modo chunking
      return (
          <div style={{ 
              position: 'absolute', top: 'env(safe-area-inset-top, 5%)', left: '5%', right: '5%', maxWidth: '1000px', margin: '20px auto 0 auto',
              background: 'rgba(15, 23, 42, 0.5)', padding: 'clamp(15px, 4vw, 30px)', borderRadius: '20px',
              border: '1px solid rgba(0, 242, 255, 0.2)', backdropFilter: 'blur(15px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)', zIndex: 5, animation: 'fadeIn 0.3s ease-out',
              maxHeight: '40vh', overflowY: 'auto'
          }}>
              <div style={{ color: '#00f2ff', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '15px', textTransform: 'uppercase' }}>
                  <i className="fas fa-eye me-2"></i>{UI.contextPreview}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: 'clamp(1rem, 3vw, 1.25rem)', lineHeight: '1.8', margin: 0, textAlign: 'justify' }}>
                  ... <span style={{ opacity: 0.7 }}>{prevText}</span> 
                  <span style={{ 
                      background: 'rgba(0, 242, 255, 0.15)', color: '#00f2ff', fontWeight: '900', 
                      padding: '4px 10px', borderRadius: '6px', margin: '0 6px',
                      borderBottom: '2px solid #00f2ff', boxShadow: '0 0 20px rgba(0, 242, 255, 0.3)'
                  }}>
                      {currentWord}
                  </span> 
                  <span style={{ opacity: 0.4 }}>{nextText}</span> ...
              </p>
          </div>
      );
  };

  const getEstimatedTimeLeft = () => {
    const wordsLeft = tokens.length - currentIndex;
    const msLeft = wordsLeft * ((60 / wpm) * 1000);
    return `${Math.floor(msLeft / 60000)}m ${Math.floor((msLeft % 60000) / 1000)}s`;
  };

  const progress = tokens.length ? (currentIndex / tokens.length) * 100 : 0;

  /* ============================================================
     DOM MOUNT
  ============================================================ */
  return (
    <div style={{ position: 'fixed', inset: 0, background: appState === 'READING' ? '#000000' : '#020617', fontFamily: "'Inter', system-ui, sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
        .cyber-button { background: #00f2ff; color: #000; font-weight: 800; border: none; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;}
        .cyber-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,242,255,0.4); }
        .cyber-button:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; }
        
        .mode-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid #334155; padding: 10px 15px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold; font-size: clamp(12px, 3vw, 16px);}
        .mode-btn.active { background: rgba(0,242,255,0.2); color: #00f2ff; border-color: #00f2ff; }
        
        .library-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; transition: 0.4s; cursor: pointer; position: relative;}
        .library-card:hover { border-color: #00f2ff; background: rgba(0,242,255,0.05); transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,242,255,0.15);}
        
        .hud-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        
        .countdown-anim { animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* ZEN MODE CSS (Mobile Optimized Bottom Area) */
        .zen-ui { transition: opacity 0.5s ease-in-out, transform 0.5s ease; }
        .zen-hidden.top { opacity: 0 !important; transform: translateY(-20px); pointer-events: none; }
        .zen-hidden.bottom { opacity: 0 !important; transform: translateY(20px); pointer-events: none; }
        
        .controls-layer { padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
        
        /* Ocultar barras de scroll */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,242,255,0.2); border-radius: 10px; }
      `}</style>
      
      {/* 🚀 FASE 0: BIBLIOTECA */}
      {appState === 'LIBRARY' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(20px, 5vh, 40px) clamp(15px, 5vw, 40px)', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
              <h1 style={{ color: '#fff', fontWeight: '900', margin: 0, fontSize: 'clamp(20px, 5vw, 36px)', letterSpacing: '1px' }}>
                  <i className="fas fa-layer-group me-2" style={{ color: '#00f2ff' }}></i>{UI.library}
              </h1>
              <button onClick={() => setAppState('SETUP')} className="cyber-button" style={{ padding: '12px 25px', borderRadius: '8px', fontSize: 'clamp(12px, 3vw, 16px)' }}>
                <i className="fas fa-plus"></i> {UI.upload}
              </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
             {library.length === 0 ? (
                 <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed #334155' }}>
                    <i className="fas fa-ghost fa-3x mb-3 opacity-50"></i>
                    <p style={{ fontSize: '1.1rem', margin: 0 }}>{UI.empty}</p>
                 </div>
             ) : library.map(book => {
                 const pct = Math.round((book.progressIndex / book.tokens.length) * 100) || 0;
                 return (
                 <div key={book.id} className="library-card" onClick={() => handleResumeBook(book)}>
                    <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 2 }}>
                       <button onClick={(e) => handleDeleteBook(e, book.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: '0.2s' }} title={UI.delete} onMouseOver={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                         <i className="fas fa-trash-alt"></i>
                       </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingRight: '30px' }}>
                       <div style={{ width: '50px', height: '65px', background: 'linear-gradient(135deg, #00f2ff, #0284c7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: '900', fontSize: '12px', boxShadow: '0 5px 15px rgba(0,242,255,0.3)', flexShrink: 0 }}>TXT</div>
                       <div style={{ flex: 1, overflow: 'hidden' }}>
                           <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{book.title}</h3>
                           <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{book.tokens.length.toLocaleString()} {UI.chunkLabel}</div>
                       </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>
                       <span>{UI.progress}</span>
                       <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#1e293b', borderRadius: '3px', overflow: 'hidden' }}>
                       <div style={{ width: `${pct}%`, height: '100%', background: '#00f2ff', boxShadow: '0 0 10px #00f2ff' }}></div>
                    </div>
                    <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#475569', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><i className="far fa-clock me-1"></i> {new Date(book.lastRead).toLocaleDateString()}</span>
                        <span style={{ color: '#00f2ff', fontWeight: 'bold', letterSpacing: '1px' }}>{UI.resume} <i className="fas fa-arrow-right ms-1"></i></span>
                    </div>
                 </div>
             )})}
          </div>
        </div>
      )}

      {/* 🚀 FASE 1: SETUP NUEVO LIBRO */}
      {appState === 'SETUP' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(20px, 5vh, 40px) clamp(15px, 5vw, 40px)', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <button className="mode-btn" onClick={() => setAppState('LIBRARY')} style={{ alignSelf: 'flex-start', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <i className="fas fa-arrow-left"></i> {UI.library}
          </button>
          
          <div className="glass-panel" style={{ borderRadius: '16px', padding: 'clamp(20px, 5vw, 40px)', textAlign: 'center', marginBottom: '20px' }}>
            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
            <label htmlFor="file-upload" className="cyber-button" style={{ padding: '15px 30px', borderRadius: '8px', display: 'inline-flex', cursor: 'pointer', fontSize: 'clamp(14px, 3vw, 18px)' }}>
              {isParsing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-cloud-upload-alt"></i>}
              {isParsing ? UI.parsing : UI.upload}
            </label>
          </div>

          <textarea 
            value={rawText} onChange={(e) => { setRawText(e.target.value); setNewBookTitle("Texto Directo " + new Date().toLocaleTimeString()); }}
            className="glass-panel"
            style={{ flex: 1, width: '100%', borderRadius: '12px', padding: '20px', color: '#e2e8f0', fontSize: '1rem', resize: 'none', outline: 'none', lineHeight: '1.6' }}
            placeholder={UI.paste}
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
             <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} onClick={() => setReadMode('ORP')}><i className="fas fa-crosshairs me-1"></i> {UI.modeORP}</button>
             <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} onClick={() => setReadMode('BIONIC')}><i className="fas fa-bold me-1"></i> {UI.modeBionic}</button>
             <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} onClick={() => setReadMode('CHUNK')}><i className="fas fa-layer-group me-1"></i> {UI.modeChunk}</button>
          </div>

          <button onClick={prepareImmersionNew} disabled={isParsing || !rawText.trim()} className="cyber-button" style={{ padding: '20px', borderRadius: '12px', fontSize: 'clamp(16px, 4vw, 22px)', marginTop: '20px', letterSpacing: '2px' }}>
            <i className="fas fa-space-shuttle"></i> {UI.start}
          </button>
        </div>
      )}

      {/* 🚀 FASE 2: PREPARACIÓN (COUNTDOWN) */}
      {appState === 'PREPARING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
           <h2 style={{ color: '#94a3b8', letterSpacing: '4px', marginBottom: '30px', fontSize: 'clamp(16px, 4vw, 24px)' }}>{newBookTitle.toUpperCase()}</h2>
           <div className="countdown-anim" style={{ fontSize: 'clamp(100px, 20vw, 180px)', fontWeight: '900', color: '#00f2ff', textShadow: '0 0 50px rgba(0,242,255,0.8)' }}>
             {countdown}
           </div>
        </div>
      )}

      {/* 🚀 FASE 3: INMERSIÓN (MOBILE FIRST & ZEN) */}
      {appState === 'READING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={togglePlay}>
          
          {/* HEADER TÁCTICO */}
          <div className={`controls-layer zen-ui ${zenMode ? 'zen-hidden top' : ''}`} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: '10px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(#000000 60%, transparent)', zIndex: 10 }}>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              <button className="mode-btn" onClick={(e) => { e.stopPropagation(); setAppState('LIBRARY'); setIsPlaying(false); }} style={{ padding: '8px 12px' }}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="mode-btn" onClick={handleRestartReading} style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444', padding: '8px 12px' }}>
                <i className="fas fa-undo"></i>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                <div className="d-none d-md-flex" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  <i className="fas fa-hourglass-half me-2"></i> <strong style={{ color: '#fff', letterSpacing: '1px' }}>{getEstimatedTimeLeft()}</strong>
                </div>
                <div style={{ color: '#00f2ff', fontFamily: 'monospace', fontWeight: 'bold', background: 'rgba(0, 242, 255, 0.05)', padding: '6px 15px', borderRadius: '20px', border: '1px solid rgba(0, 242, 255, 0.2)', fontSize: 'clamp(12px, 3vw, 16px)' }}>
                  {currentIndex} <span style={{ color: '#475569' }}>/ {tokens.length}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setIsPlaying(false); setAppState('AI_CLASS'); }} className="cyber-button" style={{ padding: '8px 15px', borderRadius: '8px', fontSize: '14px' }}>
                  <i className="fas fa-robot"></i> <span className="d-none d-md-inline ms-2">{UI.aiClassBtn}</span>
                </button>
            </div>
          </div>

          {/* LIENZO DE LECTURA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            
            {!isPlaying && renderContextHologram()}

            {readMode === 'ORP' && (
              <>
                <div style={{ position: 'absolute', top: '50%', left: '5vw', right: '5vw', height: '1px', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', top: '30%', bottom: '30%', left: '50%', width: '1px', background: 'rgba(0,242,255,0.05)', pointerEvents: 'none' }}></div>
              </>
            )}

            {!isPlaying && (
              <div className="hud-pulse" style={{ position: 'absolute', top: '20%', color: '#ffaa00', fontWeight: '900', fontSize: 'clamp(16px, 4vw, 24px)', letterSpacing: '5px', zIndex: 10 }}>
                <i className="fas fa-pause me-2"></i>{UI.pause}
              </div>
            )}

            <div style={{ 
                fontSize: readMode === 'CHUNK' ? 'clamp(24px, 5vw, 60px)' : 'clamp(32px, 8vw, 100px)', 
                fontFamily: "'Lora', 'Georgia', serif", 
                width: '100%', maxWidth: '1400px', padding: '0 15px', textAlign: 'center',
                opacity: isPlaying ? 1 : 0.05, transition: 'opacity 0.4s' 
            }}>
              {renderReadingContent()}
            </div>
            
            {/* Pacer Bar (Fluidez Cognitiva) */}
            {isPlaying && (
               <div style={{ position: 'absolute', bottom: '35%', width: '100px', height: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', background: '#00f2ff', animation: `pulse ${(60 / wpm) * (readMode === 'CHUNK' ? chunkSize : 1)}s infinite linear` }}></div>
               </div>
            )}
          </div>

          {/* CONTROLES DE REPRODUCCIÓN (THUMB ZONE OPTIMIZED) */}
          <div className={`controls-layer zen-ui ${zenMode ? 'zen-hidden bottom' : ''}`} style={{ padding: '15px 20px', paddingBottom: 'calc(20px + env(safe-area-inset-bottom))', background: 'linear-gradient(transparent, #000000 70%)', zIndex: 10 }}>
            
            {/* Barra de Progreso */}
            <div style={{ width: '100%', height: '4px', background: '#0f172a', borderRadius: '2px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#00f2ff', transition: 'width 0.1s linear', boxShadow: '0 0 10px #00f2ff' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                
                {/* Botones de Reproducción */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                   <button className="mode-btn" onClick={(e) => { e.stopPropagation(); skipBackward(); }} style={{ padding: '15px 25px', borderRadius: '12px' }}><i className="fas fa-backward fs-5"></i></button>
                   <button className="cyber-button" onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ padding: '20px 45px', borderRadius: '50px', fontSize: '1.8rem', boxShadow: isPlaying ? 'none' : '0 0 20px rgba(0,242,255,0.4)' }}>
                     {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play ms-2"></i>}
                   </button>
                   <button className="mode-btn" onClick={(e) => { e.stopPropagation(); skipForward(); }} style={{ padding: '15px 25px', borderRadius: '12px' }}><i className="fas fa-forward fs-5"></i></button>
                </div>

                {/* Settings de Lectura (Mobile Friendly) */}
                <div className="glass-panel" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '15px', width: '100%', maxWidth: '800px', padding: '15px', borderRadius: '16px' }}>
                  
                  {/* Selector de Modo */}
                  <div style={{ display: 'flex', gap: '5px', flex: 1, minWidth: '100%', justifyContent: 'center' }}>
                     <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} style={{flex:1, padding: '10px 5px'}} onClick={(e) => { e.stopPropagation(); setReadMode('ORP');}}>ORP</button>
                     <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} style={{flex:1, padding: '10px 5px'}} onClick={(e) => { e.stopPropagation(); setReadMode('BIONIC');}}>BIO</button>
                     <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} style={{flex:1, padding: '10px 5px'}} onClick={(e) => { e.stopPropagation(); setReadMode('CHUNK');}}>BLK</button>
                  </div>
                  
                  {/* Selector WPM */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                    <div style={{ color: '#fff', fontWeight: '900', minWidth: '60px', textAlign: 'right', fontSize: '1.1rem' }}>
                      {wpm} <span style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'normal'}}>WPM</span>
                    </div>
                    <input 
                      type="range" min="100" max="2000" step="10" value={wpm} 
                      onChange={(e) => { e.stopPropagation(); setWpm(Number(e.target.value)); }}
                      style={{ flex: 1, accentColor: '#00f2ff', height: '6px' }}
                    />
                  </div>

                  {/* Selector de Chunks */}
                  {readMode === 'CHUNK' && (
                     <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                        <select value={chunkSize} onChange={(e) => { e.stopPropagation(); setChunkSize(Number(e.target.value)); }} style={{ background: 'rgba(0,0,0,0.5)', color: '#00f2ff', border: '1px solid #00f2ff', borderRadius: '8px', padding: '10px 20px', outline: 'none', fontWeight: 'bold', width: '100%', textAlign: 'center' }}>
                           {[...Array(10)].map((_, i) => (
                             <option key={i+1} value={i+1}>{i+1} {UI.chunkLabel}</option>
                           ))}
                        </select>
                     </div>
                  )}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 FASE 4: TELEMETRÍA */}
      {appState === 'STATS' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '5vh 5vw', maxWidth: '1000px', margin: '0 auto', width: '100%', justifyContent: 'center' }}>
           <h1 style={{ color: '#00f2ff', textAlign: 'center', marginBottom: '40px', fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: '900' }}>
             <i className="fas fa-chart-pie me-2"></i> {UI.statsTitle}
           </h1>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #00f2ff', padding: '25px 15px' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase' }}>{UI.statsWords}</div>
                 <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: '900', color: '#fff' }}>{tokens.length.toLocaleString()}</div>
              </div>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #ff0055', padding: '25px 15px' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase' }}>{UI.statsTime}</div>
                 <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: '900', color: '#fff' }}>
                    {Math.floor(totalReadingTime / 60000)}<span style={{fontSize:'0.5em', color:'#64748b'}}>m</span> {Math.floor((totalReadingTime % 60000) / 1000)}<span style={{fontSize:'0.5em', color:'#64748b'}}>s</span>
                 </div>
              </div>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #ffea00', padding: '25px 15px' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px', textTransform: 'uppercase' }}>{UI.statsWPH}</div>
                 <div style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: '900', color: '#fff' }}>
                    {Math.round((tokens.length / (totalReadingTime / 1000)) * 60 * 60) || 0}
                 </div>
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="cyber-button" onClick={() => setAppState('LIBRARY')} style={{ padding: '18px 40px', fontSize: '1.2rem', borderRadius: '12px', width: '100%', maxWidth: '400px' }}>
                <i className="fas fa-book me-2"></i> {UI.library}
              </button>
           </div>
        </div>
      )}

      {/* 🚀 FASE 5: CLASE SOCRÁTICA IA */}
      {appState === 'AI_CLASS' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 'clamp(20px, 5vh, 40px) clamp(15px, 5vw, 40px)', maxWidth: '900px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h2 style={{ color: '#00f2ff', margin: 0, fontWeight: '900', textTransform: 'uppercase', fontSize: 'clamp(18px, 4vw, 24px)' }}><i className="fas fa-brain me-2"></i> {UI.aiTitle}</h2>
            <button onClick={() => setAppState('READING')} className="cyber-button" style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px' }}><i className="fas fa-play me-2"></i> {UI.closing}</button>
          </div>
          
          <div style={{ marginBottom: '10px', color: '#00f2ff', fontWeight: 'bold', fontSize: '0.9rem' }}><i className="fas fa-history me-2"></i>{UI.contextPreview}</div>
          <div className="glass-panel" style={{ borderLeft: `4px solid #00f2ff`, padding: '20px', borderRadius: '0 12px 12px 0', marginBottom: '30px', color: '#cbd5e1', fontStyle: 'italic', fontSize: '1rem', lineHeight: '1.6' }}>
            "...{tokens.slice(Math.max(0, currentIndex - 40), currentIndex + 10).join(' ')}..."
          </div>
          
          <form onSubmit={queryAI} style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} className="glass-panel" style={{ flex: 1, padding: '15px', color: '#fff', fontSize: '1rem', outline: 'none', borderRadius: '8px' }} placeholder="Escribe tu duda..." />
                <button type="submit" disabled={isAiThinking} className="cyber-button" style={{ padding: '0 25px', borderRadius: '8px', fontSize: '1.2rem' }}>
                  {isAiThinking ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                </button>
            </div>
          </form>
          
          {aiResponse && !isAiThinking && (
            <div className="glass-panel" style={{ padding: 'clamp(20px, 5vw, 40px)', borderTop: '4px solid #00f2ff', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,242,255,0.1)' }}>
              <div style={{ color: '#00f2ff', marginBottom: '15px', fontWeight: '900', fontSize: '1.1rem', textTransform: 'uppercase' }}><i className="fas fa-robot me-2"></i> Tutor IA:</div>
              <MarkdownParser text={aiResponse} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}