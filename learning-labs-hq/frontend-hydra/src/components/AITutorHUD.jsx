import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export default function AITutorHUD() {
  const { aiMessage, currentLesson, isCritical } = useGameStore();

  return (
    <div style={styles.container}>
      <AnimatePresence mode="wait">
        <motion.div
          key={aiMessage}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          style={styles.card(isCritical)}
        >
          <div style={styles.lessonLabel}>{currentLesson || "ANÁLISIS EN CURSO"}</div>
          <div style={styles.divider} />
          <p style={styles.text}>{aiMessage}</p>
          <div style={styles.footer}>INTERFAZ PEDAGÓGICA DEEPSEEK V3</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: { position: 'absolute', top: '40px', right: '40px', zIndex: 1000, width: '400px', fontFamily: 'Orbitron' },
  card: (isCritical) => ({
    background: isCritical ? 'rgba(100, 0, 0, 0.9)' : 'rgba(0, 20, 40, 0.9)',
    borderLeft: `5px solid ${isCritical ? '#ff0055' : '#00f2ff'}`,
    padding: '25px', borderRadius: '4px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
  }),
  lessonLabel: { fontSize: '12px', color: '#ffea00', fontWeight: 'bold', letterSpacing: '2px' },
  divider: { height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' },
  text: { fontSize: '16px', color: '#fff', lineHeight: '1.5', margin: 0 },
  footer: { fontSize: '8px', color: '#555', marginTop: '15px', textAlign: 'right' }
};
