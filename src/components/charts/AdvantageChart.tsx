import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import type { YearlySnapshot } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrencyCompact, formatCurrency } from '@/lib/format';

interface AdvantageChartProps {
  yearly: YearlySnapshot[];
}

interface ProcessedPoint {
  year: number;
  advantage: number;
  positiveAdvantage: number;
  negativeAdvantage: number;
}

function findBreakEvenYear(yearly: YearlySnapshot[]): number | null {
  for (let i = 1; i < yearly.length; i++) {
    const prev = yearly[i - 1].advantage;
    const curr = yearly[i].advantage;
    if ((prev <= 0 && curr >= 0) || (prev >= 0 && curr <= 0)) {
      // Linear interpolation to find approximate crossing point
      if (curr === prev) return yearly[i].year;
      const fraction = Math.abs(prev) / (Math.abs(prev) + Math.abs(curr));
      return yearly[i - 1].year + fraction;
    }
  }
  return null;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  // Get the actual advantage from the first available payload
  const posItem = payload.find((p) => p.dataKey === 'positiveAdvantage');
  const negItem = payload.find((p) => p.dataKey === 'negativeAdvantage');
  const advantage = (posItem?.value ?? 0) + (negItem?.value ?? 0);

  const winner = advantage > 0 ? 'Buying' : advantage < 0 ? 'Renting' : 'Even';
  const color = advantage > 0 ? COLORS.gain : advantage < 0 ? COLORS.loss : COLORS.textSecondary;

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
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: COLORS.textSecondary }}>Advantage:</span>
          <span className="font-semibold" style={{ color }}>
            {advantage > 0 ? '+' : ''}
            {formatCurrency(advantage)}
          </span>
        </div>
        <div className="text-xs" style={{ color }}>
          {winner === 'Even' ? 'Break-even point' : `${winner} wins by ${formatCurrency(Math.abs(advantage))}`}
        </div>
      </div>
    </div>
  );
}

export default function AdvantageChart({ yearly }: AdvantageChartProps) {
  if (!yearly || yearly.length === 0) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        <p style={{ color: COLORS.textMuted }}>No simulation data available</p>
      </div>
    );
  }

  const data: ProcessedPoint[] = yearly.map((y) => ({
    year: y.year,
    advantage: y.advantage,
    positiveAdvantage: Math.max(0, y.advantage),
    negativeAdvantage: Math.min(0, y.advantage),
  }));

  const breakEvenYear = findBreakEvenYear(yearly);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="gainFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.gain} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLORS.gain} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="lossFill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={COLORS.loss} stopOpacity={0.25} />
            <stop offset="100%" stopColor={COLORS.loss} stopOpacity={0.05} />
          </linearGradient>
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

        <ReferenceLine y={0} stroke={COLORS.textPrimary} strokeWidth={1.5} />

        {breakEvenYear !== null && (
          <ReferenceLine
            x={Math.round(breakEvenYear)}
            stroke={COLORS.textSecondary}
            strokeDasharray="6 4"
            label={{
              value: `Break-even ~Year ${Math.round(breakEvenYear)}`,
              position: 'top',
              fill: COLORS.textSecondary,
              fontSize: 11,
            }}
          />
        )}

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: COLORS.textMuted, strokeDasharray: '4 4' }}
        />

        <Area
          type="monotone"
          dataKey="positiveAdvantage"
          fill="url(#gainFill)"
          stroke={COLORS.gain}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.gain }}
          baseLine={0}
        />
        <Area
          type="monotone"
          dataKey="negativeAdvantage"
          fill="url(#lossFill)"
          stroke={COLORS.loss}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: COLORS.loss }}
          baseLine={0}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
