/**
 * Estimation Techniques Library
 * Implements: Proxy, Analogy, and Fuzzy-based estimation methods
 */

// ─── Three-Point (Proxy) Estimation ────────────────────────────────────────
export interface ProxyEstimate {
  optimistic: number;
  likely: number;
  pessimistic: number;
  pert: number; // Program Evaluation and Review Technique
  standardDeviation: number;
}

export function calculateProxyEstimate(optimistic: number, likely: number, pessimistic: number): ProxyEstimate {
  // PERT formula: (O + 4*M + P) / 6
  const pert = (optimistic + 4 * likely + pessimistic) / 6;
  
  // Standard deviation for confidence intervals
  const standardDeviation = (pessimistic - optimistic) / 6;
  
  return {
    optimistic,
    likely,
    pessimistic,
    pert,
    standardDeviation
  };
}

// ─── Analogy-Based Estimation ─────────────────────────────────────────────
export interface AnalogyEstimate {
  baseTaskName: string;
  baseTaskHours: number;
  complexity: number; // 0.5 to 2.0 multiplier
  adjustments: {
    teamExperience: number;
    similarityScore: number;
    riskFactor: number;
  };
  estimatedHours: number;
  confidence: number; // 0 to 100
}

export function calculateAnalogyEstimate(
  baseTaskName: string,
  baseTaskHours: number,
  complexity: number,
  teamExperience: number, // 0-1 (0=novice, 1=expert)
  similarityScore: number, // 0-1 (0=very different, 1=identical)
  riskFactor: number // 0-1 (0=no risk, 1=very risky)
): AnalogyEstimate {
  // Adjust base estimate by complexity
  let adjusted = baseTaskHours * complexity;
  
  // Adjust by team experience (less experience = more time needed)
  const experienceAdjustment = 1 + (1 - teamExperience) * 0.3;
  adjusted *= experienceAdjustment;
  
  // Adjust by similarity (less similar = more uncertainty)
  const similarityAdjustment = 1 + (1 - similarityScore) * 0.2;
  adjusted *= similarityAdjustment;
  
  // Add risk buffer
  const riskBuffer = adjusted * riskFactor * 0.15;
  const estimatedHours = adjusted + riskBuffer;
  
  // Confidence is based on similarity and team experience
  const confidence = (similarityScore * 0.6 + teamExperience * 0.4) * 100;
  
  return {
    baseTaskName,
    baseTaskHours,
    complexity,
    adjustments: {
      teamExperience,
      similarityScore,
      riskFactor
    },
    estimatedHours,
    confidence
  };
}

// ─── Fuzzy-Based Estimation ───────────────────────────────────────────────
export interface FuzzyMembership {
  veryLow: number;
  low: number;
  medium: number;
  high: number;
  veryHigh: number;
}

export interface FuzzyEstimate {
  taskComplexity: FuzzyMembership;
  taskSize: FuzzyMembership;
  estimatedRange: {
    min: number;
    most_likely: number;
    max: number;
  };
  confidence: number;
}

export function calculateFuzzyMembership(value: number, scale: number = 10): FuzzyMembership {
  // Triangular membership functions
  const normalized = Math.max(0, Math.min(1, value / scale));
  
  return {
    veryLow: Math.max(0, 1 - normalized * 5),
    low: Math.max(0, Math.min(1, 1 - Math.abs(normalized - 0.2) * 5)),
    medium: Math.max(0, Math.min(1, 1 - Math.abs(normalized - 0.5) * 5)),
    high: Math.max(0, Math.min(1, 1 - Math.abs(normalized - 0.8) * 5)),
    veryHigh: Math.max(0, normalized * 5 - 4)
  };
}

