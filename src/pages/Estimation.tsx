import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { 
  calculateProxyEstimate, 
  calculateAnalogyEstimate, 
  calculateFuzzyEstimate, 
  calculateCompositeEstimate,
  calculateBudget,
  type CompositeEstimate,
  type EstimatedBudget
} from "../library/estimationTechniques";
import { DataStore } from "../services/dataStore";
import { BarChart3, TrendingUp, DollarSign, AlertCircle } from "lucide-react";

type EstimationMethod = "proxy" | "analogy" | "fuzzy" | "hybrid";

interface TaskEstimate {
  name: string;
  description: string;
  method: EstimationMethod;
  // Proxy fields
  optimistic?: number;
  likely?: number;
  pessimistic?: number;
  // Analogy fields
  baseTaskName?: string;
  baseTaskHours?: number;
  complexity?: number;
  teamExperience?: number;
  similarityScore?: number;
  riskFactor?: number;
  // Fuzzy fields
  fuzzyComplexity?: number;
  fuzzySize?: number;
  // Common
  hourlyRate: number;
  contingency: number;
}

export default function Estimation() {
  const { control, register, handleSubmit, watch, setValue } = useForm<{ tasks: TaskEstimate[]; contingency: number }>({
    defaultValues: {
      tasks: [{
        name: "Sample Task",
        description: "Sample estimation task",
        method: "proxy",
        optimistic: 4,
        likely: 8,
        pessimistic: 16,
        hourlyRate: 50,
        contingency: 15
      }],
      contingency: 15
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tasks" });
  const [results, setResults] = useState<Array<{ task: TaskEstimate; estimate: CompositeEstimate; budget: EstimatedBudget }>[]>([]);
  const [activeTab, setActiveTab] = useState<EstimationMethod>("proxy");
  const watchedMethod = watch(`tasks.0.method`);

  function onSubmit(data: any) {
    const estimationResults = data.tasks.map((task: TaskEstimate) => {
      let proxyEst = null;
      let analogyEst = null;
      let fuzzyEst = null;

      // Calculate based on selected method
      if (task.method === "proxy" || task.method === "hybrid") {
        if (task.optimistic && task.likely && task.pessimistic) {
          proxyEst = calculateProxyEstimate(task.optimistic, task.likely, task.pessimistic);
        }
      }

      if (task.method === "analogy" || task.method === "hybrid") {
        if (task.baseTaskHours && task.complexity !== undefined) {
          analogyEst = calculateAnalogyEstimate(
            task.baseTaskName || "Base Task",
            task.baseTaskHours,
            task.complexity,
            task.teamExperience || 0.7,
            task.similarityScore || 0.8,
            task.riskFactor || 0.1
          );
        }
      }

      if (task.method === "fuzzy" || task.method === "hybrid") {
        if (task.fuzzyComplexity !== undefined && task.fuzzySize !== undefined) {
          fuzzyEst = calculateFuzzyEstimate(
            task.fuzzyComplexity,
            task.fuzzySize
          );
        }
      }

      const estimate = calculateCompositeEstimate(proxyEst, analogyEst, fuzzyEst);
      const budget = calculateBudget(
        estimate.blendedEstimate,
        task.hourlyRate,
        task.contingency || 15
      );

      return { task, estimate, budget };
    });

    setResults(estimationResults);
    DataStore.state.lastEstimate = { input: data, results: estimationResults };
    DataStore.save();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Project Estimation</h1>
          <p className="text-sm text-white/50 mt-1">Use multiple estimation techniques to calculate accurate project budgets</p>
        </div>
      </div>

      {/* Method Tabs */}
      <div className="flex gap-2 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06] w-fit">
        {(['proxy', 'analogy', 'fuzzy', 'hybrid'] as EstimationMethod[]).map(method => (
          <button
            key={method}
            onClick={() => setActiveTab(method)}
            className={`px-4 py-2 rounded text-sm font-medium transition ${
              activeTab === method
                ? 'bg-purple-600 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            {method === 'proxy' ? '📊 Proxy' : method === 'analogy' ? '🔗 Analogy' : method === 'fuzzy' ? '💭 Fuzzy' : '⚙️ Hybrid'}
          </button>
        ))}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          {fields.map((field, idx) => (
            <div key={field.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/50 font-medium">Task Name</label>
                  <input {...register(`tasks.${idx}.name`)} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="e.g., Frontend Dashboard" />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-medium">Method</label>
                  <select {...register(`tasks.${idx}.method`)} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm">
                    <option value="proxy">Proxy (Three-Point)</option>
                    <option value="analogy">Analogy</option>
                    <option value="fuzzy">Fuzzy Logic</option>
                    <option value="hybrid">Hybrid (All Methods)</option>
                  </select>
                </div>
              </div>

              <textarea {...register(`tasks.${idx}.description`)} className="w-full p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="Task description" rows={2} />

              {/* Proxy Estimation */}
              {(watch(`tasks.${idx}.method`) === "proxy" || watch(`tasks.${idx}.method`) === "hybrid") && (
                <div className="bg-white/[0.02] rounded-lg p-3 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <BarChart3 size={14} /> Three-Point Estimation (PERT)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-white/50">Optimistic (hours)</label>
                      <input type="number" {...register(`tasks.${idx}.optimistic`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="Best case" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Most Likely (hours)</label>
                      <input type="number" {...register(`tasks.${idx}.likely`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="Expected" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Pessimistic (hours)</label>
                      <input type="number" {...register(`tasks.${idx}.pessimistic`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="Worst case" />
                    </div>
                  </div>
                </div>
              )}

              {/* Analogy Estimation */}
              {(watch(`tasks.${idx}.method`) === "analogy" || watch(`tasks.${idx}.method`) === "hybrid") && (
                <div className="bg-white/[0.02] rounded-lg p-3 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <TrendingUp size={14} /> Analogy-Based Estimation
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50">Similar Task Name</label>
                      <input {...register(`tasks.${idx}.baseTaskName`)} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="e.g., Previous Dashboard" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Base Task Hours</label>
                      <input type="number" {...register(`tasks.${idx}.baseTaskHours`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="Actual hours spent" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-white/50">Complexity (0.5-2.0)</label>
                      <input type="number" step="0.1" {...register(`tasks.${idx}.complexity`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="1.0" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Team Experience (0-1)</label>
                      <input type="number" step="0.1" {...register(`tasks.${idx}.teamExperience`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="0.7" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Similarity (0-1)</label>
                      <input type="number" step="0.1" {...register(`tasks.${idx}.similarityScore`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="0.8" />
                    </div>
                  </div>
                </div>
              )}

              {/* Fuzzy Estimation */}
              {(watch(`tasks.${idx}.method`) === "fuzzy" || watch(`tasks.${idx}.method`) === "hybrid") && (
                <div className="bg-white/[0.02] rounded-lg p-3 space-y-3">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <AlertCircle size={14} /> Fuzzy Logic Estimation
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50">Complexity (0-10)</label>
                      <input type="number" {...register(`tasks.${idx}.fuzzyComplexity`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="5" min="0" max="10" />
                    </div>
                    <div>
                      <label className="text-xs text-white/50">Task Size (0-10)</label>
                      <input type="number" {...register(`tasks.${idx}.fuzzySize`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="5" min="0" max="10" />
                    </div>
                  </div>
                </div>
              )}

              {/* Budget Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/50 font-medium">Hourly Rate ($)</label>
                  <input type="number" {...register(`tasks.${idx}.hourlyRate`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="50" />
                </div>
                <div>
                  <label className="text-xs text-white/50 font-medium">Contingency (%)</label>
                  <input type="number" {...register(`tasks.${idx}.contingency`, { valueAsNumber: true })} className="w-full mt-1 p-2 bg-white/[0.02] border border-white/[0.04] rounded text-sm" placeholder="15" />
                </div>
              </div>

              <button type="button" onClick={() => remove(idx)} className="text-xs text-red-400 hover:text-red-300">
                Remove Task
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => append({
              name: "New Task",
              description: "",
              method: "proxy",
              hourlyRate: 50,
              contingency: 15,
              optimistic: 4,
              likely: 8,
              pessimistic: 16
            })}
            className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm hover:bg-white/[0.05] transition"
          >
            + Add Task
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition"
          >
            Calculate Estimates
          </button>
        </div>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Estimation Results</h2>
          {results.map((result, idx) => (
            <div key={idx} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">{result.task.name}</h3>
                  <p className="text-xs text-white/50 mt-1">{result.task.description}</p>
                </div>
                <span className="text-xs bg-purple-600/20 text-purple-200 px-2 py-1 rounded">{result.estimate.technique.toUpperCase()}</span>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Estimated Hours</div>
                  <div className="text-lg font-bold text-white">{result.estimate.blendedEstimate}</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-green-400">{result.estimate.confidence}%</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Labor Cost</div>
                  <div className="text-lg font-bold text-white">${result.budget.laborCost}</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-3">
                  <div className="text-xs text-white/50 mb-1">Total Budget</div>
                  <div className="text-lg font-bold text-purple-400">${result.budget.totalBudget}</div>
                </div>
              </div>

              <div className="text-xs text-white/40 space-y-1">
                <div>Risk-Adjusted Estimate: <span className="text-white/70 font-medium">{result.estimate.riskAdjustedEstimate} hours</span></div>
                <div>Contingency ({result.budget.contingency}%): <span className="text-white/70 font-medium">${result.budget.contingencyAmount}</span></div>
                <div>Risk Buffer ({result.budget.riskBuffer}%): <span className="text-white/70 font-medium">${result.budget.riskAmount}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
