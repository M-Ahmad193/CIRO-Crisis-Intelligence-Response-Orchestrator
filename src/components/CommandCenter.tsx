import React, { useState } from "react";
import { Crisis, Resource, Signal, TraceEntry } from "../../server/types";
import CrisisMap from "./CrisisMap";
import AgentTerminal from "./AgentTerminal";
import CrisisFeed from "./CrisisFeed";
import StatsPanel from "./StatsPanel";
import Timeline from "./Timeline";
import IntelligencePanel from "./IntelligencePanel";
import { LayoutDashboard, ShieldAlert, Activity, Cpu, Map as MapIcon, Settings, RotateCcw, Zap, TrendingUp, Users, Clock, Radio, Brain } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  state: {
    crises: Crisis[];
    resources: Resource[];
    signals: Signal[];
    trafficPoints?: any[];
    settings?: any;
  };
  traces: TraceEntry[];
}

export default function CommandCenter({ state, traces }: Props) {
  const [selectedCrisisId, setSelectedCrisisId] = useState<string | null>(null);
  const [heatmapEnabled, setHeatmapEnabled] = useState(true);
  const [mapMode, setMapMode] = useState<'streets' | 'satellite' | 'topology'>('streets');
  const [bottomTab, setBottomTab] = useState<'signals' | 'timeline' | 'reasoning'>('signals');
  const [activeView, setActiveView] = useState<'map' | 'signals' | 'incidents' | 'intelligence' | 'stats'>('map');
  const selectedCrisis = state.crises.find(c => c.id === selectedCrisisId);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-bg-primary select-none relative">
      {/* PERSISTENT DESKTOP HEADERS / MOBILE CONTENT HUB */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 overflow-hidden relative">
        
        {/* VIEW: INCIDENTS (Mobile: Tab / Desktop: Right Sidebar) */}
        <aside className={`
          ${activeView === 'incidents' ? 'fixed inset-0 z-[1001] bg-bg-primary flex pb-20' : 'hidden'} 
          lg:static lg:flex lg:col-span-3 border-r border-border-main flex-col bg-bg-secondary min-h-0 shrink-0 h-full overflow-hidden
        `}>
          <div className="px-5 py-4 border-b border-border-main flex justify-between items-center bg-bg-tertiary/50 shrink-0">
            <div>
              <h2 className="tech-label text-[10px] text-white">Critical Vector List</h2>
              <p className="text-[8px] font-mono text-text-dim uppercase tracking-widest">Active Incident Mesh</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-red-500 text-[10px] font-black">{state.crises.filter(c => c.severity === "CRITICAL").length} CRT</span>
              <div className="w-8 h-1 bg-red-900/30 rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-red-600 shadow-[0_0_8px_#ef4444]" style={{ width: `${(state.crises.filter(c => c.severity === "CRITICAL").length / 5) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-primary/20">
            <CrisisFeed 
              crises={state.crises} 
              selectedId={selectedCrisisId} 
              onSelect={(id) => {
                setSelectedCrisisId(id);
                if (window.innerWidth < 1024) setActiveView('map');
              }} 
            />
          </div>
          
          <div className="p-4 border-t border-border-main bg-bg-tertiary shrink-0">
            <div className="flex justify-between items-center mb-3">
              <h2 className="tech-label">Scenarios</h2>
              <button 
                onClick={() => fetch('/api/reset', { method: 'POST' })}
                className="p-1 hover:bg-bg-surface hover:text-red-500 transition-colors rounded text-text-dim"
              >
                <RotateCcw size={14} />
              </button>
              <button 
                onClick={() => fetch('/api/demo', { method: 'POST' })}
                className="px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded text-[8px] font-bold uppercase hover:bg-blue-600/20 transition-all ml-2"
              >
                DEMO
              </button>
            </div>
          </div>
        </aside>

        {/* VIEW: MAP & HUD (Mobile: Core / Desktop: Center) */}
        <main className={`
          ${(activeView === 'map' || activeView === 'intelligence') ? 'flex' : 'hidden'} 
          lg:flex lg:col-span-9 flex-col border-r border-border-main shrink-0 h-full relative
        `}>
          
          {/* MAP CANVAS */}
          <div className="flex-1 relative bg-bg-tertiary overflow-hidden border-b border-border-main flex flex-col">
            {/* Live Alert Ticker */}
            <div className="h-8 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center overflow-hidden z-[1002] shrink-0">
               <div className="flex items-center gap-2 px-4 shrink-0 bg-red-600/20 h-full border-r border-red-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest whitespace-nowrap">Tactical Alerts</span>
               </div>
               <div className="flex-1 overflow-hidden relative">
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: '-100%' }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="flex items-center gap-12 whitespace-nowrap py-1 font-mono text-[9px] text-text-muted"
                  >
                     {state.crises.length > 0 ? state.crises.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <span className="text-white font-bold">[{c.severity}]</span>
                           <span>{c.title}: {c.description.substring(0, 80)}...</span>
                           <span className="text-blue-400 font-bold tracking-tighter">{new Date(c.startTime).toLocaleTimeString()}</span>
                        </div>
                     )) : (
                        <div className="flex items-center gap-3">
                           <span className="text-green-500 font-bold">[NOMINAL]</span>
                           <span>All urban clusters reporting within safety parameters. Standing by for fusion link.</span>
                        </div>
                     )}
                  </motion.div>
               </div>
            </div>

            <div className="flex-1 relative">
              <CrisisMap 
                crises={state.crises} 
                resources={state.resources} 
                selectedCrisis={selectedCrisis}
                mapMode={mapMode}
                trafficPoints={state.trafficPoints || []}
                showHeatmap={heatmapEnabled}
              />
            </div>

            {/* Floating Operations HUD */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
              <div className="flex bg-bg-tertiary/90 backdrop-blur-xl border border-border-main rounded-sm shadow-2xl p-0.5">
                <button 
                  onClick={() => setMapMode('streets')}
                  className={`p-2 transition-all ${mapMode === 'streets' ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                > <MapIcon size={16} /> </button>
                <button 
                  onClick={() => setMapMode('satellite')}
                  className={`p-2 transition-all ${mapMode === 'satellite' ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                > <Settings size={16} /> </button>
              </div>
              <button 
                onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                className={`w-10 h-10 flex items-center justify-center border transition-all rounded shadow-2xl ${heatmapEnabled ? 'bg-red-600 border-red-500 text-white shadow-red-900/40' : 'bg-bg-tertiary/90 border-border-main text-text-dim'}`}
              >
                <Activity size={18} />
              </button>
            </div>

            {/* Tactical Live Counts */}
            <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-main p-2 px-3 rounded-sm shadow-2xl min-w-24">
                <p className="text-[7px] font-black text-blue-400 uppercase tracking-[0.2em] mb-1">Fleet Deployment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-black text-white leading-none tabular-nums">{state.resources.filter(r => r.status === 'DEPLOYED').length}</span>
                  <span className="text-[7px] text-text-muted uppercase">Ready Units</span>
                </div>
              </div>
              <div className="bg-bg-tertiary/90 backdrop-blur-xl border border-border-main p-2 px-3 rounded-sm shadow-2xl min-w-24">
                <p className="text-[7px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Fusion Load</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-mono font-black text-white leading-none tabular-nums">{state.signals.length}</span>
                  <span className="text-[7px] text-text-muted uppercase">Vectors</span>
                </div>
              </div>
            </div>

            {/* MOBILE QUICK ACTION HUD */}
            <AnimatePresence>
              {selectedCrisis && (activeView === 'map') && (
                <motion.div 
                  initial={{ opacity: 0, y: 150 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 150 }}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1001] w-[calc(100%-2rem)] max-w-sm lg:bottom-12"
                >
                  <div className="bg-bg-tertiary/95 backdrop-blur-2xl border border-amber-500/40 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <div className="flex items-center gap-2 mb-1">
                             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em]">Active Threat Detected</span>
                          </div>
                          <h3 className="text-white font-black text-lg tracking-tight uppercase italic">{selectedCrisis.title}</h3>
                       </div>
                       <button 
                         onClick={() => setSelectedCrisisId(null)}
                         className="p-1.5 hover:bg-white/10 rounded-full text-text-dim"
                       >
                         <RotateCcw size={16} />
                       </button>
                    </div>
                    
                    <p className="text-text-dim text-[11px] font-medium leading-relaxed mb-6 line-clamp-3">
                      {selectedCrisis.description}
                    </p>

                    <div className="flex gap-2">
                       <button 
                         onClick={() => {
                           setActiveView('intelligence');
                           setBottomTab('reasoning');
                         }}
                         className="flex-1 h-12 bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-3 transition-all rounded-xl text-[10px] font-black text-white uppercase tracking-[0.1em] shadow-[0_10px_20px_rgba(37,99,235,0.3)]"
                       >
                         <Brain size={16} />
                         Tactical Reasoning
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        {/* LOWER SECTION: DESKTOP CONSOLE / MOBILE INTEL OVERLAY */}
          <div className={`
             ${activeView === 'intelligence' ? 'fixed inset-0 z-[1100] bg-bg-primary flex pb-20' : 'hidden lg:flex'} 
             h-full lg:h-72 flex-col bg-bg-secondary
          `}>
             {/* Header with Close for Mobile Intelligence */}
             <div className="px-5 py-3 border-b border-border-main flex justify-between items-center bg-bg-tertiary shrink-0">
                <div className="flex gap-5">
                  <button 
                    onClick={() => setBottomTab('signals')}
                    className={`tech-label text-[10px] pb-2 border-b-2 transition-all ${bottomTab === 'signals' ? 'border-blue-500 text-white' : 'border-transparent text-text-dim'}`}
                  >
                    Signals
                  </button>
                  <button 
                    onClick={() => setBottomTab('timeline')}
                    className={`tech-label text-[10px] pb-2 border-b-2 transition-all ${bottomTab === 'timeline' ? 'border-brand-blue text-white' : 'border-transparent text-text-dim'}`}
                  >
                    Timeline
                  </button>
                  <button 
                    onClick={() => setBottomTab('reasoning')}
                    className={`tech-label text-[10px] pb-2 border-b-2 transition-all ${bottomTab === 'reasoning' ? 'border-amber-500 text-white' : 'border-transparent text-text-dim'}`}
                  >
                    Intel Forensics
                  </button>
                </div>
                <button 
                  className="lg:hidden w-8 h-8 flex items-center justify-center bg-bg-surface border border-border-main rounded-full text-text-main shadow-inner shadow-white/5 active:scale-95 transition-transform"
                  onClick={() => setActiveView('map')}
                >
                  <MapIcon size={14} />
                </button>
             </div>
             
             <div className="flex-1 overflow-hidden relative">
                {bottomTab === 'signals' && (
                  <div className="absolute inset-0 p-5 font-mono text-[10px] space-y-3 overflow-y-auto custom-scrollbar">
                    {state.signals.slice().reverse().map((s) => (
                      <div key={s.id} className="flex gap-4 items-start group border-l-2 border-transparent hover:border-blue-500/50 hover:bg-white/5 p-3 rounded-sm transition-all">
                        <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center shadow-lg ${
                          s.category === 'SOCIAL_MEDIA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                        }`}>
                          {s.category === 'SOCIAL_MEDIA' ? <Users size={16} /> : <Zap size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-text-main text-[12px] leading-tight group-hover:text-white transition-colors">{s.content}</p>
                          <div className="flex gap-3 mt-2 font-black uppercase text-[7px] tracking-widest text-text-dim">
                             <span>{(s.confidence * 100).toFixed(0)}% RELIABILITY</span>
                             <span>{new Date(s.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {bottomTab === 'timeline' && selectedCrisis && (
                  <div className="absolute inset-0">
                    <Timeline crisis={selectedCrisis} signals={state.signals} traces={traces} />
                  </div>
                )}
                {bottomTab === 'reasoning' && selectedCrisis && (
                  <div className="absolute inset-0">
                    <IntelligencePanel crisis={selectedCrisis} signals={state.signals} />
                  </div>
                )}
                {bottomTab !== 'signals' && !selectedCrisis && (
                    <div className="h-full flex items-center justify-center p-12 text-center">
                        <div className="max-w-xs space-y-4 opacity-40">
                             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <ShieldAlert size={24} />
                             </div>
                             <p className="tech-label uppercase tracking-widest text-xs">NO INCIDENT PINNED</p>
                             <p className="text-[10px] text-text-dim font-mono">Select an active crisis vector from the Events feed to initialize tactical forensics analysis.</p>
                        </div>
                    </div>
                )}
             </div>
          </div>
        </main>

        {/* VIEW: FULL GLOBAL SIGNALS (Mobile Only Page) */}
        <aside className={`
          ${activeView === 'signals' ? 'fixed inset-0 z-[1001] bg-bg-primary flex pb-20' : 'hidden'} 
          flex-col h-full
        `}>
          <div className="px-6 py-6 border-b border-border-main bg-bg-tertiary/50 flex justify-between items-center">
            <div>
              <h2 className="tech-label text-base text-white tracking-widest font-black uppercase italic">Global Signal Mesh</h2>
              <p className="text-[8px] font-mono text-blue-400 uppercase tracking-[0.3em]">Live Telemetry Convergence</p>
            </div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shadow-[0_0_15px_#3b82f6]" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary custom-scrollbar">
             {state.signals.length > 0 ? state.signals.slice().reverse().map(s => (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 key={s.id} 
                 className="bg-bg-tertiary/60 backdrop-blur-xl border border-white/5 p-5 rounded-2xl shadow-xl hover:border-blue-500/20 transition-all"
               >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${
                        s.category === 'SOCIAL_MEDIA' ? 'bg-blue-500/15 text-blue-400' : 
                        s.category === 'WEATHER' ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
                      }`}>
                        {s.category === 'SOCIAL_MEDIA' && <Users size={18}/>}
                        {s.category === 'WEATHER' && <Activity size={18}/>}
                        {s.category !== 'SOCIAL_MEDIA' && s.category !== 'WEATHER' && <Radio size={18}/>}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-white tracking-widest uppercase italic block leading-none">{s.category}</span>
                        <span className="text-[8px] font-mono text-text-dim block mt-0.5">SOURCE: EXTERNAL_FEED_V4</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-text-dim bg-white/5 px-2 py-1 rounded">{new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[14px] text-text-main font-medium leading-relaxed mb-4">{s.content}</p>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1 max-w-[120px] h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: `${s.confidence * 100}%` }}
                             className="h-full bg-blue-500" 
                           />
                        </div>
                        <span className="text-[9px] font-black text-blue-500">{(s.confidence * 100).toFixed(0)}% CONF</span>
                     </div>
                     <span className="text-[8px] font-mono text-text-dim uppercase tracking-tighter">SIG_ID: {s.id.substring(0,6)}</span>
                  </div>
               </motion.div>
             )) : (
                 <div className="h-full flex items-center justify-center p-12 text-center opacity-30 select-none">
                    <div className="space-y-4">
                        <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full animate-spin flex items-center justify-center mx-auto">
                            <Radio size={24} />
                        </div>
                        <p className="tech-label uppercase tracking-[0.4em] text-xs">Syncing Telemetry...</p>
                    </div>
                 </div>
             )}
          </div>
        </aside>

        {/* VIEW: STATS / INFRASTRUCTURE (Mobile Only Page) */}
        <aside className={`
          ${activeView === 'stats' ? 'fixed inset-0 z-[1001] bg-bg-primary flex pb-20' : 'hidden'} 
          flex-col h-full
        `}>
          <div className="px-6 py-6 border-b border-border-main bg-bg-tertiary/50">
            <h2 className="tech-label text-base tracking-widest uppercase font-black italic text-white flex items-center gap-3">
                <Activity size={18} className="text-green-400" />
                Network Stability Matrix
            </h2>
            <p className="text-[8px] font-mono text-text-dim uppercase tracking-[0.3em] mt-1 ml-8">City-Wide Infrastructure Real-Time Ticker</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 bg-bg-primary custom-scrollbar">
             <StatsPanel crises={state.crises} />
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR: REDESIGNED */}
      <nav className="lg:hidden h-20 border-t border-border-main bg-bg-tertiary/95 backdrop-blur-3xl flex z-[1201] shrink-0 pb-safe">
        <button 
          onClick={() => setActiveView('map')}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all relative ${activeView === 'map' ? 'text-blue-500' : 'text-text-dim'}`}
        >
          {activeView === 'map' && <motion.div layoutId="nav-bg" className="absolute top-2 w-12 h-10 bg-blue-500/10 rounded-2xl -z-10" />}
          <MapIcon size={20} className={activeView === 'map' ? 'scale-110' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Ops Map</span>
        </button>
        <button 
          onClick={() => setActiveView('incidents')}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all relative ${activeView === 'incidents' ? 'text-red-500' : 'text-text-dim'}`}
        >
          {activeView === 'incidents' && <motion.div layoutId="nav-bg" className="absolute top-2 w-12 h-10 bg-red-500/10 rounded-2xl -z-10" />}
          <div className="relative">
             <ShieldAlert size={20} className={activeView === 'incidents' ? 'scale-110' : ''} />
             {state.crises.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-bg-tertiary shadow-[0_0_10px_#ef4444] flex items-center justify-center text-[7px] font-black text-white">{state.crises.length}</span>}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Incidents</span>
        </button>
        <button 
          onClick={() => setActiveView('signals')}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all relative ${activeView === 'signals' ? 'text-purple-500' : 'text-text-dim'}`}
        >
          {activeView === 'signals' && <motion.div layoutId="nav-bg" className="absolute top-2 w-12 h-10 bg-purple-500/10 rounded-2xl -z-10" />}
          <Radio size={20} className={activeView === 'signals' ? 'scale-110 animate-pulse' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Fusion</span>
        </button>
        <button 
          onClick={() => setActiveView('stats')}
          className={`flex-1 flex flex-col items-center justify-center gap-1.5 transition-all relative ${activeView === 'stats' ? 'text-green-500' : 'text-text-dim'}`}
        >
          {activeView === 'stats' && <motion.div layoutId="nav-bg" className="absolute top-2 w-12 h-10 bg-green-500/10 rounded-2xl -z-10" />}
          <Activity size={20} className={activeView === 'stats' ? 'scale-110' : ''} />
          <span className="text-[8px] font-black uppercase tracking-widest leading-none">Pulse</span>
        </button>
      </nav>
    </div>
  );
}
