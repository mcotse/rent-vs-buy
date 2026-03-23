'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { motion } from 'framer-motion';
import { useCalculatorStore } from '@/store/calculator-store';
import { FIXED_CONSTANTS } from '@/engine/defaults';
import { runSimulation } from '@/engine/simulation';
import type { SensitivityVariable, CalculatorParams, SensitivityCell } from '@/engine/types';
import { COLORS, HEATMAP_SCALE } from '@/lib/colors';
import { formatPercentFromWhole, formatCurrencyShort } from '@/lib/format';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const cardStyle = {
  backgroundColor: 'rgba(26, 34, 54, 0.8)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  borderColor: COLORS.borderSubtle,
};

const VARIABLE_OPTIONS: { value: SensitivityVariable; label: string }[] = [
  { value: 'homeAppreciation', label: 'Home Appreciation' },
  { value: 'spReturn', label: 'S&P Return' },
  { value: 'mortgageRate', label: 'Mortgage Rate' },
  { value: 'rentGrowthRate', label: 'Rent Growth' },
  { value: 'homePrice', label: 'Home Price' },
];

function getVariableRange(v: SensitivityVariable): number[] {
  switch (v) {
    case 'homeAppreciation':
      return [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08];
    case 'spReturn':
      return [0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.10, 0.11, 0.12];
    case 'mortgageRate':
      return [0.05, 0.055, 0.06, 0.065, 0.07, 0.075, 0.08];
    case 'rentGrowthRate':
      return [0, 0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08];
    case 'homePrice':
      return [1_500_000, 1_600_000, 1_700_000, 1_800_000, 1_900_000, 2_000_000, 2_100_000, 2_200_000, 2_300_000];
    default:
      return [];
  }
}

function formatVarValue(v: SensitivityVariable, val: number): string {
  if (v === 'homePrice') return formatCurrencyShort(val);
  return formatPercentFromWhole(val * 100, 1);
}

function getCellColor(breakEvenYear: number | null): string {
  if (breakEvenYear === null) return COLORS.heatmapNever;
  if (breakEvenYear <= 5) return HEATMAP_SCALE[0]; // green
  if (breakEvenYear <= 8) return HEATMAP_SCALE[1];
  if (breakEvenYear <= 12) return HEATMAP_SCALE[2];
  if (breakEvenYear <= 16) return HEATMAP_SCALE[3]; // yellow/amber
  if (breakEvenYear <= 20) return HEATMAP_SCALE[4];
  if (breakEvenYear <= 25) return HEATMAP_SCALE[5]; // red
  return HEATMAP_SCALE[6]; // gray
}

function isCurrentPosition(
  rowVar: SensitivityVariable,
  colVar: SensitivityVariable,
  rowVal: number,
  colVal: number,
  params: CalculatorParams,
  rowValues: number[],
  colValues: number[]
): boolean {
  const rowParam = params[rowVar] as number;
  const colParam = params[colVar] as number;

  // Find closest value in the range
  const closestRow = rowValues.reduce((prev, curr) =>
    Math.abs(curr - rowParam) < Math.abs(prev - rowParam) ? curr : prev
  );
  const closestCol = colValues.reduce((prev, curr) =>
    Math.abs(curr - colParam) < Math.abs(prev - colParam) ? curr : prev
  );

  return rowVal === closestRow && colVal === closestCol;
}

