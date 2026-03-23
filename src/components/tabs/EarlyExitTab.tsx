'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { FIXED_CONSTANTS } from '@/engine/defaults';
import { computeEarlyExits } from '@/engine/simulation';
import type { EarlyExitResult } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrency, formatCurrencyShort } from '@/lib/format';
import MetricCard from '@/components/shared/MetricCard';
import ComparisonRow from '@/components/shared/ComparisonRow';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

const QUICK_YEARS = [1, 2, 3, 5, 7, 10];

export default function EarlyExitTab() {
  const { params } = useCalculatorStore();

  const exits = useMemo(() => {
    try {
      return computeEarlyExits(params, FIXED_CONSTANTS);
    } catch {
      return [];
    }
  }, [params]);

  const selectedExit = useMemo(() => {
    return exits.find((e) => e.year === params.forcedExitYear) ?? null;
  }, [exits, params.forcedExitYear]);

  if (exits.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border" style={cardStyle}>
        <p style={{ color: COLORS.textMuted }}>Unable to compute early exit results.</p>
      </div>
    );
  }

  const downPayment = params.homePrice * params.downPaymentPct;
  const closingCosts = params.homePrice * FIXED_CONSTANTS.closingCostRate;
  const initialCashOutlay = downPayment + closingCosts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Selected year detail */}
      {selectedExit && (
        <>
          <MetricCard
            label={`Forced Exit at Year ${selectedExit.year}`}
            value={`${selectedExit.netGainLoss >= 0 ? '+' : ''}${formatCurrencyShort(selectedExit.netGainLoss)}`}
            sublabel={
              selectedExit.netGainLoss >= 0
                ? 'Net gain vs initial cash outlay'
                : 'Net loss vs initial cash outlay'
            }
            trend={selectedExit.netGainLoss >= 0 ? 'positive' : 'negative'}
          />

          <div className="rounded-xl border p-5" style={cardStyle}>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              Year {selectedExit.year} Exit Detail
            </h3>

            {/* Header row */}
            <div
              className="mb-2 grid grid-cols-3 gap-4 border-b pb-2"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <span className="text-xs" style={{ color: COLORS.textMuted }} />
              <span className="text-right text-xs font-medium" style={{ color: COLORS.buyer }}>
                Buyer
              </span>
              <span className="text-right text-xs font-medium" style={{ color: COLORS.renter }}>
                Renter
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: COLORS.borderSubtle }}>
              <ComparisonRow
                label="Home Value"
                buyerValue={formatCurrency(selectedExit.homeValue)}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Selling Costs (6%)"
                buyerValue={`-${formatCurrency(selectedExit.sellingCosts)}`}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Remaining Mortgage"
                buyerValue={`-${formatCurrency(selectedExit.remainingMortgage)}`}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Walk-Away Equity"
                buyerValue={formatCurrency(selectedExit.walkAwayEquity)}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Initial Cash Outlay"
                buyerValue={formatCurrency(initialCashOutlay)}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Net Gain/Loss"
                buyerValue={`${selectedExit.netGainLoss >= 0 ? '+' : ''}${formatCurrency(selectedExit.netGainLoss)}`}
                renterValue="--"
                winner="tie"
              />
              <ComparisonRow
                label="Portfolio"
                buyerValue={formatCurrency(selectedExit.walkAwayEquity)}
                renterValue={formatCurrency(selectedExit.renterPortfolio)}
                winner={selectedExit.winner}
              />
            </div>

            <div
              className="mt-3 flex items-center justify-between border-t pt-3"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <span className="text-xs" style={{ color: COLORS.textSecondary }}>
                Winner
              </span>
              <span
                className="text-sm font-semibold"
                style={{
                  color:
                    selectedExit.winner === 'buyer' ? COLORS.buyer : COLORS.renter,
                }}
              >
                {selectedExit.winner === 'buyer' ? 'Buyer' : 'Renter'} by{' '}
                {formatCurrencyShort(Math.abs(selectedExit.margin))}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Quick view table */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3
          className="mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Early Exit Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b text-xs"
                style={{ borderColor: COLORS.borderSubtle }}
              >
                <th className="pb-2 text-left font-medium" style={{ color: COLORS.textSecondary }}>Year</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>Home Value</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>Equity</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>Net Gain/Loss</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.renter }}>Renter Portfolio</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>Winner</th>
                <th className="pb-2 text-right font-medium" style={{ color: COLORS.textSecondary }}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_YEARS.map((yr) => {
                const exit = exits.find((e) => e.year === yr);
                if (!exit) return null;

                const isSelected = yr === params.forcedExitYear;
                const rowBg = isSelected ? 'rgba(255,255,255,0.04)' : 'transparent';

                return (
                  <tr
                    key={yr}
                    className="border-b transition-colors"
                    style={{
                      borderColor: COLORS.borderSubtle,
                      backgroundColor: rowBg,
                    }}
                  >
                    <td className="py-2.5 font-medium" style={{ color: COLORS.textPrimary }}>
                      {yr}
                      {isSelected && (
                        <span className="ml-1 text-[10px]" style={{ color: COLORS.buyer }}>
                          (selected)
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right" style={{ color: COLORS.textPrimary }}>
                      {formatCurrencyShort(exit.homeValue)}
                    </td>
                    <td className="py-2.5 text-right" style={{ color: COLORS.buyer }}>
                      {formatCurrencyShort(exit.walkAwayEquity)}
                    </td>
                    <td
                      className="py-2.5 text-right font-medium"
                      style={{ color: exit.netGainLoss >= 0 ? COLORS.gain : COLORS.loss }}
                    >
                      {exit.netGainLoss >= 0 ? '+' : ''}
                      {formatCurrencyShort(exit.netGainLoss)}
                    </td>
                    <td className="py-2.5 text-right" style={{ color: COLORS.renter }}>
                      {formatCurrencyShort(exit.renterPortfolio)}
                    </td>
                    <td
                      className="py-2.5 text-right font-medium"
                      style={{
                        color: exit.winner === 'buyer' ? COLORS.buyer : COLORS.renter,
                      }}
                    >
                      {exit.winner === 'buyer' ? 'Buyer' : 'Renter'}
                    </td>
                    <td className="py-2.5 text-right" style={{ color: COLORS.textSecondary }}>
                      {formatCurrencyShort(Math.abs(exit.margin))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart visualization */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3
          className="mb-4 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Net Gain/Loss by Exit Year
        </h3>
        <div className="space-y-2">
          {exits.map((exit) => {
            const maxAbs = Math.max(...exits.map((e) => Math.abs(e.netGainLoss)), 1);
            const pct = Math.abs(exit.netGainLoss) / maxAbs * 100;
            const isPositive = exit.netGainLoss >= 0;

            return (
              <div key={exit.year} className="flex items-center gap-3">
                <span
                  className="w-8 text-right text-xs font-medium"
                  style={{ color: COLORS.textSecondary }}
                >
                  Yr {exit.year}
                </span>
                <div className="relative flex-1">
                  <div
                    className="h-5 rounded transition-all"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: isPositive ? COLORS.gain : COLORS.loss,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span
                  className="w-16 text-right text-xs font-medium"
                  style={{ color: isPositive ? COLORS.gain : COLORS.loss }}
                >
                  {isPositive ? '+' : ''}
                  {formatCurrencyShort(exit.netGainLoss)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
