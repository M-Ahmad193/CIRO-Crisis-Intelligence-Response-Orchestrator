import React, { useEffect, useRef } from "react";
import { TraceEntry } from "../../server/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  traces: TraceEntry[];
}

export default function AgentTerminal({ traces }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [traces]);

  return (
    <div ref={containerRef} className="h-full flex flex-col p-4 custom-scrollbar overflow-y-auto bg-transparent">
      <div className="space-y-6 relative">
        <AnimatePresence initial={false}>
          {traces.map((trace, index) => (
            <motion.div
              key={trace.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 relative group"
            >
              <div className="flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-bold z-10 shrink-0 transition-colors ${getStatusStyles(trace.status)}`}>
                  {traces.length - index}
                </div>
                {index < traces.length - 1 && (
                  <div className="w-px h-full bg-border-main absolute top-6 bottom-[-24px] left-3" />
                )}
              </div>
              
              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-tight text-white group-hover:text-red-400 transition-colors">
                    {trace.agentName}
                  </p>
                  <span className="text-[9px] font-mono text-text-dim">
                    {new Date(trace.timestamp).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted leading-snug">
                  {trace.message}
                </p>
                
                {trace.data && (
                  <details className="mt-2 group/details">
                    <summary className="cursor-pointer text-[8px] tech-label opacity-40 group-hover/details:opacity-100 transition-opacity">
                      [LOG_DEBUG_DATA]
                    </summary>
                    <pre className="mt-2 p-2 bg-bg-surface border border-border-main/50 rounded-sm text-[9px] overflow-x-auto text-text-muted font-mono leading-tight">
                      {JSON.stringify(trace.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {traces.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-20 text-text-dim gap-4">
             <div className="w-6 h-6 border border-border-main border-t-red-600 rounded-full animate-spin" />
             <span className="tech-label opacity-50">Synchronizing with Antigravity...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusStyles(status: TraceEntry["status"]) {
  switch (status) {
    case "SUCCESS": return "bg-green-500/10 border-green-500 text-green-500";
    case "FAILURE": return "bg-red-500/10 border-red-500 text-red-500";
    case "START": return "bg-blue-500/10 border-blue-500 text-blue-500";
    case "DELEGATE": return "bg-amber-500/10 border-amber-500 text-amber-500";
    default: return "bg-bg-surface border-border-main text-text-dim";
  }
}
