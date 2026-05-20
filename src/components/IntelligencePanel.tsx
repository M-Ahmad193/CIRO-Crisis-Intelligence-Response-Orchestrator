import React from "react";
import { Crisis, Signal } from "../../server/types";
import { motion, AnimatePresence } from "motion/react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { Brain, Cpu, Network, Zap, Info, ShieldCheck, HelpCircle, Lock, Radio, ArrowRight, TrendingUp, AlertTriangle, Activity, Target } from "lucide-react";

interface Props {
  crisis: Crisis;
  signals: Signal[];
}

export default function IntelligencePanel({ crisis, signals }: Props) {
  const [diagnosticComplete, setDiagnosticComplete] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setDiagnosticComplete(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const trendData = [
    { time: "T-10m", conf: 0.12 },
    { time: "T-8m", conf: 0.28 },
    { time: "T-5m", conf: 0.45 },
    { time: "T-3m", conf: 0.72 },
    { time: "NOW", conf: crisis.reasoning?.confidence || crisis.confidence }
  ];

  const relatedSignals = signals.filter(s => crisis.signals.includes(s.id));

  const radarData = [
    { subject: 'Impact', A: (crisis.severity === 'CRITICAL' ? 95 : 70), B: 60, fullMark: 100 },
    { subject: 'Velocity', A: 85, B: 40, fullMark: 100 },
    { subject: 'Density', A: (crisis.affectedPopulation / 1000) > 100 ? 95 : (crisis.affectedPopulation / 1000) || 45, B: 50, fullMark: 100 },
    { subject: 'Stability', A: 25, B: 75, fullMark: 100 },
    { subject: 'Confidence', A: crisis.confidence * 100, B: 80, fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col bg-bg-surface overflow-hidden relative">
      <AnimatePresence>
        {!diagnosticComplete && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-bg-primary flex flex-col items-center justify-center p-12 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-16 h-16 border-2 border-blue-500/20 border-t-blue-500 rounded-full mb-8"
            />
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.5 }}
              className="w-40 h-0.5 bg-blue-500/30 rounded-full overflow-hidden"
            >
               <motion.div 
                 animate={{ x: [-40, 160] }}
                 transition={{ repeat: Infinity, duration: 1 }}
                 className="w-10 h-full bg-blue-400"
               />
            </motion.div>
            <p className="tech-label text-[10px] text-blue-400 uppercase tracking-[0.5em] mt-6 animate-pulse">Running Tactical Forensic Diagnostic...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-16 pb-24">
        {/* Expected Output Summary - PRIORITY SECTION */}
        <section id="tactical-summary-priority">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 mb-6"
          >
             <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Brain size={18} className="text-blue-400" />
             </div>
             <div>
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none">Cognitive Convergence Core</h3>
                <p className="text-[9px] text-text-dim uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                   <span className="w-1 h-1 rounded-full bg-green-500" />
                   Neural Engine Protocol 4.8.2 Active
                </p>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", delay: 0.6 }}
            className="bg-gradient-to-br from-[#0a0c0e] to-[#141619] border-2 border-white/5 p-8 lg:p-10 rounded-[2.5rem] space-y-10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-all duration-700 pointer-events-none group-hover:scale-110">
               <ShieldCheck size={180} className="text-blue-500" />
            </div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pb-10 border-b border-white/5 relative">
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                     <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                     Situation Identity Spectrum
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight italic uppercase tracking-tighter drop-shadow-2xl">
                    {crisis.reasoning?.inference || "Urban Anomaly Detection"}
                  </h2>
                </div>
                
                <div className="flex gap-6">
                   <div className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl">
                      <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1.5">Priority</p>
                      <span className={`text-xs font-black uppercase tracking-widest ${crisis.severity === 'CRITICAL' ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-amber-500'}`}>
                         {crisis.severity} THREAT
                      </span>
                   </div>
                   <div className="px-5 py-3 bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-2xl">
                      <p className="text-[8px] text-text-muted uppercase tracking-[0.2em] mb-1.5">Vector Envelope</p>
                      <span className="text-xs font-black text-white uppercase tracking-widest">{crisis.radius}m Radius</span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col lg:items-end justify-center">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-6">Model Convergence Confidence</p>
                <div className="flex items-center gap-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                   <div className="flex gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(i => (
                        <motion.div 
                          initial={{ height: 4, opacity: 0.2 }}
                          animate={{ 
                            height: i <= (crisis.confidence * 10) ? 32 : 8,
                            opacity: i <= (crisis.confidence * 10) ? 1 : 0.2
                          }}
                          transition={{ delay: 0.8 + (i * 0.05), type: "spring", stiffness: 300 }}
                          key={`confidence-gauge-${i}`} 
                          className={`w-2.5 rounded-full ${i <= (crisis.confidence * 10) ? 'bg-gradient-to-t from-blue-600 to-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]' : 'bg-white'}`} 
                        />
                      ))}
                   </div>
                   <div className="text-right">
                      <span className="text-5xl font-black text-white tracking-tighter tabular-nums italic">{(crisis.confidence * 100).toFixed(0)}<span className="text-xl text-blue-500 font-mono">%</span></span>
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-12 relative">
              <div>
                <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                  <AlertTriangle size={16} className="animate-pulse" />
                  Tactical Impact Matrix
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(crisis.reasoning?.explanation.includes(',') ? crisis.reasoning.explanation.split(',') : ['Traffic infrastructure critical fail', 'Thermal signatures rising']).map((line, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + (i * 0.1) }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      key={`impact-line-${i}`} 
                      className="px-6 py-5 bg-red-600/5 border border-red-500/20 rounded-2xl flex items-center gap-5 hover:bg-red-600/10 hover:border-red-500/40 transition-all duration-300 cursor-default group/item"
                    >
                      <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 group-hover/item:rotate-12 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                         <Zap size={20} />
                      </div>
                      <p className="text-sm font-black text-white uppercase italic tracking-tight leading-tight">{line.trim()}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] flex items-center gap-3">
                     <TrendingUp size={16} />
                     Strategic Recommendations
                  </p>
                  <div className="space-y-4">
                    {crisis.recommendations?.map((rec, i) => (
                      <motion.div 
                        key={`recommendation-${i}`} 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2 + (i * 0.1) }}
                        className="flex items-start gap-5 group p-4 border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-all"
                      >
                        <div className="mt-1 w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all">
                           <ArrowRight size={12} className="text-blue-500 group-hover:text-inherit" />
                        </div>
                        <p className="text-[13px] text-text-dim font-bold group-hover:text-white transition-colors leading-relaxed italic">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em]">Autonomous Deployment Rails</p>
                  <div className="space-y-5 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                     {[
                       { label: "Neural Topology Update", status: "SYNCED", color: "text-blue-400" },
                       { label: "Kinetic Signal Burst", status: "ACTIVE", color: "text-amber-400 animate-pulse" },
                       { label: "Vector Guardrails", status: "LOCKING", color: "text-text-muted" }
                     ].map((item, i) => (
                       <div key={`status-item-${i}`} className="flex items-center justify-between gap-6">
                         <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${item.status === 'SYNCED' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-white/10'}`} />
                            <p className="text-[11px] text-text-dim font-black uppercase tracking-widest">{item.label}</p>
                         </div>
                         <span className={`text-[9px] font-black tracking-[0.2em] px-2 py-0.5 border border-current/20 rounded ${item.color}`}>{item.status}</span>
                       </div>
                     ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-3 flex-1">
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.4em]">Projected Urban Stabilization</p>
                  <div className="flex items-center gap-6">
                     <span className="text-3xl font-black text-green-500 font-mono italic">-34<span className="text-sm ml-1">%</span></span>
                     <div className="h-2 flex-1 bg-white/5 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "68%" }}
                          transition={{ duration: 2.5, ease: "easeOut", delay: 1.5 }}
                          className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-[0_0_20px_#22c55e]" 
                        />
                     </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-6 py-4 bg-green-500/10 border border-green-500/20 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                   <ShieldCheck size={24} className="text-green-500" />
                   <div className="leading-tight">
                      <p className="text-xs font-black text-white uppercase tracking-tight">Security Lock</p>
                      <p className="text-[8px] text-green-500/60 font-mono uppercase tracking-[0.3em]">Integrity: VERIFIED_OPS</p>
                   </div>
                </div>
            </div>
          </motion.div>
        </section>

        {/* Tactical Reasoning Terminal Overlay */}
        <section>
          <div className="bg-black/40 border border-white/5 rounded-3xl p-6 font-mono overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Cpu size={40} className="text-blue-500" />
             </div>
             <p className="text-[10px] text-blue-500/60 mb-4 animate-pulse">Neural_Reasoning_Trace &gt; Initializing...</p>
             <div className="space-y-2 text-[11px] leading-relaxed">
                <p className="text-text-dim"><span className="text-blue-400 mr-2">[0.00ms]</span> Aggregating city-wide sensor telemetry...</p>
                <p className="text-text-dim"><span className="text-blue-400 mr-2">[0.12ms]</span> Cross-referencing vector patterns with historical datasets...</p>
                <p className="text-white font-bold"><span className="text-blue-400 mr-2">[0.45ms]</span> Pattern Match: {crisis.title} identified with { (crisis.confidence * 100).toFixed(0) }% reliability.</p>
                <p className="text-text-dim"><span className="text-blue-400 mr-2">[1.02ms]</span> Optimizing emergency unit deployment routes...</p>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-green-400 font-bold"
                >
                  <span className="text-blue-400 mr-2">[1.20ms]</span> TARGET_STABILIZATION_PROTOCOL_ENGAGED
                </motion.p>
             </div>
          </div>
        </section>

        {/* Signal Credibility Audit */}
        <section>
          <div className="flex items-center gap-2 mb-3">
             <ShieldCheck size={14} className="text-blue-400" />
             <h3 className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Signal Credibility Audit</h3>
          </div>
          <div className="bg-bg-tertiary border border-border-main p-4 rounded-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
             <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-[8px] text-text-muted uppercase mb-1">Reliability Score</p>
                  <p className="text-lg font-black text-white italic">
                    {( (crisis.credibility?.score || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-text-muted uppercase mb-1">Misinformation Likelihood</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-sm ${
                    crisis.credibility?.misinformationLikelihood === 'HIGH' ? 'bg-red-500/20 text-red-500' :
                    crisis.credibility?.misinformationLikelihood === 'MEDIUM' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {crisis.credibility?.misinformationLikelihood || 'LOW'}
                  </span>
                </div>
             </div>
             
             <div className="space-y-2">
                <p className="text-[8px] text-text-muted uppercase">Logic Flags</p>
                <div className="flex flex-wrap gap-2">
                   {(crisis.credibility?.reliabilityFlags || ['SOURCE_VERIFIED', 'CROSS_REFERENCED_IOT']).map(flag => (
                     <span key={flag} className="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm text-[8px] font-mono text-blue-400 uppercase">
                        {flag}
                     </span>
                   ))}
                </div>
             </div>
          </div>
        </section>

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

        {/* Diagnostic Vector Matrix - REVAMPED INFOGRAPHIC */}
        <section>
           <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Network size={18} className="text-purple-400" />
              </div>
              <div>
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] leading-none">Diagnostic Vector Matrix</h3>
                 <p className="text-[9px] text-text-dim uppercase tracking-[0.3em] mt-1.5 font-mono">Multi-Point Evidence Correlation</p>
              </div>
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* RADAR CHART */}
              <div className="bg-bg-tertiary/40 border border-white/5 p-8 rounded-[2rem] relative overflow-hidden backdrop-blur-xl">
                 <div className="absolute top-4 left-6">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                       <Activity size={12} />
                       Threat Signature
                    </p>
                 </div>
                 <div className="h-[280px] w-full flex items-center justify-center pt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: "#ffffff40", fontSize: 10, fontWeight: 900 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Current"
                          dataKey="A"
                          stroke="#a855f7"
                          fill="#a855f7"
                          fillOpacity={0.4}
                          strokeWidth={2}
                        />
                        <Radar
                          name="Baseline"
                          dataKey="B"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.1}
                          strokeWidth={1}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5">
                    <div className="text-center">
                       <p className="text-[8px] text-text-muted uppercase mb-1">Spread</p>
                       <p className="text-sm font-black text-white">LOW</p>
                    </div>
                    <div className="text-center border-x border-white/5">
                       <p className="text-[8px] text-text-muted uppercase mb-1">Trend</p>
                       <p className="text-sm font-black text-purple-400 font-mono">ASC_04</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] text-text-muted uppercase mb-1">Priority</p>
                       <p className="text-sm font-black text-red-500 italic">MAX</p>
                    </div>
                 </div>
              </div>

              {/* NODE MESH */}
              <div className="bg-bg-tertiary/40 border border-white/5 p-8 rounded-[2rem] flex flex-col relative overflow-hidden backdrop-blur-xl">
                 <div className="absolute top-4 left-6">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                       <Target size={12} />
                       Evidence Mesh
                    </p>
                 </div>
                 
                 <div className="flex-1 flex items-center justify-center py-10 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />
                    
                    <div className="relative w-full max-w-[280px] h-[180px]">
                      <motion.div 
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] z-20 flex items-center justify-center backdrop-blur-md"
                      >
                        <div className="text-center">
                           <HelpCircle size={24} className="text-red-500 mx-auto" />
                           <p className="text-[8px] font-black text-red-500 uppercase tracking-tighter mt-1">Primary</p>
                        </div>
                      </motion.div>
                      
                      {relatedSignals.map((_, i) => {
                          const angle = (i / relatedSignals.length) * Math.PI * 2;
                          const x = Math.cos(angle) * 110;
                          const y = Math.sin(angle) * 70;
                          return (
                            <React.Fragment key={`sig-node-mesh-${i}`}>
                              <motion.div 
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1.5 + (i * 0.1) }}
                                  className="absolute w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/40 z-20 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all cursor-crosshair group/node"
                                  style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
                              >
                                  <Zap size={14} className="text-blue-400 group-hover/node:text-inherit" />
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 border border-white/10 rounded text-[7px] font-mono whitespace-nowrap opacity-0 group-hover/node:opacity-100 transition-opacity">
                                     NODE_CONF: {(Math.random() * 20 + 80).toFixed(0)}%
                                  </div>
                              </motion.div>
                              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                                  <motion.line 
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: 0.4 }}
                                    transition={{ duration: 1, delay: 2 }}
                                    x1="50%" y1="50%" 
                                    x2={`calc(50% + ${x}px)`} y2={`calc(50% + ${y}px)`} 
                                    stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4"
                                  />
                              </svg>
                            </React.Fragment>
                          )
                      })}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase text-text-muted italic tracking-widest">
                       <span>Nodes Connected</span>
                       <span className="text-white">{relatedSignals.length} Active Sensors</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* SOCIAL MEDIA SENTIMENT REFINEMENT */}
           <div className="mt-8 bg-gradient-to-r from-blue-900/10 to-purple-900/10 border border-white/5 p-8 rounded-[2rem] backdrop-blur-2xl grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Social Volatility</span>
                    <span className="text-xl font-black text-white italic">74.8<span className="text-[10px] ml-1 text-text-dim">/100</span></span>
                 </div>
                 <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "74.8%" }}
                      transition={{ duration: 2, delay: 2 }}
                      className="h-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                    />
                 </div>
                 <p className="text-[9px] text-text-dim uppercase tracking-widest italic text-center">Protocol: Sentiment_Extraction_v9</p>
              </div>

              <div className="flex flex-col justify-center border-x border-white/5 px-10">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black text-text-dim uppercase">Extraction</span>
                       <span className="text-[9px] font-mono text-green-500 font-bold">STABLE</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {["Flood", "Help", "Mall Road", "Rescue", "No Power"].map((tag, i) => (
                         <motion.span 
                           initial={{ opacity: 0, scale: 0.8 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ delay: 2.2 + (i * 0.1) }}
                           key={tag} 
                           className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-white uppercase tracking-tighter"
                         >
                           {tag}
                         </motion.span>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="flex flex-col justify-center space-y-4">
                 <div className="flex items-center gap-4">
                    <div className="flex-1 p-4 bg-red-600/10 border border-red-500/20 rounded-2xl text-center">
                       <p className="text-[8px] text-red-400 uppercase font-black mb-1">Emotion Core</p>
                       <p className="text-xs font-black text-white uppercase tracking-tighter">Extreme Panic</p>
                    </div>
                    <div className="flex-1 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-center">
                       <p className="text-[8px] text-blue-400 uppercase font-black mb-1">Growth Rate</p>
                       <p className="text-xs font-black text-white">+288% p/h</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}
