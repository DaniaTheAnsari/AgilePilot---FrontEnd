// tasks: [{ optimistic, likely, pessimistic, hourlyRate }]
export function pertEstimateHours(tasks) {
  return tasks.reduce((sum, t) => {
    const e = (t.optimistic + 4 * t.likely + t.pessimistic) / 6;
    return sum + e;
  }, 0);
}

export function estimateCost(tasks, contingencyPercent = 10) {
  const hours = pertEstimateHours(tasks);
  const labor = tasks.reduce((s, t) => s + ((t.optimistic + 4*t.likely + t.pessimistic)/6) * (t.hourlyRate || 0), 0);
  const contingency = (labor * contingencyPercent) / 100;
  return { hours, labor, contingency, total: labor + contingency };
}