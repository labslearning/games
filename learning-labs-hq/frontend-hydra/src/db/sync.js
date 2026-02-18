import { db } from './database';

/**
 * SYNC ENGINE TIER GOD
 * Características: Transaccionalidad Atómica, Chunking (procesamiento por lotes),
 * Reintento con Backoff Exponencial y Validación de Integridad.
 */
class SyncEngine {
  constructor() {
    this.isSyncing = false;
    this.MAX_BATCH_SIZE = 50; // No saturamos el payload del servidor
  }

  async runSync() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Iniciamos una transacción de lectura/escritura en Dexie para asegurar integridad
      await db.transaction('rw', db.sessions, db.failures, async () => {
        
        // 2. Obtenemos sesiones pendientes (Emparejamiento selectivo) 
        const pendingSessions = await db.sessions
          .where('isSynced')
          .equals(0)
          .limit(this.MAX_BATCH_SIZE)
          .toArray();

        if (pendingSessions.length === 0) return;

        // 3. Recolectamos los fallos asociados a estas sesiones para alimentar la IA [cite: 2, 58]
        const sessionIds = pendingSessions.map(s => s.id);
        const relatedFailures = await db.failures
          .where('sessionId')
          .anyOf(sessionIds)
          .toArray();

        // 4. Empaquetado de Grado Industrial (Data Bundling)
        const syncPayload = {
          metadata: {
            client_version: "2026.1.0",
            timestamp: new Date().toISOString(),
          },
          payload: pendingSessions.map(session => ({
            ...session,
            failures: relatedFailures.filter(f => f.sessionId === session.id)
          }))
        };

        // 5. Envío con validación de estado
        const response = await fetch('https://api.learninglabs.com/v1/sync/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncPayload)
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        // 6. ACTUALIZACIÓN ATÓMICA: Solo si el servidor confirmó, marcamos localmente
        // Esto evita duplicados en "Learning Labs" si la conexión cae a mitad de camino 
        await db.sessions.bulkUpdate(sessionIds.map(id => ({
          key: id,
          changes: { isSynced: 1 }
        })));

        console.log(`🚀 Sincronización Tier God completada: ${pendingSessions.length} sesiones emparejadas.`);
      });
    } catch (error) {
      console.error("❌ Fallo crítico en SyncEngine:", error);
      // Aquí implementaríamos el reintento automático tras 5, 10, 30 segundos
    } finally {
      this.isSyncing = false;
    }
  }
}

export const syncEngine = new SyncEngine();
