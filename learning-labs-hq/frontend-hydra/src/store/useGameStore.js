import { create } from 'zustand';
import { persist } from 'zustand/middleware';

class SciFiAudioEngine {
  constructor() { this.ctx = null; }
  init() { if (!this.ctx && typeof window !== 'undefined') this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  play(type) {
    if (!this.ctx) return; const t = this.ctx.currentTime; const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain(); osc.connect(gain); gain.connect(this.ctx.destination);
    if (type === 'UI') { osc.type = 'sine'; osc.frequency.setValueAtTime(1500, t); osc.frequency.exponentialRampToValueAtTime(3000, t + 0.1); gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1); osc.start(t); osc.stop(t + 0.1); }
    else if (type === 'HEAT') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(50, t); osc.frequency.exponentialRampToValueAtTime(150, t + 0.3); gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.start(t); osc.stop(t + 0.3); }
    else if (type === 'COOL') { osc.type = 'sine'; osc.frequency.setValueAtTime(600, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.3); gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3); osc.start(t); osc.stop(t + 0.3); }
    else if (type === 'ALARM') { osc.type = 'square'; osc.frequency.setValueAtTime(300, t); osc.frequency.setValueAtTime(400, t + 0.1); gain.gain.setValueAtTime(0.2, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.2); osc.start(t); osc.stop(t + 0.2); }
    else if (type === 'ERROR') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(150, t); osc.frequency.linearRampToValueAtTime(50, t + 0.4); gain.gain.setValueAtTime(0.3, t); gain.gain.linearRampToValueAtTime(0.01, t + 0.4); osc.start(t); osc.stop(t + 0.4); }
  }
}
export const audioSys = new SciFiAudioEngine();

export const MATERIALS = {
  H2O: { id: 'H2O', name: 'H₂O', mp: 273, bp: 373, colorGas: '#00f2ff', colorLiquid: '#0055ff', colorSolid: '#ffffff' },
  CO2: { id: 'CO2', name: 'CO₂', mp: 195, bp: 195, colorGas: '#55ff55', colorLiquid: '#000000', colorSolid: '#ddffdd' },
  O2: { id: 'O2', name: 'O₂', mp: 54, bp: 90, colorGas: '#ffffff', colorLiquid: '#4444ff', colorSolid: '#2222aa' },
  NACL: { id: 'NACL', name: 'NaCl', mp: 1074, bp: 1738, colorGas: '#ffaa00', colorLiquid: '#ffffaa', colorSolid: '#ffffff' },
  HE: { id: 'HE', name: 'He', mp: 1, bp: 4, colorGas: '#ffaaaa', colorLiquid: '#ff5555', colorSolid: '#330000' }
};

