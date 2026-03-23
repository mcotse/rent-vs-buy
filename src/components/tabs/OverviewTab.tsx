'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { COLORS } from '@/lib/colors';
import { formatCurrency, formatYear, formatCurrencyShort } from '@/lib/format';
import MetricCard from '@/components/shared/MetricCard';
import ComparisonRow from '@/components/shared/ComparisonRow';
import WealthChart from '@/components/charts/WealthChart';
import AdvantageChart from '@/components/charts/AdvantageChart';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

function SnapshotCard({ year, label }: { year: number; label: string }) {
  const { simulationResult } = useCalculatorStore();

  const snapshot = useMemo(() => {
    if (!simulationResult) return null;
    return simulationResult.yearly.find((y) => y.year === year) ?? null;
  }, [simulationResult, year]);

  if (!snapshot) return null;

  const buyerWealth = snapshot.buyerWealthAfterTax;
  const renterWealth = snapshot.renterWealth;
  const winner = buyerWealth >= renterWealth ? 'buyer' : 'renter';
  const margin = Math.abs(buyerWealth - renterWealth);

  // Compute monthly rent at that year
  const rentAtYear = snapshot.rent;

  return (
    <div className="rounded-xl border p-5" style={cardStyle}>
      <h3
        className="mb-3 text-xs font-semibold uppercase tracking-wider"
        style={{ color: COLORS.textSecondary }}
      >
        {label}
      </h3>

      {/* Header row */}
      <div className="mb-3 grid grid-cols-3 gap-4 border-b pb-2" style={{ borderColor: COLORS.borderSubtle }}>
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
          label="Wealth"
          buyerValue={formatCurrencyShort(buyerWealth)}
          renterValue={formatCurrencyShort(renterWealth)}
          winner={winner}
        />
        <ComparisonRow
          label="Home Value"
          buyerValue={formatCurrencyShort(snapshot.homeValue)}
          renterValue="--"
          winner="tie"
        />
        <ComparisonRow
          label="Monthly Rent"
          buyerValue="--"
          renterValue={formatCurrency(rentAtYear)}
          winner="tie"
        />
      </div>

      <div className="mt-3 flex items-center justify-between border-t pt-3" style={{ borderColor: COLORS.borderSubtle }}>
        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
          Winner
        </span>
        <span
          className="text-sm font-semibold"
          style={{ color: winner === 'buyer' ? COLORS.buyer : COLORS.renter }}
        >
          {winner === 'buyer' ? 'Buyer' : 'Renter'} by {formatCurrencyShort(margin)}
        </span>
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const { simulationResult, params } = useCalculatorStore();

  const intangibleImpact = useMemo(() => {
    if (!simulationResult) return null;
    const net = params.ownershipFreedomPremium - params.renterFlexibilityPremium;
    const years = 30;
    return net * 12 * years;
  }, [simulationResult, params]);

  if (!simulationResult) {
    return (
      <div
        className="flex h-96 items-center justify-center rounded-xl border"
        style={cardStyle}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: COLORS.buyer, borderTopColor: 'transparent' }}
          />
          <p style={{ color: COLORS.textMuted }}>Running simulation...</p>
        </div>
      </div>
    );
  }

  const { breakEvenYear, breakEvenYearWithIntangibles, finalBuyerWealth, finalRenterWealth, yearly } =
    simulationResult;

  const advantage30 = finalBuyerWealth - finalRenterWealth;
  const advantage30Trend = advantage30 > 0 ? 'positive' : advantage30 < 0 ? 'negative' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Top metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          label="Break-Even (w/ Intangibles)"
          value={formatYear(breakEvenYearWithIntangibles)}
          sublabel={
            breakEvenYearWithIntangibles
              ? `Buying becomes cheaper after ${breakEvenYearWithIntangibles} years`
              : 'Renting wins across all 30 years'
          }
          trend={breakEvenYearWithIntangibles !== null ? 'positive' : 'negative'}
        />
        <MetricCard
          label="Financial Break-Even"
          value={formatYear(breakEvenYear)}
          sublabel="Pure financial comparison, no intangibles"
          trend={breakEvenYear !== null ? 'positive' : 'negative'}
        />
        <MetricCard
          label="30-Year Advantage"
          value={`${advantage30 >= 0 ? '+' : ''}${formatCurrencyShort(advantage30)}`}
          sublabel={advantage30 >= 0 ? 'Buying wins over 30 years' : 'Renting wins over 30 years'}
          trend={advantage30Trend as 'positive' | 'negative' | 'neutral'}
        />
      </div>

      {/* Wealth Chart */}
      <div className="rounded-xl border p-4" style={cardStyle}>
        <h3
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Wealth Over Time
        </h3>
        <WealthChart yearly={yearly} />
      </div>

      {/* Advantage Chart */}
      <div className="rounded-xl border p-4" style={cardStyle}>
        <h3
          className="mb-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: COLORS.textSecondary }}
        >
          Buyer Advantage Over Time
        </h3>
        <AdvantageChart yearly={yearly} />
      </div>

      {/* Snapshot cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SnapshotCard year={5} label="Year 5 Snapshot" />
        <SnapshotCard year={10} label="Year 10 Snapshot" />
      </div>

      {/* Net intangible impact */}
      {intangibleImpact !== null && (
        <div className="rounded-xl border p-4" style={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
                Net Intangible Impact (30yr)
              </p>
              <p className="mt-1 text-xs" style={{ color: COLORS.textMuted }}>
                (Ownership premium {formatCurrency(params.ownershipFreedomPremium)}/mo
                {' '}&minus;{' '}
                Renter flexibility {formatCurrency(params.renterFlexibilityPremium)}/mo)
                {' '}&times; 360 months
              </p>
            </div>
            <p
              className="font-serif text-2xl font-bold"
              style={{ color: intangibleImpact >= 0 ? COLORS.gain : COLORS.loss }}
            >
              {intangibleImpact >= 0 ? '+' : ''}
              {formatCurrencyShort(intangibleImpact)}
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
