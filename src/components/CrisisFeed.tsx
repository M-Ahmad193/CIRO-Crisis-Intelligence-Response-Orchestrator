import React from "react";
import { Crisis } from "../../server/types";
import { ShieldAlert, MapPin, Users, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "motion/react";

interface Props {
  crises: Crisis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CrisisFeed({ crises, selectedId, onSelect }: Props) {
  if (crises.length === 0) {
    return (
      <div className="h-40 flex flex-col items-center justify-center text-center p-8 select-none">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 opacity-20">
           <ShieldAlert size={24} />
        </div>
        <p className="tech-label text-xs uppercase tracking-[0.4em] text-text-dim">No Active Vectors</p>
        <p className="text-[8px] font-mono text-text-muted mt-2 uppercase tracking-widest">Awaiting Urban Telemetry Convergence</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {crises.map((crisis, i) => (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          key={crisis.id}
          onClick={() => onSelect(crisis.id)}
          className={`group relative p-4 lg:p-6 text-left transition-all duration-300 ${
            selectedId === crisis.id 
              ? "bg-gradient-to-r from-red-600/10 to-transparent border-y border-white/5" 
              : "hover:bg-white/[0.03] border-y border-transparent"
          }`}
        >
          {/* Vertical indicator */}
          <div className={`absolute inset-y-0 left-0 w-1 transition-all duration-500 rounded-r-full ${
            selectedId === crisis.id ? "bg-red-500 scale-y-100 shadow-[0_0_15px_#ef4444]" : "bg-transparent scale-y-0"
          }`} />

          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                 selectedId === crisis.id ? 'bg-red-600 border-red-500 text-white scale-110 rotate-3' : 'bg-bg-tertiary border-white/10 text-text-dim group-hover:border-red-500/30'
               }`}>
                  <ShieldAlert size={selectedId === crisis.id ? 20 : 18} />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-0.5">
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${
                        crisis.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                     }`}>
                        {crisis.severity}
                     </span>
                     <div className="w-1 h-1 rounded-full bg-white/20" />
                     <span className="text-[8px] font-mono text-text-muted uppercase tracking-tighter">
                        VEC_{crisis.id.substring(0, 4)}
                     </span>
                  </div>
                  <h3 className="text-sm lg:text-base font-black text-white italic uppercase tracking-tight group-hover:text-red-400 transition-colors leading-none">
                    {crisis.title}
                  </h3>
               </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-mono text-text-dim block mb-1">
                 {formatDistanceToNow(new Date(crisis.startTime))}
              </span>
              <div className={`w-12 h-1 rounded-full overflow-hidden ${selectedId === crisis.id ? 'bg-red-900/30' : 'bg-white/5'}`}>
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.random() * 60 + 40}%` }}
                   className={`h-full ${crisis.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'}`} 
                 />
              </div>
            </div>
          </div>

          <p className="text-[11px] lg:text-xs text-text-dim leading-relaxed mb-4 line-clamp-2 max-w-[95%] group-hover:text-text-main transition-colors font-medium">
            {crisis.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
               <div className="px-2 py-1 bg-white/[0.03] border border-white/10 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                  <MapPin size={10} className="text-text-muted" />
                  <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">{crisis.radius}m</span>
               </div>
               {crisis.affectedPopulation > 0 && (
                 <div className="px-2 py-1 bg-white/[0.03] border border-white/10 rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                    <Users size={10} className="text-text-muted" />
                    <span className="text-[8px] font-bold text-text-dim uppercase tracking-widest">{(crisis.affectedPopulation / 1000).toFixed(1)}k PK</span>
                 </div>
               )}
               <div className="px-2 py-1 bg-red-500/5 border border-red-500/10 rounded-lg flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Live</span>
               </div>
               {crisis.credibility && (
                 <div className={`px-2 py-1 rounded-lg flex items-center gap-1.5 border ${
                   crisis.credibility.score > 0.8 ? 'bg-green-500/5 border-green-500/20 text-green-500' :
                   crisis.credibility.score < 0.4 ? 'bg-red-500/5 border-red-500/20 text-red-500 animate-pulse' :
                   'bg-amber-500/5 border-amber-500/20 text-amber-500'
                 }`}>
                    <span className="text-[8px] font-black uppercase tracking-widest leading-none">
                      {(crisis.credibility.score * 100).toFixed(0)}% Trust
                    </span>
                 </div>
               )}
            </div>
            
            <motion.div 
              whileHover={{ x: 5 }}
              className="flex items-center gap-2 opacity-0 lg:opacity-10 lg:group-hover:opacity-100 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
            >
               <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Dispatch</span>
               <ArrowRight size={12} className="text-blue-500" />
            </motion.div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