export const i18n = {
  es: { appTitle: "LEARNING LABS", selectLang: "INICIALIZAR SISTEMA", selectGame: "SIMULADORES", gameChem: "🧪 QUÍMICA", start: "CONECTAR", reset: "⚙️ REINICIAR", tempLabel: "TEMP (K)", pressLabel: "PRESIÓN (PSI)", volLabel: "VOLUMEN (%)", inventory: "ESTADOS", modeFree: "MODO LIBRE", modeBoyle: "L. BOYLE", modeCharles: "L. CHARLES", modeGayLussac: "L. GAY-LUSSAC", mathFree: "$P \\cdot V = n \\cdot R \\cdot T$", mathBoyle: "T CONSTANTE ($P \\propto 1/V$)", mathCharles: "P CONSTANTE ($V \\propto T$)", mathGayLussac: "V CONSTANTE ($P \\propto T$)", desc: { H2O: "Agua. A 300K es un líquido estable.", CO2: "Hielo Seco. Sublima a 195K.", O2: "Oxígeno. Gas a temperatura ambiente.", NACL: "Sal de mesa. Sólido cristalino a 300K.", HE: "Helio. Gas noble ultrafrío." } },
  en: { appTitle: "LEARNING LABS", selectLang: "INITIALIZE SYSTEM", selectGame: "SIMULATORS", gameChem: "🧪 CHEMISTRY", start: "CONNECT", reset: "⚙️ REBOOT", tempLabel: "TEMP (K)", pressLabel: "PRESSURE (PSI)", volLabel: "VOLUME (%)", inventory: "STATES", modeFree: "FREE MODE", modeBoyle: "BOYLE'S L.", modeCharles: "CHARLES'S L.", modeGayLussac: "GAY-LUSSAC'S L.", mathFree: "$P \\cdot V = n \\cdot R \\cdot T$", mathBoyle: "CONSTANT T ($P \\propto 1/V$)", mathCharles: "CONSTANT P ($V \\propto T$)", mathGayLussac: "CONSTANT V ($P \\propto T$)", desc: { H2O: "Water. Stable liquid at 300K.", CO2: "Dry Ice. Sublimates at 195K.", O2: "Oxygen. Gas at room temp.", NACL: "Table salt. Crystalline solid at 300K.", HE: "Helium. Ultracold noble gas." } },
  fr: { appTitle: "LEARNING LABS", selectLang: "INITIALISER", selectGame: "SIMULATEURS", gameChem: "🧪 CHIMIE", start: "CONNECTER", reset: "⚙️ RÉINITIALISER", tempLabel: "TEMP (K)", pressLabel: "PRESSION (PSI)", volLabel: "VOLUME (%)", inventory: "ÉTATS", modeFree: "MODE LIBRE", modeBoyle: "L. BOYLE", modeCharles: "L. CHARLES", modeGayLussac: "L. GAY-LUSSAC", mathFree: "$P \\cdot V = n \\cdot R \\cdot T$", mathBoyle: "T CONSTANTE ($P \\propto 1/V$)", mathCharles: "P CONSTANTE ($V \\propto T$)", mathGayLussac: "V CONSTANT ($P \\propto T$)", desc: { H2O: "Eau. Liquide stable à 300K.", CO2: "Glace Sèche. Se sublime.", O2: "Oxygène. Gaz ambiant.", NACL: "Sel. Solide à 300K.", HE: "Hélium. Gaz ultra-froid." } },
  de: { appTitle: "LEARNING LABS", selectLang: "INITIALISIEREN", selectGame: "SIMULATOREN", gameChem: "🧪 CHEMIE", start: "VERBINDEN", reset: "⚙️ NEUSTART", tempLabel: "TEMP (K)", pressLabel: "DRUCK (PSI)", volLabel: "VOLUMEN (%)", inventory: "ZUSTAND", modeFree: "FREIER MODUS", modeBoyle: "BOYLE-G.", modeCharles: "CHARLES-G.", modeGayLussac: "GAY-LUSSAC-G.", mathFree: "$P \\cdot V = n \\cdot R \\cdot T$", mathBoyle: "KONSTANTE T ($P \\propto 1/V$)", mathCharles: "KONSTANTER P ($V \\propto T$)", mathGayLussac: "KONSTANTES V ($P \\propto T$)", desc: { H2O: "Wasser. Flüssig bei 300K.", CO2: "Trockeneis. Sublimiert.", O2: "Sauerstoff. Umweltgas.", NACL: "Salz. Feststoff bei 300K.", HE: "Helium. Kaltes Edelgas." } }
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      appState: 'LANG_SELECT', language: 'es', selectedGame: null, activeMaterial: 'H2O', activeMode: 'FREE',
      temp: 300, volume: 100, pressure: 14.7, isCritical: false, inventory: [], aiMessage: "Motor Anti-Singularidad Activado.", isQuizActive: false,

      setLanguage: (lang) => { audioSys.init(); audioSys.play('UI'); set({ language: lang, appState: 'GAME_SELECT' }); },
      startGame: (gameId) => { audioSys.play('UI'); set({ selectedGame: gameId, appState: 'PLAYING', activeMode: 'FREE' }); },
      resetProgress: () => { audioSys.play('COOL'); set({ appState: 'LANG_SELECT', inventory: [], activeMaterial: 'H2O', activeMode: 'FREE' }); },
      
      setMaterial: (matId) => { 
        audioSys.play('UI'); set({ activeMaterial: matId, temp: 300, volume: 100, pressure: 14.7, aiMessage: `${MATERIALS[matId].name}: ${i18n[get().language].desc[matId]}` }); 
      },
      
      setMode: (mode) => { 
        audioSys.play('UI'); const state = get(); const mat = MATERIALS[state.activeMaterial];
        if (state.temp < mat.bp && mode !== 'FREE') {
           set({ activeMode: mode, temp: mat.bp + 50, aiMessage: `⚠️ RECALIBRACIÓN: Las leyes ideales requieren fase gaseosa. Subiendo a ${mat.bp + 50}K.` });
        } else { set({ activeMode: mode }); }
      },

      updatePhysics: (action, amount) => {
        const state = get(); audioSys.init();
        let t = state.temp; let v = state.volume; let p = state.pressure; const k = 150; 
        const mat = MATERIALS[state.activeMaterial];
        const MIN_VOLUME = 35; // 🛡️ EL LÍMITE SÓLIDO (Antes era 15, lo que causaba el colapso de colisiones)

        if (action === 'TEMP' && amount > 0) audioSys.play('HEAT');
        if (action === 'TEMP' && amount < 0) audioSys.play('COOL');
        
        try {
          if (state.activeMode === 'FREE') {
            t = action === 'TEMP' ? Math.round(Math.max(1, Math.min(t + amount, 6000))) : t;
            // Bloqueo duro al volumen para no aplastar las partículas
            if (action === 'VOL') {
              const newV = Math.round(Math.max(MIN_VOLUME, Math.min(v + amount, 100)));
              if (v === MIN_VOLUME && amount < 0) { audioSys.play('ERROR'); set({ aiMessage: "⚠️ INCOMPRESIBILIDAD: Límite de densidad atómica alcanzado." }); }
              else { v = newV; amount < 0 ? audioSys.play('HEAT') : audioSys.play('COOL'); }
            }
          } else if (state.activeMode === 'BOYLE' && action === 'VOL') {
            const newV = Math.round(Math.max(MIN_VOLUME, Math.min(v + amount, 100)));
            if (v === MIN_VOLUME && amount < 0) { audioSys.play('ERROR'); set({ aiMessage: "⚠️ LÍMITE FÍSICO ALCANZADO." }); }
            else { v = newV; amount < 0 ? audioSys.play('HEAT') : audioSys.play('COOL'); }
          } else if (state.activeMode === 'CHARLES' && action === 'TEMP') {
            let newT = Math.round(Math.max(1, Math.min(t + amount, 6000)));
            let expectedV = Math.round((k * newT * 100) / p);
            if (expectedV > 100) { audioSys.play('ERROR'); return set({ aiMessage: "⚠️ COLAPSO ESTRUCTURAL: El pistón chocó con el techo. Ley de Charles abortada.", activeMode: 'FREE' }); }
            if (expectedV < MIN_VOLUME) { audioSys.play('ERROR'); return set({ aiMessage: "⚠️ LÍMITE SÓLIDO: El pistón chocó con la materia base. Ley de Charles abortada.", activeMode: 'FREE' }); }
            t = newT; v = expectedV;
          } else if (state.activeMode === 'GAY_LUSSAC' && action === 'TEMP') {
            t = Math.round(Math.max(1, Math.min(t + amount, 6000)));
          }

          if (t < mat.bp && state.activeMode !== 'FREE') {
            audioSys.play('ERROR');
            return set({ aiMessage: `⚠️ CONDENSACIÓN: El gas es líquido a ${t}K. Ecuaciones colapsadas. Pasando a Modo Libre.`, activeMode: 'FREE', temp: t });
          }

          const isSolid = t <= mat.mp; const isLiquid = t > mat.mp && t < mat.bp; const isGas = t >= mat.bp;
          p = isGas ? (k * t) / (v / 100) : (isLiquid ? 14.7 + (t * 0.05) : 14.7);

          const crit = p >= 2500; if (crit) audioSys.play('ALARM');

          let newInv = [...state.inventory]; let msg = state.aiMessage; let ach = false;
          if (isSolid && !newInv.includes(`${mat.id}_SOLID`)) { newInv.push(`${mat.id}_SOLID`); ach=true; msg="SÓLIDO: Red cristalina formada. Partículas inamovibles."; }
          if (isLiquid && mat.mp !== mat.bp && !newInv.includes(`${mat.id}_LIQUID`)) { newInv.push(`${mat.id}_LIQUID`); ach=true; msg="LÍQUIDO: Nivel de superficie establecido. Movimiento fluido."; }
          if (isGas && !newInv.includes(`${mat.id}_GAS`)) { newInv.push(`${mat.id}_GAS`); ach=true; msg="GAS: Ebullición completada. Expansión volumétrica total."; }

          if (ach) audioSys.play('UI');
          set({ temp: t, volume: v, pressure: p, isCritical: crit, inventory: newInv, aiMessage: ach ? msg : (state.aiMessage.includes('LÍMITE') ? state.aiMessage : msg) });
        } catch (e) {}
      }
    }),
    { name: 'learning-labs-omega-god' }
  )
);
