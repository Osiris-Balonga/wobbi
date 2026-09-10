import {useState,useRef,useEffect} from 'react';
import {Pencil,Play,Settings2,Sun,Moon,Download,X,ArrowUpRight} from 'lucide-react';
import {useStudio} from './studio/useStudio.js';
import {DesignPanel} from './studio/DesignPanel.jsx';
import {MotionPanel} from './studio/MotionPanel.jsx';
import {SettingsPanel,SettingsNav} from './studio/SettingsPanel.jsx';
import {Preview} from './studio/Preview.jsx';
import {ExportPanel} from './export/ExportPanel.jsx';
import {downloadSources} from './export/download.js';
import {Tabs} from './ui/Controls.jsx';
import './styles.css';
export default function App() {
 const {config,setConfig,patch,theme,setTheme,storageError}=useStudio();
 const [mode,setMode]=useState('design');const [reaction,setReaction]=useState(config.defaultState);
 const [view,setView]=useState('preview');const [playing,setPlaying]=useState(false);const [replay,setReplay]=useState(0);const [zoom,setZoom]=useState(100);
 const [exportTab,setExportTab]=useState('install');const [notice,setNotice]=useState('');
 const [mobilePanel,setMobilePanel]=useState('canvas');
 const docsRef=useRef(null);const noticeTimer=useRef(null);
 useEffect(()=>()=>clearTimeout(noticeTimer.current),[]);
 function notify(message){setNotice(message);clearTimeout(noticeTimer.current);noticeTimer.current=setTimeout(()=>setNotice(''),4000);}
 function changeMode(value){setMode(value);if(value==='motion')setView('preview');}
 return <div className="studio" data-testid="studio" data-theme={theme} data-mobile-panel={mobilePanel}>
  <header className="navbar"><a className="brand" href="#" aria-label="Wobbi home" onClick={e=>{e.preventDefault();changeMode('design');setMobilePanel('canvas');}}><img src="/brand/wobbi-symbol.png" width="38" height="38" alt=""/><span>Wobbi<span className="brand-dot">.</span></span></a><span className="beta">BETA</span><span className="navbar-tagline">Tiny characters. <span>Big personality.</span> Ship them anywhere.</span><nav aria-label="Global navigation"><button className="nav-link" onClick={()=>docsRef.current.showModal()}>Docs<ArrowUpRight size={12}/></button><button className="nav-link" onClick={()=>{changeMode('design');setView('grid');setMobilePanel('canvas');}}>Examples</button><span className="nav-divider"/><div className="theme-toggle" role="group" aria-label="Global theme"><button aria-label="Light theme" aria-pressed={theme==='light'} onClick={()=>setTheme('light')}><Sun size={17}/></button><button aria-label="Dark theme" aria-pressed={theme==='dark'} onClick={()=>setTheme('dark')}><Moon size={16}/></button></div><button className="primary export-action" aria-label="Export mascot" onClick={()=>{downloadSources(config);notify('Sources downloaded');}}><Download size={16}/>Export</button></nav></header>
  <nav className="mobile-nav" aria-label="Workspace panels">{['design','canvas','export'].map(panel=><button key={panel} aria-pressed={mobilePanel===panel} onClick={()=>setMobilePanel(panel)}>{panel==='design'?'Customize':panel==='canvas'?'Preview':'Export'}</button>)}</nav>
  <div className="workspace"><aside className="customization-panel" aria-label="Customization panel"><Tabs label="Studio mode" value={mode} onChange={changeMode} panelId="customization-content" className="mode-tabs" items={[{value:'design',label:'Design',icon:Pencil},{value:'motion',label:'Motion',icon:Play},{value:'settings',label:'Settings',icon:Settings2}]}/><div id="customization-content" role="tabpanel" aria-label={mode}>{mode==='design'?<DesignPanel config={config} patch={patch} onPreset={next=>{setConfig(next);setReaction(next.defaultState);}}/>:mode==='motion'?<MotionPanel config={config} reaction={reaction} onReaction={setReaction} patch={patch}/>:<SettingsNav config={config}/>}</div></aside>
  <main>{mode==='settings'?<SettingsPanel config={config} setConfig={next=>{setConfig(next);setReaction(next.defaultState);}} notify={notify}/>:<Preview config={config} reaction={reaction} onReaction={setReaction} view={view} setView={setView} mode={mode} playing={playing} setPlaying={setPlaying} replay={replay} setReplay={setReplay} zoom={zoom} setZoom={setZoom} onRename={()=>changeMode('settings')}/>}</main>
  <ExportPanel config={config} patch={patch} notify={notify} tab={exportTab} setTab={setExportTab}/></div>
  <div className={`toast ${notice||storageError?'visible':''}`} role="status" aria-live="polite">{notice||storageError}</div>
  <dialog ref={docsRef} className="docs-dialog"><div className="dialog-heading"><h2>A little guide to Wobbi</h2><button className="icon-button" aria-label="Close documentation" onClick={()=>docsRef.current.close()}><X size={20}/></button></div><p>Pick a preset, make it yours, then give it a reaction.</p><ol><li><strong>Design.</strong> Change the shape, eyes, mouth and colors. Every edit appears in the preview.</li><li><strong>Motion.</strong> Pick one of eight reactions. Toggle and reorder movements, then press Play.</li><li><strong>Settings.</strong> Name your component, choose its defaults and save.</li><li><strong>Export.</strong> Download a ZIP of your current mascot and copy the four files into your React app. Import the component from its index file.</li></ol><p>The local CLI installs the six original presets. For your own edits, download the source ZIP or configuration JSON. No remote registry is connected in V1.</p><p>Everything saves on this device. You own the generated source.</p><button className="primary" onClick={()=>docsRef.current.close()}>Let’s make a buddy</button></dialog>
 </div>;
}
