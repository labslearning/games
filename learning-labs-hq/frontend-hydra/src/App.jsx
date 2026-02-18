import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import Reactor3D from './components/Reactor3D';
import MolecularPhysics from './components/MolecularPhysics';
import { useGameStore, i18n, MATERIALS } from './store/useGameStore';

// 🧮 RENDERIZADOR MATEMÁTICO (Optimizado para panel lateral)
const LiveEquation = ({ mode }) => {
  const Var = ({ char, sub, color }) => (
    <span style={{ color: color, margin: '0 2px', textShadow: `0 0 8px ${color}` }}>
      {char}<sub>{sub}</sub>
    </span>
  );
  
  const Fraction = ({ top, bottom }) => (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 5px' }}>
      <div style={{ borderBottom: '2px solid rgba(255,255,255,0.4)', padding: '0 2px', marginBottom: '2px' }}>{top}</div>
      <div style={{ padding: '0 2px', marginTop: '2px' }}>{bottom}</div>
    </div>
  );

  const C_P = "#ff0055"; 
  const C_V = "#ffea00"; 
  const C_T = "#00f2ff"; 

  if (mode === 'FREE') return (
    <div style={ui.mathLive}>
      <Var char="P" color={C_P}/> · <Var char="V" color={C_V}/> = nR · <Var char="T" color={C_T}/>
    </div>
  );
  if (mode === 'BOYLE') return (
    <div style={ui.mathLive}>
      <Var char="P" sub="1" color={C_P}/> · <Var char="V" sub="1" color={C_V}/> = <Var char="P" sub="2" color={C_P}/> · <Var char="V" sub="2" color={C_V}/>
    </div>
  );
  if (mode === 'CHARLES') return (
    <div style={ui.mathLive}>
      <Fraction top={<Var char="V" sub="1" color={C_V}/>} bottom={<Var char="T" sub="1" color={C_T}/>} /> = 
      <Fraction top={<Var char="V" sub="2" color={C_V}/>} bottom={<Var char="T" sub="2" color={C_T}/>} />
    </div>
  );
  if (mode === 'GAY_LUSSAC') return (
    <div style={ui.mathLive}>
      <Fraction top={<Var char="P" sub="1" color={C_P}/>} bottom={<Var char="T" sub="1" color={C_T}/>} /> = 
      <Fraction top={<Var char="P" sub="2" color={C_P}/>} bottom={<Var char="T" sub="2" color={C_T}/>} />
    </div>
  );
};

