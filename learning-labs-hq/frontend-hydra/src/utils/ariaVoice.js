// 🎙️ A.R.I.A. VOICE ENGINE (Tier God Edition - Zero-Cost Sci-Fi TTS)

// 1. SINGLETON AUDIO CONTEXT: Previene fugas de memoria y crashes del navegador.
let audioCtx = null;
const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// 2. CACHÉ DE VOCES ASÍNCRONO: Resuelve el bug de Chrome.
let cachedVoices = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// 3. GENERADOR PROCEDURAL DE ESTÁTICA
const playRadioClick = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const bufferSize = ctx.sampleRate * 0.1; // 100ms de ruido
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 1.5;
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    
    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
  } catch(e) {
    console.warn("A.R.I.A Audio Engine Error:", e);
  }
};

// 4. EL MOTOR PRINCIPAL EXPORTADO
export const ariaVoice = {
  speak: (text, lang = 'es-ES') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    playRadioClick();

    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.pitch = 0.75; 
    utterance.rate = 1.15;  
    utterance.volume = 1;
    utterance.lang = lang;

    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    
    const preferredVoice = voices.find(v => 
      v.lang.includes(lang.split('-')[0]) && 
      (v.name.includes('Google') || v.name.includes('Microsoft'))
    ) || voices.find(v => v.lang.includes(lang.split('-')[0]));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setTimeout(playRadioClick, 50); 
    };

    utterance.onerror = (e) => {
      console.warn("A.R.I.A Speech Synthesis interrumpió la locución:", e);
    };

    window.speechSynthesis.speak(utterance);
  }
};
