import React from "react";
import { Resource } from "../../server/types";
import { motion } from "motion/react";
import { Truck, Shield, Activity, Zap, Search, MoreHorizontal, Fuel, Battery, Satellite } from "lucide-react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

interface Props {
  resources: Resource[];
  onSelect?: (resource: Resource) => void;
}

export default function FleetDeployment({ resources, onSelect }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case "AMBULANCE": return <Activity size={12} />;
      case "POLICE": return <Shield size={12} />;
      case "FIRE_TRUCK": return <Truck size={12} />;
      case "DRONE": return <Satellite size={12} />;
      default: return <Zap size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "text-green-500 bg-green-500/10 border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]";
      case "DEPLOYED": return "text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]";
      case "MAINTENANCE": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default: return "text-text-dim";
    }
  };

  const deployedCount = resources.filter(r => r.status === 'DEPLOYED').length;
  const utilizationRate = Math.round((deployedCount / resources.length) * 100);
  const radialData = [{ name: 'Utilization', value: utilizationRate, fill: '#3b82f6' }];

  const types = ["AMBULANCE", "RESCUE_TEAM", "POLICE", "FIRE_TRUCK", "DRONE", "GENERATOR"];

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* FLEET EFFICIENCY HEADER */}
      <div className="p-6 border-b border-white/5 bg-gradient-to-b from-blue-900/5 to-transparent">
         <div className="flex items-center justify-between mb-4">
            <div className="h-16 w-16 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  data={radialData} 
                  startAngle={90} 
                  endAngle={utilizationRate * 3.6 + 90}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill="#3b82f6"
                  />
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-[10px] font-black text-white italic">{utilizationRate}%</span>
              </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Fleet Link</p>
               <p className="text-[8px] font-mono text-blue-400 mt-1 uppercase tracking-tighter">Utilization Index</p>
            </div>
         </div>
         <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
               <div className="flex items-center gap-2 mb-1">
                  <Battery size={10} className="text-green-500" />
                  <span className="text-[7px] font-black text-text-muted uppercase">Avg Charge</span>
               </div>
               <p className="text-lg font-black text-white italic">92.4%</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
               <div className="flex items-center gap-2 mb-1">
                  <Satellite size={10} className="text-blue-500" />
                  <span className="text-[7px] font-black text-text-muted uppercase">Signal Lock</span>
               </div>
               <p className="text-lg font-black text-white italic">O-GRD</p>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        <div className="pb-2 border-b border-white/5 mb-2">
           <h3 className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Fuel size={10} />
              Operational Units
           </h3>
        </div>
        {resources.map((r, i) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.03 }}
            key={r.id}
            onClick={() => onSelect?.(r)}
            className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-blue-500/30 transition-all cursor-pointer relative overflow-hidden active:scale-95"
          >
            <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border-2 transition-all group-hover:scale-110 ${getStatusColor(r.status)} shadow-lg`}>
              {getIcon(r.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-black text-white uppercase truncate tracking-tight">{r.name}</span>
                <span className="text-[8px] font-mono text-text-dim decoration-blue-500/50 group-hover:underline">F_{r.id.substring(0, 4)}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-full border border-white/5">
                   <div className={`w-1 h-1 rounded-full ${r.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-blue-500'}`} />
                   <span className="text-[7px] font-black text-white uppercase italic">{r.status}</span>
                </div>
                <span className="text-[8px] font-mono text-text-muted tracking-tighter">
                  {r.location.lat.toFixed(3)}N • {r.location.lng.toFixed(3)}E
                </span>
              </div>
            </div>
            <motion.div
               whileHover={{ x: 2 }}
               className="shrink-0"
            >
               <MoreHorizontal size={16} className="text-text-muted group-hover:text-blue-500 transition-colors" />
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 border-t border-white/5 bg-bg-tertiary/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
              <div>
                 <span className="text-[9px] font-black text-white uppercase block leading-none">Telemetry Linked</span>
                 <span className="text-[7px] text-text-muted uppercase tracking-[0.2em] mt-1">Status: Operational</span>
              </div>
           </div>
           <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 transition-all rounded-xl text-[9px] font-black text-white uppercase tracking-widest shadow-lg shadow-blue-900/20">RE-DEPLOY</button>
        </div>
      </div>
    </div>
  );
}
