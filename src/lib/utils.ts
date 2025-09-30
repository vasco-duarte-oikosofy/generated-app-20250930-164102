import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function calculateWeightStats(weights: number[]): { mean: number | null; standardDeviation: number | null } {
  if (weights.length === 0) {
    return { mean: null, standardDeviation: null };
  }
  const mean = weights.reduce((acc, val) => acc + val, 0) / weights.length;
  if (weights.length < 2) {
    return { mean, standardDeviation: null };
  }
  const variance = weights.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (weights.length - 1);
  const standardDeviation = Math.sqrt(variance);
  return { mean, standardDeviation };
}