import Dexie from 'dexie';

/**
 * DATABASE: LearningLabsDB (Versión Industrial AAA)
 * Optimizada para:
 * 1. Análisis de errores por IA (DeepSeek Context)
 * 2. Emparejamiento masivo de datos con Learning Labs 
 */
export const db = new Dexie('LearningLabsDB');

db.version(1).stores({
  // Sesiones: Añadimos 'isSynced' como índice para buscar rápido qué falta subir
  sessions: '++id, startTime, endTime, score, [isSynced+startTime]',
  
  // Fallos: Añadimos 'sessionId' como índice para que la IA consulte el historial de esta partida
  // 'concept' nos permite ver en qué tema es débil el alumno
  failures: '++id, sessionId, concept, timestamp, errorSeverity',
  
  // Tabla de Analítica: Guarda estados del reactor (Temp/Presión) cada N segundos
  // Esto permite reconstruir la "escena del crimen" para la IA
  telemetry: '++id, sessionId, timestamp'
});

/**
 * FUNCIÓN DE ALTO NIVEL: Obtener el contexto para la IA
 * Extrae los últimos fallos para alimentar el prompt de DeepSeek 
 */
export const getAiContext = async (sessionId) => {
  const history = await db.failures
    .where('sessionId')
    .equals(sessionId)
    .toArray();
    
  return history.map(f => `${f.timestamp}: Falló en ${f.concept}`).join(', ');
};

console.log("✔ Arquitectura de Persistencia Nivel AAA: Activa");
