import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGameStore } from '../../store/useGameStore'; // HUB Integration

/* ============================================================
   🌌 CONSTANTES Y CREDENCIALES DEEPSEEK (GOD TIER)
============================================================ */
const DEEPSEEK_API_KEY = "sk-00d037be16824fbb8bf780bb635c3370";
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
   🧠 2. MOTOR DEEPSEEK (GENERACIÓN 100% ICFES SIN HARDCODEO)
============================================================ */
const LANG_MAP = { es: "SPANISH", en: "ENGLISH", fr: "FRENCH", de: "GERMAN" };

class DeepSeekEngine {
  static cleanJSON(raw) {
    try {
      let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        cleaned = cleaned.substring(start, end + 1);
      }
      try { return JSON.parse(cleaned); } catch (parseError) {
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

  static async generateQuestion(lang, forcedTopic = null, retries = 2) {
    // Espectro completo de temas evaluados por el ICFES en Química
    const topics = [ 
        'TERMODINÁMICA_Y_GASES_IDEALES', 
        'ESTEQUIOMETRÍA_Y_CONSERVACIÓN_DE_MASA', 
        'SEPARACIÓN_DE_MEZCLAS', 
        'EQUILIBRIO_ÁCIDO_BASE_Y_PH', 
        'ENLACES_QUÍMICOS_Y_PROPIEDADES', 
        'QUÍMICA_ORGÁNICA_Y_GRUPOS_FUNCIONALES', 
        'SOLUCIONES_Y_CONCENTRACIÓN', 
        'CINETICA_QUÍMICA_Y_CATALIZADORES', 
        'OXIDACIÓN_REDUCCIÓN_Y_ELECTROQUÍMICA' 
    ];
    const selectedTopic = forcedTopic || topics[Math.floor(Math.random() * topics.length)];
    const targetLang = LANG_MAP[lang] || "SPANISH";

    // PROMPT GOD TIER: Configurado para generar preguntas tipo ICFES (Explicación de fenómenos, Indagación, Uso de conceptos)
    const sysPrompt = `
      Eres un experto evaluador del examen de Estado ICFES (Colombia) en el área de Ciencias Naturales: Química.
      Genera una pregunta COMPLETAMENTE NUEVA y analítica sobre el tema: "${selectedTopic}".
      Language for the output MUST strictly be: ${targetLang}.
      
      ESTILO DE LA PREGUNTA (CRÍTICO):
      - No pidas cálculos matemáticos simples y directos (como calcular la densidad con masa y volumen).
      - Debes plantear una situación, un experimento, una hipótesis de un estudiante o un contexto de laboratorio.
      - Las opciones de respuesta deben ser analíticas, explicativas o justificativas (ej. "Porque el aumento de temperatura expande el gas...", "Ya que el reactivo limitante se consumió...").
      - Provee 4 opciones, solo 1 correcta. Las otras 3 deben representar errores conceptuales comunes que cometen los estudiantes.
      
      REGLA ABSOLUTA: RESPONDE SOLO CON UN JSON VÁLIDO. NO USES MARKDOWN ALREDEDOR. Usa comillas simples ('') dentro de los textos.
      ESTRUCTURA DEL JSON:
      {
        "id": "${selectedTopic}",
        "topic": "Nombre del tema amigable",
        "text": "Contexto del experimento o situación + La pregunta de análisis...",
        "options": ["Opción A (Analítica)", "Opción B", "Opción C", "Opción D"],
        "correctIdx": 0,
        "hint": "Pista conceptual sin dar la respuesta",
        "microclass": "Explicación detallada del fenómeno físico-químico de por qué esa es la respuesta correcta",
        "trapExplanations": ["", "Explicación del error conceptual B", "Error C", "Error D"]
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.8, max_tokens: 1000, response_format: { type: "json_object" } })
      }, 25000);
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      const parsed = this.cleanJSON(data.choices[0].message.content);
      parsed.isAi = true; 
      return parsed;
    } catch (error) {
      if (retries > 0) return this.generateQuestion(lang, forcedTopic, retries - 1);
      // Fallback de ultra-emergencia en caso de que la API de DeepSeek caiga totalmente
      return {
          id: 'EMERGENCY_FALLBACK', topic: 'QUÍMICA BÁSICA',
          text: `En un laboratorio, un estudiante mezcla agua y aceite, observando que se forman dos fases distintas. Él concluye que hubo una reacción química. ¿Es correcta su conclusión?`,
          options: [
              "No, porque solo se formó una mezcla heterogénea debido a la diferencia de polaridad.",
              "Sí, porque el agua oxidó los enlaces dobles del aceite.",
              "No, porque ambos son líquidos con la misma densidad.",
              "Sí, porque el cambio de color indica formación de nuevos productos."
          ],
          correctIdx: 0, hint: "Las reacciones químicas forman nuevas sustancias. ¿El agua y el aceite cambian su estructura molecular al mezclarse?",
          microclass: "El agua (polar) y el aceite (apolar) no se mezclan ni reaccionan entre sí bajo condiciones normales. Solo forman una mezcla heterogénea que puede separarse por decantación física. No hay ruptura ni formación de enlaces.",
          trapExplanations: [null, "El agua no oxida el aceite a temperatura ambiente.", "Tienen densidades diferentes, por eso el aceite flota.", "No hubo cambio de color ni reacción."],
          isAi: false
      };
    }
  }

  static async generateMasterclass(topic, lang, retries = 2) {
    const targetLang = LANG_MAP[lang] || "SPANISH";
    const sysPrompt = `
      Eres un Profesor Top de Química preparando a un estudiante para el examen ICFES.
      Genera una CLASE MAGISTRAL SIGNIFICATIVA Y DIRECTA sobre el tema: "${topic}".
      Language for the output MUST STRICTLY BE: ${targetLang}.
      Debe enfocarse en cómo el ICFES evalúa este tema (Competencias de Indagación y Explicación de Fenómenos). Máximo 400 palabras en total.

      REGLAS CRÍTICAS DE SISTEMA PARA PREVENIR ERRORES:
      1. RESPONDE SÓLO EN JSON VÁLIDO. NADA DE MARKDOWN FUERA DEL JSON.
      2. ESCAPA TODOS LOS SALTOS DE LÍNEA USANDO \\n DENTRO DE LAS CADENAS DE TEXTO.
      
      ESTRUCTURA EXACTA REQUERIDA:
      {
        "title": "TÍTULO DEL TEMA",
        "theory": "Explicación teórica enfocada en la lógica, no en memorizar fórmulas. (max 150 palabras)",
        "trap": "El distractor analítico típico que el ICFES usa en este tema para confundir.",
        "protocol": "Pasos lógicos para abordar preguntas de este tema.\\n1. ...\\n2. ...",
        "demoQuestion": {
           "text": "Problema analítico tipo ICFES...",
           "options": ["A", "B", "C", "D"],
           "correctIdx": 0,
           "analysis": "Por qué es la correcta basándose en el concepto químico."
        }
      }
    `;

    try {
      const response = await this.fetchWithTimeout(DEEPSEEK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: sysPrompt }], temperature: 0.3, max_tokens: 1200, response_format: { type: "json_object" } })
      }, 30000); 
      
      if(!response.ok) throw new Error("HTTP_ERROR");
      const data = await response.json();
      return this.cleanJSON(data.choices[0].message.content);
    } catch (error) {
      if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); 
          return this.generateMasterclass(topic, lang, retries - 1);
      }
      throw error;
    }
  }
}

/* ============================================================
   🔊 3. MOTOR DE AUDIO SCI-FI (WEB AUDIO API NATIVA)
============================================================ */
class QuantumAudio {
  constructor() { this.ctx = null; this.gainNode = null; this.setupUnlock(); }

  setupUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.init();
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchstart', unlock);
      document.removeEventListener('keydown', unlock);
    };
    document.addEventListener('click', unlock);
    document.addEventListener('touchstart', unlock);
    document.addEventListener('keydown', unlock);
  }

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
   🌍 4. DICCIONARIOS UI Y CONSEJOS 
============================================================ */
const DICT_UI = {
  es: {
      start: "INICIAR EVALUACIÓN ICFES", title: "LABORATORIO ICFES QUÍMICA", 
      scan: "ESCÁNER LÁSER DE PISTAS", aiBtn: "TUTORÍA IA",
      time: "CRONÓMETRO", mastery: "Maestría Cuántica", 
      btnCheck: "SINTETIZAR RESPUESTA", btnNext: "SIGUIENTE PREGUNTA ➔",
      btnRetrySame: "REINTENTAR MATRIZ ➔", 
      correctTitle: "¡ANÁLISIS PERFECTO!", wrongTitle: "RUPTURA COGNITIVA",
      statsBtn: "TELEMETRÍA", theoryText: "ENTORNO DE CONCENTRACIÓN PROFUNDA (DEEP FOCUS) ACTIVADO. No hay distracciones visuales. Las preguntas generadas por DeepSeek están calibradas a las competencias del ICFES: Indagación, Uso de conceptos y Explicación de fenómenos.",
      timeout: "¡COLAPSO TÉRMICO (TIEMPO AGOTADO)!", topic: "DOMINIO ACTIVO", 
      dashboard: "DASHBOARD DE TELEMETRÍA GLOBAL", avgTime: "Tiempo Medio de Reacción",
      btnRetry: "PURGAR CACHÉ", aiSocraticBtn: "SOLICITAR CLASE MAGISTRAL IA",
      socraticModal: "LA IA HA DETECTADO FALLOS EN:", aiPraise: "¡RENDIMIENTO PERFECTO! NO HAY DEBILIDADES.",
      aiSelectTopic: "Selecciona el dominio a repasar:", aiClose: "CERRAR SESIÓN IA",
      downloadReport: "DESCARGAR INFORME TÁCTICO",
      loadingData: "ESTABLECIENDO CONEXIÓN NEURONAL DEEPSEEK...",
  },
  en: {
      start: "START ICFES EVALUATION", title: "ICFES CHEMISTRY LAB", scan: "LASER INQUIRY SCANNER", aiBtn: "AI TUTOR", time: "CHRONOMETER", mastery: "Quantum Mastery", btnCheck: "SYNTHESIZE ANSWER", btnNext: "NEXT QUESTION ➔", btnRetrySame: "RETRY MATRIX ➔", correctTitle: "PERFECT ANALYSIS!", wrongTitle: "COGNITIVE RUPTURE", statsBtn: "TELEMETRY", theoryText: "DEEP FOCUS ENVIRONMENT ACTIVATED. No visual distractions. Questions generated by DeepSeek are calibrated to ICFES competencies: Inquiry, Use of concepts, and Explanation of phenomena.", timeout: "THERMAL COLLAPSE!", topic: "ACTIVE DOMAIN", dashboard: "GLOBAL TELEMETRY DASHBOARD", avgTime: "Avg Reaction Time", btnRetry: "PURGE CACHE", aiSocraticBtn: "REQUEST AI MASTERCLASS", socraticModal: "AI HAS DETECTED FAILURES IN:", aiPraise: "PERFECT PERFORMANCE!", aiSelectTopic: "Select the domain to review:", aiClose: "CLOSE AI SESSION", downloadReport: "DOWNLOAD TACTICAL REPORT", loadingData: "ESTABLISHING DEEPSEEK NEURAL LINK...",
  }
};

const DICT_REPORT = {
    es: {
        docTitle: "DOSSIER TÁCTICO ICFES", docSub: "SIMULACIÓN CUÁNTICA DE QUÍMICA",
        dateLabel: "Fecha de Extracción", kpiTitle: "MÉTRICAS GLOBALES DE RENDIMIENTO",
        kpiAcc: "Precisión Neuronal", kpiTime: "Tiempo de Reacción", kpiTotal: "Matrices Resueltas",
        aiTitle: "VEREDICTO DEL SISTEMA DE INTELIGENCIA ARTIFICIAL",
        aiVuln: "⚠️ VULNERABILIDADES TÁCTICAS DETECTADAS",
        aiVulnDesc: "El operador muestra deficiencias críticas en las siguientes competencias químicas:",
        aiAction: "PLAN DE ACCIÓN DE IA",
        aiActionDesc: "Es imperativo solicitar el módulo 'Masterclass IA' dentro del simulador para re-entrenar el análisis de fenómenos en estos temas.",
        aiOpt: "✅ RENDIMIENTO ÓPTIMO ALCANZADO",
        aiOptDesc: "No se detectan vulnerabilidades críticas. El operador está calificado y listo para enfrentar escenarios ICFES de alta complejidad.",
        aiNoData: "Datos biométricos insuficientes. El operador debe completar más simulaciones.",
        topicTitle: "DESGLOSE MICRO-ANALÍTICO POR DOMINIO", topicNoData: "Aún no se han procesado suficientes dominios químicos.",
        topicHit: "Aciertos", topicMiss: "Fallos",
        footer: "DOCUMENTO CLASIFICADO GENERADO POR LEARNING LABS ENGINE V30.0", footerSub: "Entorno Deep Focus: El conocimiento es la única ventaja táctica inquebrantable."
    },
    en: {
        docTitle: "ICFES TACTICAL DOSSIER", docSub: "QUANTUM CHEMISTRY SIMULATION",
        dateLabel: "Extraction Date", kpiTitle: "GLOBAL PERFORMANCE METRICS",
        kpiAcc: "Neural Accuracy", kpiTime: "Reaction Time", kpiTotal: "Matrices Solved",
        aiTitle: "ARTIFICIAL INTELLIGENCE SYSTEM VERDICT",
        aiVuln: "⚠️ TACTICAL VULNERABILITIES DETECTED",
        aiVulnDesc: "The operator shows critical deficiencies in the following chemical competencies:",
        aiAction: "AI ACTION PLAN",
        aiActionDesc: "It is imperative to request the 'AI Masterclass' module within the simulator to retrain phenomena analysis on these topics.",
        aiOpt: "✅ OPTIMAL PERFORMANCE ACHIEVED",
        aiOptDesc: "No critical vulnerabilities detected. The operator is qualified and ready to face high-complexity ICFES scenarios.",
        aiNoData: "Insufficient biometric data. Complete more simulations.",
        topicTitle: "MICRO-ANALYTICAL DOMAIN BREAKDOWN", topicNoData: "Not enough chemical domains processed yet.",
        topicHit: "Hits", topicMiss: "Misses",
        footer: "CLASSIFIED DOCUMENT GENERATED BY LEARNING LABS ENGINE V30.0", footerSub: "Deep Focus Environment: Knowledge is the only unbreakable tactical advantage."
    }
};

const TIPS_DB = {
  es: [
    "COMPETENCIA ICFES: En preguntas de Indagación, fíjate en las variables de las gráficas. La respuesta siempre está en la relación entre el Eje X y el Eje Y.",
    "TRUCO ICFES: Cuando te hablen de reactivo limitante, no importa cuál pesa más en gramos, sino cuál se acaba primero según los coeficientes molares.",
    "OJO: Las propiedades intensivas (como densidad o punto de ebullición) NO cambian sin importar si tienes 1 gramo o 1 tonelada de la sustancia.",
    "ESTRATEGIA: En termodinámica, las moléculas no desaparecen al enfriarse, solo se mueven más lento (menor energía cinética).",
    "CONCEPTO: Mezclar dos líquidos de diferentes densidades no suma las densidades. La mezcla resultante siempre tendrá una densidad intermedia."
  ],
  en: [
    "ICFES COMPETENCY: In Inquiry questions, look at the graph variables. The answer is always in the relationship between the X and Y axes.",
    "ICFES TRICK: Limiting reactant isn't about which weighs more in grams, but which runs out first based on molar coefficients.",
    "WATCH OUT: Intensive properties (like density) DO NOT change whether you have 1 gram or 1 ton of the substance.",
    "STRATEGY: In thermodynamics, molecules don't disappear when cooled, they just move slower (lower kinetic energy).",
    "CONCEPT: Mixing two liquids of different densities doesn't add the densities. The mixture will always have an intermediate density."
  ]
};

/* ============================================================
   🎥 5. COMPONENTE DE CARGA (INTERMISSION) CSS PURO (DEEP FOCUS)
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
        <div style={{ position:'absolute', inset:0, zIndex:3000, background:'#020617', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px', textAlign: 'center' }}>
            {/* CSS Spinner Minimalista */}
            <div style={{ width: '60px', height: '60px', border: '4px solid rgba(0, 242, 255, 0.1)', borderTop: '4px solid #00f2ff', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '30px' }}></div>
            
            <h1 style={{color:'#00f2ff', fontSize:'clamp(18px, 4vw, 30px)', textShadow:'0 0 20px rgba(0,242,255,0.5)', margin: '0 0 40px 0', letterSpacing: '2px', fontWeight: 'bold'}}>
                {loadingText}
            </h1>
            
            <div style={{ background: 'rgba(255, 170, 0, 0.05)', borderLeft: '4px solid #ffaa00', padding: '30px', maxWidth: '800px', width: '100%', borderRadius: '0 10px 10px 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ color: '#ffaa00', fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>💡 ICFES SURVIVAL TIP</div>
                <div style={{ color: '#e2e8f0', fontSize: 'clamp(16px, 3vw, 20px)', minHeight: '80px', transition: 'opacity 0.5s ease', lineHeight: '1.6' }}>
                    {tips[tipIdx]}
                </div>
                <div style={{position: 'absolute', bottom: 0, left: 0, height: '3px', background: '#ffaa00', width: '100%', animation: 'shrink 8s linear infinite'}}></div>
            </div>
            
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes shrink { 0% { width: 100%; } 100% { width: 0%; } }
            `}</style>
        </div>
    );
};

/* ============================================================
   🤖 6. COMPONENTE MASTERCLASS DEEPSEEK (UX GOD TIER)
============================================================ */
const MarkdownParser = ({ text }) => {
    const htmlContent = useMemo(() => {
        if (!text) return { __html: "" };
        let parsed = text;
        parsed = parsed.replace(/### (.*)/g, '<h3 style="color:#00f2ff; margin-top:30px; border-bottom:1px solid rgba(0,242,255,0.3); padding-bottom:5px; font-size: 24px;">$1</h3>');
        parsed = parsed.replace(/## (.*)/g, '<h2 style="color:#ffea00; margin-top:25px; font-size: 26px;">$1</h2>');
        parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffaa00;">$1</strong>');
        parsed = parsed.replace(/\\n/g, '<br/>'); 
        parsed = parsed.replace(/\n/g, '<br/>'); 
        return { __html: parsed };
    }, [text]);

    return <div dangerouslySetInnerHTML={htmlContent} style={{ color: '#cbd5e1', fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.8', fontFamily: 'Inter, sans-serif' }} />;
};

const SocraticMasterclass = ({ topic, lang, onBack, onClose, UI }) => {
    const [classData, setClassData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [loadText, setLoadText] = useState("> ESTABLECIENDO CONEXIÓN CUÁNTICA DEEPSEEK...");
    
    const loadClass = useCallback(async () => {
        let isMounted = true;
        setIsGenerating(true);

        const t1 = setTimeout(() => { if(isMounted) setLoadText("> ANALIZANDO ESTRUCTURA ICFES PARA EL TEMA: " + topic.replace(/_/g, ' ')); }, 2000);
        const t2 = setTimeout(() => { if(isMounted) setLoadText("> SINTETIZANDO NÚCLEO TEÓRICO ANALÍTICO..."); }, 5000);
        const t3 = setTimeout(() => { if(isMounted) setLoadText("> COMPILANDO DATOS PEDAGÓGICOS..."); }, 10000);

        try {
            const content = await DeepSeekEngine.generateMasterclass(topic, lang);
            if (isMounted) {
                setClassData(content);
                setIsGenerating(false);
                sfx.success();
            }
        } catch (err) {
            console.error("DeepSeek Error. Usando Fallback.", err);
            if (isMounted) {
                const fallbackClass = IcfesEngine.generateLocalMasterclass(topic, lang);
                setClassData(fallbackClass);
                setIsGenerating(false);
                sfx.success();
            }
        }
            
        return () => { 
            isMounted = false; 
            clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
        };
    }, [topic, lang]);

    useEffect(() => {
        const cleanup = loadClass();
        return () => { if (cleanup && cleanup.then) cleanup.then(c => { if (c) c() }); };
    }, [loadClass]);

    if (isGenerating) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'left', minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ color: '#0f0', fontFamily: 'monospace', fontSize: 'clamp(16px, 3vw, 20px)', lineHeight: '2' }}>
                    <p style={{marginBottom: '20px', color: '#ffaa00', fontSize: '24px', fontWeight: 'bold'}} className="hud-pulse">{loadText}</p>
                    <p style={{color: '#64748b'}}>_ Operación: Socratic Overdrive</p>
                    <p style={{color: '#64748b'}}>_ Destino: Neural Net DeepSeek-Chat</p>
                    <p style={{color: '#64748b'}}>_ Status: Aguardando carga útil (Payload)...</p>
                </div>
            </div>
        );
    }

    if (!classData) return null;

    return (
        <div style={{ padding: 'clamp(10px, 3vw, 30px)' }}>
           <h2 style={{color:'#ff00ff', fontSize:'clamp(24px, 5vw, 36px)', textAlign:'center', borderBottom:'2px solid rgba(255,0,255,0.3)', paddingBottom:'20px', marginTop: 0, textTransform: 'uppercase', letterSpacing: '1px'}}>🎓 {classData.title || topic.replace(/_/g, ' ')}</h2>
           
           <div style={{ display: 'grid', gap: '30px', marginTop: '40px' }}>
              <div style={{ borderLeft: '4px solid #00f2ff', padding: '25px', background: 'rgba(0,242,255,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#00f2ff', marginTop: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap:'10px'}}>📚 NÚCLEO TEÓRICO Y ANÁLISIS</h3>
                 <MarkdownParser text={classData.theory} />
              </div>
              
              <div style={{ borderLeft: '4px solid #f00', padding: '25px', background: 'rgba(255,0,0,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#f00', marginTop: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap:'10px'}}>⚠️ TRAMPA COGNITIVA ICFES</h3>
                 <MarkdownParser text={classData.trap} />
              </div>

              <div style={{ borderLeft: '4px solid #ffea00', padding: '25px', background: 'rgba(255,234,0,0.03)', borderRadius: '0 12px 12px 0' }}>
                 <h3 style={{color: '#ffea00', marginTop: 0, fontSize: '20px', display: 'flex', alignItems: 'center', gap:'10px'}}>⚙️ PROTOCOLO DE RESOLUCIÓN INFALIBLE</h3>
                 <MarkdownParser text={classData.protocol} />
              </div>
           </div>

           {classData.demoQuestion && (
               <div style={{ marginTop: '50px', border: '2px solid rgba(0,255,0,0.3)', borderRadius: '15px', padding: 'clamp(20px, 4vw, 40px)', background: 'rgba(0,20,5,0.4)', boxShadow: '0 0 30px rgba(0,255,0,0.05)' }}>
                   <h3 style={{color: '#0f0', textAlign: 'center', marginTop: 0, fontSize: '24px'}}>🧪 SIMULACIÓN PRÁCTICA GENERADA</h3>
                   <p style={{color: '#64748b', fontSize: '14px', textAlign: 'center', fontStyle: 'italic', marginBottom:'30px'}}>Matriz matemática calculada en tiempo real.</p>
                   
                   <div style={{ color: '#fff', fontSize: 'clamp(18px, 3.5vw, 22px)', lineHeight: '1.6', background: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
                       {classData.demoQuestion.text}
                   </div>
                   
                   <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {classData.demoQuestion.options.map((opt, idx) => {
                          const isCorrect = idx === classData.demoQuestion.correctIdx;
                          return (
                              <div key={idx} style={{ padding: '20px', border: isCorrect ? '2px solid #0f0' : '1px solid #333', background: isCorrect ? 'rgba(0,255,0,0.05)' : 'transparent', color: isCorrect ? '#0f0' : '#94a3b8', borderRadius: '10px', fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: isCorrect ? 'bold' : 'normal' }}>
                                  {String.fromCharCode(65 + idx)}. {opt} {isCorrect && " ➔ (Respuesta Correcta)"}
                              </div>
                          );
                      })}
                   </div>
                   
                   <div style={{ marginTop: '30px', padding: '25px', background: 'rgba(0,255,0,0.03)', color: '#0f0', borderRadius: '10px', borderLeft: '4px solid #0f0', fontSize: 'clamp(16px, 3vw, 18px)', lineHeight: '1.8' }}>
                       <strong style={{fontSize: '20px', color: '#10b981'}}>ANÁLISIS DEL RESULTADO:</strong><br/><br/>
                       <MarkdownParser text={classData.demoQuestion.analysis} />
                   </div>
               </div>
           )}

           <div style={{display:'flex', gap:'20px', marginTop:'60px', flexWrap: 'wrap'}}>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'#334155', color:'#fff', boxShadow: 'none', fontSize: '18px', padding: '20px'}} onClick={onBack}>VOLVER A TEMAS</button>
               <button className="hud-btn" style={{flex: '1 1 200px', background:'transparent', border: '2px solid #ff00ff', color:'#ff00ff', boxShadow: '0 0 20px rgba(255,0,255,0.2)', fontSize: '18px', padding: '20px'}} onClick={onClose}>{UI.aiClose}</button>
           </div>
        </div>
    )
}

/* ============================================================
   🎮 7. APLICACIÓN PRINCIPAL (PHANTOM QUEUE Y DEEP FOCUS)
============================================================ */

const getInitialStats = () => {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('icfes_telemetry_quimica_v8'); 
    if (saved) return JSON.parse(saved);
  }
  return {
      totalQ: 0,
      correctQ: 0,
      totalTime: 0,
      topics: {
          'TERMODINÁMICA_Y_GASES_IDEALES': { c: 0, w: 0 },
          'ESTEQUIOMETRÍA_Y_CONSERVACIÓN_DE_MASA': { c: 0, w: 0 },
          'SEPARACIÓN_DE_MEZCLAS': { c: 0, w: 0 },
          'EQUILIBRIO_ÁCIDO_BASE_Y_PH': { c: 0, w: 0 },
          'ENLACES_QUÍMICOS_Y_PROPIEDADES': { c: 0, w: 0 },
          'QUÍMICA_ORGÁNICA_Y_GRUPOS_FUNCIONALES': { c: 0, w: 0 },
          'SOLUCIONES_Y_CONCENTRACIÓN': { c: 0, w: 0 },
          'CINETICA_QUÍMICA_Y_CATALIZADORES': { c: 0, w: 0 },
          'OXIDACIÓN_REDUCCIÓN_Y_ELECTROQUÍMICA': { c: 0, w: 0 }
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

  const [phase, setPhase] = useState("BOOT"); 
  const [currentQData, setCurrentQData] = useState(null); 
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [xp, setXp] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [timerActive, setTimerActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  
  const [pendingAIQ, setPendingAIQ] = useState(null);
  const isFetchingAI = useRef(false); 

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
      window.localStorage.setItem('icfes_telemetry_quimica_v8', JSON.stringify(stats));
    }
  }, [stats]);

  const currentQ = useMemo(() => {
      if (!currentQData) return null;
      if (currentQData.texts) {
          // Si es del fallback local, resolvemos el idioma
          const d = currentQData.texts[safeLang] || currentQData.texts['es'];
          let displayOptions = currentQData.options;
          if (currentQData.optionsKeys) displayOptions = currentQData.optionsKeys.map(k => d.opts[k]);
          return { ...currentQData, topic: d.topic, text: d.text, options: displayOptions, hint: d.hint, microclass: d.micro, trapExplanations: d.traps };
      }
      // Si es de IA (DeepSeek), ya viene listo en el idioma solicitado
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
    } else if (timeLeft === 0 && phase === "GAME") {
        handleFailTimeout();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, phase]);

  // Transición suave de LOADING a GAME cuando la IA devuelve la pregunta
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

  // Fetch asíncrono a DeepSeek
  const fetchAIQuestionBackground = useCallback(async (forcedTopic) => {
      if (isFetchingAI.current) return;
      isFetchingAI.current = true;
      try {
          const q = await DeepSeekEngine.generateQuestion(safeLang, forcedTopic);
          if (isMounted.current) setPendingAIQ(q);
      } catch (e) {
          console.warn("DeepSeek Fallback Triggered.");
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

      // Si no hay pregunta pendiente en cola, mostramos el cargador
      setPhase("LOADING");
      setScannerActive(false);
      setHintUsed(false);
      setShowAiModal(false);
      setActiveAiTopic(null);
      
      fetchAIQuestionBackground(forcedTopic);

  }, [safeLang, stats.needsReview, pendingAIQ, fetchAIQuestionBackground]);

  const retrySameQuestion = useCallback(() => {
      sfx.click();
      setSelectedOpt(null);
      setTimeLeft(MAX_TIME); 
      setPhase("GAME"); 
      setTimerActive(true); 
  }, []);

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

      if (phase === "GAME") {
          const timeTaken = MAX_TIME - timeLeft;
          updateStats(isCorrect, timeTaken);
      }

      if (isCorrect) {
          sfx.success();
          setXp(p => p + (hintUsed ? 100 : 200)); 
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
      if (phase === "GAME") {
          setSavedTime(timeLeft);
          setTimerActive(false);
      }
      setPhase("STATS");
  };

  const closeTelemetry = () => {
      sfx.click();
      setPhase(previousPhase);
      if (previousPhase === "GAME") {
          setTimeLeft(savedTime);
          setTimerActive(true); 
      }
  };

  const handleNextPhase = () => {
      if (phase === "CORRECT") {
          if (!pendingAIQ) {
              setPhase("LOADING");
          } else {
              generateNew(); 
          }
      } else if (phase === "MICROCLASS") {
          retrySameQuestion(); 
      }
  };

  // =========================================================
  // SISTEMA DE IMPRESIÓN DEL DOSSIER TÁCTICO
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
              const translatedName = IcfesEngine.getTopicName(topicId, safeLang);
              topicsHtml += `
                <div style="margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: #0f172a;">${translatedName}</div>
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${REPORT_UI.topicHit}: <span style="color:#10b981; font-weight:bold;">${t.c}</span> | ${REPORT_UI.topicMiss}: <span style="color:#ef4444; font-weight:bold;">${t.w}</span></div>
                    </div>
                    <div style="font-size: 18px; font-weight: 900; color: ${pct >= 60 ? '#10b981' : '#ef4444'};">${pct}%</div>
                </div>
              `;
              if (pct >= 60) strong.push(translatedName);
              else weak.push(translatedName);
          }
      });

      let aiVeredict = '';
      if (weak.length > 0) {
          aiVeredict = `
            <div style="background-color: #fef2f2; border-left: 5px solid #ef4444; padding: 15px; border-radius: 4px;">
                <div style="color: #b91c1c; font-weight: 900; font-size: 16px; margin-bottom: 8px;">${REPORT_UI.aiVuln}</div>
                <p style="color: #7f1d1d; margin: 0 0 10px 0; font-size: 13px;">${REPORT_UI.aiVulnDesc}</p>
                <ul style="color: #991b1b; margin: 0 0 15px 0; font-weight: bold; font-size: 13px;">
                    ${weak.map(w => `<li style="margin-bottom: 4px;">${w}</li>`).join('')}
                </ul>
                <div style="background-color: #fee2e2; padding: 10px; border-radius: 4px; border: 1px dashed #fca5a5; font-size: 13px;">
                    <strong style="color: #991b1b;">${REPORT_UI.aiAction}:</strong> ${REPORT_UI.aiActionDesc}
                </div>
            </div>`;
      } else if (strong.length > 0) {
          aiVeredict = `
            <div style="background-color: #f0fdf4; border-left: 5px solid #10b981; padding: 15px; border-radius: 4px;">
                <div style="color: #047857; font-weight: 900; font-size: 16px; margin-bottom: 8px;">${REPORT_UI.aiOpt}</div>
                <p style="color: #065f46; margin: 0; font-size: 13px;">${REPORT_UI.aiOptDesc}</p>
            </div>`;
      } else {
          aiVeredict = `<div style="color: #64748b; font-style: italic; padding: 15px; background: #f8fafc; border-radius: 4px; font-size: 13px;">${REPORT_UI.aiNoData}</div>`;
      }

      const printWindow = window.open('', '', 'height=900,width=850');
      printWindow.document.write(`
          <!DOCTYPE html>
          <html lang="${safeLang}">
              <head>
                  <title>Learning Labs - Tactical Report</title>
                  <style>
                      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                      body { font-family: 'Inter', sans-serif; background-color: #ffffff; color: #0f172a; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .container { max-width: 800px; margin: 0 auto; padding: 40px; }
                      .header { display: flex; align-items: center; border-bottom: 3px solid #00f2ff; padding-bottom: 20px; margin-bottom: 30px; }
                      .title h1 { margin: 0 0 5px 0; color: #0f172a; font-size: 24px; font-weight: 900; text-transform: uppercase; }
                      .title p { margin: 0; color: #64748b; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
                      .timestamp { margin-top: 10px; display: inline-block; background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-size: 11px; color: #475569; font-weight: bold; }
                      .section-title { font-size: 16px; font-weight: 900; color: #0f172a; text-transform: uppercase; margin-bottom: 15px; display: flex; align-items: center; }
                      .section-title::before { content: ''; display: inline-block; width: 10px; height: 10px; background-color: #00f2ff; margin-right: 8px; border-radius: 2px; }
                      .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
                      .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px 15px; text-align: center; }
                      .kpi-val { font-size: 32px; font-weight: 900; color: #0f172a; line-height: 1; margin-bottom: 5px; }
                      .kpi-label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
                      .topics-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
                      .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; font-weight: bold; }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
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
                      <div style="margin-bottom: 30px;">${aiVeredict}</div>
                      <div class="section-title">${REPORT_UI.topicTitle}</div>
                      <div class="topics-container">
                          ${topicsHtml || `<p style="color: #64748b; text-align: center; font-style: italic;">${REPORT_UI.topicNoData}</p>`}
                      </div>
                      <div class="footer">${REPORT_UI.footer}<br/>${REPORT_UI.footerSub}</div>
                  </div>
              </body>
          </html>
      `);
      printWindow.document.close();
      setTimeout(() => { printWindow.focus(); printWindow.print(); }, 750);
  }, [stats, safeLang, REPORT_UI]);

  return (
    <>
      <style>{`
        /* DEEP FOCUS CSS ARCHITECTURE - NO WEBGL/CANVAS REQUIRED */
        .cyber-bg {
            position: absolute;
            inset: 0;
            background-color: #020617; /* Very dark slate blue */
            background-image: 
                radial-gradient(circle at 50% 0%, rgba(0, 242, 255, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 50% 100%, rgba(255, 0, 85, 0.03) 0%, transparent 50%);
            z-index: 0;
            overflow: hidden;
        }
        
        .cyber-grid {
            position: absolute;
            inset: -50%;
            background-image: 
                linear-gradient(rgba(0, 242, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 242, 255, 0.03) 1px, transparent 1px);
            background-size: 40px 40px;
            transform: perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px);
            pointer-events: none;
        }

        .hud-btn { padding: clamp(12px, 2vw, 15px) clamp(20px, 4vw, 30px); background: transparent; color: #00f2ff; font-weight: 700; font-size: clamp(14px, 2vw, 18px); cursor: pointer; border-radius: 8px; border: 1px solid #00f2ff; font-family: 'Inter', sans-serif; transition: 0.2s; text-transform: uppercase; letter-spacing: 1px; }
        .hud-btn:hover { background: rgba(0,242,255,0.1); box-shadow: 0 0 15px rgba(0,242,255,0.3); transform: translateY(-2px); }
        .hud-btn:disabled { background: transparent; border-color: #334155; color:#64748b; box-shadow: none; cursor:not-allowed; transform: none; }
        
        .opt-btn { display: block; width: 100%; margin: 12px 0; padding: clamp(15px, 2vw, 20px); background: rgba(15, 23, 42, 0.6); border: 1px solid #334155; color: #cbd5e1; font-size: clamp(16px, 2.5vw, 18px); border-radius: 10px; cursor: pointer; text-align: left; transition: 0.2s; font-family: 'Inter', sans-serif; line-height: 1.5; backdrop-filter: blur(10px); }
        .opt-btn:hover { background: rgba(30, 41, 59, 0.8); border-color: #64748b; color: #f8fafc; }
        .opt-btn.selected { border-color: #00f2ff; background: rgba(0, 242, 255, 0.05); box-shadow: inset 0 0 20px rgba(0,242,255,0.1); color: #00f2ff; }
        
        .glass-panel { background: rgba(2, 6, 23, 0.7); border: 1px solid #1e293b; backdrop-filter: blur(20px); border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); padding: clamp(20px, 4vw, 40px); }
        
        .hud-pulse { animation: pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1); }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.7; } 100% { opacity: 1; } }
        
        .timer-danger { background: #f59e0b !important; }
        .timer-critical { background: #ef4444 !important; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      <div style={{ position:'absolute', inset:0, overflow:'hidden', background:'#020617', fontFamily:'Inter, sans-serif' }}>
        
        {/* FONDO CSS (DEEP FOCUS) */}
        <div className="cyber-bg"><div className="cyber-grid"></div></div>

        {/* PANTALLA DE CARGA IA */}
        {phase === "LOADING" && (
            <QuantumIntermission lang={safeLang} loadingText={UI.loadingData} />
        )}

        {/* PANTALLA INICIAL Y TEORÍA */}
        {(phase === "BOOT" || phase === "THEORY") && (
          <div style={{ position:'absolute', inset:0, zIndex:3000, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
            <h1 style={{color:'#f8fafc', fontSize:'clamp(30px, 6vw, 60px)', textAlign:'center', margin: '0 0 10px 0', fontWeight: '900', letterSpacing: '-1px'}}>{UI.title}</h1>
            <p style={{color:'#00f2ff', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '40px'}}>DEEP FOCUS LEARNING ENGINE</p>
            
            {phase === "THEORY" && (
                <div className="glass-panel" style={{maxWidth: '800px', marginBottom: '40px', borderTop: '4px solid #ffaa00'}}>
                    <h3 style={{color: '#ffaa00', marginTop: 0}}>SISTEMA ICFES ACTIVO</h3>
                    <p style={{color:'#cbd5e1', fontSize:'clamp(16px, 2.5vw, 18px)', lineHeight:'1.7', margin: 0}}>{UI.theoryText}</p>
                </div>
            )}
            
            <div style={{display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
                <button className="hud-btn" style={{background: 'rgba(0,242,255,0.1)', padding: '20px 40px'}} onClick={() => { if(phase === "BOOT") setPhase("THEORY"); else { generateNew(); } }}>
                    {phase === "BOOT" ? UI.start : "EMPEZAR SIMULACIÓN"}
                </button>
                <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', padding: '20px 40px'}} onClick={openTelemetry}>
                    📊 {UI.statsBtn}
                </button>
            </div>
          </div>
        )}

        {/* INTERFAZ PRINCIPAL DE JUEGO */}
        {phase !== "BOOT" && phase !== "THEORY" && phase !== "LOADING" && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            
            {/* TOP HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', background: 'rgba(2, 6, 23, 0.8)', borderBottom: '1px solid #1e293b', backdropFilter: 'blur(10px)' }}>
              <div style={{display:'flex', gap:'30px', alignItems:'center'}}>
                  {currentQData && phase === "GAME" && (
                     <div style={{color: stats.needsReview.includes(currentQData?.id) ? '#f59e0b' : '#94a3b8', fontSize: '14px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}}>
                         DOMINIO: <span style={{color: '#f8fafc'}}>{currentQData?.topic}</span> {stats.needsReview.includes(currentQData?.id) ? ' ⚠️ REPASO' : ''}
                     </div>
                  )}
                  <div style={{color:'#10b981', fontWeight:'900', fontSize:'18px'}}>XP: {xp}</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                  <button className="hud-btn" style={{padding:'8px 16px', fontSize:'12px', borderColor: '#475569', color: '#94a3b8'}} onClick={openTelemetry}>📊 {UI.statsBtn}</button>
                  <button className="hud-btn" style={{padding:'8px 16px', fontSize:'12px', borderColor: '#ef4444', color: '#ef4444'}} onClick={resetApp}>SALIR</button>
              </div>
            </div>

            {/* BARRA DE PRESIÓN DE TIEMPO */}
            {phase === "GAME" && (
                <div style={{ width:'100%', padding: '20px 0', display:'flex', flexDirection:'column', alignItems:'center' }}>
                    <div style={{color: timeLeft > 30 ? '#00f2ff' : (timeLeft > 15 ? '#f59e0b' : '#ef4444'), fontSize:'24px', fontWeight:'900', marginBottom:'10px', fontVariantNumeric: 'tabular-nums'}} className={timeLeft <= 15 ? 'hud-pulse' : ''}>
                        {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                    </div>
                    <div style={{width: '90%', maxWidth: '800px', height:'6px', background:'#1e293b', borderRadius:'3px', overflow:'hidden'}}>
                        <div className={timeLeft <= 15 ? 'timer-critical' : (timeLeft <= 36 ? 'timer-danger' : '')} style={{width: `${(timeLeft/MAX_TIME)*100}%`, height:'100%', background: '#00f2ff', transition:'width 1s linear, background 0.5s'}} />
                    </div>
                </div>
            )}

            {/* CONTENEDOR CENTRAL: PREGUNTA */}
            {phase === "GAME" && currentQ && (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
                <div className="glass-panel" style={{ width: '100%', maxWidth: '900px', borderTop: currentQData?.isAi ? '4px solid #d946ef' : '4px solid #00f2ff' }}>
                  
                  {/* Etiqueta de Origen de la Pregunta */}
                  <div style={{ display: 'inline-block', background: currentQData?.isAi ? 'rgba(217, 70, 239, 0.1)' : 'rgba(0, 242, 255, 0.1)', color: currentQData?.isAi ? '#d946ef' : '#00f2ff', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '20px' }}>
                      {currentQData?.isAi ? "GENERADO POR DEEPSEEK IA" : "MOTOR ALGORÍTMICO LOCAL"}
                  </div>

                  <h2 style={{color:'#f8fafc', fontSize:'clamp(18px, 3vw, 24px)', lineHeight:'1.7', fontWeight:'400', margin: '0 0 30px 0'}}>{currentQ.text}</h2>
                  
                  {scannerActive && (
                      <div style={{background:'rgba(0,242,255,0.05)', borderLeft:'4px solid #00f2ff', padding:'15px', margin:'0 0 30px 0', color:'#00f2ff', fontSize:'15px', fontWeight:'600'}}>
                          💡 PISTA: {currentQ.hint}
                      </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {currentQ.options.map((opt, i) => (
                          <button key={i} className={`opt-btn ${selectedOpt === i ? 'selected' : ''}`} onClick={() => {sfx.click(); setSelectedOpt(i);}}>
                              <span style={{fontWeight:'900', marginRight:'15px', color: selectedOpt === i ? '#00f2ff' : '#64748b'}}>{String.fromCharCode(65 + i)}.</span> {opt}
                          </button>
                      ))}
                  </div>

                  <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginTop:'40px'}}>
                      {!scannerActive ? (
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', fontSize: '14px', padding: '10px 20px'}} onClick={toggleScanner}>
                              👁️ USAR PISTA (-50 XP)
                          </button>
                      ) : <div></div>}
                      
                      <button className="hud-btn" style={{background: selectedOpt !== null ? '#00f2ff' : 'transparent', color: selectedOpt !== null ? '#000' : '#00f2ff'}} disabled={selectedOpt === null} onClick={submitAnswer}>
                          {UI.btnCheck}
                      </button>
                  </div>
                </div>
              </div>
            )}

            {/* OVERLAY: RESPUESTA CORRECTA */}
            {phase === "CORRECT" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.95)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px', textAlign:'center' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '30px' }}>
                      <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h1 style={{color:'#f8fafc', fontSize:'clamp(30px, 6vw, 60px)', margin:0, fontWeight: '900', letterSpacing: '-1px'}}>ANÁLISIS PERFECTO</h1>
                  <p style={{color:'#94a3b8', fontSize:'18px', marginTop:'20px'}}>Recompensa táctica: <span style={{color:'#10b981', fontWeight:'bold'}}>+{hintUsed ? '50' : '200'} XP</span></p>
                  
                  <button className="hud-btn" style={{marginTop:'50px', background:'#10b981', borderColor: '#10b981', color:'#020617', padding: '20px 60px'}} onClick={handleNextPhase}>
                      SIGUIENTE PREGUNTA
                  </button>
              </div>
            )}

            {/* OVERLAY: MICRO-CLASE SOCRÁTICA (FALLO) */}
            {phase === "MICROCLASS" && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                  <div className="glass-panel" style={{borderColor:'#ef4444', maxWidth:'900px', width:'100%', textAlign:'left', maxHeight:'90vh', overflowY:'auto'}}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                          </div>
                          <div>
                              <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>RUPTURA COGNITIVA DETECTADA</div>
                              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }}>{timeLeft === 0 ? "Tiempo Agotado" : "Análisis Forense Requerido"}</div>
                          </div>
                      </div>
                      
                      {currentQData?.trapExplanations && currentQData.trapExplanations[selectedOpt] && (
                          <div style={{color:'#f8fafc', fontSize:'16px', padding:'20px', background:'rgba(245, 158, 11, 0.1)', borderLeft:'4px solid #f59e0b', borderRadius: '4px', marginBottom: '30px', lineHeight: '1.6'}}>
                              <strong style={{color: '#f59e0b'}}>TRAMPA IDENTIFICADA: </strong>
                              {currentQData.trapExplanations[selectedOpt]}
                          </div>
                      )}

                      <div style={{color:'#cbd5e1', fontSize:'16px', lineHeight:'1.8', background:'rgba(15, 23, 42, 0.5)', padding:'30px', borderRadius:'8px', borderLeft:'4px solid #00f2ff'}}>
                          <strong style={{color: '#00f2ff', display: 'block', marginBottom: '15px'}}>RESOLUCIÓN CORRECTA:</strong>
                          <MarkdownParser text={currentQData?.microclass} />
                      </div>
                      
                      <div style={{display:'flex', justifyContent:'flex-end', marginTop:'40px'}}>
                          <button className="hud-btn" style={{background:'#f8fafc', color:'#0f172a', borderColor: '#f8fafc'}} onClick={handleNextPhase}>
                              REINTENTAR MATRIZ
                          </button>
                      </div>
                  </div>
              </div>
            )}

            {/* DASHBOARD TELEMETRÍA */}
            {phase === "STATS" && !showAiModal && (
              <div style={{ position:'absolute', inset:0, zIndex:2000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'20px' }}>
                  <div className="glass-panel" style={{maxWidth:'1000px', width:'100%', maxHeight:'90vh', overflowY:'auto'}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                          <div>
                              <h2 style={{color:'#f8fafc', fontSize:'28px', margin:0, fontWeight: '900'}}>PANEL DE MANDO</h2>
                              <div style={{color:'#64748b', fontSize:'14px', marginTop:'5px'}}>Telemetría Global del Operador</div>
                          </div>
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8', padding: '10px'}} onClick={closeTelemetry}>✕ CERRAR</button>
                      </div>
                      
                      {/* KPIs */}
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'20px', marginBottom:'40px'}}>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>PRECISIÓN NEURONAL</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color: stats.totalQ === 0 ? '#475569' : (stats.correctQ/stats.totalQ > 0.6 ? '#10b981' : '#ef4444')}}>
                                  {stats.totalQ > 0 ? Math.round((stats.correctQ/stats.totalQ)*100) : 0}%
                              </div>
                          </div>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>TIEMPO MEDIO REACCIÓN</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color:'#f59e0b'}}>
                                  {stats.totalQ > 0 ? Math.round(stats.totalTime/stats.totalQ) : 0}s
                              </div>
                          </div>
                          <div style={{background:'rgba(15, 23, 42, 0.5)', border: '1px solid #1e293b', padding:'25px', borderRadius:'12px'}}>
                              <div style={{fontSize:'12px', color:'#64748b', fontWeight:'bold', letterSpacing:'1px', marginBottom:'10px'}}>MATRICES RESUELTAS</div>
                              <div style={{fontSize:'48px', fontWeight:'900', color:'#f8fafc'}}>
                                  {stats.totalQ}
                              </div>
                          </div>
                      </div>

                      {/* BOTÓN IA SOCRÁTICO */}
                      <div style={{ marginBottom:'40px'}}>
                         <button 
                            className="hud-btn" 
                            style={{background: failedTopics.length > 0 ? 'rgba(217, 70, 239, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: failedTopics.length > 0 ? '#d946ef' : '#10b981', color: failedTopics.length > 0 ? '#d946ef' : '#10b981', width: '100%', padding: '25px'}} 
                            onClick={() => { sfx.aiPop(); setShowAiModal(true); }}
                         >
                            {failedTopics.length > 0 ? "⚠️ DETECTADAS VULNERABILIDADES - SOLICITAR IA TUTOR" : "✅ RENDIMIENTO ÓPTIMO - HABLAR CON IA"}
                         </button>
                      </div>

                      <div style={{ fontSize:'14px', color:'#94a3b8', fontWeight:'bold', letterSpacing:'1px', marginBottom:'15px', borderBottom:'1px solid #1e293b', paddingBottom:'10px' }}>DESGLOSE POR DOMINIO ICFES</div>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:'20px'}}>
                          {Object.keys(stats.topics).map(topicId => {
                              const t = stats.topics[topicId];
                              const total = t.c + t.w;
                              if (total === 0) return null; 
                              const pct = total > 0 ? Math.round((t.c/total)*100) : 0;
                              const isFailed = t.w > 0;
                              const displayName = IcfesEngine.getTopicName(topicId, safeLang);

                              return (
                                  <div key={topicId} style={{background:'rgba(15, 23, 42, 0.3)', padding:'20px', borderRadius:'8px', border: isFailed ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #1e293b'}}>
                                      <div style={{color: isFailed ? '#ef4444' : '#f8fafc', fontWeight:'bold', marginBottom:'15px', fontSize:'14px', height: '40px'}}>
                                          {displayName}
                                      </div>
                                      <div style={{width:'100%', height:'6px', background:'#0f172a', borderRadius:'3px', overflow:'hidden'}}>
                                          <div style={{width:`${pct}%`, height:'100%', background: pct >= 60 ? '#10b981' : (pct > 0 ? '#f59e0b' : '#ef4444')}}></div>
                                      </div>
                                      <div style={{color:'#64748b', fontSize:'12px', marginTop:'10px', display:'flex', justifyContent:'space-between'}}>
                                          <span>ACiertos: <span style={{color:'#10b981'}}>{t.c}</span></span>
                                          <span>Fallos: <span style={{color:'#ef4444'}}>{t.w}</span></span>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* BOTONES DE ACCIÓN: INCLUYE EL DOSSIER PDF */}
                      <div style={{display:'flex', justifyContent:'space-between', marginTop:'50px', paddingTop: '20px', borderTop: '1px solid #1e293b', flexWrap:'wrap', gap: '15px'}}>
                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8'}} onClick={() => { window.localStorage.removeItem('icfes_telemetry_quimica_v8'); window.location.reload(); }}>PURGAR CACHÉ</button>
                          <button className="hud-btn" style={{background:'#f8fafc', color:'#0f172a', borderColor: '#f8fafc'}} onClick={downloadReport}>📄 DESCARGAR REPORTE TÁCTICO PDF</button>
                      </div>
                  </div>
              </div>
            )}

            {/* MODAL IA INTERACTIVA */}
            {showAiModal && phase === "STATS" && (
               <div style={{ position:'absolute', inset:0, zIndex:3000, background:'rgba(2, 6, 23, 0.98)', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'clamp(10px, 2vw, 20px)' }}>
                   <div className="glass-panel" style={{borderColor:'#d946ef', maxWidth:'1000px', width:'100%', textAlign:'left', boxShadow:'0 0 50px rgba(217, 70, 239, 0.1)', maxHeight:'95vh', minHeight:'80vh', overflowY:'auto'}}>
                       
                       {failedTopics.length > 0 ? (
                           <>
                               {!activeAiTopic ? (
                                   <>
                                       <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom:'1px solid #1e293b', paddingBottom:'20px', marginBottom: '30px' }}>
                                          <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(217, 70, 239, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d946ef" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                          </div>
                                          <div>
                                              <div style={{ color: '#d946ef', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>SISTEMA TUTOR DEEPSEEK</div>
                                              <div style={{ color: '#f8fafc', fontSize: '24px', fontWeight: 'bold' }}>Selecciona un dominio a re-entrenar</div>
                                          </div>
                                      </div>

                                       <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                                           {failedTopics.map((topicId, i) => (
                                               <button key={i} className="opt-btn" style={{borderColor:'#1e293b', color:'#f8fafc', fontSize: '16px', padding: '20px'}} onClick={() => { sfx.click(); setActiveAiTopic(topicId); }}>
                                                   <span style={{color: '#d946ef', marginRight: '10px'}}>+</span> {IcfesEngine.getTopicName(topicId, safeLang)}
                                               </button>
                                           ))}
                                       </div>
                                       
                                       <div style={{display:'flex', justifyContent:'flex-end', marginTop:'40px'}}>
                                          <button className="hud-btn" style={{borderColor: '#475569', color: '#94a3b8'}} onClick={() => setShowAiModal(false)}>CERRAR ENLACE IA</button>
                                       </div>
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
                           <div style={{textAlign: 'center', padding: '60px 20px'}}>
                             <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 30px auto' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                             </div>
                             <h2 style={{color:'#f8fafc', fontSize:'28px', marginBottom:'15px'}}>RENDIMIENTO PERFECTO</h2>
                             <p style={{color: '#94a3b8', marginBottom: '40px'}}>No hay vulnerabilidades tácticas detectadas en tu matriz cognitiva.</p>
                             <button className="hud-btn" style={{background:'#10b981', color:'#020617', borderColor: '#10b981'}} onClick={() => setShowAiModal(false)}>CERRAR SESIÓN</button>
                           </div>
                       )}
                   </div>
               </div>
            )}

          </div>
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