/**
 * Federal + California + FICA tax computation.
 * Pure TypeScript — no framework dependencies.
 */

import type { FilingStatus, TaxBreakdown } from './types';

// --- Federal 2025 Brackets ---

interface TaxBracket {
  upperBound: number;
  rate: number;
}

const FEDERAL_BRACKETS_MFJ: TaxBracket[] = [
  { upperBound: 23_200, rate: 0.10 },
  { upperBound: 94_300, rate: 0.12 },
  { upperBound: 201_050, rate: 0.22 },
  { upperBound: 383_900, rate: 0.24 },
  { upperBound: 487_450, rate: 0.32 },
  { upperBound: 731_200, rate: 0.35 },
  { upperBound: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_SINGLE: TaxBracket[] = [
  { upperBound: 11_600, rate: 0.10 },
  { upperBound: 47_150, rate: 0.12 },
  { upperBound: 100_525, rate: 0.22 },
  { upperBound: 191_950, rate: 0.24 },
  { upperBound: 243_725, rate: 0.32 },
  { upperBound: 609_350, rate: 0.35 },
  { upperBound: Infinity, rate: 0.37 },
];

const FEDERAL_STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  mfj: 30_000,
  single: 15_000,
};

// --- California Brackets (same for all filers for simplicity) ---

const CALIFORNIA_BRACKETS: TaxBracket[] = [
  { upperBound: 10_412, rate: 0.01 },
  { upperBound: 24_684, rate: 0.02 },
  { upperBound: 38_959, rate: 0.04 },
  { upperBound: 54_081, rate: 0.06 },
  { upperBound: 68_350, rate: 0.08 },
  { upperBound: 349_137, rate: 0.093 },
  { upperBound: 418_961, rate: 0.103 },
  { upperBound: 698_271, rate: 0.113 },
  { upperBound: Infinity, rate: 0.123 },
];

const CA_MENTAL_HEALTH_THRESHOLD = 1_000_000;
const CA_MENTAL_HEALTH_SURCHARGE = 0.01;

// --- FICA ---

const SS_RATE = 0.062;
const SS_WAGE_BASE = 168_600;
const MEDICARE_RATE = 0.0145;
const MEDICARE_SURTAX_RATE = 0.009;
const MEDICARE_SURTAX_THRESHOLD: Record<FilingStatus, number> = {
  mfj: 250_000,
  single: 200_000,
};

// --- Helper: Compute tax from progressive brackets ---

function computeProgressiveTax(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;

  let tax = 0;
  let previousBound = 0;

  for (const bracket of brackets) {
    if (taxableIncome <= previousBound) break;

    const taxableInBracket = Math.min(taxableIncome, bracket.upperBound) - previousBound;
    tax += Math.max(0, taxableInBracket) * bracket.rate;
    previousBound = bracket.upperBound;
  }

  return tax;
}

function getMarginalBracketRate(taxableIncome: number, brackets: TaxBracket[]): number {
  if (taxableIncome <= 0) return 0;

  for (const bracket of brackets) {
    if (taxableIncome <= bracket.upperBound) {
      return bracket.rate;
    }
  }

  // Above all brackets — return the highest rate
  return brackets[brackets.length - 1].rate;
}

// --- Federal Tax ---

function computeFederalTax(grossIncome: number, filingStatus: FilingStatus): number {
  const standardDeduction = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const brackets = filingStatus === 'mfj' ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  return computeProgressiveTax(taxableIncome, brackets);
}

function getFederalMarginalRate(grossIncome: number, filingStatus: FilingStatus): number {
  const standardDeduction = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const taxableIncome = Math.max(0, grossIncome - standardDeduction);
  const brackets = filingStatus === 'mfj' ? FEDERAL_BRACKETS_MFJ : FEDERAL_BRACKETS_SINGLE;
  return getMarginalBracketRate(taxableIncome, brackets);
}

// --- California Tax ---

function computeCaliforniaTax(grossIncome: number): number {
  // California applies to full income (no standard deduction adjustment here)
  let tax = computeProgressiveTax(grossIncome, CALIFORNIA_BRACKETS);

  // Mental health surcharge: +1% above $1M
  if (grossIncome > CA_MENTAL_HEALTH_THRESHOLD) {
    tax += (grossIncome - CA_MENTAL_HEALTH_THRESHOLD) * CA_MENTAL_HEALTH_SURCHARGE;
  }

  return tax;
}

function getCaliforniaMarginalRate(grossIncome: number): number {
  let rate = getMarginalBracketRate(grossIncome, CALIFORNIA_BRACKETS);

  if (grossIncome > CA_MENTAL_HEALTH_THRESHOLD) {
    rate += CA_MENTAL_HEALTH_SURCHARGE;
  }

  return rate;
}

// --- FICA ---

function computeFICA(grossIncome: number, filingStatus: FilingStatus): number {
  // Social Security
  const ssWages = Math.min(grossIncome, SS_WAGE_BASE);
  const ssTax = ssWages * SS_RATE;

  // Medicare
  const medicareTax = grossIncome * MEDICARE_RATE;

  // Medicare surtax
  const surtaxThreshold = MEDICARE_SURTAX_THRESHOLD[filingStatus];
  const medicareSurtax =
    grossIncome > surtaxThreshold
      ? (grossIncome - surtaxThreshold) * MEDICARE_SURTAX_RATE
      : 0;

  return ssTax + medicareTax + medicareSurtax;
}

// --- Exported Functions ---

/**
 * Compute full tax breakdown for a given gross income and filing status.
 */
export function computeTaxBreakdown(
  grossIncome: number,
  filingStatus: FilingStatus
): TaxBreakdown {
  const federalTax = computeFederalTax(grossIncome, filingStatus);
  const stateTax = computeCaliforniaTax(grossIncome);
  const fica = computeFICA(grossIncome, filingStatus);
  const totalTax = federalTax + stateTax + fica;
  const takeHome = grossIncome - totalTax;
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0;

  const marginalFederalRate = getFederalMarginalRate(grossIncome, filingStatus);
  const marginalStateRate = getCaliforniaMarginalRate(grossIncome);

  return {
    grossIncome,
    federalTax,
    stateTax,
    fica,
    takeHome,
    effectiveRate,
    marginalFederalRate,
    marginalStateRate,
    combinedMarginalRate: marginalFederalRate + marginalStateRate,
  };
}

/**
 * Get marginal tax rates for a given gross income.
 */
export function getMarginalRate(
  grossIncome: number,
  filingStatus: FilingStatus
): { federal: number; state: number; combined: number } {
  const federal = getFederalMarginalRate(grossIncome, filingStatus);
  const state = getCaliforniaMarginalRate(grossIncome);
  return {
    federal,
    state,
    combined: federal + state,
  };
}
