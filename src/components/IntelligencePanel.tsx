import React from "react";
import { Crisis, Signal } from "../../server/types";
import { motion } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Brain, Cpu, Network, Zap, Info, ShieldCheck, HelpCircle } from "lucide-react";

interface Props {
  crisis: Crisis;
  signals: Signal[];
}

export default function IntelligencePanel({ crisis, signals }: Props) {
  // Mock confidence trend data based on crisis start
  const trendData = [
    { time: "T-10m", conf: 0.12 },
    { time: "T-8m", conf: 0.28 },
    { time: "T-5m", conf: 0.45 },
    { time: "T-3m", conf: 0.72 },
    { time: "NOW", conf: crisis.reasoning?.confidence || crisis.confidence }
  ];

  const relatedSignals = signals.filter(s => crisis.signals.includes(s.id));

  return (
    <div className="h-full flex flex-col bg-bg-surface overflow-hidden relative">
      <div className="px-4 py-3 border-b border-border-main bg-bg-secondary flex justify-between items-center shrink-0">
        <h2 className="tech-label flex items-center gap-2">
            <Brain size={14} className="text-blue-400" />
            AI Reasoning Transparency
        </h2>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-blue-500/10 border border-blue-500/20">
              <span className="text-[10px] font-bold text-blue-400 uppercase">AGENCY_ENABLED</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Why this decision? */}
        <section>
          <div className="flex items-center gap-2 mb-3">
             <Info size={14} className="text-amber-400" />
             <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Decision Forensics</h3>
          </div>
          <div className="bg-bg-tertiary border border-border-main p-4 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
             <p className="text-[12px] text-white font-medium leading-relaxed mb-2">
               "{crisis.reasoning?.inference || "Analyzing multi-point urban anomaly"}"
             </p>
             <p className="text-[11px] text-text-dim leading-relaxed">
               {crisis.reasoning?.explanation || "System identified clusters of contradictory signals. Cross-referencing weather patterns with social sentiment confirmed high probability flooding."}
             </p>
             <div className="mt-4 flex items-center gap-4">
               <div>
                  <p className="text-[8px] text-text-muted uppercase mb-1">Agent Logic</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-sm border border-white/10 text-[9px] font-mono text-white">
                    <Cpu size={10} className="text-blue-400" />
                    Neural_Heuristics_v4.2
                  </div>
               </div>
               <div>
                  <p className="text-[8px] text-text-muted uppercase mb-1">Audit Status</p>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/5 rounded-sm border border-green-500/10 text-[9px] font-mono text-green-500">
                    <ShieldCheck size={10} />
                    VERIFIED_TACTICAL
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Confidence Heatmap/Trend */}
        <section>
           <div className="flex items-center gap-2 mb-3">
             <Zap size={14} className="text-blue-400" />
             <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Confidence Propagation Trend</h3>
          </div>
          <div className="h-40 w-full bg-bg-tertiary border border-border-main p-2 rounded-sm">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={trendData}>
                 <defs>
                   <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                 <XAxis 
                    dataKey="time" 
                    stroke="#666" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false} 
                 />
                 <YAxis 
                    stroke="#666" 
                    fontSize={8} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 1]}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                 />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', fontSize: '10px' }}
                    itemStyle={{ color: '#3b82f6' }}
                 />
                 <Area 
                    type="monotone" 
                    dataKey="conf" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorConf)" 
                    strokeWidth={2}
                 />
               </AreaChart>
             </ResponsiveContainer>
          </div>
        </section>

        {/* Signal Relationship Graph */}
        <section>
           <div className="flex items-center gap-2 mb-3">
             <Network size={14} className="text-purple-400" />
             <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Signal Linkage Graph</h3>
          </div>
          <div className="space-y-3">
             <div className="flex items-center justify-center py-6 bg-bg-tertiary border border-border-main rounded-sm relative overflow-hidden">
                <div className="relative w-full max-w-[200px] h-[100px]">
                   {/* Root node */}
                   <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-red-500/20 border border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)] z-20 flex items-center justify-center">
                     <HelpCircle size={16} className="text-red-500" />
                   </div>
                   
                   {/* Signal nodes */}
                   {relatedSignals.map((_, i) => {
                      const angle = (i / relatedSignals.length) * Math.PI * 2;
                      const x = Math.cos(angle) * 70;
                      const y = Math.sin(angle) * 35;
                      return (
                        <React.Fragment key={i}>
                           <div 
                              className="absolute w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 z-20 flex items-center justify-center"
                              style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                           >
                              <Zap size={10} className="text-blue-400" />
                           </div>
                           <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                              <line 
                                x1="50%" y1="50%" 
                                x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                                stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 2" className="opacity-30"
                              />
                           </svg>
                        </React.Fragment>
                      )
                   })}
                </div>
               <div className="absolute top-2 right-2 flex flex-col gap-1.5 bg-bg-surface p-2 border border-border-main/50 rounded-sm">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                      <span className="text-[8px] text-text-muted uppercase font-bold">Root Anomaly</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                      <span className="text-[8px] text-text-muted uppercase font-bold">Evidence Node</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <div className="w-4 h-0.5 bg-blue-500 opacity-30 border-t border-dashed" />
                      <span className="text-[8px] text-text-muted uppercase font-bold">Causal Link</span>
                   </div>
                </div>
             </div>
             
             {/* Signal Detail List */}
             <div className="space-y-2">
                {relatedSignals.map((s) => (
                  <div key={s.id} className="flex items-center gap-3 p-2 bg-bg-tertiary border border-border-main/50 rounded-sm">
                    <div className="w-6 h-6 shrink-0 bg-blue-900/30 rounded-sm flex items-center justify-center border border-blue-500/20">
                       <Zap size={10} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white truncate">{s.content}</p>
                      <p className="text-[8px] text-text-dim uppercase tracking-tighter">Correlation Weight: {(s.confidence * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

      </div>
    </div>
  );
}