export default function SensitivityTab() {
  const { params, sensitivityRowVar, sensitivityColVar, setSensitivityVars } =
    useCalculatorStore();

  const [hoveredCell, setHoveredCell] = useState<SensitivityCell | null>(null);
  const [isPending, startTransition] = useTransition();

  const rowValues = useMemo(() => getVariableRange(sensitivityRowVar), [sensitivityRowVar]);
  const colValues = useMemo(() => getVariableRange(sensitivityColVar), [sensitivityColVar]);

  // Compute the full grid
  const grid = useMemo(() => {
    const result: SensitivityCell[][] = [];

    for (const rowVal of rowValues) {
      const row: SensitivityCell[] = [];
      for (const colVal of colValues) {
        const modifiedParams = {
          ...params,
          [sensitivityRowVar]: rowVal,
          [sensitivityColVar]: colVal,
        };

        try {
          const sim = runSimulation(modifiedParams, FIXED_CONSTANTS);
          row.push({
            rowValue: rowVal,
            colValue: colVal,
            breakEvenYear: sim.breakEvenYear,
            advantage10yr:
              sim.yearly[9]
                ? sim.yearly[9].buyerWealthAfterTax - sim.yearly[9].renterWealth
                : 0,
          });
        } catch {
          row.push({
            rowValue: rowVal,
            colValue: colVal,
            breakEvenYear: null,
            advantage10yr: 0,
          });
        }
      }
      result.push(row);
    }

    return result;
  }, [params, sensitivityRowVar, sensitivityColVar, rowValues, colValues]);

  const handleRowVarChange = useCallback(
    (v: string | null) => {
      if (!v) return;
      const newRow = v as SensitivityVariable;
      if (newRow === sensitivityColVar) return; // Prevent same variable
      startTransition(() => {
        setSensitivityVars(newRow, sensitivityColVar);
      });
    },
    [sensitivityColVar, setSensitivityVars, startTransition]
  );

  const handleColVarChange = useCallback(
    (v: string | null) => {
      if (!v) return;
      const newCol = v as SensitivityVariable;
      if (newCol === sensitivityRowVar) return;
      startTransition(() => {
        setSensitivityVars(sensitivityRowVar, newCol);
      });
    },
    [sensitivityRowVar, setSensitivityVars, startTransition]
  );

  const rowLabel = VARIABLE_OPTIONS.find((o) => o.value === sensitivityRowVar)?.label ?? '';
  const colLabel = VARIABLE_OPTIONS.find((o) => o.value === sensitivityColVar)?.label ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Variable selectors */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-4" style={cardStyle}>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
            Row Variable
          </label>
          <Select value={sensitivityRowVar} onValueChange={handleRowVarChange}>
            <SelectTrigger className="w-full border-white/[0.08] bg-[#0a0f1e] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#1a2236]">
              {VARIABLE_OPTIONS.filter((o) => o.value !== sensitivityColVar).map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-xl border p-4" style={cardStyle}>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
            Column Variable
          </label>
          <Select value={sensitivityColVar} onValueChange={handleColVarChange}>
            <SelectTrigger className="w-full border-white/[0.08] bg-[#0a0f1e] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-white/[0.08] bg-[#1a2236]">
              {VARIABLE_OPTIONS.filter((o) => o.value !== sensitivityRowVar).map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-white/10">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative rounded-xl border p-5" style={cardStyle}>
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[#0a0f1e]/70 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div
                className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent"
                style={{ borderColor: COLORS.buyer, borderTopColor: 'transparent' }}
              />
              <span className="text-sm font-medium" style={{ color: COLORS.textSecondary }}>
                Computing...
              </span>
            </div>
          </div>
        )}
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider" style={{ color: COLORS.textSecondary }}>
          Break-Even Year: {rowLabel} vs {colLabel}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th
                  className="p-2 text-right text-[10px] font-medium"
                  style={{ color: COLORS.textMuted }}
                >
                  {rowLabel} \ {colLabel}
                </th>
                {colValues.map((cv) => (
                  <th
                    key={cv}
                    className="p-2 text-center text-[10px] font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {formatVarValue(sensitivityColVar, cv)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, ri) => (
                <tr key={ri}>
                  <td
                    className="p-2 text-right text-[10px] font-medium"
                    style={{ color: COLORS.textSecondary }}
                  >
                    {formatVarValue(sensitivityRowVar, rowValues[ri])}
                  </td>
                  {row.map((cell, ci) => {
                    const isCurrent = isCurrentPosition(
                      sensitivityRowVar,
                      sensitivityColVar,
                      cell.rowValue,
                      cell.colValue,
                      params,
                      rowValues,
                      colValues
                    );
                    return (
                      <td
                        key={ci}
                        className="relative cursor-pointer p-2 text-center text-xs font-medium transition-all"
                        style={{
                          backgroundColor: getCellColor(cell.breakEvenYear),
                          color: '#fff',
                          opacity: hoveredCell === cell ? 1 : 0.85,
                          outline: isCurrent ? `2px solid ${COLORS.textPrimary}` : 'none',
                          outlineOffset: -1,
                        }}
                        onMouseEnter={() => setHoveredCell(cell)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {cell.breakEvenYear !== null ? `Yr ${cell.breakEvenYear}` : 'Never'}
                        {isCurrent && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-white" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hovered cell detail */}
        {hoveredCell && (
          <div className="mt-4 rounded-lg border p-3" style={{ borderColor: COLORS.borderSubtle, backgroundColor: COLORS.bgDeep }}>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <span style={{ color: COLORS.textSecondary }}>{rowLabel}:</span>
              <span style={{ color: COLORS.textPrimary }}>{formatVarValue(sensitivityRowVar, hoveredCell.rowValue)}</span>
              <span style={{ color: COLORS.textSecondary }}>{colLabel}:</span>
              <span style={{ color: COLORS.textPrimary }}>{formatVarValue(sensitivityColVar, hoveredCell.colValue)}</span>
              <span style={{ color: COLORS.textSecondary }}>Break-Even:</span>
              <span style={{ color: hoveredCell.breakEvenYear !== null ? COLORS.gain : COLORS.loss }}>
                {hoveredCell.breakEvenYear !== null ? `Year ${hoveredCell.breakEvenYear}` : 'Never'}
              </span>
              <span style={{ color: COLORS.textSecondary }}>10yr Advantage:</span>
              <span style={{ color: hoveredCell.advantage10yr >= 0 ? COLORS.gain : COLORS.loss }}>
                {hoveredCell.advantage10yr >= 0 ? '+' : ''}
                {formatCurrencyShort(hoveredCell.advantage10yr)}
              </span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-[10px]" style={{ color: COLORS.textMuted }}>Early</span>
          <div className="flex flex-1 gap-0.5">
            {HEATMAP_SCALE.map((color, i) => (
              <div
                key={i}
                className="h-3 flex-1 first:rounded-l last:rounded-r"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="text-[10px]" style={{ color: COLORS.textMuted }}>Never</span>
        </div>
      </div>
    </motion.div>
  );
}
