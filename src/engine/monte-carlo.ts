/**
 * Monte Carlo simulation with correlated variables via Cholesky decomposition.
 * Pure TypeScript — no framework dependencies.
 */

import type {
  CalculatorParams,
  FixedConstants,
  MonteCarloResult,
  MonteCarloYearStats,
} from './types';
import { runSimulationWithVariableRates, type VariableYearRates } from './simulation';

// === Correlation & Volatility Constants ===

// Correlation matrix for [homeReturn, stockReturn, rentGrowth]
const CORRELATION_MATRIX = [
  [1.0, 0.15, 0.70],
  [0.15, 1.0, 0.10],
  [0.70, 0.10, 1.0],
];

// Annual standard deviations
const VOLATILITY = {
  homeReturn: 0.12,
  stockReturn: 0.16,
  rentGrowth: 0.08,
};

// Clamp bounds (single-year)
const CLAMP_BOUNDS = {
  homeReturn: { min: -0.40, max: 0.50 },
  stockReturn: { min: -0.50, max: 0.60 },
  rentGrowth: { min: -0.10, max: 0.20 },
};

// === Box-Muller Transform ===

/**
 * Generate two independent standard normal random variables using Box-Muller.
 */
function boxMullerTransform(): [number, number] {
  let u1: number;
  let u2: number;

  // Avoid log(0)
  do {
    u1 = Math.random();
  } while (u1 === 0);
  u2 = Math.random();

  const mag = Math.sqrt(-2.0 * Math.log(u1));
  const z0 = mag * Math.cos(2.0 * Math.PI * u2);
  const z1 = mag * Math.sin(2.0 * Math.PI * u2);

  return [z0, z1];
}

/**
 * Generate n independent standard normal random variables.
 */
function generateStandardNormals(n: number): number[] {
  const normals: number[] = [];
  while (normals.length < n) {
    const [z0, z1] = boxMullerTransform();
    normals.push(z0);
    if (normals.length < n) {
      normals.push(z1);
    }
  }
  return normals;
}

// === Cholesky Decomposition ===

/**
 * Compute the lower-triangular Cholesky decomposition of a symmetric positive-definite matrix.
 * Input: n x n matrix as 2D array. Output: n x n lower-triangular matrix L such that A = L * L^T.
 */
function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        L[i][j] = Math.sqrt(matrix[i][i] - sum);
      } else {
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

// Pre-compute the Cholesky factor for the correlation matrix
const CHOLESKY_L = choleskyDecomposition(CORRELATION_MATRIX);

/**
 * Generate 3 correlated standard normal variables using the pre-computed Cholesky factor.
 */
function generateCorrelatedNormals(): [number, number, number] {
  const z = generateStandardNormals(3);
  const correlated: number[] = [0, 0, 0];

  for (let i = 0; i < 3; i++) {
    let val = 0;
    for (let j = 0; j <= i; j++) {
      val += CHOLESKY_L[i][j] * z[j];
    }
    correlated[i] = val;
  }

  return correlated as [number, number, number];
}

// === Helpers ===

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  const fraction = index - lower;
  return sorted[lower] * (1 - fraction) + sorted[upper] * fraction;
}

function median(sorted: number[]): number {
  return percentile(sorted, 50);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
  }
  return sum / values.length;
}

function stdDev(values: number[], meanVal: number): number {
  if (values.length < 2) return 0;
  let sumSqDiff = 0;
  for (let i = 0; i < values.length; i++) {
    const diff = values[i] - meanVal;
    sumSqDiff += diff * diff;
  }
  return Math.sqrt(sumSqDiff / (values.length - 1));
}

// === Monte Carlo Simulation ===

/**
 * Generate per-year variable rates for a single simulation run.
 */
