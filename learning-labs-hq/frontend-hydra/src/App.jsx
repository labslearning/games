import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import MolecularPhysics from './components/MolecularPhysics';
import { useGameStore, i18n, audioSys } from './store/useGameStore';
import { MATERIALS } from './data/materials';

// 📦 IMPORTAMOS TUS 4 JUEGOS ("Cartuchos")
import GasLaws from './games/chemistry/GasLaws';
import RedoxLab from './games/chemistry/RedoxLab';
import RedoxBalancer from './games/chemistry/RedoxBalancer';
import GasTheory from './games/chemistry/GasTheory';

/* ============================================================
   📱 HOOK DE RESPONSIVIDAD (MOBILE FIRST)
============================================================ */
function useMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
}

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
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}>
      <div><Var char="P" color={cP}/> · <Var char="V" color={cV}/> = nR · <Var char="T" color={cT}/></div>
      <div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = k · {val(t, cT)}</div>
    </div>
  );
  if (mode === 'BOYLE') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}>
      <div><Var char="P" sub="1" color={cP}/> · <Var char="V" sub="1" color={cV}/> = <Var char="P" sub="2" color={cP}/> · <Var char="V" sub="2" color={cV}/></div>
      <div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}>{val(p, cP)} · {val(v, cV)} = {k_boyle} (k)</div>
    </div>
  );
  if (mode === 'CHARLES') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}>
      <div><Fraction top={<Var char="V" sub="1" color={cV}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="V" sub="2" color={cV}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div>
      <div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}><Fraction top={val(v, cV)} bottom={val(t, cT)} /> = {k_charles} (k)</div>
    </div>
  );
  if (mode === 'GAY_LUSSAC') return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'10px', fontSize:'clamp(14px, 2vw, 20px)', fontWeight:'bold'}}>
      <div><Fraction top={<Var char="P" sub="1" color={cP}/>} bottom={<Var char="T" sub="1" color={cT}/>} /> = <Fraction top={<Var char="P" sub="2" color={cP}/>} bottom={<Var char="T" sub="2" color={cT}/>} /></div>
      <div style={{fontSize:'clamp(10px, 1.5vw, 16px)', color:'#aaa'}}><Fraction top={val(p, cP)} bottom={val(t, cT)} /> = {k_gl} (k)</div>
    </div>
  );
  return null;
};

