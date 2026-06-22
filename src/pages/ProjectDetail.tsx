import React from "react";
import { useParams, Link } from "react-router-dom";
import { DataStore } from "../services/dataStore";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = React.useState(() => DataStore.state.projects.find((p: any) => p.id === id));
  const [sprints, setSprints] = React.useState(() => DataStore.getSprintsForProject(id!));
  const tasks = DataStore.state.tasks.filter((t: any) => t.projectId === id);

  if (!project) return <div className="text-sm">Project not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">{project.name}</h2>
          <div className="text-xs text-white/40">{project.description}</div>
        </div>
        <Link to="/projects" className="text-sm text-purple-300">Back</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="col-span-2 bg-white/[0.03] border border-white/[0.06] p-3 rounded">
          <h3 className="text-sm font-semibold mb-2">Tasks</h3>
          <div className="space-y-2">
            {tasks.map((t: any) => (
              <div key={t.id} className="p-2 border border-white/[0.04] rounded">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-white/40">{t.estimate || "—"} · {t.status}</div>
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <div className="text-xs text-white/40">No tasks</div>}
          </div>
        </div>

        <aside className="bg-white/[0.03] border border-white/[0.06] p-3 rounded">
          <h3 className="text-sm font-semibold">Sprints</h3>
          <div className="space-y-2 mt-2">
            {sprints.map((s: any) => (
              <div key={s.id} className="p-2 border border-white/[0.04] rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-white/40">{s.start} → {s.end}</div>
                  </div>
                  <Link to={`/sprints`} className="text-xs text-purple-300">Open</Link>
                </div>
              </div>
            ))}
            {sprints.length === 0 && <div className="text-xs text-white/40">No sprints</div>}
          </div>
        </aside>
      </div>
    </div>
  );
}