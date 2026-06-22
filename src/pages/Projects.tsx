import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { DataStore } from "../services/dataStore";
import { useForm } from "react-hook-form";

export default function Projects() {
  const [projects, setProjects] = React.useState(() => DataStore.getProjects());
  const { register, handleSubmit, reset } = useForm<{ name: string; description?: string }>();
  const navigate = useNavigate();

  function onSubmit(data: any) {
    const p = DataStore.createProject({ name: data.name, description: data.description || "", createdAt: Date.now() });
    setProjects(DataStore.getProjects());
    reset();
    navigate(`/projects/${p.id}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Projects</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {projects.map((p: any) => (
          <div key={p.id} className="bg-white/[0.03] border border-white/[0.06] p-3 rounded">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-white/40">{p.description}</div>
              </div>
              <Link to={`/projects/${p.id}`} className="text-purple-300 text-sm">Open</Link>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md bg-white/[0.02] border border-white/[0.04] p-3 rounded">
        <div className="grid gap-2">
          <input {...register("name")} placeholder="Project name" className="p-2 bg-white/[0.02] border rounded" />
          <input {...register("description")} placeholder="Short description" className="p-2 bg-white/[0.02] border rounded" />
          <button className="px-3 py-1 bg-purple-600 rounded text-white">Create project</button>
        </div>
      </form>
    </div>
  );
}