export default function App() {
  const isMobile = useMobile(); // 🔥 Inyectamos el Hook
  
  const { appState, activeGame, temp, volume, pressure, phaseID, isCritical, activeMaterial, setMaterial, activeMode, setMode, updatePhysics, language, setLanguage, startGame, resetProgress, activeQuiz, answerQuizQuestion, quizFeedback, clearFeedback, closeQuiz, score, triggerExercise, exampleSession, loadExampleScenario, exitExample, searchTerm, setSearchTerm, filterCategory, setFilterCategory, isGeneratingQuiz } = useGameStore();
  const mat = MATERIALS[activeMaterial] || MATERIALS['H2O'];
  const t_i18n = i18n[language] || i18n.es;
  const t = t_i18n.ui;
  const lesson = t_i18n.lessons[activeMode];
  const examples = t_i18n.examples[activeMode];
  const droneRef = useRef(null);

  useEffect(() => {
    if (droneRef.current) {
      if (appState === 'PLAYING' && !activeQuiz && (!activeGame || activeGame === 'GAS_LAWS')) {
        droneRef.current.play().catch(()=>{});
        droneRef.current.playbackRate = Math.max(0.5, temp / 5000);
        droneRef.current.volume = isCritical ? 0.8 : 0.2;
      } else {
        droneRef.current.pause();
      }
    }
  }, [appState, temp, isCritical, activeQuiz, activeGame]);

  const filteredMaterials = Object.values(MATERIALS).filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <audio ref={droneRef} src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364035/drone_sound_yyqqnv.wav" loop />
      <audio id="snd-crash" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/crash_ebp5po.wav" />
      <audio id="snd-error" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/error.wav" />
      <audio id="snd-success" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/success.wav" />
      <audio id="snd-quiz" src="https://res.cloudinary.com/dukiyxfvn/video/upload/v1771364121/quiz.wav" />

      {appState === 'LANG_SELECT' && (
        <div style={ui.screenGame}><div style={ui.vignette} /><div style={ui.hexBackground} />
          <div style={ui.centerBoxGame}>
            <h1 style={ui.titleGame}>LEARNING <span style={{color:'#fff'}}>LABS</span></h1>
            <div style={ui.btnGridGame}>{[{ id:'es', flag:'🇪🇸' }, { id:'en', flag:'🇬🇧' }, { id:'fr', flag:'🇫🇷' }, { id:'de', flag:'🇩🇪' }].map(l => <button key={l.id} onClick={()=>setLanguage(l.id)} style={ui.cyberBtn}><span style={{marginRight:'10px'}}>{l.flag}</span> {i18n[l.id].ui.lang}</button>)}</div>
          </div>
        </div>
      )}

      {appState === 'GAME_SELECT' && (
        <div style={ui.screenGame}><div style={ui.hexBackground} />
          {/* 🔥 FIX: Cambiamos el reload por el cambio de estado directo */}
          <button onClick={() => useGameStore.setState({ appState: 'LANG_SELECT' })} style={ui.resetBtnGame}>⬅ BACK</button>
          <div style={{...ui.centerBoxGame, width: '95%', maxWidth: '1200px'}}>
            <h1 style={ui.titleGame}>CATÁLOGO DE SIMULADORES</h1>
            <div style={ui.gameGrid}>
              <div style={ui.gameCard} onClick={() => startGame('GAS_LAWS')}>
                <h2 style={{color: '#00f2ff', margin: '0 0 10px 0', fontSize: 'clamp(18px, 4vw, 24px)'}}>🧪 LEYES DE GASES</h2>
                <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 14px)', margin: 0}}>Termodinámica, 150 elementos, Plasma y Presión.</p>
              </div>

              <div style={{...ui.gameCard, border: '1px solid #00ff88', background: 'rgba(0, 30, 15, 0.8)', boxShadow: '0 0 20px rgba(0,255,136,0.2)', position: 'relative'}} onClick={() => startGame('GAS_THEORY')}>
                <div style={{position:'absolute', top:'-10px', right:'-10px', background:'#00ff88', color:'#000', padding:'4px 10px', fontSize:'12px', fontWeight:'bold', borderRadius:'4px'}}>NUEVO</div>
                <h2 style={{color: '#00ff88', margin: '0 0 10px 0', fontSize: 'clamp(18px, 4vw, 24px)'}}>📚 GAS THEORY MASTER</h2>
                <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 14px)', margin: 0}}>Campaña Guiada: Cinética, Boyle y Charles.</p>
              </div>

              <div style={{...ui.gameCard, border: '1px solid #ff0055', background: 'rgba(30, 0, 10, 0.8)', boxShadow: '0 0 20px rgba(255,0,85,0.2)'}} onClick={() => startGame('REDOX_LAB')}>
                <h2 style={{color: '#ff0055', margin: '0 0 10px 0', fontSize: 'clamp(18px, 4vw, 24px)'}}>⚡ QUÍMICA REDOX LAB</h2>
                <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 14px)', margin: 0}}>Mecánicas de balanceo y transferencia de electrones.</p>
              </div>

              <div style={{...ui.gameCard, border: '1px solid #ffea00', background: 'rgba(30, 25, 0, 0.8)', boxShadow: '0 0 20px rgba(255,234,0,0.2)'}} onClick={() => startGame('REDOX_BALANCER')}>
                <h2 style={{color: '#ffea00', margin: '0 0 10px 0', fontSize: 'clamp(18px, 4vw, 24px)'}}>⚖️ REDOX BALANCER</h2>
                <p style={{color: '#aaa', fontSize: 'clamp(12px, 3vw, 14px)', margin: 0}}>Simulador avanzado de balanceo por cargas.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {appState === 'PLAYING' && (
        <div style={ui.screen}>
          <div style={{...ui.criticalOverlay, opacity: isCritical ? 1 : 0}} />
          <button onClick={resetProgress} style={{...ui.resetBtnGame, zIndex: 9999}}>{t.reset}</button>

          {activeQuiz && (
            <div style={ui.quizOverlay}>
              <div style={ui.quizBox}>
                <h2 style={{color:'#00f2ff', margin:0, letterSpacing:'2px', fontSize: 'clamp(20px, 5vw, 28px)'}}>{activeQuiz.title}</h2>
                <p style={{fontSize:'clamp(16px, 4vw, 22px)', margin:'clamp(15px, 4vh, 30px) 0', lineHeight:'1.5'}}>{activeQuiz.question}</p>
                
                {!quizFeedback && (
                  <div style={ui.quizGrid}>
                    {activeQuiz.options.map((opt, i) => (
                      <button key={i} onClick={() => answerQuizQuestion(opt)} style={ui.quizBtn}>{opt.text}</button>
                    ))}
                  </div>
                )}

                {quizFeedback && (
                  <div style={{ padding: 'clamp(15px, 4vw, 30px)', background: quizFeedback.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,85,0.1)', border: `2px solid ${quizFeedback.type === 'success' ? '#0f0' : '#ff0055'}`, color: quizFeedback.type === 'success' ? '#0f0' : '#ff0055', fontSize: 'clamp(14px, 3.5vw, 18px)', borderRadius: '8px', textAlign: 'left' }}>
                    <h3 style={{marginTop: 0, fontSize: 'clamp(18px, 4.5vw, 24px)', textAlign: 'center'}}>{quizFeedback.type === 'success' ? t.correct : t.error}</h3>
                    <p style={{color: '#fff', fontSize: 'clamp(16px, 4vw, 20px)', textAlign: 'center', margin: '15px 0'}}>{quizFeedback.text}</p>
                    
                    {quizFeedback.type === 'error' && activeQuiz.miniClass && (
                      <div style={{marginTop: 'clamp(15px, 4vh, 25px)', padding: 'clamp(10px, 3vw, 20px)', background: 'rgba(0,242,255,0.05)', borderLeft: '4px solid #00f2ff', borderRadius: '4px'}}>
                        <h4 style={{margin: '0 0 10px 0', color: '#00f2ff', letterSpacing: '1px', fontSize: 'clamp(14px, 3vw, 18px)'}}>{t.classHeader}</h4>
                        <p style={{margin: 0, color: '#ddd', fontSize: 'clamp(14px, 3.5vw, 18px)', lineHeight: '1.6'}}>{activeQuiz.miniClass}</p>
                      </div>
                    )}

                    <div style={{marginTop: 'clamp(15px, 4vh, 25px)', display: 'flex', justifyContent: 'center'}}>
                      {quizFeedback.type === 'success' ? (
                        <button onClick={closeQuiz} style={{...ui.solidCyberBtn, width: '100%'}}>{t.continue}</button>
                      ) : (
                        <button onClick={clearFeedback} style={{...ui.cyberBtn, width: '100%', borderColor: '#ff0055', color: '#ff0055', padding: '15px', fontSize: 'clamp(14px, 3.5vw, 18px)'}}>{t.tryAgain}</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeGame === 'REDOX_LAB' ? (
             <RedoxLab />
          ) : activeGame === 'REDOX_BALANCER' ? (
             <RedoxBalancer />
          ) : activeGame === 'GAS_THEORY' ? (
             <GasTheory />
          ) : (
             <>
                {/* ⬅️ PANEL IZQUIERDO: Adaptado para Mobile */}
                <div className="game-panel-left" style={ui.leftPanel(isMobile)}>
                  <div className="material-selector-box" style={{...ui.sectionBox, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
                    <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={ui.searchInput} />
                    <div className="filter-buttons" style={{display:'flex', gap:'5px', marginTop:'10px', flexShrink: 0, overflowX: 'auto', paddingBottom: '5px'}}>
                      <button onClick={()=>setFilterCategory('All')} style={filterCategory==='All'?ui.pillA:ui.pill}>{t.filterAll}</button>
                      <button onClick={()=>setFilterCategory('Elemento')} style={filterCategory==='Elemento'?ui.pillA:ui.pill}>{t.filterElem}</button>
                      <button onClick={()=>setFilterCategory('Compuesto')} style={filterCategory==='Compuesto'?ui.pillA:ui.pill}>{t.filterComp}</button>
                    </div>
                    
                    {/* Lista de materiales (Scroll vertical en PC, Horizontal en Móvil) */}
                    <div className="materials-list" style={{flex: 1, overflowY: isMobile ? 'hidden' : 'auto', overflowX: isMobile ? 'auto' : 'hidden', marginTop: '10px', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '5px', paddingRight: isMobile ? '0' : '5px', paddingBottom: isMobile ? '5px' : '0'}}>
                      {filteredMaterials.map(m => (
                        <button key={m.id} className="mat-btn-item" onClick={() => setMaterial(m.id)} style={activeMaterial === m.id ? ui.matBtnActive(isMobile) : ui.matBtn(isMobile)}>
                          <span style={{fontWeight:'bold', width: isMobile ? 'auto' : '40px', display:'inline-block', marginRight: isMobile ? '5px' : '0'}}>{m.symbol}</span> 
                          {!isMobile && m.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Stats del elemento seleccionado */}
                  <div className="element-stats-box" style={{...ui.sectionBox, background:'rgba(0,15,30,0.8)', borderLeft:'3px solid #00f2ff', flexShrink: 0}}>
                    <h3 style={ui.panelTitle}>// {mat.symbol} ({t[phaseID]?.toUpperCase() || phaseID.toUpperCase()})</h3>
                    <div className="stats-row-group" style={{display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '10px' : '0', overflowX: isMobile ? 'auto' : 'visible'}}>
                        <div style={ui.dataRow(isMobile)}><span>{t.atomicNum}</span><span style={{color:'#ffea00'}}>{mat.atomicNum}</span></div>
                        <div style={ui.dataRow(isMobile)}><span>{t.mass}</span><span style={{color:'#ffea00'}}>{mat.mass}</span></div>
                        {!isMobile && <div style={ui.dataRow(isMobile)}><span>{t.eConfig}</span><span style={{color:'#00f2ff', fontSize:'9px'}}>{mat.eConfig}</span></div>}
                        <div style={ui.dataRow(isMobile)}><span>{t.density}</span><span style={{color:'#00f2ff'}}>{mat.density}</span></div>
                    </div>
                  </div>
                </div>

                {/* ➡️ PANEL DERECHO: Adaptado para Mobile */}
                <div className="game-panel-right" style={ui.rightPanel(isMobile)}>
                  <div className="score-box" style={{...ui.sectionBox, borderLeft:'4px solid #ffea00', background:'rgba(50,40,0,0.8)', flexShrink: 0}}><h3 style={{...ui.panelTitle, color:'#ffea00', fontSize:'clamp(12px, 2.5vw, 14px)', margin:0}}>🏆 SCORE: {score} PTS</h3></div>
                  
                  <div className="mode-selector-box" style={{...ui.sectionBox, flexShrink: 0}}><h3 style={ui.panelTitle}>// {t.classMode || "LEYES"}</h3>
                    <div style={ui.modeGrid(isMobile)}>
                      {['FREE', 'BOYLE', 'CHARLES', 'GAY_LUSSAC'].map(m => <button key={m} onClick={()=>setMode(m)} style={activeMode===m ? ui.modeBtnA : ui.modeBtn}>{t[`mode${m.charAt(0)+m.slice(1).toLowerCase().replace('_l','L')}`] || m}</button>)}
                    </div>
                    {/* Explicación de la ley, oculta en celular para ahorrar espacio si no es necesaria */}
                    {!isMobile && (
                      <div style={{marginTop:'15px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}><strong style={{color:'#00f2ff'}}>{lesson.title}</strong><br/><span style={{color:'#ffea00'}}>{t.goal}:</span> {lesson.goal}<br/><span style={{color:'#00f2ff'}}>{t.idea}:</span> {lesson.idea}</div>
                    )}
                  </div>

                  {activeMode !== 'FREE' && !isMobile && (
                    <div style={{...ui.sectionBox, borderLeft:'3px solid #ff0055', background:'rgba(30,0,10,0.8)', flexShrink: 0, maxHeight: '25vh', overflowY: 'auto'}}>
                      <h3 style={{...ui.panelTitle, color:'#ff0055'}}>{t.labTitle}</h3>
                      {!exampleSession && examples?.map((ex, idx) => (
                        <button key={idx} onClick={() => loadExampleScenario(activeMode, idx)} style={{...ui.solidCyberBtn, width:'100%', fontSize:'12px', padding:'10px', marginTop:'5px', background:'linear-gradient(45deg, #ff0055, #880022)'}}>{t.startLab}: {ex.title}</button>
                      ))}
                      {exampleSession && (
                        <div style={{marginTop:'10px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}>
                          <strong style={{color:'#ff0055'}}>{exampleSession.title}</strong><p style={{margin:'5px 0', color:'#fff'}}>{exampleSession.prompt}</p>
                          <ul style={{paddingLeft:'15px', color:'#ffea00'}}>{exampleSession.steps.map((step, i) => <li key={i}>{step}</li>)}</ul>
                          {exampleSession.completed ? (<div style={{padding:'10px', background:'rgba(0,255,0,0.2)', color:'#0f0', border:'1px solid #0f0', textAlign:'center', marginTop:'10px'}}>✅ {t.stepDone} (+200 PTS)</div>) : (<div style={{padding:'5px', textAlign:'center', color:'#ff0055'}}>...</div>)}
                          <button onClick={exitExample} style={{...ui.cyberBtn, padding:'5px', fontSize:'10px', width:'100%', marginTop:'10px'}}>{t.exitLab}</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="equation-box" style={{...ui.sectionBox, textAlign:'center', flexShrink: 0}}>
                    <LiveEquation mode={activeMode} p={pressure} v={volume} t={temp} />
                  </div>

                  <button className="generate-quiz-btn" onClick={triggerExercise} disabled={isGeneratingQuiz} style={{...ui.iaButton, opacity: isGeneratingQuiz ? 0.5 : 1, flexShrink: 0}}>
                    {isGeneratingQuiz ? t.loadingAI : t.generate}
                  </button>
                </div>

                {/* VISOR 3D */}
                <Canvas style={{position: 'absolute', inset: 0, zIndex: 1}} camera={{ position: [0, 4, isMobile ? 26 : 15], fov: 45 }}>
                  <color attach="background" args={['#010204']} /><Environment preset="night" /><ambientLight intensity={0.2} /><pointLight position={[0, 5, 0]} intensity={phaseID==='plasma'?10:3} color={phaseID==='plasma'?'#ffffff':'#00f2ff'} /><Stars count={6000} factor={5} fade speed={1} />
                  <Suspense fallback={null}>
                    <group position={[0, isMobile ? 1 : -2, 0]}>
                      <mesh position={[0, 2, 0]}><cylinderGeometry args={[2.5, 2.5, 4, 64]} /><meshPhysicalMaterial transparent opacity={0.15} color="#00f2ff" metalness={1} roughness={0} side={2}/></mesh>
                      <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[2.6, 2.8, 0.4, 64]} /><meshStandardMaterial color="#050505" /></mesh>
                      <MolecularPhysics count={isMobile ? 120 : 250} />
                    </group>
                  </Suspense>
                  <EffectComposer><Bloom luminanceThreshold={phaseID==='plasma'?0.5:1} mipmapBlur intensity={phaseID==='plasma'?3.0:2.0} />{isCritical && <ChromaticAberration offset={[0.01, 0.01]} />}</EffectComposer>
                  <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
                </Canvas>

                {/* ⬇️ PANEL DE CONTROLES INFERIOR: FlexWrap dinámico */}
                <div className="main-controls-dock" style={ui.controlPanel(isMobile)}>
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='BOYLE')?0.2:1, pointerEvents: (activeMode==='BOYLE')?'none':'auto'}}>
                     <div style={ui.controlLabel('#00f2ff')}>{t.temp}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('TEMP', 500)} style={ui.actionBtn('#ff0055')}>+500</button>
                       <button onClick={() => updatePhysics('TEMP', 50)} style={ui.actionBtn('#ff0055')}>+50</button>
                       <button onClick={() => updatePhysics('TEMP', -500)} style={ui.actionBtn('#00f2ff')}>-500</button>
                     </div>
                   </div>
                   
                   <div className="hud-readout-center" style={ui.hudControl(isCritical, phaseID, isMobile)}>
                      <div style={ui.hudVal(false, phaseID==='plasma'?'#fff':'#00f2ff', isMobile)}>{temp}K</div>
                      <div style={ui.hudVal(isCritical, '#ff0055', isMobile)}>{pressure.toFixed(1)} PSI</div>
                      <div style={ui.hudVal(false, '#ffea00', isMobile)}>{volume}%</div>
                   </div>
                   
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='CHARLES')?0.2:1, pointerEvents: (activeMode==='CHARLES')?'none':'auto'}}>
                     <div style={ui.controlLabel('#ffea00')}>{t.vol}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('VOL', 10)} style={ui.actionBtn('#ffea00')}>+10</button>
                       <button onClick={() => updatePhysics('VOL', -10)} style={ui.actionBtn('#ffea00')}>-10</button>
                     </div>
                   </div>
                   
                   <div className="control-column" style={{...ui.controlGroup, opacity: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?0.2:1, pointerEvents: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?'none':'auto'}}>
                     <div style={ui.controlLabel('#ff0055')}>{t.press}</div>
                     <div style={{display:'flex', gap:'clamp(5px, 1vw, 10px)'}}>
                       <button onClick={() => updatePhysics('PRESS', 10)} style={ui.actionBtn('#ff0055')}>+10</button>
                       <button onClick={() => updatePhysics('PRESS', -10)} style={ui.actionBtn('#ff0055')}>-10</button>
                     </div>
                   </div>
                </div>
             </>
          )}

        </div>
      )}
    </>
  );
}

// 🎨 DICCIONARIO DE ESTILOS MOBILE-FIRST (Uso intensivo de clamp y flexWrap)
const ui = {
  // Screens globales
  screenGame: { width:'100vw', height:'100dvh', backgroundColor:'#010204', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'Orbitron, sans-serif', position:'relative', overflow:'hidden', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' },
  hexBackground: { position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at center, rgba(0,242,255,0.05) 0%, transparent 60%)', backgroundSize:'40px 40px', zIndex: 1 },
  vignette: { position:'absolute', inset:0, boxShadow:'inset 0 0 250px rgba(0,0,0,0.95)', zIndex:2 },
  
  centerBoxGame: { zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', backdropFilter:'blur(8px)', padding:'clamp(20px, 5vw, 50px)', background:'rgba(0,5,15,0.7)', border:'1px solid rgba(0,242,255,0.2)', borderRadius:'15px', boxShadow:'0 0 50px rgba(0,0,0,0.8)', boxSizing: 'border-box' },
  titleGame: { color:'#00f2ff', fontSize:'clamp(28px, 6vw, 65px)', letterSpacing:'clamp(2px, 1vw, 8px)', textAlign:'center', margin:'0 0 30px 0', textShadow:'0 0 20px rgba(0,242,255,0.5)', fontWeight:900 },
  
  btnGridGame: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'20px', width:'100%' },
  gameGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(clamp(250px, 40vw, 350px), 1fr))', gap:'clamp(15px, 3vw, 30px)', width:'100%', marginTop:'20px' },
  gameCard: { background: 'rgba(0,15,30,0.8)', border: '1px solid #00f2ff', padding: 'clamp(15px, 4vw, 30px)', borderRadius: '12px', cursor: 'pointer', transition: '0.3s', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '120px' },
  
  cyberBtn: { padding:'clamp(12px, 3vw, 15px) clamp(15px, 4vw, 20px)', background:'rgba(0,10,20,0.8)', border:'1px solid #005577', color:'#00f2ff', cursor:'pointer', fontSize:'clamp(14px, 3vw, 16px)', fontFamily:'Orbitron', fontWeight:'bold', transition:'0.2s', borderRadius: '8px', minHeight: '48px' },
  solidCyberBtn: { padding:'clamp(12px, 3vw, 15px) clamp(20px, 4vw, 40px)', background:'linear-gradient(45deg, rgba(0,242,255,0.3), rgba(0,0,0,0.8))', borderLeft:'4px solid #00f2ff', color:'#fff', cursor:'pointer', fontSize:'clamp(14px, 3vw, 18px)', fontFamily:'Orbitron', fontWeight:'bold', width:'100%', margin:'0 auto', display:'block', borderRadius: '8px', minHeight: '48px' },
  
  resetBtnGame: { position:'absolute', top: 'max(10px, env(safe-area-inset-top))', left: 'clamp(10px, 3vw, 25px)', zIndex:100, padding:'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 20px)', background:'rgba(0,0,0,0.5)', border:'1px solid #ff4444', color:'white', cursor:'pointer', fontFamily:'Orbitron', fontSize: 'clamp(12px, 3vw, 16px)', borderRadius: '8px', minHeight: '40px' },
  
  screen: { width:'100vw', height:'100dvh', background:'#010204', fontFamily:'Orbitron', overflow:'hidden', position:'relative' },
  criticalOverlay: { position:'absolute', inset:0, boxShadow:'inset 0 0 200px rgba(255,0,85,0.4)', pointerEvents:'none', zIndex:99, transition:'0.3s' },
  
  // Paneles Laterales Flexibles
  leftPanel: (isMobile) => ({ position:'absolute', top: isMobile ? 'max(60px, calc(env(safe-area-inset-top) + 50px))' : '80px', left: isMobile ? '50%' : '30px', transform: isMobile ? 'translateX(-50%)' : 'none', zIndex:50, display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap:'10px', width: isMobile ? '95%' : 'clamp(200px, 25vw, 280px)', height: isMobile ? 'auto' : 'calc(100vh - 180px)', maxHeight: isMobile ? '18vh' : 'auto' }),
  rightPanel: (isMobile) => ({ position:'absolute', top: isMobile ? 'auto' : '80px', bottom: isMobile ? 'calc(clamp(90px, 15vh, 120px) + env(safe-area-inset-bottom))' : 'auto', right: isMobile ? 'auto' : '30px', left: isMobile ? '50%' : 'auto', transform: isMobile ? 'translateX(-50%)' : 'none', zIndex:50, display: 'flex', flexDirection: isMobile ? 'row' : 'column', flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: 'center', gap:'10px', width: isMobile ? '95%' : 'clamp(220px, 28vw, 300px)', maxHeight: isMobile ? 'auto' : 'calc(100vh - 180px)', overflowY: isMobile ? 'visible' : 'auto' }),
  
  sectionBox: { background:'rgba(0,10,20,0.7)', border:'1px solid rgba(0,85,119,0.5)', padding:'clamp(8px, 2vw, 15px)', backdropFilter:'blur(8px)', borderRadius: '10px' },
  panelTitle: { color:'#4488aa', margin:'0 0 10px 0', fontSize:'clamp(10px, 2vw, 12px)', letterSpacing:'2px' },
  searchInput: { width:'100%', padding:'10px', background:'rgba(0,0,0,0.5)', border:'1px solid #00f2ff', color:'#fff', fontFamily:'Orbitron', outline:'none', boxSizing:'border-box', flexShrink: 0, borderRadius: '6px' },
  pill: { flex:1, padding:'6px', fontSize:'clamp(10px, 2vw, 11px)', background:'transparent', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', borderRadius: '4px', whiteSpace: 'nowrap' },
  pillA: { flex:1, padding:'6px', fontSize:'clamp(10px, 2vw, 11px)', background:'rgba(0,242,255,0.2)', color:'#fff', border:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', borderRadius: '4px', whiteSpace: 'nowrap' },
  matBtn: (isMobile) => ({ padding:'10px', background:'rgba(0,0,0,0.5)', color:'#00f2ff', border:'1px solid #005577', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(12px, 2.5vw, 14px)', textAlign:'center', borderRadius: '6px', minWidth: isMobile ? '60px' : '100%', flexShrink: 0 }),
  matBtnActive: (isMobile) => ({ padding:'10px', background:'rgba(0,242,255,0.15)', color:'#fff', border:'2px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(12px, 2.5vw, 14px)', fontWeight:'bold', textAlign:'center', borderRadius: '6px', minWidth: isMobile ? '60px' : '100%', flexShrink: 0 }),
  dataRow: (isMobile) => ({ display:'flex', justifyContent:'space-between', alignItems: 'center', gap: '5px', fontSize:'clamp(10px, 2vw, 12px)', marginBottom: isMobile ? '0' : '8px', color:'#fff', borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', paddingBottom: isMobile ? '0' : '4px', whiteSpace: 'nowrap', padding: isMobile ? '5px 10px' : '0', background: isMobile ? 'rgba(0,0,0,0.4)' : 'transparent', borderRadius: isMobile ? '4px' : '0' }),
  modeGrid: (isMobile) => ({ display:'grid', gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : '1fr 1fr', gap:'8px' }),
  modeBtn: { padding:'10px 4px', background:'rgba(0,0,0,0.5)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(9px, 2vw, 11px)', borderRadius: '6px' },
  modeBtnA: { padding:'10px 4px', background:'rgba(255,234,0,0.1)', color:'#ffea00', border:'1px solid #ffea00', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(9px, 2vw, 11px)', fontWeight:'bold', borderRadius: '6px' },
  
  iaButton: { width:'100%', padding:'clamp(12px, 3vw, 15px)', background:'linear-gradient(45deg, #7b2cbf, #b5179e)', border:'2px solid #f72585', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3vw, 16px)', fontWeight:'bold', marginTop:'5px', boxShadow:'0 0 15px rgba(247, 37, 133, 0.5)', borderRadius: '8px', minHeight: '48px' },
  
  // Controles Inferiores (Dashboard Central): Envueltos y centrados
  controlPanel: (isMobile) => ({ position:'absolute', bottom: 'max(10px, env(safe-area-inset-bottom))', left:'50%', transform:'translateX(-50%)', zIndex:150, display:'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems:'center', gap:'clamp(10px, 2vw, 20px)', background:'rgba(0,5,15,0.85)', padding:'clamp(10px, 2vw, 15px) clamp(15px, 3vw, 30px)', borderRadius:'15px', border:'1px solid #00f2ff', boxShadow:'0 0 20px rgba(0,242,255,0.15)', backdropFilter:'blur(10px)', width: '95%', maxWidth: '900px', boxSizing: 'border-box' }),
  
  controlGroup: { display:'flex', flexDirection:'column', gap:'8px', alignItems: 'center' },
  controlLabel: (color) => ({ fontSize: 'clamp(10px, 2vw, 12px)', color: color, letterSpacing: '2px', textAlign: 'center', margin: 0, textShadow: `0 0 5px ${color}`, fontWeight: 'bold' }),
  actionBtn: (color) => ({ padding:'clamp(10px, 2vw, 12px) clamp(12px, 3vw, 18px)', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`2px solid ${color}`, color:color, cursor:'pointer', fontWeight:'bold', fontFamily:'Orbitron', borderRadius: '6px', fontSize: 'clamp(12px, 2.5vw, 16px)', minHeight: '44px' }),
  
  hudControl: (isCrit, phase, isMobile) => ({ background:'rgba(0,0,0,0.6)', padding:'clamp(8px, 2vw, 10px) clamp(15px, 4vw, 30px)', border:`2px solid ${phase==='plasma'?'#fff':(isCrit?'#ff0055':'#00f2ff')}`, textAlign:'center', minWidth:'clamp(120px, 30vw, 150px)', borderRadius:'10px', boxShadow: phase==='plasma'?'0 0 30px #fff':'', display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: isMobile ? '15px' : '5px', alignItems: 'center', justifyContent: 'center' }),
  hudVal: (isCrit, baseColor, isMobile) => ({ fontSize: isMobile ? 'clamp(14px, 3.5vw, 18px)' : 'clamp(20px, 4vw, 24px)', fontWeight:'bold', color: isCrit ? '#ff0055' : baseColor, margin: 0, textShadow:`0 0 10px ${baseColor}` }),
  
  // Modales
  quizOverlay: { position:'absolute', inset:0, background:'rgba(0,5,10,0.95)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(15px)', padding: 'clamp(15px, 4vw, 30px)', boxSizing: 'border-box' },
  quizBox: { background:'rgba(0,10,20,0.9)', border:'2px solid #00f2ff', padding:'clamp(20px, 6vw, 50px)', maxWidth:'900px', width:'100%', maxHeight:'85dvh', overflowY:'auto', textAlign:'center', boxShadow:'0 0 60px rgba(0,242,255,0.2)', borderRadius: '20px', boxSizing: 'border-box' },
  quizGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'clamp(15px, 3vw, 20px)', marginBottom:'20px', width: '100%' },
  quizBtn: { padding:'clamp(15px, 3vw, 25px)', background:'rgba(255,255,255,0.05)', border:'2px solid #555', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'clamp(14px, 3.5vw, 18px)', textAlign:'center', transition:'0.3s', borderRadius: '10px', minHeight: '60px', fontWeight: 'bold' }
};

// Parches Inyectados puros para CSS
if (typeof document !== 'undefined' && !document.getElementById("app-styles-mobile")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "app-styles-mobile";
  styleSheet.innerText = `
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(0,0,0,0.5); border-radius: 10px; }
    ::-webkit-scrollbar-thumb { background: rgba(0,242,255,0.4); border-radius: 10px; }
    
    /* Reglas Mágicas Mobile First */
    @media (max-width: 768px) {
       .game-panel-left { background: rgba(0,5,15,0.85); backdrop-filter: blur(10px); padding: 10px; border-radius: 15px; border: 1px solid #005577; }
       .game-panel-right { padding-bottom: 5px; }
       .material-selector-box { flex-direction: row !important; align-items: center; padding: 5px 10px !important; }
       .material-selector-box input { width: 30% !important; margin-right: 10px; }
       .filter-buttons { margin-top: 0 !important; }
       .element-stats-box { display: none !important; /* Ocultamos los stats extra arriba para salvar espacio, ya salen en HUD central */ }
       
       .score-box { padding: 5px 10px !important; }
       .mode-selector-box { padding: 5px 10px !important; }
       .equation-box { padding: 5px !important; }
       .generate-quiz-btn { padding: 8px !important; min-height: 40px !important; font-size: 12px !important; }
       
       .main-controls-dock { gap: 10px !important; padding: 10px !important; }
       .control-column { flex-direction: row !important; align-items: center; width: 100%; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 5px; }
       .hud-readout-center { width: 100%; justify-content: space-around !important; padding: 5px 0 !important; margin-bottom: 5px; }
    }
  `;
  document.head.appendChild(styleSheet);
}