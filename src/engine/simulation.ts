/**
 * Month-by-month buyer vs. renter simulation for 30 years.
 * Pure TypeScript — no framework dependencies.
 */

import type {
  CalculatorParams,
  FixedConstants,
  MonthlySnapshot,
  YearlySnapshot,
  SimulationResult,
  EarlyExitResult,
} from './types';
import { computeMonthlyPayment } from './amortization';
import { getMarginalRate } from './tax';

/**
 * Run the full 30-year deterministic simulation.
 */
export function runSimulation(
  params: CalculatorParams,
  constants: FixedConstants
): SimulationResult {
  return runSimulationWithVariableRates(params, constants, null);
}

/**
 * Per-year variable rates for Monte Carlo simulations.
 */
export interface VariableYearRates {
  homeAppreciation: number[];  // length 30, index 0 = year 1
  spReturn: number[];
  rentGrowth: number[];
}

/**
 * Run simulation with optional per-year variable rates (for Monte Carlo).
 * If variableRates is null, uses the fixed rates from params.
 */
export function runSimulationWithVariableRates(
  params: CalculatorParams,
  constants: FixedConstants,
  variableRates: VariableYearRates | null
): SimulationResult {
  const {
    homePrice,
    downPaymentPct,
    mortgageRate,
    hoaMonthly,
    hoaGrowthRate,
    melloRoosAnnual,
    monthlyRent,
    rentGrowthRate,
    rentCeiling,
    rentFloor,
    homeAppreciation,
    spReturn,
    maintenanceRate,
    annualImprovementBudget,
    improvementRecoupRate,
    ownershipFreedomPremium,
    renterFlexibilityPremium,
    grossIncome,
    filingStatus,
    refinanceEnabled,
    refinanceYear,
    refinanceRate,
  } = params;

  const totalMonths = constants.loanTermMonths; // 360
  const downPayment = homePrice * downPaymentPct;
  const loanAmount = homePrice - downPayment;
  const closingCosts = homePrice * constants.closingCostRate;
  const upfrontCash = downPayment + closingCosts;

  // Marginal tax rate for deduction benefit
  const { combined: marginalRate } = getMarginalRate(grossIncome, filingStatus);

  // Cap gains exclusion
  const capGainsExclusion =
    filingStatus === 'mfj'
      ? constants.capGainsExclusionMFJ
      : constants.capGainsExclusionSingle;

  // Mortgage state
  let currentRate = mortgageRate;
  let currentPayment = computeMonthlyPayment(loanAmount, currentRate, totalMonths);
  let remainingBalance = loanAmount;
  let hasRefinanced = false;

  // Home value state
  let homeValue = homePrice;

  // Renter portfolio
  let renterPortfolio = upfrontCash;

  // Results
  const monthly: MonthlySnapshot[] = [];
  const yearly: YearlySnapshot[] = [];

  // YTD accumulators
  let totalBuyerCostYTD = 0;
  let totalRentYTD = 0;
  let yearlyTaxSavings = 0;

  let breakEvenYear: number | null = null;
  let breakEvenYearWithIntangibles: number | null = null;

  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12);
    const yearIndex = year - 1; // 0-based for variableRates arrays
    const isFirstMonthOfYear = (month - 1) % 12 === 0;

    // Get rates for this year
    const yearAppreciation = variableRates
      ? variableRates.homeAppreciation[yearIndex]
      : homeAppreciation;
    const yearSPReturn = variableRates
      ? variableRates.spReturn[yearIndex]
      : spReturn;
    const yearRentGrowth = variableRates
      ? variableRates.rentGrowth[yearIndex]
      : rentGrowthRate;

    // Reset YTD at start of year
    if (isFirstMonthOfYear) {
      totalBuyerCostYTD = 0;
      totalRentYTD = 0;
      yearlyTaxSavings = 0;
    }

    // === REFINANCE CHECK ===
    if (
      refinanceEnabled &&
      !hasRefinanced &&
      month === refinanceYear * 12
    ) {
      currentRate = refinanceRate;
      const remainingMonths = totalMonths - month + 1;
      currentPayment = computeMonthlyPayment(
        remainingBalance,
        currentRate,
        remainingMonths
      );
      hasRefinanced = true;
    }

    // === BUYER CALCULATIONS ===

    // Mortgage P&I
    const monthlyRate = currentRate / 12;
    const interestPortion = remainingBalance * monthlyRate;
    let principalPortion = currentPayment - interestPortion;

    // Prevent overpayment on the last few months
    if (principalPortion > remainingBalance) {
      principalPortion = remainingBalance;
    }
    remainingBalance = Math.max(0, remainingBalance - principalPortion);

    const monthlyPayment = interestPortion + principalPortion;

    // Property tax
    const propertyTax = (homeValue * constants.propertyTaxRate) / 12;

    // Insurance
    const insurance = (homeValue * constants.homeInsuranceRate) / 12;

    // HOA (escalates annually)
    const hoa = hoaMonthly * Math.pow(1 + hoaGrowthRate, yearIndex);

    // Mello-Roos
    const melloRoos = melloRoosAnnual / 12;

    // Maintenance
    const maintenance = (homeValue * maintenanceRate) / 12;

    // Improvements
    const improvements = annualImprovementBudget / 12;

    // PMI: required if down < 20% and LTV > 80%
    const currentLTV = remainingBalance / homeValue;
    const pmi =
      downPaymentPct < 0.2 && currentLTV > 0.8
        ? (loanAmount * constants.pmiRate) / 12
        : 0;

    // Total buyer cost
    const totalBuyerCost =
      monthlyPayment +
      propertyTax +
      insurance +
      hoa +
      melloRoos +
      maintenance +
      improvements +
      pmi;

    // Tax benefit
    // MID cap: can only deduct interest on first $750K of mortgage
    const midFraction = loanAmount > constants.midCap
      ? constants.midCap / loanAmount
      : 1;
    const deductibleInterest = interestPortion * midFraction;

    // SALT cap: property tax deduction limited to $10K/yr
    const annualPropertyTax = propertyTax * 12;
    const deductiblePropertyTaxMonthly =
      Math.min(annualPropertyTax, constants.saltCap) / 12;

    const taxSavings =
      (deductibleInterest + deductiblePropertyTaxMonthly) * marginalRate;

    const effectiveBuyerCost = totalBuyerCost - taxSavings;

    // Appreciate home value (monthly compounding)
    homeValue *= Math.pow(1 + yearAppreciation, 1 / 12);

    // Add improvement recoup at end of each year
    if (month % 12 === 0) {
      homeValue += annualImprovementBudget * improvementRecoupRate;
    }

    // Buyer wealth calculation
    const equityBeforeSelling = homeValue - remainingBalance;
    const sellingCosts = homeValue * constants.sellingCostRate;
    const buyerWealth = equityBeforeSelling - sellingCosts;

    // Capital gains tax
    const gain = homeValue - homePrice;
    const taxableGain = Math.max(0, gain - capGainsExclusion);
    const capGainsTax = taxableGain * constants.longTermCapGainsRate;
    const buyerWealthAfterTax = buyerWealth - capGainsTax;

    // === RENTER CALCULATIONS ===

    // Rent with annual growth, clamped
    let rent = monthlyRent * Math.pow(1 + yearRentGrowth, yearIndex);
    rent = Math.max(rentFloor, Math.min(rentCeiling, rent));

    // Monthly savings difference (positive means buyer pays more, renter invests)
    const monthlyDiff = effectiveBuyerCost - rent;

    // Renter invests the difference (or withdraws if negative)
    renterPortfolio += monthlyDiff;

    // Apply intangibles
    renterPortfolio += renterFlexibilityPremium;
    renterPortfolio -= ownershipFreedomPremium;

    // Grow portfolio
    renterPortfolio *= Math.pow(1 + yearSPReturn, 1 / 12);

    const renterWealth = renterPortfolio;

    // === ADVANTAGE ===
    const advantage = buyerWealthAfterTax - renterWealth;

    // YTD accumulators
    totalBuyerCostYTD += totalBuyerCost;
    totalRentYTD += rent;
    yearlyTaxSavings += taxSavings;

    // Record monthly snapshot
    monthly.push({
      month,
      year,
      homeValue,
      remainingBalance,
      monthlyPayment,
      principalPortion,
      interestPortion,
      propertyTax,
      insurance,
      hoa,
      melloRoos,
      maintenance,
      improvements,
      pmi,
      totalBuyerCost,
      taxSavings,
      effectiveBuyerCost,
      buyerWealth,
      buyerWealthAfterTax,
      rent,
      monthlyDiff,
      renterPortfolio,
      renterWealth,
      advantage,
    });

    // Record yearly snapshot at end of each year
    if (month % 12 === 0) {
      yearly.push({
        year,
        homeValue,
        remainingBalance,
        buyerWealth,
        buyerWealthAfterTax,
        renterWealth,
        advantage,
        totalBuyerCostYTD,
        totalRentYTD,
        rent,
        hoa,
        taxSavings: yearlyTaxSavings,
      });

      // Track break-even (first year where buyer beats renter)
      if (breakEvenYear === null && advantage > 0) {
        breakEvenYear = year;
      }

      // Break-even with intangibles already factored in (they are part of renter portfolio)
      if (breakEvenYearWithIntangibles === null && advantage > 0) {
        breakEvenYearWithIntangibles = year;
      }
    }
  }

  return {
    monthly,
    yearly,
    breakEvenYear,
    breakEvenYearWithIntangibles,
    finalBuyerWealth: monthly[monthly.length - 1].buyerWealthAfterTax,
    finalRenterWealth: monthly[monthly.length - 1].renterWealth,
  };
}

