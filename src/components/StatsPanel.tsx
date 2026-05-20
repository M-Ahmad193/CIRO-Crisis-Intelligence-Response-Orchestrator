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
  Line
} from "recharts";
import { Crisis } from "../../server/types";
import { ShieldAlert, Activity, TrendingUp, Filter } from "lucide-react";

interface Props {
  crises: Crisis[];
}

export default function StatsPanel({ crises }: Props) {
  const barData = crises.map(c => ({
    name: c.type.split("_")[0],
    score: c.severity === "CRITICAL" ? 95 : c.severity === "HIGH" ? 70 : c.severity === "MEDIUM" ? 40 : 20,
    severity: c.severity
  }));

  // Incident Type Distribution
  const typeCounts = crises.reduce((acc: any, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(typeCounts).map(type => ({
    name: type.replace(/_/g, " "),
    value: typeCounts[type]
  }));

  // Mock Entropy Trend
  const trendData = [
    { time: '04:00', entropy: 45 },
    { time: '05:00', entropy: 52 },
    { time: '05:30', entropy: 48 },
    { time: '06:00', entropy: 65 },
    { time: '06:15', entropy: 78 }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-surface border border-border-main p-2 text-[10px] font-mono shadow-2xl">
          <p className="text-white font-bold opacity-90">{`${payload[0].name || payload[0].payload.name}`}</p>
          {payload[0].payload.severity && <p className="text-red-500 mt-1 uppercase">SEVERITY: {payload[0].payload.severity}</p>}
          <p className="text-text-muted">VALUE: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Risk Profile - Bar Chart */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={14} className="text-red-500" />
          <h3 className="tech-label text-[10px] uppercase font-black tracking-widest text-text-dim">Severity Vectors</h3>
        </div>
        <div className="h-48 w-full bg-bg-tertiary/30 border border-border-main/50 p-4 rounded-xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "#8E9299", fontSize: 9, fontFamily: "monospace" }} 
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(224, 226, 230, 0.05)" }} />
              <Bar dataKey="score" radius={[2, 2, 0, 0]} barSize={24}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.severity === "CRITICAL" ? "#ef4444" : entry.severity === "HIGH" ? "#f59e0b" : "#3b82f6"} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Incident Mix - Pie Chart */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Filter size={14} className="text-blue-400" />
            <h3 className="tech-label text-[10px] uppercase font-black tracking-widest text-text-dim">Vector Distribution</h3>
          </div>
          <div className="h-48 w-full bg-bg-tertiary/30 border border-border-main/50 p-4 rounded-xl relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={[ '#3b82f6', '#8b5cf6', '#ec4899', '#f97316' ][index % 4]} stroke="rgba(0,0,0,0)" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <span className="text-lg font-black text-white block leading-none">{crises.length}</span>
                <span className="text-[7px] text-text-dim uppercase font-mono tracking-tighter">Nodes</span>
            </div>
          </div>
        </section>

        {/* Risk Entropy - Line Chart */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-green-400" />
            <h3 className="tech-label text-[10px] uppercase font-black tracking-widest text-text-dim">Entropy Velocity</h3>
          </div>
          <div className="h-48 w-full bg-bg-tertiary/30 border border-border-main/50 p-4 rounded-xl">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#8E9299", fontSize: 9, fontFamily: "monospace" }} 
                  />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="entropy" 
                    stroke="#22c55e" 
                    strokeWidth={2} 
                    dot={{ fill: '#22c55e', r: 3 }}
                    activeDot={{ r: 5, fill: '#fff' }}
                  />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Infrastructure Node Pulse Grid */}
      <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-purple-400" />
            <h3 className="tech-label text-[10px] uppercase font-black tracking-widest text-text-dim">Grid Node Status</h3>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
             {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square bg-bg-tertiary border border-border-main/50 rounded flex items-center justify-center relative overflow-hidden group">
                   <div className={`w-2 h-2 rounded-full ${i < 8 ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : i < 10 ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                   <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <span className="text-[6px] font-black text-white uppercase">node_{i+1}</span>
                   </div>
                </div>
             ))}
          </div>
      </section>
    </div>
  );
}
