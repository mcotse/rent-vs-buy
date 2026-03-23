import type { CalculatorParams, FixedConstants, ParamRange } from './types';

export const FIXED_CONSTANTS: FixedConstants = {
  propertyTaxRate: 0.01183,
  homeInsuranceRate: 0.0012,
  closingCostRate: 0.025,
  sellingCostRate: 0.06,
  loanTermYears: 30,
  loanTermMonths: 360,
  pmiRate: 0.0035,
  midCap: 750_000,
  capGainsExclusionMFJ: 500_000,
  capGainsExclusionSingle: 250_000,
  saltCap: 10_000,
  longTermCapGainsRate: 0.238, // 20% federal + 3.8% NIIT for high earners
};

export const DEFAULT_PARAMS: CalculatorParams = {
  // Group 1: Property
  homePrice: 1_900_000,
  downPaymentPct: 0.20,
  mortgageRate: 0.0645,

  // Group 2: Monthly Costs
  hoaMonthly: 1_500,
  hoaGrowthRate: 0.05,
  melloRoosAnnual: 4_000,

  // Group 3: Renting
  monthlyRent: 8_500,
  rentGrowthRate: 0.02,
  rentCeiling: 12_000,
  rentFloor: 6_000,

  // Group 4: Growth & Returns
  homeAppreciation: 0.03,
  spReturn: 0.08,
  inflationRate: 0.025,

  // Group 5: Ownership Costs
  maintenanceRate: 0.005,
  annualImprovementBudget: 12_000,
  improvementRecoupRate: 0.65,

  // Group 6: Intangibles
  ownershipFreedomPremium: 400,
  renterFlexibilityPremium: 300,

  // Group 7: Tax & Income
  grossIncome: 400_000,
  filingStatus: 'mfj',

  // Group 8: Refinance
  refinanceEnabled: false,
  refinanceYear: 5,
  refinanceRate: 0.05,

  // Group 9: Early Exit
  forcedExitYear: 3,

  // Display
  showRealValues: false,
};

export const PARAM_RANGES: Record<string, ParamRange> = {
  // Group 1: Property
  homePrice: {
    min: 1_500_000, max: 2_500_000, step: 25_000, default: 1_900_000,
    format: 'currency', label: 'Home Price', group: 'Property',
  },
  downPaymentPct: {
    min: 0.10, max: 0.40, step: 0.01, default: 0.20,
    format: 'percent', label: 'Down Payment', group: 'Property',
  },
  mortgageRate: {
    min: 0.05, max: 0.08, step: 0.0005, default: 0.0645,
    format: 'percent', label: 'Mortgage Rate', group: 'Property',
  },

  // Group 2: Monthly Costs
  hoaMonthly: {
    min: 0, max: 2_500, step: 50, default: 1_500,
    format: 'currency', label: 'HOA / Month', group: 'Monthly Costs',
  },
  hoaGrowthRate: {
    min: 0, max: 0.10, step: 0.005, default: 0.05,
    format: 'percent', label: 'HOA Growth Rate', group: 'Monthly Costs',
  },
  melloRoosAnnual: {
    min: 0, max: 12_000, step: 500, default: 4_000,
    format: 'currency', label: 'Mello-Roos / Year', group: 'Monthly Costs',
  },

  // Group 3: Renting
  monthlyRent: {
    min: 4_000, max: 15_000, step: 100, default: 8_500,
    format: 'currency', label: 'Monthly Rent', group: 'Renting',
  },
  rentGrowthRate: {
    min: 0, max: 0.08, step: 0.005, default: 0.02,
    format: 'percent', label: 'Rent Growth', group: 'Renting',
  },
  rentCeiling: {
    min: 8_500, max: 20_000, step: 500, default: 12_000,
    format: 'currency', label: 'Rent Ceiling', group: 'Renting',
  },
  rentFloor: {
    min: 2_000, max: 8_500, step: 500, default: 6_000,
    format: 'currency', label: 'Rent Floor', group: 'Renting',
  },

  // Group 4: Growth & Returns
  homeAppreciation: {
    min: 0, max: 0.08, step: 0.005, default: 0.03,
    format: 'percent', label: 'Home Appreciation', group: 'Growth & Returns',
  },
  spReturn: {
    min: 0.04, max: 0.12, step: 0.005, default: 0.08,
    format: 'percent', label: 'S&P Return', group: 'Growth & Returns',
  },
  inflationRate: {
    min: 0, max: 0.06, step: 0.005, default: 0.025,
    format: 'percent', label: 'Inflation Rate', group: 'Growth & Returns',
  },

  // Group 5: Ownership Costs
  maintenanceRate: {
    min: 0, max: 0.02, step: 0.001, default: 0.005,
    format: 'percent', label: 'Maintenance', group: 'Ownership Costs',
  },
  annualImprovementBudget: {
    min: 0, max: 50_000, step: 1_000, default: 12_000,
    format: 'currency', label: 'Improvement Budget / Year', group: 'Ownership Costs',
  },
  improvementRecoupRate: {
    min: 0.30, max: 1.00, step: 0.05, default: 0.65,
    format: 'percent', label: 'Improvement Recoup Rate', group: 'Ownership Costs',
  },

  // Group 6: Intangibles
  ownershipFreedomPremium: {
    min: 0, max: 1_500, step: 50, default: 400,
    format: 'currency', label: 'Ownership Freedom / Month', group: 'Intangibles',
  },
  renterFlexibilityPremium: {
    min: 0, max: 1_500, step: 50, default: 300,
    format: 'currency', label: 'Renter Flexibility / Month', group: 'Intangibles',
  },

  // Group 7: Tax & Income
  grossIncome: {
    min: 100_000, max: 1_000_000, step: 10_000, default: 400_000,
    format: 'currency', label: 'Gross Household Income', group: 'Tax & Income',
  },

  // Group 8: Refinance
  refinanceYear: {
    min: 1, max: 25, step: 1, default: 5,
    format: 'year', label: 'Refinance Year', group: 'Refinance',
  },
  refinanceRate: {
    min: 0.03, max: 0.07, step: 0.0005, default: 0.05,
    format: 'percent', label: 'New Rate', group: 'Refinance',
  },

  // Group 9: Early Exit
  forcedExitYear: {
    min: 1, max: 10, step: 1, default: 3,
    format: 'year', label: 'Forced Exit Year', group: 'Early Exit',
  },
};