export function calculateFuzzyEstimate(
  complexity: number, // 0-10
  size: number, // 0-10
  baseHours: number = 8
): FuzzyEstimate {
  const complexityMembership = calculateFuzzyMembership(complexity, 10);
  const sizeMembership = calculateFuzzyMembership(size, 10);
  
  // Weighted fuzzy inference
  const weights = {
    veryLow: 0.5,
    low: 1.0,
    medium: 1.5,
    high: 2.0,
    veryHigh: 3.0
  };
  
  const complexityWeight = (
    complexityMembership.veryLow * weights.veryLow +
    complexityMembership.low * weights.low +
    complexityMembership.medium * weights.medium +
    complexityMembership.high * weights.high +
    complexityMembership.veryHigh * weights.veryHigh
  );
  
  const sizeWeight = (
    sizeMembership.veryLow * weights.veryLow +
    sizeMembership.low * weights.low +
    sizeMembership.medium * weights.medium +
    sizeMembership.high * weights.high +
    sizeMembership.veryHigh * weights.veryHigh
  );
  
  const factor = (complexityWeight + sizeWeight) / 2;
  
  return {
    taskComplexity: complexityMembership,
    taskSize: sizeMembership,
    estimatedRange: {
      min: Math.round(baseHours * factor * 0.7),
      most_likely: Math.round(baseHours * factor),
      max: Math.round(baseHours * factor * 1.4)
    },
    confidence: Math.round((complexityMembership.medium + sizeMembership.medium) * 100)
  };
}

// ─── Composite Estimation (Hybrid) ─────────────────────────────────────────
export interface CompositeEstimate {
  technique: 'proxy' | 'analogy' | 'fuzzy' | 'hybrid';
  proxy?: ProxyEstimate;
  analogy?: AnalogyEstimate;
  fuzzy?: FuzzyEstimate;
  blendedEstimate: number;
  confidence: number;
  riskAdjustedEstimate: number;
}

export function calculateCompositeEstimate(
  proxyEst: ProxyEstimate | null,
  analogyEst: AnalogyEstimate | null,
  fuzzyEst: FuzzyEstimate | null,
  riskBuffer: number = 0.15
): CompositeEstimate {
  const estimates: number[] = [];
  const confidences: number[] = [];
  
  if (proxyEst) {
    estimates.push(proxyEst.pert);
    confidences.push(0.85); // High confidence for PERT
  }
  
  if (analogyEst) {
    estimates.push(analogyEst.estimatedHours);
    confidences.push(analogyEst.confidence / 100);
  }
  
  if (fuzzyEst) {
    estimates.push(fuzzyEst.estimatedRange.most_likely);
    confidences.push(fuzzyEst.confidence / 100);
  }
  
  // Weighted average
  const totalWeight = confidences.reduce((a, b) => a + b, 0);
  const blendedEstimate = estimates.reduce((sum, est, i) => sum + est * confidences[i], 0) / totalWeight;
  const avgConfidence = (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100;
  
  // Risk-adjusted estimate
  const riskAdjustedEstimate = blendedEstimate * (1 + riskBuffer);
  
  return {
    technique: proxyEst && analogyEst && fuzzyEst ? 'hybrid' : 
               proxyEst ? 'proxy' : 
               analogyEst ? 'analogy' : 
               'fuzzy',
    proxy: proxyEst || undefined,
    analogy: analogyEst || undefined,
    fuzzy: fuzzyEst || undefined,
    blendedEstimate: Math.round(blendedEstimate * 10) / 10,
    confidence: Math.round(avgConfidence),
    riskAdjustedEstimate: Math.round(riskAdjustedEstimate * 10) / 10
  };
}

// ─── Cost Calculation ──────────────────────────────────────────────────────
export interface EstimatedBudget {
  estimatedHours: number;
  hourlyRate: number;
  laborCost: number;
  contingency: number;
  contingencyAmount: number;
  riskBuffer: number;
  riskAmount: number;
  totalBudget: number;
  breakdown: {
    baseCost: number;
    contingencyPercentage: number;
    riskPercentage: number;
  };
}

export function calculateBudget(
  estimatedHours: number,
  hourlyRate: number,
  contingencyPercentage: number = 15,
  riskPercentage: number = 10
): EstimatedBudget {
  const laborCost = estimatedHours * hourlyRate;
  const contingencyAmount = laborCost * (contingencyPercentage / 100);
  const riskAmount = (laborCost + contingencyAmount) * (riskPercentage / 100);
  const totalBudget = laborCost + contingencyAmount + riskAmount;
  
  return {
    estimatedHours: Math.round(estimatedHours * 10) / 10,
    hourlyRate,
    laborCost: Math.round(laborCost * 100) / 100,
    contingency: contingencyPercentage,
    contingencyAmount: Math.round(contingencyAmount * 100) / 100,
    riskBuffer: riskPercentage,
    riskAmount: Math.round(riskAmount * 100) / 100,
    totalBudget: Math.round(totalBudget * 100) / 100,
    breakdown: {
      baseCost: Math.round(laborCost * 100) / 100,
      contingencyPercentage,
      riskPercentage
    }
  };
}
