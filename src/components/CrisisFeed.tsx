import React from "react";
import { Crisis, SeverityLevel } from "../../server/types";
import { ShieldAlert, MapPin, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Props {
  crises: Crisis[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function CrisisFeed({ crises, selectedId, onSelect }: Props) {
  if (crises.length === 0) {
    return (
      <div className="p-8 text-center text-text-dim italic text-[11px] font-mono uppercase tracking-widest">
        No active telemetry signals.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {crises.map((crisis) => (
        <button
          key={crisis.id}
          onClick={() => onSelect(crisis.id)}
          className={`p-4 border-b border-border-main text-left transition-all duration-200 relative group ${
            selectedId === crisis.id 
              ? "bg-bg-surface border-l-4 border-l-red-600" 
              : "bg-bg-tertiary border-l-4 border-l-transparent hover:bg-bg-surface"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase ${
              crisis.severity === 'CRITICAL' ? 'text-red-500' : 
              crisis.severity === 'HIGH' ? 'text-amber-500' : 'text-text-muted'
            }`}>
              ID: {crisis.id.substring(0, 6)}
            </span>
            <span className="text-[10px] font-mono text-text-muted">
              {formatDistanceToNow(new Date(crisis.startTime))} ago
            </span>
          </div>

          <h3 className={`text-sm font-bold mb-1 transition-colors ${
            selectedId === crisis.id ? "text-white" : "text-text-main group-hover:text-white"
          }`}>
            {crisis.title}
          </h3>
          <p className="text-[11px] text-text-muted leading-relaxed mb-3 line-clamp-2">
            {crisis.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
             <span className="px-1.5 py-0.5 bg-border-main text-[9px] text-text-main rounded-sm uppercase font-mono tracking-tighter">
               {crisis.type.split('_')[0]}
             </span>
             <span className="px-1.5 py-0.5 bg-border-main text-[9px] text-text-main rounded-sm uppercase font-mono tracking-tighter">
               Radius: {crisis.radius}m
             </span>
             {crisis.affectedPopulation > 5000 && (
               <span className="px-1.5 py-0.5 bg-red-900/20 text-red-400 text-[9px] rounded-sm uppercase font-mono border border-red-500/10">
                 Pop: {(crisis.affectedPopulation / 1000).toFixed(1)}k
               </span>
             )}
          </div>

          {selectedId === crisis.id && (
             <div className="absolute top-0 right-0 p-1 opacity-20">
                <ShieldAlert size={12} className="text-red-500" />
             </div>
          )}
        </button>
      ))}
    </div>
  );
}
