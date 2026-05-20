import React from "react";
import { Resource } from "../../server/types";
import { motion } from "motion/react";
import { Truck, Shield, Activity, Zap, Search, MoreHorizontal } from "lucide-react";

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
      case "DRONE": return <Search size={12} />;
      default: return <Zap size={12} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE": return "text-green-500 bg-green-500/10 border-green-500/20";
      case "DEPLOYED": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "MAINTENANCE": return "text-text-muted bg-white/5 border-white/10";
      default: return "text-text-dim";
    }
  };

  const types = ["AMBULANCE", "RESCUE_TEAM", "POLICE", "FIRE_TRUCK", "DRONE", "GENERATOR"];

  return (
    <div className="flex flex-col h-full bg-bg-secondary">
      {/* Types Overview */}
      <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/5">
        {types.slice(0, 3).map(type => (
          <div key={type} className="bg-bg-tertiary/50 border border-white/5 p-2 rounded flex flex-col items-center">
            <span className="text-[8px] text-text-dim font-black uppercase mb-1">{type.split('_')[0]}</span>
            <span className="text-sm font-mono font-black text-white">
              {resources.filter(r => r.type === type).length}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {resources.map((r, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={r.id}
            onClick={() => onSelect?.(r)}
            className="group flex items-center gap-3 p-3 bg-bg-tertiary/40 border border-white/5 rounded-lg hover:border-blue-500/30 transition-all cursor-pointer"
          >
            <div className={`w-8 h-8 rounded shrink-0 flex items-center justify-center border ${getStatusColor(r.status)} shadow-lg`}>
              {getIcon(r.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[10px] font-black text-white uppercase truncate">{r.name}</span>
                <span className="text-[8px] font-mono text-text-dim">#{r.id.substring(0, 4)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full border ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
                <span className="text-[8px] font-mono text-text-muted truncate">
                  {r.location.lat.toFixed(4)}, {r.location.lng.toFixed(4)}
                </span>
              </div>
            </div>
            <MoreHorizontal size={14} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 bg-bg-tertiary/30">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-text-muted uppercase">Fleet Sync Active</span>
           </div>
           <button className="text-[9px] font-black text-blue-500 hover:underline">RE-DEPLOY ALL</button>
        </div>
      </div>
    </div>
  );
}
