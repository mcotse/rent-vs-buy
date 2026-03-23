import { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import { COLORS } from '@/lib/colors';
import { formatCurrencyCompact, formatCurrency, formatNumber } from '@/lib/format';

interface HistogramChartProps {
  advantages: number[];
  year: number;
}

interface Bin {
  binStart: number;
  binEnd: number;
  binCenter: number;
  count: number;
}

function computeBins(values: number[], numBins: number): Bin[] {
  if (values.length === 0) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    return [{ binStart: min - 1, binEnd: max + 1, binCenter: min, count: values.length }];
  }

  const binWidth = (max - min) / numBins;
  const bins: Bin[] = [];

  for (let i = 0; i < numBins; i++) {
    const binStart = min + i * binWidth;
    const binEnd = min + (i + 1) * binWidth;
    bins.push({
      binStart,
      binEnd,
      binCenter: (binStart + binEnd) / 2,
      count: 0,
    });
  }

  for (const v of values) {
    let idx = Math.floor((v - min) / binWidth);
    if (idx >= numBins) idx = numBins - 1;
    if (idx < 0) idx = 0;
    bins[idx].count++;
  }

  return bins;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: Bin }>;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const bin = payload[0].payload;
  const isPositive = bin.binCenter > 0;

  return (
    <div
      className="rounded-lg border px-4 py-3 shadow-xl"
      style={{
        backgroundColor: COLORS.bgCard,
        borderColor: COLORS.borderSubtle,
      }}
    >
      <div className="space-y-1">
        <div className="text-xs" style={{ color: COLORS.textSecondary }}>
          Range: {formatCurrency(bin.binStart)} to {formatCurrency(bin.binEnd)}
        </div>
        <div className="text-sm font-medium" style={{ color: COLORS.textPrimary }}>
          Count: {formatNumber(bin.count)}
        </div>
        <div
          className="text-xs"
          style={{ color: isPositive ? COLORS.gain : COLORS.loss }}
        >
          {isPositive ? 'Buying wins in this range' : 'Renting wins in this range'}
        </div>
      </div>
    </div>
  );
}

export default function HistogramChart({ advantages, year }: HistogramChartProps) {
  const bins = useMemo(() => computeBins(advantages, 30), [advantages]);
  const mean = useMemo(() => {
    if (advantages.length === 0) return 0;
    return advantages.reduce((a, b) => a + b, 0) / advantages.length;
  }, [advantages]);

  if (!advantages || advantages.length === 0) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        <p style={{ color: COLORS.textMuted }}>No distribution data available</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-center text-xs" style={{ color: COLORS.textSecondary }}>
        Distribution of Buyer Advantage at Year {year} ({formatNumber(advantages.length)} simulations)
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={bins} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

          <XAxis
            dataKey="binCenter"
            tickFormatter={(v: number) => formatCurrencyCompact(v)}
            tick={{ fontSize: 11, fill: COLORS.textSecondary }}
            axisLine={{ stroke: COLORS.borderSubtle }}
            tickLine={{ stroke: COLORS.borderSubtle }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: COLORS.textSecondary }}
            axisLine={{ stroke: COLORS.borderSubtle }}
            tickLine={{ stroke: COLORS.borderSubtle }}
            label={{
              value: 'Count',
              angle: -90,
              position: 'insideLeft',
              style: { fontSize: 11, fill: COLORS.textSecondary },
            }}
          />

          <ReferenceLine
            x={0}
            stroke={COLORS.textPrimary}
            strokeDasharray="6 4"
            strokeWidth={1.5}
            label={{
              value: '$0',
              position: 'top',
              fill: COLORS.textPrimary,
              fontSize: 10,
            }}
          />

          <ReferenceLine
            x={mean}
            stroke={COLORS.buyer}
            strokeDasharray="4 2"
            strokeWidth={1}
            label={{
              value: `Mean: ${formatCurrencyCompact(mean)}`,
              position: 'top',
              fill: COLORS.buyer,
              fontSize: 10,
            }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />

          <Bar dataKey="count" radius={[2, 2, 0, 0]}>
            {bins.map((bin, index) => (
              <Cell
                key={index}
                fill={bin.binCenter >= 0 ? COLORS.gain : COLORS.loss}
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
