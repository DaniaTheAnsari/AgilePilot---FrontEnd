import React from "react";
import { DataStore } from "../services/dataStore";
import { Link } from "react-router-dom";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

/** Reuses the demo UI from your App.tsx—keeps same look but data-driven via DataStore. */

export default function Dashboard() {
  const [projects] = React.useState(() => DataStore.getProjects());
  const [sprints] = React.useState(() => DataStore.state.sprints || []);
  const tasks = DataStore.state.tasks || [];

  const done = tasks.filter((t: any) => t.status === "done").length;
  const total = tasks.length || 1;
  const pct = Math.round((done / total) * 100);
<break></break>
  const burndown = [
    { day: "Day 1", ideal: 42, actual: 42 },
    { day: "Day 2", ideal: 38, actual: 39 },
    { day: "Day 3", ideal: 34, actual: 36 },
    { day: "Day 4", ideal: 30, actual: 31 },
    { day: "Day 5", ideal: 26, actual: 28 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Dashboard</h1>
          <p className="text-sm text-white/40">Overview of your projects & sprints</p>
        </div>
        <div>
          <Link to="/projects" className="px-3 py-2 bg-white/[0.03] rounded">View projects</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white/80">Burndown Chart</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={burndown}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area dataKey="ideal" stroke="#8B5CF6" fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white/80">Sprint Completion</h3>
          <div className="mt-4 text-center">
            <div className="text-3xl font-bold">{pct}%</div>
            <div className="text-xs text-white/40 mt-1">{done} of {total} tasks done</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/80 mb-2">Your projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {projects.map((p: any) => (
            <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-sm">{p.name}</h4>
                  <div className="text-xs text-white/40">{p.description}</div>
                </div>
                <Link to={`/projects/${p.id}`} className="text-xs text-purple-300">Open</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}