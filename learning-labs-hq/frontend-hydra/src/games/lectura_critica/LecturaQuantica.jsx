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
   Maneja strings masivos que destruirían localStorage.
============================================================ */
const DB_NAME = "QuantumReaderDB";
const STORE_NAME = "Library";

const StorageEngine = {
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
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
   🌍 I18N: MULTILANGUAGE LEXICON (6 IDIOMAS)
============================================================ */
const LEXICON = {
  es: {
    title: "SISTEMA OPERATIVO DE LECTURA", upload: "NUEVO DOCUMENTO (PDF/TXT)", paste: "O PEGA TEXTO AQUÍ...",
    start: "PREPARAR INMERSIÓN", speed: "VELOCIDAD:", wpm: "WPM", pause: "PAUSADO",
    parsing: "Decodificando matrices...", empty: "Memoria vacía. Carga un documento.",
    back: "VOLVER", aiClassBtn: "IA CLASE", aiTitle: "TUTOR SOCRÁTICO",
    aiForced: "FATIGA DETECTADA. ANÁLISIS REQUERIDO.", ask: "CONSULTAR IA",
    closing: "REANUDAR LECTURA", loadingAi: "Sintetizando clase...",
    statsTitle: "TELEMETRÍA COGNITIVA", statsWPM: "WPM Promedio", statsWPH: "Palabras/Hora",
    statsTime: "Tiempo Enfocado", statsWords: "Palabras Leídas", 
    modeORP: "O.R.P.", modeBionic: "Bionic", modeChunk: "Chunking",
    timeLeft: "Tiempo Restante:", library: "MI BIBLIOTECA NEURONAL", resume: "RETOMAR", delete: "PURGAR",
    progress: "Progreso"
  },
  en: {
    title: "READING OPERATING SYSTEM", upload: "NEW DOCUMENT (PDF/TXT)", paste: "OR PASTE TEXT HERE...",
    start: "PREPARE IMMERSION", speed: "SPEED:", wpm: "WPM", pause: "PAUSED",
    parsing: "Decoding matrices...", empty: "Memory empty. Load a document.",
    back: "BACK", aiClassBtn: "AI CLASS", aiTitle: "SOCRATIC TUTOR",
    aiForced: "FATIGUE DETECTED. ANALYSIS REQUIRED.", ask: "QUERY AI",
    closing: "RESUME READING", loadingAi: "Synthesizing class...",
    statsTitle: "COGNITIVE TELEMETRY", statsWPM: "Average WPM", statsWPH: "Words/Hour",
    statsTime: "Focused Time", statsWords: "Words Read",
    modeORP: "O.R.P.", modeBionic: "Bionic", modeChunk: "Chunking",
    timeLeft: "Time Left:", library: "MY NEURAL LIBRARY", resume: "RESUME", delete: "PURGE",
    progress: "Progress"
  }
};
// Fallbacks for other languages to English to keep code concise but scalable
['fr', 'de', 'it', 'pt'].forEach(l => LEXICON[l] = LEXICON.en);

/* ============================================================
   🎙️ MOTOR DE VOZ IA (TTS)
============================================================ */
class VoiceEngine {
  constructor() { 
      this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null; 
      this.langs = { es: 'es-ES', en: 'en-US' }; 
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
   🧠 LINGUISTIC ENGINE (MÚLTIPLES MÉTODOS)
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
    if (lastChar === '.' || lastChar === '!' || lastChar === '?' || word === '\n') return 2.5;
    if (lastChar === ',' || lastChar === ';' || lastChar === ':') return 1.6;
    if (word.length > 8) return 1.3; 
    return 1.0;
  },
  toBionic: (word) => {
    if(word === '\n') return word;
    const cleanWord = word.trim();
    if(cleanWord.length <= 1) return `<b>${cleanWord}</b>`;
    const pivot = Math.ceil(cleanWord.length / 2);
    return `<b>${cleanWord.slice(0, pivot)}</b>${cleanWord.slice(pivot)}`;
  }
};

/* ============================================================
   🤖 MOTOR SOCRÁTICO ASÍNCRONO
============================================================ */
const fetchAIClass = async (contextText, userQuery, targetLang, signal) => {
  const sysPrompt = `Eres un Tutor Socrático de Lectura. El estudiante lee: "${contextText}". Duda: "${userQuery}". Responde en: ${targetLang}. Usa método Feynman. Máximo 100 palabras.`;
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
   🎮 EL ACELERADOR COGNITIVO V5 (LIBRARY OS)
============================================================ */
export default function LecturaQuantica() {
  const { language } = useGameStore() || { language: "es" };
  const safeLang = LEXICON[language] ? language : 'es';
  const UI = LEXICON[safeLang];

  // 📦 STATE MACHINE: LIBRARY -> SETUP -> PREPARING -> READING -> STATS <-> AI_CLASS
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
  const [chunkSize, setChunkSize] = useState(1);

  // 📊 ESTADÍSTICAS
  const [totalReadingTime, setTotalReadingTime] = useState(0);

  // 🤖 ESTADO IA
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // 🛡️ REFS DE RENDIMIENTO
  const wpmRef = useRef(wpm);
  const indexRef = useRef(currentIndex);
  const tokensRef = useRef(tokens);
  const isPlayingRef = useRef(isPlaying);
  const requestRef = useRef(null);
  const lastFrameTime = useRef(performance.now());
  const delayAccumulator = useRef(0);
  const aiAbortController = useRef(null);
  const sessionTimeRef = useRef(0);

  // Sincronización Ref
  useEffect(() => { wpmRef.current = wpm; }, [wpm]);
  useEffect(() => { indexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { tokensRef.current = tokens; }, [tokens]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  /* ============================================================
     💽 GESTIÓN DE BIBLIOTECA LOCAL
  ============================================================ */
  const loadLibrary = async () => {
    try { const books = await StorageEngine.getBooks(); setLibrary(books || []); } 
    catch (e) { console.error("DB Load Error", e); }
  };

  useEffect(() => { loadLibrary(); }, []);

  // Auto-Save en Background
  useEffect(() => {
    if (appState === 'READING' && currentBookId && tokens.length > 0) {
      const interval = setInterval(async () => {
        const bookToUpdate = library.find(b => b.id === currentBookId);
        if (bookToUpdate && indexRef.current > bookToUpdate.progressIndex) {
            bookToUpdate.progressIndex = indexRef.current;
            bookToUpdate.lastRead = Date.now();
            await StorageEngine.saveBook(bookToUpdate);
            loadLibrary(); // Refresca UI silenciosamente
        }
      }, 5000); // Guarda cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [appState, currentBookId, library]);

  const handleDeleteBook = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("¿Seguro que deseas purgar este archivo de la memoria neuronal?")) {
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

  /* ============================================================
     📄 INGESTOR UNIVERSAL
  ============================================================ */
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsParsing(true);
    setRawText(''); 
    setNewBookTitle(file.name.replace(/\.[^/.]+$/, "")); // Quitar extensión
    
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
    } catch (err) {
      console.error("Kernel Panic parsing file:", err);
      alert(UI.sysError);
    } finally {
      setIsParsing(false);
      e.target.value = null; 
    }
  };

  const prepareImmersionNew = async () => {
    if (isParsing || !rawText.trim()) { alert(UI.empty); return; }
    const _tokens = LanguageEngine.tokenize(rawText);
    if (_tokens.length === 0) { alert(UI.empty); return; }
    
    const newBook = {
        id: Date.now().toString(),
        title: newBookTitle || "Documento Analizado " + new Date().toLocaleDateString(),
        tokens: _tokens,
        progressIndex: 0,
        lastRead: Date.now()
    };

    await StorageEngine.saveBook(newBook);
    await loadLibrary();
    
    setCurrentBookId(newBook.id);
    setTokens(_tokens);
    setCurrentIndex(0);
    setTotalReadingTime(0);
    sessionTimeRef.current = 0;
    
    setAppState('PREPARING');
    setCountdown(3);
  };

  /* ============================================================
     ⏱️ PREPARACIÓN Y BUCLE RSVP (GOD TIER RAF)
  ============================================================ */
  useEffect(() => {
    if (appState === 'PREPARING') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        setAppState('READING');
        setIsPlaying(true);
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

    const currentWord = tokensRef.current[indexRef.current];
    const multiplier = LanguageEngine.getDelayMultiplier(currentWord);
    const currentChunkSize = readMode === 'CHUNK' ? chunkSize : 1;
    const baseDelay = ((60 / wpmRef.current) * 1000) * currentChunkSize * multiplier;

    if (delayAccumulator.current >= baseDelay) {
        delayAccumulator.current = 0;
        setCurrentIndex(prev => Math.min(prev + currentChunkSize, tokensRef.current.length - 1));
    }
    requestRef.current = requestAnimationFrame(rsvpLoop);
  }, [readMode, chunkSize]);

  useEffect(() => {
    if (isPlaying) {
      lastFrameTime.current = performance.now();
      requestRef.current = requestAnimationFrame(rsvpLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Guardar progreso al pausar
      if(currentBookId && tokens.length > 0) {
        const b = library.find(x => x.id === currentBookId);
        if(b) { b.progressIndex = currentIndex; StorageEngine.saveBook(b); }
      }
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying, rsvpLoop, currentBookId, tokens, currentIndex, library]);

  /* ============================================================
     👆 CONTROLES Y RENDERIZADOR 
  ============================================================ */
  const togglePlay = (e) => {
    if(e && e.target.closest('.controls-layer')) return; 
    setIsPlaying(prev => !prev);
  };

  const skipForward = () => setCurrentIndex(prev => Math.min(prev + 10, tokens.length - 1));
  const skipBackward = () => setCurrentIndex(prev => Math.max(prev - 10, 0));

  useEffect(() => {
    if (appState !== 'READING') return;
    const handleKeyDown = (e) => {
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); } 
      else if (e.code === 'ArrowRight') { e.preventDefault(); skipForward(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); skipBackward(); }
      else if (e.code === 'ArrowUp') { e.preventDefault(); setWpm(p => Math.min(p + 20, 1500)); } 
      else if (e.code === 'ArrowDown') { e.preventDefault(); setWpm(p => Math.max(p - 20, 100)); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState]);

  const openAIClass = (e) => { e.stopPropagation(); setIsPlaying(false); setAppState('AI_CLASS'); setAiResponse(''); setAiQuery(''); };

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

  const renderReadingContent = () => {
    if (!tokens.length || currentIndex >= tokens.length) return null;
    if (readMode === 'ORP') {
      const word = tokens[currentIndex];
      if (word === '\n') return <span style={{ opacity: 0.1, color: '#00f2ff' }}>¶</span>;
      const cleanWord = word.trim();
      const orpIndex = LanguageEngine.getORP(cleanWord);
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
          <span style={{ color: '#8892b0', textAlign: 'right', whiteSpace: 'pre' }}>{cleanWord.substring(0, orpIndex)}</span>
          <span style={{ color: '#00f2ff', fontWeight: '900', fontSize: '1.3em', textShadow: '0 0 20px rgba(0,242,255,0.6)' }}>{cleanWord.charAt(orpIndex)}</span>
          <span style={{ color: '#8892b0', textAlign: 'left', whiteSpace: 'pre' }}>{cleanWord.substring(orpIndex + 1)}</span>
        </div>
      );
    } 
    if (readMode === 'BIONIC') {
      const word = tokens[currentIndex];
      if (word === '\n') return <span style={{ opacity: 0.1 }}>¶</span>;
      return <span dangerouslySetInnerHTML={{ __html: LanguageEngine.toBionic(word) }} style={{ color: '#fff' }} />;
    }
    if (readMode === 'CHUNK') {
      const chunkWords = tokens.slice(currentIndex, currentIndex + chunkSize).join(' ');
      return <span style={{ color: '#fff' }}>{chunkWords}</span>;
    }
  };

  const getEstimatedTimeLeft = () => {
    const wordsLeft = tokens.length - currentIndex;
    const msLeft = wordsLeft * ((60 / wpm) * 1000);
    return `${Math.floor(msLeft / 60000)}m ${Math.floor((msLeft % 60000) / 1000)}s`;
  };

  const progress = tokens.length ? (currentIndex / tokens.length) * 100 : 0;

  /* ============================================================
     DOM MOUNT (UI GOD TIER)
  ============================================================ */
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#020617', fontFamily: "'Inter', system-ui, sans-serif", color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); }
        .cyber-button { background: #00f2ff; color: #000; font-weight: 800; border: none; transition: all 0.2s; text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px;}
        .cyber-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 20px rgba(0,242,255,0.4); }
        .cyber-button:disabled { background: #334155; color: #94a3b8; cursor: not-allowed; }
        .mode-btn { background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid #334155; padding: 10px 20px; border-radius: 8px; cursor: pointer; transition: 0.3s; font-weight: bold;}
        .mode-btn.active { background: rgba(139,92,246,0.2); color: #a78bfa; border-color: #8b5cf6; }
        .library-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; transition: 0.3s; cursor: pointer; position: relative;}
        .library-card:hover { border-color: #00f2ff; background: rgba(0,242,255,0.05); transform: translateY(-3px);}
        .hud-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
        .countdown-anim { animation: popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) infinite; }
        @keyframes popIn { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
      `}</style>
      
      {/* 🚀 FASE 0: BIBLIOTECA (PERSISTENCIA) */}
      {appState === 'LIBRARY' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '5vh 5vw', maxWidth: '1200px', margin: '0 auto', width: '100%', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
              <h1 style={{ color: '#fff', fontWeight: '900', margin: 0 }}><i className="fas fa-book-open me-3" style={{ color: '#00f2ff' }}></i>{UI.library}</h1>
              <button onClick={() => setAppState('SETUP')} className="cyber-button" style={{ padding: '12px 25px', borderRadius: '8px' }}>
                <i className="fas fa-plus"></i> {UI.upload}
              </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
             {library.length === 0 ? (
                 <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#64748b' }}>
                    <i className="fas fa-ghost fa-4x mb-3"></i>
                    <p>No hay manuscritos en la memoria.</p>
                 </div>
             ) : library.map(book => {
                 const pct = Math.round((book.progressIndex / book.tokens.length) * 100) || 0;
                 return (
                 <div key={book.id} className="library-card" onClick={() => handleResumeBook(book)}>
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                       <button onClick={(e) => handleDeleteBook(e, book.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }} title={UI.delete}>
                         <i className="fas fa-trash-alt"></i>
                       </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                       <div style={{ width: '50px', height: '60px', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '10px' }}>PDF</div>
                       <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>{book.title}</h3>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>
                       <span>{UI.progress}</span>
                       <span style={{ color: '#00f2ff', fontWeight: 'bold' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: '#1e293b', borderRadius: '2px', overflow: 'hidden' }}>
                       <div style={{ width: `${pct}%`, height: '100%', background: '#00f2ff' }}></div>
                    </div>
                    <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#64748b' }}>
                        <i className="far fa-clock me-1"></i> Última lectura: {new Date(book.lastRead).toLocaleDateString()}
                    </div>
                 </div>
             )})}
          </div>
        </div>
      )}

      {/* 🚀 FASE 1: SETUP NUEVO LIBRO */}
      {appState === 'SETUP' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '5vh 5vw', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          <button className="mode-btn" onClick={() => setAppState('LIBRARY')} style={{ alignSelf: 'flex-start', marginBottom: '20px' }}>
             <i className="fas fa-arrow-left"></i> {UI.library}
          </button>
          
          <div className="glass-panel" style={{ borderRadius: '16px', padding: '30px', textAlign: 'center', marginBottom: '20px' }}>
            <input type="file" accept=".txt,.pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
            <label htmlFor="file-upload" className="cyber-button" style={{ padding: '15px 30px', borderRadius: '8px', display: 'inline-flex', cursor: 'pointer' }}>
              {isParsing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-upload"></i>}
              {isParsing ? UI.parsing : UI.upload}
            </label>
          </div>

          <textarea 
            value={rawText} onChange={(e) => { setRawText(e.target.value); setNewBookTitle("Texto Directo " + new Date().toLocaleTimeString()); }}
            className="glass-panel"
            style={{ flex: 1, width: '100%', borderRadius: '12px', padding: '20px', color: '#e2e8f0', fontSize: '1rem', resize: 'none', outline: 'none' }}
            placeholder={UI.paste}
          />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
             <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} onClick={() => setReadMode('ORP')}><i className="fas fa-crosshairs me-2"></i> {UI.modeORP}</button>
             <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} onClick={() => setReadMode('BIONIC')}><i className="fas fa-bold me-2"></i> {UI.modeBionic}</button>
             <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} onClick={() => setReadMode('CHUNK')}><i className="fas fa-layer-group me-2"></i> {UI.modeChunk}</button>
          </div>

          <button onClick={prepareImmersionNew} disabled={isParsing || !rawText.trim()} className="cyber-button" style={{ padding: '20px', borderRadius: '12px', fontSize: '1.2rem', marginTop: '20px' }}>
            <i className="fas fa-rocket"></i> {UI.start}
          </button>
        </div>
      )}

      {/* 🚀 FASE 2: PREPARACIÓN (COUNTDOWN) */}
      {appState === 'PREPARING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           <h2 style={{ color: '#94a3b8', letterSpacing: '4px', marginBottom: '20px' }}>{newBookTitle.toUpperCase()}</h2>
           <div className="countdown-anim" style={{ fontSize: '150px', fontWeight: '900', color: '#00f2ff', textShadow: '0 0 40px rgba(0,242,255,0.8)' }}>
             {countdown}
           </div>
        </div>
      )}

      {/* 🚀 FASE 3: INMERSIÓN RSVP / BIONIC / CHUNK */}
      {appState === 'READING' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', cursor: 'pointer' }} onClick={togglePlay}>
          
          {/* HEADER TÁCTICO */}
          <div className="controls-layer" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', zIndex: 10 }}>
            <button className="mode-btn" onClick={(e) => { e.stopPropagation(); setAppState('LIBRARY'); setIsPlaying(false); }}>
              <i className="fas fa-chevron-left"></i> <span className="d-none d-md-inline">{UI.library}</span>
            </button>
            
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div className="d-none d-md-flex" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  <i className="fas fa-hourglass-half me-1"></i> <strong style={{ color: '#fff' }}>{getEstimatedTimeLeft()}</strong>
                </div>
                <div style={{ color: '#a78bfa', fontFamily: 'monospace', fontWeight: 'bold', background: 'rgba(139, 92, 246, 0.1)', padding: '5px 15px', borderRadius: '20px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  {currentIndex} / {tokens.length}
                </div>
                <button onClick={(e) => openAIClass(e)} className="cyber-button" style={{ padding: '8px 15px', borderRadius: '6px', fontSize: '0.9rem' }}>
                  <i className="fas fa-robot"></i> <span className="d-none d-md-inline">{UI.aiClassBtn}</span>
                </button>
            </div>
          </div>

          {/* LIENZO DE LECTURA */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            {readMode === 'ORP' && (
              <>
                <div style={{ position: 'absolute', top: '50%', left: '10vw', right: '10vw', height: '1px', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'absolute', top: '20%', bottom: '20%', left: '50%', width: '1px', background: 'rgba(0,242,255,0.03)', pointerEvents: 'none' }}></div>
              </>
            )}

            {!isPlaying && (
              <div className="hud-pulse" style={{ position: 'absolute', top: '15%', color: '#ffaa00', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '8px' }}>
                <i className="fas fa-pause me-3"></i>{UI.pause}
              </div>
            )}

            <div style={{ fontSize: readMode === 'CHUNK' ? 'clamp(30px, 6vw, 70px)' : 'clamp(40px, 8vw, 100px)', fontFamily: "'Lora', 'Georgia', serif", width: '100%', maxWidth: '1200px', padding: '0 20px', textAlign: 'center' }}>
              {renderReadingContent()}
            </div>
          </div>

          {/* CONTROLES DE REPRODUCCIÓN */}
          <div className="controls-layer" style={{ padding: '20px 40px 40px 40px', background: 'linear-gradient(transparent, #020617 80%)', zIndex: 10 }}>
            <div style={{ width: '100%', height: '4px', background: '#0f172a', borderRadius: '2px', marginBottom: '25px', position: 'relative' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: '#a78bfa', transition: 'width 0.1s linear', boxShadow: '0 0 10px #a78bfa' }}></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                   <button className="mode-btn" onClick={(e) => { e.stopPropagation(); skipBackward(); }}><i className="fas fa-backward"></i></button>
                   <button className="cyber-button" onClick={(e) => { e.stopPropagation(); togglePlay(); }} style={{ padding: '15px 30px', borderRadius: '50px', fontSize: '1.2rem', background: '#8b5cf6', color: '#fff' }}>
                     {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
                   </button>
                   <button className="mode-btn" onClick={(e) => { e.stopPropagation(); skipForward(); }}><i className="fas fa-forward"></i></button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '800px', background: 'rgba(15,23,42,0.5)', padding: '15px 25px', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                     <button className={`mode-btn ${readMode === 'ORP' ? 'active' : ''}`} style={{padding: '5px 10px', fontSize: '0.8rem'}} onClick={(e) => { e.stopPropagation(); setReadMode('ORP');}}>ORP</button>
                     <button className={`mode-btn ${readMode === 'BIONIC' ? 'active' : ''}`} style={{padding: '5px 10px', fontSize: '0.8rem'}} onClick={(e) => { e.stopPropagation(); setReadMode('BIONIC');}}>BIO</button>
                     <button className={`mode-btn ${readMode === 'CHUNK' ? 'active' : ''}`} style={{padding: '5px 10px', fontSize: '0.8rem'}} onClick={(e) => { e.stopPropagation(); setReadMode('CHUNK');}}>CHK</button>
                  </div>
                  
                  <div style={{ color: '#fff', fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
                    {wpm} <span style={{fontSize: '0.7rem', color: '#94a3b8'}}>{UI.wpm}</span>
                  </div>
                  <input 
                    type="range" min="100" max="1500" step="10" value={wpm} 
                    onChange={(e) => { e.stopPropagation(); setWpm(Number(e.target.value)); }}
                    style={{ flex: 1, accentColor: '#8b5cf6', height: '6px', minWidth: '150px' }}
                  />
                  {readMode === 'CHUNK' && (
                     <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <select value={chunkSize} onChange={(e) => { e.stopPropagation(); setChunkSize(Number(e.target.value)); }} style={{ background: '#020617', color: '#a78bfa', border: '1px solid #a78bfa', borderRadius: '5px', padding: '5px', outline: 'none' }}>
                           <option value={1}>x1</option><option value={2}>x2</option><option value={3}>x3</option><option value={4}>x4</option>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '5vh 5vw', maxWidth: '800px', margin: '0 auto', width: '100%', justifyContent: 'center' }}>
           <h1 style={{ color: '#a78bfa', textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: '900' }}>
             <i className="fas fa-chart-line me-3"></i> {UI.statsTitle}
           </h1>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #00f2ff' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>{UI.statsWords}</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>{tokens.length}</div>
              </div>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #ff0055' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>{UI.statsTime}</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.floor(totalReadingTime / 60000)}m {Math.floor((totalReadingTime % 60000) / 1000)}s
                 </div>
              </div>
              <div className="glass-panel" style={{ textAlign: 'center', borderTop: '4px solid #ffea00' }}>
                 <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '10px' }}>{UI.statsWPM}</div>
                 <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.round((tokens.length / (totalReadingTime / 1000)) * 60) || 0}
                 </div>
              </div>
           </div>
           <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button className="cyber-button" onClick={() => setAppState('LIBRARY')} style={{ padding: '15px 40px', fontSize: '1.2rem', background: '#8b5cf6', color: '#fff' }}>
                <i className="fas fa-book"></i> {UI.library}
              </button>
           </div>
        </div>
      )}

      {/* 🚀 FASE 5: CLASE SOCRÁTICA IA */}
      {appState === 'AI_CLASS' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
            <h2 style={{ color: '#00f2ff', margin: 0, fontWeight: '900', textTransform: 'uppercase' }}><i className="fas fa-brain me-2"></i> {UI.aiTitle}</h2>
            <button onClick={closeAIClass} className="cyber-button" style={{ padding: '10px 20px', borderRadius: '6px' }}><i className="fas fa-play me-2"></i> {UI.closing}</button>
          </div>
          <div className="glass-panel" style={{ borderLeft: `4px solid #00f2ff`, padding: '20px', borderRadius: '0 12px 12px 0', marginBottom: '30px', color: '#cbd5e1', fontStyle: 'italic', fontSize: '1.1rem' }}>
            "...{tokens.slice(Math.max(0, currentIndex - 30), currentIndex + 10).join(' ')}..."
          </div>
          <form onSubmit={queryAI} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
            <input type="text" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} className="glass-panel" style={{ flex: 1, padding: '15px', color: '#fff', fontSize: '1rem', outline: 'none' }} placeholder="¿Dudas sobre el texto?" />
            <button type="submit" disabled={isAiThinking} className="cyber-button" style={{ padding: '0 25px', borderRadius: '8px' }}>
              {isAiThinking ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </form>
          {aiResponse && !isAiThinking && (
            <div className="glass-panel" style={{ padding: '30px', borderTop: '4px solid #00f2ff' }}>
              <div style={{ color: '#00f2ff', marginBottom: '15px', fontWeight: '900' }}><i className="fas fa-robot me-2"></i> Tutor IA:</div>
              <MarkdownParser text={aiResponse} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}