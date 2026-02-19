import React, { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import MolecularPhysics from './components/MolecularPhysics';
import { useGameStore, i18n, MATERIALS, audioSys } from './store/useGameStore';

const LiveEquation = ({ mode, p, v, t }) => {
  const cP = "#ff0055"; const cV = "#ffea00"; const cT = "#00f2ff"; 
  const val = (n, c) => <span style={{ color: c, fontWeight: 'bold' }}>{Number(n).toFixed(1)}</span>;
  const Var = ({ char, sub, color }) => (<span style={{ color, margin: '0 5px', textShadow:`0 0 8px ${color}` }}>{char}<sub>{sub}</sub></span>);
  const Fraction = ({ top, bottom }) => (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', verticalAlign: 'middle', margin: '0 5px' }}>
      <div style={{ borderBottom: '2px solid rgba(255,255,255,0.4)', padding: '0 2px' }}>{top}</div>
      <div style={{ padding: '0 2px' }}>{bottom}</div>
    </div>
  );

  const k_boyle = (p * v).toFixed(0);
  const k_charles = (v / t).toFixed(3);
  const k_gl = (p / t).toFixed(3);

  if (mode === 'FREE') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'20px', fontWeight:'bold'}}>
      <div><Var char="P" color={cP}/> · <Var char="V" color={cV}/> = nR · <Var char="T" color={cT}/></div>
      <div style={{fontSize:'16px', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = k · {val(t, cT)}</div>
    </div>
  );
  if (mode === 'BOYLE') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'20px', fontWeight:'bold'}}>
      <div><Var char="P" sub="1" color={cP}/> · <Var char="V" sub="1" color={cV}/> = <Var char="P" sub="2" color={cP}/> · <Var char="V" sub="2" color={cV}/></div>
      <div style={{fontSize:'16px', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = {k_boyle} (k)</div>
    </div>
  );
  if (mode === 'CHARLES') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'20px', fontWeight:'bold'}}>
      <div><Fraction top={<Var char="V" sub="1" color={cV}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="V" sub="2" color={cV}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div>
      <div style={{fontSize:'16px', color:'#aaa'}}><Fraction top={val(v, cV)} bottom={val(t, cT)} /> = {k_charles} (k)</div>
    </div>
  );
  if (mode === 'GAY_LUSSAC') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'20px', fontWeight:'bold'}}>
      <div><Fraction top={<Var char="P" sub="1" color={cP}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="P" sub="2" color={cP}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div>
      <div style={{fontSize:'16px', color:'#aaa'}}><Fraction top={val(p, cP)} bottom={val(t, cT)} /> = {k_gl} (k)</div>
    </div>
  );
  return null;
};

