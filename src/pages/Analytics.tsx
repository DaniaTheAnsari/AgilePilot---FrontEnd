import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { DataStore } from "../services/dataStore";

export default function Analytics() {
  const tasks = DataStore.state.tasks || [];
  const data = [
    { name: "Week 1", completed: tasks.filter((t: any) => t.completedWeek === 1).length },
    { name: "Week 2", completed: tasks.filter((t: any) => t.completedWeek === 2).length },
    { name: "Week 3", completed: tasks.filter((t: any) => t.completedWeek === 3).length },
    { name: "Week 4", completed: tasks.filter((t: any) => t.completedWeek === 4).length },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Analytics</h2>

      <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
        <h3 className="text-sm font-semibold mb-3">Throughput</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.03)" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}