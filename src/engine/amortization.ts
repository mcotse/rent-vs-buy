/**
 * Mortgage amortization schedule computation.
 * Pure TypeScript — no framework dependencies.
 */

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

/**
 * Compute the fixed monthly payment for a fully amortizing loan.
 * Uses the standard annuity formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function computeMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0) return 0;
  if (termMonths <= 0) return 0;

  const monthlyRate = annualRate / 12;

  // Handle 0% interest edge case
  if (monthlyRate === 0) {
    return principal / termMonths;
  }

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return principal * (monthlyRate * factor) / (factor - 1);
}

/**
 * Compute a full amortization schedule for a loan.
 */
export function computeAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  const monthlyRate = annualRate / 12;
  const payment = computeMonthlyPayment(principal, annualRate, termMonths);

  let balance = principal;

  for (let month = 1; month <= termMonths; month++) {
    const interestPortion = balance * monthlyRate;
    let principalPortion = payment - interestPortion;

    // Last payment adjustment to avoid floating-point residual
    if (month === termMonths || principalPortion > balance) {
      principalPortion = balance;
    }

    balance = Math.max(0, balance - principalPortion);

    schedule.push({
      month,
      payment: interestPortion + principalPortion,
      principal: principalPortion,
      interest: interestPortion,
      remainingBalance: balance,
    });
  }

  return schedule;
}

/**
 * Compute a refinanced amortization schedule.
 * Given the remaining balance at the point of refinance, a new rate,
 * and the remaining number of months, produce a new schedule.
 * Month numbers continue from startMonth.
 */
export function computeRefinancedSchedule(
  remainingBalance: number,
  newAnnualRate: number,
  remainingMonths: number,
  startMonth: number
): AmortizationEntry[] {
  const rawSchedule = computeAmortizationSchedule(
    remainingBalance,
    newAnnualRate,
    remainingMonths
  );

  // Re-number months to continue from where the original schedule left off
  return rawSchedule.map((entry) => ({
    ...entry,
    month: startMonth + entry.month - 1,
  }));
}
