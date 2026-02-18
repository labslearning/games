import { create } from 'zustand';

export const useGameStore = create((set) => ({
  temperature: 300,
  pressure: 1.0,
  stability: 100,
  aiMessage: "SISTEMA INICIALIZADO. Bienvenido, Operador Hydra.",
  isCritical: false,
  
  updateTelemetry: (data) => set((state) => ({
    ...state,
    ...data,
    isCritical: data.temperature > 800 || data.stability < 40
  })),

  setAiMessage: (msg, critical = false) => set({ 
    aiMessage: msg, 
    isCritical: critical 
  }),
}));