export default function App() {
  const { 
    appState, language, setLanguage, startGame, resetProgress,
    temp, volume, pressure, isCritical, inventory, activeMaterial, setMaterial,
    activeMode, setMode, updatePhysics, aiMessage
  } = useGameStore();
  
  const t = language ? i18n[language] : i18n.es;
  const mat = MATERIALS[activeMaterial];
  const audioRef = useRef(null);

  // 🎧 SONIDO DUAL AAA
  useEffect(() => {
    if (appState === 'PLAYING' && audioRef.current) {
      audioRef.current.play().catch(e => {});
      audioRef.current.playbackRate = Math.max(0.3, temp / 1000);
      audioRef.current.volume = isCritical ? 0.9 : 0.3;
    }
  }, [appState, temp, isCritical]);

  const sublimates = mat.mp === mat.bp;

  // 🌍 PANTALLAS DE INICIO
  if (appState === 'LANG_SELECT') {
    return (
      <div style={ui.screenGame}>
        <div style={ui.vignette} /><div style={ui.hexBackground} />
        <div style={ui.centerBoxGame}>
          <div style={ui.systemBadgeGame}>SYS_BOOT_SEQUENCE_V_OMEGA</div>
          <h1 style={ui.titleGame}>LEARNING <span style={{color:'#fff'}}>LABS</span></h1>
          <h3 style={ui.subtitleGame}>// {i18n.es.selectLang}</h3>
          <div style={ui.btnGridGame}>
            {[ { id: 'es', label: 'ESPAÑOL', flag: '🇪🇸' }, { id: 'en', label: 'ENGLISH', flag: '🇬🇧' }, { id: 'fr', label: 'FRANÇAIS', flag: '🇫🇷' }, { id: 'de', label: 'DEUTSCH', flag: '🇩🇪' } ].map(lang => (
              <button key={lang.id} onClick={() => setLanguage(lang.id)} style={ui.cyberBtn}>
                <span style={{marginRight: '10px'}}>{lang.flag}</span> {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'GAME_SELECT') {
    return (
      <div style={ui.screenGame}>
        <div style={ui.hexBackground} />
        <button onClick={resetProgress} style={ui.resetBtnGame}>{t.reset}</button>
        <div style={ui.centerBoxGame}>
          <div style={ui.systemBadgeGame}>ACCESS: {language.toUpperCase()}</div>
          <h1 style={ui.titleGame}>{t.selectGame}</h1>
          <button onClick={() => startGame('chemistry')} style={ui.solidCyberBtn}>{t.gameChem}</button>
        </div>
      </div>
    );
  }

  // 🎮 EL SIMULADOR PRINCIPAL (HUD COCKPIT)
  return (
    <div style={ui.screen}>
      <audio ref={audioRef} src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav" loop />
      <div style={{ ...ui.criticalOverlay, opacity: isCritical ? 1 : 0 }} />
      <button onClick={resetProgress} style={ui.resetBtnGame}>{t.reset}</button>

      {/* ⬅️ PANEL IZQUIERDO: Materiales y Pokedex */}
      <div style={ui.leftPanel}>
        <div style={ui.sectionBox}>
          <h3 style={ui.panelTitle}>// {t.inventory.split(' ')[0]} (MAT)</h3>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {Object.values(MATERIALS).map(m => (
              <button key={m.id} onClick={() => setMaterial(m.id)} style={activeMaterial === m.id ? ui.matBtnActive : ui.matBtn}>{m.name}</button>
            ))}
          </div>
        </div>

        <div style={ui.sectionBox}>
          <h3 style={ui.panelTitle}>// ESTADOS</h3>
          <div style={ui.pokeItem(inventory.includes(`${mat.id}_SOLID`))}>🧊 <div><div style={ui.pokeText}>SÓLIDO</div><div style={ui.pokeSub}>{`<${mat.mp}K`}</div></div></div>
          {!sublimates && <div style={ui.pokeItem(inventory.includes(`${mat.id}_LIQUID`))}>💧 <div><div style={ui.pokeText}>LÍQUIDO</div><div style={ui.pokeSub}>{`<${mat.bp}K`}</div></div></div>}
          <div style={ui.pokeItem(inventory.includes(`${mat.id}_GAS`))}>☁️ <div><div style={ui.pokeText}>GAS</div><div style={ui.pokeSub}>{`>${mat.bp}K`}</div></div></div>
        </div>
      </div>

      {/* ➡️ PANEL DERECHO: Telemetría y Tutor IA */}
      <div style={ui.rightPanel}>
         <div style={ui.sectionBox}>
           <h3 style={ui.panelTitle}>// MODO FÍSICO</h3>
           <div style={ui.modeGrid}>
             {['FREE', 'BOYLE', 'CHARLES', 'GAY_LUSSAC'].map(mode => (
               <button key={mode} onClick={() => setMode(mode)} style={activeMode === mode ? ui.modeBtnActive : ui.modeBtn}>
                 {t[`mode${mode.charAt(0) + mode.slice(1).toLowerCase().replace('_l', 'L')}`] || mode}
               </button>
             ))}
           </div>
         </div>

         <div style={{...ui.sectionBox, borderLeft: '3px solid #00f2ff'}}>
           <h3 style={ui.panelTitle}>// DEEPSEEK IA</h3>
           <p style={ui.aiText}>{aiMessage}</p>
         </div>

         <div style={{...ui.sectionBox, borderLeft: '3px solid #ffea00'}}>
            <h3 style={ui.panelTitle}>// ECUACIÓN EN VIVO</h3>
            <div style={{textAlign: 'center', padding: '10px 0'}}>
              <LiveEquation mode={activeMode} />
              <div style={ui.mathDesc}>{t[`math${activeMode.charAt(0) + activeMode.slice(1).toLowerCase().replace('_l', 'L')}`]}</div>
            </div>
         </div>
      </div>

      {/* 🌌 MOTOR 3D (Despejado en el Centro) */}
      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <color attach="background" args={['#010204']} />
        <Stars count={6000} factor={5} fade speed={1} />
        <Suspense fallback={null}><Reactor3D /><MolecularPhysics count={150} /></Suspense>
        {/* maxPolarAngle evita que el usuario mire por debajo del suelo */}
        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* ⬇️ PANEL INFERIOR: Controles de Alta Precisión */}
      <div style={ui.controlPanel}>
         <div style={{...ui.controlGroup, opacity: activeMode==='BOYLE'?0.2:1, pointerEvents: activeMode==='BOYLE'?'none':'auto'}}>
           <div style={ui.controlLabel('#00f2ff')}>INYECCIÓN TÉRMICA</div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('TEMP', 50)} style={ui.actionBtn('#ff0055')}>+50K</button><button onClick={() => updatePhysics('TEMP', 10)} style={ui.actionBtnSmall('#ff0055')}>+10</button><button onClick={() => updatePhysics('TEMP', 5)} style={ui.actionBtnMicro('#ff0055')}>+5</button></div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('TEMP', -50)} style={ui.actionBtn('#00f2ff')}>-50K</button><button onClick={() => updatePhysics('TEMP', -10)} style={ui.actionBtnSmall('#00f2ff')}>-10</button><button onClick={() => updatePhysics('TEMP', -5)} style={ui.actionBtnMicro('#00f2ff')}>-5</button></div>
         </div>

         <div style={ui.hud(isCritical)}>
            <div style={ui.hudVal(false, '#00f2ff')}>{temp}</div><div style={ui.hudLabel}>{t.tempLabel}</div>
            <div style={ui.hudVal(false, '#ffea00')}>{volume}</div><div style={ui.hudLabel}>{t.volLabel}</div>
            <div style={ui.hudLine(isCritical)} />
            <div style={ui.hudVal(isCritical, '#ff0055')}>{pressure.toFixed(0)}</div><div style={ui.hudLabel}>{t.pressLabel}</div>
         </div>

         <div style={{...ui.controlGroup, opacity: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?0.2:1, pointerEvents: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?'none':'auto'}}>
           <div style={ui.controlLabel('#ffea00')}>PISTÓN MECÁNICO</div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('VOL', 10)} style={ui.actionBtn('#ffea00')}>+10%</button><button onClick={() => updatePhysics('VOL', 1)} style={ui.actionBtnSmall('#ffea00')}>+1%</button></div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('VOL', -10)} style={ui.actionBtn('#ffea00')}>-10%</button><button onClick={() => updatePhysics('VOL', -1)} style={ui.actionBtnSmall('#ffea00')}>-1%</button></div>
         </div>
      </div>
    </div>
  );
}