function generateVariableRates(
  params: CalculatorParams,
  numYears: number
): VariableYearRates {
  const homeAppreciation: number[] = [];
  const spReturn: number[] = [];
  const rentGrowth: number[] = [];

  for (let y = 0; y < numYears; y++) {
    const [zHome, zStock, zRent] = generateCorrelatedNormals();

    const rawHome = params.homeAppreciation + VOLATILITY.homeReturn * zHome;
    const rawStock = params.spReturn + VOLATILITY.stockReturn * zStock;
    const rawRent = params.rentGrowthRate + VOLATILITY.rentGrowth * zRent;

    homeAppreciation.push(
      clamp(rawHome, CLAMP_BOUNDS.homeReturn.min, CLAMP_BOUNDS.homeReturn.max)
    );
    spReturn.push(
      clamp(rawStock, CLAMP_BOUNDS.stockReturn.min, CLAMP_BOUNDS.stockReturn.max)
    );
    rentGrowth.push(
      clamp(rawRent, CLAMP_BOUNDS.rentGrowth.min, CLAMP_BOUNDS.rentGrowth.max)
    );
  }

  return { homeAppreciation, spReturn, rentGrowth };
}

/**
 * Run the full Monte Carlo simulation.
 *
 * @param params - Calculator parameters
 * @param constants - Fixed constants
 * @param numSimulations - Number of simulation runs (default 1000)
 * @param onProgress - Optional callback for progress reporting
 */
export function runMonteCarlo(
  params: CalculatorParams,
  constants: FixedConstants,
  numSimulations: number = 1000,
  onProgress?: (completed: number, total: number) => void
): MonteCarloResult {
  const numYears = constants.loanTermYears; // 30

  // Store advantages: simulationAdvantages[simIndex][yearIndex]
  const simulationAdvantages: number[][] = [];

  for (let sim = 0; sim < numSimulations; sim++) {
    // Generate correlated variable rates for this simulation
    const variableRates = generateVariableRates(params, numYears);

    // Run the simulation with variable rates
    const result = runSimulationWithVariableRates(params, constants, variableRates);

    // Extract advantage at each year-end
    const yearlyAdvantages: number[] = [];
    for (let y = 0; y < numYears; y++) {
      if (y < result.yearly.length) {
        yearlyAdvantages.push(result.yearly[y].advantage);
      } else {
        // Pad with last known value if simulation is shorter
        yearlyAdvantages.push(
          yearlyAdvantages.length > 0
            ? yearlyAdvantages[yearlyAdvantages.length - 1]
            : 0
        );
      }
    }

    simulationAdvantages.push(yearlyAdvantages);

    // Report progress
    if (onProgress && (sim + 1) % 100 === 0) {
      onProgress(sim + 1, numSimulations);
    }
  }

  // Aggregate statistics at each year
  const yearStats: MonteCarloYearStats[] = [];

  for (let y = 0; y < numYears; y++) {
    // Collect all advantages for this year across simulations
    const advantages: number[] = [];
    for (let sim = 0; sim < numSimulations; sim++) {
      advantages.push(simulationAdvantages[sim][y]);
    }

    // Sort for percentile calculations
    const sorted = [...advantages].sort((a, b) => a - b);

    const meanVal = mean(advantages);
    const medianVal = median(sorted);
    const stdDevVal = stdDev(advantages, meanVal);

    // Count buyer wins (advantage > 0)
    let buyerWins = 0;
    for (let i = 0; i < advantages.length; i++) {
      if (advantages[i] > 0) buyerWins++;
    }

    yearStats.push({
      year: y + 1,
      mean: meanVal,
      median: medianVal,
      stdDev: stdDevVal,
      p10: percentile(sorted, 10),
      p25: percentile(sorted, 25),
      p50: medianVal,
      p75: percentile(sorted, 75),
      p90: percentile(sorted, 90),
      buyerWinsPct: buyerWins / numSimulations,
    });
  }

  return {
    yearStats,
    simulationAdvantages,
    totalSimulations: numSimulations,
  };
}
