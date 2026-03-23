import { useMemo } from 'react';
import type { SensitivityResult } from '@/engine/types';
import { COLORS, HEATMAP_SCALE } from '@/lib/colors';
import { formatPercentFromWhole } from '@/lib/format';

interface HeatmapChartProps {
  result: SensitivityResult;
  currentRowVal: number;
  currentColVal: number;
}

const VARIABLE_LABELS: Record<string, string> = {
  homeAppreciation: 'Home Appreciation',
  spReturn: 'S&P Return',
  mortgageRate: 'Mortgage Rate',
  rentGrowthRate: 'Rent Growth',
  homePrice: 'Home Price',
};

function getCellColor(breakEvenYear: number | null): string {
  if (breakEvenYear === null) return COLORS.heatmapNever;
  if (breakEvenYear <= 5) return HEATMAP_SCALE[0]; // green
  if (breakEvenYear <= 8) return HEATMAP_SCALE[1];
  if (breakEvenYear <= 12) return HEATMAP_SCALE[2];
  if (breakEvenYear <= 15) return HEATMAP_SCALE[3]; // yellow/amber
  if (breakEvenYear <= 20) return HEATMAP_SCALE[4];
  if (breakEvenYear <= 25) return HEATMAP_SCALE[5]; // red
  return HEATMAP_SCALE[6]; // gray (never-ish)
}

function getCellTextColor(breakEvenYear: number | null): string {
  if (breakEvenYear === null) return COLORS.textPrimary;
  if (breakEvenYear <= 12) return '#000000';
  return COLORS.textPrimary;
}

function formatValue(variable: string, value: number): string {
  if (variable === 'homePrice') {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return formatPercentFromWhole(value);
}

function isCurrentCell(
  rowValue: number,
  colValue: number,
  currentRowVal: number,
  currentColVal: number,
): boolean {
  // Find the closest matching cell
  return (
    Math.abs(rowValue - currentRowVal) < 0.001 &&
    Math.abs(colValue - currentColVal) < 0.001
  );
}

export default function HeatmapChart({ result, currentRowVal, currentColVal }: HeatmapChartProps) {
  const { rowVar, colVar, rowValues, colValues, cells } = result;

  const legend = useMemo(
    () => [
      { label: '1-5y', color: HEATMAP_SCALE[0] },
      { label: '6-8y', color: HEATMAP_SCALE[1] },
      { label: '9-12y', color: HEATMAP_SCALE[2] },
      { label: '13-15y', color: HEATMAP_SCALE[3] },
      { label: '16-20y', color: HEATMAP_SCALE[4] },
      { label: '21-25y', color: HEATMAP_SCALE[5] },
      { label: 'Never', color: HEATMAP_SCALE[6] },
    ],
    [],
  );

  if (!cells || cells.length === 0) {
    return (
      <div
        className="flex h-80 items-center justify-center rounded-lg"
        style={{ backgroundColor: COLORS.bgCard }}
      >
        <p style={{ color: COLORS.textMuted }}>No sensitivity data available</p>
      </div>
    );
  }

  const rowLabel = VARIABLE_LABELS[rowVar] ?? rowVar;
  const colLabel = VARIABLE_LABELS[colVar] ?? colVar;

  return (
    <div className="w-full overflow-x-auto">
      {/* Legend */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs" style={{ color: COLORS.textSecondary }}>
          Break-even year:
        </span>
        {legend.map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs" style={{ color: COLORS.textSecondary }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="inline-block min-w-full">
        {/* Column header label */}
        <div className="mb-1 text-center text-xs font-medium" style={{ color: COLORS.textSecondary }}>
          {colLabel}
        </div>

        <div className="flex">
          {/* Row header label (rotated) */}
          <div className="flex w-8 items-center justify-center">
            <span
              className="origin-center -rotate-90 whitespace-nowrap text-xs font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              {rowLabel}
            </span>
          </div>

          <div className="flex-1">
            {/* Column headers */}
            <div className="flex">
              <div className="w-16 shrink-0" /> {/* Spacer for row labels */}
              {colValues.map((colVal, ci) => (
                <div
                  key={ci}
                  className="flex-1 text-center text-xs"
                  style={{
                    color: COLORS.textSecondary,
                    minWidth: 52,
                    padding: '2px 0',
                  }}
                >
                  {formatValue(colVar, colVal)}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {rowValues.map((rowVal, ri) => (
              <div key={ri} className="flex">
                {/* Row label */}
                <div
                  className="flex w-16 shrink-0 items-center justify-end pr-2 text-xs"
                  style={{ color: COLORS.textSecondary }}
                >
                  {formatValue(rowVar, rowVal)}
                </div>

                {/* Cells */}
                {colValues.map((colVal, ci) => {
                  const cell = cells[ri]?.[ci];
                  if (!cell) return null;

                  const isCurrent = isCurrentCell(rowVal, colVal, currentRowVal, currentColVal);
                  const bgColor = getCellColor(cell.breakEvenYear);
                  const textColor = getCellTextColor(cell.breakEvenYear);

                  return (
                    <div
                      key={ci}
                      className="flex flex-1 items-center justify-center text-xs font-medium transition-all"
                      style={{
                        backgroundColor: bgColor,
                        color: textColor,
                        minWidth: 52,
                        minHeight: 36,
                        border: isCurrent
                          ? `2px solid ${COLORS.textPrimary}`
                          : '1px solid rgba(0, 0, 0, 0.2)',
                        borderRadius: 2,
                        boxShadow: isCurrent
                          ? `0 0 8px rgba(243, 244, 246, 0.4)`
                          : 'none',
                      }}
                      title={`${rowLabel}: ${formatValue(rowVar, rowVal)}, ${colLabel}: ${formatValue(colVar, colVal)} → Break-even: ${cell.breakEvenYear !== null ? `Year ${cell.breakEvenYear}` : 'Never'}`}
                    >
                      {cell.breakEvenYear !== null ? cell.breakEvenYear : 'N'}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
