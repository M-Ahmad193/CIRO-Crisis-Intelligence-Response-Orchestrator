import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { Crisis } from "../../server/types";

interface Props {
  crises: Crisis[];
}

export default function StatsPanel({ crises }: Props) {
  const data = crises.map(c => ({
    name: c.type.split("_")[0],
    score: c.severity === "CRITICAL" ? 95 : c.severity === "HIGH" ? 70 : c.severity === "MEDIUM" ? 40 : 20,
    severity: c.severity
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-surface border border-border-main p-2 text-[10px] font-mono shadow-2xl">
          <p className="text-white font-bold opacity-90">{`${payload[0].payload.name}`}</p>
          <p className="text-red-500 mt-1">SEVERITY: {payload[0].payload.severity}</p>
          <p className="text-text-muted">RISK INDEX: {payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full min-h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D3139" vertical={false} />
          <XAxis 
             dataKey="name" 
             axisLine={{ stroke: '#2D3139' }} 
             tickLine={false} 
             tick={{ fill: "#8E9299", fontSize: 10, fontFamily: "monospace" }} 
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(224, 226, 230, 0.05)" }} />
          <Bar dataKey="score" radius={[1, 1, 0, 0]} barSize={32}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.severity === "CRITICAL" ? "#dc2626" : entry.severity === "HIGH" ? "#f59e0b" : "#3b82f6"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
