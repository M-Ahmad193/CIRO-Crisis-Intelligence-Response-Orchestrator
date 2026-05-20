import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area
} from "recharts";
import { Crisis } from "../../server/types";
import { ShieldAlert, Activity, TrendingUp, Filter, Zap, Globe, Cpu } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  crises: Crisis[];
}

export default function StatsPanel({ crises }: Props) {
  const barData = crises.map(c => ({
    name: c.id.substring(0, 4),
    score: c.severity === "CRITICAL" ? 95 : c.severity === "HIGH" ? 70 : c.severity === "MEDIUM" ? 40 : 20,
    severity: c.severity
  }));

  const healthScore = Math.max(30, 100 - (crises.length * 15));
  const radialData = [{ name: 'City Health', value: healthScore, fill: healthScore > 70 ? '#22c55e' : healthScore > 40 ? '#f59e0b' : '#ef4444' }];

  // Incident Type Distribution
  const typeCounts = crises.reduce((acc: any, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(typeCounts).map(type => ({
    name: type.replace(/_/g, " "),
    value: typeCounts[type]
  }));

  // Trend Data with more vibrancy
  const trendData = [
    { time: '04:00', entropy: 45, load: 30 },
    { time: '05:00', entropy: 52, load: 35 },
    { time: '05:30', entropy: 48, load: 32 },
    { time: '06:00', entropy: 65, load: 50 },
    { time: '06:15', entropy: 78, load: 65 }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/90 backdrop-blur-2xl border border-white/10 p-3 text-[10px] font-mono shadow-2xl rounded-xl">
          <p className="text-white font-black uppercase tracking-widest">{`${payload[0].name || payload[0].payload.name}`}</p>
          <div className="mt-2 space-y-1">
             <p className="text-blue-400 font-bold">VALUE: {payload[0].value}%</p>
             {payload[0].payload.severity && <p className="text-red-500 uppercase">THREAT: {payload[0].payload.severity}</p>}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-12 pb-20">
      {/* CITY HEALTH GAUGE - NEW INFOGRAPHIC */}
      <section className="bg-gradient-to-br from-bg-secondary/40 to-black/40 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden backdrop-blur-xl">
         <div className="absolute top-0 right-0 p-8 opacity-5">
            <Globe size={160} className="text-blue-500" />
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative">
            <div>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                     <Activity size={18} className="text-green-500" />
                  </div>
                  <div>
                     <h2 className="tech-label text-xs text-white uppercase tracking-[0.2em] font-black">City Resilience Hub</h2>
                     <p className="text-[9px] text-text-dim uppercase tracking-[0.3em] mt-1">Live Sub-Grid Integrity</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md">
                     <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Network Load</span>
                        <span className="text-lg font-black text-white italic">{(100 - healthScore).toFixed(1)}%</span>
                     </div>
                     <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${100 - healthScore}%` }}
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                        />
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="flex-1 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-text-muted uppercase mb-1.5">Nodes Active</p>
                        <p className="text-xl font-black text-white">4,812</p>
                     </div>
                     <div className="flex-1 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                        <p className="text-[8px] text-text-muted uppercase mb-1.5">Throughput</p>
                        <p className="text-xl font-black text-blue-400">8.2gb/s</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex items-center justify-center relative">
               <div className="h-[200px] w-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="60%" 
                      outerRadius="100%" 
                      data={radialData} 
                      startAngle={180} 
                      endAngle={0}
                    >
                      <RadialBar
                        background
                        dataKey="value"
                        cornerRadius={15}
                        fill={radialData[0].fill}
                      />
                      <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center">
                  <span className="text-4xl font-black text-white italic tracking-tighter">{healthScore}%</span>
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-1">Stability</p>
               </div>
            </div>
         </div>
      </section>

      {/* SEVERITY VECTORS */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <ShieldAlert size={16} className="text-red-500" />
             <h3 className="tech-label text-xs uppercase font-black tracking-widest text-white">Threat Vector Density</h3>
          </div>
          <div className="h-64 w-full bg-bg-tertiary/40 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <defs>
                   <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#ffffff30", fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.05)" }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={32} animationDuration={2000}>
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.severity === "CRITICAL" ? "url(#barGradient)" : entry.severity === "HIGH" ? "#f59e0b" : "#3b82f6"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <TrendingUp size={16} className="text-green-500" />
             <h3 className="tech-label text-xs uppercase font-black tracking-widest text-white">Entropy Velocity Trace</h3>
          </div>
          <div className="h-64 w-full bg-bg-tertiary/40 border border-white/5 p-8 rounded-[2rem] backdrop-blur-xl">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                     <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#ffffff30", fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis hide domain={[0, 100]} tick={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="entropy" 
                    stroke="#22c55e" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#areaGradient)"
                    animationDuration={2500}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    fill="transparent"
                    strokeDasharray="5 5"
                    animationDuration={3000}
                  />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* NODE GRID STATUS - ENHANCED */}
      <section className="bg-bg-tertiary/40 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <Cpu size={18} className="text-purple-500" />
               <h3 className="tech-label text-xs uppercase font-black tracking-widest text-white">Grid Signal Matrix</h3>
            </div>
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-widest">Stable</span>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-[8px] text-text-muted uppercase font-bold tracking-widest">Active</span>
               </div>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
             {Array.from({ length: 30 }).map((_, i) => (
                <motion.div 
                   key={i} 
                   initial={{ opacity: 0, scale: 0.5 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   transition={{ delay: (i % 10) * 0.05 }}
                   className="aspect-square bg-white/[0.02] border border-white/10 rounded-xl flex items-center justify-center relative overflow-hidden group hover:border-blue-500/50 hover:bg-white/[0.05] transition-all"
                >
                   <motion.div 
                     animate={{ opacity: [0.4, 1, 0.4] }}
                     transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: i * 0.1 }}
                     className={`w-2 h-2 rounded-full ${i < 18 ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : i < 26 ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} 
                   />
                   <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 pointer-events-none">
                      <span className="text-[6px] font-black text-white uppercase font-mono">NODE_{i+1}</span>
                      <Zap size={8} className="text-blue-400 mt-1" />
                   </div>
                </motion.div>
             ))}
          </div>
      </section>
    </div>
  );
}
