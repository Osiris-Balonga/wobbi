import {titleCase} from '../ui/labels.js';
import {Play,Pause,RotateCcw,Grid2X2,ZoomIn,Pencil,Maximize2} from 'lucide-react';
import {REACTIONS} from '../../packages/core/config.js';
import {Mascot} from '../mascot/Mascot.jsx';
import {Tabs,Switch} from '../ui/Controls.jsx';
export function Preview({config,reaction,onReaction,view,setView,mode,playing,setPlaying,replay,setReplay,zoom,setZoom,onRename}) {
 const background=config.background.type==='transparent'?'transparent':config.background.type==='gradient'?`linear-gradient(145deg, ${config.background.color}, color-mix(in srgb, ${config.background.color}, white 42%))`:config.background.color;
 return <div className="preview-workspace">
  <div className="canvas-heading"><div className="mascot-title"><h1>{config.name}</h1><button className="icon-button" aria-label="Rename mascot" onClick={onRename}><Pencil size={15}/></button><span className="saved-tag"><i/>Saved locally</span></div><button className="icon-button" aria-label="Reset zoom" title="Fit preview" onClick={()=>setZoom(100)}><Maximize2 size={17}/></button></div>
  <section className={`canvas ${view==='grid'?'canvas-grid':''}`} aria-label="Mascot canvas">
   {view==='preview'?<div className="stage-wrap" data-testid="main-preview"><div className="mascot-stage" data-testid="mascot-stage" data-background={config.background.type} style={{background}}><div style={{transform:`scale(${zoom/100})`}}><Mascot config={config} state={reaction} playing={playing} replay={replay}/></div><span className="stage-shadow"/></div></div>:<div className="reaction-grid" data-testid="reaction-grid">{REACTIONS.map(state=><button className="grid-reaction" key={state} aria-label={`Preview ${titleCase(state)}`} onClick={()=>{onReaction(state);setView('preview');}}><span style={{background}} data-background={config.background.type}><Mascot config={config} state={state} size={128} playing={playing} replay={replay}/></span><strong>{titleCase(state)}</strong></button>)}</div>}
   <div className="canvas-toolbar">{mode==='motion'?<div className="playback-buttons"><button className="primary small" onClick={()=>{setPlaying(!playing);setReplay(n=>n+1);}}>{playing?<Pause size={14}/>:<Play size={14}/>} {playing?'Pause':'Play'}</button><button className="subtle-button" onClick={()=>{setPlaying(true);setReplay(n=>n+1);}}><RotateCcw size={14}/>Replay</button></div>:<Tabs label="Canvas view" value={view} onChange={setView} items={[{value:'preview',label:'Preview',icon:Play},{value:'grid',label:'Grid',icon:Grid2X2}]}/>}
    <label className="zoom-control"><ZoomIn size={15}/><span>Zoom</span><select aria-label="Zoom" value={zoom} onChange={e=>setZoom(Number(e.target.value))}>{[50,75,100,125,150].map(n=><option key={n} value={n}>{n}%</option>)}</select></label>
   </div>
  </section>
  <section className="reactions"><div className="reactions-heading"><div><h2>Reactions</h2><p>Simple states. Big personality.</p></div><label className="switch-label"><span>Auto play</span><Switch label="Auto play" checked={playing} onChange={setPlaying}/></label></div><div className="reaction-strip">{REACTIONS.map(state=><button key={state} className="reaction-button" aria-label={`Reaction ${titleCase(state)}`} aria-pressed={reaction===state} onClick={()=>onReaction(state)}><span><Mascot config={config} state={state} size={58} playing={false}/></span><strong>{titleCase(state)}</strong></button>)}</div></section>
  <div className="canvas-footer"><span><span className="purple-dot"/>Made to move. Built to be yours.</span><span>SVG · {config.size} × {config.size}</span></div>
 </div>;
}