// 🎨 ESTILOS UI TIER GOD (COCKPIT LAYOUT)
const ui = {
  screenGame: { width:'100vw', height:'100vh', backgroundColor:'#010204', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron, sans-serif', position:'relative', overflow:'hidden' },
  hexBackground: { position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, rgba(0,242,255,0.05) 0%, transparent 60%), linear-gradient(0deg, transparent 24%, rgba(0,242,255,0.03) 25%, rgba(0,242,255,0.03) 26%, transparent 27%, transparent 74%, rgba(0,242,255,0.03) 75%, rgba(0,242,255,0.03) 76%, transparent 77%, transparent)', backgroundSize:'40px 40px' },
  vignette: { position:'absolute', inset:0, boxShadow:'inset 0 0 250px rgba(0,0,0,0.95)', zIndex:2 },
  centerBoxGame: { zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', backdropFilter:'blur(8px)', padding:'50px', background:'rgba(0,5,15,0.7)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'4px', boxShadow:'0 0 50px rgba(0,0,0,0.8)' },
  systemBadgeGame: { color:'#00f2ff', border:'1px solid #00f2ff', padding:'5px 15px', fontSize:'10px', letterSpacing:'4px', marginBottom:'20px', background:'rgba(0,242,255,0.1)', textTransform:'uppercase' },
  titleGame: { color:'#00f2ff', fontSize:'65px', letterSpacing:'8px', textAlign:'center', margin:'0 0 10px 0', textShadow:'0 0 20px rgba(0,242,255,0.5)', fontWeight:900 },
  subtitleGame: { color:'#666', letterSpacing:'3px', fontSize:'14px', marginBottom:'40px' },
  btnGridGame: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%' },
  cyberBtn: { padding:'20px 40px', background:'rgba(0,10,20,0.8)', border:'1px solid #005577', color:'#00f2ff', cursor:'pointer', fontSize:'16px', fontFamily:'Orbitron', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', transition:'0.2s', clipPath:'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' },
  solidCyberBtn: { padding:'25px 50px', background:'linear-gradient(45deg, rgba(0,242,255,0.3), rgba(0,0,0,0.8))', borderLeft:'4px solid #00f2ff', borderTop:'none', borderRight:'none', borderBottom:'none', color:'#fff', cursor:'pointer', fontSize:'22px', fontFamily:'Orbitron', fontWeight:'bold', clipPath:'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)', width:'100%' },
  resetBtnGame: { position:'absolute', top:25, left:25, zIndex:100, padding:'10px 20px', background:'rgba(0,0,0,0.5)', border:'1px solid #555', color:'#aaa', cursor:'pointer', fontFamily:'Orbitron', clipPath:'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)', transition: '0.2s' },
  
  screen: { width:'100vw', height:'100vh', background:'#010204', fontFamily:'Orbitron', overflow:'hidden', position:'relative' },
  criticalOverlay: { position:'absolute', inset:0, boxShadow:'inset 0 0 200px rgba(255,0,85,0.4)', pointerEvents:'none', zIndex:99, transition:'0.3s' },
  
  // 🔲 NUEVO DISEÑO LATERAL (COCKPIT)
  leftPanel: { position:'absolute', top:'80px', left:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'20px', width:'220px' },
  rightPanel: { position:'absolute', top:'80px', right:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'20px', width:'300px' },
  sectionBox: { background:'rgba(0,10,20,0.7)', border:'1px solid rgba(0,85,119,0.5)', padding:'15px', backdropFilter:'blur(8px)', clipPath:'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' },
  panelTitle: { color:'#4488aa', margin:'0 0 15px 0', fontSize:'10px', letterSpacing:'3px' },
  
  matBtn: { padding:'12px', background:'rgba(0,0,0,0.5)', color:'#00f2ff', border:'1px solid #005577', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', textAlign:'left', transition:'0.2s' },
  matBtnActive: { padding:'12px', background:'rgba(0,242,255,0.15)', color:'#fff', borderLeft:'3px solid #00f2ff', borderTop:'1px solid #00f2ff', borderRight:'1px solid #00f2ff', borderBottom:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', fontWeight:'bold', boxShadow:'0 0 10px rgba(0,242,255,0.2)' },
  
  pokeItem: (unlocked) => ({ display:'flex', alignItems:'center', gap:'12px', padding:'10px', background: unlocked?'rgba(0,242,255,0.08)':'rgba(255,255,255,0.02)', borderLeft:`2px solid ${unlocked?'#00f2ff':'#333'}`, marginBottom:'5px', opacity:unlocked?1:0.3 }),
  pokeText: { color:'#fff', fontSize:'11px', fontWeight:'bold', letterSpacing:'1px' },
  pokeSub: { color:'#666', fontSize:'9px' },

  modeGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  modeBtn: { padding:'10px 5px', background:'rgba(0,0,0,0.5)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px' },
  modeBtnActive: { padding:'10px 5px', background:'rgba(255,234,0,0.1)', color:'#ffea00', border:'1px solid #ffea00', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px', fontWeight:'bold', boxShadow:'inset 0 0 10px rgba(255,234,0,0.1)' },
  
  aiText: { margin:0, color:'#ddd', fontSize:'12px', lineHeight:'1.6' },
  mathLive: { fontSize:'20px', color:'#fff', fontFamily:'"Courier New", monospace', fontWeight:'bold', letterSpacing:'1px' },
  mathDesc: { marginTop:'10px', color:'#666', fontSize:'10px' },

  controlPanel: { position:'absolute', bottom:'30px', left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', gap:'25px' },
  controlGroup: { display:'flex', flexDirection:'column', gap:'8px', transition:'0.3s' },
  controlLabel: (color) => ({ fontSize: '10px', color: color, letterSpacing: '2px', textAlign: 'center', marginBottom:'-2px', textShadow: `0 0 5px ${color}` }),
  actionBtn: (color) => ({ padding:'12px 20px', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`2px solid ${color}`, color:color, cursor:'pointer', fontWeight:'bold', fontFamily:'Orbitron', clipPath:'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }),
  actionBtnSmall: (color) => ({ padding:'12px 15px', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`1px solid ${color}`, color:color, cursor:'pointer', fontFamily:'Orbitron', clipPath:'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }),
  actionBtnMicro: (color) => ({ padding:'12px 10px', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`1px solid ${color}`, color:color, cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px', clipPath:'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)' }),
  
  hud: (isCrit) => ({ background:'rgba(0,5,15,0.8)', padding:'15px 35px', border:`2px solid ${isCrit?'#ff0055':'#00f2ff'}`, textAlign:'center', minWidth:'160px', boxShadow: isCrit?'0 0 50px rgba(255,0,85,0.6)':'0 0 20px rgba(0,242,255,0.1)', clipPath:'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)', backdropFilter:'blur(5px)' }),
  hudVal: (isCrit, baseColor) => ({ fontSize:'28px', fontWeight:'bold', color: isCrit ? '#ff0055' : baseColor, textShadow: `0 0 10px ${isCrit ? '#ff0055' : baseColor}` }),
  hudLabel: { fontSize:'9px', color:'#666', letterSpacing:'2px', marginBottom:'5px' },
  hudLine: (isCrit) => ({ width:'100%', height:'2px', background: isCrit?'#ff0055':'rgba(0,242,255,0.3)', margin:'8px 0' })
};
