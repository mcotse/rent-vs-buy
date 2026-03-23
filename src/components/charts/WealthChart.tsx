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
import type { YearlySnapshot } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrencyCompact, formatCurrency } from '@/lib/format';

interface WealthChartProps {
  yearly: YearlySnapshot[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length < 2) return null;

  const buyer = payload.find((p) => p.dataKey === 'buyerWealth');
  const renter = payload.find((p) => p.dataKey === 'renterWealth');

  if (!buyer || !renter) return null;

  const diff = buyer.value - renter.value;
  const winner = diff > 0 ? 'Buyer' : diff < 0 ? 'Renter' : 'Tie';
  const winnerColor = diff > 0 ? COLORS.gain : diff < 0 ? COLORS.loss : COLORS.textSecondary;

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
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.buyer }} />
          <span style={{ color: COLORS.textSecondary }}>Buyer:</span>
          <span className="font-medium" style={{ color: COLORS.buyer }}>
            {formatCurrency(buyer.value)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.renter }} />
          <span style={{ color: COLORS.textSecondary }}>Renter:</span>
          <span className="font-medium" style={{ color: COLORS.renter }}>
            {formatCurrency(renter.value)}
          </span>
        </div>
        <div className="mt-1 border-t pt-1" style={{ borderColor: COLORS.borderSubtle }}>
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: COLORS.textSecondary }}>Difference:</span>
            <span className="font-semibold" style={{ color: winnerColor }}>
              {diff > 0 ? '+' : ''}
              {formatCurrency(diff)}
            </span>
            <span className="text-xs" style={{ color: winnerColor }}>
              ({winner} wins)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomActiveDot(props: {
  cx?: number;
  cy?: number;
  fill?: string;
}) {
  const { cx, cy, fill } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={fill} opacity={0.3} />
      <circle cx={cx} cy={cy} r={3} fill={fill} />
    </g>
  );
}

export default function WealthChart({ yearly }: WealthChartProps) {
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

  const hasNegative = yearly.some((y) => y.buyerWealth < 0 || y.renterWealth < 0);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={yearly} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="buyerFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.buyer} stopOpacity={0.15} />
            <stop offset="100%" stopColor={COLORS.buyer} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="renterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.renter} stopOpacity={0.15} />
            <stop offset="100%" stopColor={COLORS.renter} stopOpacity={0.02} />
          </linearGradient>
          <filter id="buyerGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="renterGlow">
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

        {hasNegative && (
          <ReferenceLine y={0} stroke={COLORS.textMuted} strokeDasharray="4 4" />
        )}

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: COLORS.textMuted, strokeDasharray: '4 4' }}
        />

        <Legend
          align="right"
          verticalAlign="top"
          wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          formatter={(value: string) => (
            <span style={{ color: COLORS.textSecondary }}>{value}</span>
          )}
        />

        <Area
          type="monotone"
          dataKey="buyerWealth"
          fill="url(#buyerFill)"
          stroke="none"
          name="Buyer Wealth"
        />
        <Area
          type="monotone"
          dataKey="renterWealth"
          fill="url(#renterFill)"
          stroke="none"
          name="Renter Wealth"
        />

        <Line
          type="monotone"
          dataKey="buyerWealth"
          stroke={COLORS.buyer}
          strokeWidth={2}
          dot={false}
          activeDot={<CustomActiveDot fill={COLORS.buyer} />}
          name="Buyer Wealth"
          filter="url(#buyerGlow)"
        />
        <Line
          type="monotone"
          dataKey="renterWealth"
          stroke={COLORS.renter}
          strokeWidth={2}
          dot={false}
          activeDot={<CustomActiveDot fill={COLORS.renter} />}
          name="Renter Wealth"
          filter="url(#renterGlow)"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
