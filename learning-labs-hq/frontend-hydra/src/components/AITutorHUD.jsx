import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export default function AITutorHUD() {
  const { aiMessage, isCritical } = useGameStore();

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {aiMessage && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            style={styles.messageBox(isCritical)}
          >
            <div style={styles.header}>DEEPSEEK V3 - ADVISOR</div>
            <p style={styles.text}>{aiMessage}</p>
            <div style={styles.footer}>LEARNING LABS PROTOCOL v2.1</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: '40px',
    right: '40px',
    zIndex: 100,
    width: '320px',
    pointerEvents: 'none',
    fontFamily: "'Orbitron', sans-serif"
  },
  messageBox: (isCritical) => ({
    background: isCritical ? 'rgba(60, 0, 0, 0.9)' : 'rgba(0, 20, 35, 0.9)',
    border: `1px solid ${isCritical ? '#ff0055' : '#00f2ff'}`,
    padding: '20px',
    borderRadius: '4px',
    boxShadow: `0 0 20px ${isCritical ? 'rgba(255, 0, 85, 0.3)' : 'rgba(0, 242, 255, 0.2)'}`,
    backdropFilter: 'blur(10px)'
  }),
  header: { fontSize: '10px', color: '#888', letterSpacing: '2px', marginBottom: '10px' },
  text: { fontSize: '14px', color: '#fff', lineHeight: '1.6', margin: 0 },
  footer: { fontSize: '8px', color: '#555', marginTop: '15px', textAlign: 'right' }
};
