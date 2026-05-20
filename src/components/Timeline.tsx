import React from "react";
import { Crisis, Signal, TraceEntry } from "../../server/types";
import { motion } from "motion/react";
import { Cpu, CheckCircle2, AlertTriangle, Radio } from "lucide-react";

interface Props {
  crisis: Crisis;
  signals: Signal[];
  traces: TraceEntry[];
}

export default function Timeline({ crisis, signals, traces }: Props) {
  // Merge signals and traces into a single chronological list
  const crisisSignals = signals.filter(s => crisis.signals.includes(s.id));
  const crisisTraces = traces.filter(t => t.crisisId === crisis.id);

  const timelineItems = [
    ...crisisSignals.map(s => ({
      timestamp: s.timestamp,
      type: 'signal' as const,
      category: s.category,
      content: s.content,
      data: s
    })),
    ...crisisTraces.map(t => ({
      timestamp: t.timestamp,
      type: 'trace' as const,
      agent: t.agentName,
      status: t.status,
      content: t.message,
      data: t
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <div className="h-full flex flex-col bg-bg-surface relative overflow-hidden">
      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] z-10 bg-[length:100%_2px,3px_100%]" />
      
      <div className="px-4 py-3 border-b border-border-main bg-bg-secondary shrink-0 flex justify-between items-center z-20">
        <h2 className="tech-label">Operational Timeline</h2>
        <span className="text-[9px] font-mono text-text-dim uppercase">Incident: {crisis.id.substring(0, 8)}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 z-20">
        {timelineItems.length === 0 && (
          <div className="h-full flex items-center justify-center text-text-dim text-[10px] font-mono animate-pulse">
            [ WAITING_FOR_OPERATIONAL_DATA ]
          </div>
        )}
        {timelineItems.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="relative pl-6 border-l border-border-main/50 pb-4 last:pb-0"
          >
            {/* Timeline Dot */}
            <div className={`absolute left-[-5.5px] top-0 w-[11px] h-[11px] rounded-full border-2 border-bg-surface ${
              item.type === 'signal' ? 'bg-blue-500 shadow-[0_0_12px_#3b82f6]' : 'bg-amber-500 shadow-[0_0_12px_#f59e0b]'
            }`} />

            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                {item.type === 'signal' ? (
                  <>
                    <Radio size={10} className="text-blue-400 group-hover:animate-pulse" />
                    <span className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter opacity-80">SIG_INT::{item.category}</span>
                  </>
                ) : (
                  <>
                    <Cpu size={10} className="text-amber-400" />
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-tighter opacity-80">AGENT_EX::{item.agent?.split(' ')[0]}</span>
                  </>
                )}
              </div>
              <span className="text-[9px] font-mono text-text-dim tabular-nums opacity-60">
                {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            <div className={`p-3 border rounded-sm transition-all hover:bg-bg-tertiary/80 ${
                item.type === 'signal' ? 'bg-blue-900/10 border-blue-500/20' : 'bg-amber-900/10 border-amber-500/20'
            }`}>
              <p className="text-[11px] leading-relaxed text-text-main font-medium">
                {item.content}
              </p>
              {item.type === 'trace' && item.status === 'FAILURE' && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-500/20 w-fit">
                  <AlertTriangle size={10} />
                  CONFLICT_RESOLVED
                </div>
              )}
              {item.type === 'trace' && item.status === 'SUCCESS' && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-green-500 font-bold uppercase bg-green-500/10 px-2 py-0.5 rounded-sm border border-green-500/20 w-fit">
                  <CheckCircle2 size={10} />
                  Validation_Complete
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
