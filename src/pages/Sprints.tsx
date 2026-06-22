import React from "react";
import { DataStore } from "../services/dataStore";
import { useForm } from "react-hook-form";

/**
 * Simple sprint editor that creates sprints and auto-generates a Gantt-like schedule
 * by distributing tasks sequentially across sprint days.
 */

type Form = { name: string; projectId: string; start: string; days: number };

export default function Sprints() {
  const { register, handleSubmit } = useForm<Form>();
  const [sprints, setSprints] = React.useState(() => DataStore.state.sprints || []);
  const projects = DataStore.getProjects();

  function onSubmit(data: Form) {
    const s: any = { id: "s_" + Date.now(), name: data.name, projectId: data.projectId, start: data.start, days: Number(data.days) };
    DataStore.createSprint(s);

    // Gantt generator: take tasks for the project and schedule sequentially
    const tasks = DataStore.state.tasks.filter((t: any) => t.projectId === data.projectId);
    let cur = new Date(data.start);
    for (const t of tasks) {
      const hours = t.estimateHours || 8;
      const days = Math.max(1, Math.ceil(hours / 8));
      const startDate = new Date(cur);
      const endDate = new Date(cur);
      endDate.setDate(endDate.getDate() + days - 1);
      t.start = startDate.toISOString().slice(0, 10);
      t.end = endDate.toISOString().slice(0, 10);
      cur.setDate(cur.getDate() + days);
    }
    DataStore.save();
    setSprints(DataStore.state.sprints);
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Sprints</h2>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded">
          <h3 className="font-semibold text-sm mb-2">Create sprint</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <input {...register("name")} placeholder="Sprint name" className="w-full p-2 bg-white/[0.02] border rounded" />
            <select {...register("projectId")} className="w-full p-2 bg-white/[0.02] border rounded">
              {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input type="date" {...register("start")} className="w-full p-2 bg-white/[0.02] border rounded" />
            <input type="number" {...register("days")} placeholder="Duration (days)" className="w-full p-2 bg-white/[0.02] border rounded" />
            <button className="px-3 py-1 bg-purple-600 rounded text-white">Create</button>
          </form>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded">
          <h3 className="font-semibold text-sm mb-2">Existing sprints</h3>
          <div className="space-y-2">
            {sprints.map((s: any) => (
              <div key={s.id} className="p-2 border border-white/[0.04] rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-white/40">{s.start} · {s.days} days</div>
                  </div>
                </div>
              </div>
            ))}
            {sprints.length === 0 && <div className="text-xs text-white/40">No sprints yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}