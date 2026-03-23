import { useCalculatorStore } from '@/store/calculator-store';
import { PARAM_RANGES, FIXED_CONSTANTS } from '@/engine/defaults';
import { ParameterGroup } from '@/components/inputs/ParameterGroup';
import { SliderInput } from '@/components/inputs/SliderInput';
import { PercentInput } from '@/components/inputs/PercentInput';
import { RefinanceInput } from '@/components/inputs/RefinanceInput';
import { RealNominalToggle } from '@/components/shared/RealNominalToggle';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RotateCcw, ChevronRight, Info } from 'lucide-react';
import { formatPercent, formatCurrency } from '@/lib/format';
import { useState } from 'react';
import type { CalculatorParams, FilingStatus } from '@/engine/types';

/** Renders the appropriate input based on param format */
function ParamInput({
  paramKey,
}: {
  paramKey: string;
}) {
  const params = useCalculatorStore((s) => s.params);
  const setParam = useCalculatorStore((s) => s.setParam);
  const range = PARAM_RANGES[paramKey];
  if (!range) return null;

  const value = params[paramKey as keyof CalculatorParams] as number;

  switch (range.format) {
    case 'percent':
      return (
        <PercentInput
          label={range.label}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          onChange={(v) => setParam(paramKey as keyof CalculatorParams, v as never)}
        />
      );
    case 'currency':
      if (range.max - range.min > 100_000) {
        // Large range currencies get a slider
        return (
          <SliderInput
            label={range.label}
            value={value}
            min={range.min}
            max={range.max}
            step={range.step}
            format="currency"
            onChange={(v) => setParam(paramKey as keyof CalculatorParams, v as never)}
          />
        );
      }
      return (
        <SliderInput
          label={range.label}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          format="currency"
          onChange={(v) => setParam(paramKey as keyof CalculatorParams, v as never)}
        />
      );
    case 'year':
    case 'number':
      return (
        <SliderInput
          label={range.label}
          value={value}
          min={range.min}
          max={range.max}
          step={range.step}
          format={range.format}
          onChange={(v) => setParam(paramKey as keyof CalculatorParams, v as never)}
        />
      );
    default:
      return null;
  }
}

function FilingStatusSelect() {
  const filingStatus = useCalculatorStore((s) => s.params.filingStatus);
  const setParam = useCalculatorStore((s) => s.setParam);

  return (
    <div className="space-y-1">
      <span className="text-xs text-gray-400">Filing Status</span>
      <Select
        value={filingStatus}
        onValueChange={(v) => setParam('filingStatus', v as FilingStatus)}
      >
        <SelectTrigger className="h-7 w-full border-white/[0.08] bg-white/[0.04] text-xs text-gray-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#1a2236] text-gray-100">
          <SelectItem value="mfj">Married Filing Jointly</SelectItem>
          <SelectItem value="single">Single</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

function FixedConstantsInfo() {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border-t border-white/[0.06]">
        <CollapsibleTrigger className="flex w-full items-center gap-1.5 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.03]">
          <Info className="h-3 w-3 text-gray-500" />
          <span className="text-[10px] text-gray-500">Fixed Constants</span>
          <ChevronRight
            className={`ml-auto h-3 w-3 text-gray-600 transition-transform duration-200 ${
              open ? 'rotate-90' : ''
            }`}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="space-y-1.5 px-4 pb-3 text-[10px] text-gray-500">
            <div className="flex justify-between">
              <span>Property Tax</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.propertyTaxRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Home Insurance</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.homeInsuranceRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Closing Costs</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.closingCostRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Selling Costs</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.sellingCostRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Loan Term</span>
              <span className="tabular-nums">{FIXED_CONSTANTS.loanTermYears} years</span>
            </div>
            <div className="flex justify-between">
              <span>PMI Rate</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.pmiRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>MID Cap</span>
              <span className="tabular-nums">{formatCurrency(FIXED_CONSTANTS.midCap)}</span>
            </div>
            <div className="flex justify-between">
              <span>SALT Cap</span>
              <span className="tabular-nums">{formatCurrency(FIXED_CONSTANTS.saltCap)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cap Gains Exclusion (MFJ)</span>
              <span className="tabular-nums">{formatCurrency(FIXED_CONSTANTS.capGainsExclusionMFJ)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cap Gains Rate</span>
              <span className="tabular-nums">{formatPercent(FIXED_CONSTANTS.longTermCapGainsRate)}</span>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function Sidebar() {
  const resetParams = useCalculatorStore((s) => s.resetParams);

  return (
    <aside className="flex h-full flex-col bg-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-5">
        <h1
          className="text-xl font-semibold tracking-tight text-gray-100"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Rent vs. Buy
        </h1>
        <button
          onClick={resetParams}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-300"
          title="Reset all parameters"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </button>
      </div>

      {/* Real/Nominal toggle */}
      <div className="px-4 pb-3">
        <RealNominalToggle />
      </div>

      {/* Scrollable parameter groups */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <ParameterGroup title="Property" defaultOpen={true}>
          <ParamInput paramKey="homePrice" />
          <ParamInput paramKey="downPaymentPct" />
          <ParamInput paramKey="mortgageRate" />
        </ParameterGroup>

        <ParameterGroup title="Monthly Costs" defaultOpen={true}>
          <ParamInput paramKey="hoaMonthly" />
          <ParamInput paramKey="hoaGrowthRate" />
          <ParamInput paramKey="melloRoosAnnual" />
        </ParameterGroup>

        <ParameterGroup title="Renting" defaultOpen={true}>
          <ParamInput paramKey="monthlyRent" />
          <ParamInput paramKey="rentGrowthRate" />
          <ParamInput paramKey="rentCeiling" />
          <ParamInput paramKey="rentFloor" />
        </ParameterGroup>

        <ParameterGroup title="Growth & Returns" defaultOpen={true}>
          <ParamInput paramKey="homeAppreciation" />
          <ParamInput paramKey="spReturn" />
          <ParamInput paramKey="inflationRate" />
        </ParameterGroup>

        <ParameterGroup title="Ownership Costs" defaultOpen={false}>
          <ParamInput paramKey="maintenanceRate" />
          <ParamInput paramKey="annualImprovementBudget" />
          <ParamInput paramKey="improvementRecoupRate" />
        </ParameterGroup>

        <ParameterGroup title="Intangibles" defaultOpen={false}>
          <ParamInput paramKey="ownershipFreedomPremium" />
          <ParamInput paramKey="renterFlexibilityPremium" />
        </ParameterGroup>

        <ParameterGroup title="Tax & Income" defaultOpen={false}>
          <ParamInput paramKey="grossIncome" />
          <FilingStatusSelect />
        </ParameterGroup>

        <ParameterGroup title="Refinance" defaultOpen={false}>
          <RefinanceInput />
        </ParameterGroup>

        <ParameterGroup title="Early Exit" defaultOpen={false}>
          <ParamInput paramKey="forcedExitYear" />
        </ParameterGroup>

        <FixedConstantsInfo />
      </div>
    </aside>
  );
}
