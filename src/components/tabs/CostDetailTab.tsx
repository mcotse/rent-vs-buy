'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { COLORS } from '@/lib/colors';
import { formatCurrency } from '@/lib/format';
import { Slider } from '@/components/ui/slider';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

interface CostRow {
  name: string;
  amount: number;
  pct: number;
}

export default function CostDetailTab() {
  const { simulationResult } = useCalculatorStore();
  const [selectedYear, setSelectedYear] = useState(1);

  const costBreakdown = useMemo(() => {
    if (!simulationResult) return null;

    // Get the last month of the selected year (monthly data is 0-indexed)
    const monthIndex = selectedYear * 12 - 1;
    if (monthIndex >= simulationResult.monthly.length) return null;

    const snap = simulationResult.monthly[monthIndex];

    const items: CostRow[] = [
      { name: 'Principal & Interest', amount: snap.monthlyPayment, pct: 0 },
      { name: 'Property Tax', amount: snap.propertyTax, pct: 0 },
      { name: 'Insurance', amount: snap.insurance, pct: 0 },
      { name: 'HOA', amount: snap.hoa, pct: 0 },
      { name: 'Mello-Roos', amount: snap.melloRoos, pct: 0 },
      { name: 'Maintenance', amount: snap.maintenance, pct: 0 },
      { name: 'Improvements', amount: snap.improvements, pct: 0 },
    ];

    // Only show PMI if nonzero
    if (snap.pmi > 0) {
      items.push({ name: 'PMI', amount: snap.pmi, pct: 0 });
    }

    const total = items.reduce((sum, i) => sum + i.amount, 0);
    items.forEach((i) => {
      i.pct = total > 0 ? (i.amount / total) * 100 : 0;
    });

    return {
      items,
      total: snap.totalBuyerCost,
      rent: snap.rent,
      taxSavings: snap.taxSavings,
      effectiveCost: snap.effectiveBuyerCost,
    };
  }, [simulationResult, selectedYear]);

  if (!simulationResult) {
    return (
      <div className="flex h-96 items-center justify-center rounded-xl border" style={cardStyle}>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Year selector */}
      <div className="rounded-xl border p-5" style={cardStyle}>
        <div className="mb-4 flex items-center justify-between">
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: COLORS.textSecondary }}
          >
            Viewing Year
          </span>
          <span className="font-serif text-lg font-bold" style={{ color: COLORS.textPrimary }}>
            Year {selectedYear}
          </span>
        </div>
        <Slider
          min={1}
          max={30}
          step={1}
          value={[selectedYear]}
          onValueChange={(val) => setSelectedYear(Array.isArray(val) ? val[0] : val)}
        />
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: COLORS.textMuted }}>
          <span>Year 1</span>
          <span>Year 30</span>
        </div>
      </div>

      {costBreakdown && (
        <>
          {/* Monthly breakdown table */}
          <div className="rounded-xl border p-5" style={cardStyle}>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              Monthly Buyer Costs — Year {selectedYear}
            </h3>
            <div className="space-y-0">
              {costBreakdown.items.map((item, i) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between py-2.5"
                  style={{
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                    borderBottom: `1px solid ${COLORS.borderSubtle}`,
                  }}
                >
                  <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
                      {formatCurrency(Math.round(item.amount))}
                    </span>
                    <span
                      className="w-12 text-right text-xs"
                      style={{ color: COLORS.textMuted }}
                    >
                      {item.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div
              className="mt-1 flex items-center justify-between border-t py-3"
              style={{ borderColor: COLORS.borderSubtle }}
            >
              <span className="text-sm font-semibold" style={{ color: COLORS.buyer }}>
                Total Monthly Cost
              </span>
              <span className="font-serif text-xl font-bold" style={{ color: COLORS.buyer }}>
                {formatCurrency(Math.round(costBreakdown.total))}
              </span>
            </div>
          </div>

          {/* Rent comparison */}
          <div className="rounded-xl border p-5" style={cardStyle}>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              Comparison to Rent
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  Monthly Rent (Year {selectedYear})
                </span>
                <span className="text-sm font-medium" style={{ color: COLORS.renter }}>
                  {formatCurrency(Math.round(costBreakdown.rent))}
                </span>
              </div>

              <div
                className="flex items-center justify-between border-t pt-3"
                style={{ borderColor: COLORS.borderSubtle }}
              >
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  Premium Over Rent
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      costBreakdown.total - costBreakdown.rent > 0
                        ? COLORS.loss
                        : COLORS.gain,
                  }}
                >
                  {costBreakdown.total - costBreakdown.rent > 0 ? '+' : ''}
                  {formatCurrency(Math.round(costBreakdown.total - costBreakdown.rent))}/mo
                </span>
              </div>

              <div
                className="flex items-center justify-between border-t pt-3"
                style={{ borderColor: COLORS.borderSubtle }}
              >
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  Tax Benefit Offset
                </span>
                <span className="text-sm font-medium" style={{ color: COLORS.gain }}>
                  -{formatCurrency(Math.round(costBreakdown.taxSavings))}/mo
                </span>
              </div>

              <div
                className="flex items-center justify-between border-t pt-3"
                style={{ borderColor: COLORS.borderSubtle }}
              >
                <span className="text-sm font-semibold" style={{ color: COLORS.textPrimary }}>
                  Effective Monthly Cost
                </span>
                <span className="font-serif text-xl font-bold" style={{ color: COLORS.buyer }}>
                  {formatCurrency(Math.round(costBreakdown.effectiveCost))}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: COLORS.textSecondary }}>
                  Effective Premium Over Rent
                </span>
                <span
                  className="text-sm font-semibold"
                  style={{
                    color:
                      costBreakdown.effectiveCost - costBreakdown.rent > 0
                        ? COLORS.loss
                        : COLORS.gain,
                  }}
                >
                  {costBreakdown.effectiveCost - costBreakdown.rent > 0 ? '+' : ''}
                  {formatCurrency(
                    Math.round(costBreakdown.effectiveCost - costBreakdown.rent)
                  )}
                  /mo
                </span>
              </div>
            </div>
          </div>

          {/* Visual bar breakdown */}
          <div className="rounded-xl border p-5" style={cardStyle}>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-wider"
              style={{ color: COLORS.textSecondary }}
            >
              Cost Composition
            </h3>
            <div className="flex h-6 overflow-hidden rounded-full">
              {costBreakdown.items
                .filter((i) => i.amount > 0)
                .map((item, idx) => {
                  const segColors = [
                    COLORS.buyer,
                    COLORS.renter,
                    COLORS.gain,
                    '#8b5cf6',
                    '#ec4899',
                    '#14b8a6',
                    '#f97316',
                    '#6366f1',
                  ];
                  return (
                    <div
                      key={item.name}
                      className="transition-all duration-300"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: segColors[idx % segColors.length],
                        opacity: 0.8,
                      }}
                      title={`${item.name}: ${formatCurrency(Math.round(item.amount))} (${item.pct.toFixed(1)}%)`}
                    />
                  );
                })}
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {costBreakdown.items
                .filter((i) => i.amount > 0)
                .map((item, idx) => {
                  const segColors = [
                    COLORS.buyer,
                    COLORS.renter,
                    COLORS.gain,
                    '#8b5cf6',
                    '#ec4899',
                    '#14b8a6',
                    '#f97316',
                    '#6366f1',
                  ];
                  return (
                    <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                      <span
                        className="h-2 w-2 rounded-sm"
                        style={{ backgroundColor: segColors[idx % segColors.length] }}
                      />
                      <span style={{ color: COLORS.textMuted }}>{item.name}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
