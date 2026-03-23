// === Parameter Types ===

export type FilingStatus = 'mfj' | 'single';

export interface CalculatorParams {
  // Group 1: Property
  homePrice: number;
  downPaymentPct: number;
  mortgageRate: number;

  // Group 2: Monthly Costs
  hoaMonthly: number;
  hoaGrowthRate: number;
  melloRoosAnnual: number;

  // Group 3: Renting
  monthlyRent: number;
  rentGrowthRate: number;
  rentCeiling: number;
  rentFloor: number;

  // Group 4: Growth & Returns
  homeAppreciation: number;
  spReturn: number;
  inflationRate: number;

  // Group 5: Ownership Costs
  maintenanceRate: number;
  annualImprovementBudget: number;
  improvementRecoupRate: number;

  // Group 6: Intangibles
  ownershipFreedomPremium: number;
  renterFlexibilityPremium: number;

  // Group 7: Tax & Income
  grossIncome: number;
  filingStatus: FilingStatus;

  // Group 8: Refinance
  refinanceEnabled: boolean;
  refinanceYear: number;
  refinanceRate: number;

  // Group 9: Early Exit
  forcedExitYear: number;

  // Display toggle
  showRealValues: boolean;
}

// === Fixed Constants ===

export interface FixedConstants {
  propertyTaxRate: number;
  homeInsuranceRate: number;
  closingCostRate: number;
  sellingCostRate: number;
  loanTermYears: number;
  loanTermMonths: number;
  pmiRate: number;
  midCap: number;
  capGainsExclusionMFJ: number;
  capGainsExclusionSingle: number;
  saltCap: number;
  longTermCapGainsRate: number;
}

// === Simulation Result Types ===

export interface MonthlySnapshot {
  month: number;
  year: number;

  // Buyer side
  homeValue: number;
  remainingBalance: number;
  monthlyPayment: number;
  principalPortion: number;
  interestPortion: number;
  propertyTax: number;
  insurance: number;
  hoa: number;
  melloRoos: number;
  maintenance: number;
  improvements: number;
  pmi: number;
  totalBuyerCost: number;
  taxSavings: number;
  effectiveBuyerCost: number;
  buyerWealth: number;
  buyerWealthAfterTax: number;

  // Renter side
  rent: number;
  monthlyDiff: number;
  renterPortfolio: number;
  renterWealth: number;

  // Comparison
  advantage: number;
}

export interface YearlySnapshot {
  year: number;
  homeValue: number;
  remainingBalance: number;
  buyerWealth: number;
  buyerWealthAfterTax: number;
  renterWealth: number;
  advantage: number;
  totalBuyerCostYTD: number;
  totalRentYTD: number;
  rent: number;
  hoa: number;
  taxSavings: number;
}

export interface SimulationResult {
  monthly: MonthlySnapshot[];
  yearly: YearlySnapshot[];
  breakEvenYear: number | null;
  breakEvenYearWithIntangibles: number | null;
  finalBuyerWealth: number;
  finalRenterWealth: number;
}

// === Early Exit Types ===

export interface EarlyExitResult {
  year: number;
  homeValue: number;
  sellingCosts: number;
  remainingMortgage: number;
  walkAwayEquity: number;
  initialCashOutlay: number;
  netGainLoss: number;
  renterPortfolio: number;
  winner: 'buyer' | 'renter';
  margin: number;
}

// === Tax Types ===

export interface TaxBreakdown {
  grossIncome: number;
  federalTax: number;
  stateTax: number;
  fica: number;
  takeHome: number;
  effectiveRate: number;
  marginalFederalRate: number;
  marginalStateRate: number;
  combinedMarginalRate: number;
}

export interface TaxBenefitSummary {
  annualMIDSavings: number;
  annualPropertyTaxDeduction: number;
  projectedCapGainsExclusion: number;
}

// === Monte Carlo Types ===

export interface MonteCarloYearStats {
  year: number;
  mean: number;
  median: number;
  stdDev: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  buyerWinsPct: number;
}

export interface MonteCarloResult {
  yearStats: MonteCarloYearStats[];
  simulationAdvantages: number[][]; // [simIndex][yearIndex]
  totalSimulations: number;
}

// === Sensitivity Types ===

export type SensitivityVariable =
  | 'homeAppreciation'
  | 'spReturn'
  | 'mortgageRate'
  | 'rentGrowthRate'
  | 'homePrice';

export interface SensitivityCell {
  rowValue: number;
  colValue: number;
  breakEvenYear: number | null;
  advantage10yr: number;
}

export interface SensitivityResult {
  rowVar: SensitivityVariable;
  colVar: SensitivityVariable;
  rowValues: number[];
  colValues: number[];
  cells: SensitivityCell[][];
}

// === Parameter Range (for UI sliders) ===

export interface ParamRange {
  min: number;
  max: number;
  step: number;
  default: number;
  format: 'currency' | 'percent' | 'number' | 'year';
  label: string;
  group: string;
}

// === Monte Carlo Worker Messages ===

export interface MonteCarloWorkerRequest {
  params: CalculatorParams;
  constants: FixedConstants;
  numSimulations: number;
}

export interface MonteCarloWorkerProgress {
  type: 'progress';
  completed: number;
  total: number;
}

export interface MonteCarloWorkerComplete {
  type: 'complete';
  result: MonteCarloResult;
}

export type MonteCarloWorkerResponse = MonteCarloWorkerProgress | MonteCarloWorkerComplete;
