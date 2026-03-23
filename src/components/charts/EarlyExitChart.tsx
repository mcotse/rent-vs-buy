import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { EarlyExitResult } from '@/engine/types';
import { COLORS } from '@/lib/colors';
import { formatCurrencyCompact, formatCurrency } from '@/lib/format';

interface EarlyExitChartProps {
  exits: EarlyExitResult[];
}

interface ChartDataPoint {
  year: number;
  buyerEquity: number;
  renterPortfolio: number;
  winner: 'buyer' | 'renter';
  margin: number;
  // Full breakdown for tooltip
  homeValue: number;
  sellingCosts: number;
  remainingMortgage: number;
  netGainLoss: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint; dataKey: string }>;
  label?: number;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const d = payload[0].payload;
  const winnerColor = d.winner === 'buyer' ? COLORS.gain : COLORS.loss;

  return (
    <div
      className="rounded-lg border px-4 py-3 shadow-xl"
      style={{
        backgroundColor: COLORS.bgCard,
        borderColor: COLORS.borderSubtle,
      }}
    >
      <p className="mb-2 text-xs font-semibold" style={{ color: COLORS.textPrimary }}>
        Exit Year {label}
      </p>

      <div className="mb-2 space-y-1">
        <p className="text-xs font-medium" style={{ color: COLORS.buyer }}>
          Buyer Breakdown
        </p>
        <div className="space-y-0.5 text-xs" style={{ color: COLORS.textSecondary }}>
          <div className="flex justify-between gap-4">
            <span>Home Value:</span>
            <span>{formatCurrency(d.homeValue)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Selling Costs:</span>
            <span style={{ color: COLORS.loss }}>-{formatCurrency(d.sellingCosts)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Mortgage Remaining:</span>
            <span style={{ color: COLORS.loss }}>-{formatCurrency(d.remainingMortgage)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t pt-0.5" style={{ borderColor: COLORS.borderSubtle }}>
            <span className="font-medium">Walk-Away Equity:</span>
            <span className="font-medium" style={{ color: COLORS.buyer }}>
              {formatCurrency(d.buyerEquity)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2 space-y-1">
        <p className="text-xs font-medium" style={{ color: COLORS.renter }}>
          Renter Portfolio
        </p>
        <div className="text-xs font-medium" style={{ color: COLORS.renter }}>
          {formatCurrency(d.renterPortfolio)}
        </div>
      </div>

      <div className="border-t pt-1.5" style={{ borderColor: COLORS.borderSubtle }}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold" style={{ color: winnerColor }}>
            {d.winner === 'buyer' ? 'Buyer' : 'Renter'} wins
          </span>
          <span className="font-semibold" style={{ color: winnerColor }}>
            by {formatCurrency(d.margin)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function EarlyExitChart({ exits }: EarlyExitChartProps) {
  if (!exits || exits.length === 0) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        <p style={{ color: COLORS.textMuted }}>No early exit data available</p>
      </div>
    );
  }

  const data: ChartDataPoint[] = exits.map((e) => ({
    year: e.year,
    buyerEquity: e.walkAwayEquity,
    renterPortfolio: e.renterPortfolio,
    winner: e.winner,
    margin: e.margin,
    homeValue: e.homeValue,
    sellingCosts: e.sellingCosts,
    remainingMortgage: e.remainingMortgage,
    netGainLoss: e.netGainLoss,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="buyerBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.buyerLight} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.buyer} stopOpacity={0.7} />
          </linearGradient>
          <linearGradient id="renterBarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLORS.renterLight} stopOpacity={0.9} />
            <stop offset="100%" stopColor={COLORS.renter} stopOpacity={0.7} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />

        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: COLORS.textSecondary }}
          axisLine={{ stroke: COLORS.borderSubtle }}
          tickLine={{ stroke: COLORS.borderSubtle }}
          label={{
            value: 'Exit Year',
            position: 'insideBottom',
            offset: -2,
            style: { fontSize: 11, fill: COLORS.textSecondary },
          }}
        />
        <YAxis
          tickFormatter={(v: number) => formatCurrencyCompact(v)}
          tick={{ fontSize: 11, fill: COLORS.textSecondary }}
          axisLine={{ stroke: COLORS.borderSubtle }}
          tickLine={{ stroke: COLORS.borderSubtle }}
          width={70}
        />

        <ReferenceLine y={0} stroke={COLORS.textMuted} strokeDasharray="4 4" />

        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }}
        />

        <Legend
          align="right"
          verticalAlign="top"
          wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
          formatter={(value: string) => (
            <span style={{ color: COLORS.textSecondary }}>{value}</span>
          )}
        />

        <Bar
          dataKey="buyerEquity"
          name="Buyer Equity"
          fill="url(#buyerBarGrad)"
          radius={[3, 3, 0, 0]}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              stroke={d.winner === 'buyer' ? COLORS.gain : 'transparent'}
              strokeWidth={d.winner === 'buyer' ? 1.5 : 0}
            />
          ))}
        </Bar>
        <Bar
          dataKey="renterPortfolio"
          name="Renter Portfolio"
          fill="url(#renterBarGrad)"
          radius={[3, 3, 0, 0]}
        >
          {data.map((d, i) => (
            <Cell
              key={i}
              stroke={d.winner === 'renter' ? COLORS.loss : 'transparent'}
              strokeWidth={d.winner === 'renter' ? 1.5 : 0}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
