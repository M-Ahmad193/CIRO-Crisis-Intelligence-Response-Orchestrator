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
  const selectedCrisis = state.crises.find(c => c.id === selectedCrisisId);

  const [activeTab, setActiveTab] = useState<'map' | 'feed'>('map');

  return (
    <div className="h-full w-full flex flex-col lg:grid lg:grid-cols-12 overflow-hidden bg-bg-primary">
      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex border-b border-border-main bg-bg-tertiary shrink-0">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`flex-1 py-3 text-[10px] tech-label border-b-2 transition-colors ${activeTab === 'feed' ? 'border-red-500 text-white' : 'border-transparent text-text-dim'}`}
        >
          FEED
        </button>
        <button 
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 text-[10px] tech-label border-b-2 transition-colors ${activeTab === 'map' ? 'border-blue-500 text-white' : 'border-transparent text-text-dim'}`}
        >
          MAP OPS
        </button>
      </div>

      {/* Sidebar: Active Incidents */}
      <aside className={`${activeTab === 'feed' ? 'flex' : 'hidden'} lg:flex lg:col-span-3 border-r border-border-main flex-col bg-bg-secondary min-h-0 shrink-0 h-full overflow-hidden`}>
        <div className="px-4 py-3 border-b border-border-main flex justify-between items-center bg-bg-tertiary shrink-0">
          <h2 className="tech-label">Active Incidents</h2>
          <span className="bg-red-900/30 text-red-500 px-2 py-0.5 rounded text-[9px] font-bold border border-red-500/20">
            {state.crises.filter(c => c.severity === "CRITICAL").length} CRITICAL
          </span>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <CrisisFeed 
            crises={state.crises} 
            selectedId={selectedCrisisId} 
            onSelect={(id) => {
              setSelectedCrisisId(id);
              if (window.innerWidth < 1024) setActiveTab('map');
            }} 
          />
        </div>
        
        {/* Simulation Controls */}
        <div className="p-4 border-t border-border-main bg-bg-tertiary shrink-0">
          <div className="flex justify-between items-center mb-3">
            <h2 className="tech-label">Orchestration Scenarios</h2>
            <button 
              onClick={() => fetch('/api/reset', { method: 'POST' })}
              className="p-1 hover:bg-bg-surface hover:text-red-500 transition-colors rounded text-text-dim"
              title="Reset Simulation"
            >
              <RotateCcw size={14} />
            </button>
            <button 
              onClick={() => fetch('/api/demo', { method: 'POST' })}
              className="px-2 py-0.5 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded text-[8px] font-bold uppercase hover:bg-blue-600/20 transition-all ml-2"
            >
              Cinematic Demo
            </button>
          </div>
          <div className="space-y-2 mb-6">
            <button 
              onClick={() => fetch('/api/scenarios/0', { method: 'POST' })}
              className="w-full text-[10px] font-mono text-left p-2 border border-border-main bg-bg-surface hover:bg-red-900/20 hover:border-red-500/30 transition-all flex justify-between items-center group"
            >
              <span className="text-text-main">RUN: SCENARIO_MALL_ROAD</span>
              <Activity size={10} className="text-text-dim group-hover:text-red-500" />
            </button>
            <button 
              onClick={() => fetch('/api/scenarios/1', { method: 'POST' })}
              className="w-full text-[10px] font-mono text-left p-2 border border-border-main bg-bg-surface hover:bg-amber-900/20 hover:border-amber-500/30 transition-all flex justify-between items-center group"
            >
              <span className="text-text-main">RUN: SCENARIO_LIBERTY</span>
              <Activity size={10} className="text-text-dim group-hover:text-amber-500" />
            </button>
          </div>
        </div>

        {/* Resource Allocation Relocated */}
        <div className="h-64 flex flex-col border-t border-border-main shrink-0">
          <div className="px-4 py-3 border-b border-border-main bg-bg-tertiary shrink-0">
            <h2 className="tech-label">Resource Allocation</h2>
          </div>
          <div className="flex-1 p-4 overflow-hidden min-h-0 bg-transparent">
            <table className="w-full text-[10px] font-mono">
              <thead>
                <tr className="text-text-dim border-b border-border-main">
                  <th className="text-left pb-2 uppercase font-bold">Unit</th>
                  <th className="text-left pb-2 uppercase font-bold">Status</th>
                  <th className="text-right pb-2 uppercase font-bold">ETA</th>
                </tr>
              </thead>
              <tbody className="text-text-main">
                {state.resources.slice(0, 6).map(r => (
                  <tr key={r.id} className="border-b border-border-main/30">
                    <td className="py-2">{r.name}</td>
                    <td className={`py-2 uppercase font-bold ${r.status === 'DEPLOYED' ? 'text-green-500' : 'text-text-dim'}`}>
                      {r.status}
                    </td>
                    <td className="py-2 text-right">
                       {r.status === 'DEPLOYED' ? '02:14' : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </aside>

      {/* Main Center Area */}
      <div className={`${activeTab === 'map' ? 'flex' : 'hidden'} lg:flex lg:col-span-9 flex-col border-r border-border-main shrink-0 h-full`}>
        <div className="flex-1 relative bg-bg-tertiary overflow-hidden border-b border-border-main">
          <div className="absolute top-4 left-4 z-[1000] flex gap-2">
            <button 
              onClick={() => setMapMode(mapMode === 'satellite' ? 'streets' : 'satellite')}
              className={`px-3 py-1.5 border text-[10px] tech-label rounded-sm shadow-xl transition-colors ${
                mapMode === 'satellite' ? "bg-bg-surface border-blue-500 text-blue-400" : "bg-bg-surface border-border-main text-text-main hover:bg-border-main"
              }`}
            >
              Sat View
            </button>
            <button 
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-sm shadow-xl transition-all ${
                heatmapEnabled ? "bg-red-600 text-white shadow-red-900/40" : "bg-bg-surface border border-border-main text-text-muted"
              }`}
            >
              Heatmap
            </button>
            <button 
              onClick={() => setMapMode(mapMode === 'topology' ? 'streets' : 'topology')}
              className={`px-3 py-1.5 border text-[10px] tech-label rounded-sm shadow-xl transition-colors ${
                mapMode === 'topology' ? "bg-bg-surface border-green-500 text-green-400" : "bg-bg-surface border-border-main text-text-main hover:bg-border-main"
              }`}
            >
              Topology
            </button>
          </div>
          <CrisisMap 
            crises={state.crises} 
            resources={state.resources} 
            selectedCrisis={selectedCrisis}
            mapMode={mapMode}
            trafficPoints={state.trafficPoints || []}
            showHeatmap={heatmapEnabled}
          />

          {/* Operational Pulse HUD */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
              {state.resources.filter(r => r.status === "DEPLOYED").length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-bg-tertiary/80 backdrop-blur-md border border-blue-500/30 p-2 rounded-sm shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-[10px] tech-label text-blue-400">Tactical Deployments</span>
                  </div>
                  <div className="text-[14px] font-mono font-bold text-white flex items-baseline gap-1">
                    {state.resources.filter(r => r.status === "DEPLOYED").length}
                    <span className="text-[8px] text-text-dim uppercase">Units Active</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-bg-tertiary/80 backdrop-blur-md border border-border-main p-2 rounded-sm space-y-1">
              <div className="flex justify-between items-center gap-4">
                <span className="text-[8px] font-mono text-text-dim uppercase">Threat Grid</span>
                <span className={`text-[8px] font-mono ${state.crises.length > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {state.crises.length > 0 ? 'CRITICAL' : 'STABLE'}
                </span>
              </div>
              <div className="flex gap-1">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i < (state.crises.length * 2) ? 'bg-red-500' : 'bg-green-500/20'}`}></div>
                ))}
              </div>
            </div>

            {/* Situation Awareness HUD */}
            <AnimatePresence>
              {selectedCrisis && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-bg-tertiary/90 backdrop-blur-md border border-amber-500/30 p-3 rounded-sm w-64 shadow-2xl pointer-events-auto"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="tech-label text-amber-500 text-[10px]">Detected Situation</h3>
                    <div className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-[8px] font-bold">
                       {(selectedCrisis.reasoning?.confidence || selectedCrisis.confidence * 100).toFixed(0)}% CONF
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-white text-[12px] font-bold leading-tight mb-1">{selectedCrisis.reasoning?.inference || selectedCrisis.title}</p>
                      <p className="text-text-dim text-[10px] leading-snug">{selectedCrisis.reasoning?.explanation || selectedCrisis.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 border-t border-border-main pt-2">
                      <div className="bg-bg-surface p-1.5 rounded-sm border border-border-main/50">
                        <p className="text-[8px] text-text-muted uppercase mb-1">Impact Radius</p>
                        <p className="text-[12px] font-mono text-white">{selectedCrisis.radius}m</p>
                      </div>
                      <div className="bg-bg-surface p-1.5 rounded-sm border border-border-main/50">
                        <p className="text-[8px] text-text-muted uppercase mb-1">Affected Pop.</p>
                        <p className="text-[12px] font-mono text-white">{selectedCrisis.affectedPopulation.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="border-t border-border-main pt-2">
                      <p className="text-[8px] text-amber-400 uppercase font-bold mb-2">Recommended Actions</p>
                      <div className="space-y-1.5">
                        {(selectedCrisis.recommendations || ["Redirect traffic", "Dispatch emergency services"]).map((rec, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[9px] text-text-main">
                            <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border-main pt-2">
                      <p className="text-[8px] text-green-400 uppercase font-bold mb-2">Real-time Execution</p>
                      <div className="space-y-1.5">
                        {(selectedCrisis.actionsTaken || ["Route updated", "Alert sent"]).map((action, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[9px] text-text-main">
                            <Zap size={8} className="text-green-500" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {selectedCrisis && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4 p-4 bg-bg-tertiary/95 backdrop-blur-xl border border-border-main rounded-sm w-80 z-[1000] shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="tech-label text-blue-400">Action Simulation & Outcomes</h4>
                  <p className="text-[9px] font-mono text-text-dim uppercase">Comparison: Nominal vs Optimized</p>
                </div>
                <div className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[9px] font-bold border border-green-500/20">
                  +{(selectedCrisis.impact.after.improvement * 100).toFixed(0)}% EFFICIENCY
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[9px] mb-1 italic">
                    <span className="text-text-muted flex items-center gap-1"><ShieldAlert size={10}/> RISK SCORE PROJECTION</span>
                    <span className="text-white font-mono">{selectedCrisis.impact.before.riskScore.toFixed(2)} → <span className="text-green-400">{selectedCrisis.impact.after.riskScore.toFixed(2)}</span></span>
                  </div>
                  <div className="h-2 w-full bg-border-main rounded-full overflow-hidden border border-border-main/20 relative">
                    <div className="absolute h-full bg-red-600/30" style={{ width: `${selectedCrisis.impact.before.riskScore * 100}%` }} />
                    <div className="absolute h-full bg-green-500 shadow-[0_0_12px_#22c55e]" style={{ width: `${selectedCrisis.impact.after.riskScore * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] mb-1 italic">
                    <span className="text-text-muted flex items-center gap-1"><Users size={10}/> PREDICTED CASUALTY REDUCTION</span>
                    <span className="text-white font-mono">{selectedCrisis.impact.before.estimatedCasualties} → <span className="text-green-400">{selectedCrisis.impact.after.estimatedCasualties}</span></span>
                  </div>
                  <div className="h-2 w-full bg-border-main rounded-full overflow-hidden border border-border-main/20 relative">
                    <div className="absolute h-full bg-red-600/30" style={{ width: `${(selectedCrisis.impact.before.estimatedCasualties / 20) * 100}%` }} />
                    <div className="absolute h-full bg-green-500 shadow-[0_0_12px_#22c55e]" style={{ width: `${(selectedCrisis.impact.after.estimatedCasualties / 20) * 100}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] mb-1 italic">
                    <span className="text-text-muted flex items-center gap-1"><TrendingUp size={10}/> TRAFFIC CONGESTION DELTA</span>
                    <span className="text-white font-mono text-[9px]">BEFORE: {(selectedCrisis.impact.before.congestionLevel * 100).toFixed(0)}% | AFTER: <span className="text-green-400">{(selectedCrisis.impact.after.congestionLevel * 100).toFixed(0)}%</span></span>
                  </div>
                  <div className="h-2 w-full bg-border-main rounded-full overflow-hidden border border-border-main/20 relative">
                    <div className="absolute h-full bg-red-600/30" style={{ width: `${selectedCrisis.impact.before.congestionLevel * 100}%` }} />
                    <div className="absolute h-full bg-green-500 shadow-[0_0_12px_#22c55e]" style={{ width: `${selectedCrisis.impact.after.congestionLevel * 100}%` }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-main/50 flex items-start gap-3">
                 <div className="bg-amber-500/10 p-2 rounded-sm border border-amber-500/20">
                    <Zap size={14} className="text-amber-500" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[10px] text-text-main font-medium leading-tight">Simulation complete: Dynamic rerouting through alternate arterials reduced central gridlock by 40%.</p>
                    <p className="text-[8px] text-text-dim mt-1 uppercase font-mono">Agent: Simulation_Agent_Core</p>
                 </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom panel: Signals / Timeline */}
        <div className="h-72 flex flex-col bg-bg-secondary">
          <div className="px-4 py-2 border-b border-border-main flex justify-between items-center bg-bg-tertiary shrink-0">
            <div className="flex gap-4">
              <button 
                onClick={() => setBottomTab('signals')}
                className={`tech-label pb-2 border-b-2 transition-all ${bottomTab === 'signals' ? 'border-brand-red text-white' : 'border-transparent text-text-dim'}`}
              >
                Global Signal Fusion
              </button>
              {selectedCrisis && (
                <>
                  <button 
                    onClick={() => setBottomTab('timeline')}
                    className={`tech-label pb-2 border-b-2 transition-all ${bottomTab === 'timeline' ? 'border-brand-blue text-white' : 'border-transparent text-text-dim'}`}
                  >
                    Incident Timeline
                  </button>
                  <button 
                    onClick={() => setBottomTab('reasoning')}
                    className={`tech-label pb-2 border-b-2 transition-all ${bottomTab === 'reasoning' ? 'border-amber-500 text-white' : 'border-transparent text-text-dim'}`}
                  >
                    AI Reasoning
                  </button>
                </>
              )}
            </div>
            {bottomTab === 'signals' && (
              <span className="text-[10px] font-mono text-green-500">VELOCITY: {state.signals.length > 0 ? "142 req/s" : "0 req/s"}</span>
            )}
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {bottomTab === 'signals' ? (
              <div className="absolute inset-0 p-4 font-mono text-[11px] space-y-2 overflow-y-auto custom-scrollbar">
                {state.signals.slice().reverse().map((s, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={s.id} 
                    className="flex gap-4 group items-start border-l-2 border-transparent hover:border-blue-500/50 hover:bg-white/5 p-2 transition-all rounded-sm"
                  >
                    <span className="text-text-dim shrink-0 text-[10px] pt-0.5">{new Date(s.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                    <div className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-bold ${
                      s.category === 'SOCIAL_MEDIA' ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20' : 
                      s.category === 'WEATHER' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' : 
                      s.category === 'TRAFFIC' ? 'bg-red-900/30 text-red-400 border border-red-500/20' :
                      'bg-purple-900/30 text-purple-400 border border-purple-500/20'
                    }`}>
                      {s.category === 'SOCIAL_MEDIA' && <Users size={10} />}
                      {s.category === 'WEATHER' && <Activity size={10} />}
                      {s.category === 'TRAFFIC' && <TrendingUp size={10} />}
                      {s.category === 'EMERGENCY_CALL' && <Radio size={10} />}
                      <span className="uppercase tracking-tighter">{s.category.split('_')[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-text-main group-hover:text-white transition-colors block leading-tight">{s.content}</span>
                      <div className="flex gap-3 mt-1 items-center">
                        <span className="text-[8px] text-text-dim uppercase tracking-widest flex items-center gap-1">
                          <Zap size={8} /> CONF: {(s.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500/50" style={{ width: `${s.confidence * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {state.signals.length === 0 && (
                  <div className="h-full flex items-center justify-center opacity-30 select-none">
                    <span className="text-text-dim italic text-[12px] uppercase tracking-[0.2em] animate-pulse">Awaiting global telemetry stream...</span>
                  </div>
                )}
              </div>
            ) : bottomTab === 'timeline' && selectedCrisis ? (
              <div className="absolute inset-0">
                <Timeline crisis={selectedCrisis} signals={state.signals} traces={traces} />
              </div>
            ) : bottomTab === 'reasoning' && selectedCrisis ? (
              <div className="absolute inset-0">
                <IntelligencePanel crisis={selectedCrisis} signals={state.signals} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

    </div>
  );
}
