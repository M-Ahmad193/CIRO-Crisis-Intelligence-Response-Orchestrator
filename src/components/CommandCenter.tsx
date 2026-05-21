import React, { useState } from "react";
import { Crisis, Resource, Signal, TraceEntry } from "../../server/types";
import CrisisMap from "./CrisisMap";
import AgentTerminal from "./AgentTerminal";
import CrisisFeed from "./CrisisFeed";
import StatsPanel from "./StatsPanel";
import Timeline from "./Timeline";
import IntelligencePanel from "./IntelligencePanel";
import FleetDeployment from "./FleetDeployment";
import { LayoutDashboard, ShieldAlert, Activity, Cpu, Map as MapIcon, Settings, RotateCcw, Zap, TrendingUp, Users, Clock, Radio, Brain, Maximize2, Minimize2, Truck, ExternalLink } from "lucide-react";
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isFleetVisible, setIsFleetVisible] = useState(false);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFetchingOsint, setIsFetchingOsint] = useState(false);

  const triggerOsint = async () => {
    setIsFetchingOsint(true);
    try {
      const res = await fetch('/api/osint', { method: 'POST' });
      const data = await res.json();
      console.log('OSINT Result:', data);
    } catch (err) {
      console.error('OSINT Trigger Error:', err);
    } finally {
      setIsFetchingOsint(false);
    }
  };
  const [mapPosition, setMapPosition] = useState<{ center: [number, number]; zoom: number }>({
    center: [31.5204, 74.3587], // Lahore default
    zoom: 13
  });

  const handlePositionChange = (pos: { center: [number, number]; zoom: number }) => {
    setMapPosition(prev => {
      const dist = Math.sqrt(
        Math.pow(prev.center[0] - pos.center[0], 2) + 
        Math.pow(prev.center[1] - pos.center[1], 2)
      );
      // Only update if difference is noticeable
      if (dist < 0.00001 && Math.abs(prev.zoom - pos.zoom) < 0.01) {
        return prev;
      }
      return pos;
    });
  };

  const selectedCrisis = state.crises.find(c => c.id === selectedCrisisId);

  const handleCrisisSelect = (id: string | null) => {
    setSelectedCrisisId(id);
    const crisis = state.crises.find(c => c.id === id);
    if (crisis && crisis.location) {
      setMapPosition({
        center: [crisis.location.lat, crisis.location.lng],
        zoom: 14
      });
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-bg-primary select-none relative">
      {/* PERSISTENT DESKTOP HEADERS / MOBILE CONTENT HUB */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* VIEW: INCIDENTS (Mobile: Full Page Overlay / Desktop: Left Sidebar) */}
        <AnimatePresence>
          {activeView === 'incidents' && (
            <motion.aside 
              key="mobile-incidents-overlay"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed inset-0 z-[1200] bg-bg-primary flex flex-col pb-20 w-full lg:hidden"
            >
              <div className="px-6 py-8 border-b border-white/5 flex justify-between items-center bg-bg-secondary/40 backdrop-blur-3xl shrink-0">
                <div>
                   <h2 className="tech-label text-base text-white tracking-[0.2em] font-black uppercase italic">Situation Mesh</h2>
                   <p className="text-[9px] font-mono text-blue-400 uppercase tracking-[0.3em] mt-1">Live Threat Feed Convergence</p>
                </div>
                <button 
                  onClick={() => setActiveView('map')}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-text-dim shadow-xl active:scale-90 transition-all"
                >
                  <RotateCcw size={20} className="-rotate-90" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-primary/50 px-2 pt-4">
                <CrisisFeed 
                  crises={state.crises} 
                  selectedId={selectedCrisisId} 
                  onSelect={(id) => {
                    handleCrisisSelect(id);
                    setActiveView('map');
                  }} 
                />
              </div>

              <div className="p-6 border-t border-white/5 bg-bg-tertiary/40 backdrop-blur-2xl shrink-0">
                <div className="flex justify-between items-center bg-white/[0.03] border border-white/10 p-5 rounded-[2rem]">
                  <div>
                    <h2 className="tech-label text-[10px] text-white">Simulation Engine</h2>
                    <p className="text-[7px] text-text-muted uppercase tracking-[0.4em]">Protocol 9-X</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => fetch('/api/reset', { method: 'POST' })}
                      className="p-2.5 px-5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => fetch('/api/demo', { method: 'POST' })}
                      className="p-2.5 px-5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.1)]"
                    >
                      Demo
                    </button>
                    <button 
                      onClick={triggerOsint}
                      disabled={isFetchingOsint}
                      className={`p-2.5 px-5 bg-purple-600/10 text-purple-400 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.1)] ${isFetchingOsint ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isFetchingOsint ? 'Syncing...' : 'Launch OSINT'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {isSidebarVisible && !isFullscreen && (
            <motion.aside 
              key="desktop-incident-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "22%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="lg:flex border-r border-border-main flex-col bg-bg-secondary min-h-0 shrink-0 h-full overflow-hidden hidden"
            >
              <div className="px-5 py-4 border-b border-border-main flex justify-between items-center bg-bg-tertiary/50 shrink-0">
                <div>
                  <h2 className="tech-label text-[10px] text-white tracking-widest uppercase">Critical Vector List</h2>
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
                  onSelect={(id) => handleCrisisSelect(id)} 
                />
              </div>
              
              <div className="p-4 border-t border-border-main bg-bg-tertiary shrink-0">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="tech-label uppercase tracking-widest text-[9px]">Scenarios</h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => fetch('/api/reset', { method: 'POST' })}
                      className="p-1 hover:bg-bg-surface hover:text-red-500 transition-colors rounded text-text-dim"
                      title="Reset Data"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      onClick={() => fetch('/api/demo', { method: 'POST' })}
                      className="px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded text-[8px] font-bold uppercase hover:bg-blue-600/20 transition-all font-mono"
                    >
                      DEMO
                    </button>
                    <button 
                      onClick={triggerOsint}
                      disabled={isFetchingOsint}
                      className={`px-2 py-0.5 bg-purple-600/10 text-purple-400 border border-purple-500/30 rounded text-[8px] font-bold uppercase hover:bg-purple-600/20 transition-all font-mono italic ${isFetchingOsint ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isFetchingOsint ? 'SYNCING' : 'OSINT'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* VIEW: MAP & HUD (Mobile: Core / Desktop: Center) */}
        <main className="flex flex-1 flex-col border-r border-border-main shrink-0 h-full relative overflow-hidden transition-all duration-500 ease-in-out">
          
          {/* MAP CANVAS */}
          <div className="flex-1 relative bg-bg-tertiary overflow-hidden border-b border-border-main flex flex-col">
            {/* Live Alert Ticker */}
            <div className={`h-8 bg-black/60 backdrop-blur-xl border-b border-white/5 flex items-center overflow-hidden z-[1002] shrink-0 transition-all ${isFullscreen ? 'opacity-0 h-0 border-none' : ''}`}>
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
                     {state.crises.length > 0 ? state.crises.map((c) => (
                        <div key={`ticker-${c.id}`} className="flex items-center gap-3">
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
               
               {/* Fleet deployment besides the alert bar */}
               <div className="hidden md:flex items-center gap-4 px-4 h-full border-l border-white/10 bg-blue-500/5">
                  <div className="flex items-center gap-2">
                     <Truck size={10} className="text-blue-400" />
                     <span className="text-[8px] font-black text-text-dim uppercase">Fleet:</span>
                     <span className="text-[9px] font-mono font-black text-white">{state.resources.filter(r => r.status === 'DEPLOYED').length}/{state.resources.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock size={10} className="text-text-dim" />
                     <span className="text-[8px] font-mono text-text-dim tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}Z</span>
                  </div>
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
                position={mapPosition}
                onPositionChange={handlePositionChange}
              />
            </div>

            {/* Floating Operations HUD */}
            <div className="absolute top-4 left-4 z-[1100] flex flex-col gap-2">
              <div className="flex bg-bg-tertiary/90 backdrop-blur-xl border border-border-main rounded-sm shadow-2xl p-0.5">
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`p-2 transition-all hidden lg:block ${isFullscreen ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                  title={isFullscreen ? "Exit Theater Mode" : "Theater Mode"}
                > {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />} </button>
                <div className="w-px h-4 bg-white/10 mx-1 self-center hidden lg:block" />
                <button 
                  onClick={() => setIsSidebarVisible(!isSidebarVisible)}
                  className={`p-2 transition-all hidden lg:block ${isSidebarVisible ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                  title="Toggle Incident Sidebar"
                > <LayoutDashboard size={16} /> </button>
                <button 
                  onClick={() => setIsFleetVisible(!isFleetVisible)}
                  className={`p-2 transition-all hidden lg:block ${isFleetVisible ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                  title="Toggle Fleet Deployment"
                > <Truck size={16} /> </button>
                <div className="w-px h-4 bg-white/10 mx-1 self-center hidden lg:block" />
                <button 
                  onClick={() => setMapMode('streets')}
                  className={`p-2 transition-all ${mapMode === 'streets' ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                  title="Dark Streets"
                > <MapIcon size={16} /> </button>
                <button 
                  onClick={() => setMapMode('satellite')}
                  className={`p-2 transition-all ${mapMode === 'satellite' ? 'text-blue-400 bg-blue-500/10' : 'text-text-dim'}`}
                  title="Satellite"
                > <Settings size={16} /> </button>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setHeatmapEnabled(!heatmapEnabled)}
                  className={`w-10 h-10 flex flex-col items-center justify-center border transition-all rounded shadow-2xl ${heatmapEnabled ? 'bg-red-600 border-red-500 text-white shadow-red-900/40' : 'bg-bg-tertiary/90 border-border-main text-text-dim'}`}
                  title="Toggle Traffic Heatmap"
                >
                  <Activity size={16} />
                  <span className="text-[6px] font-black uppercase mt-0.5">Traffic</span>
                </button>
                <button 
                  onClick={() => setIsBottomPanelVisible(!isBottomPanelVisible)}
                  className={`w-10 h-10 flex flex-col items-center justify-center border transition-all rounded shadow-2xl hidden lg:flex ${isBottomPanelVisible ? 'bg-blue-600 border-blue-500 text-white' : 'bg-bg-tertiary/90 border-border-main text-text-dim'}`}
                  title="Toggle Intelligence Console"
                >
                  <Cpu size={16} />
                  <span className="text-[6px] font-black uppercase mt-0.5">Console</span>
                </button>
              </div>
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
                           // Keep selectedCrisisId but the card disappears because activeView !== 'map'
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
        <AnimatePresence>
          {activeView === 'intelligence' && (
            <motion.div 
               key="mobile-intelligence-panel"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="fixed inset-0 z-[1300] bg-bg-primary flex flex-col pb-20 lg:pb-0"
            >
               <div className="px-5 py-4 border-b border-border-main flex justify-between items-center bg-bg-tertiary shrink-0">
                  <div className="flex gap-6 overflow-x-auto no-scrollbar">
                    {['signals', 'timeline', 'reasoning'].map((tab) => (
                      <button 
                        key={tab}
                        onClick={() => setBottomTab(tab as any)}
                        className={`tech-label text-xs pb-2 border-b-2 transition-all whitespace-nowrap uppercase tracking-[0.2em] ${bottomTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-text-dim'}`}
                      >
                        {tab === 'reasoning' ? 'Intel Forensics' : tab}
                      </button>
                    ))}
                  </div>
                  <button 
                    className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-text-main shadow-inner active:scale-95 transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                    onClick={() => setActiveView('map')}
                  >
                    <RotateCcw size={18} className="-rotate-90" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-hidden relative bg-bg-primary">
                  {bottomTab === 'signals' && (
                    <div className="absolute inset-0 p-6 font-mono text-[11px] space-y-4 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center gap-3 mb-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                          <Activity size={18} className="text-blue-500 animate-pulse" />
                          <div>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">Signal Stream Synchronized</p>
                             <p className="text-[8px] text-text-dim uppercase tracking-[0.3em]">Latency: 14ms | Integrity: High</p>
                          </div>
                      </div>
                      {state.signals.slice().reverse().map((s) => (
                        <div 
                          key={s.id} 
                          className={`flex gap-4 items-start group bg-white/[0.02] border border-white/5 p-4 rounded-xl transition-all hover:bg-white/[0.05] ${s.metadata?.source_url ? 'cursor-pointer hover:border-blue-500/30' : ''}`}
                          onClick={() => s.metadata?.source_url && window.open(s.metadata.source_url, '_blank')}
                        >
                          <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center shadow-lg border ${
                            s.category === 'SOCIAL_MEDIA' ? 'bg-blue-500/10 text-blue-400 border-blue-500/10' : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                          }`}>
                            {s.category === 'SOCIAL_MEDIA' ? <Users size={20} /> : <Zap size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-text-main text-[13px] leading-relaxed group-hover:text-white transition-colors">{s.content}</p>
                            <div className="flex flex-wrap gap-4 mt-3 font-black uppercase text-[8px] tracking-widest text-text-muted items-center">
                               <span className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-500" /> {(s.confidence * 100).toFixed(0)}% RELIABILITY</span>
                               <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               {s.metadata?.source_url && (
                                 <a 
                                   href={s.metadata.source_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-0.5 rounded"
                                   onClick={(e) => e.stopPropagation()}
                                 >
                                   ORIGIN <ExternalLink size={10} />
                                 </a>
                               )}
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
               </div>
            </motion.div>
          )}

          {isBottomPanelVisible && activeView === 'map' && !isFullscreen && (
            <motion.div 
              key="desktop-bottom-console"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 288, opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="hidden lg:flex h-full flex-col bg-bg-secondary overflow-hidden shrink-0 border-t border-border-main shadow-[0_-10px_40px_rgba(0,0,0,0.4)]"
            >
               <div className="px-5 py-3 border-b border-border-main flex justify-between items-center bg-bg-tertiary shrink-0">
                  <div className="flex gap-5">
                    {['signals', 'timeline', 'reasoning'].map(tab => (
                      <button 
                        key={tab}
                        onClick={() => setBottomTab(tab as any)}
                        className={`tech-label text-[10px] pb-2 border-b-2 transition-all uppercase tracking-widest ${bottomTab === tab ? 'border-blue-400 text-white' : 'border-transparent text-text-dim'}`}
                      >
                        {tab === 'reasoning' ? 'Intel Forensics' : tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded text-[8px] font-mono text-text-muted">
                        <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                        SYSTEM_LINK_ACTIVE
                    </div>
                    <button 
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-dim hover:text-white transition-all"
                      onClick={() => setIsBottomPanelVisible(false)}
                      title="Minimize Console"
                    >
                      <LayoutDashboard size={14} />
                    </button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-hidden relative">
                  {bottomTab === 'signals' && (
                    <div className="absolute inset-0 p-5 font-mono text-[10px] space-y-3 overflow-y-auto custom-scrollbar">
                      {state.signals.slice().reverse().map((s) => (
                        <div key={s.id} className={`flex gap-4 items-start group border-l-2 border-transparent hover:border-blue-500/50 hover:bg-white/5 p-3 rounded-sm transition-all ${s.metadata?.source_url ? 'cursor-pointer' : ''}`}
                            onClick={() => s.metadata?.source_url && window.open(s.metadata.source_url, '_blank')}
                        >
                          <div className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center shadow-lg ${
                            s.category === 'SOCIAL_MEDIA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/10' : 'bg-amber-500/10 text-amber-400 border border-amber-500/10'
                          }`}>
                            {s.category === 'SOCIAL_MEDIA' ? <Users size={16} /> : <Zap size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-text-main text-[12px] leading-tight group-hover:text-white transition-colors">{s.content}</p>
                            <div className="flex flex-wrap gap-3 mt-2 font-black uppercase text-[7px] tracking-widest text-text-dim items-center">
                               <span>{(s.confidence * 100).toFixed(0)}% RELIABILITY</span>
                               <span className="flex items-center gap-1.5"><Clock size={10} /> {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                               {s.metadata?.source_url && (
                                 <a 
                                   href={s.metadata.source_url} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                                   onClick={(e) => e.stopPropagation()}
                                 >
                                   FEED_LINK <ExternalLink size={8} />
                                 </a>
                               )}
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
            </motion.div>
          )}
        </AnimatePresence>
        </main>

        {/* RIGHT SIDEBAR: FLEET DEPLOYMENT */}
        <AnimatePresence mode="popLayout">
          {isFleetVisible && !isFullscreen && (
            <motion.aside 
              key="fleet-deployment-sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "22%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="lg:flex border-l border-border-main flex-col bg-bg-secondary min-h-0 shrink-0 h-full overflow-hidden hidden"
            >
              <div className="px-5 py-4 border-b border-border-main flex justify-between items-center bg-bg-tertiary/50 shrink-0">
                <div>
                  <h2 className="tech-label text-[10px] text-white">Active Fleet Status</h2>
                  <p className="text-[8px] font-mono text-text-dim uppercase tracking-widest">Asset Deployment Rail</p>
                </div>
                <div className="flex flex-col items-end">
                   <div className="flex gap-1 items-center">
                      <span className="text-blue-500 text-[10px] font-black">{state.resources.filter(r => r.status === 'DEPLOYED').length} DEP</span>
                      <span className="text-[8px] text-text-dim">/</span>
                      <span className="text-green-500 text-[10px] font-black">{state.resources.filter(r => r.status === 'AVAILABLE').length} AVL</span>
                   </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <FleetDeployment 
                  resources={state.resources} 
                  onSelect={(r) => {
                    setMapPosition({ center: [r.location.lat, r.location.lng], zoom: 15 });
                  }}
                />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* VIEW: FULL GLOBAL SIGNALS (Mobile Only Page Overlay) */}
        <AnimatePresence>
          {activeView === 'signals' && (
            <motion.aside 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed inset-0 z-[1200] bg-bg-primary flex flex-col pb-20 lg:hidden"
            >
              <div className="px-6 py-6 border-b border-border-main bg-bg-secondary/80 backdrop-blur-md flex justify-between items-center shrink-0">
                <div>
                   <h2 className="tech-label text-base text-white tracking-[0.2em] font-black uppercase italic">Pulse Matrix</h2>
                   <p className="text-[9px] font-mono text-blue-400 uppercase tracking-[0.3em] mt-1">Live Telemetry Convergence</p>
                </div>
                <button 
                  onClick={() => setActiveView('map')}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-text-dim"
                >
                  <RotateCcw size={18} className="-rotate-90" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-primary/50 custom-scrollbar">
                  {state.signals.length > 0 ? state.signals.slice().reverse().map((s, i) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={s.id} 
                      className={`bg-bg-tertiary/60 border border-white/5 p-5 rounded-2xl shadow-xl ${s.metadata?.source_url ? 'active:scale-95' : ''}`}
                      onClick={() => s.metadata?.source_url && window.open(s.metadata.source_url, '_blank')}
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
                             <span className="text-[8px] font-mono text-text-dim block mt-0.5">SOURCE: {s.metadata?.username || 'EXTERNAL_FEED'}</span>
                           </div>
                         </div>
                         <span className="text-[10px] font-mono text-text-dim bg-white/5 px-2 py-1 rounded">{new Date(s.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                       </div>
                       <p className="text-[14px] text-text-main font-medium leading-relaxed mb-4">{s.content}</p>
                       <div className="pt-4 border-t border-white/5 flex flex-wrap gap-y-2 items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${s.confidence * 100}%` }}
                                  className="h-full bg-blue-500" 
                                />
                             </div>
                             <span className="text-[9px] font-black text-blue-500">{(s.confidence * 100).toFixed(0)}% CONF</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[8px] font-mono text-text-dim uppercase tracking-tighter">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {s.metadata?.source_url && (
                              <a 
                                href={s.metadata.source_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-400 font-black uppercase text-[8px] bg-blue-500/10 px-2 py-0.5 rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                ORIGIN <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
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
            </motion.aside>
          )}
        </AnimatePresence>

        {/* VIEW: STATS / INFRASTRUCTURE (Mobile Only Page Overlay) */}
        <AnimatePresence>
          {activeView === 'stats' && (
            <motion.aside 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="fixed inset-0 z-[1200] bg-bg-primary flex flex-col pb-20 lg:hidden"
            >
              <div className="px-6 py-6 border-b border-border-main bg-bg-secondary/80 backdrop-blur-md flex justify-between items-center shrink-0">
                <h2 className="tech-label text-base tracking-widest uppercase font-black italic text-white flex items-center gap-3">
                    <Activity size={18} className="text-green-400" />
                    City Stability Matrix
                </h2>
                <button 
                  onClick={() => setActiveView('map')}
                  className="w-10 h-10 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-text-dim"
                >
                  <RotateCcw size={18} className="-rotate-90" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-bg-primary/50 custom-scrollbar">
                 <StatsPanel crises={state.crises} />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
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