export default function App() {
  const { appState, temp, volume, pressure, phaseID, isCritical, activeMaterial, setMaterial, activeMode, setMode, updatePhysics, language, setLanguage, startGame, resetProgress, activeQuiz, answerQuizQuestion, quizFeedback, clearFeedback, closeQuiz, score, triggerExercise, exampleSession, loadExampleScenario, exitExample } = useGameStore();
  const mat = MATERIALS[activeMaterial];
  const t_i18n = i18n[language] || i18n.es;
  const t = t_i18n.ui;
  const lesson = t_i18n.lessons[activeMode];
  const examples = t_i18n.examples[activeMode];
  const droneRef = useRef(null);

  useEffect(() => {
    if (appState === 'PLAYING' && droneRef.current) {
      if(activeQuiz) { droneRef.current.pause(); return; }
      droneRef.current.play().catch(()=>{});
      droneRef.current.playbackRate = Math.max(0.5, temp / 2000);
      droneRef.current.volume = isCritical ? 0.8 : 0.2;
    }
  }, [appState, temp, isCritical, activeQuiz]);

  if (appState === 'LANG_SELECT') return (
    <div style={ui.screenGame}><div style={ui.vignette} /><div style={ui.hexBackground} />
      <div style={ui.centerBoxGame}>
        <h1 style={ui.titleGame}>LEARNING <span style={{color:'#fff'}}>LABS</span></h1>
        <div style={ui.btnGridGame}>{[{ id:'es', flag:'🇪🇸' }, { id:'en', flag:'🇬🇧' }, { id:'fr', flag:'🇫🇷' }, { id:'de', flag:'🇩🇪' }].map(l => <button key={l.id} onClick={()=>setLanguage(l.id)} style={ui.cyberBtn}><span style={{marginRight:'10px'}}>{l.flag}</span> {i18n[l.id].ui.lang}</button>)}</div>
      </div>
    </div>
  );

  if (appState === 'GAME_SELECT') return (
    <div style={ui.screenGame}><div style={ui.hexBackground} /><button onClick={resetProgress} style={ui.resetBtnGame}>⚙️ BACK</button>
      <div style={ui.centerBoxGame}><h1 style={ui.titleGame}>{t.selectGame}</h1><button onClick={startGame} style={ui.solidCyberBtn}>{t.gameChem}</button></div>
    </div>
  );

  return (
    <div style={ui.screen}>
      <audio ref={droneRef} src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav" loop />
      <audio id="crash-sound" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/crash_ebp5po.wav" />
      <audio id="error-sound" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/error.wav" />
      <audio id="success-sound" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/success.wav" />
      <audio id="quiz-sound" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/quiz.wav" />
      
      <div style={{...ui.criticalOverlay, opacity: isCritical ? 1 : 0}} />
      <button onClick={resetProgress} style={ui.resetBtnGame}>{t.reset}</button>

      {/* 🛑 MODAL DE IA TUTOR ESTRICTO (ESTUDIANTE NO AVANZA SI NO APRENDE) */}
      {activeQuiz && (
        <div style={ui.quizOverlay}>
          <div style={ui.quizBox}>
            <h2 style={{color:'#00f2ff', margin:0, letterSpacing:'2px'}}>{activeQuiz.title}</h2>
            <p style={{fontSize:'22px', margin:'30px 0', lineHeight:'1.5'}}>{activeQuiz.question}</p>
            
            {/* Si NO hay feedback, mostramos las opciones para que elija. Si se equivocó, LAS OCULTAMOS */}
            {!quizFeedback && (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginBottom:'20px'}}>
                {activeQuiz.options.map((opt, i) => (
                  <button key={i} onClick={() => answerQuizQuestion(opt)} style={ui.quizBtn}>{opt.text}</button>
                ))}
              </div>
            )}

            {/* CAJA DE ENSEÑANZA: Explica por qué está bien o mal */}
            {quizFeedback && (
              <div style={{ padding: '30px', background: quizFeedback.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,85,0.1)', border: `2px solid ${quizFeedback.type === 'success' ? '#0f0' : '#ff0055'}`, color: quizFeedback.type === 'success' ? '#0f0' : '#ff0055', fontSize: '18px', lineHeight: '1.6', borderRadius: '8px' }}>
                <h3 style={{marginTop: 0, fontSize: '24px'}}>{quizFeedback.type === 'success' ? t.correct : t.error}</h3>
                <p style={{color: '#fff', fontSize: '20px', margin: '20px 0'}}>{quizFeedback.text}</p>
                
                {/* BOTONES DE DECISIÓN: Continuar (si acierto) o Reintentar (si error) */}
                {quizFeedback.type === 'success' ? (
                  <button onClick={closeQuiz} style={{...ui.solidCyberBtn, width: '100%'}}>{t.continue}</button>
                ) : (
                  <button onClick={clearFeedback} style={{...ui.cyberBtn, width: '100%', borderColor: '#ff0055', color: '#ff0055'}}>{t.tryAgain}</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PANEL IZQUIERDO */}
      <div style={ui.leftPanel}>
        <div style={ui.sectionBox}>
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>{Object.values(MATERIALS).map(m => <button key={m.id} onClick={() => setMaterial(m.id)} style={activeMaterial === m.id ? ui.matBtnActive : ui.matBtn}>{m.name}</button>)}</div>
        </div>
        <div style={{...ui.sectionBox, background:'rgba(0,15,30,0.8)', borderLeft:'3px solid #00f2ff'}}>
          <div style={ui.dataRow}><span>{t.mass}</span><span style={{color:'#00f2ff'}}>{mat.mass}</span></div>
          <div style={ui.dataRow}><span>{t.type}</span><span style={{color:'#ffea00'}}>{mat.type}</span></div>
        </div>
      </div>

      {/* PANEL DERECHO */}
      <div style={ui.rightPanel}>
        <div style={{...ui.sectionBox, borderLeft:'4px solid #ffea00', background:'rgba(50,40,0,0.8)'}}><h3 style={{...ui.panelTitle, color:'#ffea00', fontSize:'14px'}}>🏆 SCORE: {score} PTS</h3></div>
        
        <div style={ui.sectionBox}><h3 style={ui.panelTitle}>// {t.classMode}</h3>
          <div style={ui.modeGrid}>{['FREE', 'BOYLE', 'CHARLES', 'GAY_LUSSAC'].map(m => <button key={m} onClick={()=>setMode(m)} style={activeMode===m ? ui.modeBtnA : ui.modeBtn}>{t[`mode${m.charAt(0)+m.slice(1).toLowerCase().replace('_l','L')}`] || m}</button>)}</div>
          <div style={{marginTop:'15px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}><strong style={{color:'#00f2ff'}}>{lesson.title}</strong><br/><span style={{color:'#ffea00'}}>{t.goal}:</span> {lesson.goal}<br/><span style={{color:'#00f2ff'}}>{t.idea}:</span> {lesson.idea}</div>
        </div>

        <div style={{...ui.sectionBox, textAlign:'center'}}>
          <LiveEquation mode={activeMode} p={pressure} v={volume} t={temp} />
        </div>

        {/* 🔥 BOTÓN GIGANTE IA 🔥 */}
        <button onClick={triggerExercise} style={ui.iaButton}>{t.generate}</button>
      </div>

      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <color attach="background" args={['#010204']} /><Environment preset="night" /><ambientLight intensity={0.2} /><pointLight position={[0, 5, 0]} intensity={3} color="#00f2ff" /><Stars count={6000} factor={5} fade speed={1} />
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <mesh position={[0, 2, 0]}><cylinderGeometry args={[2.5, 2.5, 4, 64]} /><meshPhysicalMaterial transparent opacity={0.15} color="#00f2ff" metalness={1} roughness={0} side={2}/></mesh>
            <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[2.6, 2.8, 0.4, 64]} /><meshStandardMaterial color="#050505" /></mesh>
            <MolecularPhysics count={250} />
          </group>
        </Suspense>
        <EffectComposer><Bloom luminanceThreshold={1} mipmapBlur intensity={2.0} />{isCritical && <ChromaticAberration offset={[0.01, 0.01]} />}</EffectComposer>
        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      <div style={ui.controlPanel}>
         <div style={{...ui.controlGroup, opacity: (activeMode==='BOYLE')?0.2:1, pointerEvents: (activeMode==='BOYLE')?'none':'auto'}}>
           <div style={ui.controlLabel('#00f2ff')}>{t.temp}</div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('TEMP', 50)} style={ui.actionBtn('#ff0055')}>+50</button><button onClick={() => updatePhysics('TEMP', -50)} style={ui.actionBtn('#00f2ff')}>-50</button></div>
         </div>
         <div style={ui.hud(isCritical)}>
            <div style={ui.hudVal(false, '#00f2ff')}>{temp}K</div>
            <div style={ui.hudVal(isCritical, '#ff0055')}>{pressure.toFixed(1)} PSI</div>
            <div style={ui.hudVal(false, '#ffea00')}>{volume}%</div>
         </div>
         <div style={{...ui.controlGroup, opacity: (activeMode==='CHARLES')?0.2:1, pointerEvents: (activeMode==='CHARLES')?'none':'auto'}}>
           <div style={ui.controlLabel('#ffea00')}>{t.vol}</div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('VOL', 10)} style={ui.actionBtn('#ffea00')}>+10</button><button onClick={() => updatePhysics('VOL', -10)} style={ui.actionBtn('#ffea00')}>-10</button></div>
         </div>
         <div style={{...ui.controlGroup, opacity: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?0.2:1, pointerEvents: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?'none':'auto'}}>
           <div style={ui.controlLabel('#ff0055')}>{t.press}</div>
           <div style={{display:'flex', gap:'5px'}}><button onClick={() => updatePhysics('PRESS', 10)} style={ui.actionBtn('#ff0055')}>+10</button><button onClick={() => updatePhysics('PRESS', -10)} style={ui.actionBtn('#ff0055')}>-10</button></div>
         </div>
      </div>
    </div>
  );
}

const ui = {
  screenGame: { width:'100vw', height:'100vh', backgroundColor:'#010204', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron, sans-serif', position:'relative', overflow:'hidden' },
  hexBackground: { position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, rgba(0,242,255,0.05) 0%, transparent 60%)', backgroundSize:'40px 40px' },
  vignette: { position:'absolute', inset:0, boxShadow:'inset 0 0 250px rgba(0,0,0,0.95)', zIndex:2 },
  centerBoxGame: { zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', backdropFilter:'blur(8px)', padding:'50px', background:'rgba(0,5,15,0.7)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'4px', boxShadow:'0 0 50px rgba(0,0,0,0.8)' },
  titleGame: { color:'#00f2ff', fontSize:'65px', letterSpacing:'8px', textAlign:'center', margin:'0 0 30px 0', textShadow:'0 0 20px rgba(0,242,255,0.5)', fontWeight:900 },
  btnGridGame: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', width:'100%' },
  cyberBtn: { padding:'20px 40px', background:'rgba(0,10,20,0.8)', border:'1px solid #005577', color:'#00f2ff', cursor:'pointer', fontSize:'16px', fontFamily:'Orbitron', fontWeight:'bold', transition:'0.2s' },
  solidCyberBtn: { padding:'15px 40px', background:'linear-gradient(45deg, rgba(0,242,255,0.3), rgba(0,0,0,0.8))', borderLeft:'4px solid #00f2ff', color:'#fff', cursor:'pointer', fontSize:'18px', fontFamily:'Orbitron', fontWeight:'bold', width:'100%', margin:'0 auto', display:'block' },
  resetBtnGame: { position:'absolute', top:25, left:25, zIndex:100, padding:'10px 20px', background:'rgba(0,0,0,0.5)', border:'1px solid #ff4444', color:'#ff4444', cursor:'pointer', fontFamily:'Orbitron' },
  screen: { width:'100vw', height:'100vh', background:'#010204', fontFamily:'Orbitron', overflow:'hidden', position:'relative' },
  criticalOverlay: { position:'absolute', inset:0, boxShadow:'inset 0 0 200px rgba(255,0,85,0.4)', pointerEvents:'none', zIndex:99, transition:'0.3s' },
  leftPanel: { position:'absolute', top:'80px', left:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'20px', width:'220px', maxHeight:'80vh', overflowY:'auto' },
  rightPanel: { position:'absolute', top:'80px', right:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'15px', width:'320px', maxHeight:'80vh', overflowY:'auto' },
  sectionBox: { background:'rgba(0,10,20,0.7)', border:'1px solid rgba(0,85,119,0.5)', padding:'15px', backdropFilter:'blur(8px)' },
  panelTitle: { color:'#4488aa', margin:'0 0 15px 0', fontSize:'10px', letterSpacing:'3px' },
  matBtn: { padding:'12px', background:'rgba(0,0,0,0.5)', color:'#00f2ff', border:'1px solid #005577', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', textAlign:'left' },
  matBtnActive: { padding:'12px', background:'rgba(0,242,255,0.15)', color:'#fff', borderLeft:'3px solid #00f2ff', borderTop:'1px solid #00f2ff', borderRight:'1px solid #00f2ff', borderBottom:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', fontWeight:'bold' },
  dataRow: { display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'5px', color:'#fff' },
  modeGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  modeBtn: { padding:'10px 5px', background:'rgba(0,0,0,0.5)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px' },
  modeBtnA: { padding:'10px 5px', background:'rgba(255,234,0,0.1)', color:'#ffea00', border:'1px solid #ffea00', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px', fontWeight:'bold' },
  mathLive: { fontSize:'24px', color:'#fff', fontFamily:'"Courier New", monospace', fontWeight:'bold', letterSpacing:'1px' },
  iaButton: { width:'100%', padding:'15px', background:'linear-gradient(45deg, #7b2cbf, #b5179e)', border:'2px solid #f72585', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'14px', fontWeight:'bold', marginTop:'5px', boxShadow:'0 0 15px rgba(247, 37, 133, 0.5)' },
  controlPanel: { position:'absolute', bottom:'30px', left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', gap:'25px' },
  controlGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  controlLabel: (color) => ({ fontSize: '10px', color: color, letterSpacing: '2px', textAlign: 'center', marginBottom:'-2px', textShadow: `0 0 5px ${color}` }),
  actionBtn: (color) => ({ padding:'12px 20px', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`2px solid ${color}`, color:color, cursor:'pointer', fontWeight:'bold', fontFamily:'Orbitron' }),
  hud: (isCrit) => ({ background:'rgba(0,5,15,0.8)', padding:'15px 35px', border:`2px solid ${isCrit?'#ff0055':'#00f2ff'}`, textAlign:'center', minWidth:'140px', backdropFilter:'blur(5px)' }),
  hudVal: (isCrit, baseColor) => ({ fontSize:'22px', fontWeight:'bold', color: isCrit ? '#ff0055' : baseColor, margin: '5px 0' }),
  quizOverlay: { position:'absolute', inset:0, background:'rgba(0,5,10,0.95)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(15px)' },
  quizBox: { background:'rgba(0,10,20,0.9)', border:'1px solid #00f2ff', padding:'50px', maxWidth:'1000px', width:'90%', textAlign:'center', boxShadow:'0 0 100px rgba(0,242,255,0.2)' },
  quizBtn: { padding:'25px', background:'rgba(255,255,255,0.05)', border:'1px solid #555', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'16px', textAlign:'left', transition:'0.3s' }
};