/**
 * Compute early exit results for years 1-10.
 */
export function computeEarlyExits(
  params: CalculatorParams,
  constants: FixedConstants
): EarlyExitResult[] {
  const result = runSimulation(params, constants);
  const exits: EarlyExitResult[] = [];

  const downPayment = params.homePrice * params.downPaymentPct;
  const closingCosts = params.homePrice * constants.closingCostRate;
  const initialCashOutlay = downPayment + closingCosts;

  for (let year = 1; year <= 10; year++) {
    const monthIndex = year * 12 - 1; // 0-based index for month 12, 24, etc.
    if (monthIndex >= result.monthly.length) break;

    const snapshot = result.monthly[monthIndex];
    const sellingCosts = snapshot.homeValue * constants.sellingCostRate;
    const walkAwayEquity =
      snapshot.homeValue - snapshot.remainingBalance - sellingCosts;

    // Capital gains
    const gain = snapshot.homeValue - params.homePrice;
    const capGainsExclusion =
      params.filingStatus === 'mfj'
        ? constants.capGainsExclusionMFJ
        : constants.capGainsExclusionSingle;
    const taxableGain = Math.max(0, gain - capGainsExclusion);
    const capGainsTax = taxableGain * constants.longTermCapGainsRate;
    const netEquity = walkAwayEquity - capGainsTax;

    const netGainLoss = netEquity - initialCashOutlay;
    const renterPortfolio = snapshot.renterWealth;
    const margin = netEquity - renterPortfolio;

    exits.push({
      year,
      homeValue: snapshot.homeValue,
      sellingCosts,
      remainingMortgage: snapshot.remainingBalance,
      walkAwayEquity: netEquity,
      initialCashOutlay,
      netGainLoss,
      renterPortfolio,
      winner: netEquity > renterPortfolio ? 'buyer' : 'renter',
      margin: Math.abs(margin),
    });
  }

  return exits;
}
