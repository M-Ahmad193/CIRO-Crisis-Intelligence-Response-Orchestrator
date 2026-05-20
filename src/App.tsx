/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { motion } from "motion/react";
import { 
  Crisis, 
  Resource, 
  Signal, 
  TraceEntry 
} from "../server/types";
import CommandCenter from "./components/CommandCenter";

export default function App() {
  const [state, setState] = useState<{
    crises: Crisis[];
    resources: Resource[];
    signals: Signal[];
    trafficPoints?: any[];
    settings?: any;
  }>({
    crises: [],
    resources: [],
    signals: []
  });

  const [traces, setTraces] = useState<TraceEntry[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on("update", (data: any) => {
      console.log("Socket Update:", data);
      if (data.type === "STATE") {
        setState(data.state);
      } else if (data.type === "TRACE") {
        setTraces(prev => [data.payload.entry, ...prev].slice(0, 50));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-bg-primary text-text-main overflow-hidden font-sans">
      <header className="h-14 border-b border-border-main flex items-center justify-between px-6 bg-bg-tertiary shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]">C</div>
          <h1 className="tech-title tracking-tight" style={{ width: '86.8px', height: '20px', fontSize: '11px' }}>CIRO <span className="text-red-500 font-normal">/ OPS CENTER</span></h1>
          <div className="ml-6 h-4 w-px bg-border-main"></div>
          <div className="flex gap-6 ml-4">
            <div className="flex flex-col items-start gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-text-dim uppercase tracking-wider">City Stability</span>
                <span className={`text-[9px] font-bold ${state.crises.length > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                  {Math.max(0, 100 - (state.crises.length * 20))}%
                </span>
              </div>
              <div className="w-24 h-1 bg-border-main rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${Math.max(0, 100 - (state.crises.length * 20))}%` }}
                  className={`h-full ${state.crises.length > 2 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : state.crises.length > 0 ? 'bg-amber-500' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 hidden md:flex border-l border-border-main pl-4">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
              <span className="tech-label uppercase tracking-wider">AGENTS: {12 - state.crises.length}/{12} READY</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="tech-label leading-none mb-1">Global Time (UTC)</p>
            <p className="text-sm font-mono tracking-wider tabular-nums">{new Date().toISOString().split('T')[1].split('.')[0]}:00</p>
          </div>
          <button 
            onClick={() => {
              if (socketRef.current) {
                socketRef.current.emit("ingest", {
                  category: "FIELD_REPORT",
                  content: "Supervisor manual status check triggered via Ops Center.",
                  location: { lat: 31.5204, lng: 74.3587 },
                  confidence: 1.0,
                  sourceReliability: 1.0
                });
              }
            }}
            className="w-9 h-9 rounded-full border border-border-main bg-bg-surface flex items-center justify-center hover:border-blue-500 transition-colors cursor-pointer active:scale-95"
          >
            <span className="text-[10px] font-bold">AG</span>
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0 bg-bg-primary">
        <CommandCenter state={state} traces={traces} />
      </main>

      <footer className="h-8 bg-bg-tertiary border-t border-border-main flex items-center justify-between px-6 shrink-0">
        <div className="flex gap-6 text-[9px] font-mono text-text-muted uppercase tracking-widest">
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span>Coordinates:</span>
            <span className="text-amber-500">31.5204° N, 74.3587° E</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span>API Latency:</span>
            <span className="text-green-500">14ms</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span>Orchestrator:</span>
            <span className="text-blue-500 font-bold underline decoration-blue-500/30 underline-offset-2">Active</span>
          </div>
          <div className="flex items-center gap-1.5 hidden md:flex">
            <span>Event Streaming:</span>
            <span className="text-blue-400">4.2GB/s</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

