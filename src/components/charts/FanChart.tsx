import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import type { MonteCarloYearStats } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrencyCompact, formatCurrency } from '@/lib/format';

interface FanChartProps {
  yearStats: MonteCarloYearStats[];
}

interface FanDataPoint {
  year: number;
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  mean: number;
  buyerWinsPct: number;
  // For area band rendering we store [low, high] ranges
  band90: [number, number];
  band75: [number, number];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: FanDataPoint }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const d = payload[0].payload;
  const rows = [
    { label: 'P90 (optimistic)', value: d.p90 },
    { label: 'P75', value: d.p75 },
    { label: 'P50 (median)', value: d.p50 },
    { label: 'P25', value: d.p25 },
    { label: 'P10 (pessimistic)', value: d.p10 },
    { label: 'Mean', value: d.mean },
  ];

  return (
    <div
      className="rounded-lg border px-4 py-3 shadow-xl"
      style={{
        backgroundColor: COLORS.bgCard,
        borderColor: COLORS.borderSubtle,
      }}
    >
      <p className="mb-2 text-xs font-medium" style={{ color: COLORS.textSecondary }}>
        Year {label}
      </p>
      <div className="space-y-1">
        {rows.map((row) => {
          const color = row.value > 0 ? COLORS.gain : row.value < 0 ? COLORS.loss : COLORS.textSecondary;
          return (
            <div key={row.label} className="flex items-center justify-between gap-4 text-xs">
              <span style={{ color: COLORS.textSecondary }}>{row.label}</span>
              <span className="font-medium" style={{ color }}>
                {formatCurrency(row.value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 border-t pt-2" style={{ borderColor: COLORS.borderSubtle }}>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: COLORS.textSecondary }}>Buyer wins</span>
          <span className="font-medium" style={{ color: COLORS.buyer }}>
            {(d.buyerWinsPct * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FanChart({ yearStats }: FanChartProps) {
  if (!yearStats || yearStats.length === 0) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        <p style={{ color: COLORS.textMuted }}>No Monte Carlo data available</p>
      </div>
    );
  }

  const data: FanDataPoint[] = yearStats.map((s) => ({
    year: s.year,
    p10: s.p10,
    p25: s.p25,
    p50: s.p50,
    p75: s.p75,
    p90: s.p90,
    mean: s.mean,
    buyerWinsPct: s.buyerWinsPct,
    band90: [s.p10, s.p90],
    band75: [s.p25, s.p75],
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="fanOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.buyer} stopOpacity={0.08} />
            <stop offset="50%" stopColor={COLORS.buyer} stopOpacity={0.12} />
            <stop offset="100%" stopColor={COLORS.buyer} stopOpacity={0.08} />
          </linearGradient>
          <linearGradient id="fanInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.buyer} stopOpacity={0.15} />
            <stop offset="50%" stopColor={COLORS.buyer} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLORS.buyer} stopOpacity={0.15} />
          </linearGradient>
          <filter id="medianGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: COLORS.textSecondary }}
          axisLine={{ stroke: COLORS.borderSubtle }}
          tickLine={{ stroke: COLORS.borderSubtle }}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrencyCompact(v)}
          tick={{ fontSize: 11, fill: COLORS.textSecondary }}
          axisLine={{ stroke: COLORS.borderSubtle }}
          tickLine={{ stroke: COLORS.borderSubtle }}
          width={70}
        />

        <ReferenceLine y={0} stroke={COLORS.textMuted} strokeDasharray="6 4" strokeWidth={1} />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: COLORS.textMuted, strokeDasharray: '4 4' }}
        />

        <Legend
          align="right"
          verticalAlign="top"
          wrapperStyle={{ fontSize: 11, paddingBottom: 8 }}
          {...{
            payload: [
              { value: 'P10-P90 range', type: 'rect', color: COLORS.mc90 },
              { value: 'P25-P75 range', type: 'rect', color: COLORS.mc75 },
              { value: 'Median (P50)', type: 'line', color: COLORS.mc50 },
            ],
          }}
          formatter={(value: string) => (
            <span style={{ color: COLORS.textSecondary }}>{value}</span>
          )}
        />

        {/* P10-P90 outer band */}
        <Area
          type="monotone"
          dataKey="band90"
          fill="url(#fanOuter)"
          stroke="none"
          name="P10-P90 range"
          legendType="none"
        />

        {/* P25-P75 inner band */}
        <Area
          type="monotone"
          dataKey="band75"
          fill="url(#fanInner)"
          stroke="none"
          name="P25-P75 range"
          legendType="none"
        />

        {/* Median line */}
        <Line
          type="monotone"
          dataKey="p50"
          stroke={COLORS.mc50}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.mc50 }}
          name="Median (P50)"
          legendType="none"
          filter="url(#medianGlow)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
