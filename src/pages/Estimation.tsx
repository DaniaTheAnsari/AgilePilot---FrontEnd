import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { estimateCost } from "../library/estimator";
import { DataStore } from "../services/dataStore";

type TaskRow = { name: string; optimistic: number; likely: number; pessimistic: number; hourlyRate?: number };

export default function Estimation() {
  const { control, register, handleSubmit } = useForm<{ tasks: TaskRow[]; contingency: number }>({
    defaultValues: { tasks: [{ name: "Task A", optimistic: 2, likely: 4, pessimistic: 8, hourlyRate: 20 }], contingency: 10 }
  });
  const { fields, append, remove } = useFieldArray({ control, name: "tasks" });
  const [result, setResult] = React.useState<any>(null);

  function onSubmit(data: any) {
    const res = estimateCost(data.tasks, Number(data.contingency));
    setResult(res);
    // Optionally persist under current project
    DataStore.state.lastEstimate = { input: data, result: res };
    DataStore.save();
  }

  return (
    <div className="max-w-3xl bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-bold">Project Estimation</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
              <input {...register(`tasks.${i}.name`)} className="col-span-4 p-2 bg-white/[0.02] border border-white/[0.04] rounded" />
              <input type="number" {...register(`tasks.${i}.optimistic`)} className="col-span-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded" />
              <input type="number" {...register(`tasks.${i}.likely`)} className="col-span-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded" />
              <input type="number" {...register(`tasks.${i}.pessimistic`)} className="col-span-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded" />
              <input type="number" {...register(`tasks.${i}.hourlyRate`)} className="col-span-2 p-2 bg-white/[0.02] border border-white/[0.04] rounded" />
              <button type="button" onClick={() => remove(i)} className="text-xs text-red-400 ml-2">Remove</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="button" onClick={() => append({ name: "New task", optimistic: 1, likely: 2, pessimistic: 4, hourlyRate: 20 })} className="px-3 py-1 bg-white/[0.03] rounded">+ Task</button>
          <div className="ml-auto">
            <label className="text-xs text-white/40 mr-2">Contingency %</label>
            <input type="number" {...register("contingency")} className="w-20 p-1 bg-white/[0.02] border border-white/[0.04] rounded text-sm" />
          </div>
          <button className="px-4 py-1 bg-purple-600 rounded text-white">Estimate</button>
        </div>
      </form>

      {result && (
        <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded">
          <div className="text-sm">Estimated hours: <strong>{Math.round(result.hours)}</strong></div>
          <div className="text-sm">Labor cost: <strong>${result.labor.toFixed(2)}</strong></div>
          <div className="text-sm">Contingency: <strong>${result.contingency.toFixed(2)}</strong></div>
          <div className="text-sm">Total: <strong>${result.total.toFixed(2)}</strong></div>
        </div>
      )}
    </div>
  );
}