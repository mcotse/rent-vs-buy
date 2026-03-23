'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { FIXED_CONSTANTS } from '@/engine/defaults';
import { computeTaxBreakdown, getMarginalRate } from '@/engine/tax';
import type { TaxBreakdown } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrency, formatPercent, formatCurrencyShort } from '@/lib/format';
import MetricCard from '@/components/shared/MetricCard';
import CaveatsList from '@/components/shared/CaveatsList';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

const HOUSING_RATIOS = [0.28, 0.33, 0.38];

export default function TaxSalaryTab() {
  const { params, simulationResult } = useCalculatorStore();

  const taxBreakdown = useMemo<TaxBreakdown>(() => {
    return computeTaxBreakdown(params.grossIncome, params.filingStatus);
  }, [params.grossIncome, params.filingStatus]);

  const taxBenefits = useMemo(() => {
    if (!simulationResult || simulationResult.monthly.length === 0) return null;

    // Year 1 data for MID and property tax deduction
    const year1Months = simulationResult.monthly.slice(0, 12);
    const annualTaxSavings = year1Months.reduce((sum, m) => sum + m.taxSavings, 0);

    // Approximate split: MID is typically ~80% of deduction savings in year 1
    const year1InterestTotal = year1Months.reduce((sum, m) => sum + m.interestPortion, 0);
    const year1PropertyTaxTotal = year1Months.reduce((sum, m) => sum + m.propertyTax, 0);

    const { combined: marginalRate } = getMarginalRate(params.grossIncome, params.filingStatus);

    // MID: capped at $750K of mortgage
    const loanAmount = params.homePrice * (1 - params.downPaymentPct);
    const midFraction = loanAmount > FIXED_CONSTANTS.midCap ? FIXED_CONSTANTS.midCap / loanAmount : 1;
    const annualMID = year1InterestTotal * midFraction * marginalRate;

    // Property tax: capped at SALT
    const deductiblePropTax = Math.min(year1PropertyTaxTotal, FIXED_CONSTANTS.saltCap);
    const annualPropTaxSavings = deductiblePropTax * marginalRate;

    // Capital gains exclusion
    const exclusion =
      params.filingStatus === 'mfj'
        ? FIXED_CONSTANTS.capGainsExclusionMFJ
        : FIXED_CONSTANTS.capGainsExclusionSingle;

    return {
      annualMIDSavings: annualMID,
      annualPropertyTaxDeduction: annualPropTaxSavings,
      projectedCapGainsExclusion: exclusion,
    };
  }, [simulationResult, params]);

  // Monthly buyer cost for housing ratio
  const monthlyBuyerCost = useMemo(() => {
    if (!simulationResult || simulationResult.monthly.length === 0) return 0;
    return simulationResult.monthly[0].totalBuyerCost;
  }, [simulationResult]);

  const housingPctOfTakeHome = taxBreakdown.takeHome > 0
    ? (monthlyBuyerCost * 12) / taxBreakdown.takeHome
    : 0;

  // Salary reference table
  const salaryReference = useMemo(() => {
    return HOUSING_RATIOS.map((ratio) => {
      const annualHousingCost = monthlyBuyerCost * 12;
      const grossNeeded = annualHousingCost / ratio;
      const tb = computeTaxBreakdown(grossNeeded, params.filingStatus);
      const pctOfTakeHome = tb.takeHome > 0 ? annualHousingCost / tb.takeHome : 0;

      return {
        ratio,
        grossNeeded,
        pctOfTakeHome,
      };
    });
  }, [monthlyBuyerCost, params.filingStatus]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Tax benefits summary */}
      {taxBenefits && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            label="Annual MID Savings"
            value={formatCurrencyShort(taxBenefits.annualMIDSavings)}
            sublabel="Mortgage interest deduction benefit"
            trend="positive"
          />
          <MetricCard
            label="Annual Prop Tax Savings"
            value={formatCurrencyShort(taxBenefits.annualPropertyTaxDeduction)}
            sublabel={`SALT cap: ${formatCurrency(FIXED_CONSTANTS.saltCap)}/yr`}
            trend="positive"
          />
          <MetricCard
            label="Cap Gains Exclusion"
            value={formatCurrencyShort(taxBenefits.projectedCapGainsExclusion)}
            sublabel={`${params.filingStatus === 'mfj' ? 'MFJ' : 'Single'} filing status`}
            trend="positive"
          />
        </div>
      )}

      {/* Income breakdown */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3
          className="mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Income Breakdown at {formatCurrency(params.grossIncome)}
        </h3>

        {/* Stacked bar */}
        <div className="mb-4">
          <div className="flex h-8 overflow-hidden rounded-full">
            {[
              { label: 'Take-Home', value: taxBreakdown.takeHome, color: COLORS.gain },
              { label: 'Federal', value: taxBreakdown.federalTax, color: '#ef4444' },
              { label: 'California', value: taxBreakdown.stateTax, color: '#f97316' },
              { label: 'FICA', value: taxBreakdown.fica, color: '#8b5cf6' },
            ].map((seg) => {
              const pct = taxBreakdown.grossIncome > 0
                ? (seg.value / taxBreakdown.grossIncome) * 100
                : 0;
              return (
                <div
                  key={seg.label}
                  className="transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: seg.color,
                    opacity: 0.8,
                  }}
                  title={`${seg.label}: ${formatCurrency(Math.round(seg.value))} (${pct.toFixed(1)}%)`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            {[
              { label: 'Take-Home', color: COLORS.gain },
              { label: 'Federal', color: '#ef4444' },
              { label: 'California', color: '#f97316' },
              { label: 'FICA', color: '#8b5cf6' },
            ].map((seg) => (
              <div key={seg.label} className="flex items-center gap-1.5 text-[10px]">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: seg.color }} />
                <span style={{ color: COLORS.textMuted }}>{seg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Detail rows */}
        <div className="divide-y" style={{ borderColor: COLORS.borderSubtle }}>
          {[
            { label: 'Gross Income', value: taxBreakdown.grossIncome, color: COLORS.textPrimary },
            { label: 'Federal Tax', value: -taxBreakdown.federalTax, color: COLORS.loss },
            { label: 'California Tax', value: -taxBreakdown.stateTax, color: COLORS.loss },
            { label: 'FICA', value: -taxBreakdown.fica, color: COLORS.loss },
            { label: 'Take-Home', value: taxBreakdown.takeHome, color: COLORS.gain },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between py-2.5">
              <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                {row.label}
              </span>
              <span className="text-sm font-medium" style={{ color: row.color }}>
                {row.value < 0 ? '-' : ''}
                {formatCurrency(Math.abs(Math.round(row.value)))}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>
              Effective Tax Rate
            </span>
            <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
              {formatPercent(taxBreakdown.effectiveRate)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <span className="text-sm" style={{ color: COLORS.textSecondary }}>
              Housing Cost as % of Take-Home
            </span>
            <span
              className="text-sm font-semibold"
              style={{
                color: housingPctOfTakeHome > 0.33 ? COLORS.loss : COLORS.gain,
              }}
            >
              {formatPercent(housingPctOfTakeHome)}
            </span>
          </div>
        </div>
      </div>

      {/* Salary reference table */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3
          className="mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Salary Reference for {formatCurrency(Math.round(monthlyBuyerCost))}/mo Housing
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-xs" style={{ borderColor: COLORS.borderSubtle }}>
              <th className="pb-2 text-left font-medium" style={{ color: COLORS.textSecondary }}>
                Housing-to-Income Ratio
              </th>
              <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>
                Gross Salary Needed
              </th>
              <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>
                % of Take-Home
              </th>
            </tr>
          </thead>
          <tbody>
            {salaryReference.map((row) => (
              <tr
                key={row.ratio}
                className="border-b"
                style={{ borderColor: COLORS.borderSubtle }}
              >
                <td className="py-2.5" style={{ color: COLORS.textPrimary }}>
                  {formatPercent(row.ratio, 0)}
                </td>
                <td className="py-2.5 text-right font-medium" style={{ color: COLORS.buyer }}>
                  {formatCurrencyShort(row.grossNeeded)}
                </td>
                <td
                  className="py-2.5 text-right"
                  style={{
                    color: row.pctOfTakeHome > 0.5 ? COLORS.loss : COLORS.textPrimary,
                  }}
                >
                  {formatPercent(row.pctOfTakeHome)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Model explanation */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3
          className="mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Model Explanation
        </h3>
        <div className="space-y-4 text-sm" style={{ color: COLORS.textSecondary }}>
          <div>
            <h4 className="mb-1 font-semibold" style={{ color: COLORS.textPrimary }}>
              Buyer Path
            </h4>
            <p>
              Tracks monthly mortgage P&amp;I, property tax, insurance, HOA, Mello-Roos,
              maintenance, and improvements. Wealth is measured as home equity minus selling costs
              and capital gains tax.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold" style={{ color: COLORS.textPrimary }}>
              Renter Path
            </h4>
            <p>
              Invests the full difference between the buyer&rsquo;s upfront costs and monthly premium
              into an S&amp;P 500 index fund. Portfolio grows at the configured annual return.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold" style={{ color: COLORS.textPrimary }}>
              Intangible Premiums
            </h4>
            <p>
              Ownership freedom premium (remodel, pets, stability) is added to the buyer side.
              Renter flexibility premium (mobility, no maintenance risk) is added to the renter side.
              These shift the break-even calculation.
            </p>
          </div>
          <div>
            <h4 className="mb-1 font-semibold" style={{ color: COLORS.textPrimary }}>
              Early Exit Model
            </h4>
            <p>
              Computes the walk-away equity if forced to sell at any year (1-10), including 6%
              selling costs (agent fees + SF transfer tax). Compares to renter portfolio at the
              same point.
            </p>
          </div>
        </div>
      </div>

      {/* Caveats */}
      <CaveatsList />
    </motion.div>
  );
}
