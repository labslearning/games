import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import MolecularPhysics from '../../components/MolecularPhysics';
import { useGameStore, i18n } from '../../store/useGameStore';
import { MATERIALS } from '../../data/materials';

// 🧮 COMPONENTE DE ECUACIONES (Desacoplado)
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

// 🎮 CARTUCHO PRINCIPAL: REACTOR CUÁNTICO
export default function GasLaws() {
  const { temp, volume, pressure, phaseID, isCritical, activeMaterial, setMaterial, activeMode, setMode, updatePhysics, language, score, triggerExercise, exampleSession, loadExampleScenario, exitExample, searchTerm, setSearchTerm, filterCategory, setFilterCategory, isGeneratingQuiz } = useGameStore();
  const mat = MATERIALS[activeMaterial] || MATERIALS['H2O'];
  const t_i18n = i18n[language] || i18n.es;
  const t = t_i18n.ui;
  const lesson = t_i18n.lessons[activeMode];
  const examples = t_i18n.examples[activeMode];

  // Filtro algorítmico de catálogo (O(n) optimizado)
  const filteredMaterials = Object.values(MATERIALS).filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div style={{...ui.criticalOverlay, opacity: isCritical ? 1 : 0}} />

      {/* ⬅️ PANEL IZQUIERDO: MENDELEEV (Altura calc estricta para no superponer) */}
      <div style={ui.leftPanel}>
        <div style={{...ui.sectionBox, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
          <input type="text" placeholder={t.search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={ui.searchInput} />
          <div style={{display:'flex', gap:'5px', marginTop:'10px', flexShrink: 0}}>
            <button onClick={()=>setFilterCategory('All')} style={filterCategory==='All'?ui.pillA:ui.pill}>{t.filterAll}</button>
            <button onClick={()=>setFilterCategory('Elemento')} style={filterCategory==='Elemento'?ui.pillA:ui.pill}>{t.filterElem}</button>
            <button onClick={()=>setFilterCategory('Compuesto')} style={filterCategory==='Compuesto'?ui.pillA:ui.pill}>{t.filterComp}</button>
          </div>
          {/* SCROLL INTERNO PARA EL CATÁLOGO */}
          <div style={{flex: 1, overflowY: 'auto', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px', paddingRight: '5px'}}>
            {filteredMaterials.map(m => (
              <button key={m.id} onClick={() => setMaterial(m.id)} style={activeMaterial === m.id ? ui.matBtnActive : ui.matBtn}>
                <span style={{fontWeight:'bold', width:'40px', display:'inline-block'}}>{m.symbol}</span> {m.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* TARJETA DE PROPIEDADES */}
        <div style={{...ui.sectionBox, background:'rgba(0,15,30,0.8)', borderLeft:'3px solid #00f2ff', flexShrink: 0}}>
          <h3 style={ui.panelTitle}>// {mat.symbol} ({t[phaseID]?.toUpperCase() || phaseID.toUpperCase()})</h3>
          <div style={ui.dataRow}><span>{t.atomicNum}</span><span style={{color:'#ffea00'}}>{mat.atomicNum}</span></div>
          <div style={ui.dataRow}><span>{t.mass}</span><span style={{color:'#ffea00'}}>{mat.mass} g/mol</span></div>
          <div style={ui.dataRow}><span>{t.eConfig}</span><span style={{color:'#00f2ff', fontSize:'9px'}}>{mat.eConfig}</span></div>
          <div style={ui.dataRow}><span>{t.density}</span><span style={{color:'#00f2ff'}}>{mat.density} g/cm³</span></div>
        </div>
      </div>

      {/* ➡️ PANEL DERECHO: DASHBOARD DE LEYES Y MISIONES */}
      <div style={ui.rightPanel}>
        <div style={{...ui.sectionBox, borderLeft:'4px solid #ffea00', background:'rgba(50,40,0,0.8)', flexShrink: 0}}>
          <h3 style={{...ui.panelTitle, color:'#ffea00', fontSize:'14px', margin:0}}>🏆 SCORE: {score} PTS</h3>
        </div>
        
        <div style={{...ui.sectionBox, flexShrink: 0}}><h3 style={ui.panelTitle}>// {t.classMode || "LEYES"}</h3>
          <div style={ui.modeGrid}>{['FREE', 'BOYLE', 'CHARLES', 'GAY_LUSSAC'].map(m => <button key={m} onClick={()=>setMode(m)} style={activeMode===m ? ui.modeBtnA : ui.modeBtn}>{t[`mode${m.charAt(0)+m.slice(1).toLowerCase().replace('_l','L')}`] || m}</button>)}</div>
          <div style={{marginTop:'15px', fontSize:'11px', color:'#ccc', lineHeight:'1.5'}}><strong style={{color:'#00f2ff'}}>{lesson.title}</strong><br/><span style={{color:'#ffea00'}}>{t.goal}:</span> {lesson.goal}<br/><span style={{color:'#00f2ff'}}>{t.idea}:</span> {lesson.idea}</div>
        </div>

        {/* 🔬 MISIÓN (LAB DE EJEMPLOS) */}
        {activeMode !== 'FREE' && (
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

        {/* 🧮 ECUACIONES EN VIVO */}
        <div style={{...ui.sectionBox, textAlign:'center', flexShrink: 0}}>
          <LiveEquation mode={activeMode} p={pressure} v={volume} t={temp} />
        </div>

        {/* 🧠 BOTÓN IA (Específico del nivel) */}
        <button onClick={triggerExercise} disabled={isGeneratingQuiz} style={{...ui.iaButton, opacity: isGeneratingQuiz ? 0.5 : 1, flexShrink: 0}}>
          {isGeneratingQuiz ? t.loadingAI : t.generate}
        </button>
      </div>

      {/* ⚛️ MOTOR 3D (WEBGL) */}
      <Canvas camera={{ position: [0, 4, 15], fov: 45 }}>
        <color attach="background" args={['#010204']} /><Environment preset="night" /><ambientLight intensity={0.2} /><pointLight position={[0, 5, 0]} intensity={phaseID==='plasma'?10:3} color={phaseID==='plasma'?'#ffffff':'#00f2ff'} /><Stars count={6000} factor={5} fade speed={1} />
        <Suspense fallback={null}>
          <group position={[0, -2, 0]}>
            <mesh position={[0, 2, 0]}><cylinderGeometry args={[2.5, 2.5, 4, 64]} /><meshPhysicalMaterial transparent opacity={0.15} color="#00f2ff" metalness={1} roughness={0} side={2}/></mesh>
            <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[2.6, 2.8, 0.4, 64]} /><meshStandardMaterial color="#050505" /></mesh>
            <MolecularPhysics count={250} />
          </group>
        </Suspense>
        <EffectComposer><Bloom luminanceThreshold={phaseID==='plasma'?0.5:1} mipmapBlur intensity={phaseID==='plasma'?3.0:2.0} />{isCritical && <ChromaticAberration offset={[0.01, 0.01]} />}</EffectComposer>
        <OrbitControls makeDefault enablePan={false} maxPolarAngle={Math.PI / 1.8} />
      </Canvas>

      {/* 🎛️ CONTROLES TÁCTICOS INFERIORES */}
      <div style={ui.controlPanel}>
         <div style={{...ui.controlGroup, opacity: (activeMode==='BOYLE')?0.2:1, pointerEvents: (activeMode==='BOYLE')?'none':'auto'}}>
           <div style={ui.controlLabel('#00f2ff')}>{t.temp}</div>
           <div style={{display:'flex', gap:'5px'}}>
             <button onClick={() => updatePhysics('TEMP', 500)} style={ui.actionBtn('#ff0055')}>+500</button>
             <button onClick={() => updatePhysics('TEMP', 50)} style={ui.actionBtn('#ff0055')}>+50</button>
             <button onClick={() => updatePhysics('TEMP', -500)} style={ui.actionBtn('#00f2ff')}>-500</button>
           </div>
         </div>
         <div style={ui.hud(isCritical, phaseID)}>
            <div style={ui.hudVal(false, phaseID==='plasma'?'#fff':'#00f2ff')}>{temp}K</div>
            <div style={ui.hudVal(isCritical, '#ff0055')}>{pressure.toFixed(1)} PSI</div>
            <div style={ui.hudVal(false, '#ffea00')}>{volume}%</div>
         </div>
         <div style={{...ui.controlGroup, opacity: (activeMode==='CHARLES')?0.2:1, pointerEvents: (activeMode==='CHARLES')?'none':'auto'}}>
           <div style={ui.controlLabel('#ffea00')}>{t.vol}</div>
           <div style={{display:'flex', gap:'5px'}}>
             <button onClick={() => updatePhysics('VOL', 10)} style={ui.actionBtn('#ffea00')}>+10</button>
             <button onClick={() => updatePhysics('VOL', -10)} style={ui.actionBtn('#ffea00')}>-10</button>
           </div>
         </div>
         <div style={{...ui.controlGroup, opacity: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?0.2:1, pointerEvents: (activeMode==='CHARLES'||activeMode==='GAY_LUSSAC')?'none':'auto'}}>
           <div style={ui.controlLabel('#ff0055')}>{t.press}</div>
           <div style={{display:'flex', gap:'5px'}}>
             <button onClick={() => updatePhysics('PRESS', 10)} style={ui.actionBtn('#ff0055')}>+10</button>
             <button onClick={() => updatePhysics('PRESS', -10)} style={ui.actionBtn('#ff0055')}>-10</button>
           </div>
         </div>
      </div>
    </>
  );
}

// 🎨 DICCIONARIO DE ESTILOS MODULAR
const ui = {
  criticalOverlay: { position:'absolute', inset:0, boxShadow:'inset 0 0 200px rgba(255,0,85,0.4)', pointerEvents:'none', zIndex:99, transition:'0.3s' },
  leftPanel: { position:'absolute', top:'80px', left:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'15px', width:'280px', height:'calc(100vh - 180px)' },
  rightPanel: { position:'absolute', top:'80px', right:'30px', zIndex:50, display:'flex', flexDirection:'column', gap:'15px', width:'300px', maxHeight:'calc(100vh - 180px)', overflowY:'auto' },
  sectionBox: { background:'rgba(0,10,20,0.7)', border:'1px solid rgba(0,85,119,0.5)', padding:'15px', backdropFilter:'blur(8px)' },
  panelTitle: { color:'#4488aa', margin:'0 0 15px 0', fontSize:'10px', letterSpacing:'3px' },
  searchInput: { width:'100%', padding:'10px', background:'rgba(0,0,0,0.5)', border:'1px solid #00f2ff', color:'#fff', fontFamily:'Orbitron', outline:'none', boxSizing:'border-box', flexShrink: 0 },
  pill: { flex:1, padding:'5px', fontSize:'9px', background:'transparent', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron' },
  pillA: { flex:1, padding:'5px', fontSize:'9px', background:'rgba(0,242,255,0.2)', color:'#fff', border:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron' },
  matBtn: { padding:'10px', background:'rgba(0,0,0,0.5)', color:'#00f2ff', border:'1px solid #005577', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', textAlign:'left' },
  matBtnActive: { padding:'10px', background:'rgba(0,242,255,0.15)', color:'#fff', borderLeft:'3px solid #00f2ff', borderTop:'1px solid #00f2ff', borderRight:'1px solid #00f2ff', borderBottom:'1px solid #00f2ff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'11px', fontWeight:'bold' },
  dataRow: { display:'flex', justifyContent:'space-between', fontSize:'11px', marginBottom:'8px', color:'#fff', borderBottom:'1px solid rgba(255,255,255,0.1)', paddingBottom:'3px' },
  modeGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' },
  modeBtn: { padding:'10px 5px', background:'rgba(0,0,0,0.5)', color:'#888', border:'1px solid #333', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px' },
  modeBtnA: { padding:'10px 5px', background:'rgba(255,234,0,0.1)', color:'#ffea00', border:'1px solid #ffea00', cursor:'pointer', fontFamily:'Orbitron', fontSize:'10px', fontWeight:'bold' },
  iaButton: { width:'100%', padding:'15px', background:'linear-gradient(45deg, #7b2cbf, #b5179e)', border:'2px solid #f72585', color:'#fff', cursor:'pointer', fontFamily:'Orbitron', fontSize:'14px', fontWeight:'bold', marginTop:'5px', boxShadow:'0 0 15px rgba(247, 37, 133, 0.5)' },
  solidCyberBtn: { padding:'15px 40px', background:'linear-gradient(45deg, rgba(0,242,255,0.3), rgba(0,0,0,0.8))', borderLeft:'4px solid #00f2ff', color:'#fff', cursor:'pointer', fontSize:'18px', fontFamily:'Orbitron', fontWeight:'bold', width:'100%', display:'block' },
  cyberBtn: { padding:'10px 20px', background:'rgba(0,10,20,0.8)', border:'1px solid #005577', color:'#00f2ff', cursor:'pointer', fontSize:'14px', fontFamily:'Orbitron', fontWeight:'bold', transition:'0.2s' },
  controlPanel: { position:'absolute', bottom:'20px', left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', alignItems:'center', gap:'20px', background:'rgba(0,5,15,0.85)', padding:'15px 30px', borderRadius:'10px', border:'1px solid #00f2ff', boxShadow:'0 0 20px rgba(0,242,255,0.15)', backdropFilter:'blur(5px)' },
  controlGroup: { display:'flex', flexDirection:'column', gap:'8px' },
  controlLabel: (color) => ({ fontSize: '10px', color: color, letterSpacing: '2px', textAlign: 'center', marginBottom:'-2px', textShadow: `0 0 5px ${color}` }),
  actionBtn: (color) => ({ padding:'12px 15px', background:`rgba(${color==='#ff0055'?'255,0,85':(color==='#00f2ff'?'0,242,255':'255,234,0')}, 0.1)`, border:`2px solid ${color}`, color:color, cursor:'pointer', fontWeight:'bold', fontFamily:'Orbitron' }),
  hud: (isCrit, phase) => ({ background:'rgba(0,0,0,0.6)', padding:'10px 30px', border:`2px solid ${phase==='plasma'?'#fff':(isCrit?'#ff0055':'#00f2ff')}`, textAlign:'center', minWidth:'120px', borderRadius:'5px', boxShadow: phase==='plasma'?'0 0 30px #fff':'' }),
  hudVal: (isCrit, baseColor) => ({ fontSize:'22px', fontWeight:'bold', color: isCrit ? '#ff0055' : baseColor, margin: '5px 0', textShadow:`0 0 10px ${baseColor}` })
};
