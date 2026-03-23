'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { COLORS } from '@/lib/colors';
import { formatCurrency, formatPercent, formatCurrencyShort } from '@/lib/format';
import MetricCard from '@/components/shared/MetricCard';
import { Slider } from '@/components/ui/slider';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

export default function MonteCarloTab() {
  const {
    monteCarloResult,
    monteCarloProgress,
    selectedMonteCarloYear,
    setSelectedMonteCarloYear,
  } = useCalculatorStore();

  const yearStats = useMemo(() => {
    if (!monteCarloResult) return null;
    return (
      monteCarloResult.yearStats.find((s) => s.year === selectedMonteCarloYear) ?? null
    );
  }, [monteCarloResult, selectedMonteCarloYear]);

  // Histogram data: bin the advantages at the selected year
  const histogramData = useMemo(() => {
    if (!monteCarloResult) return [];
    const yearIndex = selectedMonteCarloYear - 1;
    const advantages = monteCarloResult.simulationAdvantages
      .map((sim) => sim[yearIndex])
      .filter((v) => v !== undefined);

    if (advantages.length === 0) return [];

    const min = Math.min(...advantages);
    const max = Math.max(...advantages);
    const binCount = 40;
    const binWidth = (max - min) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      count: 0,
      midpoint: min + (i + 0.5) * binWidth,
    }));

    for (const val of advantages) {
      const idx = Math.min(Math.floor((val - min) / binWidth), binCount - 1);
      bins[idx].count++;
    }

    const maxCount = Math.max(...bins.map((b) => b.count));
    return bins.map((b) => ({
      ...b,
      height: maxCount > 0 ? (b.count / maxCount) * 100 : 0,
      isPositive: b.midpoint >= 0,
    }));
  }, [monteCarloResult, selectedMonteCarloYear]);

  // Loading state
  if (!monteCarloResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="rounded-xl border p-8" style={cardStyle}>
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: COLORS.buyer, borderTopColor: 'transparent' }}
            />
            <p style={{ color: COLORS.textSecondary }}>Running Monte Carlo simulation...</p>
            <div className="w-full max-w-md">
              <div
                className="h-2 overflow-hidden rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${monteCarloProgress}%`,
                    backgroundColor: COLORS.buyer,
                  }}
                />
              </div>
              <p className="mt-2 text-center text-xs" style={{ color: COLORS.textMuted }}>
                {Math.round(monteCarloProgress * 100)}% complete
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  const winPct = yearStats?.buyerWinsPct ?? 0;
  const winTrend = winPct >= 50 ? 'positive' : winPct < 50 ? 'negative' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Headline */}
      <MetricCard
        label={`Chance Buying Wins After ${selectedMonteCarloYear} Years`}
        value={formatPercent(winPct / 100)}
        sublabel={`Based on ${monteCarloResult.totalSimulations.toLocaleString()} simulations`}
        trend={winTrend as 'positive' | 'negative' | 'neutral'}
      />

      {/* Year selector */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
            Analysis Year
          </span>
          <span className="font-serif text-lg font-bold" style={{ color: COLORS.textPrimary }}>
            Year {selectedMonteCarloYear}
          </span>
        </div>
        <Slider
          min={1}
          max={30}
          step={1}
          value={[selectedMonteCarloYear]}
          onValueChange={([v]) => setSelectedMonteCarloYear(v)}
        />
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: COLORS.textMuted }}>
          <span>Year 1</span>
          <span>Year 30</span>
        </div>
      </div>

      {/* Histogram */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
          Distribution of Buyer Advantage at Year {selectedMonteCarloYear}
        </h3>
        <div className="flex h-48 items-end gap-px">
          {histogramData.map((bin, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm transition-all duration-200"
              style={{
                height: `${bin.height}%`,
                backgroundColor: bin.isPositive ? COLORS.gain : COLORS.loss,
                opacity: 0.7,
                minHeight: bin.count > 0 ? 2 : 0,
              }}
              title={`${formatCurrencyShort(bin.midpoint)}: ${bin.count} sims`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: COLORS.textMuted }}>
          {histogramData.length > 0 && (
            <>
              <span>{formatCurrencyShort(histogramData[0].start)}</span>
              <span style={{ color: COLORS.textSecondary }}>0</span>
              <span>{formatCurrencyShort(histogramData[histogramData.length - 1].end)}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.loss }} />
            <span style={{ color: COLORS.textMuted }}>Renter wins</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: COLORS.gain }} />
            <span style={{ color: COLORS.textMuted }}>Buyer wins</span>
          </span>
        </div>
      </div>

      {/* Stats table */}
      {yearStats && (
        <div className="rounded-xl border p-5" style={cardStyle}>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
            Statistics at Year {selectedMonteCarloYear}
          </h3>
          <div className="divide-y" style={{ borderColor: COLORS.borderSubtle }}>
            {[
              { label: 'Mean Advantage', value: yearStats.mean },
              { label: 'Median Advantage', value: yearStats.median },
              { label: 'Std Deviation', value: yearStats.stdDev },
              { label: '10th Percentile (Bear)', value: yearStats.p10 },
              { label: '90th Percentile (Bull)', value: yearStats.p90 },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5">
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  {row.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: row.value >= 0 ? COLORS.gain : COLORS.loss }}
                >
                  {row.value >= 0 ? '+' : ''}
                  {formatCurrency(Math.round(row.value))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
